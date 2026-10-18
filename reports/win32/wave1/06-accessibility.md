# Win32 Accessibility Implementation Analysis

**Date:** 2025-12-17
**Purpose:** Document existing accessibility (a11y) features for Win32 port translation
**Reference:** `reports/research/ios-native-accessibility.md` for iOS a11y approach
**Critical Requirement:** ALL accessibility features MUST be preserved in Win32 port

---

## Executive Summary

The React-based MUD client implements comprehensive web accessibility features using ARIA attributes, semantic HTML, keyboard navigation, and screen reader support. This document catalogs all existing a11y features for translation to Win32 native accessibility APIs (MSAA/UI Automation).

**Key Findings:**

1. **Screen Reader Support**: Uses `@react-aria/live-announcer` for dynamic content announcements
2. **Keyboard Navigation**: Full keyboard operability with arrow keys, Home/End, Page Up/Down, and custom shortcuts
3. **ARIA Semantics**: Extensive use of ARIA roles, labels, live regions, and state management
4. **Focus Management**: Proper focus trapping in dialogs, tab navigation, and accessible list patterns
5. **Audio Features**: Text-to-speech integration via Web Speech API, MIDI support
6. **Visual Accessibility**: Color is not sole indicator, text alternatives provided
7. **Structured Navigation**: Listbox pattern, tab pattern, and custom accessible list component

**Win32 Translation Strategy:**
- Map ARIA roles to UI Automation Control Patterns
- Convert live regions to UIA LiveRegionChanged events
- Implement IAccessible/IAccessible2 for legacy screen readers
- Support Narrator-specific features and High Contrast mode
- Preserve semantic structure through automation properties

---

## 1. Screen Reader Support

### 1.1 Live Announcements

**Implementation:** `@react-aria/live-announcer` library (v3.4.3)

**Location:** `src/components/output.tsx`

```typescript
import { announce } from "@react-aria/live-announcer";

addToOutput(
    elements: React.ReactNode[],
    type: OutputType,
    shouldAnnounce: boolean = true,
    // ...
) {
    if (shouldAnnounce) {
        elements.forEach((element) => {
            if (React.isValidElement(element)) {
                const htmlString = ReactDOMServer.renderToString(element);
                const plainText = this.sanitizeHtml(htmlString);
                announce(plainText);  // Live announcement to screen readers
            } else if (typeof element === "string") {
                announce(element);
            }
        });
    }
    // ... add to output buffer
}
```

**Key Features:**
- Converts React elements to plain text before announcing
- Sanitizes HTML to prevent announcing markup
- Announces server messages, system info, and errors
- Respects `shouldAnnounce` flag to prevent spam

**Win32 Translation:**
- Use `UIA_LiveRegionChangedEventId` event
- Set `UIA_LiveSettingPropertyId` to `Polite` or `Assertive` based on priority
- For Narrator: Use `AutomationPeer.RaiseNotificationEvent()`
- For legacy screen readers: Use MSAA `EVENT_OBJECT_NAMECHANGE` on live region

**iOS Comparison:**
- iOS uses `UIAccessibility.post(notification: .announcement, argument: text)`
- React uses ARIA live regions (polite/assertive)
- Win32 should use UIA LiveRegion pattern with similar priority levels

### 1.2 Announcement Strategy

**Output Types with Different Priorities:**

```typescript
export enum OutputType {
  Command = 'command',          // Not announced (local echo)
  ServerMessage = 'serverMessage', // Announced (normal priority)
  SystemInfo = 'systemInfo',    // Announced (high priority)
  ErrorMessage = 'errorMessage', // Announced (high priority)
}
```

**Filtering Logic:**
- Commands are NOT announced when local echo is disabled
- Server messages are announced as they arrive
- System messages (Connected/Disconnected) always announced
- Errors always announced

**Win32 Implementation:**
- Map OutputType to UIA `LiveSetting` values:
  - `ServerMessage` → `Polite` (queued)
  - `SystemInfo` → `Assertive` (immediate)
  - `ErrorMessage` → `Assertive` (immediate)
  - `Command` → No announcement

---

## 2. ARIA Roles and Attributes

### 2.1 Comprehensive ARIA Usage

**Locations:** Throughout `src/components/*.tsx`

#### Output Window (`output.tsx`)

```typescript
// Live region implicit via announce() calls
// Each output line has aria-live="off" for commands to prevent double-announcement
<span className="command" aria-live="off">
  {command}
</span>

// New lines notification button
<div
  className="new-lines-notification"
  role="button"
  aria-live="off"  // Visual indicator only, not announced
>
  {newLinesText}
</div>
```

**Win32 Translation:**
- Output scrollback: `ScrollPattern` + `TextPattern` for screen reader text navigation
- Notification button: `ControlType.Button` with `Invoke` pattern
- Suppress announcement: Set `UIA_LiveSettingPropertyId` to `Off`

#### Accessible List Component (`AccessibleList.tsx`)

**Full Listbox Pattern Implementation:**

```typescript
<div
  id={listId}
  className={`accessible-list-container ${className}`}
  ref={containerRef}
  tabIndex={0} // Focusable container
  role="listbox"
  aria-labelledby={labelledBy}
  aria-activedescendant={selectedIndex !== -1 ? `${listId}-item-${items[selectedIndex]?.id}` : undefined}
  onFocus={handleFocus}
  onKeyDown={handleKeyDown}
>
  <ul role="none" className="accessible-list-ul">
    {items.map((item, index) => {
      const isSelected = index === selectedIndex;
      return (
        <li
          key={item.id}
          id={`${listId}-item-${item.id}`}
          className={`${classes} ${isSelected ? 'selected' : ''}`}
          role="option"
          aria-selected={isSelected}
          onClick={() => setSelectedIndex(index)}
        >
          {itemContent}
        </li>
      );
    })}
  </ul>
</div>
```

**ARIA Features:**
- `role="listbox"` - Container is a list selection widget
- `role="option"` - Each item is selectable
- `aria-labelledby` - Associates list with heading
- `aria-activedescendant` - Indicates focused item without moving DOM focus
- `aria-selected` - Indicates current selection state

**Keyboard Support:**
- Arrow Up/Down: Navigate items
- Home/End: Jump to first/last
- PageUp/PageDown: Jump 5 items
- Single letter: Type-ahead search

**Win32 Translation:**
- Use `SelectionPattern` + `SelectionItemPattern`
- Container: `ControlType.List` with `SelectionPattern`
- Items: `ControlType.ListItem` with `SelectionItemPattern`
- Active descendant: Set focus to item using `SetFocus()`
- Selected state: `ISelectionItemProvider.IsSelected` property
- Navigation: Handle arrow keys in WndProc, announce on selection change

#### Tab Component (`tabs.tsx`)

