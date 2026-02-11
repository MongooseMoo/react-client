# Visual Polish Checkpoint Fixes Report

## Summary

Fixed three visual issues identified in checkpoint review: tab active state contrast, sidebar section spacing, and toolbar separator visibility.

## Issue 1: Sidebar Tab Active State Too Subtle

**Root cause:** Inactive tabs had `font-weight: 500` (medium), too close to the active tab's `font-weight: 600` (semibold). The visual difference between 500 and 600 weight is minimal on most fonts. Additionally, inactive tabs used a 3px transparent border-bottom while active used 2px, causing a slight layout shift.

**File changed:** `src/components/tabs.css`

**Changes:**
- Inactive tab `font-weight`: `var(--font-weight-medium, 500)` -> `var(--font-weight-normal, 400)` -- increases the weight contrast between active (600) and inactive (400)
- Inactive tab `border-bottom`: `3px solid transparent` -> `2px solid transparent` -- matches the active tab's 2px border, eliminating layout shift
- Active tab `font-weight`: `var(--font-weight-semibold, 600)` -> `600` -- hardcoded to ensure reliable rendering regardless of variable definition

## Issue 2: Sidebar Content Sections Need Breathing Room

**Root cause:** The CONTENTS and PLAYERS IN ROOM sections had hardcoded `margin-top: 20px` and `padding-top: 12px`. The EXITS section's h5 had `margin-top: 16px` applied to the heading rather than the section container. Spacing was adequate but not generous enough.

**File changed:** `src/components/RoomInfoDisplay.css`

**Changes:**
- Added `.room-info-display .room-exits` rule with `margin-top: var(--space-4, 16px)` to apply spacing to the exits section container (not just the heading)
- Changed `.room-exits h5` margin-top from `16px` to `0` (spacing now on parent container)
- Changed `.room-contents-section` margin-top from `20px` to `var(--space-6, 24px)` (+4px increase)
- Changed `.room-players-section` margin-top from `20px` to `var(--space-6, 24px)` (+4px increase)
- Both sections now use design system tokens (`--space-6`) instead of hardcoded values

## Issue 3: Toolbar Separators Not Visible

**Root cause:** The `.toolbar-separator` elements were present in the markup (`toolbar.tsx` has `<div className="toolbar-separator" />` between each toolbar group) and the CSS rules were correct (`width: 1px; height: 20px; background: var(--color-separator)`). The problem was that `--color-separator` was defined as `rgba(255,255,255,0.08)` -- 8% white opacity, which is essentially invisible against the dark elevated background.

**File changed:** `src/App.css`

**Changes:**
- `--color-separator`: `rgba(255,255,255,0.08)` -> `rgba(255,255,255,0.18)` -- more than doubled the opacity to make separators subtle but clearly visible

**Note:** `toolbar.css` and `toolbar.tsx` were NOT modified -- the separator markup and CSS rules were already correct. Only the color variable needed adjustment.

## Visual Verification

### Before Screenshot (`checkpoint-fix-before-desktop.png`)
- **Tabs:** "Room" tab has a blue underline and bold text, but "Inventory", "Users", "Files" tabs appear only slightly lighter -- the weight difference (500 vs 600) is barely perceptible
- **Sidebar:** EXITS, CONTENTS, and PLAYERS IN ROOM sections are visible with spacing, but sections feel somewhat compressed together with only 20px gaps
- **Toolbar:** "Save Log", "Copy Log", "Clear Log", "Preferences", "Mute", "Volume", "Autosay", and "Disconnect" run together with NO visible separator lines between groups

### After Screenshot (`checkpoint-fix-after-desktop.png`)
- **Tabs:** "Room" tab has a clear blue underline and bold (600) text. "Inventory", "Users", "Files" tabs are noticeably dimmer and thinner (400 weight). The active/inactive distinction is more pronounced.
- **Sidebar:** EXITS, CONTENTS, and PLAYERS IN ROOM sections have increased breathing room. The sections feel like distinct visual groups with clear whitespace and horizontal border separators between them.
- **Toolbar:** Thin vertical separator lines are now visible between button groups: between "Clear Log | Preferences", between "Preferences | Mute", between the volume/autosay area and "Disconnect". The separators are subtle but definitely present.

**All 3 fixes confirmed visible in the after screenshot.**

## Build Result

Build succeeded (`npx vite build`). No errors.

## Commit

```
adf88fc fix: improve tab active state, sidebar spacing, and toolbar separators
```

Files committed:
- `src/App.css`
- `src/components/RoomInfoDisplay.css`
- `src/components/tabs.css`
