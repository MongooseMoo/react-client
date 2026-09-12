import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

// Exercise only production artifacts, without connecting the application to a MOO.
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = process.env.BUNDLE_DIST ? resolve(process.env.BUNDLE_DIST) : resolve(projectRoot, 'dist');
const manifest = JSON.parse(await readFile(resolve(dist, '.vite/manifest.json'), 'utf8'));
const audio = Object.entries(manifest).filter(([id]) =>
  id.startsWith('node_modules/cacophony/dist/bundles/') ||
  id === 'node_modules/cacophony/dist/webCodecsStream.mjs');
const reverb = audio.find(([id]) => id.includes('/dattorro-reverb-bundle.'))?.[1];
assert.ok(reverb, 'Build must emit the lazy reverb worklet');
assert.ok(audio.some(([id]) => id.endsWith('/webCodecsStream.mjs')), 'Build must emit the lazy stream adapter');
const optionalPaths = new Set(audio.map(([, chunk]) => `/${chunk.file}`));
const featureIds = [
  'src/components/audioChat.tsx',
  'src/components/editor/editorWindow.tsx',
  'src/components/MidiStatus.tsx',
  'src/PeerService.ts',
  'node_modules/omnitone/build/omnitone.min.esm.js',
  'node_modules/turndown/lib/turndown.browser.es.js',
  'src/components/preferences.tsx',
  'src/components/AutoLogDialogContent.tsx',
  'src/components/FileTransfer/index.tsx',
  'src/components/HapticsStatus.tsx',
  'src/FileTransferManager.ts',
  'src/WebRTCService.ts',
  'src/haptics/runtime.ts',
  'src/haptics/ButtplugWasmBackend.ts',
  'src/audio/PositionalFoaRenderer.ts',
  'src/audio/effects/EffectChain.ts',
];
const features = featureIds.map((id) => {
  assert.ok(manifest[id], `Build must emit a lazy chunk for ${id}`);
  optionalPaths.add(`/${manifest[id].file}`);
  return manifest[id];
});

// Vite may emit shared dependencies (such as the virtual MIDI synthesizer)
// under generated manifest keys. Follow imports instead of guessing those keys.
function collectImports(id, collected) {
  if (collected.has(id)) return;
  collected.add(id);
  for (const dependency of manifest[id].imports ?? []) collectImports(dependency, collected);
}
const startupIds = new Set();
for (const [id, chunk] of Object.entries(manifest)) {
  if (chunk.isEntry) collectImports(id, startupIds);
}
const featureDependencies = new Set();
for (const id of featureIds) collectImports(id, featureDependencies);
for (const id of featureDependencies) {
  if (!startupIds.has(id)) optionalPaths.add(`/${manifest[id].file}`);
}
const serviceWorker = await readFile(resolve(dist, 'sw.js'), 'utf8');
for (const pathname of optionalPaths) {
  assert.ok(!serviceWorker.includes(pathname.slice(1)), `${pathname} is still precached`);
}

