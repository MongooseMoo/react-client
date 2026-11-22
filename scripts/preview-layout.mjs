// Draws a Room.Layout, or one thing's form parts, with the client's own 3D scene code and saves a picture from each
// fixed view: front, three-quarter, side, back and top. Headless: no window is ever shown.
//
//   node scripts/preview-layout.mjs <in.json> <outdir>
//
// <in.json> is a Room.Layout as the game sends it, or {"size": [w, d, h], "form_parts": [...], "name"?, "material"?}
// for one thing (its box in metres, its parts as Room.Layout sends them). Writes <outdir>/<view>.png and prints, per
// thing, how many parts were sent and whether the client draws them; exits 1 when a thing's part list would not be
// drawn (a part the client cannot draw drops the whole list) or the page reports an error. See docs/room-layout.md.
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
const layout = JSON.parse(await readFile(resolve(input), 'utf8'));
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
    console.log(`${thing.id} ${thing.name}: ${thing.parts} parts, ${thing.drawn ? 'drawn' : 'NOT DRAWN (a part the client cannot draw; see docs/room-layout.md)'}`);
    if (!thing.drawn) problems.push(`${thing.id} ${thing.name}: part list not drawn`);
  }
  const canvas = page.locator('canvas');
  for (const view of VIEWS) {
    await page.evaluate((name) => window.preview.view(name), view);
    const path = resolve(outdir, `${view}.png`);
    await canvas.screenshot({ path });
    console.log(path);
  }
} catch (error) {
  problems.push(String(error));
} finally {
  await browser.close();
  await server.close();
}
for (const problem of problems) console.error(problem);
process.exit(problems.length ? 1 : 0);
