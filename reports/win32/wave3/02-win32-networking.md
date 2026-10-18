# Win32 Native Networking Layer Design

**Report Date:** 2025-12-17
**Subject:** Win32 Networking Implementation Design
**Scope:** Socket layer, TLS integration, telnet parser, UTF-8 handling, connection lifecycle, error handling
**Status:** Design Specification

---

## Executive Summary

This document provides detailed implementation design for the Win32 native networking layer. Based on verification of the original Wave 1 networking documentation, the web client codebase analysis, and established Win32 patterns, this design focuses on **production-ready, robust socket I/O** using Winsock2 async patterns.

**Core Decisions:**
- **Socket Pattern:** WSAAsyncSelect (message-based async I/O)
- **TLS Strategy:** OpenSSL (simpler than Schannel, well-documented)
- **Telnet Parser:** Port from TypeScript with verified state machine
- **UTF-8 Handling:** Streaming decoder with incomplete sequence buffering
- **Connection Model:** Single-threaded GUI-integrated with timer-based reconnection
- **Keep-Alive:** Application-level GMCP heartbeat + TCP keep-alive

**Verification Status:** Wave 1 networking documentation confirmed accurate. Web client architecture validates Win32 direct-TCP strategy. File transfer (WebRTC) identified as new requirement post-Wave 1.

---

## 1. Socket Layer Design

### 1.1 Architecture Overview

```
┌─────────────────────────────────────────┐
│          MudClient Class                │
│  - Connection state machine             │
│  - GMCP/MCP dispatch                    │
│  - UTF-8 encode/decode                  │
└───────────┬─────────────────────────────┘
            │
            │ owns
            ▼
┌─────────────────────────────────────────┐
│       SocketManager Class               │
│  - Winsock2 socket lifecycle            │
│  - WSAAsyncSelect event handling        │
│  - TLS handshake (via OpenSSL)          │
│  - Send/recv buffering                  │
└───────────┬─────────────────────────────┘
            │
            │ owns
            ▼
┌─────────────────────────────────────────┐
│       TelnetParser Class                │
│  - State machine (DATA/CMD/SUB/NEG)     │
│  - IAC sequence extraction              │
│  - GMCP subnegotiation parsing          │
│  - Event emission (onData, onGMCP)      │
└─────────────────────────────────────────┘
```

### 1.2 SocketManager Class Interface

**Header: `SocketManager.h`**

```cpp
#pragma once
#include <winsock2.h>
#include <ws2tcpip.h>
#include <openssl/ssl.h>
#include <openssl/err.h>
#include <string>
#include <functional>
#include <vector>

#pragma comment(lib, "ws2_32.lib")

class SocketManager {
public:
    SocketManager(HWND hwnd);
    ~SocketManager();

    // Connection lifecycle
    bool connect(const std::string& host, const std::string& port);
    void disconnect();
    bool isConnected() const { return connected; }

    // Data transmission
    bool send(const void* data, size_t len);
    bool send(const std::string& data) { return send(data.c_str(), data.size()); }

    // TLS
    bool enableTLS();
    bool isTLSActive() const { return tlsActive; }

    // Event callbacks
    std::function<void()> onConnect;
    std::function<void()> onDisconnect;
    std::function<void(const uint8_t*, size_t)> onReceive;
    std::function<void(int errorCode)> onError;

    // Window message handler (call from WndProc)
    void handleSocketMessage(WPARAM wParam, LPARAM lParam);

private:
    HWND hwnd;
    SOCKET sock;
    bool connected;
    bool tlsActive;

    // TLS
    SSL_CTX* sslCtx;
    SSL* ssl;

    // Async I/O
    static constexpr UINT WM_SOCKET = WM_USER + 1;

    // Helpers
    void cleanup();
    void handleConnect(int error);
    void handleRead();
    void handleClose();
    void handleError(int error);

    // TLS helpers
    bool performTLSHandshake();
    int tlsSend(const void* data, size_t len);
    int tlsRecv(void* buffer, size_t len);
};
```

**Implementation: `SocketManager.cpp`**

```cpp
#include "SocketManager.h"
#include <sstream>
#include <iomanip>

SocketManager::SocketManager(HWND hwnd)
    : hwnd(hwnd), sock(INVALID_SOCKET), connected(false), tlsActive(false),
      sslCtx(nullptr), ssl(nullptr)
{
    // Initialize Winsock
    WSADATA wsaData;
    int result = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (result != 0) {
        throw std::runtime_error("WSAStartup failed: " + std::to_string(result));
    }

    // Initialize OpenSSL
    SSL_load_error_strings();
    SSL_library_init();
    OpenSSL_add_all_algorithms();
}

SocketManager::~SocketManager() {
    cleanup();
    WSACleanup();
}

bool SocketManager::connect(const std::string& host, const std::string& port) {
    if (connected) {
        return false; // Already connected
    }

    // Resolve hostname
    struct addrinfo hints = {0};
    hints.ai_family = AF_UNSPEC;      // IPv4 or IPv6
    hints.ai_socktype = SOCK_STREAM;   // TCP
    hints.ai_protocol = IPPROTO_TCP;

    struct addrinfo* result = nullptr;
    int res = getaddrinfo(host.c_str(), port.c_str(), &hints, &result);
    if (res != 0) {
        if (onError) {
            onError(res);
        }
        return false;
    }

    // Create socket
    sock = socket(result->ai_family, result->ai_socktype, result->ai_protocol);
    if (sock == INVALID_SOCKET) {
        int error = WSAGetLastError();
        freeaddrinfo(result);
        if (onError) {
            onError(error);
        }
        return false;
    }

    // Set socket options
    BOOL nodelay = TRUE;
    setsockopt(sock, IPPROTO_TCP, TCP_NODELAY, (char*)&nodelay, sizeof(nodelay));

    BOOL keepalive = TRUE;
    setsockopt(sock, SOL_SOCKET, SO_KEEPALIVE, (char*)&keepalive, sizeof(keepalive));

    // Configure keep-alive timing
    tcp_keepalive keepaliveParams;
    keepaliveParams.onoff = 1;
    keepaliveParams.keepalivetime = 60000;      // 60s before first probe
    keepaliveParams.keepaliveinterval = 10000;  // 10s between probes
    DWORD bytesReturned;
    WSAIoctl(sock, SIO_KEEPALIVE_VALS, &keepaliveParams, sizeof(keepaliveParams),
             nullptr, 0, &bytesReturned, nullptr, nullptr);

    // Enable async notifications
    res = WSAAsyncSelect(sock, hwnd, WM_SOCKET, FD_CONNECT | FD_READ | FD_CLOSE);
    if (res == SOCKET_ERROR) {
        int error = WSAGetLastError();
        closesocket(sock);
        sock = INVALID_SOCKET;
        freeaddrinfo(result);
        if (onError) {
            onError(error);
        }
        return false;
    }

    // Connect (non-blocking)
    res = ::connect(sock, result->ai_addr, (int)result->ai_addrlen);
    freeaddrinfo(result);

    if (res == SOCKET_ERROR) {
        int error = WSAGetLastError();
        if (error != WSAEWOULDBLOCK) {
            // Real error
            closesocket(sock);
            sock = INVALID_SOCKET;
            if (onError) {
                onError(error);
            }
            return false;
        }
        // WSAEWOULDBLOCK is expected for async connect
    }

    return true; // Connection in progress, will get FD_CONNECT event
}

void SocketManager::disconnect() {
    if (sock != INVALID_SOCKET) {
        shutdown(sock, SD_BOTH);
        closesocket(sock);
        sock = INVALID_SOCKET;
    }

    connected = false;
    tlsActive = false;

    if (ssl) {
        SSL_shutdown(ssl);
        SSL_free(ssl);
        ssl = nullptr;
    }

    if (sslCtx) {
        SSL_CTX_free(sslCtx);
        sslCtx = nullptr;
    }
}

void SocketManager::cleanup() {
    disconnect();
}

bool SocketManager::send(const void* data, size_t len) {
    if (!connected || sock == INVALID_SOCKET) {
        return false;
    }

    int sent;
    if (tlsActive && ssl) {
        sent = SSL_write(ssl, data, (int)len);
        if (sent <= 0) {
            int sslError = SSL_get_error(ssl, sent);
            if (onError) {
                onError(sslError);
            }
            return false;
        }
    } else {
        sent = ::send(sock, (const char*)data, (int)len, 0);
        if (sent == SOCKET_ERROR) {
            int error = WSAGetLastError();
            if (onError) {
                onError(error);
            }
            return false;
        }
    }

    return sent == (int)len;
}

bool SocketManager::enableTLS() {
    if (!connected || tlsActive) {
        return false;
    }

    // Create SSL context
    const SSL_METHOD* method = SSLv23_client_method();
    sslCtx = SSL_CTX_new(method);
    if (!sslCtx) {
        return false;
    }

    // Create SSL connection state
    ssl = SSL_new(sslCtx);
    if (!ssl) {
        SSL_CTX_free(sslCtx);
        sslCtx = nullptr;
        return false;
    }

    // Attach socket
    SSL_set_fd(ssl, (int)sock);

    // Perform handshake
    if (!performTLSHandshake()) {
        SSL_free(ssl);
        ssl = nullptr;
        SSL_CTX_free(sslCtx);
        sslCtx = nullptr;
        return false;
    }

    tlsActive = true;
    return true;
}

bool SocketManager::performTLSHandshake() {
    int ret = SSL_connect(ssl);
    if (ret != 1) {
        int sslError = SSL_get_error(ssl, ret);
        // Handle error
        return false;
    }
    return true;
}

void SocketManager::handleSocketMessage(WPARAM wParam, LPARAM lParam) {
    SOCKET s = (SOCKET)wParam;
    int event = WSAGETSELECTEVENT(lParam);
    int error = WSAGETSELECTERROR(lParam);

    if (s != sock) {
        return; // Not our socket
    }

    switch (event) {
        case FD_CONNECT:
            handleConnect(error);
            break;

        case FD_READ:
            handleRead();
            break;

        case FD_CLOSE:
            handleClose();
            break;
    }
}

void SocketManager::handleConnect(int error) {
    if (error != 0) {
        if (onError) {
            onError(error);
        }
        cleanup();
        return;
    }

    connected = true;

    if (onConnect) {
        onConnect();
    }
}

void SocketManager::handleRead() {
    char buffer[8192];
    int received;

    if (tlsActive && ssl) {
        received = SSL_read(ssl, buffer, sizeof(buffer));
        if (received <= 0) {
            int sslError = SSL_get_error(ssl, received);
            if (sslError == SSL_ERROR_ZERO_RETURN) {
                // Clean shutdown
                handleClose();
            } else {
                if (onError) {
                    onError(sslError);
                }
            }
            return;
        }
    } else {
        received = recv(sock, buffer, sizeof(buffer), 0);
        if (received <= 0) {
            if (received == 0) {
                // Connection closed
                handleClose();
            } else {
                int error = WSAGetLastError();
                if (error != WSAEWOULDBLOCK) {
                    if (onError) {
                        onError(error);
                    }
                }
            }
            return;
        }
    }

    if (onReceive) {
        onReceive((const uint8_t*)buffer, received);
    }
}

void SocketManager::handleClose() {
    cleanup();

    if (onDisconnect) {
        onDisconnect();
    }
}

void SocketManager::handleError(int error) {
    if (onError) {
        onError(error);
    }
}
```

