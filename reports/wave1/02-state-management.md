# State Management and Data Flow Report

**Project**: React MUD Client (MongooseMoo)
**Analysis Date**: 2025-12-12
**Purpose**: iOS port state architecture mapping

## Executive Summary

This React MUD client uses a **custom singleton store pattern** with Redux-like reducers, **EventEmitter-based state propagation**, and **localStorage persistence**. There are **NO external state management libraries** (no Redux, Zustand, MobX, or React Context). The architecture consists of:

1. **3 Custom Singleton Stores** (InputStore, PreferencesStore, FileTransferStore)
2. **EventEmitter-based MudClient** (central event bus)
3. **Service Classes** with internal state (MidiService, WebRTCService, EditorManager, FileTransferManager, VirtualMidiService)
4. **Component-local state** via React useState/useRef
5. **localStorage** for persistence
6. **IndexedDB** for file transfer chunks and session recordings

---

## 1. Custom Store Pattern Architecture

### Pattern Overview

The codebase implements a custom pub-sub store pattern that mimics Redux but is significantly simpler:

```typescript
// Store structure:
class Store {
  private state: StateType;
  private listeners: Set<() => void> = new Set();

  private reducer(state, action): StateType { /* ... */ }

  dispatch(action) {
    this.state = this.reducer(this.state, action);
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getState(): StateType { return this.state; }
}
```

Components subscribe via custom hooks that force re-renders when state changes.

---

## 2. Store Files

### 2.1 InputStore (C:\Users\Q\code\react-client\src\InputStore.ts)

**Purpose**: Manages command input text state and input field focus

**State Shape**:
```typescript
type InputState = {
  text: string;
};
```

**Actions**:
- `SetInput`: Update input text (line 10-16)
- `ClearInput`: Clear input text (line 17)

**Special Features**:
- Stores a ref to the textarea element for programmatic focus (line 23, 63-71)
- Singleton instance exported at line 75
- Helper functions for easier dispatch: `setInputText()`, `setInputTextAndFocus()`, `clearInputText()` (lines 78-89)

**Subscribers**:
- `useInputStore` hook (C:\Users\Q\code\react-client\src\hooks\useInputStore.ts)
- Used by CommandInput component

**Persistence**: None (ephemeral state)

**State Update Pattern**:
```typescript
// Optimization: only update if actually changed
if (state.text !== action.data) {
  return { ...state, text: action.data };
}
return state; // No update if same
```

---

### 2.2 PreferencesStore (C:\Users\Q\code\react-client\src\PreferencesStore.tsx)

**Purpose**: User preferences for speech, sound, editor, MIDI, and per-channel settings

**State Shape**:
```typescript
type PrefState = {
  general: {
    localEcho: boolean;
  };
  speech: {
    autoreadMode: AutoreadMode; // "off" | "unfocused" | "all"
    voice: string;
    rate: number;
    pitch: number;
    volume: number;
  };
  sound: {
    muteInBackground: boolean;
    volume: number;
  };
  channels: {
    [channelId: string]: {
      autoreadMode: AutoreadMode;
      notify: boolean;
    }
  };
  editor: {
    autocompleteEnabled: boolean;
    accessibilityMode: boolean;
  };
  midi: {
    enabled: boolean;
    lastInputDeviceId?: string;
    lastOutputDeviceId?: string;
  };
};
```

**Actions** (lines 49-66):
- `SetGeneral`
- `SetSpeech`
- `SetSound`
- `SetChannels`
- `SetEditorAutocompleteEnabled`
- `SetEditorAccessibilityMode`
- `SetMidi`

**Initialization** (lines 72-87):
- Loads from localStorage on construction
- Merges with default values (lines 89-119)
- Includes migration logic for moving volume from general to sound (lines 79-84)

**Persistence** (line 157):
- Automatically saves to localStorage on every dispatch
- Key: `"preferences"`
- Uses `localStorage.setItem("preferences", JSON.stringify(this.state))`

