# Mongoose React Client - Architecture Report

**Date**: 2025-12-12
**Author**: Architecture Analysis
**Purpose**: iOS Port Investigation - Wave 1

## Executive Summary

The Mongoose React Client is a specialized web-based MUD (Multi-User Dungeon) client built with React 18, TypeScript, and Vite. It connects exclusively to Project Mongoose at `mongoose.moo.mud.org:8765` using WebSocket with Telnet protocol support. The application features sophisticated protocol handling (GMCP, MCP), real-time communication (WebRTC, LiveKit), MIDI support, file transfers, and accessibility features.

**Key Metrics**:
- 95 source files (TypeScript/TSX)
- 13 test files
- 24 CSS files
- ~94 total application files (excluding tests)
- Build system: Vite 6.3.5
- Runtime: React 18.3.1 with TypeScript 5.8.3

---

## 1. Project Structure

### Root Directory Layout

```
react-client/
├── src/                    # Application source code
├── public/                 # Static assets
├── tests/                  # E2E tests (Playwright)
├── dist/                   # Production build output
├── build/                  # Legacy build directory
├── node_modules/           # Dependencies
├── reports/                # Documentation/analysis reports
├── docs/                   # Additional documentation
├── index.html              # Entry HTML file
├── package.json            # NPM dependencies and scripts
├── vite.config.ts          # Vite build configuration
├── vitest.config.ts        # Unit test configuration
├── playwright.config.ts    # E2E test configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

### Source Directory Structure (`/src`)

```
src/
├── @types/                 # TypeScript type definitions
│   ├── dompurify.d.ts
│   ├── index.d.ts
│   ├── virtual-pwa-register.d.ts
│   └── vite-client.d.ts
│
├── components/             # React components
│   ├── editor/            # Monaco editor components
│   │   ├── editorWindow.tsx
│   │   ├── statusbar.tsx
│   │   └── toolbar.tsx
│   ├── FileTransfer/      # File transfer UI
│   │   ├── Controls.tsx
│   │   ├── History.tsx
│   │   ├── index.tsx
│   │   ├── PendingTransfer.tsx
│   │   └── ProgressBar.tsx
│   ├── output.tsx         # Main output window (virtualized)
│   ├── input.tsx          # Command input
│   ├── sidebar.tsx        # Tabbed sidebar
│   ├── toolbar.tsx        # Top toolbar
│   ├── statusbar.tsx      # Bottom status bar
│   ├── preferences.tsx    # Preferences UI
│   ├── PreferencesDialog.tsx
│   ├── inventory.tsx      # Character inventory
│   ├── InventoryList.tsx
│   ├── ItemCard.tsx
│   ├── RoomInfoDisplay.tsx
│   ├── SkillsDisplay.tsx
│   ├── TargetInfo.tsx
│   ├── PlayerCard.tsx
│   ├── userlist.tsx
│   ├── audioChat.tsx      # LiveKit voice chat
│   ├── MidiStatus.tsx     # MIDI connection status
│   ├── tabs.tsx           # Tab component
│   ├── AccessibleList.tsx
│   ├── BlockquoteCopyButton.tsx
│   └── BlockquoteWithCopy.tsx
│
├── gmcp/                   # GMCP protocol handlers
│   ├── package.ts         # Base GMCP package class
│   ├── index.ts           # GMCP exports
│   ├── Auth.ts            # Auto-login support
│   ├── Core.ts            # Core GMCP protocol
│   ├── Logging.ts
│   ├── Redirect.ts
│   ├── Group.ts
│   ├── Room.ts            # Room information
│   ├── Char/              # Character-related GMCP
│   │   ├── Afflictions.ts
│   │   ├── Defences.ts
│   │   ├── Items.ts
│   │   ├── Offer.ts
│   │   ├── Prompt.ts
│   │   ├── Skills.ts
│   │   └── Status/
│   │       ├── AffectedBy.ts
│   │       ├── Conditions.ts
│   │       └── Timers.ts
│   ├── Client/            # Client-related GMCP
│   │   ├── File.ts
│   │   ├── FileTransfer.ts
│   │   ├── Html.ts
│   │   ├── Keystrokes.ts
│   │   ├── Media.ts       # Sound/audio
│   │   ├── Midi.ts        # MIDI support
│   │   └── Speech.ts      # TTS support
│   ├── Comm/              # Communication GMCP
│   │   ├── Channel.ts
│   │   └── LiveKit.ts     # Voice chat integration
│   └── IRE/               # IRE-specific protocols
│
├── hooks/                  # React custom hooks
│   ├── useClientEvent.ts  # Client event listener hook
│   ├── usePreferences.tsx # Preferences state hook
│   ├── useInputStore.ts
│   └── useVoices.tsx      # Speech synthesis voices
│
├── client.ts               # Main MudClient class (615 lines)
├── telnet.ts               # Telnet protocol parser (273 lines)
├── mcp.ts                  # MCP protocol implementation (341 lines)
├── ansiParser.tsx          # ANSI color parser
├── App.tsx                 # Main application component (314 lines)
├── index.tsx               # Application entry point (33 lines)
├── PreferencesStore.tsx    # Global preferences state (174 lines)
├── InputStore.ts           # Input history state
├── FileTransferStore.ts    # File transfer state
├── FileTransferManager.ts  # File transfer logic (615 lines)
├── EditorManager.ts        # External editor windows (117 lines)
├── WebRTCService.ts        # WebRTC peer connections (534 lines)
├── MidiService.ts          # MIDI device management (588 lines)
├── VirtualMidiService.ts   # Virtual MIDI synthesizer
├── CommandHistory.ts       # Command history management
├── SessionRecorder.ts      # Session recording
├── SessionReplayer.ts      # Session playback
├── reportWebVitals.ts      # Performance monitoring
├── setupTests.ts           # Test configuration
├── vitest.setup.ts         # Vitest setup
├── index.css               # Global styles
└── App.css                 # Application layout styles (224 lines)
```

**Key Observations**:
- Well-organized modular structure
- Clear separation of concerns (protocols, UI, state, services)
- Protocol handlers are abstracted into packages (GMCP, MCP)
- Components follow React best practices
- Strong TypeScript typing throughout

---

## 2. Entry Points and Application Bootstrap

### 2.1 HTML Entry Point

**File**: `C:\Users\Q\code\react-client\index.html`

**Key Features** (lines 1-70):
- Standard HTML5 document
- PWA manifest references (lines 7-13, 20)
- Favicon and icon configuration (lines 7-13)
- GitHub Pages SPA routing workaround script (lines 33-60)
  - Handles client-side routing on static hosting
  - Rewrites URL query parameters to paths
- Root div mount point: `<div id="root">` (line 66)
- Module script entry: `<script type="module" src="/src/index.tsx">` (line 67)

### 2.2 JavaScript Entry Point

**File**: `C:\Users\Q\code\react-client\src\index.tsx`

**Bootstrap Sequence** (lines 1-33):

```typescript
1. Import React, ReactDOM, router libraries
2. Import App component and EditorWindow
3. Import reportWebVitals and PWA service worker
4. Create router configuration (lines 10-13):
   - "/" -> App (main client)
   - "/editor" -> EditorWindow (external editor)
