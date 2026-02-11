# Win32 UI Rendering System Analysis

**Date:** 2025-12-17
**Purpose:** Document the React web client's UI and text rendering for Win32 native port planning
**Reference:** Based on wave1/05-ui-components.md, wave1/07-text-rendering.md, wave2/04-ui-rendering-verification.md

---

## Executive Summary

This React MUD client uses a **CSS Grid-based layout** with **virtualized terminal output**, **ANSI color support**, and **component-based architecture**. For a Win32 port, the key challenge is translating React components and CSS layouts into native Windows controls while preserving the text rendering pipeline and user experience.

**Key Win32 Implications:**
- CSS Grid → Win32 window layout management (child window positioning)
- React components → Native Win32 controls (Edit, RichEdit, ListBox, etc.)
- Virtuoso virtualization → Custom virtual list control or ListBox with owner-draw
- ANSI parsing → GDI/Direct2D text rendering with color spans
- CSS styling → Win32 visual styles and custom painting

---

## 1. Terminal Output Rendering

### 1.1 Output System Architecture

**Current Implementation:** Class-based React component with imperative methods

**File:** `src/components/output.tsx`

```typescript
class Output extends React.Component<Props, State> {
  static MAX_OUTPUT_LENGTH = 7500;  // Maximum scrollback
  outputRef: React.RefObject<HTMLDivElement>;

  interface OutputLine {
    id: number;              // Unique ID for React keys
    type: OutputType;        // Command, ServerMessage, SystemInfo, ErrorMessage
    content: JSX.Element;    // Rendered React element
    sourceType: string;      // 'ansi' | 'html' | 'command' | 'system' | 'error'
    sourceContent: string;   // Raw source before rendering
    metadata?: Record<string, any>;
  }
}
```

**Win32 Translation:**
- **Control Type:** `RichEdit` control (RICHEDIT50W class) for rich text support
- **Scrollback:** Ring buffer of 7500 entries in memory
- **Rendering:** Stream RTF or use EM_SETCHARFORMAT for color spans
- **Alternative:** Custom owner-draw ListBox for more control

### 1.2 ANSI Color Processing

**Library:** `anser` v2.3.2 - Converts ANSI escape codes to JSON

**File:** `src/ansiParser.tsx`

```typescript
function parseToElements(text: string, onExitClick: (exit: string) => void) {
  for (const line of text.split("\r\n")) {
    const parsed = Anser.ansiToJson(line, { json: true });
    // Converts ANSI → { fg: "255,255,255", bg: "0,0,0", decoration: "bold" }
  }
}
```

**ANSI Features Supported:**
- ✅ Foreground/background colors (8-bit, 256-color, RGB)
- ✅ Bold, dim, italic, underline, strikethrough
- ✅ Hidden text, blink

**Win32 Implementation Strategy:**

**Option A: RichEdit with RTF Streaming**
```cpp
// Convert ANSI to RTF color table
std::string ansiToRTF(const std::string& ansiText) {
    std::string rtf = "{\\rtf1\\ansi\\deff0{\\colortbl;";
    // Build color table from parsed ANSI
    rtf += "\\red255\\green255\\blue255;"; // Color 1 (white)
    rtf += "}";
    // Stream text with color commands: \\cf1 for foreground, \\cb2 for background
    return rtf;
}
```

**Option B: Custom TextRenderer with Direct2D**
```cpp
struct StyledTextSpan {
    std::wstring text;
    COLORREF fgColor;
    COLORREF bgColor;
    DWORD style;  // BOLD, ITALIC, UNDERLINE flags
};

class OutputRenderer {
    std::vector<std::vector<StyledTextSpan>> m_lines;  // Line-based storage

    void RenderLine(ID2D1RenderTarget* rt, int lineIndex, D2D1_RECT_F bounds) {
        float x = bounds.left;
        for (const auto& span : m_lines[lineIndex]) {
            // Draw background rectangle
            // Draw text with IDWriteTextFormat (apply bold/italic)
            // Apply underline via DrawLine if needed
        }
    }
};
```

**Recommendation:** Use **RichEdit** for initial port (faster development), migrate to **Direct2D** for performance if needed.

### 1.3 HTML Content Rendering

**Current:** DOMPurify sanitization + dangerouslySetInnerHTML

**File:** `src/components/output.tsx:128-187`

```typescript
const createHtmlElements = (html: string) => {
  const clean = DOMPurify.sanitize(html);
  const doc = new DOMParser().parseFromString(clean, "text/html");

  // Special handling for <blockquote> with copy buttons
  const blockquotes = doc.querySelectorAll("blockquote");
}
```

**Win32 Translation:**
- **HTML Subset:** Use MSHTML (IHTMLDocument2) or WebView2 for HTML rendering
- **Simple HTML:** Parse and convert to RTF for RichEdit
- **Blockquotes:** Custom drawn borders with copy button overlay

**Recommended Approach:**
```cpp
// Embedded WebView2 for HTML-only messages
class HtmlMessageView {
    wil::com_ptr<ICoreWebView2> m_webview;

    void SetHtmlContent(const std::string& html) {
        // Sanitize HTML (use C++ HTML parser like gumbo)
        // Inject into WebView2 with custom CSS for dark theme
        m_webview->NavigateToString(sanitizedHtml.c_str());
    }
};
```

### 1.4 Text Styling and Formatting

**CSS Styling:** `src/components/output.css`