**Subscribers**:
- `usePreferences` hook (C:\Users\Q\code\react-client\src\hooks\usePreferences.tsx)
- MudClient subscribes to update background mute state (C:\Users\Q\code\react-client\src\client.ts:122-124)
- Used throughout preferences components (C:\Users\Q\code\react-client\src\components\preferences.tsx)

**Singleton**: `preferencesStore` exported at line 173

---

### 2.3 FileTransferStore (C:\Users\Q\code\react-client\src\FileTransferStore.ts)

**Purpose**: Manages file transfer chunk storage and metadata using IndexedDB

**NOT a pub-sub store**: This is a stateless service class wrapping IndexedDB operations.

**Storage Structure**:
- **Database**: `'file-transfer-store'` (line 24)
- **Object Stores**:
  - `'chunks'`: Stores file chunks with compound key `[hash, index]` (lines 31-34)
  - `'metadata'`: Stores file metadata keyed by hash (lines 36-39)

**Data Models**:
```typescript
interface FileChunk {
  hash: string;
  index: number;
  data: ArrayBuffer;
}

interface FileMetadata {
  hash: string;
  filename: string;
  totalSize: number;
  totalChunks: number;
  receivedChunks: number[];
  direction: 'incoming' | 'outgoing';
  sender?: string;
  recipient?: string;
  lastActivityTimestamp: number;
  mimeType?: string;
}
```

**Key Methods**:
- `initialize()`: Opens IndexedDB connection (lines 27-42)
- `saveChunk()`: Saves chunk and updates metadata (lines 44-57)
- `getChunk()`, `getAllChunks()`: Retrieve chunks (lines 59-67)
- `saveFileMetadata()`, `getFileMetadata()`: Metadata operations (lines 69-82)
- `getIncompleteTransfers()`: Find unfinished transfers (lines 89-95)
- `deleteFile()`: Remove all chunks and metadata for a file (lines 97-111)
- `reconstructFile()`: Assembles chunks into a Blob (lines 130-145)

**Persistence**: IndexedDB (persistent across sessions)

**Usage**:
- FileTransferManager uses this store
- No React component directly subscribes
- Async operations, not reactive

---

## 3. State Management Pattern: Custom Hooks

### 3.1 useInputStore (C:\Users\Q\code\react-client\src\hooks\useInputStore.ts)

**Pattern**: Subscribe/force-render pattern

```typescript
export const useInputStore = (): InputStoreHook => {
  const [, forceRender] = useReducer((s) => s + 1, 0);

  useEffect(() => {
    const unsubscribe = inputStore.subscribe(forceRender);
    return unsubscribe;
  }, []);

  return [inputStore.getState(), inputStore.dispatch];
};
```

**How it works**:
1. `useReducer` with increment creates a force-render function
2. Subscribe to store, calling forceRender on every state change
3. Unsubscribe on unmount
4. Returns `[state, dispatch]` tuple (Redux-like API)

**Type**: `[InputState, (action: InputAction) => void]`

---

### 3.2 usePreferences (C:\Users\Q\code\react-client\src\hooks\usePreferences.tsx)

**Identical pattern** to useInputStore:

```typescript
export const usePreferences = (): PreferencesHook => {
  const [, forceRender] = useReducer((s) => s + 1, 0);

  useEffect(() => preferencesStore.subscribe(forceRender), []);

  return [preferencesStore.getState(), preferencesStore.dispatch];
};
```

**Type**: `[PrefState, (action: PrefAction) => void]`

---

### 3.3 useClientEvent (C:\Users\Q\code\react-client\src\hooks\useClientEvent.ts)

**Purpose**: Subscribe to MudClient EventEmitter events and expose as React state

**Pattern**: EventEmitter → useState bridge

```typescript
export function useClientEvent<K extends keyof ClientEventMap>(
  client: MudClient | null,
  event: K,
  initialValue: ClientEventMap[K] | null
): ClientEventMap[K] | null {
  const [value, setValue] = useState<ClientEventMap[K] | null>(initialValue);

  useEffect(() => {
    if (!client) {
      setValue(initialValue);
      return () => {};
    }

    const handler = (newValue: ClientEventMap[K]) => {
      setValue(newValue);
    };
    client.on(event, handler);
    return () => {
      client.off(event, handler);
    };
  }, [client, event, initialValue]);

  return value;
}
```