### 1.3 WSAAsyncSelect Integration

**Window Procedure Handler:**

```cpp
LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
    static SocketManager* socketMgr = nullptr;

    switch (msg) {
        case WM_CREATE:
            socketMgr = new SocketManager(hwnd);
            // ... setup
            break;

        case WM_USER + 1: // WM_SOCKET
            if (socketMgr) {
                socketMgr->handleSocketMessage(wParam, lParam);
            }
            break;

        case WM_DESTROY:
            delete socketMgr;
            PostQuitMessage(0);
            break;

        default:
            return DefWindowProc(hwnd, msg, wParam, lParam);
    }

    return 0;
}
```

**Key Points:**
- All socket events delivered via window messages
- Non-blocking I/O (WSAEWOULDBLOCK expected)
- Integrates naturally with message pump
- Single-threaded (no locking needed)

---

## 2. TLS Integration Plan

### 2.1 OpenSSL vs Schannel Comparison

| Aspect | OpenSSL | Schannel |
|--------|---------|----------|
| **Ease of Use** | Simpler API | Complex SSPI interface |
| **Documentation** | Extensive | Microsoft-specific |
| **Cross-platform** | Yes | Windows-only |
| **Licensing** | Apache 2.0 | Built-in (free) |
| **Certificate Validation** | Straightforward | Manual X.509 parsing |
| **Recommendation** | **Use for MVP** | Consider for v2 |

### 2.2 OpenSSL Integration Steps

**1. Download and Link:**

```cmake
# CMakeLists.txt
find_package(OpenSSL REQUIRED)
target_link_libraries(MudClient OpenSSL::SSL OpenSSL::Crypto)
```

**2. Initialization (one-time, in main):**

```cpp
int main() {
    SSL_load_error_strings();
    SSL_library_init();
    OpenSSL_add_all_algorithms();

    // ... create window, message pump

    EVP_cleanup();
    ERR_free_strings();
    return 0;
}
```

**3. Context Creation (per connection):**

```cpp
bool SocketManager::enableTLS() {
    const SSL_METHOD* method = TLS_client_method();
    sslCtx = SSL_CTX_new(method);

    // Load CA certificates (for validation)
    SSL_CTX_set_default_verify_paths(sslCtx);

    // Set verification mode
    SSL_CTX_set_verify(sslCtx, SSL_VERIFY_PEER, nullptr);

    ssl = SSL_new(sslCtx);
    SSL_set_fd(ssl, (int)sock);

    // Set SNI hostname
    SSL_set_tlsext_host_name(ssl, "mongoose.moo.mud.org");

    // Perform handshake
    return performTLSHandshake();
}
```

**4. Handshake (non-blocking challenge):**

```cpp
bool SocketManager::performTLSHandshake() {
    // Set non-blocking mode for SSL
    int ret = SSL_connect(ssl);

    if (ret == 1) {
        // Handshake complete
        return true;
    }

    int sslError = SSL_get_error(ssl, ret);

    if (sslError == SSL_ERROR_WANT_READ || sslError == SSL_ERROR_WANT_WRITE) {
        // Need to wait for socket readiness
        // In WSAAsyncSelect model, we'll get FD_READ event
        // For simplicity in MVP: use blocking mode or retry in FD_READ handler

        // WORKAROUND: Use blocking socket during handshake only
        u_long mode = 0; // blocking
        ioctlsocket(sock, FIONBIO, &mode);

        ret = SSL_connect(ssl);

        mode = 1; // non-blocking
        ioctlsocket(sock, FIONBIO, &mode);

        if (ret == 1) {
            return true;
        }
    }

    // Log error
    char errorBuf[256];
    ERR_error_string_n(ERR_get_error(), errorBuf, sizeof(errorBuf));
    OutputDebugStringA("TLS handshake failed: ");
    OutputDebugStringA(errorBuf);
    OutputDebugStringA("\n");

    return false;
}
```

**5. Send/Receive Wrappers:**

Already shown in SocketManager::send() and handleRead() above.

### 2.3 Certificate Validation Strategy

**MVP:** Accept server certificate without strict validation (similar to web client accepting WSS proxy cert).

