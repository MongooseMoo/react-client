import {
  type Stream,
  TelnetCommand,
  TelnetOption,
  TelnetParser,
  WebSocketStream,
} from "./telnet";

import stripAnsi from "strip-ansi";
import { EditorManager } from "./EditorManager";
import { type GMCPClientFileTransfer, GmcpSession } from "./gmcp";
import {
  type MCPPackage,
  type McpSimpleEdit,
  McpSession,
} from "./mcp";

import { MediaService } from "./audio/MediaService";
import { AutoreadMode, usePreferences } from "./stores/preferencesStore";
import type FileTransferManager from "./FileTransferManager";
import { useInputStore } from "./stores/inputStore";
import { useConnectionStore } from "./stores/connectionStore";
import { useOutputStore } from "./stores/outputStore";
import { reconnectDelay } from "./reconnectBackoff";
import {
  AWAY_NOTIFICATION_TAG,
  type AwayCommandResult,
  type AwayLine,
  clearAwayLines,
  sendAwayCommand,
  takeUnshownAwayLines,
} from "./away";

// How long an open socket may stay silent after a resume ping before it is
// treated as dead.
const LIVENESS_TIMEOUT_MS = 4000;

function resetMidiIntentionalDisconnectFlags(): void {
  if (!usePreferences.getState().midi.enabled) return;

  import("./MidiService")
    .then(({ midiService }) => {
      midiService.resetIntentionalDisconnectFlags();
    })
    .catch((error) => {
      console.error("Failed to reset MIDI disconnect flags:", error);
    });
}

class MudClient {
  private ws!: WebSocket;
  private decoder = new TextDecoder("utf8");
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private reconnectAttempt: number = 0;
  private livenessTimer?: ReturnType<typeof setTimeout>;
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

  get connected(): boolean {
    return this._connected;
  }