```css
.output {
  font-family: Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: clamp(0.9em, 2vw, 1.2em);  /* Responsive: 14-19px range */
  color: #ffffff;
  background-color: #000000;
  white-space: pre-wrap;  /* Preserve whitespace, wrap at edges */
  padding: 1rem;
  border: 1px solid #ccc;
}

.output-line-systemInfo {
  color: #87ceeb; /* Sky blue */
}

.output-line-errorMessage {
  color: #ff6347; /* Tomato red */
}
```

**Win32 Font Configuration:**
```cpp
struct OutputStyle {
    LOGFONT font;           // "Consolas", 14pt
    COLORREF normalText;    // RGB(255, 255, 255)
    COLORREF background;    // RGB(0, 0, 0)
    COLORREF systemInfo;    // RGB(135, 206, 235) - Sky blue
    COLORREF errorMsg;      // RGB(255, 99, 71)  - Tomato
    COLORREF exitLinks;     // RGB(255, 165, 0)  - Orange
};

// RichEdit character format
void ApplySystemInfoStyle(HWND richEdit) {
    CHARFORMAT2 cf = {};
    cf.cbSize = sizeof(cf);
    cf.dwMask = CFM_COLOR;
    cf.crTextColor = RGB(135, 206, 235);  // Sky blue
    SendMessage(richEdit, EM_SETCHARFORMAT, SCF_SELECTION, (LPARAM)&cf);
}
```

### 1.5 Scrollback Management

**Current System:**
- Maximum: 7500 entries
- Auto-trimming: Oldest entries removed when limit exceeded
- Persistence: LocalStorage with versioned schema

**File:** `src/components/output.tsx:22-24, 396-410`

```typescript
const MAX_OUTPUT_LENGTH = 7500;

// Auto-trim logic
setOutputEntries((prev) => {
  const combined = [...prev, ...newEntries];
  if (combined.length > MAX_OUTPUT_LENGTH) {
    return combined.slice(-MAX_OUTPUT_LENGTH);  // Keep last 7500
  }
  return combined;
});
```

**Win32 Implementation:**

```cpp
class ScrollbackBuffer {
    static constexpr size_t MAX_LINES = 7500;
    std::deque<OutputLine> m_lines;  // Double-ended queue for efficient add/remove

    void AddLine(OutputLine line) {
        m_lines.push_back(std::move(line));
        if (m_lines.size() > MAX_LINES) {
            m_lines.pop_front();  // Remove oldest
        }
        NotifyView();  // Trigger UI update
    }

    void SaveToDisk(const std::wstring& path) {
        // Serialize to JSON with version number
        nlohmann::json j;
        j["version"] = 2;
        j["lines"] = m_lines;  // Custom serializer needed
        std::ofstream(path) << j.dump();
    }
};
```

**Persistence Location:** `%APPDATA%\MongooseMUD\output_log.json`

### 1.6 Virtualized Rendering

**Current:** React Virtuoso library for virtual scrolling

**File:** `src/components/output.tsx:702-710`

```typescript
<Virtuoso
  ref={virtuosoRef}
  data={visibleEntries}      // 7500 entries max
  itemContent={itemContent}   // Render function
  followOutput="smooth"       // Auto-scroll new messages
  atBottomStateChange={handleAtBottomStateChange}
/>
```

**Why Virtualization:**
- Only renders visible items + buffer (~50-100 lines)
- Constant memory regardless of 7500 total lines
- Smooth scrolling performance

**Win32 Virtual List Approaches:**

**Option A: ListBox with LBS_OWNERDRAWFIXED**
```cpp
LRESULT OnDrawItem(DRAWITEMSTRUCT* dis) {
    if (dis->itemID == -1) return TRUE;

    // Only render visible items (20-30 typically)
    const auto& line = m_scrollback.GetLine(dis->itemID);

    HDC hdc = dis->hDC;
    SetBkMode(hdc, OPAQUE);
    SetBkColor(hdc, RGB(0, 0, 0));

    // Render styled text spans
    RenderStyledLine(hdc, line, dis->rcItem);
    return TRUE;
}
```

**Option B: Custom Virtual Window**
```cpp
class VirtualOutputWindow {
    int m_scrollPos;        // Current scroll position (line number)
    int m_visibleLines;     // Lines fitting in viewport

    void OnPaint(HDC hdc) {
        int startLine = m_scrollPos;
        int endLine = std::min(startLine + m_visibleLines,
                               m_scrollback.LineCount());

        for (int i = startLine; i < endLine; ++i) {
            RenderLine(hdc, i, CalculateRect(i - startLine));
        }
    }

    void OnVScroll(WPARAM wParam) {
        switch (LOWORD(wParam)) {
            case SB_LINEUP: m_scrollPos--; break;
            case SB_LINEDOWN: m_scrollPos++; break;
            case SB_PAGEUP: m_scrollPos -= m_visibleLines; break;
            // Update scrollbar, invalidate
        }
    }
};
```

**Recommendation:** Custom virtual window with **Direct2D rendering** for best performance and flexibility.

---

## 2. Component Structure

### 2.1 Main Application Layout

**CSS Grid Layout:** `src/App.css:108-136`

```css
.App {
  display: grid;
  grid-template-areas:
    "header"
    "main"
    "input"
    "status";
  grid-template-rows: auto minmax(0, 1fr) auto auto;
  height: 100vh;
}

/* When sidebar shown */
.App.sidebar-shown {
  grid-template-areas:
    "header header"
    "main sidebar"
    "input input"
    "status status";
  grid-template-columns: 1fr var(--sidebar-width);  /* sidebar: 250-300px */
}
```

**Win32 Layout Strategy:**

