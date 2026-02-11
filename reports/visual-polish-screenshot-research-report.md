# Visual Polish Screenshot Research Report

## Summary

Playwright is the right tool for capturing screenshots of the running app. The project already has a `playwright.config.ts` and existing visual tests with screenshots, but **Playwright is not installed as a project dependency** -- it needs to be added before it can be used.

---

## What's Already Available

### Playwright Config (`playwright.config.ts`)

A full Playwright config exists at the project root with:
- **Test directory:** `./tests/visual`
- **Base URL:** `http://localhost:5173`
- **Projects:** chromium (Desktop Chrome), webkit (Desktop Safari), mobile-chrome (Pixel 5)
- **Web server:** Configured to run `npm run start` and reuse existing server
- **Reporter:** HTML
- **Screenshot setting:** `only-on-failure` (for test runner; irrelevant for manual scripts)

### Existing Tests (`tests/visual/layout.spec.ts`)

There are 7 visual layout tests already written that:
- Navigate to `/?username=guest&password=guest` for auto-login
- Wait for `.App` selector
- Capture screenshots at various viewport sizes (650px, 768px, 1200px)
- Save to `tests/visual/screenshots/`

### Existing Screenshots (`tests/visual/screenshots/`)

Three screenshots exist from September 10, 2025:
- `sidebar-toggle.png` (481 KB) -- 1200x800 desktop with sidebar, fully logged in
- `layout-650px.png` (126 KB) -- 650px width, login screen
- `layout-mobile.png` (182 KB) -- 768px mobile, logged in state

These show the app's dark theme, toolbar, output area, command input, and status bar.

### Installed Browsers (System-Level)

Multiple Playwright browser versions exist in `%LOCALAPPDATA%\ms-playwright\`:
- **chromium-1200** -- fully installed (has `INSTALLATION_COMPLETE` marker)
- chromium-1194, chromium-1187, chromium-1161, chromium-1129 (older)
- firefox-1495, firefox-1490, firefox-1458
- webkit-2215, webkit-2203, webkit-2051
- ffmpeg-1011, winldd-1007

### What's NOT Available

- **`@playwright/test` is NOT in `package.json`** (not in dependencies or devDependencies)
- **`@playwright/test` is NOT in `package-lock.json`** (zero entries)
- **No playwright packages in `node_modules/`** (the `@playwright/` directory is empty)
- **`npx playwright` works** (v1.58.2 via npm cache/download) but warns about missing project dependencies
- **chromium-1208** (needed by Playwright 1.58.2) is **NOT installed** -- only older chromium-1200 is present

---

## CSS Breakpoints (Relevant to Viewport Choice)

The app has two main responsive breakpoints:
- `768px` -- main layout breakpoint in `App.css`
- `600px` -- input and output component breakpoint

The Playwright config's `Desktop Chrome` device defaults to a **1280x720** viewport, which is a good desktop size.

---

## Recommended Approach

### Setup Steps (One-Time)

1. **Install `@playwright/test` as a dev dependency:**
   ```bash
   npm install --save-dev @playwright/test
   ```

2. **Install matching browsers:**
   ```bash
   npx playwright install chromium
   ```
   This downloads chromium-1208 to match Playwright 1.58.2. Only chromium is needed for screenshot capture (webkit/firefox are optional).

### Screenshot Script

A simple standalone script is the best approach for visual-comparison screenshots. It does not need the full test runner.

**File: `scripts/take-screenshot.js`** (or `.mjs`)

```js
// Usage: npx playwright test --config=playwright.config.ts (not needed)
// Instead, run directly: node scripts/take-screenshot.js [label]
const { chromium } = require('playwright');

