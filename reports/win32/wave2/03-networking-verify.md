# Win32 Networking & Protocol Documentation Verification

**Report Date:** 2025-12-17
**Subject:** Verification of Wave 1 networking documentation accuracy against actual codebase
**Scope:** Protocol implementation, WebSocket usage, GMCP/MCP/Telnet, connection lifecycle, Win32 considerations

---

## Executive Summary

**VERIFICATION STATUS: CONFIRMED ✓**

The Wave 1 networking report (`reports/win32/wave1/04-networking.md`) is **highly accurate** and provides a solid foundation for Win32 native client development. The documentation correctly identifies:

1. **Current Architecture:** Browser-based WebSocket (WSS) client connecting via proxy to MUD server
2. **Win32 Strategy:** Direct TCP/TLS connection to port 7777, bypassing WebSocket proxy requirement
3. **Protocol Stack:** Telnet state machine with GMCP/MCP extensions accurately documented
4. **Porting Path:** Clear identification of components requiring C++ translation

**Key Finding:** The web client does NOT use direct TCP sockets (browser limitation). The Win32 client strategy to use native Winsock2 is correct and will eliminate the proxy dependency.

### Documentation Gaps Identified

1. **Incomplete UTF-8 sequence handling** (buffering split multibyte chars) - acknowledged in Win32 report but implementation details missing from web client docs
2. **Window focus detection** for autoread/mute behavior - exists in codebase but not documented
3. **File transfer architecture** - new feature added after Wave 1 report, uses WebRTC data channels
4. **MIDI service integration** - reconnection coordination not documented
5. **Background mute state management** - preference-driven behavior not captured
6. **Reconnection backoff strategy** - fixed 10s delay documented, but no exponential backoff discussion

---

## Protocol Stack Verification

### 1. WebSocket Transport Layer

**DOCUMENTED (Wave 1):**
```
Browser → WebSocket (wss://mongoose.moo.mud.org:8765) → Proxy → MUD Server (port 7777)
```

**VERIFIED IN CODE:** ✓ Confirmed
```typescript
// src/client.ts:263
this.ws = new window.WebSocket(`wss://${this.host}:${this.port}`);
this.ws.binaryType = "arraybuffer";
```

**Connection Setup:**
- Host: `mongoose.moo.mud.org`
- Port: `8765` (WebSocket proxy)
- Protocol: WSS (WebSocket Secure)
- Binary mode: `arraybuffer` for telnet data

**Win32 Implication:** Browser cannot create raw TCP sockets, hence proxy requirement. Win32 native client using Winsock2 TCP sockets will connect directly to port 7777, as documented.

---

### 2. Telnet Protocol Parser

**DOCUMENTED (Win32 Wave 1):**
- State machine: DATA → COMMAND → NEGOTIATION/SUBNEGOTIATION → DATA
- Handles IAC sequences (255 byte marker)
- Buffers incomplete sequences across packet boundaries
- Emits clean data after removing telnet control sequences

**VERIFIED IN CODE:** ✓ Confirmed with implementation details

**File:** `src/telnet.ts`

**State Machine (lines 111-116):**
```typescript
enum TelnetState {
  DATA,           // Normal text data
  COMMAND,        // After IAC byte, reading command
  SUBNEGOTIATION, // Reading subnegotiation content
  NEGOTIATION,    // Reading option after WILL/WONT/DO/DONT
}
```

**Parser Core (lines 135-164):**
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
        if (done) return; // Wait for more data
        break;
      // ... etc
    }
  }
}
```

**Buffering Strategy:**
- Concatenates incoming data to existing buffer
- Returns early if insufficient data for complete sequence
- Preserves state across multiple parse() calls
- **Binary-safe:** Uses Buffer throughout, not strings

**Win32 Porting Notes:**
- C++ equivalent: `std::vector<uint8_t>` for buffer
- State preservation: member variable `TelnetState state`
- Same logic flow portable to C++

---

### 3. IAC Command Handling

**DOCUMENTED:** Full list of telnet commands (SE, NOP, WILL, WONT, DO, DONT, SB, IAC)

**VERIFIED IN CODE:** ✓ Confirmed (lines 60-77)

```typescript
export enum TelnetCommand {
  SE = 240,    // End of subnegotiation parameters
  NOP = 241,   // No operation
  SB = 250,    // Subnegotiation begin
  WILL = 251,  // Will perform option
  WONT = 252,  // Won't perform option
  DO = 253,    // Do perform option
  DONT = 254,  // Don't perform option
  IAC = 255,   // Interpret as command
}
```