```cpp
class MainWindow : public CWindowImpl<MainWindow> {
    CToolBarCtrl m_toolbar;          // Header
    OutputWindow m_output;            // Main
    CEdit m_input;                    // Input
    CStatusBarCtrl m_statusbar;       // Status
    SidebarWindow m_sidebar;          // Sidebar (optional)

    void OnSize(UINT, CSize size) {
        int toolbarHeight = 40;
        int statusHeight = 24;
        int inputHeight = 60;

        m_toolbar.MoveWindow(0, 0, size.cx, toolbarHeight);

        if (m_sidebarVisible) {
            int sidebarWidth = 280;
            m_output.MoveWindow(0, toolbarHeight,
                               size.cx - sidebarWidth,
                               size.cy - toolbarHeight - inputHeight - statusHeight);
            m_sidebar.MoveWindow(size.cx - sidebarWidth, toolbarHeight,
                                sidebarWidth,
                                size.cy - toolbarHeight - inputHeight - statusHeight);
        } else {
            m_output.MoveWindow(0, toolbarHeight,
                               size.cx,
                               size.cy - toolbarHeight - inputHeight - statusHeight);
        }

        m_input.MoveWindow(0, size.cy - inputHeight - statusHeight,
                          size.cx, inputHeight);
        m_statusbar.MoveWindow(0, size.cy - statusHeight,
                              size.cx, statusHeight);
    }
};
```

**Alternative:** Use WTL's `CSplitterWindow` for resizable panes.

### 2.2 UI Components Breakdown

**React Component Tree:**
```
App
├── Toolbar (buttons: save, clear, prefs, mute, connect)
├── OutputWindow (virtualized terminal output)
├── CommandInput (textarea + send button)
├── Sidebar (conditional)
│   └── Tabs
│       ├── RoomInfoDisplay (room name, exits, players, items)
│       ├── Inventory (item list + actions)
│       ├── Userlist (connected players)
│       ├── MidiStatus (MIDI device info)
│       ├── FileTransferUI (file send/receive)
│       └── AudioChat (LiveKit audio conference)
├── Statusbar (connection status, HP/MP vitals)
└── PreferencesDialog (modal settings)
```

**Win32 Control Mapping:**

| React Component | Win32 Control | Notes |
|----------------|---------------|-------|
| **Toolbar** | `CToolBarCtrl` or custom | 9 buttons + volume slider + checkbox |
| **OutputWindow** | RichEdit20W or custom | Virtualized, owner-draw |
| **CommandInput** | RichEdit20W (multiline) | With button (subclassed) |
| **Sidebar** | `CTabCtrl` + child windows | Resizable splitter |
| **RoomInfoDisplay** | `CListCtrl` (report view) | Group boxes for sections |
| **Inventory** | `CListView` (icon or list) | Context menu for actions |
| **Userlist** | `CListBox` (owner-draw) | Show online/away status |
| **Statusbar** | `CStatusBarCtrl` | 2-3 panes (status, vitals) |
| **PreferencesDialog** | `CPropertySheet` | Tabbed dialog pages |

---

## 3. Input Handling System

### 3.1 Command Input Component

**File:** `src/components/input.tsx`

**Features:**
1. Multi-line textarea (height: 60px)
2. Send button
3. Command history (Arrow Up/Down, max 1000 commands)
4. Tab completion (player names from room)
5. Keyboard shortcuts:
   - Enter: Send (Shift+Enter: newline)
   - Escape: Handled at app level (stop sounds)

**Win32 Implementation:**

```cpp
class CommandInputControl : public CWindowImpl<CommandInputControl> {
    static constexpr int MAX_HISTORY = 1000;
    std::deque<std::wstring> m_history;
    int m_historyPos = -1;
    CRichEditCtrl m_edit;
    CButton m_sendBtn;

    LRESULT OnKeyDown(UINT, WPARAM wParam, LPARAM) {
        switch (wParam) {
            case VK_RETURN:
                if (!(GetKeyState(VK_SHIFT) & 0x8000)) {
                    SendCommand();
                    return 0;  // Prevent newline
                }
                break;
            case VK_UP:
                NavigateHistory(-1);
                return 0;
            case VK_DOWN:
                NavigateHistory(+1);
                return 0;
            case VK_TAB:
                TabComplete();
                return 0;  // Prevent focus change
        }
        return DefWindowProc();
    }

    void TabComplete() {
        // Get current word at cursor
        // Query client->worldData.roomPlayers
        // Match name or fullname (case-insensitive)
        // Cycle through matches on repeated Tab
    }

    void SaveHistory() {
        // Save to %APPDATA%\MongooseMUD\command_history.txt
    }
};
```

