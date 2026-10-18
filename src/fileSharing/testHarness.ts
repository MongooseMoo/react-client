import type { WirePort } from './protocol';
import {
  endpointKey,
  check,
  id,
  player,
  integer,
  shape,
  record,
  strictJson,
  validName,
  validatePeer,
  validateFiles,
  validateSdp,
  randomId,
  sameEndpoint,
  type Endpoint,
  type PeerInbound,
  type PeerOutbound,
  type FilesInbound,
  type FilesOutbound,
  type Ready,
  type OfferState,
} from './protocol';
/** The existing v1 testHarness pattern: asynchronous hub and transport seams, runner-independent. */
const portErrors: unknown[] = [];
export const takePortErrors = (): unknown[] => portErrors.splice(0);
export class MemoryPort<I, O> implements WirePort<I, O> {
  readonly sent: { kind: keyof O; data: O[keyof O] & Record<string, unknown> }[] = [];
  private readonly listeners = new Map<keyof I, Set<(v: unknown) => void>>();
  post?: (kind: keyof O, data: O[keyof O]) => void;
  readonly errors: unknown[] = [];
  constructor(private readonly validate?: (kind: keyof I & string, value: unknown) => I[keyof I]) {}
  send<K extends keyof O & string>(kind: K, data: O[K]): void {
    this.sent.push({ kind, data: data as O[keyof O] & Record<string, unknown> });
    this.post?.(kind, data);
  }
  on<K extends keyof I & string>(kind: K, fn: (v: I[K]) => void): () => void {
    const set = this.listeners.get(kind) ?? new Set();
    this.listeners.set(kind, set);
    set.add(fn as (v: unknown) => void);
    return () => {
      set.delete(fn as (v: unknown) => void);
    };
  }
  deliver<K extends keyof I & string>(kind: K, data: I[K]): void {
    const parsed = this.validate ? this.validate(kind, strictJson(JSON.stringify(data))) : data;
    for (const fn of this.listeners.get(kind) ?? []) {
      try {
        fn(parsed);
      } catch (error) {
        this.errors.push(error);
        portErrors.push(error);
      }
    }
  }
}

