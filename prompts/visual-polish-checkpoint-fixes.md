# Task: Fix Checkpoint Issues — Tabs, Sidebar Spacing, Toolbar Separators

## Context
We're on branch `visual-polish`. Dev server is running at `http://localhost:5173/`. Visual review identified 3 issues that need fixing before we proceed.

## Objective
Fix three specific visual issues identified in the checkpoint review.

## Pre-work: Capture "before" screenshot
```bash
node scripts/take-screenshot.mjs checkpoint-fix-before
```

## Files to Read First
- `src/components/tabs.css` — for tab active state fix
- `src/components/RoomInfoDisplay.css` — for sidebar section spacing
- `src/components/toolbar.css` — for separator visibility
- `src/components/toolbar.tsx` — to verify separators are in the markup

## Issue 1: Sidebar Tab Active State Too Subtle

**Problem:** The active tab is barely distinguishable from inactive tabs. Need a bold, unmistakable active indicator.

**File:** `src/components/tabs.css`

**Fix:**
- Active tab text: `color: var(--color-text)` with `font-weight: 600`
- Active tab underline: `border-bottom: 2px solid var(--color-primary)` — make sure this is actually rendering. Check if the underline is implemented via `border-bottom` on the tab itself or via an `::after` pseudo-element. Either way, ensure it's 2px, solid, and uses `var(--color-primary)`.
- If the tab uses an `::after` pseudo-element for the underline, make sure it has: `content: ''`, `position: absolute`, `bottom: 0`, `left: 0`, `right: 0`, `height: 2px`, `background: var(--color-primary)`. And the tab itself has `position: relative`.
- Inactive tabs: `color: var(--color-text-tertiary)` — should be noticeably dimmer than active

## Issue 2: Sidebar Content Sections Need Breathing Room

**Problem:** EXITS, CONTENTS, PLAYERS IN ROOM sections feel cramped together.

**File:** `src/components/RoomInfoDisplay.css`

**Fix:**
- Add `margin-top: var(--space-4)` (or `var(--space-3)` minimum) between sections
- Look for the section containers (likely divs wrapping each section header + content) and add spacing between them
- If sections use a class, add margin. If they're just sequential elements, use `+ .section-class` or similar adjacent sibling selector
- Section headers should have `margin-bottom: var(--space-2)` to separate them from their content
- Overall: each section block should feel like a distinct visual group with clear whitespace above it

## Issue 3: Toolbar Separators Not Visible

**Problem:** The `.toolbar-separator` dividers between button groups are not appearing visually despite being in the CSS.

**Files:** `src/components/toolbar.css` and `src/components/toolbar.tsx`

**Diagnosis steps:**
1. Check `toolbar.tsx` — are `<div className="toolbar-separator" />` elements actually in the JSX?
2. Check `toolbar.css` — does `.toolbar-separator` have a visible style? It should be:
   ```css
   .toolbar-separator {
     width: 1px;
     height: 20px;
     background: var(--color-separator);
     margin: 0 var(--space-2);
     flex-shrink: 0;
   }
   ```
3. Check if `--color-separator` is defined in App.css (it should be `rgba(255,255,255,0.08)` from Phase 1)
4. The separator might be too transparent. If `0.08` opacity is invisible, bump to `rgba(255,255,255,0.15)`

**Fix:** Ensure separators are in the markup AND have visible styling. If they exist but are too faint, increase the opacity. The separators should be subtle but definitely visible — a thin vertical line between button groups.

## Verify
```bash
npx vite build
```

## Post-work: Capture and visually verify
```bash
node scripts/take-screenshot.mjs checkpoint-fix-after
```

Then READ both screenshots (`checkpoint-fix-before` and `checkpoint-fix-after`) with the Read tool and confirm:
1. Active tab is clearly distinguishable (bold text + colored underline visible)
2. Sidebar sections have visible breathing room between them
3. Toolbar has visible thin vertical lines between button groups

Describe what you see in detail in your report. If any of the 3 fixes are NOT visible, say so explicitly.

## Commit (only if all 3 fixes confirmed visible)
```bash
git add src/components/tabs.css src/components/RoomInfoDisplay.css src/components/toolbar.css src/components/toolbar.tsx
```
Only add files that were actually modified.
```bash
git commit -m "fix: improve tab active state, sidebar spacing, and toolbar separators"
```

If `src/App.css` was modified (e.g. changing --color-separator), include it in the commit too.

## Output
Write your report to `./reports/visual-polish-checkpoint-fixes-report.md` with:
- Root cause for each issue
- What was changed
- Visual verification (describe before/after screenshots)
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
