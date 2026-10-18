# Networking and Telnet Protocol Implementation

**Report Date:** 2025-12-12
**Subject:** React MUD Client Networking Architecture
**Scope:** Connection lifecycle, telnet protocol, data flow, and proxy architecture

---

## Executive Summary

The Mongoose React MUD client uses **WebSocket Secure (WSS)** connections to communicate with MUD servers via a proxy server. There is NO direct raw TCP connection from the browser (browsers cannot make raw TCP connections). The architecture consists of:

1. **Browser client** (React app) using WebSockets
2. **WebSocket-to-Telnet proxy server** at `mongoose.moo.mud.org:8765`
3. **MUD server** (actual game server) using traditional telnet protocol

The client implements a full telnet protocol parser that handles IAC sequences, option negotiation, subnegotiations, and two major protocol extensions: GMCP (Generic Mud Communication Protocol) and MCP (MUD Client Protocol).

---

## 1. Connection Architecture

### 1.1 WebSocket Connection (Not Raw TCP)

**File:** `C:\Users\Q\code\react-client\src\client.ts` (line 258-262)

```typescript
public connect() {
  this.intentionalDisconnect = false;
  this.ws = new window.WebSocket(`wss://${this.host}:${this.port}`);
  this.ws.binaryType = "arraybuffer";
  this.telnet = new TelnetParser(new WebSocketStream(this.ws));
```

**Key Points:**
- Uses secure WebSocket (`wss://`) protocol
- Hardcoded to connect to `mongoose.moo.mud.org:8765` (from `App.tsx` line 88)
- Binary mode set to `arraybuffer` for efficient handling of telnet binary data
- WebSocket is wrapped in a `WebSocketStream` adapter to provide a common stream interface

### 1.2 WebSocket-to-Stream Adapter

**File:** `C:\Users\Q\code\react-client\src\telnet.ts` (lines 85-109)

```typescript
export class WebSocketStream implements Stream {
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    this.ws = ws;
  }

  on(event: "data", cb: (data: Buffer) => void): void;
  on(event: "close", cb: () => void): void;
  on(event: string, cb: (...args: any[]) => void): void {
    if (event === "data") {
      this.ws.onmessage = (e) => {
        cb(e.data);
      };
      return;
    }
    const funcname = ("on" + event) as keyof WebSocketStream;
    this[funcname] = cb;
  }

  write(data: Buffer): void {
    this.ws.send(data);
  }
}
```

This adapter converts WebSocket's message-based API to a stream-like interface that the TelnetParser expects.

### 1.3 Proxy Server Architecture

**CRITICAL INSIGHT:** Browsers cannot make raw TCP connections. Therefore, there MUST be a proxy server that:
1. Accepts WebSocket connections from browsers
2. Establishes raw TCP telnet connections to the actual MUD server
3. Bidirectionally forwards data between WebSocket and TCP

The proxy server is **not included in this repository**. It runs at `mongoose.moo.mud.org:8765` and handles the WebSocket-to-TCP translation.

Evidence from `telnet.ts` line 296:
```typescript
this.telnet.sendTerminalType("PROXY");
```

The client explicitly identifies itself as connecting via a proxy.

---

## 2. Connection Lifecycle

### 2.1 Initial Connection Sequence

**File:** `C:\Users\Q\code\react-client\src\client.ts` (lines 263-271, 277-297)

```typescript
this.ws.onopen = () => {
  this._connected = true;

  // Reset MIDI intentional disconnect flags when successfully reconnecting
  midiService.resetIntentionalDisconnectFlags();

  this.emit("connect");
  this.emit("connectionChange", true);
};

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
```

**Connection Flow:**
1. WebSocket opens → `_connected` flag set to `true`
2. Server sends `IAC WILL GMCP` → Client responds `IAC DO GMCP`
3. Client sends GMCP handshake:
   - `Core.Hello` with client name/version
   - `Core.Supports.Set` with list of supported GMCP packages
   - `Auth.Autologin.Login` with refresh token (if available)
4. Server sends `IAC DO TERMINAL_TYPE` → Client responds `IAC WILL TERMINAL_TYPE`
5. Client sends terminal type subnegotiations:
   - "Mongoose Client"
   - "ANSI" (supports ANSI color codes)
   - "PROXY" (indicates connection via proxy)

### 2.2 Disconnect Handling

**File:** `C:\Users\Q\code\react-client\src\client.ts` (lines 309-322, 328-352)

```typescript
this.ws.onclose = () => {
  this.cleanupConnection();
  // Only auto reconnect if it wasn't an intentional disconnect
  if (!this.intentionalDisconnect) {
    setTimeout(() => {
      this.connect();
    }, 10000);
  }
};

private cleanupConnection(): void {
  this._connected = false;
  this.mcpAuthKey = null;
  this.telnetBuffer = "";
  this.telnetNegotiation = false;
  this.currentRoomInfo = null;
  this.webRTCService.cleanup();
  this.fileTransferManager.cleanup();

  // Reset intentional disconnect flag after handling disconnect
  if (this.intentionalDisconnect) {
    this.intentionalDisconnect = false;
  }

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
```

