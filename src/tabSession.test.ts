import { describe, expect, it } from 'vitest';
import { TabSession, type SessionGrant } from './tabSession';

function storage(contents: Record<string, string> = {}) {
  return {
    contents,
    getItem: (key: string) => contents[key] ?? null,
    setItem: (key: string, value: string) => { contents[key] = value; },
    removeItem: (key: string) => { delete contents[key]; },
  };
}

function locks() {
  const held = new Set<string>();
  return {
    held,
    manager: {
      request: async (name: string, _options: LockOptions, callback: LockGrantedCallback) => {
        if (held.has(name)) return callback(null);
        held.add(name);
        try { return await callback({ name, mode: 'exclusive' }); }
        finally { held.delete(name); }
      },
    } as Pick<LockManager, 'request'>,
  };
}

const grant: SessionGrant = {
  version: 2, token: 'synthetic-private', sessionId: 'original-tab-owner',
  installationId: 'same-installation', playerUuid: 'character-a', playerRef: '#10',
  expires_at: Date.now() / 1000 + 3600, requestId: 'original-request',
};
const key = 'mongoose:tab:v2:https://game.example';

describe('exclusive tab session authority', () => {
  it('resumes the same player after reload while a copied active tab gets fresh ownership', async () => {
    const sharedLocks = locks();
    const originalStorage = storage({ [key]: JSON.stringify({ version: 2, sessionId: grant.sessionId, grant }) });
    const original = new TabSession('https://game.example', {
      storage: originalStorage, locks: sharedLocks.manager,
      installation: async () => grant.installationId, newId: () => 'new-owner-original',
    });
    await original.prepare();
    expect(original.grant?.playerUuid).toBe('character-a');
    const copiedStorage = storage({ ...originalStorage.contents });
    const copied = new TabSession('https://game.example', {
      storage: copiedStorage, locks: sharedLocks.manager,
      installation: async () => grant.installationId, newId: () => 'new-owner-copied',
    });
    await copied.prepare();
    expect(copied.sessionId).toBe('new-owner-copied');
    expect(copied.grant).toBeUndefined();
    expect(original.grant?.token).toBe('synthetic-private');
    original.dispose();
    await Promise.resolve();
    const reload = new TabSession('https://game.example', {
      storage: originalStorage, locks: sharedLocks.manager,
      installation: async () => grant.installationId, newId: () => 'new-owner-reload',
    });
    await reload.prepare();
    expect(reload.sessionId).toBe(grant.sessionId);
    expect(reload.grant?.playerUuid).toBe('character-a');
    reload.dispose();
    copied.dispose();
  });

  it('does not use copied authority without Web Locks or after installation replacement', async () => {
    for (const installation of [grant.installationId, 'replacement-installation']) {
      const tab = new TabSession('https://game.example', {
        storage: storage({ [key]: JSON.stringify({ version: 2, sessionId: grant.sessionId, grant }) }),
        locks: installation === grant.installationId ? undefined : locks().manager,
        installation: async () => installation, newId: () => 'fresh-tab',
      });
      await tab.prepare();
      expect(tab.grant).toBeUndefined();
      tab.dispose();
    }
  });

  it('keeps normal login available with denied storage and rejects a foreign grant', async () => {
    const tab = new TabSession('https://game.example', {
      storage: { ...storage(), getItem: () => { throw new Error('storage denied'); } },
      locks: locks().manager, installation: async () => grant.installationId, newId: () => 'fresh-tab',
    });
    await expect(tab.prepare()).resolves.toBeUndefined();
    expect(tab.save(grant)).toBe(false);
    tab.dispose();
  });

  it('does not acquire lasting ownership when shutdown precedes storage startup', async () => {
    const sharedLocks = locks();
    let ready!: (id: string) => void;
    const tab = new TabSession('https://game.example', {
      storage: storage(), locks: sharedLocks.manager,
      installation: () => new Promise((resolve) => { ready = resolve; }), newId: () => 'fresh-tab',
    });
    const pending = tab.prepare();
    tab.dispose();
    ready(grant.installationId);
    await pending;
    expect(sharedLocks.held.size).toBe(0);
    expect(tab.save({ ...grant, sessionId: 'fresh-tab' })).toBe(false);
  });
});
