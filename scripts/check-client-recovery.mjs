import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';

// Exercise the production artifact with real browser storage and UI, controlled
// account protocol replies, denied push permission, and one dropped ping reply.
const dist = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
const server = createServer(async (request, response) => {
  const path = new URL(request.url, 'http://localhost').pathname;
  const file = resolve(dist, `.${path === '/' || path === '/editor' ? '/index.html' : path}`);
  if (!file.startsWith(dist + sep)) return response.writeHead(403).end();
  try {
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': file.endsWith('.js') ? 'text/javascript' :
      file.endsWith('.css') ? 'text/css' : file.endsWith('.html') ? 'text/html' : 'application/octet-stream' }).end(body);
  } catch { response.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
try {
  const context = await browser.newContext();
  await context.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
  await context.route('https://mongoose.world/api/**', route => route.fulfill({ json: {} }));
  const sockets = [];
  let dropNextPing = false;
  const packet = (name, data) => Buffer.concat([Buffer.from([255, 250, 201]),
    Buffer.from(data === undefined ? name : `${name} ${JSON.stringify(data)}`), Buffer.from([255, 240])]);
  const owner = { uuid: 'recovery-owner', name: '#101', fullname: 'Recovery owner' };
  await context.routeWebSocket('**/*', socket => {
    const index = sockets.length;
    const record = { commands: [], pings: 0, socket };
    sockets.push(record);
    let identity = owner;
    socket.onMessage(message => {
      const text = Buffer.from(message).toString('utf8');
      if (text.includes('Core.Ping')) {
        record.pings++;
        if (dropNextPing) dropNextPing = false;
        else socket.send(packet('Core.Ping'));
      }
      if (['guest\r\n', 'owner\r\n', 'stranger\r\n'].includes(text)) {
        record.commands.push(text.trim());
        identity = text.startsWith('owner') ? owner : text.startsWith('stranger')
          ? { uuid: 'recovery-stranger', name: '#103', fullname: 'Another account' }
          : { uuid: 'recovery-visitor', name: '#102', fullname: 'Temporary guest' };
        socket.send(packet('Char.Name', identity));
      }
      const request = text.match(/Auth\.Autologin\.(Session|Resume) (\{.*\})/s);
      if (request) {
        const data = JSON.parse(request[2]);
        if (request[1] === 'Resume') {
          if (data.playerUuid === 'recovery-visitor') {
            identity = { uuid: 'recovery-visitor', name: '#102', fullname: 'Temporary guest' };
          }
          socket.send(packet('Char.Name', identity));
        }
        socket.send(packet('Auth.Autologin.SessionToken', { ...data, version: 2,
          playerUuid: identity.uuid, playerRef: identity.name, token: `synthetic-recovery-${index}`,
          expires_at: Date.now() / 1000 + 600 }));
      }
    });
    setTimeout(() => {
      socket.send(Buffer.from([255, 251, 201]));
      socket.send(Buffer.from('Recovery welcome: choose a character\r\n'));
      if (index === 0) socket.send(packet('Char.Name', owner));
    }, 100);
  });
  const page = await context.newPage();
  await page.goto(origin);
  await expect.poll(() => page.evaluate(() => window.mudClient?.gmcp.require('Auth.Autologin').currentGrant?.playerUuid)).toBe(owner.uuid);
  // A reconnect must retain the in-memory log even when its debounced save fails.
  await page.evaluate(() => {
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key.startsWith('mongoose:personal:v2:output:')) throw new DOMException('Fixture quota', 'QuotaExceededError');
      return setItem.call(this, key, value);
    };
    window.restoreHistoryStorage = () => { Storage.prototype.setItem = setItem; };
  });
  sockets.at(-1).socket.send(Buffer.from('Owner history retained across reconnect\r\n'));
  const ownerHistory = page.locator('.output-line-serverMessage').filter({ hasText: 'Owner history retained across reconnect' });
  await expect(ownerHistory).toBeVisible();
  for (let attempt = 0; attempt < 2; attempt++) {
    const count = sockets.length;
    sockets.at(-1).socket.close();
    await expect.poll(() => sockets.length).toBe(count + 1);
    await expect.poll(() => page.evaluate(() => window.mudClient.gmcp.require('Auth.Autologin').currentGrant?.playerUuid)).toBe(owner.uuid);
    await expect(ownerHistory).toHaveCount(1);
  }
  await page.evaluate(() => window.restoreHistoryStorage());
  sockets.at(-1).socket.send(Buffer.from('History storage available again\r\n'));
  await expect.poll(() => page.evaluate(() => Object.keys(localStorage).some(key =>
    key.startsWith('mongoose:personal:v2:output:') && localStorage.getItem(key).includes('Owner history retained across reconnect')))).toBe(true);
  await page.reload();
  await expect.poll(() => page.evaluate(() => window.mudClient?.gmcp.require('Auth.Autologin').currentGrant?.playerUuid)).toBe(owner.uuid);
  await expect(ownerHistory).toHaveCount(1);
  await page.evaluate(async () => {
    const grant = window.mudClient.gmcp.require('Auth.Autologin').currentGrant;
    const db = await new Promise(resolve => { const request = indexedDB.open('mongoose-browser', 1); request.onsuccess = () => resolve(request.result); });
    await new Promise(resolve => {
      const tx = db.transaction('installation', 'readwrite');
      tx.objectStore('installation').put({ profile: { id: grant.installationId, revision: 1, quiet: 1,
        bindings: [{ serverKey: 'https://mongoose.world', installationId: grant.installationId,
          playerUuid: grant.playerUuid, playerRef: grant.playerRef, bindingId: 'recovery-binding', revision: 1,
          label: 'Owner', primary: 1, mode: 'primary', enabled: 0, stoppedKinds: [] }] },
        subscription: { endpoint: 'https://push.example/recovery', keys: { auth: 'synthetic', p256dh: 'synthetic' } } },
        ['enrollment', 'https://mongoose.world', grant.installationId]);
      tx.oncomplete = () => { db.close(); resolve(); };
    });
  });
  await page.locator('details.browser-sessions summary').click();
  const beforeVisit = sockets.length;
  await page.getByRole('button', { name: 'Begin temporary visit', exact: true }).click();
  // The click starts an async storage/notification transition. The old owner
  // socket remains ready until that transition signs it out; waiting only on
  // connected/ready can accidentally send the guest login to that old socket.
  await expect(page.getByRole('button', { name: 'End temporary visit', exact: true })).toBeVisible();
  await expect.poll(() => sockets.length).toBe(beforeVisit + 1);
  await page.waitForFunction(() => window.mudClient.connected && window.mudClient.gmcp.ready);
  const command = page.getByRole('textbox', { name: 'Command', exact: true });
  await command.fill('guest'); await command.press('Enter');
  await expect.poll(() => page.evaluate(() => window.mudClient.gmcp.require('Auth.Autologin').currentGrant?.purpose)).toBe('visitor');
  sockets.at(-1).socket.send(Buffer.from('Visitor history retained across reconnect\r\n'));
  const visitorHistory = page.locator('.output-line-serverMessage').filter({ hasText: 'Visitor history retained across reconnect' });
  await expect(visitorHistory).toBeVisible();
  const beforeVisitorReconnect = sockets.length;
  sockets.at(-1).socket.close();
  await expect.poll(() => sockets.length).toBe(beforeVisitorReconnect + 1);
  await expect.poll(() => page.evaluate(() => window.mudClient.gmcp.require('Auth.Autologin').currentGrant?.purpose)).toBe('visitor');
  await expect(visitorHistory).toHaveCount(1);
  await page.getByRole('button', { name: 'End temporary visit', exact: true }).click();
  await expect(visitorHistory).toHaveCount(0);
  await page.waitForFunction(() => window.mudClient.connected && window.mudClient.gmcp.ready);
  await expect(page.locator('.output-line-serverMessage').filter({ hasText: 'Recovery welcome: choose a character' })).toBeVisible();
  await page.reload();
  await page.locator('details.browser-sessions summary').click();
  await expect(command).toBeVisible();
  await page.waitForFunction(() => window.mudClient.connected && window.mudClient.gmcp.ready);
  await command.fill('stranger'); await command.press('Enter');
  await expect.poll(() => page.evaluate(() => window.mudClient.gmcp.require('Auth.Autologin').currentGrant?.playerUuid)).toBe('recovery-stranger');
  await page.getByRole('button', { name: 'Resume owner', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('previously saved character');
  await page.getByRole('button', { name: 'Choose a different character', exact: true }).click();
  await expect(command).toBeVisible();
  await page.waitForFunction(() => window.mudClient.connected && window.mudClient.gmcp.ready);
  await command.fill('owner'); await command.press('Enter');
  await expect.poll(() => page.evaluate(() => window.mudClient.gmcp.require('Auth.Autologin').currentGrant?.playerUuid)).toBe(owner.uuid);
  await expect(command).toBeHidden();
  await page.getByRole('button', { name: 'Resume owner', exact: true }).click();
  await expect(command).toBeVisible();
  await expect(page.getByText('Saved data is restored. Notifications remain paused; enable browser notifications when you want them.')).toBeVisible();
  const oldConnections = sockets.length;
  dropNextPing = true;
  await page.evaluate(() => window.mudClient.latency.probe());
  await expect.poll(() => sockets.length, { timeout: 22000 }).toBe(oldConnections + 1);
  await expect(page.locator('.status-latency')).toContainText(/Ping: \d+ ms/);
  await expect.poll(() => page.evaluate(() => window.mudClient.gmcp.require('Auth.Autologin').currentGrant?.playerUuid)).toBe(owner.uuid);
  assert.equal(sockets.length, oldConnections + 1);
  const legacy = await context.newPage();
  await legacy.goto(origin + '/editor?reference=%238%3Aput');
  await expect(legacy.getByRole('alert')).toContainText('older game tab');
  assert.equal(await legacy.locator('.monaco-editor').count(), 0);
  await page.evaluate(() => window.mudClient.close());
  console.log('Client recovery passed: repeated reconnect with failed history saves, persisted reload, visitor history retention and privacy, visit end/reload/login, rejected unrelated owner, retry selection, resumption without push permission, correlated reconnect recovery and explicit obsolete editor feedback.');
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
}