**Production:** Validate against known certificate fingerprint or CA bundle:

```cpp
bool SocketManager::validateCertificate() {
    X509* cert = SSL_get_peer_certificate(ssl);
    if (!cert) {
        return false;
    }

    // Get fingerprint
    unsigned char md[EVP_MAX_MD_SIZE];
    unsigned int mdLen;
    X509_digest(cert, EVP_sha256(), md, &mdLen);

    // Compare to known good fingerprint
    const unsigned char expectedFingerprint[32] = { /* ... */ };
    bool valid = (mdLen == 32 && memcmp(md, expectedFingerprint, 32) == 0);

    X509_free(cert);
    return valid;
}
```

---

## 3. Telnet Parser Implementation

### 3.1 State Machine Design

**Port from `telnet.ts` with C++ idioms:**

```cpp
// TelnetParser.h
#pragma once
#include <cstdint>
#include <vector>
#include <string>
#include <functional>

enum class TelnetState {
    DATA,
    COMMAND,
    NEGOTIATION,
    SUBNEGOTIATION
};

enum class TelnetCommand : uint8_t {
    SE   = 240,
    NOP  = 241,
    SB   = 250,
    WILL = 251,
    WONT = 252,
    DO   = 253,
    DONT = 254,
    IAC  = 255
};

enum class TelnetOption : uint8_t {
    BINARY            = 0,
    ECHO              = 1,
    SUPPRESS_GO_AHEAD = 3,
    TERMINAL_TYPE     = 24,
    NAWS              = 31,
    GMCP              = 201
};

class TelnetParser {
public:
    TelnetParser();

    // Parse incoming data
    void parse(const uint8_t* data, size_t len);

    // Send negotiation
    void sendNegotiation(TelnetCommand command, TelnetOption option);

    // Send GMCP
    void sendGMCP(const std::string& package, const std::string& data);

    // Send terminal type
    void sendTerminalType(const std::string& termType);

    // Send window size (NAWS)
    void sendWindowSize(uint16_t width, uint16_t height);

    // Event callbacks
    std::function<void(const std::vector<uint8_t>&)> onData;
    std::function<void(uint8_t command, uint8_t option)> onNegotiation;
    std::function<void(const std::string& package, const std::string& data)> onGMCP;
    std::function<void(const std::vector<uint8_t>&)> onSubnegotiation;
    std::function<bool(const std::vector<uint8_t>&)> onSend; // Returns false on error

private:
    TelnetState state;
    std::vector<uint8_t> buffer;
    std::vector<uint8_t> subBuffer;
    uint8_t negotiationByte;

    void handleData();
    bool handleCommand();
    bool handleNegotiation();
    bool handleSubnegotiation();
    void handleGMCP(const std::vector<uint8_t>& data);
};
```

**Implementation: `TelnetParser.cpp`**

```cpp
#include "TelnetParser.h"
#include <algorithm>
#include <sstream>

TelnetParser::TelnetParser()
    : state(TelnetState::DATA), negotiationByte(0)
{
}

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

            case TelnetState::NEGOTIATION:
                needMoreData = handleNegotiation();
                break;

            case TelnetState::SUBNEGOTIATION:
                needMoreData = handleSubnegotiation();
                break;
        }

        if (needMoreData) {
            return; // Wait for more data
        }
    }
}

void TelnetParser::handleData() {
    // Find IAC byte
    auto it = std::find(buffer.begin(), buffer.end(),
                       static_cast<uint8_t>(TelnetCommand::IAC));

    if (it == buffer.end()) {
        // No IAC, emit all as data
        if (!buffer.empty() && onData) {
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

bool TelnetParser::handleCommand() {
    if (buffer.size() < 2) {
        return true; // Need more data
    }

    uint8_t iac = buffer[0];
    uint8_t command = buffer[1];

    buffer.erase(buffer.begin(), buffer.begin() + 2);

    switch (static_cast<TelnetCommand>(command)) {
        case TelnetCommand::IAC:
            // Escaped IAC (255 255 = literal 255)
            if (onData) {
                std::vector<uint8_t> literal = { 255 };
                onData(literal);
            }
            state = TelnetState::DATA;
            break;

        case TelnetCommand::WILL:
        case TelnetCommand::WONT:
        case TelnetCommand::DO:
        case TelnetCommand::DONT:
            // Negotiation (need option byte)
            negotiationByte = command;
            state = TelnetState::NEGOTIATION;
            break;

        case TelnetCommand::SB:
            // Subnegotiation begin
            subBuffer.clear();
            state = TelnetState::SUBNEGOTIATION;
            break;

        case TelnetCommand::NOP:
            // No operation
            state = TelnetState::DATA;
            break;

        default:
            // Unknown command, ignore
            state = TelnetState::DATA;
            break;
    }

    return false;
}

bool TelnetParser::handleNegotiation() {
    if (buffer.empty()) {
        return true; // Need more data
    }

    uint8_t option = buffer[0];
    buffer.erase(buffer.begin());

    if (onNegotiation) {
        onNegotiation(negotiationByte, option);
    }

    state = TelnetState::DATA;
    return false;
}

bool TelnetParser::handleSubnegotiation() {
    // Find IAC SE sequence
    for (size_t i = 0; i < buffer.size(); i++) {
        if (buffer[i] == static_cast<uint8_t>(TelnetCommand::IAC)) {
            if (i + 1 >= buffer.size()) {
                return true; // Need more data
            }

            if (buffer[i + 1] == static_cast<uint8_t>(TelnetCommand::SE)) {
                // End of subnegotiation
                if (!subBuffer.empty()) {
                    uint8_t option = subBuffer[0];

                    if (option == static_cast<uint8_t>(TelnetOption::GMCP)) {
                        // GMCP data
                        std::vector<uint8_t> gmcpData(subBuffer.begin() + 1, subBuffer.end());
                        handleGMCP(gmcpData);
                    } else {
                        // Other subnegotiation
                        if (onSubnegotiation) {
                            onSubnegotiation(subBuffer);
                        }
                    }
                }

                // Remove processed data
                buffer.erase(buffer.begin(), buffer.begin() + i + 2);
                subBuffer.clear();
                state = TelnetState::DATA;
                return false;
            }
            else if (buffer[i + 1] == static_cast<uint8_t>(TelnetCommand::IAC)) {
                // Escaped IAC (255 255 in subnegotiation)
                subBuffer.insert(subBuffer.end(), buffer.begin(), buffer.begin() + i);
                subBuffer.push_back(255);
                buffer.erase(buffer.begin(), buffer.begin() + i + 2);
                i = 0; // Restart search
                continue;
            }
        }
    }

    // No IAC SE found, accumulate in subBuffer
    subBuffer.insert(subBuffer.end(), buffer.begin(), buffer.end());
    buffer.clear();

    return true; // Need more data
}

void TelnetParser::handleGMCP(const std::vector<uint8_t>& data) {
    std::string gmcpString(data.begin(), data.end());

    // Split on first space: "Package.Name {json}"
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

void TelnetParser::sendNegotiation(TelnetCommand command, TelnetOption option) {
    std::vector<uint8_t> buf = {
        static_cast<uint8_t>(TelnetCommand::IAC),
        static_cast<uint8_t>(command),
        static_cast<uint8_t>(option)
    };

    if (onSend) {
        onSend(buf);
    }
}

void TelnetParser::sendGMCP(const std::string& package, const std::string& data) {
    std::string gmcpString = package;
    if (!data.empty()) {
        gmcpString += " " + data;
    }

    std::vector<uint8_t> buf;
    buf.push_back(static_cast<uint8_t>(TelnetCommand::IAC));
    buf.push_back(static_cast<uint8_t>(TelnetCommand::SB));
    buf.push_back(static_cast<uint8_t>(TelnetOption::GMCP));
    buf.insert(buf.end(), gmcpString.begin(), gmcpString.end());
    buf.push_back(static_cast<uint8_t>(TelnetCommand::IAC));
    buf.push_back(static_cast<uint8_t>(TelnetCommand::SE));

    if (onSend) {
        onSend(buf);
    }
}

void TelnetParser::sendTerminalType(const std::string& termType) {
    std::vector<uint8_t> buf;
    buf.push_back(static_cast<uint8_t>(TelnetCommand::IAC));
    buf.push_back(static_cast<uint8_t>(TelnetCommand::SB));
    buf.push_back(static_cast<uint8_t>(TelnetOption::TERMINAL_TYPE));
    buf.push_back(0); // IS
    buf.insert(buf.end(), termType.begin(), termType.end());
    buf.push_back(static_cast<uint8_t>(TelnetCommand::IAC));
    buf.push_back(static_cast<uint8_t>(TelnetCommand::SE));

    if (onSend) {
        onSend(buf);
    }
}

void TelnetParser::sendWindowSize(uint16_t width, uint16_t height) {
    std::vector<uint8_t> buf;
    buf.push_back(static_cast<uint8_t>(TelnetCommand::IAC));
    buf.push_back(static_cast<uint8_t>(TelnetCommand::SB));
    buf.push_back(static_cast<uint8_t>(TelnetOption::NAWS));

    // Width (network byte order, big-endian)
    buf.push_back((width >> 8) & 0xFF);
    buf.push_back(width & 0xFF);

    // Height
    buf.push_back((height >> 8) & 0xFF);
    buf.push_back(height & 0xFF);

    buf.push_back(static_cast<uint8_t>(TelnetCommand::IAC));
    buf.push_back(static_cast<uint8_t>(TelnetCommand::SE));

    if (onSend) {
        onSend(buf);
    }
}
```