5. Create React root (lines 15-16)
6. Render with React.StrictMode + RouterProvider (lines 18-22)
7. Initialize web vitals monitoring (line 27)
8. Register PWA service worker in production (lines 30-32)
```

**Routing Structure**:
- Simple BrowserRouter with 2 routes
- No nested routing
- Editor opens in new window/tab

### 2.3 Main Application Component

**File**: `C:\Users\Q\code\react-client\src\App.tsx`

**Initialization Flow** (lines 51-187):

```typescript
1. State initialization:
   - client: MudClient instance
   - showSidebar: boolean (false on mobile)
   - File transfer UI state

2. Client initialization (useEffect, lines 86-187):
   - ONE-TIME initialization guard (clientInitialized ref)
   - Create MudClient instance (line 88)
   - Register 20+ GMCP packages (lines 89-115)
   - Register 4 MCP packages (lines 117-120)
   - Connect to server (line 121)
   - Request notification permission (line 122)
   - Auto-login support via URL parameters (lines 125-140)
   - Initialize virtual MIDI (lines 147-155)
   - Set up global keyboard handlers (lines 158-186)
     - Control key: cancel speech
     - Escape: stop all sounds/MIDI

3. Secondary effects:
   - CTRL+number shortcut for sidebar tabs (lines 190-220)
   - File transfer offer handling (lines 242-253)
   - Before unload cleanup (lines 255-259)
   - Auto-focus input (lines 261-263)
```

**Component Structure** (lines 267-310):
- Grid-based layout with semantic HTML
- Header (toolbar)
- Main (output window)
- Command input area
- Conditional sidebar (hidden on mobile)
- Footer (status bar)
- Preferences dialog (modal)

**Server Connection**:
- Hardcoded: `mongoose.moo.mud.org:8765` (line 88)
- WebSocket with TLS: `wss://` protocol
- Auto-reconnect on disconnect (see client.ts line 312-315)

---

## 3. Build System

### 3.1 Vite Configuration

**File**: `C:\Users\Q\code\react-client\vite.config.ts`

**Plugins** (lines 7-19):
1. `@vitejs/plugin-react` - React Fast Refresh, JSX transform
2. `vite-plugin-commit-hash` - Injects Git commit hash
3. `vite-plugin-pwa` - Progressive Web App support
   - Auto-update service worker
   - Cache: JS, CSS, HTML, images, SVG
   - Theme color: #000000

**Test Configuration** (lines 20-24):
- Environment: jsdom
- Globals enabled
- Setup file: `./src/setupTests.ts`

**Default Configuration**:
- No custom base URL (deployed to root)
- No proxy configuration
- Standard development server (port 5173 by default)

### 3.2 TypeScript Configuration

**File**: `C:\Users\Q\code\react-client\tsconfig.json`

**Key Settings**:
- Target: ESNext (lines 4)
- Module: ESNext with Node resolution (lines 17-18)
- JSX: react-jsx (modern transform, line 22)
- Strict mode enabled (line 14)
- Isolated modules (line 20) - required for Vite
- No emit (line 21) - Vite handles compilation
- Custom type roots (lines 23-26):
  - `./node_modules/@types`
  - `./src/@types` - custom type definitions
- Downlevel iteration (line 3) - for-of on older browsers

**Exclusions** (lines 31-35):
- Test files excluded from main build
- `setupTests.ts` excluded

### 3.3 Build Scripts

**File**: `C:\Users\Q\code\react-client\package.json` (lines 36-41)

```json
{
  "start": "vite --open",           // Dev server with auto-open
  "build": "vite build",            // Production build
  "serve": "vite preview",          // Preview production build
  "test": "vitest run"              // Run unit tests
}
```

**Build Output**:
- Production: `dist/` directory
- Assets: Hashed filenames for cache busting
- PWA manifest and service worker generated

---

## 4. Dependencies Analysis

### 4.1 Core Framework (package.json lines 5-35)

**React Ecosystem**:
- `react@18.3.1` - Core library
- `react-dom@18.3.1` - DOM renderer
- `react-router-dom@6.30.1` - Client-side routing
- `react-icons@5.5.0` - Icon library
- `react-beforeunload@2.6.0` - Unload event handling
- `react-focus-lock@2.13.6` - Focus trap for accessibility
- `react-use@17.6.0` - Collection of React hooks
- `react-virtuoso@4.6.4` - Virtualized scrolling for output

**Purpose**: Standard modern React stack with routing and utility libraries.

### 4.2 Protocol & Communication

**Telnet/MUD Protocols**:
- Custom implementation in `telnet.ts` and `client.ts`
- No external Telnet library dependencies

