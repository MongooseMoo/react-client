# Task: Make Collapse Button Prominent

## Objective
Make the sidebar collapse button impossible to miss. Currently it's a tiny subtle chevron.

## Files to Edit
- `src/components/sidebar.css` - lines 18-39 (`.sidebar-collapse-btn` styles)
- `src/components/sidebar.tsx` - lines 200-207 (button markup, if needed)

## Requirements
1. Add visible background (use existing CSS variables)
2. Increase size - bigger click target
3. Add text label alongside icon: "Collapse" when expanded, "Expand" when collapsed
4. Make hover state obvious
5. Keep it functional in both expanded (250px) and collapsed (50px) states
   - In collapsed state: icon only is fine (no room for text)
   - In expanded state: icon + text

## Implementation

### CSS Changes (sidebar.css)
```css
.sidebar-collapse-btn {
  background: var(--color-bg-secondary, #1e1e2e);
  border: 1px solid var(--color-border, #333);
  border-radius: var(--border-radius, 4px);
  padding: 10px 14px;
  margin: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--color-text, #fff);
  transition: all 0.2s ease;
  width: calc(100% - 16px);
}

.sidebar-collapse-btn:hover {
  background: var(--color-bg-hover, #2a2a3e);
  border-color: var(--color-accent, #4a9eff);
}

.sidebar.collapsed .sidebar-collapse-btn {
  width: auto;
  padding: 10px;
  justify-content: center;
}

.sidebar-collapse-btn span {
  /* Label text */
}

.sidebar.collapsed .sidebar-collapse-btn span {
  display: none;
}
```

### TSX Changes (sidebar.tsx)
Add text label to button:
```tsx
<button
  className="sidebar-collapse-btn"
  onClick={onToggleCollapse}
  title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
>
  {collapsed ? <FaChevronLeft /> : <FaChevronRight />}
  <span>{collapsed ? "Expand" : "Collapse"}</span>
</button>
```

## Output
Write brief status to `./reports/fix-collapse-button-final.md`

## CRITICAL: File Modified Error Workaround
If Edit/Write fails: Read file again, retry Edit. Try path formats: `./relative`, `C:/forward/slashes`, `C:\back\slashes`. NEVER use bash.