### 3.2 Telnet Parser Integration

**Connect to SocketManager:**

```cpp
class MudClient {
private:
    SocketManager socketMgr;
    TelnetParser telnetParser;

public:
    MudClient(HWND hwnd) : socketMgr(hwnd) {
        // Wire up SocketManager -> TelnetParser
        socketMgr.onReceive = [this](const uint8_t* data, size_t len) {
            telnetParser.parse(data, len);
        };

        // Wire up TelnetParser -> SocketManager
        telnetParser.onSend = [this](const std::vector<uint8_t>& data) {
            return socketMgr.send(data.data(), data.size());
        };

        // Wire up TelnetParser events -> MudClient handlers
        telnetParser.onData = [this](const std::vector<uint8_t>& data) {
            handleTelnetData(data);
        };

        telnetParser.onNegotiation = [this](uint8_t command, uint8_t option) {
            handleNegotiation(command, option);
        };

        telnetParser.onGMCP = [this](const std::string& package, const std::string& data) {
            handleGMCP(package, data);
        };
    }

    void handleNegotiation(uint8_t command, uint8_t option) {
        if (command == static_cast<uint8_t>(TelnetCommand::WILL) &&
            option == static_cast<uint8_t>(TelnetOption::GMCP)) {

            // Server supports GMCP, enable it
            telnetParser.sendNegotiation(TelnetCommand::DO, TelnetOption::GMCP);

            // Send GMCP handshake
            sendGMCPHello();
            sendGMCPSupports();
            sendGMCPAutoLogin();
        }
        else if (command == static_cast<uint8_t>(TelnetCommand::DO) &&
                 option == static_cast<uint8_t>(TelnetOption::TERMINAL_TYPE)) {

            // Server wants terminal type
            telnetParser.sendNegotiation(TelnetCommand::WILL, TelnetOption::TERMINAL_TYPE);
            telnetParser.sendTerminalType("Win32 MUD Client");
            telnetParser.sendTerminalType("ANSI");
            telnetParser.sendTerminalType("NATIVE");
        }
        else if (command == static_cast<uint8_t>(TelnetCommand::DO) &&
                 option == static_cast<uint8_t>(TelnetOption::NAWS)) {

            // Server wants window size
            telnetParser.sendNegotiation(TelnetCommand::WILL, TelnetOption::NAWS);

            // Send current window size
            RECT rect;
            GetClientRect(outputHwnd, &rect);

            HDC hdc = GetDC(outputHwnd);
            SIZE charSize;
            GetTextExtentPoint32(hdc, L"W", 1, &charSize);
            ReleaseDC(outputHwnd, hdc);

            uint16_t cols = (uint16_t)(rect.right / charSize.cx);
            uint16_t rows = (uint16_t)(rect.bottom / charSize.cy);

            telnetParser.sendWindowSize(cols, rows);
        }
    }
};
```

---

## 4. UTF-8 Buffering for Split Sequences

### 4.1 Problem Statement

UTF-8 characters can be 1-4 bytes. If a packet boundary splits a multi-byte character:

```
Packet 1: [..., 0xE2, 0x9C]     # Incomplete ✓ (U+2713, 3 bytes: E2 9C 93)
Packet 2: [0x93, ...]            # Completion byte
```

Without buffering, decoding will produce replacement characters (�) and corrupt the stream.

### 4.2 Solution: UTF8StreamDecoder

```cpp
// UTF8StreamDecoder.h
#pragma once
#include <string>
#include <vector>

class UTF8StreamDecoder {
public:
    UTF8StreamDecoder();

    // Decode incoming data, buffering incomplete sequences
    std::wstring decode(const std::vector<uint8_t>& data);

    // Flush any remaining buffered data (call on disconnect)
    std::wstring flush();

private:
    std::vector<uint8_t> pendingBytes;

    // Returns number of bytes in UTF-8 sequence based on first byte
    // Returns 0 if invalid
    size_t utf8SequenceLength(uint8_t firstByte) const;

    // Check if we have a complete UTF-8 character at position
    bool isCompleteUTF8Char(const std::vector<uint8_t>& data, size_t pos) const;
};
```

**Implementation:**

```cpp
#include "UTF8StreamDecoder.h"
#include <windows.h>

UTF8StreamDecoder::UTF8StreamDecoder() {
}

size_t UTF8StreamDecoder::utf8SequenceLength(uint8_t firstByte) const {
    if ((firstByte & 0x80) == 0) {
        return 1; // 0xxxxxxx - single byte (ASCII)
    }
    else if ((firstByte & 0xE0) == 0xC0) {
        return 2; // 110xxxxx - 2 bytes
    }
    else if ((firstByte & 0xF0) == 0xE0) {
        return 3; // 1110xxxx - 3 bytes
    }
    else if ((firstByte & 0xF8) == 0xF0) {
        return 4; // 11110xxx - 4 bytes
    }
    else {
        return 0; // Invalid
    }
}

bool UTF8StreamDecoder::isCompleteUTF8Char(const std::vector<uint8_t>& data, size_t pos) const {
    if (pos >= data.size()) {
        return false;
    }

    size_t seqLen = utf8SequenceLength(data[pos]);
    if (seqLen == 0) {
        return false; // Invalid
    }

    return (pos + seqLen) <= data.size();
}

std::wstring UTF8StreamDecoder::decode(const std::vector<uint8_t>& data) {
    // Combine pending bytes with new data
    std::vector<uint8_t> combined = pendingBytes;
    combined.insert(combined.end(), data.begin(), data.end());

    // Find last complete UTF-8 character
    size_t validEnd = 0;

    for (size_t i = 0; i < combined.size(); ) {
        size_t seqLen = utf8SequenceLength(combined[i]);

        if (seqLen == 0) {
            // Invalid byte, skip it
            i++;
            continue;
        }

        if (i + seqLen <= combined.size()) {
            // Complete sequence
            i += seqLen;
            validEnd = i;
        } else {
            // Incomplete sequence at end
            break;
        }
    }

    if (validEnd == 0) {
        // No complete characters, save all for next time
        pendingBytes = combined;
        return L"";
    }

    // Decode valid portion
    std::string utf8Str(combined.begin(), combined.begin() + validEnd);

    int wideLen = MultiByteToWideChar(CP_UTF8, 0, utf8Str.c_str(), -1, nullptr, 0);
    if (wideLen == 0) {
        // Conversion error
        pendingBytes.clear();
        return L"";
    }

    std::wstring result(wideLen - 1, 0); // -1 to exclude null terminator
    MultiByteToWideChar(CP_UTF8, 0, utf8Str.c_str(), -1, &result[0], wideLen);

    // Save incomplete portion for next call
    pendingBytes.assign(combined.begin() + validEnd, combined.end());

    return result;
}

std::wstring UTF8StreamDecoder::flush() {
    if (pendingBytes.empty()) {
        return L"";
    }

    // Force decode remaining bytes (may produce replacement chars)
    std::string utf8Str(pendingBytes.begin(), pendingBytes.end());

    int wideLen = MultiByteToWideChar(CP_UTF8, 0, utf8Str.c_str(), -1, nullptr, 0);
    if (wideLen == 0) {
        pendingBytes.clear();
        return L"";
    }

    std::wstring result(wideLen - 1, 0);
    MultiByteToWideChar(CP_UTF8, 0, utf8Str.c_str(), -1, &result[0], wideLen);

    pendingBytes.clear();
    return result;
}
```

