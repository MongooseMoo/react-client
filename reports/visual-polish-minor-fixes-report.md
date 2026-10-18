# Visual Polish: Minor Fixes Report

## Issue 1: Volume Slider and Autosay Toggle Too Subtle

**File:** `src/components/toolbar.css`

### Changes Made

**Volume slider:**
- Track background: `rgba(255,255,255,0.15)` -> `rgba(255,255,255,0.25)` (67% brighter)
- Track height: `4px` -> `5px` (slightly taller for better visibility)
- Slider thumb (webkit + moz): `var(--color-text-secondary)` -> `var(--color-text)` (brighter thumb)

**Autosay toggle:**
- Toggle track background (off state): `rgba(255,255,255,0.15)` -> `rgba(255,255,255,0.25)` (67% brighter)
- Toggle circle (off state): `var(--color-text-secondary)` -> `var(--color-text)` (brighter circle)
- On/checked state unchanged (still uses `var(--color-primary)` track + white circle)

### Visual Verification

- **Before:** Volume slider track was barely perceptible against the dark toolbar. The thumb blended into the background. Autosay toggle pill shape was almost invisible, circle was dim gray.
- **After:** Volume slider track is clearly visible as a lighter gray line. Thumb is bright white and easy to locate. Autosay toggle pill shape is distinguishable, circle is bright white.

**Confirmed visible and improved.**

---

## Issue 2: Sidebar Collapse Button Feels Orphaned

**Files:** `src/components/sidebar.css`, `src/components/sidebar.tsx`, `src/components/tabs.css`, `src/components/tabs.tsx`

### Approach Taken

Used the preferred approach: integrated the collapse button into the tab bar row.

### Changes Made

**`src/components/tabs.tsx`:**
- Added `trailingElement?: React.ReactNode` prop to `TabsProps`
- Wrapped the `div[role="tablist"]` and the trailing element in a new `div.tab-bar-row` flex container
- Trailing element renders at the far right of the tab bar row

**`src/components/tabs.css`:**
- Added `.tab-bar-row` flex container style (border-bottom moved here from tablist)
- Updated `div[role="tablist"]` to be `flex: 1; min-width: 0; overflow-x: auto;` so tabs can scroll within available space
- Removed `border-bottom` from tablist (now on the row wrapper)

**`src/components/sidebar.tsx`:**
- Extracted collapse button into a `collapseButton` variable
- When expanded: pass it as `trailingElement` to `<Tabs>`
- When collapsed: render it standalone (same as before)
- Removed text label when expanded (icon-only for compactness), kept "Expand" text when collapsed

**`src/components/sidebar.css`:**
- Changed `margin: var(--space-2) var(--space-3)` to `margin: 0 var(--space-2)` (no vertical margin when inline)
- Reduced `gap: var(--space-2)` to `gap: var(--space-1)`
- Changed `padding: var(--space-1)` to `padding: var(--space-1) var(--space-2)`
- Added `flex-shrink: 0; white-space: nowrap;` to prevent collapse button from being squished

### Visual Verification

- **Before:** The "> Collapse" button sat alone in its own row above the tabs (Room, Inventory, Users, Files), consuming vertical space and looking disconnected from the tab bar.
- **After:** The collapse chevron (>) is positioned at the far right of the tab bar row, sharing the same horizontal line as the tabs (Room, Inventory, Users, Files, >). No wasted vertical space. The button is visually part of the tab navigation area.

**Confirmed visible and improved.**

---

## Build Result

```
vite v6.3.5 building for production...
1283 modules transformed.
Built in 5.02s (first), 4.87s (second)
```

Build succeeded with no errors.

## Commit

```
78d41e1 fix: improve volume/autosay contrast and integrate sidebar collapse button
```

5 files changed, 67 insertions, 46 deletions.