**Real-time Communication**:
- `@livekit/components-react@2.9.14` - LiveKit React components
- `livekit-client@2.15.6` - LiveKit WebRTC client
- `eventemitter3@5.0.1` - Event emitter for custom events
- `buffer@6.0.3` - Node.js Buffer API for browser

**Purpose**: Voice chat integration and protocol event handling.

### 4.3 Content Processing

**Text Rendering**:
- `anser@2.3.2` - ANSI escape code parsing
- `strip-ansi@7.1.0` - Remove ANSI codes
- `marked@15.0.12` - Markdown to HTML parser
- `turndown@7.2.0` - HTML to Markdown converter
- `dompurify@3.2.6` - XSS sanitization

**Purpose**: Rich text display with ANSI colors, markdown support, and security.

### 4.4 Audio & Media

**Sound**:
- `cacophony@0.14.2` - Audio playback library
  - Handles background music and sound effects
  - Volume control, muting

**MIDI**:
- `jzz@1.9.3` - MIDI library
- `jzz-synth-tiny@1.4.3` - Software MIDI synthesizer

**Speech**:
- Web Speech API (native browser API)
- No external dependencies

**Purpose**: Multi-modal output (sound, MIDI music, text-to-speech).

### 4.5 Editor & Development Tools

**Code Editor**:
- `@monaco-editor/react@4.7.0` - React wrapper for Monaco
- `monaco-editor@0.52.2` - VS Code editor component
  - Used for in-game code editing
  - Syntax highlighting, autocomplete

**Purpose**: In-browser code editor for MOO programming.

### 4.6 Utility Libraries

**State Management**:
- Custom stores (PreferencesStore, InputStore, FileTransferStore)
- localStorage for persistence
- No Redux/MobX/Zustand - lightweight custom solution

**Caching**:
- `lru-cache@10.4.3` - LRU cache for MCP messages

**Cryptography**:
- `crypto-js@4.2.0` - Hashing for file transfers

**Accessibility**:
- `@react-aria/live-announcer@3.4.3` - Screen reader announcements

**Performance**:
- `web-vitals@3.5.2` - Core Web Vitals monitoring

### 4.7 Build & Development Dependencies (lines 53-69)

**Build Tools**:
- `vite@6.3.5` - Build tool and dev server
- `@vitejs/plugin-react@4.6.0` - React plugin for Vite
- `vite-plugin-pwa@1.0.1` - PWA generation
- `vite-plugin-commit-hash@1.0.8` - Git hash injection

**Testing**:
- `vitest@1.6.1` - Unit testing framework (Vite-native)
- `@playwright/test@1.48.0` - E2E testing
- `@testing-library/react@16.3.0` - React testing utilities
- `@testing-library/jest-dom@6.6.3` - DOM matchers
- `jsdom@26.1.0` - DOM implementation for testing

**TypeScript**:
- `typescript@5.8.3` - TypeScript compiler
- `@types/*` packages for type definitions

**Other**:
- `cross-env@7.0.3` - Cross-platform environment variables

---

## 5. Routing and Navigation

### 5.1 Router Configuration

**File**: `C:\Users\Q\code\react-client\src\index.tsx` (lines 10-13)

```typescript
const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/editor", element: <EditorWindow /> },
]);
```

**Route Details**:

1. **Main Route (`/`)**:
   - Component: App
   - Purpose: Primary MUD client interface
   - Features: Output, input, sidebar, toolbar, status bar

2. **Editor Route (`/editor`)**:
   - Component: EditorWindow
   - Purpose: External code editor windows
   - Query param: `?reference=<id>` - identifies editing session
   - Opens in new browser window/tab
   - Communicates with main window via BroadcastChannel

### 5.2 Navigation Patterns

**External Editor Flow**:
1. Server sends MCP `dns-org-mud-moo-simpleedit-content` message
2. EditorManager.openEditorWindow() called (EditorManager.ts line 25)
3. window.open() creates new window with `/editor?reference=<id>` (line 34)
4. EditorWindow component loads in new window
5. BroadcastChannel establishes communication (line 21)
6. Editor posts "ready" message (EditorManager.ts line 69)
7. Main window sends content via channel (line 76)
8. User edits and saves
9. Editor posts "save" message with content (line 83)
10. Main window sends MCP save command to server

**No Traditional Navigation**:
- No navigation menu
- No route transitions
- Single-page application with external editor windows
- GitHub Pages routing handled by script in index.html

---

## 6. Application Initialization and Bootstrap

### 6.1 Initialization Sequence

**Complete Bootstrap Flow**:

```
1. Browser loads index.html
   ↓
2. GitHub Pages routing script runs (if needed)
   ↓
3. Vite loads /src/index.tsx as ES module
   ↓
4. React router initialized with 2 routes
   ↓
5. React.StrictMode wrapper applied
   ↓
6. App component mounts
   ↓
7. ONE-TIME client initialization (useEffect with guard)
   ↓
8. MudClient instance created
   - Host: mongoose.moo.mud.org
   - Port: 8765
   ↓
9. GMCP packages registered (20+ handlers)
   ↓
10. MCP packages registered (4 handlers)
    ↓
11. WebSocket connection established (wss://)
    ↓
12. Telnet negotiation begins
    ↓
13. GMCP handshake (Core.Hello, Core.Supports.Set)
    ↓
14. Auto-login attempt (if credentials in URL)
    ↓
15. Virtual MIDI synthesizer initialized
    ↓
16. Global keyboard handlers registered
    ↓
17. Component refs initialized (output, input, sidebar)
    ↓
18. Initial focus on input element
    ↓
19. Web vitals monitoring starts
    ↓
20. PWA service worker registers (production only)
```

### 6.2 Client Initialization Details

**File**: `C:\Users\Q\code\react-client\src\client.ts`

**Constructor** (lines 93-125):
- Extends EventEmitter for pub/sub pattern
- Creates Telnet parser
- Initializes Cacophony audio engine
- Creates EditorManager
- Creates WebRTCService for file transfers
- Creates FileTransferManager
- Sets up window focus/blur listeners (lines 111-124)
- Subscribes to preference changes

