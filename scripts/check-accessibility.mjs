import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';

// Native keyboard journeys against the shipped bundle, using local protocol fixtures.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = process.env.BUNDLE_DIST ? resolve(process.env.BUNDLE_DIST) : resolve(root, 'dist');
const reportDir = process.env.A11Y_REPORT_DIR;
const axePath = process.env.A11Y_AXE_PATH || resolve(root, 'node_modules/axe-core/axe.min.js');
const evidence = { journeys: [], scans: [], speech: 'Not tested: browser semantics are not a screen reader transcript.' };
// Five seconds of silent PCM: exercise real playback clocks without test sound.
const samples = 22050 * 5;
const wave = Buffer.alloc(44 + samples * 2);
wave.write('RIFF', 0); wave.writeUInt32LE(wave.length - 8, 4); wave.write('WAVEfmt ', 8);
wave.writeUInt32LE(16, 16); wave.writeUInt16LE(1, 20); wave.writeUInt16LE(1, 22);
wave.writeUInt32LE(22050, 24); wave.writeUInt32LE(44100, 28); wave.writeUInt16LE(2, 32); wave.writeUInt16LE(16, 34);
wave.write('data', 36); wave.writeUInt32LE(samples * 2, 40);
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (pathname === '/fixture.wav') return response.writeHead(200, { 'Content-Type': 'audio/wav' }).end(wave);
  const file = resolve(dist, `.${pathname === '/' || pathname === '/editor' ? '/index.html' : decodeURIComponent(pathname)}`);
  if (!file.startsWith(`${dist}${sep}`)) return response.writeHead(403).end();
  try {
    const content = await readFile(file);
    const type = /\.[cm]?js$/.test(file) ? 'text/javascript' : file.endsWith('.css') ? 'text/css' :
      file.endsWith('.wasm') ? 'application/wasm' : file.endsWith('.html') ? 'text/html' : 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': type }).end(content);
  } catch { response.writeHead(404).end(); }
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
let context;
let fixtureDir;
let page;
async function scan(name) {
  // Allow selection/background transitions to finish before measuring contrast.
  await page.waitForTimeout(350);
  await page.addScriptTag({ path: axePath });
  const result = await page.evaluate(() => window.axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
  }));
  evidence.scans.push({ name, violations: result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) })),
    incomplete: result.incomplete.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) })) });
  if (reportDir) {
    await writeFile(resolve(reportDir, `${name}-axe.json`), JSON.stringify(result, null, 2));
    await writeFile(resolve(reportDir, `${name}-tree.yml`), await page.locator('body').ariaSnapshot());
    await page.screenshot({ path: resolve(reportDir, `${name}.png`), fullPage: true });
  }
  assert.equal(result.violations.length, 0, `${name}: ${JSON.stringify(result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) })))}`);
}
try {
  if (reportDir) await mkdir(reportDir, { recursive: true });
  // chrome.tabs.setZoom changes browser zoom, unlike CSS or pinch-zoom emulation.
  fixtureDir = await mkdtemp(resolve(tmpdir(), 'react-client-a11y-'));
  const extensionDir = resolve(fixtureDir, 'zoom-extension');
  await mkdir(extensionDir);
  await writeFile(resolve(extensionDir, 'manifest.json'), JSON.stringify({ manifest_version: 3, name: 'Local accessibility zoom fixture', version: '1.0',
    permissions: ['tabs'], background: { service_worker: 'background.js' } }));
  await writeFile(resolve(extensionDir, 'background.js'), 'chrome.runtime.onInstalled.addListener(() => {});');
  context = await chromium.launchPersistentContext(resolve(fixtureDir, 'profile'), {
    channel: 'chromium', headless: true, viewport: { width: 1280, height: 800 }, serviceWorkers: 'block',
    args: [`--disable-extensions-except=${extensionDir}`, `--load-extension=${extensionDir}`],
  });
  browser = context.browser();
  evidence.browser = browser.version();
  const zoomWorker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
  await context.route('**/*', (route) => route.request().url().startsWith(origin) ? route.continue() : route.abort());
  await context.routeWebSocket('**/*', () => {});
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'requestMIDIAccess', { configurable: true, value: async () => {
      const access = new EventTarget();
      return Object.assign(access, { inputs: new Map(), outputs: new Map(), sysexEnabled: false });
    } });
  });
  page = await context.newPage();
  await page.bringToFront();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(`${origin}/?mode=host`, { waitUntil: 'networkidle' });
  const choose = page.getByRole('button', { name: 'Choose database', exact: true });
  await expect(choose).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(choose).toBeFocused();
  const chooser = page.waitForEvent('filechooser');
  await page.keyboard.press('Enter');
  await chooser;
  await scan('host-320px');
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(origin);
  await page.waitForFunction(() => !!window.mudClient);
  await page.evaluate(() => window.mudClient.gmcp.handlers.Char.receiveRegisteredMessage('Name', {
    uuid: 'native-a11y-owner', name: '#101', fullname: 'Native accessibility fixture owner',
  }));
  const command = page.getByRole('textbox', { name: 'Command', exact: true });
  await expect(command).toBeFocused();
  await command.fill('xyznomatch');
  await page.keyboard.press('Tab');
  await expect(command).not.toBeFocused();
  await expect(command).toHaveValue('xyznomatch');
  await command.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(command).not.toBeFocused();
  await expect(command).toHaveValue('xyznomatch');
  await command.fill('first\nsecond');
  await command.focus();
  await command.evaluate((element) => element.setSelectionRange(3, 3));
  await page.keyboard.press('Home');
  assert.equal(await command.evaluate((element) => element.selectionStart), 0);
  evidence.journeys.push({ task: 'Leave a command draft', gestures: 'One Tab or Shift+Tab', draft: 'Preserved', multilineCaret: 'Home preserved' });
  await command.fill('');
  await scan('default');

  await page.keyboard.press('Control+Shift+4');
  const serverTab = page.getByRole('tab', { name: 'Server', exact: true });
  const refresh = page.getByRole('region', { name: 'Server Links', exact: true }).getByRole('button', { name: 'Refresh', exact: true });
  await expect(refresh).toBeFocused();
  await page.evaluate(() => window.mudClient.gmcp.handlers.Room.handleInfo({ num: 1, name: 'Fixture room', area: 'Fixture', exits: {} }));
  await expect(serverTab).toHaveAttribute('aria-selected', 'true');
  await expect(refresh).toBeFocused();
  await command.focus();
  await page.keyboard.press('Control+Shift+4');
  await expect(refresh).toBeFocused();
  await page.getByRole('button', { name: 'Collapse sidebar', exact: true }).click();
  await command.focus();
  await page.keyboard.press('Control+Shift+1');
  const roomTab = page.getByRole('tab', { name: 'Room', exact: true });
  await expect(roomTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: 'Room', exact: true })).toBeFocused();
  await page.evaluate(() => window.mudClient.gmcp.handlers.Room.handleInfo({ num: 1, name: 'Fixture room', area: 'Fixture', exits: { n: 2 } }));
  const northExit = page.getByRole('button', { name: 'Go north', exact: true });
  await expect(northExit).toBeFocused();
  await command.focus();
  await page.keyboard.press('Control+Shift+1');
  await expect(northExit).toBeFocused();
  evidence.journeys.push({ task: 'Reach a sidebar destination', gestures: 'One Ctrl+Shift+digit chord', states: 'Hidden, active, collapsed; first control or static panel focused; inserted tab retains selection and control focus' });

  // Clicking and arrowing still use the tablist; shortcuts enter the panel.
  await serverTab.click();
  await expect(serverTab).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('tab', { name: 'Users', exact: true })).toBeFocused();
  await page.keyboard.press('Home');
  await expect(roomTab).toBeFocused();
  evidence.journeys.push({ task: 'Navigate the sidebar tablist', result: 'Click, ArrowLeft and Home keep focus on the selected tab' });

  const diagnostics = page.getByRole('tabpanel', { name: 'Audio diagnostics', exact: true });
  for (const state of ['cold', 'cached']) {
    await command.focus();
    await page.keyboard.press('Control+Shift+9');
    await expect(diagnostics.getByRole('button', { name: 'Pause', exact: true })).toBeFocused();
    await page.keyboard.press('Control+Shift+4');
    await expect(refresh).toBeFocused();
    evidence.journeys.push({ task: `${state} lazy sidebar destination`, result: 'Shortcut focuses the first control after content loads' });
  }

  const items = [{ id: 'a', name: 'Apple', verbs: [['drop', 'a']] }, { id: 'b', name: 'Book', verbs: [['drop', 'b']] }];
  await page.evaluate((items) => window.mudClient.gmcp.handlers['Char.Items'].handleList({ location: 'inv', items }), items);
  await page.keyboard.press('Control+Shift+2');
  const inventory = page.getByRole('listbox', { name: 'Inventory', exact: true });
  await expect(inventory).toBeFocused();
  // Clicking the tab retains the tablist's normal route into the panel.
  const inventoryTab = page.getByRole('tab', { name: 'Inventory', exact: true });
  await inventoryTab.click();
  await expect(inventoryTab).toBeFocused();
  // The tablist's trailing Collapse control remains available before the panel.
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Collapse sidebar', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(inventory).toBeFocused();
  await expect(page.getByRole('option', { name: 'Apple', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.evaluate((items) => window.mudClient.gmcp.handlers['Char.Items'].handleList({ location: 'inv', items: items.slice().reverse() }), items);
  await expect(page.getByRole('option', { name: 'Apple', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.item-card')).toHaveAttribute('data-item-id', 'a');
  await page.evaluate(() => window.mudClient.gmcp.handlers['Char.Items'].handleRemove({ location: 'inv', item: { id: 'a' } }));
  await expect(page.getByRole('option', { name: 'Book', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.item-card')).toHaveAttribute('data-item-id', 'b');
  await scan('inventory');
  evidence.journeys.push({ task: 'Use selected inventory item', result: 'Selection/card agree after reorder and selected removal; sole survivor usable immediately' });

  const preferencesButton = page.getByRole('button', { name: 'Preferences', exact: true });
  for (const state of ['cold', 'cached']) {
    await preferencesButton.click();
    await expect(page.getByRole('tab', { name: 'General', exact: true })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(preferencesButton).toBeFocused();
    evidence.journeys.push({ task: `${state} Preferences`, focus: 'General, then opener after Escape' });
  }
  await preferencesButton.click();
  const dialog = page.getByRole('dialog', { name: 'Preferences', exact: true });
  for (const label of ['General', 'Speech', 'Sounds', 'Editor', 'Keyboard', 'MIDI', 'Haptics', 'Logging']) {
    await dialog.getByRole('tab', { name: label, exact: true }).click();
    await scan(`preferences-${label.toLowerCase()}`);
  }
  await dialog.getByRole('tab', { name: 'MIDI', exact: true }).click();
  await dialog.getByRole('checkbox', { name: 'Enable MIDI', exact: true }).check();
  await dialog.getByRole('tab', { name: 'Haptics', exact: true }).click();
  await dialog.getByRole('checkbox', { name: 'Enable Haptics', exact: true }).check();
  await page.keyboard.press('Escape');
  await page.keyboard.press('Control+Shift+5');
  await expect(page.getByRole('heading', { name: 'MIDI studio', exact: true })).toBeVisible();
  await scan('midi-empty');
  await page.setViewportSize({ width: 320, height: 800 });
  await scan('midi-320px');
  await page.keyboard.press('Control+Shift+6');
  await expect(page.getByRole('heading', { name: 'Haptics Status', exact: true })).toBeVisible();
  await scan('haptics-320px');
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.keyboard.press('Control+Shift+2');
  await expect(page.getByRole('button', { name: 'Resume sounds', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Resume sounds', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause sounds', exact: true })).toBeFocused();
  await page.evaluate(async () => {
    await window.mudClient.media.play({ url: `${location.origin}/`, name: 'fixture.wav', volume: 0, key: 'a11y-pause', loops: -1, finish: 5000 });
    window.fixtureSound = window.mudClient.media.allSounds[0];
  });
  await page.waitForFunction(() => window.fixtureSound.isPlaying && window.fixtureSound.playbacks[0].currentTime > 0.1);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => window.mudClient.media.paused && !window.fixtureSound.isPlaying);
  const pausedTime = await page.evaluate(() => window.fixtureSound.playbacks[0].currentTime);
  await page.waitForTimeout(250);
  assert.equal(await page.evaluate(() => window.fixtureSound.playbacks[0].currentTime), pausedTime);
  assert.equal(await page.evaluate(() => window.mudClient.media.allSounds.includes(window.fixtureSound)), true);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Resume sounds', exact: true }).click();
  await page.waitForFunction((time) => window.fixtureSound.isPlaying && window.fixtureSound.playbacks[0].currentTime > time, pausedTime);
  await page.evaluate(() => window.mudClient.media.stop({ key: 'a11y-pause' }));
  evidence.journeys.push({ task: 'Escape pause', result: 'Real buffered source retained; clock stationary during pause and advances after explicit resume; repeated Escape remains paused' });

  // Twenty synthetic persisted sessions; no remote service or user's storage.
  await page.evaluate(async () => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('mongoose-autologs', 1);
      request.onupgradeneeded = () => {
        const sessions = request.result.createObjectStore('sessions', { keyPath: 'id' });
        sessions.createIndex('startedAt', 'startedAt');
        const entries = request.result.createObjectStore('entries', { keyPath: ['sessionId', 'sequence'] });
        entries.createIndex('sessionId', 'sessionId');
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const transaction = db.transaction(['sessions', 'entries'], 'readwrite');
    for (let i = 1; i <= 20; i++) {
      const id = `fixture-${i}`;
      transaction.objectStore('sessions').put({ id, title: `Fixture log ${String(i).padStart(2, '0')}`, startedAt: 2000000000000 - i * 1000,
        endedAt: 2000000001000 - i * 1000, mode: 'default', sanitizedUrl: 'https://example.test/', lineCount: 1, byteEstimate: 128,
        owner: { runtime: window.mudClient.runtimeNamespace, playerUuid: 'native-a11y-owner', playerRef: '#101' } });
      transaction.objectStore('entries').put({ sessionId: id, sequence: 1, timestamp: 2000000000000 - i * 1000,
        type: 'serverMessage', sourceType: 'ansi', sourceContent: `Entry for log ${i}` });
    }
    await new Promise((resolve, reject) => { transaction.oncomplete = resolve; transaction.onerror = () => reject(transaction.error); });
    db.close();
  });
  await page.getByRole('button', { name: 'Autologs', exact: true }).click();
  const logs = page.getByRole('dialog', { name: 'Autologs', exact: true });
  const selector = logs.getByRole('listbox', { name: 'Autolog sessions', exact: true });
  await expect(selector).toBeFocused();
  await expect(selector.getByRole('option')).toHaveCount(20);
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await expect(logs.getByRole('heading', { name: 'Fixture log 20', exact: true })).toBeFocused();
  await expect(logs.getByText('Entry for log 20', { exact: false })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(logs.getByRole('button', { name: 'View entries', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(logs.getByRole('button', { name: 'Download "Fixture log 20" as plain text', exact: true })).toBeFocused();
  await logs.getByRole('button', { name: 'Delete log "Fixture log 20"', exact: true }).click();
  const confirmation = page.getByRole('alertdialog', { name: 'Delete autolog', exact: true });
  await expect(confirmation.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(logs.getByRole('button', { name: 'Delete log "Fixture log 20"', exact: true })).toBeFocused();
  await expect(selector.getByRole('option')).toHaveCount(20);
  await logs.getByRole('button', { name: 'Delete log "Fixture log 20"', exact: true }).click();
  await confirmation.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(selector.getByRole('option')).toHaveCount(19);
  await expect(selector).toBeFocused();
  await scan('logs-twenty');
  await page.setViewportSize({ width: 320, height: 800 });
  await scan('logs-320px');
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 1280, height: 800 });
  evidence.journeys.push({ task: 'Last of twenty logs from first selector', gestures: 'End, Enter', export: 'Two Tabs from entry heading', deletion: 'Selector focus restored; cancellation retains log' });

  // Seed old history through the registered protocol, preserving normal output processing.
  await page.evaluate(() => {
    const client = window.mudClient;
    client.gmcp.handlers['Client.Html'].receiveRegisteredMessage('Add_html', { data: ['<a href="https://example.org/fixture">Old fixture link</a><blockquote>Fixture quotation</blockquote>'] });
    for (let i = 0; i < 1010; i++) client.handleTextLine(`Fixture line ${i}`);
  });
  const oldLink = page.getByText('Old fixture link', { exact: true });
  await expect(oldLink).toHaveCount(1);
  assert.equal(await oldLink.evaluate((element) => !!element.closest('[inert]')), true);
  await oldLink.evaluate((element) => element.focus());
  await expect(oldLink).not.toBeFocused();
  await page.getByRole('button', { name: /Show .* earlier messages to screen reader/ }).click();
  await expect(page.getByRole('button', { name: 'Copy blockquote content', exact: true })).toBeVisible();
  const quoteBox = await page.locator('.blockquote-with-copy blockquote').boundingBox();
  const copyBox = await page.getByRole('button', { name: 'Copy blockquote content', exact: true }).boundingBox();
  assert.ok(copyBox.y >= quoteBox.y + quoteBox.height, 'Copy must not overlay quotation text');
  await scan('history-revealed');
  await page.getByRole('button', { name: 'Hide earlier history from screen reader', exact: true }).click();
  await scan('history-collapsed');
  await page.locator('.output').evaluate((element) => { element.scrollTop = 0; element.dispatchEvent(new Event('scroll', { bubbles: true })); });
  await page.evaluate(() => window.mudClient.handleTextLine('Unread fixture message'));
  const unread = page.locator('.new-lines-notification');
  await expect(unread).toHaveJSProperty('tagName', 'BUTTON');
  await unread.focus();
  await page.keyboard.press('Enter');
  await expect(unread).not.toBeVisible();
  evidence.journeys.push({ task: 'Older output', result: 'Excluded history adds zero focus stops; revealed frozen quotation retains Copy; unread action works with Enter' });
  await page.evaluate(() => window.mudClient.gmcp.handlers['Client.Html'].receiveRegisteredMessage('Add_html', { data: ['<input aria-label="Fixture nested input" value="abcdef">'] }));
  const nested = page.getByRole('textbox', { name: 'Fixture nested input', exact: true });
  await nested.focus();
  await nested.evaluate((element) => element.setSelectionRange(3, 3));
  await page.keyboard.press('Home');
  assert.equal(await nested.evaluate((element) => element.selectionStart), 0);
  await expect(nested).toBeFocused();

  for (const width of [640, 320]) {
    await page.setViewportSize({ width, height: 800 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert.ok(overflow <= 1, `Main UI overflows by ${overflow}px at ${width}px`);
    await preferencesButton.click();
    await expect(dialog.getByRole('tab', { name: 'General', exact: true })).toBeFocused();
    await scan(`preferences-${width}px`);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  }
  await page.setViewportSize({ width: 1280, height: 800 });
  const originalDpr = await page.evaluate(() => devicePixelRatio);
  const textSpacing = await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }' });
  await preferencesButton.click();
  await expect(dialog.getByRole('tab', { name: 'General', exact: true })).toBeFocused();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Preferences must fit with expanded text spacing');
  await expect(dialog.getByRole('checkbox', { name: 'Local Echo', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await textSpacing.evaluate((element) => element.remove());
  evidence.journeys.push({ task: 'Expanded text spacing', result: 'Preferences fit; Local Echo and Close remain available' });
  for (const factor of [2, 4]) {
    await zoomWorker.evaluate(async ({ origin, factor }) => {
      const tabs = await chrome.tabs.query({});
      const tab = tabs.find((tab) => tab.url?.startsWith(origin));
      if (!tab) throw new Error('Missing local fixture tab');
      await chrome.tabs.setZoom(tab.id, factor);
    }, { origin, factor });
    await expect.poll(() => page.evaluate(() => devicePixelRatio)).toBe(originalDpr * factor);
    const metrics = await page.evaluate(() => ({ width: innerWidth, dpr: devicePixelRatio, scrollWidth: document.documentElement.scrollWidth }));
    assert.ok(metrics.scrollWidth <= metrics.width + 1, `Main UI overflows at ${factor * 100}% browser zoom`);
    await preferencesButton.click();
    await expect(dialog.getByRole('tab', { name: 'General', exact: true })).toBeFocused();
    await scan(`preferences-zoom-${factor * 100}`);
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    evidence.journeys.push({ task: 'Browser zoom', percent: factor * 100, metrics });
  }
  await zoomWorker.evaluate(async (origin) => {
    const tab = (await chrome.tabs.query({})).find((tab) => tab.url?.startsWith(origin));
    await chrome.tabs.setZoom(tab.id, 1);
  }, origin);
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(`${origin}/?mode=join`);
  const room = page.getByRole('textbox', { name: 'Room ID', exact: true });
  await expect(room).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(room).toHaveAttribute('aria-invalid', 'true');
  await expect(room).toBeFocused();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await scan('join-320px');
  evidence.journeys.push({ task: 'Startup', result: 'Join validates associated field; keyboard Enter opens native database picker; 320px reflow fits' });
  assert.deepEqual(errors, [], 'Browser journeys must not throw runtime errors');
  console.log('PASS: native keyboard, stable selection, modal focus, history actions, startup and reflow.');
} catch (error) {
  evidence.error = error.stack;
  if (reportDir && page) {
    await page.screenshot({ path: resolve(reportDir, 'failure.png'), fullPage: true });
    await writeFile(resolve(reportDir, 'failure-tree.yml'), await page.locator('body').ariaSnapshot());
  }
  throw error;
} finally {
  if (reportDir) await writeFile(resolve(reportDir, 'summary.json'), JSON.stringify(evidence, null, 2));
  await context?.close();
  await new Promise((done) => server.close(done));
  if (fixtureDir) {
    assert.ok(fixtureDir.startsWith(`${resolve(tmpdir())}${sep}react-client-a11y-`));
    await rm(fixtureDir, { recursive: true, force: true });
  }
}