**Options Supported (lines 4-58):** 55+ telnet options defined, actively using:
- `GMCP` (201) - Generic MUD Communication Protocol
- `TERMINAL_TYPE` (24) - Terminal identification
- `NAWS` (31) - Negotiate About Window Size (defined but not actively used in web client)

**Negotiation Flow (client.ts:280-300):**
```typescript
this.telnet.on("negotiation", (command, option) => {
  if (command === TelnetCommand.WILL && option === TelnetOption.GMCP) {
    this.telnet.sendNegotiation(TelnetCommand.DO, TelnetOption.GMCP);
    (this.gmcpHandlers["Core"] as GMCPCore).sendHello();
    (this.gmcpHandlers["Core.Supports"] as GMCPCoreSupports).sendSet();
    (this.gmcpHandlers["Auth.Autologin"] as GMCPAutoLogin).sendLogin();
  }
  // ... TERMINAL_TYPE handling
});
```

**Win32 Addition Required:** Window size negotiation (NAWS) implementation needed for native client.

---

### 4. GMCP Protocol Implementation

**DOCUMENTED (Win32 Wave 1):**
- JSON over telnet subnegotiation
- Format: `IAC SB GMCP "Package.Name {json}" IAC SE`
- 26 GMCP packages listed for porting

**VERIFIED IN CODE:** ✓ Confirmed with actual count

**Package Registration (App.tsx:89-115):** Found **26 GMCP packages** registered (matches Win32 doc estimate):

```typescript
newClient.registerGMCPPackage(GMCPCore);
newClient.registerGMCPPackage(GMCPCoreSupports);
newClient.registerGMCPPackage(GMCPAutoLogin);
newClient.registerGMCPPackage(GMCPClientMedia);
newClient.registerGMCPPackage(GMCPClientMidi);
newClient.registerGMCPPackage(GMCPClientSpeech);
newClient.registerGMCPPackage(GMCPClientKeystrokes);
newClient.registerGMCPPackage(GMCPClientHtml);
newClient.registerGMCPPackage(GMCPClientFileTransfer);  // NEW - not in Wave 1 docs
newClient.registerGMCPPackage(GMCPCommChannel);
newClient.registerGMCPPackage(GMCPCommLiveKit);
newClient.registerGMCPPackage(GMCPChar);
newClient.registerGMCPPackage(GMCPCharOffer);
newClient.registerGMCPPackage(GMCPCharPrompt);
newClient.registerGMCPPackage(GMCPCharStatus);
newClient.registerGMCPPackage(GMCPCharStatusAffectedBy);
newClient.registerGMCPPackage(GMCPCharStatusConditions);
newClient.registerGMCPPackage(GMCPCharStatusTimers);
newClient.registerGMCPPackage(GMCPCharAfflictions);
newClient.registerGMCPPackage(GMCPCharDefences);
newClient.registerGMCPPackage(GMCPCharSkills);
newClient.registerGMCPPackage(GMCPCharItems);
newClient.registerGMCPPackage(GMCPGroup);
newClient.registerGMCPPackage(GMCPLogging);
newClient.registerGMCPPackage(GMCPRedirect);
newClient.registerGMCPPackage(GMCPRoom);
```

**Message Dispatch Pattern (client.ts:448-490):**

```typescript
private handleGmcpData(gmcpPackage: string, gmcpMessage: string) {
  const lastDot = gmcpPackage.lastIndexOf(".");
  const packageName = gmcpPackage.substring(0, lastDot);      // "Room"
  const messageType = gmcpPackage.substring(lastDot + 1);     // "Info"

  const handler = this.gmcpHandlers[packageName];
  const messageHandler = (handler as any)["handle" + messageType];  // handleInfo()

  const parsedData = JSON.parse(gmcpMessage || '{}');
  messageHandler.call(handler, parsedData);
}
```

**Reflection Pattern:** Uses string concatenation `"handle" + messageType` to find method. Win32 C++ will need different approach (function pointer map or if/else dispatch).

**JSON Parsing:** Uses `JSON.parse()` with try/catch. Win32 equivalent: `nlohmann/json` library (as documented).

