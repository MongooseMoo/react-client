# Task: Improve Sidebar Content Spacing

## Objective
Add breathing room to sidebar tab content - the Room info, Contents lists, etc. feel cramped.

## Files to Investigate and Edit
- `src/components/sidebar.css` - tab panel styling
- `src/components/tabs.css` - if tab content styles are here
- Individual tab components if they have inline styles:
  - `src/components/RoomInfo.tsx` / `.css`
  - `src/components/Inventory.tsx` / `.css`
  - etc.

## Requirements
1. More padding inside tab content panels
2. Better line-height for readability
3. List items (Contents, Inventory items) need vertical spacing
4. Section headings need clear separation
5. Don't break any functionality - these are dynamic components

## General Approach
Look for tab panel / tab content containers and add:
```css
/* Tab panel content */
.tab-panel, [role="tabpanel"] {
  padding: 12px 16px;
  line-height: 1.6;
}

/* Lists inside tabs */
.tab-panel ul, .tab-panel ol,
[role="tabpanel"] ul, [role="tabpanel"] ol {
  margin: 8px 0;
  padding-left: 0;
  list-style: none;
}

.tab-panel li, [role="tabpanel"] li {
  padding: 6px 0;
  border-bottom: 1px solid var(--color-border-light, rgba(255,255,255,0.1));
}

.tab-panel li:last-child, [role="tabpanel"] li:last-child {
  border-bottom: none;
}

/* Section headings in tabs */
.tab-panel h3, .tab-panel h4,
[role="tabpanel"] h3, [role="tabpanel"] h4 {
  margin: 16px 0 8px 0;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--color-border, #333);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.7;
}
```

## Steps
1. First READ the relevant CSS files to understand current structure
2. Find where tab content is styled
3. Add/modify spacing rules
4. Be careful not to break existing layouts

## Output
Write status to `./reports/fix-sidebar-content-spacing.md`

## CRITICAL: File Modified Error Workaround
If Edit/Write fails: Read file again, retry Edit. Try path formats. NEVER use bash for edits.
