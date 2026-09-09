import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

// Exercise only production artifacts, without connecting the application to a MOO.
const dist = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
const manifest = JSON.parse(await readFile(resolve(dist, '.vite/manifest.json'), 'utf8'));
const audio = Object.entries(manifest).filter(([id]) =>
  id.startsWith('node_modules/cacophony/dist/bundles/') ||
  id === 'node_modules/cacophony/dist/webCodecsStream.mjs');
const reverb = audio.find(([id]) => id.includes('/dattorro-reverb-bundle.'))?.[1];
assert.ok(reverb, 'Build must emit the lazy reverb worklet');
assert.ok(audio.some(([id]) => id.endsWith('/webCodecsStream.mjs')), 'Build must emit the lazy stream adapter');
const optionalPaths = new Set(audio.map(([, chunk]) => `/${chunk.file}`));
const serviceWorker = await readFile(resolve(dist, 'sw.js'), 'utf8');
for (const [, chunk] of audio) {
  assert.ok(!serviceWorker.includes(chunk.file), `${chunk.file} is still precached`);
}

const requests = [];
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  requests.push(pathname);
  if (pathname === '/__audio-cache-test') {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end('<!doctype html><title>Audio cache test</title>');
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
  const context = await browser.newContext({ serviceWorkers: 'allow' });
  const page = await context.newPage();
  await page.goto(`${origin}/__audio-cache-test`);
  await page.evaluate(async () => {
    await navigator.serviceWorker.register('/sw.js');
  });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  assert.deepEqual(requests.filter((path) => optionalPaths.has(path)), [],
    'Installing the service worker must not download optional audio chunks');

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
  assert.equal(await loadReverb(offlinePage), true);
  console.log(`PASS: ${audio.length} audio chunks excluded from installation; reverb fetched on demand and loaded offline in a fresh page.`);
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