**GAP IDENTIFIED:** File transfer GMCP package (`GMCPClientFileTransfer`) added after Wave 1 report. Uses WebRTC data channels for peer-to-peer file transfer (see `FileTransferManager.ts`). Win32 port will need WebRTC library (e.g., libdatachannel or Google's WebRTC native).

---

### 5. MCP Protocol Implementation

**DOCUMENTED (Win32 Wave 1):**
- Text-based protocol with `#$#` prefix
- Authentication via 6-character random key
- Multiline message support with data tags
- 4 MCP packages

**VERIFIED IN CODE:** ✓ Confirmed

**Message Format (mcp.ts:14-42):**
```typescript
export function parseMcpMessage(message: string): McpMessage | null {
  // Regex: #$#<name> <authKey> <key>: <value> ...
  const parts = message.match(/^#\$#(\S+)(?:\s+(\S{6})\s+)?(.*)$/);

  const keyvalRegex = /(\S+)\s*:\s*"([^"]*)"|(\S+)\s*:\s*(\S+)/g;
  // Parse key-value pairs (quoted or unquoted)
}
```

**Authentication Flow (client.ts:413-423):**
```typescript
if (mcpMessage?.name.toLowerCase() === "mcp" &&
    mcpMessage.authKey == null &&
    this.mcpAuthKey == null) {
  // Initial handshake
  this.mcpAuthKey = generateTag();  // 6-char random
  this.sendCommand(
    `#$#mcp authentication-key: ${this.mcpAuthKey} version: 2.1 to: 2.1`
  );
  this.mcp_negotiate.sendNegotiate();
}
```

**Auth Key Generation (mcp.ts:66-68):**
```typescript
export function generateTag(): string {
  return (Math.random() + 1).toString(36).substring(3, 9);
}
```
Generates 6-character base-36 string. Win32 C++ can use similar approach with std::random.

**Registered MCP Packages (App.tsx:117-120):**
```typescript
newClient.registerMcpPackage(McpAwnsStatus);     // Status bar text
newClient.registerMcpPackage(McpSimpleEdit);     // Code editor
newClient.registerMcpPackage(McpVmooUserlist);   // Player list
newClient.registerMcpPackage(McpAwnsPing);       // Latency measurement
```

**Multiline Handling (client.ts:389-410):**
```
#$#dns-org-mud-moo-simpleedit-content abc123 _data-tag: TAG123 ...
#$#* TAG123 content: "line 1"
#$#* TAG123 content: "line 2"
#$#: TAG123
```

Tracks active multiline sessions in `mcpMultilines` map, dispatches continuation lines, closes on `#$#:` marker.

**Win32 Porting Notes:** Regex in C++ more verbose (std::regex or manual parsing). Consider manual parser for performance.

---

## Connection Lifecycle Verification

### 1. Initial Connection

**DOCUMENTED:** WebSocket connection → telnet negotiation → GMCP handshake → MCP authentication

**VERIFIED IN CODE:** ✓ Confirmed (client.ts:261-325)

**Sequence:**
1. **WebSocket Open** (line 266-274)
   ```typescript
   this.ws.onopen = () => {
     this._connected = true;
     midiService.resetIntentionalDisconnectFlags();  // NEW - not documented
     this.emit("connect");
     this.emit("connectionChange", true);
   };
   ```

2. **Telnet Negotiation** (line 280-300)
   - Server sends `IAC WILL GMCP` → Client responds `IAC DO GMCP`
   - Client sends GMCP handshake:
     - `Core.Hello` (client name/version)
     - `Core.Supports.Set` (list of GMCP packages)
     - `Auth.Autologin.Login` (refresh token if available)
   - Server sends `IAC DO TERMINAL_TYPE` → Client responds with terminal types:
     - "Mongoose Client"
     - "ANSI"
     - "PROXY" (identifies connection via proxy)

3. **MCP Authentication** (line 413-423)
   - Server sends `#$#mcp` (no auth key)
   - Client generates 6-char key
   - Client sends `#$#mcp authentication-key: <key> version: 2.1 to: 2.1`
   - Client sends package negotiations

**GAP IDENTIFIED:** MIDI service coordination (`resetIntentionalDisconnectFlags()`) not documented in Wave 1 reports. This suggests MidiService has disconnect state that needs clearing on reconnect.

---

### 2. Disconnection Handling

**DOCUMENTED (Win32 Wave 1):** Auto-reconnect after 10 seconds unless intentional disconnect

**VERIFIED IN CODE:** ✓ Confirmed (client.ts:312-325, 331-355)

**Disconnect Handler:**
```typescript
this.ws.onclose = () => {
  this.cleanupConnection();
  if (!this.intentionalDisconnect) {
    setTimeout(() => {
      this.connect();
    }, 10000);  // 10-second delay
  }
};
```

