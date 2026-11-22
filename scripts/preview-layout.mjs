// Draws a Room.Layout, or one thing's form parts, with the client's own 3D scene code and saves a picture from each
// fixed view: front, three-quarter, side, back and top. Headless: no window is ever shown.
//
//   node scripts/preview-layout.mjs <in.json> <outdir>
//
// <in.json> is a Room.Layout as the game sends it, or one thing: {"size": [w, d, h], "form_parts": [...], ...}, its
// box in metres and any other keys of a Room.Layout thing (name, material, a person's kind and appearance). Writes
// <outdir>/<view>.png and prints, per thing, how many parts were sent and, when the client would not draw them, which
// part the decoder rejects and why (one such part drops the thing's whole list). Exits 1 then, or on any error; 2 on
// a wrong command line. See docs/room-layout.md, "Previewing forms".
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { createServer } from 'vite';

const [input, outdir] = process.argv.slice(2);
if (!input || !outdir) {
  console.error('Usage: node scripts/preview-layout.mjs <in.json> <outdir>');
  process.exit(2);
}
const VIEWS = ['front', 'three-quarter', 'side', 'back', 'top'];
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let layout;
try {
  layout = JSON.parse(await readFile(resolve(input), 'utf8'));
} catch (error) {
  console.error(`Could not read ${resolve(input)} as JSON: ${error.message}`);
  process.exit(1);
}
await mkdir(resolve(outdir), { recursive: true });

// Port 0: the system picks a free one (a fixed port may be in a range Windows reserves); vite reports the real one.
const server = await createServer({ root, logLevel: 'error', server: { host: '127.0.0.1', port: 0, hmr: false } });
await server.listen();
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
try {
  const page = await (await browser.newContext({ viewport: { width: 960, height: 720 }, deviceScaleFactor: 1 })).newPage();
  page.on('pageerror', (error) => problems.push(`page error: ${error.message}`));
  page.on('console', (message) => { if (message.type() === 'error') problems.push(`console: ${message.text()}`); });
  await page.goto(`${server.resolvedUrls.local[0]}src/preview/layoutPreview.html`);
  await page.waitForFunction(() => window.preview !== undefined, undefined, { timeout: 60000 });
  const { things } = await page.evaluate((data) => window.preview.load(data), layout);
  for (const thing of things) {
    if (thing.problem) {
      console.log(`${thing.id} ${thing.name}: ${thing.parts} parts, NOT DRAWN: ${thing.problem}`);
      problems.push(`${thing.id} ${thing.name}: its parts are not drawn (${thing.problem})`);
    } else console.log(`${thing.id} ${thing.name}: ${thing.parts ? `${thing.parts} parts, ` : ''}drawn`);
  }
  const canvas = page.locator('canvas');
  for (const view of VIEWS) {
    await page.evaluate((name) => window.preview.view(name), view);
    const path = resolve(outdir, `${view}.png`);
    await canvas.screenshot({ path });
    console.log(path);
  }
} catch (error) {
  // The page's own message (a wrong input says what it needs), without the browser's call log.
  problems.push(String(error.message ?? error).split('\n')[0].replace(/^page\.evaluate: (Error: )?/, ''));
} finally {
  await browser.close();
  await server.close();
}
for (const problem of problems) console.error(problem);
process.exit(problems.length ? 1 : 0);