**Reconnection Logic:**
- **Automatic reconnection:** If connection drops unexpectedly, wait 10 seconds and reconnect
- **Intentional disconnect:** If user manually closes connection, do NOT reconnect
- **State cleanup:** Clears MCP auth key, telnet buffers, room info, WebRTC, file transfers

### 2.3 Error Handling

**File:** `C:\Users\Q\code\react-client\src\client.ts` (lines 319-321)

```typescript
this.ws.onerror = (error: Event) => {
  this.emit("error", error);
};
```

Errors are emitted as events but don't have explicit handling beyond that. The `onclose` handler manages the reconnection.

---

## 3. Telnet Protocol Implementation

### 3.1 Protocol Parser State Machine

**File:** `C:\Users\Q\code\react-client\src\telnet.ts` (lines 111-164)

The parser implements a state machine with four states:

```typescript
enum TelnetState {
  DATA,           // Normal text data
  COMMAND,        // After IAC byte, reading command
  SUBNEGOTIATION, // Reading subnegotiation content
  NEGOTIATION,    // Reading option after WILL/WONT/DO/DONT
}
```

**Parser Flow:**

```typescript
public parse(data: Buffer) {
  this.buffer = Buffer.concat([this.buffer, Buffer.from(data)]);

  while (this.buffer.length > 0) {
    let done;
    switch (this.state) {
      case TelnetState.DATA:
        this.handleData();
        break;
      case TelnetState.COMMAND:
        done = this.handleCommand();
        if (done) return;
        break;
      case TelnetState.SUBNEGOTIATION:
        done = this.handleSubnegotiation();
        if (done) return;
        break;
      case TelnetState.NEGOTIATION:
        done = this.handleNegotiation();
        if (done) return;
        break;
    }
  }
}
```

**Key Design Features:**
- **Buffering:** Handles incomplete sequences that span multiple WebSocket messages
- **State preservation:** If insufficient data is available, parser returns and waits for more
- **Binary safe:** Uses Buffer throughout, not strings

### 3.2 IAC Sequence Handling

**File:** `C:\Users\Q\code\react-client\src\telnet.ts` (lines 4-77)

**IAC Commands Supported:**

```typescript
export enum TelnetCommand {
  SE = 240,    // End of subnegotiation parameters
  NOP = 241,   // No operation
  DM = 242,    // Data mark
  BRK = 243,   // Break
  IP = 244,    // Interrupt process
  AO = 245,    // Abort output
  AYT = 246,   // Are you there?
  EC = 247,    // Erase character
  EL = 248,    // Erase line
  GA = 249,    // Go ahead
  SB = 250,    // Subnegotiation begin
  WILL = 251,  // Will perform option
  WONT = 252,  // Won't perform option
  DO = 253,    // Do perform option
  DONT = 254,  // Don't perform option
  IAC = 255,   // Interpret as command
}
```

**Data Handling (lines 166-177):**

```typescript
private handleData() {
  const index = this.buffer.indexOf(TelnetCommand.IAC);
  if (index === -1) {
    // No IAC in buffer, emit all as data
    this.emit("data", this.buffer);
    this.buffer = Buffer.alloc(0);
    return;
  }

  // Emit data before IAC, then switch to COMMAND state
  this.emit("data", this.buffer.slice(0, index));
  this.buffer = this.buffer.slice(index);
  this.state = TelnetState.COMMAND;
}
```

### 3.3 Option Negotiation

**File:** `C:\Users\Q\code\react-client\src\telnet.ts` (lines 209-221)

```typescript
private handleNegotiation(): boolean {
  if (this.buffer.length < 1) {
    return true; // Need more data
  }

  const command = this.negotiationByte;
  const option = this.buffer[0];
  this.buffer = this.buffer.slice(1);

  this.emit("negotiation", command, option);
  this.state = TelnetState.DATA;
  return false;
}
```

**Negotiation Pattern:**
- Server sends `IAC WILL <option>` → Client decides whether to accept (DO) or reject (DONT)
- Server sends `IAC DO <option>` → Client decides whether to accept (WILL) or reject (WONT)

**Supported Options (lines 4-58):**

The client defines 55+ telnet options but actively negotiates only:
- **GMCP (201):** Generic MUD Communication Protocol
- **TERMINAL_TYPE (24):** Terminal type identification
- (Other options are defined but not actively used)

### 3.4 Subnegotiation Handling

**File:** `C:\Users\Q\code\react-client\src\telnet.ts` (lines 223-238)