```typescript
<div role="tablist">
  {tabs.map((tab, index) => (
    <button
      role="tab"
      aria-selected={selectedTab === index}
      id={tab.id}
      aria-controls={`${tab.id}-panel`}
      onClick={() => setSelectedTab(index)}
      tabIndex={selectedTab === index ? undefined : -1}
    >
      {tab.label}
    </button>
  ))}
</div>

{tabs.map((tab, index) => (
  <div
    role="tabpanel"
    id={`${tab.id}-panel`}
    aria-labelledby={tab.id}
    hidden={selectedTab !== index}
  >
    {tab.content}
  </div>
))}
```

**ARIA Features:**
- `role="tablist"` - Container for tabs
- `role="tab"` - Tab button
- `role="tabpanel"` - Panel content
- `aria-selected` - Indicates active tab
- `aria-controls` - Links tab to its panel
- `aria-labelledby` - Links panel back to tab
- `tabIndex` management - Only active tab is in tab order

**Keyboard Support:**
- Arrow Left/Right: Switch tabs
- Home/End: Jump to first/last tab

**Win32 Translation:**
- Use `SelectionPattern` for tab switching
- Container: `ControlType.Tab` with `SelectionPattern`
- Tabs: `ControlType.TabItem` with `SelectionItemPattern`
- Panels: `ControlType.Pane` associated via `UIA_LabeledByPropertyId`
- Hidden panels: Set `ControlType.Pane` with `IsOffscreen = true`

#### Room Info Display (`RoomInfoDisplay.tsx`)

```typescript
<div
  className="room-info-display"
  role="region"
  aria-labelledby={headingId}
>
  <h4 id={headingId}>{roomInfo.name || "Current Room"}</h4>

  <div className="room-exits">
    <h5>Exits</h5>
    <ul aria-label="Room Exits">
      {exits.map(([direction, roomId]) => (
        <li key={direction}>
          <button
            onClick={() => handleExitClick(direction)}
            title={`Go ${direction} (to room ${roomId})`}
            aria-label={`Go ${direction}`}
          >
            {direction.toUpperCase()}
          </button>
        </li>
      ))}
    </ul>
  </div>

  <h5 id={contentsHeadingId} tabIndex={-1}>Contents</h5>
  <AccessibleList
    items={filteredRoomItems}
    listId={contentsListId}
    labelledBy={contentsHeadingId}
    // ...
  />
</div>
```

**ARIA Features:**
- `role="region"` - Landmark for major content area
- `aria-labelledby` - Associates region with heading
- `aria-label` - Provides accessible name for lists
- Semantic headings (h4, h5) for structure
- `tabIndex={-1}` - Headings can receive programmatic focus

**Win32 Translation:**
- Region: `ControlType.Group` with `Name` property
- Headings: Custom control with `LocalizedControlType = "heading"` and `UIA_AriaPropertiesPropertyId` for level
- Lists: Use `SelectionPattern` as described above
- Buttons: `ControlType.Button` with `InvokePattern`

### 2.2 Player and Item Cards

#### Player Card (`PlayerCard.tsx`)

```typescript
<div className="player-card" title={player.fullname} data-player-name={player.name}>
  <div className="player-details">
    <div className="player-name">{player.fullname}</div>
  </div>
  <div className="player-actions">
    <button
      onClick={handlePageClick}
      aria-label={`Page ${player.fullname}`}
      tabIndex={0}
      accessKey="p"
    >
      Page
    </button>
    <button
      onClick={handleSayToClick}
      aria-label={`Say to ${player.fullname} (using -${player.name})`}
      title={`Say to ${player.fullname} (uses -${player.name} command)`}
      tabIndex={0}
      accessKey="s"
    >
      Say To
    </button>
    {/* ...more buttons */}
  </div>
</div>
```

**Accessibility Features:**
- `aria-label` - Provides context-specific button names
- `accessKey` - Keyboard shortcuts (Alt+P, Alt+S, etc.)
- `title` - Tooltip with additional information
- `tabIndex={0}` - Explicit tab order
- `data-player-name` - Semantic data attribute

#### Item Card (`ItemCard.tsx`)

```typescript
<div className="item-card" title={itemTitle} data-item-id={item.id}>
  {item.icon && <img src={item.icon} alt="" className="item-icon" />}
  <div className="item-details">
    <div className="item-name">{item.name}</div>
  </div>
  <div className="item-actions">
    {item.location === 'room' && onGet && (
      <button
        onClick={handleGetClick}
        aria-label={`Get ${item.name}`}
        tabIndex={0}
        accessKey="g"
      >
        Get
      </button>
    )}
    {/* Conditional buttons: Wear, Remove, Drop */}
  </div>
</div>
```

**Accessibility Features:**
- Empty `alt=""` for decorative icons (not informative)
- Conditional rendering based on item state
- Context-aware button labels
- Access keys for common actions

**Win32 Translation:**
- Cards: `ControlType.Group` with `Name` from title
- Buttons: `ControlType.Button` with `Name` from aria-label
- Icons: Set `IsContentElement = false` for decorative images
- Access keys: Use `UIA_AccessKeyPropertyId` and handle accelerators in WndProc
- Conditional UI: Update automation tree dynamically when item state changes

---

## 3. Focus Management

### 3.1 Focus Trapping in Dialogs

**Preferences Dialog (`PreferencesDialog.tsx`)**

```typescript
import FocusLock from "react-focus-lock";

const PreferencesDialog = React.forwardRef<PreferencesDialogRef>((_, ref) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  React.useImperativeHandle(ref, () => ({
    open() { setIsOpen(true); },
    close() { setIsOpen(false); },
  }));

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <FocusLock disabled={!isOpen}>
      <dialog
        className="preferences-dialog"
        open={isOpen}
        ref={dialogRef}
        tabIndex={-1}
        aria-label="Preferences"
      >
        <h1>Preferences</h1>
        {isOpen && <Preferences />}
        <button onClick={() => setIsOpen(false)}>Close</button>
      </dialog>
    </FocusLock>
  );
});
```

**Focus Management Features:**
- `FocusLock` - Traps keyboard focus within dialog
- Auto-focus dialog on open
- Escape key closes dialog
- `aria-label` for screen reader context
- Conditional rendering prevents focus on hidden content

**Win32 Translation:**
- Use modal dialog (`CreateDialog` with `WS_POPUP` + `WS_DLGFRAME`)
- Disable parent window during modal display
- Set initial focus to first focusable control
- Handle Escape key in dialog proc
- Implement `UIA_WindowWindowVisualStatePropertyId` = `WindowVisualState_Normal`
- Raise `UIA_Window_WindowOpenedEventId` on show
- Restore focus to previous control on close

### 3.2 Input Field Focus

**Command Input (`input.tsx`)**

```typescript
const CommandInput = ({ onSend, inputRef, client }: Props) => {
  // Register input ref for external focus control
  useEffect(() => {
    inputStore.registerInputRef(inputRef);
  }, [inputRef]);

  return (
    <div className="command-input-container">
      <textarea
        value={inputState.text}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
        id="command-input"
        ref={inputRef}
        autoFocus  // Auto-focus on mount
      />
      <button onClick={handleSend} className="send-button">
        Send
      </button>
    </div>
  );
};
```

