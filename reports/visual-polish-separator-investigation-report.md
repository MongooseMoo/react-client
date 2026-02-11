# Investigation: Toolbar Separators -- Are They Actually Visible?

## Summary

**The separators were visible all along.** The conflicting subagent reports were due to the subtlety of 18% white opacity on a dark background -- one AI vision model detected them, another did not. The elements are structurally correct, the CSS is correct, and the separators render as intended. Opacity was bumped from 18% to 25% to reduce ambiguity.

## Facts (verified with evidence)

### 1. `--color-separator` value in App.css

- **Before fix:** `rgba(255,255,255,0.18)` (line 62 of `src/App.css`)
- **After fix:** `rgba(255,255,255,0.25)` (commit `77ffe37`)

### 2. Separator elements in toolbar.tsx

There are **4** `<div className="toolbar-separator" />` elements in `src/components/toolbar.tsx`:

| # | Line | Between |
|---|------|---------|
| 1 | 91 | Log buttons (Save/Copy/Clear) and Preferences |
| 2 | 101 | Preferences and Mute/Volume group |
| 3 | 125 | Mute/Volume group and Autosay toggle |
| 4 | 140 | Autosay toggle and Connect/Disconnect button |

There is also a `<div className="toolbar-spacer" />` on line 152 (not a separator -- it's a flex spacer pushing the Hide button to the far right).

### 3. CSS rule for `.toolbar-separator` (toolbar.css lines 83-89)

```css
.toolbar-separator {
  width: 1px;
  height: 20px;
  background: var(--color-separator);
  margin: 0 var(--space-2);
  flex-shrink: 0;
}
```

No hiding rules found:
- No `display: none`
- No `opacity: 0`
- No `visibility: hidden`
- No `height: 0`
- No conflicting parent rules (`.toolbar button` only targets `<button>`, not `<div>`)
- No media queries that hide separators

### 4. Screenshot evidence

**Initial screenshot (18% opacity):** Separators are visible as faint vertical lines between button groups. All 4 separators present. Subtle but perceptible.

**Red diagnostic screenshot (2px red):** All 4 separators blazingly obvious as bright red vertical bars. This conclusively proves the DOM elements exist and render.

**Final screenshot (25% opacity):** Separators visible as slightly more pronounced vertical lines. More reliably perceptible across different monitors and AI vision analysis.

## Root Cause of Conflicting Reports

The separators were always present and rendering correctly. The conflict arose because:

1. At 18% white opacity against `--color-bg-elevated` (#1a1a22), the separators are 1px wide and quite subtle.
2. AI vision models analyzing screenshots have varying sensitivity to low-contrast 1px elements.
3. One subagent's vision model detected them; another's did not.

This is **not a code bug** -- it's a perceptibility issue at the margin of visibility.

## Changes Made

| File | Change |
|------|--------|
| `src/App.css` | `--color-separator`: `rgba(255,255,255,0.18)` -> `rgba(255,255,255,0.25)` |

No changes to `toolbar.tsx` or `toolbar.css` (both were already correct).

## Build Verification

`npx vite build` passes cleanly. No errors.

## Commit

- Hash: `77ffe37`
- Message: `fix: bump toolbar separator opacity from 18% to 25% for reliable visibility`
- Branch: `visual-polish`
