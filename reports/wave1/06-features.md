# User Features and Interactions Analysis

**Date:** 2025-12-12
**Analyst:** Claude (Sonnet 4.5)
**Purpose:** Comprehensive analysis of all user-facing features and interactions for iOS port planning

---

## Executive Summary

This React MUD client is a feature-rich web application with extensive user interaction capabilities. Key findings:

- **NO traditional MUD client features**: No aliases, triggers, or user-defined macros
- **Server-driven architecture**: Most "automation" features controlled via GMCP from server
- **Modern UX focus**: Emphasis on accessibility, real-time audio, file transfer, and multimedia
- **State persistence**: Command history, output logs, and preferences saved to localStorage
- **Session recording**: Built-in infrastructure for recording/replaying sessions (testing/debugging)

---

## 1. Command Input and History

### Input Component
**File:** `C:\Users\Q\code\react-client\src\components\input.tsx`

**Features:**
- Multi-line textarea input (supports Shift+Enter for new lines)
- Auto-focus on page load
- Send button alternative to Enter key
- Tab completion for player names in current room
- Real-time input state management via `InputStore`

**Input Handling:**
- Lines 48-244: Main `CommandInput` component
- Lines 94-104: Command sending with history tracking
- Lines 106-223: Keyboard event handling

### Command History
**File:** `C:\Users\Q\code\react-client\src\CommandHistory.ts`

**Features:**
- Up/Down arrow navigation through command history
- Preserves unsent input when navigating
- Persistent storage in localStorage (key: `command_history`)
- Maximum 1000 commands stored (line 18)
- Automatic deduplication (line 7)

**Storage Implementation:**
- Lines 58-68: Load from localStorage on mount
- Lines 76-86: Save to localStorage on new commands
- Lines 14-37: Navigation logic (reverse chronological order)

### Tab Completion
**Implementation:** Lines 111-201 in `input.tsx`

**Features:**
- Completes player names from current room
- Supports names with spaces (auto-quotes)
- Handles leading punctuation (e.g., `-David`, `@Player`)
- Cycling through multiple matches with repeated Tab
- Matches against both `name` and `fullname` fields
- Case-insensitive matching

**Data Source:**
- Uses `client.worldData.roomPlayers` (populated via GMCP `Room.Players`)
- Type: `RoomPlayer[]` with `name` and `fullname` properties

---

## 2. Aliases System

**Status:** ❌ NOT IMPLEMENTED

No user-defined alias system exists in this client. Command shortcuts must be defined server-side.

---

## 3. Triggers System

**Status:** ❌ NOT IMPLEMENTED

No pattern-matching or auto-response trigger system exists. All automation must be server-driven via GMCP.

---

## 4. Macros/Keybindings

### Server-Controlled Keybindings
**File:** `C:\Users\Q\code\react-client\src\gmcp\Client\Keystrokes.ts`
**Documentation:** `C:\Users\Q\code\react-client\docs\keystrokes.md`

**Implementation:**
- Lines 37-188: `GMCPClientKeystrokes` class
- Lines 50-63: Keydown event handler
- Lines 70-107: Key binding matcher

**Features:**
- Server sends bindings via GMCP `Client.Keystrokes.Bind`
- Supports modifiers: shift, ctrl, alt, meta
- Two execution modes:
  - `autosend: true` - Execute immediately
  - `autosend: false` - Place in input field for review
- Command placeholders:
  - `%1`, `%2`, ... `%n` - Word substitution from input field
  - `%*` - Entire input field contents

**GMCP Messages:**
- `Client.Keystrokes.Bind` - Add a keybinding
- `Client.Keystrokes.Unbind` - Remove specific keybinding
- `Client.Keystrokes.BindAll` - Replace all bindings
- `Client.Keystrokes.UnbindAll` - Clear all bindings
- `Client.Keystrokes.ListBindings` - Request current bindings

**Local Storage:** None - bindings are session-only (cleared on reconnect)

### Built-in Keyboard Shortcuts

**App.tsx (lines 189-220):**
- `Ctrl+1` through `Ctrl+9` - Switch sidebar tabs

**Toolbar Shortcuts:**
- `Alt+L` - Save log
- `Alt+Shift+C` - Copy log to clipboard
- `Alt+E` - Clear log
- `Alt+P` - Open preferences
- `Alt+M` - Toggle mute
- `Alt+V` - Focus volume slider
- `Alt+U` - Toggle sidebar

**Global Shortcuts (App.tsx lines 158-171):**
- `Control` - Cancel speech synthesis
- `Escape` - Stop all sounds and MIDI all-notes-off

