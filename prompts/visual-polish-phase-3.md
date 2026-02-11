# Task: Visual Polish Phase 3 — Sidebar Polish

## Context
We're on branch `visual-polish`. Dev server is running at `http://localhost:5173/`. Phases 1-2 are committed. This phase polishes the sidebar, tabs, and room info display.

## Objective
Flatten sidebar background, compact tabs, fix dark-theme exit buttons in RoomInfoDisplay.

## Pre-work: Capture "before" screenshot
```bash
node scripts/take-screenshot.mjs phase3-before
```
Verify `screenshots/phase3-before-desktop.png` exists.

## Files to Read First
- `src/components/sidebar.css`
- `src/components/tabs.css`
- `src/components/RoomInfoDisplay.css`

## Changes

### sidebar.css

1. **Background** — find any `background` that uses a gradient and replace with flat `var(--color-bg-elevated)`. If it's already flat, leave it.
2. **Box-shadow** — remove any `box-shadow` from the sidebar container. Keep the border if there is one.
3. **Collapse button** — find the collapse/toggle button styles. Make it compact ghost style:
   - `background: transparent`
   - `border: none`
   - `color: var(--color-text-secondary)`
   - `padding: var(--space-1)`
   - `cursor: pointer`
   - On hover: `color: var(--color-text)` and `background: rgba(255,255,255,0.06)`

### tabs.css

1. **Tab bar padding** — find the tab bar/tab list container and set padding to `var(--space-1) var(--space-2)` for a more compact look.
2. **Tab text color** — default (inactive) tabs: `color: var(--color-text-tertiary)`. Selected/active tab: `color: var(--color-text)`.
3. **Active tab underline** — active/selected tab should have a bottom border or underline: `border-bottom: 2px solid var(--color-primary)` (or equivalent approach using ::after pseudo-element if that's what's currently used).
4. **Tab panel padding** — the tab content/panel area: `padding: var(--space-2) var(--space-3)`.

### RoomInfoDisplay.css

1. **FIX EXIT BUTTONS** — search for any hardcoded light-theme colors like `#e0e0e0`, `#333`, `#ccc`, `#f5f5f5`, `#ddd`, or similar hex values. Replace them with design tokens:
   - Background: `var(--color-bg-surface)`
   - Text color: `var(--color-text)`
   - Border: `1px solid var(--color-border)`
   - Hover background: `var(--color-bg-elevated)` or `rgba(255,255,255,0.06)`

2. **Section headers** — make consistent:
   - `font-size: var(--font-size-xs)`
   - `color: var(--color-text-secondary)`
   - Remove any `opacity: 0.8` (use the token color directly)
   - `text-transform: uppercase` and `letter-spacing: 0.05em` if not already present

3. **List items** — remove any `border-bottom` from list items. Add:
   - `padding: var(--space-1) var(--space-2)`
   - Hover: `background: rgba(255,255,255,0.04)`
   - Use `var(--space-1)` gap between items instead of borders

## Verify
```bash
npx vite build
```
Must complete with no errors.

## Post-work: Capture "after" screenshot
```bash
node scripts/take-screenshot.mjs phase3-after
```
Verify `screenshots/phase3-after-desktop.png` exists.

## Commit
```bash
git add src/components/sidebar.css src/components/tabs.css src/components/RoomInfoDisplay.css
git commit -m "style: polish sidebar, tabs, and room info display"
```
Record the commit hash.

## Output
Write your report to `./reports/visual-polish-phase-3-report.md` with:
- What changed per file
- Screenshot file sizes (before and after)
- Build result (pass/fail)
- Commit hash
- Any issues encountered

## CRITICAL: Parallel Swarm Awareness
**FORBIDDEN GIT COMMANDS - NEVER USE THESE:**
- `git stash`, `git restore`, `git checkout` (for files), `git reset`, `git clean`

## CRITICAL: File Modified Error Workaround
If Edit/Write fails with "file unexpectedly modified":
1. Read the file again with Read tool
2. Retry the Edit
3. Try path formats: `./relative`, `C:/forward/slashes`, `C:\back\slashes`
4. NEVER use cat, sed, echo - always Read/Edit/Write
5. If all formats fail, STOP and report
