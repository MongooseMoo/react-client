# Tab Clipping Fix Report

## Root Cause

The sidebar tab bar had insufficient space for all 4 tabs plus the collapse chevron button. The combined width of all elements exceeded the sidebar width (`clamp(250px, 25vw, 300px)`):

1. **Tab padding was too generous**: Each tab had `padding: var(--space-2) var(--space-4)` (8px 16px), adding 32px of horizontal padding per tab (128px total for 4 tabs).
2. **Tab font size was too large**: `var(--font-size-sm)` (14px / 0.875rem) made text too wide for the constrained space.
3. **Tablist container padding**: `padding: var(--space-1) var(--space-2)` added another 16px.
4. **Tablist gap**: `var(--space-1)` (4px) between tabs added 12px for 3 gaps.
5. **Collapse button sizing**: `padding: var(--space-1) var(--space-2)` with `margin: 0 var(--space-2)` took ~38px.
6. **`overflow-x: auto`** on the tablist caused the "Files" tab to scroll out of view behind a `>` overflow indicator rather than being visible.

Estimated total width needed: ~371px vs available 250-300px.

## Changes Made

### `src/components/tabs.css`

- **Tab padding**: Reduced from `var(--space-2) var(--space-4)` (8px 16px) to `var(--space-1) var(--space-2)` (4px 8px)
- **Tab font size**: Reduced from `var(--font-size-sm)` (14px) to `var(--font-size-xs)` (12px)
- **Tab flex behavior**: Added `flex-shrink: 1`, `min-width: 0`, `overflow: hidden`, `text-overflow: ellipsis` so tabs can shrink gracefully if needed
- **Tablist gap**: Reduced from `var(--space-1)` (4px) to `2px`
- **Tablist padding**: Reduced from `var(--space-1) var(--space-2)` to `var(--space-1) var(--space-1)` (4px all around)
- **Tablist overflow**: Changed from `overflow-x: auto` to `overflow: hidden` (prevents scroll indicator from appearing)

### `src/components/sidebar.css`

- **Collapse button padding**: Reduced from `var(--space-1) var(--space-2)` (4px 8px) to `var(--space-1)` (4px)
- **Collapse button margin**: Reduced from `0 var(--space-2)` (0 8px) to `0 var(--space-1)` (0 4px)
- **Collapse button font size**: Reduced from `var(--font-size-sm)` to `var(--font-size-xs)`

## Before/After Screenshots

### Before (`screenshots/tab-clip-before-desktop.png`)
- Tab bar shows: "Room" (active, with underline), "Inventory", "Users", then "Fi..." (clipped)
- A `>` overflow scroll indicator appears at the far right, hiding the "Files" tab
- The collapse chevron is not distinguishable from the overflow indicator

### After (`screenshots/tab-clip-after-desktop.png`)
- Tab bar shows: **Room** (active, with clear underline), **Inventory**, **Users**, **Files**, **Audio** -- all fully visible and readable
- The `>` collapse chevron is visible at the far right end, separate from the tabs
- All tab labels are fully readable (not truncated)
- The active tab (Room) retains its clear underline indicator
- Even a 5th tab (Audio) that was completely hidden before is now visible

## Build Result

Build succeeded with `npx vite build`. No errors. Only a pre-existing chunk size warning (unrelated).

## Commit

```
9930624 fix: prevent sidebar tab clipping by compacting tab sizing
```

Files committed: `src/components/tabs.css`, `src/components/sidebar.css`
