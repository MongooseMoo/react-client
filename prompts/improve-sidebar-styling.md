# Task: Improve Sidebar Visual Design

## Context
The sidebar tabs and content area look cramped and rough. Need to improve spacing, typography, and overall polish.

## Objective
Make the sidebar look better - improved spacing, better tab design, more readable content area.

## Files to Edit
- `src/components/sidebar.css` - main sidebar styles
- `src/components/Tabs.css` or similar - tab component styles (find the actual file)
- Any other relevant sidebar-related CSS files

## Areas to Improve

### 1. Tab Bar
- Tabs are cramped with 5+ tabs in ~250px width
- Consider: scrollable tabs, smaller font, or icon-only with tooltips
- Better visual separation between tabs
- Clear active tab indicator
- Consistent padding/margins

### 2. Tab Content Area
- Content (like Room info, Contents list) looks cramped
- Improve line-height for readability
- Better padding inside content panels
- Consider max-height with scroll for long lists
- Improve typography hierarchy (headings vs content)

### 3. General Polish
- Consistent spacing throughout (use 8px grid: 8, 16, 24px)
- Better visual hierarchy
- Subtle separators between sections
- Ensure text doesn't touch edges (adequate padding)

## Design Guidelines
- Dark theme (appears to be dark blue/black background)
- Use existing CSS variables where available (--color-*, etc.)
- Keep it functional - this is a MUD client, not a marketing site
- Prioritize readability and information density balance

## Investigation First
1. Find all CSS files related to sidebar and tabs
2. Understand current structure
3. Make targeted improvements

## Specific Fixes to Consider

```css
/* Example improvements - adapt to actual structure */

/* Tab buttons - more compact, clearer */
.tab-button {
  padding: 8px 12px;
  font-size: 0.85rem;
  border-bottom: 2px solid transparent;
}

.tab-button.active {
  border-bottom-color: var(--color-accent, #4a9eff);
}

/* Tab content - better spacing */
.tab-panel {
  padding: 12px;
  line-height: 1.5;
}

/* Lists in content */
.tab-panel ul, .tab-panel ol {
  padding-left: 16px;
  margin: 8px 0;
}

.tab-panel li {
  margin-bottom: 4px;
}

/* Section headings */
.tab-panel h3, .tab-panel h4 {
  margin: 12px 0 8px 0;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
}
```

## Output
Write summary of changes to `./reports/sidebar-styling-report.md`

## CRITICAL: File Modified Error Workaround
If Edit/Write fails: Read file again, retry Edit, try path formats. NEVER use bash for file edits.