**Focus Features:**
- `autoFocus` - Input receives focus on application load
- Exposed ref for programmatic focus control
- Focus restored after sending command
- Focus management via InputStore for cross-component focus calls

**Win32 Translation:**
- Use `SetFocus()` on multiline edit control on app start
- Implement `IUIAutomationElement.SetFocus()` for programmatic focus
- Post `WM_SETFOCUS` on command send completion
- Use `UIA_AutomationFocusChangedEventId` for screen reader notifications

### 3.3 Accessible List Focus

**From `AccessibleList.tsx`:**

```typescript
const handleFocus = () => {
  if (selectedIndex === -1 && items.length > 0) {
    setSelectedIndex(0); // Auto-select first item on focus
  }
};

useEffect(() => {
  // Ensure selected item is visible
  if (selectedIndex !== -1 && items[selectedIndex]) {
    const selectedElId = `${listId}-item-${items[selectedIndex]?.id}`;
    const selectedEl = document.getElementById(selectedElId);
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }
}, [selectedIndex, items, listId]);
```

**Focus Features:**
- Auto-selection on first focus (usability for keyboard users)
- Active descendant pattern (container stays focused, selection changes)
- Automatic scrolling to keep selection visible
- Keyboard-driven selection changes

**Win32 Translation:**
- On `WM_SETFOCUS`: Select first item if none selected
- Use `ISelectionItemProvider.Select()` to change selection
- Call `ScrollIntoView()` on selection change
- Raise `UIA_AutomationFocusChangedEventId` on active descendant change
- Update `UIA_SelectionItem_IsSelectedPropertyId` on all items

---

## 4. Keyboard Navigation

### 4.1 Global Keyboard Shortcuts

**Location:** `src/App.tsx`, `src/components/toolbar.tsx`

#### Application-Level Shortcuts

```typescript
// From App.tsx - Tab switching with Ctrl+Number
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Ctrl+1, Ctrl+2, etc. for tab switching
    if (event.ctrlKey && event.key >= '1' && event.key <= '9') {
      // Switch to tab N
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);
```

#### Toolbar Access Keys

```typescript
<button onClick={onSaveLog} accessKey="l">Save Log</button>
<button onClick={onCopyLog} accessKey="C">Copy Log</button>
<button onClick={onClearLog} accessKey="E">Clear Log</button>
<button onClick={onOpenPrefs} accessKey="p">Preferences</button>
<button accessKey="M">Toggle Sidebar</button>
<button accessKey="V">Show Voice Chat</button>
<button accessKey="U">Show File Transfer</button>
```

**Access Key Pattern:**
- `Alt+L` - Save log
- `Alt+Shift+C` - Copy log
- `Alt+Shift+E` - Clear log (avoid Ctrl+E conflict)
- `Alt+P` - Open preferences
- `Alt+Shift+M` - Toggle sidebar
- `Alt+Shift+V` - Voice chat
- `Alt+Shift+U` - File transfer

**Win32 Translation:**
- Use standard Windows accelerators (Alt+key)
- Define accelerator table with `ACCEL` structure
- Handle `WM_COMMAND` for accelerator activation
- Set `UIA_AcceleratorKeyPropertyId` on each button
- Underline access key character in button text (& prefix)

### 4.2 List Navigation

**From `AccessibleList.tsx`:**

```typescript
const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
  if (items.length === 0) return;

  let newIndex = selectedIndex;

  switch (e.key) {
    case "ArrowDown":
      newIndex = (selectedIndex + 1) % items.length;
      break;
    case "ArrowUp":
      newIndex = (selectedIndex - 1 + items.length) % items.length;
      break;
    case "Home":
      newIndex = 0;
      break;
    case "End":
      newIndex = items.length - 1;
      break;
    case "PageUp":
      newIndex = Math.max(selectedIndex - 5, 0);
      break;
    case "PageDown":
      newIndex = Math.min(selectedIndex + 5, items.length - 1);
      break;
    default:
      // Single-letter typeahead
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const letter = e.key.toLowerCase();
        let foundIndex = -1;
        for (let i = 0; i < items.length; i++) {
          const idx = (selectedIndex + 1 + i) % items.length;
          const itemText = getItemTextValue(items[idx]);
          if (itemText.startsWith(letter)) {
            foundIndex = idx;
            break;
          }
        }
        if (foundIndex !== -1) {
          newIndex = foundIndex;
        }
      }
      break;
  }

  if (newIndex !== selectedIndex) {
    setSelectedIndex(newIndex);
    e.preventDefault();
  }
}, [selectedIndex, items, getItemTextValue]);
```

**Navigation Features:**
- Arrow Up/Down - Previous/Next item (wraps around)
- Home/End - First/Last item
- PageUp/PageDown - Jump 5 items
- Single letter - Incremental search (wraps around from current position)
- Prevents default for handled keys only

**Win32 Translation:**
- Handle `WM_KEYDOWN` in list control
- Implement wrapping behavior for arrow keys
- Use standard list box navigation (already built-in for `LB_*` messages)
- For custom controls: Handle in WndProc and update selection
- Announce selection changes via UIA selection event
- For typeahead: Match against `UIA_NamePropertyId` of items

### 4.3 Tab Navigation

**From `tabs.tsx`:**

```typescript
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowLeft":
        setSelectedTab((prevTab) =>
          prevTab > 0 ? prevTab - 1 : tabs.length - 1
        );
        break;
      case "ArrowRight":
        setSelectedTab((prevTab) =>
          prevTab < tabs.length - 1 ? prevTab + 1 : 0
        );
        break;
      case "Home":
        setSelectedTab(0);
        break;
      case "End":
        setSelectedTab(tabs.length - 1);
        break;
    }
  };

  const currentTabRef = tabsRef.current[selectedTab];
  currentTabRef?.addEventListener("keydown", handleKeyDown);

  return () => {
    currentTabRef?.removeEventListener("keydown", handleKeyDown);
  };
}, [tabs.length, selectedTab]);
```

**Navigation Features:**
- Arrow Left/Right - Switch tabs (wraps)
- Home/End - First/Last tab
- Focus moves with selection

**Win32 Translation:**
- Use `TCM_SETCURFOCUS` and `TCM_SETCURSEL` for tab control
- Tab controls handle arrow keys natively
- Ensure `TCS_FOCUSONBUTTONDOWN` style for immediate focus
- Raise `UIA_SelectionItem_ElementSelectedEventId` on tab change

### 4.4 Command Input Navigation

**From `input.tsx`:**

