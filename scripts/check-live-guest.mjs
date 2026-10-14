// Explicit live acceptance only: ordinary owned guest sessions, no test-fixture login.
import assert from 'node:assert/strict';
import { resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';
import WebSocket from 'ws';

if (process.env.MONGOOSE_LIVE_GUEST_CHECK !== '1') throw new Error('Explicit live guest acceptance is required');
const dist = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
const origin = 'https://client.mongoose.world';
const browser = await chromium.launch({ channel: 'chromium', headless: true });
try {
  const context = await browser.newContext();
  // Chromium's environment blocks external sockets. Relay the actual server
  // byte stream through Node; no protocol response or login is simulated.
  await context.routeWebSocket('wss://mongoose.moo.mud.org:8765/**', socket => {
    const upstream = new WebSocket(socket.url(), { origin });
    const pending = [];
    upstream.on('open', () => { for (const bytes of pending) upstream.send(bytes); pending.length = 0; });
    socket.onMessage(bytes => upstream.readyState === WebSocket.OPEN ? upstream.send(bytes) : pending.push(bytes));
    upstream.on('message', (bytes, binary) => socket.send(binary ? bytes : bytes.toString()));
    upstream.on('error', error => console.log('Live relay error:', error.code ?? error.name));
    upstream.on('close', () => socket.close());
    socket.onClose(() => upstream.close());
  });
  await context.route(`${origin}/**`, async route => {
    const pathname = new URL(route.request().url()).pathname;
    const file = resolve(dist, `.${pathname === '/' ? '/index.html' : pathname}`);
    assert(file.startsWith(dist + sep));
    await route.fulfill({ path: file, contentType: file.endsWith('.html') ? 'text/html' :
      file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'application/octet-stream' });
  });
  const pages = [];
  for (let i = 0; i < 2; i++) {
    const page = await context.newPage();
    page.on('websocket', socket => socket.on('socketerror', message => console.log('Live transport error:', message)));
    pages.push(page);
    await page.goto(origin);
    await expect.poll(() => page.evaluate(() => !!window.mudClient?.connected), { timeout: 15000 }).toBe(true);
    await page.evaluate(() => window.mudClient.sendCommand('guest'));
    await expect.poll(() => page.evaluate(() => !!window.mudClient.gmcp.identity), { timeout: 20000 }).toBe(true);
  }
  const metadata = await Promise.all(pages.map(page => page.evaluate(() => {
    const [playerRef, playerUuid] = JSON.parse(window.mudClient.gmcp.identity);
    return { sessionId: window.mudClient.gmcp.require('Auth.Autologin').sessionId,
      installationId: window.mudClient.gmcp.require('Auth.Autologin').tab.installationId, playerUuid, playerRef,
      granted: !!window.mudClient.gmcp.require('Auth.Autologin').currentGrant };
  })));
  assert.equal(metadata[0].installationId, metadata[1].installationId);
  assert.notEqual(metadata[0].sessionId, metadata[1].sessionId);
  assert.notEqual(metadata[0].playerUuid, metadata[1].playerUuid);
  assert.equal(metadata[0].granted, false);
  assert.equal(metadata[1].granted, false);
  for (const page of pages) await page.evaluate(() => window.mudClient.gmcp.require('Auth.Autologin').signOut());
  console.log('Live guest acceptance passed: real server, distinct player identities/tabs, shared installation, no remembered guest grants, scoped sign-out.');
} finally {
  await browser.close();
}
