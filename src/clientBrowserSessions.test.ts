import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import MudClient from './client';
import { acceptAwayEnvelope, readAwayStream, registerAwayRecipient, takeAwayLines, type AwayEnvelope, type BrowserRecipient } from './awayV2';
import type { BrowserNotificationContext } from './browserNotifications';
import { usePersonalDataStore } from './stores/personalDataStore';
import { useOutputStore } from './stores/outputStore';
import { AutoreadMode, usePreferences } from './stores/preferencesStore';
import { storeAwayToken } from './away';

vi.mock('./audio/MediaService', () => ({ MediaService: class {
  stopAllSounds = vi.fn(); shutdown = vi.fn(); pauseAllSounds = vi.fn(async () => {});
} }));
const clients: MudClient[] = [];
class Socket {
  static CONNECTING = 0; static OPEN = 1; static CLOSING = 2; static CLOSED = 3;
  readyState = 1; send = vi.fn(); close = vi.fn(() => { this.readyState = 3; });
  onopen?: (event: Event) => void; onclose?: (event: Event) => void;
  onmessage?: (event: MessageEvent) => void; onerror?: (event: Event) => void;
  constructor() { sockets.push(this); }
}
let sockets: Socket[];
let listeners: Array<(event: MessageEvent) => void>;
let fetchMock: ReturnType<typeof vi.fn>;
let getNotifications: ReturnType<typeof vi.fn>;
const a: BrowserRecipient = { serverKey: 'https://mongoose.world', installationId: 'fixture-installation',
  playerUuid: 'a', playerRef: '#101', bindingId: 'binding-a', revision: 1 };