```typescript
const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  // ...
  if (e.key === "Tab") {
    // Tab completion logic for player names
    // Cycles through matching players
  } else if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    const prevCommand = commandHistory.navigateUp(currentInputText);
    setInputText(prevCommand);
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    const nextCommand = commandHistory.navigateDown(currentInputText);
    setInputText(nextCommand);
  }
}, [/* deps */]);
```

**Navigation Features:**
- Tab - Name completion (cycles through matches)
- Enter - Send command
- Shift+Enter - New line in multiline input
- Arrow Up/Down - Command history navigation

**Win32 Translation:**
- Handle `WM_KEYDOWN` for Tab/Enter/Arrow keys
- Implement autocomplete via custom logic or `IAutoComplete`
- For command history: Store in vector, navigate on arrow keys
- Multiline: Use `ES_MULTILINE` edit control, handle Shift+Enter
- Tab completion: Show dropdown or cycle inline

---

## 5. Output Accessibility

### 5.1 MUD Output Rendering

**From `output.tsx`:**

```typescript
render() {
  return (
    <div
      ref={this.outputRef}
      className={classname}
      onScroll={this.handleScroll}
      onClick={this.handleDataTextClick}
    >
      {this.state.output
        .filter(line => this.state.localEchoActive || line.type !== OutputType.Command)
        .map(line => line.content)}

      {this.state.newLinesCount > 0 && (
        <div
          className="new-lines-notification"
          onClick={this.handleScrollToBottom}
          role="button"
          aria-live="off"
        >
          {newLinesText}
        </div>
      )}
    </div>
  );
}
```

**Accessibility Features:**
- Filtering local echo (commands not shown if preference disabled)
- Structured output lines with semantic class names
- Visual "new messages" indicator (aria-live="off" prevents duplicate announcements)
- Clickable links and exits preserved
- Auto-scroll behavior with manual override

**Output Line Structure:**

```typescript
<div key={currentKey} className={`output-line output-line-${type}`}>
  {element}
</div>
```

Each line is wrapped with type-specific class for styling and semantic grouping.

**Win32 Translation:**
- Use `RichEdit` control for formatted output
- Apply `CHARFORMAT2` for ANSI colors
- Implement `ITextProvider` for screen reader text access
- For links/exits: Use `EN_LINK` notifications with custom `EM_AUTOURLDETECT`
- New messages indicator: Custom button control with notification
- Local echo filtering: Don't insert command lines into RichEdit if disabled
- Auto-scroll: Use `EM_SCROLL` or `EM_LINESCROLL` when at bottom

### 5.2 ANSI Color Handling

**From `ansiParser.tsx`:**

```typescript
function createStyle(bundle: AnserJsonEntry): React.CSSProperties {
  const style: React.CSSProperties = {};
  if (bundle.bg) {
    style.backgroundColor = `rgb(${bundle.bg})`;
  }
  if (bundle.fg) {
    style.color = `rgb(${bundle.fg})`;
  }
  // Bold, italic, underline, etc.
  return style;
}
```

**Color Rendering:**
- ANSI codes parsed to RGB values
- Applied as inline styles
- No semantic color information preserved for screen readers

**Accessibility Gap:**
- Colors are visual only
- Red (damage), green (healing), yellow (warning) not announced
- Screen reader users lose color-coded information

**Win32 Translation:**
- Use `CHARFORMAT2` with `crTextColor` for foreground
- Use `CHARFORMAT2` with `crBackColor` for background
- **Accessibility Enhancement Needed:**
  - Parse ANSI codes and map colors to semantic meanings
  - Add hidden text annotations: "[damage]", "[healing]", "[warning]"
  - Use UIA custom properties to expose color semantics
  - Consider configuration option to announce color names

**Recommended Win32 Enhancement:**

```cpp
// Pseudo-code for semantic color mapping
struct ColorSemantic {
    COLORREF color;
    const wchar_t* meaning;
};

ColorSemantic colorMap[] = {
    { RGB(255, 0, 0), L"[damage]" },
    { RGB(0, 255, 0), L"[healing]" },
    { RGB(255, 255, 0), L"[warning]" },
    // ...
};

void InsertTextWithSemantics(const wchar_t* text, COLORREF color) {
    // Find semantic meaning
    const wchar_t* semantic = GetSemanticForColor(color);

    // Insert hidden semantic prefix for screen readers
    if (semantic && userPrefs.announceColorSemantics) {
        InsertHiddenText(semantic); // Not visible, but read by screen readers
    }

    // Insert visible colored text
    InsertColoredText(text, color);
}
```

### 5.3 Link Handling

**Exit Links:**

```typescript
// From ansiParser.tsx
const exitRegex = /@\[exit:([a-zA-Z]+)\]([a-zA-Z]+)@\[\/\]/g;

function processExitMatch(match: RegExpExecArray): React.ReactNode {
  const [, exitType, exitName] = match;
  return (
    <a onClick={() => onExitClick(exitType)} className="exit">
      {exitName}
    </a>
  );
}
```

**Data-Text Links:**

```typescript
// From output.tsx
handleDataTextClick = (event: React.MouseEvent<HTMLDivElement>) => {
  const linkElement = targetElement.closest('a.command[data-text]');
  if (linkElement instanceof HTMLAnchorElement) {
    event.preventDefault();
    const commandText = linkElement.dataset.text;
    if (commandText) {
      setInputText(commandText);
      this.props.focusInput?.();
    }
  }
};
```

**Link Types:**
1. **Exit links**: `@[exit:north]North@[/]` - Clickable room exits
2. **Data-text links**: `<a class="command" data-text="look sword">look sword</a>` - Populate input field
3. **URLs**: Auto-detected `http://`, `www.`, `mailto:` links

**Win32 Translation:**
- Exit links: Custom link style in RichEdit, handle `EN_LINK` notification
- Data-text links: Parse HTML, store command in custom data structure, handle click
- URLs: Use `EM_AUTOURLDETECT` for automatic URL detection
- For screen readers: Ensure links announced as "link" with UIA `ControlType.Hyperlink`
- Navigation: Tab between links, Enter to activate

---

## 6. Audio and Speech Features

### 6.1 Text-to-Speech Support

**Preferences Structure (`PreferencesStore.tsx`):**

```typescript
export enum AutoreadMode {
  Off = "off",
  Unfocused = "unfocused",  // Only read when window not focused
  All = "all",               // Always read
}

export type SpeechPreferences = {
  autoreadMode: AutoreadMode;
  voice: string;    // Selected TTS voice
  rate: number;     // Speech rate (0.1 - 2.0)
  pitch: number;    // Pitch (0.0 - 2.0)
  volume: number;   // Volume (0.0 - 1.0)
};

export type ChannelPreferences = {
  autoreadMode: AutoreadMode;  // Per-channel TTS settings
  notify: boolean;              // Desktop notifications
};
```

**Speech Implementation (`gmcp/Client/Speech.ts`):**

