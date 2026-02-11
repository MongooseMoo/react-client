# Wave 2: Features Verification

**Date:** 2025-12-12
**Analyst:** Claude (Sonnet 4.5)
**Purpose:** Comprehensive verification of all features in the React MUD client, identifying any gaps in Wave 1 documentation

---

## Executive Summary

This verification confirms Wave 1's feature analysis was thorough and accurate. However, several NEW features were discovered that were not documented in Wave 1:

**New Discoveries:**
1. **Virtual MIDI Synthesizer** - Software MIDI playback without hardware
2. **PWA Support** - Progressive Web App with offline capabilities
3. **Autosay Feature** - Toggle for automatic "say" command prefix
4. **Per-Channel Preferences** - Custom autoread/notify settings per communication channel
5. **Mobile/Responsive Design** - Existing responsive layouts for mobile browsers
6. **Connection Management** - Manual connect/disconnect controls
7. **Input Store** - Centralized input state management across components
8. **HTML/Markdown Injection** - Server can inject formatted content
9. **Window Redirection** - Server can route output to different windows/panes
10. **IRE.Composer** - Text composition/editing support for IRE MUD protocol
11. **Focus/Blur Tracking** - Window focus state monitoring for various features

---

## Documented Features Confirmed

All features listed in Wave 1 Report (06-features.md) were verified and confirmed accurate:

### ✅ Command Input and History
- **Location:** `src/components/input.tsx`, `src/CommandHistory.ts`
- **Evidence:** Lines 48-244 in input.tsx, full CommandHistory.ts implementation
- **Storage:** localStorage key `command_history`, max 1000 commands
- **Confirmed:** Multi-line input, tab completion, arrow navigation, persistence

### ✅ NO Aliases System
- **Evidence:** Comprehensive search found zero alias implementation
- **Confirmed:** No pattern matching, no user-defined shortcuts

### ✅ NO Triggers System
- **Evidence:** Comprehensive search found zero trigger implementation
- **Confirmed:** No auto-response, no pattern-based automation

### ✅ Server-Controlled Keybindings
- **Location:** `src/gmcp/Client/Keystrokes.ts`
- **Evidence:** Lines 37-188, full GMCP implementation
- **Confirmed:** Server sends bindings, supports modifiers, autosend modes

### ✅ Built-in Keyboard Shortcuts
- **Location:** `src/App.tsx`, `src/components/toolbar.tsx`
- **Evidence:**
  - App.tsx lines 158-171: Control (cancel speech), Escape (stop sounds/MIDI)
  - App.tsx lines 189-220: Ctrl+1-9 (sidebar tab switching)
  - Toolbar.tsx: Alt+L (save), Alt+Shift+C (copy), Alt+E (clear), Alt+P (prefs), Alt+M (mute), Alt+V (volume), Alt+U (sidebar toggle)
- **Confirmed:** All shortcuts documented in Wave 1

### ✅ Logging/Transcript Features
- **Location:** `src/components/output.tsx`
- **Evidence:** Lines 615-657 (save/copy/clear implementations)
- **Storage:** localStorage key `outputLog`, max 7500 lines, versioned format (v2)
- **Confirmed:** Auto-save, export HTML, clipboard copy, clear log

### ✅ Settings/Preferences
- **Location:** `src/PreferencesStore.tsx`, `src/components/preferences.tsx`
- **Evidence:** Complete preference system with 6 categories
- **Storage:** localStorage key `preferences`
- **Confirmed:** All tabs and settings documented in Wave 1

### ✅ Sound/Audio Features
- **3D Spatial Audio:** `src/gmcp/Client/Media.ts` - Cacophony library
- **TTS:** `src/client.ts` lines 571-592 - Web Speech API
- **MIDI:** `src/gmcp/Client/Midi.ts` - Web MIDI API (hardware)
- **Voice Chat:** `src/components/audioChat.tsx` - LiveKit WebRTC
- **Confirmed:** All audio features as documented

### ✅ File Transfer
- **Location:** `src/FileTransferManager.ts`, `src/FileTransferStore.ts`
- **Evidence:** WebRTC data channels, IndexedDB storage, MD5 verification
- **Confirmed:** Full send/receive, progress tracking, persistence