```typescript
private handleSubnegotiation(): boolean {
  let index = this.buffer.indexOf(this.iacSEBuffer);
  if (index === -1) {
    return true; // Need more data
  }

  this.state = TelnetState.DATA;
  let sb = this.buffer.slice(0, index);
  if (sb[0] === TelnetOption.GMCP) {
    this.handleGmcp(sb.slice(1));
  } else {
    this.emit("subnegotiation", sb);
  }
  this.buffer = this.buffer.slice(index + 2);
  return false;
}
```

Subnegotiations use the pattern:
```
IAC SB <option> <data...> IAC SE
```

GMCP data is automatically parsed and emitted as a separate event.

### 3.5 GMCP Message Parsing

**File:** `C:\Users\Q\code\react-client\src\telnet.ts` (lines 240-244)

```typescript
private handleGmcp(data: Buffer) {
  const gmcpString = data.toString();
  const [gmcpPackage, dataString] = gmcpString.split(/ +(.+?)$/, 2);
  this.emit("gmcp", gmcpPackage, dataString);
}
```

GMCP messages have the format:
```
Package.Name {"json":"data"}
```

Example:
```
Room.Info {"name":"Town Square","exits":{"north":"#1234"}}
```

The parser splits on the first space to separate package name from JSON data.

---

## 4. Character Encoding

**File:** `C:\Users\Q\code\react-client\src\client.ts` (line 47, 374-375)

```typescript
private decoder = new TextDecoder("utf8");

private handleData(data: ArrayBuffer) {
  const decoded = this.decoder.decode(data).trimEnd();
```

**Encoding Scheme:**
- **Input:** UTF-8 decoding via `TextDecoder`
- **Output:** UTF-8 encoding (WebSocket default)
- **Telnet layer:** Binary safe (uses ArrayBuffer/Buffer)
- **Application layer:** UTF-8 strings

This is correct for modern MUDs that support UTF-8. Traditional telnet was ASCII/Latin-1, but UTF-8 is backward compatible with ASCII.

---

## 5. GMCP Protocol Layer

GMCP (Generic MUD Communication Protocol) is a telnet subnegotiation extension that allows structured data exchange using JSON.

### 5.1 GMCP Package Architecture

**File:** `C:\Users\Q\code\react-client\src\gmcp\package.ts`

```typescript
export class GMCPPackage {
  public readonly packageName!: string;
  public readonly packageVersion?: number = 1;
  protected readonly client: MudClient;

  sendData(messageName: string, data?: any): void {
    this.client.sendGmcp(
      this.packageName + "." + messageName,
      JSON.stringify(data)
    );
  }
}
```

**Package Registration (client.ts lines 245-250):**

```typescript
registerGMCPPackage<P extends GMCPPackage>(p: new (_: MudClient) => P): P {
  const gmcpPackage = new p(this);
  this.gmcpHandlers[gmcpPackage.packageName] = gmcpPackage;
  console.log("Registered GMCP Package:", gmcpPackage.packageName);
  return gmcpPackage;
}
```

### 5.2 GMCP Message Dispatch

**File:** `C:\Users\Q\code\react-client\src\client.ts` (lines 300-307, 445-487)

```typescript
this.telnet.on("gmcp", (packageName, data) => {
  console.log("GMCP Package:", packageName, data);
  try {
    this.handleGmcpData(packageName, data);
  } catch (e) {
    console.error("Calling GMCP:", e);
  }
});

private handleGmcpData(gmcpPackage: string, gmcpMessage: string) {
  const lastDot = gmcpPackage.lastIndexOf(".");
  const packageName = gmcpPackage.substring(0, lastDot);
  const messageType = gmcpPackage.substring(lastDot + 1);

  const handler = this.gmcpHandlers[packageName];
  if (!handler) {
    console.log("No handler for GMCP package:", packageName);
    return;
  }

  const messageHandler = (handler as any)["handle" + messageType];
  if (messageHandler) {
    const parsedData = JSON.parse(gmcpMessage || '{}');
    messageHandler.call(handler, parsedData);
  }
}
```

**Dispatch Pattern:**
1. Parse package name: `Room.Info` → package=`Room`, message=`Info`
2. Find handler: `gmcpHandlers["Room"]`
3. Call method: `handler.handleInfo(parsedData)`

### 5.3 Registered GMCP Packages

**File:** `C:\Users\Q\code\react-client\src\App.tsx` (lines 89-115)

The client registers 21 GMCP packages:

