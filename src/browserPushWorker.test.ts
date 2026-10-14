import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { handleBrowserPush, handleBrowserNotificationClick } from './browserPushWorker';
import { getBrowserInstallationId, saveEnrollmentState, type BrowserProfile } from './browserInstallation';
import { acceptAwayEnvelope, disableAwayRecipient, readBrowserAwayGrant, registerAwayRecipient,
  rememberAwayTab, takeAwayLines, type AwayEnvelope, type BrowserAwayGrant, type BrowserRecipient } from './awayV2';
import { MONGOOSE_SERVER_KEY } from './browserNotifications';

let a: BrowserRecipient;
let b: BrowserRecipient;
let grantA: BrowserAwayGrant;
let profile: BrowserProfile;
let fetchMock: ReturnType<typeof vi.fn>;
const material = { endpoint: 'https://push.example/worker-fixture', keys: { auth: 'synthetic-auth', p256dh: 'synthetic-public' } };
function envelope(recipient = a, lines: Array<[number, string]> = [[1, 'A first'], [2, 'A second']]): AwayEnvelope {
  return { ...recipient, version: 2, streamId: 'stream-a', streamOrder: 1,
    firstAvailable: 1, from: lines[0]?.[0] ?? 0, to: lines.at(-1)?.[0] ?? 0, lines };
}
function scope() {
  const windows = [a, b].map((recipient, index) => ({ id: `window-${index}`, url: 'https://client.mongoose.world/',
    focus: vi.fn(async () => null), postMessage: vi.fn((_message: unknown, ports?: MessagePort[]) => { ports?.[0]?.postMessage({ recipient }); }) }));
  const value = { location: new URL('https://client.mongoose.world/sw.js'),
    clients: { matchAll: vi.fn(async () => windows), openWindow: vi.fn(async () => null) },
    registration: { showNotification: vi.fn(async () => {}), pushManager: { getSubscription: async () => ({ toJSON: () => material }) } } };
  return { native: value as unknown as ServiceWorkerGlobalScope, ...value, windows };
}
beforeEach(async () => {
  globalThis.indexedDB = new IDBFactory();
  const installationId = await getBrowserInstallationId();
  a = { serverKey: MONGOOSE_SERVER_KEY, installationId, playerUuid: 'a', playerRef: '#101', bindingId: 'binding-a', revision: 1 };
  b = { ...a, playerUuid: 'b', playerRef: '#102', bindingId: 'binding-b' };
  grantA = { ...a, version: 2, sessionId: 'tab-a', token: 'synthetic-a', expires_at: Date.now() / 1000 + 600 };
  await registerAwayRecipient(grantA, a);
  await registerAwayRecipient({ ...b, version: 2, sessionId: 'tab-b', token: 'synthetic-b', expires_at: grantA.expires_at }, b);
  await rememberAwayTab('window-0', a, 'tab-a', false);
  await rememberAwayTab('window-1', b, 'tab-b', false);
  profile = { id: installationId, revision: 1, quiet: 0,
    bindings: [{ ...a, label: 'A', primary: 1, mode: 'primary', enabled: 1, stoppedKinds: [] },
      { ...b, label: 'B', primary: 0, mode: 'retained', enabled: 1, stoppedKinds: [] }] };
  await saveEnrollmentState(MONGOOSE_SERVER_KEY, { profile, subscription: material });
  fetchMock = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ highest: 2 }) }));
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it('stores only A, messages only matching A windows and uses a scoped tag/action without credentials', async () => {
  const worker = scope();
  await acceptAwayEnvelope(envelope(b, [[1, 'B private']]));
  await handleBrowserPush(worker.native, { title: 'Mongoose', kind: 'room', data: envelope() });
  expect(worker.windows[0].postMessage).toHaveBeenCalledWith({ type: 'browser-away', recipient: a });
  expect(worker.windows[1].postMessage).not.toHaveBeenCalled();
  expect((await takeAwayLines(a, 'tab-a')).lines).toEqual([[1, 'A first'], [2, 'A second']]);
  expect((await takeAwayLines(b, 'tab-b')).lines).toEqual([[1, 'B private']]);
  const options = worker.registration.showNotification.mock.calls[0][1];
  expect(options.tag).toContain('binding-a');
  expect(options.actions).toEqual([{ action: 'stop-kind', title: 'Stop these' }]);
  expect(JSON.stringify(options.data)).not.toContain('token');
  expect(JSON.stringify(options.data)).not.toContain('A first');
  expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer synthetic-a');
});