### ✅ In-Game Editor
- **Location:** `src/components/editor/editorWindow.tsx`, `src/EditorManager.ts`
- **Evidence:** Monaco Editor integration, MCP protocol support
- **Confirmed:** Multi-window, syntax highlighting, autocomplete

### ✅ Session Recording/Playback
- **Location:** `src/SessionRecorder.ts`, `src/SessionReplayer.ts`
- **Evidence:** Complete implementation with IndexedDB storage
- **Confirmed:** Developer tool, not user-facing

### ✅ Desktop Notifications
- **Location:** `src/client.ts` lines 548-569
- **Evidence:** Browser Notification API, permission request on startup
- **Confirmed:** File transfer offers, private messages

### ✅ Accessibility Features
- **Location:** `src/components/output.tsx`, `src/components/preferences.tsx`
- **Evidence:** ARIA live regions, screen reader support, accessible navigation
- **Confirmed:** Editor accessibility mode, live announcements

### ✅ Copy/Paste Features
- **Location:** `src/components/BlockquoteCopyButton.tsx`, `src/components/output.tsx`
- **Evidence:** Clipboard API integration, blockquote auto-buttons
- **Confirmed:** Full clipboard support

---

## NEW Features Discovered (Not in Wave 1)

### 1. Virtual MIDI Synthesizer

**Location:** `src/VirtualMidiService.ts`

**Description:** Software MIDI synthesizer that works without hardware devices.

**Implementation:**
- Uses JZZ (MIDI library) with Tiny synthesizer
- Registered as virtual MIDI port named "Virtual Synthesizer"
- Initialized on app startup (App.tsx lines 146-155)
- Appears in MIDI output device list with id `virtual-synth`
- Allows MIDI playback without physical hardware

**Evidence:**
```typescript
// VirtualMidiService.ts lines 24-44
await JZZ();
Tiny(JZZ);
JZZ.synth.Tiny.register(this.portName);
```

**iOS Implications:**
- Medium complexity - iOS has CoreAudio/AVAudioEngine for synthesis
- Could use iOS built-in instruments or third-party audio units
- Web Audio API could provide alternative on iOS WebView

---

### 2. Progressive Web App (PWA) Support

**Location:** `src/index.tsx`, `public/manifest.json`

**Description:** App can be installed as PWA with offline capabilities.

**Implementation:**
- Service worker registration (index.tsx lines 29-32)
- Web app manifest with icons and display settings
- Only enabled in production builds
- Manifest defines "Mongoose Web Client" as standalone app

**Evidence:**
```typescript
// index.tsx lines 29-32
if (import.meta.env.PROD) {
  registerSW()
}
```

**Manifest:**
```json
{
  "short_name": "Mongoose Client",
  "display": "standalone",
  "theme_color": "#000000"
}
```

**iOS Implications:**
- Native iOS app would replace PWA functionality
- Could keep PWA as web version fallback
- iOS Home Screen web clips offer similar experience

---

### 3. Autosay Feature

**Location:** `src/components/toolbar.tsx`, `src/client.ts`

**Description:** Toggle that automatically prefixes commands with "say" command.

**Implementation:**
- Checkbox in toolbar (toolbar.tsx lines 109-116)
- State tracked in MudClient (client.ts lines 80-91)
- Emits `autosayChanged` event when toggled
- Visual indicator with speech bubble icon (FaCommentDots)

**Evidence:**
```typescript
// client.ts lines 84-91
get autosay(): boolean {
  return this._autosay;
}
set autosay(value: boolean) {
  this._autosay = value;
  this.emit('autosayChanged', value);
}
```

**iOS Implications:**
- Simple toggle - easily portable
- Could be preference or toolbar button
- No special iOS considerations

---

### 4. Per-Channel Communication Preferences

**Location:** `src/PreferencesStore.tsx`, `src/gmcp/Comm/Channel.ts`

**Description:** Individual autoread and notification settings for each communication channel.

**Implementation:**
- Channel preferences stored in preferences object
- Each channel has: autoread mode (off/unfocused/all) and notify (boolean)
- Default for "sayto" channel: notify enabled
- Channels dynamically created as encountered

**Evidence:**
```typescript
// PreferencesStore.tsx lines 24-27, 105-110
export type ChannelPreferences = {
  autoreadMode: AutoreadMode;
  notify: boolean;
};

channels: {
  "sayto": {
    autoreadMode: AutoreadMode.Off,
    notify: true,
  },
},
```

