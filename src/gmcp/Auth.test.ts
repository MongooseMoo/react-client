import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readEnrollmentState } from '../browserInstallation';
import { revokeBrowserSession } from '../browserSessionLogout';
import type MudClient from '../client';
import { useConnectionStore } from '../stores/connectionStore';
import { GMCPAutoLogin } from './Auth';
import { usePersonalDataStore } from '../stores/personalDataStore';

vi.mock('../browserSessionLogout', () => ({ revokeBrowserSession: vi.fn(async () => {}) }));

const installation = '00000000-0000-4000-8000-000000000001';
vi.mock('../browserInstallation', async () => ({
  ...await vi.importActual<typeof import('../browserInstallation')>('../browserInstallation'),
  getBrowserInstallationId: async () => installation,
  readEnrollmentState: vi.fn(async () => undefined),
}));
const handlers: GMCPAutoLogin[] = [];

function client() {
  const send = vi.fn();
  const endpoint = { liveServer: true, connected: true, gmcp: { send }, close: vi.fn() };
  const auth = new GMCPAutoLogin(endpoint as unknown as MudClient);
  handlers.push(auth);
  return { auth, endpoint, send };
}

function request(send: ReturnType<typeof vi.fn>, index = send.mock.calls.length - 1) {
  return JSON.parse(send.mock.calls[index][1]) as { sessionId: string; installationId: string; requestId: string; token?: string; playerUuid?: string };
}

function reply(auth: GMCPAutoLogin, send: ReturnType<typeof vi.fn>, playerUuid: string, token: string, index?: number) {
  const metadata = request(send, index);
  auth.receiveRegisteredMessage('SessionToken', {
    ...metadata, version: 2, playerUuid, playerRef: '#10', token, expires_at: Date.now() / 1000 + 3600,
  });
}

