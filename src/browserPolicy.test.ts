import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { readBrowserPolicy, saveBrowserPolicy } from './browserInstallation';
import { canUseBrowserWindow, changeBrowserPolicy, disposeBrowserPolicy, initializeBrowserPolicy, refreshBrowserPolicy, useBrowserPolicy } from './browserPolicy';
import { personalStorageKey, usePersonalDataStore } from './stores/personalDataStore';

beforeEach(() => {
  disposeBrowserPolicy();
  globalThis.indexedDB = new IDBFactory();
  usePersonalDataStore.setState({ owner: { runtime: 'live:fixture', playerUuid: 'owner-a', playerRef: '#101' }, visitor: false, visitorWindow: false });
});
afterEach(() => disposeBrowserPolicy());

it('withholds saved data until policy is read and keeps a visit paused across reload/end', async () => {
  expect(personalStorageKey('output')).toBeUndefined();
  await initializeBrowserPolicy('owner-tab');
  expect(personalStorageKey('output')).toBeDefined();
  const policy = useBrowserPolicy.getState().policy;
  await changeBrowserPolicy(policy, { phase: 'visitor', visitorSessionId: 'visitor-tab', ownerPlayers: ['owner-a'] });
  expect(usePersonalDataStore.getState().visitorWindow).toBe(false);
  expect(personalStorageKey('output')).toBeUndefined();
  disposeBrowserPolicy();
  await initializeBrowserPolicy('visitor-tab');
  expect(usePersonalDataStore.getState().visitorWindow).toBe(true);
  expect(personalStorageKey('output')).toBeUndefined();
  await changeBrowserPolicy(useBrowserPolicy.getState().policy, { phase: 'owner-paused', visitorSessionId: 'visitor-tab', ownerPlayers: ['owner-a'] });
  expect(personalStorageKey('output')).toBeUndefined();
  expect((await readBrowserPolicy()).phase).toBe('owner-paused');
  await changeBrowserPolicy(useBrowserPolicy.getState().policy, { phase: 'owner', visitorSessionId: '', ownerPlayers: ['owner-a'] });
  expect(personalStorageKey('output')).toBeDefined();
});

it('serializes competing visitor transitions without overwriting the first owner decision', async () => {
  const first = { phase: 'visitor' as const, visitorSessionId: 'one', ownerPlayers: ['a'] };
  const second = { ...first, visitorSessionId: 'two' };
  const results = await Promise.allSettled([saveBrowserPolicy(0, first), saveBrowserPolicy(0, second)]);
  expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
  expect((await readBrowserPolicy()).visitorSessionId).toBe('one');
});

it('never reclassifies an old owner editor as visitor work when the tab identifier is reused', () => {
  const visitor = { revision: 1, phase: 'visitor' as const, visitorSessionId: 'reused-tab', ownerPlayers: ['a'] };
  expect(canUseBrowserWindow(visitor, 'reused-tab', 'owner')).toBe(false);
  expect(canUseBrowserWindow(visitor, 'reused-tab', 'visitor')).toBe(true);
  expect(canUseBrowserWindow(visitor, 'other-tab', 'visitor')).toBe(false);
  expect(canUseBrowserWindow({ ...visitor, phase: 'owner' }, 'reused-tab', 'visitor')).toBe(false);
});

it('pauses saved data on a corrupt cross-window refresh and restores it only after a successful retry', async () => {
  await initializeBrowserPolicy('owner-tab');
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('mongoose-browser', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  await new Promise<void>((resolve, reject) => {
    const tx = database.transaction('installation', 'readwrite');
    tx.objectStore('installation').put({ revision: 1, phase: 'corrupt' }, 'policy');
    tx.oncomplete = () => { database.close(); resolve(); }; tx.onerror = () => reject(tx.error);
  });
  await expect(refreshBrowserPolicy()).rejects.toThrow('Invalid saved browser session policy');
  expect(useBrowserPolicy.getState().ready).toBe(false);
  expect(personalStorageKey('output')).toBeUndefined();
  await saveBrowserPolicy(1, { phase: 'owner', visitorSessionId: '', ownerPlayers: ['owner-a'] });
  await refreshBrowserPolicy();
  expect(useBrowserPolicy.getState().ready).toBe(true);
  expect(useBrowserPolicy.getState().error).toBe('');
  expect(personalStorageKey('output')).toBeDefined();
});