**Connection Establishment** (lines 258-322):
- Creates WebSocket with `wss://` protocol
- Sets binary type to arraybuffer
- Attaches Telnet parser to WebSocket stream
- Registers Telnet event handlers:
  - `data`: regular text data
  - `negotiation`: protocol negotiation (GMCP, TTYPE)
  - `gmcp`: GMCP messages
- Auto-reconnect on disconnect (10 second delay, line 314)
- Error event handler

**GMCP Initialization** (lines 278-297):
- Wait for WILL GMCP from server (line 279)
- Respond with DO GMCP (line 281)
- Send Core.Hello (line 282)
- Send Core.Supports.Set with capabilities (line 283)
- Send Auth.Autologin.Login if saved (line 284)
- Handle TTYPE negotiation (lines 285-297)

### 6.3 State Initialization

**Preferences** (PreferencesStore.tsx):
- Loaded from localStorage on construction (line 74)
- Merged with defaults (lines 86, 121-132)
- Migration logic for schema changes (lines 78-84)
- Defaults:
  - Local echo: off
  - Speech: off (rate 1.0, pitch 1.0, volume 1.0)
  - Sound volume: 1.0
  - Editor autocomplete: on
  - Editor accessibility: on
  - MIDI: disabled

**World Data** (client.ts lines 68-74):
- playerId: ""
- playerName: ""
- roomId: ""
- liveKitTokens: []
- roomPlayers: []

### 6.4 Event System

**Client Events** (EventEmitter3):
- `connect` - WebSocket connected
- `disconnect` - WebSocket disconnected
- `connectionChange` - Connection state changed (boolean)
- `message` - Text data from server
- `command` - Local echo of sent command
- `error` - Connection error
- `userlist` - Player list updated (MCP)
- `fileTransferOffer` - Incoming file transfer
- `fileTransferAccepted` - Transfer accepted
- `fileTransferRejected` - Transfer rejected
- `fileTransferCancelled` - Transfer cancelled
- `fileSendComplete` - File sent successfully
- `fileTransferError` - Transfer error
- `autosayChanged` - Autosay mode toggled
- `statustext` - Status bar text update
- Custom GMCP/MCP events

**useClientEvent Hook** (hooks/useClientEvent.ts):
- Generic hook for subscribing to client events
- Type-safe with ClientEventMap
- Auto cleanup on unmount
- Used throughout components

---

## 7. Environment and Configuration

### 7.1 Build Environment

**Vite Environment Variables**:
- `import.meta.env.PROD` - Production mode check (index.tsx line 30)
- No `.env` files in repository
- No runtime configuration endpoint

### 7.2 Hardcoded Configuration

**Server Connection** (App.tsx line 88):
```typescript
const newClient = new MudClient("mongoose.moo.mud.org", 8765);
```
- Not configurable at runtime
- Exclusive connection to Project Mongoose

**WebRTC STUN/TURN Servers** (WebRTCService.ts lines 25-34):
```typescript
iceServers: [
  {
    urls: ["turn:mongoose.world:3478", "stun:mongoose.world:3478"],
    username: "p2p",
    credential: "p2p",
  },
  {
    urls: "stun:stun.l.google.com:19302",
  },
]
```

### 7.3 LocalStorage Usage

**Keys**:
- `preferences` - User preferences JSON
- Potentially GMCP auth tokens (GMCPAutoLogin)

**Data Persistence**:
- Preferences saved on every change (PreferencesStore.tsx line 157)
- No session storage
- No IndexedDB

### 7.4 PWA Configuration

**Manifest** (public/manifest.json):
- Short name: "Mongoose Client"
- Full name: "Mongoose Web Client"
- Display: standalone
- Theme color: #000000
- Background: #ffffff
- Icons: 16x16 to 512x512

**Service Worker** (vite-plugin-pwa):
- Auto-update strategy
- Caches: JS, CSS, HTML, images, SVG
- Registered in production only (index.tsx lines 30-32)

### 7.5 Auto-login Feature

**URL Parameters** (App.tsx lines 125-140):
- `?username=<name>&password=<pass>` in URL
- Automatically logs in on connection
- Used for E2E testing (see git commit 6b9b302)
- Credentials visible in URL - security concern for production

---

## 8. Testing Setup

### 8.1 Unit Testing (Vitest)

**Configuration File**: `C:\Users\Q\code\react-client\vitest.config.ts`

**Settings**:
- Environment: jsdom (browser simulation)
- Globals: true (describe, it, expect without imports)
- Setup file: `./src/vitest.setup.ts`
- Excludes:
  - node_modules
  - dist
  - Playwright tests in `tests/` directory

**Setup File**: `C:\Users\Q\code\react-client\src\vitest.setup.ts`

**Mocks**:
- BroadcastChannel (for EditorManager tests)
- localStorage (get, set, remove, clear)
- window.open (for editor window tests)

**Test Files**:
- 13 test files found
- Co-located with source files (`*.test.ts`, `*.test.tsx`)
- Testing:
  - ansiParser.test.tsx
  - CommandHistory.test.ts
  - EditorManager.test.ts
  - PreferencesStore.test.tsx
  - usePreferences.test.tsx
  - BlockquoteCopyButton.test.tsx
  - BlockquoteWithCopy.test.tsx
  - input.test.tsx
  - output.test.tsx
  - telnet.test.ts
  - mcp.test.ts
  - WebRTCService.test.ts
  - gmcp/Client/File.test.ts

### 8.2 E2E Testing (Playwright)

**Configuration File**: `C:\Users\Q\code\react-client\playwright.config.ts`

**Settings**:
- Test directory: `./tests/visual`
- Base URL: `http://localhost:5173`
- Retries: 2 in CI, 0 locally
- Workers: 1 in CI, unlimited locally
- Reporter: HTML
- Screenshot: only on failure
- Trace: on first retry

**Projects**:
1. chromium (Desktop Chrome)
2. webkit (Desktop Safari)
3. mobile-chrome (Pixel 5)

