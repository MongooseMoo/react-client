# Task: Research Screenshot Approach for Visual Baseline

## Context
We're doing visual polish on a React web client. Dev server is running at `http://localhost:5173/`. We need to capture screenshots before and after each phase so we can visually compare changes. The app is a dark-themed MUD/game client with a toolbar, sidebar, output area, input area, and status bar.

## Objective
Research and recommend the best approach to capture full-page screenshots of the running app for visual comparison. We need something that:
- Works from the command line (subagents will run it)
- Can capture the full page at `http://localhost:5173/`
- Produces PNG files we can compare
- Is quick to set up (not a full test suite)

## Things to Investigate

1. **Playwright** — there's already a `playwright.config.ts` in the project root. Check if Playwright is already installed/configured. If so, this is the obvious choice.
   - Read `playwright.config.ts`
   - Check `package.json` for playwright dependency
   - Determine if browsers are installed (`npx playwright install` status)

2. **Simple Playwright script** — Could we just write a one-off script like:
   ```js
   const { chromium } = require('playwright');
   (async () => {
     const browser = await chromium.launch();
     const page = await browser.newPage();
     await page.goto('http://localhost:5173/');
     await page.screenshot({ path: 'screenshots/baseline.png', fullPage: true });
     await browser.close();
   })();
   ```

3. **Viewport size** — What viewport makes sense? The app has a sidebar so we probably want something wide like 1280x800.

4. **Multiple screenshots?** — Should we capture different states (e.g., with sidebar open/closed)?

## Files to Check
- `playwright.config.ts` — existing config
- `package.json` — dependencies
- `tests/` directory — existing test patterns

## Output
Write your findings and recommendation to `./reports/visual-polish-screenshot-research-report.md` with:
- What's already available (Playwright installed? Browsers?)
- Recommended approach (exact command/script)
- Any setup steps needed
- Suggested screenshot naming convention

Do NOT install anything or make changes. Research only.

## CRITICAL: Parallel Swarm Awareness
**FORBIDDEN GIT COMMANDS - NEVER USE THESE:**
- `git stash`, `git restore`, `git checkout` (for files), `git reset`, `git clean`