describe('player-pinned tab authentication', () => {
  beforeEach(() => {
    sessionStorage.clear();
    const values = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
      removeItem: (key: string) => { values.delete(key); },
      clear: () => values.clear(),
      key: (index: number) => [...values.keys()][index] ?? null,
      get length() { return values.size; },
    });
    useConnectionStore.getState().reset();
    vi.mocked(revokeBrowserSession).mockClear();
    vi.mocked(readEnrollmentState).mockReset();
    vi.mocked(readEnrollmentState).mockResolvedValue(undefined);
    const held = new Set<string>();
    vi.stubGlobal('navigator', {
      locks: {
        request: async (name: string, _options: LockOptions, callback: LockGrantedCallback) => {
          if (held.has(name)) return callback(null);
          held.add(name);
          try { return await callback({ name, mode: 'exclusive' }); }
          finally { held.delete(name); }
        },
      },
    });
  });
  afterEach(() => {
    for (const handler of handlers.splice(0)) handler.shutdown();
    vi.unstubAllGlobals();
  });

  it('keeps legacy authority unattributed and resumes exactly the tab-selected player', async () => {
    localStorage.setItem('LoginRefreshToken', 'synthetic-legacy-private');
    const first = client();
    first.auth.receiveRegisteredMessage('Token', 'synthetic-new-legacy');
    first.auth.sendStoredLogin();
    await Promise.resolve();
    expect(first.send).not.toHaveBeenCalled();
    first.auth.confirmPlayer('player-a');
    await vi.waitFor(() => expect(first.send).toHaveBeenCalledOnce());
    expect(first.send.mock.calls[0][0]).toBe('Auth.Autologin.Session');
    reply(first.auth, first.send, 'player-a', 'synthetic-tab-private');
    expect(first.auth.currentGrant?.playerUuid).toBe('player-a');
    expect(localStorage.getItem('LoginRefreshToken')).toBe('synthetic-legacy-private');
    first.auth.shutdown();
    await Promise.resolve();
    const reload = client();
    reload.auth.sendStoredLogin();
    await vi.waitFor(() => expect(reload.send).toHaveBeenCalledOnce());
    expect(reload.send.mock.calls[0][0]).toBe('Auth.Autologin.Resume');
    expect(request(reload.send).playerUuid).toBe('player-a');
    expect(request(reload.send).token).toBe('synthetic-tab-private');
  });

  it('rejects late and wrong-player grants after reset or a character switch', async () => {
    const { auth, send } = client();
    auth.confirmPlayer('player-a');
    await vi.waitFor(() => expect(send).toHaveBeenCalledOnce());
    auth.reset();
    reply(auth, send, 'player-a', 'synthetic-stale');
    expect(auth.currentGrant).toBeUndefined();
    auth.confirmPlayer('player-b');
    await vi.waitFor(() => expect(send).toHaveBeenCalledTimes(2));
    reply(auth, send, 'player-a', 'synthetic-wrong-player');
    expect(auth.currentGrant).toBeUndefined();
    reply(auth, send, 'player-a', 'synthetic-stale', 0);
    expect(auth.currentGrant).toBeUndefined();
    reply(auth, send, 'player-b', 'synthetic-current');
    expect(auth.currentGrant?.token).toBe('synthetic-current');
  });

  it('carries existing installation possession in owner confirmation and fences a delayed read after switching', async () => {
    const subscription = { endpoint: 'https://push.example/confirmation-fixture', keys: { auth: 'synthetic', p256dh: 'synthetic' } };
    const saved = { subscription, profile: { id: installation, revision: 1, quiet: 0, bindings: [] } };
    vi.mocked(readEnrollmentState).mockResolvedValueOnce(saved);
    const first = client();
    first.auth.confirmPlayer('player-a');
    await vi.waitFor(() => expect(first.send).toHaveBeenCalledOnce());
    expect(JSON.parse(first.send.mock.calls[0][1]).subscription).toEqual(subscription);
    first.auth.reset();
    let finish: ((value: typeof saved) => void) | undefined;
    vi.mocked(readEnrollmentState).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    first.auth.confirmPlayer('player-old');
    await vi.waitFor(() => expect(finish).toBeDefined());
    first.auth.confirmPlayer('player-new');
    await vi.waitFor(() => expect(first.send).toHaveBeenCalledTimes(2));
    finish?.(saved);
    await Promise.resolve();
    expect(first.send).toHaveBeenCalledTimes(2);
    expect(JSON.parse(first.send.mock.calls[1][1]).subscription).toBeUndefined();
  });

  it('reports an active-player conflict without starting takeover or discarding the grant', async () => {
    const first = client();
    first.auth.confirmPlayer('player-a');
    await vi.waitFor(() => expect(first.send).toHaveBeenCalledOnce());
    reply(first.auth, first.send, 'player-a', 'synthetic-tab-private');
    first.auth.shutdown();
    await Promise.resolve();
    const reload = client();
    reload.auth.sendStoredLogin();
    await vi.waitFor(() => expect(reload.send).toHaveBeenCalledOnce());
    reload.auth.receiveRegisteredMessage('SessionStatus', { ...request(reload.send), status: 'connected', version: 2 });
    expect(useConnectionStore.getState().statusText).toContain('already connected');
    expect(reload.send).toHaveBeenCalledOnce();
    expect(reload.auth.currentGrant?.playerUuid).toBe('player-a');
  });

  it('keeps an ordinary guest connected without remembered account authority', async () => {
    const { auth, endpoint, send } = client();
    auth.confirmPlayer('guest-player');
    await vi.waitFor(() => expect(send).toHaveBeenCalledOnce());
    auth.receiveRegisteredMessage('SessionStatus', { ...request(send), version: 2, status: 'unavailable' });
    expect(auth.currentGrant).toBeUndefined();
    expect(endpoint.close).not.toHaveBeenCalled();
    expect(useConnectionStore.getState().statusText).toContain('Guest session');
  });

  it('does not request live grants in a local runtime and clears local authority when sign-out sending fails', async () => {
    const { auth, endpoint, send } = client();
    endpoint.liveServer = false;
    auth.sendStoredLogin();
    auth.confirmPlayer('local-player');
    await Promise.resolve();
    expect(send).not.toHaveBeenCalled();
    endpoint.liveServer = true;
    auth.confirmPlayer('player-a');
    await vi.waitFor(() => expect(send).toHaveBeenCalledOnce());
    reply(auth, send, 'player-a', 'synthetic-tab-private');
    send.mockImplementation(() => { throw new Error('closed transport'); });
    expect(() => auth.signOut()).toThrow('closed transport');
    expect(auth.currentGrant).toBeUndefined();
    expect(endpoint.close).toHaveBeenCalledOnce();
    expect(usePersonalDataStore.getState().identityState).toBe('forgotten');
    expect(usePersonalDataStore.getState().owner).toBeUndefined();
  });

  it('revokes the pinned tab through HTTP when its game socket is disconnected', async () => {
    const { auth, endpoint, send } = client();
    auth.confirmPlayer('player-a');
    await vi.waitFor(() => expect(send).toHaveBeenCalledOnce());
    reply(auth, send, 'player-a', 'synthetic-disconnected-tab');
    const owner = auth.currentGrant;
    endpoint.connected = false;
    auth.signOut();
    expect(revokeBrowserSession).toHaveBeenCalledWith(owner);
    expect(send).toHaveBeenCalledOnce();
    expect(auth.currentGrant).toBeUndefined();
    expect(endpoint.close).toHaveBeenCalledOnce();
  });
});