**Web Server**:
- Command: `npm run start`
- URL: `http://localhost:5173`
- Reuse server if running
- Timeout: 120 seconds

**Test Files**:
- Located in `tests/` directory
- Visual regression testing

### 8.3 Testing Utilities

**React Testing Library**:
- `@testing-library/react@16.3.0`
- `@testing-library/jest-dom@6.6.3`
- Used for component testing

**Coverage**:
- `coverage/` directory exists
- No coverage configuration in package.json
- Vitest has built-in coverage support

---

## 9. Architecture Patterns and Design Decisions

### 9.1 State Management

**Pattern**: Custom lightweight stores (no Redux/MobX)

**Stores**:
1. **PreferencesStore** (PreferencesStore.tsx):
   - Observer pattern with listeners
   - localStorage persistence
   - Reducer-like dispatch function
   - Type-safe actions

2. **InputStore** (InputStore.ts):
   - Command input state
   - Simple getter/setter pattern

3. **FileTransferStore** (FileTransferStore.ts):
   - File transfer UI state
   - Zustand-like API

**Rationale**:
- Lightweight (no heavy dependencies)
- localStorage integration is simple
- Type-safe with TypeScript
- Observable pattern for React updates

### 9.2 Communication Architecture

**Layered Protocol Stack**:

```
Application Layer (React Components)
         ↓
Event Layer (EventEmitter3)
         ↓
Client Layer (MudClient class)
         ↓
Protocol Layer (GMCP/MCP handlers)
         ↓
Telnet Layer (TelnetParser)
         ↓
Transport Layer (WebSocket)
```

**GMCP Package Pattern** (gmcp/package.ts):
- Base class: GMCPPackage
- Each package registers message handlers
- Naming convention: `handle<MessageType>` methods
- Automatic handler discovery via reflection
- Example: `GMCPCore.handleHello(data)`

**MCP Package Pattern** (mcp.ts):
- Base class: MCPPackage
- Auth key verification
- Multiline message support
- Tag-based message continuation

**Benefits**:
- Protocol handlers are isolated
- Easy to add new GMCP/MCP packages
- Type-safe message handling
- Testable in isolation

### 9.3 Component Architecture

**Component Hierarchy**:

```
App
├── Toolbar
│   ├── Connection indicator
│   ├── Save/Clear/Copy buttons
│   ├── Sidebar toggle
│   └── Preferences button
├── OutputWindow (virtualized)
│   └── ANSI-rendered content
├── CommandInput
│   └── History navigation
├── Sidebar (conditional)
│   ├── Tabs
│   │   ├── Room Info
│   │   ├── Players List
│   │   ├── Inventory
│   │   ├── Skills
│   │   ├── Audio Chat
│   │   └── File Transfer
├── Statusbar
│   └── Connection status
└── PreferencesDialog (modal)
    └── Preferences form
```

**Key Patterns**:
- forwardRef for ref access (Output, Input, Sidebar, PreferencesDialog)
- useImperativeHandle for exposing methods
- Conditional rendering for mobile (sidebar)
- CSS Grid for layout
- Focus management for accessibility

### 9.4 Performance Optimizations

**Virtualized Scrolling** (output.tsx):
- `react-virtuoso@4.6.4`
- Only renders visible output lines
- Critical for long play sessions
- Handles thousands of lines efficiently

**Output Persistence Architecture** (see git commit a382f9c):
- React components stored in array, not HTML strings
- Allows blockquote copy buttons to persist
- Solves rehydration problem

**Event System**:
- EventEmitter3 (lightweight, fast)
- useClientEvent hook prevents memory leaks
- Auto cleanup on unmount

**Lazy Loading**:
- No code splitting visible
- Could benefit from route-based splitting
- Monaco editor is heavy (~5MB) - loaded eagerly

### 9.5 Accessibility Features

**ARIA Support**:
- Semantic HTML (header, main, aside, footer)
- Role attributes (banner, main, complementary, contentinfo)
- aria-label on regions
- Screen reader only text (.sr-only in App.css)

**Live Announcer**:
- `@react-aria/live-announcer@3.4.3`
- Screen reader notifications

**Keyboard Navigation**:
- Focus management (auto-focus input)
- Keyboard shortcuts (CTRL+number for tabs)
- Focus lock in dialogs

**Screen Reader Support**:
- TTS integration with Web Speech API
- Autoread modes (off, unfocused, all)
- Configurable voice, rate, pitch

**Editor Accessibility Mode**:
- Monaco editor accessibility mode toggle
- Optimizes for screen readers

### 9.6 Security Considerations

**XSS Protection**:
- DOMPurify for HTML sanitization (dompurify@3.2.6)
- Used in markdown rendering
- Server content is sanitized before display

**Content Security Policy**:
- No CSP headers visible in code
- Relying on DOMPurify for protection

**Authentication**:
- Auto-login via GMCP (Auth.Autologin)
- Passwords stored in localStorage (security concern)
- URL parameter auto-login (security concern for production)

**WebSocket Security**:
- WSS (TLS encrypted) connection
- Server certificate validation

**Potential Issues**:
1. Auto-login credentials in URL (testing feature, could leak)
2. localStorage password storage (XSS vulnerable)
3. No CSP headers
4. Hardcoded TURN credentials (p2p/p2p)

### 9.7 Error Handling

**Connection Errors**:
- Auto-reconnect on disconnect (10s delay)
- Connection state tracking (connected boolean)
- Error events emitted
- UI feedback via status bar

**Protocol Errors**:
- Console logging throughout
- Invalid MCP messages logged and ignored
- GMCP parse errors caught and logged

**File Transfer Errors**:
- WebRTC connection failure recovery
- Transfer timeout handling
- Error events emitted to UI

**Missing**:
- No global error boundary
- No error reporting service
- No user-facing error messages for many failures

---

## 10. Key Technical Findings for iOS Port

### 10.1 Web-Specific Dependencies