```typescript
newClient.registerGMCPPackage(GMCPCore);                    // Core.Hello, Core.Ping
newClient.registerGMCPPackage(GMCPCoreSupports);            // Core.Supports.Set
newClient.registerGMCPPackage(GMCPAutoLogin);               // Auth.Autologin.Login
newClient.registerGMCPPackage(GMCPClientMedia);             // Client.Media (audio)
newClient.registerGMCPPackage(GMCPClientMidi);              // Client.Midi (music)
newClient.registerGMCPPackage(GMCPClientSpeech);            // Client.Speech (TTS)
newClient.registerGMCPPackage(GMCPClientKeystrokes);        // Client.Keystrokes
newClient.registerGMCPPackage(GMCPClientHtml);              // Client.Html
newClient.registerGMCPPackage(GMCPClientFileTransfer);      // Client.FileTransfer
newClient.registerGMCPPackage(GMCPCommChannel);             // Comm.Channel
newClient.registerGMCPPackage(GMCPCommLiveKit);             // Comm.LiveKit (WebRTC)
newClient.registerGMCPPackage(GMCPChar);                    // Char (character info)
newClient.registerGMCPPackage(GMCPCharOffer);               // Char.Offer
newClient.registerGMCPPackage(GMCPCharPrompt);              // Char.Prompt
newClient.registerGMCPPackage(GMCPCharStatus);              // Char.Status
newClient.registerGMCPPackage(GMCPCharStatusAffectedBy);    // Char.Status.AffectedBy
newClient.registerGMCPPackage(GMCPCharStatusConditions);    // Char.Status.Conditions
newClient.registerGMCPPackage(GMCPCharStatusTimers);        // Char.Status.Timers
newClient.registerGMCPPackage(GMCPCharAfflictions);         // Char.Afflictions
newClient.registerGMCPPackage(GMCPCharDefences);            // Char.Defences
newClient.registerGMCPPackage(GMCPCharSkills);              // Char.Skills
newClient.registerGMCPPackage(GMCPCharItems);               // Char.Items
newClient.registerGMCPPackage(GMCPGroup);                   // Group
newClient.registerGMCPPackage(GMCPLogging);                 // Logging
newClient.registerGMCPPackage(GMCPRedirect);                // Redirect
newClient.registerGMCPPackage(GMCPRoom);                    // Room.Info
```

### 5.4 GMCP Core Protocol

**File:** `C:\Users\Q\code\react-client\src\gmcp\Core.ts`

```typescript
export class GMCPCore extends GMCPPackage {
  public packageName: string = "Core";

  sendHello(): void {
    this.sendData("Hello", { client: "Mongoose Client", version: "0.1" });
  }

  sendKeepAlive(): void {
    this.sendData("KeepAlive");
  }

  sendPing(avgPing?: number): void {
    this.sendData("Ping", avgPing);
  }

  handlePing(): void {
    console.log("Received Core.Ping response from server.");
    this.client.emit("corePing");
  }

  handleGoodbye(reason: string): void {
    console.log(`Server sent Core.Goodbye: ${reason}`);
    this.client.emit("coreGoodbye", reason);
  }
}

export class GMCPCoreSupports extends GMCPPackage {
  packageName = "Core.Supports";

  sendSet(): void {
    const packages = Object.values(this.client.gmcpHandlers)
      .filter(p => p.packageName && p.packageVersion && p.enabled)
      .map(p => `${p.packageName} ${p.packageVersion!.toString()}`);
    this.sendData("Set", packages);
  }

  sendAdd(packagesToAdd: { name: string; version: number }[]): void {
    const packageStrings = packagesToAdd.map(p => `${p.name} ${p.version}`);
    this.sendData("Add", packageStrings);
  }

  sendRemove(packagesToRemove: string[]): void {
    this.sendData("Remove", packagesToRemove);
  }
}
```

**Core.Supports.Set** tells the server which GMCP packages the client understands. This is sent during connection setup.

### 5.5 Auto-Login via GMCP

**File:** `C:\Users\Q\code\react-client\src\gmcp\Auth.ts`

```typescript
export class GMCPAutoLogin extends GMCPPackage {
  public packageName: string = "Auth.Autologin";

  handleToken(data: string): void {
    localStorage.setItem("LoginRefreshToken", data);
  }

  sendLogin(): void {
    var token = localStorage.getItem("LoginRefreshToken");
    if (token)
      this.sendData("Login", token);
  }
}
```

**Auto-login flow:**
1. Server sends `Auth.Autologin.Token <refresh_token>` after successful login
2. Client stores token in localStorage
3. On next connection, client sends `Auth.Autologin.Login <refresh_token>`
4. Server validates token and automatically logs user in

---

## 6. MCP Protocol Layer

MCP (MUD Client Protocol) is a text-based protocol that runs alongside telnet/GMCP. It uses specially formatted messages starting with `#$#`.

### 6.1 MCP Message Format

**File:** `C:\Users\Q\code\react-client\src\mcp.ts` (lines 15-43)

