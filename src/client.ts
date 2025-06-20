import {
  TelnetCommand,
  TelnetOption,
  TelnetParser,
  WebSocketStream,
} from "./telnet";

import { EventEmitter } from "eventemitter3";
import stripAnsi from "strip-ansi";
import { EditorManager } from "./EditorManager";
import {
  GMCPAutoLogin,
  GMCPChar,
  GMCPClientMedia,
  GMCPCore,
  GMCPCoreSupports,
  GMCPClientFileTransfer,
} from "./gmcp";
import type { GMCPPackage } from "./gmcp/package";
import {
  MCPKeyvals,
  MCPPackage,
  McpAwnsGetSet,
  McpNegotiate,
  generateTag,
  parseMcpMessage,
  parseMcpMultiline,
} from "./mcp";

import { Cacophony } from "cacophony";
import { AutoreadMode, preferencesStore } from "./PreferencesStore";
import { WebRTCService } from "./WebRTCService";
import FileTransferManager from "./FileTransferManager.js";
import { GMCPMessageRoomInfo, RoomPlayer } from "./gmcp/Room"; // Import RoomPlayer

export interface WorldData {
  liveKitTokens: string[];
  playerId: string;
  playerName: string;
  roomId: string;
  roomPlayers: RoomPlayer[]; // Changed from string[]
}

class MudClient extends EventEmitter {
  private ws!: WebSocket;
  private decoder = new TextDecoder("utf8");
  private telnet!: TelnetParser;
  private _connected: boolean = false;
  private intentionalDisconnect: boolean = false;

  get connected(): boolean {
    return this._connected;
  }

  private host: string;
  private port: number;
  private telnetNegotiation: boolean = false;
  private telnetBuffer: string = "";
  public gmcpHandlers: { [key: string]: GMCPPackage } = {};
  public mcpHandlers: { [key: string]: MCPPackage } = {};
  public mcpMultilines: { [key: string]: MCPPackage } = {};
  private mcpAuthKey: string | null = null;
  mcp_negotiate: McpNegotiate;
  public mcp_getset: McpAwnsGetSet;
  public gmcp_char: GMCPChar;
  public gmcp_fileTransfer: GMCPClientFileTransfer;
  public worldData: WorldData = {
    playerId: "",
    playerName: "",
    roomId: "",
    liveKitTokens: [],
    roomPlayers: [], // Initialized as RoomPlayer[]
  };
  public cacophony: Cacophony;
  public editors: EditorManager;
  public webRTCService: WebRTCService;
  public fileTransferManager: FileTransferManager;
  public currentRoomInfo: GMCPMessageRoomInfo | null = null; // Add property to store room info
  private _autosay: boolean = false;
  private globalMuted: boolean = false;
  private isWindowFocused: boolean = true;

  get autosay(): boolean {
    return this._autosay;
  }

  set autosay(value: boolean) {
    this._autosay = value;
    this.emit('autosayChanged', value);
  }

  constructor(host: string, port: number) {
    super();
    this.host = host;
    this.port = port;
    this.mcp_negotiate = this.registerMcpPackage(McpNegotiate);
    this.mcp_getset = this.registerMcpPackage(McpAwnsGetSet);
    this.gmcp_char = this.registerGMCPPackage(GMCPChar);
    this.gmcp_fileTransfer = this.registerGMCPPackage(GMCPClientFileTransfer);
    this.cacophony = new Cacophony();
    this.cacophony.setGlobalVolume(preferencesStore.getState().sound.volume);
    this.editors = new EditorManager(this);
    this.webRTCService = new WebRTCService(this);
    this.fileTransferManager = new FileTransferManager(
      this,
      this.gmcp_fileTransfer
    );
    
    // Set up window focus event listeners
    window.addEventListener('focus', () => {
      this.isWindowFocused = true;
      this.updateBackgroundMuteState();
    });
    
    window.addEventListener('blur', () => {
      this.isWindowFocused = false;
      this.updateBackgroundMuteState();
    });
    
    // Subscribe to preference changes
    preferencesStore.subscribe(() => {
      this.updateBackgroundMuteState();
    });
  }
  // File Transfer related methods
  async sendFile(file: File, recipient: string): Promise<void> {
    await this.fileTransferManager.sendFile(file, recipient);
  }

  cancelTransfer(hash: string): void {
    this.fileTransferManager.cancelTransfer(hash);
  }

  acceptTransfer(sender: string, hash: string): void {
    this.fileTransferManager.acceptTransfer(sender, hash);
  }

