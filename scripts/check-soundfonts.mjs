import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';
import { BasicSoundBank } from 'spessasynth_core';

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

// A real SoundFont (spessasynth's one-preset saw-wave bank). CI needs no network or bank-host uptime.
const bank = Buffer.from(BasicSoundBank.getSampleSoundBankFile());
const bankUrl = 'https://mongoose.world/sounds/soundfonts/MuseScore_General.sf3';
const sampleRequests = [];
let failNext = true;
const browser = await chromium.launch();
try {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  await context.route('**/*', (route) => route.request().url().startsWith(origin) ? route.continue() : route.abort());
  await context.route(bankUrl, async (route) => {
    sampleRequests.push(route.request().url());
    if (failNext) { failNext = false; await route.fulfill({ status: 503, body: '' }); return; }
    const body = process.env.LIVE_SOUNDFONTS === '1' ? Buffer.from(await (await fetch(bankUrl)).arrayBuffer()) : bank;
    await route.fulfill({ status: 200, body, contentType: 'application/octet-stream', headers: { 'Access-Control-Allow-Origin': '*' } });
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
  await panel.getByRole('button', { name: 'Connect output device', exact: true }).click();
  // A failed download leaves the built-in synth playing; Reconnect retries.
  await expect(panel.getByRole('status')).toContainText('MuseScore General could not load', { timeout: 30000 });
  await expect(panel).toContainText('Soundfont Synthesizer · MuseScore General');
  await panel.getByRole('button', { name: 'Reconnect soundfont', exact: true }).click();
  await expect(panel.getByRole('status')).toContainText('MuseScore General ready.', { timeout: 30000 }).catch(async (error) => {
    console.error(await panel.innerText());
    throw error;
  });
  assert.equal(sampleRequests.length, 2);
  assert.ok(requests.includes(`/${renderer.file}`));

  // Observe real PCM after the master bus, not a mocked send() call.
  await page.evaluate(() => {
    const media = window.mudClient.media;
    window.midiAnalyser = media.cacophony.context.createAnalyser();
    media.cacophony.getBus('master').output.connect(window.midiAnalyser);
  });
  const note = () => page.evaluate(() => window.mudClient.gmcp.handlers['Client.Midi'].receiveRegisteredMessage('Note', { note: 60, velocity: 100, on: true, channel: 0, duration: 700 }));
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
  await note();
  await expect.poll(energy).toBeGreaterThan(0.001);
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
  console.log(`PASS: SoundFont lazy loading, failure/retry, real PCM through named effects, chain removal/recreation, Escape/Resume, axe and mobile reflow${process.env.LIVE_SOUNDFONTS === '1' ? ' (live MuseScore_General.sf3)' : ''}.`);
} finally { await browser.close(); await new Promise((done) => server.close(done)); }
