# Win32 MUD Client - Complete Architecture Design

**Date**: 2025-12-17
**Project**: Native Windows MUD Client for Mongoose MOO
**Reference Implementation**: msvc-example (ModernWinApp)
**Source Analysis**: React client codebase

---

## Executive Summary

This document defines the complete architecture for a native Win32 MUD client that ports the React-based Mongoose client to native Windows using C++20. The design follows the proven patterns from the msvc-example reference implementation while adapting them for the specific requirements of a MUD client: terminal output, network communication, and protocol handling.

**Key Design Decisions**:
- Pure Win32 API (no MFC/WTL/Qt)
- C++20 with modern RAII and move semantics
- Three-layer architecture: Core (protocol logic), Network (socket management), UI (Win32 wrappers)
- CMake build system with MSVC
- RichEdit control for terminal display (ANSI color support)
- WinSock2 for direct TCP/TLS connections (NO WebSocket proxy needed)
- Unit testable core with Google Test

**Estimated Complexity**: ~12,000-15,000 LOC (vs React client ~6,000 LOC TypeScript)

**Timeline Estimate**: 16-20 weeks (4-5 months) for feature parity

---

## Table of Contents

1. [Application Architecture](#1-application-architecture)
2. [Directory Structure](#2-directory-structure)
3. [Core Module: Protocol Logic](#3-core-module-protocol-logic)
4. [Network Module: Socket Management](#4-network-module-socket-management)
5. [UI Module: Win32 Components](#5-ui-module-win32-components)
6. [Main Window Structure](#6-main-window-structure)
7. [External Dependencies](#7-external-dependencies)
8. [Build System Design](#8-build-system-design)
9. [Testing Strategy](#9-testing-strategy)
10. [Implementation Phases](#10-implementation-phases)
11. [React to Win32 Component Mapping](#11-react-to-win32-component-mapping)
12. [Performance Targets](#12-performance-targets)
13. [Accessibility Features](#13-accessibility-features)
14. [Risk Assessment](#14-risk-assessment)

---

## 1. Application Architecture

### 1.1 Three-Layer Architecture

Following the msvc-example pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                    ENTRY POINT                              │
│  main.cpp (WinMain)                                         │
│  - COM initialization                                       │
│  - Common Controls initialization                           │
│  - Message loop with accelerator support                    │
│  - IsDialogMessage for keyboard navigation                  │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    UI LAYER                                 │
│  src/ui/ (Win32 wrappers, no business logic)               │
│  - MainWindow: Window lifecycle, layout, message routing    │
│  - TerminalControl: RichEdit-based output display           │
│  - InputBar: Command input with history                     │
│  - SidebarPanel: Tabbed information panels                  │
│  - Toolbar, StatusBar, MenuBar: Chrome elements             │
│  - PreferencesDialog: Settings UI                           │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  NETWORK LAYER                              │
│  src/network/ (Connection management, NO Win32)             │
│  - TcpConnection: WinSock2 socket wrapper                   │
│  - TelnetParser: Telnet protocol state machine              │
│  - TlsContext: Schannel SSL/TLS wrapper                     │
│  - ConnectionManager: Reconnection, keep-alive              │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    CORE LAYER                               │
│  src/core/ (Pure C++20, ZERO Win32/network dependencies)   │
│  - GmcpPackage: Base class for GMCP handlers                │
│  - McpPackage: Base class for MCP handlers                  │
│  - TextBuffer: Scrollback buffer with ANSI runs             │
│  - CommandHistory: Input history management                 │
│  - PreferencesStore: Settings persistence                   │
│  - All 26+ GMCP packages (Char, Room, Client, Comm, etc.)  │
└─────────────────────────────────────────────────────────────┘
```

**Critical Principle**: Core layer has **ZERO external dependencies**. All business logic lives here and can be tested without creating windows or sockets.

---

### 1.2 Data Flow Patterns

**Network → Core (Incoming Data)**:
```cpp
// WinSock receives data
void TcpConnection::OnDataReceived(const std::vector<uint8_t>& data) {
    telnetParser.Parse(data);  // Parse telnet sequences
}

// Telnet parser emits clean data
void TelnetParser::EmitData(const std::string& text) {
    for (auto& line : SplitLines(text)) {
        if (IsMcpMessage(line)) {
            mcpDispatcher.HandleMessage(line);
        } else {
            textBuffer.AppendLine(ParseAnsi(line));
        }
    }
}

// Core model updated, notify UI
void TextBuffer::AppendLine(const std::vector<TextRun>& runs) {
    lines.push_back(runs);
    onLineAdded(lines.size() - 1);  // Callback to UI
}
```

**User Input → Network (Outgoing Commands)**:
```cpp
// User types in input bar
void InputBar::OnEnterKey() {
    std::wstring command = GetText();
    commandHistory.Add(command);

    // Optional local echo
    if (preferences.localEcho) {
        textBuffer.AppendCommand(command);
    }

    // Send to server
    connection->SendCommand(command);
}

void TcpConnection::SendCommand(const std::wstring& cmd) {
    std::string utf8 = WideToUtf8(cmd) + "\r\n";
    Send(utf8);
}
```

**GMCP Communication**:
```cpp
// Server → Client
void TelnetParser::OnSubnegotiation(uint8_t option, const std::vector<uint8_t>& data) {
    if (option == TELNET_GMCP) {
        std::string gmcpString = BytesToString(data);
        auto [package, json] = SplitGmcpMessage(gmcpString);
        gmcpDispatcher.Dispatch(package, json);
    }
}

void GmcpDispatcher::Dispatch(const std::string& package, const std::string& json) {
    auto handler = handlers[package];
    if (handler) {
        auto parsedData = nlohmann::json::parse(json);
        handler->Handle(parsedData);
    }
}

// Client → Server
void GmcpPackage::SendData(const std::string& messageName, const nlohmann::json& data) {
    std::string package = packageName + "." + messageName;
    std::string json = data.dump();
    telnetConnection->SendGmcp(package, json);
}
```

---

### 1.3 Memory Management Strategy

Following msvc-example RAII patterns:

**Ownership:**
```cpp
class MainWindow {
    // UI components - unique_ptr for automatic cleanup
    std::unique_ptr<TerminalControl> terminalControl_;
    std::unique_ptr<InputBar> inputBar_;
    std::unique_ptr<SidebarPanel> sidebar_;
    std::unique_ptr<StatusBar> statusBar_;
    std::unique_ptr<Toolbar> toolbar_;

    // Core models - value types
    std::unique_ptr<Core::TextBuffer> textBuffer_;
    std::unique_ptr<Core::CommandHistory> commandHistory_;
    std::unique_ptr<Core::PreferencesStore> preferences_;

    // Network layer
    std::unique_ptr<Network::ConnectionManager> connection_;

    // Win32 handles cleaned up in destructor
    HWND hwnd_ = nullptr;
};
```

**No manual new/delete** - all memory managed via:
- `std::unique_ptr` for owned objects
- `std::shared_ptr` for shared ownership (e.g., event handlers)
- `std::vector` for collections
- RAII wrappers for Win32 handles (HWND, HDC, HFONT, etc.)
- Move semantics to prevent accidental copies

**Resource Wrappers:**
```cpp
// RAII wrapper for Win32 handles
template<typename HandleType, typename DeleterFunc>
class Win32Handle {
    HandleType handle_;
    DeleterFunc deleter_;
public:
    Win32Handle(HandleType h, DeleterFunc d) : handle_(h), deleter_(d) {}
    ~Win32Handle() { if (handle_) deleter_(handle_); }

    Win32Handle(const Win32Handle&) = delete;
    Win32Handle& operator=(const Win32Handle&) = delete;
    Win32Handle(Win32Handle&&) noexcept = default;
    Win32Handle& operator=(Win32Handle&&) noexcept = default;

    HandleType get() const { return handle_; }
};

// Usage
Win32Handle<HFONT> font(CreateFont(...), DeleteObject);
```

---

## 2. Directory Structure

```
mongoose-win32/
├── src/
│   ├── main.cpp                    # Entry point (WinMain)
│   ├── resource.h                  # Resource IDs
│   ├── app.rc                      # Resources (icons, menus, accelerators)
│   ├── app.manifest                # DPI awareness, visual styles
│   │
│   ├── core/                       # Pure C++ business logic
│   │   ├── TextBuffer.h/cpp        # Scrollback buffer with ANSI
│   │   ├── TextRun.h               # Formatted text segment
│   │   ├── CommandHistory.h/cpp    # Input history
│   │   ├── PreferencesStore.h/cpp  # Settings persistence
│   │   ├── GmcpPackage.h/cpp       # Base GMCP package
│   │   ├── McpPackage.h/cpp        # Base MCP package
│   │   ├── GmcpDispatcher.h/cpp    # GMCP message routing
│   │   ├── McpDispatcher.h/cpp     # MCP message routing
│   │   ├── AnsiParser.h/cpp        # ANSI escape code parsing
│   │   ├── gmcp/                   # GMCP packages
│   │   │   ├── Core.h/cpp          # Core.Hello, Core.Ping
│   │   │   ├── CoreSupports.h/cpp  # Core.Supports.Set
│   │   │   ├── Auth.h/cpp          # Auth.Autologin
│   │   │   ├── Room.h/cpp          # Room.Info
│   │   │   ├── Char/               # Character packages
│   │   │   │   ├── Status.h/cpp
│   │   │   │   ├── Items.h/cpp
│   │   │   │   ├── Skills.h/cpp
│   │   │   │   ├── Vitals.h/cpp
│   │   │   │   └── ...
│   │   │   ├── Client/             # Client packages
│   │   │   │   ├── Media.h/cpp
│   │   │   │   ├── Midi.h/cpp
│   │   │   │   ├── Speech.h/cpp
│   │   │   │   └── ...
│   │   │   └── Comm/               # Communication packages
│   │   │       └── Channel.h/cpp
│   │   └── mcp/                    # MCP packages
│   │       ├── SimpleEdit.h/cpp
│   │       ├── Userlist.h/cpp
│   │       ├── Status.h/cpp
│   │       └── Ping.h/cpp
│   │
│   ├── network/                    # Socket and protocol layer
│   │   ├── TcpConnection.h/cpp     # WinSock2 TCP wrapper
│   │   ├── TlsContext.h/cpp        # Schannel TLS wrapper
│   │   ├── TelnetParser.h/cpp      # Telnet state machine
│   │   ├── TelnetCommand.h         # Telnet constants
│   │   ├── ConnectionManager.h/cpp # Reconnection, keep-alive
│   │   └── NetworkBuffer.h/cpp     # Binary-safe buffering
│   │
│   └── ui/                         # Win32 UI components
│       ├── MainWindow.h/cpp        # Main application window
│       ├── TerminalControl.h/cpp   # RichEdit-based output
│       ├── InputBar.h/cpp          # Command input
│       ├── SidebarPanel.h/cpp      # Tabbed sidebar
│       ├── TabControl.h/cpp        # Tab navigation
│       ├── Toolbar.h/cpp           # Top toolbar
│       ├── StatusBar.h/cpp         # Bottom status bar
│       ├── MenuBar.h/cpp           # Menu management
│       ├── PreferencesDialog.h/cpp # Settings dialog
│       ├── Splitter.h/cpp          # Resizable splitter
│       ├── RoomInfoPanel.h/cpp     # Room display
│       ├── InventoryPanel.h/cpp    # Inventory list
│       ├── UserlistPanel.h/cpp     # Player list
│       ├── ItemCard.h/cpp          # Item detail view
│       ├── PlayerCard.h/cpp        # Player detail view
│       └── AccessibleListView.h/cpp # Keyboard-navigable list
│
├── tests/                          # Unit tests
│   ├── unit/
│   │   ├── TelnetParserTests.cpp
│   │   ├── TextBufferTests.cpp
│   │   ├── AnsiParserTests.cpp
│   │   ├── GmcpDispatcherTests.cpp
│   │   ├── CommandHistoryTests.cpp
│   │   └── ...
│   └── CMakeLists.txt
│
├── external/                       # Third-party dependencies
│   ├── json/                       # nlohmann/json (header-only)
│   └── googletest/                 # Fetched by CMake
│
├── CMakeLists.txt                  # Main build configuration
├── README.md
└── LICENSE
```

**Total Estimated Files**:
- Core: ~40 files (GMCP/MCP packages)
- Network: ~8 files
- UI: ~20 files
- Tests: ~20 files
- **Total**: ~90 files (vs React client ~95 files)

---

## 3. Core Module: Protocol Logic

### 3.1 TextBuffer - Scrollback Management

**File**: `src/core/TextBuffer.h`

```cpp
#pragma once
#include <vector>
#include <string>
#include <functional>
#include "TextRun.h"

namespace Core {

// A line of text with ANSI formatting
struct TextLine {
    std::vector<TextRun> runs;  // Colored/formatted segments
    bool isCommand = false;     // Local echo
    bool isSystem = false;      // System message
    bool isError = false;       // Error message
};

class TextBuffer {
public:
    static constexpr size_t MAX_LINES = 7500;

    // Add line to buffer
    void AppendLine(std::vector<TextRun> runs, bool isCommand = false);
    void AppendSystemMessage(const std::wstring& text);
    void AppendError(const std::wstring& text);

    // Query
    size_t GetLineCount() const { return lines_.size(); }
    const TextLine& GetLine(size_t index) const { return lines_[index]; }
    const std::vector<TextLine>& GetAllLines() const { return lines_; }

    // Modification
    void Clear();
    void TrimToMaxSize();

    // Callbacks for UI updates
    using LineAddedCallback = std::function<void(size_t lineIndex)>;
    void SetLineAddedCallback(LineAddedCallback cb) { onLineAdded_ = cb; }

    // Persistence
    void SaveToFile(const std::wstring& path) const;

    // Copy to clipboard
    std::wstring GetAllText() const;

private:
    std::vector<TextLine> lines_;
    LineAddedCallback onLineAdded_;
};

} // namespace Core
```

**File**: `src/core/TextRun.h`

```cpp
#pragma once
#include <string>
#include <Windows.h>

namespace Core {

// A segment of text with formatting
struct TextRun {
    std::wstring text;
    COLORREF color = RGB(255, 255, 255);  // White default
    bool bold = false;
    bool italic = false;
    bool underline = false;
    bool strikethrough = false;
};

} // namespace Core
```

---

### 3.2 GMCP Package Architecture

**File**: `src/core/GmcpPackage.h`

```cpp
#pragma once
#include <string>
#include <functional>
#include <nlohmann/json.hpp>

namespace Core {

class GmcpDispatcher;

class GmcpPackage {
public:
    virtual ~GmcpPackage() = default;

    // Package metadata
    virtual std::string GetPackageName() const = 0;
    virtual int GetPackageVersion() const { return 1; }
    virtual bool IsEnabled() const { return true; }

    // Override to handle specific messages
    // Example: handleInfo(json) for Room.Info
    virtual void HandleMessage(const std::string& messageType,
                              const nlohmann::json& data) = 0;

protected:
    // Send GMCP data to server
    void SendData(const std::string& messageName, const nlohmann::json& data);

    // Event notification
    using EventCallback = std::function<void(const std::string&, const nlohmann::json&)>;
    void EmitEvent(const std::string& eventName, const nlohmann::json& data);

    friend class GmcpDispatcher;
    GmcpDispatcher* dispatcher_ = nullptr;
};

} // namespace Core
```

**Example Package**: `src/core/gmcp/Room.h`

```cpp
#pragma once
#include "../GmcpPackage.h"

namespace Core::Gmcp {

struct RoomInfo {
    int id = 0;
    std::wstring name;
    std::wstring area;
    std::map<std::wstring, std::wstring> exits;  // direction -> target
    std::vector<std::wstring> contents;  // Items in room
    std::vector<std::wstring> players;   // Players in room
};

class RoomPackage : public GmcpPackage {
public:
    std::string GetPackageName() const override { return "Room"; }

    void HandleMessage(const std::string& messageType,
                      const nlohmann::json& data) override;

    // Accessors
    const RoomInfo& GetCurrentRoom() const { return currentRoom_; }

    // Callbacks
    using RoomChangedCallback = std::function<void(const RoomInfo&)>;
    void SetRoomChangedCallback(RoomChangedCallback cb) { onRoomChanged_ = cb; }

private:
    void HandleInfo(const nlohmann::json& data);
    void HandleUpdate(const nlohmann::json& data);

    RoomInfo currentRoom_;
    RoomChangedCallback onRoomChanged_;
};

} // namespace Core::Gmcp
```

---

### 3.3 GMCP Dispatcher

**File**: `src/core/GmcpDispatcher.h`

```cpp
#pragma once
#include <map>
#include <memory>
#include <string>
#include <nlohmann/json.hpp>
#include "GmcpPackage.h"

namespace Core {

class GmcpDispatcher {
public:
    // Register a package
    template<typename T>
    T* RegisterPackage() {
        auto pkg = std::make_unique<T>();
        pkg->dispatcher_ = this;
        T* ptr = pkg.get();
        packages_[pkg->GetPackageName()] = std::move(pkg);
        return ptr;
    }

    // Handle incoming GMCP message
    void Dispatch(const std::string& fullPackage, const std::string& jsonData);

    // Get list of supported packages for Core.Supports.Set
    std::vector<std::string> GetSupportedPackages() const;

    // Send GMCP to network layer
    using SendCallback = std::function<void(const std::string&, const std::string&)>;
    void SetSendCallback(SendCallback cb) { onSend_ = cb; }

    void SendGmcp(const std::string& packageName, const nlohmann::json& data);

private:
    std::map<std::string, std::unique_ptr<GmcpPackage>> packages_;
    SendCallback onSend_;
};

} // namespace Core
```

**Implementation**: `src/core/GmcpDispatcher.cpp`

```cpp
void GmcpDispatcher::Dispatch(const std::string& fullPackage,
                               const std::string& jsonData) {
    // Split "Room.Info" -> "Room", "Info"
    auto dotPos = fullPackage.find_last_of('.');
    if (dotPos == std::string::npos) return;

    std::string packageName = fullPackage.substr(0, dotPos);
    std::string messageType = fullPackage.substr(dotPos + 1);

    auto it = packages_.find(packageName);
    if (it == packages_.end()) {
        // No handler registered
        return;
    }

    try {
        nlohmann::json data = nlohmann::json::parse(jsonData.empty() ? "{}" : jsonData);
        it->second->HandleMessage(messageType, data);
    } catch (const std::exception& e) {
        // Log parse error
    }
}
```

---

### 3.4 Telnet Protocol Implementation (Network Layer)

**File**: `src/network/TelnetParser.h`

```cpp
#pragma once
#include <vector>
#include <cstdint>
#include <functional>
#include <string>

namespace Network {

enum class TelnetState {
    Data,
    Command,
    Negotiation,
    Subnegotiation
};

enum TelnetCommand : uint8_t {
    IAC = 255,
    WILL = 251,
    WONT = 252,
    DO = 253,
    DONT = 254,
    SB = 250,
    SE = 240,
    NOP = 241,
    // ... other commands
};

enum TelnetOption : uint8_t {
    TERMINAL_TYPE = 24,
    GMCP = 201,
    // ... other options
};

class TelnetParser {
public:
    // Callbacks
    using DataCallback = std::function<void(const std::vector<uint8_t>&)>;
    using NegotiationCallback = std::function<void(uint8_t command, uint8_t option)>;
    using GmcpCallback = std::function<void(const std::string& package, const std::string& data)>;

    void SetDataCallback(DataCallback cb) { onData_ = cb; }
    void SetNegotiationCallback(NegotiationCallback cb) { onNegotiation_ = cb; }
    void SetGmcpCallback(GmcpCallback cb) { onGmcp_ = cb; }

    // Parse incoming binary data
    void Parse(const std::vector<uint8_t>& data);

    // Send telnet sequences
    void SendNegotiation(uint8_t command, uint8_t option);
    void SendTerminalType(const std::string& type);
    void SendGmcp(const std::string& package, const std::string& jsonData);

    // Get outgoing buffer for sending
    std::vector<uint8_t> GetOutgoingData();

private:
    void HandleData();
    bool HandleCommand();
    bool HandleNegotiation();
    bool HandleSubnegotiation();
    void HandleGmcp(const std::vector<uint8_t>& data);

    TelnetState state_ = TelnetState::Data;
    std::vector<uint8_t> buffer_;
    std::vector<uint8_t> outgoingBuffer_;
    uint8_t negotiationByte_ = 0;

    DataCallback onData_;
    NegotiationCallback onNegotiation_;
    GmcpCallback onGmcp_;
};

} // namespace Network
```

This directly ports the React client's `telnet.ts` logic to C++.

---

### 3.5 TCP Connection with TLS

**File**: `src/network/TcpConnection.h`

```cpp
#pragma once
#include <string>
#include <functional>
#include <WinSock2.h>
#include <memory>

namespace Network {

class TlsContext;

enum class ConnectionState {
    Disconnected,
    Connecting,
    Connected,
    Failed
};

class TcpConnection {
public:
    TcpConnection();
    ~TcpConnection();

    // Connection management
    void Connect(const std::string& host, uint16_t port, bool useTls = true);
    void Disconnect();
    bool IsConnected() const { return state_ == ConnectionState::Connected; }

    // Data transfer
    void Send(const std::vector<uint8_t>& data);
    void Send(const std::string& text);  // UTF-8

    // Callbacks
    using StateCallback = std::function<void(ConnectionState)>;
    using DataCallback = std::function<void(const std::vector<uint8_t>&)>;
    using ErrorCallback = std::function<void(const std::string&)>;

    void SetStateCallback(StateCallback cb) { onStateChanged_ = cb; }
    void SetDataCallback(DataCallback cb) { onDataReceived_ = cb; }
    void SetErrorCallback(ErrorCallback cb) { onError_ = cb; }

private:
    void DoConnect();
    void DoReceive();
    void DoSend();
    void CleanupSocket();

    std::string host_;
    uint16_t port_ = 0;
    bool useTls_ = false;
    ConnectionState state_ = ConnectionState::Disconnected;

    SOCKET socket_ = INVALID_SOCKET;
    std::unique_ptr<TlsContext> tlsContext_;

    std::vector<uint8_t> receiveBuffer_;
    std::vector<uint8_t> sendBuffer_;

    StateCallback onStateChanged_;
    DataCallback onDataReceived_;
    ErrorCallback onError_;
};

} // namespace Network
```

**Note**: Uses WinSock2 (`<WinSock2.h>`, `<ws2tcpip.h>`) with Schannel for TLS, not OpenSSL. Windows-native.

---

## 4. Network Module: Socket Management

### 4.1 Connection Manager with Reconnection

**File**: `src/network/ConnectionManager.h`

```cpp
#pragma once
#include "TcpConnection.h"
#include "TelnetParser.h"
#include <memory>
#include <chrono>

namespace Network {

class ConnectionManager {
public:
    ConnectionManager();

    // Connection
    void Connect(const std::string& host, uint16_t port, bool useTls = true);
    void Disconnect(bool intentional = true);
    bool IsConnected() const;

    // Send commands
    void SendCommand(const std::wstring& command);
    void SendGmcp(const std::string& package, const std::string& jsonData);

    // Callbacks (forward from TcpConnection and TelnetParser)
    using StateCallback = std::function<void(bool connected)>;
    using DataCallback = std::function<void(const std::string& text)>;
    using GmcpCallback = std::function<void(const std::string& pkg, const std::string& data)>;

    void SetStateCallback(StateCallback cb) { onConnectionChanged_ = cb; }
    void SetDataCallback(DataCallback cb) { onTextData_ = cb; }
    void SetGmcpCallback(GmcpCallback cb) { onGmcp_ = cb; }

    // Reconnection settings
    void SetAutoReconnect(bool enable) { autoReconnect_ = enable; }
    void SetReconnectDelay(int seconds) { reconnectDelaySeconds_ = seconds; }

private:
    void OnConnectionStateChanged(ConnectionState state);
    void OnSocketDataReceived(const std::vector<uint8_t>& data);
    void OnTelnetDataReceived(const std::vector<uint8_t>& data);
    void OnTelnetNegotiation(uint8_t command, uint8_t option);
    void OnTelnetGmcp(const std::string& package, const std::string& data);

    void ScheduleReconnect();
    void CancelReconnect();

    std::unique_ptr<TcpConnection> connection_;
    std::unique_ptr<TelnetParser> telnetParser_;

    std::string host_;
    uint16_t port_ = 0;
    bool useTls_ = false;
    bool intentionalDisconnect_ = false;
    bool autoReconnect_ = true;
    int reconnectDelaySeconds_ = 10;

    StateCallback onConnectionChanged_;
    DataCallback onTextData_;
    GmcpCallback onGmcp_;
};

} // namespace Network
```

**Implementation highlights**:
- Auto-reconnect after 10 seconds (configurable)
- UTF-8 encoding/decoding for text
- Integrates TelnetParser for protocol handling
- Forwards GMCP messages to core layer

---

## 5. UI Module: Win32 Components

### 5.1 Main Window Structure

**File**: `src/ui/MainWindow.h`

```cpp
#pragma once
#include <Windows.h>
#include <memory>

namespace UI {

class TerminalControl;
class InputBar;
class SidebarPanel;
class Toolbar;
class StatusBar;
class Splitter;

} // namespace UI

namespace Core {
class TextBuffer;
class CommandHistory;
class GmcpDispatcher;
}

namespace Network {
class ConnectionManager;
}

class MainWindow {
public:
    // Factory methods
    static bool RegisterClass(HINSTANCE hInstance);
    static HWND Create(HINSTANCE hInstance, int nCmdShow);

private:
    MainWindow();
    ~MainWindow();

    // Window procedure
    static LRESULT CALLBACK WindowProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam);

    // Message handlers
    void OnCreate(HWND hwnd);
    void OnSize(int width, int height);
    void OnCommand(WORD id, WORD notifyCode);
    void OnDestroy();
    void OnDpiChanged(UINT dpi, const RECT* newRect);
    void OnClose();

    // UI callbacks
    void OnInputSend(const std::wstring& command);
    void OnConnectionStateChanged(bool connected);
    void OnTextDataReceived(const std::string& text);
    void OnGmcpReceived(const std::string& package, const std::string& data);

    // Layout
    void UpdateLayout();
    int ScaleForDpi(int value) const;

    // UI components (owned)
    std::unique_ptr<UI::TerminalControl> terminal_;
    std::unique_ptr<UI::InputBar> inputBar_;
    std::unique_ptr<UI::SidebarPanel> sidebar_;
    std::unique_ptr<UI::Toolbar> toolbar_;
    std::unique_ptr<UI::StatusBar> statusBar_;
    std::unique_ptr<UI::Splitter> splitter_;

    // Core models (owned)
    std::unique_ptr<Core::TextBuffer> textBuffer_;
    std::unique_ptr<Core::CommandHistory> commandHistory_;
    std::unique_ptr<Core::GmcpDispatcher> gmcpDispatcher_;

    // Network (owned)
    std::unique_ptr<Network::ConnectionManager> connection_;

    // Win32 state
    HWND hwnd_ = nullptr;
    HINSTANCE hInstance_ = nullptr;
    UINT dpi_ = 96;
    int splitterPos_ = 600;
    bool sidebarVisible_ = true;
};
```

**Layout Grid** (similar to React CSS Grid):

```
┌─────────────────────────────────────────────────┐
│ Toolbar (height: auto)                          │
├───────────────────────────┬─────────────────────┤
│                           │                     │
│  TerminalControl          │  SidebarPanel       │
│  (flex: 1)                │  (width: 300px)     │
│                           │                     │
│                           │  ┌────────────────┐ │
│                           │  │ Tabs           │ │
│                           │  ├────────────────┤ │
│                           │  │ Room Info      │ │
│                           │  │ Inventory      │ │
│                           │  │ Players        │ │
│                           │  │ ...            │ │
│                           │  └────────────────┘ │
├───────────────────────────┴─────────────────────┤
│ InputBar (height: 60px)                         │
├─────────────────────────────────────────────────┤
│ StatusBar (height: 24px)                        │
└─────────────────────────────────────────────────┘
```

Implemented using `MoveWindow()` in `OnSize()` handler.

---

### 5.2 Terminal Control (RichEdit-based)

**File**: `src/ui/TerminalControl.h`

```cpp
#pragma once
#include <Windows.h>
#include <Richedit.h>
#include <memory>
#include <functional>

namespace Core { class TextBuffer; struct TextLine; }

namespace UI {

class TerminalControl {
public:
    TerminalControl();
    ~TerminalControl();

    // Create the control
    HWND Create(HWND hwndParent, int id, int x, int y, int width, int height);
    HWND GetHandle() const { return hwnd_; }

    // Link to core text buffer
    void SetTextBuffer(Core::TextBuffer* buffer);

    // Display updates
    void AppendLine(size_t lineIndex);  // Called when buffer adds line
    void ScrollToBottom();
    void Clear();

    // User actions
    void SaveToFile(const std::wstring& path);
    void CopyToClipboard();

    // Callbacks
    using ExitClickCallback = std::function<void(const std::wstring& exit)>;
    void SetExitClickCallback(ExitClickCallback cb) { onExitClick_ = cb; }

private:
    void AppendTextLine(const Core::TextLine& line);
    void ApplyTextRun(const std::wstring& text, COLORREF color, bool bold,
                      bool italic, bool underline);
    void DetectAndLinkifyUrls(const std::wstring& text);

    HWND hwnd_ = nullptr;
    Core::TextBuffer* textBuffer_ = nullptr;
    ExitClickCallback onExitClick_;
};

} // namespace UI
```

**Implementation Notes**:
- Uses `MSFTEDIT_CLASS` (RichEdit 4.1+)
- `ES_READONLY | ES_MULTILINE | ES_AUTOVSCROLL | WS_VSCROLL`
- Black background (`RGB(0, 0, 0)`), white text default
- `EM_SETCHARFORMAT` to apply ANSI colors
- `EM_SETTEXTMODE` with `TM_PLAINTEXT | TM_MULTILEVELUNDO`
- Auto-scroll when at bottom (check `EM_GETSCROLLPOS`)
- Handle `EN_LINK` for clickable URLs/exits

**ANSI Rendering**:
```cpp
void TerminalControl::ApplyTextRun(const std::wstring& text, COLORREF color,
                                    bool bold, bool italic, bool underline) {
    CHARFORMAT2W cf = {};
    cf.cbSize = sizeof(CHARFORMAT2W);
    cf.dwMask = CFM_COLOR | CFM_BOLD | CFM_ITALIC | CFM_UNDERLINE;
    cf.crTextColor = color;
    if (bold) cf.dwEffects |= CFE_BOLD;
    if (italic) cf.dwEffects |= CFE_ITALIC;
    if (underline) cf.dwEffects |= CFE_UNDERLINE;

    // Append text with formatting
    SETTEXTEX stex = {ST_SELECTION, CP_WINUNICODE};
    SendMessage(hwnd_, EM_SETTEXTEX, (WPARAM)&stex, (LPARAM)text.c_str());
}
```

**Performance**:
- Use `EM_SETEVENTMASK` to disable `EN_UPDATE` during bulk append
- `EM_EXLIMITTEXT` to set max size (7500 lines * ~100 chars = ~750KB)
- Consider custom scrollback trimming beyond RichEdit limit

---

### 5.3 Input Bar with History

**File**: `src/ui/InputBar.h`

```cpp
#pragma once
#include <Windows.h>
#include <functional>
#include <memory>

namespace Core { class CommandHistory; }

namespace UI {

class InputBar {
public:
    InputBar();
    ~InputBar();

    HWND Create(HWND hwndParent, int id, int x, int y, int width, int height);
    HWND GetHandle() const { return hwnd_; }

    void SetCommandHistory(Core::CommandHistory* history);
    void SetFocus();
    void SetText(const std::wstring& text);

    // Callbacks
    using SendCallback = std::function<void(const std::wstring&)>;
    void SetSendCallback(SendCallback cb) { onSend_ = cb; }

private:
    static LRESULT CALLBACK EditSubclassProc(HWND hwnd, UINT msg, WPARAM wParam,
                                             LPARAM lParam, UINT_PTR, DWORD_PTR);
    void OnKeyDown(WPARAM vkey);
    void OnEnter();
    void OnUpArrow();
    void OnDownArrow();
    void OnTab();

    HWND hwnd_ = nullptr;
    HWND hwndEdit_ = nullptr;
    HWND hwndButton_ = nullptr;
    Core::CommandHistory* history_ = nullptr;
    SendCallback onSend_;
};

} // namespace UI
```

**Implementation**:
- Container: Custom window class with two children
  - Edit control (multiline, `ES_AUTOVSCROLL`)
  - Send button
- Subclass edit control to intercept Enter, Up/Down, Tab
- Enter: Send command (unless Shift+Enter for new line)
- Up/Down: Navigate history
- Tab: Auto-complete player names (needs access to current room players)

**Layout**:
```cpp
void InputBar::OnSize(int width, int height) {
    const int buttonWidth = 60;
    MoveWindow(hwndEdit_, 0, 0, width - buttonWidth, height, TRUE);
    MoveWindow(hwndButton_, width - buttonWidth, 0, buttonWidth, height, TRUE);
}
```

---

### 5.4 Sidebar Panel with Tabs

**File**: `src/ui/SidebarPanel.h`

```cpp
#pragma once
#include <Windows.h>
#include <vector>
#include <memory>

namespace UI {

class RoomInfoPanel;
class InventoryPanel;
class UserlistPanel;
// ... other panels

class SidebarPanel {
public:
    SidebarPanel();
    ~SidebarPanel();

    HWND Create(HWND hwndParent, int id, int x, int y, int width, int height);
    HWND GetHandle() const { return hwnd_; }

    // Tab management
    void SwitchToTab(int index);
    int GetCurrentTab() const { return currentTab_; }

    // Access panels
    RoomInfoPanel* GetRoomPanel() const { return roomPanel_.get(); }
    InventoryPanel* GetInventoryPanel() const { return inventoryPanel_.get(); }
    UserlistPanel* GetUserlistPanel() const { return userlistPanel_.get(); }

private:
    void OnTabChanged(int newIndex);
    void ShowPanel(int index);

    HWND hwnd_ = nullptr;
    HWND hwndTabControl_ = nullptr;
    int currentTab_ = 0;

    // Tab panels
    std::unique_ptr<RoomInfoPanel> roomPanel_;
    std::unique_ptr<InventoryPanel> inventoryPanel_;
    std::unique_ptr<UserlistPanel> userlistPanel_;
    // ... other panels
};

} // namespace UI
```

**Implementation**:
- Uses native `WC_TABCONTROL` (Common Controls)
- Each tab has a corresponding panel (child window)
- `TCN_SELCHANGE` notification to switch panels
- Panels use `ShowWindow(SW_SHOW/SW_HIDE)`

**Tab Definitions**:
```cpp
enum TabId {
    TAB_ROOM = 0,
    TAB_INVENTORY,
    TAB_PLAYERS,
    TAB_FILES,
    TAB_AUDIO,
    TAB_MIDI
};
```

---

### 5.5 Accessible ListView Pattern

**File**: `src/ui/AccessibleListView.h`

```cpp
#pragma once
#include <Windows.h>
#include <CommCtrl.h>
#include <functional>

namespace UI {

// Reusable keyboard-navigable ListView for inventories, player lists, etc.
class AccessibleListView {
public:
    AccessibleListView();
    ~AccessibleListView();

    HWND Create(HWND hwndParent, int id, int x, int y, int width, int height);
    HWND GetHandle() const { return hwnd_; }

    // Column management
    void AddColumn(const std::wstring& text, int width);

    // Item management
    void Clear();
    int AddItem(const std::wstring& text, LPARAM userData = 0);
    void SetItemText(int row, int col, const std::wstring& text);

    // Selection
    int GetSelectedItem() const;
    void SetSelectedItem(int index);
    LPARAM GetItemData(int index) const;

    // Callbacks
    using SelectionChangedCallback = std::function<void(int index)>;
    using ItemActivatedCallback = std::function<void(int index)>;

    void SetSelectionChangedCallback(SelectionChangedCallback cb);
    void SetItemActivatedCallback(ItemActivatedCallback cb);

    // Accessibility
    void SetAriaLabel(const std::wstring& label);

private:
    bool HandleNotify(LPNMHDR pnmhdr);

    HWND hwnd_ = nullptr;
    SelectionChangedCallback onSelectionChanged_;
    ItemActivatedCallback onItemActivated_;
};

} // namespace UI
```

**Usage**:
- Report view (`LVS_REPORT`)
- Full row select, grid lines (`LVS_EX_FULLROWSELECT | LVS_EX_GRIDLINES`)
- Explorer theme (`SetWindowTheme(hwnd, L"Explorer", nullptr)`)
- Handle `LVN_ITEMCHANGED` for selection
- Handle `NM_DBLCLK` or `LVN_ITEMACTIVATE` for activation
- Subclass for typeahead search (first letter navigation)

---

## 6. Main Window Structure

### 6.1 Window Registration

**File**: `src/ui/MainWindow.cpp` (excerpt)

```cpp
bool MainWindow::RegisterClass(HINSTANCE hInstance) {
    WNDCLASSEXW wc = {};
    wc.cbSize = sizeof(WNDCLASSEXW);
    wc.style = CS_HREDRAW | CS_VREDRAW;
    wc.lpfnWndProc = WindowProc;
    wc.hInstance = hInstance;
    wc.hIcon = LoadIcon(hInstance, MAKEINTRESOURCE(IDI_APP_ICON));
    wc.hCursor = LoadCursor(nullptr, IDC_ARROW);
    wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
    wc.lpszClassName = L"MongooseWinMainWindow";
    wc.lpszMenuName = MAKEINTRESOURCE(IDR_MAINMENU);

    return RegisterClassExW(&wc) != 0;
}
```

---

### 6.2 Window Creation with DPI Awareness

```cpp
HWND MainWindow::Create(HINSTANCE hInstance, int nCmdShow) {
    auto* pWindow = new MainWindow();
    pWindow->hInstance_ = hInstance;

    // Get DPI
    HDC hdc = GetDC(nullptr);
    pWindow->dpi_ = GetDeviceCaps(hdc, LOGPIXELSX);
    ReleaseDC(nullptr, hdc);

    // Scale window size
    int width = pWindow->ScaleForDpi(1024);
    int height = pWindow->ScaleForDpi(768);

    HWND hwnd = CreateWindowExW(
        WS_EX_CONTROLPARENT,  // Keyboard navigation
        L"MongooseWinMainWindow",
        L"Mongoose MUD Client",
        WS_OVERLAPPEDWINDOW,
        CW_USEDEFAULT, CW_USEDEFAULT,
        width, height,
        nullptr, nullptr,
        hInstance,
        pWindow  // Creation parameter
    );

    // Dark title bar
    BOOL useDarkMode = TRUE;
    DwmSetWindowAttribute(hwnd, DWMWA_USE_IMMERSIVE_DARK_MODE,
                         &useDarkMode, sizeof(useDarkMode));

    ShowWindow(hwnd, nCmdShow);
    UpdateWindow(hwnd);

    return hwnd;
}
```

---

### 6.3 Message Loop (main.cpp)

```cpp
int WINAPI wWinMain(HINSTANCE hInstance, HINSTANCE, PWSTR, int nCmdShow) {
    // Initialize COM
    CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED | COINIT_DISABLE_OLE1DDE);

    // Initialize common controls
    INITCOMMONCONTROLSEX icex = {};
    icex.dwSize = sizeof(INITCOMMONCONTROLSEX);
    icex.dwICC = ICC_WIN95_CLASSES | ICC_LISTVIEW_CLASSES |
                 ICC_TREEVIEW_CLASSES | ICC_BAR_CLASSES | ICC_TAB_CLASSES;
    InitCommonControlsEx(&icex);

    // Load RichEdit library
    LoadLibraryW(L"Msftedit.dll");

    // WSA startup for networking
    WSADATA wsaData;
    WSAStartup(MAKEWORD(2, 2), &wsaData);

    // Register and create main window
    if (!MainWindow::RegisterClass(hInstance)) {
        return 1;
    }

    HWND hwnd = MainWindow::Create(hInstance, nCmdShow);
    if (!hwnd) {
        return 1;
    }

    // Load accelerators
    HACCEL hAccel = LoadAccelerators(hInstance, MAKEINTRESOURCE(IDR_ACCELERATORS));

    // Message loop
    MSG msg = {};
    while (GetMessageW(&msg, nullptr, 0, 0) > 0) {
        if (!TranslateAcceleratorW(hwnd, hAccel, &msg)) {
            if (!IsDialogMessage(hwnd, &msg)) {
                TranslateMessage(&msg);
                DispatchMessageW(&msg);
            }
        }
    }

    // Cleanup
    WSACleanup();
    CoUninitialize();

    return static_cast<int>(msg.wParam);
}
```

---

## 7. External Dependencies

### 7.1 Required Libraries

**Windows SDK**:
- `User32.lib` - Window management
- `Gdi32.lib` - Graphics (fonts, colors)
- `ComCtl32.lib` - Common controls
- `Shell32.lib` - Shell functions
- `Ole32.lib` - COM
- `UxTheme.lib` - Visual themes
- `Dwmapi.lib` - Desktop Window Manager (dark title bar)
- `Ws2_32.lib` - WinSock2 (networking)
- `Secur32.lib` - Schannel (TLS)
- `Crypt32.lib` - Cryptography (TLS certificates)

**Third-Party Libraries**:

1. **nlohmann/json** (v3.11.3)
   - Header-only JSON library
   - GMCP/MCP message parsing
   - License: MIT
   - Include: `<nlohmann/json.hpp>`

2. **Google Test** (v1.15.2)
   - Unit testing framework
   - License: BSD-3-Clause
   - Fetched by CMake FetchContent

**Optional (Phase 2+)**:
3. **LibJZZ** or **RtMidi** - MIDI support (ported from React client's JZZ)
4. **OpenSSL** - Alternative to Schannel (if cross-platform needed)
5. **LiveKit Native SDK** - Voice chat (Phase 3)

---

### 7.2 Dependency Installation

**nlohmann/json**:
```cmake
# CMakeLists.txt
include(FetchContent)

FetchContent_Declare(
  json
  GIT_REPOSITORY https://github.com/nlohmann/json.git
  GIT_TAG        v3.11.3
  GIT_SHALLOW    TRUE
)

FetchContent_MakeAvailable(json)

target_link_libraries(mongoose-client PRIVATE nlohmann_json::nlohmann_json)
```

**Google Test**:
```cmake
FetchContent_Declare(
  googletest
  GIT_REPOSITORY https://github.com/google/googletest.git
  GIT_TAG        v1.15.2
  GIT_SHALLOW    TRUE
)

set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)
```

---

## 8. Build System Design

### 8.1 Root CMakeLists.txt

**File**: `CMakeLists.txt`

```cmake
cmake_minimum_required(VERSION 3.20)
project(MongooseWinClient VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Unicode support
add_compile_definitions(UNICODE _UNICODE)

# MSVC settings
if(MSVC)
    add_compile_options(/W4 /permissive-)
    add_compile_options(/utf-8)  # UTF-8 source encoding

    # Embed manifest
    set(CMAKE_EXE_LINKER_FLAGS
        "${CMAKE_EXE_LINKER_FLAGS} /MANIFEST:EMBED /MANIFESTINPUT:${CMAKE_SOURCE_DIR}/src/app.manifest")
endif()

# Required Windows libraries
set(WIN32_LIBS
    user32      # Window management
    gdi32       # Graphics
    comctl32    # Common controls
    shell32     # Shell functions
    ole32       # COM
    oleaut32    # OLE Automation
    uuid        # GUID support
    uxtheme     # Visual themes
    dwmapi      # Desktop Window Manager
    ws2_32      # WinSock2
    secur32     # Schannel
    crypt32     # Cryptography
)

# Fetch nlohmann/json
include(FetchContent)
FetchContent_Declare(
  json
  GIT_REPOSITORY https://github.com/nlohmann/json.git
  GIT_TAG        v3.11.3
  GIT_SHALLOW    TRUE
)
FetchContent_MakeAvailable(json)

# Source files
file(GLOB_RECURSE CORE_SOURCES "src/core/*.cpp")
file(GLOB_RECURSE NETWORK_SOURCES "src/network/*.cpp")
file(GLOB_RECURSE UI_SOURCES "src/ui/*.cpp")

set(ALL_SOURCES
    src/main.cpp
    ${CORE_SOURCES}
    ${NETWORK_SOURCES}
    ${UI_SOURCES}
    src/app.rc  # Resource file
)

# Main application
add_executable(mongoose-client WIN32 ${ALL_SOURCES})

target_include_directories(mongoose-client PRIVATE src)

target_link_libraries(mongoose-client PRIVATE
    ${WIN32_LIBS}
    nlohmann_json::nlohmann_json
)

# Testing
enable_testing()
add_subdirectory(tests)
```

---

### 8.2 Test CMakeLists.txt

**File**: `tests/CMakeLists.txt`

```cmake
# Fetch Google Test
FetchContent_Declare(
  googletest
  GIT_REPOSITORY https://github.com/google/googletest.git
  GIT_TAG        v1.15.2
  GIT_SHALLOW    TRUE
)

set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

# Test sources
file(GLOB_RECURSE TEST_SOURCES "unit/*.cpp")

# Reuse core and network sources (not UI)
file(GLOB_RECURSE CORE_SOURCES "../src/core/*.cpp")
file(GLOB_RECURSE NETWORK_SOURCES "../src/network/*.cpp")

add_executable(unit_tests
    ${TEST_SOURCES}
    ${CORE_SOURCES}
    ${NETWORK_SOURCES}
)

target_include_directories(unit_tests PRIVATE ../src)

target_link_libraries(unit_tests PRIVATE
    GTest::gtest
    GTest::gtest_main
    nlohmann_json::nlohmann_json
    ws2_32  # Networking tests need WinSock
)

# Register with CTest
include(GoogleTest)
gtest_discover_tests(unit_tests)
```

---

### 8.3 Application Manifest

**File**: `src/app.manifest`

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<assembly xmlns="urn:schemas-microsoft-com:asm.v1" manifestVersion="1.0">
  <assemblyIdentity
    version="1.0.0.0"
    processorArchitecture="*"
    name="MongooseWinClient"
    type="win32"/>
  <description>Mongoose MUD Client for Windows</description>

  <!-- Common Controls 6.0 -->
  <dependency>
    <dependentAssembly>
      <assemblyIdentity
        type="win32"
        name="Microsoft.Windows.Common-Controls"
        version="6.0.0.0"
        processorArchitecture="*"
        publicKeyToken="6595b64144ccf1df"
        language="*"/>
    </dependentAssembly>
  </dependency>

  <!-- Per-Monitor V2 DPI Awareness -->
  <application xmlns="urn:schemas-microsoft-com:asm.v3">
    <windowsSettings>
      <dpiAware xmlns="http://schemas.microsoft.com/SMI/2005/WindowsSettings">
        true/pm
      </dpiAware>
      <dpiAwareness xmlns="http://schemas.microsoft.com/SMI/2016/WindowsSettings">
        PerMonitorV2
      </dpiAwareness>
    </windowsSettings>
  </application>

  <!-- Windows 10/11 Compatibility -->
  <compatibility xmlns="urn:schemas-microsoft-com:compatibility.v1">
    <application>
      <supportedOS Id="{8e0f7a12-bfb3-4fe8-b9a5-48fd50a15a9a}"/>  <!-- Windows 10+ -->
    </application>
  </compatibility>
</assembly>
```

---

### 8.4 Build Commands

```bash
# Configure
cmake -B build -G "Visual Studio 17 2022" -A x64

# Build Debug
cmake --build build --config Debug

# Build Release
cmake --build build --config Release

# Run Tests
ctest --test-dir build -C Debug --output-on-failure

# Run Application
./build/Debug/mongoose-client.exe
```

---

## 9. Testing Strategy

### 9.1 Unit Test Coverage

**Core Layer** (100% testable without UI):
- `TelnetParserTests.cpp` - Port from React `telnet.test.ts`
  - IAC sequence handling
  - GMCP subnegotiation parsing
  - Incomplete buffer handling
  - Commands split across buffers
- `TextBufferTests.cpp` - Scrollback buffer
  - Add/remove lines
  - Max size trimming
  - Save to file
- `AnsiParserTests.cpp` - ANSI escape codes
  - Color parsing
  - Bold/italic/underline
  - URL detection
- `GmcpDispatcherTests.cpp` - GMCP routing
  - Package registration
  - Message dispatch
  - Handler invocation
- `CommandHistoryTests.cpp` - Input history
  - Add/navigate/search

**Network Layer** (partially testable):
- `TcpConnectionTests.cpp` - Mock WinSock
  - Connection lifecycle
  - Send/receive
  - Error handling
- Integration tests with real server (manual)

**UI Layer** (not unit tested):
- Manual testing
- UI automation tests (future)

---

### 9.2 Test Example

**File**: `tests/unit/TelnetParserTests.cpp`

```cpp
#include <gtest/gtest.h>
#include "network/TelnetParser.h"

using namespace Network;

TEST(TelnetParserTests, HandlePlainData) {
    TelnetParser parser;
    std::vector<uint8_t> receivedData;

    parser.SetDataCallback([&](const std::vector<uint8_t>& data) {
        receivedData.insert(receivedData.end(), data.begin(), data.end());
    });

    std::vector<uint8_t> input = {'H', 'e', 'l', 'l', 'o'};
    parser.Parse(input);

    EXPECT_EQ(receivedData, input);
}

TEST(TelnetParserTests, HandleIacCommand) {
    TelnetParser parser;
    std::vector<uint8_t> commands;

    parser.SetDataCallback([](const auto&) {}); // Ignore data

    // Not implemented in parser directly, would need refactor
    // This is example structure

    std::vector<uint8_t> input = {TelnetCommand::IAC, TelnetCommand::NOP};
    parser.Parse(input);

    // Verify NOP was processed (no data emitted)
}

TEST(TelnetParserTests, HandleIncompleteSubnegotiation) {
    TelnetParser parser;
    int gmcpCallCount = 0;

    parser.SetGmcpCallback([&](const auto&, const auto&) {
        gmcpCallCount++;
    });

    // Send partial subnegotiation
    std::vector<uint8_t> part1 = {TelnetCommand::IAC, TelnetCommand::SB,
                                  TelnetOption::GMCP, 'C', 'o', 'r', 'e'};
    parser.Parse(part1);
    EXPECT_EQ(gmcpCallCount, 0);  // Not complete yet

    // Complete it
    std::vector<uint8_t> part2 = {'.', 'P', 'i', 'n', 'g',
                                  TelnetCommand::IAC, TelnetCommand::SE};
    parser.Parse(part2);
    EXPECT_EQ(gmcpCallCount, 1);  // Now emitted
}
```

Can directly port React client's `telnet.test.ts` test cases.

---

## 10. Implementation Phases

### Phase 1: Core Networking (3-4 weeks)

**Week 1: TCP/TLS Foundation**
- Implement `TcpConnection` with WinSock2
- Implement `TlsContext` with Schannel
- Basic send/receive with UTF-8 encoding
- Unit tests for connection lifecycle
- Manual test: Connect to mongoose.moo.mud.org:7777

**Week 2: Telnet Protocol**
- Port `TelnetParser` from React client
- IAC sequence handling
- Subnegotiation support
- GMCP message extraction
- Unit tests (port from telnet.test.ts)

**Week 3: GMCP Core**
- Implement `GmcpPackage` base class
- Implement `GmcpDispatcher`
- Port `GMCPCore` (Hello, Ping, Goodbye)
- Port `GMCPCoreSupports` (capability negotiation)
- Test handshake with real server

**Week 4: Connection Management**
- Implement `ConnectionManager`
- Auto-reconnection logic
- Keep-alive (periodic Core.KeepAlive)
- Error handling and state tracking

**Deliverable**: Console app that connects, negotiates GMCP, sends/receives text

---

### Phase 2: Basic UI (3-4 weeks)

**Week 5: Main Window Shell**
- Implement `MainWindow` registration/creation
- DPI awareness
- Basic layout (no controls yet)
- Message loop in `main.cpp`

**Week 6: Terminal Display**
- Implement `TerminalControl` with RichEdit
- Link to `TextBuffer`
- ANSI color rendering
- Auto-scroll, scrollback
- Manual test: Display server output

**Week 7: Input & Core Models**
- Implement `InputBar` with history
- Port `CommandHistory` from React client
- Port `AnsiParser` for text formatting
- Implement `TextBuffer` with max size

**Week 8: Integration**
- Connect UI to network layer
- User input → server
- Server output → terminal
- Manual test: Full interactive session

**Deliverable**: Functional MUD client (text only, no sidebar)

---

### Phase 3: GMCP & UI Polish (4-5 weeks)

**Week 9-10: Character GMCP Packages**
- Port all `Char.*` packages (Items, Status, Skills, Vitals, etc.)
- Port `Room` package
- Implement data models (RoomInfo, CharacterStatus, etc.)
- Test state updates during gameplay

**Week 11: MCP Packages**
- Port all MCP packages (SimpleEdit, Userlist, Status, Ping)
- Implement multiline message handling
- Test editor integration (modal dialog)

**Week 12-13: Sidebar Panels**
- Implement `SidebarPanel` with tabs
- Implement `RoomInfoPanel` with exits/contents/players
- Implement `InventoryPanel` with `AccessibleListView`
- Implement `UserlistPanel`
- Toolbar, StatusBar, Splitter

**Week 14: Preferences & Persistence**
- Port `PreferencesStore` to C++
- Implement `PreferencesDialog`
- Settings: local echo, auto-reconnect, fonts, colors
- LocalStorage → Registry or JSON file

**Deliverable**: Feature-complete MUD client (parity with React client Phase 1)

---

### Phase 4: Advanced Features (6-7 weeks)

**Week 15-16: Audio Support**
- Windows Sound API or DirectSound
- Port `Client.Media` GMCP package
- Background music, sound effects
- Volume control, muting

**Week 17-18: MIDI Support**
- RtMidi or Windows MIDI API
- Port `Client.Midi` GMCP package
- Software synthesizer (TinySoundFont?)
- MIDI device selection

**Week 19-20: LiveKit Voice Chat**
- Integrate LiveKit Native SDK
- Port `Comm.LiveKit` GMCP package
- Audio chat UI panel
- Push-to-talk, volume meters

**Week 21: File Transfers**
- WebRTC via native library (or fallback to HTTP)
- Port `Client.FileTransfer` GMCP package
- File picker, progress UI
- Send/receive files

**Deliverable**: Full feature parity with React client

---

## 11. React to Win32 Component Mapping

| React Component | Win32 Equivalent | Implementation |
|----------------|------------------|----------------|
| `App.tsx` | `MainWindow` | Custom window class |
| `output.tsx` (Virtuoso) | `TerminalControl` | RichEdit 4.1 |
| `input.tsx` | `InputBar` | Edit + Button |
| `sidebar.tsx` | `SidebarPanel` | Tab control + panels |
| `tabs.tsx` | `TabControl` | `WC_TABCONTROL` |
| `toolbar.tsx` | `Toolbar` | `TOOLBARCLASSNAME` |
| `statusbar.tsx` | `StatusBar` | `STATUSCLASSNAME` |
| `RoomInfoDisplay.tsx` | `RoomInfoPanel` | Custom window w/ ListView |
| `inventory.tsx` | `InventoryPanel` | `AccessibleListView` |
| `userlist.tsx` | `UserlistPanel` | `AccessibleListView` |
| `ItemCard.tsx` | `ItemCard` | Custom window w/ buttons |
| `PlayerCard.tsx` | `PlayerCard` | Custom window w/ buttons |
| `AccessibleList.tsx` | `AccessibleListView` | ListView w/ keyboard nav |
| `PreferencesDialog.tsx` | `PreferencesDialog` | Modal dialog (WM_INITDIALOG) |
| `preferences.tsx` | Preference panels | Property sheet or custom tabs |
| `audioChat.tsx` | `AudioChatPanel` | LiveKit Native SDK UI |
| `FileTransfer/` | `FileTransferPanel` | Custom UI w/ progress bars |
| `MidiStatus.tsx` | `MidiStatusPanel` | Custom UI w/ device list |

**Key Differences**:
- React: Virtual DOM re-renders → Win32: Manual `InvalidateRect()` + `WM_PAINT`
- React: State hooks → Win32: Member variables + callbacks
- React: CSS styling → Win32: `CreateFont()`, `SetTextColor()`, `FillRect()`
- React: Event handlers → Win32: `WM_COMMAND`, `WM_NOTIFY` message handling

---

## 12. Performance Targets

### 12.1 Latency

- **Message to display**: <50ms from socket receive to RichEdit append
  - Socket receive: ~5ms
  - Telnet parsing: ~5ms
  - ANSI parsing: ~10ms
  - RichEdit append: ~20ms
  - Remaining: ~10ms buffer

- **User input to send**: <10ms from Enter key to socket send

### 12.2 Memory

- **Idle**: <50MB working set
- **Active session (1 hour)**: <100MB with 7,500 output lines
- **Peak (audio + MIDI + LiveKit)**: <200MB

### 12.3 Scrolling

- RichEdit should maintain **60fps** during:
  - Auto-scroll with new messages (20+ lines/sec)
  - User scroll with mouse wheel
  - Keyboard navigation (Page Up/Down)

**Optimization**:
- Disable `EN_UPDATE` during bulk append
- Use `EM_EXLIMITTEXT` to cap size
- Consider custom scroll buffer beyond RichEdit limit

### 12.4 Startup Time

- **Cold start**: <2 seconds to main window visible
- **Connected**: <3 seconds total to GMCP handshake complete

---

## 13. Accessibility Features

### 13.1 Screen Reader Support

**MSAA/UIA Providers**:
- RichEdit: Built-in UIA support (automatic)
- ListView: Built-in UIA support (automatic)
- Custom controls: May need `IAccessible` implementation

**Live Regions**:
- Terminal output: Use `UiaRaiseNotificationEvent()` for new messages
- Limit announcements to avoid spam (same as React client: max 50)

**Testing**: NVDA, JAWS, Windows Narrator

---

### 13.2 Keyboard Navigation

**Global Shortcuts** (via accelerator table):
- Ctrl+N: New connection
- Ctrl+S: Save log
- Ctrl+C: Copy log (when output focused)
- Ctrl+E: Clear log
- Ctrl+P: Preferences
- Ctrl+1-9: Switch sidebar tabs
- Escape: Close dialogs / Stop sounds
- Alt+U: Toggle sidebar
- F5: Refresh / Reconnect

**Tab Order**:
- Toolbar buttons
- Terminal (for scrolling, selection)
- Input bar (edit control)
- Input bar (send button)
- Sidebar tabs
- Sidebar panel content

Implemented via `WS_EX_CONTROLPARENT` on MainWindow and `WS_TABSTOP` on controls. `IsDialogMessage()` in message loop.

---

### 13.3 High Contrast Mode

**System Colors**:
- Use `GetSysColor()` for all UI chrome
- Terminal: Allow user override but default to system colors
- Respond to `WM_SYSCOLORCHANGE`

**Testing**: Windows High Contrast themes

---

### 13.4 DPI Scaling

- Manifest declares Per-Monitor V2 DPI awareness
- Handle `WM_DPICHANGED` message
- Scale fonts, controls, splitter position
- Use `MulDiv(value, dpi, 96)` for all sizing

**Testing**: Multiple monitors with different DPI, dynamic DPI changes

---

## 14. Risk Assessment

### 14.1 High Risk Items

**1. RichEdit Performance with ANSI**
- **Risk**: Appending 20+ formatted lines/sec may cause lag
- **Mitigation**:
  - Batch appends (buffer 100ms of output)
  - Disable notifications during append (`EM_SETEVENTMASK`)
  - Consider custom control if RichEdit is insufficient
- **Fallback**: Plain Edit control with no formatting (lose ANSI colors)

**2. Schannel TLS Complexity**
- **Risk**: Schannel API is complex, easy to get wrong
- **Mitigation**:
  - Start with OpenSSL (easier API)
  - Port to Schannel later for native integration
  - Extensive testing with real server
- **Fallback**: Require OpenSSL DLLs

**3. LiveKit Native SDK Integration**
- **Risk**: No existing Win32 example, docs focus on mobile
- **Mitigation**:
  - Phase 3 (defer until core complete)
  - May need custom WebRTC integration
- **Fallback**: Remove voice chat feature

---

### 14.2 Medium Risk Items

**4. MIDI API Differences**
- **Risk**: Windows MIDI API very different from Web MIDI API
- **Mitigation**: Use RtMidi library (cross-platform wrapper)

**5. File Transfer WebRTC**
- **Risk**: WebRTC data channels on Windows need native library
- **Mitigation**: Use libwebrtc or fallback to HTTP/FTP

**6. Character Encoding Edge Cases**
- **Risk**: UTF-8 ↔ UTF-16 conversions, ANSI server output
- **Mitigation**:
  - Use `MultiByteToWideChar(CP_UTF8)` consistently
  - Handle invalid sequences gracefully
  - Test with emoji, international characters

---

### 14.3 Low Risk Items

**7. Build System Complexity**
- **Risk**: CMake + MSVC + third-party libs can be tricky
- **Mitigation**: FetchContent for all dependencies, proven pattern from msvc-example

**8. UI Component Compatibility**
- **Risk**: Common Controls version differences (Windows 7 vs 11)
- **Mitigation**: Target Windows 10+ (supported in manifest)

---

## 15. Summary

### 15.1 Architecture Strengths

1. **Clean separation**: Core/Network/UI layers are independent
2. **Testable**: Core and Network layers have zero UI dependencies
3. **Native performance**: No Electron overhead, direct Win32 APIs
4. **Standard C++20**: Modern language features (move semantics, RAII, concepts)
5. **Proven patterns**: Directly adapted from msvc-example reference implementation
6. **Simplified networking**: Direct TCP/TLS, no WebSocket proxy needed

---

### 15.2 Estimated Complexity

| Module | Files | Lines of Code | Complexity |
|--------|-------|---------------|------------|
| Core (GMCP/MCP) | ~40 | ~4,000 | Medium |
| Network (Socket/Telnet) | ~8 | ~2,000 | High |
| UI (Win32 wrappers) | ~20 | ~5,000 | Medium-High |
| Main/Resources | ~3 | ~500 | Low |
| Tests | ~20 | ~1,500 | Medium |
| **Total** | **~90** | **~13,000** | **Medium-High** |

**Comparison to React Client**:
- React: ~6,000 LOC TypeScript
- Win32: ~13,000 LOC C++ (2.2x larger)
- Reason: Win32 is more verbose (explicit Win32 API calls, no JSX, manual memory management)

---

### 15.3 Timeline Estimate

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1: Core Networking | 3-4 weeks | Console app with GMCP |
| Phase 2: Basic UI | 3-4 weeks | Interactive MUD client (text only) |
| Phase 3: GMCP & Polish | 4-5 weeks | Feature parity (no audio/MIDI) |
| Phase 4: Advanced Features | 6-7 weeks | Full parity (audio, MIDI, LiveKit) |
| **Total** | **16-20 weeks** | **Complete Win32 client** |

**1 developer, full-time** = 4-5 months

---

### 15.4 Key Differences from React Client

| Aspect | React Client | Win32 Client |
|--------|--------------|--------------|
| **UI Framework** | React 18 + JSX | Pure Win32 API |
| **Styling** | CSS (24 files) | Win32 GDI (CreateFont, colors) |
| **Layout** | CSS Grid | Manual MoveWindow() |
| **Networking** | WebSocket (port 8765) | Direct TCP/TLS (port 7777) |
| **Protocol** | Proxy required | No proxy |
| **State** | React hooks | C++ member variables |
| **Events** | EventEmitter3 | Win32 callbacks / std::function |
| **JSON** | Native | nlohmann/json library |
| **Testing** | Vitest + Playwright | Google Test (core only) |
| **Package Size** | ~50MB (Electron) | ~5MB (native .exe) |
| **Memory** | ~200MB (Chrome) | <100MB (native) |
| **Startup** | ~3 seconds | <2 seconds |

---

### 15.5 Next Steps

1. **Create project skeleton**: Directory structure, CMakeLists.txt
2. **Implement Phase 1**: TCP/TLS connection + Telnet parser
3. **Test against real server**: Validate protocol implementation
4. **Iterate**: Implement Phase 2-4 incrementally
5. **User testing**: Get feedback early, iterate on UI

---

**Document Author**: Architecture Design Agent
**Date**: 2025-12-17
**Version**: 1.0
**Status**: Ready for Review

---

*End of Architecture Document*
