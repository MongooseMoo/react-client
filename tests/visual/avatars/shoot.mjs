// Tests only: screenshots of the invented test characters and frame times of the
// 3D view, in headless Chromium (no window). Usage:
//   node tests/visual/avatars/shoot.mjs <output directory> [--gpu] [--view3d] [--pinch] [--vocab]
// --gpu asks headless Chromium for the machine's GPU instead of its software renderer.
// --vocab shoots the game's vocabulary (a portrait per value, builds and beard lengths in 3D)
// instead of the test characters and zoom checks; frame times are measured either way.
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import { createServer } from 'vite';

const out = resolve(process.argv[2] ?? 'screenshots/avatars');
const gpu = process.argv.includes('--gpu');
const vocab = process.argv.includes('--vocab');
// --view3d shoots only the 3D view's zoom, turn and label sequence (then the frame timing).
const view3d = process.argv.includes('--view3d');
// --pinch shoots only a touch pinch and one-finger turn in the Dollhouse (then the frame timing).
const pinch = process.argv.includes('--pinch');
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
  if (vocab) {
    // One picture per vocabulary field (a portrait per value), then every build and beard length in 3D.
    const sharp = await browser.newPage({ viewport: { width: 1600, height: 1000 }, colorScheme: 'dark', deviceScaleFactor: 2 });
    await sharp.goto(`${base}?view=vocab`);
    await sharp.waitForFunction(() => window.ready === true);
    for (const table of await sharp.locator('table[data-field]').all()) {
      await table.screenshot({ path: resolve(out, `vocab-${(await table.getAttribute('data-field')).replace(/[^a-z_]+/g, '-')}.png`) });
    }
    await sharp.close();
    // Seven rows of 420 px cells: a page tall enough to hold them all.
    const tall = await browser.newPage({ viewport: { width: 1280, height: 3000 }, colorScheme: 'dark' });
    for (const [zoom, angle] of [['body', 'front'], ['head', 'front'], ['head', 'three'], ['head', 'back']]) {
      await tall.goto(`${base}?view=figures&angle=${angle}&zoom=${zoom}&set=vocab`);
      await tall.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
      await tall.locator('#root > div').screenshot({ path: resolve(out, `vocab-figures-${zoom}-${angle}.png`) });
    }
    await tall.close();
  }
  if (pinch) {
    // A phone player in the 50 m room: two fingers pinch outward over Cleo (#p2, facing away), then one
    // finger drags sideways to turn. Touches go through CDP Input.dispatchTouchEvent, as a touch screen's would.
    const phone = await browser.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: 'dark', hasTouch: true });
    await phone.goto(`${base}?view=room&n=8&size=50&spread=6&face=north&mode=dollhouse`);
    await phone.waitForFunction(() => window.ready === true);
    const pic = phone.locator('.room-layout-3d');
    const cdp = await phone.context().newCDPSession(phone);
    const touch = (type, points) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points.map(([x, y, id]) => ({ x, y, id })) });
    const at = await phone.evaluate(() => window.screenOf('#p2'));
    await pic.screenshot({ path: resolve(out, 'p-start.png') });
    await touch('touchStart', [[at.x - 5, at.y, 1]]);
    await touch('touchStart', [[at.x - 5, at.y, 1], [at.x + 5, at.y, 2]]);
    for (let i = 1; i <= 40; i++) {
      await touch('touchMove', [[at.x - 5 - i * 5, at.y, 1], [at.x + 5 + i * 5, at.y, 2]]);
      if (i === 20) await pic.screenshot({ path: resolve(out, 'p-pinch-half.png') });
    }
    await pic.screenshot({ path: resolve(out, 'p-pinched.png') });
    // Lift the second finger (CDP's touchEnd releases the points it lists); the first drags right, turning the view.
    await touch('touchEnd', [[at.x + 205, at.y, 2]]);
    for (let i = 1; i <= 24; i++) {
      await touch('touchMove', [[at.x - 205 + i * 15, at.y, 1]]);
      if (i % 8 === 0) await pic.screenshot({ path: resolve(out, `p-turn${i * 15}px.png`) });
    }
    await touch('touchEnd', [[at.x + 155, at.y, 1]]);
    await phone.close();
  }
  if (view3d) {
    // Getting a person's face into view in the Dollhouse, and where labels sit (both 3D views).
    const room = 'view=room&n=8&size=50&spread=6&face=north&mode=dollhouse';
    const wheelOn = async (pic, id, steps, tag, every) => {
      const at = await page.evaluate((who) => window.screenOf(who), id);
      await page.mouse.move(at.x, at.y);
      for (let i = 1; i <= steps; i++) {
        await page.mouse.wheel(0, -100);
        await page.waitForTimeout(20);
        if (every.includes(i)) await pic.screenshot({ path: resolve(out, `${tag}-wheel${i}.png`) });
      }
    };
    // 1, 2 and 4: wheel onto Bram (#p1, 9 m from the middle, facing away), then turn with the arrow keys.
    await open(room);
    let pic = page.locator('.room-layout-3d');
    await pic.screenshot({ path: resolve(out, 'd1-start.png') });
    // --wheel=N: how many wheel steps before turning (default 22).
    const steps = Number(process.argv.find((a) => a.startsWith('--wheel='))?.slice(8) ?? '22');
    // --who=#pN: whom to zoom onto (default Bram, #p1).
    const who = process.argv.find((a) => a.startsWith('--who='))?.slice(6) ?? '#p1';
    await wheelOn(pic, who, steps, 'd1', [10, 15, 20, 25, 30, 40, 50, 60].filter((n) => n <= steps));
    await pic.focus();
    for (let i = 1; i <= 18; i++) {
      await page.keyboard.press('ArrowLeft');
      if ([3, 6, 9, 12, 18].includes(i)) await pic.screenshot({ path: resolve(out, `d1-turn${i * 10}deg.png`) });
    }
    for (let i = 1; i <= 4; i++) await page.keyboard.press('ArrowDown');
    await pic.screenshot({ path: resolve(out, 'd1-turn180deg-down4.png') });
    // Down near eye level, then three notches closer (the pointer has not moved, so still onto the same face).
    for (let i = 1; i <= 4; i++) await page.keyboard.press('ArrowDown');
    await pic.screenshot({ path: resolve(out, 'd1-turn180deg-down8.png') });
    for (let i = 1; i <= 3; i++) await page.mouse.wheel(0, -100);
    await page.waitForTimeout(100);
    await pic.screenshot({ path: resolve(out, 'd1-front-close.png') });
    await page.keyboard.press('0');
    await pic.screenshot({ path: resolve(out, 'd1-reset0.png') });
    // 4: the same 20 wheel steps in the 5 m room, on the same person.
    await open('view=room&n=8&mode=dollhouse&face=north');
    pic = page.locator('.room-layout-3d');
    await wheelOn(pic, '#p1', 25, 'd4-5m', [10, 20, 25]);
    // 3: the 276 px side panel at 3x, as the live guest saw it: Your eyes among people, and the Dollhouse with you by a wall.
    const narrow = await browser.newPage({ viewport: { width: 400, height: 500 }, colorScheme: 'dark', deviceScaleFactor: 3 });
    for (const [tag, query] of [
      ['d3-eyes-276', 'view=room&n=24&size=50&spread=6&mode=eyes&width=276&you=%23p3'],
      ['d3-doll-276', 'view=room&n=8&size=50&spread=10&mode=dollhouse&width=276&you=%23p7'],
      ['d3-doll-960', 'view=room&n=8&size=50&spread=10&mode=dollhouse&width=960&you=%23p7'],
    ]) {
      await narrow.goto(`${base}?${query}`);
      await narrow.waitForFunction(() => window.ready === true);
      await narrow.waitForTimeout(300);
      await narrow.locator('.room-layout-3d').screenshot({ path: resolve(out, `${tag}.png`) });
      // Each shown label's centre and its figure's anchor, in CSS pixels within the picture.
      const labels = await narrow.evaluate(() => {
        const frame = document.querySelector('.room-layout-3d').getBoundingClientRect();
        return [...document.querySelectorAll('.rl3d-label')]
          .filter((e) => e.style.display !== 'none' && getComputedStyle(e).display !== 'none')
          .map((e) => {
            const r = e.getBoundingClientRect();
            return { text: e.textContent, x0: Math.round(r.left - frame.left), x1: Math.round(r.right - frame.left), y0: Math.round(r.top - frame.top), y1: Math.round(r.bottom - frame.top), moved: e.style.translate };
          });
      });
      console.log(tag, JSON.stringify(labels));
    }
    await narrow.close();
  }
  if (!gpu && !view3d && !pinch && !vocab) {
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
  if (!gpu && !view3d && !pinch && !vocab) {
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
