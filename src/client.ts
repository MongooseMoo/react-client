import {
  TelnetParser,
  TelnetCommand,
  TelnetOption,
  WebSocketStream,
} from "./telnet";
import { EventEmitter } from "eventemitter3";
import { GMCPCore, GMCPCoreSupports, GMCPPackage } from "./gmcp";

class MudClient extends EventEmitter {
  private ws!: WebSocket;
  private decoder = new TextDecoder("utf8");
  private telnet!: TelnetParser;

  private host: string;
  private port: number;
  private telnetNegotiation: boolean = false;
  private telnetBuffer: string = "";
  public gmcpHandlers: { [key: string]: GMCPPackage } = {};

  constructor(host: string, port: number) {
    super();
    this.host = host;
    this.port = port;
  }

  registerGMCPPackage(p: typeof GMCPPackage) {
    const gmcpPackage = new p(this);
    this.gmcpHandlers[gmcpPackage.packageName] = gmcpPackage;
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
      } else if (
        command === TelnetCommand.DO &&
        option === TelnetOption.TERMINAL_TYPE
      ) {
        console.log("TTYPE Negotiation");
        this.telnet.sendNegotiation(
          TelnetCommand.WILL,
          TelnetOption.TERMINAL_TYPE
        );
        this.telnet.sendTerminalType("Mongoose React Client");
        this.telnet.sendTerminalType("ANSI");
        this.telnet.sendTerminalType("PROXY");
      }
    });

    this.telnet.on("gmcp", (packageName, data) => {
      console.log("GMCP Package:", packageName, data);
      this.handleGmcpData(packageName, data);
    });

    this.ws.onclose = () => {
      this.emit("disconnect");
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

  public sendCommand(command: string) {
    this.send(command + "\r\n");
  }

  /*
<message> ::= <message-start>
           | <message-continue>
           | <message-end>
<message-start> ::= <message-name> <space> <auth-key> <keyvals>
An MCP message consists of three parts: the name of the message, the authentication key, and a set of keywords and their associated values. The message name indicates what action is to be performed; if the given message name is unknown, the message should be ignored. The authentication key is generated at the beginning of the session; if it is incorrect, the message should be ignored. The keyword-value pairs specify the arguments to the message. These arguments may occur in any order, and the ordering of the arguments does not affect the semantics of the message. There is no limit on the number of keyword-value pairs which may appear in a message, or on the lengths of message names, keywords, or values.
*/
  private handleData(data: ArrayBuffer) {
    const decoded = this.decoder.decode(data);
    console.log("Received:", decoded);
    if (decoded.startsWith("#$#")) {
      // MCP
      this.handleMcp(decoded);
    } else {
      this.emitMessage(decoded);
    }
  }

  private handleMcp(decoded: string) {
    const parts = decoded.split(" ");
    const messageName = parts[0].substring(3);
    const authKey = parts[1];
    const keyvals = parts.slice(2);
    // parse keys and values from keyvals.
    /*
    Each argument to a message is named by a keyword. The keyword consists of an identifier (a string matching the <ident> nonterminal), optionally followed by an asterisk; if the asterisk is present, the value to follow is a multiline value. If no asterisk is present, the value is simple. Messages may contain a mixture of simple and multiline values.
    */
    let keyvalsObj: { [key: string]: string } = {};
    for (let i = 0; i < keyvals.length; i++) {
      const key = keyvals[i];
      const isMultiline = key.endsWith("*");
      const keyName = isMultiline ? key.substring(0, key.length - 1) : key;
      const value = keyvals[i + 1];
      keyvalsObj[keyName] = value;
      if (isMultiline) {
        i++;
      }
    }
    console.log("MCP Message:", messageName, authKey, keyvalsObj);
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
      console.log("No handler for GMCP package:", packageName);
    }
  }

  private emitMessage(dataString: string) {
    const sanitizedHtml = dataString
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    this.emit("message", sanitizedHtml);
  }

  sendGmcp(packageName: string, data?: any) {
    console.log("Sending GMCP:", packageName, data);
    this.telnet.sendGmcp(packageName, data);
  }
}
export default MudClient;