---

## 5. Logging/Transcript Features

### Output Persistence
**File:** `C:\Users\Q\code\react-client\src\components\output.tsx`

**Features:**
- Auto-saves output to localStorage (key: `outputLog`)
- Versioned format (current version: 2, line 21)
- Maximum 7500 lines stored (line 22)
- Preserves source type (ANSI, HTML, command, system, error)
- Stores metadata per line

**Storage Structure (lines 40-57):**
```typescript
interface OutputEntry {
  id: number;
  type: OutputType;
  sourceType: SourceType;
  sourceContent: string;
  metadata?: OutputMetadata;
}
```

### Save Log to File
**Implementation:** Lines 615-635 in `output.tsx`

**Features:**
- Exports as HTML file
- Filename format: `{MudName}-log-{Date}-{Time}.html`
- Preserves formatting and colors
- Downloads via browser download mechanism

### Copy Log to Clipboard
**Implementation:** Lines 644-657 in `output.tsx`

**Features:**
- Converts to plain text (strips HTML/ANSI)
- Copies entire log to clipboard
- Error handling with user notification

### Clear Log
**Implementation:** Lines 636-643 in `output.tsx`

**Features:**
- Removes all output entries
- Clears localStorage
- Resets scroll state and live message count

---

## 6. Settings/Preferences

### Preferences Storage
**File:** `C:\Users\Q\code\react-client\src\PreferencesStore.tsx`

**Storage:** localStorage (key: `preferences`)

**Structure (lines 40-47):**
```typescript
type PrefState = {
  general: GeneralPreferences;
  speech: SpeechPreferences;
  sound: SoundPreferences;
  channels: { [channelId: string]: ChannelPreferences };
  editor: EditorPreferences;
  midi: MidiPreferences;
}
```

### Preferences UI
**File:** `C:\Users\Q\code\react-client\src\components\preferences.tsx`

**Tabs:**

#### 1. General Tab (lines 8-26)
- Local Echo (show sent commands in output)

#### 2. Speech Tab (lines 251-267)
- Auto-read mode: Off / Unfocused / Always
- Voice selection (system voices)
- Rate: 0.1 - 10.0 (default 1.0)
- Pitch: 0 - 2 (default 1.0)
- Volume: 0 - 1 (default 1.0)
- Preview button to test settings

#### 3. Sounds Tab (lines 270-290)
- Mute when in background

#### 4. Editor Tab (lines 292-324)
- Enable Autocomplete
- Enable Accessibility Mode

#### 5. MIDI Tab (lines 326-365)
- Enable MIDI support
- Device selection (when connected)
- Browser compatibility check

### Preferences Dialog
**File:** `C:\Users\Q\code\react-client\src\components\PreferencesDialog.tsx`

**Features:**
- Modal dialog with focus lock
- Escape key to close
- Version display (git commit hash)
- Accessible with ARIA labels

---

## 7. Character/Profile Management

**Status:** ❌ NO LOCAL PROFILE MANAGEMENT

**Available Features:**
- Automatic login via token (GMCP `Auth.Autologin`)
  - File: `C:\Users\Q\code\react-client\src\gmcp\Auth.ts`
  - Stores refresh token in localStorage
  - Server-side character management only
- URL parameter auto-login (testing/e2e only)
  - Lines 124-140 in `App.tsx`
  - `?username=X&password=Y` in URL

**World Data Tracking (client.ts lines 37-74):**
```typescript
interface WorldData {
  liveKitTokens: string[];
  playerId: string;
  playerName: string;
  roomId: string;
  roomPlayers: RoomPlayer[];
}
```

---

## 8. Map Display

**Status:** ❌ NOT IMPLEMENTED

No map or navigation display exists in the client.

---

## 9. Sound/Audio Features

### 3D Spatial Audio
**File:** `C:\Users\Q\code\react-client\src\gmcp\Client\Media.ts`

**Library:** Cacophony (3D audio engine)

**Features (lines 1-237):**
- 2D stereo and 3D HRTF audio
- Sound and music playback
- Position-based audio (`position: [x, y, z]`)
- Listener orientation control
- Volume, looping, fade-in/out
- Priority-based sound management
- Sound tagging and keying for control
- CORS proxy for streaming music

**GMCP Messages:**
- `Client.Media.Default` - Set default URL prefix
- `Client.Media.Load` - Preload a sound
- `Client.Media.Play` - Play sound/music with options
- `Client.Media.Stop` - Stop by name/type/tag/key
- `Client.Media.Listener.Position` - Set listener position
- `Client.Media.Listener.Orientation` - Set listener orientation