(async () => {
  const label = process.argv[2] || 'screenshot';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const dir = 'screenshots';

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    colorScheme: 'dark',
  });
  const page = await context.newPage();

  await page.goto('http://localhost:5173/?username=guest&password=guest');
  await page.waitForSelector('.App');
  await page.waitForTimeout(3000); // Wait for login + content

  // Full page screenshot
  await page.screenshot({
    path: `${dir}/${label}-desktop-${timestamp}.png`,
    fullPage: true,
  });

  // Viewport-only screenshot (what the user actually sees)
  await page.screenshot({
    path: `${dir}/${label}-viewport-${timestamp}.png`,
    fullPage: false,
  });

  await browser.close();
  console.log(`Screenshots saved to ${dir}/`);
})();
```

### Alternative: Using npx Directly (No Install)

If you do not want to add Playwright as a project dependency, `npx` can run it directly since it is cached globally. However, you would still need a matching browser version installed. The `npx playwright screenshot` command is available:

```bash
npx playwright screenshot --viewport-size=1280,800 "http://localhost:5173/?username=guest&password=guest" screenshots/baseline.png
```

This is the simplest one-liner but offers less control (no wait-for-selector, no login delay).

### Recommended: Minimal Test-Runner Approach

Since `playwright.config.ts` already exists, the lightest path is to add a small test file specifically for screenshot capture:

```ts
// tests/visual/capture-baseline.spec.ts
import { test } from '@playwright/test';

test('capture baseline screenshots', async ({ page }) => {
  await page.goto('/?username=guest&password=guest');
  await page.waitForSelector('.App');
  await page.waitForTimeout(3000);

  // Desktop full view
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.screenshot({
    path: 'screenshots/baseline-desktop.png',
    fullPage: true,
  });

  // Mobile view
  await page.setViewportSize({ width: 768, height: 600 });
  await page.screenshot({
    path: 'screenshots/baseline-mobile.png',
    fullPage: true,
  });
});
```

Run with:
```bash
npx playwright test tests/visual/capture-baseline.spec.ts --project=chromium
```

---

## Suggested Screenshot Naming Convention

```
screenshots/{phase}-{view}-{timestamp}.png
```

Examples:
- `screenshots/phase0-baseline-desktop.png`
- `screenshots/phase1-after-desktop.png`
- `screenshots/phase2-after-mobile.png`

For before/after comparison within a phase:
- `screenshots/phase1-before-desktop.png`
- `screenshots/phase1-after-desktop.png`

---

## Viewport Recommendations

| Name | Size | Purpose |
|------|------|---------|
| Desktop | 1280x800 | Primary view, shows sidebar + full toolbar |
| Narrow Desktop | 1024x768 | Tests layout compression |
| Tablet/Breakpoint | 768x600 | At the main CSS breakpoint |
| Mobile | 375x667 | Below 600px breakpoint |

For visual polish comparison, **Desktop (1280x800)** is the most important since it shows all UI elements including the sidebar.

---

## Key Considerations

1. **The app needs a running backend** to show a logged-in state. The screenshots taken at `/?username=guest&password=guest` will auto-login, but the server at the MOO endpoint must be reachable. If the backend is down, screenshots will show the connection/login screen instead.

2. **The 3-second `waitForTimeout`** in existing tests accounts for login + server greeting. This may need adjustment depending on server response time.

3. **`fullPage: true` vs `false`**: Use `fullPage: false` for viewport-accurate screenshots (what the user sees). Use `fullPage: true` to capture overflow content that requires scrolling. For visual polish, `fullPage: false` at a fixed viewport is better for comparison.

4. **Color scheme**: The app is dark-themed. Playwright's `colorScheme: 'dark'` context option ensures OS-level dark mode is respected (for scrollbars, form elements, etc.).

5. **Existing chromium-1200 may work** if Playwright is installed at a version that matches it (around v1.52-1.54). But using the latest (1.58.2) with `npx playwright install chromium` is cleaner.

---

## Bottom Line

**Install `@playwright/test` as a devDependency and run `npx playwright install chromium`.** Then use a simple test file or standalone script to capture screenshots at 1280x800 before and after each visual polish phase. The infrastructure (config, test patterns, auto-login URL) is already in place -- only the npm package and matching browser binary are missing.