const requests = [];
const server = createServer(async (request, response) => {
  const requestedPath = new URL(request.url, 'http://localhost').pathname;
  const pathname = requestedPath === '/' || requestedPath === '/editor' ? '/index.html' : requestedPath;
  requests.push(pathname);
  if (pathname === '/__audio-cache-test') {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end('<!doctype html><title>Audio cache test</title><div id="root"></div>');
    return;
  }
  const file = resolve(dist, `.${decodeURIComponent(pathname)}`);
  if (!file.startsWith(`${dist}${sep}`)) {
    response.writeHead(403).end();
    return;
  }
  try {
    const content = await readFile(file);
    const type = /\.[cm]?js$/.test(file) ? 'text/javascript' :
      file.endsWith('.css') ? 'text/css' :
      file.endsWith('.wasm') ? 'application/wasm' :
      file.endsWith('.html') ? 'text/html' : 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': type });
    response.end(content);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch();
  // Check actual application startup too: a hidden lazy component can still
  // request its code even when the service worker correctly excludes it.
  const startup = await browser.newContext({ serviceWorkers: 'block' });
  await startup.route('**/*', (route) =>
    route.request().url().startsWith(origin) ? route.continue() : route.abort());
  await startup.routeWebSocket('**/*', (socket) => socket.close());
  const startupPage = await startup.newPage();
  await startupPage.goto(origin, { waitUntil: 'networkidle' });
  await startupPage.getByRole('button', { name: 'Preferences', exact: true }).waitFor();
  assert.deepEqual(requests.filter((path) => optionalPaths.has(path)), [],
    'Default application startup must not download optional audio or feature chunks');
  await startup.close();

  // Exercise the real UI boundaries, including modal focus restoration.
  const ui = await browser.newContext({ serviceWorkers: 'block' });
  await ui.route('**/*', (route) =>
    route.request().url().startsWith(origin) ? route.continue() : route.abort());
  await ui.routeWebSocket('**/*', (socket) => socket.close());
  const uiPage = await ui.newPage();
  await uiPage.goto(origin, { waitUntil: 'networkidle' });
  const preferencesButton = uiPage.getByRole('button', { name: 'Preferences', exact: true });
  await preferencesButton.click();
  const preferencesDialog = uiPage.getByRole('dialog', { name: 'Preferences', exact: true });
  await preferencesDialog.getByRole('checkbox', { name: 'Local Echo', exact: true }).waitFor();
  await preferencesDialog.getByRole('button', { name: 'Close', exact: true }).click();
  await preferencesDialog.waitFor({ state: 'hidden' });
  assert.equal(await preferencesButton.evaluate((button) => document.activeElement === button), true);
  const logsButton = uiPage.getByRole('button', { name: 'Autologs', exact: true });
  await logsButton.click();
  const logsDialog = uiPage.getByRole('dialog', { name: 'Autologs', exact: true });
  await logsDialog.getByRole('button', { name: 'Refresh', exact: true }).waitFor();
  await logsDialog.getByRole('button', { name: 'Close', exact: true }).click();
  await logsDialog.waitFor({ state: 'hidden' });
  assert.equal(await logsButton.evaluate((button) => document.activeElement === button), true);
  await uiPage.getByRole('tab', { name: 'Files', exact: true }).click();
  await uiPage.locator('input[type="file"]').waitFor();

  // Exercise real Monaco and its React wrapper using installed assets, without
  // a CDN dependency or a connection to a MOO.
  const monacoRoot = resolve(projectRoot, 'node_modules/monaco-editor/min/vs');
  await ui.route('https://cdn.jsdelivr.net/npm/monaco-editor@*/min/vs/**', async (route) => {
    const suffix = new URL(route.request().url()).pathname.split('/min/vs/')[1];
    const asset = resolve(monacoRoot, decodeURIComponent(suffix));
    assert.ok(asset.startsWith(`${monacoRoot}${sep}`));
    await route.fulfill({
      body: await readFile(asset),
      contentType: asset.endsWith('.js') ? 'text/javascript' :
        asset.endsWith('.css') ? 'text/css' : 'application/octet-stream',
    });
  });
  const editorPage = await ui.newPage();
  const editorErrors = [];
  editorPage.on('pageerror', (error) => editorErrors.push(error.message));
  await editorPage.addInitScript(() => {
    window.editorMessages = [];
    const channel = new BroadcastChannel('editor');
    channel.onmessage = ({ data }) => {
      window.editorMessages.push(data);
      if (data.type === 'ready') channel.postMessage({
        type: 'load', id: 'preact-trial', clientId: 'local-test',
        session: { name: 'Preact trial', reference: 'preact-trial', type: 'moo-code', contents: ['return 1;'] },
      });
    };
  });
  await editorPage.goto(`${origin}/editor?reference=preact-trial`);
  await editorPage.waitForFunction(() => window.monaco?.editor.getModels().some((model) => model.getValue() === 'return 1;'));
  await editorPage.locator('.monaco-editor textarea').waitFor();
  await editorPage.waitForFunction(() => document.activeElement?.closest('.monaco-editor'));
  await editorPage.keyboard.press('Control+End');
  await editorPage.keyboard.type('\nreturn 2;');
  await editorPage.getByRole('button', { name: 'Save', exact: true }).click();
  await editorPage.waitForFunction(() => window.editorMessages.some((message) =>
    message.type === 'save'));
  assert.deepEqual(await editorPage.evaluate(() => window.editorMessages.find((message) => message.type === 'save').session.contents),
    ['return 1;', 'return 2;']);
  await editorPage.waitForFunction(() => document.activeElement?.closest('.monaco-editor'));
  await editorPage.getByRole('button', { name: 'Revert', exact: true }).click();
  await editorPage.waitForFunction(() => window.monaco.editor.getModels()[0].getValue() === 'return 1;');
  await editorPage.waitForFunction(() => document.activeElement?.closest('.monaco-editor'));
  await editorPage.keyboard.press('Control+z');
  await editorPage.waitForFunction(() => window.monaco.editor.getModels()[0].getValue(1) === 'return 1;\nreturn 2;');
  await editorPage.keyboard.press('Control+y');
  await editorPage.waitForFunction(() => window.monaco.editor.getModels()[0].getValue() === 'return 1;');
  await editorPage.evaluate(() => window.monaco.editor.getModels()[0].setValue('while (1)\n  notify(player, "tick");'));
  await editorPage.getByRole('button', { name: 'Apply quick fix: Insert missing endwhile', exact: true }).click();
  await editorPage.waitForFunction(() => window.monaco.editor.getModels()[0].getValue(1) === 'while (1)\n  notify(player, "tick");\nendwhile');
  await editorPage.waitForFunction(() => document.activeElement?.closest('.monaco-editor'));
  await editorPage.keyboard.press('Control+z');
  await editorPage.waitForFunction(() => window.monaco.editor.getModels()[0].getValue(1) === 'while (1)\n  notify(player, "tick");');
  assert.deepEqual(editorErrors, [], 'Real editor must load, edit, save, revert and apply fixes without runtime errors');
  console.log('PASS: real Monaco typing, save, revert, undo/redo, diagnostics, quick fix and focus.');
  await ui.close();

  // A missing editor chunk triggers one automatic reload, then a usable error
  // screen. Once deployment/cache trouble clears, manual Reload recovers.
  const recovery = await browser.newContext({ serviceWorkers: 'block' });
  await recovery.route('**/*', (route) =>
    route.request().url().startsWith(origin) ? route.continue() : route.abort());
  const editorChunk = `${origin}/${manifest['src/components/editor/editorWindow.tsx'].file}`;
  await recovery.route(editorChunk, (route) => route.abort());
  const recoveryPage = await recovery.newPage();
  let navigations = 0;
  recoveryPage.on('framenavigated', (frame) => {
    if (frame === recoveryPage.mainFrame()) navigations++;
  });
  await recoveryPage.goto(`${origin}/editor`);
  await recoveryPage.waitForFunction(() => performance.getEntriesByType('navigation')[0]?.type === 'reload');
  await recoveryPage.getByRole('heading', { name: 'Updating editor', exact: true }).waitFor();
  await recoveryPage.waitForLoadState('networkidle');
  assert.equal(navigations, 2, 'Stale chunks must not cause a reload loop');
  await recovery.unroute(editorChunk);
  await recoveryPage.getByRole('button', { name: 'Reload', exact: true }).click();
  await recoveryPage.getByRole('button', { name: 'Save', exact: true }).waitFor();
  await recovery.close();
  console.log('PASS: editor chunk failure reloads once, displays fallback and recovers.');
  requests.length = 0;

  const context = await browser.newContext({ serviceWorkers: 'allow' });
  const page = await context.newPage();
  await page.goto(`${origin}/__audio-cache-test`);
  await page.evaluate(async () => {
    await navigator.serviceWorker.register('/sw.js');
  });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  assert.deepEqual(requests.filter((path) => optionalPaths.has(path)), [],
    'Installing the service worker must not download optional audio or feature chunks');

  async function loadFeatures(target) {
    return target.evaluate(async (files) => {
      for (const file of files) await import(`/${file}`);
      return true;
    }, features.map((chunk) => chunk.file));
  }
  assert.equal(await loadFeatures(page), true);
  for (const chunk of features) {
    assert.ok(requests.includes(`/${chunk.file}`), `${chunk.file} must load on first use`);
    await page.waitForFunction(async (file) => {
      const cache = await caches.open('script-chunks');
      return Boolean(await cache.match(`/${file}`));
    }, chunk.file);
  }

  async function loadReverb(target) {
    return target.evaluate(async (file) => {
      const { default: url } = await import(`/${file}`);
      const audio = new AudioContext();
      try {
        await audio.audioWorklet.addModule(url);
        const node = new AudioWorkletNode(audio, 'dattorro-reverb');
        node.disconnect();
        return true;
      } finally {
        await audio.close();
      }
    }, reverb.file);
  }
  assert.equal(await loadReverb(page), true);
  assert.ok(requests.includes(`/${reverb.file}`), 'First use must fetch the worklet chunk');
  await page.waitForFunction(async (file) => {
    const cache = await caches.open('script-chunks');
    return Boolean(await cache.match(`/${file}`));
  }, reverb.file);

  // A fresh page has no evaluated-module cache, so this verifies the SW cache.
  const offlinePage = await context.newPage();
  await offlinePage.goto(`${origin}/__audio-cache-test`);
  await offlinePage.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  assert.equal(await loadFeatures(offlinePage), true);
  assert.equal(await loadReverb(offlinePage), true);
  console.log(`PASS: ${audio.length} audio chunks and ${features.length} feature chunks excluded from startup and installation; features and reverb loaded on demand and offline in a fresh page.`);
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
