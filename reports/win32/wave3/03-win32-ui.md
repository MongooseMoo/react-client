# Win32 UI Component Mapping Report

**Date**: 2025-12-17
**Wave**: 3 (UI Architecture)
**Purpose**: Map React components to Win32 native UI controls and define rendering strategies

---

## Executive Summary

This React MUD client uses a **CSS Grid layout** with **component-based architecture**, **ANSI color rendering**, and **accessibility features**. The Win32 port requires translating React components into native Windows controls while preserving:

1. **Terminal output** with ANSI color support (7500-line scrollback)
2. **Multi-line input** with command history (1000 entries)
3. **Sidebar tabs** (Room, Inventory, Users, MIDI, Files, Audio)
4. **Preferences dialog** with multiple categories
5. **Accessibility** (keyboard navigation, screen reader support)

**Key Challenge**: The output window does NOT use virtualization (contrary to Wave 1 claims). Current implementation renders all 7500 lines using standard React `.map()`, limiting performance. Win32 port must implement efficient virtual rendering.

**Critical Win32 Design Decisions**:
- **Output Control**: RichEdit (Phase 1) → Direct2D custom control (Phase 2)
- **ANSI Processing**: Port `anser` library logic to C++, convert to RTF or styled spans
- **Layout**: WTL splitter windows (resizable sidebar)
- **Accessibility**: UI Automation Provider for screen reader support

---

## 1. Component-to-Control Mapping Table

### 1.1 Primary Components

| React Component | Win32 Control | Class/API | Notes |
|----------------|---------------|-----------|-------|
| **OutputWindow** | RichEdit 5.0 or Custom | `RICHEDIT50W` / Direct2D | 7500-line buffer, ANSI rendering, auto-scroll |
| **CommandInput** | RichEdit 5.0 | `RICHEDIT50W` (multiline) | Command history, Tab completion, Enter to send |
| **Toolbar** | Rebar + ToolBar | `CReBarCtrl` + `CToolBarCtrl` | 7 buttons + volume slider + checkbox |
| **Sidebar** | Tab Control + Pages | `CTabCtrl` + child windows | 6 conditional tabs (Room, Inventory, etc.) |
| **Statusbar** | Status Bar | `CStatusBarCtrl` | 2-3 panes (connection, vitals, ping) |
| **PreferencesDialog** | Property Sheet | `CPropertySheetImpl` | 5+ pages (General, Speech, Sound, MIDI, Editor) |
| **Room Info** | List Control | `CListCtrl` (Report view) | Exits, players, items in room |
| **Inventory** | List View | `CListViewCtrl` | Icons + details, context menu |
| **Userlist** | List Box | `CListBox` (Owner-draw) | Player names with status icons |
| **File Transfer** | Dialog + Progress | Custom dialog | Progress bars, history list |
| **Audio Chat** | Custom Control | WebView2 or native | LiveKit participant list |

### 1.2 Secondary Components

| React Component | Win32 Control | Purpose |
|----------------|---------------|---------|
| **Tabs (generic)** | `CTabCtrl` | Sidebar, Preferences |
| **AccessibleList** | `CListBox` with ARIA | Keyboard-navigable lists |
| **BlockquoteWithCopy** | RichEdit + Button | HTML blockquotes with copy button |
| **PlayerCard** | Custom draw | Player info tooltip |
| **ItemCard** | Custom draw | Item inspection tooltip |
| **MidiStatus** | Static text + icons | MIDI device connection status |

---

## 2. Output Window Design

### 2.1 Current React Implementation

**File**: `src/components/output.tsx` (587 lines)

**Architecture**:
- Class-based React component (not functional)
- Stores output as `OutputLine[]` array (max 7500)
- **No virtualization** - renders all lines with `.map()`
- Auto-scroll when at bottom (disabled when user scrolls up)
- Persists to localStorage with versioned schema (v2)

**Data Structure**:
```typescript
interface OutputLine {
  id: number;              // Unique key for React
  type: OutputType;        // Command, ServerMessage, SystemInfo, ErrorMessage
  content: JSX.Element;    // Rendered React element
  sourceType: string;      // 'ansi' | 'html' | 'command' | 'system' | 'error'
  sourceContent: string;   // Raw source for persistence
  metadata?: Record<string, any>;
}
```

**Rendering Flow**:
1. Telnet parser → ANSI text
2. `parseToElements()` (ansiParser.tsx) → React elements with styled spans
3. Append to `output[]` array
4. Trim to 7500 if exceeded
5. Render all visible lines (filtered by local echo preference)

### 2.2 Win32 Implementation Options

#### Option A: RichEdit Control (Recommended for Phase 1)

**Pros**:
- Built-in Windows control (no dependencies)
- RTF streaming for colors/bold/italic
- Native text selection and clipboard
- Hyperlink support (EN_LINK notification)
- Handles scrolling automatically

**Cons**:
- RTF conversion overhead per line
- Performance degrades with 7500+ styled lines
- Limited custom rendering flexibility

**Implementation**:
```cpp
class OutputWindow : public CWindowImpl<OutputWindow> {
    CRichEditCtrl m_richEdit;
    std::deque<OutputLine> m_buffer;  // Max 7500
    bool m_autoScroll = true;

    struct OutputLine {
        OutputType type;
        std::wstring sourceContent;
        std::string sourceType;  // 'ansi', 'html', 'command', 'system', 'error'
        std::optional<nlohmann::json> metadata;
    };

    void AppendLine(const OutputLine& line) {
        // Convert ANSI to RTF
        std::string rtf = AnsiToRTF(line.sourceContent);

        // Check if at bottom before adding
        bool atBottom = IsAtBottom();

        // Append to RichEdit
        m_richEdit.SetSel(-1, -1);
        SETTEXTEX st = { ST_SELECTION | ST_KEEPUNDO, CP_UTF8 };
        m_richEdit.SendMessage(EM_SETTEXTEX, (WPARAM)&st, (LPARAM)rtf.c_str());

        // Scroll to bottom if needed
        if (atBottom || m_autoScroll) {
            m_richEdit.SendMessage(WM_VSCROLL, SB_BOTTOM, 0);
        }

        // Trim buffer
        m_buffer.push_back(line);
        if (m_buffer.size() > 7500) {
            m_buffer.pop_front();
            // NOTE: RichEdit keeps all text - need to manually trim front
        }
    }

    bool IsAtBottom() {
        SCROLLINFO si = { sizeof(si), SIF_RANGE | SIF_PAGE | SIF_POS };
        m_richEdit.GetScrollInfo(SB_VERT, &si);
        return (si.nPos >= si.nMax - (int)si.nPage - 10);
    }
};
```