### 4.3 Integration with TelnetParser

```cpp
class MudClient {
private:
    UTF8StreamDecoder utf8Decoder;

    void handleTelnetData(const std::vector<uint8_t>& data) {
        // Decode UTF-8 with buffering
        std::wstring decoded = utf8Decoder.decode(data);

        if (decoded.empty()) {
            return; // All data buffered, waiting for completion
        }

        // Split by newlines and route
        size_t start = 0;
        size_t end;

        while ((end = decoded.find(L'\n', start)) != std::wstring::npos) {
            std::wstring line = decoded.substr(start, end - start);

            // Trim CR
            if (!line.empty() && line.back() == L'\r') {
                line.pop_back();
            }

            // Route message
            if (line.size() >= 3 && line[0] == L'#' && line[1] == L'$' && line[2] == L'#') {
                handleMCP(line);
            } else {
                emitMessage(line);
            }

            start = end + 1;
        }

        // Handle partial line at end (no newline yet)
        if (start < decoded.size()) {
            // Buffer partial line (not implemented here, add if needed)
        }
    }
};
```

---

## 5. Connection State Machine

### 5.1 State Diagram

```
┌─────────────┐
│ DISCONNECTED│
└──────┬──────┘
       │ connect()
       ▼
┌─────────────┐
│ CONNECTING  │ ─── error ───┐
└──────┬──────┘               │
       │ FD_CONNECT            │
       ▼                       │
┌─────────────┐               │
│  CONNECTED  │               │
└──────┬──────┘               │
       │ (optional)            │
       │ enableTLS()           │
       ▼                       │
┌─────────────┐               │
│TLS_HANDSHAKE│ ─── error ───┤
└──────┬──────┘               │
       │ handshake OK          │
       ▼                       │
┌─────────────┐               │
│TLS_CONNECTED│               │
└──────┬──────┘               │
       │ close() or           │
       │ FD_CLOSE or          │
       │ error                │
       ▼                       │
┌─────────────┐◄──────────────┘
│ DISCONNECTED│
└──────┬──────┘
       │ (auto-reconnect timer)
       │
       └──────────────┐
                      │
       ┌──────────────┘
       ▼
┌─────────────┐
│  RECONNECT  │
│   WAITING   │
└──────┬──────┘
       │ timer expires
       │
       └─────► connect()
```

### 5.2 State Machine Implementation

```cpp
enum class ConnectionState {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
    TLS_HANDSHAKE,
    TLS_CONNECTED,
    RECONNECT_WAITING
};

class MudClient {
private:
    ConnectionState state;
    bool intentionalDisconnect;
    UINT_PTR reconnectTimerID;

    static constexpr UINT TIMER_RECONNECT = 1;
    static constexpr UINT TIMER_KEEPALIVE = 2;
    static constexpr DWORD RECONNECT_DELAY_MS = 10000; // 10 seconds
    static constexpr DWORD KEEPALIVE_INTERVAL_MS = 60000; // 60 seconds

public:
    void connect() {
        if (state != ConnectionState::DISCONNECTED &&
            state != ConnectionState::RECONNECT_WAITING) {
            return; // Already connected or connecting
        }

        if (reconnectTimerID) {
            KillTimer(hwnd, reconnectTimerID);
            reconnectTimerID = 0;
        }

        state = ConnectionState::CONNECTING;

        bool success = socketMgr.connect("mongoose.moo.mud.org", "7777");
        if (!success) {
            handleConnectionError();
        }
    }

    void onSocketConnect() {
        state = ConnectionState::CONNECTED;

        // Optional: Enable TLS
        if (useTLS) {
            state = ConnectionState::TLS_HANDSHAKE;

            bool tlsOk = socketMgr.enableTLS();
            if (tlsOk) {
                state = ConnectionState::TLS_CONNECTED;
            } else {
                handleConnectionError();
                return;
            }
        }

        // Start keep-alive timer
        SetTimer(hwnd, TIMER_KEEPALIVE, KEEPALIVE_INTERVAL_MS, nullptr);

        // Notify UI
        notifyConnected();
    }

    void onSocketDisconnect() {
        cleanup();

        if (!intentionalDisconnect) {
            // Auto-reconnect
            state = ConnectionState::RECONNECT_WAITING;
            reconnectTimerID = SetTimer(hwnd, TIMER_RECONNECT, RECONNECT_DELAY_MS, nullptr);
        } else {
            state = ConnectionState::DISCONNECTED;
            intentionalDisconnect = false;
        }

        // Notify UI
        notifyDisconnected();
    }

    void onReconnectTimer() {
        KillTimer(hwnd, TIMER_RECONNECT);
        reconnectTimerID = 0;

        connect();
    }

    void onKeepAliveTimer() {
        if (state == ConnectionState::CONNECTED ||
            state == ConnectionState::TLS_CONNECTED) {

            // Send GMCP keep-alive
            telnetParser.sendGMCP("Core.KeepAlive", "");
        }
    }

    void disconnect() {
        intentionalDisconnect = true;

        if (reconnectTimerID) {
            KillTimer(hwnd, TIMER_RECONNECT);
            reconnectTimerID = 0;
        }

        KillTimer(hwnd, TIMER_KEEPALIVE);

        // Send goodbye
        if (state == ConnectionState::CONNECTED ||
            state == ConnectionState::TLS_CONNECTED) {
            telnetParser.sendGMCP("Core.Goodbye", "{}");
        }

        socketMgr.disconnect();
        cleanup();

        state = ConnectionState::DISCONNECTED;
        notifyDisconnected();
    }

private:
    void cleanup() {
        KillTimer(hwnd, TIMER_KEEPALIVE);

        // Flush UTF-8 decoder
        utf8Decoder.flush();

        // Clear GMCP/MCP state
        mcpAuthKey.clear();
        // ... reset other state
    }

    void handleConnectionError() {
        cleanup();

        if (!intentionalDisconnect) {
            // Auto-reconnect
            state = ConnectionState::RECONNECT_WAITING;
            reconnectTimerID = SetTimer(hwnd, TIMER_RECONNECT, RECONNECT_DELAY_MS, nullptr);
        } else {
            state = ConnectionState::DISCONNECTED;
        }

        notifyDisconnected();
    }
};
```

### 5.3 Window Size Updates

