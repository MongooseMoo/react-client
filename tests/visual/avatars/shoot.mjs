// Tests only: screenshots of the invented test characters and frame times of the
// 3D view, in headless Chromium (no window). Usage:
//   node tests/visual/avatars/shoot.mjs <output directory> [--gpu] [--view3d] [--pinch] [--vocab] [--labels3d] [--face] [--zoomlabel] [--plans] [--forms] [--tiny]
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
// --labels3d shoots labels against heads in both 3D views and the wheel onto a person from near them
// (options --dsf=N, --raw-wheel, --only=eyes|face|near; then the frame timing).
const labels3d = process.argv.includes('--labels3d');
// --face shoots the face, beard and hair readability set (portraits and 3D heads), then the frame timing.
const face = process.argv.includes('--face');
// --set=NAME: the harness character set --face shoots (default face; round3 for the hair, ears and budget checks).
const faceSet = process.argv.find((a) => a.startsWith('--set='))?.slice(6) ?? 'face';
// --only=TEXT: only the characters of the set whose name contains TEXT.
const onlyQuery = (() => {
  const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7);
  return only ? `&only=${encodeURIComponent(only)}` : '';
})();
// --zoomlabel shoots the wheel with the pointer under people's labels in the live check's room, then the frame timing.
const zoomLabel = process.argv.includes('--zoomlabel');
// --plans shoots the body plans (set=plans): portraits, plan tokens, whole figures front, three-quarters and side.
const plans = process.argv.includes('--plans');
// --forms shoots the forms in the boxes the game sent on 2026-11-20 (set=forms): a Dollhouse overview of a 10 m room,
// the wheel under each animal's label and a quarter turn, each figure framed by what is drawn, and the portraits.
const forms = process.argv.includes('--forms');
// --tiny shoots the animal forms in their real-size boxes (set=sizes): each figure framed front, three-quarters and
// side; a Dollhouse overview of a 10 m room; the wheel under each one's label (and on the bird) at 12, 20 and 30
// notches, a quarter and a half turn, and 30 notches back out.
const tiny = process.argv.includes('--tiny');
mkdirSync(out, { recursive: true });

