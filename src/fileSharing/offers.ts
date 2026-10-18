import {
  FileTransferError,
  type TransferSnapshot,
  type TransferState,
} from '../fileTransfer/types';
import { Bucket, parseBind, type Bind, type Control, type Outcome } from './ctl';
import {
  decodeFrame,
  encodeFrame,
  heldRanges,
  pieceLength,
  type Frame,
  type Range,
} from './frames';
import { exportDownload } from './export';
import {
  check,
  endpointKey,
  MAX_FILE,
  metadata,
  PIECE,
  randomId,
  sameEndpoint,
  utf8Length,
  validName,
  type Endpoint,
  type FilesPort,
  type Metadata,
  type OfferState,
  type Ready,
} from './protocol';
import type { StorageApi } from './storage';
import type { Receipt } from './storageDatabase';
import type { PeerSession, SessionPool } from './sessionPool';
type Timer = ReturnType<typeof setTimeout>;
type Request = Extract<Control, { op: 'push' }>;
type Reply = Extract<Control, { op: 'accepted' | 'error' | 'outcome' }>;
export type OfferDetails = {
  key: string;
  outcome?: Outcome;
  canSave: boolean;
  canRetry?: boolean;
  saveError?: string;
};
interface Offer {
  key: string;
  offer: string;
  sender: Endpoint;
  receiver: Endpoint;
  meta: Metadata;
  state: OfferState | 'preparing';
  file?: File;
  snapshot: TransferSnapshot;
  t?: string;
  a: number;
  q?: string;
  reserveT?: string;
  attempt?: Attempt;
  retry: number;
  automatic: number[];
  retryTimer?: Timer;
  requestTimer?: Timer;
  verifyStart?: number;
  receipt?: Receipt;
  blob?: Blob;
  saveError?: string;
  saving?: boolean;
  receivedNotified?: boolean;
  paused?: boolean;
}
interface Attempt {
  record: Offer;
  session: PeerSession;
  channel: RTCDataChannel;
  request: Request;
  bound: boolean;
  ready: boolean;
  active: boolean;
  received: number;
  lastIndex: number;
  held: Set<number>;
  have: Range[];
  sent: number;
  stored: number;
  next: number;
  serial: Promise<void>;
  queued: number;
  timer?: Timer;
  terminal?: 3 | 4;
  drain?: Timer;
  wake?: () => void;
  backpressured?: boolean;
}
function canonical(v: unknown): string {
  if (v && typeof v === 'object' && !Array.isArray(v))
    return `{${Object.entries(v)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, x]) => `${JSON.stringify(k)}:${canonical(x)}`)
      .join(',')}}`;
  return JSON.stringify(v);
}
export interface OfferOptions {
  self: Ready;
  files: FilesPort;
  storage: StorageApi;
  live(): boolean;
  change(snapshot: TransferSnapshot): void;
  changed(): void;
}
/** Direct-send consent and per-operation lifetimes. No file cache can grant remote authority. */
export class OfferTable {
  private readonly rows = new Map<string, Offer>();
  private readonly tBindings = new Map<string, Offer>();
  private readonly qCache = new Map<string, { request: string; reply: Reply; at: number }>();
  private readonly cancellations = new Map<string, number>();
  private readonly controlSerial = new Map<string, Promise<void>>();
  private readonly pendingRequests = new Map<string, number>();
  private readonly off: (() => void)[];
  private pool!: SessionPool;
  private disposed = false;
  private generation = 0;
  private queuedBytes = 0;
  private uploads = 0;
  private downloads = 0;
  private pumping = false;
  private readonly outgoing = new Set<Attempt>();
  private readonly ownerUpload = new Bucket(8 * 1024 ** 2, 2 * 1024 ** 2);
  private readonly ownerDownload = new Bucket(16 * 1024 ** 2, 2 * 1024 ** 2);
  private readonly peerUpload = new Map<string, Bucket>();
  constructor(private readonly options: OfferOptions) {
    const f = options.files;
    this.off = [
      f.on('Offer', (m) => {
        if (!this.live() || sameEndpoint(m.from, options.self.self) || this.rows.has(m.offer))
          return;
        if (
          this.pendingCount() >= 64 ||
          [...this.rows.values()].filter(
            (r) => sameEndpoint(r.sender, m.from) && r.state === 'pending',
          ).length >= 4
        ) {
          f.send('Respond', { ...this.target(m.from), offer: m.offer, accept: false });
          return;
        }
        const r = this.make(
          m.offer,
          m.from,
          options.self.self,
          metadata({ id: m.id, name: m.name, size: m.size }),
        );
        this.rows.set(m.offer, r);
        this.emit(r, 'offered');
      }),
      f.on('Offered', (m) => {
        const r = this.rows.get(m.offer);
        if (r && sameEndpoint(r.receiver, m.target) && r.state === 'pending')
          this.emit(r, 'offered');
      }),
      f.on('OfferState', (m) => {
        const r = this.rows.get(m.offer);
        if (!r || !sameEndpoint(r.sender, m.sender) || !sameEndpoint(r.receiver, m.receiver))
          return;
        if (r.state !== 'pending' && r.state !== 'accepted' && r.state !== m.state) return;
        const previous = r.state;
        r.state = m.state;
        if (m.state === 'accepted') {
          if (previous === 'accepted') return;
          if (r.snapshot.direction === 'receive' && !r.reserveT) {
            this.cancel(r.key);
            return;
          }
          this.emit(r, 'connecting');
          if (r.file) {
            this.pool.reserve(r.receiver, r.offer);
            const s = this.pool.forPeer(r.receiver);
            if (s?.ready) this.push(r, s);
          }
        } else if (m.state === 'received') {
          if (r.file) this.emit(r, 'complete');
        } else if (m.state !== 'pending') {
          this.rememberCancelled(r);
          this.stop(r);
          this.emit(r, m.state === 'rejected' ? 'rejected' : 'cancelled');
        }
      }),
      f.on('Revoke', (m) => {
        for (const r of this.rows.values())
          if (
            sameEndpoint(this.remote(r), m.peer) &&
            (m.scope === 'peer' || r.offer === m.offer) &&
            ['pending', 'accepted'].includes(r.state)
          ) {
            r.state = 'revoked';
            this.rememberCancelled(r);
            this.stop(r);
            this.emit(r, 'cancelled');
          }
        if (m.scope === 'peer') this.pool.forPeer(m.peer)?.fail('cancelled');
      }),
      f.on('Error', (m) => {
        if (!m.refs.offer) return;
        const r = this.rows.get(m.refs.offer);
        if (r && ['pending', 'accepted'].includes(r.state)) {
          r.state = 'revoked';
          this.rememberCancelled(r);
          this.stop(r);
          this.fail(r, `File offer: ${m.code}`);
        }
      }),
    ];
    void this.restoreReceipts().catch(() => {
      /* Storage diagnostics are surfaced on the next explicit action. */
    });
  }
  private async restoreReceipts(): Promise<void> {
    const receipts = await this.options.storage.receipts();
    if (this.disposed) return;
    for (const receipt of receipts) {
      if (receipt.state !== 'received' || this.rows.has(receipt.offer)) continue;
      const r = this.make(receipt.offer, receipt.sender, this.options.self.self, receipt.meta);
      r.state = 'received';
      r.receipt = receipt;
      r.t = receipt.t;
      r.snapshot = { ...r.snapshot, state: 'complete', transferredBytes: r.meta.size };
      this.rows.set(r.offer, r);
    }
    this.options.changed();
  }
  attach(pool: SessionPool): void {
    this.pool = pool;
  }
  private live(): boolean {
    return !this.disposed && this.options.live();
  }
  private target(peer: Endpoint) {
    return { req: randomId(), to: peer.player, target: peer };
  }
  private remote(r: Offer): Endpoint {
    return r.snapshot.direction === 'send' ? r.receiver : r.sender;
  }
  private pendingCount(): number {
    return [...this.rows.values()].filter((r) => r.state === 'pending').length;
  }
  private make(
    offer: string,
    sender: Endpoint,
    receiver: Endpoint,
    meta: Metadata,
    file?: File,
  ): Offer {
    const direction = sameEndpoint(sender, this.options.self.self) ? 'send' : 'receive';
    const peer = direction === 'send' ? receiver.player : sender.player;
    return {
      key: `v2:${offer}`,
      offer,
      sender,
      receiver,
      meta,
      file,
      state: 'pending',
      a: 0,
      retry: 0,
      automatic: [],
      snapshot: {
        key: `v2:${offer}`,
        id: meta.id,
        peer,
        name: meta.name,
        size: meta.size,
        direction,
        state: 'offered',
        transferredBytes: 0,
      },
    };
  }
  snapshots(): TransferSnapshot[] {
    return [...this.rows.values()].map((r) => r.snapshot);
  }
  details(): OfferDetails[] {
    return [...this.rows.values()].map((r) => ({
      key: r.key,
      outcome: r.receipt?.outcome,
      canSave: Boolean(
        r.receipt && (r.blob || r.receipt.outcome !== 'browser-download') && !r.saving,
      ),
      canRetry: Boolean(
        r.file && r.state === 'accepted' && r.paused && !r.attempt && !r.q && this.live(),
      ),
      saveError: r.saveError,
    }));
  }
  private emit(
    r: Offer,
    state: TransferState = r.snapshot.state,
    bytes = r.snapshot.transferredBytes,
  ): void {
    if (this.disposed) return;
    r.snapshot = { ...r.snapshot, state, transferredBytes: bytes };
    this.options.change(r.snapshot);
    this.options.changed();
  }
  private fail(r: Offer, message: string): void {
    r.paused = true;
    r.snapshot = { ...r.snapshot, error: new FileTransferError('connection-failed', message) };
    this.emit(r, 'failed');
  }
  authorized(peer: Endpoint, offer: string): boolean {
    const r = this.rows.get(offer);
    return Boolean(this.live() && r?.state === 'accepted' && sameEndpoint(peer, this.remote(r)));
  }
  async send(file: File, to: Endpoint, maxReceiveSize: number): Promise<TransferSnapshot> {
    check(
      this.live() && file.size <= Math.min(MAX_FILE, maxReceiveSize) && validName(file.name),
      'Unsupported file name or file exceeds the receive limit',
    );
    check(
      this.rows.size < 1120 &&
        this.pendingCount() < 64 &&
        [...this.rows.values()].filter((r) => r.state === 'preparing').length < 2,
      'Too many pending offers',
    );
    const generation = this.generation;
    const offer = randomId();
    const token = randomId();
    const r = this.make(
      offer,
      this.options.self.self,
      to,
      metadata({ id: '0'.repeat(64), name: file.name, size: file.size }),
      file,
    );
    r.state = 'preparing';
    r.reserveT = token;
    this.rows.set(offer, r);
    this.emit(r, 'preparing');
    let id: string;
    try {
      id = await this.options.storage.hash(file, token);
      check(
        this.live() && generation === this.generation && r.state === 'preparing',
        'File transfer cancelled',
      );
    } catch (error) {
      if (r.snapshot.state !== 'cancelled') {
        r.state = 'cancelled';
        this.fail(r, error instanceof Error ? error.message : String(error));
      }
      throw error;
    }
    r.reserveT = undefined;
    r.meta = metadata({ id, name: file.name, size: file.size });
    r.snapshot = { ...r.snapshot, id };
    r.state = 'pending';
    this.emit(r, 'offered');
    this.options.files.send('Offer', {
      ...this.target(to),
      offer,
      id,
      name: file.name,
      size: file.size,
    });
    return r.snapshot;
  }
  async accept(key: string): Promise<void> {
    const r = this.find(key);
    check(this.live() && r.state === 'pending' && r.snapshot.direction === 'receive');
    check(
      r.meta.size <= Math.min(MAX_FILE, this.options.self.maxReceiveSize),
      'File exceeds the receive limit',
    );
    check(
      [...this.rows.values()].filter((x) => x.state === 'accepted' || x.reserveT).length < 32,
      'Too many accepted offers',
    );
    if (r.reserveT) return;
    const t = randomId();
    r.reserveT = t;
    try {
      await this.options.storage.reserve({
        t,
        a: 1,
        source: r.sender,
        offer: r.offer,
        meta: r.meta,
      });
      if (!this.live() || r.state !== 'pending') {
        await this.options.storage.release(t);
        return;
      }
      this.options.files.send('Respond', {
        ...this.target(r.sender),
        offer: r.offer,
        accept: true,
      });
    } catch (error) {
      r.reserveT = undefined;
      throw error;
    }
  }
  reject(key: string): void {
    const r = this.find(key);
    check(r.state === 'pending');
    this.options.files.send('Respond', { ...this.target(r.sender), offer: r.offer, accept: false });
    this.stop(r);
    r.state = 'rejected';
    this.rememberCancelled(r);
    this.emit(r, 'rejected');
  }
  cancel(key: string): void {
    const r = this.find(key);
    if (!['preparing', 'pending', 'accepted'].includes(r.state)) return;
    if (r.state === 'preparing') {
      r.state = 'cancelled';
      this.stop(r);
      this.emit(r, 'cancelled');
      return;
    }
    if (this.live()) {
      const s = r.attempt?.session ?? this.pool.forPeer(this.remote(r));
      if (s?.ready && r.t)
        s.send({ op: 'cancel', q: randomId(), t: r.t, a: r.a, reason: 'cancelled' });
      this.options.files.send(r.state === 'pending' && r.file ? 'Withdraw' : 'Cancel', {
        ...this.target(this.remote(r)),
        offer: r.offer,
      });
    }
    r.state = 'cancelled';
    this.rememberCancelled(r);
    this.stop(r, 5);
    this.emit(r, 'cancelled');
  }
  private find(key: string): Offer {
    const r = [...this.rows.values()].find((x) => x.key === key);
    check(r, 'Unknown file transfer');
    return r;
  }
  private rememberCancelled(r: Offer): void {
    if (r.receipt?.state === 'received') return;
    const receipt: Receipt = {
      sender: r.sender,
      offer: r.offer,
      meta: r.meta,
      t: r.t ?? r.reserveT ?? randomId(),
      state: 'cancelled',
      outcome: 'verified',
      touchedAt: Date.now(),
    };
    void this.options.storage.saveReceipt(receipt).catch(() => {});
  }
  established(s: PeerSession): void {
    for (const r of this.rows.values())
      if (
        r.file &&
        r.state === 'accepted' &&
        sameEndpoint(r.receiver, s.peer) &&
        !r.attempt &&
        !r.q
      )
        this.push(r, s);
  }
  reservationFailed(offer: string, reason: string): void {
    const r = this.rows.get(offer);
    if (r?.state === 'accepted') this.fail(r, reason);
  }
  private push(r: Offer, s: PeerSession): void {
    if (!this.authorized(s.peer, r.offer) || r.attempt || r.q || r.paused) return;
    if ([...this.rows.values()].filter((x) => x.file && (x.q || x.attempt)).length >= 4) {
      this.fail(r, 'Upload slots busy; retry after another file finishes');
      return;
    }
    if (!r.t) {
      r.t = randomId();
      this.tBindings.set(r.t, r);
    }
    const now = performance.now();
    r.automatic = r.automatic.filter((t) => now - t < 600000);
    if (r.automatic.length >= 20) {
      this.fail(r, 'Automatic transfer retry limit reached');
      return;
    }
    r.automatic.push(now);
    r.a++;
    const q = randomId();
    r.q = q;
    const request: Request = { op: 'push', q, t: r.t, a: r.a, offer: r.offer, mode: 'full' };
    r.requestTimer = setTimeout(() => {
      r.q = undefined;
      this.fail(r, 'Peer did not accept the transfer request');
    }, 10000);
    s.send(request);
  }
  control(s: PeerSession, m: Exclude<Control, { op: 'hello' }>): void {
    if (!this.live()) return;
    if (m.op === 'push') {
      const pending = this.pendingRequests.get(s.id) ?? 0;
      if (pending >= 16 || [...this.pendingRequests.values()].reduce((a, b) => a + b, 0) >= 64) {
        s.send({ op: 'error', q: m.q, t: m.t, a: m.a, code: 'busy', retryAfterMs: 1000 });
        return;
      }
      this.pendingRequests.set(s.id, pending + 1);
      const work = (this.controlSerial.get(s.id) ?? Promise.resolve())
        .then(() => this.incomingPush(s, m))
        .catch(() => s.fail('protocol'))
        .finally(() => {
          this.pendingRequests.set(s.id, Math.max(0, (this.pendingRequests.get(s.id) ?? 1) - 1));
        });
      this.controlSerial.set(s.id, work);
      return;
    }
    const r = this.tBindings.get(m.t);
    if (m.op === 'cancel') {
      this.prune();
      if (this.cancellations.size >= 512) {
        s.fail('protocol');
        return;
      }
      s.send({ op: 'cancelled', q: m.q, t: m.t, a: m.a });
      this.cancellations.set(`${endpointKey(s.peer)}:${m.t}:${m.a}`, performance.now());
      if (r && sameEndpoint(s.peer, this.remote(r)) && m.a === r.a) this.cancel(r.key);
      return;
    }
    if (!r || !sameEndpoint(s.peer, this.remote(r)) || m.a !== r.a || m.q !== r.q) return;
    if (m.op === 'accepted') {
      check(
        r.file && r.state === 'accepted' && canonical(m.meta) === canonical(r.meta) && !r.attempt,
      );
      clearTimeout(r.requestTimer);
      const c = s.openTransfer(m.t, m.a);
      const a = this.attempt(r, s, c, {
        op: 'push',
        q: m.q,
        t: m.t,
        a: m.a,
        offer: r.offer,
        mode: 'full',
      });
      const open = () => {
        if (this.current(a))
          this.sendText(a, { op: 'bind', q: m.q, t: m.t, a: m.a, session: s.id, meta: r.meta });
      };
      c.onopen = open;
      if (c.readyState === 'open') open();
    } else if (m.op === 'outcome') {
      check(r.file && canonical(m.meta) === canonical(r.meta));
      clearTimeout(r.requestTimer);
      this.finishAttempt(r.attempt);
      r.q = undefined;
      this.emit(r, 'complete', r.meta.size);
    } else if (m.op === 'error') {
      clearTimeout(r.requestTimer);
      this.stop(r);
      this.fail(r, `Peer refused file transfer: ${m.code}`);
    }
  }
  private prune(): void {
    const now = performance.now();
    for (const [k, v] of this.qCache) if (now - v.at > 120000) this.qCache.delete(k);
    for (const [k, t] of this.cancellations) if (now - t > 120000) this.cancellations.delete(k);
  }
  private async incomingPush(s: PeerSession, m: Request): Promise<void> {
    this.prune();
    const key = `${endpointKey(s.peer)}:${s.id}:${m.q}`;
    const cache = this.qCache.get(key);
    if (cache) {
      check(cache.request === canonical(m));
      const row = this.rows.get(m.offer);
      if (row?.receipt && row.t === m.t)
        s.send({
          op: 'outcome',
          q: m.q,
          t: m.t,
          a: m.a,
          meta: row.meta,
          outcome: row.receipt.outcome,
        });
      else if (row && this.authorized(s.peer, row.offer)) s.send(cache.reply);
      else s.send({ op: 'error', q: m.q, t: m.t, a: m.a, code: 'denied' });
      return;
    }
    const reply = (response: Reply) => {
      if (this.qCache.size < 512)
        this.qCache.set(key, { request: canonical(m), reply: response, at: performance.now() });
      if (s.live) s.send(response);
    };
    const error = (code: string) =>
      reply({
        op: 'error',
        q: m.q,
        t: m.t,
        a: m.a,
        code,
        ...(code === 'busy' ? { retryAfterMs: 1000 } : {}),
      });
    const r = this.rows.get(m.offer);
    if (!r || !sameEndpoint(r.sender, s.peer) || r.file) {
      error('denied');
      return;
    }
    const bound = this.tBindings.get(m.t);
    if ((bound && bound !== r) || (r.t && r.t !== m.t)) {
      error('protocol');
      return;
    }
    if (r.receipt?.state === 'received' && r.t === m.t) {
      reply({ op: 'outcome', q: m.q, t: m.t, a: m.a, meta: r.meta, outcome: r.receipt.outcome });
      return;
    }
    if (!this.authorized(s.peer, r.offer) || !r.reserveT) {
      error('denied');
      return;
    }
    if (
      this.qCache.size >= 512 ||
      this.downloads >= 8 ||
      s.channels.size >= 8 ||
      this.pool.channelCount >= 32
    ) {
      error('busy');
      return;
    }
    if (m.a <= r.a || this.cancellations.has(`${endpointKey(s.peer)}:${m.t}:${m.a}`)) {
      error('stale');
      return;
    }
    if (r.attempt) this.finishAttempt(r.attempt);
    r.t = m.t;
    r.a = m.a;
    r.q = m.q;
    this.tBindings.set(m.t, r);
    await this.options.storage.release(r.reserveT);
    const have = await this.options.storage.reserve({
      t: m.t,
      a: m.a,
      source: r.sender,
      offer: r.offer,
      meta: r.meta,
    });
    if (!this.authorized(s.peer, r.offer) || !s.live || r.a !== m.a) {
      await this.options.storage.release(m.t);
      return;
    }
    // Reservation is installed before accepted, independent of transfer-channel ordering.
    this.downloads++;
    clearTimeout(r.requestTimer);
    r.requestTimer = setTimeout(() => {
      if (!r.attempt) {
        this.downloads--;
        r.q = undefined;
        void this.options.storage.release(m.t).catch(() => {});
        this.fail(r, 'Transfer channel did not bind');
      }
    }, 10000);
    (r as Offer & { held?: number[] }).held = have;
    reply({ op: 'accepted', q: m.q, t: m.t, a: m.a, mode: 'full', meta: r.meta });
  }
  channel(s: PeerSession, c: RTCDataChannel): void {
    const unbound = [...s.channels].filter(
      (x) => ![...this.rows.values()].some((r) => r.attempt?.channel === x),
    );
    if (unbound.length > 2) {
      c.close();
      s.badChannel();
      return;
    }
    const timeout = setTimeout(() => {
      c.close();
      s.badChannel();
    }, 10000);
    c.onmessage = (e) => {
      clearTimeout(timeout);
      try {
        check(typeof e.data === 'string' && utf8Length(e.data) <= 8192);
        const b = parseBind(e.data);
        check(b.op === 'bind');
        const r = this.tBindings.get(b.t);
        check(
          r &&
            !r.file &&
            r.q === b.q &&
            r.a === b.a &&
            !r.attempt &&
            this.authorized(s.peer, r.offer) &&
            b.session === s.id &&
            c.label === `t:${b.t}:${b.a}` &&
            canonical(b.meta) === canonical(r.meta),
        );
        clearTimeout(r.requestTimer);
        const a = this.attempt(r, s, c, {
          op: 'push',
          q: b.q,
          t: b.t,
          a: b.a,
          offer: r.offer,
          mode: 'full',
        });
        a.held = new Set((r as Offer & { held?: number[] }).held ?? []);
        a.bound = true;
        this.sendText(a, { op: 'bound', q: b.q, t: b.t, a: b.a });
        check(this.authorized(s.peer, r.offer));
        a.have = heldRanges([...a.held].sort((x, y) => x - y));
        this.sendFrame(a, { type: 'ready', have: a.have });
        a.ready = true;
        this.emit(r, 'transferring', this.heldBytes(a));
        this.inactivity(a);
        if (a.held.size === Math.ceil(r.meta.size / PIECE)) void this.verify(a);
      } catch {
        c.close();
        s.badChannel();
      }
    };
  }
  private attempt(r: Offer, s: PeerSession, c: RTCDataChannel, request: Request): Attempt {
    const a: Attempt = {
      record: r,
      session: s,
      channel: c,
      request,
      bound: false,
      ready: false,
      active: true,
      received: 0,
      lastIndex: -1,
      held: new Set(),
      have: [],
      sent: 0,
      stored: 0,
      next: 0,
      serial: Promise.resolve(),
      queued: 0,
    };
    r.attempt = a;
    a.timer = setTimeout(() => this.abort(a, 3, 'Transfer binding timed out'), 10000);
    c.onmessage = (e) => {
      if (!this.current(a)) return;
      if (!a.bound) {
        try {
          check(typeof e.data === 'string');
          const b = parseBind(e.data);
          check(b.op === 'bound' && b.q === request.q && b.t === request.t && b.a === request.a);
          a.bound = true;
          this.inactivity(a);
        } catch {
          this.abort(a, 3, 'Invalid channel binding');
        }
        return;
      }
      if (!(e.data instanceof ArrayBuffer) || !s.admitFrame()) {
        this.abort(a, 3, 'Invalid transfer frame');
        return;
      }
      if (
        e.data.byteLength > s.maxFrame ||
        a.queued >= 64 ||
        this.queuedBytes + e.data.byteLength > 8 * 1024 ** 2 ||
        (!r.file && !this.ownerDownload.take(e.data.byteLength))
      ) {
        this.abort(a, 9, 'Receive buffer or rate limit');
        return;
      }
      a.queued++;
      this.queuedBytes += e.data.byteLength;
      const data = e.data;
      a.serial = a.serial
        .then(() => this.frame(a, decodeFrame(data, Math.ceil(r.meta.size / PIECE), s.maxFrame)))
        .catch((error) => this.abort(a, 3, error instanceof Error ? error.message : String(error)))
        .finally(() => {
          a.queued--;
          this.queuedBytes -= data.byteLength;
        });
    };
    c.onclose = () => {
      if (a.terminal) this.finishAttempt(a);
      else if (this.current(a)) {
        this.finishAttempt(a);
        s.fail('failed');
      }
    };
    c.onerror = () => {
      if (this.current(a)) s.fail('failed');
    };
    return a;
  }
  private current(a: Attempt): boolean {
    return (
      a.active &&
      this.live() &&
      a.session.live &&
      a.record.attempt === a &&
      a.record.a === a.request.a
    );
  }
  private sendText(a: Attempt, b: Bind): void {
    check(this.current(a));
    a.channel.send(JSON.stringify(b));
  }
  private sendFrame(a: Attempt, f: Frame): void {
    check(this.current(a) && a.channel.readyState === 'open');
    a.channel.send(encodeFrame(f));
  }
  private heldBytes(a: Attempt): number {
    return [...a.held].reduce((n, i) => n + pieceLength(a.record.meta.size, i), 0);
  }
  private async frame(a: Attempt, f: Frame): Promise<void> {
    if (!this.current(a)) return;
    const r = a.record;
    if (f.type === 'terminalAck') {
      check(a.terminal === f.terminalType);
      this.finishAttempt(a);
      return;
    }
    if (f.type === 'abort') {
      this.sendFrame(a, { type: 'terminalAck', terminalType: 4 });
      a.terminal = 4;
      this.drain(a, true);
      if (!r.receipt) this.fail(r, `Peer stopped file transfer (${f.reason})`);
      return;
    }
    if (f.type === 'complete') {
      check(r.file && (a.ready || r.state === 'received'));
      this.sendFrame(a, { type: 'terminalAck', terminalType: 3 });
      a.terminal = 3;
      this.emit(r, 'complete', r.meta.size);
      this.drain(a, true);
      return;
    }
    // The hub receipt may outrun the final ordered data-channel credits.
    if (r.file && r.state === 'received') return;
    check(!a.terminal && r.state === 'accepted');
    if (r.file) {
      if (f.type === 'ready') {
        check(!a.ready && this.uploads < 4);
        a.ready = true;
        a.have = f.have;
        this.uploads++;
        this.emit(r, 'transferring');
        this.inactivity(a);
        this.outgoing.add(a);
        this.pump();
      } else {
        check(f.type === 'stored' && a.ready && f.count >= a.stored && f.count <= a.sent);
        if (f.count > a.stored) {
          a.stored = f.count;
          r.retry = 0;
          this.inactivity(a);
          this.emit(r, 'transferring', Math.min(r.meta.size, f.count * PIECE));
          this.pump();
        }
      }
    } else {
      check(
        f.type === 'piece' &&
          a.ready &&
          f.index > a.lastIndex &&
          !a.have.some(([x, y]) => f.index >= x && f.index < y) &&
          f.bytes.byteLength === pieceLength(r.meta.size, f.index),
      );
      a.lastIndex = f.index;
      const durable = await this.options.storage.put(a.request.t, a.request.a, f.index, f.bytes);
      if (!this.current(a)) return;
      a.held.add(f.index);
      a.received++;
      if (durable) {
        r.retry = 0;
        this.inactivity(a);
      }
      this.emit(r, 'transferring', this.heldBytes(a));
      if (a.received % 16 === 0) this.sendFrame(a, { type: 'stored', count: a.received });
      if (a.held.size === Math.ceil(r.meta.size / PIECE)) await this.verify(a);
    }
  }
  private async verify(a: Attempt): Promise<void> {
    const r = a.record;
    if (!this.current(a) || r.receipt) return;
    this.emit(r, 'verifying');
    if (!r.verifyStart) r.verifyStart = performance.now();
    clearTimeout(a.timer);
    a.timer = setTimeout(
      () => this.abort(a, 7, 'File verification timed out'),
      Math.max(0, 300000 - (performance.now() - r.verifyStart)),
    );
    try {
      const blob = await this.options.storage.verify(a.request.t, a.request.a);
      if (!this.current(a) || r.state !== 'accepted') return;
      const receipt: Receipt = {
        sender: r.sender,
        offer: r.offer,
        meta: r.meta,
        t: a.request.t,
        state: 'received',
        outcome: 'verified',
        touchedAt: Date.now(),
      };
      await this.options.storage.saveReceipt(receipt);
      if (!this.current(a) || r.state !== 'accepted') return;
      r.receipt = receipt;
      r.blob = blob;
      this.sendFrame(a, { type: 'stored', count: a.received });
      this.options.files.send('Outcome', { ...this.target(r.sender), offer: r.offer });
      this.sendFrame(a, { type: 'complete', outcome: 1 });
      a.terminal = 3;
      this.emit(r, 'complete', r.meta.size);
      this.drain(a);
    } catch (error) {
      if (this.current(a))
        this.abort(
          a,
          error instanceof Error && /integrity/.test(error.message) ? 1 : 2,
          error instanceof Error ? error.message : String(error),
        );
    }
  }
  private pump(): void {
    if (this.pumping) return;
    this.pumping = true;
    void (async () => {
      try {
        while (this.live() && this.outgoing.size) {
          let progress = false;
          for (const a of this.outgoing) {
            if (!this.current(a) || a.terminal) {
              this.outgoing.delete(a);
              continue;
            }
            const r = a.record;
            check(r.file);
            const key = endpointKey(a.session.peer);
            const bucket = this.peerUpload.get(key) ?? new Bucket(4 * 1024 ** 2, 1024 ** 2);
            this.peerUpload.set(key, bucket);
            for (let count = 0; count < 4; count++) {
              const n = Math.ceil(r.meta.size / PIECE);
              while (a.next < n && a.have.some(([x, y]) => a.next >= x && a.next < y)) a.next++;
              if (a.next >= n) {
                this.outgoing.delete(a);
                break;
              }
              if (a.channel.bufferedAmount >= 262144) a.backpressured = true;
              if (a.backpressured && a.channel.bufferedAmount < 65536) a.backpressured = false;
              if (
                a.sent - a.stored >= 64 ||
                a.backpressured ||
                this.pool.bufferedBytes + PIECE + 5 > 8 * 1024 ** 2 ||
                !this.ownerUpload.take(PIECE) ||
                !bucket.take(PIECE)
              )
                break;
              if (!this.authorized(a.session.peer, r.offer)) break;
              const index = a.next;
              const bytes = await r.file
                .slice(index * PIECE, Math.min(r.meta.size, (index + 1) * PIECE))
                .arrayBuffer();
              if (!this.current(a) || !this.authorized(a.session.peer, r.offer)) break;
              check(bytes.byteLength === pieceLength(r.meta.size, index));
              this.sendFrame(a, { type: 'piece', index, bytes });
              a.sent++;
              a.next++;
              progress = true;
            }
          }
          if (!progress) {
            setTimeout(() => {
              this.pumping = false;
              this.pump();
            }, 20);
            return;
          }
          await new Promise<void>((resolve) => setTimeout(resolve, 0));
        }
      } catch (error) {
        for (const a of this.outgoing)
          this.abort(a, 4, error instanceof Error ? error.message : String(error));
      }
      this.pumping = false;
    })();
  }
  private inactivity(a: Attempt): void {
    clearTimeout(a.timer);
    a.timer = setTimeout(
      () => this.abort(a, 7, 'File transfer timed out; partial data retained'),
      30000,
    );
  }
  private drain(a: Attempt, acknowledged = false): void {
    clearTimeout(a.timer);
    a.drain = setTimeout(() => this.finishAttempt(a), 5000);
    if (acknowledged) {
      const close = () => {
        if (a.channel.bufferedAmount === 0) this.finishAttempt(a);
        else if (a.active) setTimeout(close, 20);
      };
      setTimeout(close, 0);
    }
  }
  private abort(a: Attempt, reason: number, message: string): void {
    if (!a.active || a.terminal) return;
    try {
      if (this.current(a) && a.bound) this.sendFrame(a, { type: 'abort', reason });
    } catch {
      /* The GMCP grant remains separately fenced. */
    }
    a.terminal = 4;
    this.fail(a.record, message);
    if (!a.record.file) void this.options.storage.release(a.request.t).catch(() => {});
    this.outgoing.delete(a);
    this.drain(a);
  }
  private finishAttempt(a?: Attempt): void {
    if (!a?.active) return;
    a.active = false;
    clearTimeout(a.timer);
    clearTimeout(a.drain);
    this.outgoing.delete(a);
    const r = a.record;
    if (r.file && a.ready) this.uploads--;
    else if (!r.file) this.downloads = Math.max(0, this.downloads - 1);
    if (r.attempt === a) {
      r.attempt = undefined;
      r.q = undefined;
    }
    a.channel.close();
    this.options.changed();
  }
  private stop(r: Offer, reason?: number): void {
    clearTimeout(r.retryTimer);
    clearTimeout(r.requestTimer);
    if (reason && r.attempt) this.abort(r.attempt, reason, 'Transfer cancelled');
    else this.finishAttempt(r.attempt);
    r.q = undefined;
    for (const t of [r.t, r.reserveT]) if (t) void this.options.storage.release(t).catch(() => {});
  }
  lost(s: PeerSession, retry: boolean): void {
    for (const r of this.rows.values()) {
      if (!sameEndpoint(this.remote(r), s.peer) || r.state !== 'accepted') continue;
      const old = r.attempt;
      this.finishAttempt(old);
      clearTimeout(r.requestTimer);
      r.q = undefined;
      if (r.t && !r.file) void this.options.storage.release(r.t).catch(() => {});
      if (!r.file) continue;
      if (!retry || r.retry >= 3 || !this.live()) {
        this.fail(
          r,
          old && old.next >= Math.ceil(r.meta.size / PIECE)
            ? 'Receipt unknown'
            : 'File transfer paused; connection unavailable',
        );
        continue;
      }
      const delay = [1000, 3000, 9000][r.retry++] + Math.random() * 500;
      this.emit(r, 'connecting');
      r.retryTimer = setTimeout(() => {
        if (this.authorized(s.peer, r.offer)) this.pool.reserve(s.peer, r.offer);
      }, delay);
    }
  }
  async save(key: string): Promise<void> {
    const r = this.find(key);
    check(r.receipt && !r.saving);
    r.saving = true;
    r.saveError = undefined;
    this.options.changed();
    try {
      const generation = this.generation;
      const blob = r.blob ?? (await this.options.storage.readForExport(r.sender, r.offer));
      r.receipt = await exportDownload(
        this.options.storage,
        r.receipt,
        blob,
        () => !this.disposed && generation === this.generation,
      );
      r.blob = undefined;
      if (r.t) await this.options.storage.releaseSaved(r.t);
    } catch (error) {
      r.saveError = `Downloaded; save failed: ${error instanceof Error ? error.message : String(error)}`;
    } finally {
      r.saving = false;
      this.options.changed();
    }
  }
  retry(key: string): void {
    const r = this.find(key);
    check(
      r.file && r.paused && this.authorized(r.receiver, r.offer),
      'File offer is no longer authorized',
    );
    r.paused = false;
    r.retry = 0;
    this.emit(r, 'connecting');
    const s = this.pool.forPeer(r.receiver);
    if (s?.ready) this.push(r, s);
    else this.pool.reserve(r.receiver, r.offer);
  }
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.generation++;
    for (const off of this.off) off();
    for (const r of this.rows.values()) this.stop(r);
  }
}
