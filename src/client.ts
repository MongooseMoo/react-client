import {
  TelnetParser,
  TelnetCommand,
  TelnetOption,
  WebSocketStream,
} from "./telnet";
import { EventEmitter } from "eventemitter3";
import { GMCPCore, GMCPCoreSupports, GMCPPackage } from "./gmcp";
import {
  EditorSession,
  McpNegotiate,
  MCPPackage,
  parseMcpMessage,
  parseMcpMultiline,
} from "./mcp";

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
  public mcpAuthKey: string | null = null;
  mcp_negotiate: McpNegotiate;
  public statusText: string = "";

  constructor(host: string, port: number) {
    super();
    this.host = host;
    this.port = port;
    this.mcp_negotiate = new McpNegotiate(this);
    this.mcpHandlers[this.mcp_negotiate.packageName] = this.mcp_negotiate;
  }

  registerGMCPPackage(p: typeof GMCPPackage) {
    const gmcpPackage = new p(this);
    this.gmcpHandlers[gmcpPackage.packageName] = gmcpPackage;
  }

  registerMcpPackage(p: typeof MCPPackage) {
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
    console.log('> ' + command)
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
    if (decoded.startsWith("#$#")) {
      // MCP
      for (const line of decoded.split("\n")) {
        if (line && line.startsWith("#$#")) this.handleMcp(line);
        else if (line) this.emitMessage(line);
      }
    } else {
      this.emitMessage(decoded);
    }
  }

  private handleMcp(decoded: string) {
    if (decoded.startsWith("#$#*")) {
      // multiline
      const continuation = parseMcpMultiline(decoded.trimEnd());
      if (continuation)
        this.mcpMultilines[continuation.name].handleMultiline(continuation);
      return;
    }
    if (decoded.startsWith("#$#:")) {
      const closure = parseMcpMultiline(decoded.trimEnd());
      if (closure){
        this.mcpMultilines[closure.name].closeMultiline(closure);
        delete this.mcpMultilines[closure.name];
      }
      return;
    }
    const mcpMessage = parseMcpMessage(decoded.trimEnd());
    console.log("MCP Message:", mcpMessage);
    if (mcpMessage?.name.toLowerCase() === "mcp" && mcpMessage.authKey == null && this.mcpAuthKey == null) {
      // Authenticate
      this.mcpAuthKey = (Math.random() + 1).toString(36).substring(3, 9);
      this.sendCommand(`#$#mcp authentication-key: ${this.mcpAuthKey} version: 2.1 to: 2.1`);
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
      console.log(`Unexpected authkey "${mcpMessage?.authKey}", probably a spoofed message.`);
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
      console.log("No handler for GMCP package:", packageName);
    }
  }

  private emitMessage(dataString: string) {
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
        str += ` ${key}: ${value}`;
      }
      data = str;
    }
    this.sendCommand(`#$#${command} ${this.mcpAuthKey} ${data}`);
  }
  openEditorWindow(editorSession: EditorSession) {
    console.log(editorSession);
  }

  saveEditorWindow(editorSession: EditorSession) {
    // TODO: Send dns-org-mud-moo-simpleedit-set
    // Open Multiline, send contents, close ML
  }
}
export default MudClient;