  rejectTransfer(sender: string, hash: string): void {
    this.gmcp_fileTransfer.sendReject(sender, hash);
  }

  // File Transfer event handlers
  onFileTransferOffer(
    sender: string,
    hash: string,
    filename: string,
    filesize: number,
    offerSdp: string
  ): void {
    console.log("[MudClient] Emitting fileTransferOffer event:", {
      sender,
      hash,
      filename,
      filesize,
      offerSdp,
    });
    this.emit("fileTransferOffer", {
      sender,
      hash,
      filename,
      filesize,
      offerSdp,
    });
  }

  onFileTransferAccept(
    sender: string,
    hash: string,
    filename: string,
    answerSdp: string
  ): void {
    console.log("[MudClient] Emitting fileTransferAccepted event:", {
      sender,
      hash,
      filename,
      answerSdp,
    });
    this.emit("fileTransferAccepted", { sender, hash, filename, answerSdp });
  }

  onFileTransferReject(sender: string, hash: string): void {
    this.emit("fileTransferRejected", { sender, hash });
  }

  onFileTransferCancel(sender: string, hash: string): void {
    this.emit("fileTransferCancelled", { sender, hash });
  }

  onFileSendComplete(hash: string, filename: string): void {
    this.emit("fileSendComplete", { hash, filename });
  }

  onFileTransferError(
    hash: string,
    filename: string,
    direction: "send" | "receive",
    error: string
  ): void {
    this.emit("fileTransferError", { hash, filename, direction, error });
  }

  onConnectionRecovered(data: {
    filename: string;
    direction: "send" | "receive";
    hash: string;
  }): void {
    this.emit("connectionRecovered", data);
  }

  onRecoveryFailed(data: {
    filename: string;
    direction: "send" | "receive";
    error: string;
  }): void {
    this.emit("recoveryFailed", data);
  }

  // GMCP methods for file transfer
  sendFileTransferOffer(
    recipient: string,
    filename: string,
    hash: string,
    filesize: number,
    offerSdp: string
  ): void {
    this.gmcp_fileTransfer.sendOffer(
      recipient,
      filename,
      filesize,
      offerSdp,
      hash
    );
  }

  sendFileTransferAccept(
    sender: string,
    filename: string,
    hash: string,
    answerSdp: string
  ): void {
    this.gmcp_fileTransfer.sendAccept(sender, hash, filename, answerSdp);
  }

  registerGMCPPackage<P extends GMCPPackage>(p: new (_: MudClient) => P): P {
    const gmcpPackage = new p(this);
    this.gmcpHandlers[gmcpPackage.packageName] = gmcpPackage;
    console.log("Registered GMCP Package:", gmcpPackage.packageName);
    return gmcpPackage;
  }

  registerMcpPackage<P extends MCPPackage>(p: new (_: MudClient) => P): P {
    const mcpPackage = new p(this);
    this.mcpHandlers[mcpPackage.packageName] = mcpPackage;
    return mcpPackage;
  }