**Browser APIs Used**:
1. **WebSocket** (client.ts) - Core communication
   - Need: Native WebSocket or polyfill

2. **Web Speech API** (client.ts lines 571-592) - TTS
   - Need: iOS Text-to-Speech API

3. **Notification API** (client.ts lines 548-569) - Desktop notifications
   - Need: iOS local notifications

4. **Web MIDI API** (MidiService.ts) - MIDI device access
   - Need: CoreMIDI framework on iOS

5. **WebRTC** (WebRTCService.ts) - P2P file transfers
   - Available in iOS WebKit
   - May need native WebRTC SDK for better performance

6. **BroadcastChannel** (EditorManager.ts) - Inter-window communication
   - Need: Alternative IPC mechanism

7. **localStorage** (PreferencesStore.tsx) - Persistence
   - Available in WebView
   - Could use native UserDefaults

8. **Service Worker** (PWA) - Offline support
   - Limited in iOS WebView
   - May need native caching

### 10.2 External Service Dependencies

1. **LiveKit** (voice chat):
   - Client library: `livekit-client@2.15.6`
   - Server endpoint: Provided by game server via GMCP
   - iOS SDK available: `LiveKit-iOS`

2. **STUN/TURN Servers**:
   - `stun:mongoose.world:3478`
   - `turn:mongoose.world:3478`
   - `stun:stun.l.google.com:19302`
   - Required for WebRTC connectivity

3. **Game Server**:
   - Host: `mongoose.moo.mud.org`
   - Port: 8765
   - Protocol: WebSocket over TLS

### 10.3 Large Dependencies

**Monaco Editor**:
- Size: ~5MB unpacked
- Used for in-game code editing
- Heavy for mobile
- Consideration:
  - Replace with lighter editor (CodeMirror?)
  - Or use native iOS text editor with syntax highlighting

**Audio Libraries**:
- Cacophony: Custom audio engine
- JZZ: MIDI library
- Consider: iOS native audio APIs (AVFoundation)

### 10.4 Protocol Requirements

**Must Implement**:
1. Telnet protocol (RFC 854)
2. GMCP (Generic Mud Communication Protocol)
3. MCP (Mud Client Protocol)
4. ANSI escape code parsing

**Can Reuse**:
- TypeScript protocol handlers could be translated to Swift
- Logic is well-encapsulated in packages
- Message formats are JSON (GMCP) and key-value (MCP)

### 10.5 UI Considerations

**Layout**:
- CSS Grid layout (may need UIKit/SwiftUI equivalent)
- Responsive design (mobile-first)
- Virtualized scrolling (UITableView/UICollectionView)

**Components**:
- Toolbar (UINavigationBar?)
- Status bar (UITabBar? or custom view)
- Sidebar (slide-out menu or tabs)
- Output window (UITextView with attributed strings)
- Command input (UITextField/UITextView)

**Styling**:
- 24 CSS files
- CSS custom properties (variables)
- Would need to recreate in UIKit/SwiftUI

### 10.6 State Management

**Current Approach**:
- Custom stores with observers
- localStorage persistence
- No external state library

**iOS Equivalent**:
- UserDefaults for preferences
- Combine framework for reactive state?
- Or simple Observable pattern

### 10.7 File System Access

**Editor Integration**:
- Opens external editor windows
- BroadcastChannel for communication
- Edits MOO code, sends back via MCP

**iOS Considerations**:
- Can't open separate browser windows
- Could use:
  - Modal view controller
  - Split view
  - Separate app with URL scheme
  - Native code editor component

### 10.8 Offline Capability

**Current**:
- PWA with service worker
- Caches static assets
- No offline functionality (server connection required)

**iOS**:
- Could cache assets in app bundle
- No offline mode needed (MUD requires connection)

---

## 11. Build and Deployment

### 11.1 Production Build

**Command**: `npm run build`

**Process**:
1. Vite compiles TypeScript to JavaScript
2. React JSX transformed
3. CSS bundled and minified
4. Assets hashed for cache busting
5. PWA manifest and service worker generated
6. Output to `dist/` directory

**Output Structure**:
```
dist/
├── index.html
├── assets/
│   ├── index-<hash>.js
│   ├── index-<hash>.css
│   └── [other chunked assets]
├── manifest.json
└── sw.js (service worker)
```

### 11.2 Deployment

**Target**: GitHub Pages

**URL**: `https://client.rustytelephone.net`

**Process**:
- Commits to master branch trigger auto-deploy
- Static files served from `dist/`
- GitHub Pages routing script handles SPA

**Configuration**:
- CNAME file in public/ (line in README)
- 404.html for GitHub Pages SPA routing

### 11.3 Development Workflow

**Dev Server**: `npm start`
- Vite dev server on port 5173 (default)
- Hot module replacement
- Opens browser automatically (--open flag)

**Testing**:
- Unit: `npm test` (Vitest)
- E2E: `npx playwright test`

**Preview**: `npm run serve`
- Preview production build locally
- Tests build output before deploy

---

## 12. Critical Files Reference

### 12.1 Core Application Files

| File | Lines | Purpose | Key Details |
|------|-------|---------|-------------|
| `src/client.ts` | 615 | MudClient class | WebSocket, Telnet, GMCP, MCP handling |
| `src/App.tsx` | 314 | Main UI component | Layout, initialization, event handlers |
| `src/index.tsx` | 33 | Entry point | Router setup, PWA registration |
| `src/telnet.ts` | 273 | Telnet parser | State machine for Telnet protocol |
| `src/mcp.ts` | 341 | MCP protocol | Message parsing, package base class |
| `src/PreferencesStore.tsx` | 174 | Settings state | Observable store with localStorage |

### 12.2 Protocol Handlers

| Directory | Files | Purpose |
|-----------|-------|---------|
| `src/gmcp/` | 27 files | GMCP protocol packages |
| `src/gmcp/Char/` | 8 files | Character state (items, skills, status) |
| `src/gmcp/Client/` | 6 files | Client features (media, MIDI, speech, file transfer) |
| `src/gmcp/Comm/` | 2 files | Communication (channels, LiveKit) |

