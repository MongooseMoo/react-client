import {
  type Stream,
  TelnetCommand,
  TelnetOption,
  TelnetParser,
  WebSocketStream,
} from "./telnet";

import { Buffer } from "buffer";
import { EventEmitter } from "eventemitter3";
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
import { WebRTCService } from "./WebRTCService";
import FileTransferManager from "./FileTransferManager.js";
import { useRoomStore } from "./stores/roomStore";
import { useSpatialStore } from "./stores/spatialStore";
import { useLiveKitStore } from "./stores/liveKitStore";
import { useInputStore } from "./stores/inputStore";
import { useServerLinksStore } from "./stores/serverLinksStore";
import { useWorldMapStore } from "./stores/worldMapStore";
import { useConnectionStore } from "./stores/connectionStore";
import { useCharacterStatusStore } from "./stores/characterStatusStore";
import { useOutputStore } from "./stores/outputStore";

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

class MudClient extends EventEmitter {
  private ws!: WebSocket;
  private decoder = new TextDecoder("utf8");
  private telnet!: TelnetParser;
  private _connected: boolean = false;
  private intentionalDisconnect: boolean = false;
  private localMode: boolean = false;
  private localStream?: Stream;

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
  public webRTCService: WebRTCService;
  public fileTransferManager!: FileTransferManager;
  private _autosay: boolean = false;
  private connectionCleanupComplete: boolean = true;
  private shutdownComplete: boolean = false;

  get autosay(): boolean {
    return this._autosay;
  }

  set autosay(value: boolean) {
    this._autosay = value;
    useInputStore.getState().setAutosay(value);
  }

  constructor(host: string, port: number) {
    super();
    this.host = host;
    this.port = port;
    this.mcpSession = new McpSession({
      sendLine: (line) => this.send(`${line}\r\n`),
    });
    this.gmcp = new GmcpSession(this);
    this.media = new MediaService();
    this.webRTCService = new WebRTCService();
    useInputStore.getState().setAutosay(this._autosay);
  }

  configureFileTransfer(fileTransfer: GMCPClientFileTransfer): void {
    this.gmcp_fileTransfer = fileTransfer;
    this.fileTransferManager = new FileTransferManager(
      this.webRTCService,
      this.gmcp_fileTransfer,
    );
  }

  registerMcpPackage(p: new () => MCPPackage): MCPPackage {
    return this.mcpSession.registerPackage(p);
  }

  configureEditors(simpleEdit: McpSimpleEdit): void {
    this.editors = new EditorManager(simpleEdit);
    simpleEdit.on("openSession", (session) => {
      this.editors?.openEditorWindow(session);
    });
  }

  public connect() {
    this.intentionalDisconnect = false;
    this.connectionCleanupComplete = false;
    this.gmcp.reset();
    this.ws = new window.WebSocket(`wss://${this.host}:${this.port}`);
    this.ws.binaryType = "arraybuffer";
    this.telnet = new TelnetParser(new WebSocketStream(this.ws));
    this.gmcp.attachTransport(this.telnet);
    this.ws.onopen = () => {
      this._connected = true;

      // Reset MIDI intentional disconnect flags when successfully reconnecting to server
      resetMidiIntentionalDisconnectFlags();

      useConnectionStore.getState().setConnected(true);
    };

    this.telnet.on("data", (data: ArrayBuffer) => {
      this.handleData(data);
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
      this.cleanupConnection();
      // Only auto reconnect if it wasn't an intentional disconnect
      if (!this.intentionalDisconnect) {
        setTimeout(() => {
          this.connect();
        }, 10000);
      }
    };

    this.ws.onerror = (error: Event) => {
      useOutputStore.getState().addError(connectionErrorFromEvent(error));
    };
  }

  /**
   * Connect using a local Stream (e.g. WorkerStream for WASM mode).
   * Sets up the telnet parser with the provided stream instead of
   * creating a WebSocket.
   */
  public connectLocal(stream: Stream) {
    this.localMode = true;
    this.localStream = stream;
    this.intentionalDisconnect = false;
    this.connectionCleanupComplete = false;
    this.gmcp.reset();
    this.telnet = new TelnetParser(stream);
    this.gmcp.attachTransport(this.telnet);

    this.telnet.on("data", (data: ArrayBuffer) => {
      this.handleData(data);
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
    if (this.localMode && this.localStream) {
      // In local mode, write through the stream (WorkerStream -> Worker)
      this.localStream.write(Buffer.from(data));
    } else {
      this.ws.send(data);
    }
  }

  private cleanupConnection(): void {
    if (this.connectionCleanupComplete) return;
    this.connectionCleanupComplete = true;
    this._connected = false;
    this.mcpSession.reset();
    this.telnetBuffer = "";
    useRoomStore.getState().reset(); // Reset room info on cleanup
    useSpatialStore.getState().reset(); // Reset spatial scene on cleanup
    useWorldMapStore.getState().reset();
    useServerLinksStore.getState().reset();
    useInputStore.getState().resetCommands();
    useCharacterStatusStore.getState().reset();
    this.fileTransferManager?.cleanup();
    this.gmcp.reset();
    useLiveKitStore.getState().reset();
    useConnectionStore.getState().setConnected(false);
  }

  public close(): void {
    this.intentionalDisconnect = true;
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
    const localEchoEnabled = usePreferences.getState().general.localEcho;
    if (localEchoEnabled) {
      useOutputStore.getState().addCommand(command);
    }
    if (this.autosay && !command.startsWith("-") && !command.startsWith("'")) {
      command = `say ${command}`;
    }
    this.send(`${command}\r\n`);
    console.log(`> ${command}`);
  }

  /*
<message> ::= <message-start>
           | <message-continue>
           | <message-end>
<message-start> ::= <message-name> <space> <auth-key> <keyvals>
An MCP message consists of three parts: the name of the message, the authentication key, and a set of keywords and their associated values. The message name indicates what action is to be performed; if the given message name is unknown, the message should be ignored. The authentication key is generated at the beginning of the session; if it is incorrect, the message should be ignored. The keyword-value pairs specify the arguments to the message. These arguments may occur in any order, and the ordering of the arguments does not affect the semantics of the message. There is no limit on the number of keyword-value pairs which may appear in a message, or on the lengths of message names, keywords, or values.
*/

  private handleData(data: ArrayBuffer) {
    this.telnetBuffer += this.decoder.decode(data);
    const lines = this.telnetBuffer.split("\n");
    this.telnetBuffer = lines.pop() ?? "";

    for (const line of lines) {
      this.handleTextLine(line.replace(/\r$/, ""));
    }

    if (this.telnetBuffer && !this.telnetBuffer.startsWith("#$#")) {
      this.emitMessage(this.telnetBuffer);
      this.telnetBuffer = "";
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

  private emitMessage(dataString: string) {
    const autoreadMode = usePreferences.getState().speech.autoreadMode;
    if (autoreadMode === AutoreadMode.All) {
      this.speak(dataString);
    }
    if (autoreadMode === AutoreadMode.Unfocused && !document.hasFocus()) {
      this.speak(dataString);
    }
    useOutputStore.getState().addMessage(dataString);
  }

  shutdown() {
    if (this.shutdownComplete) return;
    this.shutdownComplete = true;

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