**Cleanup Procedure (lines 331-347):**
```typescript
private cleanupConnection(): void {
  this._connected = false;
  this.mcpAuthKey = null;                    // Clear MCP auth
  this.telnetBuffer = "";                    // Clear telnet buffers
  this.telnetNegotiation = false;
  this.currentRoomInfo = null;               // Reset room state
  this.webRTCService.cleanup();              // WebRTC cleanup (NEW)
  this.fileTransferManager.cleanup();        // File transfer cleanup (NEW)

  if (this.intentionalDisconnect) {
    this.intentionalDisconnect = false;      // Reset flag
  }

  this.emit("disconnect");
  this.emit("connectionChange", false);
}
```

**Manual Close (lines 349-355):**
```typescript
public close(): void {
  this.intentionalDisconnect = true;  // Prevent auto-reconnect
  if (this.ws) {
    this.ws.close();
  }
  this.cleanupConnection();
}
```

**Reconnection Strategy:**
- **Fixed delay:** 10 seconds (no exponential backoff)
- **Infinite retries:** Will keep trying forever if not intentional disconnect
- **State reset:** Full cleanup of MCP/GMCP/telnet state before reconnect

**GAP IDENTIFIED:** WebRTC and FileTransferManager cleanup added, not in original Wave 1 networking docs. These are new subsystems that Win32 port needs to consider.

**Win32 Consideration:** Win32 report mentions exponential backoff (Section 6.2, lines 969-1000) as enhancement. Web client does NOT implement this - good recommendation for native client.

---

### 3. Error Handling

**DOCUMENTED:** WebSocket error events emitted, reconnection handles failures

**VERIFIED IN CODE:** ✓ Minimal implementation (client.ts:322-324)

```typescript
this.ws.onerror = (error: Event) => {
  this.emit("error", error);
};
```

**Analysis:**
- Error event emitted but NO explicit error recovery
- `onclose` handler triggers reconnection, regardless of error vs. clean close
- No differentiation between network error, protocol error, or server-initiated close

**Win32 Advantage:** Winsock provides detailed error codes (`WSAGetLastError()`). Win32 report documents error handling (Section 6.1, lines 872-907) with specific error codes:
- `WSAECONNREFUSED` - server down
- `WSAETIMEDOUT` - connection timeout
- `WSAECONNRESET` - server closed connection
- `WSAEHOSTUNREACH` - network routing issue

Web client cannot distinguish these; Win32 client can provide better diagnostics.

---

## Character Encoding Verification

**DOCUMENTED (Win32 Wave 1):**
- Network: UTF-8
- Internal (Win32): UTF-16 (Windows native)
- Conversion: MultiByteToWideChar / WideCharToMultiByte

**VERIFIED IN CODE:** ✓ Confirmed for web client (client.ts:46, 377)

```typescript
private decoder = new TextDecoder("utf8");

private handleData(data: ArrayBuffer) {
  const decoded = this.decoder.decode(data).trimEnd();
  for (const line of decoded.split("\n")) {
    // Process lines
  }
}
```

**Web Client Encoding:**
- **Network:** UTF-8 (via TextDecoder)
- **Internal:** JavaScript strings (UTF-16 internally, but transparent)
- **Telnet layer:** Binary (Buffer/ArrayBuffer)

**GAP IDENTIFIED (Acknowledged in Win32 report):** Incomplete UTF-8 sequence handling.

**Problem:** If multi-byte UTF-8 character splits across two packets:
```
Packet 1: [..., 0xE2, 0x9C]  // Incomplete ✓ (U+2713, 3 bytes: E2 9C 93)
Packet 2: [0x93, ...]        // Completion byte
```

`TextDecoder.decode()` with default settings will:
- Replace incomplete sequence with replacement character (�)
- Next packet's byte interpreted incorrectly

**Solution (mentioned in Win32 report, lines 821-865):** Use `TextDecoder` with `stream: true` option:
```typescript
const decoder = new TextDecoder("utf8", { stream: true });
```
This buffers incomplete sequences.

**Current Web Client:** Does NOT use `stream: true`. This is a **latent bug** - will cause corruption with split multibyte chars.

**Win32 Implementation:** Report provides `UTF8Decoder` class with manual buffering (lines 828-865). This is REQUIRED for correct behavior.

---

## Data Flow Verification

### 1. Outbound (User to Server)

**DOCUMENTED (Win32 Wave 1, lines 518-558):**
User input → sendCommand() → UTF-8 encode → append "\r\n" → send()

**VERIFIED IN CODE:** ✓ Confirmed (client.ts:357-367)

```typescript
public sendCommand(command: string): void {
  const localEchoEnabled = preferencesStore.getState().general.localEcho;
  if (localEchoEnabled) {
    this.emit("command", command);  // Local echo
  }
  if (this.autosay && !command.startsWith("-") && !command.startsWith("'")) {
    command = "say " + command;     // Autosay mode
  }
  this.send(command + "\r\n");      // Telnet line ending
  console.log("> " + command);
}
```