**Sound Types:**
- Buffer: Preloaded for low-latency (sound effects)
- HTML: Streaming for music

### Volume Controls
**Files:**
- Toolbar: `C:\Users\Q\code\react-client\src\components\toolbar.tsx` (lines 39-58)
- Global mute toggle (line 41-45)
- Volume slider 0-100% (lines 47-58)
- Mute when in background (preference)

**Background Behavior (client.ts lines 110-124):**
- Detects window focus/blur events
- Automatically mutes when preference enabled
- Restores volume on focus

### Text-to-Speech (TTS)
**File:** `C:\Users\Q\code\react-client\src\client.ts`

**Features (lines 571-592):**
- Web Speech API integration
- Auto-read modes:
  - Off: No automatic reading
  - Unfocused: Read when window not focused
  - All: Always read incoming text
- Configurable voice, rate, pitch, volume
- Cancel with Control key
- Server can trigger via GMCP `Client.Speech.Speak`

**Implementation:**
- `speak()` - Lines 571-588
- `cancelSpeech()` - Lines 590-592
- Auto-read logic: Lines 490-496

### MIDI Support
**File:** `C:\Users\Q\code\react-client\src\gmcp\Client\Midi.ts`

**Features:**
- Web MIDI API integration
- Input and output device support
- Note on/off messages
- Control change messages
- Program change messages
- System messages
- Raw MIDI message support
- Device auto-reconnect

**GMCP Messages:**
- `Client.Midi.Note` - Play/stop notes
- `Client.Midi.ControlChange` - CC messages
- `Client.Midi.ProgramChange` - Program selection
- `Client.Midi.SystemMessage` - System exclusive
- `Client.Midi.RawMessage` - Direct MIDI data

**Status UI:**
- `C:\Users\Q\code\react-client\src\components\MidiStatus.tsx`
- Shows connected devices
- Input/output device selection
- Connection status

**Persistence:**
- Last used devices saved in preferences
- Auto-reconnect on startup if enabled

### Voice Chat (LiveKit)
**File:** `C:\Users\Q\code\react-client\src\components\audioChat.tsx`

**Features:**
- WebRTC-based voice chat
- Multiple simultaneous rooms
- Server-controlled via GMCP `Comm.LiveKit`
- Audio-only (video disabled)
- Connection tokens from server

---

## 10. Automation Features

### Server-Driven Only

**Available via GMCP:**
1. **Keystrokes** - Server defines keybindings
2. **Speech** - Server triggers TTS
3. **Media** - Server controls all audio
4. **HTML Injection** - Server can inject UI elements
5. **Notifications** - Server triggers desktop notifications

**No Client-Side Automation:**
- No user-definable triggers
- No user-definable aliases
- No scripting engine
- No command queuing

### Desktop Notifications
**File:** `C:\Users\Q\code\react-client\src\client.ts`

**Features (lines 548-569):**
- Browser notification API
- Permission request on startup
- Server can trigger via various events
- Auto-notification for private messages
- File transfer offer notifications

**Implementation:**
- `requestNotificationPermission()` - Lines 548-558
- `sendNotification(title, body)` - Lines 560-569

---

## 11. Copy/Paste and Text Selection

### Copy Features

**1. Blockquote Copy Button**
**File:** `C:\Users\Q\code\react-client\src\components\BlockquoteCopyButton.tsx`

**Features:**
- Automatic copy buttons on blockquoted content
- Markdown conversion support
- Visual feedback (Copied!/Error states)
- Strips copy buttons from copied content

**2. Full Log Copy**
- Toolbar button with `Alt+Shift+C` shortcut
- Converts entire log to plain text
- Clipboard API integration

### Text Selection

**Standard Browser Behavior:**
- No custom selection handling
- Full mouse/keyboard selection support
- Right-click context menu available
- Standard Ctrl+C/Cmd+C copy

**Output Window:**
- Virtualized scrolling (React Virtuoso)
- Selection works across virtual rows
- Preserves text formatting in copy

---

## 12. Session Recording/Playback

### Session Recorder
**File:** `C:\Users\Q\code\react-client\src\SessionRecorder.ts`

**Purpose:** Testing and debugging infrastructure

**Features (lines 28-252):**
- Records all WebSocket traffic
- Captures user input
- Logs GMCP messages
- Tracks MCP communications
- File transfer events
- Error logging
- Timestamp-based event tracking

