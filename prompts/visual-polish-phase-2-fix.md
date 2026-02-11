# Task: Fix Phase 2 Toolbar Layout — CRITICAL

## Context
We're on branch `visual-polish`. Dev server is running at `http://localhost:5173/`. The Phase 2 toolbar overhaul broke the layout — buttons are wrapping into a multi-line vertical stack instead of staying on a single horizontal row. This takes up ~20% of the viewport and looks broken.

The goal was: ghost buttons in a single compact horizontal row, grouped with separators. What happened: buttons are stacking vertically.

## Objective
Fix the toolbar so all buttons are on ONE horizontal row. Ghost styling should remain, but the layout must be a single compact line.

## Pre-work: Capture "before" screenshot (showing the broken state)
```bash
node scripts/take-screenshot.mjs phase2-fix-before
```

## Files to Read First
- `src/components/toolbar.css` — read completely
- `src/components/toolbar.tsx` — read completely

## Diagnosis
The likely causes of vertical stacking:
1. The `.toolbar` container may be missing `flex-wrap: nowrap` or may have `flex-wrap: wrap`
2. The `.toolbar` may not have `display: flex` or `flex-direction: row`
3. The toolbar groups/separators may be block-level instead of inline
4. Padding/gap values may be too large, causing overflow and wrapping
5. Button min-width or padding may be too large

## Fix Requirements

The `.toolbar` container MUST have:
```css
display: flex;
flex-direction: row;
align-items: center;
flex-wrap: nowrap;
overflow-x: auto;
gap: var(--space-1);
padding: var(--space-1) var(--space-3);
```

The `.toolbar-group` MUST have:
```css
display: inline-flex;
align-items: center;
gap: var(--space-1);
flex-shrink: 0;
```

The `.toolbar-separator` MUST have:
```css
display: inline-block; /* or just be inline-flex */
flex-shrink: 0;
```

Toolbar buttons should be compact:
```css
padding: var(--space-1) var(--space-2);
white-space: nowrap;
flex-shrink: 0;
```

The `.toolbar-spacer` should push sidebar toggle right:
```css
flex: 1;
min-width: 0;
```

## Key Principle
Everything on one line. If the viewport is too narrow, `overflow-x: auto` allows horizontal scroll rather than wrapping. No wrapping. Ever.

## After Fix
Read through both files one more time to make sure there are no conflicting styles (like a media query adding flex-wrap, or a parent container constraining width).

## Verify
```bash
npx vite build
```

## Post-work: Capture "after" screenshot
```bash
node scripts/take-screenshot.mjs phase2-fix-after
```

Then READ both screenshots with the Read tool (it can read PNG images) and confirm:
1. The toolbar is on ONE horizontal line
2. All buttons are visible
3. The toolbar is compact (not taking up excessive vertical space)
4. If the toolbar is STILL stacking vertically, STOP and report — do not commit

## Commit (only if toolbar is confirmed fixed)
```bash
git add src/components/toolbar.css src/components/toolbar.tsx
git commit -m "fix: toolbar layout - force single horizontal row"
```

## Output
Write your report to `./reports/visual-polish-phase-2-fix-report.md` with:
- What was wrong (root cause)
- What you changed
- Screenshot comparison (describe what before and after look like)
- Build result
- Commit hash (or "NOT COMMITTED" if still broken)

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
