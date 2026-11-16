// Tests only: screenshots of the invented test characters and frame times of the
// 3D view, in headless Chromium (no window). Usage:
//   node tests/visual/avatars/shoot.mjs <output directory> [--gpu]
// --gpu asks headless Chromium for the machine's GPU instead of its software renderer.
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import { createServer } from 'vite';

const out = resolve(process.argv[2] ?? 'screenshots/avatars');
const gpu = process.argv.includes('--gpu');
mkdirSync(out, { recursive: true });

const server = await createServer({ server: { port: 5199, strictPort: true, host: '127.0.0.1' }, logLevel: 'error' });
await server.listen();
const base = 'http://127.0.0.1:5199/tests/visual/avatars/index.html';
const browser = await chromium.launch({
  headless: true,
  args: gpu ? ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] : [],
});
try {
  // Tall enough for every row of figure cells (420 px each), since a clip must lie inside the viewport.
  const page = await browser.newPage({ viewport: { width: 1280, height: 1800 }, colorScheme: 'dark' });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const open = async (query) => {
    await page.goto(`${base}?${query}`);
    await page.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
  };
  const suffix = gpu ? '-gpu' : '';
  if (!gpu) {
    const slug = (name) => name.toLowerCase().replace(/[^a-z]+/g, '-');
    await open('view=portraits');
    await page.locator('table').screenshot({ path: resolve(out, 'portraits.png') });
    // Each character's row at twice the pixels, to read the details.
    const sharp = await browser.newPage({ viewport: { width: 1280, height: 1000 }, colorScheme: 'dark', deviceScaleFactor: 2 });
    await sharp.goto(`${base}?view=portraits`);
    await sharp.waitForFunction(() => window.ready === true);
    for (const row of await sharp.locator('tr').all()) {
      await row.screenshot({ path: resolve(out, `portrait-${slug(await row.locator('td').first().innerText())}.png`) });
    }
    await sharp.close();
    // The player card in a 276 px side panel: is the name whole, and how many lines does the label take?
    const card = await browser.newPage({ viewport: { width: 400, height: 300 }, colorScheme: 'dark', deviceScaleFactor: 2 });
    await card.goto(`${base}?view=card`);
    await card.waitForFunction(() => window.ready === true);
    await card.locator('.player-card').screenshot({ path: resolve(out, 'player-card-276.png') });
    const cardFit = await card.evaluate(() => {
      const name = document.querySelector('.player-name');
      const label = document.querySelector('.player-label');
      const lineHeight = Number.parseFloat(getComputedStyle(label).lineHeight) || Number.parseFloat(getComputedStyle(label).fontSize) * 1.2;
      return {
        nameWhole: name.scrollWidth <= name.clientWidth,
        nameWidth: name.clientWidth,
        labelLines: Math.round(label.getBoundingClientRect().height / lineHeight),
        readingOrder: [...document.querySelectorAll('.player-card *')].filter((e) => !e.closest('[aria-hidden="true"]') && e.childElementCount === 0).map((e) => e.getAttribute('aria-label') ?? e.textContent),
      };
    });
    console.log('player card at 276 px:', JSON.stringify(cardFit));
    await card.close();
    await open('view=plan');
    await page.locator('svg.room-layout-svg, svg').first().screenshot({ path: resolve(out, 'plan-tokens.png') });
    for (const zoom of ['body', 'head']) {
      for (const angle of ['front', 'three']) {
        await open(`view=figures&angle=${angle}&zoom=${zoom}`);
        const grid = page.locator('#root > div');
        const name = zoom === 'head' ? `heads-${angle}` : `figures-${angle}`;
        await grid.screenshot({ path: resolve(out, `${name}.png`) });
        if (zoom === 'head') continue;
        const box = await grid.boundingBox();
        const names = await page.locator('#root > div > div').allInnerTexts();
        for (const [i, who] of names.entries()) {
          const clip = { x: box.x + (i % 4) * 300, y: box.y + Math.floor(i / 4) * 420, width: 300, height: 420 };
          await page.screenshot({ path: resolve(out, `figure-${angle}-${slug(who)}.png`), clip });
        }
      }
    }
  }
  // Keyboard zoom: focus the 3D picture, press + and -, and see whether the picture changes.
  if (!gpu) {
    for (const [mode, size] of [['dollhouse', 50], ['dollhouse', 0], ['eyes', 50]]) {
      await open(`view=room&n=8&mode=${mode}${size ? `&size=${size}` : ''}`);
      const pic = page.locator('.room-layout-3d');
      await pic.focus();
      const focused = await page.evaluate(() => document.activeElement?.className);
      const tag = `${mode}${size ? `-${size}m` : ''}`;
      const shots = {};
      for (const [step, key, times] of [['start', null, 0], ['plus10', '+', 10], ['plus30', '+', 20], ['minus10', '-', 30]]) {
        for (let i = 0; i < times; i++) await page.keyboard.press(key);
        await page.waitForTimeout(150);
        shots[step] = await pic.screenshot({ path: resolve(out, `zoom-${tag}-${step}.png`) });
      }
      if (tag === 'dollhouse-50m') {
        // The wheel with the pointer on the people (where the start shot shows them), zooming toward them.
        await page.keyboard.press('0');
        const box = await pic.boundingBox();
        await page.mouse.move(box.x + box.width * 0.49, box.y + box.height * 0.505);
        for (let i = 0; i < 40; i++) await page.mouse.wheel(0, -100);
        await page.waitForTimeout(300);
        await pic.screenshot({ path: resolve(out, `zoom-${tag}-wheel-on-people.png`) });
      }
      if (tag === 'dollhouse-50m') {
        // With a "you" (#p7, the right end of the front row): + heads for your own face.
        await open('view=room&n=8&mode=dollhouse&size=50&you=%23p7');
        await pic.focus();
        for (let i = 0; i < 30; i++) await page.keyboard.press('+');
        await page.waitForTimeout(300);
        await pic.screenshot({ path: resolve(out, `zoom-${tag}-plus30-toward-you.png`) });
      }
      const same = (a, b) => Buffer.compare(shots[a], shots[b]) === 0;
      console.log(`zoom ${tag}: focused=${focused} start=plus10:${same('start', 'plus10')} plus10=plus30:${same('plus10', 'plus30')} start=minus10:${same('start', 'minus10')}`);
    }
  }
  const results = [];
  for (const n of [8, 40]) {
    await open(`view=room&n=${n}`);
    await page.waitForTimeout(500);
    await page.locator('.room-layout-3d').screenshot({ path: resolve(out, `dollhouse-${n}${suffix}.png`) });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Profiler.enable');
    await cdp.send('Profiler.start');
    results.push(await page.evaluate(() => window.measure(4)));
    const { profile } = await cdp.send('Profiler.stop');
    // Self time by function, from the CPU profile's samples.
    const byId = new Map(profile.nodes.map((node) => [node.id, node]));
    const self = new Map();
    const dt = (profile.endTime - profile.startTime) / profile.samples.length / 1000;
    for (const id of profile.samples) {
      const { functionName, url, lineNumber } = byId.get(id).callFrame;
      const key = `${functionName || '(anonymous)'} ${url.split('/').pop()}:${lineNumber + 1}`;
      self.set(key, (self.get(key) ?? 0) + dt);
    }
    results.at(-1).topSelfMs = [...self].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, ms]) => `${ms.toFixed(0)} ms ${k}`);
  }
  writeFileSync(resolve(out, `frames${suffix}.json`), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  if (errors.length) console.log('page errors:', errors);
} finally {
  await browser.close();
  await server.close();
}