// --port=N: the local server's port (default 5199), for when another harness run holds it.
const port = Number(process.argv.find((a) => a.startsWith('--port='))?.slice(7) ?? '5199');
const server = await createServer({ server: { port, strictPort: true, host: '127.0.0.1' }, logLevel: 'error' });
await server.listen();
const base = `http://127.0.0.1:${port}/tests/visual/avatars/index.html`;
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
    // Nine rows of 420 px cells: a page tall enough to hold them all.
    const tall = await browser.newPage({ viewport: { width: 1280, height: 3900 }, colorScheme: 'dark' });
    for (const [zoom, angle] of [['body', 'front'], ['head', 'front'], ['head', 'three'], ['head', 'back']]) {
      await tall.goto(`${base}?view=figures&angle=${angle}&zoom=${zoom}&set=vocab`);
      await tall.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
      await tall.locator('#root > div').screenshot({ path: resolve(out, `vocab-figures-${zoom}-${angle}.png`) });
    }
    await tall.close();
  }
  if (face) {
    // Faces, beards and hair (set=face in the harness): portraits at 128 px and 32 px, then 3D heads at about 150 px
    // from the front, three-quarters, the side and behind.
    const sharp = await browser.newPage({ viewport: { width: 1280, height: 1000 }, colorScheme: 'dark', deviceScaleFactor: 2 });
    // --big: the portraits also at 512 px.
    await sharp.goto(`${base}?view=portraits&set=${faceSet}${onlyQuery}${process.argv.includes('--big') ? '&big=1' : ''}`);
    await sharp.waitForFunction(() => window.ready === true);
    await sharp.locator('table').screenshot({ path: resolve(out, 'face-portraits.png') });
    // Four rows to a picture, to read the details.
    const rows = await sharp.locator('tbody > tr').all();
    console.log(`${faceSet}: ${rows.length} portrait rows (${await sharp.locator('tr').count()} tr)`);
    for (let i = 0; i < rows.length; i += 4) {
      const boxes = await Promise.all(rows.slice(i, i + 4).map((r) => r.boundingBox()));
      const top = boxes[0].y;
      const bottom = Math.max(...boxes.map((b) => b.y + b.height));
      await sharp.screenshot({ path: resolve(out, `face-portraits-${String(i / 4 + 1).padStart(2, '0')}.png`), clip: { x: boxes[0].x, y: top, width: boxes[0].width, height: bottom - top }, fullPage: true });
    }
    await sharp.close();
    // --scale=N: each 3D cell N times the pixels (the same picture, sharper).
    const scale = Number(process.argv.find((a) => a.startsWith('--scale='))?.slice(8) ?? '1');
    // Tall enough for every row of 420 px cells, four to a row.
    const tall = await browser.newPage({ viewport: { width: 1280 * scale, height: Math.ceil(rows.length / 4) * 420 * scale + 100 }, colorScheme: 'dark' });
    // --angles=front,az20el25,az-35el20,az160el25: the heads from named angles, or from `azAelE` (degrees round from
    // face-on and above, as the room's Dollhouse and Your eyes look at a person); default front, three, side, back.
    const angles = process.argv.find((a) => a.startsWith('--angles='))?.slice(9).split(',') ?? ['front', 'three', 'side', 'back'];
    for (const angle of angles) {
      // --dist=N: the head camera N metres away (default 1.05, about 150 px of head).
      const dist = process.argv.find((a) => a.startsWith('--dist='))?.slice(7) ?? '1.05';
      const spec = /^az(-?\d+)el(-?\d+)$/.exec(angle);
      const where = spec ? `az=${spec[1]}&el=${spec[2]}` : `angle=${angle}`;
      await tall.goto(`${base}?view=figures&${where}&zoom=head&dist=${dist}&scale=${scale}&set=${faceSet}${onlyQuery}`);
      await tall.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
      await tall.locator('#root > div > canvas').screenshot({ path: resolve(out, `face-heads-${angle}.png`) });
    }
    await tall.close();
  }
  if (plans) {
    // Body plans (set=plans): the portraits, the plan tokens, and each whole figure from the front, three-quarters
    // and the side.
    const sharp = await browser.newPage({ viewport: { width: 1280, height: 1400 }, colorScheme: 'dark', deviceScaleFactor: 2 });
    await sharp.goto(`${base}?view=portraits&set=plans&big=1`);
    await sharp.waitForFunction(() => window.ready === true);
    await sharp.locator('table').screenshot({ path: resolve(out, 'plans-portraits.png') });
    const slug = (name) => name.toLowerCase().replace(/[^a-z]+/g, '-').replace(/-+$/, '');
    for (const row of await sharp.locator('tr').all()) {
      await row.screenshot({ path: resolve(out, `plans-portrait-${slug(await row.locator('td').first().innerText())}.png`) });
    }
    await sharp.close();
    // The People list's sizes, 32 and 48 px, at four times the pixels so each can be read.
    const small = await browser.newPage({ viewport: { width: 500, height: 1400 }, colorScheme: 'dark', deviceScaleFactor: 4 });
    await small.goto(`${base}?view=portraits&set=plans&small=1`);
    await small.waitForFunction(() => window.ready === true);
    await small.locator('table').screenshot({ path: resolve(out, 'plans-portraits-small.png') });
    await small.close();
    await open('view=plan&set=plans');
    await page.locator('svg.room-layout-svg, svg').first().screenshot({ path: resolve(out, 'plans-tokens.png') });
    // Seven rows of 420 px cells, four to a row: a page tall enough to hold them all.
    const tall = await browser.newPage({ viewport: { width: 1280, height: 7 * 420 + 100 }, colorScheme: 'dark' });
    for (const angle of ['front', 'three', 'side']) {
      await tall.goto(`${base}?view=figures&angle=${angle}&zoom=body&set=plans`);
      await tall.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
      const grid = tall.locator('#root > div');
      await grid.screenshot({ path: resolve(out, `plans-figures-${angle}.png`) });
      const box = await grid.boundingBox();
      const names = await tall.locator('#root > div > div').allInnerTexts();
      for (const [i, who] of names.entries()) {
        const clip = { x: box.x + (i % 4) * 300, y: box.y + Math.floor(i / 4) * 420, width: 300, height: 420 };
        await tall.screenshot({ path: resolve(out, `plans-figure-${angle}-${slug(who)}.png`), clip });
      }
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
  if (labels3d) {
    // Labels against heads in both 3D views, and the wheel onto a person with the pointer near, not on, them.
    // --dsf=N device scale (default 3). Playwright's wheel reaches the page divided by the device scale, while a
    // real wheel notch reaches it as 100 at any display scale (Chromium source, see the log), so each notch here is
    // sent as 100 x N to arrive as 100, unless --raw-wheel sends 100 as a test of the old counting.
    const dsf = Number(process.argv.find((a) => a.startsWith('--dsf='))?.slice(6) ?? '3');
    const notch = process.argv.includes('--raw-wheel') ? 100 : 100 * dsf;
    const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7);
    const narrow = await browser.newPage({ viewport: { width: 400, height: 700 }, colorScheme: 'dark', deviceScaleFactor: dsf });
    narrow.on('pageerror', (e) => errors.push(e.message));
    const go = async (query) => {
      await narrow.goto(`${base}?${query}`);
      await narrow.waitForFunction(() => window.ready === true);
      await narrow.waitForTimeout(300);
      return narrow.locator('.room-layout-3d');
    };
    const inside = (p, b) => p && p[0] > b[0][0] && p[0] < b[0][1] && p[1] > b[1][0] && p[1] < b[1][1] && p[2] > b[2][0] && p[2] < b[2][1];
    // Per shown label: its head gap (people), whether its text spans its own head's middle, and which heads it covers.
    const report = async (tag) => {
      const r = await narrow.evaluate(() => window.labelReport());
      const rows = r.labels.map((l) => {
        const own = r.heads.find((h) => h.id === l.id);
        const over = r.heads.filter((h) => l.x0 < h.x1 && h.x0 < l.x1 && l.y0 < h.y1 && h.y0 < l.y1).map((h) => h.id);
        return {
          id: l.id,
          text: l.text,
          box: [l.x0, l.y0, l.x1, l.y1].map((n) => Math.round(n * 10) / 10),
          gap: own ? Math.round((own.y0 - l.y1) * 10) / 10 : null,
          heights: own ? Math.round(((own.y0 - l.y1) / (l.y1 - l.y0)) * 100) / 100 : null,
          spans: own ? l.x0 < own.cx && own.cx < l.x1 : null,
          overHeads: over,
        };
      });
      const inBody = r.boxes.filter((b) => inside(r.camera, b.box)).map((b) => b.id);
      console.log(tag, JSON.stringify({ rows, cameraInside: inBody, camera: r.camera?.map((n) => Math.round(n * 100) / 100), fov: r.fov }));
      return { rows, inBody };
    };
    const shot = async (pic, name) => pic.screenshot({ path: resolve(out, `${name}.png`) });
    if (!only || only === 'eyes') {
      // Fault 1: Your eyes among 24 and among 8 people in a 276 px panel, then 10 presses of +; the Dollhouse for comparison.
      for (const [tag, query] of [
        ['l1-eyes24', 'view=room&n=24&size=50&spread=6&mode=eyes&width=276&you=%23p3'],
        ['l1-eyes8', 'view=room&n=8&size=50&spread=6&mode=eyes&width=276&you=%23p7'],
        ['l1-doll8', 'view=room&n=8&size=50&spread=6&mode=dollhouse&width=276&you=%23p7'],
      ]) {
        const pic = await go(query);
        await shot(pic, `${tag}-open`);
        await report(`${tag}-open`);
        await pic.focus();
        for (let i = 0; i < 10; i++) await narrow.keyboard.press('+');
        await narrow.waitForTimeout(400);
        await shot(pic, `${tag}-plus10`);
        await report(`${tag}-plus10`);
      }
    }
    if (!only || only === 'face') {
      // Fault 2: the pointer on Bram (#p1, facing away) with a rack behind him; close up, turned to face the camera.
      const pic = await go('view=room&n=8&size=50&spread=6&face=north&mode=dollhouse&width=276&rack=%23p1');
      const at = await narrow.evaluate(() => window.screenOf('#p1'));
      await narrow.mouse.move(at.x, at.y);
      for (let i = 1; i <= 22; i++) {
        await narrow.mouse.wheel(0, -notch);
        await narrow.waitForTimeout(20);
        if ([10, 16, 22].includes(i)) {
          await shot(pic, `l2-face-wheel${i}`);
          await report(`l2-face-wheel${i}`);
        }
      }
      await pic.focus();
      for (let i = 1; i <= 18; i++) await narrow.keyboard.press('ArrowLeft');
      for (let i = 1; i <= 8; i++) await narrow.keyboard.press('ArrowDown');
      await shot(pic, 'l2-face-front');
      await report('l2-face-front');
      for (let i = 1; i <= 3; i++) await narrow.mouse.wheel(0, -notch);
      await narrow.waitForTimeout(100);
      await shot(pic, 'l2-face-front-close');
      await report('l2-face-front-close');
    }
    if (!only || only === 'near') {
      // Fault 3 and the proof: the pointer 2 CSS px beside Bram's figure at the opening view, 20 notches, then turn.
      const pic = await go('view=room&n=8&size=50&spread=6&face=north&mode=dollhouse&width=276&rack=%23p1');
      const at = await narrow.evaluate(() => window.screenOf('#p1'));
      const box = await narrow.evaluate(() => window.labelReport().heads.find((h) => h.id === '#p1'));
      console.log('near: head box at opening', JSON.stringify(box), 'pointer', at);
      await shot(pic, 'l3-near-open');
      const frame = await pic.boundingBox();
      // Two CSS px to the right of the head as drawn, at its middle height.
      const px = frame.x + box.x1 + 2;
      const py = frame.y + (box.y0 + box.y1) / 2;
      await narrow.mouse.move(px, py);
      for (let i = 1; i <= 20; i++) {
        await narrow.mouse.wheel(0, -notch);
        await narrow.waitForTimeout(20);
        if ([5, 10, 15, 20].includes(i)) {
          await shot(pic, `l3-near-wheel${i}`);
          await report(`l3-near-wheel${i}`);
        }
      }
      await pic.focus();
      for (let i = 1; i <= 18; i++) {
        await narrow.keyboard.press('ArrowLeft');
        if (i % 6 === 0) await shot(pic, `l3-near-turn${i * 10}deg`);
      }
      await report('l3-near-turn180deg');
      for (let i = 1; i <= 6; i++) await narrow.keyboard.press('ArrowDown');
      await shot(pic, 'l3-near-front');
      await report('l3-near-front');
    }
    await narrow.close();
  }
  if (zoomLabel) {
    // The live guest check of 2026-11-16: room #3510 (10 x 10 m), the viewer at the north door and three people,
    // a 276 px panel at device scale 3. The pointer 8 CSS px under each person's label, 20 notches; then 8 notches
    // at the middle and where each label sits against its own head. Each notch is sent as 100 x 3 to arrive as 100.
    const notch = 300;
    const narrow = await browser.newPage({ viewport: { width: 400, height: 700 }, colorScheme: 'dark', deviceScaleFactor: 3 });
    narrow.on('pageerror', (e) => errors.push(e.message));
    const room3510 = 'view=room&n=4&size=10&places=0,4.8;0,2.05;-2.04,2.76;-3.45,0.8&mode=dollhouse&width=276&you=%23p0';
    const go = async (query) => {
      await narrow.goto(`${base}?${query}`);
      await narrow.waitForFunction(() => window.ready === true);
      await narrow.waitForTimeout(300);
      return narrow.locator('.room-layout-3d');
    };
    // The camera's place, whether it is inside the room's walls, and each shown label against its own head.
    const state = async (half) => {
      const r = await narrow.evaluate(() => window.labelReport());
      const [x, y, z] = r.camera.map((n) => Math.round(n * 100) / 100);
      const labels = r.labels.map((l) => {
        const own = r.heads.find((h) => h.id === l.id);
        const middle = (l.x0 + l.x1) / 2;
        return { id: l.id, box: [l.x0, l.y0, l.x1, l.y1].map((n) => Math.round(n)), aside: own ? Math.round(middle - own.cx) : null, overOwnHead: own ? middle >= own.x0 && middle <= own.x1 : null };
      });
      return { camera: [x, y, z], withinWalls: Math.abs(x) <= half && Math.abs(y) <= half, labels, heads: r.heads.map((h) => ({ id: h.id, cx: Math.round(h.cx), y0: Math.round(h.y0) })) };
    };
    // Under each person's label; where one has no label shown, 19 px above the head (where the live check's raised
    // label put the pointer); and 35 px beside #p3's head at its top (where its label sat when slid aside).
    // `label-left`: 8 px under the label's left end, clear of a label stacked under it.
    for (const [id, where] of [['#p1', 'label'], ['#p2', 'label'], ['#p2', 'label-left'], ['#p3', 'label'], ['#p3', 'aside']]) {
      const pic = await go(room3510);
      const frame = await pic.boundingBox();
      const start = await state(5);
      const label = start.labels.find((l) => l.id === id);
      const head = start.heads.find((h) => h.id === id);
      const tag = `zl-${id.slice(1)}-${where}`;
      await pic.screenshot({ path: resolve(out, `${tag}-open.png`) });
      const pointer =
        where === 'aside'
          ? { x: head.cx - 35, y: head.y0 + 5 }
          : label
            ? { x: where === 'label-left' ? label.box[0] + 4 : (label.box[0] + label.box[2]) / 2, y: label.box[3] + 8 }
            : { x: head.cx, y: head.y0 - 19 };
      console.log(tag, 'open', JSON.stringify({ pointer, ...start }));
      await narrow.mouse.move(frame.x + pointer.x, frame.y + pointer.y);
      for (let i = 1; i <= 20; i++) {
        await narrow.mouse.wheel(0, -notch);
        await narrow.waitForTimeout(20);
        if (i % 4 === 0) {
          await pic.screenshot({ path: resolve(out, `${tag}-n${String(i).padStart(2, '0')}.png`) });
          const now = await state(5);
          console.log(tag, `n${i}`, JSON.stringify({ camera: now.camera, withinWalls: now.withinWalls, labels: now.labels.map((l) => l.id) }));
        }
      }
    }
    // Eight notches at the picture's middle, as the live check did before finding a label 35 px aside.
    const pic = await go(room3510);
    const frame = await pic.boundingBox();
    await narrow.mouse.move(frame.x + frame.width / 2, frame.y + frame.height / 2);
    for (let i = 1; i <= 8; i++) {
      await narrow.mouse.wheel(0, -notch);
      await narrow.waitForTimeout(20);
    }
    await pic.screenshot({ path: resolve(out, 'zl-middle-n08.png') });
    console.log('zl-middle-n08', JSON.stringify(await state(5)));
    await narrow.close();
  }
  if (forms) {
    const slug = (name) => name.toLowerCase().replace(/[^a-z]+/g, '-').replace(/-+$/, '');
    const sharp = await browser.newPage({ viewport: { width: 1280, height: 1400 }, colorScheme: 'dark', deviceScaleFactor: 2 });
    await sharp.goto(`${base}?view=portraits&set=forms&big=1`);
    await sharp.waitForFunction(() => window.ready === true);
    await sharp.locator('table').screenshot({ path: resolve(out, 'forms-portraits.png') });
    for (const row of await sharp.locator('tr').all()) {
      await row.screenshot({ path: resolve(out, `forms-portrait-${slug(await row.locator('td').first().innerText())}.png`) });
    }
    await sharp.close();
    const small = await browser.newPage({ viewport: { width: 500, height: 900 }, colorScheme: 'dark', deviceScaleFactor: 4 });
    await small.goto(`${base}?view=portraits&set=forms&small=1`);
    await small.waitForFunction(() => window.ready === true);
    await small.locator('table').screenshot({ path: resolve(out, 'forms-portraits-small.png') });
    await small.close();
    const tall = await browser.newPage({ viewport: { width: 1280, height: 2 * 420 + 100 }, colorScheme: 'dark' });
    for (const angle of ['front', 'three', 'side']) {
      await tall.goto(`${base}?view=figures&angle=${angle}&zoom=body&set=forms&fit=drawn`);
      await tall.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
      await tall.locator('#root > div').screenshot({ path: resolve(out, `forms-figures-${angle}.png`) });
    }
    await tall.close();
    // The live room's size (10 x 10 m), everyone standing apart; the Dollhouse at 960 px.
    const room = 'view=room&set=forms&size=10&places=-3,2;-1.5,0;0.5,0;2.5,0;-3,-2.5;-1.5,-2.5;3.5,2.5;1.5,3&mode=dollhouse&width=960';
    const view = await browser.newPage({ viewport: { width: 1000, height: 800 }, colorScheme: 'dark' });
    view.on('pageerror', (e) => errors.push(e.message));
    const go = async () => {
      await view.goto(`${base}?${room}`);
      await view.waitForFunction(() => window.ready === true);
      await view.waitForTimeout(300);
      return view.locator('.room-layout-3d');
    };
    const report = async (tag) => {
      const r = await view.evaluate(() => window.labelReport());
      console.log(tag, JSON.stringify({ camera: r.camera?.map((n) => Math.round(n * 100) / 100), labels: r.labels.map((l) => ({ id: l.id, text: l.text, box: [l.x0, l.y0, l.x1, l.y1].map(Math.round) })) }));
      return r;
    };
    let pic = await go();
    await pic.screenshot({ path: resolve(out, 'forms-doll.png') });
    await report('forms-doll');
    // The wheel 8 px under each animal's label, 20 notches, then a quarter turn with the arrow keys.
    for (const id of ['#p1', '#p2', '#p3', '#p4', '#p0']) {
      pic = await go();
      const frame = await pic.boundingBox();
      const start = await view.evaluate(() => window.labelReport());
      const label = start.labels.find((l) => l.id === id);
      if (!label) {
        console.log(`forms-zoom ${id}: no label shown`);
        continue;
      }
      await view.mouse.move(frame.x + (label.x0 + label.x1) / 2, frame.y + label.y1 + 8);
      for (let i = 0; i < 20; i++) {
        await view.mouse.wheel(0, -100);
        await view.waitForTimeout(20);
      }
      await view.waitForTimeout(200);
      const tag = `forms-zoom-${id.slice(1)}`;
      await pic.screenshot({ path: resolve(out, `${tag}.png`) });
      await report(tag);
      await pic.focus();
      for (let i = 0; i < 9; i++) await view.keyboard.press('ArrowLeft');
      await view.waitForTimeout(200);
      await pic.screenshot({ path: resolve(out, `${tag}-turn90.png`) });
      await report(`${tag}-turn90`);
    }
    await view.close();
  }
  if (tiny) {
    // Each real-size figure framed by what is drawn, from the front, three-quarters and the side.
    const tall = await browser.newPage({ viewport: { width: 1280, height: 420 + 100 }, colorScheme: 'dark' });
    for (const angle of ['front', 'three', 'side']) {
      await tall.goto(`${base}?view=figures&angle=${angle}&zoom=body&set=sizes&fit=drawn`);
      await tall.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
      await tall.locator('#root > div').screenshot({ path: resolve(out, `tiny-figures-${angle}.png`) });
    }
    await tall.close();
    // The live room's size (10 x 10 m); the bird where the live check's subject stood, the others apart from it.
    const room = 'view=room&set=sizes&size=10&places=2,2.15;-2.5,0;2.5,-1;-0.16,1.98&mode=dollhouse&width=960';
    const view = await browser.newPage({ viewport: { width: 1000, height: 800 }, colorScheme: 'dark' });
    view.on('pageerror', (e) => errors.push(e.message));
    const go = async () => {
      await view.goto(`${base}?${room}`);
      await view.waitForFunction(() => window.ready === true);
      await view.waitForTimeout(300);
      return view.locator('.room-layout-3d');
    };
    // The camera's place and each person's whole figure on screen, CSS pixels.
    const report = async (tag) => {
      const r = await view.evaluate(() => window.labelReport());
      const figures = Object.fromEntries(r.figures.map((f) => [f.id, `${Math.round(f.x1 - f.x0)}x${Math.round(f.y1 - f.y0)}`]));
      console.log(tag, JSON.stringify({ camera: r.camera?.map((n) => Math.round(n * 100) / 100), figures, labels: r.labels.map((l) => l.id) }));
      return r;
    };
    let pic = await go();
    await pic.screenshot({ path: resolve(out, 'tiny-doll.png') });
    const start = await report('tiny-doll');
    // The bird enlarged four times from the overview, so its marker (or its lack) can be seen.
    const bird = start.figures.find((f) => f.id === '#p3');
    if (bird) {
      const frame = await pic.boundingBox();
      const cx = frame.x + (bird.x0 + bird.x1) / 2;
      const cy = frame.y + (bird.y0 + bird.y1) / 2;
      await view.screenshot({ path: resolve(out, 'tiny-doll-bird-crop.png'), clip: { x: cx - 60, y: cy - 60, width: 120, height: 120 } });
    }
    // The wheel 8 px under each one's label (and for the bird, on its figure too): 12, 20 and 30 notches, a quarter
    // and a half turn with the arrow keys, then 30 notches back out.
    for (const [id, where] of [['#p3', 'label'], ['#p3', 'figure'], ['#p1', 'label'], ['#p2', 'label'], ['#p0', 'label']]) {
      pic = await go();
      const frame = await pic.boundingBox();
      const r = await view.evaluate(() => window.labelReport());
      const label = r.labels.find((l) => l.id === id);
      const figure = r.figures.find((f) => f.id === id);
      const tag = `tiny-zoom-${id.slice(1)}-${where}`;
      if (where === 'label' && !label) {
        console.log(`${tag}: no label shown`);
        continue;
      }
      const pointer = where === 'label' ? { x: (label.x0 + label.x1) / 2, y: label.y1 + 8 } : { x: (figure.x0 + figure.x1) / 2, y: (figure.y0 + figure.y1) / 2 };
      await view.mouse.move(frame.x + pointer.x, frame.y + pointer.y);
      for (let i = 1; i <= 30; i++) {
        await view.mouse.wheel(0, -100);
        await view.waitForTimeout(20);
        if (i === 12 || i === 20 || i === 30) {
          await view.waitForTimeout(150);
          await pic.screenshot({ path: resolve(out, `${tag}-n${i}.png`) });
          await report(`${tag}-n${i}`);
        }
      }
      await pic.focus();
      for (let i = 1; i <= 18; i++) {
        await view.keyboard.press('ArrowLeft');
        if (i === 9 || i === 18) {
          await view.waitForTimeout(150);
          await pic.screenshot({ path: resolve(out, `${tag}-turn${i * 10}.png`) });
          await report(`${tag}-turn${i * 10}`);
        }
      }
      for (let i = 1; i <= 30; i++) {
        await view.mouse.wheel(0, 100);
        await view.waitForTimeout(20);
      }
      await view.waitForTimeout(150);
      await pic.screenshot({ path: resolve(out, `${tag}-out30.png`) });
      await report(`${tag}-out30`);
    }
    await view.close();
  }
  if (!gpu && !view3d && !pinch && !labels3d && !vocab && !face && !zoomLabel && !plans && !forms && !tiny) {
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
  if (!gpu && !view3d && !pinch && !labels3d && !vocab && !face && !zoomLabel && !plans && !forms && !tiny) {
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
  // --no-frames: skip the frame timing (for repeated looks at the --face pictures).
  for (const n of process.argv.includes('--no-frames') ? [] : [8, 40]) {
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
