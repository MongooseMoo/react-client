# Win32 Networking and Telnet Protocol Layer

**Report Date:** 2025-12-17
**Subject:** Win32 Native Client Networking Architecture
**Scope:** Connection lifecycle, telnet protocol, data flow, encoding, and Winsock implementation requirements

---

## Executive Summary

The Win32 native client will use **direct TCP/TLS sockets** via **Winsock2** to connect to the MOO server on **port 7777**. Unlike the web client (which uses WebSocket proxy on port 8765 due to browser limitations), the Win32 client can establish raw TCP connections directly to the server, similar to the iOS approach documented in Wave 2.

The networking layer consists of:

1. **Transport Layer:** Winsock2 TCP sockets with optional TLS (via Schannel)
2. **Protocol Layer:** Telnet protocol parser (state machine for IAC sequences)
3. **Application Protocols:** GMCP (JSON over telnet) and MCP (text-based multiline messages)

**Critical Win32 Dependencies:**
- `ws2_32.lib` - Winsock2 for TCP sockets
- `secur32.lib` - Schannel for TLS/SSL
- Async I/O via `WSAAsyncSelect`, I/O Completion Ports, or overlapped I/O

**Key Simplification:** No WebSocket layer needed (unlike web client). Direct telnet over TCP.

---

## 1. Connection Architecture Overview

### 1.1 Network Stack Comparison

| Layer | Web Client | Win32 Client |
|-------|------------|--------------|
| **Application** | React MudClient | Win32 MudClient |
| **Protocol** | GMCP/MCP | GMCP/MCP |
| **Telnet** | TelnetParser | TelnetParser (ported to C++) |
| **Transport** | WebSocket Secure (WSS) | TCP/TLS (Winsock2) |
| **Proxy** | Required (port 8765) | Not needed |
| **Server Port** | 8765 (proxy) | 7777 (direct) |
| **Host** | mongoose.moo.mud.org | mongoose.moo.mud.org |

### 1.2 Win32 Network Architecture

```
┌─────────────────────┐
│  Win32 MudClient    │
│  (Native C++ App)   │
└──────────┬──────────┘
           │ Direct TCP/TLS (port 7777)
           │ via Winsock2
           │ Telnet protocol
           ▼
┌─────────────────────┐
│   MOO Server        │
│  (port 7777)        │
│  w/ SSL/TLS support │
└─────────────────────┘
```

**Advantages:**
- No proxy dependency
- Lower latency (one less network hop)
- Native Windows TLS (Schannel)
- Full control over socket options (keep-alive, timeouts, buffer sizes)
- Direct error reporting from server

---

## 2. Winsock2 Implementation Requirements

### 2.1 Socket Creation and Initialization

**Required Headers:**
```cpp
#include <winsock2.h>
#include <ws2tcpip.h>
#include <schannel.h>
#include <security.h>

#pragma comment(lib, "ws2_32.lib")
#pragma comment(lib, "secur32.lib")
```

**Initialization Sequence:**

1. **WSAStartup** - Initialize Winsock
```cpp
WSADATA wsaData;
int result = WSAStartup(MAKEWORD(2, 2), &wsaData);
if (result != 0) {
    // Error handling
}
```

2. **getaddrinfo** - Resolve hostname
```cpp
struct addrinfo hints = {0};
hints.ai_family = AF_UNSPEC;     // IPv4 or IPv6
hints.ai_socktype = SOCK_STREAM;  // TCP
hints.ai_protocol = IPPROTO_TCP;

struct addrinfo* result = nullptr;
int res = getaddrinfo("mongoose.moo.mud.org", "7777", &hints, &result);
```

3. **socket** - Create TCP socket
```cpp
SOCKET sock = socket(result->ai_family, result->ai_socktype, result->ai_protocol);
if (sock == INVALID_SOCKET) {
    int error = WSAGetLastError();
    // Error handling
}
```

4. **connect** - Establish connection
```cpp
int res = connect(sock, result->ai_addr, (int)result->ai_addrlen);
if (res == SOCKET_ERROR) {
    int error = WSAGetLastError();
    closesocket(sock);
    // Error handling
}
```

5. **freeaddrinfo** - Clean up address info
```cpp
freeaddrinfo(result);
```

### 2.2 TLS/SSL via Schannel

**Note:** The MOO server on port 7777 supports TLS. For production use, implement TLS.

**Schannel Initialization:**

1. **Acquire credentials handle**
```cpp
SCHANNEL_CRED schannelCred = {0};
schannelCred.dwVersion = SCHANNEL_CRED_VERSION;
schannelCred.dwFlags = SCH_CRED_AUTO_CRED_VALIDATION |
                       SCH_CRED_REVOCATION_CHECK_CHAIN;

CredHandle credHandle;
TimeStamp expiry;
SECURITY_STATUS status = AcquireCredentialsHandle(
    NULL,
    UNISP_NAME,
    SECPKG_CRED_OUTBOUND,
    NULL,
    &schannelCred,
    NULL,
    NULL,
    &credHandle,
    &expiry
);
```

2. **Initialize security context (TLS handshake)**
```cpp
CtxtHandle contextHandle;
SecBuffer outBuffers[1] = {0};
SecBufferDesc outBuffer = {0};
DWORD contextAttr;

// Loop: send client hello, receive server hello, send client key exchange, etc.
// See MSDN Schannel documentation for full handshake implementation
```

3. **Encrypt/Decrypt data**
```cpp
// After handshake, use EncryptMessage/DecryptMessage for all data
```

**Simpler Alternative for MVP:** Use OpenSSL or mbedTLS instead of Schannel for easier cross-platform TLS.

### 2.3 Async I/O Options

Win32 offers multiple async I/O models. Choose one based on application architecture:

#### Option 1: WSAAsyncSelect (Message-based, Win32 GUI apps)