**Event Types:**
- `websocket-send` / `websocket-receive`
- `user-input`
- `connection` (open/close/error)
- `gmcp` / `mcp`
- `file-transfer`
- `error`

**Storage:**
- Export to JSON file
- IndexedDB persistence
- Session metadata (ID, URL, timestamps, tags)

### Session Replayer
**File:** `C:\Users\Q\code\react-client\src\SessionReplayer.ts`

**Features (lines 24-273):**
- Replay recorded sessions
- Speed control (multiplier)
- Event filtering by type
- Time-range playback
- Mock WebSocket for testing
- Pause/stop/progress tracking

**Use Cases:**
- End-to-end testing
- Bug reproduction
- Protocol debugging
- Client development

**Status:** Present but not exposed to end users (developer tool)

---

## 13. File Transfer Features

### File Transfer Manager
**File:** `C:\Users\Q\code\react-client\src\FileTransferManager.ts`
**UI:** `C:\Users\Q\code\react-client\src\components\FileTransfer/`

**Architecture:**
- WebRTC data channels for transfer
- GMCP for signaling (offer/answer)
- Chunked transfer with IndexedDB storage
- MD5 hash verification

**Features:**

#### Sending Files
- File selection via input
- Recipient specification
- Progress tracking
- Cancellation support

#### Receiving Files
- Incoming offer notifications
- Accept/reject controls
- Progress display
- Automatic download on completion

#### Transfer UI Components
1. **Controls** - File selection and recipient input
2. **ProgressBar** - Visual progress indicator
3. **PendingTransfer** - Accept/reject incoming offers
4. **History** - Last 10 transfer events

**GMCP Messages:**
- `Client.FileTransfer.Offer` - Initiate transfer
- `Client.FileTransfer.Accept` - Accept incoming
- `Client.FileTransfer.Reject` - Decline transfer
- `Client.FileTransfer.Cancel` - Abort transfer
- `Client.FileTransfer.Chunk` - Data transmission

### File Storage
**File:** `C:\Users\Q\code\react-client\src\FileTransferStore.ts`

**IndexedDB Schema:**
- `chunks` - File data chunks
- `metadata` - Transfer metadata and status

**Features:**
- Persistent storage across sessions
- Resume incomplete transfers
- Track received chunks
- Reconstruct complete files
- MIME type preservation

---

## 14. In-Game Editor

### Editor Window
**File:** `C:\Users\Q\code\react-client\src\components\editor\editorWindow.tsx`

**Features:**
- Monaco Editor (VS Code editor component)
- Syntax highlighting
- Autocomplete (toggleable)
- Accessibility mode
- Multi-document support
- Unsaved changes warning
- Keyboard shortcuts

**Integration:**
- Opens in new window/tab
- BroadcastChannel communication
- Server communication via MCP `dns-org-mud-moo-simpleedit`

### Editor Manager
**File:** `C:\Users\Q\code\react-client\src\EditorManager.ts`

**Features:**
- Multiple editor instances
- Session tracking
- Window state management
- Auto-focus existing windows
- Graceful shutdown

**States:**
- Pending (window opening)
- Open (active editing)
- Closed (window closed)

---

## 15. Sidebar Features

**File:** `C:\Users\Q\code\react-client\src\components\sidebar.tsx`

### Tabbed Interface

**Tabs (lines 84-148):**

1. **Room** - Current room information
   - Room name, description
   - Visible players
   - Available exits
   - Appears when GMCP Room.Info received

2. **Inventory** - Player items
   - Item list
   - Item details
   - Appears when GMCP Char.Items received

3. **Users** - Online players
   - MCP userlist display
   - Always visible

4. **MIDI** - MIDI device control
   - Input/output device selection
   - Connection status
   - Only when MIDI enabled in preferences

5. **Files** - File transfer interface
   - Send/receive files
   - Transfer history
   - Always visible

6. **Audio** - Voice chat
   - LiveKit room connection
   - Audio controls
   - Always visible

### Tab Switching
- Click on tab labels
- `Ctrl+1` through `Ctrl+9` keyboard shortcuts
- Conditional display (tabs appear when data available)

---

## 16. Accessibility Features

### Screen Reader Support
**Files:**
- `output.tsx` - Lines 24, 235-236
- `preferences.tsx` - Line 319

**Features:**
- ARIA live regions for new messages
- Role attributes on main sections
- Accessible labels on controls
- Focus management

### Live Announcements
**Implementation:** Lines 233-239 in `output.tsx`