**Event Types** (lines 15-23):
```typescript
type ClientEventMap = {
  userlist: UserlistPlayer[];
  disconnect: boolean;
  fileTransferOffer: FileTransferOffer;
  connectionChange: boolean;
  autosayChanged: boolean;
  statustext: string;
};
```

**Usage Example** (from C:\Users\Q\code\react-client\src\App.tsx:57):
```typescript
const players = useClientEvent<"userlist">(client, "userlist", []) || [];
const fileTransferOffer = useClientEvent<"fileTransferOffer">(
  client, "fileTransferOffer", null
);
```

**State Flow**:
1. MudClient emits event via EventEmitter
2. Hook listens to event
3. Updates local useState
4. Component re-renders

---

### 3.4 useVoices (C:\Users\Q\code\react-client\src\hooks\useVoices.tsx)

**Purpose**: Wrapper around Web Speech API voice list

```typescript
export const useVoices = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const updateVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  return voices;
};
```

**State Source**: Browser Web Speech API (not application state)

---

## 4. EventEmitter-Based State: MudClient

### 4.1 Architecture

**MudClient** (C:\Users\Q\code\react-client\src\client.ts) extends EventEmitter3 (line 45):

```typescript
class MudClient extends EventEmitter {
  // Internal state:
  private _connected: boolean = false;
  public worldData: WorldData = { /* ... */ };
  public gmcpHandlers: { [key: string]: GMCPPackage } = {};
  public mcpHandlers: { [key: string]: MCPPackage } = {};
  public currentRoomInfo: GMCPMessageRoomInfo | null = null;
  private _autosay: boolean = false;
  // ... many more
}
```

**Events Emitted**:
- `connect` (line 269)
- `connectionChange` (line 270)
- `disconnect`
- `userlist`
- `fileTransferOffer` (line 158)
- `fileTransferAccepted`, `fileTransferRejected`, `fileTransferCancelled`
- `fileSendComplete`, `fileTransferError`
- `connectionRecovered`, `recoveryFailed`
- `autosayChanged` (line 90)
- `statustext`
- And more...

**State Propagation**:
```typescript
// Example: autosay property with event emission
set autosay(value: boolean) {
  this._autosay = value;
  this.emit('autosayChanged', value);
}
```

**Components Subscribe Via**:
- `useClientEvent` hook
- Direct event listeners (less common)

**WorldData State** (lines 37-74):
```typescript
export interface WorldData {
  liveKitTokens: string[];
  playerId: string;
  playerName: string;
  roomId: string;
  roomPlayers: RoomPlayer[];
}
```

This is **mutable state** on the client object, updated by GMCP handlers.

---

### 4.2 Event Flow Example: File Transfer Offer

1. GMCP package receives file transfer offer from server
2. GMCPClientFileTransfer handler calls `client.onFileTransferOffer()` (client.ts:144-165)
3. MudClient emits `fileTransferOffer` event (line 158)
4. App.tsx subscribes via `useClientEvent` (App.tsx:222-226)
5. Component state updates → re-render
6. UI displays file transfer notification (App.tsx:243-253)

---

## 5. Service Classes with Internal State

These are singleton or instance-based services that manage their own state **without** pub-sub notification:

### 5.1 MidiService (C:\Users\Q\code\react-client\src\MidiService.ts)

**Pattern**: Singleton with callback-based state updates

**Internal State**:
```typescript
class MidiService {
  private jzz: any = null;
  private inputDevice: any = null;
  private outputDevice: any = null;
  private inputCallback: MidiInputCallback | null = null;
  private deviceChangeCallbacks: Set<DeviceChangeCallback> = new Set();
  private deviceWatcher: any = null;
  private connectionState: {
    inputConnected: boolean;
    outputConnected: boolean;
    inputDeviceId?: string;
    outputDeviceId?: string;
    inputDeviceName?: string;
    outputDeviceName?: string;
  };
  private intentionalDisconnectFlags: {
    input: boolean;
    output: boolean;
  };
}
```

