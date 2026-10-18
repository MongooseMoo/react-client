# Task: Screenshot POC — Install, Capture Baseline, Document

## Context
We're on branch `visual-polish`. Dev server is running at `http://localhost:5173/`. Phase 1 (design tokens) is already committed. We need a working screenshot setup to capture before/after visuals for each remaining phase.

There's an existing `playwright.config.ts` and `tests/visual/layout.spec.ts` in the project. Playwright is NOT installed as a dependency — it needs to be added.

**IMPORTANT**: The app requires a running backend MUD server to show a logged-in state. The auto-login URL `/?username=guest&password=guest` will attempt to connect. If the backend is not running, the app will show a disconnected/login state — that's fine for our purposes, we capture whatever state the app is in.

## Objective
1. Install Playwright and chromium browser
2. Write a simple screenshot capture script
3. Capture baseline screenshots of current state
4. Document the screenshot workflow in CLAUDE.md

## Steps

### 1. Install Playwright
```bash
npm install --save-dev @playwright/test
npx playwright install chromium
```

### 2. Create screenshot directory
```bash
mkdir -p screenshots
```

### 3. Write screenshot script
Create `scripts/take-screenshot.mjs`:

```js
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const label = process.argv[2] || 'screenshot';
const dir = 'screenshots';

mkdirSync(dir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  colorScheme: 'dark',
});
const page = await context.newPage();

try {
  await page.goto('http://localhost:5173/?username=guest&password=guest', {
    waitUntil: 'networkidle',
    timeout: 10000,
  });
} catch (e) {
  // Page may not reach networkidle if websocket stays open, that's OK
}

// Wait for app to render
try {
  await page.waitForSelector('.App', { timeout: 5000 });
} catch (e) {
  console.log('Warning: .App selector not found, capturing anyway');
}

// Extra wait for animations/transitions
await page.waitForTimeout(2000);

await page.screenshot({
  path: `${dir}/${label}-desktop.png`,
  fullPage: false,
});

console.log(`Screenshot saved: ${dir}/${label}-desktop.png`);

await browser.close();
```

### 4. Test it
```bash
node scripts/take-screenshot.mjs phase1-current
```

Verify that `screenshots/phase1-current-desktop.png` exists and is a valid image (non-zero file size).

### 5. Document in CLAUDE.md
Read the existing `CLAUDE.md` in the project root (NOT the global one at ~/.claude/CLAUDE.md).

Append a section to the project CLAUDE.md:

```markdown

## Visual Screenshots

Screenshot tool for visual comparison during UI work:
- Script: `scripts/take-screenshot.mjs`
- Usage: `node scripts/take-screenshot.mjs <label>`
- Output: `screenshots/<label>-desktop.png` (1280x800 viewport)
- Requires: Dev server running at localhost:5173
- Auto-login: Uses `?username=guest&password=guest`
- Screenshots dir is gitignored (do not commit screenshots)
```

Also make sure `screenshots/` is in `.gitignore` (add it if not present).

### 6. Commit
```bash
git add scripts/take-screenshot.mjs package.json package-lock.json .gitignore
git commit -m "chore: add screenshot capture script for visual comparison"
```

If CLAUDE.md was modified, include it in the commit too.

Do NOT add `screenshots/` directory or its contents to git.

## Output
Write your report to `./reports/visual-polish-screenshot-poc-report.md` with:
- Whether Playwright installed successfully
- Whether screenshot was captured (file size)
- Commit hash
- Any issues

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
