import {
  type Stream,
  TelnetCommand,
  TelnetOption,
  TelnetParser,
  WebSocketStream,
} from "./telnet";

import stripAnsi from "strip-ansi";
import { EditorManager } from "./EditorManager";
import { ConnectionLatency } from "./ConnectionLatency";
import type { GMCPCore } from "./gmcp/Core";
import { type GMCPClientFileTransfer, GmcpSession } from "./gmcp";
import {
  type MCPPackage,
  type McpSimpleEdit,
  McpSession,
} from "./mcp";

import { MediaService } from "./audio/MediaService";
import { AutoreadMode, usePreferences } from "./stores/preferencesStore";
import { useChannelsStore } from "./stores/channelsStore";
import { channelHasOwnReading, channelPreferencesFor, shouldSpeak } from "./channelReading";
import type { FileTransfers, TransferSnapshot } from "./fileTransfer/types";
import { useInputStore } from "./stores/inputStore";
import { useConnectionStore } from "./stores/connectionStore";
import { useOutputStore } from "./stores/outputStore";
import { usePersonalDataStore } from './stores/personalDataStore';
import { canUseGameConnection } from './browserPolicy';
import { reconnectDelay } from "./reconnectBackoff";
import { closeAwayStream, readAwayStream, sameRecipient, takeAwayLines } from './awayV2';
import { browserNotificationTag, sendBrowserAwayCommand } from './browserAway';
import type { BrowserNotificationContext } from './browserNotifications';
import { noteMissedActivity } from './launch/appBadge';
import { clientSpeechSuspended } from './clientSpeechSuspension';

// How long an open socket may stay silent after a resume ping before it is
// treated as dead.
const LIVENESS_TIMEOUT_MS = 4000;

class MudClient {
  private ws!: WebSocket;
  private decoder = new TextDecoder("utf8");
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private reconnectAttempt: number = 0;
  private livenessTimer?: ReturnType<typeof setTimeout>;
  private latency?: ConnectionLatency;
  private resumeListenersRegistered: boolean = false;
  private telnet!: TelnetParser;
  private _connected: boolean = false;
  private intentionalDisconnect: boolean = false;
  private localMode: boolean = false;
  private localStream?: Stream;
  // True once connected over the websocket: the away channel (lines over Web
  // Push, commands over HTTP) only exists for the real server.
  private awayChannel: boolean = false;
  private awayListenersRegistered: boolean = false;
  private awayWork: Promise<void> = Promise.resolve();
  private browserContext?: BrowserNotificationContext;

  get connected(): boolean {
    return this._connected;
  }

  get liveServer(): boolean { return this.awayChannel && !this.localMode && !this.shutdownComplete; }
  private readonly localRuntime = `local:${crypto.randomUUID()}`;
  get runtimeNamespace(): string {
    return this.liveServer ? `live:${this.host}:${this.port}` : this.localRuntime;
  }

  private host: string;
  private port: number;
  private telnetBuffer: string = "";
  public readonly gmcp: GmcpSession;
  public readonly mcpSession: McpSession;
  private gmcp_fileTransfer!: GMCPClientFileTransfer;
  public media: MediaService;
  public editors?: EditorManager;
  private fileTransfers?: FileTransfers;
  private fileTransfersLoading?: Promise<FileTransfers>;
  private fileTransferGeneration = 0;
  // Kept here, not on the engine: they outlive each engine a disconnect disposes.
  private readonly fileTransferOfferWatchers = new Set<(transfer: TransferSnapshot) => void>();
  private _autosay: boolean = false;
  private connectionCleanupComplete: boolean = true;
  private shutdownComplete: boolean = false;
  private disconnectResetCallbacks: Array<() => void> = [];
  private identityResetCallbacks: Array<() => void> = [];
  private transportGeneration = 0;
  private latencyRecoveryAttempted = false;
  private cleanupCallbacks: Array<() => void> = [];

  get autosay(): boolean {
    return this._autosay;
  }

  set autosay(value: boolean) {
    this._autosay = value;
    useInputStore.getState().setAutosay(value);
  }

