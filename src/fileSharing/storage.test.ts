import { IDBFactory } from 'fake-indexeddb';
import { beforeEach, describe, expect, it } from 'vitest';
import { StorageDatabase } from './storageDatabase';
import { computeContentId } from '../fileTransfer/contentId';
import { polyfillBlobArrayBuffer } from '../fileTransfer/testHarness';
import { MAX_FILE, metadata } from './protocol';

polyfillBlobArrayBuffer();
const source = { player: '#1', endpoint: 'a'.repeat(32), epoch: 'b'.repeat(32) };
const binding = async (bytes = new Uint8Array([1, 2, 3])) => ({ t: 'c'.repeat(32), a: 1, offer: 'd'.repeat(32), source,
  meta: metadata({ id: await computeContentId(new Blob([bytes])), size: bytes.length, name: 'test.txt' }) });
describe('Phase 1 storage owner', () => {
  beforeEach(() => { globalThis.indexedDB = new IDBFactory(); });
  it('creates exactly six v1 stores in its own namespace', async () => {
    const db = new StorageDatabase('owner', true); await db.open();
    const raw = await new Promise<IDBDatabase>(resolve => { const r = indexedDB.open('file-sharing-v2:owner'); r.onsuccess = () => resolve(r.result); });
    expect(raw.version).toBe(1); expect([...raw.objectStoreNames]).toEqual(['attempts','exports','offers','owner','pieces','transfers']);
    raw.close(); await db.close();
  });
  it('retains same-sender partials across reload but restores no active grant', async () => {
    const b = await binding(); const db = new StorageDatabase('owner', true); await db.open();
    await db.reserve(b); await db.put(b.t, 1, 0, new Uint8Array([1,2,3]).buffer); await db.close();
    const next = new StorageDatabase('owner', true); await next.open();
    await expect(next.put(b.t, 1, 0, new Uint8Array([1,2,3]).buffer)).rejects.toThrow();
    expect(await next.reserve({ ...b, t: 'e'.repeat(32), source: { ...source, epoch: 'f'.repeat(32) } })).toEqual([0]);
    expect((await next.verify('e'.repeat(32), 1)).size).toBe(3); await next.close();
  });
  it('fences all referencing attempts and atomically purges corrupt full roots', async () => {
    const b = await binding(); const db = new StorageDatabase('owner', true); await db.open(); await db.reserve(b);
    await db.put(b.t, 1, 0, new Uint8Array([9,9,9]).buffer);
    await expect(db.verify(b.t, 1)).rejects.toThrow('integrity');
    expect(await db.reserve({ ...b, t: 'e'.repeat(32) })).toEqual([]); await db.close();
  });
  it('rejects stale writers, owner budget overflow and size conflicts', async () => {
    const b = await binding(); const db = new StorageDatabase('memory', false, 3); await db.open(); await db.reserve(b);
    db.fence(b.t); await expect(db.put(b.t, 1, 0, new Uint8Array([1,2,3]).buffer)).rejects.toThrow();
    await expect(db.reserve({ ...b, t: 'e'.repeat(32), meta: { ...b.meta, id: '0'.repeat(64) } })).rejects.toThrow();
    await expect(db.reserve({ ...b, a: 2, meta: { ...b.meta, size: MAX_FILE + 1 } })).rejects.toThrow(); await db.close();
  });
});