**Features:**
- Limit last 50 messages for screen readers
- `announce()` function for important events
- Aria-live regions

### Keyboard Navigation
- Full keyboard navigation support
- Access keys on major functions
- Tab order management
- Focus indicators

### Editor Accessibility Mode
**Preference:** `editor.accessibilityMode`

**Features:**
- Optimizes Monaco Editor for screen readers
- Enhanced keyboard navigation
- Verbosity improvements

---

## iOS Port Considerations

### High Priority Adaptations

1. **Input Handling**
   - Virtual keyboard integration
   - Tab completion UX redesign
   - Command history swipe gestures
   - Voice input support (iOS Dictation)

2. **Copy/Paste**
   - iOS pasteboard integration
   - Share sheet for log export
   - Long-press context menus

3. **Notifications**
   - iOS notification framework
   - Badge counts
   - Background notifications

4. **Audio**
   - iOS AVAudioSession management
   - Background audio support
   - AirPlay compatibility
   - Spatial audio (if supported)

5. **File Transfer**
   - iOS Files app integration
   - Photo library access
   - Document picker
   - Share sheet integration

### Medium Priority Adaptations

1. **Preferences**
   - Native iOS settings integration
   - iCloud sync potential

2. **Editor**
   - Native text editor vs. Monaco
   - Split-view support
   - Multitasking compatibility

3. **Sidebar**
   - Swipe gestures
   - Bottom sheet on iPhone
   - iPad split-view optimization

### Low Priority / Technical Concerns

1. **MIDI**
   - iOS MIDI API differences
   - CoreMIDI integration
   - Limited device support

2. **Session Recording**
   - May be developer-only
   - File system access needed

3. **WebRTC**
   - iOS WebRTC support
   - Background audio challenges

### Features That Work As-Is

1. Text-to-speech (iOS has excellent TTS)
2. Sound playback (with AVAudioSession setup)
3. Command history
4. Preferences storage (UserDefaults)
5. GMCP protocol handling

---

## Summary Statistics

| Category | Feature | Status | iOS Complexity |
|----------|---------|--------|----------------|
| Input | Multi-line input | ✅ | Low |
| Input | Command history | ✅ | Low |
| Input | Tab completion | ✅ | Medium |
| Automation | Aliases | ❌ | N/A |
| Automation | Triggers | ❌ | N/A |
| Automation | Server macros | ✅ | Low |
| Logging | Persistent log | ✅ | Low |
| Logging | Save to file | ✅ | Medium |
| Logging | Copy to clipboard | ✅ | Low |
| Settings | Preferences UI | ✅ | Medium |
| Settings | Persistent storage | ✅ | Low |
| Character | Auto-login | ✅ | Low |
| Character | Profiles | ❌ | N/A |
| Map | Display | ❌ | N/A |
| Audio | 3D spatial audio | ✅ | High |
| Audio | TTS | ✅ | Low |
| Audio | MIDI | ✅ | High |
| Audio | Voice chat | ✅ | Medium |
| Automation | Notifications | ✅ | Medium |
| Copy/Paste | Standard | ✅ | Low |
| Copy/Paste | Blockquote buttons | ✅ | Low |
| Session | Recording | ✅ | Low (dev only) |
| Session | Playback | ✅ | Low (dev only) |
| Files | Transfer | ✅ | High |
| Files | Storage | ✅ | Medium |
| Editor | In-game editor | ✅ | High |
| Sidebar | Tabbed interface | ✅ | Medium |
| Accessibility | Screen readers | ✅ | Medium |

**Total Features Analyzed:** 13 categories, 30+ distinct features

---

## Key Findings for iOS Port

### Architecture Advantages
1. **No complex automation** - No aliases/triggers to port
2. **Server-driven** - Most features controlled by server
3. **Modern web APIs** - Many have iOS equivalents
4. **State management** - Clean separation makes porting easier

### Architecture Challenges
1. **Heavy web dependency** - WebSocket, WebRTC, Web Audio, MIDI
2. **Browser features** - Local storage, IndexedDB, Clipboard API
3. **Multi-window** - Editor in separate window/tab
4. **Advanced audio** - 3D spatial audio with Cacophony

### Recommended Approach
1. **Phase 1:** Core input/output, history, preferences
2. **Phase 2:** Audio (TTS, basic sounds, voice chat)
3. **Phase 3:** File transfer, notifications
4. **Phase 4:** Advanced audio (3D, MIDI), editor
5. **Phase 5:** Polish and iOS-specific enhancements

---

**End of Report**