```cpp
// Associate socket with window message
int res = WSAAsyncSelect(sock, hwnd, WM_SOCKET, FD_READ | FD_WRITE | FD_CLOSE | FD_CONNECT);

// In window procedure:
case WM_SOCKET:
    switch (WSAGETSELECTEVENT(lParam)) {
        case FD_CONNECT:
            // Connection established
            break;
        case FD_READ:
            // Data available
            recv(sock, buffer, bufferSize, 0);
            break;
        case FD_CLOSE:
            // Connection closed
            break;
    }
    break;
```

**Pros:** Simple, integrates with message pump
**Cons:** Couples network to GUI thread

#### Option 2: I/O Completion Ports (Scalable, thread-pool)

```cpp
// Create completion port
HANDLE iocp = CreateIoCompletionPort(INVALID_HANDLE_VALUE, NULL, 0, 0);

// Associate socket
CreateIoCompletionPort((HANDLE)sock, iocp, (ULONG_PTR)contextData, 0);

// Worker thread:
DWORD bytesTransferred;
ULONG_PTR completionKey;
OVERLAPPED* overlapped;
GetQueuedCompletionStatus(iocp, &bytesTransferred, &completionKey, &overlapped, INFINITE);
```

**Pros:** Highly scalable, best performance for multiple connections
**Cons:** More complex, overkill for single MUD connection

#### Option 3: select/poll (Cross-platform compatible)

```cpp
fd_set readSet, writeSet, exceptSet;
FD_ZERO(&readSet);
FD_SET(sock, &readSet);

struct timeval timeout = {1, 0}; // 1 second
int res = select(0, &readSet, &writeSet, &exceptSet, &timeout);

if (FD_ISSET(sock, &readSet)) {
    // Data available
}
```

**Pros:** Portable to POSIX systems
**Cons:** Less efficient than IOCP, limited to 64 sockets on Windows

**Recommendation:** Use **WSAAsyncSelect** for MVP (simplest GUI integration), migrate to IOCP if multiple connections needed.

### 2.4 Socket Options and Keep-Alive

```cpp
// Disable Nagle's algorithm (better for interactive telnet)
BOOL nodelay = TRUE;
setsockopt(sock, IPPROTO_TCP, TCP_NODELAY, (char*)&nodelay, sizeof(nodelay));

// Enable TCP keep-alive (detect dead connections)
BOOL keepalive = TRUE;
setsockopt(sock, SOL_SOCKET, SO_KEEPALIVE, (char*)&keepalive, sizeof(keepalive));

// Configure keep-alive timing (Windows-specific)
tcp_keepalive keepaliveParams;
keepaliveParams.onoff = 1;
keepaliveParams.keepalivetime = 60000;      // 60 seconds before first probe
keepaliveParams.keepaliveinterval = 10000;  // 10 seconds between probes
DWORD bytesReturned;
WSAIoctl(sock, SIO_KEEPALIVE_VALS, &keepaliveParams, sizeof(keepaliveParams),
         NULL, 0, &bytesReturned, NULL, NULL);
```

---

## 3. Telnet Protocol Implementation

### 3.1 Porting TelnetParser to C++

**Source:** `src/telnet.ts` (TypeScript state machine)

**Key Components:**

```cpp
enum class TelnetState {
    DATA,           // Normal text data
    COMMAND,        // After IAC byte, reading command
    SUBNEGOTIATION, // Reading subnegotiation content
    NEGOTIATION     // Reading option after WILL/WONT/DO/DONT
};

enum class TelnetCommand : uint8_t {
    SE = 240,   // End of subnegotiation
    NOP = 241,  // No operation
    SB = 250,   // Subnegotiation begin
    WILL = 251, // Will perform option
    WONT = 252, // Won't perform option
    DO = 253,   // Do perform option
    DONT = 254, // Don't perform option
    IAC = 255   // Interpret as command
};

enum class TelnetOption : uint8_t {
    BINARY = 0,
    ECHO = 1,
    SUPPRESS_GO_AHEAD = 3,
    TERMINAL_TYPE = 24,
    NAWS = 31,              // Negotiate About Window Size
    GMCP = 201,             // Generic MUD Communication Protocol
    // ... (see telnet.ts lines 4-58 for full list)
};

class TelnetParser {
private:
    TelnetState state = TelnetState::DATA;
    std::vector<uint8_t> buffer;
    std::vector<uint8_t> subBuffer;
    uint8_t negotiationByte = 0;

public:
    // Event callbacks
    std::function<void(const std::vector<uint8_t>&)> onData;
    std::function<void(uint8_t command, uint8_t option)> onNegotiation;
    std::function<void(const std::string& package, const std::string& data)> onGMCP;
    std::function<void(const std::vector<uint8_t>&)> onSubnegotiation;

    void parse(const uint8_t* data, size_t len);
    void sendNegotiation(TelnetCommand command, TelnetOption option);
    void sendGMCP(const std::string& package, const std::string& data);
    void sendTerminalType(const std::string& termType);

private:
    void handleData();
    bool handleCommand();
    bool handleNegotiation();
    bool handleSubnegotiation();
    void handleGMCP(const std::vector<uint8_t>& data);
};
```

**State Machine Logic (port from telnet.ts lines 135-164):**

```cpp
void TelnetParser::parse(const uint8_t* data, size_t len) {
    // Append to buffer
    buffer.insert(buffer.end(), data, data + len);

    while (!buffer.empty()) {
        bool needMoreData = false;

        switch (state) {
            case TelnetState::DATA:
                handleData();
                break;
            case TelnetState::COMMAND:
                needMoreData = handleCommand();
                break;
            case TelnetState::SUBNEGOTIATION:
                needMoreData = handleSubnegotiation();
                break;
            case TelnetState::NEGOTIATION:
                needMoreData = handleNegotiation();
                break;
        }

        if (needMoreData) {
            return; // Wait for more data
        }
    }
}
```

**Data Handling (port from telnet.ts lines 166-177):**

