# Task: Visual Polish Phase 0 — Branch Setup

## Context
We're starting a multi-phase visual polish effort on a React web client. This is Phase 0: creating the working branch and verifying the dev server can start.

## Objective
Create branch `visual-polish` from current HEAD. Start the dev server in background. Report branch name and dev server status.

## Steps

1. Run `git checkout -b visual-polish` to create the branch from current HEAD
2. Run `npx vite dev 2>&1 | tee dev-server.log` in background to start the dev server
3. Wait a few seconds, then check the log to confirm it started

## Output
Write your report to `./reports/visual-polish-phase-0-report.md` with:
- Branch name
- Dev server status (started/failed)
- Any issues encountered

## CRITICAL: Parallel Swarm Awareness
You may be running alongside other agents in parallel.

**FORBIDDEN GIT COMMANDS - NEVER USE THESE:**
- `git stash` - DESTROYS uncommitted work across the entire repo
- `git restore` - overwrites files
- `git checkout` (for file restore) - overwrites files
- `git reset` - destroys commits/changes
- `git clean` - deletes untracked files

## CRITICAL: File Modified Error Workaround
If Edit/Write fails with "file unexpectedly modified":
1. Read the file again with Read tool
2. Retry the Edit
3. Try path formats: `./relative`, `C:/forward/slashes`, `C:\back\slashes`
4. NEVER use cat, sed, echo - always Read/Edit/Write
5. If all formats fail, STOP and report