const b = { ...a, playerUuid: 'b', playerRef: '#102', bindingId: 'binding-b' };
function context(recipient = a, sessionId = 'tab-a'): BrowserNotificationContext {
  return { recipient, sessionId, grant: { ...recipient, version: 2, sessionId, token: `synthetic-${recipient.playerUuid}`, expires_at: Date.now() / 1000 + 600 },
    profile: { id: recipient.installationId, revision: 1, quiet: 0, bindings: [] } };
}
function envelope(recipient = a, text = 'Owned away output'): AwayEnvelope {
  return { ...recipient, version: 2, streamId: 'stream-1', streamOrder: 1,
    firstAvailable: 1, from: 1, to: 1, lines: [[1, text]] };
}
type Internal = { awayWork: Promise<void>; sendCommandWhileAway: (line: string, error: Error) => Promise<void> };
async function settled(client: MudClient): Promise<void> {
  let pending: Promise<void>;
  do { pending = (client as unknown as Internal).awayWork; await pending; }
  while (pending !== (client as unknown as Internal).awayWork);
  await Promise.resolve();
}
async function create(owner = a, connected = false): Promise<MudClient> {
  const client = new MudClient('fixture.example', 443);
  clients.push(client);
  client.connect();
  sockets.at(-1)?.onopen?.(new Event('open'));
  usePersonalDataStore.getState().confirm({ runtime: client.runtimeNamespace, playerUuid: owner.playerUuid, playerRef: owner.playerRef });
  const held = context(owner);
  await registerAwayRecipient(held.grant, owner);
  client.setBrowserNotificationContext(held);
  await settled(client);
  if (!connected) { client.close(); await settled(client); }
  return client;
}
async function command(client: MudClient, line: string): Promise<void> {
  const fallback = vi.spyOn(client as unknown as Internal, 'sendCommandWhileAway');
  client.sendCommand(line);
  await Promise.all(fallback.mock.results.map(result => result.value));
  await settled(client);
}
beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  sockets = []; listeners = [];
  usePersonalDataStore.setState({ policyReady: true, owner: undefined, visitor: false });
  useOutputStore.getState().reset();
  usePreferences.getState().setSpeech({ autoreadMode: AutoreadMode.Off });
  usePreferences.getState().setGeneral({ localEcho: false });
  vi.stubGlobal('WebSocket', Socket);
  fetchMock = vi.fn(async (url: string) => ({ ok: true, status: 200, json: async () => url.includes('browser_command')
    ? { ok: 1, envelope: envelope() } : { highest: 1 } }));
  vi.stubGlobal('fetch', fetchMock);
  getNotifications = vi.fn(async () => []);
  vi.stubGlobal('navigator', { serviceWorker: {
    controller: { postMessage: vi.fn() }, getRegistration: async () => ({ getNotifications }),
    addEventListener: (_type: string, listener: (event: MessageEvent) => void) => { listeners.push(listener); },
    removeEventListener: (_type: string, listener: (event: MessageEvent) => void) => { listeners = listeners.filter(item => item !== listener); },
  } });
});
afterEach(() => { for (const client of clients.splice(0)) client.shutdown(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it('ignores legacy worker data and rejects global legacy credentials before a player is confirmed', async () => {
  await storeAwayToken({ token: 'synthetic-legacy-b', expires_at: Date.now() / 1000 + 600 });
  const client = new MudClient('fixture.example', 443); clients.push(client);
  client.connect(); sockets[0].onopen?.(new Event('open')); client.close();
  for (const listener of listeners) listener({ data: { type: 'away-lines', lines: [{ seq: 1, text: 'Unassigned legacy' }] } } as MessageEvent);
  await command(client, 'look');
  expect(fetchMock).not.toHaveBeenCalled();
  expect(JSON.stringify(useOutputStore.getState().entries)).not.toContain('Unassigned legacy');
});

it('renders matching stored lines once per tab and ignores another player worker message', async () => {
  const client = await create();
  await acceptAwayEnvelope(envelope());
  for (const listener of listeners) listener({ data: { type: 'browser-away', recipient: b } } as MessageEvent);
  await settled(client);
  expect(useOutputStore.getState().entries).toEqual([]);
  for (let i = 0; i < 2; i++) {
    for (const listener of listeners) listener({ data: { type: 'browser-away', recipient: a } } as MessageEvent);
    await settled(client);
  }
  expect(useOutputStore.getState().entries).toEqual([{ id: 1, type: 'message', message: 'Owned away output', provisional: true }]);
});

it('uses A authority for autosay commands despite a legacy B token, with echo before output', async () => {
  const client = await create();
  await storeAwayToken({ token: 'synthetic-legacy-b', expires_at: Date.now() / 1000 + 600 });
  usePreferences.getState().setGeneral({ localEcho: true });
  client.autosay = true;
  await command(client, 'hello');
  expect(fetchMock.mock.calls[0][0]).toContain('/api/away/browser_command');
  expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer synthetic-a');
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ line: 'say hello' });
  expect(useOutputStore.getState().entries.map(entry => entry.type)).toEqual(['command', 'message']);
});

it('drops late A command rendering after selecting B without writing under B', async () => {
  const client = await create();
  let finish = (_value: unknown) => {};
  fetchMock.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  const pending = command(client, 'look');
  usePersonalDataStore.getState().confirm({ runtime: client.runtimeNamespace, playerUuid: b.playerUuid, playerRef: b.playerRef });
  const next = context(b, 'tab-b');
  await registerAwayRecipient(next.grant, b);
  client.setBrowserNotificationContext(next);
  finish({ ok: true, status: 200, json: async () => ({ envelope: envelope() }) });
  await pending;
  expect(useOutputStore.getState().entries).toEqual([]);
  expect((await takeAwayLines(b, 'tab-b')).lines).toEqual([]);
});

it('rejects a response naming B when the command was authorized for A', async () => {
  const client = await create();
  fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ envelope: envelope(b, 'B private') }) });
  await command(client, 'look');
  expect(JSON.stringify(useOutputStore.getState().entries)).not.toContain('B private');
  expect(await readAwayStream(b)).toBeUndefined();
});

it.each([401, 403, 429, 502])('reports an owned HTTP %i failure without using other credentials', async status => {
  const client = await create();
  fetchMock.mockResolvedValueOnce({ ok: false, status, json: async () => ({}) });
  await command(client, 'look');
  expect(useOutputStore.getState().entries[0].type).toBe('error');
  expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer synthetic-a');
});

it('closes only A’s captured stream/notification while B storage and notifications remain', async () => {
  const client = await create();
  const other = context(b, 'tab-b');
  await registerAwayRecipient(other.grant, b);
  await acceptAwayEnvelope(envelope());
  await acceptAwayEnvelope(envelope(b, 'B preserved'));
  const old = { close: vi.fn(), data: { streamId: 'stream-1' } };
  const newer = { close: vi.fn(), data: { streamId: 'stream-2' } };
  getNotifications.mockResolvedValue([old, newer]);
  client.connect(); sockets.at(-1)?.onopen?.(new Event('open'));
  usePersonalDataStore.getState().confirm({ runtime: client.runtimeNamespace, playerUuid: a.playerUuid, playerRef: a.playerRef });
  client.setBrowserNotificationContext(context());
  await settled(client);
  expect((await readAwayStream(a))?.closed).toBe(true);
  expect((await readAwayStream(b))?.closed).toBe(false);
  expect(old.close).toHaveBeenCalledOnce();
  expect(newer.close).not.toHaveBeenCalled();
  expect(getNotifications.mock.calls[0][0].tag).toContain('binding-a');
});