```cpp
// In WndProc, handle WM_SIZE
case WM_SIZE:
    if (mudClient && mudClient->isConnected()) {
        RECT rect;
        GetClientRect(outputWindowHwnd, &rect);

        HDC hdc = GetDC(outputWindowHwnd);
        SIZE charSize;
        GetTextExtentPoint32(hdc, L"W", 1, &charSize);
        ReleaseDC(outputWindowHwnd, hdc);

        uint16_t cols = (uint16_t)(rect.right / charSize.cx);
        uint16_t rows = (uint16_t)(rect.bottom / charSize.cy);

        mudClient->sendWindowSize(cols, rows);
    }
    break;
```

---

## 6. Error Handling Strategy

### 6.1 Error Categories

**1. Connection Errors (Winsock):**
- `WSAECONNREFUSED` - Server not accepting connections
- `WSAETIMEDOUT` - Connection timeout
- `WSAEHOSTUNREACH` - Network routing failure
- `WSAECONNRESET` - Server closed connection
- `WSAECONNABORTED` - Local network error

**2. TLS Errors (OpenSSL):**
- `SSL_ERROR_ZERO_RETURN` - Clean shutdown
- `SSL_ERROR_WANT_READ` / `SSL_ERROR_WANT_WRITE` - Need to retry
- `SSL_ERROR_SYSCALL` - I/O error
- `SSL_ERROR_SSL` - Protocol error

**3. Protocol Errors:**
- Invalid UTF-8 sequences
- Malformed GMCP JSON
- MCP auth key mismatch
- Telnet IAC sequence corruption

### 6.2 Error Handling Framework

```cpp
enum class ErrorSeverity {
    INFO,       // Informational, no action needed
    WARNING,    // Non-fatal, continue operation
    ERROR,      // Recoverable error, retry or reconnect
    FATAL       // Unrecoverable, disconnect required
};

struct MudError {
    ErrorSeverity severity;
    std::wstring category;    // "Network", "TLS", "Protocol", "Parsing"
    std::wstring message;     // User-friendly description
    int code;                 // System error code (WSA, OpenSSL, etc.)
    std::wstring details;     // Technical details for logging
};

class ErrorHandler {
public:
    static void handleError(const MudError& error) {
        // Log to file
        logError(error);

        // Notify UI (if severity >= WARNING)
        if (error.severity >= ErrorSeverity::WARNING) {
            notifyUser(error);
        }

        // Auto-recovery
        if (error.severity == ErrorSeverity::ERROR) {
            // Trigger reconnection
        }
        else if (error.severity == ErrorSeverity::FATAL) {
            // Force disconnect
        }
    }

    static MudError fromWinsockError(int wsaError) {
        MudError error;
        error.category = L"Network";
        error.code = wsaError;

        switch (wsaError) {
            case WSAECONNREFUSED:
                error.severity = ErrorSeverity::ERROR;
                error.message = L"Connection refused. Server may be down.";
                error.details = L"WSAECONNREFUSED (10061)";
                break;

            case WSAETIMEDOUT:
                error.severity = ErrorSeverity::ERROR;
                error.message = L"Connection timed out. Check network.";
                error.details = L"WSAETIMEDOUT (10060)";
                break;

            case WSAEHOSTUNREACH:
                error.severity = ErrorSeverity::ERROR;
                error.message = L"Host unreachable. Check network.";
                error.details = L"WSAEHOSTUNREACH (10065)";
                break;

            case WSAECONNRESET:
                error.severity = ErrorSeverity::WARNING;
                error.message = L"Connection reset by server.";
                error.details = L"WSAECONNRESET (10054)";
                break;

            default:
                error.severity = ErrorSeverity::ERROR;
                error.message = L"Network error.";
                error.details = L"WSA Error " + std::to_wstring(wsaError);
                break;
        }

        return error;
    }

    static MudError fromSSLError(int sslError) {
        MudError error;
        error.category = L"TLS";
        error.code = sslError;
        error.severity = ErrorSeverity::ERROR;

        char errorBuf[256];
        ERR_error_string_n(ERR_get_error(), errorBuf, sizeof(errorBuf));

        error.message = L"TLS error during handshake.";
        error.details = std::wstring(errorBuf, errorBuf + strlen(errorBuf));

        return error;
    }

private:
    static void logError(const MudError& error) {
        // Write to error.log
        FILE* f = _wfopen(L"error.log", L"a");
        if (f) {
            fwprintf(f, L"[%s] %s: %s (%s)\n",
                    severityToString(error.severity).c_str(),
                    error.category.c_str(),
                    error.message.c_str(),
                    error.details.c_str());
            fclose(f);
        }
    }

    static void notifyUser(const MudError& error) {
        // Show in status bar or message box
        std::wstring displayMsg = error.category + L": " + error.message;

        if (error.severity == ErrorSeverity::FATAL) {
            MessageBox(nullptr, displayMsg.c_str(), L"Error", MB_OK | MB_ICONERROR);
        } else {
            // Update status bar
            SetWindowText(statusBarHwnd, displayMsg.c_str());
        }
    }

    static std::wstring severityToString(ErrorSeverity severity) {
        switch (severity) {
            case ErrorSeverity::INFO: return L"INFO";
            case ErrorSeverity::WARNING: return L"WARNING";
            case ErrorSeverity::ERROR: return L"ERROR";
            case ErrorSeverity::FATAL: return L"FATAL";
            default: return L"UNKNOWN";
        }
    }
};
```

### 6.3 Error Recovery Patterns

**Network Error Recovery:**

```cpp
void MudClient::onSocketError(int wsaError) {
    MudError error = ErrorHandler::fromWinsockError(wsaError);
    ErrorHandler::handleError(error);

    if (error.severity >= ErrorSeverity::ERROR) {
        // Trigger reconnection
        onSocketDisconnect();
    }
}
```

**TLS Error Recovery:**

```cpp
bool SocketManager::performTLSHandshake() {
    int ret = SSL_connect(ssl);
    if (ret != 1) {
        int sslError = SSL_get_error(ssl, ret);

        MudError error = ErrorHandler::fromSSLError(sslError);
        ErrorHandler::handleError(error);

        return false;
    }
    return true;
}
```

**Protocol Error Recovery:**

```cpp
void MudClient::handleGMCP(const std::string& package, const std::string& data) {
    try {
        json j = json::parse(data);
        // ... dispatch
    }
    catch (const json::exception& e) {
        MudError error;
        error.severity = ErrorSeverity::WARNING;
        error.category = L"Protocol";
        error.message = L"Invalid GMCP JSON";
        error.code = 0;
        error.details = std::wstring(e.what(), e.what() + strlen(e.what()));

        ErrorHandler::handleError(error);

        // Continue operation (non-fatal)
    }
}
```

---

## 7. Code Examples

### 7.1 Complete Connection Flow

