# React MUD Client - Win32 Port Architecture Analysis

**Date**: 2025-12-17
**Purpose**: Win32 Port Investigation - Wave 1
**Cross-Reference**: Swift reports (wave1/01-architecture.md, wave2/01-architecture-networking-verification.md)

---

## Executive Summary

This document analyzes the React MUD client architecture specifically from a Win32 porting perspective. The application is a specialized web-based MUD client built with React 18, TypeScript, and Vite, connecting to Project Mongoose at `mongoose.moo.mud.org:8765` via WebSocket with Telnet protocol.

**Key Finding for Win32**: Unlike iOS, Win32 desktop applications have multiple viable approaches including native (C++/C#), hybrid (WebView2), or Electron. The existing web codebase can be leveraged more directly on Win32 than on mobile platforms.

**Architecture Metrics**:
- 108 TypeScript files in src/
- Core application: ~6,000 LOC (excluding tests)
- 26 GMCP packages + 4 MCP packages
- 34 runtime dependencies
- Build system: Vite 6.3.5 with React 18.3.1

---

## 1. Entry Points and Application Bootstrap

### 1.1 HTML Entry Point

**File**: `C:\Users\Q\code\react-client\index.html`

**Bootstrap Structure**:
- Standard HTML5 document with root div mount point (line 66)
- PWA manifest references for installability (lines 7-20)
- GitHub Pages SPA routing workaround script (lines 33-60)
- Module script entry: `/src/index.tsx` (line 67)

**Win32 Consideration**: In a native Win32 app, this HTML would either:
1. Be embedded in WebView2 (Chromium-based browser control)
2. Be completely replaced by native UI framework
3. Remain as-is in Electron (essentially packaged Chromium)

### 1.2 JavaScript Entry Point

**File**: `C:\Users\Q\code\react-client\src\index.tsx` (33 lines)

**Bootstrap Sequence**:
```typescript
1. Import React, ReactDOM, react-router-dom
2. Import App and EditorWindow components
3. Import reportWebVitals and PWA service worker
4. Create router:
   - "/" → App (main client)
   - "/editor" → EditorWindow (external editor)
5. Create React root and render with StrictMode
6. Initialize web vitals monitoring
7. Register PWA service worker (production only)
```

**Win32 Port Options**:
1. **Electron**: Keep as-is, entire web stack runs in packaged Chromium
2. **WebView2**: Keep as-is, runs in embedded Edge browser control
3. **Native**: Replace with WinMain/WinUI3/Qt entry point

### 1.3 Main Application Component

**File**: `C:\Users\Q\code\react-client\src\App.tsx` (316 lines)

**Key Initialization** (lines 87-189):
- ONE-TIME client initialization with guard (line 64)
- Create MudClient instance connecting to `mongoose.moo.mud.org:8765` (line 89)
- Register 26 GMCP packages (lines 90-117)
- Register 4 MCP packages (lines 119-122)
- WebSocket connection established (line 123)
- Auto-login support via URL parameters (lines 126-142)
- Virtual MIDI synthesizer initialization (lines 148-157)
- Global keyboard handlers (Control for speech cancel, Escape for stop all)

**Component Layout** (lines 269-312):
```
<div className="App">
  <header>Toolbar</header>
  <main>OutputWindow (virtualized)</main>
  <div>CommandInput</div>
  <aside>Sidebar (conditional, hidden on mobile)</aside>
  <footer>Statusbar</footer>
  <PreferencesDialog />
</div>
```

**Win32 Implications**:
- CSS Grid layout needs Win32 equivalent (WinUI XAML Grid, Win32 manual layout, Qt layouts)
- Conditional rendering for mobile not needed on desktop
- Keyboard shortcuts work natively but may need Win32 accelerator tables

---

## 2. State Management Architecture

### 2.1 Custom Store Pattern

The application uses **custom lightweight stores** without Redux/MobX/Zustand.

**Design Pattern**: Observer pattern with localStorage persistence

### 2.2 PreferencesStore

**File**: `C:\Users\Q\code\react-client\src\PreferencesStore.tsx` (174 lines)

**Architecture**:
```typescript
class PreferencesStore {
  private state: PrefState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Load from localStorage
    // Merge with defaults
    // Handle migrations
  }

  dispatch(action: PrefAction) {
    this.state = this.reducer(this.state, action);
    localStorage.setItem("preferences", JSON.stringify(this.state));
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void): () => void {...}
  getState(): PrefState {...}
}

export const preferencesStore = new PreferencesStore(); // Singleton
```

**State Schema**:
```typescript
type PrefState = {
  general: { localEcho: boolean }
  speech: { autoreadMode, voice, rate, pitch, volume }
  sound: { muteInBackground: boolean, volume: number }
  channels: { [id: string]: { autoreadMode, notify } }
  editor: { autocompleteEnabled, accessibilityMode }
  midi: { enabled, lastInputDeviceId?, lastOutputDeviceId? }
}
```

**Win32 Equivalent Options**:
1. **Registry**: Traditional Windows approach, use `RegCreateKeyEx`/`RegSetValueEx`
2. **JSON File**: Keep localStorage pattern, save to `%APPDATA%\Mongoose\preferences.json`
3. **INI File**: Legacy but simple, use `GetPrivateProfileString`/`WritePrivateProfileString`
4. **SQLite**: For more complex state, especially for file transfer persistence

**Recommendation for Win32**: JSON file in AppData mirrors the web pattern and is portable across platforms.

### 2.3 InputStore

**File**: `C:\Users\Q\code\react-client\src\InputStore.ts` (90 lines)

**Simpler Pattern**:
```typescript
class InputStore {
  private state: { text: string } = { text: "" };
  private listeners: Set<() => void> = new Set();
  private inputRef: React.RefObject<HTMLTextAreaElement> | null;

  dispatch(action: InputAction) {...}
  focusInput() {...}
}

export const inputStore = new InputStore(); // Singleton
```

**Win32 Equivalent**: Simple global variable or singleton class with Win32 HWND reference for input control.

### 2.4 FileTransferStore

**File**: `C:\Users\Q\code\react-client\src\FileTransferStore.ts` (155 lines)

**Critical Difference**: Uses **IndexedDB** (browser database), NOT localStorage

```typescript
class FileTransferStore {
  private db: IDBPDatabase | null = null;

  async initialize() {
    this.db = await openDB('file-transfer-store', 1, {
      upgrade(db) {
        db.createObjectStore('chunks', { keyPath: ['hash', 'index'] });
        db.createObjectStore('metadata', { keyPath: 'hash' });
      }
    });
  }

  async saveChunk(chunk: FileChunk): Promise<void>
  async reconstructFile(hash: string): Promise<Blob | null>
}
```

**Win32 Equivalent Options**:
1. **SQLite**: Best match, same relational structure
2. **File-based**: Save chunks to temp directory, metadata to JSON
3. **Embedded Database**: LevelDB, RocksDB for key-value storage

**Recommendation**: SQLite via sqlite3 library - mature, portable, SQL interface similar to IndexedDB queries.

---

## 3. Component Hierarchy and Data Flow

### 3.1 Component Tree

```
App (state: client, showSidebar, fileTransfer)
├── Toolbar
│   ├── Connection indicator (from client.connected)
│   ├── Save/Clear/Copy buttons (call outRef methods)
│   ├── Sidebar toggle (toggles showSidebar state)
│   └── Preferences button (opens PreferencesDialog)
│
├── OutputWindow (virtualized with react-virtuoso)
│   ├── Receives: client events ("message", "command")
│   ├── Displays: ANSI-parsed text output
│   ├── Exposes: saveLog(), clearLog(), copyLog() via ref
│   └── Uses: ANSI parser for colored text
│
├── CommandInput
│   ├── Receives: onSend callback, client reference
│   ├── Manages: command history, autocomplete
│   ├── Sends: commands via client.sendCommand()
│   └── State: text input, history position
│
├── Sidebar (conditional on !mobile)
│   ├── Tabs component with 6 tabs:
│   │   ├── Room Info (GMCPRoom data)
│   │   ├── Players List (MCP userlist)
│   │   ├── Inventory (GMCPCharItems)
│   │   ├── Skills (GMCPCharSkills)
│   │   ├── Audio Chat (LiveKit integration)
│   │   └── File Transfer (WebRTC transfers)
│   └── Exposes: switchToTab(index) via ref
│
├── Statusbar
│   ├── Displays: connection status
│   ├── Shows: MIDI status
│   └── Updates: from client events
│
└── PreferencesDialog (modal)
    ├── Receives: ref for open/close control
    ├── Displays: preferences form (all categories)
    └── Saves: to preferencesStore on change
```

### 3.2 Data Flow Patterns

**Event-Driven Architecture**:
```
WebSocket → TelnetParser → MudClient (EventEmitter)
                              ↓
                        emit("message", data)
                              ↓
                    React components (useClientEvent hook)
                              ↓
                        setState() → re-render
```

**Example Flow - Receiving Room Info**:
```
1. Server sends: IAC SB GMCP "Room.Info" {...} IAC SE
2. TelnetParser extracts GMCP message
3. MudClient routes to GMCPRoom handler
4. GMCPRoom.handleInfo() processes data
5. Stores in client.currentRoomInfo
6. RoomInfoDisplay component re-renders (useClientEvent)
```

**Win32 Equivalent**:
1. **Native**: Use Windows message pump (WM_USER custom messages)
2. **Observer Pattern**: C++ signals/slots (Qt), C# events (WinForms/WPF)
3. **WebView2**: Keep EventEmitter pattern, bridge via `postMessage`

### 3.3 Ref-Based Component Communication

**Pattern**: Parent holds refs to child components, calls methods imperatively

```typescript
const outRef = React.useRef<OutputWindow | null>(null);
const inRef = React.useRef<HTMLTextAreaElement | null>(null);
const prefsDialogRef = React.useRef<PreferencesDialogRef | null>(null);
const sidebarRef = React.useRef<SidebarRef | null>(null);

// Usage:
<button onClick={() => outRef.current?.saveLog()}>Save</button>
<button onClick={() => prefsDialogRef.current?.open()}>Preferences</button>
```

**Win32 Equivalent**: Direct HWND pointers or object references, call methods directly.

---

## 4. External Dependencies Analysis

### 4.1 Core Framework (34 runtime dependencies)

**React Ecosystem** (8 packages):
- `react@18.3.1` - Core library
- `react-dom@18.3.1` - DOM renderer
- `react-router-dom@6.30.1` - Routing (2 routes only)
- `react-icons@5.5.0` - Icon library
- `react-beforeunload@2.6.0` - Unload event handling
- `react-focus-lock@2.13.6` - Focus trap for a11y
- `react-use@17.6.0` - Hook utilities
- `react-virtuoso@4.6.4` - Virtualized scrolling

**Win32 Port Strategy**:
- **Electron/WebView2**: Keep all as-is
- **Native**: Replace with native equivalents (see table below)

### 4.2 Protocol & Communication

**Networking**:
- No external Telnet library (custom in `telnet.ts`)
- No WebSocket library (native browser WebSocket)
- `buffer@6.0.3` - Node.js Buffer polyfill for browser
- `eventemitter3@5.0.1` - Event system

**Real-time**:
- `@livekit/components-react@2.9.14` - LiveKit UI components
- `livekit-client@2.15.6` - WebRTC voice chat

**Win32 Equivalent**:
- WebSocket: Use `websocketpp` (C++) or `System.Net.WebSockets` (C#)
- Buffer: Use `std::vector<uint8_t>` (C++) or `byte[]` (C#)
- EventEmitter: Use `boost::signals2` (C++) or C# events
- LiveKit: Use `livekit-client` (available for native platforms)

### 4.3 Content Processing

**Text Rendering**:
- `anser@2.3.2` - ANSI escape code parsing
- `strip-ansi@7.1.0` - Remove ANSI codes
- `marked@15.0.12` - Markdown to HTML
- `turndown@7.2.0` - HTML to Markdown
- `dompurify@3.2.6` - XSS sanitization

**Win32 Strategy**:
- **ANSI Parser**: Port TypeScript logic to C++/C#, map to Rich Edit colors or custom rendering
- **Markdown**: Use `cmark` (C library) or `Markdig` (C#)
- **Sanitization**: Less critical in native (no DOM XSS), but validate server content

### 4.4 Audio & Media

**Sound**:
- `cacophony@0.14.2` - Audio playback library

**MIDI**:
- `jzz@1.9.3` - MIDI library
- `jzz-synth-tiny@1.4.3` - Software synthesizer

**Speech**:
- Web Speech API (native browser)

**Win32 Equivalents**:

| Web Technology | Win32 Equivalent |
|----------------|------------------|
| Cacophony | DirectSound, XAudio2, FMOD, irrKlang |
| Web MIDI | Windows MIDI API (`midiOutOpen`, `midiInOpen`) |
| JZZ-Synth-Tiny | FluidSynth (SoundFont player) |
| Web Speech API | SAPI (Microsoft Speech API), Windows.Media.SpeechSynthesis |

**Recommendation**:
- Audio: Use FMOD or irrKlang (cross-platform, easy API)
- MIDI: Native Windows MIDI API + FluidSynth for software synthesis
- TTS: SAPI for Windows 7-10, Windows.Media.SpeechSynthesis for Windows 11

### 4.5 Editor

**Code Editor**:
- `monaco-editor@0.52.2` - VS Code editor component (~5MB)
- `@monaco-editor/react@4.7.0` - React wrapper

**Win32 Considerations**:
- Monaco is Electron-based, works in WebView2
- For native: Use Scintilla (C++), AvalonEdit (C#/WPF), or QScintilla (Qt)
- Alternative: Embed WebView2 just for editor, rest native

### 4.6 Utility Libraries

**State & Caching**:
- Custom stores (PreferencesStore, InputStore, FileTransferStore)
- `lru-cache@10.4.3` - LRU cache for MCP messages

**Crypto**:
- `crypto-js@4.2.0` - Hashing for file transfers

**Accessibility**:
- `@react-aria/live-announcer@3.4.3` - Screen reader

**Performance**:
- `web-vitals@3.5.2` - Core Web Vitals

**Win32 Equivalents**:
- LRU Cache: `boost::container::flat_map` with manual LRU, or LRU cache libraries
- Crypto: Windows CryptoAPI, Crypto++ library, or OpenSSL
- Accessibility: UI Automation (Microsoft), MSAA (legacy)
- Performance: Windows Performance Counters, ETW

### 4.7 Dependency Mapping Table

| Category | Web Dependency | Win32 Native | Electron/WebView2 |
|----------|----------------|--------------|-------------------|
| **UI Framework** | React 18 | WinUI3/WPF/Qt | Keep React |
| **WebSocket** | Browser API | websocketpp, Boost.Beast | Keep browser API |
| **Telnet** | Custom TypeScript | Port to C++/C# | Keep TypeScript |
| **ANSI Parser** | anser@2.3.2 | Custom C++/C# | Keep anser |
| **Audio** | cacophony | FMOD, irrKlang | Keep cacophony |
| **MIDI** | jzz + Web MIDI | Windows MIDI API + FluidSynth | Keep jzz |
| **TTS** | Web Speech API | SAPI, Windows.Media | Keep Web Speech |
| **Editor** | Monaco | Scintilla, AvalonEdit | Keep Monaco |
| **LiveKit** | livekit-client | livekit-client (C++ SDK) | Keep livekit-client |
| **Storage** | localStorage | AppData JSON files | Keep localStorage |
| **IndexedDB** | Browser IndexedDB | SQLite | Keep IndexedDB |
| **Markdown** | marked | cmark, Markdig | Keep marked |
| **Virtualization** | react-virtuoso | Virtual list controls | Keep react-virtuoso |

---

## 5. Configuration and Persistence

### 5.1 Hardcoded Configuration

**Server Connection** (App.tsx line 89):
```typescript
const newClient = new MudClient("mongoose.moo.mud.org", 8765);
```

**Not configurable** at runtime - exclusive connection to Project Mongoose.

**WebRTC STUN/TURN Servers** (WebRTCService.ts lines 25-34):
```typescript
iceServers: [
  {
    urls: ["turn:mongoose.world:3478", "stun:mongoose.world:3478"],
    username: "p2p",
    credential: "p2p",
  },
  { urls: "stun:stun.l.google.com:19302" },
]
```

**Win32 Implication**: If making multi-server client, need configuration file or UI.

### 5.2 localStorage Usage

**Keys**:
- `preferences` - User preferences JSON (PreferencesStore)
- Potentially GMCP auth tokens (Auto-login)

**Persistence Trigger**: Every preference change (line 157 of PreferencesStore.tsx)

**Win32 Equivalent Locations**:
1. **AppData Roaming**: `%APPDATA%\Mongoose\preferences.json` (roams with user profile)
2. **AppData Local**: `%LOCALAPPDATA%\Mongoose\preferences.json` (stays on machine)
3. **Registry**: `HKEY_CURRENT_USER\Software\Mongoose\Preferences` (Windows traditional)

**Recommendation**: JSON file in AppData\Roaming for:
- Easy debugging (human-readable)
- Cross-platform compatibility if porting to other OSes
- Matches web localStorage pattern

### 5.3 IndexedDB Usage

**Purpose**: File transfer chunk storage (FileTransferStore.ts)

**Schema**:
```typescript
Database: 'file-transfer-store'
  Store: 'chunks' (keyPath: ['hash', 'index'])
    Index: 'hash'
  Store: 'metadata' (keyPath: 'hash')
    Index: 'direction'
```

**Win32 Equivalent**: SQLite database
```sql
CREATE TABLE chunks (
  hash TEXT NOT NULL,
  index INTEGER NOT NULL,
  data BLOB NOT NULL,
  PRIMARY KEY (hash, index)
);

CREATE TABLE metadata (
  hash TEXT PRIMARY KEY,
  filename TEXT,
  totalSize INTEGER,
  totalChunks INTEGER,
  receivedChunks TEXT, -- JSON array
  direction TEXT CHECK(direction IN ('incoming', 'outgoing')),
  sender TEXT,
  recipient TEXT,
  lastActivityTimestamp INTEGER,
  mimeType TEXT
);

CREATE INDEX idx_chunks_hash ON chunks(hash);
CREATE INDEX idx_metadata_direction ON metadata(direction);
```

**Location**: `%APPDATA%\Mongoose\file-transfers.db`

### 5.4 PWA Configuration

**Manifest** (public/manifest.json):
- Short name: "Mongoose Client"
- Display: standalone
- Theme color: #000000
- Icons: 16x16 to 512x512

**Service Worker**: Auto-update strategy, caches assets

**Win32 Equivalent**: Not directly applicable, but:
- Theme color → Window chrome color
- Icons → Application icon (ICO file)
- Manifest → Application manifest (embedded resource)
- Service worker → Not needed (native apps control caching)

### 5.5 Auto-login Feature

**URL Parameters** (App.tsx lines 126-142):
```typescript
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');
const password = urlParams.get('password');
```

**Security Concern**: Credentials visible in URL, intended for E2E testing.

**Win32 Alternative**:
- Command-line arguments: `mongoose.exe --username=test --password=pass`
- Environment variables: `%MONGOOSE_USERNAME%`, `%MONGOOSE_PASSWORD%`
- Credentials file: `%APPDATA%\Mongoose\autologin.json` (encrypted)

---

## 6. Build System and Tooling

### 6.1 Vite Configuration

**File**: `C:\Users\Q\code\react-client\vite.config.ts`

**Plugins**:
1. `@vitejs/plugin-react` - Fast Refresh, JSX
2. `vite-plugin-commit-hash` - Git hash injection
3. `vite-plugin-pwa` - PWA generation

**Build Output**: `dist/` directory with hashed assets

**Win32 Build Systems**:
- **Electron**: Keep Vite, add `electron-builder`
- **WebView2**: Keep Vite, embed dist/ in Win32 resources
- **Native**: Replace with CMake (C++) or MSBuild (C#)

### 6.2 TypeScript Configuration

**File**: `C:\Users\Q\code\react-client\tsconfig.json`

**Key Settings**:
- Target: ESNext
- Module: ESNext
- JSX: react-jsx
- Strict mode enabled
- Custom type roots: `./src/@types`

**Win32 Implications**:
- TypeScript → C++: Lose type safety at compile time, gain runtime performance
- TypeScript → C#: Keep strong typing, similar syntax
- Electron/WebView2: Keep TypeScript as-is

### 6.3 Scripts

**package.json scripts**:
```json
{
  "start": "vite --open",
  "build": "vite build",
  "serve": "vite preview",
  "test": "vitest run"
}
```

**Win32 Equivalent**:
- `start` → Debug build + launch executable
- `build` → Release build with optimizations
- `serve` → Run release build locally
- `test` → CTest (CMake), MSTest (C#), or keep Vitest for Electron

---

## 7. Win32 Port Strategy Comparison

### 7.1 Option A: Electron

**Description**: Package web app in Chromium + Node.js runtime

**Architecture**:
```
Electron App
├── Main Process (Node.js)
│   ├── Window management
│   ├── File system access
│   └── Native integrations
└── Renderer Process (Chromium)
    └── Entire React app (unchanged)
```

**Pros**:
- Minimal code changes (99% reuse)
- All web dependencies work as-is
- Cross-platform (Windows, macOS, Linux)
- Fast development

**Cons**:
- Large bundle size (~150MB base)
- Higher memory usage (~200MB+ RAM)
- Not truly "native" feel
- Chromium overhead

**Dependencies**:
- `electron` - Framework
- `electron-builder` - Packaging
- All existing web dependencies

**Effort**: 2-3 weeks
- Week 1: Electron setup, main process
- Week 2: Packaging, auto-update, native integrations
- Week 3: Testing, polish

### 7.2 Option B: WebView2 (Hybrid)

**Description**: Native Win32 app with embedded Edge WebView2

**Architecture**:
```
Win32 Application (C++/C#)
├── Native Window (Win32/WinUI3)
├── WebView2 Control
│   └── React app (unchanged)
└── Native Integrations
    ├── MIDI (Windows MIDI API)
    ├── TTS (SAPI)
    └── File System (Win32 API)
```

**Pros**:
- Smaller than Electron (~30MB runtime)
- Reuse React app (95%+ reuse)
- Native window chrome
- Uses system Edge (auto-updated)

**Cons**:
- WebView2 setup complexity
- Bridge between native and JS
- Windows-only
- Some browser limitations (no Web MIDI)

**Dependencies**:
- WebView2 SDK
- All existing web dependencies (run in WebView2)
- Native libraries for MIDI, TTS

**Effort**: 4-6 weeks
- Week 1-2: Win32/WinUI3 window + WebView2 setup
- Week 3: JavaScript ↔ Native bridge (postMessage)
- Week 4: Native MIDI + TTS integration
- Week 5-6: Testing, packaging (MSIX)

### 7.3 Option C: Native (C++/Qt or C#/WPF)

**Description**: Full rewrite using native frameworks

**Architecture (Qt Example)**:
```
Qt Application (C++)
├── QMainWindow
│   ├── QTextEdit (output, styled with ANSI)
│   ├── QLineEdit (input)
│   └── QTabWidget (sidebar)
├── TelnetClient (port from TypeScript)
│   ├── QTcpSocket
│   └── GMCP/MCP handlers
├── AudioEngine (FMOD/irrKlang)
├── MidiService (Windows MIDI API)
└── Settings (QSettings)
```

**Pros**:
- True native performance
- Smallest memory footprint
- Full control over UI
- No web runtime overhead

**Cons**:
- Complete rewrite (~9,000 LOC estimated)
- Lose Monaco editor (or embed WebView2 just for it)
- Longer development time
- Need to port all logic

**Dependencies**:
- Qt 6 or WinUI3 (UI framework)
- websocketpp or QtWebSockets (WebSocket)
- FluidSynth (MIDI synthesis)
- FMOD/irrKlang (audio)
- Scintilla/QScintilla (code editor)

**Effort**: 16-20 weeks
- Week 1-3: UI framework + basic layout
- Week 4-6: WebSocket + Telnet + GMCP/MCP
- Week 7-9: ANSI rendering + output window
- Week 10-12: Audio + MIDI + TTS
- Week 13-15: Editor + File Transfers + LiveKit
- Week 16-20: Testing, polish, installer

### 7.4 Recommendation Matrix

| Factor | Electron | WebView2 | Native |
|--------|----------|----------|--------|
| **Development Time** | 2-3 weeks | 4-6 weeks | 16-20 weeks |
| **Code Reuse** | 99% | 95% | 20-30% |
| **Bundle Size** | 150MB+ | 30MB + Edge | 15-20MB |
| **Memory Usage** | 200MB+ | 100-150MB | 50-80MB |
| **Startup Time** | 2-3s | 1-2s | <1s |
| **Native Feel** | Low | Medium | High |
| **Performance** | Good | Good | Excellent |
| **Cross-platform** | Yes | No | Depends (Qt yes, WPF no) |
| **Maintenance** | Easy | Medium | Hard |
| **User Perception** | "Web app" | "Hybrid" | "Real app" |

**Recommendation**:
1. **MVP/Quick Release**: Electron (fastest to market)
2. **Windows-focused**: WebView2 (good balance)
3. **Long-term/Performance**: Native (best UX, most work)

---

## 8. Critical Win32-Specific Considerations

### 8.1 Networking - Simpler than iOS

**Web Client Architecture**:
```
React Client → WebSocket (wss://mongoose:8765) → WebSocket Proxy → Telnet → MOO Server
```

**Win32 Direct TCP** (like iOS):
```
Win32 Client → TCP/TLS (mongoose:7777) → MOO Server
```

**Win32 Advantage**: Can use direct TCP sockets like iOS, OR can keep WebSocket if using Electron/WebView2.

**Win32 WebSocket Libraries**:
- C++: `websocketpp`, `Boost.Beast`, `uWebSockets`
- C#: `System.Net.WebSockets.ClientWebSocket`
- Qt: `QtWebSockets`

**Win32 Direct TCP Libraries**:
- C++: `Boost.Asio`, `WinSock2 API`
- C#: `System.Net.Sockets.TcpClient` + `SslStream`
- Qt: `QTcpSocket` + `QSslSocket`

### 8.2 Window Management

**Web Client**: Single window (or popup for editor)

**Win32 Options**:
1. **Single Window**: Like web, tabbed or split interface
2. **MDI (Multiple Document Interface)**: Child windows for editors
3. **Separate Windows**: Output window, editor windows, preferences window
4. **Tabbed Interface**: Modern approach (like Visual Studio Code)

**Recommendation**: Single window with tabs (matches web UX, modern feel)

### 8.3 Installer and Distribution

**Electron**:
- NSIS installer (electron-builder)
- Auto-update via `electron-updater`
- ~150MB installer

**WebView2**:
- MSIX package (Microsoft Store)
- Evergreen WebView2 runtime (user installs if missing)
- ~30MB installer

**Native**:
- WiX Toolset (MSI installer)
- InnoSetup (custom installer)
- Auto-update: custom or WinSparkle
- ~15-20MB installer

### 8.4 System Integration

**Windows Features to Leverage**:

| Feature | Electron | WebView2 | Native |
|---------|----------|----------|--------|
| **File Associations** | Yes (.mud files?) | Yes | Yes |
| **Protocol Handlers** | Yes (mongoose://) | Yes | Yes |
| **Taskbar Integration** | Limited | Good | Excellent |
| **Jump Lists** | Yes | Yes | Yes |
| **Notifications** | Toast (Windows 10+) | Toast | Toast |
| **System Tray** | Yes | Yes | Yes |
| **High DPI** | Auto | Auto | Manual |
| **Theming** | Custom | Custom | Windows theme |

### 8.5 Accessibility on Windows

**Web Client**: ARIA, screen reader support via `@react-aria/live-announcer`

**Win32 Equivalents**:
- **UI Automation**: Modern accessibility API (Windows 7+)
- **MSAA**: Legacy API (still supported)
- **Screen Readers**: NVDA, JAWS, Narrator

**Electron/WebView2**: Web accessibility APIs work as-is

**Native**: Must implement UI Automation providers manually

### 8.6 Performance Optimization

**Virtualized Scrolling** (react-virtuoso):
- Web: Renders only visible items
- Win32 Native: Use virtual list controls
  - C++: Custom rendering, double buffering
  - C#/WPF: `VirtualizingStackPanel`
  - Qt: `QListView` with custom model

**ANSI Rendering**:
- Web: Parse to HTML with styled spans
- Win32:
  - Rich Edit control with RTF formatting
  - Custom GDI/GDI+ rendering
  - WPF RichTextBox with TextPointers

**Memory Management**:
- Web: Garbage collected (V8)
- Native C++: Manual, RAII, smart pointers
- Native C#: Garbage collected (CLR)

---

## 9. Data Flow and Protocol Layer

### 9.1 Network Stack (Current Web)

```
WebSocket (Browser API)
    ↓
WebSocketStream adapter (telnet.ts lines 85-109)
    ↓
TelnetParser (state machine, telnet.ts lines 111-180)
    ↓ emit events
MudClient (EventEmitter3, client.ts)
    ↓ register handlers
GMCP/MCP Packages
    ↓ update state
React Components (via useClientEvent hook)
```

### 9.2 Win32 Network Stack Options

**Option A: Keep WebSocket (Electron/WebView2)**
```
WebSocket (Chromium API) → ... → React (unchanged)
```

**Option B: Native WebSocket (C++)**
```
websocketpp::connection
    ↓
TelnetParser (ported to C++)
    ↓ signals/callbacks
MudClient (Qt signals or std::function callbacks)
    ↓
GMCP/MCP Handlers (C++ classes)
    ↓ update model
Qt Widgets/WinUI (data binding)
```

**Option C: Direct TCP (like iOS)**
```
QTcpSocket / Boost.Asio
    ↓
TelnetParser (ported to C++)
    ↓
(same as Option B)
```

### 9.3 TelnetParser Portability

**TypeScript Implementation** (telnet.ts):
```typescript
enum TelnetState { DATA, COMMAND, SUBNEGOTIATION, NEGOTIATION }

class TelnetParser extends EventEmitter {
  private state: TelnetState = TelnetState.DATA;
  private buffer: Buffer = Buffer.alloc(0);

  parse(data: Buffer) {
    // State machine
  }

  sendGmcp(package: string, data: string) {...}
}
```

**C++ Port Example**:
```cpp
enum class TelnetState { DATA, COMMAND, SUBNEGOTIATION, NEGOTIATION };

class TelnetParser {
  TelnetState state = TelnetState::DATA;
  std::vector<uint8_t> buffer;

  std::function<void(const std::vector<uint8_t>&)> onData;
  std::function<void(uint8_t, uint8_t)> onNegotiation;
  std::function<void(const std::string&, const std::string&)> onGMCP;

  void parse(const std::vector<uint8_t>& data) {
    // Same state machine logic
  }

  void sendGmcp(const std::string& package, const std::string& data);
};
```

**C# Port Example**:
```csharp
enum TelnetState { Data, Command, Subnegotiation, Negotiation }

class TelnetParser {
  TelnetState state = TelnetState.Data;
  List<byte> buffer = new List<byte>();

  public event Action<byte[]> OnData;
  public event Action<byte, byte> OnNegotiation;
  public event Action<string, string> OnGMCP;

  public void Parse(byte[] data) {
    // Same state machine logic
  }

  public void SendGmcp(string package, string data);
}
```

**Portability Assessment**: Excellent - pure logic, no UI dependencies

---

## 10. Testing Strategy for Win32

### 10.1 Unit Tests

**Current**: Vitest (13 test files, co-located with source)

**Win32 Options**:
- **Electron**: Keep Vitest (runs in Node.js)
- **C++**: Google Test, Catch2
- **C#**: MSTest, NUnit, xUnit

**Reusable Test Cases**:
- `telnet.test.ts` logic can be ported to C++/C#
- Protocol handler tests (GMCP/MCP) are logic-based
- ANSI parser tests

### 10.2 E2E Tests

**Current**: Playwright (tests in `tests/` directory)

**Win32 Options**:
- **Electron**: Keep Playwright
- **WebView2**: WinAppDriver (Microsoft UI automation)
- **Native**: WinAppDriver, or manual testing

### 10.3 Integration Tests

**Current**: Connect to real server (port 8765 WebSocket proxy)

**Win32**: Same approach, test against:
- Port 8765 (WebSocket, if using WebSocket library)
- Port 7777 (Direct TCP, if using native sockets)

---

## 11. Deployment and Installation

### 11.1 Current Deployment

**Web Client**:
- Build: `npm run build` → `dist/` directory
- Deploy: GitHub Pages (static hosting)
- URL: `https://client.rustytelephone.net`
- Updates: Immediate (service worker auto-update)

### 11.2 Win32 Deployment Options

**Electron**:
- Build: `electron-builder` → `.exe` installer (NSIS)
- Distribute: Direct download, Microsoft Store (Desktop Bridge)
- Updates: `electron-updater` (auto-download and install)
- Size: ~150MB installer

**WebView2**:
- Build: MSBuild/CMake → MSIX package
- Distribute: Microsoft Store, direct download (.msix)
- Updates: Microsoft Store auto-update, or manual update check
- Size: ~30MB + WebView2 runtime (if not installed)

**Native**:
- Build: MSBuild/CMake → .exe
- Package: WiX → MSI installer, or InnoSetup
- Distribute: Direct download, chocolatey, winget
- Updates: Custom update check + WinSparkle, or manual
- Size: ~15-20MB installer

### 11.3 Installation Locations

**Electron**:
- `%LOCALAPPDATA%\Programs\mongoose-client\`
- User-level install (no admin required)

**WebView2/MSIX**:
- `C:\Program Files\WindowsApps\` (Store)
- Or custom location

**Native**:
- `C:\Program Files\Mongoose Client\` (admin required)
- Or `%LOCALAPPDATA%\Programs\Mongoose\` (user-level)

### 11.4 Auto-Update Strategies

**Electron**:
```javascript
const { autoUpdater } = require('electron-updater');

autoUpdater.checkForUpdatesAndNotify();
```

**Native**:
```cpp
// WinSparkle (C++)
win_sparkle_init();
win_sparkle_check_update_with_ui();
```

**WebView2/MSIX**: Microsoft Store handles updates automatically

---

## 12. Risk Assessment for Win32 Port

### 12.1 High Risk Areas

1. **Monaco Editor** (~5MB dependency):
   - Electron/WebView2: Works as-is
   - Native: Must replace with Scintilla or QScintilla
   - Risk: Feature parity with Monaco is hard

2. **WebRTC File Transfers** (complex):
   - Electron/WebView2: Works as-is (browser WebRTC)
   - Native: Must port to native WebRTC library
   - Risk: WebRTC C++ API is complex

3. **LiveKit Voice Chat**:
   - Electron/WebView2: Works with livekit-client
   - Native: Need LiveKit C++ SDK
   - Risk: Integration effort moderate

### 12.2 Medium Risk Areas

1. **MIDI Support**:
   - Electron: Web MIDI works
   - WebView2: Web MIDI NOT available in Edge WebView2
   - Native: Use Windows MIDI API (moderate effort)
   - Risk: WebView2 needs native bridge

2. **Virtualized Scrolling Performance**:
   - Electron/WebView2: react-virtuoso works
   - Native: Custom virtual list implementation
   - Risk: Rendering 10,000+ lines efficiently

3. **ANSI Color Rendering**:
   - Electron/WebView2: HTML/CSS works
   - Native: Rich Edit RTF or custom GDI rendering
   - Risk: Matching exact colors and styles

### 12.3 Low Risk Areas

1. **WebSocket/TCP Networking**: Well-supported on all platforms
2. **Telnet Protocol**: Pure logic, easy to port
3. **GMCP/MCP Handlers**: Pure logic, straightforward
4. **Preferences Storage**: Simple file I/O
5. **Basic UI Layout**: Standard window controls

---

## 13. Recommended Win32 Implementation Plan

### 13.1 Phase 1: MVP (Electron) - 2-3 weeks

**Goal**: Quickest path to Windows desktop app

**Tasks**:
1. Set up Electron main process
2. Package existing React app as renderer
3. Configure electron-builder for Windows
4. Implement auto-update
5. Native menu bar integration
6. System tray icon
7. File associations (.mud files?)

**Deliverable**: Installable Windows app, 99% feature parity with web

### 13.2 Phase 2: Optimization (WebView2 Hybrid) - 4-6 weeks

**Goal**: Reduce size, improve native feel

**Tasks**:
1. Create WinUI3 or Win32 window
2. Embed WebView2 control
3. Package React app to load in WebView2
4. Implement JavaScript ↔ Native bridge
5. Replace Web MIDI with native Windows MIDI
6. Replace Web Speech with SAPI
7. MSIX packaging for Microsoft Store

**Deliverable**: Smaller, more native Windows app

### 13.3 Phase 3: Native Rewrite (Optional) - 16-20 weeks

**Goal**: Maximum performance and native UX

**Tasks**: (As outlined in Section 7.3)

**Deliverable**: True native Windows application

### 13.4 Parallel Work Streams

For any approach, these can be developed in parallel:

1. **Week 1-2**:
   - Set up build system
   - Basic window/layout
   - WebSocket connection (keep port 8765 or switch to 7777)

2. **Week 2-4**:
   - Port Telnet parser
   - Implement GMCP/MCP handlers
   - Basic text output

3. **Week 4-6**:
   - ANSI color rendering
   - Command input + history
   - Preferences UI + storage

4. **Week 6-8+**:
   - Audio (FMOD/irrKlang or keep cacophony)
   - MIDI (Windows MIDI API or keep jzz)
   - TTS (SAPI or keep Web Speech)
   - Editor (Monaco/Scintilla/QScintilla)
   - File transfers (WebRTC or port logic)
   - LiveKit (keep or port)

---

## 14. Summary and Recommendations

### 14.1 Architecture Strengths (Portable to Win32)

1. **Clean Protocol Layer**: Telnet/GMCP/MCP handlers are pure logic
2. **Event-Driven**: Easily maps to Win32 message pump or Qt signals
3. **Modular Components**: Each UI component has clear responsibilities
4. **State Management**: Simple stores, easy to port
5. **Type Safety**: TypeScript types document interfaces well

### 14.2 Architecture Weaknesses (Challenges for Win32)

1. **Hardcoded Server**: No multi-server configuration
2. **Heavy Dependencies**: Monaco, LiveKit add complexity
3. **Browser-Specific**: Some APIs (Web MIDI, Web Speech) need replacement
4. **No Offline Mode**: Server connection required
5. **Size**: Monaco alone is ~5MB

### 14.3 Final Recommendation

**For Win32 Port**:

1. **Immediate/MVP**: **Electron**
   - Fastest to market (2-3 weeks)
   - 99% code reuse
   - Good enough for most users
   - Trade-off: larger size (~150MB)

2. **Medium-term**: **WebView2 Hybrid**
   - Better size/performance balance
   - More native feel
   - 4-6 weeks effort
   - Windows-only

3. **Long-term/Advanced**: **Native (Qt/C++ or WPF/C#)**
   - Best performance
   - True native UX
   - 16-20 weeks effort
   - Consider if Electron/WebView2 don't meet needs

**Suggested Path**:
- Start with Electron MVP to validate market
- Gather user feedback
- Decide on WebView2 or Native based on user needs (performance vs features)

### 14.4 Key Differences vs iOS Port

| Aspect | iOS Port | Win32 Port |
|--------|----------|------------|
| **Hybrid Option** | WKWebView (limited) | Electron/WebView2 (full-featured) |
| **Code Reuse** | Low (native required) | High (Electron 99%, WebView2 95%) |
| **Networking** | Must use native sockets | Can use WebSocket OR native TCP |
| **Editor** | Must replace Monaco | Can keep Monaco in WebView2/Electron |
| **MIDI** | CoreMIDI required | Can keep Web MIDI in Electron |
| **TTS** | AVSpeechSynthesizer | Can keep Web Speech in Electron |
| **Development Time** | 14-20 weeks minimum | 2-20 weeks (depends on approach) |
| **Platform APIs** | iOS-specific | Windows-specific OR web APIs |

**Win32 Advantage**: Hybrid approaches (Electron, WebView2) allow high code reuse that's not feasible on iOS.

---

## Document Information

**Report Version**: 1.0
**Analysis Date**: 2025-12-17
**Codebase Snapshot**: 108 TypeScript files, 34 runtime dependencies
**Cross-Referenced**:
- `reports/wave1/01-architecture.md` (iOS Swift port)
- `reports/wave2/01-architecture-networking-verification.md` (iOS networking)

**Key Finding**: Win32 port has significantly more options than iOS port. Electron/WebView2 enable rapid deployment with minimal code changes, while native rewrite offers maximum performance.

---

*End of Win32 Architecture Report*