**CSS Styling:** `src/components/input.css`
- Black background (#000000)
- White text (#ffffff)
- Green focus outline (#4caf50)
- Monospace font (Consolas)

**Win32 Styling:**
```cpp
void StyleCommandInput(HWND edit) {
    // Set background color (custom NM_CUSTOMDRAW or subclass WM_CTLCOLOREDIT)
    SendMessage(edit, EM_SETBKGNDCOLOR, 0, RGB(0, 0, 0));

    CHARFORMAT2 cf = {};
    cf.cbSize = sizeof(cf);
    cf.dwMask = CFM_COLOR | CFM_FACE;
    cf.crTextColor = RGB(255, 255, 255);
    wcscpy_s(cf.szFaceName, L"Consolas");
    SendMessage(edit, EM_SETCHARFORMAT, SCF_ALL, (LPARAM)&cf);
}
```

### 3.2 Command History Storage

**Current:** LocalStorage, max 1000 commands

**File:** `src/components/input.tsx:17-18, 58-86`

```typescript
const STORAGE_KEY = 'command_history';
const MAX_HISTORY = 1000;

useEffect(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const history = JSON.parse(saved);
    // Load into CommandHistory instance
  }
}, []);

const saveHistory = () => {
  const trimmed = history.slice(-MAX_HISTORY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
};
```

**Win32 Implementation:**
```cpp
class CommandHistory {
    std::deque<std::wstring> m_commands;

    void LoadFromDisk() {
        std::wstring path = GetAppDataPath() + L"\\command_history.txt";
        std::wifstream file(path);
        std::wstring line;
        while (std::getline(file, line) && m_commands.size() < 1000) {
            m_commands.push_back(line);
        }
    }

    void SaveToDisk() {
        std::wstring path = GetAppDataPath() + L"\\command_history.txt";
        std::wofstream file(path);
        for (const auto& cmd : m_commands) {
            file << cmd << L'\n';
        }
    }
};
```

---

## 4. Layout and Panels

### 4.1 Main Window Layout

**Responsive Grid:** Adapts to window size and sidebar visibility

**Desktop Layout (sidebar shown):**
```
┌────────────────────────────────────────┐
│ Toolbar (Header)                       │
├────────────────────────┬───────────────┤
│                        │               │
│ Output (Main)          │ Sidebar       │
│                        │ (Tabs)        │
│                        │               │
├────────────────────────┴───────────────┤
│ Command Input                          │
├────────────────────────────────────────┤
│ Status Bar                             │
└────────────────────────────────────────┘
```

**Win32 Splitter Implementation:**

```cpp
class MainFrame : public CFrameWindowImpl<MainFrame> {
    CHorSplitterWindow m_horzSplit;    // Horizontal split (output | sidebar)
    CVertSplitterWindow m_vertSplit;   // Vertical split (main / input+status)

    LRESULT OnCreate(LPCREATESTRUCT) {
        m_vertSplit.Create(m_hWnd);
        m_horzSplit.Create(m_vertSplit);

        // Top pane: output + sidebar
        m_output.Create(m_horzSplit);
        m_sidebar.Create(m_horzSplit);
        m_horzSplit.SetSplitterPanes(m_output, m_sidebar);
        m_horzSplit.SetSplitterPos(800);  // 800px for output, rest for sidebar

        // Bottom pane: input + status (container)
        m_inputContainer.Create(m_vertSplit);
        m_vertSplit.SetSplitterPanes(m_horzSplit, m_inputContainer);
        m_vertSplit.SetSplitterPos(-90);  // Negative = from bottom

        return 0;
    }

    void ToggleSidebar() {
        if (m_sidebarVisible) {
            m_sidebar.ShowWindow(SW_HIDE);
            m_horzSplit.SetSinglePaneMode(SPLIT_PANE_LEFT);
        } else {
            m_sidebar.ShowWindow(SW_SHOW);
            m_horzSplit.SetSplitterPanes(m_output, m_sidebar);
        }
        m_sidebarVisible = !m_sidebarVisible;
    }
};
```

### 4.2 Sidebar Tab System

**Current:** Custom `Tabs` component with keyboard navigation

**File:** `src/components/tabs.tsx:69-95`

```typescript
<div role="tablist">
  <button role="tab" aria-selected={selected} onClick={...}>
    {tab.label}
  </button>
</div>
<div role="tabpanel" hidden={!selected}>
  {tab.content}
</div>
```

**Keyboard Navigation:**
- Arrow Left/Right: Switch tabs
- Home/End: First/last tab
- Ctrl+1-9: Direct tab selection (app-level)

**Win32 CTabCtrl:**

```cpp
class SidebarWindow : public CWindowImpl<SidebarWindow> {
    CTabCtrl m_tabs;
    enum TabIndex { ROOM, INVENTORY, USERS, MIDI, FILES, AUDIO };
    std::array<CWindow, 6> m_pages;

    LRESULT OnCreate(LPCREATESTRUCT) {
        m_tabs.Create(m_hWnd, rcDefault, NULL,
                     WS_CHILD | WS_VISIBLE | TCS_TABS);

        m_tabs.InsertItem(ROOM, L"Room");
        m_tabs.InsertItem(INVENTORY, L"Inventory");
        m_tabs.InsertItem(USERS, L"Users");
        // ... etc

        // Create page windows
        m_pages[ROOM] = CreateRoomPage(m_hWnd);
        // ... etc

        ShowPage(0);
        return 0;
    }

    LRESULT OnTabChange(int, LPNMHDR, BOOL&) {
        int sel = m_tabs.GetCurSel();
        ShowPage(sel);
        return 0;
    }

    void ShowPage(int index) {
        for (int i = 0; i < m_pages.size(); ++i) {
            m_pages[i].ShowWindow(i == index ? SW_SHOW : SW_HIDE);
        }
    }
};
```

**Conditional Tabs:** Some tabs only appear when data is available

```cpp
void UpdateTabVisibility() {
    if (!client->HasRoomData() && m_tabs.GetItemCount() > ROOM) {
        m_tabs.DeleteItem(ROOM);
    } else if (client->HasRoomData() && m_tabs.GetItemCount() <= ROOM) {
        m_tabs.InsertItem(ROOM, L"Room");
    }
    // Similar for Inventory, etc.
}
```

### 4.3 Resizing Behavior

**CSS Grid:** Automatically adjusts to viewport

**Win32 Considerations:**
- **Minimum Window Size:** 800x600 (enforce in WM_GETMINMAXINFO)
- **Splitter Constraints:**
  - Output min width: 400px
  - Sidebar min width: 250px, max 400px
  - Input min height: 60px
- **DPI Awareness:** Use `EnableNonClientDpiScaling`, scale all sizes by DPI factor

```cpp
LRESULT OnGetMinMaxInfo(MINMAXINFO* mmi) {
    mmi->ptMinTrackSize.x = 800;
    mmi->ptMinTrackSize.y = 600;
    return 0;
}

void AdjustForDPI() {
    int dpi = GetDpiForWindow(m_hWnd);
    float scale = dpi / 96.0f;

    int toolbarHeight = static_cast<int>(40 * scale);
    int inputHeight = static_cast<int>(60 * scale);
    // ... scale all sizes
}
```

---

## 5. Theming and Colors

### 5.1 CSS Variables (Custom Properties)

**File:** `src/App.css:1-9`

```css
:root {
  --sidebar-width: clamp(250px, 25vw, 300px);
  --spacing-unit: 1rem;
  --border-radius: 5px;
  --font-family-mono: Monaco, Consolas, "Liberation Mono", "Courier New";
  --color-bg: #f5f5f5;        /* Light gray app background */
  --color-text: #333;         /* Dark gray text */
  --color-border: #ccc;       /* Light gray borders */
}
```

### 5.2 Color Scheme

**Terminal (Output/Input):**
- Background: `#000000` (black)
- Text: `#ffffff` (white)
- System info: `#87ceeb` (sky blue)
- Errors: `#ff6347` (tomato red)
- Exit links: `orange` (#ffa500)

**UI Chrome:**
- Toolbar background: `#2c3e50` (dark blue-gray)
- Statusbar background: `#333` (dark gray)
- App background: `#f5f5f5` (light gray)
- Buttons: `#3498db` → `#2980b9` (hover)
- Send button: `#4caf50` → `#45a049` (hover)
- Focus indicator: `#4caf50` (green)

**Win32 Color Definitions:**

```cpp
struct AppColors {
    // Terminal
    COLORREF terminalBg = RGB(0, 0, 0);
    COLORREF terminalText = RGB(255, 255, 255);
    COLORREF systemInfo = RGB(135, 206, 235);
    COLORREF errorMsg = RGB(255, 99, 71);
    COLORREF exitLink = RGB(255, 165, 0);

    // UI Chrome
    COLORREF toolbarBg = RGB(44, 62, 80);
    COLORREF statusbarBg = RGB(51, 51, 51);
    COLORREF appBg = RGB(245, 245, 245);
    COLORREF buttonNormal = RGB(52, 152, 219);
    COLORREF buttonHover = RGB(41, 128, 185);
    COLORREF sendButton = RGB(76, 175, 80);
    COLORREF focusOutline = RGB(76, 175, 80);

    // Borders
    COLORREF border = RGB(204, 204, 204);
};

// Custom window background
LRESULT OnEraseBkgnd(HDC hdc) {
    RECT rc;
    GetClientRect(&rc);
    HBRUSH brush = CreateSolidBrush(RGB(245, 245, 245));
    FillRect(hdc, &rc, brush);
    DeleteObject(brush);
    return 1;
}
```

### 5.3 No Dark Mode Toggle

**Current State:** Hardcoded colors, no theme switching

**Win32 Recommendation:** Add theme support from start

```cpp
enum class Theme { Light, Dark, System };

class ThemeManager {
    Theme m_theme = Theme::System;

    AppColors GetColors() {
        switch (m_theme) {
            case Theme::Dark:
                return DarkTheme();
            case Theme::Light:
                return LightTheme();
            case Theme::System:
                return IsSystemDarkMode() ? DarkTheme() : LightTheme();
        }
    }

    bool IsSystemDarkMode() {
        // Query Windows 10+ dark mode setting
        DWORD value = 0;
        DWORD size = sizeof(value);
        RegGetValue(HKEY_CURRENT_USER,
                   L"Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize",
                   L"AppsUseLightTheme",
                   RRF_RT_DWORD, NULL, &value, &size);
        return value == 0;  // 0 = dark, 1 = light
    }
};
```

---

## 6. Rich Text Requirements

### 6.1 Text Rendering Features Needed

**ANSI Color Support:**
- Foreground/background colors (RGB)
- Bold, italic, underline, strikethrough
- Monospace font required

**HTML Support:**
- Basic tags: `<p>`, `<b>`, `<i>`, `<a>`, `<blockquote>`
- Sanitization (strip `<script>`, `<iframe>`, etc.)
- Special blockquote styling (border, copy button)

**URL Auto-linking:**
- Detect URLs and emails in ANSI text
- Make clickable (opens browser)
- Custom exit links: `@[exit:north]North@[/]`

**Text Selection:**
- Native text selection support
- Copy to clipboard (Ctrl+C)
- Copy entire log (button)

### 6.2 Win32 Rich Text Options

**Option 1: RichEdit Control (Recommended for v1)**

**Pros:**
- Built-in Windows control (no external dependencies)
- Supports RTF streaming (colors, bold, italic)
- Native text selection and clipboard
- Supports hyperlinks (with EN_LINK notification)

**Cons:**
- RTF conversion overhead
- Limited styling flexibility
- Scrolling performance with large buffers

**Implementation:**
```cpp
// Convert ANSI line to RTF
std::string LineToRTF(const StyledLine& line) {
    std::ostringstream rtf;
    rtf << "{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Consolas;}}";
    rtf << "{\\colortbl;\\red255\\green255\\blue255;...}";  // Build color table

    for (const auto& span : line.spans) {
        rtf << "\\cf" << span.colorIndex << " ";
        if (span.bold) rtf << "\\b ";
        if (span.italic) rtf << "\\i ";
        rtf << span.text << "\\cf0\\b0\\i0 ";
    }
    rtf << "}";
    return rtf.str();
}

void AppendRTFLine(HWND richedit, const std::string& rtf) {
    SETTEXTEX st = { ST_SELECTION, CP_ACP };
    SendMessage(richedit, EM_SETTEXTEX, (WPARAM)&st, (LPARAM)rtf.c_str());
}
```

**Option 2: Direct2D Custom Rendering (Best Performance)**

**Pros:**
- Full control over rendering
- GPU-accelerated (if using D2D1)
- Efficient for large scrollback buffers
- Custom selection highlighting

**Cons:**
- More complex implementation
- Must implement text selection, clipboard, scrolling manually
- Requires Windows 7+ (DirectWrite)

**Implementation:**
```cpp
class Direct2DTextRenderer {
    ID2D1HwndRenderTarget* m_rt;
    IDWriteTextFormat* m_textFormat;
    std::vector<StyledLine> m_lines;

    void OnPaint() {
        m_rt->BeginDraw();
        m_rt->Clear(D2D1::ColorF(0, 0, 0));  // Black background

        float y = 0;
        for (size_t i = m_scrollPos; i < visibleEnd; ++i) {
            RenderLine(m_lines[i], y);
            y += m_lineHeight;
        }

        m_rt->EndDraw();
    }

    void RenderLine(const StyledLine& line, float y) {
        float x = 0;
        for (const auto& span : line.spans) {
            ID2D1SolidColorBrush* brush;
            m_rt->CreateSolidColorBrush(D2D1::ColorF(span.color), &brush);

            IDWriteTextLayout* layout;
            m_dwriteFactory->CreateTextLayout(
                span.text.c_str(), span.text.length(),
                m_textFormat, 1000, 50, &layout);

            if (span.bold) {
                DWRITE_TEXT_RANGE range = { 0, span.text.length() };
                layout->SetFontWeight(DWRITE_FONT_WEIGHT_BOLD, range);
            }

            m_rt->DrawTextLayout(D2D1::Point2F(x, y), layout, brush);

            // Get text width for next span
            DWRITE_TEXT_METRICS metrics;
            layout->GetMetrics(&metrics);
            x += metrics.width;

            layout->Release();
            brush->Release();
        }
    }
};
```

**Recommendation:** Start with **RichEdit** for rapid prototyping, migrate to **Direct2D** if performance becomes an issue (>1000 lines visible).

### 6.3 Hyperlink Handling

**React:** Click handlers on `<a>` elements

**Win32 RichEdit:** EN_LINK notification

```cpp
LRESULT OnNotify(int id, LPNMHDR pnmh) {
    if (pnmh->code == EN_LINK) {
        ENLINK* link = (ENLINK*)pnmh;
        if (link->msg == WM_LBUTTONUP) {
            // Get link text
            TEXTRANGE tr;
            tr.chrg = link->chrg;
            wchar_t url[512];
            tr.lpstrText = url;
            SendMessage(m_richEdit, EM_GETTEXTRANGE, 0, (LPARAM)&tr);

            // Open in browser or handle exit link
            if (wcsstr(url, L"exit:")) {
                HandleExitClick(url);
            } else {
                ShellExecute(NULL, L"open", url, NULL, NULL, SW_SHOWNORMAL);
            }
        }
    }
    return 0;
}

void InsertHyperlink(HWND re, const wchar_t* text, const wchar_t* url) {
    // Insert text with CFE_LINK format
    CHARFORMAT2 cf = {};
    cf.cbSize = sizeof(cf);
    cf.dwMask = CFM_LINK | CFM_COLOR | CFM_UNDERLINE;
    cf.dwEffects = CFE_LINK | CFE_UNDERLINE;
    cf.crTextColor = RGB(255, 165, 0);  // Orange
    SendMessage(re, EM_SETCHARFORMAT, SCF_SELECTION, (LPARAM)&cf);
    SendMessage(re, EM_REPLACESEL, FALSE, (LPARAM)text);
}
```

---

## 7. Win32 Port Strategy

### 7.1 Phase 1: Basic Terminal (Minimal Viable Product)

**Goal:** Get text in/out working with basic ANSI colors

**Components:**
1. Main window with toolbar, output, input, statusbar
2. RichEdit output window (RTF-based ANSI rendering)
3. RichEdit input control (history + enter to send)
4. Connection handling (reuse existing TelnetParser/MudClient C++ code)

**Omit for Phase 1:**
- Sidebar (Room/Inventory tabs)
- HTML rendering
- Virtualization (RichEdit handles scrollback)
- Advanced features (MIDI, file transfer, audio chat)

**Estimated Effort:** 2-3 weeks

### 7.2 Phase 2: UI Polish

**Add:**
- Sidebar with Room, Inventory, Users tabs
- Preferences dialog (CPropertySheet)
- Toolbar icons and proper styling
- Theming support (light/dark)
- Persistent window layout (save splitter positions, window size)

**Estimated Effort:** 2-3 weeks

### 7.3 Phase 3: Performance Optimization

**Add:**
- Direct2D text rendering (if RichEdit is slow)
- Virtual list for output (owner-draw)
- Efficient ANSI parsing (C++ port of anser logic)

**Estimated Effort:** 1-2 weeks

### 7.4 Phase 4: Advanced Features

**Add:**
- HTML rendering (WebView2 or MSHTML)
- File transfer UI
- MIDI support
- Audio chat (platform-dependent)

**Estimated Effort:** 3-4 weeks

---

## 8. Critical Win32 Challenges

### 8.1 Text Rendering Performance

**Challenge:** 7500 lines of styled text with frequent updates

**React Solution:** Virtuoso only renders visible ~50 lines

**Win32 Solutions:**
1. **RichEdit with streaming:** Append new lines, let RichEdit handle scrollback
2. **Owner-draw ListBox:** Virtual mode, only paint visible items
3. **Custom Direct2D:** Full control, best performance

**Recommendation:** RichEdit initially, Direct2D if needed.

### 8.2 ANSI Color Conversion

**Challenge:** Convert ANSI escape codes to Win32 text attributes

**Options:**
1. **RTF Generation:** Build RTF color table, stream formatted text
2. **CHARFORMAT2 Ranges:** Apply formatting per-span in RichEdit
3. **Direct2D Brushes:** Create brushes for each color, draw manually

**Prototype RTF Converter:**
```cpp
class AnsiToRTFConverter {
    std::unordered_map<uint32_t, int> m_colorTable;  // RGB -> color index
    std::ostringstream m_rtf;

    std::string Convert(const std::string& ansiText) {
        m_rtf.str("");
        m_colorTable.clear();

        // RTF header
        m_rtf << "{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0\\fmodern Consolas;}}";

        // Parse ANSI with state machine
        AnsiParser parser(ansiText);
        while (parser.HasNext()) {
            auto span = parser.NextSpan();  // {text, fg, bg, bold, italic}

            int fgIndex = AddColor(span.fg);
            int bgIndex = AddColor(span.bg);

            m_rtf << "\\cf" << fgIndex;
            if (bgIndex) m_rtf << "\\cb" << bgIndex;
            if (span.bold) m_rtf << "\\b";
            if (span.italic) m_rtf << "\\i";
            if (span.underline) m_rtf << "\\ul";

            m_rtf << " " << EscapeRTF(span.text);
            m_rtf << "\\cf0\\cb0\\b0\\i0\\ul0 ";  // Reset
        }

        m_rtf << "}";
        return m_rtf.str();
    }
};
```

### 8.3 Smooth Scrolling and Auto-scroll

**Challenge:** Auto-scroll to bottom on new messages, unless user scrolled up

**React:** `Virtuoso.followOutput = "smooth"`

**Win32 RichEdit:**
```cpp
class OutputWindow {
    bool m_autoScroll = true;

    void AppendLine(const std::string& rtf) {
        // Check if at bottom before adding
        SCROLLINFO si = { sizeof(si), SIF_RANGE | SIF_PAGE | SIF_POS };
        GetScrollInfo(m_hWnd, SB_VERT, &si);
        bool atBottom = (si.nPos >= si.nMax - (int)si.nPage - 10);

        // Append text
        SendMessage(m_richEdit, EM_SETSEL, -1, -1);
        SETTEXTEX st = { ST_SELECTION, CP_ACP };
        SendMessage(m_richEdit, EM_SETTEXTEX, (WPARAM)&st, (LPARAM)rtf.c_str());

        // Scroll to bottom if was at bottom or autoScroll enabled
        if (atBottom || m_autoScroll) {
            SendMessage(m_richEdit, WM_VSCROLL, SB_BOTTOM, 0);
        }
    }

    LRESULT OnVScroll(WPARAM wParam, LPARAM) {
        // Disable auto-scroll if user manually scrolls up
        if (LOWORD(wParam) == SB_LINEUP || LOWORD(wParam) == SB_PAGEUP) {
            m_autoScroll = false;
        }
        // Re-enable if scrolled to bottom
        if (IsAtBottom()) {
            m_autoScroll = true;
        }
        return DefWindowProc();
    }
};
```

### 8.4 "New Messages" Notification

**React:** Floating orange button showing count

**Win32:** Status bar pane or overlay window

```cpp
void ShowNewMessageIndicator(int count) {
    std::wstring text = std::to_wstring(count) + L" new messages";
    m_statusbar.SetText(2, text.c_str(), SBT_POPOUT);
    m_statusbar.SetBkColor(RGB(255, 165, 0));  // Orange background
}

void OnScrollToBottom() {
    m_statusbar.SetText(2, L"", 0);
    m_newMessageCount = 0;
}
```

---

## 9. GDI vs. Direct2D Trade-offs

### 9.1 GDI (Legacy Graphics)

**Pros:**
- Available on all Windows versions (XP+)
- Simple API (`TextOut`, `DrawText`, `SetTextColor`)
- Good for simple monochrome or limited-color text

**Cons:**
- CPU-based rendering (slow for complex scenes)
- No anti-aliasing by default (ClearType requires manual setup)
- Limited to 256 colors per palette in some modes

**Use Case:** Initial prototype or Windows XP compatibility required.

### 9.2 Direct2D + DirectWrite (Modern Graphics)

**Pros:**
- GPU-accelerated (smooth scrolling, fast updates)
- High-quality text rendering (ClearType built-in)
- Supports full RGB color (16.7 million colors)
- Efficient for complex styled text

**Cons:**
- Requires Windows 7+ (Vista with Platform Update)
- More complex API (COM interfaces, setup overhead)
- Steeper learning curve

**Use Case:** Production-quality client with best performance.

### 9.3 Recommendation

**Start:** RichEdit control (uses GDI internally, simple API)
**If slow:** Migrate to Direct2D custom renderer

**Hybrid Approach:**
- Use RichEdit for input control (built-in editing features)
- Use Direct2D for output window (performance-critical)

---

## 10. Summary and Recommendations

### 10.1 High-Priority Items

1. **Output Rendering:**
   - Use RichEdit20W control initially
   - Convert ANSI to RTF for color support
   - Implement 7500-line scrollback buffer
   - Auto-scroll to bottom (unless user scrolled up)

2. **Input Control:**
   - RichEdit20W with custom Enter key handling
   - Command history (1000 max, saved to disk)
   - Tab completion for player names
   - Persistent history across sessions

3. **Layout:**
   - Main window with toolbar, output, input, statusbar
   - Optional sidebar (toggle button)
   - Resizable splitters (save/restore positions)

4. **Colors and Theming:**
   - Black background, white text for terminal
   - Support Windows dark mode detection
   - Configurable color scheme (preferences)

### 10.2 Medium-Priority Items

5. **Sidebar Tabs:**
   - CTabCtrl with Room, Inventory, Users pages
   - Conditionally show tabs when data available
   - Keyboard shortcuts (Ctrl+1-9)

6. **Preferences Dialog:**
   - CPropertySheet with multiple pages
   - Local echo, font size, colors, TTS settings
   - Save to registry or JSON config file

7. **Hyperlinks:**
   - RichEdit EN_LINK for clickable URLs
   - Custom exit links (@[exit:north]North@[/])
   - Open URLs in default browser

### 10.3 Low-Priority / Future Items

8. **HTML Rendering:**
   - WebView2 for rich HTML content
   - Fallback to simple HTML parsing (strip tags)

9. **Performance Optimization:**
   - Direct2D renderer if RichEdit is slow
   - Virtual list for massive scrollback

10. **Advanced Features:**
    - MIDI playback (Windows Multimedia API)
    - File transfer UI (progress bars, dialogs)
    - Audio chat (Windows Audio Session API or third-party SDK)

### 10.4 Key Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **RichEdit performance** | High | Prototype early, measure FPS, have Direct2D backup plan |
| **ANSI parsing complexity** | Medium | Port anser library logic to C++, unit test thoroughly |
| **HTML rendering** | Medium | Use WebView2 (available Windows 10+), graceful fallback |
| **DPI scaling issues** | Medium | Test on 4K displays, use EnableNonClientDpiScaling |
| **Window layout complexity** | Low | Use WTL splitters, save/restore positions to registry |

---

## 11. Code Reuse from React Client

### 11.1 Logic to Port (C++ Classes)

**Already in C++:**
- TelnetParser (telnet protocol handling)
- MudClient (connection, GMCP, events)
- GMCP packages (Room, Char, Comm, etc.)
- MCP packages (Userlist, Editor, etc.)

**Need to Port from TypeScript:**
- AnsiParser (convert anser library logic)
- Command history management
- Preferences storage (TypeScript → C++ JSON)
- Output line storage format

### 11.2 UI-Specific New Code

**Pure Win32 Code (No React Equivalent):**
- Window creation and management (CWindowImpl)
- Control creation (RichEdit, buttons, tabs)
- Message loop (WM_COMMAND, WM_NOTIFY, etc.)
- RTF generation for ANSI text
- Direct2D rendering (if implemented)
- Registry/file-based preferences
- Splitter windows and layout management

---

## 12. Development Roadmap

### 12.1 Milestone 1: Proof of Concept (Week 1-2)

**Deliverables:**
- Main window with output and input controls
- Connect to MUD server (reuse existing C++ client code)
- Display raw text in RichEdit output
- Send commands from input control
- No styling, no ANSI parsing yet

**Success Criteria:** Can connect, see text, type commands.

### 12.2 Milestone 2: ANSI Rendering (Week 3-4)

**Deliverables:**
- ANSI parser (C++ port of anser)
- RTF converter for colored text
- Styled output in RichEdit (colors, bold)
- Scrollback buffer (7500 lines)
- Auto-scroll behavior

**Success Criteria:** Colored MUD output renders correctly.

### 12.3 Milestone 3: Full UI (Week 5-8)

**Deliverables:**
- Toolbar with buttons (save, clear, prefs, connect)
- Statusbar with vitals (HP, MP)
- Sidebar with tabs (Room, Inventory, Users)
- Preferences dialog (basic settings)
- Command history and tab completion

**Success Criteria:** Feature parity with core React client.

### 12.4 Milestone 4: Polish (Week 9-12)

**Deliverables:**
- Dark mode support
- Window layout persistence
- Hyperlinks (clickable URLs, exit links)
- HTML rendering (WebView2 or basic parser)
- Performance optimization (if needed)

**Success Criteria:** Production-ready Win32 client.

---

## 13. Files Referenced

### React Client Files Analyzed
- `src/components/output.tsx` (728 lines) - Terminal output
- `src/components/output.css` (141 lines) - Output styling
- `src/components/input.tsx` (248 lines) - Command input
- `src/components/input.css` (62 lines) - Input styling
- `src/App.tsx` (314 lines) - Main layout
- `src/App.css` (224 lines) - Grid layout, theme variables
- `src/ansiParser.tsx` (138 lines) - ANSI to React elements
- `src/components/sidebar.tsx` (207 lines) - Sidebar tabs
- `src/components/toolbar.tsx` (136 lines) - Toolbar buttons
- `src/components/statusbar.tsx` (89 lines) - Status bar
- `src/components/preferences.tsx` (380 lines) - Settings dialog

**Total Lines Analyzed:** ~2,600 lines of UI code

---

**End of Report**
