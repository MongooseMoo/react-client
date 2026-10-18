/** Runs inside the dedicated worker. The in-process entry is also the fake-IDB test seam. */
import { contentIdFromDigests, digestPiece } from '../fileTransfer/contentId';
import { check, endpointKey, MAX_FILE, PIECE, type Endpoint, type Metadata } from './protocol';
import { pieceLength } from './frames';
import { OriginQuota } from './quota';
export const STORES = ['owner', 'attempts', 'offers', 'exports', 'pieces', 'transfers'] as const;
type Store = (typeof STORES)[number];
export type Binding = { t: string; a: number; source: Endpoint; offer: string; meta: Metadata };
type Attempt = Binding & {
  active: boolean;
  fence: number;
  held: number[];
  reserved: number;
  writerGeneration: number;
  expiresAt: number;
};
type Partial = {
  from: string;
  id: string;
  size: number;
  algorithm: string;
  touchedAt: number;
  bitmap: number[];
  verified: boolean;
  fence: number;
};
type Piece = { from: string; id: string; index: number; bytes: ArrayBuffer };
export type Receipt = {
  sender: Endpoint;
  offer: string;
  meta: Metadata;
  t: string;
  state: 'received' | 'cancelled';
  outcome: 'verified' | 'browser-download' | 'export-uncertain';
  touchedAt: number;
};
export type ExportRecord = {
  id: string;
  contentId: string;
  sender: Endpoint;
  offer: string;
  t: string;
  state: 'exporting' | 'browser-download' | 'export-uncertain';
};
type Owner = {
  ownerKey: string;
  schemaVersion: 1;
  writerGeneration: number;
  reserved: number;
  committed: number;
  nextGC: number;
};
function request<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
function finished(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = tx.onerror = () => reject(tx.error ?? new Error('Storage transaction aborted'));
  });
}
function keyOf(store: Store, row: Record<string, unknown>, key?: IDBValidKey): IDBValidKey {
  if (key !== undefined) return key;
  if (store === 'pieces') return [String(row.from), String(row.id), Number(row.index)];
  if (store === 'transfers') return [String(row.from), String(row.id)];
  return String(store === 'attempts' ? row.t : row.id);
}
/** Single writer, serialized by StorageOwner/worker. Cancel fences take effect immediately. */
export class StorageDatabase {
  private quota?: OriginQuota;
  private db?: IDBDatabase;
  private alive = true;
  private owner!: Owner;
  private readonly memory = new Map<Store, Map<string, unknown>>(STORES.map((s) => [s, new Map()]));
  private readonly fences = new Set<string>();
  private readonly liveTransactions = new Map<IDBTransaction, string | undefined>();
  constructor(
    public ownerKey: string,
    readonly persistent: boolean,
    private readonly budget = persistent ? 1024 ** 3 : MAX_FILE,
    private readonly enforceQuota = false,
  ) {}
  async open(): Promise<void> {
    if (this.persistent) {
      this.db = await new Promise((resolve, reject) => {
        const r = indexedDB.open(`file-sharing-v2:${this.ownerKey}`, 1);
        r.onupgradeneeded = () => {
          const d = r.result;
          d.createObjectStore('owner');
          d.createObjectStore('attempts', { keyPath: 't' });
          d.createObjectStore('offers');
          d.createObjectStore('exports', { keyPath: 'id' });
          d.createObjectStore('pieces', { keyPath: ['from', 'id', 'index'] });
          d.createObjectStore('transfers', { keyPath: ['from', 'id'] });
        };
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
        r.onblocked = () => reject(new Error('File storage is blocked by another tab'));
      });
      this.db.onversionchange = () => {
        this.alive = false;
        this.db?.close();
      };
    }
    const old = await this.get<Owner>('owner', 'owner');
    check(!old || old.ownerKey === this.ownerKey);
    this.owner = {
      ownerKey: this.ownerKey,
      schemaVersion: 1,
      writerGeneration: (old?.writerGeneration ?? 0) + 1,
      reserved: 0,
      committed: 0,
      nextGC: Date.now() + 3600000,
    };
    const attempts = await this.all<Attempt>('attempts');
    const exports = await this.all<ExportRecord>('exports');
    const partials = await this.all<Partial>('transfers');
    for (const p of partials) {
      this.owner.committed += p.bitmap.reduce((n, i) => n + pieceLength(p.size, i), 0);
      this.owner.reserved += p.size;
    }
    await this.write(['owner', 'attempts', 'exports', 'offers'], (tx) => {
      tx.put('owner', this.owner, 'owner');
      for (const a of attempts)
        tx.put('attempts', { ...a, active: false, fence: a.fence + 1, reserved: 0, held: [] });
      for (const e of exports)
        if (e.state === 'exporting') tx.put('exports', { ...e, state: 'export-uncertain' });
    });
    for (const e of exports)
      if (e.state === 'exporting') {
        const r = await this.receipt(e.sender, e.offer);
        if (r) await this.saveReceipt({ ...r, outcome: 'export-uncertain' });
      }
    await this.gc();
    if (this.persistent && this.enforceQuota) {
      this.quota = new OriginQuota();
      await this.quota.open(this.ownerKey);
      await this.quota.update(this.owner.reserved);
    }
  }
  private async get<T>(store: Store, key: IDBValidKey): Promise<T | undefined> {
    this.assert();
    if (!this.db) return this.memory.get(store)?.get(JSON.stringify(key)) as T | undefined;
    const tx = this.db.transaction(store);
    return request(tx.objectStore(store).get(key));
  }
  private async all<T>(store: Store): Promise<T[]> {
    this.assert();
    if (!this.db) return [...(this.memory.get(store)?.values() ?? [])] as T[];
    return request(this.db.transaction(store).objectStore(store).getAll());
  }
  private async write(
    stores: Store[],
    work: (tx: {
      put(s: Store, row: unknown, key?: IDBValidKey): void;
      delete(s: Store, key: IDBValidKey): void;
    }) => void,
    tag?: string,
  ): Promise<void> {
    this.assert();
    if (!this.db) {
      work({
        put: (s, row, key) => {
          this.memory
            .get(s)
            ?.set(
              JSON.stringify(keyOf(s, row as Record<string, unknown>, key)),
              structuredClone(row),
            );
        },
        delete: (s, key) => {
          this.memory.get(s)?.delete(JSON.stringify(key));
        },
      });
      return;
    }
    const tx = this.db.transaction(stores, 'readwrite');
    const done = finished(tx);
    this.liveTransactions.set(tx, tag);
    try {
      work({
        put: (s, row, key) => {
          if (key === undefined) tx.objectStore(s).put(row);
          else tx.objectStore(s).put(row, key);
        },
        delete: (s, key) => {
          tx.objectStore(s).delete(key);
        },
      });
      await done;
    } finally {
      this.liveTransactions.delete(tx);
    }
  }
  private assert(): void {
    check(this.alive, 'Storage owner has closed');
  }
  async adoptEphemeral(owner: string): Promise<void> {
    check(!this.persistent && (await this.all<Attempt>('attempts')).length === 0);
    this.ownerKey = owner;
    this.owner = { ...this.owner, ownerKey: owner };
    await this.write(['owner'], (tx) => tx.put('owner', this.owner, 'owner'));
  }
  async hash(file: Blob, token: string): Promise<string> {
    check(file.size <= MAX_FILE);
    const digests: ArrayBuffer[] = [];
    for (let offset = 0; offset < file.size; offset += PIECE) {
      this.assert();
      check(!this.fences.has(token), 'Hashing cancelled');
      digests.push(await digestPiece(await file.slice(offset, offset + PIECE).arrayBuffer()));
    }
    this.assert();
    check(!this.fences.has(token), 'Hashing cancelled');
    return contentIdFromDigests(digests);
  }
  fence(t: string): void {
    this.fences.add(t);
    for (const [tx, tag] of this.liveTransactions) if (tag === t) tx.abort();
  }
  invalidate(): void {
    this.alive = false;
    for (const tx of this.liveTransactions.keys()) tx.abort();
  }
  private async attempt(t: string, a: number): Promise<Attempt> {
    const row = await this.get<Attempt>('attempts', t);
    check(
      row?.active &&
        row.a === a &&
        row.writerGeneration === this.owner.writerGeneration &&
        !this.fences.has(t),
      'Stale transfer writer',
    );
    return row;
  }
  async reserve(b: Binding): Promise<number[]> {
    this.assert();
    check(b.meta.size <= MAX_FILE && b.meta.size >= 0, 'File exceeds the 100 MiB limit');
    const old = await this.get<Attempt>('attempts', b.t);
    check(
      old || (await this.all<Attempt>('attempts')).length < 2048,
      'Transfer attempt history is full',
    );
    if (old)
      check(
        old.offer === b.offer &&
          endpointKey(old.source) === endpointKey(b.source) &&
          JSON.stringify(old.meta) === JSON.stringify(b.meta) &&
          b.a > old.a,
        'Attempt binding changed',
      );
    const key = [b.source.player, b.meta.id];
    const partial = await this.get<Partial>('transfers', key);
    check(!partial || partial.size === b.meta.size, 'Content size conflict');
    check(
      this.owner.reserved + (partial ? 0 : b.meta.size) <= this.budget,
      'File storage budget exceeded',
    );
    const held: number[] = [];
    if (partial)
      for (const i of partial.bitmap) {
        const p = await this.get<Piece>('pieces', [b.source.player, b.meta.id, i]);
        if (p && p.bytes.byteLength === pieceLength(b.meta.size, i)) {
          await digestPiece(p.bytes);
          this.assert();
          held.push(i);
        }
      }
    this.fences.delete(b.t);
    const invalid = partial?.bitmap.filter((i) => !held.includes(i)) ?? [];
    const references = invalid.length
      ? (await this.all<Attempt>('attempts')).filter(
          (a) => a.source.player === b.source.player && a.meta.id === b.meta.id,
        )
      : [];
    for (const a of references) this.fence(a.t);
    this.fences.delete(b.t);
    const next: Attempt = {
      ...b,
      active: true,
      fence: (old?.fence ?? 0) + 1,
      held,
      reserved: partial ? 0 : b.meta.size,
      writerGeneration: this.owner.writerGeneration,
      expiresAt: Date.now() + 30000,
    };
    const p: Partial = partial
      ? {
          ...partial,
          bitmap: held,
          verified: partial.verified && invalid.length === 0,
          touchedAt: Date.now(),
        }
      : {
          from: b.source.player,
          id: b.meta.id,
          size: b.meta.size,
          algorithm: b.meta.hash,
          touchedAt: Date.now(),
          bitmap: held,
          verified: false,
          fence: 1,
        };
    const owner = {
      ...this.owner,
      reserved: this.owner.reserved + next.reserved,
      committed: Math.max(
        0,
        this.owner.committed - invalid.reduce((n, i) => n + pieceLength(b.meta.size, i), 0),
      ),
    };
    // Charge the registry first: a crash can over-reserve, never under-reserve.
    if (next.reserved) await this.quota?.update(owner.reserved, true);
    await this.write(['owner', 'attempts', 'transfers', 'pieces'], (tx) => {
      for (const i of invalid) tx.delete('pieces', [b.source.player, b.meta.id, i]);
      for (const a of references)
        tx.put('attempts', {
          ...a,
          active: false,
          held: a.held.filter((i) => !invalid.includes(i)),
          fence: a.fence + 1,
        });
      tx.put('attempts', next);
      tx.put('transfers', p);
      tx.put('owner', owner, 'owner');
    });
    this.owner = owner;
    return held;
  }
  async put(t: string, a: number, index: number, bytes: ArrayBuffer): Promise<boolean> {
    const at = await this.attempt(t, a);
    check(bytes.byteLength === pieceLength(at.meta.size, index), 'Invalid piece length');
    const key = [at.source.player, at.meta.id];
    const p = await this.get<Partial>('transfers', key);
    check(p);
    const old = await this.get<Piece>('pieces', [...key, index]);
    if (old) {
      check(
        old.bytes.byteLength === bytes.byteLength &&
          new Uint8Array(old.bytes).every((x, i) => x === new Uint8Array(bytes)[i]),
        'Conflicting cached piece',
      );
      return false;
    }
    await this.attempt(t, a);
    const next = {
      ...p,
      bitmap: [...p.bitmap, index].sort((x, y) => x - y),
      touchedAt: Date.now(),
    };
    const owner = { ...this.owner, committed: this.owner.committed + bytes.byteLength };
    await this.write(
      ['owner', 'pieces', 'transfers', 'attempts'],
      (tx) => {
        check(!this.fences.has(t));
        tx.put('pieces', { from: at.source.player, id: at.meta.id, index, bytes });
        tx.put('transfers', next);
        tx.put('attempts', { ...at, held: next.bitmap, expiresAt: Date.now() + 30000 });
        tx.put('owner', owner, 'owner');
      },
      t,
    );
    this.owner = owner;
    return true;
  }
  async verify(t: string, a: number): Promise<Blob> {
    const at = await this.attempt(t, a);
    const digests: ArrayBuffer[] = [];
    const blobs: BlobPart[] = [];
    for (let i = 0; i < Math.ceil(at.meta.size / PIECE); i++) {
      await this.attempt(t, a);
      const p = await this.get<Piece>('pieces', [at.source.player, at.meta.id, i]);
      check(p && p.bytes.byteLength === pieceLength(at.meta.size, i), 'Missing piece');
      digests.push(await digestPiece(p.bytes));
      blobs.push(p.bytes);
    }
    const root = await contentIdFromDigests(digests);
    await this.attempt(t, a);
    if (root !== at.meta.id) {
      await this.purge(at.source.player, at.meta.id);
      throw new Error('File integrity check failed');
    }
    const partial = await this.get<Partial>('transfers', [at.source.player, at.meta.id]);
    check(partial);
    await this.write(
      ['transfers'],
      (tx) => {
        check(!this.fences.has(t));
        tx.put('transfers', { ...partial, verified: true, touchedAt: Date.now() });
      },
      t,
    );
    return new Blob(blobs);
  }
  async readForExport(sender: Endpoint, offer: string): Promise<Blob> {
    const receipt = await this.receipt(sender, offer);
    check(receipt?.state === 'received', 'No verified receipt');
    const parts: BlobPart[] = [];
    const digests: ArrayBuffer[] = [];
    for (let index = 0; index < Math.ceil(receipt.meta.size / PIECE); index++) {
      const p = await this.get<Piece>('pieces', [sender.player, receipt.meta.id, index]);
      check(
        p && p.bytes.byteLength === pieceLength(receipt.meta.size, index),
        'Downloaded payload is no longer retained',
      );
      digests.push(await digestPiece(p.bytes));
      parts.push(p.bytes);
      this.assert();
    }
    if ((await contentIdFromDigests(digests)) !== receipt.meta.id) {
      await this.purge(sender.player, receipt.meta.id);
      throw new Error('File integrity check failed');
    }
    return new Blob(parts);
  }
  private async purge(from: string, id: string): Promise<void> {
    const ats = (await this.all<Attempt>('attempts')).filter(
      (a) => a.source.player === from && a.meta.id === id,
    );
    for (const a of ats) this.fence(a.t);
    const p = await this.get<Partial>('transfers', [from, id]);
    const owner = {
      ...this.owner,
      reserved: Math.max(0, this.owner.reserved - (p?.size ?? 0)),
      committed: Math.max(
        0,
        this.owner.committed - (p?.bitmap.reduce((n, i) => n + pieceLength(p.size, i), 0) ?? 0),
      ),
    };
    await this.write(['pieces', 'transfers', 'attempts', 'owner'], (tx) => {
      for (const i of p?.bitmap ?? []) tx.delete('pieces', [from, id, i]);
      tx.delete('transfers', [from, id]);
      for (const a of ats)
        tx.put('attempts', { ...a, active: false, held: [], reserved: 0, fence: a.fence + 1 });
      tx.put('owner', owner, 'owner');
    });
    this.owner = owner;
    await this.quota?.update(owner.reserved);
  }
  async release(t: string): Promise<void> {
    this.fence(t);
    const at = await this.get<Attempt>('attempts', t);
    if (at)
      await this.write(['attempts'], (tx) =>
        tx.put('attempts', { ...at, active: false, reserved: 0, fence: at.fence + 1 }),
      );
  }
  async releaseSaved(t: string): Promise<void> {
    await this.release(t);
    const at = await this.get<Attempt>('attempts', t);
    if (!at) return;
    const others = (await this.all<Attempt>('attempts')).filter(
      (a) =>
        a.t !== t && a.active && a.source.player === at.source.player && a.meta.id === at.meta.id,
    );
    if (!others.length) await this.purge(at.source.player, at.meta.id);
  }
  async saveReceipt(r: Receipt): Promise<void> {
    const previous = await this.receipt(r.sender, r.offer);
    if (previous?.state === 'received' && r.state === 'cancelled') return;
    const all = await this.all<Receipt>('offers');
    check(all.length < 1024 || (await this.receipt(r.sender, r.offer)), 'Receipt history is full');
    const newReceipt = r.state === 'received' && !(await this.receipt(r.sender, r.offer));
    if (newReceipt) {
      const at = await this.get<Attempt>('attempts', r.t);
      check(at);
      await this.attempt(r.t, at.a);
    }
    await this.write(
      ['offers'],
      (tx) => {
        if (newReceipt) check(!this.fences.has(r.t), 'Stale receipt writer');
        tx.put('offers', r, [endpointKey(r.sender), r.offer]);
      },
      r.t,
    );
  }
  receipt(sender: Endpoint, offer: string): Promise<Receipt | undefined> {
    return this.get('offers', [endpointKey(sender), offer]);
  }
  receipts(): Promise<Receipt[]> {
    return this.all('offers');
  }
  async exportRecord(e: ExportRecord): Promise<void> {
    check(
      (await this.get('exports', e.id)) || (await this.all<ExportRecord>('exports')).length < 1024,
      'Export history is full',
    );
    await this.write(['exports'], (tx) => tx.put('exports', e));
  }
  async gc(): Promise<void> {
    const now = Date.now();
    const receipts = await this.all<Receipt>('offers');
    const active = (await this.all<Attempt>('attempts')).filter(
      (a) => a.active && a.expiresAt > now,
    );
    for (const p of await this.all<Partial>('transfers'))
      if (
        now - p.touchedAt > 7 * 86400000 &&
        !receipts.some(
          (r) =>
            r.sender.player === p.from &&
            r.meta.id === p.id &&
            r.state === 'received' &&
            r.outcome !== 'browser-download',
        ) &&
        !active.some((a) => a.source.player === p.from && a.meta.id === p.id)
      )
        await this.purge(p.from, p.id);
    await this.write(['offers'], (tx) => {
      for (const r of receipts)
        if (r.state === 'cancelled' && now - r.touchedAt > 86400000)
          tx.delete('offers', [endpointKey(r.sender), r.offer]);
    });
  }
  async close(): Promise<void> {
    this.alive = false;
    this.db?.close();
    this.quota?.close();
    for (const m of this.memory.values()) m.clear();
  }
}
