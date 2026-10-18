# Task: Final Stage, Commit, and Checkpoint

## Context
We're on branch `visual-polish`. All phase work has been committed in individual commits. There may be unstaged/untracked files (prompts, reports, etc.) that need handling. Then we need a final visual checkpoint.

## Part 1: Stage and Commit

### Step 1: Check git status
Run `git status` to see if there's any uncommitted work.

### Step 2: Stage and commit if needed
- If there are modified tracked files that haven't been committed, stage and commit them
- The `prompts/` and `reports/` directories contain our work logs — stage and commit those:
  ```bash
  git add prompts/ reports/
  git commit -m "chore: add visual polish prompts and reports"
  ```
- The `scripts/take-screenshot.mjs` should already be committed. If not, add it.
- Do NOT commit `screenshots/` (should be gitignored)
- Do NOT commit any temp files, build artifacts, or node_modules
- If CLAUDE.md was modified and not yet committed, include it

### Step 3: Verify clean state
Run `git status` again. The working tree should be clean (aside from gitignored files and pre-existing untracked files that aren't ours).

Run `git log --oneline -15` to show the full commit history on this branch.

## Part 2: Final Visual Checkpoint

### Step 4: Capture final screenshot
```bash
node scripts/take-screenshot.mjs final-verified
```

### Step 5: Read and review
Read both images with the Read tool:
- `C:\Users\Q\code\react-client\screenshots\final-verified-desktop.png`
- `C:\Users\Q\code\react-client\screenshots\phase0-baseline-desktop.png`

### Step 6: Describe the final state

**Toolbar:** List every control. Are separators visible? Is Disconnect red? Is autosay a toggle? Is volume styled?

**Sidebar:** Are ALL tabs visible (Room, Inventory, Users, Files, Audio)? Is the collapse chevron at the end? Is the active tab clearly indicated? Are sections well-spaced? Exit buttons dark-themed?

**Output:** Full-bleed, no border/radius?

**Input:** Blends in, no container border?

**Status bar:** Green dot visible?

**Overall:** Rate 1-10. Any remaining issues?

## Output
Write to `./reports/visual-polish-final-verified-report.md` with:
- Git status (clean or not)
- Full commit log
- Detailed visual description
- Final rating
- Any remaining issues

## CRITICAL: Parallel Swarm Awareness
**FORBIDDEN GIT COMMANDS - NEVER USE THESE:**
- `git stash`, `git restore`, `git checkout` (for files), `git reset`, `git clean`