  private host: string;
  private port: number;
  private telnetBuffer: string = "";
  public readonly gmcp: GmcpSession;
  public readonly mcpSession: McpSession;
  public gmcp_fileTransfer!: GMCPClientFileTransfer;
  public media: MediaService;
  public editors?: EditorManager;
  private fileTransferManager?: FileTransferManager;
  private fileTransferLoading?: Promise<FileTransferManager>;
  private fileTransferGeneration = 0;
  private _autosay: boolean = false;
  private connectionCleanupComplete: boolean = true;
  private shutdownComplete: boolean = false;
  private disconnectResetCallbacks: Array<() => void> = [];
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
    useInputStore.getState().setAutosay(this._autosay);
  }

  configureFileTransfer(fileTransfer: GMCPClientFileTransfer): void {
    this.gmcp_fileTransfer = fileTransfer;
    const resetFileTransfer = () => {
      this.fileTransferGeneration++;
      this.fileTransferManager?.cleanup();
      this.fileTransferManager = undefined;
      this.fileTransferLoading = undefined;
    };
    this.registerDisconnectReset(resetFileTransfer);
    this.registerCleanup(resetFileTransfer);
  }

  getFileTransferManager(): Promise<FileTransferManager> {
    if (this.shutdownComplete) return Promise.reject(new Error('Client has shut down'));
    if (this.fileTransferManager) return Promise.resolve(this.fileTransferManager);
    if (this.fileTransferLoading) return this.fileTransferLoading;
    const generation = this.fileTransferGeneration;
    const loading = Promise.all([import('./FileTransferManager'), import('./WebRTCService')])
      .then(([{ default: FileTransferManager }, { WebRTCService }]) => {
        if (this.shutdownComplete || generation !== this.fileTransferGeneration) {
          throw new Error('File transfer initialization cancelled');
        }
        const manager = new FileTransferManager(new WebRTCService(), this.gmcp_fileTransfer);
        this.fileTransferManager = manager;
        return manager;
      }).catch((error) => {
        if (this.fileTransferLoading === loading) this.fileTransferLoading = undefined;
        throw error;
      });
    this.fileTransferLoading = loading;
    return loading;
  }

  registerMcpPackage(p: new () => MCPPackage): MCPPackage {
    const mcpPackage = this.mcpSession.registerPackage(p);
    this.registerDisconnectReset(() => mcpPackage.reset());
    return mcpPackage;
  }

  configureEditors(simpleEdit: McpSimpleEdit): void {
    this.editors = new EditorManager(simpleEdit);
    simpleEdit.on("openSession", (session) => {
      this.editors?.openEditorWindow(session);
    });
  }

  public connect() {
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
    this.gmcp.attachTransport(this.telnet);
    // Any inbound bytes prove the socket is alive, whatever they parse to.
    const deliverMessage = ws.onmessage;
    ws.onmessage = (event: MessageEvent) => {
      this.clearLivenessProbe();
      deliverMessage?.call(ws, event);
    };
    this.ws.onopen = () => {
      this._connected = true;
      this.reconnectAttempt = 0;

      // Reset MIDI intentional disconnect flags when successfully reconnecting to server
      resetMidiIntentionalDisconnectFlags();

      useConnectionStore.getState().setConnected(true);
      this.endAwayPeriod();
    };

    this.telnet.on("data", (data: Uint8Array) => {
      this.handleData(data);
    });

    this.telnet.on("command", (command) => {
      if (
        (command === TelnetCommand.GA || command === TelnetCommand.EOR) &&
        this.telnetBuffer
      ) {
        this.handleTextLine(this.telnetBuffer.replace(/\r$/, ""));
        this.telnetBuffer = "";
      }
    });

    this.telnet.on("negotiation", (command, option) => {
      // Negotiation that we support GMCP
      if (command === TelnetCommand.WILL && option === TelnetOption.GMCP) {
        console.log("GMCP Negotiation");
        this.telnet.sendNegotiation(TelnetCommand.DO, TelnetOption.GMCP);
        this.gmcp.start();
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
      console.log("GMCP Package:", packageName, data);
      try {
        this.gmcp.receive(packageName, data);
      } catch (e) {
        console.error("Calling GMCP:", e);
      }
    });

    this.ws.onclose = () => {
      // A socket we already replaced (e.g. a dead one whose close arrives
      // late) must not tear down the connection that superseded it.
      if (ws !== this.ws) return;
      this.cleanupConnection();
      // Only auto reconnect if it wasn't an intentional disconnect
      if (!this.intentionalDisconnect) {
        this.reconnectTimer = setTimeout(() => {
          this.connect();
        }, reconnectDelay(this.reconnectAttempt++));
      }
    };

    this.ws.onerror = (error: Event) => {
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
    this.gmcp.require("Core").sendPing(undefined);
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
    this.awayChannel = false;
    this.localMode = true;
    this.localStream = stream;
    this.intentionalDisconnect = false;
    this.connectionCleanupComplete = false;
    this.gmcp.reset();
    this.telnet = new TelnetParser(stream);
    this.gmcp.attachTransport(this.telnet);

    this.telnet.on("data", (data: Uint8Array) => {
      this.handleData(data);
    });

    this.telnet.on("command", (command) => {
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
      console.log("GMCP Package (local):", packageName, data);
      try {
        this.gmcp.receive(packageName, data);
      } catch (e) {
        console.error("Calling GMCP:", e);
      }
    });

    stream.on("close", () => {
      this.cleanupConnection();
    });

    // Mark as connected immediately — the worker will send the "connected"
    // message once the virtual connection is created.
    this._connected = true;
    resetMidiIntentionalDisconnectFlags();
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

  private cleanupConnection(): void {
    if (this.connectionCleanupComplete) return;
    this.connectionCleanupComplete = true;
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
    if (this.autosay && !command.startsWith("-") && !command.startsWith("'")) {
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
    console.log(`> ${command}`);
  }

  /**
   * With the socket down, a stored away token lets the command go out over
   * HTTP; its output comes back as away lines. Without one, `disconnected` is
   * reported as it always was.
   */
  private async sendCommandWhileAway(command: string, disconnected: Error): Promise<void> {
    let result: AwayCommandResult;
    try {
      result = await sendAwayCommand(command);
    } catch (error) {
      useOutputStore
        .getState()
        .addError(error instanceof Error ? error : new Error(String(error)));
      return;
    }
    if (result.status === "rejected") {
      useOutputStore.getState().addError(new Error(result.error));
      return;
    }
    if (result.status !== "sent") {
      useOutputStore.getState().addError(disconnected);
      return;
    }
    this.echoCommand(command);
    this.showAwayLines(result.lines);
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
        if (event.data?.type === "away-lines" && Array.isArray(event.data.lines)) {
          this.showAwayLines(event.data.lines);
        }
      };
      navigator.serviceWorker.addEventListener("message", onMessage);
      this.registerCleanup(() => {
        navigator.serviceWorker.removeEventListener("message", onMessage);
      });
    }
    this.showAwayLines();
  }

  /**
   * While the socket is down, puts the away lines not yet shown (the stored
   * ones plus `extra`) into the output as provisional lines.
   */
  private showAwayLines(extra?: AwayLine[]): void {
    this.queueAwayWork(async () => {
      if (this._connected || !this.awayChannel || this.shutdownComplete) return;
      const lines = await takeUnshownAwayLines(extra);
      if (this._connected) return;
      for (const line of lines) {
        this.emitMessage(line.text, true);
      }
    });
  }

  /**
   * The socket is back and the server replays what was missed, so the output
   * drops its provisional lines; the stored lines and the notifications that
   * announced them are obsolete too.
   */
  private endAwayPeriod(): void {
    this.queueAwayWork(async () => {
      await clearAwayLines();
      if (!("serviceWorker" in navigator)) return;
      const registration = await navigator.serviceWorker.getRegistration();
      const notifications = await registration?.getNotifications({ tag: AWAY_NOTIFICATION_TAG });
      for (const notification of notifications ?? []) {
        notification.close();
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
    const autoreadMode = usePreferences.getState().speech.autoreadMode;
    if (autoreadMode === AutoreadMode.All) {
      this.speak(dataString);
    }
    if (autoreadMode === AutoreadMode.Unfocused && !document.hasFocus()) {
      this.speak(dataString);
    }
    useOutputStore.getState().addMessage(dataString, provisional);
  }

  shutdown() {
    if (this.shutdownComplete) return;
    this.shutdownComplete = true;
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

  sendNotification(title: string, body: string) {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return;
    }

    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  }

  speak(text: string) {
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
    const selectedVoice = voices.find((v) => v.name === voice);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    speechSynthesis.speak(utterance);
  }

  cancelSpeech() {
    speechSynthesis.cancel();
  }

  stopAllSounds() {
    this.media.stopAllSounds();
  }
}

function connectionErrorFromEvent(error: Event): Error {
  if (error instanceof ErrorEvent && error.error instanceof Error) {
    return error.error;
  }
  return new Error("Connection error");
}

export default MudClient;
