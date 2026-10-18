# Task: Visual Polish Phase 1 — Design Tokens & Global Polish

## Context
We're on branch `visual-polish`. This phase updates design tokens in App.css to soften borders and add custom scrollbar styling. These token changes are the foundation for all subsequent phases.

## Objective
Update CSS custom properties and add scrollbar styles in `src/App.css`.

## Files to Read First
- `src/App.css` — read this completely before making any changes

## Changes to Make in `src/App.css`

### 1. Update existing border tokens
Find and replace these CSS custom property values (they are in `:root` or a theme block):

- `--color-border` — change its value to `rgba(255,255,255,0.06)`
- `--color-border-light` — change its value to `rgba(255,255,255,0.03)`
- `--color-border-strong` — change its value to `rgba(255,255,255,0.10)`

### 2. Add new tokens
Add these new custom properties near the other border/color tokens:

```css
--color-separator: rgba(255,255,255,0.08);
--toolbar-height: 44px;
```

### 3. Add custom scrollbar styles
Add these styles at the end of the file (or in a logical location for global styles):

```css
/* Custom scrollbar */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.15) transparent;
}

*::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.15);
  border-radius: 3px;
}

*::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.25);
}
```

## Verify
Run `npx vite build` and confirm it completes with no errors.

## Commit
After verification:
1. `git add src/App.css`
2. `git commit -m "style: soften borders and add custom scrollbar"`
3. Record the commit hash

## Output
Write your report to `./reports/visual-polish-phase-1-report.md` with:
- What changed (list each token change)
- Commit hash
- Build result (pass/fail)
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