```cpp
// Main window creation and connection
int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance,
                   LPSTR lpCmdLine, int nCmdShow) {

    // Create main window
    HWND hwnd = CreateWindow(...);

    // Create MUD client
    MudClient* mudClient = new MudClient(hwnd);

    // Connect
    mudClient->connect();

    // Message pump
    MSG msg;
    while (GetMessage(&msg, nullptr, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    delete mudClient;
    return 0;
}

// MudClient constructor
MudClient::MudClient(HWND hwnd)
    : hwnd(hwnd), socketMgr(hwnd), state(ConnectionState::DISCONNECTED),
      intentionalDisconnect(false), reconnectTimerID(0)
{
    // Wire up SocketManager events
    socketMgr.onConnect = [this]() {
        onSocketConnect();
    };

    socketMgr.onDisconnect = [this]() {
        onSocketDisconnect();
    };

    socketMgr.onReceive = [this](const uint8_t* data, size_t len) {
        telnetParser.parse(data, len);
    };

    socketMgr.onError = [this](int error) {
        onSocketError(error);
    };

    // Wire up TelnetParser events
    telnetParser.onSend = [this](const std::vector<uint8_t>& data) {
        return socketMgr.send(data.data(), data.size());
    };

    telnetParser.onData = [this](const std::vector<uint8_t>& data) {
        handleTelnetData(data);
    };

    telnetParser.onNegotiation = [this](uint8_t command, uint8_t option) {
        handleNegotiation(command, option);
    };

    telnetParser.onGMCP = [this](const std::string& package, const std::string& data) {
        handleGMCP(package, data);
    };
}

void MudClient::onSocketConnect() {
    state = ConnectionState::CONNECTED;

    // Start keep-alive
    SetTimer(hwnd, TIMER_KEEPALIVE, KEEPALIVE_INTERVAL_MS, nullptr);

    // Update UI
    SetWindowText(statusBarHwnd, L"Connected");
}

void MudClient::handleNegotiation(uint8_t command, uint8_t option) {
    using TC = TelnetCommand;
    using TO = TelnetOption;

    if (command == (uint8_t)TC::WILL && option == (uint8_t)TO::GMCP) {
        // Server supports GMCP
        telnetParser.sendNegotiation(TC::DO, TO::GMCP);

        // Send handshake
        json helloData = {
            {"client", "Win32 MUD Client"},
            {"version", "1.0.0"}
        };
        telnetParser.sendGMCP("Core.Hello", helloData.dump());

        json supportsData = {
            {"Core", 1},
            {"Char", 1},
            {"Room", 1},
            {"Comm", 1}
            // ... etc
        };
        telnetParser.sendGMCP("Core.Supports.Set", supportsData.dump());

        // Auto-login (if have token)
        if (!refreshToken.empty()) {
            json loginData = {
                {"refreshToken", refreshToken}
            };
            telnetParser.sendGMCP("Auth.Autologin.Login", loginData.dump());
        }
    }
    else if (command == (uint8_t)TC::DO && option == (uint8_t)TO::TERMINAL_TYPE) {
        telnetParser.sendNegotiation(TC::WILL, TO::TERMINAL_TYPE);
        telnetParser.sendTerminalType("Win32 MUD Client");
        telnetParser.sendTerminalType("ANSI");
        telnetParser.sendTerminalType("NATIVE");
    }
    else if (command == (uint8_t)TC::DO && option == (uint8_t)TO::NAWS) {
        telnetParser.sendNegotiation(TC::WILL, TO::NAWS);
        sendCurrentWindowSize();
    }
}

void MudClient::handleTelnetData(const std::vector<uint8_t>& data) {
    std::wstring decoded = utf8Decoder.decode(data);

    if (decoded.empty()) {
        return;
    }

    // Split by lines
    size_t start = 0;
    size_t end;

    while ((end = decoded.find(L'\n', start)) != std::wstring::npos) {
        std::wstring line = decoded.substr(start, end - start);

        if (!line.empty() && line.back() == L'\r') {
            line.pop_back();
        }

        if (line.size() >= 3 && line.substr(0, 3) == L"#$#") {
            handleMCP(line);
        } else {
            emitMessage(line);
        }

        start = end + 1;
    }
}

void MudClient::emitMessage(const std::wstring& message) {
    // Send to output window
    outputWindow->appendText(message);

    // Auto-read (text-to-speech)
    if (autoreadEnabled) {
        speak(message);
    }
}
```

### 7.2 Send Command Flow

```cpp
void MudClient::sendCommand(const std::wstring& command) {
    // Convert to UTF-8
    int utf8Len = WideCharToMultiByte(CP_UTF8, 0, command.c_str(), -1,
                                       nullptr, 0, nullptr, nullptr);
    std::string utf8Command(utf8Len - 1, 0);
    WideCharToMultiByte(CP_UTF8, 0, command.c_str(), -1,
                        &utf8Command[0], utf8Len, nullptr, nullptr);

    // Local echo
    if (localEchoEnabled) {
        emitMessage(command);
    }

    // Autosay mode
    if (autosayEnabled && !utf8Command.empty() &&
        utf8Command[0] != '-' && utf8Command[0] != '\'') {
        utf8Command = "say " + utf8Command;
    }

    // Append telnet line ending
    utf8Command += "\r\n";

    // Send
    bool success = socketMgr.send(utf8Command.c_str(), utf8Command.size());

    if (!success) {
        MudError error;
        error.severity = ErrorSeverity::WARNING;
        error.category = L"Network";
        error.message = L"Failed to send command";
        ErrorHandler::handleError(error);
    }
}
```

---

## 8. Performance and Optimization

### 8.1 Buffer Sizes

```cpp
// SocketManager receive buffer
static constexpr size_t RECV_BUFFER_SIZE = 8192; // 8 KB

// TelnetParser buffer pre-allocation
TelnetParser::TelnetParser() : state(TelnetState::DATA) {
    buffer.reserve(4096);
    subBuffer.reserve(2048);
}

// UTF8StreamDecoder pending buffer limit
std::wstring UTF8StreamDecoder::decode(const std::vector<uint8_t>& data) {
    // Sanity check: prevent unbounded growth
    if (pendingBytes.size() > 16) {
        // Likely corrupt, flush and reset
        pendingBytes.clear();
    }
    // ... rest of decode
}
```

### 8.2 Keep-Alive Tuning

**TCP Keep-Alive:**
- First probe: 60s
- Interval: 10s
- Max probes: 3
- Total detection: 90s

**GMCP Keep-Alive:**
- Interval: 60s
- Prevents proxy/NAT timeout
- Lighter than TCP (application-level)

```cpp
void MudClient::onKeepAliveTimer() {
    if (state == ConnectionState::CONNECTED ||
        state == ConnectionState::TLS_CONNECTED) {

        // Send empty GMCP keep-alive
        telnetParser.sendGMCP("Core.KeepAlive", "");
    }
}
```

### 8.3 Reconnection Backoff (Future Enhancement)

For production, exponential backoff recommended:

```cpp
class ReconnectionManager {
private:
    int attemptCount = 0;
    static constexpr int MAX_ATTEMPTS = 10;
    static constexpr DWORD BASE_DELAY_MS = 1000;   // 1s
    static constexpr DWORD MAX_DELAY_MS = 60000;   // 60s

public:
    DWORD getNextDelay() {
        if (attemptCount >= MAX_ATTEMPTS) {
            return 0; // Give up
        }

        DWORD delay = BASE_DELAY_MS * (1 << attemptCount); // 2^n
        if (delay > MAX_DELAY_MS) {
            delay = MAX_DELAY_MS;
        }

        attemptCount++;
        return delay;
    }

    void reset() {
        attemptCount = 0;
    }
};

// Usage:
void MudClient::onSocketDisconnect() {
    cleanup();

    if (!intentionalDisconnect) {
        DWORD delay = reconnectionMgr.getNextDelay();
        if (delay > 0) {
            state = ConnectionState::RECONNECT_WAITING;
            reconnectTimerID = SetTimer(hwnd, TIMER_RECONNECT, delay, nullptr);
        } else {
            // Max attempts reached
            state = ConnectionState::DISCONNECTED;
            showError(L"Failed to reconnect after 10 attempts.");
        }
    }
}

void MudClient::onSocketConnect() {
    // Success - reset backoff
    reconnectionMgr.reset();
    // ... rest of connection logic
}
```

---

## 9. Testing Strategy

### 9.1 Unit Tests (Catch2)

**Test TelnetParser:**