```typescript
export class GMCPClientSpeech extends GMCPPackage {
  handleSpeak(data: GMCPMessageClientSpeechSpeak): void {
    const utterance = new SpeechSynthesisUtterance(data.text);
    utterance.rate = data.rate;
    utterance.pitch = data.pitch;
    utterance.volume = data.volume;
    speechSynthesis.speak(utterance);
  }
}
```

**Features:**
- Server-triggered speech via GMCP
- User-configurable voice, rate, pitch, volume
- Per-channel autoread modes
- Focus-aware reading (only when unfocused)

**Win32 Translation:**
- Use **SAPI 5** (`ISpVoice` interface) or **Windows Speech Platform**
- Implement `ISpVoice::Speak()` with `SPF_ASYNC` flag
- Map preferences:
  - `voice` → `ISpVoice::SetVoice()`
  - `rate` → `ISpVoice::SetRate()` (-10 to 10, map from 0.1-2.0)
  - `volume` → `ISpVoice::SetVolume()` (0-100, scale from 0.0-1.0)
  - `pitch` → Not directly supported in SAPI, use XML `<pitch>` tag
- Focus detection: Check `GetForegroundWindow()` against app window
- Queue management: Use `ISpVoice::WaitUntilDone()` or async callbacks

**Accessibility Note:**
- This is **in addition** to screen reader announcements
- Screen readers use their own TTS engine
- Application TTS is for non-screen-reader users who want MUD output read aloud
- Both systems should coexist without interference

### 6.2 Audio Chat Integration

**LiveKit Audio (`audioChat.tsx` reference)**

The app uses LiveKit for voice chat functionality. While full implementation details weren't examined, presence in codebase indicates:

- Real-time audio communication between players
- Likely uses Web Audio API
- Integration with MUD client for spatial/channel-based chat

**Win32 Translation:**
- Use **WebRTC** (via native WebView2 or C++ WebRTC library)
- Implement audio device selection (microphone/speakers)
- Ensure accessibility:
  - PTT (Push-to-Talk) keyboard shortcut
  - Visual indicators for speaking/muted states
  - Screen reader announcements for connection state
  - High contrast mode support for UI indicators

### 6.3 MIDI Support

**MIDI Preferences:**

```typescript
export type MidiPreferences = {
  enabled: boolean;
  lastInputDeviceId?: string;
  lastOutputDeviceId?: string;
};
```

**Features:**
- MIDI device input/output
- Virtual MIDI service (`VirtualMidiService`)
- Likely for music/sound effects triggered by game events

**Win32 Translation:**
- Use **Windows Multimedia API** (`midiIn*`, `midiOut*` functions)
- Enumerate devices with `midiInGetDevCaps()` / `midiOutGetDevCaps()`
- Open devices with `midiInOpen()` / `midiOutOpen()`
- Send MIDI messages with `midiOutShortMsg()` / `midiOutLongMsg()`
- For virtual MIDI: Use LoopMIDI or similar virtual driver
- Accessibility: Ensure MIDI device selection accessible via keyboard

---

## 7. High Contrast and Visual Accessibility

### 7.1 Current Implementation

**CSS-Based Styling:**
- Custom color schemes defined in CSS
- No explicit high contrast mode detection
- Colors hardcoded in stylesheets

**Potential Issues:**
- May not respect Windows High Contrast themes
- Color contrast ratios not verified
- No forced colors mode handling

**Win32 Translation Requirements:**

1. **High Contrast Mode Detection:**
   ```cpp
   HIGHCONTRAST hc = { sizeof(HIGHCONTRAST) };
   SystemParametersInfo(SPI_GETHIGHCONTRAST, sizeof(hc), &hc, 0);
   bool highContrastEnabled = (hc.dwFlags & HCF_HIGHCONTRASTON);
   ```

2. **System Color Usage:**
   ```cpp
   COLORREF textColor = GetSysColor(COLOR_WINDOWTEXT);
   COLORREF bgColor = GetSysColor(COLOR_WINDOW);
   COLORREF highlightColor = GetSysColor(COLOR_HIGHLIGHT);
   ```

3. **UIA Properties:**
   - Set `UIA_IsControlElementPropertyId = TRUE`
   - Set `UIA_IsContentElementPropertyId = TRUE`
   - Use system colors for all UI elements in high contrast mode
   - Disable custom themes when high contrast active

4. **ANSI Color Override:**
   - When high contrast mode active, map all colors to system palette
   - Preserve text styling (bold/underline) but use system colors
   - Example: All "colored" text → `COLOR_WINDOWTEXT`, backgrounds → `COLOR_WINDOW`

### 7.2 Focus Indicators

**Current Implementation:**
- CSS `:focus` pseudo-class styling
- Custom focus rings in some components

**Win32 Requirements:**
- Use `DrawFocusRect()` for standard focus rectangles
- Respect `SystemParametersInfo(SPI_GETFOCUSBORDERWIDTH)` for thickness
- Ensure focus visible in high contrast mode
- Use UIA `UIA_HasKeyboardFocusPropertyId` to indicate focus state

---

## 8. Accessibility Preferences

### 8.1 Editor Accessibility Mode

**From `PreferencesStore.tsx`:**

```typescript
export type EditorPreferences = {
  autocompleteEnabled: boolean;
  accessibilityMode: boolean;  // Disables certain editor features for screen reader users
};
```

**Purpose:**
- Simplifies code editor for screen reader users
- Likely disables complex visual features (syntax highlighting animations, hover tooltips)
- Improves screen reader navigation of code

**Win32 Translation:**
- Provide "Screen Reader Mode" toggle in preferences
- When enabled:
  - Use plain text edit control instead of syntax-highlighting RichEdit
  - Disable auto-popup completions (require explicit keyboard trigger)
  - Simplify toolbar (fewer visual-only buttons)
  - Ensure all actions available via keyboard
  - Use standard edit control announcements

### 8.2 Local Echo Preference

**From `PreferencesStore.tsx`:**

```typescript
export type GeneralPreferences = {
  localEcho: boolean;  // Show commands in output window
};
```

**Accessibility Impact:**
- When disabled, commands not shown in output (visual declutter)
- But also not announced to screen readers
- User types command, presses Enter, no feedback until server responds

**Win32 Translation:**
- Same preference available
- If local echo disabled:
  - Don't insert command into RichEdit output
  - Don't announce command text
- If enabled:
  - Insert command with distinct formatting
  - Announce via `ITextProvider` as "command"

**Recommendation:**
- Add preference: "Announce commands even when local echo off"
- Allows visual declutter while maintaining audio feedback for screen reader users

---

## 9. Win32 Accessibility APIs Mapping

### 9.1 MSAA (Microsoft Active Accessibility)

**Legacy Support for Older Screen Readers:**

Use `IAccessible` interface for:
- **JAWS 10 and earlier**
- **Window-Eyes**
- **System Access**

**Implementation:**

