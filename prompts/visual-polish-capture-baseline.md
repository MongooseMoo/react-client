# Task: Capture Phase 0 Baseline and Phase 1 After Screenshots

## Context
We're on branch `visual-polish`. Dev server is running at `http://localhost:5173/` with hot reload. Phase 1 changed CSS tokens in `src/App.css` (commit `732656a`). The commit before that is the branch setup (no code changes), and the original master state is `90e42d3`.

We need a "before any changes" screenshot and a clean "after Phase 1" screenshot.

The screenshot script is at `scripts/take-screenshot.mjs`. Usage: `node scripts/take-screenshot.mjs <label>` → produces `screenshots/<label>-desktop.png`

## Objective
Capture two screenshots:
1. `phase0-baseline` — the app as it looked before Phase 1 changes
2. `phase1-after` — the app as it looks now after Phase 1

## Steps

### 1. Save current App.css
Read `src/App.css` and save its full content — you'll need to restore it exactly.

### 2. Get the original App.css
Run: `git show 90e42d3:src/App.css`
This outputs the file content as it was on master before any changes. Save this output.

### 3. Temporarily replace App.css with original
Write the original content to `src/App.css`. Vite will hot-reload automatically.

### 4. Wait and capture Phase 0 baseline
Wait 3 seconds for hot reload, then:
```bash
node scripts/take-screenshot.mjs phase0-baseline
```
Verify `screenshots/phase0-baseline-desktop.png` exists and has non-zero size.

### 5. Restore current App.css
Write back the saved Phase 1 version of App.css. Vite will hot-reload again.

### 6. Wait and capture Phase 1 after
Wait 3 seconds for hot reload, then:
```bash
node scripts/take-screenshot.mjs phase1-after
```
Verify `screenshots/phase1-after-desktop.png` exists and has non-zero size.

### 7. Verify App.css is back to Phase 1 state
Run `git diff src/App.css` — there should be NO diff (the file should be exactly as it was before this task). If there IS a diff, something went wrong — report it immediately and do NOT commit.

## Output
Write your report to `./reports/visual-polish-capture-baseline-report.md` with:
- File sizes of both screenshots
- Whether App.css was restored cleanly (git diff result)
- Any issues

Do NOT commit anything. This task only captures screenshots (which are gitignored).

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