```cpp
void TelnetParser::handleData() {
    auto it = std::find(buffer.begin(), buffer.end(), static_cast<uint8_t>(TelnetCommand::IAC));

    if (it == buffer.end()) {
        // No IAC in buffer, emit all as data
        if (onData) {
            onData(buffer);
        }
        buffer.clear();
        return;
    }

    // Emit data before IAC
    size_t index = std::distance(buffer.begin(), it);
    if (index > 0 && onData) {
        std::vector<uint8_t> dataChunk(buffer.begin(), it);
        onData(dataChunk);
    }

    // Remove emitted data, keep from IAC onwards
    buffer.erase(buffer.begin(), it);
    state = TelnetState::COMMAND;
}
```

**GMCP Parsing (port from telnet.ts lines 240-244):**

```cpp
void TelnetParser::handleGMCP(const std::vector<uint8_t>& data) {
    std::string gmcpString(data.begin(), data.end());

    // Split on first space: "Package.Name {json data}"
    size_t spacePos = gmcpString.find(' ');
    std::string packageName;
    std::string jsonData;

    if (spacePos != std::string::npos) {
        packageName = gmcpString.substr(0, spacePos);
        jsonData = gmcpString.substr(spacePos + 1);
    } else {
        packageName = gmcpString;
        jsonData = "{}";
    }

    if (onGMCP) {
        onGMCP(packageName, jsonData);
    }
}
```

**Sending GMCP (port from telnet.ts lines 250-260):**

```cpp
void TelnetParser::sendGMCP(const std::string& package, const std::string& data) {
    std::string gmcpString = package + " " + data;

    std::vector<uint8_t> buffer;
    buffer.push_back(static_cast<uint8_t>(TelnetCommand::IAC));
    buffer.push_back(static_cast<uint8_t>(TelnetCommand::SB));
    buffer.push_back(static_cast<uint8_t>(TelnetOption::GMCP));
    buffer.insert(buffer.end(), gmcpString.begin(), gmcpString.end());
    buffer.push_back(static_cast<uint8_t>(TelnetCommand::IAC));
    buffer.push_back(static_cast<uint8_t>(TelnetCommand::SE));

    // Send via socket
    send(sock, reinterpret_cast<const char*>(buffer.data()), buffer.size(), 0);
}
```

### 3.2 Telnet Option Negotiation

**Negotiation Flow (client.ts lines 280-300):**

When server sends `IAC WILL GMCP`:
1. Client responds with `IAC DO GMCP`
2. Client sends `Core.Hello` with client name/version
3. Client sends `Core.Supports.Set` with list of supported GMCP packages
4. Client sends `Auth.Autologin.Login` with refresh token (if available)

When server sends `IAC DO TERMINAL_TYPE`:
1. Client responds with `IAC WILL TERMINAL_TYPE`
2. Client sends terminal type subnegotiations:
   - "Mongoose Client" (or "Win32 MUD Client")
   - "ANSI" (supports ANSI color codes)
   - "PROXY" (for web client) or "NATIVE" (for Win32 client)

**Win32 Implementation:**

```cpp
void MudClient::handleNegotiation(uint8_t command, uint8_t option) {
    if (command == static_cast<uint8_t>(TelnetCommand::WILL) &&
        option == static_cast<uint8_t>(TelnetOption::GMCP)) {

        // Accept GMCP
        telnetParser.sendNegotiation(TelnetCommand::DO, TelnetOption::GMCP);

        // Send GMCP handshake
        sendGMCPHello();
        sendGMCPSupports();
        sendGMCPAutoLogin();

    } else if (command == static_cast<uint8_t>(TelnetCommand::DO) &&
               option == static_cast<uint8_t>(TelnetOption::TERMINAL_TYPE)) {

        // Accept terminal type requests
        telnetParser.sendNegotiation(TelnetCommand::WILL, TelnetOption::TERMINAL_TYPE);

        // Send terminal types
        telnetParser.sendTerminalType("Win32 MUD Client");
        telnetParser.sendTerminalType("ANSI");
        telnetParser.sendTerminalType("NATIVE");
    }
}
```

### 3.3 Window Size Negotiation (NAWS)

The server may request window size via NAWS (Negotiate About Window Size):

```cpp
void MudClient::sendWindowSize(uint16_t width, uint16_t height) {
    std::vector<uint8_t> buffer;
    buffer.push_back(static_cast<uint8_t>(TelnetCommand::IAC));
    buffer.push_back(static_cast<uint8_t>(TelnetCommand::SB));
    buffer.push_back(static_cast<uint8_t>(TelnetOption::NAWS));

    // Width (2 bytes, network byte order)
    buffer.push_back((width >> 8) & 0xFF);
    buffer.push_back(width & 0xFF);

    // Height (2 bytes, network byte order)
    buffer.push_back((height >> 8) & 0xFF);
    buffer.push_back(height & 0xFF);

    buffer.push_back(static_cast<uint8_t>(TelnetCommand::IAC));
    buffer.push_back(static_cast<uint8_t>(TelnetCommand::SE));

    send(sock, reinterpret_cast<const char*>(buffer.data()), buffer.size(), 0);
}
```

**Trigger:** Send when terminal window is resized (handle WM_SIZE message).

---

## 4. Data Flow Architecture

### 4.1 Outbound Data Flow (User to Server)

**Sequence:**

1. User types command in edit control or RichEdit control
2. User presses Enter
3. Application calls `MudClient::sendCommand(std::wstring command)`
4. Convert wide string to UTF-8
5. Append `\r\n` (telnet line ending)
6. Send via Winsock: `send(sock, utf8Data, len, 0)`
7. **Log sent command** for debugging

**Code Example:**

```cpp
void MudClient::sendCommand(const std::wstring& command) {
    // Convert UTF-16 to UTF-8
    std::string utf8Command = WideToUTF8(command);

    // Optional: Local echo
    if (preferences.localEcho) {
        emitMessage(utf8Command);
    }

    // Optional: Autosay mode
    if (autosay && !utf8Command.empty() &&
        utf8Command[0] != '-' && utf8Command[0] != '\'') {
        utf8Command = "say " + utf8Command;
    }

    // Append telnet line ending
    utf8Command += "\r\n";

    // Send via socket
    int result = send(sock, utf8Command.c_str(), utf8Command.size(), 0);
    if (result == SOCKET_ERROR) {
        int error = WSAGetLastError();
        handleSocketError(error);
    }

    // Log
    OutputDebugStringA(("> " + utf8Command).c_str());
}
```

