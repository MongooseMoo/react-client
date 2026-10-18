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