**Channel notification example:**
```typescript
// Comm/Channel.ts lines 24-28
if (data.channel === "say_to_you") {
  if (!document.hasFocus()) {
    this.client.sendNotification(`Message from ${data.talker}`, `${data.text}`);
  }
}
```

**iOS Implications:**
- Medium complexity - need iOS notification framework
- Could integrate with Focus modes
- Table view for channel list with individual toggles

---

### 5. Mobile/Responsive Design

**Location:** `src/App.css`, `src/components/input.css`, `src/components/output.css`

**Description:** Existing responsive layouts for mobile browsers.

**Implementation:**
- Mobile detection via user agent (App.tsx line 84)
- CSS media query at 768px breakpoint
- Stacked layout (vertical) instead of side-by-side
- Sidebar defaults to hidden on mobile
- Grid layout adapts: `grid-template-areas` changes for mobile

**Evidence:**
```typescript
// App.tsx line 84
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// App.tsx line 142
setShowSidebar(!isMobile);
```

```css
/* App.css lines 175-223 */
@media (max-width: 768px) {
  .App, .App.sidebar-shown {
    grid-template-areas:
      "header"
      "main"
      "input"
      "sidebar"
      "status";
    grid-template-columns: 1fr;
  }
  aside {
    max-height: 40vh;
    border-top: 1px solid var(--color-border);
  }
}
```

**iOS Implications:**
- Already mobile-aware in web version
- Native iOS would use UIKit/SwiftUI layouts instead
- Good reference for desired mobile UX
- Shows intent to support mobile viewport sizes

---

### 6. Connection Management Controls

**Location:** `src/components/toolbar.tsx`

**Description:** Manual connect/disconnect button in toolbar.

**Implementation:**
- Toggle button showing current connection state
- Calls `client.connect()` or `client.close()`
- State tracked via `connectionChange` event
- Visual feedback: "Connect" vs "Disconnect" label

**Evidence:**
```typescript
// toolbar.tsx lines 64-70
const handleConnectionToggle = useCallback(() => {
  if (connected) {
    client.close();
  } else {
    client.connect();
  }
}, [connected, client]);
```

**iOS Implications:**
- Simple - button in navigation bar or toolbar
- Network state monitoring with Reachability
- Auto-reconnect logic already exists in client.ts

---

### 7. Input Store (Centralized State)

**Location:** `src/InputStore.ts`

**Description:** Centralized state management for input field across components.

**Implementation:**
- Singleton store pattern (like PreferencesStore)
- Actions: SET_INPUT, CLEAR_INPUT
- Holds current input text
- Provides focus control via registered ref
- Helper functions: `setInputText()`, `setInputTextAndFocus()`, `clearInputText()`

**Evidence:**
```typescript
// InputStore.ts lines 20-76
class InputStore {
  private state: InputState = { text: "" };
  registerInputRef(ref: React.RefObject<HTMLTextAreaElement>) {
    this.inputRef = ref;
  }
  focusInput() {
    if (this.inputRef?.current) {
      this.inputRef.current.focus();
    }
  }
}
```

**Usage:** Allows server (via GMCP Keystrokes) to modify input field content.

**iOS Implications:**
- Similar pattern needed for iOS
- Could use Combine framework for state management
- UITextView state coordination

---

### 8. HTML/Markdown Injection

**Location:** `src/gmcp/Client/Html.ts`

**Description:** Server can inject HTML or Markdown content into client output.

**Implementation:**
- GMCP packages: `Client.Html.Add_html` and `Client.Html.Add_markdown`
- Markdown converted to HTML via `marked` library
- Content emitted as "html" event to output window
- Allows rich formatting beyond ANSI

**Evidence:**
```typescript
// Client/Html.ts lines 16-24
public handleAdd_html(data: GMCPMessageClientHtmlAddHtml): void {
    this.client.emit("html", data.data.join("\n"));
}
public handleAdd_markdown(data: GMCPMessageClientHtmlAddHtml): void {
    const markdown = data.data.join("\n");
    const html = marked(markdown);
    this.client.emit("html", html);
}
```

**iOS Implications:**
- Medium complexity - need HTML rendering
- UITextView with NSAttributedString (limited HTML support)
- WKWebView for full HTML rendering
- Markdown parsing libraries available for iOS

---

### 9. Window Redirection