### 12.3 Service Classes

| File | Lines | Purpose |
|------|-------|---------|
| `src/WebRTCService.ts` | 534 | WebRTC P2P connections |
| `src/FileTransferManager.ts` | 615 | File transfer orchestration |
| `src/MidiService.ts` | 588 | MIDI device management |
| `src/EditorManager.ts` | 117 | External editor windows |

### 12.4 UI Components

| File | Purpose |
|------|---------|
| `src/components/output.tsx` | Virtualized output window |
| `src/components/input.tsx` | Command input with history |
| `src/components/sidebar.tsx` | Tabbed sidebar |
| `src/components/toolbar.tsx` | Top toolbar |
| `src/components/statusbar.tsx` | Connection status |
| `src/components/preferences.tsx` | Settings panel |

### 12.5 Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Build configuration |
| `vitest.config.ts` | Unit test configuration |
| `playwright.config.ts` | E2E test configuration |
| `tsconfig.json` | TypeScript configuration |
| `package.json` | Dependencies and scripts |

---

## 13. Recommendations for iOS Port

### 13.1 Architecture Decisions

**Hybrid vs. Native**:

**Option A: Hybrid (WKWebView)**:
- ✅ Reuse existing React codebase
- ✅ Faster initial development
- ❌ Performance concerns (virtualized scrolling)
- ❌ Limited access to native APIs
- ❌ Monaco editor is heavy

**Option B: Native (Swift/SwiftUI)**:
- ✅ Better performance
- ✅ Native UI controls
- ✅ Full API access
- ❌ Complete rewrite
- ❌ Longer development time

**Recommendation**:
1. **Phase 1**: Hybrid with WKWebView
   - Validate market fit quickly
   - Bridge for critical APIs (MIDI, notifications)
   - Replace Monaco with lighter editor or native view

2. **Phase 2**: Gradual native migration
   - Rewrite UI components in SwiftUI
   - Port protocol handlers to Swift
   - Keep business logic architecture

### 13.2 Protocol Layer

**Reusable Architecture**:
- Package pattern for GMCP/MCP is sound
- Could translate to Swift protocols
- Message handlers can be 1:1 ported

**Recommended Approach**:
1. Create Swift equivalent of GMCPPackage base class
2. Port each package (Auth, Core, Char, Client, etc.)
3. Use Codable for JSON parsing
4. EventEmitter → NotificationCenter or Combine publishers

### 13.3 Critical Replacements

| Web Technology | iOS Alternative |
|----------------|-----------------|
| WebSocket | URLSessionWebSocketTask (iOS 13+) |
| Web Speech API | AVSpeechSynthesizer |
| Web MIDI API | CoreMIDI |
| Notification API | UserNotifications framework |
| BroadcastChannel | NotificationCenter or App Groups |
| localStorage | UserDefaults or Core Data |
| Monaco Editor | Native UITextView with syntax highlighting |
| Service Worker | URLCache or custom caching |

### 13.4 UI/UX Adaptations

**Layout**:
- Convert CSS Grid to SwiftUI Grid/VStack/HStack
- Or UICollectionView compositional layout

**Virtualized Scrolling**:
- UITableView or UICollectionView (native virtualization)
- Or SwiftUI List with lazy loading

**Sidebar**:
- UITabBarController for bottom tabs?
- Or slide-out drawer (UISplitViewController)

**Input**:
- UITextField with inputAccessoryView
- Custom keyboard toolbar for shortcuts

**Output**:
- UITextView with NSAttributedString for ANSI colors
- Or custom UICollectionView with cells

### 13.5 Testing Strategy

**Unit Tests**:
- XCTest framework
- Test protocol handlers in isolation
- Mock WebSocket connections

**UI Tests**:
- XCUITest framework
- Test critical user flows
- Accessibility testing

**Integration Tests**:
- Test against real server
- WebSocket connection handling
- GMCP/MCP message flow

### 13.6 Performance Targets

**Metrics to Maintain**:
1. Message latency: <50ms from WebSocket to display
2. Scroll performance: 60fps with 10,000+ lines
3. Memory: <100MB for typical session
4. Battery: Comparable to web version in browser

**Optimizations**:
1. Efficient attributed string creation (ANSI parsing)
2. Cell reuse in virtualized output
3. Background thread for protocol parsing
4. Lazy loading of images/media

### 13.7 Prioritization for MVP

**Phase 1 (Core Functionality)**:
1. WebSocket connection
2. Telnet protocol
3. GMCP Core, Auth
4. Basic output display (ANSI colors)
5. Command input
6. Preferences storage

**Phase 2 (Enhanced Features)**:
1. GMCP Char (inventory, skills, status)
2. GMCP Client.Media (sound)
3. MCP protocol
4. Editor integration
5. File transfers (WebRTC)

**Phase 3 (Advanced Features)**:
1. LiveKit voice chat
2. MIDI support
3. TTS with configurable voices
4. Advanced UI polish

### 13.8 Risk Areas

**High Risk**:
1. **WebRTC File Transfers**: Complex, may need significant rework
2. **MIDI**: CoreMIDI learning curve, device compatibility
3. **Editor**: No good lightweight alternatives to Monaco

**Medium Risk**:
1. **LiveKit**: iOS SDK exists but integration effort
2. **Performance**: Virtualized scrolling must be fast
3. **Protocol Compatibility**: Must match web client exactly

**Low Risk**:
1. **WebSocket**: Well-supported on iOS
2. **Basic GMCP/MCP**: Straightforward to implement
3. **Preferences**: UserDefaults is simple

---

## 14. Summary

### 14.1 Architecture Strengths

1. **Clean Separation**: Protocols, services, UI are well-separated
2. **Extensible**: Package pattern makes adding features easy
3. **Type Safety**: Strong TypeScript typing throughout
4. **Testable**: Isolated modules, dependency injection
5. **Performant**: Virtualized scrolling, event-driven
6. **Accessible**: ARIA, screen reader support, keyboard nav

