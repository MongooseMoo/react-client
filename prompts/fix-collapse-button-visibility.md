# Task: Make Collapse Button More Visible

## Context
The sidebar collapse button was implemented but it's nearly invisible - a tiny chevron with no background that blends into the UI. Users can't find it.

## Objective
Make the collapse button prominent and easy to find/use.

## File to Edit
`src/components/sidebar.css` - the `.sidebar-collapse-btn` styles (around line 18)

## Changes Needed

Replace the current subtle styling with something more visible:

```css
.sidebar-collapse-btn {
  background: var(--color-bg-secondary, #1a1a2e);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 8px 12px;
  margin: 8px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
  color: var(--color-text);
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.sidebar-collapse-btn:hover {
  background: var(--color-bg-hover, #2a2a4e);
  transform: scale(1.05);
}

.sidebar-collapse-btn:focus {
  outline: 2px solid var(--color-accent, #4a9eff);
  outline-offset: 2px;
}
```

Key improvements:
- Visible background color
- Border to define the button
- Border-radius for modern look
- Margin so it's not flush against edges
- Hover effect with slight scale
- Better focus indicator

## Also Consider
In collapsed mode, the button should still be clearly visible within the 50px width. May need:
```css
.sidebar.collapsed .sidebar-collapse-btn {
  margin: 8px 4px;
  padding: 8px;
}
```

## Output
Write brief status to `./reports/collapse-button-fix-report.md`

## CRITICAL: File Modified Error Workaround
If Edit/Write fails: Read file again, retry Edit, try path formats: `./relative`, `C:/forward/slashes`, `C:\back\slashes`. NEVER use bash for file edits.
