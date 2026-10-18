import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';

// Native app, IndexedDB, BroadcastChannel, Web Locks and service worker.
// The socket and API are controlled protocol fixtures, never live accounts.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const server = createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const file = resolve(dist, `.${pathname === '/' || pathname === '/editor' ? '/index.html' : pathname}`);
  if (!file.startsWith(dist + sep)) return res.writeHead(403).end();
  try {
    const bytes = await readFile(file);
    res.writeHead(200, { 'Content-Type': file.endsWith('.js') ? 'text/javascript' :
      file.endsWith('.css') ? 'text/css' : file.endsWith('.html') ? 'text/html' : 'application/octet-stream' }).end(bytes);
  } catch { res.writeHead(404).end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: 'chromium', headless: true });
try {
  const context = await browser.newContext();
  await context.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
  await context.route('https://cdn.jsdelivr.net/npm/monaco-editor@*/min/vs/**', async route => {
    const suffix = new URL(route.request().url()).pathname.split('/min/')[1];
    const directory = resolve(root, 'node_modules/monaco-editor/min');
    const file = resolve(directory, suffix);
    assert(file.startsWith(directory + sep));
    await route.fulfill({ path: file, headers: { 'Access-Control-Allow-Origin': '*' } });
  });
  let connection = 0;
  const sockets = [];
  const gmcp = (name, data) => Buffer.concat([Buffer.from([255, 250, 201]), Buffer.from(`${name} ${JSON.stringify(data)}`), Buffer.from([255, 240])]);
  await context.routeWebSocket('**/*', socket => {
    const index = connection++;
    const who = index === 0 ? { uuid: 'native-owner-a', name: '#101', fullname: 'Native owner A' } :
      { uuid: 'native-owner-b', name: '#102', fullname: 'Native owner B' };
    sockets.push(socket);
    socket.onMessage(message => {
      const text = Buffer.from(message).toString('utf8');
      const match = text.match(/Auth\.Autologin\.Session (\{.*\})/s);
      if (match) {
        const request = JSON.parse(match[1]);
        socket.send(gmcp('Auth.Autologin.SessionToken', { ...request, version: 2, playerUuid: who.uuid,
          playerRef: who.name, token: `synthetic-native-${index}`, expires_at: Date.now() / 1000 + 600 }));
      }
    });
    setTimeout(() => socket.send(gmcp('Char.Name', who)), 150);
  });
  const a = await context.newPage();
  await a.goto(origin);
  await expect.poll(() => a.evaluate(() => window.mudClient?.gmcp.require('Auth.Autologin').currentGrant?.playerUuid)).toBe('native-owner-a');
  const b = await context.newPage();
  await b.goto(origin);
  await expect.poll(() => b.evaluate(() => window.mudClient?.gmcp.require('Auth.Autologin').currentGrant?.playerUuid)).toBe('native-owner-b');
  const owners = await Promise.all([a, b].map(page => page.evaluate(() => window.mudClient.gmcp.require('Auth.Autologin').currentGrant)));
  assert.equal(owners[0].installationId, owners[1].installationId);
  assert.notEqual(owners[0].sessionId, owners[1].sessionId);

  const recipients = owners.map((owner, index) => ({ serverKey: 'https://mongoose.world', installationId: owner.installationId,
    playerUuid: owner.playerUuid, playerRef: owner.playerRef, bindingId: `native-binding-${index}`, revision: 1 }));
  const profile = { id: owners[0].installationId, revision: 1, quiet: 0,
    bindings: recipients.map((recipient, index) => ({ ...recipient, label: `Owner ${index}`, primary: index === 0,
      mode: index === 0 ? 'primary' : 'retained', enabled: 1, stoppedKinds: [] })) };
  await a.evaluate(async ({ owners, recipients, profile }) => {
    const open = (name, version, stores) => new Promise((resolve, reject) => {
      const request = indexedDB.open(name, version);
      request.onupgradeneeded = () => { for (const store of stores) if (!request.result.objectStoreNames.contains(store)) request.result.createObjectStore(store); };
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    const commit = (db, stores, work) => new Promise((resolve, reject) => {
      const tx = db.transaction(stores, 'readwrite'); work(tx); tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => reject(tx.error);
    });
    const browser = await open('mongoose-browser', 1, ['installation']);
    await commit(browser, ['installation'], tx => tx.objectStore('installation').put({ profile,
      subscription: { endpoint: 'https://push.example/native-fixture', keys: { auth: 'synthetic', p256dh: 'synthetic' } } },
      ['enrollment', 'https://mongoose.world', profile.id]));
    const away = await open('mongoose-away-v2', 2, ['recipients', 'streams', 'lines', 'credentials', 'rendered', 'tabs']);
    await commit(away, ['recipients', 'credentials'], tx => recipients.forEach((recipient, index) => {
      const key = [recipient.serverKey, recipient.playerUuid, recipient.bindingId];
      tx.objectStore('recipients').put({ ...recipient, enabled: true }, key);
      tx.objectStore('credentials').put({ ...recipient, version: 2, sessionId: owners[index].sessionId,
        token: `synthetic-away-${index}`, expires_at: owners[index].expires_at }, [...key, owners[index].sessionId]);
    }));
  }, { owners, recipients, profile });
  for (let i = 0; i < 2; i++) await [a, b][i].evaluate(async ({ recipient, owner, profile }) => {
    await navigator.serviceWorker.register('/sw.js');
    const registration = await navigator.serviceWorker.ready;
    await new Promise(resolve => {
      if (navigator.serviceWorker.controller) resolve(); else navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true });
    });
    window.mudClient.setBrowserNotificationContext({ recipient,
      grant: { ...recipient, version: 2, token: 'synthetic-away', sessionId: owner.sessionId, expires_at: owner.expires_at },
      sessionId: owner.sessionId, profile });
    navigator.serviceWorker.controller.postMessage({ type: 'browser-owner', recipient, sessionId: owner.sessionId, connected: true });
    window.nativeOwnerMessages = [];
    navigator.serviceWorker.addEventListener('message', event => window.nativeOwnerMessages.push(event.data));
  }, { recipient: recipients[i], owner: owners[i], profile });
  await context.grantPermissions(['notifications'], { origin });
  const cdp = await context.newCDPSession(a);
  let registrationId;
  cdp.on('ServiceWorker.workerRegistrationUpdated', ({ registrations }) => {
    registrationId = registrations.find(registration => registration.scopeURL === origin + '/')?.registrationId ?? registrationId;
  });
  await cdp.send('ServiceWorker.enable');
  await expect.poll(() => registrationId).toBeTruthy();
  const data = { ...recipients[0], version: 2, streamId: 'native-stream-a', streamOrder: 1,
    firstAvailable: 1, from: 1, to: 1, lines: [[1, 'Native A private backlog']] };
  await cdp.send('ServiceWorker.deliverPushMessage', { origin, registrationId, data: JSON.stringify({ title: 'Native A', kind: 'room', data }) });
  await expect.poll(() => a.evaluate(() => window.nativeOwnerMessages.filter(message => message.type === 'browser-away').length)).toBe(1);
  assert.equal(await b.evaluate(() => window.nativeOwnerMessages.filter(message => message.type === 'browser-away').length), 0);
  const notifications = await a.evaluate(async () => (await (await navigator.serviceWorker.ready).getNotifications()).map(notification =>
    ({ title: notification.title, tag: notification.tag, data: notification.data })));
  assert.equal(notifications.length, 1);
  assert.equal(notifications[0].data.recipient.playerUuid, owners[0].playerUuid);
  assert(!JSON.stringify(notifications).includes('synthetic-away'));
  assert(!JSON.stringify(notifications).includes('Native A private backlog'));

  const popup = a.waitForEvent('popup');
  await a.evaluate(() => window.mudClient.editors.openEditorWindow({ reference: 'native-edit-ref', type: 'string', name: 'Native owner draft', contents: ['Owner-only draft'] }));
  const editor = await popup;
  await editor.waitForLoadState('networkidle');
  await expect(editor.getByRole('button', { name: 'Download', exact: true })).toBeVisible();
  await editor.locator('.monaco-editor .view-lines').click();
  await editor.keyboard.press('Control+A');
  await editor.keyboard.type('Owner-only unsaved draft');
  await expect(editor.locator('body')).toContainText('unsaved', { ignoreCase: true });

  // Change the canonical policy through IndexedDB; the actual cross-window
  // channel must mask both owners without assigning either window to the visitor.
  await a.evaluate(async () => {
    const db = await new Promise(resolve => { const request = indexedDB.open('mongoose-browser', 1); request.onsuccess = () => resolve(request.result); });
    await new Promise(resolve => {
      const tx = db.transaction('installation', 'readwrite');
      tx.objectStore('installation').put({ revision: 1, phase: 'visitor', visitorSessionId: 'different-visitor-tab', ownerPlayers: ['native-owner-a', 'native-owner-b'] }, 'policy');
      tx.oncomplete = () => { db.close(); resolve(); };
    });
    new BroadcastChannel('mongoose:browser-policy:v1').postMessage({ revision: 1 });
  });
  await expect(a.getByRole('textbox', { name: 'Command', exact: true })).toBeHidden();
  await expect(b.getByRole('textbox', { name: 'Command', exact: true })).toBeHidden();
  await expect(editor.getByRole('button', { name: 'Download', exact: true })).toBeHidden();
  await expect(editor.getByText('This editor is paused during the temporary visit. Your work is kept for the owner.')).toBeVisible();
  await a.locator('details.browser-sessions summary').click();
  await expect(a.getByText('A temporary visit is active in another tab. Saved data stays paused.')).toBeVisible();
  await b.reload();
  await expect(b.getByRole('textbox', { name: 'Command', exact: true })).toBeHidden();
  console.log('Native Chromium browser-session journey passed: independent tab grants, canonical installation, actual worker push ownership, private notification metadata, cross-tab visitor pause and reload.');
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
}