```cpp
class MudOutputAccessible : public IAccessible {
public:
    // IAccessible methods
    STDMETHOD(get_accName)(VARIANT varChild, BSTR* pszName) override {
        if (varChild.vt == VT_I4 && varChild.lVal == CHILDID_SELF) {
            *pszName = SysAllocString(L"MUD Output");
            return S_OK;
        }
        return E_INVALIDARG;
    }

    STDMETHOD(get_accRole)(VARIANT varChild, VARIANT* pvarRole) override {
        pvarRole->vt = VT_I4;
        pvarRole->lVal = ROLE_SYSTEM_TEXT;  // Or ROLE_SYSTEM_WINDOW
        return S_OK;
    }

    STDMETHOD(get_accValue)(VARIANT varChild, BSTR* pszValue) override {
        // Return current output buffer text
        *pszValue = SysAllocString(GetOutputText());
        return S_OK;
    }

    // Implement other IAccessible methods...
};
```

**Key Mappings:**
- Output window → `ROLE_SYSTEM_TEXT` or `ROLE_SYSTEM_WINDOW`
- Buttons → `ROLE_SYSTEM_PUSHBUTTON`
- Lists → `ROLE_SYSTEM_LIST`
- List items → `ROLE_SYSTEM_LISTITEM`
- Tabs → `ROLE_SYSTEM_PAGETABLIST`, `ROLE_SYSTEM_PAGETAB`

**Events:**
- `EVENT_OBJECT_NAMECHANGE` - For live region updates
- `EVENT_OBJECT_VALUECHANGE` - For text changes
- `EVENT_OBJECT_STATECHANGE` - For selection changes
- `EVENT_OBJECT_FOCUS` - For focus changes

### 9.2 UI Automation

**Modern API for Narrator and NVDA:**

**Provider Pattern Implementation:**

```cpp
class MudListBoxProvider : public IRawElementProviderSimple,
                           public ISelectionProvider,
                           public IScrollProvider {
public:
    // IRawElementProviderSimple
    STDMETHOD(GetPatternProvider)(PATTERNID patternId, IUnknown** pRetVal) override {
        if (patternId == UIA_SelectionPatternId) {
            *pRetVal = static_cast<ISelectionProvider*>(this);
            AddRef();
            return S_OK;
        } else if (patternId == UIA_ScrollPatternId) {
            *pRetVal = static_cast<IScrollProvider*>(this);
            AddRef();
            return S_OK;
        }
        *pRetVal = nullptr;
        return S_OK;
    }

    STDMETHOD(GetPropertyValue)(PROPERTYID propertyId, VARIANT* pRetVal) override {
        switch (propertyId) {
            case UIA_ControlTypePropertyId:
                pRetVal->vt = VT_I4;
                pRetVal->lVal = UIA_ListControlTypeId;
                break;
            case UIA_NamePropertyId:
                pRetVal->vt = VT_BSTR;
                pRetVal->bstrVal = SysAllocString(L"Room Contents");
                break;
            case UIA_IsKeyboardFocusablePropertyId:
                pRetVal->vt = VT_BOOL;
                pRetVal->boolVal = VARIANT_TRUE;
                break;
            // ... other properties
        }
        return S_OK;
    }

    // ISelectionProvider
    STDMETHOD(GetSelection)(SAFEARRAY** pRetVal) override {
        // Return selected item(s)
        *pRetVal = SafeArrayCreateVector(VT_UNKNOWN, 0, 1);
        // Populate with selected item provider
        return S_OK;
    }

    STDMETHOD(get_CanSelectMultiple)(BOOL* pRetVal) override {
        *pRetVal = FALSE;
        return S_OK;
    }

    // ... implement other methods
};
```

**Control Type Mappings:**

| React ARIA Role | UIA Control Type | Control Patterns |
|----------------|------------------|------------------|
| `role="listbox"` | `UIA_ListControlTypeId` | Selection, Scroll |
| `role="option"` | `UIA_ListItemControlTypeId` | SelectionItem |
| `role="tab"` | `UIA_TabItemControlTypeId` | SelectionItem |
| `role="tablist"` | `UIA_TabControlTypeId` | Selection |
| `role="tabpanel"` | `UIA_PaneControlTypeId` | - |
| `role="button"` | `UIA_ButtonControlTypeId` | Invoke |
| `role="region"` | `UIA_GroupControlTypeId` | - |
| `<textarea>` | `UIA_EditControlTypeId` | Text, Value |

**Event Notifications:**

```cpp
// When selection changes in list
void OnSelectionChanged(int newIndex) {
    IRawElementProviderSimple* itemProvider = GetItemProvider(newIndex);
    UiaRaiseAutomationEvent(
        itemProvider,
        UIA_SelectionItem_ElementSelectedEventId
    );
    itemProvider->Release();
}

// When live region text changes
void OnNewOutputLine(const wchar_t* text) {
    if (UIAutomation) {
        // Raise live region event
        VARIANT varValue;
        varValue.vt = VT_BSTR;
        varValue.bstrVal = SysAllocString(text);

        UiaRaiseAutomationPropertyChangedEvent(
            outputProvider,
            UIA_LiveRegionChangedEventId,
            varOld,
            varValue
        );

        SysFreeString(varValue.bstrVal);
    }
}

// When focus moves
void OnFocusChanged(HWND hwnd) {
    IRawElementProviderSimple* provider = GetProviderForWindow(hwnd);
    UiaRaiseAutomationEvent(
        provider,
        UIA_AutomationFocusChangedEventId
    );
    provider->Release();
}
```

### 9.3 Narrator-Specific Features

**Notification API (Windows 10 1709+):**

```cpp
// For important announcements (like iOS UIAccessibility.post)
void AnnounceToNarrator(const wchar_t* text, NotificationPriority priority) {
    IRawElementProviderSimple* provider = GetRootProvider();

    UiaRaiseNotificationEvent(
        provider,
        NotificationKind_ActionCompleted,
        NotificationProcessing_ImportantMostRecent,
        SysAllocString(text),
        SysAllocString(L"notification_id")
    );
}

// Priority mapping
enum class NotificationPriority {
    Low,      // NotificationProcessing_All
    Normal,   // NotificationProcessing_MostRecent
    High,     // NotificationProcessing_ImportantAll
    Critical  // NotificationProcessing_ImportantMostRecent
};
```

**ItemStatus for Dynamic State:**

```cpp
STDMETHOD(GetPropertyValue)(PROPERTYID propertyId, VARIANT* pRetVal) override {
    if (propertyId == UIA_ItemStatusPropertyId) {
        // For items with changing state
        pRetVal->vt = VT_BSTR;
        if (player.isAFK) {
            pRetVal->bstrVal = SysAllocString(L"Away");
        } else if (player.isInCombat) {
            pRetVal->bstrVal = SysAllocString(L"In combat");
        } else {
            pRetVal->bstrVal = SysAllocString(L"");
        }
        return S_OK;
    }
    // ...
}
```

---

## 10. Testing and Validation

### 10.1 Screen Reader Testing Checklist