**State Updates**:
- Device connections tracked internally
- Callbacks invoked on MIDI messages
- Device change callbacks for reactive updates
- Reads from PreferencesStore for last used devices

**Singleton Export**: `midiService` (singleton instance)

---

### 5.2 VirtualMidiService (C:\Users\Q\code\react-client\src\VirtualMidiService.ts)

**Pattern**: Singleton with lazy initialization

**Internal State**:
```typescript
class VirtualMidiService {
  private isInitialized = false;
  private virtualPort: any = null;
  private readonly portName = 'Virtual Synthesizer';
}
```

**Singleton**: `virtualMidiService = VirtualMidiService.getInstance()`

---

### 5.3 WebRTCService (C:\Users\Q\code\react-client\src\WebRTCService.ts)

**Pattern**: EventEmitter for state changes

**Internal State** (lines 5-11):
```typescript
class WebRTCService extends EventEmitter {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private client: MudClient;
  private connectionTimeout: number = 300000;
  private connectionTimeoutId?: number;
  public recipient: string = "";
  public pendingCandidates: RTCIceCandidateInit[] = [];
}
```

**Events Emitted**:
- `webRTCStateChange` (lines 47, 79, 91)
- `webRTCConnected` (line 54)
- `webRTCDisconnected` (line 58)
- `dataChannelMessage`

**Usage**: FileTransferManager listens to these events

---

### 5.4 EditorManager (C:\Users\Q\code\react-client\src\EditorManager.ts)

**Pattern**: BroadcastChannel for cross-window communication

**Internal State** (lines 15-17):
```typescript
class EditorManager {
  private editors: Map<string, WindowedSession>;
  private channel: BroadcastChannel;
}
```

**State Shape**:
```typescript
enum EditorState { Pending, Open, Closed }

interface WindowedSession extends EditorSession {
  window: Window | null;
  state: EditorState;
}
```

**Communication**: Uses BroadcastChannel API for inter-window messaging (lines 17, 21-22, 64-96)

---

### 5.5 FileTransferManager (C:\Users\Q\code\react-client\src\FileTransferManager.ts)

**Pattern**: EventEmitter + internal Maps

**Internal State** (lines 48-59):
```typescript
class FileTransferManager extends EventEmitter {
  private webRTCService: WebRTCService;
  private client: MudClient;
  private gmcpFileTransfer: GMCPClientFileTransfer;
  private chunkSize: number = 16384;
  private transferTimeoutInterval?: number;
  private incomingTransfers: Map<string, FileTransferProgress> = new Map();
  private outgoingTransfers: Map<string, FileTransferTask> = new Map();
  private maxFileSize: number = 100 * 1024 * 1024; // 100 MB
  private transferTimeout: number = 30000; // 30 seconds
  public pendingOffers: Map<string, FileTransferOffer> = new Map();
}
```

**Events**: Inherits EventEmitter, emits custom events for transfer progress

---

## 6. Component-Local State

### 6.1 App.tsx Local State

Uses React useState for UI state (C:\Users\Q\code\react-client\src\App.tsx:52-61):

```typescript
const [client, setClient] = useState<MudClient | null>(null);
const [showSidebar, setShowSidebar] = useState<boolean>(false);
const [showFileTransfer, setShowFileTransfer] = useState<boolean>(false);
const [fileTransferExpanded, setFileTransferExpanded] = useState<boolean>(false);

// Refs for imperative handles
const outRef = React.useRef<OutputHandle | null>(null);
const inRef = React.useRef<HTMLTextAreaElement | null>(null);
const prefsDialogRef = React.useRef<PreferencesDialogRef | null>(null);
const sidebarRef = React.useRef<SidebarRef | null>(null);
const clientInitialized = useRef(false);
```

**State Scope**: UI visibility, refs to child component handles

---

### 6.2 CommandInput Local State

Uses useRef for non-reactive state (C:\Users\Q\code\react-client\src\components\input.tsx:49-56):

```typescript
const commandHistoryRef = useRef(new CommandHistory());
const completionCandidatesRef = useRef<RoomPlayer[]>([]);
const completionIndexRef = useRef<number>(0);
const completionActiveOriginalWordRef = useRef<string | null>(null);
```

