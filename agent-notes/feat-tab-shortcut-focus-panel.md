# feat/tab-shortcut-focus-panel: Ctrl+Shift+number focuses into the panel

## Goal

Q, 2026-10-17: invoking a sidebar tab with Ctrl+Shift+1–0 should focus the first focusable item in its panel, not the tab button.

## State (2026-10-17)

Branch off `origin/master` `1ff15fe8`, worktree `../react-client-tab-focus`. Pushed; PR opened 2026-10-17 on Q's go-ahead.

- `Tabs.selectTab(id, focus)` takes `'tab' | 'panel' | false` (default `'tab'`). Click and arrow keys still focus the tab (APG). `Sidebar.switchToTab` (the Ctrl+Shift+number path) passes `'panel'`.
- `'panel'`: first control Tab can reach (`tabbableControls`: not disabled, `tabIndex >= 0`, no hidden/inert ancestor inside the panel). None: the panel itself when it is a tab stop (static-text panels already are), else the tab button.
- Lazy panels (`mountOnSelect` + Suspense, e.g. Audio diagnostics): focus lands on the panel, then a MutationObserver moves it to the first control when it arrives, only while focus is still on the panel; stops on focusout.
- `hasControls` now uses the same `tabbableControls`, so a button with `tabindex=-1` no longer counts as a control (before it did, via the `button:not([disabled])` selector).
- `tsc --noEmit` clean; `vitest run` 159 files, 2195 tests pass.

Tried in Chrome (vite on localhost:5198, guest login, real key presses): Ctrl+Shift+3 → Users listbox; 8 → Audio "Microphone" button; 4 → Server "Refresh"; 9 on a fresh load → "Pause" (before the lazy fix it stopped on the panel).

## Decisions and why

- Only the shortcut goes into the panel; clicking/arrowing tabs keeps the standard tab pattern.
- Panel fallback rather than the tab button, so a static-text panel is read.

## Next step

1. After the PR merges: remove this worktree and the branch.