### 14.2 Architecture Weaknesses

1. **Hardcoded Server**: No multi-server support
2. **Heavy Dependencies**: Monaco editor, LiveKit
3. **Security**: Credentials in localStorage, URL params
4. **Error Handling**: Limited user-facing error messages
5. **Code Splitting**: No lazy loading of routes/features

### 14.3 Portability Assessment

**High Portability**:
- Protocol logic (GMCP, MCP, Telnet)
- Business logic (state management)
- Architecture patterns

**Medium Portability**:
- UI component structure
- Event system
- File transfer logic

**Low Portability**:
- React components (need full rewrite)
- CSS styling (need conversion)
- Monaco editor (need replacement)
- PWA features (need native equivalent)

### 14.4 Estimated Complexity

**Lines of Code**:
- Core: ~2,500 (client, telnet, mcp, services)
- GMCP: ~1,500 (all packages)
- UI: ~2,000 (components)
- Total: ~6,000 LOC (excluding tests, node_modules)

**Estimated Swift Port**:
- Core: ~3,000 LOC (protocol handlers)
- UI: ~4,000 LOC (SwiftUI or UIKit)
- Services: ~2,000 LOC (WebRTC, MIDI, LiveKit)
- **Total: ~9,000 LOC** (Swift is more verbose)

**Timeline Estimate** (1 developer):
- Phase 1 MVP: 8-10 weeks
- Phase 2 Enhanced: 6-8 weeks
- Phase 3 Advanced: 4-6 weeks
- **Total: 18-24 weeks** (4.5-6 months)

---

## 15. Appendix

### 15.1 File Tree (Complete)

```
C:\Users\Q\code\react-client
├── .aider.chat.history.md
├── .aider.input.history
├── .editorconfig
├── .gitignore
├── index.html                      # Entry point
├── package.json                    # Dependencies
├── package-lock.json
├── tsconfig.json                   # TypeScript config
├── vite.config.ts                  # Vite build config
├── vitest.config.ts                # Unit test config
├── playwright.config.ts            # E2E test config
├── README.md
├── PRIORITIES.md
├── public/                         # Static assets
│   ├── 404.html
│   ├── CNAME
│   ├── robots.txt
│   ├── favicon.ico
│   ├── manifest.json               # PWA manifest
│   └── [icons]
├── src/
│   ├── @types/                     # Custom type definitions
│   ├── components/
│   │   ├── editor/
│   │   ├── FileTransfer/
│   │   └── [25 component files]
│   ├── gmcp/                       # GMCP packages
│   │   ├── Char/
│   │   ├── Client/
│   │   ├── Comm/
│   │   ├── IRE/
│   │   └── [core files]
│   ├── hooks/                      # React hooks
│   ├── client.ts                   # Main client
│   ├── telnet.ts                   # Telnet parser
│   ├── mcp.ts                      # MCP protocol
│   ├── App.tsx                     # Main component
│   ├── index.tsx                   # Entry point
│   ├── PreferencesStore.tsx
│   ├── FileTransferManager.ts
│   ├── EditorManager.ts
│   ├── WebRTCService.ts
│   ├── MidiService.ts
│   ├── VirtualMidiService.ts
│   ├── SessionRecorder.ts
│   ├── SessionReplayer.ts
│   └── [utility files]
├── tests/                          # E2E tests
├── dist/                           # Build output
└── node_modules/
```

### 15.2 Technology Stack Summary

**Frontend**:
- React 18.3.1 (UI framework)
- TypeScript 5.8.3 (type safety)
- React Router 6.30.1 (routing)
- CSS (styling, no preprocessor)

**Build**:
- Vite 6.3.5 (bundler, dev server)
- Vitest 1.6.1 (unit testing)
- Playwright 1.48.0 (E2E testing)

**Communication**:
- WebSocket (native browser)
- EventEmitter3 5.0.1 (events)
- LiveKit 2.15.6 (voice chat)

**Audio/Media**:
- Cacophony 0.14.2 (audio)
- JZZ 1.9.3 (MIDI)
- Web Speech API (TTS)

**Editor**:
- Monaco Editor 0.52.2
- @monaco-editor/react 4.7.0

**Content**:
- Marked 15.0.12 (markdown)
- DOMPurify 3.2.6 (sanitization)
- Anser 2.3.2 (ANSI parsing)

**Utilities**:
- LRU Cache 10.4.3
- Crypto-JS 4.2.0
- React Virtuoso 4.6.4

### 15.3 Key Metrics

| Metric | Value |
|--------|-------|
| Total files (src) | 95 |
| Test files | 13 |
| CSS files | 24 |
| GMCP packages | 27 |
| MCP packages | 4 |
| React components | ~30 |
| Dependencies | 34 |
| Dev dependencies | 16 |
| Supported browsers | Chrome, Firefox, Safari (last 2 versions) |

### 15.4 Browser Compatibility

**Target Browsers** (package.json lines 48-52):
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)

**Required Features**:
- ES2015+ JavaScript
- WebSocket
- Web Speech API
- Web MIDI API (optional)
- WebRTC
- Service Workers (PWA)
- localStorage

**iOS Support**:
- Safari on iOS 15+
- PWA support on iOS (limited)
- Web MIDI not available on iOS Safari

---

## Document Information

**Report Version**: 1.0
**Analysis Date**: 2025-12-12
**Codebase Version**: Based on `virtualized-output` branch
**Git Status**: Modified files, untracked reports directory

**Key Commits Referenced**:
- `6b9b302` - Basic autologin mechanism for e2e
- `a419546` - Blockquote persistence architecture fix
- `a382f9c` - Redesign output persistence to support React components
- `a2f33b3` - Update LiveKit dependencies
- `ba9aa4a` - GMCP MIDI fix disconnect

**For Questions**: Refer to source code files with line numbers provided throughout this document.

---

*End of Architecture Report*