```cpp
#include <catch2/catch.hpp>
#include "TelnetParser.h"

TEST_CASE("TelnetParser handles plain data", "[telnet]") {
    TelnetParser parser;
    std::vector<uint8_t> received;

    parser.onData = [&](const std::vector<uint8_t>& data) {
        received = data;
    };

    std::string testData = "Hello, World!";
    parser.parse((const uint8_t*)testData.c_str(), testData.size());

    REQUIRE(received.size() == testData.size());
    REQUIRE(std::string(received.begin(), received.end()) == testData);
}

TEST_CASE("TelnetParser handles IAC WILL GMCP", "[telnet]") {
    TelnetParser parser;
    uint8_t receivedCmd = 0;
    uint8_t receivedOpt = 0;

    parser.onNegotiation = [&](uint8_t cmd, uint8_t opt) {
        receivedCmd = cmd;
        receivedOpt = opt;
    };

    uint8_t data[] = {255, 251, 201}; // IAC WILL GMCP
    parser.parse(data, sizeof(data));

    REQUIRE(receivedCmd == 251); // WILL
    REQUIRE(receivedOpt == 201); // GMCP
}

TEST_CASE("TelnetParser handles GMCP subnegotiation", "[telnet]") {
    TelnetParser parser;
    std::string receivedPackage;
    std::string receivedData;

    parser.onGMCP = [&](const std::string& pkg, const std::string& data) {
        receivedPackage = pkg;
        receivedData = data;
    };

    std::string gmcp = "Room.Info {\"name\":\"Test\"}";
    std::vector<uint8_t> data;
    data.push_back(255); // IAC
    data.push_back(250); // SB
    data.push_back(201); // GMCP
    data.insert(data.end(), gmcp.begin(), gmcp.end());
    data.push_back(255); // IAC
    data.push_back(240); // SE

    parser.parse(data.data(), data.size());

    REQUIRE(receivedPackage == "Room.Info");
    REQUIRE(receivedData == "{\"name\":\"Test\"}");
}
```

**Test UTF8StreamDecoder:**

```cpp
TEST_CASE("UTF8StreamDecoder handles split sequences", "[utf8]") {
    UTF8StreamDecoder decoder;

    // UTF-8 for ✓ (U+2713): E2 9C 93
    uint8_t chunk1[] = {0xE2, 0x9C}; // Incomplete
    uint8_t chunk2[] = {0x93};        // Completion

    std::wstring result1 = decoder.decode(std::vector<uint8_t>(chunk1, chunk1 + 2));
    REQUIRE(result1.empty()); // Buffered

    std::wstring result2 = decoder.decode(std::vector<uint8_t>(chunk2, chunk2 + 1));
    REQUIRE(result2 == L"\u2713"); // ✓
}

TEST_CASE("UTF8StreamDecoder handles complete characters", "[utf8]") {
    UTF8StreamDecoder decoder;

    std::string utf8 = "Hello, World!";
    std::vector<uint8_t> data(utf8.begin(), utf8.end());

    std::wstring result = decoder.decode(data);
    REQUIRE(result == L"Hello, World!");
}
```

### 9.2 Integration Tests

**Test Connection Lifecycle:**

```cpp
TEST_CASE("Connection lifecycle", "[integration]") {
    HWND testHwnd = CreateTestWindow();
    SocketManager sockMgr(testHwnd);

    bool connected = false;
    sockMgr.onConnect = [&]() { connected = true; };

    bool success = sockMgr.connect("localhost", "7777");
    REQUIRE(success);

    // Wait for connection (pump messages)
    MSG msg;
    DWORD start = GetTickCount();
    while (!connected && GetTickCount() - start < 5000) {
        if (PeekMessage(&msg, nullptr, 0, 0, PM_REMOVE)) {
            DispatchMessage(&msg);
        }
        Sleep(10);
    }

    REQUIRE(connected);

    sockMgr.disconnect();
}
```

### 9.3 Network Simulation Tests

**Test Reconnection:**

```cpp
TEST_CASE("Auto-reconnection after disconnect", "[reconnect]") {
    MudClient client(testHwnd);

    int connectCount = 0;
    client.onConnect = [&]() { connectCount++; };

    client.connect();
    // ... wait for connection

    // Simulate server disconnect
    client.simulateDisconnect();

    // Should auto-reconnect after 10s
    Sleep(11000);
    pumpMessages();

    REQUIRE(connectCount == 2); // Initial + reconnect
}
```

---

## 10. Summary and Recommendations

### 10.1 Design Decisions Summary

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Socket I/O** | WSAAsyncSelect | Simple GUI integration, single connection |
| **TLS Library** | OpenSSL | Better docs than Schannel, cross-platform |
| **Telnet Parser** | Port from TypeScript | Proven state machine, well-tested |
| **UTF-8 Handling** | Streaming decoder with buffering | Handles split sequences correctly |
| **Connection Model** | Single-threaded, message-based | No locking, integrates with message pump |
| **Keep-Alive** | GMCP heartbeat (60s) + TCP keep-alive | Application + transport redundancy |
| **Reconnection** | Fixed 10s delay (MVP) | Matches web client, exponential for v2 |
| **Error Handling** | Severity-based with recovery | User-friendly messages, auto-recovery |

### 10.2 Critical Path Items

**Week 1-2: Foundation**
1. SocketManager with WSAAsyncSelect
2. Basic connect/disconnect/send/receive
3. Window message integration

**Week 3-4: Protocol**
1. TelnetParser state machine
2. IAC sequence handling
3. GMCP subnegotiation parsing

**Week 5-6: Encoding**
1. UTF8StreamDecoder with buffering
2. UTF-16 ↔ UTF-8 conversion helpers
3. Line-based message routing

**Week 7-8: Polish**
1. TLS via OpenSSL
2. Error handling framework
3. Reconnection logic

### 10.3 Known Limitations (MVP)

1. **No File Transfer:** WebRTC not implemented (requires libdatachannel or custom protocol)
2. **No MIDI:** Windows MIDI API integration deferred
3. **Fixed Reconnection Delay:** Exponential backoff deferred to v2
4. **Certificate Pinning:** TLS validation basic (accept any valid cert)
5. **No Proxy Support:** Direct connection only (SOCKS/HTTP proxy for v2)

### 10.4 Production Readiness Checklist

- [x] Non-blocking I/O (WSAAsyncSelect)
- [x] UTF-8 split sequence handling
- [x] Telnet state machine with buffering
- [x] GMCP/MCP parsing
- [x] Auto-reconnection
- [x] Keep-alive (GMCP + TCP)
- [x] Error handling with user feedback
- [x] Window size negotiation (NAWS)
- [ ] TLS certificate validation (basic only)
- [ ] Exponential backoff (deferred)
- [ ] File transfer (deferred)
- [ ] MIDI support (deferred)

### 10.5 Next Steps

1. **Implement SocketManager** (2 days)
2. **Port TelnetParser** (3 days)
3. **UTF8StreamDecoder** (1 day)
4. **Integration testing** (2 days)
5. **TLS integration** (3 days)
6. **Error handling** (2 days)
7. **UI integration** (ongoing with other components)

**Total Estimated Time:** 2-3 weeks for networking layer MVP

---

## References

- **Wave 1 Networking Report:** `reports/win32/wave1/04-networking.md`
- **Wave 2 Verification Report:** `reports/win32/wave2/03-networking-verify.md`
- **Source Files:**
  - `src/telnet.ts` - TelnetParser reference implementation
  - `src/client.ts` - Connection lifecycle and event handling
  - `src/mcp.ts` - MCP message parsing
- **External Documentation:**
  - Winsock2: https://docs.microsoft.com/en-us/windows/win32/winsock/
  - OpenSSL: https://www.openssl.org/docs/
  - Telnet RFC 854: https://tools.ietf.org/html/rfc854
  - GMCP Spec: https://www.gammon.com.au/gmcp

---

**Document Version:** 1.0
**Date:** 2025-12-17
**Author:** Claude Sonnet 4.5
**Status:** Design Specification (Ready for Implementation)