**Narrator (Built-in Windows Screen Reader):**
- [ ] All buttons announced with name and role
- [ ] List navigation announces items correctly
- [ ] Tab switching announced
- [ ] New output announced without interrupting user
- [ ] Focus moves logically through interface
- [ ] Dialogs trap focus and announce properly
- [ ] Links announced and activatable
- [ ] Edit controls allow text input and announce content
- [ ] High contrast mode renders correctly
- [ ] Keyboard shortcuts work and are announced

**NVDA (Free, Most Popular):**
- [ ] All interactive elements accessible
- [ ] Browse mode works in output window
- [ ] Forms mode works in input field
- [ ] Live regions announce updates
- [ ] Object navigation works
- [ ] UIA patterns supported
- [ ] MSAA fallback works for legacy features

**JAWS (Commercial, Widely Used in Enterprise):**
- [ ] Virtual cursor works in output
- [ ] Forms mode works correctly
- [ ] Scripts not required for basic functionality
- [ ] IAccessible properties correct
- [ ] UIA support functional
- [ ] Application not identified as "unknown"

### 10.2 Keyboard-Only Testing

**No Mouse Challenge:**
- [ ] Can launch app and reach input field
- [ ] Can navigate all menus and dialogs
- [ ] Can select items in lists
- [ ] Can switch tabs
- [ ] Can activate all buttons
- [ ] Can access all features
- [ ] Focus always visible
- [ ] Focus order logical
- [ ] Tab loops within dialogs
- [ ] Escape closes dialogs

### 10.3 Accessibility Tools

**Windows Accessibility Insights:**
- Run automated tests for UIA compliance
- Check focus order
- Verify keyboard accessibility
- Verify high contrast support
- Check contrast ratios

**AccChecker (Microsoft):**
- Validate MSAA implementation
- Check for missing names/roles
- Verify event firing
- Test with legacy screen readers

**Inspect.exe (Windows SDK):**
- View UIA tree structure
- Verify properties on each element
- Check control patterns
- Monitor events in real-time

**Narrator Developer Mode:**
- Press `Ctrl+Caps Lock+F12` in Narrator
- View UIA properties as announced
- Verify event notifications
- Debug live region updates

---

## 11. Accessibility Gaps and Recommendations

### 11.1 Current Gaps

**1. Color Semantics Not Exposed**
- **Issue:** ANSI colors are visual only, semantic meaning lost
- **Impact:** Screen reader users can't distinguish damage/healing/warnings
- **Recommendation:** Parse ANSI colors and add hidden semantic text annotations

**2. No Rate Limiting on Announcements**
- **Issue:** Rapid server messages could spam screen reader
- **Impact:** User overwhelmed, can't keep up with output
- **Recommendation:** Implement announcement queue with rate limiting (similar to iOS MUDAnnouncer pattern)

**3. Missing Accessibility Rotor Equivalent**
- **Issue:** iOS has rotors for quick navigation to exits/items/players
- **Impact:** Windows screen reader users must navigate linearly
- **Recommendation:** Implement landmark regions and heading structure for quick navigation

**4. No High Contrast Mode Handling**
- **Issue:** Custom colors may conflict with high contrast themes
- **Impact:** Text may be invisible in high contrast mode
- **Recommendation:** Detect high contrast mode and switch to system colors

**5. Limited Keyboard Shortcut Documentation**
- **Issue:** Access keys not documented for screen reader users
- **Impact:** Users don't know available shortcuts
- **Recommendation:** Add Help dialog listing all keyboard shortcuts

### 11.2 Win32-Specific Enhancements

**1. Implement UIA TextPattern for Output Window**
- Allows screen readers to read output line-by-line
- Supports text selection and copying
- Enables "say all" functionality

**2. Add Notification Icons with Tooltips**
- Visual indicators for new messages, connections, etc.
- Tooltips provide context for screen reader users
- System tray icon with balloon notifications

**3. Implement Smart Announcement Strategy**

```cpp
class AnnouncementQueue {
    struct Announcement {
        std::wstring text;
        AnnouncementPriority priority;
        std::chrono::steady_clock::time_point timestamp;
    };

    std::deque<Announcement> queue;
    std::chrono::steady_clock::time_point lastAnnouncement;
    std::chrono::milliseconds minInterval{500}; // 500ms between announcements

public:
    void Announce(const std::wstring& text, AnnouncementPriority priority) {
        auto now = std::chrono::steady_clock::now();

        if (priority == AnnouncementPriority::Critical) {
            // Always announce immediately
            DoAnnounce(text);
            lastAnnouncement = now;
        } else {
            // Queue and process with rate limiting
            queue.push_back({text, priority, now});
            ProcessQueue();
        }
    }

    void ProcessQueue() {
        auto now = std::chrono::steady_clock::now();
        if (queue.empty()) return;

        if (now - lastAnnouncement >= minInterval) {
            // Announce highest priority item
            auto it = std::max_element(queue.begin(), queue.end(),
                [](const auto& a, const auto& b) {
                    return a.priority < b.priority;
                });

            DoAnnounce(it->text);
            queue.erase(it);
            lastAnnouncement = now;

            // Schedule next processing
            SetTimer(hwnd, TIMER_PROCESS_QUEUE, minInterval.count(), nullptr);
        }
    }

private:
    void DoAnnounce(const std::wstring& text) {
        UiaRaiseNotificationEvent(
            rootProvider,
            NotificationKind_Other,
            NotificationProcessing_MostRecent,
            SysAllocString(text.c_str()),
            SysAllocString(L"mud_output")
        );
    }
};
```

**4. Implement Verbosity Levels (from iOS design)**

```cpp
enum class VerbosityLevel {
    All,          // Announce every message
    Important,    // Only tells, combat results, deaths
    Critical,     // Only deaths, level-ups, critical errors
    Manual        // No auto-announce, user navigates manually
};

bool ShouldAnnounce(OutputType type, VerbosityLevel level) {
    switch (level) {
        case VerbosityLevel::All:
            return true;
        case VerbosityLevel::Important:
            return type == OutputType::SystemInfo ||
                   type == OutputType::ErrorMessage;
        case VerbosityLevel::Critical:
            return type == OutputType::ErrorMessage;
        case VerbosityLevel::Manual:
            return false;
    }
}
```

**5. Add Accessible Name Computation**

For complex controls, implement proper name calculation:

```cpp
std::wstring GetAccessibleName(ControlType type, const Item& item) {
    std::wostringstream name;

    switch (type) {
        case ControlType::ItemCard:
            name << item.name;
            if (item.isWorn) {
                name << L", worn";
            }
            if (item.isWearable && !item.isWorn) {
                name << L", wearable";
            }
            break;

        case ControlType::PlayerCard:
            name << player.fullname;
            if (player.isAFK) {
                name << L", away";
            }
            break;
    }

    return name.str();
}
```

---

## 12. Preservation Checklist for Win32 Port