### 4.2 Inbound Data Flow (Server to UI)

**Sequence:**

1. **Socket receives data** (FD_READ event or IOCP notification)
2. **recv()** into buffer
3. **TelnetParser::parse()** processes buffer
   - Extracts IAC sequences
   - Processes GMCP subnegotiations
   - Emits clean text data
4. **MudClient::handleData()** receives clean data
   - Decode UTF-8 to UTF-16
   - Split by newlines
   - Check for MCP messages (`#$#` prefix)
5. **Route messages:**
   - MCP messages → `handleMCP()`
   - Normal text → `emitMessage()`
6. **UI updates:**
   - `emitMessage()` triggers event
   - Output window component receives text
   - ANSI parser converts to formatted text
   - RichEdit control displays formatted text

**Code Example:**

```cpp
void MudClient::onSocketReadable() {
    char buffer[4096];
    int bytesReceived = recv(sock, buffer, sizeof(buffer), 0);

    if (bytesReceived > 0) {
        // Parse telnet protocol
        telnetParser.parse(reinterpret_cast<uint8_t*>(buffer), bytesReceived);

    } else if (bytesReceived == 0) {
        // Connection closed gracefully
        handleDisconnect();

    } else {
        // Error
        int error = WSAGetLastError();
        if (error != WSAEWOULDBLOCK) {
            handleSocketError(error);
        }
    }
}

void MudClient::handleTelnetData(const std::vector<uint8_t>& data) {
    // Decode UTF-8
    std::wstring decoded = UTF8ToWide(std::string(data.begin(), data.end()));

    // Split by newlines
    size_t start = 0;
    size_t end;
    while ((end = decoded.find(L'\n', start)) != std::wstring::npos) {
        std::wstring line = decoded.substr(start, end - start);

        // Trim carriage return
        if (!line.empty() && line.back() == L'\r') {
            line.pop_back();
        }

        // Route message
        if (!line.empty() && line[0] == L'#' && line.size() > 2 &&
            line[1] == L'$' && line[2] == L'#') {
            handleMCP(line);
        } else {
            emitMessage(line);
        }

        start = end + 1;
    }
}
```

### 4.3 GMCP Data Flow

**Server → Client:**

1. Server sends: `IAC SB GMCP "Room.Info {\"name\":\"Town Square\"}" IAC SE`
2. TelnetParser detects GMCP subnegotiation
3. Extracts: package=`Room.Info`, data=`{"name":"Town Square"}`
4. Emits `onGMCP("Room.Info", "{\"name\":\"Town Square\"}")`
5. MudClient::handleGMCP() parses package name:
   - Split on last dot: package=`Room`, message=`Info`
   - Find handler: `gmcpHandlers["Room"]`
   - Call method: `handler->handleInfo(parsedJSON)`
6. Handler processes data and updates UI

**Client → Server:**

1. GMCP handler calls `sendData("Hello", jsonData)`
2. Constructs full package name: `Core.Hello`
3. Serializes data to JSON string
4. Calls `telnetParser.sendGMCP("Core.Hello", jsonString)`
5. TelnetParser constructs: `IAC SB GMCP "Core.Hello {...}" IAC SE`
6. Sends via socket

**JSON Parsing:** Use library like `nlohmann/json` (header-only, MIT license):

```cpp
#include <nlohmann/json.hpp>
using json = nlohmann::json;

void GMCPRoomHandler::handleInfo(const std::string& data) {
    try {
        json j = json::parse(data);
        std::string roomName = j["name"];
        // Update UI
    } catch (const json::exception& e) {
        // Log error
        OutputDebugStringA(("GMCP JSON parse error: " + std::string(e.what())).c_str());
    }
}
```

### 4.4 MCP Data Flow

**MCP Message Format:**
```
#$#message-name auth-key key1: value1 key2: "value with spaces"
```

**Multiline Format:**
```
#$#dns-org-mud-moo-simpleedit-content abc123 reference: "player.desc" _data-tag: tag456
#$#* tag456 content: "Line 1 of description"
#$#* tag456 content: "Line 2 of description"
#$#: tag456
```

**Parsing (port from mcp.ts lines 15-43):**

```cpp
struct MCPMessage {
    std::string name;
    std::string authKey;
    std::map<std::string, std::string> keyvals;
};

MCPMessage parseMCPMessage(const std::wstring& line) {
    // Regex: #$#(\S+)(?:\s+(\S{6})\s+)?(.*)
    std::wregex pattern(L"^#\\$#(\\S+)(?:\\s+(\\S{6})\\s+)?(.*)$");
    std::wsmatch matches;

    if (!std::regex_match(line, matches, pattern)) {
        // Invalid format
        return {};
    }

    MCPMessage msg;
    msg.name = WideToUTF8(matches[1].str());
    if (matches[2].matched) {
        msg.authKey = WideToUTF8(matches[2].str());
    }

    // Parse key-value pairs
    std::wstring keyvals = matches[3].str();
    std::wregex kvPattern(L"(\\S+)\\s*:\\s*\"([^\"]*)\"|(\\S+)\\s*:\\s*(\\S+)");
    auto begin = std::wsregex_iterator(keyvals.begin(), keyvals.end(), kvPattern);
    auto end = std::wsregex_iterator();

    for (auto it = begin; it != end; ++it) {
        std::wstring key = (*it)[1].matched ? (*it)[1].str() : (*it)[3].str();
        std::wstring value = (*it)[2].matched ? (*it)[2].str() : (*it)[4].str();
        msg.keyvals[WideToUTF8(key)] = WideToUTF8(value);
    }

    return msg;
}
```

**Authentication (client.ts lines 413-423):**