it('repairs gaps with A authority and acknowledges only the persisted contiguous receipt', async () => {
  const worker = scope();
  fetchMock.mockImplementation(async (url: string) => ({ ok: true, status: 200,
    json: async () => url.includes('browser_lines') ? { envelope: envelope(a, [[1, 'one'], [2, 'two'], [3, 'three']]) } : { highest: 3 } }));
  await handleBrowserPush(worker.native, { data: envelope(a, [[3, 'three']]) });
  expect(fetchMock.mock.calls.filter(([url]) => url.includes('browser_lines'))).toHaveLength(1);
  expect(fetchMock.mock.calls.every(([_url, options]) => options.headers.Authorization === 'Bearer synthetic-a')).toBe(true);
  expect(JSON.parse(fetchMock.mock.calls.at(-1)?.[1].body)).toEqual({ streamId: 'stream-a', seq: 3 });
  expect((await takeAwayLines(a, 'tab-a')).lines).toEqual([[1, 'one'], [2, 'two'], [3, 'three']]);
});

it.each(['forgotten', 'quiet', 'expired'])('quarantines a delayed %s push without personal content or data delivery', async mode => {
  if (mode === 'forgotten') await disableAwayRecipient(a);
  if (mode === 'quiet') await saveEnrollmentState(MONGOOSE_SERVER_KEY, { profile: { ...profile, quiet: 1, revision: 2 }, subscription: material });
  if (mode === 'expired') vi.spyOn(Date, 'now').mockReturnValue((grantA.expires_at + 1) * 1000);
  const worker = scope();
  await handleBrowserPush(worker.native, { title: 'Personal title', body: 'Personal body', data: envelope() });
  expect(JSON.stringify(worker.registration.showNotification.mock.calls)).not.toContain('Personal');
  expect(worker.windows.every(client => client.postMessage.mock.calls.length === 0)).toBe(true);
  expect(fetchMock).not.toHaveBeenCalled();
});

it('uses the worker registration and A-only authority for kind Stop', async () => {
  const worker = scope();
  const next = { ...a, revision: 2 };
  const nextProfile = { ...profile, revision: 2, bindings: [{ ...profile.bindings[0], ...next, stoppedKinds: ['room'] }, profile.bindings[1]] };
  fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({ recipient: next,
    grant: { ...grantA, ...next, token: 'synthetic-a-next' }, installation: nextProfile }) });
  await handleBrowserNotificationClick(worker.native, { action: 'stop-kind', notification: { close: vi.fn(), data: { recipient: a, kind: 'room' } } } as unknown as NotificationEvent);
  expect(fetchMock.mock.calls[0][0]).toContain('/api/webpush/browser_control');
  expect(fetchMock.mock.calls[0][0]).not.toContain('token');
  expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer synthetic-a');
  expect(JSON.parse(fetchMock.mock.calls[0][1].body).action).toEqual({ operation: 'stop-kind', kind: 'room', installationRevision: 1 });
  expect((await readBrowserAwayGrant(b, 'tab-b'))?.token).toBe('synthetic-b');
  expect(worker.clients.openWindow).not.toHaveBeenCalled();
});

it('replaces an unexpired retained credential after quiet/resume without extending its lifetime', async () => {
  const next = { ...a, revision: 3 };
  const nextProfile = { ...profile, revision: 3, bindings: [{ ...profile.bindings[0], ...next }, profile.bindings[1]] };
  await disableAwayRecipient({ ...a, revision: 2 });
  await saveEnrollmentState(MONGOOSE_SERVER_KEY, { profile: nextProfile, subscription: material });
  fetchMock.mockImplementation(async (url: string) => ({ ok: true, status: 200, json: async () => url.includes('browser_refresh')
    ? { grant: { ...grantA, ...next, token: 'synthetic-replaced' }, installation: nextProfile } : { highest: 2 } }));
  const worker = scope();
  await handleBrowserPush(worker.native, { data: envelope(next) });
  expect(fetchMock.mock.calls[0][0]).toContain('browser_refresh');
  expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer synthetic-a');
  expect((await readBrowserAwayGrant(next, 'tab-a'))?.expires_at).toBe(grantA.expires_at);
  expect((await takeAwayLines(next, 'tab-a')).lines).toHaveLength(2);
});

it('queries current window ownership before focusing a click target', async () => {
  const worker = scope();
  worker.clients.matchAll.mockResolvedValue([worker.windows[1], worker.windows[0]]);
  await handleBrowserNotificationClick(worker.native, { action: '', notification: { close: vi.fn(), data: { recipient: a } } } as unknown as NotificationEvent);
  expect(worker.windows[0].focus).toHaveBeenCalledOnce();
  expect(worker.windows[1].focus).not.toHaveBeenCalled();
  expect(worker.clients.openWindow).not.toHaveBeenCalled();
});

it('opens a metadata-only character selector when no current matching window exists', async () => {
  const worker = scope();
  worker.clients.matchAll.mockResolvedValue([worker.windows[1]]);
  await handleBrowserNotificationClick(worker.native, { action: '', notification: { close: vi.fn(), data: { recipient: a } } } as unknown as NotificationEvent);
  const url = new URL(worker.clients.openWindow.mock.calls[0][0]);
  expect(url.searchParams.get('notificationPlayer')).toBe('a');
  expect(url.href).not.toContain('synthetic-a');
  expect(worker.windows[1].focus).not.toHaveBeenCalled();
});
