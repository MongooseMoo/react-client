# Task: Fix Sidebar Tab Clipping

## Context
We're on branch `visual-polish`. Dev server at `http://localhost:5173/`. When we integrated the collapse button into the tab bar row, it ate space and now the "Files" tab gets clipped/hidden behind a ">" overflow indicator. All 4 tabs (Room, Inventory, Users, Files) need to be visible.

## Objective
Fix the tab bar so all 4 tabs AND the collapse chevron fit on one row without clipping.

## Pre-work: Capture "before" screenshot
```bash
node scripts/take-screenshot.mjs tab-clip-before
```

## Files to Read First
- `src/components/tabs.css` — tab bar row layout, tab sizing
- `src/components/tabs.tsx` — tab bar structure, trailingElement
- `src/components/sidebar.css` — sidebar width, collapse button sizing

## Diagnosis
The likely causes:
1. Tab buttons have too much padding, making them too wide to fit with the collapse button
2. The `.tab-bar-row` container doesn't give enough space to the tablist
3. The tablist has `overflow: hidden` or `overflow-x: auto` causing the last tab to scroll out of view
4. Individual tabs have `min-width` or `white-space: nowrap` preventing them from shrinking
5. The sidebar itself may be too narrow

## Fix Approach
The tabs need to be more compact. Options (try in order):

1. **Reduce tab padding** — tabs probably have horizontal padding that can be tightened. Try `padding: var(--space-1) var(--space-2)` or even `padding: var(--space-1) var(--space-1)`
2. **Reduce tab font size** — if tabs use `var(--font-size-sm)`, try `var(--font-size-xs)`
3. **Remove tab gap** — if there's a `gap` on the tablist, reduce it
4. **Make the collapse button smaller** — reduce its padding to bare minimum
5. **Allow tabs to shrink** — ensure tabs have `flex-shrink: 1` and `min-width: 0` and `overflow: hidden; text-overflow: ellipsis`

The goal is: all 4 tab labels fully visible + collapse chevron, all on one row, no clipping.

## Verify
```bash
npx vite build
```

## Post-work: Capture and VISUALLY VERIFY
```bash
node scripts/take-screenshot.mjs tab-clip-after
```

READ both screenshots. Specifically check:
1. Can you see ALL FOUR tab labels: Room, Inventory, Users, Files?
2. Is the collapse chevron still visible at the right end?
3. Are the tab labels fully readable (not truncated with ellipsis)?
4. Does the active tab still have a clear underline?

If any tab is still clipped, DO NOT commit. Try a different approach.

## Commit (only if all 4 tabs visible)
```bash
git add src/components/tabs.css src/components/tabs.tsx src/components/sidebar.css
```
Only add files that were actually modified.
```bash
git commit -m "fix: prevent sidebar tab clipping by compacting tab sizing"
```

## Output
Write your report to `./reports/visual-polish-tab-clipping-fix-report.md` with:
- Root cause
- What was changed
- Before/after screenshot descriptions confirming all 4 tabs visible
- Build result
- Commit hash (or "NOT COMMITTED" if still clipping)

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