```cpp
void MudClient::handleMCP(const std::wstring& line) {
    MCPMessage msg = parseMCPMessage(line);

    if (msg.name == "mcp" && msg.authKey.empty() && mcpAuthKey.empty()) {
        // Initial MCP handshake
        mcpAuthKey = generateRandomTag(6);

        std::string authMsg = "#$#mcp authentication-key: " + mcpAuthKey +
                             " version: 2.1 to: 2.1\r\n";
        send(sock, authMsg.c_str(), authMsg.size(), 0);

        // Send package negotiations
        mcpNegotiate->sendNegotiate();

    } else if (msg.authKey == mcpAuthKey) {
        // Valid authenticated message
        // Dispatch to handler
        dispatchMCP(msg);

    } else {
        // Invalid auth key - possible spoofed message
        OutputDebugStringA("MCP: Invalid auth key, ignoring message\n");
    }
}
```

---

## 5. Character Encoding

### 5.1 Encoding Strategy

**Internal Representation:** UTF-16 (Windows native `wchar_t`, `std::wstring`)
**Network Transmission:** UTF-8 (telnet standard)
**Conversion Points:**
- **Sending:** UTF-16 → UTF-8 before `send()`
- **Receiving:** UTF-8 → UTF-16 after `recv()`

**Why UTF-16 internally:**
- Windows API uses wide strings (WCHAR)
- Win32 GUI controls (Edit, RichEdit) use wide strings
- Simplifies interaction with Windows APIs

**Why UTF-8 on network:**
- Telnet protocol traditionally ASCII, UTF-8 backward compatible
- Modern MUDs support UTF-8
- Server expects UTF-8 (verified in client.ts line 47: `TextDecoder("utf8")`)

### 5.2 Conversion Functions

**Using Windows API (MultiByteToWideChar / WideCharToMultiByte):**

```cpp
std::wstring UTF8ToWide(const std::string& utf8) {
    if (utf8.empty()) return L"";

    int wideLen = MultiByteToWideChar(CP_UTF8, 0, utf8.c_str(), -1, NULL, 0);
    if (wideLen == 0) {
        // Error handling
        return L"";
    }

    std::wstring wide(wideLen - 1, 0); // -1 to exclude null terminator
    MultiByteToWideChar(CP_UTF8, 0, utf8.c_str(), -1, &wide[0], wideLen);

    return wide;
}

std::string WideToUTF8(const std::wstring& wide) {
    if (wide.empty()) return "";

    int utf8Len = WideCharToMultiByte(CP_UTF8, 0, wide.c_str(), -1, NULL, 0, NULL, NULL);
    if (utf8Len == 0) {
        // Error handling
        return "";
    }

    std::string utf8(utf8Len - 1, 0); // -1 to exclude null terminator
    WideCharToMultiByte(CP_UTF8, 0, wide.c_str(), -1, &utf8[0], utf8Len, NULL, NULL);

    return utf8;
}
```

### 5.3 Encoding Edge Cases

**Incomplete UTF-8 sequences:**
- Telnet data may arrive in chunks that split multi-byte UTF-8 characters
- Must buffer incomplete sequences until next packet arrives

**Solution:**

```cpp
class UTF8Decoder {
private:
    std::vector<uint8_t> pendingBytes;

public:
    std::wstring decode(const std::vector<uint8_t>& data) {
        std::vector<uint8_t> combined = pendingBytes;
        combined.insert(combined.end(), data.begin(), data.end());

        std::string utf8Str(combined.begin(), combined.end());

        // Check if last character is incomplete UTF-8 sequence
        size_t validEnd = utf8Str.size();
        while (validEnd > 0) {
            uint8_t byte = utf8Str[validEnd - 1];

            // Check if this is start of multi-byte sequence that's incomplete
            // (Implementation: check UTF-8 byte patterns)
            // If incomplete, set pendingBytes and truncate validEnd

            break; // Simplified - full implementation checks UTF-8 structure
        }

        // Decode valid portion
        std::string validUTF8 = utf8Str.substr(0, validEnd);
        std::wstring result = UTF8ToWide(validUTF8);

        // Save incomplete portion for next call
        if (validEnd < utf8Str.size()) {
            pendingBytes.assign(utf8Str.begin() + validEnd, utf8Str.end());
        } else {
            pendingBytes.clear();
        }

        return result;
    }
};
```

---

## 6. Error Handling and Reconnection

### 6.1 Connection Errors

**Common Winsock Errors:**

```cpp
void MudClient::handleSocketError(int error) {
    switch (error) {
        case WSAECONNREFUSED:
            // Server not accepting connections (port 7777 closed)
            showError(L"Connection refused. Server may be down.");
            break;

        case WSAETIMEDOUT:
            // Connection timeout (server not responding)
            showError(L"Connection timed out. Check network connection.");
            break;

        case WSAEHOSTUNREACH:
            // Host unreachable (network routing issue)
            showError(L"Host unreachable. Check network connection.");
            break;

        case WSAECONNRESET:
            // Connection reset by peer (server closed connection)
            handleDisconnect();
            break;

        case WSAECONNABORTED:
            // Connection aborted (local network error)
            handleDisconnect();
            break;

        default:
            showError(L"Socket error: " + std::to_wstring(error));
            break;
    }
}
```

### 6.2 Reconnection Logic

**Current web client:** 10-second fixed delay (client.ts lines 312-319)

**Win32 Implementation:**

```cpp
class MudClient {
private:
    bool intentionalDisconnect = false;
    UINT_PTR reconnectTimerID = 0;

public:
    void onDisconnect() {
        cleanupConnection();

        if (!intentionalDisconnect) {
            // Auto-reconnect after 10 seconds
            reconnectTimerID = SetTimer(hwnd, TIMER_RECONNECT, 10000, NULL);
        }
    }

    void onReconnectTimer() {
        KillTimer(hwnd, TIMER_RECONNECT);
        reconnectTimerID = 0;

        connect();
    }

    void close() {
        intentionalDisconnect = true;

        if (reconnectTimerID) {
            KillTimer(hwnd, TIMER_RECONNECT);
            reconnectTimerID = 0;
        }

        closesocket(sock);
        cleanupConnection();
    }

private:
    void cleanupConnection() {
        connected = false;
        mcpAuthKey.clear();
        telnetBuffer.clear();
        // Clean up GMCP/MCP state

        // Reset flag after cleanup
        if (intentionalDisconnect) {
            intentionalDisconnect = false;
        }

        // Notify UI
        PostMessage(hwnd, WM_CLIENT_DISCONNECTED, 0, 0);
    }
};
```