**ANSI to RTF Converter**:
```cpp
class AnsiToRTFConverter {
    std::unordered_map<uint32_t, int> m_colorTable;

    std::string Convert(const std::wstring& ansiText) {
        std::ostringstream rtf;
        rtf << "{\\rtf1\\ansi\\deff0";
        rtf << "{\\fonttbl{\\f0\\fmodern Consolas;}}";

        // Parse ANSI with state machine (port anser library)
        AnsiParser parser(ansiText);
        std::ostringstream colorTable;
        colorTable << "{\\colortbl;";

        int colorIndex = 1;
        while (parser.HasNext()) {
            auto span = parser.NextSpan();  // {text, fg, bg, bold, italic, underline}

            // Add colors to table
            int fgIdx = AddColor(colorTable, span.fgColor, colorIndex);
            int bgIdx = span.bgColor ? AddColor(colorTable, *span.bgColor, colorIndex) : 0;

            // Output styled text
            rtf << "\\cf" << fgIdx;
            if (bgIdx) rtf << "\\cb" << bgIdx;
            if (span.bold) rtf << "\\b";
            if (span.italic) rtf << "\\i";
            if (span.underline) rtf << "\\ul";

            rtf << " " << EscapeRTF(span.text);
            rtf << "\\cf0\\cb0\\b0\\i0\\ul0 ";  // Reset
        }

        colorTable << "}";
        return "{\\rtf1\\ansi" + colorTable.str() + rtf.str() + "}";
    }

    int AddColor(std::ostringstream& table, COLORREF color, int& index) {
        if (m_colorTable.count(color)) return m_colorTable[color];
        table << "\\red" << GetRValue(color)
              << "\\green" << GetGValue(color)
              << "\\blue" << GetBValue(color) << ";";
        m_colorTable[color] = index;
        return index++;
    }
};
```

#### Option B: Direct2D Custom Control (Best Performance)

**Pros**:
- Full rendering control
- GPU-accelerated (if hardware rendering)
- Efficient for 7500+ lines (only render visible)
- Custom selection, hyperlinks, animations

**Cons**:
- Complex implementation (500+ lines)
- Must implement text selection, clipboard, scrolling manually
- Requires Windows 7+ (DirectWrite for text layout)

**Implementation**:
```cpp
class Direct2DOutputWindow : public CWindowImpl<Direct2DOutputWindow> {
    ID2D1HwndRenderTarget* m_renderTarget;
    IDWriteTextFormat* m_textFormat;
    std::deque<StyledLine> m_lines;  // Max 7500

    int m_scrollPos = 0;       // Current scroll line
    int m_visibleLines = 0;    // Lines fitting in viewport
    float m_lineHeight = 18.0f;

    struct StyledSpan {
        std::wstring text;
        COLORREF fgColor;
        std::optional<COLORREF> bgColor;
        bool bold;
        bool italic;
        bool underline;
    };

    struct StyledLine {
        std::vector<StyledSpan> spans;
        OutputType type;
    };

    void OnPaint(CDCHandle dc) {
        m_renderTarget->BeginDraw();
        m_renderTarget->Clear(D2D1::ColorF(0.0f, 0.0f, 0.0f));  // Black

        int startLine = m_scrollPos;
        int endLine = std::min(startLine + m_visibleLines + 2, (int)m_lines.size());

        float y = 0;
        for (int i = startLine; i < endLine; ++i) {
            RenderLine(m_lines[i], y);
            y += m_lineHeight;
        }

        m_renderTarget->EndDraw();
    }

    void RenderLine(const StyledLine& line, float y) {
        float x = 0;
        for (const auto& span : line.spans) {
            // Create brush
            auto color = D2D1::ColorF(
                GetRValue(span.fgColor) / 255.0f,
                GetGValue(span.fgColor) / 255.0f,
                GetBValue(span.fgColor) / 255.0f
            );
            wil::com_ptr<ID2D1SolidColorBrush> brush;
            m_renderTarget->CreateSolidColorBrush(color, &brush);

            // Draw background if present
            if (span.bgColor) {
                // Calculate text width, draw rect
            }

            // Create text layout
            wil::com_ptr<IDWriteTextLayout> layout;
            m_dwriteFactory->CreateTextLayout(
                span.text.c_str(),
                (UINT32)span.text.length(),
                m_textFormat,
                1000.0f,  // Max width
                50.0f,    // Max height
                &layout
            );

            // Apply bold/italic
            if (span.bold) {
                DWRITE_TEXT_RANGE range = { 0, (UINT32)span.text.length() };
                layout->SetFontWeight(DWRITE_FONT_WEIGHT_BOLD, range);
            }
            if (span.italic) {
                DWRITE_TEXT_RANGE range = { 0, (UINT32)span.text.length() };
                layout->SetFontStyle(DWRITE_FONT_STYLE_ITALIC, range);
            }

            // Draw text
            m_renderTarget->DrawTextLayout(
                D2D1::Point2F(x, y),
                layout.get(),
                brush.get()
            );

            // Apply underline
            if (span.underline) {
                DWRITE_TEXT_METRICS metrics;
                layout->GetMetrics(&metrics);
                m_renderTarget->DrawLine(
                    D2D1::Point2F(x, y + metrics.height - 2),
                    D2D1::Point2F(x + metrics.width, y + metrics.height - 2),
                    brush.get()
                );
            }

            // Advance X
            DWRITE_TEXT_METRICS metrics;
            layout->GetMetrics(&metrics);
            x += metrics.width;
        }
    }

    LRESULT OnMouseWheel(UINT, WPARAM wParam, LPARAM lParam) {
        int delta = GET_WHEEL_DELTA_WPARAM(wParam);
        int linesToScroll = delta / WHEEL_DELTA * 3;  // 3 lines per wheel notch

        m_scrollPos = std::clamp(m_scrollPos - linesToScroll, 0,
                                 (int)m_lines.size() - m_visibleLines);

        UpdateScrollBar();
        Invalidate();
        return 0;
    }
};
```

### 2.3 Recommendation

**Phase 1 (MVP)**: Use **RichEdit** for speed of development. Acceptable performance for up to 5000 lines.

**Phase 2 (Optimization)**: If RichEdit shows lag (>100ms frame time), migrate to **Direct2D**.

**Hybrid Approach**: Use Direct2D for output, RichEdit for input (benefits from built-in editing features).

---

## 3. ANSI Rendering System

### 3.1 Current React Implementation

**Library**: `anser` v2.3.2 (NPM package)

**File**: `src/ansiParser.tsx` (138 lines)

**Process**:
1. Split text by `\r\n`
2. Parse each line with `Anser.ansiToJson(line)`
3. Convert to React `<span>` elements with inline styles
4. Detect URLs, emails, exit links → convert to `<a>` elements

**ANSI Features**:
- 8-bit, 256-color, and RGB colors (fg/bg)
- Bold, dim, italic, underline, strikethrough
- Hidden text, blink (rendered as regular)

**Example Output**:
```typescript
Anser.ansiToJson("\x1b[31mRed\x1b[0m text")
// → [{ content: "Red", fg: "255,0,0", bg: null, decoration: null }]
```

### 3.2 Win32 ANSI Parser

**Port anser library logic** to C++ state machine:

```cpp
struct AnsiSpan {
    std::wstring text;
    COLORREF fgColor = RGB(255, 255, 255);
    std::optional<COLORREF> bgColor;
    bool bold = false;
    bool italic = false;
    bool underline = false;
    bool strikethrough = false;
};

class AnsiParser {
public:
    std::vector<AnsiSpan> Parse(const std::wstring& ansiText) {
        std::vector<AnsiSpan> spans;
        AnsiSpan currentSpan;

        size_t i = 0;
        while (i < ansiText.length()) {
            if (ansiText[i] == L'\x1b' && i + 1 < ansiText.length() && ansiText[i+1] == L'[') {
                // Found escape sequence
                if (!currentSpan.text.empty()) {
                    spans.push_back(currentSpan);
                    currentSpan.text.clear();
                }

                i += 2;  // Skip ESC[
                std::vector<int> params = ParseParams(ansiText, i);
                ApplyParams(params, currentSpan);
            } else {
                currentSpan.text += ansiText[i++];
            }
        }

        if (!currentSpan.text.empty()) {
            spans.push_back(currentSpan);
        }

        return spans;
    }

private:
    std::vector<int> ParseParams(const std::wstring& text, size_t& pos) {
        std::vector<int> params;
        std::wstring num;

        while (pos < text.length()) {
            wchar_t ch = text[pos++];
            if (ch >= L'0' && ch <= L'9') {
                num += ch;
            } else if (ch == L';') {
                params.push_back(num.empty() ? 0 : std::stoi(num));
                num.clear();
            } else if (ch == L'm') {  // SGR terminator
                params.push_back(num.empty() ? 0 : std::stoi(num));
                break;
            } else {
                break;  // Unknown sequence
            }
        }

        return params;
    }

    void ApplyParams(const std::vector<int>& params, AnsiSpan& span) {
        for (size_t i = 0; i < params.size(); ++i) {
            int code = params[i];

            switch (code) {
                case 0:  // Reset
                    span.fgColor = RGB(255, 255, 255);
                    span.bgColor.reset();
                    span.bold = span.italic = span.underline = false;
                    break;
                case 1:  span.bold = true; break;
                case 3:  span.italic = true; break;
                case 4:  span.underline = true; break;
                case 22: span.bold = false; break;
                case 23: span.italic = false; break;
                case 24: span.underline = false; break;

                // 8-bit colors (30-37: fg, 40-47: bg)
                case 30: span.fgColor = RGB(0, 0, 0); break;      // Black
                case 31: span.fgColor = RGB(255, 0, 0); break;    // Red
                case 32: span.fgColor = RGB(0, 255, 0); break;    // Green
                case 33: span.fgColor = RGB(255, 255, 0); break;  // Yellow
                case 34: span.fgColor = RGB(0, 0, 255); break;    // Blue
                case 35: span.fgColor = RGB(255, 0, 255); break;  // Magenta
                case 36: span.fgColor = RGB(0, 255, 255); break;  // Cyan
                case 37: span.fgColor = RGB(255, 255, 255); break;// White

                case 40: span.bgColor = RGB(0, 0, 0); break;
                // ... similar for 41-47

                // 256-color and RGB (38;5;n or 38;2;r;g;b)
                case 38:
                    if (i + 2 < params.size() && params[i+1] == 5) {
                        span.fgColor = Palette256ToRGB(params[i+2]);
                        i += 2;
                    } else if (i + 4 < params.size() && params[i+1] == 2) {
                        span.fgColor = RGB(params[i+2], params[i+3], params[i+4]);
                        i += 4;
                    }
                    break;
                case 48:
                    if (i + 2 < params.size() && params[i+1] == 5) {
                        span.bgColor = Palette256ToRGB(params[i+2]);
                        i += 2;
                    } else if (i + 4 < params.size() && params[i+1] == 2) {
                        span.bgColor = RGB(params[i+2], params[i+3], params[i+4]);
                        i += 4;
                    }
                    break;
            }
        }
    }

    COLORREF Palette256ToRGB(int index) {
        // Convert 256-color palette index to RGB
        // See: https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit
        if (index < 16) {
            // Standard colors (same as 30-37, 90-97)
            static const COLORREF colors[16] = {
                RGB(0,0,0), RGB(128,0,0), RGB(0,128,0), RGB(128,128,0),
                RGB(0,0,128), RGB(128,0,128), RGB(0,128,128), RGB(192,192,192),
                RGB(128,128,128), RGB(255,0,0), RGB(0,255,0), RGB(255,255,0),
                RGB(0,0,255), RGB(255,0,255), RGB(0,255,255), RGB(255,255,255)
            };
            return colors[index];
        } else if (index >= 16 && index <= 231) {
            // 216-color cube (6x6x6)
            int i = index - 16;
            int r = (i / 36) * 51;
            int g = ((i / 6) % 6) * 51;
            int b = (i % 6) * 51;
            return RGB(r, g, b);
        } else {
            // Grayscale ramp (232-255)
            int gray = 8 + (index - 232) * 10;
            return RGB(gray, gray, gray);
        }
    }
};
```

### 3.3 URL and Exit Link Detection

**Current React**: Regex-based detection in `ansiParser.tsx`

**Patterns**:
- URLs: `/(https?:\/\/[^\s]+)/g`
- Emails: `/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g`
- Exit links: `/@\[exit:([a-zA-Z]+)\]([a-zA-Z]+)@\[\/\]/g` (custom MUD format)

**Win32 Implementation**:
```cpp
void DetectLinks(std::wstring& text, std::vector<Link>& links) {
    // URL regex
    std::wregex urlRegex(LR"((https?:\/\/[^\s]+))");
    std::wsregex_iterator it(text.begin(), text.end(), urlRegex);
    std::wsregex_iterator end;

    for (; it != end; ++it) {
        Link link;
        link.start = it->position();
        link.length = it->length();
        link.url = it->str();
        link.type = LinkType::URL;
        links.push_back(link);
    }

    // Exit links (MUD custom format)
    std::wregex exitRegex(LR"(@\[exit:([a-zA-Z]+)\]([a-zA-Z]+)@\[\/\])");
    // ... similar iteration
}

// RichEdit: Set CFE_LINK format for link ranges
void InsertHyperlink(CRichEditCtrl& edit, const std::wstring& text,
                     const std::wstring& url, LinkType type) {
    CHARFORMAT2 cf = {};
    cf.cbSize = sizeof(cf);
    cf.dwMask = CFM_LINK | CFM_COLOR | CFM_UNDERLINE;
    cf.dwEffects = CFE_LINK | CFE_UNDERLINE;
    cf.crTextColor = RGB(255, 165, 0);  // Orange for exit links

    edit.SetSel(-1, -1);
    edit.SetSelectionCharFormat(cf);
    edit.ReplaceSel(text.c_str());
}

// Handle EN_LINK notification
LRESULT OnNotify(int id, LPNMHDR pnmh) {
    if (pnmh->code == EN_LINK) {
        ENLINK* link = (ENLINK*)pnmh;
        if (link->msg == WM_LBUTTONUP) {
            TEXTRANGE tr;
            tr.chrg = link->chrg;
            wchar_t url[512];
            tr.lpstrText = url;
            m_richEdit.SendMessage(EM_GETTEXTRANGE, 0, (LPARAM)&tr);

            if (wcsstr(url, L"exit:")) {
                HandleExitClick(url);  // Send MUD command
            } else {
                ShellExecute(NULL, L"open", url, NULL, NULL, SW_SHOWNORMAL);
            }
        }
    }
    return 0;
}
```

---

## 4. Input Window Design

### 4.1 Current React Implementation

**File**: `src/components/input.tsx` (248 lines)

**Features**:
- Multi-line `<textarea>` (height: ~60px, 3 rows)
- Enter to send (Shift+Enter for newline)
- Up/Down arrow for command history (max 1000)
- Tab completion (player names from room)
- Send button (visible on mobile)
- Auto-focus on page load