**Why useRef**: These values don't need to trigger re-renders when changed

---

### 6.3 Output Window State

Complex local state for output log (C:\Users\Q\code\react-client\src\components\output.tsx):

**State Variables** (inferred from component logic, lines ~200+):
- `outputEntries`: Array of output lines
- `nextId`: Counter for entry IDs
- `liveRegionText`: Accessibility announcement text
- Virtuoso scroll state

**Persistence**: Saves to localStorage on every update (key: `"outputLog"`)

**State Shape**:
```typescript
interface OutputEntry {
  id: number;
  type: OutputType; // "command" | "serverMessage" | "systemInfo" | "errorMessage"
  sourceType: SourceType; // "ansi" | "html" | "command" | "system" | "error" | "unknown"
  sourceContent: string;
  metadata?: OutputMetadata;
}
```

**Load/Save** (lines 71-117):
- `loadOutputData()`: Reads from localStorage with version check
- Saves on every state change

---

## 7. Persistence Mechanisms

### 7.1 localStorage

**Keys and Contents**:

| Key | Store/Component | Data Type | Purpose |
|-----|----------------|-----------|---------|
| `"preferences"` | PreferencesStore | `PrefState` JSON | User preferences (speech, sound, editor, MIDI, channels) |
| `"outputLog"` | OutputWindow | `StoredOutputLog` JSON | Output history with version |
| `"command_history"` | CommandInput | `string[]` JSON | Command history (max 1000) |

**Version Management**:
- OutputWindow uses versioned storage (lines 21, 90, 105)
- Current version: `OUTPUT_LOG_VERSION = 2`
- Clears incompatible versions

**Storage Pattern**:
```typescript
// Write
localStorage.setItem("preferences", JSON.stringify(this.state));

// Read
const saved = localStorage.getItem("preferences");
const parsed = saved ? JSON.parse(saved) : null;
```

---

### 7.2 IndexedDB

**Database**: `'file-transfer-store'` (FileTransferStore)

**Object Stores**:
1. **chunks**: File chunks
   - Key: `[hash, index]` (compound)
   - Index: `hash` (for querying all chunks of a file)

2. **metadata**: File metadata
   - Key: `hash`
   - Index: `direction` ("incoming" or "outgoing")

**Database**: `'SessionLogs'` (SessionRecorder)

**Object Stores**:
1. **sessions**: Recorded sessions
   - Key: `metadata.sessionId`
   - Indexes: `startTime`, `url`

**Pattern**: Async operations, promise-based API

---

### 7.3 BroadcastChannel

**Channel**: `"editor"` (EditorManager, line 21)

**Purpose**: Cross-window communication for editor windows

**Messages**:
- `ready`: Editor window initialized
- `load`: Main window sends session data
- `save`: Editor requests save
- `close`: Editor window closing

---

## 8. Data Flow Diagrams

### 8.1 Input Flow

```
User types
  → onChange updates InputStore (setInputText)
  → InputStore.dispatch(SetInput)
  → InputStore notifies listeners
  → useInputStore forces re-render
  → CommandInput re-renders with new value
```

### 8.2 Preferences Flow

```
User changes preference
  → dispatch(PrefAction)
  → PreferencesStore.reducer updates state
  → localStorage.setItem("preferences", ...)
  → PreferencesStore notifies listeners
  → usePreferences forces re-render
  → Component re-renders
  → MudClient subscriber reacts (e.g., background mute)
```

### 8.3 Server Message Flow

```
WebSocket receives data
  → TelnetParser processes
  → MudClient.handleData() [inferred]
  → OutputWindow receives via callback/prop
  → OutputWindow adds to outputEntries state
  → localStorage.setItem("outputLog", ...)
  → React re-renders
  → Virtuoso updates visible rows
```

### 8.4 GMCP Event Flow

```
Telnet parser detects GMCP message
  → client.telnet.on("gmcp", ...)
  → MudClient finds handler in gmcpHandlers{}
  → GMCPPackage.handle() processes message
  → Updates client.worldData (mutable)
  → OR emits event via client.emit()
  → useClientEvent listener updates useState
  → Component re-renders
```