**Location:** `src/gmcp/Redirect.ts`

**Description:** Server can redirect output to different windows/panes.

**Implementation:**
- GMCP package: `Redirect.Window`
- Specifies target window name (defaults to "main")
- Emits "redirectWindow" event
- Currently TODO - not fully implemented in UI

**Evidence:**
```typescript
// Redirect.ts lines 6-12
handleWindow(windowName: string): void {
    const targetWindow = windowName || "main";
    console.log(`Received Redirect.Window: ${targetWindow}`);
    // TODO: Implement logic to redirect subsequent output to the specified window/pane
    this.client.emit("redirectWindow", targetWindow);
}
```

**iOS Implications:**
- Low priority - feature not fully implemented
- Would need multi-window support or tab system
- iPadOS split-view could support multiple output panes

---

### 10. IRE.Composer Support

**Location:** `src/gmcp/IRE/Composer.ts`

**Description:** Text composition interface for IRE MUD protocol.

**Implementation:**
- GMCP package: `IRE.Composer`
- Server message: `IRE.Composer.Edit` - opens editor with title and text
- Client message: `IRE.Composer.SetBuffer` - sends edited text back
- Editor commands: `***save`, `***quit` (sent as regular commands)
- Emits "composerEdit" event

**Evidence:**
```typescript
// IRE/Composer.ts lines 16-34
handleEdit(data: GMCPMessageIREComposerEdit): void {
    console.log(`Received IRE.Composer.Edit (Title: ${data.title}):`, data.text);
    // TODO: Open an editor interface with the provided title and text
    this.client.emit("composerEdit", data);
}
sendSetBuffer(text: string): void {
    this.sendData("SetBuffer", text);
}
```

**iOS Implications:**
- Could integrate with in-game editor
- Modal text editor (UITextView fullscreen)
- Similar to email composition on iOS

---

### 11. Focus/Blur Tracking

**Location:** `src/client.ts`, `src/App.tsx`, `src/gmcp/Comm/Channel.ts`

**Description:** Tracks window focus state for various behaviors.

**Implementation:**
- Window focus/blur event listeners (client.ts lines 110-119)
- Updates `isWindowFocused` state
- Drives three behaviors:
  1. **Mute in background** - Auto-mute audio when unfocused (if preference enabled)
  2. **Auto-read speech** - TTS when unfocused (if autoread mode = "unfocused")
  3. **Notifications** - Show desktop notifications when unfocused

**Evidence:**
```typescript
// client.ts lines 110-124
window.addEventListener('focus', () => {
  this.isWindowFocused = true;
  this.updateBackgroundMuteState();
});
window.addEventListener('blur', () => {
  this.isWindowFocused = false;
  this.updateBackgroundMuteState();
});

// Background mute logic
updateBackgroundMuteState() {
  const prefs = preferencesStore.getState();
  const shouldMuteInBackground = prefs.sound.muteInBackground && !this.isWindowFocused;
  this.cacophony.muted = this.globalMuted || shouldMuteInBackground;
}
```

**iOS Implications:**
- iOS has similar lifecycle: `applicationDidBecomeActive`, `applicationDidEnterBackground`
- Background audio requires special AVAudioSession configuration
- Notifications work differently (local vs push)
- Could use app state observers

---

## Server-Driven Confirmation

### Evidence: NO Client-Side Aliases

**Search performed:**
- Pattern: `alias|trigger|macro` (case-insensitive)
- Result: Zero matches for user-defined automation
- Conclusion: 100% server-driven automation model confirmed

**All automation controlled via GMCP:**
1. **Client.Keystrokes** - Server defines all key bindings
2. **Client.Speech** - Server triggers TTS
3. **Client.Media** - Server controls all audio playback
4. **Client.Html** - Server injects HTML/Markdown
5. **Client.Midi** - Server sends MIDI messages
6. **Comm.Channel** - Server broadcasts channel messages

**No scripting engine found:**
- No Lua, JavaScript, or other embedded interpreter
- No command queue or batch execution
- No pattern matching on incoming text
- No user-definable conditionals or loops

**This is a pure thin client model** - all game logic remains on server.

---

## Settings/Preferences Complete Audit

### localStorage Keys Used:

1. **`preferences`** - Main preferences object
   - general.localEcho (boolean)
   - speech.autoreadMode (off/unfocused/all)
   - speech.voice (string)
   - speech.rate (number 0.1-10)
   - speech.pitch (number 0-2)
   - speech.volume (number 0-1)
   - sound.muteInBackground (boolean)
   - sound.volume (number 0-1)
   - channels[channelId].autoreadMode (AutoreadMode)
   - channels[channelId].notify (boolean)
   - editor.autocompleteEnabled (boolean)
   - editor.accessibilityMode (boolean)
   - midi.enabled (boolean)
   - midi.lastInputDeviceId (string, optional)
   - midi.lastOutputDeviceId (string, optional)

2. **`command_history`** - Command history (max 1000)

3. **`outputLog`** - Output persistence (max 7500 lines, versioned v2)

4. **`LoginRefreshToken`** - Auto-login refresh token

### IndexedDB Databases Used:

1. **File Transfer Store** (FileTransferStore.ts)
   - Object stores: `chunks`, `metadata`
   - Stores file transfer data and progress

2. **Session Recorder** (SessionRecorder.ts)
   - Stores recorded sessions for playback
   - Developer tool only

### sessionStorage: NOT USED

---

## Mobile/Responsive Considerations

### Existing Mobile Support in Web Version:

1. **Mobile Detection**
   - User agent sniffing (App.tsx line 84)
   - Sets initial sidebar visibility based on platform

2. **Responsive CSS**
   - 768px breakpoint for mobile layout
   - Stacked vertical layout on mobile
   - Sidebar becomes bottom panel (max-height: 40vh)
   - Input adjusts height on mobile (50px vs 100px)

3. **Touch Considerations**
   - No touch gestures implemented
   - Standard tap/click works
   - No swipe navigation
   - No pinch-to-zoom handling

4. **Screen Reader Support**
   - ARIA labels throughout
   - Live regions for announcements
   - Semantic HTML structure

### Mobile Gaps (Not Implemented):

- No virtual keyboard optimization
- No swipe gestures for history/tabs
- No haptic feedback
- No landscape/portrait adaptation beyond CSS
- No pull-to-refresh
- No mobile-specific input modes (dictation button, etc.)
- Tab completion UX not optimized for touch

---

## Additional Technical Discoveries

### 1. Automatic Reconnection Logic

**Location:** `src/client.ts`, `src/MidiService.ts`

- WebSocket auto-reconnect on disconnect (unless intentional)
- MIDI device auto-reconnect with intentional disconnect tracking
- Intentional disconnect flags prevent unwanted reconnection
- Flags reset on server reconnection

### 2. BroadcastChannel for Multi-Window Communication

**Location:** `src/EditorManager.ts`, `src/components/editor/editorWindow.tsx`

- Editor window communicates via BroadcastChannel API
- Allows editor in separate window/tab
- Messages: init, ready, content, close, save

### 3. Multi-Window Editor Session Management

**Location:** `src/EditorManager.ts`

- Tracks multiple concurrent editor sessions
- States: pending, open, closed
- Auto-focus existing window if already open
- Graceful shutdown on disconnect

### 4. MIDI Intentional Disconnect Tracking

**Location:** `src/MidiService.ts` lines 72-581

- Prevents auto-reconnect after user manually disconnects
- Separate flags for input/output devices
- Reset on server reconnection
- Allows fresh device selection on new session

### 5. CORS Proxy for Audio Streaming

**Location:** `src/gmcp/Client/Media.ts`

- Music streams proxied through server to avoid CORS
- Buffer sounds loaded directly
- Priority-based sound management
- Tagging and keying system for control

### 6. Reduced Motion Support

**Location:** `src/components/output.css` line 40

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Respects OS accessibility preference for reduced animations.

### 7. Versioned Storage Format

**Location:** `src/components/output.tsx` lines 21-22

```typescript
const LOCAL_STORAGE_VERSION = 2;
const MAX_OUTPUT_LINES = 7500;
```

Output log uses versioned format - allows future migration of stored data.

### 8. Migration Logic in Preferences

**Location:** `src/PreferencesStore.tsx` lines 78-84

Automatic migration from old preference structure (volume in general) to new (volume in sound).

---

## Feature Completeness Assessment