  constructor(host: string, port: number) {
    this.host = host;
    this.port = port;
    this.mcpSession = new McpSession({
      sendLine: (line) => this.send(`${line}\r\n`),
    });
    this.gmcp = new GmcpSession(this);
    this.media = new MediaService();
    this.registerCleanup(usePersonalDataStore.subscribe((state, previous) => {
      if (state.visitor !== previous.visitor) this.resetIdentityState();
      if (state.visitor || !state.owner || state.owner.playerUuid !== this.browserContext?.recipient.playerUuid) {
        this.setBrowserNotificationContext(undefined);
      }
    }));
    useInputStore.getState().setAutosay(this._autosay);
  }

  configureLatency(core: GMCPCore): void {
    const latency = new ConnectionLatency(
      (average) => core.sendPing(average),
      (snapshot) => useConnectionStore.getState().setLatency(snapshot),
      () => performance.now(),
      () => {
        // A remembered owner can recover transparently. Never loop reconnects
        // when a server does not answer pings, or discard a manual guest login.
        if (this.latencyRecoveryAttempted || this.shutdownComplete || this.intentionalDisconnect ||
            this.localMode || !this.gmcp.require('Auth.Autologin').currentGrant) return;
        this.latencyRecoveryAttempted = true;
        this.ws.close();
        this.reconnectNow();
      },
    );
    this.latency = latency;
    const unsubscribe = core.on('ping', () => { latency.receive(); this.latencyRecoveryAttempted = false; });
    this.registerDisconnectReset(() => latency.stop());
    this.registerCleanup(() => {
      latency.stop();
      unsubscribe();
    });
  }

  configureFileTransfer(fileTransfer: GMCPClientFileTransfer): void {
    this.gmcp_fileTransfer = fileTransfer;
    const resetFileTransfer = () => {
      this.fileTransferGeneration++;
      this.fileTransfers?.dispose();
      this.fileTransfers = undefined;
      this.fileTransfersLoading = undefined;
    };
    this.registerDisconnectReset(resetFileTransfer);
    this.registerIdentityReset(resetFileTransfer);
    this.registerCleanup(resetFileTransfer);
  }

  getFileTransfers(): Promise<FileTransfers> {
    if (this.shutdownComplete) return Promise.reject(new Error('Client has shut down'));
    if (this.fileTransfers) return Promise.resolve(this.fileTransfers);
    if (this.fileTransfersLoading) return this.fileTransfersLoading;
    const generation = this.fileTransferGeneration;
    const loading = import('./fileTransfer/createFileTransfers')
      .then(({ createFileTransfers }) => {
        if (this.shutdownComplete || generation !== this.fileTransferGeneration) {
          throw new Error('File transfer initialization cancelled');
        }
        const transfers = createFileTransfers(this.gmcp_fileTransfer);
        for (const watcher of this.fileTransferOfferWatchers) transfers.on('change', watcher);
        this.fileTransfers = transfers;
        return transfers;
      }).catch((error) => {
        if (this.fileTransfersLoading === loading) this.fileTransfersLoading = undefined;
        throw error;
      });
    this.fileTransfersLoading = loading;
    return loading;
  }

  /**
   * Calls `listener` once for each offer from a peer that the user is asked to decide
   * on, and not for the offers this client makes. An offer that resumes a transfer this
   * client still has does not ask, so it does not call; one that resumes a transfer this
   * client no longer knows does, because the user is asked again: after a page reload,
   * after this client gave up waiting for the sender, or once the transfer has left the
   * history. Returns the function that removes the listener again.
   */
  onFileTransferOffer(listener: (offer: TransferSnapshot) => void): () => void {
    // An incoming transfer is published as 'offered' when it appears and never again.
    const watcher = (transfer: TransferSnapshot) => {
      if (transfer.direction === 'receive' && transfer.state === 'offered') listener(transfer);
    };
    this.fileTransferOfferWatchers.add(watcher);
    this.fileTransfers?.on('change', watcher);
    return () => {
      this.fileTransferOfferWatchers.delete(watcher);
      this.fileTransfers?.off('change', watcher);
    };
  }

  registerMcpPackage(p: new () => MCPPackage): MCPPackage {
    const mcpPackage = this.mcpSession.registerPackage(p);
    this.registerDisconnectReset(() => mcpPackage.reset());
    return mcpPackage;
  }

