import { IDBFactory, IDBObjectStore } from 'fake-indexeddb';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StorageDatabase } from './storageDatabase';
import { computeContentId } from '../fileTransfer/contentId';
import { polyfillBlobArrayBuffer } from '../fileTransfer/testHarness';
import { MAX_FILE, metadata } from './protocol';

polyfillBlobArrayBuffer();
const source = { player: '#1', endpoint: 'a'.repeat(32), epoch: 'b'.repeat(32) };
const binding = async (bytes = new Uint8Array([1, 2, 3])) => ({
  t: 'c'.repeat(32),
  a: 1,
  offer: 'd'.repeat(32),
  source,
  meta: metadata({
    id: await computeContentId(new Blob([bytes])),
    size: bytes.length,
    name: 'test.txt',
  }),
});
describe('Phase 1 storage owner', () => {
  it.each([
    ['verified', false],
    ['export-uncertain', false],
    ['verified', true],
    ['export-uncertain', true],
  ] as const)('retains %s for seven days, then deletes its receipt and bytes and recovers capacity (persistent=%s)', async (outcome, persistent) => {
    const db = new StorageDatabase('awaiting-save', persistent);
    await db.open();
    const b = await binding();
    await db.reserve(b);
    await db.put(b.t, 1, 0, new Uint8Array([1, 2, 3]).buffer);
    await db.verify(b.t, 1);
    await db.saveReceipt({
      sender: source,
      offer: b.offer,
      t: b.t,
      meta: b.meta,
      state: 'received',
      outcome,
      touchedAt: Date.now(),
    });
    await db.release(b.t);
    const start = (await db.receipts())[0].touchedAt;
    const time = vi.spyOn(Date, 'now').mockReturnValue(start + 7 * 86400000 - 1);
    try {
      await db.gc();
      expect((await db.readForExport(source, b.offer)).size).toBe(3);
      time.mockReturnValue(start + 7 * 86400000);
      await db.gc();
      expect(await db.receipt(source, b.offer)).toBeUndefined();
      expect(await db.reserve({ ...b, t: 'e'.repeat(32) })).toEqual([]);
    } finally {
      time.mockRestore();
      await db.close();
    }
  });
  it.each([
    false,
    true,
  ])('discard preserves a sibling receipt, then removes shared bytes with the last receipt (persistent=%s)', async (persistent) => {
    const db = new StorageDatabase('discard', persistent, 3);
    await db.open();
    const b = await binding();
    for (const offer of [b.offer, 'e'.repeat(32)]) {
      await db.reserve({ ...b, t: offer, offer });
      await db.put(offer, 1, 0, new Uint8Array([1, 2, 3]).buffer);
      await db.verify(offer, 1);
      await db.saveReceipt({
        sender: source,
        offer,
        t: offer,
        meta: b.meta,
        state: 'received',
        outcome: 'verified',
        touchedAt: Date.now(),
      });
      await db.release(offer);
    }
    await db.discard(source, b.offer);
    expect((await db.readForExport(source, 'e'.repeat(32))).size).toBe(3);
    await db.discard(source, 'e'.repeat(32));
    expect(await db.receipts()).toEqual([]);
    expect(await db.reserve({ ...b, t: 'f'.repeat(32) })).toEqual([]);
    await db.close();
  });
  it('migrates a version-1 bitmap and retains its verified receipt and bytes', async () => {
    const b = await binding();
    await new Promise<void>((resolve, reject) => {
      const r = indexedDB.open('file-sharing-v2:migrate', 1);
      r.onupgradeneeded = () => {
        const raw = r.result;
        raw.createObjectStore('owner');
        raw.createObjectStore('attempts', { keyPath: 't' });
        raw.createObjectStore('offers');
        raw.createObjectStore('exports', { keyPath: 'id' });
        raw.createObjectStore('pieces', { keyPath: ['from', 'id', 'index'] });
        raw.createObjectStore('transfers', { keyPath: ['from', 'id'] });
        const tx = r.transaction;
        if (!tx) throw new Error('No upgrade transaction');
        tx.objectStore('transfers').put({
          from: source.player,
          id: b.meta.id,
          size: 3,
          bitmap: [0],
          verified: true,
          touchedAt: Date.now(),
        });
        tx.objectStore('pieces').put({
          from: source.player,
          id: b.meta.id,
          index: 0,
          bytes: new Uint8Array([1, 2, 3]).buffer,
        });
        tx.objectStore('offers').put(
          {
            sender: source,
            offer: b.offer,
            t: b.t,
            meta: b.meta,
            state: 'received',
            outcome: 'verified',
            touchedAt: Date.now(),
          },
          [JSON.stringify([source.player, source.endpoint, source.epoch]), b.offer],
        );
      };
      r.onerror = () => reject(r.error);
      r.onsuccess = () => {
        r.result.close();
        resolve();
      };
    });
    const db = new StorageDatabase('migrate', true);
    await db.open();
    expect((await db.readForExport(source, b.offer)).size).toBe(3);
    await db.close();
  });
  it('reserves receipt capacity before bytes and admits again when 24-hour history expires', async () => {
    const db = new StorageDatabase('live-history', false);
    await db.open();
    const b = await binding(new Uint8Array());
    for (let i = 0; i < 1023; i++) {
      const t = i.toString(16).padStart(32, '0');
      await db.reserve({ ...b, t, offer: t });
      await db.verify(t, 1);
      await db.saveReceipt({
        sender: source,
        offer: t,
        t,
        meta: b.meta,
        state: 'received',
        outcome: 'browser-download',
        touchedAt: Date.now(),
      });
      await db.release(t);
    }
    await db.reserve(b);
    const next = { ...b, t: 'e'.repeat(32), offer: 'f'.repeat(32) };
    await expect(db.reserve(next)).rejects.toThrow('history');
    const time = vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 86400001);
    try {
      await expect(db.reserve(next)).resolves.toEqual([]);
    } finally {
      time.mockRestore();
      await db.close();
    }
  }, 30000);
  it('A: admits a verified receipt after 1024 cancelled tombstones without getAll on admission', async () => {
    const db = new StorageDatabase('history', true);
    await db.open();
    const b = await binding();
    const getAll = vi.spyOn(IDBObjectStore.prototype, 'getAll');
    try {
      for (let i = 0; i < 1030; i++)
        await db.saveReceipt({
          sender: source,
          offer: i.toString(16).padStart(32, '0'),
          t: b.t,
          meta: b.meta,
          state: 'cancelled',
          outcome: 'verified',
          touchedAt: Date.now(),
        });
      await db.reserve(b);
      await db.put(b.t, 1, 0, new Uint8Array([1, 2, 3]).buffer);
      await db.verify(b.t, 1);
      await db.saveReceipt({
        sender: source,
        offer: b.offer,
        t: b.t,
        meta: b.meta,
        state: 'received',
        outcome: 'verified',
        touchedAt: Date.now(),
      });
      expect(getAll).not.toHaveBeenCalled();
      expect((await db.receipts()).length).toBeLessThanOrEqual(1024);
    } finally {
      getAll.mockRestore();
      await db.close();
    }
  }, 30000);
  it('prunes released attempts by count and expired history by age', async () => {
    const db = new StorageDatabase('attempt-history', false);
    await db.open();
    const b = await binding();
    for (let i = 0; i < 2050; i++) {
      const t = i.toString(16).padStart(32, '0');
      await db.reserve({ ...b, t });
      await db.release(t);
    }
    await db.saveReceipt({
      sender: source,
      offer: b.offer,
      t: b.t,
      meta: b.meta,
      state: 'cancelled',
      outcome: 'verified',
      touchedAt: Date.now() - 86400001,
    });
    await db.gc();
    expect(await db.receipt(source, b.offer)).toBeUndefined();
    await db.close();
  });
  it('B: releasing an exported copy after reload preserves another receipt and browser handoff bytes', async () => {
    const db = new StorageDatabase('copies', true);
    await db.open();
    const b = await binding();
    for (const t of ['c'.repeat(32), 'e'.repeat(32)]) {
      await db.reserve({ ...b, t, offer: t });
      await db.put(t, 1, 0, new Uint8Array([1, 2, 3]).buffer);
      await db.verify(t, 1);
      await db.saveReceipt({
        sender: source,
        offer: t,
        t,
        meta: b.meta,
        state: 'received',
        outcome: 'browser-download',
        touchedAt: Date.now(),
      });
    }
    await db.close();
    const reloaded = new StorageDatabase('copies', true);
    await reloaded.open();
    await reloaded.releaseSaved(b.t);
    expect((await reloaded.readForExport(source, 'e'.repeat(32))).size).toBe(3);
    expect((await reloaded.readForExport(source, b.t)).size).toBe(3);
    await reloaded.close();
  });
  it('F: releases an abandoned reservation and evicts unreferenced partials under pressure', async () => {
    const db = new StorageDatabase('cancel-budget', false, 3);
    await db.open();
    const b = await binding();
    await db.reserve(b);
    await db.put(b.t, 1, 0, new Uint8Array([1, 2, 3]).buffer);
    await db.release(b.t);
    await expect(
      db.reserve({ ...b, t: 'e'.repeat(32), meta: { ...b.meta, id: '0'.repeat(64) } }),
    ).resolves.toEqual([]);
    await db.close();
  });
  it('E: uses fixed-size piece metadata without rewriting attempt bitmaps on every put', async () => {
    const db = new StorageDatabase('piece-cost', true);
    await db.open();
    const b = await binding();
    await db.reserve({ ...b, meta: { ...b.meta, size: MAX_FILE } });
    const writes: { store: string; row: { bitmap: unknown } }[] = [];
    const original = IDBObjectStore.prototype.put;
    const put = vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function (row, key) {
      writes.push({ store: this.name, row: structuredClone(row) });
      return original.call(this, row, key);
    });
    try {
      for (let i = 0; i < 160; i++) await db.put(b.t, 1, i, new ArrayBuffer(16384));
      const attempts = writes.filter((s) => s.store === 'attempts');
      expect(attempts.length).toBeLessThanOrEqual(10);
      const transfers = writes.filter((s) => s.store === 'transfers');
      expect(
        transfers.every(
          ({ row }) => ArrayBuffer.isView(row.bitmap) && row.bitmap.byteLength <= 800,
        ),
      ).toBe(true);
    } finally {
      put.mockRestore();
      await db.close();
    }
  });
  it('drops truncated retained pieces before have so retransmission can repair them', async () => {
    const b = await binding();
    const db = new StorageDatabase('truncated', true);
    await db.open();
    await db.reserve(b);
    await db.put(b.t, 1, 0, new Uint8Array([1, 2, 3]).buffer);
    await db.close();
    await new Promise<void>((resolve, reject) => {
      const r = indexedDB.open('file-sharing-v2:truncated');
      r.onsuccess = () => {
        const raw = r.result;
        const tx = raw.transaction('pieces', 'readwrite');
        tx.objectStore('pieces').put({
          from: source.player,
          id: b.meta.id,
          index: 0,
          bytes: new Uint8Array([1]).buffer,
        });
        tx.oncomplete = () => {
          raw.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
      r.onerror = () => reject(r.error);
    });
    const next = new StorageDatabase('truncated', true);
    await next.open();
    const t = 'e'.repeat(32);
    expect(await next.reserve({ ...b, t })).toEqual([]);
    await next.put(t, 1, 0, new Uint8Array([1, 2, 3]).buffer);
    expect((await next.verify(t, 1)).size).toBe(3);
    await next.close();
  });
  it('recovers an interrupted export as uncertain without restoring a live writer', async () => {
    const b = await binding();
    const db = new StorageDatabase('export-owner', true);
    await db.open();
    await db.reserve(b);
    await db.put(b.t, 1, 0, new Uint8Array([1, 2, 3]).buffer);
    await db.verify(b.t, 1);
    await db.saveReceipt({
      sender: source,
      offer: b.offer,
      t: b.t,
      meta: b.meta,
      state: 'received',
      outcome: 'verified',
      touchedAt: Date.now(),
    });
    await db.exportRecord({
      id: 'a'.repeat(32),
      contentId: b.meta.id,
      sender: source,
      offer: b.offer,
      t: b.t,
      state: 'exporting',
    });
    await db.close();
    const next = new StorageDatabase('export-owner', true);
    await next.open();
    expect((await next.receipts())[0].outcome).toBe('export-uncertain');
    expect((await next.readForExport(source, b.offer)).size).toBe(3);
    await expect(next.put(b.t, 1, 0, new Uint8Array([1, 2, 3]).buffer)).rejects.toThrow();
    await next.close();
  });
  it('accounts for other owners under the origin quota registry', async () => {
    const original = navigator.storage;
    Object.defineProperty(navigator, 'storage', {
      configurable: true,
      value: { estimate: async () => ({ quota: 256 * 1024 ** 2, usage: 0 }) },
    });
    const a = new StorageDatabase('quota-a', true, undefined, true);
    const b = new StorageDatabase('quota-b', true, undefined, true);
    try {
      await a.open();
      await b.open();
      const bind = await binding();
      await a.reserve({ ...bind, meta: { ...bind.meta, size: MAX_FILE } });
      await expect(b.reserve({ ...bind, meta: { ...bind.meta, size: MAX_FILE } })).rejects.toThrow(
        'storage space',
      );
    } finally {
      await a.close();
      await b.close();
      Object.defineProperty(navigator, 'storage', { configurable: true, value: original });
    }
  });
  beforeEach(() => {
    globalThis.indexedDB = new IDBFactory();
  });
  it('keeps exactly six stores and migrates indexes to version 2 in its own namespace', async () => {
    const db = new StorageDatabase('owner', true);
    await db.open();
    const raw = await new Promise<IDBDatabase>((resolve) => {
      const r = indexedDB.open('file-sharing-v2:owner');
      r.onsuccess = () => resolve(r.result);
    });
    expect(raw.version).toBe(2);
    expect([...raw.objectStoreNames]).toEqual([
      'attempts',
      'exports',
      'offers',
      'owner',
      'pieces',
      'transfers',
    ]);
    raw.close();
    await db.close();
  });
  it('retains same-sender partials across reload but restores no active grant', async () => {
    const b = await binding();
    const db = new StorageDatabase('owner', true);
    await db.open();
    await db.reserve(b);
    await db.put(b.t, 1, 0, new Uint8Array([1, 2, 3]).buffer);
    await db.close();
    const next = new StorageDatabase('owner', true);
    await next.open();
    await expect(next.put(b.t, 1, 0, new Uint8Array([1, 2, 3]).buffer)).rejects.toThrow();
    expect(
      await next.reserve({ ...b, t: 'e'.repeat(32), source: { ...source, epoch: 'f'.repeat(32) } }),
    ).toEqual([0]);
    expect((await next.verify('e'.repeat(32), 1)).size).toBe(3);
    await next.close();
  });
  it('fences all referencing attempts and atomically purges corrupt full roots', async () => {
    const b = await binding();
    const db = new StorageDatabase('owner', true);
    await db.open();
    await db.reserve(b);
    await db.put(b.t, 1, 0, new Uint8Array([9, 9, 9]).buffer);
    await db.reserve({ ...b, t: 'f'.repeat(32) });
    await expect(db.verify(b.t, 1)).rejects.toThrow('integrity');
    await expect(db.put('f'.repeat(32), 1, 0, new Uint8Array([1, 2, 3]).buffer)).rejects.toThrow();
    expect(await db.reserve({ ...b, t: 'e'.repeat(32) })).toEqual([]);
    await db.close();
  });
  it('rejects stale writers, owner budget overflow and size conflicts', async () => {
    const b = await binding();
    const db = new StorageDatabase('memory', false, 3);
    await db.open();
    await db.reserve(b);
    db.fence(b.t);
    await expect(db.put(b.t, 1, 0, new Uint8Array([1, 2, 3]).buffer)).rejects.toThrow();
    await expect(
      db.reserve({ ...b, t: 'e'.repeat(32), meta: { ...b.meta, id: '0'.repeat(64) } }),
    ).rejects.toThrow();
    await expect(
      db.reserve({ ...b, a: 2, meta: { ...b.meta, size: MAX_FILE + 1 } }),
    ).rejects.toThrow();
    await db.close();
  });
});
