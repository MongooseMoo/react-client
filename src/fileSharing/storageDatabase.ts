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
  touchedAt: number;
  live: number;
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
  bitmap: Uint8Array;
  committed: number;
  charge: number;
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
  touchedAt?: number;
};
type Owner = {
  ownerKey: string;
  schemaVersion: 2;
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
  if (store === 'offers')
    return [endpointKey((row as unknown as Receipt).sender), String(row.offer)];
  if (store === 'transfers') return [String(row.from), String(row.id)];
  return String(store === 'attempts' ? row.t : row.id);
}
/** Single writer, serialized by StorageOwner/worker. Cancel fences take effect immediately. */
const DAY = 86400000;
const HISTORY = 1024;
const ATTEMPTS = 2048;
function indices(p: Partial): number[] {
  const result: number[] = [];
  for (let i = 0; i < Math.ceil(p.size / PIECE); i++)
    if (p.bitmap[i >> 3] & (1 << (i & 7))) result.push(i);
  return result;
}
const content = (from: string, id: string) => [from, id];
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
        const r = indexedDB.open(`file-sharing-v2:${this.ownerKey}`, 2);
        r.onupgradeneeded = () => {
          const d = r.result;
          if (!d.objectStoreNames.contains('owner')) {
            d.createObjectStore('owner');
            d.createObjectStore('attempts', { keyPath: 't' });
            d.createObjectStore('offers');
            d.createObjectStore('exports', { keyPath: 'id' });
            d.createObjectStore('pieces', { keyPath: ['from', 'id', 'index'] });
            d.createObjectStore('transfers', { keyPath: ['from', 'id'] });
          }
          const tx = r.transaction;
          check(tx);
          for (const name of ['attempts', 'offers', 'exports', 'transfers']) {
            const store = tx.objectStore(name);
            store.createIndex('touchedAt', 'touchedAt');
          }
          tx.objectStore('attempts').createIndex('content', ['source.player', 'meta.id']);
          tx.objectStore('attempts').createIndex('live', 'live');
          tx.objectStore('attempts').createIndex('inactive', ['live', 'touchedAt']);
          tx.objectStore('offers').createIndex('content', ['sender.player', 'meta.id']);
          tx.objectStore('offers').createIndex('state', ['state', 'touchedAt']);
          tx.objectStore('exports').createIndex('offer', [
            'sender.player',
            'sender.endpoint',
            'sender.epoch',
            'offer',
          ]);
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
      schemaVersion: 2,
      writerGeneration: (old?.writerGeneration ?? 0) + 1,
      reserved: 0,
      committed: 0,
      nextGC: Date.now() + 3600000,
    };
    const attempts = await this.all<Attempt>('attempts');
    const exports = await this.all<ExportRecord>('exports');
    const partials = await this.all<Partial>('transfers');
    // v1 arrays migrate once; v2 metadata has a fixed-size bitset (at most 800 bytes).
    for (const p of partials) {
      if (Array.isArray(p.bitmap)) {
        const old = p.bitmap as number[];
        p.bitmap = new Uint8Array(Math.ceil(Math.ceil(p.size / PIECE) / 8));
        for (const i of old) p.bitmap[i >> 3] |= 1 << (i & 7);
      }
      p.committed = indices(p).reduce((n, i) => n + pieceLength(p.size, i), 0);
      p.charge = p.committed;
      this.owner.committed += p.committed;
      this.owner.reserved += p.charge;
    }
    await this.write(['owner', 'attempts', 'exports', 'transfers'], (tx) => {
      tx.put('owner', this.owner, 'owner');
      for (const p of partials) tx.put('transfers', p);
      for (const a of attempts)
        tx.put('attempts', {
          ...a,
          active: false,
          live: 0,
          touchedAt: a.touchedAt ?? Date.now(),
          fence: a.fence + 1,
          reserved: 0,
          held: [],
        });
      for (const e of exports)
        tx.put('exports', {
          ...e,
          touchedAt: e.touchedAt ?? Date.now(),
          state: e.state === 'exporting' ? 'export-uncertain' : e.state,
        });
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
      await this.quota.update(this.owner.reserved - this.owner.committed);
    }
  }
  private async get<T>(store: Store, key: IDBValidKey): Promise<T | undefined> {
    this.assert();
    if (!this.db) return this.memory.get(store)?.get(JSON.stringify(key)) as T | undefined;
    const tx = this.db.transaction(store);
    return request(tx.objectStore(store).get(key));
  }
  private async all<T>(store: Store): Promise<T[]> {
    return this.query(store);
  }
  /** Cursor reads are bounded on admission paths and scoped by content on reference paths. */
  private async query<T>(
    store: Store,
    index?: string,
    key?: IDBValidKey,
    limit = Infinity,
    before = Infinity,
  ): Promise<T[]> {
    this.assert();
    if (!this.db) {
      const value = (row: unknown): IDBValidKey => {
        const r = row as {
          source: Endpoint;
          sender: Endpoint;
          meta: Metadata;
          offer: string;
          live: number;
          touchedAt: number;
          state: string;
        };
        if (index === 'content')
          return store === 'attempts'
            ? content(r.source.player, r.meta.id)
            : content(r.sender.player, r.meta.id);
        if (index === 'offer') return [r.sender.player, r.sender.endpoint, r.sender.epoch, r.offer];
        if (index === 'live') return r.live;
        if (index === 'inactive') return [r.live, r.touchedAt];
        if (index === 'state') return [r.state, r.touchedAt];
        return r.touchedAt;
      };
      return [...(this.memory.get(store)?.values() ?? [])]
        .filter(
          (r) =>
            (key === undefined || JSON.stringify(value(r)) === JSON.stringify(key)) &&
            Number((r as Partial).touchedAt) <= before,
        )
        .sort((a, b) => {
          if (index === 'inactive')
            return (
              Number((a as Attempt).live) - Number((b as Attempt).live) ||
              (a as Attempt).touchedAt - (b as Attempt).touchedAt
            );
          if (index === 'state')
            return (
              String((a as Receipt).state).localeCompare(String((b as Receipt).state)) ||
              (a as Receipt).touchedAt - (b as Receipt).touchedAt
            );
          return index ? Number((a as Partial).touchedAt) - Number((b as Partial).touchedAt) : 0;
        })
        .slice(0, limit) as T[];
    }
    const tx = this.db.transaction(store);
    const source = index ? tx.objectStore(store).index(index) : tx.objectStore(store);
    return new Promise((resolve, reject) => {
      const out: T[] = [];
      const r = source.openCursor(key);
      r.onerror = () => reject(r.error);
      r.onsuccess = () => {
        const c = r.result;
        if (!c || out.length >= limit || (index === 'touchedAt' && Number(c.key) > before)) {
          resolve(out);
          return;
        }
        out.push(c.value);
        c.continue();
      };
    });
  }
  private async count(store: Store): Promise<number> {
    if (!this.db) return this.memory.get(store)?.size ?? 0;
    return request(this.db.transaction(store).objectStore(store).count());
  }
  private async trimHistory(): Promise<void> {
    const now = Date.now();
    const receipts = await this.query<Receipt>(
      'offers',
      'touchedAt',
      undefined,
      HISTORY + 32,
      now - DAY,
    );
    // A received offer pins its bytes for its 24-hour recovery/history lifetime,
    // including browser handoffs, whose external save cannot be confirmed.
    const expired = receipts.filter((r) => now - r.touchedAt >= DAY);
    const attempts = await this.query<Attempt>(
      'attempts',
      'touchedAt',
      undefined,
      ATTEMPTS + 32,
      now - DAY,
    );
    const dead = attempts.filter((a) => !a.active && now - a.touchedAt >= DAY);
    const keys = new Set(expired.map((r) => JSON.stringify([endpointKey(r.sender), r.offer])));
    const exports =
      expired.length && (await this.count('exports'))
        ? (await this.query<ExportRecord>('exports', 'touchedAt', undefined, HISTORY)).filter((e) =>
            keys.has(JSON.stringify([endpointKey(e.sender), e.offer])),
          )
        : [];
    if (expired.length || dead.length)
      await this.write(['offers', 'attempts', 'exports'], (tx) => {
        for (const r of expired) tx.delete('offers', [endpointKey(r.sender), r.offer]);
        for (const a of dead) {
          tx.delete('attempts', a.t);
          this.fences.delete(a.t);
        }
        for (const e of exports) tx.delete('exports', e.id);
      });
  }
  private async deleteExports(r: Receipt): Promise<void> {
    const rows = await this.query<ExportRecord>('exports', 'offer', [
      r.sender.player,
      r.sender.endpoint,
      r.sender.epoch,
      r.offer,
    ]);
    if (rows.length)
      await this.write(['exports'], (tx) => {
        for (const e of rows) tx.delete('exports', e.id);
      });
  }
  private async makeReceiptRoom(sender: Endpoint, offer: string): Promise<void> {
    await this.trimHistory();
    const slots = new Set<string>();
    for (const a of await this.query<Attempt>('attempts', 'live', 1)) {
      if (a.offer === offer && endpointKey(a.source) === endpointKey(sender)) continue;
      if (!(await this.receipt(a.source, a.offer)))
        slots.add(JSON.stringify([endpointKey(a.source), a.offer]));
    }
    const excess = (await this.count('offers')) + slots.size - HISTORY + 1;
    if (excess <= 0) return;
    const rows = await this.query<Receipt>('offers', 'state', undefined, excess);
    const evict = rows.filter((r) => r.state === 'cancelled').slice(0, excess);
    await this.write(['offers'], (tx) => {
      for (const r of evict) tx.delete('offers', [endpointKey(r.sender), r.offer]);
    });
    check(
      (await this.count('offers')) + slots.size < HISTORY,
      'Recent received files fill history; retry after history expires',
    );
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
  async reserve(b: Binding, current = () => true): Promise<number[]> {
    this.assert();
    check(current(), 'Stale transfer reservation');
    check(b.meta.size <= MAX_FILE && b.meta.size >= 0, 'File exceeds the 100 MiB limit');
    const old = await this.get<Attempt>('attempts', b.t);
    await this.trimHistory();
    if (!old && (await this.count('attempts')) >= ATTEMPTS) {
      const rows = await this.query<Attempt>('attempts', 'inactive', undefined, 1);
      const evict = rows.find((a) => !a.active);
      check(evict, 'Too many active transfer reservations');
      await this.write(['attempts'], (tx) => tx.delete('attempts', evict.t));
      this.fences.delete(evict.t);
    }
    // Reserve a receipt slot before accepting bytes, rather than failing after verification.
    if (!(await this.receipt(b.source, b.offer))) await this.makeReceiptRoom(b.source, b.offer);
    if (old)
      check(
        old.offer === b.offer &&
          endpointKey(old.source) === endpointKey(b.source) &&
          JSON.stringify(old.meta) === JSON.stringify(b.meta) &&
          b.a > old.a,
        'Attempt binding changed',
      );
    const key = [b.source.player, b.meta.id];
    let partial = await this.get<Partial>('transfers', key);
    check(!partial || partial.size === b.meta.size, 'Content size conflict');
    if (this.owner.reserved + b.meta.size - (partial?.charge ?? 0) > this.budget) {
      await this.evictFor(b.meta.size - (partial?.charge ?? 0), key);
      partial = await this.get<Partial>('transfers', key);
    }
    check(
      this.owner.reserved + b.meta.size - (partial?.charge ?? 0) <= this.budget,
      'File storage budget exceeded',
    );
    const held: number[] = [];
    if (partial)
      for (const i of indices(partial)) {
        const p = await this.get<Piece>('pieces', [b.source.player, b.meta.id, i]);
        if (p && p.bytes.byteLength === pieceLength(b.meta.size, i)) {
          this.assert();
          held.push(i);
        }
      }
    check(current(), 'Stale transfer reservation');
    this.fences.delete(b.t);
    const invalid = partial ? indices(partial).filter((i) => !held.includes(i)) : [];
    const references = invalid.length ? await this.query<Attempt>('attempts', 'content', key) : [];
    for (const a of references) this.fence(a.t);
    check(current(), 'Stale transfer reservation');
    this.fences.delete(b.t);
    const next: Attempt = {
      ...b,
      active: true,
      live: 1,
      touchedAt: Date.now(),
      fence: (old?.fence ?? 0) + 1,
      held,
      reserved: b.meta.size - (partial?.committed ?? 0),
      writerGeneration: this.owner.writerGeneration,
      expiresAt: Date.now() + 30000,
    };
    const bitmap = new Uint8Array(Math.ceil(Math.ceil(b.meta.size / PIECE) / 8));
    for (const i of held) bitmap[i >> 3] |= 1 << (i & 7);
    const committed = held.reduce((n, i) => n + pieceLength(b.meta.size, i), 0);
    const p: Partial = partial
      ? {
          ...partial,
          bitmap,
          committed,
          charge: b.meta.size,
          verified: partial.verified && invalid.length === 0,
          touchedAt: Date.now(),
        }
      : {
          from: b.source.player,
          id: b.meta.id,
          size: b.meta.size,
          algorithm: b.meta.hash,
          touchedAt: Date.now(),
          bitmap,
          committed,
          charge: b.meta.size,
          verified: false,
          fence: 1,
        };
    const owner = {
      ...this.owner,
      reserved: this.owner.reserved + b.meta.size - (partial?.charge ?? 0),
      committed: Math.max(
        0,
        this.owner.committed - invalid.reduce((n, i) => n + pieceLength(b.meta.size, i), 0),
      ),
    };
    // Charge the registry first: a crash can over-reserve, never under-reserve.
    if (next.reserved) await this.quota?.update(owner.reserved - owner.committed, true);
    await this.write(
      ['owner', 'attempts', 'transfers', 'pieces'],
      (tx) => {
        check(current(), 'Stale transfer reservation');
        for (const i of invalid) tx.delete('pieces', [b.source.player, b.meta.id, i]);
        for (const a of references)
          tx.put('attempts', {
            ...a,
            active: false,
            live: 0,
            held: a.held.filter((i) => !invalid.includes(i)),
            fence: a.fence + 1,
          });
        tx.put('attempts', next);
        tx.put('transfers', p);
        tx.put('owner', owner, 'owner');
      },
      b.t,
    );
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
      bitmap: p.bitmap.slice(),
      committed: p.committed + bytes.byteLength,
      touchedAt: Date.now(),
    };
    next.bitmap[index >> 3] |= 1 << (index & 7);
    const owner = { ...this.owner, committed: this.owner.committed + bytes.byteLength };
    await this.write(
      ['owner', 'pieces', 'transfers'],
      (tx) => {
        check(!this.fences.has(t));
        tx.put('pieces', { from: at.source.player, id: at.meta.id, index, bytes });
        tx.put('transfers', next);
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
    const ats = await this.query<Attempt>('attempts', 'content', content(from, id));
    for (const a of ats) this.fence(a.t);
    const p = await this.get<Partial>('transfers', [from, id]);
    const owner = {
      ...this.owner,
      reserved: Math.max(0, this.owner.reserved - (p?.charge ?? 0)),
      committed: Math.max(0, this.owner.committed - (p?.committed ?? 0)),
    };
    await this.write(['pieces', 'transfers', 'attempts', 'owner'], (tx) => {
      for (const i of p ? indices(p) : []) tx.delete('pieces', [from, id, i]);
      tx.delete('transfers', [from, id]);
      for (const a of ats)
        tx.put('attempts', {
          ...a,
          active: false,
          live: 0,
          held: [],
          reserved: 0,
          fence: a.fence + 1,
        });
      tx.put('owner', owner, 'owner');
    });
    this.owner = owner;
    await this.quota?.update(owner.reserved - owner.committed);
  }
  async release(t: string): Promise<void> {
    this.fence(t);
    const at = await this.get<Attempt>('attempts', t);
    if (!at) {
      this.fences.delete(t);
      return;
    }
    const key = content(at.source.player, at.meta.id);
    const p = await this.get<Partial>('transfers', key);
    const others = (await this.query<Attempt>('attempts', 'content', key)).some(
      (a) => a.t !== t && a.active,
    );
    const charge = p ? (others ? p.size : p.committed) : 0;
    const owner = { ...this.owner, reserved: this.owner.reserved - (p?.charge ?? 0) + charge };
    await this.write(['attempts', 'owner', 'transfers'], (tx) => {
      tx.put('attempts', {
        ...at,
        active: false,
        live: 0,
        reserved: 0,
        touchedAt: Date.now(),
        fence: at.fence + 1,
      });
      if (p) tx.put('transfers', { ...p, charge });
      tx.put('owner', owner, 'owner');
    });
    this.owner = owner;
    await this.quota?.update(owner.reserved - owner.committed);
  }
  private async referenced(from: string, id: string): Promise<boolean> {
    const key = content(from, id);
    return (
      (await this.query<Attempt>('attempts', 'content', key)).some((a) => a.active) ||
      (await this.query<Receipt>('offers', 'content', key)).some((r) => r.state === 'received')
    );
  }
  async releaseSaved(t: string): Promise<void> {
    await this.release(t);
    const at = await this.get<Attempt>('attempts', t);
    if (at && !(await this.referenced(at.source.player, at.meta.id)))
      await this.purge(at.source.player, at.meta.id);
  }
  private async evictFor(bytes: number, except: IDBValidKey): Promise<void> {
    // Expired data first, then verified LRU, then partial LRU. Never touch another consumer.
    const rows = await this.query<Partial>('transfers', 'touchedAt');
    const now = Date.now();
    const rank = (p: Partial) =>
      now - p.touchedAt >= (p.verified ? DAY : 7 * DAY) ? 0 : p.verified ? 1 : 2;
    rows.sort((a, b) => rank(a) - rank(b) || a.touchedAt - b.touchedAt);
    for (const p of rows) {
      if (this.owner.reserved + bytes <= this.budget) break;
      if (
        JSON.stringify(content(p.from, p.id)) === JSON.stringify(except) ||
        (await this.referenced(p.from, p.id))
      )
        continue;
      await this.purge(p.from, p.id);
    }
  }
  async saveReceipt(r: Receipt): Promise<void> {
    const previous = await this.receipt(r.sender, r.offer);
    if (previous?.state === 'received' && r.state === 'cancelled') return;
    if (!previous) await this.makeReceiptRoom(r.sender, r.offer);
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
    return this.trimHistory().then(() => this.query('offers', 'touchedAt', undefined, HISTORY));
  }
  async exportRecord(e: ExportRecord): Promise<void> {
    // One latest export intent per receipt, rather than an ever-growing click history.
    const receipt = await this.receipt(e.sender, e.offer);
    check(receipt?.state === 'received', 'No verified receipt');
    await this.deleteExports(receipt);
    await this.write(['exports'], (tx) => tx.put('exports', { ...e, touchedAt: Date.now() }));
  }
  async gc(): Promise<void> {
    await this.trimHistory();
    const now = Date.now();
    for (const p of await this.query<Partial>('transfers', 'touchedAt'))
      if (
        now - p.touchedAt >= (p.verified ? DAY : 7 * DAY) &&
        !(await this.referenced(p.from, p.id))
      )
        await this.purge(p.from, p.id);
  }
  async close(): Promise<void> {
    this.alive = false;
    this.db?.close();
    this.quota?.close();
    for (const m of this.memory.values()) m.clear();
  }
}