type HubPeer = {
  connection: string;
  peer: MemoryPort<PeerInbound, PeerOutbound>;
  files: MemoryPort<FilesInbound, FilesOutbound>;
  player: string;
  ready?: Ready;
  legacy: boolean;
  seq: number;
};
type HubOffer = {
  sender: Endpoint;
  receiver: Endpoint;
  offer: string;
  id: string;
  name: string;
  size: number;
  state: OfferState;
  expiresAt: number;
};
/** Phase-1 reference hub, independent of OfferTable/SessionPool and their state machines. */
export class Phase1Hub {
  readonly hub = randomId();
  readonly players = new Map<string, HubPeer>();
  readonly offers = new Map<string, HubOffer>();
  readonly sessions = new Map<
    string,
    {
      id: string;
      a: Endpoint;
      b: Endpoint;
      initiator: Endpoint;
      connected: Set<string>;
      connect?: string;
      answer?: string;
    }
  >();
  private readonly blocked = new Set<string>();
  private readonly usedEndpoints = new Set<string>();
  private readonly requests = new Map<string, { raw: string; until: number }>();
  private readonly reservedRequests = new Map<string, string>();
  dropOutcome = false;
  outcomeErrors: string[] = [];
  peer(player: string, legacy = false): HubPeer {
    const p: HubPeer = {
      connection: randomId(),
      player,
      legacy,
      peer: new MemoryPort(validatePeer),
      files: new MemoryPort(validateFiles),
      seq: 0,
    };
    this.players.set(player, p);
    p.peer.post = (kind, data) =>
      queueMicrotask(() => this.receiveRaw(p, false, kind, JSON.stringify(data)));
    p.files.post = (kind, data) =>
      queueMicrotask(() => this.receiveRaw(p, true, kind, JSON.stringify(data)));
    return p;
  }
  receiveRaw(p: HubPeer, files: boolean, kind: string, raw: string): void {
    let parsed: unknown;
    try {
      parsed = strictJson(raw);
      validateHubInput(files, kind, parsed);
    } catch {
      const req = record(parsed) && id(parsed.req) ? String(parsed.req) : randomId();
      this.error(p, files, req, kind, 'malformed');
      return;
    }
    if (files)
      this.fileCommand(
        p,
        kind as keyof FilesOutbound,
        parsed as FilesOutbound[keyof FilesOutbound],
      );
    else
      this.peerCommand(p, kind as keyof PeerOutbound, parsed as PeerOutbound[keyof PeerOutbound]);
  }
  private pair(a: string, b: string): string {
    return JSON.stringify([a, b].sort());
  }
  private allowed(a: Endpoint, b: Endpoint): boolean {
    return (
      !this.blocked.has(this.pair(a.player, b.player)) &&
      sameEndpoint(this.players.get(a.player)?.ready?.self, a) &&
      sameEndpoint(this.players.get(b.player)?.ready?.self, b)
    );
  }
  private error(
    p: HubPeer,
    files: boolean,
    req: string,
    about: string,
    code: string,
    offer?: string,
  ): void {
    const e = {
      req,
      about,
      code,
      refs: offer ? { offer } : {},
      ...(['busy', 'rate'].includes(code) ? { retryAfterMs: 1000 } : {}),
    };
    if (files) p.files.deliver('Error', e);
    else p.peer.deliver('Error', e);
  }
  private peerCommand(
    p: HubPeer,
    kind: keyof PeerOutbound,
    m: PeerOutbound[keyof PeerOutbound],
  ): void {
    if (kind === 'Hello' || kind === 'Reserve') {
      const state = this.cache(p, kind, m, kind === 'Hello');
      if (state === 'conflict') {
        this.error(p, false, m.req, kind, 'conflict');
        return;
      }
      if (state === 'replay' && kind === 'Hello') {
        if (p.ready?.req === m.req) p.peer.deliver('Ready', p.ready);
        else this.error(p, false, m.req, kind, 'stale-endpoint');
        return;
      }
    }
    if (kind === 'Hello' && 'endpoint' in m) {
      if (this.usedEndpoints.has(m.endpoint)) {
        this.error(p, false, m.req, kind, 'conflict');
        return;
      }
      this.usedEndpoints.add(m.endpoint);
      if (p.ready) this.end(p, 'superseded');
      p.ready = {
        req: m.req,
        hub: this.hub,
        self: { player: p.player, endpoint: m.endpoint, epoch: randomId() },
        peer: 1,
        files: 1,
        data: 1,
        features: ['base'],
        maxReceiveSize: m.maxReceiveSize,
        canShare: false,
        leaseMs: 30000,
        heartbeatMs: 10000,
      };
      p.peer.deliver('Ready', p.ready);
      this.lease(p);
      return;
    }
    if (!p.ready) {
      this.error(p, false, m.req, kind, 'stale-endpoint');
      return;
    }
    if (kind === 'Capabilities' && 'to' in m) {
      const t = this.players.get(m.to);
      const online = Boolean(t && !this.blocked.has(this.pair(p.player, m.to)));
      const ready = online ? t?.ready : undefined;
      p.peer.deliver('Capabilities', {
        req: m.req,
        to: m.to,
        online,
        ...(ready ? { target: ready.self } : {}),
        peer: ready ? 1 : 0,
        files: ready ? 1 : 0,
        data: ready ? 1 : 0,
        features: ready ? ['base'] : [],
        maxReceiveSize: ready?.maxReceiveSize ?? 0,
        legacyV1: Boolean(online && !ready && t?.legacy),
      });
      return;
    }
    if (
      !('target' in m) ||
      m.to !== m.target.player ||
      (!this.allowed(p.ready.self, m.target) && kind !== 'Close')
    ) {
      this.error(p, false, m.req, kind, 'unavailable');
      return;
    }
    const target = this.players.get(m.to);
    if (!target?.ready) return;
    if (kind === 'Reserve' && 'auth' in m) {
      const o = this.offers.get(m.auth.offer);
      if (
        o?.state !== 'accepted' ||
        ![endpointKey(o.sender), endpointKey(o.receiver)].includes(endpointKey(p.ready.self)) ||
        ![endpointKey(o.sender), endpointKey(o.receiver)].includes(endpointKey(m.target))
      ) {
        this.error(p, false, m.req, kind, 'denied');
        return;
      }
      const key = this.pair(endpointKey(p.ready.self), endpointKey(m.target));
      let s = this.sessions.get(key);
      if (
        this.replayed(p, kind, m) &&
        (!s || this.reservedRequests.get(this.replayKey(p, m)) !== s.id)
      ) {
        this.error(p, false, m.req, kind, 'closed');
        return;
      }
      if (!s) {
        s = {
          id: randomId(),
          a: p.ready.self,
          b: m.target,
          initiator: p.ready.self,
          connected: new Set(),
        };
        this.sessions.set(key, s);
      }
      this.reservedRequests.set(this.replayKey(p, m), s.id);
      for (const end of [p, target]) {
        if (this.replayed(p, kind, m) && end !== p) continue;
        const remote = end === p ? target : p;
        end.peer.deliver('Reserved', {
          ...(end === p ? { req: m.req } : {}),
          event: randomId(),
          peer: remote.ready?.self as Endpoint,
          session: s.id,
          initiator: s.initiator,
          authorization: m.auth,
          capabilities: {
            data: 1,
            features: ['base'],
            maxReceiveSize: remote.ready?.maxReceiveSize ?? 0,
          },
          negotiationMs: 30000,
        });
      }
      return;
    }
    if (!('session' in m)) return;
    const entry = [...this.sessions].find(([, s]) => s.id === m.session);
    if (!entry && kind === 'Close') {
      p.peer.deliver('Ack', { req: m.req, about: kind, refs: { session: m.session } });
      return;
    }
    if (!entry) {
      this.error(p, false, m.req, kind, 'closed');
      return;
    }
    const [key, s] = entry;
    if (kind === 'Connect' && 'sdp' in m) {
      if (!sameEndpoint(p.ready.self, s.initiator) || (s.connect && s.connect !== m.sdp)) {
        this.error(p, false, m.req, kind, 'conflict');
        return;
      }
      if (!s.connect) {
        s.connect = m.sdp;
        target.peer.deliver('Connect', {
          req: m.req,
          from: p.ready.self,
          session: s.id,
          sdp: m.sdp,
        });
      }
    } else if (kind === 'Answer' && 'sdp' in m) {
      if (sameEndpoint(p.ready.self, s.initiator) || !s.connect) {
        this.error(p, false, m.req, kind, 'denied');
        return;
      }
      if (!s.answer) {
        s.answer = m.sdp;
        target.peer.deliver('Answer', {
          req: m.req,
          from: p.ready.self,
          session: s.id,
          sdp: m.sdp,
        });
      }
    } else if (kind === 'Candidate' && ('candidate' in m || 'end' in m))
      target.peer.deliver('Candidate', {
        req: m.req,
        from: p.ready.self,
        session: s.id,
        ...('candidate' in m ? { candidate: m.candidate } : { end: true as const }),
      });
    else if (kind === 'Connected') s.connected.add(endpointKey(p.ready.self));
    else if (kind === 'Close') {
      this.sessions.delete(key);
      for (const end of [p, target])
        end.peer.deliver('Closed', {
          event: randomId(),
          peer: (end === p ? target : p).ready?.self as Endpoint,
          session: s.id,
          reason: 'reason' in m ? m.reason : 'failed',
        });
    }
    p.peer.deliver('Ack', { req: m.req, about: kind, refs: { session: s.id } });
  }
  private fileCommand(
    p: HubPeer,
    kind: keyof FilesOutbound,
    m: FilesOutbound[keyof FilesOutbound],
  ): void {
    if (kind === 'Offer' || kind === 'Respond') {
      const c = this.cache(p, kind, m);
      if (c === 'conflict') {
        this.error(p, true, m.req, kind, 'conflict', m.offer);
        return;
      }
    }
    if (!p.ready || !this.allowed(p.ready.self, m.target) || m.to !== m.target.player) {
      this.error(p, true, m.req, kind, 'unavailable', m.offer);
      return;
    }
    const target = this.players.get(m.to);
    if (!target?.ready) return;
    if (kind === 'Offer' && 'id' in m) {
      let o = this.offers.get(m.offer);
      if (
        o &&
        (o.id !== m.id ||
          o.size !== m.size ||
          o.name !== m.name ||
          !sameEndpoint(o.sender, p.ready.self) ||
          !sameEndpoint(o.receiver, m.target))
      ) {
        this.error(p, true, m.req, kind, 'conflict', m.offer);
        return;
      }
      if (!o) {
        if (m.size > target.ready.maxReceiveSize) {
          this.error(p, true, m.req, kind, 'limit', m.offer);
          return;
        }
        o = {
          sender: p.ready.self,
          receiver: m.target,
          offer: m.offer,
          id: m.id,
          name: m.name,
          size: m.size,
          state: 'pending',
          expiresAt: Date.now() + 300000,
        };
        this.offers.set(m.offer, o);
        target.files.deliver('Offer', {
          req: m.req,
          from: p.ready.self,
          offer: m.offer,
          id: m.id,
          name: m.name,
          size: m.size,
          expiresAt: o.expiresAt,
        });
      }
      if (o.state !== 'pending') {
        this.stateTo(p, o);
        return;
      }
      p.files.deliver('Offered', {
        req: m.req,
        offer: m.offer,
        target: m.target,
        expiresAt: o.expiresAt,
      });
      return;
    }
    const o = this.offers.get(m.offer);
    if (!o) {
      this.error(p, true, m.req, kind, 'unknown', m.offer);
      return;
    }
    const sender = sameEndpoint(o.sender, p.ready.self);
    const receiver = sameEndpoint(o.receiver, p.ready.self);
    if ((!sender && !receiver) || !sameEndpoint(sender ? o.receiver : o.sender, m.target)) {
      this.error(p, true, m.req, kind, 'denied', m.offer);
      return;
    }
    if (kind === 'Respond' && this.replayed(p, kind, m)) {
      this.stateTo(p, o);
      p.files.deliver('Ack', { req: m.req, about: kind, refs: { offer: m.offer } });
      return;
    }
    if (kind === 'Respond' && 'accept' in m && receiver && o.state === 'pending')
      o.state = m.accept ? 'accepted' : 'rejected';
    else if (kind === 'Withdraw' && sender && o.state === 'pending') o.state = 'withdrawn';
    else if (kind === 'Cancel' && (o.state === 'accepted' || (receiver && o.state === 'pending')))
      o.state = o.state === 'pending' ? 'rejected' : 'cancelled';
    else if (kind === 'Outcome' && receiver && (o.state === 'accepted' || o.state === 'received')) {
      if (this.dropOutcome) return;
      const code = this.outcomeErrors.shift();
      if (code) {
        this.error(p, true, m.req, kind, code, m.offer);
        return;
      }
      o.state = 'received';
    } else {
      this.error(p, true, m.req, kind, 'state', m.offer);
      return;
    }
    o.expiresAt = Date.now() + 86400000;
    this.state(o);
    p.files.deliver('Ack', { req: m.req, about: kind, refs: { offer: m.offer } });
  }
  private state(o: HubOffer): void {
    for (const e of [o.sender, o.receiver])
      this.players.get(e.player)?.files.deliver('OfferState', {
        event: randomId(),
        offer: o.offer,
        sender: o.sender,
        receiver: o.receiver,
        state: o.state,
        expiresAt: o.expiresAt,
      });
  }
  private stateTo(p: HubPeer, o: HubOffer): void {
    p.files.deliver('OfferState', {
      event: randomId(),
      offer: o.offer,
      sender: o.sender,
      receiver: o.receiver,
      state: o.state,
      expiresAt: o.expiresAt,
    });
  }
  private replayKey(p: HubPeer, m: { req: string }, hello = false): string {
    return `${p.connection}:${hello ? 'hello' : p.ready ? endpointKey(p.ready.self) : 'absent'}:${m.req}`;
  }
  private readonly duplicates = new Set<string>();
  private cache(
    p: HubPeer,
    kind: string,
    m: { req: string },
    hello = false,
  ): 'fresh' | 'replay' | 'conflict' {
    const key = this.replayKey(p, m, hello);
    const raw = canonicalRequest([kind, m]);
    const old = this.requests.get(key);
    if (old && old.until > Date.now()) {
      if (old.raw !== raw) return 'conflict';
      this.duplicates.add(key);
      return 'replay';
    }
    this.requests.set(key, { raw, until: Date.now() + 120000 });
    return 'fresh';
  }
  private replayed(p: HubPeer, _kind: string, m: { req: string }): boolean {
    return this.duplicates.has(this.replayKey(p, m));
  }
  lease(p: HubPeer): void {
    if (p.ready)
      p.peer.deliver('Lease', {
        event: randomId(),
        hub: this.hub,
        self: p.ready.self,
        seq: ++p.seq,
        leaseMs: 30000,
      });
  }
  end(p: HubPeer, reason: 'superseded' | 'identity' | 'shutdown' | 'overload'): void {
    if (!p.ready) return;
    const self = p.ready.self;
    for (const o of this.offers.values())
      if (
        ['pending', 'accepted'].includes(o.state) &&
        (sameEndpoint(o.sender, self) || sameEndpoint(o.receiver, self))
      ) {
        o.state = 'revoked';
        this.state(o);
      }
    this.closePairs(self, 'offline');
    p.peer.deliver('End', { event: randomId(), self, reason });
    p.ready = undefined;
  }
  gag(a: string, b: string): void {
    this.blocked.add(this.pair(a, b));
    for (const player of [a, b]) {
      const local = this.players.get(player);
      const remote = this.players.get(player === a ? b : a);
      if (local?.ready && remote?.ready)
        local.files.deliver('Revoke', {
          event: randomId(),
          peer: remote.ready.self,
          scope: 'peer',
          reason: 'policy',
        });
    }
    for (const o of this.offers.values())
      if (
        this.pair(o.sender.player, o.receiver.player) === this.pair(a, b) &&
        ['pending', 'accepted'].includes(o.state)
      ) {
        o.state = 'revoked';
        this.state(o);
      }
    const endpoint = this.players.get(a)?.ready?.self;
    if (endpoint) this.closePairs(endpoint, 'revoked', b);
  }
  private closePairs(endpoint: Endpoint, reason: string, onlyPlayer?: string): void {
    for (const [key, s] of this.sessions) {
      if (!sameEndpoint(s.a, endpoint) && !sameEndpoint(s.b, endpoint)) continue;
      const other = sameEndpoint(s.a, endpoint) ? s.b : s.a;
      if (onlyPlayer && other.player !== onlyPlayer) continue;
      this.sessions.delete(key);
      for (const [self, peer] of [
        [endpoint, other],
        [other, endpoint],
      ])
        this.players
          .get(self.player)
          ?.peer.deliver('Closed', { event: randomId(), peer, session: s.id, reason });
    }
  }
}
/** Hub ingress schemas are separate from its offer/session state machines. */
function validateHubInput(files: boolean, kind: string, v: unknown): void {
  const endpoint = shape({ player, endpoint: id, epoch: id });
  const target = { req: id, to: player, target: endpoint };
  const session = { ...target, session: id };
  const equal = (expected: unknown) => (x: unknown) => x === expected;
  const schemas: Record<string, (v: unknown) => boolean> = files
    ? {
        Offer: shape({
          ...target,
          offer: id,
          id: (x) => typeof x === 'string' && /^[a-f0-9]{64}$/.test(x),
          name: validName,
          size: integer(0, 104857600),
        }),
        Respond: shape({ ...target, offer: id, accept: (x) => typeof x === 'boolean' }),
        Cancel: shape({ ...target, offer: id }),
        Withdraw: shape({ ...target, offer: id }),
        Outcome: shape({ ...target, offer: id }),
      }
    : {
        Hello: shape({
          req: id,
          endpoint: id,
          peer: equal(1),
          files: equal(1),
          data: equal(1),
          features: (x) => Array.isArray(x) && x.length === 1 && x[0] === 'base',
          maxReceiveSize: integer(0, 104857600),
        }),
        Capabilities: shape({ req: id, to: player }),
        Reserve: shape({
          ...target,
          purpose: equal('files'),
          auth: shape({ kind: equal('offer'), offer: id }),
        }),
        Connect: shape({ ...session, sdp: (x) => typeof x === 'string' }),
        Answer: shape({ ...session, sdp: (x) => typeof x === 'string' }),
        Candidate: shape(session, {
          candidate: shape(
            { candidate: (x) => typeof x === 'string' && x.length > 0 && x.length <= 2048 },
            {
              sdpMid: (x) => typeof x === 'string',
              sdpMLineIndex: integer(0, 15),
              usernameFragment: (x) => typeof x === 'string',
            },
          ),
          end: equal(true),
        }),
        Connected: shape(session),
        Close: shape({
          ...session,
          reason: (x) => ['done', 'cancelled', 'failed', 'protocol'].includes(String(x)),
        }),
      };
  check(Object.hasOwn(schemas, kind) && schemas[kind](v));
  check(record(v));
  if (!files && (kind === 'Connect' || kind === 'Answer')) validateSdp(String(v.sdp));
  if (!files && kind === 'Candidate') {
    check(Boolean(v.candidate) !== Boolean(v.end));
    if (record(v.candidate))
      check(v.candidate.sdpMid !== undefined || v.candidate.sdpMLineIndex !== undefined);
  }
}
function canonicalRequest(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalRequest).join(',')}]`;
  if (value && typeof value === 'object')
    return `{${Object.entries(value)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([k, v]) => `${JSON.stringify(k)}:${canonicalRequest(v)}`)
      .join(',')}}`;
  return JSON.stringify(value);
}

/** Reliable, ordered RTC-shaped test network; channels are independent ordered streams. */
export class RtcNetwork {
  readonly pcs: TestPC[] = [];
  readonly sent: { channel: TestChannel; data: string | ArrayBuffer }[] = [];
  tap: (
    channel: TestChannel,
    data: string | ArrayBuffer,
  ) => 'pass' | 'drop' | 'hold' | ArrayBuffer = () => 'pass';
  private readonly held: (() => void)[] = [];
  create = (): RTCPeerConnection => {
    const pc = new TestPC(this, this.pcs.length);
    this.pcs.push(pc);
    return pc as unknown as RTCPeerConnection;
  };
  release(): void {
    for (const f of this.held.splice(0)) f();
  }
  post(channel: TestChannel, data: string | ArrayBuffer): void {
    this.sent.push({ channel, data });
    const verdict = this.tap(channel, data);
    if (verdict === 'drop') return;
    const send = () =>
      setTimeout(() => {
        if (channel.readyState === 'open')
          channel.other?.message(typeof verdict === 'string' ? data : verdict);
      }, 0);
    if (verdict === 'hold') this.held.push(send);
    else send();
  }
}
class TestChannel extends EventTarget {
  other?: TestChannel;
  readyState: RTCDataChannelState = 'connecting';
  binaryType = 'arraybuffer';
  bufferedAmount = 0;
  ordered = true;
  maxRetransmits = null;
  maxPacketLifeTime = null;
  negotiated = false;
  onopen?: (e: Event) => void;
  onclose?: (e: Event) => void;
  onerror?: (e: Event) => void;
  onmessage?: (e: MessageEvent) => void;
  constructor(
    readonly network: RtcNetwork,
    readonly label: string,
  ) {
    super();
  }
  send(data: string | ArrayBuffer): void {
    if (this.readyState !== 'open') throw new Error('Channel closed');
    this.network.post(this, data);
  }
  message(data: string | ArrayBuffer): void {
    if (this.readyState === 'open') this.onmessage?.(new MessageEvent('message', { data }));
  }
  open(): void {
    if (this.readyState !== 'connecting') return;
    this.readyState = 'open';
    this.onopen?.(new Event('open'));
  }
  close(): void {
    if (this.readyState === 'closed') return;
    this.readyState = 'closed';
    this.onclose?.(new Event('close'));
    this.dispatchEvent(new Event('close'));
    if (this.other?.readyState !== 'closed') setTimeout(() => this.other?.close(), 0);
  }
}
export class TestPC {
  other?: TestPC;
  connectionState: RTCPeerConnectionState = 'new';
  sctp = { maxMessageSize: 65536 };
  private readonly channels: TestChannel[] = [];
  onicecandidate?: (e: RTCPeerConnectionIceEvent) => void;
  onconnectionstatechange?: () => void;
  ontrack?: () => void;
  ondatachannel?: (e: { channel: RTCDataChannel }) => void;
  constructor(
    readonly network: RtcNetwork,
    readonly serial: number,
  ) {}
  createDataChannel(label: string): RTCDataChannel {
    const c = new TestChannel(this.network, label);
    this.channels.push(c);
    if (this.other) this.joinChannel(c);
    return c as unknown as RTCDataChannel;
  }
  private joinChannel(c: TestChannel): void {
    if (c.other || !this.other) return;
    const other = new TestChannel(this.network, c.label);
    c.other = other;
    other.other = c;
    this.other.channels.push(other);
    queueMicrotask(() => {
      this.other?.ondatachannel?.({ channel: other as unknown as RTCDataChannel });
      if (this.connectionState === 'connected') {
        other.open();
        c.open();
      }
    });
  }
  private sdp(): string {
    return `v=0\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\na=fingerprint:sha-256 TEST${this.serial}\r\na=x-test-pc:${this.serial}\r\n`;
  }
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    return { type: 'offer', sdp: this.sdp() };
  }
  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    return { type: 'answer', sdp: this.sdp() };
  }
  async setLocalDescription(): Promise<void> {
    const candidate = {
      candidate: `candidate:${this.serial} 1 UDP 1 127.0.0.1 9000 typ host`,
      sdpMid: '0',
      sdpMLineIndex: 0,
      usernameFragment: null,
    };
    queueMicrotask(() => {
      this.onicecandidate?.({ candidate } as unknown as RTCPeerConnectionIceEvent);
      this.onicecandidate?.({
        candidate: { ...candidate, candidate: '' },
      } as unknown as RTCPeerConnectionIceEvent);
      this.onicecandidate?.({ candidate: null } as RTCPeerConnectionIceEvent);
    });
  }
  async setRemoteDescription(d: RTCSessionDescriptionInit): Promise<void> {
    const n = Number(/a=x-test-pc:(\d+)/.exec(d.sdp ?? '')?.[1]);
    const other = this.network.pcs[n];
    if (!other) throw new Error('Unknown PC');
    this.other = other;
    other.other = this;
    if (d.type === 'offer') for (const c of other.channels) other.joinChannel(c);
    else {
      this.connectionState = other.connectionState = 'connected';
      queueMicrotask(() => {
        for (const pc of [this, other]) for (const c of pc.channels) c.open();
      });
    }
  }
  readonly ice: (RTCIceCandidateInit | null)[] = [];
  async addIceCandidate(candidate: RTCIceCandidateInit | null): Promise<void> {
    this.ice.push(candidate);
  }
  close(): void {
    this.connectionState = 'closed';
    for (const c of this.channels) c.close();
  }
  sever(): void {
    for (const pc of [this, this.other])
      if (pc) {
        pc.connectionState = 'disconnected';
        pc.onconnectionstatechange?.();
      }
  }
}
