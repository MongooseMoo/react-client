import 'fake-indexeddb/auto';

import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createIndexedDbTransferStorage, createMemoryTransferStorage, transferDatabaseName } from './storage';
import type { StoredTransferKey, TransferStorage } from './types';

const PIECE_SIZE = 16 * 1024;

const alice: StoredTransferKey = { from: 'Alice', id: 'aa11' };

function bytesOf(...values: number[]): ArrayBuffer {
  return Uint8Array.from(values).buffer;
}

function contentsOf(buffer: ArrayBuffer | undefined): number[] | undefined {
  return buffer === undefined ? undefined : Array.from(new Uint8Array(buffer));
}

function openRaw(name: string, upgrade?: (database: IDBDatabase) => void): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name);
    request.onupgradeneeded = () => upgrade?.(request.result);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function databaseNames(): Promise<(string | undefined)[]> {
  return (await indexedDB.databases()).map((database) => database.name);
}

beforeEach(() => {
  // A fresh factory per test, so nothing one test stored is visible to the next.
  globalThis.indexedDB = new IDBFactory();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe.each([
  ['IndexedDB', createIndexedDbTransferStorage],
  ['memory', createMemoryTransferStorage],
])('%s transfer storage', (_name, createStorage) => {
  let clock: number;
  let storage: TransferStorage;

  beforeEach(() => {
    clock = 1_000;
    storage = createStorage({ now: () => clock });
  });

  afterEach(() => {
    storage.close();
  });

  describe('heldPieces', () => {
    it('is empty for a transfer nothing was stored for', async () => {
      await expect(storage.heldPieces(alice)).resolves.toEqual([]);
    });

    it('lists the stored indices in ascending numeric order', async () => {
      for (const index of [10, 2, 33, 0, 9]) {
        await storage.putPiece(alice, index, bytesOf(index));
      }

      await expect(storage.heldPieces(alice)).resolves.toEqual([0, 2, 9, 10, 33]);
    });

    it('lists only the pieces of the transfer asked about', async () => {
      await storage.putPiece(alice, 0, bytesOf(1));
      await storage.putPiece({ from: 'Bob', id: alice.id }, 1, bytesOf(2));
      await storage.putPiece({ from: alice.from, id: `${alice.id}22` }, 2, bytesOf(3));

      await expect(storage.heldPieces(alice)).resolves.toEqual([0]);
    });
  });

  describe('putPiece and readPiece', () => {
    it('returns undefined for a piece that was never stored', async () => {
      await storage.putPiece(alice, 0, bytesOf(1));

      await expect(storage.readPiece(alice, 1)).resolves.toBeUndefined();
      await expect(storage.readPiece({ from: 'Bob', id: alice.id }, 0)).resolves.toBeUndefined();
    });

    it('returns a 16 KiB piece byte for byte', async () => {
      const original = new Uint8Array(PIECE_SIZE);
      for (let offset = 0; offset < original.length; offset++) {
        // Covers every byte value, with a period that is not a power of two.
        original[offset] = (offset * 31 + (offset >> 8)) & 0xff;
      }

      await storage.putPiece(alice, 7, original.buffer.slice(0));
      const stored = await storage.readPiece(alice, 7);

      expect(stored?.byteLength).toBe(PIECE_SIZE);
      expect(new Uint8Array(stored!).every((byte, offset) => byte === original[offset])).toBe(true);
    });

    it('stores an empty piece as an empty buffer, not as a missing one', async () => {
      await storage.putPiece(alice, 0, new ArrayBuffer(0));

      await expect(storage.heldPieces(alice)).resolves.toEqual([0]);
      expect((await storage.readPiece(alice, 0))?.byteLength).toBe(0);
    });

    it('overwrites a piece written again under the same index', async () => {
      await storage.putPiece(alice, 3, bytesOf(1, 1, 1));
      await storage.putPiece(alice, 3, bytesOf(2, 2));

      await expect(storage.heldPieces(alice)).resolves.toEqual([3]);
      expect(contentsOf(await storage.readPiece(alice, 3))).toEqual([2, 2]);
    });

    it('keeps its own copy of the bytes', async () => {
      const written = bytesOf(1, 2, 3);
      await storage.putPiece(alice, 0, written);
      new Uint8Array(written).fill(9);

      const firstRead = await storage.readPiece(alice, 0);
      expect(contentsOf(firstRead)).toEqual([1, 2, 3]);

      new Uint8Array(firstRead!).fill(9);
      expect(contentsOf(await storage.readPiece(alice, 0))).toEqual([1, 2, 3]);
    });

    it('keeps the pieces of two peers sending the same id apart', async () => {
      const bob: StoredTransferKey = { from: 'Bob', id: alice.id };
      await storage.putPiece(alice, 0, bytesOf(1));
      await storage.putPiece(bob, 0, bytesOf(2));

      expect(contentsOf(await storage.readPiece(alice, 0))).toEqual([1]);
      expect(contentsOf(await storage.readPiece(bob, 0))).toEqual([2]);
    });

    it('records every piece of a transfer put concurrently', async () => {
      const pieceCount = 16;

      await Promise.all(
        Array.from({ length: pieceCount }, (_, index) =>
          storage.putPiece(alice, index, bytesOf(index)),
        ),
      );

      await expect(storage.heldPieces(alice)).resolves.toEqual(
        Array.from({ length: pieceCount }, (_, index) => index),
      );
      for (let index = 0; index < pieceCount; index++) {
        expect(contentsOf(await storage.readPiece(alice, index))).toEqual([index]);
      }
    });

    it('keeps the latest touch when puts made at different times overlap', async () => {
      const puts: Promise<void>[] = [];
      for (let index = 0; index < 8; index++) {
        clock = 1_000 + index;
        puts.push(storage.putPiece(alice, index, bytesOf(index)));
      }
      await Promise.all(puts);

      await storage.discardUntouchedSince(1_007);
      await expect(storage.heldPieces(alice)).resolves.toHaveLength(8);

      await storage.discardUntouchedSince(1_008);
      await expect(storage.heldPieces(alice)).resolves.toEqual([]);
    });
  });

  describe('discard', () => {
    it('removes every piece of the transfer', async () => {
      await storage.putPiece(alice, 0, bytesOf(1));
      await storage.putPiece(alice, 5, bytesOf(2));

      await storage.discard(alice);

      await expect(storage.heldPieces(alice)).resolves.toEqual([]);
      await expect(storage.readPiece(alice, 0)).resolves.toBeUndefined();
      await expect(storage.readPiece(alice, 5)).resolves.toBeUndefined();
    });

    it('does nothing for a transfer that holds no pieces', async () => {
      await expect(storage.discard(alice)).resolves.toBeUndefined();
    });

    it("leaves another peer's transfer with the same id alone", async () => {
      const bob: StoredTransferKey = { from: 'Bob', id: alice.id };
      await storage.putPiece(alice, 0, bytesOf(1));
      await storage.putPiece(bob, 0, bytesOf(2));

      await storage.discard(alice);

      await expect(storage.heldPieces(bob)).resolves.toEqual([0]);
      expect(contentsOf(await storage.readPiece(bob, 0))).toEqual([2]);
    });

    it.each([
      ['an id it is a prefix of', { from: 'Alice', id: 'aa1122' }],
      ['an id that is a prefix of it', { from: 'Alice', id: 'aa' }],
      ['a peer whose name it is a prefix of', { from: 'Alice2', id: 'aa11' }],
      ['a peer and id that concatenate to the same text', { from: 'Alicea', id: 'a11' }],
    ])('leaves a transfer with %s alone', async (_case, other) => {
      await storage.putPiece(alice, 0, bytesOf(1));
      await storage.putPiece(other, 0, bytesOf(2));
      await storage.putPiece(other, 4, bytesOf(3));

      await storage.discard(alice);

      await expect(storage.heldPieces(alice)).resolves.toEqual([]);
      await expect(storage.heldPieces(other)).resolves.toEqual([0, 4]);
      expect(contentsOf(await storage.readPiece(other, 4))).toEqual([3]);
    });

    it('removes the touch record, so the transfer starts afresh when written again', async () => {
      await storage.putPiece(alice, 0, bytesOf(1));
      await storage.discard(alice);

      clock = 5_000;
      await storage.putPiece(alice, 1, bytesOf(2));
      await storage.discardUntouchedSince(5_000);

      await expect(storage.heldPieces(alice)).resolves.toEqual([1]);
    });
  });

  describe('discardUntouchedSince', () => {
    it('discards a transfer last touched before the timestamp', async () => {
      await storage.putPiece(alice, 0, bytesOf(1));
      await storage.putPiece(alice, 1, bytesOf(2));

      await storage.discardUntouchedSince(1_001);

      await expect(storage.heldPieces(alice)).resolves.toEqual([]);
      await expect(storage.readPiece(alice, 0)).resolves.toBeUndefined();
    });

    it('keeps a transfer last touched exactly at the timestamp', async () => {
      await storage.putPiece(alice, 0, bytesOf(1));

      await storage.discardUntouchedSince(1_000);

      await expect(storage.heldPieces(alice)).resolves.toEqual([0]);
    });

    it('goes by the last write to a transfer, not the first', async () => {
      await storage.putPiece(alice, 0, bytesOf(1));
      clock = 2_000;
      await storage.putPiece(alice, 1, bytesOf(2));

      await storage.discardUntouchedSince(1_500);

      await expect(storage.heldPieces(alice)).resolves.toEqual([0, 1]);
    });

    it('counts overwriting a piece as a touch', async () => {
      await storage.putPiece(alice, 0, bytesOf(1));
      clock = 2_000;
      await storage.putPiece(alice, 0, bytesOf(2));

      await storage.discardUntouchedSince(1_500);

      await expect(storage.heldPieces(alice)).resolves.toEqual([0]);
    });

    it('discards the stale transfers and keeps the fresh ones', async () => {
      const staleSamePeer: StoredTransferKey = { from: 'Alice', id: 'bb22' };
      const staleOtherPeer: StoredTransferKey = { from: 'Bob', id: alice.id };
      await storage.putPiece(staleSamePeer, 0, bytesOf(1));
      await storage.putPiece(staleOtherPeer, 0, bytesOf(2));
      clock = 2_000;
      await storage.putPiece(alice, 0, bytesOf(3));

      await storage.discardUntouchedSince(2_000);

      await expect(storage.heldPieces(staleSamePeer)).resolves.toEqual([]);
      await expect(storage.heldPieces(staleOtherPeer)).resolves.toEqual([]);
      await expect(storage.heldPieces(alice)).resolves.toEqual([0]);
    });

    it('does nothing when nothing is stored', async () => {
      await expect(storage.discardUntouchedSince(Number.MAX_SAFE_INTEGER)).resolves.toBeUndefined();
    });
  });

  describe('close', () => {
    it('can be called before anything was used, and more than once', () => {
      expect(() => {
        storage.close();
        storage.close();
      }).not.toThrow();
    });

    it('can be called repeatedly after use', async () => {
      await storage.putPiece(alice, 0, bytesOf(1));

      expect(() => {
        storage.close();
        storage.close();
      }).not.toThrow();
    });

    it('leaves the storage usable, with what it held, for the next call', async () => {
      await storage.putPiece(alice, 0, bytesOf(1));
      storage.close();

      await expect(storage.heldPieces(alice)).resolves.toEqual([0]);
      await storage.putPiece(alice, 1, bytesOf(2));
      expect(contentsOf(await storage.readPiece(alice, 1))).toEqual([2]);
    });
  });

  it('uses the wall clock when no clock is injected', async () => {
    const wallClockStorage = createStorage();
    const before = Date.now();
    await wallClockStorage.putPiece(alice, 0, bytesOf(1));

    await wallClockStorage.discardUntouchedSince(before);
    await expect(wallClockStorage.heldPieces(alice)).resolves.toEqual([0]);

    await wallClockStorage.discardUntouchedSince(Date.now() + 1);
    await expect(wallClockStorage.heldPieces(alice)).resolves.toEqual([]);
    wallClockStorage.close();
  });
});

describe('IndexedDB transfer storage, database handling', () => {
  it('isolates overlapping transfers, cleanup and resume by immutable owner', async () => {
    const a = createIndexedDbTransferStorage({ owner: 'live:player-a', now: () => 1 });
    const b = createIndexedDbTransferStorage({ owner: 'live:player-b', now: () => 1 });
    const local = createIndexedDbTransferStorage({ owner: 'local:player-a', now: () => 1 });
    await Promise.all([a.putPiece(alice, 0, bytesOf(1)), b.putPiece(alice, 0, bytesOf(2))]);
    expect(contentsOf(await a.readPiece(alice, 0))).toEqual([1]);
    expect(contentsOf(await b.readPiece(alice, 0))).toEqual([2]);
    expect(await local.heldPieces(alice)).toEqual([]);
    await a.discardUntouchedSince(2);
    expect(await a.heldPieces(alice)).toEqual([]);
    expect(contentsOf(await b.readPiece(alice, 0))).toEqual([2]);
    b.close();
    const resumed = createIndexedDbTransferStorage({ owner: 'live:player-b' });
    expect(contentsOf(await resumed.readPiece(alice, 0))).toEqual([2]);
    for (const storage of [a, b, local, resumed]) storage.close();
  });
  const LEGACY_DATABASE = 'file-transfer-store';

  it('keeps pieces in the owner database, version 1, in the agreed layout', async () => {
    const storage = createIndexedDbTransferStorage({ now: () => 1_234 });
    await storage.putPiece(alice, 2, bytesOf(7));
    storage.close();

    expect(await indexedDB.databases()).toContainEqual({ name: transferDatabaseName(), version: 1 });

    const database = await openRaw(transferDatabaseName());
    const transaction = database.transaction(['pieces', 'transfers'], 'readonly');
    const pieces = transaction.objectStore('pieces');
    const transfers = transaction.objectStore('transfers');
    expect(Array.from(database.objectStoreNames)).toEqual(['pieces', 'transfers']);
    expect(pieces.keyPath).toEqual(['from', 'id', 'index']);
    expect(transfers.keyPath).toEqual(['from', 'id']);

    const touch = await new Promise((resolve, reject) => {
      const request = transfers.get([alice.from, alice.id]);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    expect(touch).toEqual({ from: alice.from, id: alice.id, touchedAt: 1_234 });
    database.close();
  });

  it('shares what is stored between instances', async () => {
    const writer = createIndexedDbTransferStorage();
    await writer.putPiece(alice, 0, bytesOf(4, 2));
    writer.close();

    const reader = createIndexedDbTransferStorage();
    await expect(reader.heldPieces(alice)).resolves.toEqual([0]);
    expect(contentsOf(await reader.readPiece(alice, 0))).toEqual([4, 2]);
    reader.close();
  });

  it('does not open the database until it is first used', async () => {
    const open = vi.spyOn(indexedDB, 'open');

    const storage = createIndexedDbTransferStorage();
    expect(open).not.toHaveBeenCalled();

    await storage.heldPieces(alice);
    await storage.heldPieces(alice);
    expect(open).toHaveBeenCalledTimes(1);
    storage.close();
  });

  it('opens the database once for calls made together', async () => {
    const open = vi.spyOn(indexedDB, 'open');
    const storage = createIndexedDbTransferStorage();

    await Promise.all([
      storage.heldPieces(alice),
      storage.putPiece(alice, 0, bytesOf(1)),
      storage.readPiece(alice, 0),
    ]);

    expect(open).toHaveBeenCalledTimes(1);
    storage.close();
  });

  it('reopens the database for a call made after close', async () => {
    const open = vi.spyOn(indexedDB, 'open');
    const storage = createIndexedDbTransferStorage();
    await storage.putPiece(alice, 0, bytesOf(1));
    storage.close();

    await expect(storage.heldPieces(alice)).resolves.toEqual([0]);

    expect(open).toHaveBeenCalledTimes(2);
    storage.close();
  });

  // A database that still has an open handle cannot be deleted; the request is blocked.
  function deletePieceDatabase(): Promise<'deleted' | 'blocked' | 'error'> {
    return new Promise((resolve) => {
      const request = indexedDB.deleteDatabase(transferDatabaseName());
      request.onsuccess = () => resolve('deleted');
      request.onblocked = () => resolve('blocked');
      request.onerror = () => resolve('error');
    });
  }

  it('releases the database on close', async () => {
    const storage = createIndexedDbTransferStorage();
    await storage.putPiece(alice, 0, bytesOf(1));
    storage.close();

    await expect(deletePieceDatabase()).resolves.toBe('deleted');
  });

  it('releases the database when closed while it is still opening', async () => {
    const storage = createIndexedDbTransferStorage();
    const pending = storage.heldPieces(alice);
    storage.close();
    await pending.catch(() => undefined);

    await expect(deletePieceDatabase()).resolves.toBe('deleted');
  });

  it('rejects the call that needed a database which failed to open', async () => {
    vi.spyOn(indexedDB, 'open').mockImplementation(() => {
      throw new Error('open refused');
    });
    const storage = createIndexedDbTransferStorage();

    await expect(storage.heldPieces(alice)).rejects.toThrow('open refused');
    await expect(storage.putPiece(alice, 0, bytesOf(1))).rejects.toThrow('open refused');
    await expect(storage.readPiece(alice, 0)).rejects.toThrow('open refused');
    await expect(storage.discard(alice)).rejects.toThrow('open refused');
    await expect(storage.discardUntouchedSince(1)).rejects.toThrow('open refused');
    expect(() => storage.close()).not.toThrow();
  });

  it('tries to open again on the call after a failed open', async () => {
    const open = vi.spyOn(indexedDB, 'open').mockImplementationOnce(() => {
      throw new Error('open refused');
    });
    const storage = createIndexedDbTransferStorage();
    await expect(storage.putPiece(alice, 0, bytesOf(1))).rejects.toThrow('open refused');

    await storage.putPiece(alice, 0, bytesOf(1));

    await expect(storage.heldPieces(alice)).resolves.toEqual([0]);
    expect(open).toHaveBeenCalledTimes(2);
    storage.close();
  });

  it('answers heldPieces from keys alone, without loading piece records', async () => {
    const storage = createIndexedDbTransferStorage();
    await storage.putPiece(alice, 0, bytesOf(1));
    await storage.putPiece(alice, 1, bytesOf(2));
    const loaders = [
      vi.spyOn(IDBObjectStore.prototype, 'get'),
      vi.spyOn(IDBObjectStore.prototype, 'getAll'),
      vi.spyOn(IDBObjectStore.prototype, 'openCursor'),
    ];

    await expect(storage.heldPieces(alice)).resolves.toEqual([0, 1]);

    for (const loader of loaders) {
      expect(loader).not.toHaveBeenCalled();
    }
    storage.close();
  });

  it('preserves the unassigned legacy database', async () => {
    const legacy = await openRaw(LEGACY_DATABASE, (database) => {
      database.createObjectStore('chunks', { keyPath: ['hash', 'index'] });
    });
    legacy.close();
    expect(await databaseNames()).toContain(LEGACY_DATABASE);

    const storage = createIndexedDbTransferStorage();
    await storage.putPiece(alice, 0, bytesOf(1));
    expect(await databaseNames()).toContain(LEGACY_DATABASE);

    expect(await databaseNames()).toContain(transferDatabaseName());
    storage.close();
  });

  it('never requests legacy deletion during use or reopen', async () => {
    const deleteDatabase = vi.spyOn(indexedDB, 'deleteDatabase');
    const storage = createIndexedDbTransferStorage();

    await storage.heldPieces(alice);
    storage.close();
    await storage.heldPieces(alice);

    expect(deleteDatabase).not.toHaveBeenCalled();
    storage.close();
  });

  it('works even when deleting the old database throws', async () => {
    vi.spyOn(indexedDB, 'deleteDatabase').mockImplementation(() => {
      throw new Error('delete refused');
    });
    const storage = createIndexedDbTransferStorage();

    await storage.putPiece(alice, 0, bytesOf(1));

    await expect(storage.heldPieces(alice)).resolves.toEqual([0]);
    storage.close();
  });

  it('works while the old database is held open and its deletion is blocked', async () => {
    const legacy = await openRaw(LEGACY_DATABASE);
    const storage = createIndexedDbTransferStorage();

    await storage.putPiece(alice, 0, bytesOf(1));

    await expect(storage.heldPieces(alice)).resolves.toEqual([0]);
    storage.close();
    legacy.close();
  });
});