### 8.5 File Transfer Flow

```
Server sends GMCP file transfer offer
  → GMCPClientFileTransfer.handle()
  → client.onFileTransferOffer()
  → client.emit("fileTransferOffer", {...})
  → App.tsx useClientEvent updates state
  → fileTransferOffer state changes
  → useEffect triggers notification
  → UI shows transfer dialog
```

---

## 9. React Context Usage

**NONE**

This application does **not use React Context** at all. State is managed via:
1. Singleton stores with pub-sub
2. Props drilling
3. EventEmitter
4. Direct imports of singleton instances

---

## 10. State Update Patterns

### 10.1 Optimistic Updates

**InputStore** checks if state actually changed before notifying:

```typescript
dispatch(action: InputAction) {
  const previousState = this.state;
  this.state = this.reducer(this.state, action);
  if (this.state !== previousState) {
    this.listeners.forEach((listener) => listener());
  }
}
```

### 10.2 Immutable Updates

**PreferencesStore** uses spread operators for immutability:

```typescript
case PrefActionType.SetSpeech:
  return { ...state, speech: action.data };
```

### 10.3 Lazy Initialization

**FileTransferStore** initializes IndexedDB on first use:

```typescript
async saveChunk(chunk: FileChunk): Promise<void> {
  if (!this.db) await this.initialize();
  await this.db!.put('chunks', chunk);
}
```

---

## 11. State Architecture Summary

### State Types by Scope

| Scope | Pattern | Examples | Persistence |
|-------|---------|----------|-------------|
| **Global App State** | Singleton Store + Pub-Sub | InputStore, PreferencesStore | localStorage |
| **Client Events** | EventEmitter | MudClient events (userlist, disconnect, etc.) | None (ephemeral) |
| **Service State** | Internal class fields | MidiService, WebRTCService | None (or via PreferencesStore) |
| **Component-Local** | useState/useRef | showSidebar, commandHistory | Some localStorage |
| **File Chunks** | IndexedDB | FileTransferStore | IndexedDB (persistent) |
| **Session Logs** | IndexedDB | SessionRecorder | IndexedDB (persistent) |

---

## 12. State Management for iOS Port

### 12.1 Mapping to Swift Patterns

| React Pattern | Swift/iOS Equivalent |
|---------------|---------------------|
| **Singleton Store** | `ObservableObject` with `@Published` properties |
| **Store.subscribe()** | Combine `sink()` or SwiftUI automatic observation |
| **useStore hook** | SwiftUI `@StateObject` or `@ObservedObject` |
| **EventEmitter** | `NotificationCenter` or Combine `PassthroughSubject` |
| **localStorage** | `UserDefaults` or `FileManager` (JSON files) |
| **IndexedDB** | Core Data or SQLite |
| **BroadcastChannel** | `NotificationCenter` or `CFNotificationCenter` |
| **useClientEvent** | Combine subscription to client subject |

---

### 12.2 Recommended iOS Architecture

**Stores**:
```swift
// InputStore equivalent
class InputStore: ObservableObject {
    @Published var text: String = ""
    var inputFocusSubject = PassthroughSubject<Void, Never>()

    func setText(_ newText: String) {
        text = newText
    }

    func clear() {
        text = ""
    }
}

// PreferencesStore equivalent
class PreferencesStore: ObservableObject {
    @Published var general: GeneralPreferences
    @Published var speech: SpeechPreferences
    @Published var sound: SoundPreferences
    // ...

    init() {
        // Load from UserDefaults
        if let data = UserDefaults.standard.data(forKey: "preferences"),
           let decoded = try? JSONDecoder().decode(PrefState.self, from: data) {
            // ... initialize from decoded
        }
    }

    private func save() {
        if let encoded = try? JSONEncoder().encode(self.state) {
            UserDefaults.standard.set(encoded, forKey: "preferences")
        }
    }
}
```