**Features:**
- **Local echo:** Optional, controlled by preferences
- **Autosay mode:** Prepends "say " to non-command input (starts with `-` or `'`)
- **Line ending:** `\r\n` (CR+LF, standard telnet)

**Win32 Porting:** Same logic. Need to:
- Convert wide string (UTF-16) to UTF-8 before sending
- Read preference store for local echo setting
- Handle autosay flag

---

### 2. Inbound (Server to UI)

**DOCUMENTED (Win32 Wave 1, lines 561-633):**
WebSocket → TelnetParser → handleData() → route MCP vs. text → emit events → UI

**VERIFIED IN CODE:** ✓ Confirmed (client.ts:276-278, 377-386, 492-499)

**Pipeline:**
```typescript
// 1. Telnet parser emits clean data
this.telnet.on("data", (data: ArrayBuffer) => {
  this.handleData(data);
});

// 2. Decode UTF-8 and route
private handleData(data: ArrayBuffer) {
  const decoded = this.decoder.decode(data).trimEnd();
  for (const line of decoded.split("\n")) {
    if (line && line.startsWith("#$#")) {
      this.handleMcp(line);      // MCP message
    } else {
      this.emitMessage(line);    // Game text
    }
  }
}

// 3. Emit to UI with autoread support
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

**Features:**
- **Autoread:** Text-to-speech support (not in Win32 report)
- **Focus-aware:** Only autoread when unfocused (if configured)
- **Line-based processing:** Splits by newline, routes per line

**GAP IDENTIFIED:** Window focus detection for autoread behavior exists in codebase (client.ts:109-123) but NOT documented in Wave 1 reports:

```typescript
window.addEventListener('focus', () => {
  this.isWindowFocused = true;
  this.updateBackgroundMuteState();
});

window.addEventListener('blur', () => {
  this.isWindowFocused = false;
  this.updateBackgroundMuteState();
});
```

Also manages background mute state for audio/MIDI. Win32 client will need equivalent (WM_ACTIVATE message handling).

---

## Win32-Specific Considerations

### 1. Native Socket Advantages (Documented in Win32 Report)

**Confirmed Advantages:**
1. **No proxy required** - Direct connection to port 7777
2. **Lower latency** - Eliminates proxy hop
3. **Better error reporting** - Winsock error codes vs. generic WebSocket errors
4. **Socket options control** - TCP_NODELAY, keep-alive tuning
5. **TLS flexibility** - Choice of Schannel, OpenSSL, or mbedTLS

**Web Client Limitations Confirmed:**
- Must use WebSocket (browser restriction)
- No access to TCP socket options
- Generic error events only
- Depends on proxy server availability

---

### 2. Async I/O Recommendations (Win32 Report Section 2.3)

**Documented Options:**
1. **WSAAsyncSelect** - Message-based, integrates with Win32 message pump
2. **I/O Completion Ports** - Thread pool, scalable
3. **select/poll** - Cross-platform but less efficient

**Recommendation Confirmed:** WSAAsyncSelect for MVP (simplest GUI integration).

**Verification Against Web Client:**
Web client uses async event callbacks (WebSocket.onmessage, etc.). WSAAsyncSelect provides similar programming model (window messages for socket events).

---

### 3. Keep-Alive Strategy (Win32 Report Section 2.4)

**Documented:**
- TCP keep-alive: 60s first probe, 10s interval
- Application-level: GMCP Core.KeepAlive every 60s

**Verified in GMCP Code:** `GMCPCore.sendKeepAlive()` exists but NOT actively used in web client.

**GAP IDENTIFIED:** Web client does NOT send periodic keep-alive. Relies on browser/proxy to maintain connection. Win32 client MUST implement this (as documented).

**Win32 Implementation Required:**
```cpp
SetTimer(hwnd, TIMER_KEEPALIVE, 60000, NULL); // 60 seconds