**Enhanced Reconnection (Exponential Backoff):**

For production, consider exponential backoff:

```cpp
class ReconnectionManager {
private:
    int attemptCount = 0;
    const int maxAttempts = 10;
    const int baseDelay = 1000;  // 1 second
    const int maxDelay = 60000;  // 60 seconds

public:
    int getNextDelay() {
        if (attemptCount >= maxAttempts) {
            return -1; // Give up
        }

        int delay = baseDelay * (1 << attemptCount); // Exponential: 1s, 2s, 4s, 8s, 16s, 32s, 60s
        if (delay > maxDelay) {
            delay = maxDelay;
        }

        attemptCount++;
        return delay;
    }

    void reset() {
        attemptCount = 0;
    }
};
```

### 6.3 Graceful Shutdown

```cpp
void MudClient::shutdown() {
    // Send GMCP goodbye (if connected)
    if (connected) {
        sendGMCP("Core.Goodbye", "{}");
    }

    // Shutdown socket (stop receiving, finish sending)
    shutdown(sock, SD_SEND);

    // Wait briefly for server acknowledgment
    Sleep(100);

    // Close socket
    closesocket(sock);

    // Cleanup handlers
    for (auto& handler : gmcpHandlers) {
        handler.second->shutdown();
    }
    for (auto& handler : mcpHandlers) {
        handler.second->shutdown();
    }

    // WSA cleanup (if last socket)
    WSACleanup();
}
```

---

## 7. Testing and Debugging

### 7.1 Telnet Protocol Debugging

**Logging IAC Sequences:**

```cpp
void TelnetParser::parse(const uint8_t* data, size_t len) {
    if (debugLogging) {
        std::stringstream ss;
        ss << "RECV: ";
        for (size_t i = 0; i < len; i++) {
            ss << std::hex << std::setw(2) << std::setfill('0')
               << static_cast<int>(data[i]) << " ";
        }
        OutputDebugStringA((ss.str() + "\n").c_str());
    }

    // ... parsing logic
}
```

**Example Output:**
```
RECV: 48 65 6c 6c 6f 0d 0a                          # "Hello\r\n"
RECV: ff fb c9                                       # IAC WILL GMCP
SEND: ff fd c9                                       # IAC DO GMCP
RECV: ff fa c9 52 6f 6f 6d 2e 49 6e 66 6f 20 7b ... # IAC SB GMCP Room.Info {...}
```

### 7.2 Network Traffic Capture

**Wireshark Filter:**
```
tcp.port == 7777 and ip.addr == <server_ip>
```

**Benefits:**
- See exact bytes sent/received
- Verify telnet protocol compliance
- Debug TLS handshake issues
- Analyze connection drops

### 7.3 Unit Testing TelnetParser

**Test Cases (port from telnet.test.ts):**

```cpp
TEST_CASE("TelnetParser handles plain data") {
    TelnetParser parser;
    std::vector<uint8_t> receivedData;

    parser.onData = [&](const std::vector<uint8_t>& data) {
        receivedData = data;
    };

    std::string testData = "Hello, World!";
    parser.parse(reinterpret_cast<const uint8_t*>(testData.c_str()), testData.size());

    REQUIRE(receivedData.size() == testData.size());
    REQUIRE(std::string(receivedData.begin(), receivedData.end()) == testData);
}

TEST_CASE("TelnetParser handles IAC sequences") {
    TelnetParser parser;
    uint8_t command = 0;
    uint8_t option = 0;

    parser.onNegotiation = [&](uint8_t cmd, uint8_t opt) {
        command = cmd;
        option = opt;
    };

    // IAC WILL GMCP
    uint8_t data[] = {255, 251, 201};
    parser.parse(data, sizeof(data));

    REQUIRE(command == 251); // WILL
    REQUIRE(option == 201);  // GMCP
}

TEST_CASE("TelnetParser handles incomplete sequences") {
    TelnetParser parser;
    std::vector<std::vector<uint8_t>> receivedData;

    parser.onData = [&](const std::vector<uint8_t>& data) {
        receivedData.push_back(data);
    };

    // Send IAC in first chunk
    uint8_t chunk1[] = {255};
    parser.parse(chunk1, sizeof(chunk1));
    REQUIRE(receivedData.empty()); // No data emitted yet

    // Send SB in second chunk
    uint8_t chunk2[] = {250};
    parser.parse(chunk2, sizeof(chunk2));
    REQUIRE(receivedData.empty()); // Still waiting for subnegotiation data

    // Send rest
    uint8_t chunk3[] = {201, 'H', 'e', 'l', 'l', 'o', 255, 240}; // GMCP "Hello" IAC SE
    parser.parse(chunk3, sizeof(chunk3));
    // Now subnegotiation should be processed
}
```

---

## 8. Performance Considerations

### 8.1 Buffer Management

**Receive Buffer Size:**
- Typical telnet data: 1-4 KB per packet
- GMCP Room.Info: ~1-2 KB
- Large file transfers (via GMCP File): up to 64 KB chunks

**Recommended:**
```cpp
const size_t RECV_BUFFER_SIZE = 8192; // 8 KB
```

**Send Buffering:**
- Winsock has internal send buffers (default 8 KB)
- For large data (editor content via MCP), send in chunks

