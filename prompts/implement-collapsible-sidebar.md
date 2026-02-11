# Task: Implement Collapsible Sidebar

## Context
The Mongoose MUD client sidebar takes up 250-300px even when content is minimal. We need a "collapsed" mode that shows only tab icons (~50px) while keeping tabs accessible.

## Objective
Implement a collapsible sidebar with three states:
1. **Hidden** (existing) - sidebar not rendered
2. **Collapsed** (NEW) - narrow icon-only mode (~50px)
3. **Expanded** (existing behavior) - full width with content

## Key Files
- `src/App.tsx` - state management, grid class
- `src/App.css` - grid layout, sidebar width variable
- `src/components/sidebar.tsx` - tab rendering
- `src/components/sidebar.css` - sidebar styling
- `src/components/toolbar.tsx` - toggle button

## Implementation Steps

### 1. Update State (App.tsx)
Change from boolean to enum or add second state:
```tsx
// Option A: Replace showSidebar boolean
type SidebarState = 'hidden' | 'collapsed' | 'expanded';
const [sidebarState, setSidebarState] = useState<SidebarState>('expanded');

// Option B: Add collapsed state alongside existing
const [showSidebar, setShowSidebar] = useState<boolean>(true);
const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
```
Choose Option B to minimize changes to existing logic.

### 2. Update CSS Classes (App.tsx ~line 271)
Add class for collapsed state:
```tsx
className={`App ${showSidebar ? (sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-shown') : ''}`}
```

### 3. Add CSS Grid for Collapsed (App.css)
After the `.App.sidebar-shown` rule (~line 136), add:
```css
.App.sidebar-collapsed {
  grid-template-areas:
    "header header"
    "main sidebar"
    "input input"
    "status status";
  grid-template-columns: 1fr 50px;
}
```

### 4. Update Sidebar Component (sidebar.tsx)
- Accept `collapsed` prop
- When collapsed, render only tab icons (no labels, no content panel)
- Add click handler to expand when clicking collapsed tab

### 5. Update Sidebar CSS (sidebar.css)
Add collapsed styles:
```css
.sidebar.collapsed {
  width: 50px;
}

.sidebar.collapsed .tab-button {
  /* Icon only, no label */
  padding: 8px;
  justify-content: center;
}

.sidebar.collapsed .tab-button span {
  display: none; /* Hide label text */
}

.sidebar.collapsed .tab-content {
  display: none; /* Hide content panel */
}
```

### 6. Update Toolbar Toggle (toolbar.tsx)
Change toggle behavior:
- If hidden → show expanded
- If expanded → collapse
- If collapsed → hide
- Or: single click toggles expanded/collapsed, hold/double-click hides

Simpler approach:
- Keep existing button for show/hide
- Add collapse/expand icon button on the sidebar itself

### 7. Add Collapse Button to Sidebar
Add a button at top of sidebar to toggle collapsed state:
```tsx
<button
  className="sidebar-collapse-btn"
  onClick={() => onToggleCollapse()}
  title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
>
  {collapsed ? <FaChevronLeft /> : <FaChevronRight />}
</button>
```

## Props to Pass
From App.tsx to Sidebar:
- `collapsed: boolean`
- `onToggleCollapse: () => void`

## Test
1. Sidebar shows expanded by default
2. Click collapse button → sidebar narrows to ~50px with icons only
3. Click icon in collapsed mode → expands sidebar and selects that tab
4. Hide sidebar button still works to fully hide
5. Show sidebar → returns to previous state (collapsed or expanded)

## Output
Write implementation status to `./reports/collapsible-sidebar-report.md`

## CRITICAL: File Modified Error Workaround
If Edit/Write fails with "file unexpectedly modified":
1. Read the file again with Read tool
2. Retry the Edit
3. Try path formats: `./relative`, `C:/forward/slashes`, `C:\back\slashes`
4. NEVER use cat, sed, echo - always Read/Edit/Write
5. If all formats fail, STOP and report