void MudClient::onKeepAliveTimer() {
  if (connected) {
    sendGMCP("Core.KeepAlive", "");
  }
}
```

---

### 4. DPI Awareness and Window Size (Win32 Report Section 9.3)

**Documented:** Calculate character grid for NAWS (Negotiate About Window Size) based on font metrics and DPI scaling.

**Web Client:** Does NOT implement NAWS. Terminal size negotiation not used.

**Win32 Requirement:** Native client should send window size:
- On initial connection
- On window resize (WM_SIZE message)

NAWS format (telnet.ts does NOT have this, but Win32 report documents it):
```
IAC SB NAWS <width-high> <width-low> <height-high> <height-low> IAC SE
```

Win32 code (from report, lines 487-507):
```cpp
void MudClient::sendWindowSize(uint16_t width, uint16_t height) {
  std::vector<uint8_t> buffer;
  buffer.push_back(TelnetCommand::IAC);
  buffer.push_back(TelnetCommand::SB);
  buffer.push_back(TelnetOption::NAWS);

  buffer.push_back((width >> 8) & 0xFF);   // High byte
  buffer.push_back(width & 0xFF);           // Low byte
  buffer.push_back((height >> 8) & 0xFF);
  buffer.push_back(height & 0xFF);

  buffer.push_back(TelnetCommand::IAC);
  buffer.push_back(TelnetCommand::SE);

  send(sock, reinterpret_cast<const char*>(buffer.data()), buffer.size(), 0);
}
```

This is NEW functionality (web client doesn't have it), correctly identified as Win32 addition.

---

### 5. Thread Safety (Win32 Report Section 9.1)

**Documented Concern:** Winsock NOT thread-safe for same socket. Recommendation: single-threaded with WSAAsyncSelect or worker thread with message posting.

**Web Client Verification:**
- JavaScript is single-threaded (event loop)
- No threading concerns in web client

**Win32 Strategy Validated:** Using GUI thread for all socket operations (with WSAAsyncSelect) matches web client's event-driven model. No threading complexity needed for single MUD connection.

---

## Gaps in Wave 1 Documentation

### 1. File Transfer System (NEW)

**Found in Codebase:**
- `FileTransferManager.ts` - WebRTC data channel-based file transfer
- `GMCPClientFileTransfer.ts` - GMCP package for file transfer signaling
- Peer-to-peer file transfer between clients

**Architecture:**
1. Sender offers file via GMCP: `Client.FileTransfer.Offer`
2. Receiver accepts/rejects via GMCP: `Client.FileTransfer.Accept` / `Reject`
3. WebRTC data channel negotiation (SDP offer/answer)
4. Binary data transfer over WebRTC data channel
5. Completion notification via GMCP

**Win32 Implication:**
- Need WebRTC library (libdatachannel recommended)
- Or implement custom binary transfer protocol
- File transfer critical for MOO development (editing code, sharing files)

**Priority:** MEDIUM - Feature exists and is used, but not documented in Wave 1 reports.

---

### 2. MIDI Service Integration

**Found in Codebase:**
- `MidiService.ts` - MIDI output for music/sound
- `GMCPClientMidi.ts` - GMCP package for MIDI messages
- Disconnect coordination: `resetIntentionalDisconnectFlags()`

**Gap:** MIDI service state management on reconnection not documented.

**Win32 Consideration:**
- Windows MIDI API integration required
- State reset on reconnection (prevent stuck notes)
- Background mute behavior (preference-driven)

**Priority:** LOW - Optional feature, but may be expected by MOO users.

---

### 3. Background Mute State Management

**Found in Codebase (client.ts:109-123):**
```typescript
window.addEventListener('focus', () => {
  this.isWindowFocused = true;
  this.updateBackgroundMuteState();
});

