import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const manifest = JSON.parse(await readFile(resolve(dist, '.vite/manifest.json'), 'utf8'));
const renderer = manifest['src/midi/SoundfontOutput.ts'];
assert.ok(renderer, 'Soundfont renderer must have its own lazy chunk');
const requests = [];
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  requests.push(pathname);
  const file = resolve(dist, `.${pathname === '/' ? '/index.html' : decodeURIComponent(pathname)}`);
  if (!file.startsWith(`${dist}${sep}`)) { response.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.html') ? 'text/html' : 'application/octet-stream' });
    response.end(body);
  } catch { response.writeHead(404).end(); }
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;

// A real, decodable sustained note. CI needs no network or soundfont-host uptime.
const wav = Buffer.alloc(44 + 48000 * 2);
wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(48000, 24); wav.writeUInt32LE(96000, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
wav.write('data', 36); wav.writeUInt32LE(wav.length - 44, 40);
for (let n = 0; n < 48000; n++) wav.writeInt16LE(Math.round(Math.sin(n * 2 * Math.PI * 261.63 / 48000) * 12000), 44 + n * 2);
const sample = `MIDI.Soundfont.acoustic_grand_piano = {"C4":"data:audio/mp3;base64,${wav.toString('base64')}",}`;
const sampleRequests = [];
let failNext = true;
const browser = await chromium.launch();
try {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  await context.route('**/*', (route) => route.request().url().startsWith(origin) ? route.continue() : route.abort());
  await context.route('https://gleitz.github.io/midi-js-soundfonts/**', async (route) => {
    sampleRequests.push(route.request().url());
    if (failNext) { failNext = false; await route.fulfill({ status: 503, body: '' }); return; }
    const body = process.env.LIVE_SOUNDFONTS === '1' ? await (await fetch(route.request().url())).text() : sample;
    await route.fulfill({ status: 200, body, contentType: 'application/javascript', headers: { 'Access-Control-Allow-Origin': '*' } });
  });
  await context.routeWebSocket('**/*', (socket) => socket.close());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(origin, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Preferences', exact: true }).click();
  const preferences = page.getByRole('dialog', { name: 'Preferences', exact: true });
  await preferences.getByRole('tab', { name: 'MIDI', exact: true }).click();
  await preferences.getByRole('checkbox', { name: 'Enable MIDI', exact: true }).check();
  await preferences.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('tab', { name: 'MIDI', exact: true }).click();
  await page.getByRole('heading', { name: 'MIDI studio', exact: true }).waitFor();
  const panel = page.locator('.midi-status');
  await panel.getByRole('combobox', { name: 'Output device', exact: true }).selectOption('soundfont-synth');
  assert.equal(sampleRequests.length, 0, 'Opening MIDI and selecting an output must not fetch samples');
  assert.ok(!requests.includes(`/${renderer.file}`), 'Opening MIDI must not load the sample renderer');
  const connect = panel.getByRole('button', { name: 'Connect output device', exact: true });
  await connect.click();
  await expect(panel.getByRole('status')).toContainText('Soundfont could not load', { timeout: 30000 });
  await expect(connect).toBeEnabled();
  await expect(panel.getByRole('combobox', { name: 'Output device', exact: true })).toHaveValue('soundfont-synth');
  await connect.click();
  await expect(panel).toContainText('Soundfont Synthesizer · Musyng Kite', { timeout: 30000 }).catch(async (error) => {
    console.error(await panel.innerText());
    throw error;
  });
  assert.ok(requests.includes(`/${renderer.file}`));

  // Observe real PCM after the master bus, not a mocked send() call.
  await page.evaluate(() => {
    const media = window.mudClient.media;
    window.midiAnalyser = media.cacophony.context.createAnalyser();
    media.cacophony.getBus('master').output.connect(window.midiAnalyser);
  });
  let eventId = 0;
  const note = () => page.evaluate((id) => {
    const midi = window.mudClient.gmcp.handlers['Client.Midi'];
    const owned = { originId: 'soundfont-probe', eventId: id, note: 60, velocity: 100, on: true, channel: 0 };
    midi.receiveRegisteredMessage('Note', owned);
    setTimeout(() => midi.receiveRegisteredMessage('Note', { ...owned, on: false, velocity: 0 }), 700);
  }, ++eventId);
  const energy = () => page.evaluate(() => {
    const values = new Float32Array(window.midiAnalyser.fftSize);
    window.midiAnalyser.getFloatTimeDomainData(values);
    return Math.sqrt(values.reduce((sum, value) => sum + value * value, 0) / values.length);
  });
  await panel.getByRole('button', { name: 'Preview soundfont', exact: true }).click();
  await expect.poll(energy).toBeGreaterThan(0.001);
  await note();
  await expect.poll(energy).toBeGreaterThan(0.001);
  await page.evaluate(async () => {
    const client = window.mudClient;
    client.gmcp.handlers['Client.Midi'].receiveRegisteredMessage('Route', { chain: 'midi-test-room' });
    await client.media.setChain({ id: 'midi-test-room', gain: 0, effects: [{ type: 'lowpass', params: { frequency: 4000 } }] });
  });
  await note();
  await expect.poll(energy).toBeLessThan(0.0001);
  await page.evaluate(() => window.mudClient.media.removeChain('midi-test-room'));
  await note();
  await expect.poll(energy).toBeGreaterThan(0.001);
  await page.evaluate(async () => window.mudClient.media.setChain({ id: 'midi-test-room', gain: 0, effects: [{ type: 'lowpass' }] }));
  await note();
  await expect.poll(energy).toBeLessThan(0.0001);
  await page.evaluate(() => window.mudClient.gmcp.handlers['Client.Midi'].receiveRegisteredMessage('Route', {}));
  await note();
  await expect.poll(energy).toBeGreaterThan(0.001);

  await page.keyboard.press('Escape');
  await expect.poll(() => page.evaluate(() => window.mudClient.media.cacophony.context.state)).toBe('suspended');
  await note();
  assert.equal(await page.evaluate(() => window.mudClient.media.cacophony.context.state), 'suspended', 'Incoming MIDI cannot undo Escape');
  await page.getByRole('button', { name: 'Resume sounds', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.mudClient.media.cacophony.context.state)).toBe('running');

  for (const [id, name] of [['FluidR3', 'FluidR3'], ['FatBoy', 'FatBoy']]) {
    await panel.getByRole('combobox', { name: 'Soundfont collection', exact: true }).selectOption(id);
    await panel.getByRole('button', { name: 'Reconnect soundfont', exact: true }).click();
    await expect(panel).toContainText(`Soundfont Synthesizer · ${name}`, { timeout: 30000 });
    await note();
    await expect.poll(energy).toBeGreaterThan(0.001);
  }
  await mkdir(resolve(root, 'screenshots'), { recursive: true });
  await panel.evaluate((node) => { for (let parent = node.parentElement; parent; parent = parent.parentElement) parent.scrollTop = 0; });
  await page.screenshot({ path: resolve(root, 'screenshots/pr24-midi-desktop.png'), fullPage: true });
  await page.addScriptTag({ path: resolve(root, 'node_modules/axe-core/axe.min.js') });
  const axe = await page.evaluate(() => window.axe.run(document.querySelector('.midi-status')));
  assert.deepEqual(axe.violations.map((item) => `${item.id}: ${item.description}`), []);
  await page.setViewportSize({ width: 390, height: 844 });
  await panel.scrollIntoViewIfNeeded();
  await page.screenshot({ path: resolve(root, 'screenshots/pr24-midi-mobile.png'), fullPage: true });
  assert.equal(await panel.evaluate((node) => node.scrollWidth <= node.clientWidth), true, 'MIDI controls must reflow');
  assert.deepEqual(errors, []);
  await panel.getByRole('button', { name: 'Disconnect output device', exact: true }).click();
  await expect(panel.getByRole('button', { name: 'Connect output device', exact: true })).toBeVisible();
  console.log(`PASS: soundfont lazy loading, failure/retry, all three collections, real PCM through named effects, chain removal/recreation, Escape/Resume, axe and mobile reflow${process.env.LIVE_SOUNDFONTS === '1' ? ' (live MP3 samples)' : ''}.`);
} finally { await browser.close(); await new Promise((done) => server.close(done)); }