**MudClient**:
```swift
class MudClient: ObservableObject {
    @Published var connected: Bool = false
    @Published var worldData: WorldData = WorldData()

    // Event subjects
    let userlistSubject = PassthroughSubject<[UserlistPlayer], Never>()
    let fileTransferOfferSubject = PassthroughSubject<FileTransferOffer, Never>()
    let disconnectSubject = PassthroughSubject<Bool, Never>()

    // Or use NotificationCenter for broader events
}
```

**SwiftUI View**:
```swift
struct ContentView: View {
    @StateObject private var inputStore = InputStore()
    @StateObject private var preferencesStore = PreferencesStore()
    @StateObject private var client = MudClient()

    var body: some View {
        VStack {
            OutputView(client: client)
            InputView(store: inputStore, client: client)
        }
    }
}
```

---

### 12.3 Persistence Strategy for iOS

| Data | iOS Storage | API |
|------|-------------|-----|
| **Preferences** | `UserDefaults` | `Codable` + JSON |
| **Output History** | File in Documents directory | `FileManager` + JSON |
| **Command History** | `UserDefaults` or file | Array of strings |
| **File Chunks** | Core Data or SQLite | Binary data storage |
| **Session Logs** | Files in Documents | JSON files |

---

### 12.4 Key Challenges

1. **No Direct EventEmitter**: Use Combine's `PassthroughSubject` or `CurrentValueSubject`
2. **No localStorage**: Use `UserDefaults` for small data, files for large data
3. **No IndexedDB**: Use Core Data or SQLite with proper models
4. **WebSocket Management**: Use `URLSessionWebSocketTask` or Starscream library
5. **Cross-View Communication**: Use `@EnvironmentObject` for shared state or Combine publishers

---

## 13. Critical State Dependencies

### 13.1 Store → Component Subscriptions

**InputStore**:
- `CommandInput` (C:\Users\Q\code\react-client\src\components\input.tsx:50)

**PreferencesStore**:
- All preference components (C:\Users\Q\code\react-client\src\components\preferences.tsx)
- MudClient (for background mute, volume changes)

**MudClient Events**:
- `App.tsx` (userlist, fileTransferOffer)
- `Statusbar` (connection status)
- `OutputWindow` (server messages)
- `Sidebar` (various game state)

---

### 13.2 Service Dependencies

**MidiService**:
- Reads: `preferencesStore.getState().midi.lastInputDeviceId`
- Reads: `preferencesStore.getState().midi.lastOutputDeviceId`
- Calls: `preferencesStore.dispatch()` to save last used devices

**MudClient**:
- Reads: `preferencesStore.getState().sound.volume`
- Subscribes: `preferencesStore.subscribe()` for background mute changes

**FileTransferManager**:
- Subscribes: `client.on("fileTransferAccepted", ...)`
- Subscribes: `webRTCService.on("dataChannelMessage", ...)`

---

## 14. State Initialization Order

From C:\Users\Q\code\react-client\src\App.tsx (lines 86-156):

1. **PreferencesStore**: Auto-initialized on import (reads localStorage in constructor)
2. **InputStore**: Auto-initialized on import
3. **App mounts**: Creates client (line 88)
4. **MudClient constructor**:
   - Creates MCP/GMCP packages
   - Creates Cacophony (audio)
   - Creates EditorManager
   - Creates WebRTCService
   - Creates FileTransferManager
   - Subscribes to preferencesStore (lines 122-124)
5. **MudClient.connect()**: Initiates WebSocket connection (line 121)
6. **VirtualMidiService.initialize()**: Background MIDI synth init (lines 147-155)

---

## 15. Concurrency and Race Conditions

### 15.1 Potential Issues

**localStorage writes**: Multiple rapid preference changes write to localStorage synchronously (blocking)

**Store notifications**: Listeners are notified synchronously in a Set.forEach loop (PreferencesStore.ts:158)

**IndexedDB**: Async operations could conflict if not properly queued

**WebSocket + State**: Messages arrive asynchronously but state updates are synchronous

---

### 15.2 Mitigations

**InputStore**: Checks if state actually changed before notifying (lines 28-31, 34-37)

**FileTransferStore**: Uses transactions for compound operations (lines 101-110)