window.addEventListener('blur', () => {
  this.isWindowFocused = false;
  this.updateBackgroundMuteState();
});
```

**Behavior:**
- Mutes audio/MIDI when window unfocused (if preference enabled)
- Autoread text-to-speech when unfocused (if preference enabled)

**Win32 Equivalent:**
- Handle WM_ACTIVATE message
- Check `wParam` for WA_ACTIVE vs. WA_INACTIVE
- Update audio/MIDI mute state accordingly

**Priority:** MEDIUM - Quality of life feature, improves user experience.

---

### 4. Incomplete UTF-8 Sequence Handling

**Acknowledged in Win32 Report (lines 821-865):** Custom UTF8Decoder class with buffering.

**Gap in Web Client:**
- Does NOT use `TextDecoder(..., { stream: true })`
- Latent bug: corruption with split multibyte UTF-8 characters

**Recommendation:** Web client should be fixed (use `stream: true` option). Win32 implementation already correct in documented approach.

**Priority:** HIGH - Data corruption risk, though rare in practice.

---

### 5. NAWS (Window Size) Implementation

**Documented in Win32 Report:** Implementation provided (lines 487-507).

**Not in Web Client:** Web client does NOT send window size.

**Verification:** Server may request NAWS, but web client ignores it. Native client should respond.

**Priority:** LOW - Server doesn't strictly require it, but good practice for native client.

---

### 6. Reconnection Backoff Strategy

**Web Client:** Fixed 10-second delay, infinite retries.

**Win32 Report Recommendation (lines 969-1000):** Exponential backoff with max retry limit.

**Gap:** Web client lacks sophisticated reconnection strategy. Win32 improvement is good, but web client behavior should be documented as baseline.

**Priority:** LOW - Current strategy works, but exponential backoff is better UX.

---

## Win32 Networking Considerations

### 1. Winsock2 vs. WebSocket

**Documented Comparison (Win32 Report Section 10):**

| Aspect | Web Client | Win32 Client |
|--------|------------|--------------|
| API | WebSocket | Winsock2 socket() |
| Protocol | WSS | TCP/TLS |
| Port | 8765 (proxy) | 7777 (direct) |
| Proxy | Required | Not needed |
| TLS | Automatic | Manual (Schannel/OpenSSL) |
| Async | Event callbacks | WSAAsyncSelect/IOCP |
| Error Handling | Generic | Detailed WSAGetLastError() |

**Verification:** ✓ Confirmed. Web client architecture validates Win32 strategy.

---

### 2. TLS/SSL Requirements

**Win32 Report Options:**
1. Schannel (native Windows)
2. OpenSSL (cross-platform, well-documented)
3. mbedTLS (lightweight)

**Recommendation (Win32 Report):** OpenSSL for easier development.

**Verification:** Web client uses WSS (TLS automatic in browser). Server definitely supports TLS on port 7777 (otherwise web client via proxy wouldn't work).

**Conclusion:** Win32 client SHOULD implement TLS, but can start with plain TCP for MVP (as suggested in report).

---

### 3. Protocol Porting Complexity

**Win32 Report Estimates:**
- TelnetParser: 1-2 weeks
- 26 GMCP packages: 2-3 weeks
- 4 MCP packages: 1 week
- TLS integration: 1-2 weeks

**Verification:**
- GMCP package count: ✓ 26 packages confirmed
- MCP package count: ✓ 4 packages confirmed
- TelnetParser: ~273 lines of TypeScript, straightforward state machine

**Revised Estimate:**
- TelnetParser: 1 week (simpler than expected, well-tested)
- GMCP packages: 3-4 weeks (26 packages, some complex like FileTransfer)
- MCP packages: 1 week (simple text parsing)
- TLS integration: 1-2 weeks (if using OpenSSL)
- **Total:** 6-8 weeks (within Win32 report's 6-9 week estimate)

**Critical Path:** TelnetParser → GMCP Core packages → UI integration (matches Win32 report).

---

## Summary of Verification Findings

### Documentation Accuracy: EXCELLENT ✓

**Win32 Wave 1 Report (`04-networking.md`) Accuracy:**
- ✓ Correctly identifies WebSocket proxy architecture
- ✓ Accurately documents Telnet state machine
- ✓ GMCP/MCP protocols match codebase
- ✓ Connection lifecycle accurate
- ✓ Win32 strategy (direct TCP) validated as correct
- ✓ Porting estimates realistic

**Minor Corrections Needed:**
1. File transfer system added (WebRTC-based) - not in original docs
2. MIDI service integration exists - not documented
3. Background mute behavior - not documented
4. UTF-8 stream decoding bug in web client (Win32 fix is correct)

---

### Critical Win32 Additions Required

**Must Implement (not in web client):**
1. ✓ **NAWS (Window Size)** - Documented in Win32 report, correct implementation
2. ✓ **Keep-Alive Heartbeat** - Documented, web client doesn't use it (should)
3. ✓ **Window Focus Handling** - For background mute, web client has it
4. ✓ **UTF-8 Buffering** - For split multibyte chars, documented correctly

**Should Implement (enhancements):**
1. ✓ **Exponential Backoff** - Documented in Win32 report
2. ✓ **Detailed Error Codes** - Winsock advantage, documented
3. ✓ **Socket Options** - TCP_NODELAY, keep-alive tuning, documented
4. ✓ **File Transfer** - NEW, requires WebRTC or custom protocol

---

### Win32 Porting Validation

**Core Strategy: VALIDATED ✓**
- Direct TCP to port 7777: Correct (web client uses proxy due to browser limitation)
- Telnet state machine portable: Confirmed (straightforward C++ port)
- GMCP/MCP text protocols: Language-agnostic, no issues
- Winsock2 async I/O: WSAAsyncSelect appropriate for single connection

**Libraries Confirmed:**
- `nlohmann/json` - Good choice (GMCP JSON parsing)
- OpenSSL - Recommended over Schannel (easier)
- WebRTC library - NEW REQUIREMENT (for file transfer)

**Timeline: REALISTIC ✓**
- 6-9 weeks for networking layer (Win32 report estimate)
- Matches codebase complexity analysis

---

## Recommendations for Win32 Development

### Phase 1: MVP Networking (Weeks 1-3)

**Priority 1: Core Connection**
1. Implement TelnetParser (C++ port of telnet.ts)
   - State machine: DATA → COMMAND → NEGOTIATION/SUBNEGOTIATION
   - IAC sequence handling
   - Binary-safe buffering
2. Winsock2 TCP connection to port 7777
   - WSAAsyncSelect for async I/O
   - Plain TCP (no TLS initially)
3. Basic send/receive (no GMCP/MCP yet)
   - UTF-8 encoding/decoding with buffering (handle split sequences)
   - Line-based text processing

**Deliverable:** Console app that connects, sends commands, receives text.

---

### Phase 2: Protocol Extensions (Weeks 4-7)

**Priority 2: GMCP**
1. JSON library integration (nlohmann/json)
2. GMCPPackage base class
3. Core packages (required for authentication):
   - GMCPCore (Hello, Ping, KeepAlive)
   - GMCPCoreSupports (capability negotiation)
   - GMCPAutoLogin (refresh token authentication)
4. Character packages (for UI):
   - GMCPChar (character data)
   - GMCPRoom (room info)
   - GMCPCharStatus (vitals)

**Priority 3: MCP**
1. MCP message parsing (regex or manual)
2. Authentication (6-char key generation)
3. McpSimpleEdit (code editor integration)
4. McpAwnsStatus (status bar)

**Deliverable:** Full GMCP/MCP support, authenticated connection.

---

### Phase 3: Enhancements (Weeks 8-10)

**Priority 4: TLS**
1. OpenSSL integration
2. Certificate validation
3. Secure connection to port 7777

**Priority 5: Polish**
1. NAWS (window size negotiation)
2. Keep-alive heartbeat (GMCP Core.KeepAlive)
3. Exponential backoff reconnection
4. Window focus handling (background mute)
5. Detailed error messages

**Deliverable:** Production-ready networking layer.

---

### Phase 4: Optional Features (Weeks 11+)

**Priority 6: File Transfer**
1. WebRTC library integration (libdatachannel)
2. GMCPClientFileTransfer package
3. Data channel negotiation
4. Binary file transfer

**Priority 7: MIDI**
1. Windows MIDI API integration
2. GMCPClientMidi package
3. Background mute coordination

**Deliverable:** Feature parity with web client.

---

## Conclusion

**Wave 1 Documentation Quality: EXCELLENT**

The Win32 networking report (`reports/win32/wave1/04-networking.md`) is **accurate, comprehensive, and actionable**. It correctly identifies:
1. Web client architecture (WebSocket proxy requirement)
2. Win32 strategy (direct TCP via Winsock2)
3. Protocol stack (Telnet + GMCP + MCP)
4. Porting requirements (state machine, packages, encoding)
5. Implementation timeline (6-9 weeks, realistic)

**Minor gaps identified:**
- File transfer system (WebRTC-based, added after Wave 1)
- MIDI service integration
- Background mute behavior
- UTF-8 stream decoding (web client bug, Win32 fix correct)

**Recommendations:**
1. **Use Win32 report as primary reference** - it's solid
2. **Add file transfer to backlog** - new requirement
3. **Implement UTF-8 buffering as documented** - web client has latent bug
4. **Follow phased approach** - MVP → GMCP/MCP → TLS → Polish
5. **Start with OpenSSL** - easier than Schannel for cross-platform TLS

**Overall Assessment:**
Win32 networking documentation is **production-ready**. Proceed with confidence. The web client codebase validates the documented approach. No major architectural changes needed.

---

**Document Version:** 1.0
**Verification Date:** 2025-12-17
**Verified By:** Claude (Sonnet 4.5)
**Files Analyzed:**
- `src/client.ts` (MudClient class, connection lifecycle)
- `src/telnet.ts` (TelnetParser, WebSocketStream)
- `src/mcp.ts` (MCP parsing, packages)
- `src/gmcp/` (26 GMCP packages)
- `reports/win32/wave1/04-networking.md` (Win32 report)
- `reports/wave1/03-networking.md` (iOS/web baseline)

**Verification Methodology:**
1. Read Wave 1 networking reports (Win32 and web)
2. Examine actual networking code (telnet.ts, client.ts)
3. Verify protocol implementations (GMCP, MCP, Telnet)
4. Check connection lifecycle (connect, disconnect, reconnect)
5. Identify gaps between documentation and codebase
6. Validate Win32 porting strategy
7. Assess timeline and complexity estimates
