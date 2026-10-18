# Win32 Reference Implementation Analysis: msvc-example

**Project**: ModernWinApp (msvc-example)
**Analysis Date**: 2025-12-17
**Location**: `C:\Users\Q\code\msvc-example`
**Version**: 0.1.0
**Total Lines**: 4,206 across 28 files
**Purpose**: Reference implementation for porting MUD client to Win32

---

## Executive Summary

The msvc-example project is a **production-quality Win32 reference implementation** demonstrating modern Windows desktop development patterns with C++20. It provides a split-pane Explorer-style interface with comprehensive accessibility support, making it an excellent blueprint for porting our React-based MUD client to native Win32.

**Key Strengths for Our Use Case**:
- Clean separation of business logic (core) from UI (Win32 wrappers)
- Modern Windows features (DPI scaling, dark mode, system integration)
- Comprehensive keyboard navigation and accessibility
- Well-documented patterns with 62 unit tests
- No external UI frameworks (pure Win32 API)

**Relevance to MUD Client**: This project demonstrates how to build a text-focused, keyboard-driven Windows application - exactly what we need for a MUD client. The TreeView/ListView pattern maps well to room/player lists or command history displays.

---

## Table of Contents

1. [Overall Architecture](#1-overall-architecture)
2. [Win32 Patterns Used](#2-win32-patterns-used)
3. [UI Approach](#3-ui-approach)
4. [Accessibility](#4-accessibility)
5. [Networking](#5-networking)
6. [Text/Terminal Patterns](#6-textterminal-patterns)
7. [Resource Management](#7-resource-management)
8. [Build Configuration](#8-build-configuration)
9. [Reusable Patterns](#9-reusable-patterns)
10. [Recommendations](#10-recommendations)

---

## 1. Overall Architecture

### 1.1 Three-Layer Architecture

The project follows strict separation of concerns with three distinct layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    ENTRY POINT                              │
│  main.cpp (79 lines)                                        │
│  - wWinMain entry point                                     │
│  - COM initialization (CoInitializeEx)                      │
│  - Common Controls initialization                           │
│  - Message loop with accelerator support                    │
│  - IsDialogMessage for keyboard navigation                  │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    UI LAYER                                 │
│  src/ui/ (3,623 lines across 22 files)                     │
│  - MainWindow: Window lifecycle, layout, message routing    │
│  - TreeViewWrapper: Hierarchical tree control               │
│  - ListViewWrapper: Columnar list view                      │
│  - Splitter: Draggable divider control                      │
│  - MenuBar, Toolbar, StatusBar: Chrome elements             │
│  - SystemTray, TaskbarProgress, JumpList: System integration│
│  - All classes are thin Win32 wrappers                      │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    CORE LAYER                               │
│  src/core/ (443 lines across 4 files)                      │
│  - TreeData: Hierarchical tree structure                    │
│  - ListData: Flat list with metadata                        │
│  - ZERO Win32 dependencies (pure C++20)                     │
│  - Fully unit testable (62 tests)                           │
│  - Move-only semantics for safety                           │
└─────────────────────────────────────────────────────────────┘
```

**Critical Principle**: The core layer has **ZERO Win32 dependencies**. All business logic lives here and can be tested without any UI.

### 1.2 Data Flow Pattern

**UI → Core (User Actions)**:
```cpp
// TreeView selection changed
void MainWindow::OnTreeViewSelectionChanged(HTREEITEM hOldItem, HTREEITEM hNewItem) {
    // Get data from core model
    const TreeNode* node = /* lookup in m_treeData */;

    // Update UI based on core data
    UpdateListViewForFolder(node->text);
}
```

**Core → UI (Display Updates)**:
```cpp
// Populate UI from core model
void TreeViewWrapper::PopulateFromTreeData(const Core::TreeData& treeData) {
    Clear();
    for (const auto* root : treeData.GetRootNodes()) {
        AddNodeRecursive(TVI_ROOT, *root);
    }
}
```

The core models never know about the UI. This enables:
- Unit testing without creating windows
- Swapping UI implementations
- Testing business logic in isolation

### 1.3 Memory Management Strategy

**Modern C++ RAII**:
```cpp
class MainWindow {
    // UI components - unique_ptr for automatic cleanup
    std::unique_ptr<TreeViewWrapper> m_treeView;
    std::unique_ptr<UI::ListViewWrapper> m_listView;
    std::unique_ptr<StatusBar> m_statusBar;

    // Data models - value types (RAII)
    std::unique_ptr<Core::TreeData> m_treeData;
    std::unique_ptr<Core::ListData> m_listData;

    // Win32 handles cleaned up in destructors
    HWND m_hwnd;  // Destroyed in OnDestroy()
};
```

**No manual new/delete** - all memory managed via:
- `std::unique_ptr` for owned objects
- `std::vector` for collections
- RAII pattern for handles and COM interfaces
- Move semantics to prevent accidental copies

### 1.4 Message-Based Architecture

Win32 is fundamentally message-driven. The application follows this pattern:

```cpp
LRESULT CALLBACK MainWindow::WindowProc(HWND hwnd, UINT msg,
                                        WPARAM wParam, LPARAM lParam) {
    // Static window procedure retrieves instance pointer
    MainWindow* pThis = GetInstancePointer(hwnd);

    switch (msg) {
        case WM_CREATE:   return pThis->OnCreate();
        case WM_SIZE:     return pThis->OnSize(LOWORD(lParam), HIWORD(lParam));
        case WM_COMMAND:  return pThis->OnCommand(LOWORD(wParam), HIWORD(wParam));
        case WM_NOTIFY:   return pThis->OnNotify(reinterpret_cast<LPNMHDR>(lParam));
        case WM_DPICHANGED: return pThis->OnDpiChanged(...);
        case WM_DESTROY:  PostQuitMessage(0); return 0;
    }

    return DefWindowProc(hwnd, msg, wParam, lParam);
}
```

**Pattern**: Static WindowProc dispatches to instance methods via pointer stored in `GWLP_USERDATA`.

---

## 2. Win32 Patterns Used

### 2.1 Window Creation Pattern

**Factory Method Approach**:

```cpp
class MainWindow {
public:
    // Step 1: Register window class (once per process)
    static bool RegisterClass(HINSTANCE hInstance);

    // Step 2: Create window instance
    static HWND Create(HINSTANCE hInstance, int nCmdShow);

private:
    // Step 3: Static window procedure
    static LRESULT CALLBACK WindowProc(HWND, UINT, WPARAM, LPARAM);

    // Step 4: Instance methods for message handling
    void OnCreate(HWND hwnd);
    void OnSize(int width, int height);
    // ...
};
```

**Registration**:
```cpp
bool MainWindow::RegisterClass(HINSTANCE hInstance) {
    WNDCLASSEXW wc = {};
    wc.cbSize = sizeof(WNDCLASSEXW);
    wc.style = CS_HREDRAW | CS_VREDRAW;
    wc.lpfnWndProc = WindowProc;
    wc.hInstance = hInstance;
    wc.hCursor = LoadCursor(nullptr, IDC_ARROW);
    wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
    wc.lpszClassName = L"ModernWinAppMainWindow";

    return RegisterClassExW(&wc) != 0;
}
```

**Creation with DPI Awareness**:
```cpp
HWND MainWindow::Create(HINSTANCE hInstance, int nCmdShow) {
    // Allocate instance
    auto* pWindow = new MainWindow();

    // Get current DPI
    HDC hdc = GetDC(nullptr);
    UINT dpi = GetDeviceCaps(hdc, LOGPIXELSX);
    ReleaseDC(nullptr, hdc);
    pWindow->m_dpi = dpi;

    // Create with scaled dimensions
    int width = pWindow->ScaleForDpi(DEFAULT_WINDOW_WIDTH);
    int height = pWindow->ScaleForDpi(DEFAULT_WINDOW_HEIGHT);

    HWND hwnd = CreateWindowExW(
        WS_EX_CONTROLPARENT,  // Enable keyboard navigation
        CLASS_NAME,
        L"Modern Win32 Application",
        WS_OVERLAPPEDWINDOW,
        CW_USEDEFAULT, CW_USEDEFAULT,
        width, height,
        nullptr, nullptr,
        hInstance,
        pWindow  // Pass instance as creation parameter
    );

    // Enable dark title bar
    BOOL useDarkMode = TRUE;
    DwmSetWindowAttribute(hwnd, DWMWA_USE_IMMERSIVE_DARK_MODE,
                         &useDarkMode, sizeof(useDarkMode));

    ShowWindow(hwnd, nCmdShow);
    return hwnd;
}
```

### 2.2 Message Loop Pattern

**Enhanced message loop** with accelerators and keyboard navigation:

```cpp
int WINAPI wWinMain(HINSTANCE hInstance, ...) {
    // Initialize COM
    CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED | COINIT_DISABLE_OLE1DDE);

    // Initialize common controls
    INITCOMMONCONTROLSEX icex = {};
    icex.dwSize = sizeof(INITCOMMONCONTROLSEX);
    icex.dwICC = ICC_WIN95_CLASSES | ICC_TREEVIEW_CLASSES |
                 ICC_LISTVIEW_CLASSES | ICC_BAR_CLASSES;
    InitCommonControlsEx(&icex);

    // Create window
    HWND hwnd = MainWindow::Create(hInstance, nCmdShow);

    // Load accelerators
    HACCEL hAccel = MenuBar::LoadAcceleratorTable();

    // Message loop
    MSG msg = {};
    while (GetMessageW(&msg, nullptr, 0, 0) > 0) {
        // Try accelerators first
        if (!TranslateAcceleratorW(hwnd, hAccel, &msg)) {
            // Then dialog-style keyboard navigation (Tab key)
            if (!IsDialogMessage(hwnd, &msg)) {
                TranslateMessage(&msg);
                DispatchMessageW(&msg);
            }
        }
    }

    // Cleanup
    CoUninitialize();
    return static_cast<int>(msg.wParam);
}
```

**Key Points**:
- `IsDialogMessage()` enables Tab navigation between controls
- `TranslateAccelerator()` handles keyboard shortcuts (Ctrl+N, etc.)
- Order matters: Accelerators before dialog navigation

### 2.3 Instance Pointer Storage

**Storing the C++ object pointer in the window**:

```cpp
LRESULT CALLBACK MainWindow::WindowProc(HWND hwnd, UINT msg,
                                        WPARAM wParam, LPARAM lParam) {
    MainWindow* pThis = nullptr;

    if (msg == WM_NCCREATE) {
        // First message - store instance pointer
        auto pCreate = reinterpret_cast<CREATESTRUCTW*>(lParam);
        pThis = static_cast<MainWindow*>(pCreate->lpCreateParams);
        SetWindowLongPtrW(hwnd, GWLP_USERDATA, reinterpret_cast<LONG_PTR>(pThis));
        pThis->m_hwnd = hwnd;
    } else {
        // Subsequent messages - retrieve instance pointer
        pThis = reinterpret_cast<MainWindow*>(
            GetWindowLongPtrW(hwnd, GWLP_USERDATA));
    }

    if (pThis) {
        // Dispatch to instance method
        switch (msg) {
            case WM_CREATE: pThis->OnCreate(hwnd); return 0;
            // ...
        }
    }

    return DefWindowProc(hwnd, msg, wParam, lParam);
}
```

**Pattern**: Use `WM_NCCREATE` (earliest message) to store pointer via `SetWindowLongPtrW(GWLP_USERDATA)`.

### 2.4 Child Control Management

**Creating and positioning child controls**:

```cpp
void MainWindow::OnCreate(HWND hwnd) {
    // Create TreeView (left pane)
    m_treeView = std::make_unique<TreeViewWrapper>();
    m_treeView->Create(hwnd, IDC_TREEVIEW, 0, 0, 200, 400);

    // Create Splitter
    m_hwndSplitter = Splitter::Create(hwnd, m_splitterPos, 0,
                                      SPLITTER_WIDTH, 400,
                                      IDC_SPLITTER, m_dpi);

    // Create ListView (right pane)
    m_listView = std::make_unique<UI::ListViewWrapper>();
    m_listView->Create(hwnd, IDC_LISTVIEW,
                      m_splitterPos + SPLITTER_WIDTH, 0,
                      400, 400);

    // Setup callbacks
    m_treeView->SetSelectionChangedCallback(
        [this](HTREEITEM hOld, HTREEITEM hNew) {
            OnTreeViewSelectionChanged(hOld, hNew);
        });
}

void MainWindow::OnSize(int width, int height) {
    // Resize children to fill client area
    if (m_treeView) {
        MoveWindow(m_treeView->GetHandle(),
                  0, toolbarHeight,
                  m_splitterPos, height - toolbarHeight - statusHeight,
                  TRUE);
    }

    if (m_hwndSplitter) {
        MoveWindow(m_hwndSplitter,
                  m_splitterPos, toolbarHeight,
                  SPLITTER_WIDTH, height - toolbarHeight - statusHeight,
                  TRUE);
    }

    // ... similar for ListView
}
```

**Pattern**: Create controls in `WM_CREATE`, resize in `WM_SIZE`.

### 2.5 Callback Pattern

**Event notifications via `std::function`**:

```cpp
class TreeViewWrapper {
public:
    using SelectionChangedCallback =
        std::function<void(HTREEITEM hOldItem, HTREEITEM hNewItem)>;

    void SetSelectionChangedCallback(SelectionChangedCallback callback) {
        m_onSelectionChanged = callback;
    }

    bool HandleNotify(LPNMHDR pnmhdr) {
        if (pnmhdr->code == TVN_SELCHANGED) {
            auto pnmtv = reinterpret_cast<LPNMTREEVIEW>(pnmhdr);
            if (m_onSelectionChanged) {
                m_onSelectionChanged(pnmtv->itemOld.hItem, pnmtv->itemNew.hItem);
            }
            return true;
        }
        return false;
    }

private:
    SelectionChangedCallback m_onSelectionChanged;
};
```

**Usage**:
```cpp
m_treeView->SetSelectionChangedCallback([this](HTREEITEM hOld, HTREEITEM hNew) {
    // Handle selection change
    UpdateListView(hNew);
});
```

**Benefits**:
- Type-safe callbacks
- Supports lambdas with capture
- Decouples components

---

## 3. UI Approach

### 3.1 Common Controls (Win32 Native)

The project uses **native Win32 common controls** exclusively - no MFC, WTL, or third-party frameworks.

**Common Controls Initialization**:
```cpp
INITCOMMONCONTROLSEX icex = {};
icex.dwSize = sizeof(INITCOMMONCONTROLSEX);
icex.dwICC = ICC_WIN95_CLASSES |      // Basic controls
             ICC_TREEVIEW_CLASSES |    // TreeView
             ICC_LISTVIEW_CLASSES |    // ListView
             ICC_BAR_CLASSES;          // Status bar, toolbar
InitCommonControlsEx(&icex);
```

**Enabling Modern Visual Styles**:

Application manifest declares dependency on Common Controls 6.0:
```xml
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
```

### 3.2 TreeView Control

**Creation with Explorer Theme**:
```cpp
HWND TreeViewWrapper::Create(HWND hwndParent, int id,
                            int x, int y, int width, int height) {
    m_hwnd = CreateWindowExW(
        0,
        WC_TREEVIEW,
        L"",
        WS_CHILD | WS_VISIBLE | WS_TABSTOP |
        TVS_HASLINES | TVS_LINESATROOT | TVS_HASBUTTONS |
        TVS_SHOWSELALWAYS,  // Selection visible when inactive
        x, y, width, height,
        hwndParent,
        reinterpret_cast<HMENU>(static_cast<INT_PTR>(id)),
        GetModuleHandleW(nullptr),
        nullptr
    );

    if (m_hwnd) {
        // Apply Explorer visual theme
        SetWindowTheme(m_hwnd, L"Explorer", nullptr);
    }

    return m_hwnd;
}
```

**Adding Items**:
```cpp
HTREEITEM TreeViewWrapper::AddItem(HTREEITEM hParent,
                                   const std::wstring& text,
                                   LPARAM userData) {
    TVINSERTSTRUCTW tvis = {};
    tvis.hParent = hParent;
    tvis.hInsertAfter = TVI_LAST;
    tvis.item.mask = TVIF_TEXT | TVIF_PARAM;
    tvis.item.pszText = const_cast<LPWSTR>(text.c_str());
    tvis.item.lParam = userData;

    return TreeView_InsertItem(m_hwnd, &tvis);
}
```

**Syncing with Core Model**:
```cpp
void TreeViewWrapper::PopulateFromTreeData(const Core::TreeData& treeData) {
    Clear();
    for (const auto* root : treeData.GetRootNodes()) {
        AddNodeRecursive(TVI_ROOT, *root);
    }
}

HTREEITEM TreeViewWrapper::AddNodeRecursive(HTREEITEM hParent,
                                            const Core::TreeNode& node) {
    HTREEITEM hItem = AddItem(hParent, node.text,
                              reinterpret_cast<LPARAM>(&node));

    for (const auto& child : node.children) {
        AddNodeRecursive(hItem, *child);
    }

    return hItem;
}
```

**Drag-and-Drop Support**:
```cpp
bool TreeViewWrapper::BeginDrag(HTREEITEM hItem) {
    m_isDragging = true;
    m_hDragItem = hItem;

    // Create drag image
    m_hDragImage = TreeView_CreateDragImage(m_hwnd, hItem);
    if (m_hDragImage) {
        POINT pt;
        GetCursorPos(&pt);
        ImageList_BeginDrag(m_hDragImage, 0, 0, 0);
        ImageList_DragEnter(GetDesktopWindow(), pt.x, pt.y);
    }

    SetCapture(m_hwnd);
    return true;
}

void TreeViewWrapper::DragMove(POINT pt) {
    ImageList_DragMove(pt.x, pt.y);

    // Highlight drop target
    HTREEITEM hTarget = GetDropTarget(pt);
    TreeView_SelectDropTarget(m_hwnd, hTarget);
}

bool TreeViewWrapper::EndDrag(HTREEITEM hTargetItem) {
    ReleaseCapture();
    ImageList_EndDrag();
    ImageList_Destroy(m_hDragImage);
    TreeView_SelectDropTarget(m_hwnd, nullptr);

    m_isDragging = false;

    // Validate and perform drop
    if (hTargetItem && IsValidDrop(m_hDragItem, hTargetItem)) {
        // Move item in tree
        return true;
    }

    return false;
}
```

### 3.3 ListView Control

**Creation with Report View**:
```cpp
HWND ListViewWrapper::Create(HWND hwndParent, int id,
                            int x, int y, int width, int height) {
    m_hwnd = CreateWindowExW(
        0,
        WC_LISTVIEW,
        L"",
        WS_CHILD | WS_VISIBLE | WS_TABSTOP |
        LVS_REPORT |           // Columnar view
        LVS_SHOWSELALWAYS |    // Selection always visible
        LVS_SINGLESEL,         // Single selection mode
        x, y, width, height,
        hwndParent,
        reinterpret_cast<HMENU>(static_cast<INT_PTR>(id)),
        GetModuleHandleW(nullptr),
        nullptr
    );

    if (m_hwnd) {
        // Extended styles
        ListView_SetExtendedListViewStyle(m_hwnd,
            LVS_EX_FULLROWSELECT |   // Select entire row
            LVS_EX_GRIDLINES |       // Grid lines
            LVS_EX_DOUBLEBUFFER);    // Flicker-free

        // Apply Explorer theme
        SetWindowTheme(m_hwnd, L"Explorer", nullptr);

        // Add columns
        AddColumn(0, L"Name", 200, LVCFMT_LEFT);
        AddColumn(1, L"Size", 100, LVCFMT_RIGHT);
        AddColumn(2, L"Modified", 150, LVCFMT_LEFT);
    }

    return m_hwnd;
}
```

**Adding Columns**:
```cpp
void ListViewWrapper::AddColumn(int index, const std::wstring& text,
                               int width, int format) {
    LVCOLUMNW lvc = {};
    lvc.mask = LVCF_TEXT | LVCF_WIDTH | LVCF_FMT;
    lvc.pszText = const_cast<LPWSTR>(text.c_str());
    lvc.cx = width;
    lvc.fmt = format;

    ListView_InsertColumn(m_hwnd, index, &lvc);
}
```

**Adding Items**:
```cpp
void ListViewWrapper::AddItem(const std::wstring& name,
                             const std::wstring& size,
                             const std::wstring& modified) {
    int index = ListView_GetItemCount(m_hwnd);

    // Insert item (column 0)
    LVITEMW lvi = {};
    lvi.mask = LVIF_TEXT;
    lvi.iItem = index;
    lvi.iSubItem = 0;
    lvi.pszText = const_cast<LPWSTR>(name.c_str());
    ListView_InsertItem(m_hwnd, &lvi);

    // Set subitems (columns 1, 2)
    ListView_SetItemText(m_hwnd, index, 1, const_cast<LPWSTR>(size.c_str()));
    ListView_SetItemText(m_hwnd, index, 2, const_cast<LPWSTR>(modified.c_str()));
}
```

### 3.4 Custom Splitter Control

The splitter is a **custom window class**, not a standard control:

**Registration**:
```cpp
bool Splitter::RegisterClass(HINSTANCE hInstance) {
    WNDCLASSEXW wc = {};
    wc.cbSize = sizeof(wc);
    wc.lpfnWndProc = SplitterProc;
    wc.hInstance = hInstance;
    wc.lpszClassName = L"CustomSplitter";
    wc.hCursor = LoadCursorW(nullptr, IDC_SIZEWE);  // Resize cursor
    wc.hbrBackground = nullptr;  // Manual painting
    wc.style = CS_HREDRAW | CS_VREDRAW;

    return RegisterClassExW(&wc) != 0;
}
```

**Drawing with System Colors** (high contrast support):
```cpp
void Splitter::OnPaint(HWND hwnd) {
    PAINTSTRUCT ps;
    HDC hdc = BeginPaint(hwnd, &ps);

    RECT rc;
    GetClientRect(hwnd, &rc);

    // Use system colors for high contrast compatibility
    HBRUSH hbrFace = GetSysColorBrush(COLOR_3DFACE);
    FillRect(hdc, &rc, hbrFace);

    // Draw highlight and shadow borders
    COLORREF clrHighlight = GetSysColor(COLOR_3DHIGHLIGHT);
    COLORREF clrShadow = GetSysColor(COLOR_3DSHADOW);

    // Left edge (highlight)
    HPEN hpenHighlight = CreatePen(PS_SOLID, 1, clrHighlight);
    SelectObject(hdc, hpenHighlight);
    MoveToEx(hdc, 0, 0, nullptr);
    LineTo(hdc, 0, rc.bottom);

    // Right edge (shadow)
    HPEN hpenShadow = CreatePen(PS_SOLID, 1, clrShadow);
    SelectObject(hdc, hpenShadow);
    MoveToEx(hdc, rc.right - 1, 0, nullptr);
    LineTo(hdc, rc.right - 1, rc.bottom);

    DeleteObject(hpenHighlight);
    DeleteObject(hpenShadow);

    EndPaint(hwnd, &ps);
}
```

**Drag Handling**:
```cpp
void Splitter::OnMouseMove(HWND hwnd, int x, int y) {
    SplitterData* pData = GetData(hwnd);
    if (!pData || !pData->isDragging) return;

    // Get parent client rect
    HWND hwndParent = GetParent(hwnd);
    RECT rcParent;
    GetClientRect(hwndParent, &rcParent);

    // Calculate new position
    POINT pt = { x, y };
    ClientToScreen(hwnd, &pt);
    ScreenToClient(hwndParent, &pt);

    int newPos = pt.x - pData->dragStartX;

    // Enforce minimum pane sizes
    if (newPos < pData->minLeftPane) {
        newPos = pData->minLeftPane;
    }
    if (newPos > rcParent.right - pData->minRightPane - pData->splitterWidth) {
        newPos = rcParent.right - pData->minRightPane - pData->splitterWidth;
    }

    // Move splitter
    SetPosition(hwnd, newPos);

    // Notify parent to re-layout
    SendMessage(hwndParent, WM_COMMAND,
                MAKEWPARAM(GetDlgCtrlID(hwnd), 0),
                reinterpret_cast<LPARAM>(hwnd));
}
```

### 3.5 Menu System

**Menu defined in resources** (app.rc):
```rc
// In app.rc (not shown in source but referenced)
MENU IDR_MAINMENU
BEGIN
    POPUP "&File"
    BEGIN
        MENUITEM "&New\tCtrl+N", ID_FILE_NEW
        MENUITEM "&Open\tCtrl+O", ID_FILE_OPEN
        MENUITEM "&Save\tCtrl+S", ID_FILE_SAVE
        MENUITEM SEPARATOR
        MENUITEM "E&xit", ID_FILE_EXIT
    END
    POPUP "&Edit"
    BEGIN
        MENUITEM "Cu&t\tCtrl+X", ID_EDIT_CUT
        MENUITEM "&Copy\tCtrl+C", ID_EDIT_COPY
        MENUITEM "&Paste\tCtrl+V", ID_EDIT_PASTE
        MENUITEM "&Delete\tDel", ID_EDIT_DELETE
    END
    // ...
END
```

**Accelerator Table** (keyboard shortcuts):
```rc
IDR_ACCELERATORS ACCELERATORS
BEGIN
    "N", ID_FILE_NEW, VIRTKEY, CONTROL
    "O", ID_FILE_OPEN, VIRTKEY, CONTROL
    "S", ID_FILE_SAVE, VIRTKEY, CONTROL
    "X", ID_EDIT_CUT, VIRTKEY, CONTROL
    "C", ID_EDIT_COPY, VIRTKEY, CONTROL
    "V", ID_EDIT_PASTE, VIRTKEY, CONTROL
    VK_DELETE, ID_EDIT_DELETE, VIRTKEY
    VK_F5, ID_VIEW_REFRESH, VIRTKEY
END
```

**Command Handling**:
```cpp
void MainWindow::OnCommand(WORD id, WORD notifyCode) {
    switch (id) {
        case ID_FILE_NEW:
            MessageBoxW(m_hwnd, L"New file", L"Info", MB_OK);
            break;

        case ID_FILE_EXIT:
            PostMessage(m_hwnd, WM_CLOSE, 0, 0);
            break;

        case ID_VIEW_EXPAND_ALL:
            if (m_treeView) m_treeView->ExpandAll();
            break;

        case ID_VIEW_COLLAPSE_ALL:
            if (m_treeView) m_treeView->CollapseAll();
            break;

        // ...
    }
}
```

**Context Menus**:
```cpp
void MainWindow::OnTreeViewContextMenu() {
    HMENU hMenu = CreatePopupMenu();

    HTREEITEM hItem = m_treeView->GetSelection();
    if (hItem) {
        AppendMenuW(hMenu, MF_STRING, ID_CONTEXT_EXPAND, L"Expand");
        AppendMenuW(hMenu, MF_STRING, ID_CONTEXT_COLLAPSE, L"Collapse");
        AppendMenuW(hMenu, MF_SEPARATOR, 0, nullptr);
        AppendMenuW(hMenu, MF_STRING, ID_CONTEXT_RENAME, L"Rename");
        AppendMenuW(hMenu, MF_STRING, ID_CONTEXT_DELETE, L"Delete");
    } else {
        AppendMenuW(hMenu, MF_STRING, ID_CONTEXT_REFRESH, L"Refresh");
    }

    POINT pt;
    GetCursorPos(&pt);

    // Important: Set foreground window before showing menu
    SetForegroundWindow(m_hwnd);

    TrackPopupMenu(hMenu, TPM_LEFTALIGN | TPM_TOPALIGN | TPM_RIGHTBUTTON,
                  pt.x, pt.y, 0, m_hwnd, nullptr);

    // Cleanup
    PostMessage(m_hwnd, WM_NULL, 0, 0);
    DestroyMenu(hMenu);
}
```

### 3.6 Toolbar and Status Bar

**Toolbar** (common control):
```cpp
HWND Toolbar::Create(HWND hwndParent, int id) {
    m_hwnd = CreateWindowExW(
        0,
        TOOLBARCLASSNAME,
        nullptr,
        WS_CHILD | WS_VISIBLE | WS_CLIPCHILDREN | WS_CLIPSIBLINGS |
        TBSTYLE_FLAT | TBSTYLE_TOOLTIPS,
        0, 0, 0, 0,
        hwndParent,
        reinterpret_cast<HMENU>(static_cast<INT_PTR>(id)),
        GetModuleHandleW(nullptr),
        nullptr
    );

    // Set button structure size
    SendMessage(m_hwnd, TB_BUTTONSTRUCTSIZE, sizeof(TBBUTTON), 0);

    // Add standard system icons
    TBADDBITMAP tbab = {};
    tbab.hInst = HINST_COMMCTRL;
    tbab.nID = IDB_STD_SMALL_COLOR;
    SendMessage(m_hwnd, TB_ADDBITMAP, 0, reinterpret_cast<LPARAM>(&tbab));

    // Add buttons
    TBBUTTON buttons[] = {
        {STD_FILENEW, ID_FILE_NEW, TBSTATE_ENABLED, TBSTYLE_BUTTON, {0}, 0, 0},
        {STD_FILEOPEN, ID_FILE_OPEN, TBSTATE_ENABLED, TBSTYLE_BUTTON, {0}, 0, 0},
        {STD_FILESAVE, ID_FILE_SAVE, TBSTATE_ENABLED, TBSTYLE_BUTTON, {0}, 0, 0},
        // ...
    };
    SendMessage(m_hwnd, TB_ADDBUTTONS, _countof(buttons),
                reinterpret_cast<LPARAM>(buttons));

    return m_hwnd;
}
```

**Status Bar** (auto-sizing):
```cpp
HWND StatusBar::Create(HWND hwndParent, int id) {
    m_hwnd = CreateWindowExW(
        0,
        STATUSCLASSNAME,
        nullptr,
        WS_CHILD | WS_VISIBLE | SBARS_SIZEGRIP,  // Sizing grip
        0, 0, 0, 0,
        hwndParent,
        reinterpret_cast<HMENU>(static_cast<INT_PTR>(id)),
        GetModuleHandleW(nullptr),
        nullptr
    );

    // Set parts (columns)
    SetParts({200, 150, -1});  // Fixed, fixed, remaining

    return m_hwnd;
}

void StatusBar::SetParts(const std::vector<int>& widths) {
    std::vector<int> edges;
    int edge = 0;

    for (size_t i = 0; i < widths.size(); ++i) {
        if (widths[i] < 0) {
            edges.push_back(-1);  // Remaining space
        } else {
            edge += widths[i];
            edges.push_back(edge);
        }
    }

    SendMessage(m_hwnd, SB_SETPARTS, edges.size(),
                reinterpret_cast<LPARAM>(edges.data()));
}
```

---

## 4. Accessibility

The project demonstrates **production-ready accessibility** - a key strength for our MUD client which must be screen-reader friendly.

### 4.1 Keyboard Navigation

**Tab Order** via `WS_EX_CONTROLPARENT` and `WS_TABSTOP`:

```cpp
// Main window enables child tab order
HWND hwnd = CreateWindowExW(
    WS_EX_CONTROLPARENT,  // Enable Tab navigation among children
    CLASS_NAME,
    L"Modern Win32 Application",
    WS_OVERLAPPEDWINDOW,
    // ...
);

// Each control gets WS_TABSTOP
HWND hwndTree = CreateWindowExW(
    0, WC_TREEVIEW, L"",
    WS_CHILD | WS_VISIBLE | WS_TABSTOP,  // Tab stop
    // ...
);
```

**Dialog-Style Navigation** in message loop:
```cpp
MSG msg = {};
while (GetMessageW(&msg, nullptr, 0, 0) > 0) {
    if (!TranslateAcceleratorW(hwnd, hAccel, &msg)) {
        // Enable Tab, arrow keys, etc.
        if (!IsDialogMessage(hwnd, &msg)) {
            TranslateMessage(&msg);
            DispatchMessageW(&msg);
        }
    }
}
```

**Context Menu via Keyboard**:
```cpp
// Shift+F10 or Menu key handled automatically by standard controls
if (pnmhdr->code == NM_RCLICK) {
    ShowContextMenu();
}
```

### 4.2 High Contrast Support

**Using System Colors Exclusively**:

```cpp
void Splitter::OnPaint(HWND hwnd) {
    // Never hard-code RGB values
    HBRUSH hbrFace = GetSysColorBrush(COLOR_3DFACE);
    COLORREF clrHighlight = GetSysColor(COLOR_3DHIGHLIGHT);
    COLORREF clrShadow = GetSysColor(COLOR_3DSHADOW);

    // Draw using system colors
    FillRect(hdc, &rc, hbrFace);
    // ...
}
```

**Responding to Theme Changes**:
```cpp
case WM_SYSCOLORCHANGE:
    // System colors changed (theme switch)
    InvalidateRect(hwnd, nullptr, TRUE);
    return 0;
```

### 4.3 Screen Reader Support

The project uses **standard Win32 controls** which have built-in UI Automation (UIA) support. No custom UIA providers are implemented.

**Why This Works**:
- TreeView, ListView, Button, etc. all have native UIA providers
- Narrator (Windows screen reader) can read them automatically
- Sufficient for 95% of applications

**When Custom UIA Would Be Needed**:
- Custom-drawn controls (not used in this project)
- Non-standard UI elements
- Complex composite controls

**Testing with Narrator**:
```
Win+Ctrl+Enter to start Narrator
Tab through controls
Narrator announces:
- "TreeView, Documents selected"
- "ListView, Name column 1 of 3"
- "New button"
```

### 4.4 DPI Awareness

**Declared in Manifest**:
```xml
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
```

**Handling DPI Changes**:
```cpp
void MainWindow::OnDpiChanged(UINT dpi, const RECT* newRect) {
    m_dpi = dpi;

    // Scale splitter position
    m_splitterPos = ScaleForDpi(200);

    // Use system-suggested rectangle
    SetWindowPos(m_hwnd, nullptr,
                newRect->left, newRect->top,
                newRect->right - newRect->left,
                newRect->bottom - newRect->top,
                SWP_NOZORDER | SWP_NOACTIVATE);

    // Re-layout children
    RECT rc;
    GetClientRect(m_hwnd, &rc);
    OnSize(rc.right, rc.bottom);
}

int MainWindow::ScaleForDpi(int value) const {
    return MulDiv(value, m_dpi, 96);
}
```

---

## 5. Networking

**Not Implemented** - This project focuses on UI patterns.

**Relevance to MUD Client**: We will need to add:
- Windows Sockets (Winsock2) for TCP/TLS connections
- Async I/O (IOCP or select/WSAAsyncSelect)
- SSL/TLS via Schannel or OpenSSL

**Pattern to Follow**: Create a `Network` namespace in the core layer (similar to `Core::TreeData`) with:
- `TcpConnection` class (RAII socket wrapper)
- Async read/write methods
- UI notification callbacks

---

## 6. Text/Terminal Patterns

The project uses **ListView for displaying text data**, which could be adapted for MUD output.

### 6.1 Rich Text Display (Not Implemented)

For ANSI/MUD terminal output, we would need:

**Option 1: RichEdit Control**:
```cpp
// Load RichEdit library
LoadLibraryW(L"Msftedit.dll");

// Create RichEdit control
HWND hwndEdit = CreateWindowExW(
    0,
    MSFTEDIT_CLASS,  // RichEdit 4.1+
    L"",
    WS_CHILD | WS_VISIBLE | WS_VSCROLL |
    ES_MULTILINE | ES_READONLY | ES_AUTOVSCROLL,
    0, 0, 400, 300,
    hwndParent,
    nullptr,
    hInstance,
    nullptr
);

// Set text with formatting
CHARFORMAT2W cf = {};
cf.cbSize = sizeof(CHARFORMAT2W);
cf.dwMask = CFM_COLOR | CFM_BOLD;
cf.crTextColor = RGB(255, 0, 0);  // Red
cf.dwEffects = CFE_BOLD;

SendMessage(hwndEdit, EM_SETCHARFORMAT, SCF_SELECTION, (LPARAM)&cf);
SendMessage(hwndEdit, EM_REPLACESEL, FALSE, (LPARAM)L"Red bold text");
```

**Option 2: Custom Drawn Control** (like our React client):
- Create custom window class
- Store text runs with formatting
- Paint in `WM_PAINT` using `TextOut` or `DrawText`
- Handle scrolling manually
- This is what we'll likely need for full ANSI support

### 6.2 Text Buffer Management Pattern

Following the core/UI separation:

```cpp
namespace Core {
    struct TextRun {
        std::wstring text;
        COLORREF color;
        bool bold;
        bool italic;
    };

    class TextBuffer {
    public:
        void AppendLine(const std::vector<TextRun>& runs);
        void Clear();
        const std::vector<std::vector<TextRun>>& GetLines() const;
        size_t GetLineCount() const;
        // ...
    };
}

namespace UI {
    class TerminalControl {
    public:
        void SetBuffer(const Core::TextBuffer* buffer);
        void ScrollToBottom();
        // Renders buffer in WM_PAINT
    };
}
```

---

## 7. Resource Management

### 7.1 RAII Pattern Throughout

**Window Handles**:
```cpp
class TreeViewWrapper {
public:
    ~TreeViewWrapper() {
        if (m_hwnd) {
            DestroyWindow(m_hwnd);
            m_hwnd = nullptr;
        }
    }

private:
    HWND m_hwnd = nullptr;
};
```

**COM Interfaces**:
```cpp
class TaskbarProgress {
public:
    ~TaskbarProgress() {
        Cleanup();
    }

    void Cleanup() {
        if (m_pTaskbarList) {
            m_pTaskbarList->Release();
            m_pTaskbarList = nullptr;
        }
    }

private:
    ITaskbarList3* m_pTaskbarList = nullptr;
};
```

**Smart Pointers for Ownership**:
```cpp
class MainWindow {
    // Automatic cleanup when MainWindow destroyed
    std::unique_ptr<TreeViewWrapper> m_treeView;
    std::unique_ptr<UI::ListViewWrapper> m_listView;
    std::unique_ptr<Core::TreeData> m_treeData;
};
```

### 7.2 Move Semantics for Safety

**Preventing Accidental Copies**:
```cpp
class TreeData {
public:
    // Delete copy operations
    TreeData(const TreeData&) = delete;
    TreeData& operator=(const TreeData&) = delete;

    // Allow move operations
    TreeData(TreeData&&) noexcept = default;
    TreeData& operator=(TreeData&&) noexcept = default;
};

struct TreeNode {
    std::vector<std::unique_ptr<TreeNode>> children;

    // Can't copy (unique_ptr is move-only)
    TreeNode(const TreeNode&) = delete;

    // Can move
    TreeNode(TreeNode&&) noexcept = default;
};
```

### 7.3 No Raw new/delete

All memory allocation via:
- `std::unique_ptr` / `std::make_unique`
- `std::vector`
- Stack allocation
- Win32 allocators (`CreateWindow`, etc.)

**Exception**: Custom controls allocate instance data with `new`, store in window props:
```cpp
auto* pData = new SplitterData();
SetPropW(hwnd, L"SplitterData", pData);

// Cleanup in WM_DESTROY
SplitterData* pData = GetData(hwnd);
delete pData;
RemovePropW(hwnd, L"SplitterData");
```

---

## 8. Build Configuration

### 8.1 CMake Setup

**Root CMakeLists.txt**:
```cmake
cmake_minimum_required(VERSION 3.20)
project(ModernWinApp VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Unicode support
add_compile_definitions(UNICODE _UNICODE)

# MSVC settings
if(MSVC)
    add_compile_options(/W4)  # High warning level

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
    dwmapi      # Desktop Window Manager (dark title bar)
    propsys     # Property system
)

# Main application
add_executable(app WIN32
    src/main.cpp
    src/core/TreeData.cpp
    src/core/ListData.cpp
    src/ui/MainWindow.cpp
    src/ui/TreeViewWrapper.cpp
    src/ui/ListViewWrapper.cpp
    src/ui/Splitter.cpp
    # ... all source files
    src/app.rc  # Resource file
)

target_link_libraries(app PRIVATE ${WIN32_LIBS})

# Testing
enable_testing()
add_subdirectory(tests)
```

### 8.2 Test Configuration

**tests/CMakeLists.txt**:
```cmake
# Fetch Google Test
include(FetchContent)
FetchContent_Declare(
  googletest
  GIT_REPOSITORY https://github.com/google/googletest.git
  GIT_TAG        v1.15.2
  GIT_SHALLOW    TRUE
)

set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

# Test executable
add_executable(unit_tests
    unit/TreeDataTests.cpp
    unit/ListDataTests.cpp
    unit/IntegrationTests.cpp
)

target_link_libraries(unit_tests
    PRIVATE
    GTest::gtest
    GTest::gtest_main
)

target_compile_features(unit_tests PRIVATE cxx_std_20)
target_include_directories(unit_tests PRIVATE ${CMAKE_SOURCE_DIR}/src)

# Register with CTest
include(GoogleTest)
gtest_discover_tests(unit_tests)
```

### 8.3 Application Manifest

**src/app.manifest**:
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<assembly xmlns="urn:schemas-microsoft-com:asm.v1" manifestVersion="1.0">
  <assemblyIdentity
    version="1.0.0.0"
    processorArchitecture="*"
    name="ModernWinApp"
    type="win32"/>
  <description>Modern Windows Application</description>

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
      <supportedOS Id="{8e0f7a12-bfb3-4fe8-b9a5-48fd50a15a9a}"/>
    </application>
  </compatibility>
</assembly>
```

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
./build/Debug/app.exe
```

---

## 9. Reusable Patterns

### 9.1 Direct Ports to MUD Client

These patterns can be **copied almost verbatim**:

1. **Entry Point Pattern** (`main.cpp`):
   - COM initialization
   - Common Controls init
   - Message loop with accelerators
   - **Use as-is** for our MUD client

2. **Window Creation Factory Pattern**:
   - `RegisterClass()` static method
   - `Create()` static factory
   - Instance pointer storage in `GWLP_USERDATA`
   - **Adapt for `MudMainWindow`**

3. **DPI Awareness**:
   - Manifest settings
   - `WM_DPICHANGED` handler
   - `ScaleForDpi()` helper
   - **Use exactly as shown**

4. **RAII Resource Management**:
   - `std::unique_ptr` for UI components
   - Destructors release handles
   - Move semantics for core models
   - **Apply to all our classes**

5. **Core/UI Separation**:
   - `core/` namespace for business logic
   - `ui/` namespace for Win32 wrappers
   - Callback pattern for UI → Core communication
   - **Essential for testable MUD client**

### 9.2 Patterns Needing Adaptation

1. **TreeView/ListView** → **Terminal Display**:
   - TreeView pattern → Room/player list
   - ListView pattern → Command history
   - **Need custom text control** for MUD output (RichEdit or custom-drawn)

2. **Sample Data** → **Network Data**:
   - Currently loads sample data in `PopulateSampleData()`
   - **Replace with network layer** that:
     - Connects to MUD server (TCP/TLS)
     - Parses incoming text
     - Updates core model
     - Notifies UI via callbacks

3. **Menu/Toolbar** → **MUD Commands**:
   - File/Edit/View menus → MUD-specific actions
   - Toolbar buttons → Quick commands (look, inventory, etc.)
   - **Customize for MUD workflow**

### 9.3 Patterns to Enhance

1. **Keyboard Shortcuts**:
   - Current: File operations (Ctrl+N, Ctrl+S)
   - **Add**: MUD-specific shortcuts (F1-F12 for macros, etc.)

2. **Accessibility**:
   - Current: Standard control UIA
   - **Enhance**: Custom UIA provider for terminal output
   - **Critical for screen reader users** in MUD

3. **System Integration**:
   - Current: System tray, taskbar progress, jump lists
   - **Add**: Notifications for MUD events (tells, deaths, etc.)

### 9.4 Testing Patterns

**Unit Testing Core Logic**:
```cpp
TEST(TreeDataTests, AddNode_ToRoot_IncreasesNodeCount) {
    Core::TreeData tree;
    EXPECT_EQ(tree.GetNodeCount(), 0);

    tree.AddNode(nullptr, L"Root Node");
    EXPECT_EQ(tree.GetNodeCount(), 1);
}
```

**Apply to MUD Client**:
```cpp
TEST(MudBufferTests, AppendLine_IncreasesLineCount) {
    Core::MudBuffer buffer;
    EXPECT_EQ(buffer.GetLineCount(), 0);

    buffer.AppendLine({{L"Hello", RGB(255, 255, 255), false, false}});
    EXPECT_EQ(buffer.GetLineCount(), 1);
}

TEST(TelnetParserTests, ParseAnsiColor_ReturnsCorrectRuns) {
    Core::TelnetParser parser;
    auto runs = parser.Parse("\x1b[31mRed text\x1b[0m");

    ASSERT_EQ(runs.size(), 1);
    EXPECT_EQ(runs[0].color, RGB(255, 0, 0));
}
```

---

## 10. Recommendations

### 10.1 What to Adopt Immediately

1. **Project Structure**:
   ```
   mud-client/
   ├── src/
   │   ├── main.cpp              # Copy from msvc-example
   │   ├── core/                 # Business logic (no Win32)
   │   │   ├── MudConnection.h/.cpp
   │   │   ├── TelnetParser.h/.cpp
   │   │   ├── TextBuffer.h/.cpp
   │   │   └── CommandHistory.h/.cpp
   │   └── ui/                   # Win32 wrappers
   │       ├── MainWindow.h/.cpp
   │       ├── TerminalControl.h/.cpp
   │       └── InputBar.h/.cpp
   └── tests/
       └── unit/
           ├── TelnetParserTests.cpp
           └── TextBufferTests.cpp
   ```

2. **Build System**:
   - Copy CMakeLists.txt structure
   - Add Google Test for core layer
   - Embed manifest for DPI awareness

3. **Message Loop**:
   - Use exact pattern from `main.cpp`
   - COM init, Common Controls init
   - `IsDialogMessage` for keyboard nav
   - Accelerator table support

4. **Window Class**:
   - Factory pattern (`RegisterClass`, `Create`)
   - Instance pointer storage
   - Message handlers as instance methods

### 10.2 What to Research Further

1. **RichEdit Control** for MUD output:
   - Supports colored text
   - Built-in scrolling
   - Accessible to screen readers
   - **Research**: Performance with thousands of lines
   - **Alternative**: Custom-drawn control (more control, more work)

2. **Winsock Async I/O**:
   - `WSAAsyncSelect` for message-based async
   - `IOCP` for high-performance async
   - **Decision**: Start with `WSAAsyncSelect` (simpler)

3. **ANSI/Telnet Parsing**:
   - State machine parser (like React client)
   - Port existing TypeScript logic to C++
   - **Research**: Existing C++ ANSI parsers

4. **Sound Integration** (screenreader alternative):
   - Windows Sound API
   - Positional audio for MUD events
   - **Research**: DirectSound or modern alternatives

### 10.3 Critical Differences from React Client

| Aspect | React Client | Win32 Client |
|--------|-------------|--------------|
| **UI Update** | React re-render | Manual `InvalidateRect()` |
| **State Management** | React state hooks | C++ member variables |
| **Async I/O** | JavaScript Promises | Winsock callbacks |
| **Styling** | CSS | Win32 GDI/GDI+ |
| **Testing** | Jest/React Testing Library | Google Test (core only) |
| **Accessibility** | HTML semantics | UIA providers |
| **Packaging** | Electron | Native .exe |

### 10.4 Migration Strategy

**Phase 1: Proof of Concept** (1-2 weeks)
- Port main window creation
- Create simple terminal control (RichEdit)
- Implement basic TCP connection
- Display raw MUD text

**Phase 2: Core Features** (2-3 weeks)
- ANSI color parsing
- Command history
- Scrollback buffer
- Input line with editing

**Phase 3: Polish** (1-2 weeks)
- DPI scaling
- Keyboard shortcuts
- System tray integration
- Accessibility testing

**Phase 4: Feature Parity** (2-3 weeks)
- All React client features
- Triggers/aliases
- Logging
- Settings persistence

### 10.5 Key Files to Study

**Before Starting Implementation**:

1. **Architecture**:
   - `docs/architecture.md` - Complete architecture overview
   - `docs/plans/implementation-plan.md` - Phased approach

2. **Core Patterns**:
   - `src/main.cpp` - Entry point pattern
   - `src/ui/MainWindow.cpp` - Window management
   - `src/core/TreeData.cpp` - Core model example

3. **Specific Features**:
   - `src/ui/Splitter.cpp` - Custom control example
   - `src/ui/TreeViewWrapper.cpp` - Win32 wrapper pattern
   - `docs/reports/win32-modern-ui.md` - Win32 UI patterns

4. **Testing**:
   - `tests/unit/TreeDataTests.cpp` - Unit test examples
   - `tests/CMakeLists.txt` - Test setup

5. **Build**:
   - `CMakeLists.txt` - Build configuration
   - `src/app.manifest` - Manifest settings

---

## Appendix A: Component Line Counts

| Component | Lines | Purpose |
|-----------|-------|---------|
| main.cpp | 79 | Entry point, message loop |
| **Core Layer** | **443** | **Pure C++ business logic** |
| TreeData.h | 104 | Tree structure declaration |
| TreeData.cpp | 147 | Tree implementation |
| ListData.h | 112 | List structure declaration |
| ListData.cpp | 80 | List implementation |
| **UI Layer** | **3,623** | **Win32 wrappers** |
| MainWindow.h | 92 | Main window declaration |
| MainWindow.cpp | 903 | Main window implementation |
| TreeViewWrapper.h | 160 | TreeView wrapper declaration |
| TreeViewWrapper.cpp | 452 | TreeView implementation |
| ListViewWrapper.h | 95 | ListView wrapper declaration |
| ListViewWrapper.cpp | 282 | ListView implementation |
| Splitter.h | 50 | Splitter declaration |
| Splitter.cpp | 266 | Splitter implementation |
| MenuBar.h | 23 | Menu declaration |
| MenuBar.cpp | 59 | Menu implementation |
| StatusBar.h | 44 | Status bar declaration |
| StatusBar.cpp | 89 | Status bar implementation |
| Toolbar.h | 49 | Toolbar declaration |
| Toolbar.cpp | 141 | Toolbar implementation |
| ContextMenu.h | 27 | Context menu declaration |
| ContextMenu.cpp | 82 | Context menu implementation |
| SystemTray.h | 51 | System tray declaration |
| SystemTray.cpp | 105 | System tray implementation |
| TaskbarProgress.h | 52 | Taskbar progress declaration |
| TaskbarProgress.cpp | 78 | Taskbar progress implementation |
| JumpList.h | 85 | Jump list declaration |
| JumpList.cpp | 309 | Jump list implementation |
| **Resources** | **111** | **Manifest, RC** |
| resource.h | 62 | Resource IDs |
| app.rc | 48 | Resource definitions |
| app.manifest | 38 | DPI, visual styles |
| **Total** | **4,206** | **28 files** |

---

## Appendix B: Key Win32 APIs Used

### Window Management
- `RegisterClassExW` - Register window class
- `CreateWindowExW` - Create window instance
- `GetWindowLongPtrW` / `SetWindowLongPtrW` - Store instance pointer
- `ShowWindow`, `UpdateWindow` - Display window
- `MoveWindow` - Resize/reposition control
- `GetClientRect`, `GetWindowRect` - Query dimensions
- `InvalidateRect` - Request repaint
- `DefWindowProc` - Default message handling

### Common Controls
- `InitCommonControlsEx` - Initialize controls library
- `TreeView_*` macros - TreeView operations
- `ListView_*` macros - ListView operations
- `SendMessage` - Send control messages
- `SetWindowTheme` - Apply Explorer theme

### DPI
- `GetDeviceCaps(LOGPIXELSX)` - Query DPI
- `WM_DPICHANGED` - DPI change notification
- `MulDiv` - Scale calculations

### Visual Theming
- `DwmSetWindowAttribute(DWMWA_USE_IMMERSIVE_DARK_MODE)` - Dark title bar
- `GetSysColor`, `GetSysColorBrush` - System colors (high contrast)

### COM
- `CoInitializeEx` - Initialize COM
- `CoUninitialize` - Cleanup COM
- `ITaskbarList3` - Taskbar integration
- `ICustomDestinationList` - Jump lists

### Keyboard/Input
- `TranslateAcceleratorW` - Keyboard shortcuts
- `IsDialogMessage` - Tab navigation
- `TranslateMessage`, `DispatchMessageW` - Message dispatch
- `LoadAccelerators` - Load accelerator table

### Menus
- `CreatePopupMenu` - Create context menu
- `AppendMenuW` - Add menu items
- `TrackPopupMenu` - Display popup menu
- `WM_COMMAND` - Menu command notification

### GDI
- `BeginPaint`, `EndPaint` - Painting
- `CreatePen`, `SelectObject`, `DeleteObject` - GDI objects
- `MoveToEx`, `LineTo` - Drawing primitives
- `FillRect` - Fill rectangle

---

## Appendix C: Testing Infrastructure

**Test Framework**: Google Test v1.15.2

**Test Coverage**:
- TreeData: 22 tests (node operations, traversal, searching)
- ListData: 29 tests (CRUD, sorting, searching)
- Integration: 11 tests (data flow, multi-instance)
- **Total**: 62 tests, all passing

**Running Tests**:
```bash
# All tests
ctest --test-dir build -C Debug --output-on-failure

# Specific suite
./build/tests/Debug/unit_tests.exe --gtest_filter=TreeDataTests.*

# Specific test
./build/tests/Debug/unit_tests.exe --gtest_filter=TreeDataTests.AddNode_ToRoot

# List tests
./build/tests/Debug/unit_tests.exe --gtest_list_tests
```

**Test Example**:
```cpp
TEST(TreeDataTests, TraverseDepthFirst_VisitsAllNodes) {
    Core::TreeData tree;
    auto root1 = tree.AddNode(nullptr, L"Root1");
    tree.AddNode(root1, L"Child1");
    tree.AddNode(root1, L"Child2");
    auto root2 = tree.AddNode(nullptr, L"Root2");

    int visitCount = 0;
    tree.TraverseDepthFirst([&visitCount](const Core::TreeNode& node) {
        visitCount++;
    });

    EXPECT_EQ(visitCount, 4);
}
```

---

## Conclusion

The msvc-example project is an **excellent reference implementation** for our Win32 MUD client port. It demonstrates:

- **Clean architecture** separating testable logic from UI
- **Modern Win32 practices** (DPI, dark mode, accessibility)
- **Production-ready patterns** used by professional Windows apps
- **Comprehensive documentation** (5000+ lines across multiple docs)

**Verdict**: Use this as the **primary blueprint** for the Win32 port. The patterns are sound, well-tested, and directly applicable to a keyboard-driven, text-focused application like a MUD client.

**Next Steps**:
1. Study the files listed in Section 10.5
2. Create mud-client project structure following this architecture
3. Start with Phase 1 POC (main window + basic terminal)
4. Iterate following the proven patterns from this reference

---

**Report Author**: Claude
**Analysis Tool**: Code review and documentation synthesis
**Confidence Level**: High - Well-documented, tested reference implementation