  configureEditors(simpleEdit: McpSimpleEdit): void {
    this.editors = new EditorManager(simpleEdit);
    this.registerDisconnectReset(() => this.editors?.reset());
    this.registerIdentityReset(() => this.editors?.reset());
    simpleEdit.on("openSession", (session) => {
      this.editors?.openEditorWindow(session);
    });
  }

  public connect() {
    usePersonalDataStore.getState().clearForConnect();
    const generation = ++this.transportGeneration;
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = undefined;
    this.intentionalDisconnect = false;
    this.connectionCleanupComplete = false;
    this.gmcp.reset();
    this.registerResumeListeners();
    this.awayChannel = true;
    this.registerAwayListeners();
    const ws = new window.WebSocket(`wss://${this.host}:${this.port}`);
    this.ws = ws;
    this.ws.binaryType = "arraybuffer";
    this.telnet = new TelnetParser(new WebSocketStream(this.ws));
    const current = () => generation === this.transportGeneration && !this.shutdownComplete;
    this.gmcp.attachTransport(this.telnet);
    // Any inbound bytes prove the socket is alive, whatever they parse to.
    const deliverMessage = ws.onmessage;
    ws.onmessage = (event: MessageEvent) => {
      if (!current()) return;
      this.clearLivenessProbe();
      deliverMessage?.call(ws, event);
    };
    this.ws.onopen = () => {
      if (!current()) return;
      this._connected = true;
      this.reconnectAttempt = 0;

      // Reset MIDI intentional disconnect flags when successfully reconnecting to server
      this.gmcp.handlers["Client.Midi"]?.resetIntentionalDisconnects();

      useConnectionStore.getState().setConnected(true);
    };

    this.telnet.on("data", (data: Uint8Array) => {
      if (!current()) return;
      this.handleData(data);
    });

    this.telnet.on("command", (command) => {
      if (!current()) return;
      if (
        (command === TelnetCommand.GA || command === TelnetCommand.EOR) &&
        this.telnetBuffer
      ) {
        this.handleTextLine(this.telnetBuffer.replace(/\r$/, ""));
        this.telnetBuffer = "";
      }
    });

    this.telnet.on("negotiation", (command, option) => {
      if (!current()) return;
      // Negotiation that we support GMCP
      if (command === TelnetCommand.WILL && option === TelnetOption.GMCP) {
        console.log("GMCP Negotiation");
        this.telnet.sendNegotiation(TelnetCommand.DO, TelnetOption.GMCP);
        if (this.gmcp.start()) this.latency?.start();
      } else if (command === TelnetCommand.WONT && option === TelnetOption.GMCP) {
        this.latency?.stop();
        this.gmcp.reset();
        this.gmcp.attachTransport(this.telnet);
      } else if (
        command === TelnetCommand.DO &&
        option === TelnetOption.TERMINAL_TYPE
      ) {
        console.log("TTYPE Negotiation");
        this.telnet.sendNegotiation(
          TelnetCommand.WILL,
          TelnetOption.TERMINAL_TYPE,
        );
        this.telnet.sendTerminalType("Mongoose Client");
        this.telnet.sendTerminalType("ANSI");
        this.telnet.sendTerminalType("PROXY");
      }
    });

    this.telnet.on("gmcp", (packageName, data) => {
      if (!current()) return;
      this.gmcp.receive(packageName, data);
    });

    this.ws.onclose = () => {
      // A socket we already replaced (e.g. a dead one whose close arrives
      // late) must not tear down the connection that superseded it.
      if (!current() || ws !== this.ws) return;
      this.cleanupConnection();
      // Only auto reconnect if it wasn't an intentional disconnect
      if (!this.intentionalDisconnect) {
        this.reconnectTimer = setTimeout(() => {
          this.connect();
        }, reconnectDelay(this.reconnectAttempt++));
      }
    };

    this.ws.onerror = (error: Event) => {
      if (!current()) return;
      useOutputStore.getState().addError(connectionErrorFromEvent(error));
    };
  }