```cpp
void MudClient::sendLargeData(const std::string& data) {
    const size_t CHUNK_SIZE = 4096;
    size_t offset = 0;

    while (offset < data.size()) {
        size_t chunkLen = std::min(CHUNK_SIZE, data.size() - offset);
        int sent = send(sock, data.c_str() + offset, chunkLen, 0);

        if (sent == SOCKET_ERROR) {
            int error = WSAGetLastError();
            if (error == WSAEWOULDBLOCK) {
                // Wait for socket to become writable
                Sleep(10);
                continue;
            } else {
                handleSocketError(error);
                break;
            }
        }

        offset += sent;
    }
}
```

### 8.2 Nagle's Algorithm

**Disable for telnet** (interactive protocol):

```cpp
BOOL nodelay = TRUE;
setsockopt(sock, IPPROTO_TCP, TCP_NODELAY, (char*)&nodelay, sizeof(nodelay));
```

**Why:** Telnet is latency-sensitive. Nagle's algorithm delays small packets to improve throughput, but causes noticeable lag for keypresses.

### 8.3 Keep-Alive Tuning

**Default TCP keep-alive:** 2 hours (too long for MUD)

**Recommended settings:**
- First probe: 60 seconds
- Probe interval: 10 seconds
- Max probes: 3

**Total detection time:** 60 + (10 × 3) = 90 seconds max

**Application-level keep-alive (GMCP):**

```cpp
void MudClient::startKeepAlive() {
    SetTimer(hwnd, TIMER_KEEPALIVE, 60000, NULL); // 60 seconds
}

void MudClient::onKeepAliveTimer() {
    if (connected) {
        sendGMCP("Core.KeepAlive", "");
    }
}
```

---

## 9. Win32-Specific Considerations

### 9.1 Thread Safety

**Winsock is thread-safe** for different sockets, but **NOT** for same socket from multiple threads.

**Recommendation:**
- Perform all socket operations on **one thread** (typically GUI thread with WSAAsyncSelect)
- Or use **worker thread** with IOCP and post results to GUI thread via `PostMessage`

**Thread Communication:**

```cpp
// Worker thread sends data to GUI thread
PostMessage(hwnd, WM_CLIENT_MESSAGE, 0, reinterpret_cast<LPARAM>(messageData));

// GUI thread (WndProc)
case WM_CLIENT_MESSAGE:
    auto* data = reinterpret_cast<MessageData*>(lParam);
    outputWindow->appendText(data->text);
    delete data;
    break;
```

### 9.2 Message Pump Integration

**With WSAAsyncSelect:**

Network events are delivered as window messages (`WM_SOCKET`), so the message pump naturally handles them:

```cpp
while (GetMessage(&msg, NULL, 0, 0)) {
    TranslateMessage(&msg);
    DispatchMessage(&msg);
}
```

**No blocking calls** in socket handling (async by design).

### 9.3 DPI Awareness

Not directly related to networking, but important for Win32 GUI:

- Terminal window size (NAWS) should account for DPI scaling
- Calculate character grid dimensions based on actual font metrics

```cpp
RECT clientRect;
GetClientRect(hwnd, &clientRect);

HDC hdc = GetDC(hwnd);
SIZE charSize;
GetTextExtentPoint32(hdc, L"W", 1, &charSize);
ReleaseDC(hwnd, hdc);

uint16_t cols = clientRect.right / charSize.cx;
uint16_t rows = clientRect.bottom / charSize.cy;

sendWindowSize(cols, rows);
```

---

## 10. Comparison: WebSocket vs Native TCP

| Aspect | Web Client (WebSocket) | Win32 Client (Native TCP) |
|--------|------------------------|---------------------------|
| **API** | `new WebSocket()` | Winsock2 `socket()`, `connect()` |
| **Protocol** | WSS (WebSocket Secure) | TCP/TLS |
| **Port** | 8765 (proxy) | 7777 (direct) |
| **Proxy** | Required | Not needed |
| **Binary Data** | `ArrayBuffer` | `char*` / `std::vector<uint8_t>` |
| **Async Model** | Event callbacks (`onmessage`) | WSAAsyncSelect / IOCP |
| **TLS** | Automatic (WSS) | Manual (Schannel or OpenSSL) |
| **Buffering** | Browser handles | Manual buffering |
| **Error Handling** | Limited (WebSocket errors) | Detailed (WSAGetLastError) |
| **Keep-Alive** | Browser automatic | Manual (TCP keep-alive + GMCP) |
| **Latency** | Higher (proxy hop) | Lower (direct) |
| **Debugging** | Browser DevTools Network tab | Wireshark, Winsock logs |

---

## 11. Implementation Roadmap

### Phase 1: Basic TCP Connection (Week 1-2)

1. **Initialize Winsock**
   - WSAStartup
   - Create socket
   - Connect to mongoose.moo.mud.org:7777
   - Implement WSAAsyncSelect for async I/O

2. **Basic Send/Receive**
   - Send text commands (UTF-8 encoded)
   - Receive text data
   - Display in debug console (no ANSI parsing yet)

3. **Connection Management**
   - Handle FD_CONNECT, FD_READ, FD_CLOSE events
   - Implement disconnect/reconnect logic
   - Error handling

**Deliverable:** Console app that connects, sends commands, receives responses

### Phase 2: Telnet Protocol (Week 3-4)

1. **Port TelnetParser to C++**
   - State machine for IAC sequences
   - Handle WILL/DO/WONT/DONT negotiation
   - Subnegotiation parsing
   - Unit tests

2. **Telnet Options**
   - Respond to GMCP negotiation
   - Send terminal type
   - Implement NAWS (window size)

**Deliverable:** TelnetParser library that passes all unit tests

### Phase 3: GMCP Protocol (Week 5-7)

1. **GMCP Infrastructure**
   - JSON parsing (nlohmann/json)
   - GMCPPackage base class
   - Handler registration system
   - Message dispatcher (reflection pattern)

2. **Core GMCP Packages**
   - GMCPCore (Hello, Ping, Goodbye)
   - GMCPCoreSupports (capability negotiation)
   - GMCPAuth (auto-login with refresh token)