```typescript
export function parseMcpMessage(message: string): McpMessage | null {
  const parts = message.match(/^#\$#(\S+)(?:\s+(\S{6})\s+)?(.*)$/);
  if (!parts) {
    return null;
  }

  const name = parts[1];
  const authKey = parts[2];
  const keyvals: { [key: string]: string } = {};

  const keyvalRegex = /(\S+)\s*:\s*"([^"]*)"|(\S+)\s*:\s*(\S+)/g;
  let match;
  while ((match = keyvalRegex.exec(parts[3]))) {
    const key = match[1] || match[3];
    const value = match[2] || match[4];
    keyvals[key] = value;
  }

  return { name, authKey, keyvals };
}
```

**MCP Message Structure:**
```
#$#<message-name> <auth-key> <key1>: <value1> <key2>: <value2> ...
```

Example:
```
#$#dns-org-mud-moo-simpleedit-content abc123 reference: "player.description" type: "moo-code"
```

### 6.2 MCP Authentication

**File:** `C:\Users\Q\code\react-client\src\client.ts` (lines 410-420)

```typescript
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
}
```

**Authentication Flow:**
1. Server sends `#$#mcp` (no auth key)
2. Client generates random 6-character auth key
3. Client sends `#$#mcp authentication-key: <key> version: 2.1 to: 2.1`
4. All subsequent MCP messages include this auth key for validation

**Auth Key Generation (mcp.ts lines 67-69):**
```typescript
export function generateTag(): string {
  return (Math.random() + 1).toString(36).substring(3, 9);
}
```

### 6.3 MCP Package Negotiation

**File:** `C:\Users\Q\code\react-client\src\mcp.ts` (lines 105-131)

```typescript
export class McpNegotiate extends MCPPackage {
  public packageName = "mcp-negotiate";
  public minVersion = 2.0;
  public maxVersion = 2.0;

  sendNegotiate(): void {
    for (const p of Object.values(this.client.mcpHandlers)) {
      let minVersion = p.minVersion?.toFixed(1);
      let maxVersion = p.maxVersion?.toFixed(1);
      this.client.sendMcp("mcp-negotiate-can", {
        package: p.packageName,
        "min-version": minVersion,
        "max-version": maxVersion,
      });
    }
    this.client.sendCommand("#$#$mcp-negotiate-end");
  }
}
```

Client advertises which MCP packages it supports by sending `mcp-negotiate-can` for each package.

### 6.4 MCP Multiline Messages

**File:** `C:\Users\Q\code\react-client\src\client.ts` (lines 386-407)

MCP supports multiline data (like editor content) using special markers:

```
#$#message-name auth-key _data-tag: TAG123 ...
#$#* TAG123 content: "line 1"
#$#* TAG123 content: "line 2"
#$#: TAG123
```

**Multiline Parsing (mcp.ts lines 45-65):**

```typescript
export function parseMcpMultiline(message: string): McpMessage | null {
  const parts = message.match(
    /^#\$#\*\s(\S+)\s(\S+)\s*:\s*(.+)$|^#\$#:\s(\S+)$/
  );
  if (!parts) {
    return null;
  }

  const name = parts[1] || parts[4];  // Tag ID
  const key = parts[2];               // Usually "content"
  const val = parts[3];               // Line data
  const keyvals: { [key: string]: string } = {};
  keyvals[key] = val;
  return { name, authKey: undefined, keyvals };
}
```

### 6.5 Registered MCP Packages

**File:** `C:\Users\Q\code\react-client\src\App.tsx` (lines 117-120)

```typescript
newClient.registerMcpPackage(McpAwnsStatus);      // Status text display
newClient.registerMcpPackage(McpSimpleEdit);      // In-browser code editor
newClient.registerMcpPackage(McpVmooUserlist);    // Player list
newClient.registerMcpPackage(McpAwnsPing);        // Latency measurement
```

### 6.6 MCP Simple Edit (Code Editor)

**File:** `C:\Users\Q\code\react-client\src\mcp.ts` (lines 150-187)

```typescript
export class McpSimpleEdit extends MCPPackage {
  public packageName = "dns-org-mud-moo-simpleedit";
  private currentSession: EditorSession | null = null;

  handle(message: McpMessage): void {
    if (message.name === "dns-org-mud-moo-simpleedit-content") {
      this.currentSession = {
        name: message.keyvals["name"],
        reference: message.keyvals["reference"],
        type: message.keyvals["type"],
        contents: [],
      };
    }
  }

  handleMultiline(message: McpMessage): void {
    if (this.currentSession && "content" in message.keyvals) {
      this.currentSession.contents.push(message.keyvals["content"]);
    }
  }

  closeMultiline(closure: McpMessage): void {
    if (this.currentSession) {
      this.client.editors.openEditorWindow(this.currentSession);
      this.currentSession = null;
    }
  }
}
```

This allows the MUD server to send code (MOO code, descriptions, etc.) to the client for editing in a Monaco-based code editor.

---

## 7. Data Flow: User Input to Network

### 7.1 Command Sending

**File:** `C:\Users\Q\code\react-client\src\client.ts` (lines 354-364)

