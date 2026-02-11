# Task: Fix Minor Issues — Volume/Autosay Contrast & Sidebar Collapse Button

## Context
We're on branch `visual-polish`. Dev server is running at `http://localhost:5173/`. Two minor issues from the visual checkpoint need fixing before we proceed.

## Objective
Fix two issues:
1. Volume slider and autosay toggle are too subtle / low contrast
2. Sidebar collapse button feels orphaned above tabs

## Pre-work: Capture "before" screenshot
```bash
node scripts/take-screenshot.mjs minor-fix-before
```

## Files to Read First
- `src/components/toolbar.css` — volume and autosay styles
- `src/components/sidebar.css` — collapse button styles
- `src/components/tabs.css` — tab bar layout (collapse button may interact with this)

## Issue 1: Volume Slider and Autosay Toggle Too Subtle

**File:** `src/components/toolbar.css`

The volume slider track and autosay toggle track use `rgba(255,255,255,0.15)` which is too faint against the dark toolbar.

**Volume slider fixes:**
- Slider track background: bump from `rgba(255,255,255,0.15)` to `rgba(255,255,255,0.25)`
- Slider thumb: bump from `var(--color-text-secondary)` to `var(--color-text)` (brighter thumb)
- Consider making the track slightly taller: `height: 5px` instead of `4px` if it's currently 4px

**Autosay toggle fixes:**
- Toggle track background (off state): bump from `rgba(255,255,255,0.15)` to `rgba(255,255,255,0.25)`
- Toggle circle (off state): bump to `var(--color-text)` for better visibility
- Make sure the on state (checked) still uses `var(--color-primary)` with white circle — that should already be fine

## Issue 2: Sidebar Collapse Button Feels Orphaned

**Files:** `src/components/sidebar.css` and possibly `src/components/sidebar.tsx`

The collapse button sits awkwardly above the tab bar. Options to fix:

**Preferred approach:** Integrate the collapse button into the tab bar row. Place it at the far right of the tab bar so the tabs and collapse button share the same horizontal line.

If this requires TSX changes, read `src/components/sidebar.tsx` and `src/components/tabs.tsx` to understand the structure. The collapse button may need to move from the sidebar header into the tab bar area, or the tab bar container needs to be a flex row with the collapse button at the end.

**If moving the button is structurally complex**, fall back to just making it look less orphaned:
- Remove any extra margin/padding above it
- Make it smaller and more compact
- Position it absolutely in the top-right corner of the sidebar with `position: absolute; top: var(--space-2); right: var(--space-2);`
- Make the sidebar header `position: relative` to contain it

Either way, the result should be: the collapse button doesn't look like a lonely orphan floating in space.

## Verify
```bash
npx vite build
```

## Post-work: Capture and VISUALLY VERIFY
```bash
node scripts/take-screenshot.mjs minor-fix-after
```

READ both screenshots (`minor-fix-before` and `minor-fix-after`) with the Read tool. Confirm:

1. **Volume slider** — Is the track visibly brighter/more prominent than before? Is the thumb clearly visible?
2. **Autosay toggle** — Is the toggle track visibly brighter than before? Can you clearly see the pill shape and circle?
3. **Collapse button** — Does it look integrated with the sidebar rather than floating alone? Where is it positioned relative to the tabs?

Describe each in detail. If any fix is NOT visible or NOT an improvement, say so explicitly and DO NOT commit.

## Commit (ONLY if all fixes confirmed visible and improved)
```bash
git add [changed files only]
git commit -m "fix: improve volume/autosay contrast and integrate sidebar collapse button"
```

## Output
Write your report to `./reports/visual-polish-minor-fixes-report.md` with:
- What was changed per issue
- Before/after screenshot descriptions focused on the changed elements
- Whether each fix is confirmed visible and improved
- Build result
- Commit hash (or "NOT COMMITTED" if issues remain)

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
