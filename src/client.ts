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

interface NtfyMessage {
  event: string;
  expires: number;
  id: string;
  message: string;
  title: string;
  time: number;
  topic?: string;
}
export interface WorldData {
  liveKitTokens: string[];
  playerId: string;
  uuid: string;
  playerName: string;
  roomId: string;
}

class MudClient extends EventEmitter {
  private ws!: WebSocket;
  private decoder = new TextDecoder("utf8");
  private telnet!: TelnetParser;

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
  public worldData: WorldData = {
    playerId: "",
    playerName: "",
    roomId: "",
    uuid: "",
    liveKitTokens: [],
  };
  public cacophony: Cacophony;
  public editors: EditorManager;
  public serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  constructor(host: string, port: number) {
    super();
    this.host = host;
    this.port = port;
    this.mcp_negotiate = this.registerMcpPackage(McpNegotiate);
    this.mcp_getset = this.registerMcpPackage(McpAwnsGetSet);
    this.gmcp_char = this.registerGMCPPackage(GMCPChar);
    this.cacophony = new Cacophony();
    this.editors = new EditorManager(this);
    this.handleNtfyMessage = this.handleNtfyMessage.bind(this);
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
    this.ws = new window.WebSocket(`wss://${this.host}:${this.port}`);
    this.ws.binaryType = "arraybuffer";
    this.telnet = new TelnetParser(new WebSocketStream(this.ws));
    this.ws.onopen = () => {
      this.emit("connect");
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
      this.emit("disconnect");
      this.mcpAuthKey = null;
      // auto reconnect
      setTimeout(() => {
        this.connect();
      }, 10000);
    };

    this.ws.onerror = (error: Event) => {
      this.emit("error", error);
    };
  }

  public send(data: string) {
    this.ws.send(data);
  }

  public close() {
    this.ws.close();
  }

  sendCommand = (command: string) => {
    const localEchoEnabled = preferencesStore.getState().general.localEcho;
    if (localEchoEnabled) {
      this.emit("command", command);
    }
    this.send(command + "\r\n");
    console.log("> " + command);
  };

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
    const messageHandler = (handler as any)["handle" + messageType];
    if (messageHandler) {
      console.log("Calling handler:", messageHandler);
      messageHandler.call(handler, JSON.parse(gmcpMessage));
    } else {
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

  getInput(): string {
    // get what the user has typed so far
    return document.getElementById("command-input")?.textContent || "";
  }

  setInput(text: string) {
    // place text in the input field
    const input = document.getElementById("command-input");
    if (!input) return;
    input.textContent = text;
  }

  setUuid(uuid: string): void {
    this.worldData.uuid = uuid;
    const ntfyTopic = "Mongoose-player-" + this.worldData.uuid;
    console.log("Set UUID:", this.worldData.uuid);
    this.serviceWorkerRegistration?.active?.postMessage({
      type: "SET_TOPIC",
      topic: ntfyTopic,
    });
  }

  handleNtfyMessage(payload: NtfyMessage) {
    this.sendNotification(payload.title, payload.message);
  }
}

export default MudClient;