```typescript
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
```

**Flow:**
1. User types in input field → triggers `onSend` callback
2. `CommandInput` component calls `client.sendCommand(text)`
3. Optional local echo (shows command in output before server responds)
4. Optional autosay mode (prepends "say " to non-command input)
5. Append `\r\n` (carriage return + line feed, traditional telnet line ending)
6. Send via WebSocket

**Raw Send (client.ts lines 324-326):**

```typescript
public send(data: string) {
  this.ws.send(data);
}
```

### 7.2 GMCP Sending

**File:** `C:\Users\Q\code\react-client\src\client.ts` (lines 500-503)

```typescript
sendGmcp(packageName: string, data?: any) {
  console.log("Sending GMCP:", packageName, data);
  this.telnet.sendGmcp(packageName, data);
}
```

**File:** `C:\Users\Q\code\react-client\src\telnet.ts` (lines 250-260)

```typescript
sendGmcp(gmcpPackage: string, data: string) {
  const gmcpString = gmcpPackage + " " + data;
  const gmcpBuffer = Buffer.from(gmcpString);
  const buffer = Buffer.concat([
    Buffer.from([TelnetCommand.IAC, TelnetCommand.SB]),
    Buffer.from([TelnetOption.GMCP]),
    gmcpBuffer,
    this.iacSEBuffer,  // IAC SE
  ]);
  this.stream!.write(buffer);
}
```

Creates proper telnet subnegotiation: `IAC SB GMCP <package> <json> IAC SE`

### 7.3 MCP Sending

**File:** `C:\Users\Q\code\react-client\src\client.ts` (lines 505-534)

```typescript
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
```

---

## 8. Data Flow: Network to Display

### 8.1 Incoming Data Pipeline

**File:** `C:\Users\Q\code\react-client\src\client.ts` (lines 273-275, 374-384)

```typescript
this.telnet.on("data", (data: ArrayBuffer) => {
  this.handleData(data);
});

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
```

**Pipeline:**
1. WebSocket receives binary data
2. TelnetParser processes IAC sequences, extracts plain data
3. Plain data emitted as "data" event
4. `handleData` decodes UTF-8
5. Split by newlines
6. Check each line:
   - Starts with `#$#` → MCP message → `handleMcp()`
   - Otherwise → game text → `emitMessage()`

### 8.2 Message Emission to UI

**File:** `C:\Users\Q\code\react-client\src\client.ts` (lines 489-498)

```typescript
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
```

**UI Connection:**

The `OutputWindow` component listens to the "message" event:

```typescript
client.on("message", (line: string) => {
  // Parse ANSI codes and render to virtual list
});
```

---

## 9. Connection State Management

### 9.1 State Variables

**File:** `C:\Users\Q\code\react-client\src\client.ts` (lines 46-50, 58-63)

```typescript
private ws!: WebSocket;
private decoder = new TextDecoder("utf8");
private telnet!: TelnetParser;
private _connected: boolean = false;
private intentionalDisconnect: boolean = false;

private telnetNegotiation: boolean = false;
private telnetBuffer: string = "";
public mcpAuthKey: string | null = null;
```

**State Flags:**
- `_connected`: Connection is active
- `intentionalDisconnect`: User manually disconnected (prevents auto-reconnect)
- `telnetNegotiation`: Currently negotiating telnet options
- `mcpAuthKey`: Authentication key for MCP messages

### 9.2 State Events

The client emits events that React components subscribe to:

```typescript
this.emit("connect");              // Connected to server
this.emit("disconnect");           // Disconnected from server
this.emit("connectionChange", bool); // Connection state changed
this.emit("message", string);      // Game text received
this.emit("command", string);      // User command (local echo)
this.emit("error", Error);         // WebSocket error
this.emit("userlist", players[]);  // Player list updated (MCP)
this.emit("statustext", string);   // Status bar text (MCP)
```

---

## 10. Error Handling and Edge Cases

### 10.1 Incomplete Telnet Sequences

**File:** `C:\Users\Q\code\react-client\src\telnet.ts` (lines 135-164)

The parser handles incomplete sequences by maintaining internal buffer state:

```typescript
public parse(data: Buffer) {
  this.buffer = Buffer.concat([this.buffer, Buffer.from(data)]);

  while (this.buffer.length > 0) {
    let done;
    switch (this.state) {
      case TelnetState.COMMAND:
        done = this.handleCommand();
        if (done) {
          return; // Wait for more data
        }
        break;
```

**Test Case (telnet.test.ts lines 149-163):**

```typescript
it('should handle commands split across multiple buffers', async () => {
  const { telnet } = createTestSubject();
  const commands: number[] = [];
  telnet.on('command', (command) => {
    commands.push(command);
  });

  // Send IAC in first buffer
  telnet.parse(Buffer.from([TelnetCommand.IAC]));
  // Send NOP in second buffer
  telnet.parse(Buffer.from([TelnetCommand.NOP]));

  expect(commands).toEqual([TelnetCommand.NOP]);
});
```

