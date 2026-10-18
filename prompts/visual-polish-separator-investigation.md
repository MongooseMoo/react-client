# Task: Investigate Toolbar Separators — Are They Actually Visible?

## Context
We're on branch `visual-polish`. Dev server is running at `http://localhost:5173/`. We fixed toolbar separators by bumping `--color-separator` from 8% to 18% opacity (commit `adf88fc`). One subagent confirmed they were visible. A later subagent says they can't see them. Something is off.

## Objective
Determine definitively whether the toolbar separators are rendering. If not, find out why and fix it.

## Investigation Steps

### Step 1: Verify the code is correct
Read these files and report what you find:

1. **`src/App.css`** — Find `--color-separator`. What is its current value? Is it `rgba(255,255,255,0.18)` or something else?

2. **`src/components/toolbar.tsx`** — Find every instance of `toolbar-separator`. How many are there? Are they `<div className="toolbar-separator" />` elements? Where exactly are they in the JSX tree? List each one and what buttons it sits between.

3. **`src/components/toolbar.css`** — Find the `.toolbar-separator` rule. What are its exact styles? Is there anything that could hide it (display: none, opacity: 0, visibility: hidden, height: 0, etc.)?

### Step 2: Check for CSS conflicts
Look for any other rules that might override the separator:
- Is there a `.toolbar > *` or `.toolbar div` rule that might set background: transparent?
- Is there a media query that hides separators?
- Is `.toolbar-separator` inside `.toolbar-group` in the DOM? If so, does `.toolbar-group` overflow: hidden or clip it?

### Step 3: Take a fresh screenshot and inspect
```bash
node scripts/take-screenshot.mjs separator-investigation
```

Read the screenshot with the Read tool. Look SPECIFICALLY at the toolbar area. Between the button groups, can you see ANY thin vertical lines? Describe exactly what you see between each group of buttons. Be precise — "I see a 1px gray line between Clear Log and Preferences" or "I see only empty space between Clear Log and Preferences."

### Step 4: If separators are NOT visible, try a diagnostic fix
If you can't see them, try making them VERY obvious temporarily to confirm the elements exist:

Edit `src/components/toolbar.css` and change `.toolbar-separator` to:
```css
.toolbar-separator {
  width: 2px;
  height: 24px;
  background: red;
  margin: 0 var(--space-2);
  flex-shrink: 0;
}
```

Take another screenshot:
```bash
node scripts/take-screenshot.mjs separator-diagnostic
```

Read it. Can you see RED lines in the toolbar now?

- If YES → the elements exist but were too subtle. Restore the separator to a reasonable visible style (not red, but visible). Use `rgba(255,255,255,0.25)` or even `rgba(255,255,255,0.3)` for the background.
- If NO → the separator elements are not rendering at all. There's a structural problem in the TSX or a CSS rule hiding them. Report what you found.

### Step 5: Final state
Whatever the fix is, ensure:
1. Separators are visible in the final screenshot (describe them)
2. `npx vite build` passes
3. The diagnostic red color is NOT left in place

### Step 6: Commit if changed
If you made changes:
```bash
git add [changed files]
git commit -m "fix: ensure toolbar separators are visible"
```

If no changes were needed (separators were actually visible all along), report that.

## Output
Write your investigation findings to `./reports/visual-polish-separator-investigation-report.md` with:
- What `--color-separator` value is in App.css
- How many separator elements are in toolbar.tsx and where
- What the CSS rule says
- Whether separators were visible in the screenshot
- If not, what was wrong and what you did to fix it
- Final screenshot description confirming visibility
- Commit hash if changed

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