### Fully Implemented ✅
- Command input and history
- Server-controlled keybindings
- Output persistence and logging
- Preferences and settings
- 3D spatial audio
- Text-to-speech
- MIDI support (hardware and virtual)
- Voice chat (LiveKit)
- File transfer (WebRTC)
- In-game editor (Monaco)
- Desktop notifications
- Accessibility features
- Clipboard operations
- Session recording/playback
- PWA support
- Mobile responsive design
- Connection management
- Autosay feature
- Per-channel preferences
- Focus/blur tracking
- Virtual MIDI synthesizer
- HTML/Markdown injection

### Partially Implemented ⚠️
- **Window Redirection** - GMCP handler exists but UI not implemented
- **IRE.Composer** - GMCP handler exists but editor integration TODO
- **Mobile UX** - Responsive CSS but no touch gestures/optimizations

### Not Implemented ❌
- Aliases (intentionally omitted - server-driven)
- Triggers (intentionally omitted - server-driven)
- Client-side macros (server-driven via Keystrokes)
- Map display
- Character profiles (server-managed only)

---

## iOS Port Priority Assessment

### High Priority (Core Functionality)
1. Command input and history ✅
2. Output rendering (ANSI/HTML) ✅
3. Connection management ✅
4. Preferences storage ✅
5. GMCP protocol handling ✅
6. Basic audio (TTS, sounds) ✅
7. Notifications ✅
8. Mobile-optimized input ⚠️

### Medium Priority (Enhanced Experience)
1. File transfer (native Files app integration) ✅
2. Voice chat (CallKit integration) ✅
3. Virtual MIDI synthesizer 🆕
4. Per-channel preferences 🆕
5. Clipboard operations ✅
6. Editor (native text editor) ✅
7. Sidebar/tabs (native navigation) ✅

### Low Priority (Advanced Features)
1. 3D spatial audio (complex) ✅
2. Hardware MIDI (CoreMIDI) ✅
3. Session recording (developer tool) ✅
4. PWA features (replaced by native app) 🆕
5. Window redirection ⚠️
6. IRE.Composer ⚠️

### Can Defer
1. WebRTC data channels (file transfer can use HTTP fallback)
2. BroadcastChannel (multi-window editor - iOS could use single window)
3. Service workers (native caching instead)

---

## Key Findings Summary

### Strengths of Current Architecture for iOS Port:
1. **Clean separation** - Server-driven model simplifies client
2. **No complex automation** - No Lua/JavaScript interpreter needed
3. **Modern protocols** - GMCP, WebRTC, WebSocket all have iOS equivalents
4. **State management** - Clear store pattern translates well to SwiftUI/Combine
5. **Already mobile-aware** - Responsive design shows mobile intent

### Challenges for iOS Port:
1. **Web-heavy stack** - Many browser APIs need iOS alternatives
2. **Multi-window editor** - BroadcastChannel won't work on iOS
3. **3D audio** - Cacophony library is JavaScript, need iOS spatial audio
4. **Virtual MIDI** - Need iOS software synthesizer
5. **PWA features** - Service worker functionality needs native equivalent

### Features That Translate Easily:
1. Command history (UserDefaults)
2. Preferences (UserDefaults or CoreData)
3. Notifications (UserNotifications framework)
4. TTS (AVSpeechSynthesizer)
5. Clipboard (UIPasteboard)
6. Connection state (URLSession WebSocket)
7. Focus tracking (UIApplicationDelegate lifecycle)

---

## Recommendations

### For iOS Implementation:

1. **Start with core** - Input/output, history, preferences, connection
2. **Use native equivalents** - Don't try to port web technologies directly
3. **Defer complex audio** - Basic audio first, spatial/MIDI later
4. **Simplify editor** - Single-window native text editor instead of Monaco
5. **Native file handling** - UIDocumentPickerViewController for files
6. **Consider hybrid** - WKWebView for HTML output rendering
7. **Test mobile UX** - Current web responsive is starting point, not final design

### Feature Priority for MVP:

**Phase 1 (MVP):**
- Command input with history
- ANSI output rendering
- WebSocket connection
- GMCP Core, Auth, Keystrokes
- Basic preferences
- TTS and basic sounds

**Phase 2 (Enhanced):**
- File transfer
- Notifications
- Voice chat
- More GMCP packages
- Tabs/sidebar

**Phase 3 (Advanced):**
- MIDI support
- 3D audio
- In-game editor
- Advanced accessibility

---

**End of Verification Report**