### 10.2 Invalid MCP Messages

**File:** `C:\Users\Q\code\react-client\src\mcp.ts` (lines 15-24)

```typescript
export function parseMcpMessage(message: string): McpMessage | null {
  const parts = message.match(/^#\$#(\S+)(?:\s+(\S{6})\s+)?(.*)$/);
  if (!parts) {
    console.log(
      "Invalid message format: message must match the format '#$#name [authKey] keyval*'\nGot `" +
      message +
      "`"
    );
    return null;
  }
```

Invalid messages are logged but don't crash the client.

### 10.3 Invalid GMCP JSON

**File:** `C:\Users\Q\code\react-client\src\client.ts` (lines 463-482)

```typescript
try {
  const parsedData = JSON.parse(jsonStringToParse);
  messageHandler.call(handler, parsedData);
} catch (e) {
  console.error(`Error parsing GMCP JSON for ${packageName}.${messageType}:`, e);
  console.error("Attempted to parse:", jsonStringToParse);
}
```

JSON parse errors are caught and logged but don't crash the handler.

### 10.4 WebSocket Errors

**File:** `C:\Users\Q\code\react-client\src\client.ts` (lines 319-321)

```typescript
this.ws.onerror = (error: Event) => {
  this.emit("error", error);
};
```

Errors are emitted as events but there's no specific error recovery beyond the reconnection logic in `onclose`.

---

## 11. iOS Porting Considerations

### 11.1 WebSocket Support

**iOS Support:** ✅ GOOD
- iOS Safari and WKWebView have full WebSocket support
- No changes needed for basic connectivity

### 11.2 Binary Data Handling

**iOS Support:** ✅ GOOD
- `ArrayBuffer` fully supported in iOS
- `Buffer` polyfill (from `buffer` npm package) works in iOS

### 11.3 Text Encoding

**iOS Support:** ✅ GOOD
- `TextEncoder` and `TextDecoder` are supported in iOS 10.3+
- UTF-8 encoding/decoding will work without changes

### 11.4 Network Reliability

**iOS Challenges:** ⚠️ MODERATE

1. **Background connections:** iOS may close WebSocket when app backgrounds
   - **Solution:** Reconnection logic already exists (10-second auto-reconnect)
   - **Enhancement needed:** Detect app backgrounding/foregrounding
   - **Enhancement needed:** Pause reconnection attempts while backgrounded

2. **Network switching:** iOS may drop connections when switching WiFi/cellular
   - **Solution:** Already handled by reconnection logic
   - **Enhancement needed:** Detect network changes and reconnect faster

3. **Keep-alive:** iOS may kill idle connections
   - **Partial solution:** GMCP `Core.KeepAlive` exists but not actively used
   - **Enhancement needed:** Send periodic keep-alive messages

### 11.5 Recommended Enhancements for iOS

1. **Add app lifecycle detection:**
```typescript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // App backgrounded - pause reconnection attempts
  } else {
    // App foregrounded - resume/reconnect if needed
  }
});
```

2. **Implement keep-alive:**
```typescript
setInterval(() => {
  if (this._connected) {
    (this.gmcpHandlers["Core"] as GMCPCore).sendKeepAlive();
  }
}, 60000); // Every 60 seconds
```

3. **Network change detection:**
```typescript
window.addEventListener('online', () => {
  if (!this._connected) {
    this.connect(); // Reconnect immediately
  }
});
```

4. **Faster reconnection on network restore:**
- Current: 10-second fixed delay
- Better: Exponential backoff with immediate retry on network restore

---

## 12. Proxy Server Requirements (Not in Repository)

Based on the client code, the proxy server MUST:

1. **Accept WebSocket connections** on port 8765 with TLS (wss://)
2. **Establish TCP connections** to the actual MUD server (likely localhost or different port)
3. **Forward binary data bidirectionally** without modification
4. **Preserve telnet IAC sequences** (must handle binary data, not just text)
5. **Support concurrent connections** (multiple clients)
6. **Handle connection cleanup** properly when either side disconnects

**Likely implementation:** Node.js with `ws` package and `net` (TCP) package, or nginx stream proxy.

---

## 13. Security Considerations

### 13.1 TLS Encryption

✅ Connection uses `wss://` (WebSocket Secure)
- All data encrypted in transit between browser and proxy server
- Connection between proxy and MUD server likely unencrypted (local/trusted network)

### 13.2 MCP Authentication

⚠️ WEAK AUTHENTICATION
- 6-character random string (36^6 = ~2 billion possibilities)
- Transmitted in plaintext (inside encrypted WebSocket)
- No server-side verification beyond matching auth key
- **Risk:** MCP messages could be spoofed if auth key is guessed/intercepted
- **Mitigation:** TLS encryption prevents interception; short session lifetime limits exposure