**Command History**:
- Stored in localStorage (`command_history` key)
- Max 1000 entries
- Deduplication (don't store consecutive duplicates)
- Navigates with Up/Down, -1 index = current unsent input

### 4.2 Win32 Implementation

**Control**: `RichEdit 5.0` (multiline)

**Why RichEdit over Edit**:
- Supports unlimited text length (Edit limited to 64KB)
- Better Unicode support
- Can apply custom background color easily

**Implementation**:
```cpp
class CommandInputWindow : public CWindowImpl<CommandInputWindow> {
    CRichEditCtrl m_edit;
    CButton m_sendBtn;
    CommandHistory m_history;

    LRESULT OnCreate(LPCREATESTRUCT) {
        // Create RichEdit
        m_edit.Create(m_hWnd, rcDefault, NULL,
                     WS_CHILD | WS_VISIBLE | ES_MULTILINE | ES_WANTRETURN |
                     WS_VSCROLL | ES_AUTOVSCROLL,
                     WS_EX_CLIENTEDGE);

        // Set font
        CHARFORMAT2 cf = {};
        cf.cbSize = sizeof(cf);
        cf.dwMask = CFM_FACE | CFM_SIZE | CFM_COLOR;
        wcscpy_s(cf.szFaceName, L"Consolas");
        cf.yHeight = 14 * 20;  // 14pt in twips
        cf.crTextColor = RGB(255, 255, 255);
        m_edit.SetCharFormat(cf, SCF_ALL);

        // Set background
        m_edit.SetBackgroundColor(FALSE, RGB(0, 0, 0));

        // Create Send button
        m_sendBtn.Create(m_hWnd, rcDefault, L"Send",
                        WS_CHILD | WS_VISIBLE | BS_PUSHBUTTON);

        m_history.LoadFromDisk();
        return 0;
    }

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

    void SendCommand() {
        CString text;
        m_edit.GetWindowText(text);

        if (text.IsEmpty()) return;

        // Add to history
        m_history.Add(text);

        // Send to client
        m_client->Send(text);

        // Clear input
        m_edit.SetWindowText(L"");
        m_edit.SetFocus();
    }

    void NavigateHistory(int direction) {
        std::wstring text = m_history.Navigate(direction);
        m_edit.SetWindowText(text.c_str());

        // Move cursor to end
        m_edit.SetSel(-1, -1);
    }

    void TabComplete() {
        // Get current word at cursor
        int start, end;
        m_edit.GetSel(start, end);

        CString fullText;
        m_edit.GetWindowText(fullText);

        // Find word boundaries
        int wordStart = start;
        while (wordStart > 0 && !iswspace(fullText[wordStart - 1])) {
            wordStart--;
        }

        std::wstring partial = fullText.Mid(wordStart, start - wordStart);

        // Query client for matching player names
        auto players = m_client->GetRoomPlayers();
        for (const auto& player : players) {
            if (player.name.starts_with(partial)) {
                // Replace partial with full name
                m_edit.SetSel(wordStart, start);
                m_edit.ReplaceSel(player.name.c_str());
                return;
            }
        }
    }
};

class CommandHistory {
    std::deque<std::wstring> m_commands;
    int m_position = -1;  // -1 = current unsent input
    std::wstring m_currentInput;

    static constexpr size_t MAX_HISTORY = 1000;

    void Add(const std::wstring& cmd) {
        // Don't add duplicate of last command
        if (!m_commands.empty() && m_commands.back() == cmd) {
            return;
        }

        m_commands.push_back(cmd);
        if (m_commands.size() > MAX_HISTORY) {
            m_commands.pop_front();
        }

        m_position = -1;
        SaveToDisk();
    }

    std::wstring Navigate(int direction) {
        if (m_commands.empty()) return L"";

        // Save current input before navigating
        if (m_position == -1) {
            m_currentInput = GetCurrentText();
        }

        m_position += direction;
        m_position = std::clamp(m_position, -1, (int)m_commands.size() - 1);

        if (m_position == -1) {
            return m_currentInput;  // Restore unsent input
        } else {
            return m_commands[m_commands.size() - 1 - m_position];
        }
    }

    void LoadFromDisk() {
        std::wstring path = GetAppDataPath() + L"\\command_history.txt";
        std::wifstream file(path);
        std::wstring line;

        while (std::getline(file, line) && m_commands.size() < MAX_HISTORY) {
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

## 5. Layout and Window Management

### 5.1 CSS Grid Layout

**Current React**: `src/App.css` (grid-template-areas)

**Grid Areas**:
```
┌─────────────────────────────────────┐
│ header (toolbar)                     │
├──────────────────────┬──────────────┤
│                      │              │
│ main (output)        │ sidebar      │
│                      │ (tabs)       │
│                      │              │
├──────────────────────┴──────────────┤
│ input (command)                      │
├─────────────────────────────────────┤
│ status (statusbar)                   │
└─────────────────────────────────────┘
```

**Responsive Behavior**:
- Sidebar hidden on mobile
- Sidebar width: `clamp(250px, 25vw, 300px)` (dynamic)
- Grid auto-adjusts rows based on content

### 5.2 Win32 Layout with WTL Splitters

**Recommended**: Use **WTL** (Windows Template Library) for splitters and layout management.

**Alternative**: Manual WM_SIZE layout (more code, no resizing).

**Implementation** (WTL):
```cpp
class MainFrame : public CFrameWindowImpl<MainFrame> {
    CToolBarCtrl m_toolbar;
    CSplitterWindow m_horzSplit;  // Horizontal: output | sidebar
    CSplitterWindow m_vertSplit;  // Vertical: top | bottom
    OutputWindow m_output;
    SidebarWindow m_sidebar;
    CommandInputWindow m_input;
    CStatusBarCtrl m_statusBar;

    bool m_sidebarVisible = false;

    BEGIN_MSG_MAP(MainFrame)
        MESSAGE_HANDLER(WM_CREATE, OnCreate)
        MESSAGE_HANDLER(WM_SIZE, OnSize)
        CHAIN_MSG_MAP(CFrameWindowImpl<MainFrame>)
    END_MSG_MAP()

    LRESULT OnCreate(LPCREATESTRUCT) {
        // Create toolbar
        m_toolbar.Create(m_hWnd, rcDefault, NULL,
                        ATL_SIMPLE_TOOLBAR_PANE_STYLE);
        m_toolbar.SetButtonStructSize();
        // Add buttons...

        // Create status bar
        m_statusBar.Create(m_hWnd);
        int panes[] = { ID_DEFAULT_PANE, ID_VITALS_PANE, ID_PING_PANE };
        m_statusBar.SetPanes(panes, 3, false);

        // Create vertical splitter (main | input+status)
        m_vertSplit.Create(m_hWnd, rcDefault, NULL,
                          WS_CHILD | WS_VISIBLE | WS_CLIPSIBLINGS | WS_CLIPCHILDREN);

        // Create horizontal splitter (output | sidebar)
        m_horzSplit.Create(m_vertSplit, rcDefault, NULL,
                          WS_CHILD | WS_VISIBLE | WS_CLIPSIBLINGS | WS_CLIPCHILDREN);

        // Create windows
        m_output.Create(m_horzSplit, rcDefault);
        m_sidebar.Create(m_horzSplit, rcDefault);
        m_input.Create(m_vertSplit, rcDefault);

        // Setup splitters
        m_horzSplit.SetSplitterPanes(m_output, m_sidebar);
        m_horzSplit.SetSplitterPos(800);  // 800px for output
        m_horzSplit.SetSinglePaneMode(SPLIT_PANE_LEFT);  // Sidebar hidden initially

        m_vertSplit.SetSplitterPanes(m_horzSplit, m_input);
        m_vertSplit.SetSplitterPos(-90);  // 90px from bottom for input
        m_vertSplit.m_cxyMin = 60;  // Minimum input height

        UpdateLayout();
        return 0;
    }

    void ToggleSidebar() {
        m_sidebarVisible = !m_sidebarVisible;

        if (m_sidebarVisible) {
            m_horzSplit.SetSinglePaneMode(SPLIT_PANE_NONE);
            m_horzSplit.SetSplitterPos(800);
            m_sidebar.ShowWindow(SW_SHOW);
        } else {
            m_horzSplit.SetSinglePaneMode(SPLIT_PANE_LEFT);
            m_sidebar.ShowWindow(SW_HIDE);
        }
    }

    void UpdateLayout(BOOL bResizeBars = TRUE) {
        RECT rect;
        GetClientRect(&rect);

        // Toolbar at top
        RECT rcToolbar = rect;
        rcToolbar.bottom = rcToolbar.top + 40;
        m_toolbar.MoveWindow(&rcToolbar);

        // Status bar at bottom
        RECT rcStatus = rect;
        rcStatus.top = rcStatus.bottom - 24;
        m_statusBar.MoveWindow(&rcStatus);

        // Splitter fills remaining space
        RECT rcSplit = rect;
        rcSplit.top += 40;
        rcSplit.bottom -= 24;
        m_vertSplit.MoveWindow(&rcSplit);
    }
};
```

### 5.3 Persistent Layout

**React**: No persistence (resets on reload)

**Win32**: Save splitter positions to registry or config file

```cpp
void SaveLayout() {
    CRegKey key;
    if (key.Create(HKEY_CURRENT_USER, L"Software\\MongooseMUD\\Layout") == ERROR_SUCCESS) {
        RECT rect;
        GetWindowRect(&rect);
        key.SetDWORDValue(L"WindowX", rect.left);
        key.SetDWORDValue(L"WindowY", rect.top);
        key.SetDWORDValue(L"WindowWidth", rect.right - rect.left);
        key.SetDWORDValue(L"WindowHeight", rect.bottom - rect.top);
        key.SetDWORDValue(L"SplitterPosHorz", m_horzSplit.GetSplitterPos());
        key.SetDWORDValue(L"SplitterPosVert", m_vertSplit.GetSplitterPos());
        key.SetDWORDValue(L"SidebarVisible", m_sidebarVisible);
    }
}

void LoadLayout() {
    CRegKey key;
    if (key.Open(HKEY_CURRENT_USER, L"Software\\MongooseMUD\\Layout") == ERROR_SUCCESS) {
        DWORD x, y, width, height;
        key.QueryDWORDValue(L"WindowX", x);
        key.QueryDWORDValue(L"WindowY", y);
        key.QueryDWORDValue(L"WindowWidth", width);
        key.QueryDWORDValue(L"WindowHeight", height);
        MoveWindow(x, y, width, height);

        DWORD horzPos, vertPos, sidebarVisible;
        key.QueryDWORDValue(L"SplitterPosHorz", horzPos);
        key.QueryDWORDValue(L"SplitterPosVert", vertPos);
        key.QueryDWORDValue(L"SidebarVisible", sidebarVisible);

        m_horzSplit.SetSplitterPos(horzPos);
        m_vertSplit.SetSplitterPos(vertPos);
        m_sidebarVisible = (bool)sidebarVisible;
    }
}
```

---

## 6. Sidebar Tab System

### 6.1 Current React Implementation

**File**: `src/components/sidebar.tsx` (207 lines)

**Tabs**:
1. **Room Info** - Room name, exits, players, items
2. **Inventory** - Item list with actions
3. **Users** - Connected players (from MCP userlist)
4. **MIDI Status** - Device info, connection status
5. **File Transfer** - Active transfers, history
6. **Audio Chat** - LiveKit participants

**Conditional Display**: Tabs only appear when data is available (e.g., Room tab hidden until GMCP Room.Info received)

**Keyboard Shortcuts**:
- Ctrl+1-9: Switch to tab N
- Arrow Left/Right: Navigate tabs
- Home/End: First/last tab

### 6.2 Win32 Tab Control

**Control**: `CTabCtrl` with child windows

**Implementation**:
```cpp
class SidebarWindow : public CWindowImpl<SidebarWindow> {
    CTabCtrl m_tabs;

    enum TabID {
        TAB_ROOM,
        TAB_INVENTORY,
        TAB_USERS,
        TAB_MIDI,
        TAB_FILES,
        TAB_AUDIO,
        TAB_COUNT
    };

    std::array<CWindow, TAB_COUNT> m_pages;
    std::array<bool, TAB_COUNT> m_tabVisible;

    LRESULT OnCreate(LPCREATESTRUCT) {
        // Create tab control
        m_tabs.Create(m_hWnd, rcDefault, NULL,
                     WS_CHILD | WS_VISIBLE | WS_CLIPCHILDREN | TCS_TABS);

        // Create pages (initially hidden)
        m_pages[TAB_ROOM] = m_roomPage.Create(m_hWnd, rcDefault);
        m_pages[TAB_INVENTORY] = m_inventoryPage.Create(m_hWnd, rcDefault);
        m_pages[TAB_USERS] = m_usersPage.Create(m_hWnd, rcDefault);
        m_pages[TAB_MIDI] = m_midiPage.Create(m_hWnd, rcDefault);
        m_pages[TAB_FILES] = m_filesPage.Create(m_hWnd, rcDefault);
        m_pages[TAB_AUDIO] = m_audioPage.Create(m_hWnd, rcDefault);

        // Initially all hidden
        std::fill(m_tabVisible.begin(), m_tabVisible.end(), false);

        return 0;
    }

    void ShowTab(TabID id, bool show) {
        if (m_tabVisible[id] == show) return;

        m_tabVisible[id] = show;

        if (show) {
            // Add tab
            TCITEM item = {};
            item.mask = TCIF_TEXT;
            item.pszText = const_cast<LPWSTR>(GetTabName(id));
            m_tabs.InsertItem(GetVisibleIndex(id), &item);
        } else {
            // Remove tab
            m_tabs.DeleteItem(GetVisibleIndex(id));
        }
    }

    int GetVisibleIndex(TabID id) {
        int index = 0;
        for (int i = 0; i < id; ++i) {
            if (m_tabVisible[i]) index++;
        }
        return index;
    }

    LRESULT OnTabChange(int, LPNMHDR, BOOL&) {
        int sel = m_tabs.GetCurSel();
        if (sel < 0) return 0;

        // Find TabID from visible index
        TabID id = GetTabIDFromIndex(sel);

        // Hide all pages
        for (auto& page : m_pages) {
            page.ShowWindow(SW_HIDE);
        }

        // Show selected page
        m_pages[id].ShowWindow(SW_SHOW);

        return 0;
    }

    // Called when GMCP Room.Info received
    void OnRoomDataReceived() {
        ShowTab(TAB_ROOM, true);
    }

    // Called when inventory updated
    void OnInventoryUpdated() {
        ShowTab(TAB_INVENTORY, true);
    }
};
```

### 6.3 Page Implementations

**Room Info Page**:
```cpp
class RoomInfoPage : public CWindowImpl<RoomInfoPage> {
    CStatic m_roomName;
    CListBox m_exitsList;
    CListBox m_playersList;
    CListBox m_itemsList;

    void UpdateRoomInfo(const RoomInfo& info) {
        m_roomName.SetWindowText(info.name.c_str());

        m_exitsList.ResetContent();
        for (const auto& exit : info.exits) {
            m_exitsList.AddString(exit.c_str());
        }

        m_playersList.ResetContent();
        for (const auto& player : info.players) {
            m_playersList.AddString(player.c_str());
        }

        m_itemsList.ResetContent();
        for (const auto& item : info.items) {
            m_itemsList.AddString(item.c_str());
        }
    }
};
```

**Inventory Page**:
```cpp
class InventoryPage : public CWindowImpl<InventoryPage> {
    CListViewCtrl m_listView;

    LRESULT OnCreate(LPCREATESTRUCT) {
        m_listView.Create(m_hWnd, rcDefault, NULL,
                         WS_CHILD | WS_VISIBLE | LVS_REPORT | LVS_SINGLESEL);

        // Add columns
        m_listView.InsertColumn(0, L"Name", LVCFMT_LEFT, 150);
        m_listView.InsertColumn(1, L"Type", LVCFMT_LEFT, 100);
        m_listView.InsertColumn(2, L"Count", LVCFMT_RIGHT, 60);

        return 0;
    }

    void UpdateInventory(const std::vector<Item>& items) {
        m_listView.DeleteAllItems();

        for (size_t i = 0; i < items.size(); ++i) {
            m_listView.InsertItem(i, items[i].name.c_str());
            m_listView.SetItemText(i, 1, items[i].type.c_str());
            m_listView.SetItemText(i, 2, std::to_wstring(items[i].count).c_str());
        }
    }
};
```

---

## 7. Accessibility Support

### 7.1 Current React Implementation

**ARIA Roles and Attributes**: Extensive use in all components

**Files with aria-* attributes** (22 files found):
- `output.tsx`: `role="log"`, `aria-live="polite"`, `aria-atomic="false"`
- `tabs.tsx`: `role="tablist"`, `role="tab"`, `aria-selected`
- `AccessibleList.tsx`: `role="listbox"`, `role="option"`, `aria-activedescendant`
- `toolbar.tsx`: `aria-label` for all buttons
- `PreferencesDialog.tsx`: `aria-label="Preferences"`

**Screen Reader Announcements**:
```typescript
import { announce } from "@react-aria/live-announcer";

// Announce new messages to screen reader
announce("New message received", "polite");
announce("Error: Connection lost", "assertive");
```

**Keyboard Navigation**:
- Tab order: Toolbar → Output → Input → Sidebar → Statusbar
- Escape: Close dialogs
- Ctrl+shortcuts: Global actions (no focus stealing)
- Arrow keys: Navigate lists, tabs

### 7.2 Win32 UI Automation

**API**: Microsoft UI Automation (UIA)

**Implementation**: Each control must provide `IRawElementProviderSimple` interface

**Example** (Output Window):
```cpp
class OutputWindowProvider : public IRawElementProviderSimple {
public:
    // IUnknown
    STDMETHOD(QueryInterface)(REFIID riid, void** ppv) {
        if (riid == __uuidof(IRawElementProviderSimple)) {
            *ppv = static_cast<IRawElementProviderSimple*>(this);
            AddRef();
            return S_OK;
        }
        return E_NOINTERFACE;
    }

    STDMETHOD_(ULONG, AddRef)() { return ++m_refCount; }
    STDMETHOD_(ULONG, Release)() {
        if (--m_refCount == 0) { delete this; return 0; }
        return m_refCount;
    }

    // IRawElementProviderSimple
    STDMETHOD(get_ProviderOptions)(ProviderOptions* pRetVal) {
        *pRetVal = ProviderOptions_ServerSideProvider;
        return S_OK;
    }

    STDMETHOD(GetPatternProvider)(PATTERNID patternId, IUnknown** pRetVal) {
        *pRetVal = nullptr;

        if (patternId == UIA_TextPatternId) {
            // Provide text pattern for screen reader to read content
            *pRetVal = static_cast<ITextProvider*>(this);
            AddRef();
            return S_OK;
        }

        return S_OK;
    }

    STDMETHOD(GetPropertyValue)(PROPERTYID propertyId, VARIANT* pRetVal) {
        VariantInit(pRetVal);

        switch (propertyId) {
            case UIA_ControlTypePropertyId:
                pRetVal->vt = VT_I4;
                pRetVal->lVal = UIA_DocumentControlTypeId;  // Output is a document
                break;
            case UIA_NamePropertyId:
                pRetVal->vt = VT_BSTR;
                pRetVal->bstrVal = SysAllocString(L"Terminal Output");
                break;
            case UIA_IsKeyboardFocusablePropertyId:
                pRetVal->vt = VT_BOOL;
                pRetVal->boolVal = VARIANT_TRUE;
                break;
            case UIA_AutomationIdPropertyId:
                pRetVal->vt = VT_BSTR;
                pRetVal->bstrVal = SysAllocString(L"OutputWindow");
                break;
            case UIA_LiveSettingPropertyId:
                pRetVal->vt = VT_I4;
                pRetVal->lVal = Polite;  // Announce new content politely
                break;
        }

        return S_OK;
    }

    STDMETHOD(get_HostRawElementProvider)(IRawElementProviderSimple** pRetVal) {
        return UiaHostProviderFromHwnd(m_hwnd, pRetVal);
    }

private:
    HWND m_hwnd;
    ULONG m_refCount = 1;
};

// In OutputWindow class
LRESULT OnGetObject(UINT, WPARAM wParam, LPARAM lParam) {
    if (lParam == UiaRootObjectId) {
        IRawElementProviderSimple* provider = new OutputWindowProvider(m_hWnd);
        return UiaReturnRawElementProvider(m_hWnd, wParam, lParam, provider);
    }
    return 0;
}
```

**Live Region Announcements** (equivalent to `announce()`):
```cpp
void AnnounceToScreenReader(const std::wstring& message,
                            LiveSetting urgency = Polite) {
    // Notify UIA that content changed
    UiaRaiseAutomationEvent(m_provider, UIA_LiveRegionChangedEventId);

    // Or use NotifyWinEvent (older API, still supported)
    NotifyWinEvent(EVENT_OBJECT_NAMECHANGE, m_hWnd, OBJID_CLIENT, 0);
}
```

### 7.3 Keyboard Navigation

**Standard Windows Behavior**:
- Tab: Move focus to next control
- Shift+Tab: Previous control
- Arrow keys: Navigate within control (handled by control itself)
- Accelerator keys: Alt+letter (defined in menu or button text with &)

**Global Shortcuts** (Accelerator Table):
```cpp
ACCEL accelTable[] = {
    { FVIRTKEY | FCONTROL, '1', ID_TAB_ROOM },
    { FVIRTKEY | FCONTROL, '2', ID_TAB_INVENTORY },
    { FVIRTKEY | FCONTROL, '3', ID_TAB_USERS },
    { FVIRTKEY | FCONTROL, 'S', ID_FILE_SAVE_LOG },
    { FVIRTKEY | FCONTROL, 'L', ID_EDIT_CLEAR_LOG },
    { FVIRTKEY | FCONTROL, VK_OEM_COMMA, ID_TOOLS_PREFERENCES },  // Ctrl+,
    { FVIRTKEY, VK_ESCAPE, ID_STOP_SOUNDS },
    { FVIRTKEY, VK_CONTROL, ID_STOP_SPEECH },  // Any Ctrl key
};

HACCEL hAccel = CreateAcceleratorTable(accelTable, _countof(accelTable));

// Message loop
while (GetMessage(&msg, NULL, 0, 0)) {
    if (!TranslateAccelerator(hMainWnd, hAccel, &msg)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }
}
```

---

## 8. Theming and Dark Mode

### 8.1 Current React Implementation

**Color Scheme** (hardcoded):
- Terminal: Black background (#000), white text (#fff)
- UI chrome: Dark gray/blue (#2c3e50 toolbar, #333 statusbar)
- Buttons: Blue (#3498db), green for Send (#4caf50)
- Links: Orange (#ffa500)
- System messages: Sky blue (#87ceeb)
- Errors: Tomato red (#ff6347)

**No Theme Switching**: Dark theme only, no light mode

**CSS Variables**: `--sidebar-width`, `--spacing-unit`, `--color-*`

### 8.2 Win32 Theme System

**Recommendation**: Support Windows dark mode from the start

**Implementation**:
```cpp
enum class Theme { Light, Dark, System };

class ThemeManager {
public:
    Theme GetCurrentTheme() { return m_theme; }

    void SetTheme(Theme theme) {
        m_theme = theme;
        NotifyThemeChange();
    }

    AppColors GetColors() {
        switch (m_theme) {
            case Theme::Dark:
                return GetDarkTheme();
            case Theme::Light:
                return GetLightTheme();
            case Theme::System:
                return IsSystemDarkMode() ? GetDarkTheme() : GetLightTheme();
        }
    }

private:
    bool IsSystemDarkMode() {
        // Query Windows 10+ registry
        DWORD value = 0;
        DWORD size = sizeof(value);
        RegGetValue(HKEY_CURRENT_USER,
                   L"Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize",
                   L"AppsUseLightTheme",
                   RRF_RT_DWORD, nullptr, &value, &size);
        return value == 0;  // 0 = dark, 1 = light
    }

    AppColors GetDarkTheme() {
        AppColors colors;
        colors.terminalBg = RGB(0, 0, 0);
        colors.terminalText = RGB(255, 255, 255);
        colors.toolbarBg = RGB(44, 62, 80);
        colors.statusbarBg = RGB(51, 51, 51);
        colors.buttonNormal = RGB(52, 152, 219);
        colors.sendButton = RGB(76, 175, 80);
        // ... etc
        return colors;
    }

    AppColors GetLightTheme() {
        AppColors colors;
        colors.terminalBg = RGB(255, 255, 255);
        colors.terminalText = RGB(0, 0, 0);
        colors.toolbarBg = RGB(240, 240, 240);
        // ... etc
        return colors;
    }

    void NotifyThemeChange() {
        // Notify all windows to repaint with new colors
        PostMessage(m_mainFrame, WM_THEMECHANGED, 0, 0);
    }

    Theme m_theme = Theme::System;
};

// In MainFrame
LRESULT OnThemeChanged(UINT, WPARAM, LPARAM) {
    auto colors = m_themeManager.GetColors();

    // Update toolbar colors
    m_toolbar.SetBackgroundColor(colors.toolbarBg);

    // Update output window
    m_output.SetColors(colors.terminalBg, colors.terminalText,
                       colors.systemInfo, colors.errorMsg);

    // Update input
    m_input.SetBackgroundColor(colors.terminalBg);

    // Repaint all
    RedrawWindow(NULL, NULL, RDW_INVALIDATE | RDW_ALLCHILDREN);

    return 0;
}
```

### 8.3 Visual Styles

**Enable Windows Visual Styles**:
```xml
<!-- app.manifest -->
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<assembly xmlns="urn:schemas-microsoft-com:asm.v1" manifestVersion="1.0">
  <dependency>
    <dependentAssembly>
      <assemblyIdentity
        type="win32"
        name="Microsoft.Windows.Common-Controls"
        version="6.0.0.0"
        processorArchitecture="*"
        publicKeyToken="6595b64144ccf1df"
        language="*" />
    </dependentAssembly>
  </dependency>
  <application xmlns="urn:schemas-microsoft-com:asm.v3">
    <windowsSettings>
      <dpiAware xmlns="http://schemas.microsoft.com/SMI/2005/WindowsSettings">true</dpiAware>
      <dpiAwareness xmlns="http://schemas.microsoft.com/SMI/2016/WindowsSettings">PerMonitorV2</dpiAwareness>
    </windowsSettings>
  </application>
</assembly>
```

**Enable Dark Title Bar** (Windows 11):
```cpp
BOOL value = TRUE;
DwmSetWindowAttribute(m_hWnd, DWMWA_USE_IMMERSIVE_DARK_MODE, &value, sizeof(value));
```

---

## 9. Preferences Dialog

### 9.1 Current React Implementation

**File**: `src/components/PreferencesDialog.tsx` + `preferences.tsx`

**Categories**:
1. **General**: Local echo
2. **Speech**: TTS voice, rate, pitch, volume, autoread mode
3. **Sound**: Mute in background, volume
4. **Channels**: Per-channel TTS and notification overrides
5. **MIDI**: Enable MIDI, device selection
6. **Editor**: Autocomplete, accessibility mode

**Modal Dialog**: Full-screen overlay with focus trap, Escape to close

### 9.2 Win32 Property Sheet

**Control**: `CPropertySheetImpl` with multiple pages

**Implementation**:
```cpp
class PreferencesSheet : public CPropertySheetImpl<PreferencesSheet> {
public:
    PreferencesSheet(UINT nIDCaption, UINT uStartPage = 0, HWND hWndParent = NULL)
        : CPropertySheetImpl<PreferencesSheet>(nIDCaption, uStartPage, hWndParent) {

        // Add pages
        AddPage(m_generalPage);
        AddPage(m_speechPage);
        AddPage(m_soundPage);
        AddPage(m_midiPage);
        AddPage(m_editorPage);

        SetActivePage(uStartPage);
    }

private:
    GeneralPrefsPage m_generalPage;
    SpeechPrefsPage m_speechPage;
    SoundPrefsPage m_soundPage;
    MidiPrefsPage m_midiPage;
    EditorPrefsPage m_editorPage;
};

class GeneralPrefsPage : public CPropertyPageImpl<GeneralPrefsPage> {
public:
    enum { IDD = IDD_PREFS_GENERAL };

    BEGIN_MSG_MAP(GeneralPrefsPage)
        MESSAGE_HANDLER(WM_INITDIALOG, OnInitDialog)
        CHAIN_MSG_MAP(CPropertyPageImpl<GeneralPrefsPage>)
    END_MSG_MAP()

    LRESULT OnInitDialog(UINT, WPARAM, LPARAM, BOOL&) {
        // Load preferences
        auto prefs = PreferencesManager::Get().GetPreferences();

        CButton localEchoCheck(GetDlgItem(IDC_LOCAL_ECHO));
        localEchoCheck.SetCheck(prefs.general.localEcho ? BST_CHECKED : BST_UNCHECKED);

        return TRUE;
    }

    BOOL OnApply() {
        // Save preferences
        CButton localEchoCheck(GetDlgItem(IDC_LOCAL_ECHO));

        auto prefs = PreferencesManager::Get().GetPreferences();
        prefs.general.localEcho = (localEchoCheck.GetCheck() == BST_CHECKED);

        PreferencesManager::Get().SetPreferences(prefs);

        return TRUE;
    }
};

class SpeechPrefsPage : public CPropertyPageImpl<SpeechPrefsPage> {
public:
    enum { IDD = IDD_PREFS_SPEECH };

    LRESULT OnInitDialog(UINT, WPARAM, LPARAM, BOOL&) {
        // Populate voice dropdown
        CComboBox voiceCombo(GetDlgItem(IDC_VOICE));
        auto voices = GetAvailableVoices();  // Query SAPI
        for (const auto& voice : voices) {
            voiceCombo.AddString(voice.name.c_str());
        }

        // Set rate slider (0.1 - 10.0)
        CTrackBarCtrl rateSlider(GetDlgItem(IDC_RATE));
        rateSlider.SetRange(1, 100);  // 0.1 - 10.0 mapped to 1-100
        rateSlider.SetPos(prefs.speech.rate * 10);

        return TRUE;
    }
};
```

---

## 10. Code Structure Recommendations

### 10.1 Project Organization

```
MongooseMUD/
├── src/
│   ├── UI/
│   │   ├── MainFrame.cpp/h          (Main window, layout)
│   │   ├── OutputWindow.cpp/h       (Terminal output)
│   │   ├── CommandInput.cpp/h       (Input control)
│   │   ├── SidebarWindow.cpp/h      (Tab control + pages)
│   │   ├── ToolbarWindow.cpp/h      (Toolbar)
│   │   ├── StatusbarWindow.cpp/h    (Status bar)
│   │   ├── PreferencesDialog.cpp/h  (Property sheet)
│   │   └── Accessibility/
│   │       └── UIAutomationProvider.cpp/h
│   ├── Rendering/
│   │   ├── AnsiParser.cpp/h         (Port of anser library)
│   │   ├── AnsiToRTF.cpp/h          (RTF converter)
│   │   ├── Direct2DRenderer.cpp/h   (Optional: D2D output)
│   │   └── TextLayout.cpp/h         (Text measurement, wrapping)
│   ├── Core/
│   │   ├── MudClient.cpp/h          (Existing)
│   │   ├── CommandHistory.cpp/h     (New)
│   │   ├── PreferencesManager.cpp/h (New)
│   │   └── ThemeManager.cpp/h       (New)
│   └── Resources/
│       ├── MongooseMUD.rc           (Dialogs, strings, icons)
│       └── resource.h               (Resource IDs)
└── external/
    ├── wtl/                         (Windows Template Library)
    ├── json/                        (nlohmann/json for prefs)
    └── wil/                         (Windows Implementation Library)
```

### 10.2 Shared Data Structures

**Avoid React-specific patterns**. Use standard C++ observers:

```cpp
// Observer pattern for client events
class IClientObserver {
public:
    virtual void OnConnected() = 0;
    virtual void OnDisconnected() = 0;
    virtual void OnMessage(const std::wstring& message) = 0;
    virtual void OnRoomChanged(const RoomInfo& room) = 0;
};

class MudClient {
public:
    void RegisterObserver(IClientObserver* observer) {
        m_observers.insert(observer);
    }

    void NotifyMessage(const std::wstring& msg) {
        for (auto* obs : m_observers) {
            obs->OnMessage(msg);
        }
    }

private:
    std::set<IClientObserver*> m_observers;
};

// OutputWindow observes client
class OutputWindow : public IClientObserver {
    void OnMessage(const std::wstring& message) override {
        AppendLine(message);
    }
};
```

---

## 11. Summary and Action Plan

### 11.1 Critical Findings

1. **Output window does NOT use virtualization** - contrary to Wave 1 report
2. **7500 lines rendered with standard React .map()** - Win32 must be more efficient
3. **ANSI parsing via `anser` library** - must port to C++
4. **Extensive accessibility (ARIA)** - requires UIA provider implementation
5. **No theme switching** - Win32 should add this feature

### 11.2 Component Mapping Summary

| React Component | Win32 Control | Complexity | Priority |
|----------------|---------------|------------|----------|
| OutputWindow | RichEdit → Direct2D | High | Critical |
| CommandInput | RichEdit (multiline) | Medium | Critical |
| Toolbar | CToolBarCtrl | Low | High |
| Sidebar | CTabCtrl + pages | Medium | High |
| Statusbar | CStatusBarCtrl | Low | High |
| PreferencesDialog | CPropertySheet | Medium | Medium |
| AccessibleList | CListBox + UIA | Medium | Medium |

### 11.3 Phase 1: MVP (Weeks 1-4)

**Goal**: Terminal output and input working

**Deliverables**:
1. MainFrame with RichEdit output and input
2. ANSI parser (C++ port of anser)
3. AnsiToRTF converter
4. Command history (Up/Down arrows)
5. Basic toolbar (connect, disconnect, clear, save)
6. Statusbar (connection status)

**Omit**: Sidebar, preferences dialog, themes, Direct2D

### 11.4 Phase 2: Full UI (Weeks 5-8)

**Add**:
1. Sidebar with tabs (Room, Inventory, Users)
2. WTL splitters (resizable layout)
3. Preferences dialog (property sheet)
4. Persistent layout (registry)
5. Hyperlinks (EN_LINK handling)

### 11.5 Phase 3: Polish (Weeks 9-12)

**Add**:
1. Theme support (light/dark, system detection)
2. UI Automation providers (accessibility)
3. Direct2D output renderer (if RichEdit slow)
4. Advanced sidebar tabs (MIDI, Files, Audio)

---

## 12. Files Referenced

### React Client Files Analyzed

**Core Components**:
- `src/components/output.tsx` (587 lines) - Terminal output
- `src/components/input.tsx` (248 lines) - Command input
- `src/components/sidebar.tsx` (207 lines) - Sidebar tabs
- `src/components/toolbar.tsx` (136 lines) - Toolbar
- `src/components/PreferencesDialog.tsx` (79 lines) - Prefs dialog
- `src/components/AccessibleList.tsx` (168 lines) - Keyboard-navigable lists

**Rendering**:
- `src/ansiParser.tsx` (138 lines) - ANSI to React elements
- `src/components/output.css` (141 lines) - Output styling
- `src/components/input.css` (62 lines) - Input styling

**Layout**:
- `src/App.tsx` (316 lines) - Main layout
- `src/App.css` (224 lines) - CSS Grid layout

**State Management**:
- `src/CommandHistory.ts` (50 lines) - Command history
- `src/PreferencesStore.tsx` (174 lines) - Preferences

**Total**: ~2,500 lines of UI code analyzed

---

**Report Complete**
**Date**: 2025-12-17
**Next Steps**: Begin Phase 1 implementation with RichEdit-based output window