  public connect() {
    this.intentionalDisconnect = false;
    this.ws = new window.WebSocket(`wss://${this.host}:${this.port}`);
    this.ws.binaryType = "arraybuffer";
    this.telnet = new TelnetParser(new WebSocketStream(this.ws));
    this.ws.onopen = () => {
      this._connected = true;
      this.emit("connect");
      this.emit("connectionChange", true);
    };

    this.telnet.on("data", (data: ArrayBuffer) => {
      this.handleData(data);
    });

    this.telnet.on("negotiation", (command, option) => {
      // Negotiation that we support GMCP
      if (command === TelnetCommand.WILL && option === TelnetOption.GMCP) {
        console.log("GMCP Negotiation");
        this.telnet.sendNegotiation(TelnetCommand.DO, TelnetOption.GMCP);
        (this.gmcpHandlers["Core"] as GMCPCore).sendHello();
        (this.gmcpHandlers["Core.Supports"] as GMCPCoreSupports).sendSet();
        (this.gmcpHandlers["Auth.Autologin"] as GMCPAutoLogin).sendLogin();
      } else if (
        command === TelnetCommand.DO &&
        option === TelnetOption.TERMINAL_TYPE
      ) {
        console.log("TTYPE Negotiation");
        this.telnet.sendNegotiation(
          TelnetCommand.WILL,
          TelnetOption.TERMINAL_TYPE
        );
        this.telnet.sendTerminalType("Mongoose Client");
        this.telnet.sendTerminalType("ANSI");
        this.telnet.sendTerminalType("PROXY");
      }
    });

    this.telnet.on("gmcp", (packageName, data) => {
      console.log("GMCP Package:", packageName, data);
      try {
        this.handleGmcpData(packageName, data);
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
      this.emit("error", error);
    };
  }

  public send(data: string) {
    this.ws.send(data);
  }

  private cleanupConnection(): void {
    this._connected = false;
    this.mcpAuthKey = null;
    this.telnetBuffer = "";
    this.telnetNegotiation = false;
    this.currentRoomInfo = null; // Reset room info on cleanup
    this.webRTCService.cleanup();
    this.fileTransferManager.cleanup();
    this.emit("disconnect");
    this.emit("connectionChange", false);
  }

  public close(): void {
    this.intentionalDisconnect = true;
    if (this.ws) {
      this.ws.close();
    }
    this.cleanupConnection();
  }

  public sendCommand(command: string): void {
    const localEchoEnabled = preferencesStore.getState().general.localEcho;
    if (localEchoEnabled) {
      this.emit("command", command);
    }
    if (this.autosay && !command.startsWith("-") && !command.startsWith("'")) {
      command = "say " + command;
    }
    this.send(command + "\r\n");
    console.log("> " + command);
  }

  /*
<message> ::= <message-start>
           | <message-continue>
           | <message-end>
<message-start> ::= <message-name> <space> <auth-key> <keyvals>
An MCP message consists of three parts: the name of the message, the authentication key, and a set of keywords and their associated values. The message name indicates what action is to be performed; if the given message name is unknown, the message should be ignored. The authentication key is generated at the beginning of the session; if it is incorrect, the message should be ignored. The keyword-value pairs specify the arguments to the message. These arguments may occur in any order, and the ordering of the arguments does not affect the semantics of the message. There is no limit on the number of keyword-value pairs which may appear in a message, or on the lengths of message names, keywords, or values.
*/

  private handleData(data: ArrayBuffer) {
    const decoded = this.decoder.decode(data).trimEnd();
    for (const line of decoded.split("\n")) {
      if (line && line.startsWith("#$#")) {
        // MCP
        this.handleMcp(line);
      } else {
        this.emitMessage(line);
      }
    }
  }

  private handleMcp(decoded: string) {
    if (decoded.startsWith("#$#*")) {
      // multiline
      const continuation = parseMcpMultiline(decoded.trimEnd());
      if (continuation)
        if (continuation.name in this.mcpMultilines)
          this.mcpMultilines[continuation.name].handleMultiline(continuation);
        else
          console.warn(
            "Received continuation for unknown multiline",
            continuation
          );
      return;
    }
    if (decoded.startsWith("#$#:")) {
      const closure = parseMcpMultiline(decoded.trimEnd());
      if (closure) {
        this.mcpMultilines[closure.name].closeMultiline(closure);
        delete this.mcpMultilines[closure.name];
      }
      return;
    }
    const mcpMessage = parseMcpMessage(decoded.trimEnd());
    console.log("MCP Message:", mcpMessage);
    if (
      mcpMessage?.name.toLowerCase() === "mcp" &&
      mcpMessage.authKey == null &&
      this.mcpAuthKey == null
    ) {
      // Authenticate
      this.mcpAuthKey = generateTag();
      this.sendCommand(
        `#$#mcp authentication-key: ${this.mcpAuthKey} version: 2.1 to: 2.1`
      );
      this.mcp_negotiate.sendNegotiate();
    } else if (mcpMessage?.name === "mcp-negotiate-end") {
      // spec says to refuse additional negotiations after this, but it's not really needed
    } else if (mcpMessage?.authKey === this.mcpAuthKey) {
      let name = mcpMessage.name;
      do {
        if (name in this.mcpHandlers) {
          this.mcpHandlers[name].handle(mcpMessage);
          if ("_data-tag" in mcpMessage.keyvals) {
            console.log("new multiline " + mcpMessage.keyvals["_data-tag"]);
            this.mcpMultilines[mcpMessage.keyvals["_data-tag"]] =
              this.mcpHandlers[name];
          }
          return;
        }
        name = name.substring(0, name.lastIndexOf("-"));
      } while (name);
      console.log(`No handler for ${mcpMessage.name}`);
    } else {
      console.log(
        `Unexpected authkey "${mcpMessage?.authKey}", probably a spoofed message.`
      );
    }
  }

  private handleGmcpData(gmcpPackage: string, gmcpMessage: string) {
    //split to packageName and message type. the message name is after the last period of the gmcp package. the package can hav emultiple dots.
    const lastDot = gmcpPackage.lastIndexOf(".");
    const packageName = gmcpPackage.substring(0, lastDot);
    const messageType = gmcpPackage.substring(lastDot + 1);

    console.log("GMCP Message:", packageName, messageType, gmcpMessage);
    const handler = this.gmcpHandlers[packageName];
    if (!handler) {
      console.log("No handler for GMCP package:", packageName);
      return;
    }
    // Look for the handler using the exact messageType from the package string
    const messageHandler = (handler as any)["handle" + messageType];

    if (messageHandler) {
      console.log("Calling handler for:", messageType, messageHandler); // Log original type

      let jsonStringToParse: string;
      // Check if gmcpMessage is a valid, non-empty string
      if (typeof gmcpMessage === 'string' && gmcpMessage.trim() !== '') {
        jsonStringToParse = gmcpMessage;
      } else {
        // Log a warning and default to an empty JSON object string
        console.warn(`GMCP message data for ${packageName}.${messageType} is missing or empty. Defaulting to {}. Original data:`, gmcpMessage);
        jsonStringToParse = '{}';
      }

      try {
        const parsedData = JSON.parse(jsonStringToParse);
        messageHandler.call(handler, parsedData);
      } catch (e) {
        // Add specific error handling for JSON parsing failure
        console.error(`Error parsing GMCP JSON for ${packageName}.${messageType}:`, e);
        console.error("Attempted to parse:", jsonStringToParse); // Log the string we tried to parse
        // Optionally, you could decide whether to still call the handler with null/undefined/default data
        // messageHandler.call(handler, {}); // Example: Call with empty object on parse failure
      }
    } else {
      // Use original messageType in the error message
      console.log("No handler on package:", packageName, messageType);
    }
  }

  private emitMessage(dataString: string) {
    const autoreadMode = preferencesStore.getState().speech.autoreadMode;
    if (autoreadMode === AutoreadMode.All) {
      this.speak(dataString);
    }
    if (autoreadMode === AutoreadMode.Unfocused && !document.hasFocus()) {
      this.speak(dataString);
    }
    this.emit("message", dataString);
  }

  sendGmcp(packageName: string, data?: any) {
    console.log("Sending GMCP:", packageName, data);
    this.telnet.sendGmcp(packageName, data);
  }

  sendMcp(command: string, data?: any) {
    if (typeof data === "object") {
      let str = "";
      for (const [key, value] of Object.entries(data)) {
        str += ` ${key}: ${value || '""'}`;
      }
      data = str;
    }
    const toSend = `#$#${command} ${this.mcpAuthKey} ${data}\r\n`;
    this.send(toSend);
  }

  sendMcpMLLine(MLTag: string, key: string, val: string) {
    this.send(`#$#* ${MLTag} ${key}: ${val}\r\n`);
  }

  closeMcpML(MLTag: string) {
    this.send(`#$#: ${MLTag}\r\n`);
  }

  sendMCPMultiline(mcpMessage: string, keyvals: MCPKeyvals, lines: string[]) {
    const MLTag = generateTag();
    keyvals["_data-tag"] = MLTag;

    this.sendMcp(mcpMessage, keyvals);
    for (const line of lines) {
      this.sendMcpMLLine(MLTag, "content", line);
    }
    this.closeMcpML(MLTag);
  }

  shutdown() {
    Object.values(this.mcpHandlers).forEach((handler) => {
      handler.shutdown();
    });
    Object.values(this.gmcpHandlers).forEach((handler) => {
      handler.shutdown();
    });
    this.editors.shutdown();
    this.webRTCService.cleanup();
    this.fileTransferManager.cleanup();
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
    const { rate, pitch, voice, volume } = preferencesStore.getState().speech;
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
    const gmcpClientMedia = this.gmcpHandlers[
      "Client.Media"
    ] as GMCPClientMedia;
    gmcpClientMedia.stopAllSounds();
  }

  updateBackgroundMuteState() {
    const prefs = preferencesStore.getState();
    const shouldMuteInBackground = prefs.sound.muteInBackground && !this.isWindowFocused;
    
    // Apply mute state: global mute OR background mute
    this.cacophony.muted = this.globalMuted || shouldMuteInBackground;
  }

  setGlobalMute(muted: boolean) {
    this.globalMuted = muted;
    this.updateBackgroundMuteState();
  }
}

export default MudClient;