### 12.1 Must Preserve

- [x] **Screen Reader Announcements** - All output announced via UIA live regions
- [x] **Keyboard Navigation** - All features accessible via keyboard
- [x] **ARIA Semantics** - Translated to UIA control types and patterns
- [x] **Focus Management** - Dialogs trap focus, logical tab order
- [x] **List Navigation** - Arrow keys, Home/End, PageUp/PageDown, typeahead
- [x] **Tab Navigation** - Arrow keys switch tabs, proper ARIA relationships
- [x] **Access Keys** - All shortcuts preserved and documented
- [x] **Link Handling** - Exits and data-text links functional and accessible
- [x] **Local Echo Filtering** - Commands optionally hidden from output
- [x] **Text-to-Speech** - GMCP speech integration via SAPI
- [x] **Preferences** - All accessibility preferences preserved
- [x] **Auto-Scroll** - Output scrolls to bottom, manual override available

### 12.2 Must Add for Win32

- [ ] **High Contrast Mode Support** - Detect and adapt to system theme
- [ ] **UIA TextPattern** - For line-by-line screen reader navigation
- [ ] **Color Semantics** - Map ANSI colors to semantic annotations
- [ ] **Announcement Queue** - Rate limiting to prevent spam
- [ ] **Verbosity Levels** - User-configurable announcement filtering
- [ ] **IAccessible Implementation** - For legacy screen reader support
- [ ] **Narrator-Specific Optimizations** - Use UIA Notification API
- [ ] **Keyboard Shortcut Help** - Document all access keys and shortcuts
- [ ] **Accessible Name Computation** - Context-rich names for all controls

### 12.3 Testing Requirements

- [ ] Test with **Narrator** (latest Windows 11 version)
- [ ] Test with **NVDA** (free, widely used)
- [ ] Test with **JAWS** (commercial standard)
- [ ] Test in **High Contrast mode** (all themes)
- [ ] Test with **keyboard only** (no mouse)
- [ ] Test with **Accessibility Insights**
- [ ] Test with **Inspect.exe** (verify UIA tree)
- [ ] Test **focus order** throughout application
- [ ] Test **live region announcements** during rapid output
- [ ] Test **screen reader navigation** of output history

---

## 13. Win32 Implementation Strategy

### 13.1 Phased Approach

**Phase 1: Core Accessibility (MVP)**
1. Implement basic UIA providers for all controls
2. Set up control types and patterns
3. Implement keyboard navigation
4. Add focus management
5. Basic MSAA support for legacy screen readers

**Phase 2: Advanced Features**
1. Implement TextPattern for output window
2. Add live region announcements with rate limiting
3. Implement high contrast mode support
4. Add color semantic annotations
5. Implement announcement queue with priorities

**Phase 3: Narrator Optimization**
1. Use UIA Notification API for announcements
2. Implement ItemStatus for dynamic state
3. Add custom properties for MUD-specific data
4. Optimize event firing for performance

**Phase 4: Testing and Refinement**
1. Full screen reader testing (Narrator, NVDA, JAWS)
2. Keyboard-only testing
3. High contrast testing
4. Performance optimization
5. User acceptance testing with blind users

### 13.2 Architecture Recommendations

**Use Windows Template Library (WTL) or Raw Win32 with COM:**
- Direct access to UIA and MSAA APIs
- No framework overhead
- Full control over accessibility implementation

**Create Accessibility Layer:**

```cpp
// Base class for accessible controls
class AccessibleControl {
protected:
    HWND hwnd;
    IRawElementProviderSimple* provider;

public:
    virtual ~AccessibleControl() {
        if (provider) provider->Release();
    }

    virtual IRawElementProviderSimple* GetUIAProvider() = 0;
    virtual IAccessible* GetMSAAProvider() = 0;

    virtual std::wstring GetAccessibleName() = 0;
    virtual std::wstring GetAccessibleDescription() { return L""; }
    virtual long GetAccessibleRole() = 0;
    virtual UIA_CONTROLTYPE_ID GetUIAControlType() = 0;

    void RaiseFocusEvent() {
        UiaRaiseAutomationEvent(provider, UIA_AutomationFocusChangedEventId);
    }

    void RaiseNameChangeEvent() {
        // For MSAA
        NotifyWinEvent(EVENT_OBJECT_NAMECHANGE, hwnd, OBJID_CLIENT, CHILDID_SELF);
    }
};

// Specialized control implementations
class AccessibleListBox : public AccessibleControl, public ISelectionProvider {
    // Implementation
};

class AccessibleButton : public AccessibleControl, public IInvokeProvider {
    // Implementation
};

// etc.
```

**Event Coordination:**

```cpp
class AccessibilityManager {
    std::unordered_map<HWND, AccessibleControl*> controls;
    AnnouncementQueue announcements;

public:
    void RegisterControl(HWND hwnd, AccessibleControl* control) {
        controls[hwnd] = control;
    }

    void OnFocusChange(HWND hwnd) {
        if (auto it = controls.find(hwnd); it != controls.end()) {
            it->second->RaiseFocusEvent();
        }
    }

    void AnnounceText(const std::wstring& text, AnnouncementPriority priority) {
        announcements.Announce(text, priority);
    }

    void OnHighContrastChange() {
        // Notify all controls to redraw with system colors
        for (auto& [hwnd, control] : controls) {
            InvalidateRect(hwnd, nullptr, TRUE);
        }
    }
};
```

---

## 14. Conclusion

The React-based MUD client has a **strong accessibility foundation** that must be fully preserved in the Win32 port. Key features include:

1. **Comprehensive screen reader support** via live announcements
2. **Full keyboard accessibility** with proper navigation patterns
3. **Semantic structure** via ARIA roles and attributes
4. **Focus management** with proper trapping and tab order
5. **Text-to-speech integration** for audio output
6. **Flexible preferences** for user customization

**Win32 Translation Requirements:**

- Map all ARIA semantics to **UI Automation** control types and patterns
- Implement **MSAA** for legacy screen reader support
- Add **announcement queuing and rate limiting** to prevent spam
- Implement **high contrast mode** support
- Add **color semantic annotations** for ANSI output
- Optimize for **Narrator** using UIA Notification API
- Ensure **keyboard-only operability** of all features

**Critical Success Factors:**

1. **Test early and often** with real screen readers
2. **Involve blind users** in testing and feedback
3. **Prioritize keyboard navigation** as primary input method
4. **Preserve all existing a11y features** from web version
5. **Add Win32-specific enhancements** (high contrast, UIA TextPattern)
6. **Document all accessibility features** for users and future developers

The Win32 port has the opportunity to **exceed** the web version's accessibility by leveraging native OS integration, better performance, and screen reader-specific optimizations. This is essential for MUD clients, where **text-based gaming has historically been highly accessible** to blind and low-vision users.

**Accessibility is not optional—it is the core user experience for many MUD players.**
