import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type MudClient from './client';
import { enrollBrowserNotifications, MONGOOSE_SERVER_KEY, useBrowserNotifications } from './browserNotifications';
import { getBrowserInstallationId, readEnrollmentState, type BrowserProfile } from './browserInstallation';
import { usePersonalDataStore } from './stores/personalDataStore';
import type { SessionGrant } from './tabSession';
import type { BrowserRecipient } from './awayV2';

let owner: SessionGrant;
let recipient: BrowserRecipient;
let profile: BrowserProfile;
let fetchMock: ReturnType<typeof vi.fn>;
let client: { liveServer: boolean; connected: boolean; gmcp: { generation: number; require: (name: string) => unknown } };
const material = { endpoint: 'https://push.example/enrollment', keys: { auth: 'synthetic-auth', p256dh: 'synthetic-public' } };
const reply = () => ({ recipient, grant: { ...recipient, version: 2, token: 'synthetic-away', sessionId: owner.sessionId, expires_at: owner.expires_at }, installation: profile });

beforeEach(async () => {
  globalThis.indexedDB = new IDBFactory();
  const installationId = await getBrowserInstallationId();
  owner = { version: 2, purpose: 'owner', token: 'synthetic-session', sessionId: 'tab-a', installationId,
    playerUuid: 'a', playerRef: '#101', expires_at: Date.now() / 1000 + 600, requestId: 'request-a' };
  recipient = { serverKey: MONGOOSE_SERVER_KEY, installationId, playerUuid: 'a', playerRef: '#101', bindingId: 'binding-a', revision: 1 };
  profile = { id: installationId, revision: 1, quiet: 0, bindings: [{ ...recipient, label: 'A', primary: 1, mode: 'primary', enabled: 1, stoppedKinds: [] }] };
  usePersonalDataStore.setState({ policyReady: true, visitor: false, owner: { runtime: 'live:fixture', playerUuid: 'a', playerRef: '#101' } });
  useBrowserNotifications.setState({ context: undefined, busy: false, error: '' });
  const auth = { get currentGrant() { return owner; } };
  const webPush = { requestSessionToken: async () => ({ ...owner, serverKey: MONGOOSE_SERVER_KEY, token: 'synthetic-enrollment' }) };
  client = { liveServer: true, connected: true, gmcp: { generation: 1, require: name => name === 'Auth.Autologin' ? auth : webPush } };
  vi.stubGlobal('Notification', { permission: 'granted' });
  vi.stubGlobal('navigator', { serviceWorker: { ready: Promise.resolve({ active: { postMessage: vi.fn() },
    pushManager: { getSubscription: async () => ({ toJSON: () => material }) } }) } });
  fetchMock = vi.fn(async (url: string) => ({ ok: true, status: 200, json: async () => url.includes('browser_profile')
    ? { ...profile, revision: 0, bindings: [] } : reply() }));
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

it('saves a fully addressed enrollment and keeps credentials out of recipient metadata', async () => {
  await enrollBrowserNotifications(client as unknown as MudClient);
  expect(useBrowserNotifications.getState().context?.recipient).toEqual(recipient);
  expect(JSON.stringify(useBrowserNotifications.getState().context?.recipient)).not.toContain('token');
  expect((await readEnrollmentState(MONGOOSE_SERVER_KEY, owner.installationId))?.profile.revision).toBe(1);
  expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe('Bearer synthetic-enrollment');
  expect(JSON.parse(fetchMock.mock.calls[1][1].body).options.installationRevision).toBe(0);
});

it('does not assign a delayed A reply to B after a native identity generation change', async () => {
  let finish = (_value: unknown) => {};
  let started = () => {};
  const waiting = new Promise<void>(resolve => { started = resolve; });
  fetchMock.mockImplementation(async (url: string) => {
    if (url.includes('bindings')) { started(); return new Promise(resolve => { finish = resolve; }); }
    return { ok: true, status: 200, json: async () => ({ ...profile, revision: 0, bindings: [] }) };
  });
  const pending = enrollBrowserNotifications(client as unknown as MudClient);
  await waiting;
  const oldReply = reply();
  owner = { ...owner, playerUuid: 'b', playerRef: '#102' };
  client.gmcp.generation++;
  usePersonalDataStore.getState().confirm({ runtime: 'live:fixture', playerUuid: 'b', playerRef: '#102' });
  finish({ ok: true, status: 200, json: async () => oldReply });
  await pending;
  expect(useBrowserNotifications.getState().context).toBeUndefined();
  expect(await readEnrollmentState(MONGOOSE_SERVER_KEY, owner.installationId)).toBeUndefined();
});

it('keeps visitor authority out of persistent browser enrollment', async () => {
  owner.purpose = 'visitor';
  await enrollBrowserNotifications(client as unknown as MudClient);
  expect(fetchMock).not.toHaveBeenCalled();
});