**useEffect cleanup**: All hooks properly unsubscribe on unmount

---

## 16. Testing Considerations

### 16.1 Store Testing

Stores are **testable without React**:

```typescript
// Example test
const store = new PreferencesStore();
const states: PrefState[] = [];
store.subscribe(() => states.push(store.getState()));

store.dispatch({ type: PrefActionType.SetGeneral, data: { localEcho: true } });

expect(states.length).toBe(1);
expect(states[0].general.localEcho).toBe(true);
```

### 16.2 Hook Testing

Custom hooks require React testing environment:

```typescript
import { renderHook } from '@testing-library/react';
import { useInputStore } from './useInputStore';

test('useInputStore subscribes and updates', () => {
  const { result } = renderHook(() => useInputStore());
  const [, dispatch] = result.current;

  act(() => {
    dispatch({ type: InputActionType.SetInput, data: "test" });
  });

  const [state] = result.current;
  expect(state.text).toBe("test");
});
```

---

## 17. Performance Characteristics

### 17.1 Store Subscription

**O(n) notification**: Every listener is called on every state change (Set.forEach)

**No selector optimization**: Components get entire state, not slices

**Force re-render**: `useReducer` increment forces full component re-render

---

### 17.2 Optimization Opportunities

**Selectors**: Could add selector support to only re-render when relevant state slice changes

**Memoization**: Components could use `useMemo` for expensive computations

**Virtualization**: OutputWindow already uses `react-virtuoso` for long output (lines ~200+)

---

## 18. State Management Files Reference

### Stores
- `C:\Users\Q\code\react-client\src\InputStore.ts`
- `C:\Users\Q\code\react-client\src\PreferencesStore.tsx`
- `C:\Users\Q\code\react-client\src\FileTransferStore.ts`

### Hooks
- `C:\Users\Q\code\react-client\src\hooks\useInputStore.ts`
- `C:\Users\Q\code\react-client\src\hooks\usePreferences.tsx`
- `C:\Users\Q\code\react-client\src\hooks\useClientEvent.ts`
- `C:\Users\Q\code\react-client\src\hooks\useVoices.tsx`

### Services
- `C:\Users\Q\code\react-client\src\MidiService.ts`
- `C:\Users\Q\code\react-client\src\VirtualMidiService.ts`
- `C:\Users\Q\code\react-client\src\WebRTCService.ts`
- `C:\Users\Q\code\react-client\src\EditorManager.ts`
- `C:\Users\Q\code\react-client\src\FileTransferManager.ts`

### Utilities
- `C:\Users\Q\code\react-client\src\CommandHistory.ts`
- `C:\Users\Q\code\react-client\src\SessionRecorder.ts`
- `C:\Users\Q\code\react-client\src\SessionReplayer.ts`

### Main Client
- `C:\Users\Q\code\react-client\src\client.ts`

### Components Using State
- `C:\Users\Q\code\react-client\src\App.tsx`
- `C:\Users\Q\code\react-client\src\components\input.tsx`
- `C:\Users\Q\code\react-client\src\components\output.tsx`
- `C:\Users\Q\code\react-client\src\components\preferences.tsx`

---

## 19. Conclusion

This application uses a **lightweight, custom state management architecture** that avoids heavy libraries in favor of simple, explicit patterns:

1. **Singleton stores** for global state (input, preferences)
2. **EventEmitter pattern** for client events
3. **Direct service instances** for complex state (MIDI, WebRTC, files)
4. **localStorage + IndexedDB** for persistence
5. **Custom hooks** to bridge stores and React components

For iOS port:
- **PreferencesStore** → `ObservableObject` with `UserDefaults`
- **InputStore** → `ObservableObject` with `@Published` text
- **MudClient events** → Combine `PassthroughSubject` or `NotificationCenter`
- **FileTransferStore** → Core Data or SQLite
- **Component subscriptions** → SwiftUI `@StateObject` / `@ObservedObject`

The architecture is **simple**, **testable**, and **straightforward** to reason about, making it a good candidate for porting to Swift's Combine + SwiftUI reactive patterns.