  /**
   * Mobile browsers kill or freeze the socket while the page is hidden, and
   * throttle the reconnect timer along with it. When the page comes back,
   * reconnect straight away or check that the socket we still hold is alive.
   */
  private registerResumeListeners(): void {
    if (this.resumeListenersRegistered) return;
    this.resumeListenersRegistered = true;
    const onResume = () => this.handleResume();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") this.handleResume();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pageshow", onResume);
    window.addEventListener("online", onResume);
    this.registerCleanup(() => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pageshow", onResume);
      window.removeEventListener("online", onResume);
    });
  }

  private handleResume(): void {
    this.showAwayLines();
    if (this.shutdownComplete || this.intentionalDisconnect || this.localMode) {
      return;
    }
    if (this.ws.readyState === WebSocket.CONNECTING) return;
    if (this.ws.readyState === WebSocket.OPEN) {
      this.probeLiveness();
      return;
    }
    this.reconnectNow();
  }

  /**
   * Ping the server over an open socket; if nothing at all comes back in
   * time the socket is a zombie, so drop it and reconnect.
   */
  private probeLiveness(): void {
    if (this.livenessTimer !== undefined || !this.gmcp.ready) return;
    this.livenessTimer = setTimeout(() => {
      this.livenessTimer = undefined;
      this.ws.close();
      this.reconnectNow();
    }, LIVENESS_TIMEOUT_MS);
    if (this.latency) this.latency.probe();
    else this.gmcp.require("Core").sendPing(undefined);
  }

  private clearLivenessProbe(): void {
    clearTimeout(this.livenessTimer);
    this.livenessTimer = undefined;
  }

  private reconnectNow(): void {
    this.cleanupConnection();
    this.connect();
  }

  /**
   * Connect using a local Stream (e.g. WorkerStream for WASM mode).
   * Sets up the telnet parser with the provided stream instead of
   * creating a WebSocket.
   */
  public connectLocal(stream: Stream) {
    usePersonalDataStore.getState().clearForConnect();
    const generation = ++this.transportGeneration;
    const current = () => generation === this.transportGeneration && !this.shutdownComplete;
    this.awayChannel = false;
    this.localMode = true;
    this.localStream = stream;
    this.intentionalDisconnect = false;
    this.connectionCleanupComplete = false;
    this.gmcp.reset();
    this.telnet = new TelnetParser(stream);
    this.gmcp.attachTransport(this.telnet);

    this.telnet.on("data", (data: Uint8Array) => {
      if (!current()) return;
      this.handleData(data);
    });

    this.telnet.on("command", (command) => {
      if (!current()) return;
      if (
        (command === TelnetCommand.GA || command === TelnetCommand.EOR) &&
        this.telnetBuffer
      ) {
        this.handleTextLine(this.telnetBuffer.replace(/\r$/, ""));
        this.telnetBuffer = "";
      }
    });

    // The WASM server does not send telnet negotiation (no IAC sequences),
    // so these handlers are unlikely to fire — but wire them up anyway
    // for correctness.
    this.telnet.on("negotiation", (command, option) => {
      if (!current()) return;
      if (command === TelnetCommand.WILL && option === TelnetOption.GMCP) {
        console.log("GMCP Negotiation (local)");
        this.telnet.sendNegotiation(TelnetCommand.DO, TelnetOption.GMCP);
        this.gmcp.start();
      } else if (
        command === TelnetCommand.DO &&
        option === TelnetOption.TERMINAL_TYPE
      ) {
        console.log("TTYPE Negotiation (local)");
        this.telnet.sendNegotiation(
          TelnetCommand.WILL,
          TelnetOption.TERMINAL_TYPE,
        );
        this.telnet.sendTerminalType("Mongoose Client");
        this.telnet.sendTerminalType("ANSI");
        this.telnet.sendTerminalType("PROXY");
      }
    });

    this.telnet.on("gmcp", (packageName, data) => {
      if (!current()) return;
      this.gmcp.receive(packageName, data);
    });

    stream.on("close", () => {
      if (!current()) return;
      this.cleanupConnection();
    });

    // Mark as connected immediately — the worker will send the "connected"
    // message once the virtual connection is created.
    this._connected = true;
    this.gmcp.handlers["Client.Midi"]?.resetIntentionalDisconnects();
    useConnectionStore.getState().setConnected(true);
    this.gmcp.markReady();
  }

  public send(data: string) {
    if (this._connected && this.localMode && this.localStream) {
      // In local mode, write through the stream (WorkerStream -> Worker)
      this.localStream.write(new TextEncoder().encode(data));
      return;
    }
    if (
      this._connected &&
      this.ws &&
      this.ws.readyState === WebSocket.OPEN
    ) {
      this.ws.send(data);
      return;
    }
    throw new Error("Cannot send while disconnected");
  }

  registerCleanup(callback: () => void): void {
    this.cleanupCallbacks.push(callback);
  }

  registerDisconnectReset(callback: () => void): void {
    this.disconnectResetCallbacks.push(callback);
  }

  registerIdentityReset(callback: () => void): void {
    this.identityResetCallbacks.push(callback);
  }

  resetIdentityState(): void {
    for (const reset of this.identityResetCallbacks) reset();
    this.cancelSpeech();
    this.stopAllSounds();
  }

  private cleanupConnection(): void {
    if (this.connectionCleanupComplete) return;
    this.connectionCleanupComplete = true;
    this.transportGeneration++;
    this._connected = false;
    this.clearLivenessProbe();
    for (const callback of this.disconnectResetCallbacks) {
      try {
        callback();
      } catch (error) {
        console.error("Disconnect reset failed:", error);
      }
    }
    this.mcpSession.reset();
    this.decoder = new TextDecoder("utf8");
    this.telnetBuffer = "";
    this.gmcp.reset();
    this.localMode = false;
    this.localStream = undefined;
    useConnectionStore.getState().setConnected(false);
    this.setBrowserNotificationContext(this.shutdownComplete ? undefined : this.browserContext);
  }

  public close(): void {
    this.intentionalDisconnect = true;
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = undefined;
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.CONNECTING ||
        this.ws.readyState === WebSocket.OPEN)
    ) {
      this.ws.close();
    }
    const closableStream = this.localStream as
      | (Stream & { close?: () => void; disconnect?: () => void })
      | undefined;
    closableStream?.close?.();
    closableStream?.disconnect?.();
    this.cleanupConnection();
  }

  public sendCommand(command: string): void {
    if (!canUseGameConnection()) return;
    if (this.autosay && usePersonalDataStore.getState().owner && !command.startsWith("-") && !command.startsWith("'")) {
      command = `say ${command}`;
    }
    try {
      this.send(`${command}\r\n`);
    } catch (error) {
      const disconnected = error instanceof Error ? error : new Error(String(error));
      if (this.awayChannel && !this.shutdownComplete) {
        void this.sendCommandWhileAway(command, disconnected);
      } else {
        useOutputStore.getState().addError(disconnected);
      }
      return;
    }
    this.echoCommand(command);
  }

  private echoCommand(command: string): void {
    if (usePreferences.getState().general.localEcho) {
      useOutputStore.getState().addCommand(command);
    }
    console.log('Command sent');
  }

  /**
   * With the socket down, a stored away token lets the command go out over
   * HTTP; its output comes back as away lines. Without one, `disconnected` is
   * reported as it always was.
   */
  private async sendCommandWhileAway(command: string, disconnected: Error): Promise<void> {
    const context = this.browserContext;
    if (!context || usePersonalDataStore.getState().visitor) {
      useOutputStore.getState().addError(disconnected);
      return;
    }
    const generation = this.gmcp.generation;
    try {
      await sendBrowserAwayCommand(context.recipient, context.grant, command);
    } catch (error) {
      if (context !== this.browserContext || generation !== this.gmcp.generation || this.shutdownComplete) return;
      useOutputStore
        .getState()
        .addError(error instanceof Error ? error : new Error(String(error)));
      return;
    }
    if (context !== this.browserContext || generation !== this.gmcp.generation || this.shutdownComplete) return;
    this.echoCommand(command);
    this.showAwayLines();
  }

  setBrowserNotificationContext(context?: BrowserNotificationContext): void {
    const owner = usePersonalDataStore.getState();
    if (context && (!this.liveServer || owner.visitor || owner.owner?.playerUuid !== context.recipient.playerUuid ||
        owner.owner.playerRef !== context.recipient.playerRef || owner.owner.runtime !== this.runtimeNamespace)) return;
    this.browserContext = context;
    if ('serviceWorker' in navigator) navigator.serviceWorker.controller?.postMessage(context
      ? { type: 'browser-owner', recipient: context.recipient, sessionId: context.sessionId, connected: this.connected }
      : { type: 'browser-owner-clear' });
    if (context) {
      if (this.connected) this.endAwayPeriod();
      else this.showAwayLines();
    }
  }

  // Away work touches IndexedDB; running it one job at a time keeps the lines
  // in order and puts a reconnect's clean-up behind any show still pending.
  private queueAwayWork(job: () => Promise<void>): void {
    this.awayWork = this.awayWork.then(job).catch((error) => {
      console.error("Away channel failed:", error);
    });
  }

  private registerAwayListeners(): void {
    if (this.awayListenersRegistered) return;
    this.awayListenersRegistered = true;
    if ("serviceWorker" in navigator) {
      const onMessage = (event: MessageEvent) => {
        if (event.data?.type === 'browser-owner-query') {
          event.ports?.[0]?.postMessage({ recipient: usePersonalDataStore.getState().visitor ? undefined : this.browserContext?.recipient });
        } else if (event.data?.type === 'browser-away' && this.browserContext &&
            event.data.recipient && sameRecipient(event.data.recipient, this.browserContext.recipient)) {
          this.showAwayLines();
        }
      };
      navigator.serviceWorker.addEventListener("message", onMessage);
      this.registerCleanup(() => {
        navigator.serviceWorker.removeEventListener("message", onMessage);
      });
    }
    // sessionReady turns true when the server names the logged-in character.
    this.registerCleanup(
      useConnectionStore.subscribe((state, previous) => {
        if (state.sessionReady && !previous.sessionReady) this.endAwayPeriod();
      }),
    );
    this.showAwayLines();
  }

  /**
   * While the socket is down, puts the away lines not yet shown (the stored
   * ones plus `extra`, which came from away period `period`) into the output
   * as provisional lines.
   */
  private showAwayLines(): void {
    const context = this.browserContext;
    this.queueAwayWork(async () => {
      if (!context || context !== this.browserContext || this._connected || !this.awayChannel || this.shutdownComplete) return;
      // Lines taken are marked shown, so they are always emitted; the output
      // drops them itself if the player has logged in meanwhile.
      const result = await takeAwayLines(context.recipient, context.sessionId);
      if (context !== this.browserContext || this._connected || this.shutdownComplete) return;
      if (result.missingBefore) this.emitMessage(`${result.missingBefore} older away lines are no longer available.`, true);
      for (const line of result.lines) {
        this.emitMessage(line[1], true);
      }
    });
  }

  /**
   * The player is logged in again and the server replays what was missed, so
   * the output drops its provisional lines; the stored lines and the
   * notifications that announced them are obsolete too.
   */
  private endAwayPeriod(): void {
    const context = this.browserContext;
    this.queueAwayWork(async () => {
      if (!context || context !== this.browserContext || !this.awayChannel) return;
      const stream = await readAwayStream(context.recipient);
      if (!stream || context !== this.browserContext) return;
      await closeAwayStream(context.recipient, stream.id);
      if (!("serviceWorker" in navigator)) return;
      const registration = await navigator.serviceWorker.getRegistration();
      const notifications = await registration?.getNotifications({ tag: browserNotificationTag(context.recipient) });
      for (const notification of notifications ?? []) {
        if (context === this.browserContext && notification.data?.streamId === stream.id) notification.close();
      }
    });
  }

  /*
<message> ::= <message-start>
           | <message-continue>
           | <message-end>
<message-start> ::= <message-name> <space> <auth-key> <keyvals>
An MCP message consists of three parts: the name of the message, the authentication key, and a set of keywords and their associated values. The message name indicates what action is to be performed; if the given message name is unknown, the message should be ignored. The authentication key is generated at the beginning of the session; if it is incorrect, the message should be ignored. The keyword-value pairs specify the arguments to the message. These arguments may occur in any order, and the ordering of the arguments does not affect the semantics of the message. There is no limit on the number of keyword-value pairs which may appear in a message, or on the lengths of message names, keywords, or values.
*/

  private handleData(data: Uint8Array) {
    this.telnetBuffer += this.decoder.decode(data, { stream: true });
    const lines = this.telnetBuffer.split("\n");
    this.telnetBuffer = lines.pop() ?? "";

    for (const line of lines) {
      this.handleTextLine(line.replace(/\r$/, ""));
    }
  }

  private handleTextLine(line: string): void {
    if (line?.startsWith("#$#")) {
      this.handleMcp(line);
      return;
    }

    this.emitMessage(line);
  }

  private handleMcp(decoded: string) {
    this.mcpSession.receiveLine(decoded);
  }

  private emitMessage(dataString: string, provisional: boolean = false) {
    if (!canUseGameConnection()) return;
    // A line the server marked as a channel's (Comm.Channel.Start/End) is left
    // to that channel's own reading rule when it has one: Comm.Channel.Text
    // speaks it, so it is not spoken here. Otherwise Auto Read decides, as for
    // any other line.
    const channel = useChannelsStore.getState().activeChannel;
    if (channel !== null && channelHasOwnReading(channel)) {
      useOutputStore.getState().addMessage(dataString, provisional, this.channelOwnsSpeech(channel));
      return;
    }
    const browserSpeechOwned = this.willSpeakIncomingMessages();
    if (browserSpeechOwned) {
      this.speak(dataString);
    }
    useOutputStore.getState().addMessage(dataString, provisional, browserSpeechOwned);
  }

  private canSpeak(): boolean {
    if (typeof window.speechSynthesis?.speak !== 'function' || typeof SpeechSynthesisUtterance !== 'function') return false;
    return usePreferences.getState().speech.volume > 0;
  }

  willSpeakIncomingMessages(): boolean {
    return this.canSpeak() && shouldSpeak(usePreferences.getState().speech.autoreadMode, document.hasFocus());
  }

  /**
   * Whether a channel's own rule takes its line away from the screen reader's
   * announcement: because the rule speaks it, or because the rule is Never.
   */
  private channelOwnsSpeech(channel: string): boolean {
    const mode = channelPreferencesFor(channel).autoreadMode;
    if (mode === AutoreadMode.Off) return true;
    return mode !== "default" && this.canSpeak() && shouldSpeak(mode, document.hasFocus());
  }

  shutdown() {
    if (this.shutdownComplete) return;
    this.shutdownComplete = true;
    this.setBrowserNotificationContext(undefined);
    for (const callback of this.cleanupCallbacks.splice(0)) {
      callback();
    }

    this.mcpSession.shutdown();
    this.gmcp.shutdown();
    this.media.shutdown();
    this.editors?.shutdown();
    this.close();
  }

  requestNotificationPermission() {
    // handle notifications
    // may not be available in all browsers
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return;
    }
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  /** Whether a desktop notification was requested, not proof of delivery or speech. */
  sendNotification(title: string, body: string): boolean {
    // Counted whether or not notifications are allowed: the player still missed it.
    noteMissedActivity();
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return false;
    }

    if (Notification.permission !== "granted") return false;
    new Notification(title, { body });
    return true;
  }

  /** Speaks with the Speech preferences; `voiceName`, when given, replaces their voice. */
  speak(text: string, voiceName: string = "") {
    // A voice command is listening; the microphone would hear this as the command.
    if (clientSpeechSuspended()) return;
    if (!("speechSynthesis" in window)) {
      console.log("This browser does not support speech synthesis");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(stripAnsi(text));
    utterance.lang = "en-US";
    const { rate, pitch, voice, volume } = usePreferences.getState().speech;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    const voices = speechSynthesis.getVoices();
    const selectedVoice = voices.find((v) => v.name === (voiceName || voice));
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    speechSynthesis.speak(utterance);
  }

  cancelSpeech() {
    window.speechSynthesis?.cancel();
  }

  stopAllSounds() {
    this.media.stopAllSounds();
  }

  pauseAllSounds(): Promise<void> {
    return this.media.pauseAllSounds();
  }

  resumeAllSounds(): Promise<void> {
    return this.media.resumeAllSounds();
  }
}

function connectionErrorFromEvent(error: Event): Error {
  if (error instanceof ErrorEvent && error.error instanceof Error) {
    return error.error;
  }
  return new Error("Connection error");
}

export default MudClient;