3. **Character GMCP Packages**
   - GMCPChar (Items, Status, Skills, etc.)
   - GMCPRoom (room info)
   - Build basic UI to display data

**Deliverable:** GMCP system that handshakes with server and processes character data

### Phase 4: MCP Protocol (Week 8-9)

1. **MCP Infrastructure**
   - Message parsing (regex or manual)
   - Authentication (6-char random key)
   - Multiline message handling

2. **MCP Packages**
   - McpSimpleEdit (code editor integration)
   - McpVmooUserlist (player list)
   - McpAwnsStatus (status bar)
   - McpAwnsPing (latency)

**Deliverable:** MCP system integrated with UI

### Phase 5: TLS Support (Week 10-11)

1. **Schannel Integration**
   - Credential acquisition
   - TLS handshake
   - Encrypt/decrypt message wrappers
   - Certificate validation

2. **Testing**
   - Verify TLS handshake with server
   - Performance comparison (TLS vs plain TCP)
   - Error handling (certificate failures)

**Alternative:** Use OpenSSL or mbedTLS for cross-platform portability

**Deliverable:** Secure TLS connection to server

### Phase 6: Polish and Optimization (Week 12)

1. **Performance Tuning**
   - Buffer size optimization
   - Keep-alive timing
   - Reconnection backoff

2. **Error Handling**
   - User-friendly error messages
   - Connection status UI
   - Network diagnostics

3. **Testing**
   - Load testing (rapid commands)
   - Stability testing (long sessions)
   - Network condition simulation (high latency, packet loss)

**Deliverable:** Production-ready networking layer

---

## 12. Open Questions and Risks

### Questions for User

1. **TLS Requirement:** Is TLS mandatory for production, or acceptable to start with plain TCP?
2. **Certificate Validation:** Should we validate server certificate, or accept self-signed?
3. **Multi-connection Support:** Will client ever need multiple simultaneous MUD connections?
4. **Network Profiles:** Any need for proxy support (HTTP/SOCKS) for corporate environments?

### Technical Risks

1. **Schannel Complexity:** TLS via Schannel is low-level. Consider OpenSSL for faster development.
2. **UTF-8 Edge Cases:** Incomplete multi-byte sequences could cause display corruption if not handled.
3. **GMCP Handler Count:** 26 GMCP packages is significant C++ porting effort (~2-3 weeks).
4. **MCP Regex Parsing:** C++ regex can be slower than manual parsing. May need optimization.

### Mitigation Strategies

1. **MVP without TLS:** Ship initial version with plain TCP, add TLS in v1.1.
2. **Use OpenSSL:** Widely used, well-documented, easier than Schannel.
3. **Incremental GMCP Porting:** Port 5 most critical packages first, add rest over time.
4. **Benchmark MCP Parsing:** If regex too slow, switch to manual parsing.

---

## 13. Dependencies and Libraries

### Required

- **Winsock2** (`ws2_32.lib`) - TCP sockets
- **nlohmann/json** - JSON parsing (header-only, MIT license)
  - GitHub: https://github.com/nlohmann/json
  - Alternative: RapidJSON (faster, more complex API)

### Optional

- **OpenSSL** - TLS/SSL (easier than Schannel)
  - Pre-built binaries: https://slproweb.com/products/Win32OpenSSL.html
  - License: Apache 2.0
- **mbedTLS** - Lightweight TLS (smaller footprint than OpenSSL)
  - License: Apache 2.0
- **Catch2** - Unit testing framework
  - Header-only, Boost Software License
- **spdlog** - Fast logging library
  - Header-only, MIT license

### Not Needed (Unlike Web Client)

- ~~WebSocket library~~ (native TCP instead)
- ~~Buffer polyfill~~ (C++ std::vector<uint8_t> is native)
- ~~EventEmitter3~~ (use C++ callbacks or signals/slots)

---

## 14. Summary

The Win32 networking layer will use **native Winsock2 TCP sockets** with **direct connection to port 7777**, eliminating the WebSocket proxy required by the web client. The **TelnetParser** state machine from TypeScript ports cleanly to C++, and the **GMCP/MCP protocols** are language-agnostic (JSON and text-based).

**Key Advantages of Native Implementation:**
- Lower latency (no proxy hop)
- Full socket control (buffer sizes, keep-alive, timeouts)
- Native Windows TLS (Schannel)
- Better error diagnostics
- No browser security restrictions

**Major Porting Tasks:**
1. TelnetParser state machine (1-2 weeks)
2. 26 GMCP packages (2-3 weeks)
3. 4 MCP packages (1 week)
4. TLS integration (1-2 weeks)
5. Testing and polish (1 week)

**Total Estimated Time:** 6-9 weeks for complete networking layer

**Critical Path Items:**
- TelnetParser (blocking for everything)
- GMCP Core packages (blocking for authentication)
- UTF-8 encoding/decoding (affects all text display)

**Recommended First Milestone:** Plain TCP connection + TelnetParser + basic text display (no GMCP/MCP/TLS). This proves the core architecture and unblocks UI development.

---

## References

- **Wave 1 Report:** `reports/wave1/03-networking.md` (web client architecture)
- **Wave 2 Report:** `reports/wave2/01-architecture-networking-verification.md` (iOS simplification, direct TCP)
- **Source Files:**
  - `src/client.ts` (connection lifecycle, GMCP/MCP dispatch)
  - `src/telnet.ts` (TelnetParser state machine)
  - `src/mcp.ts` (MCP message parsing)
  - `src/gmcp/package.ts` (GMCP base class)
- **External Documentation:**
  - Winsock2 Reference: https://docs.microsoft.com/en-us/windows/win32/winsock/
  - Telnet Protocol RFC 854: https://tools.ietf.org/html/rfc854
  - GMCP Specification: https://www.gammon.com.au/gmcp
  - MCP 2.1 Specification: https://www.moo.mud.org/mcp2/mcp2.html

---

**Document Version:** 1.0
**Last Updated:** 2025-12-17
**Author:** Claude (based on source code analysis and iOS porting insights)