### 13.3 GMCP Authentication

✅ Uses token-based refresh mechanism
- Server-generated tokens stored in localStorage
- Tokens validated server-side
- More secure than MCP auth

### 13.4 Input Validation

⚠️ LIMITED VALIDATION
- GMCP JSON parsing has try/catch
- MCP message parsing rejects malformed messages
- No sanitization of user input before sending to server (server's responsibility)

---

## 14. Performance Characteristics

### 14.1 Buffering Strategy

**Efficient:**
- Telnet parser uses single buffer that grows/shrinks as needed
- No unnecessary copying until data is ready to emit

**Test evidence (telnet.test.ts lines 99-117):**
```typescript
it('should handle incomplete subnegotiations', async () => {
  telnet.parse(Buffer.from([IAC, SB, 1, 2, 3]));
  expect(subnegotiations).toEqual([]); // No emission yet

  telnet.parse(Buffer.from([IAC, SE]));
  expect(subnegotiations.length).toBe(1); // Now emitted
});
```

### 14.2 Event Emission

**Reasonably efficient:**
- Events emitted once per complete line
- ANSI parsing happens in React components, not here
- Minimal string operations (mostly splitting)

### 14.3 Reconnection Delay

**Fixed 10-second delay** (client.ts line 314)
- Not ideal: could use exponential backoff
- Not terrible: prevents connection spam

---

## 15. Testing Coverage

### 15.1 Telnet Parser Tests

**File:** `C:\Users\Q\code\react-client\src\telnet.test.ts`

✅ Tested:
- Plain data passing
- Command handling (IAC NOP)
- Subnegotiation (IAC SB ... IAC SE)
- Option negotiation (IAC WILL/DO)
- GMCP message parsing
- Incomplete sequences (buffering)
- Multiple commands in one buffer
- Commands split across buffers

❌ Not tested:
- WebSocket connection lifecycle
- Reconnection logic
- MCP message handling
- GMCP handler dispatch
- Error recovery

---

## 16. Summary: Complete Data Flow

### User sends command:

1. User types "look" in input field
2. `CommandInput.onSend("look")` called
3. `client.sendCommand("look")`
4. Appends `\r\n` → `"look\r\n"`
5. `WebSocket.send("look\r\n")`
6. **WebSocket → Proxy Server → MUD Server**

### Server sends response:

1. **MUD Server → Proxy Server → WebSocket**
2. `WebSocket.onmessage` fires with ArrayBuffer
3. `WebSocketStream` emits "data" event
4. `TelnetParser.parse(buffer)`
   - Scans for IAC sequences
   - Processes GMCP subnegotiations
   - Emits clean text data
5. `client.handleData(data)`
   - Decodes UTF-8
   - Splits by newlines
   - Routes MCP vs. normal text
6. `client.emit("message", line)`
7. `OutputWindow` component receives message
8. ANSI parser converts to React elements
9. Virtualized list renders to screen

### GMCP message exchange:

**Client → Server:**
1. `gmcpHandler.sendData("Hello", {client: "...", version: "..."})`
2. Creates JSON string
3. `telnet.sendGmcp("Core.Hello", jsonString)`
4. Creates buffer: `IAC SB GMCP "Core.Hello {...}" IAC SE`
5. Sends via WebSocket

**Server → Client:**
1. WebSocket receives buffer with IAC SB GMCP
2. `TelnetParser.handleSubnegotiation()`
3. Detects option = GMCP
4. `TelnetParser.handleGmcp(data)`
5. Splits into package name + JSON
6. `telnet.emit("gmcp", "Room.Info", "{...}")`
7. `client.handleGmcpData("Room.Info", "{...}")`
8. Splits into package ("Room") + message ("Info")
9. Finds `gmcpHandlers["Room"]`
10. Calls `handler.handleInfo(parsedJSON)`
11. Handler processes data and emits events

---

## Conclusion

This MUD client implements a **three-layer protocol stack**:

1. **Transport Layer:** WebSocket Secure (wss://) with proxy server bridging to TCP
2. **Telnet Layer:** Full IAC/negotiation/subnegotiation support with binary safety
3. **Application Layers:**
   - **GMCP:** Structured JSON data for game state, UI, media, voice chat
   - **MCP:** Text-based protocol for editors, userlist, status messages

The architecture is **well-designed for web browsers** but requires a proxy server to bridge WebSocket to raw telnet. The telnet parser is **robust and handles edge cases** like incomplete sequences. Reconnection logic exists but could be improved for mobile (iOS) with app lifecycle awareness and smarter backoff strategies.

**For iOS porting:** The networking code will work with minimal changes, but adding app lifecycle hooks and network change detection will significantly improve the mobile experience.

