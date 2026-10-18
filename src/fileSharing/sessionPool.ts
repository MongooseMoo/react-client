import { ICE_CONFIGURATION } from '../fileTransfer/createFileTransfers';
import { Bucket, helloMatches, parseControl, type Control } from './ctl';
import {
  check,
  endpointKey,
  MAX_FRAME,
  randomId,
  sameEndpoint,
  utf8Length,
  validateSdp,
  type Candidate,
  type Endpoint,
  type PeerPort,
  type Ready,
  type Reserved,
} from './protocol';
type Timer = ReturnType<typeof setTimeout>;
export interface SessionEvents {
  reservationFailed?(offer: string, reason: string): void;
  authorized(peer: Endpoint, offer: string): boolean;
  control(session: PeerSession, msg: Exclude<Control, { op: 'hello' }>): void;
  channel(session: PeerSession, channel: RTCDataChannel): void;
  established(session: PeerSession): void;
  lost(session: PeerSession, retry: boolean): void;
}
export class PeerSession {
  readonly pc: RTCPeerConnection;
  ctl?: RTCDataChannel;
  ready = false;
  closed = false;
  maxFrame = MAX_FRAME;
  readonly channels = new Set<RTCDataChannel>();
  private remoteDescription = false;
  private localAck = false;
  private endSent = false;
  private candidates: (Candidate | null)[] = [];
  private remoteCandidates: (Candidate | null)[] = [];
  private candidateBytes = 0;
  private remoteBytes = 0;
  private gotHello = false;
  private sentHello = false;
  private negotiation: Timer;
  private helloDeadline?: Timer;
  private idle?: Timer;
  private breaches: number[] = [];
  private badChannels: number[] = [];
  private ctlMessages = new Bucket(100, 200);
  private ctlBytes = new Bucket(32768, 65536);
  private binaryFrames = new Bucket(2048, 4096);
  constructor(
    readonly pool: SessionPool,
    readonly reservation: Reserved,
    readonly self: Endpoint,
    createPC: () => RTCPeerConnection,
  ) {
    this.pc = createPC();
    this.negotiation = setTimeout(() => this.fail('failed'), 30000);
    this.pc.onicecandidate = (e) => {
      if (!this.live) return;
      const c = e.candidate;
      if (!c?.candidate) {
        if (!this.endSent && !this.candidates.includes(null)) this.candidates.push(null);
      } else {
        if (this.endSent || this.candidates.includes(null)) return;
        const candidate: Candidate = { candidate: c.candidate };
        if (c.sdpMid !== null) candidate.sdpMid = c.sdpMid;
        if (c.sdpMLineIndex !== null) candidate.sdpMLineIndex = c.sdpMLineIndex;
        if (c.usernameFragment) candidate.usernameFragment = c.usernameFragment;
        this.candidateBytes += utf8Length(JSON.stringify(candidate));
        if (this.candidates.length >= 64 || this.candidateBytes > 131072) {
          this.fail('protocol');
          return;
        }
        this.candidates.push(candidate);
      }
      this.flushCandidates();
    };
    this.pc.onconnectionstatechange = () => {
      if (['failed', 'closed', 'disconnected'].includes(this.pc.connectionState))
        this.fail('failed');
    };
    this.pc.ontrack = () => this.fail('protocol');
    this.pc.ondatachannel = (e) => this.channel(e.channel);
  }
  get id(): string {
    return this.reservation.session;
  }
  get peer(): Endpoint {
    return this.reservation.peer;
  }
  get live(): boolean {
    return !this.closed && this.pool.live();
  }
  get initiator(): boolean {
    return sameEndpoint(this.reservation.initiator, this.self);
  }
  async initiate(): Promise<void> {
    if (!this.initiator) return;
    this.installCtl(this.pc.createDataChannel('ctl', { ordered: true }));
    const offer = await this.pc.createOffer();
    if (!this.live) return;
    check(offer.sdp);
    validateSdp(offer.sdp);
    await this.pc.setLocalDescription(offer);
    if (!this.live) return;
    this.pool.signal(this, 'Connect', { sdp: offer.sdp }, () => {
      this.localAck = true;
      this.flushCandidates();
    });
  }
  async connect(sdp: string): Promise<void> {
    check(!this.initiator && !this.remoteDescription);
    validateSdp(sdp);
    await this.pc.setRemoteDescription({ type: 'offer', sdp });
    if (!this.live) return;
    this.remoteDescription = true;
    await this.flushRemote();
    const answer = await this.pc.createAnswer();
    if (!this.live) return;
    check(answer.sdp);
    validateSdp(answer.sdp);
    await this.pc.setLocalDescription(answer);
    if (!this.live) return;
    this.pool.signal(this, 'Answer', { sdp: answer.sdp }, () => {
      this.localAck = true;
      this.flushCandidates();
    });
  }
  async answer(sdp: string): Promise<void> {
    check(this.initiator && !this.remoteDescription);
    validateSdp(sdp);
    await this.pc.setRemoteDescription({ type: 'answer', sdp });
    if (!this.live) return;
    this.remoteDescription = true;
    await this.flushRemote();
  }
  async candidate(candidate: Candidate | null): Promise<void> {
    if (!this.live) return;
    this.remoteBytes += candidate ? utf8Length(JSON.stringify(candidate)) : 0;
    check(this.remoteCandidates.length < 64 && this.remoteBytes <= 131072);
    this.remoteCandidates.push(candidate);
    if (this.remoteDescription) await this.flushRemote();
  }
  private async flushRemote(): Promise<void> {
    for (const c of this.remoteCandidates.splice(0)) {
      if (!this.live) return;
      if (c) await this.pc.addIceCandidate(c);
      else await this.pc.addIceCandidate();
    }
  }
  private flushCandidates(): void {
    if (!this.localAck || !this.live) return;
    for (const candidate of this.candidates.splice(0)) {
      if (candidate === null) {
        if (!this.endSent) {
          this.pool.signal(this, 'Candidate', { end: true });
          this.endSent = true;
        }
      } else this.pool.signal(this, 'Candidate', { candidate });
    }
  }
  private channel(channel: RTCDataChannel): void {
    if (!this.live) {
      channel.close();
      return;
    }
    if (channel.label === 'ctl') {
      if (this.initiator || this.ctl) {
        channel.close();
        this.fail('protocol');
      } else this.installCtl(channel);
      return;
    }
    if (
      !this.ready ||
      !/^t:[a-f0-9]{32}:[1-9]\d{0,9}$/.test(channel.label) ||
      !this.admitChannel(channel)
    ) {
      channel.close();
      this.badChannel();
      return;
    }
    this.pool.events.channel(this, channel);
  }
  private installCtl(channel: RTCDataChannel): void {
    check(
      channel.ordered &&
        channel.maxRetransmits == null &&
        channel.maxPacketLifeTime == null &&
        !channel.negotiated,
    );
    this.ctl = channel;
    channel.binaryType = 'arraybuffer';
    const open = () => {
      if (!this.live || this.sentHello) return;
      const sctp = this.pc.sctp?.maxMessageSize ?? 0;
      this.maxFrame = Math.min(MAX_FRAME, sctp || MAX_FRAME);
      if (this.maxFrame < 16391) {
        this.fail('protocol');
        return;
      }
      this.helloDeadline = setTimeout(() => this.fail('protocol'), 5000);
      this.sendRaw({
        op: 'hello',
        v: 1,
        session: this.id,
        self: this.self,
        peer: this.peer,
        features: ['base'],
        maxFrame: this.maxFrame,
        slots: { free: 0, total: 0 },
      });
      this.sentHello = true;
      this.establish();
    };
    channel.onopen = open;
    if (channel.readyState === 'open') open();
    channel.onmessage = (e) => {
      if (!this.live) return;
      try {
        check(typeof e.data === 'string' && utf8Length(e.data) <= this.maxFrame);
        if (!this.ctlMessages.take(1) || !this.ctlBytes.take(utf8Length(e.data))) {
          this.breach();
          return;
        }
        const msg = parseControl(e.data);
        if (!this.gotHello) {
          check(msg.op === 'hello');
          helloMatches(msg, this.id, this.self, this.peer);
          this.maxFrame = Math.min(this.maxFrame, msg.maxFrame);
          this.gotHello = true;
          this.establish();
        } else {
          check(msg.op !== 'hello' && this.ready);
          this.pool.events.control(this, msg);
        }
      } catch {
        this.fail('protocol');
      }
    };
    channel.onclose = channel.onerror = () => this.fail('failed');
  }
  private establish(): void {
    if (!this.sentHello || !this.gotHello || this.ready) return;
    this.ready = true;
    clearTimeout(this.negotiation);
    clearTimeout(this.helloDeadline);
    this.pool.signal(this, 'Connected', {});
    this.pool.events.established(this);
    this.idleCheck();
  }
  send(msg: Exclude<Control, { op: 'hello' }>): void {
    check(this.ready && this.live);
    this.sendRaw(msg);
  }
  private sendRaw(msg: Control): void {
    check(this.live && this.ctl?.readyState === 'open');
    const raw = JSON.stringify(msg);
    check(utf8Length(raw) <= Math.min(8192, this.maxFrame));
    this.ctl.send(raw);
  }
  openTransfer(t: string, a: number): RTCDataChannel {
    check(this.ready && this.live);
    const c = this.pc.createDataChannel(`t:${t}:${a}`, { ordered: true });
    check(this.admitChannel(c), 'Transfer channel limit');
    return c;
  }
  private admitChannel(c: RTCDataChannel): boolean {
    if (
      this.channels.size >= 8 ||
      this.pool.channelCount >= 32 ||
      !c.ordered ||
      c.maxRetransmits != null ||
      c.maxPacketLifeTime != null ||
      c.negotiated
    )
      return false;
    c.binaryType = 'arraybuffer';
    this.channels.add(c);
    clearTimeout(this.idle);
    c.addEventListener('close', () => {
      this.channels.delete(c);
      this.idleCheck();
    });
    return true;
  }
  private idleCheck(): void {
    clearTimeout(this.idle);
    if (!this.channels.size && this.ready && this.live)
      this.idle = setTimeout(() => this.fail('done'), 60000);
  }
  badChannel(): void {
    const now = performance.now();
    this.badChannels = this.badChannels.filter((t) => now - t < 60000);
    this.badChannels.push(now);
    if (this.badChannels.length >= 3) this.fail('protocol');
  }
  admitFrame(): boolean {
    if (this.binaryFrames.take(1)) return true;
    this.breach();
    return false;
  }
  private breach(): void {
    const now = performance.now();
    this.breaches = this.breaches.filter((t) => now - t < 60000);
    this.breaches.push(now);
    if (this.breaches.length >= 3) this.fail('protocol');
  }
  fail(reason: 'done' | 'failed' | 'protocol' | 'cancelled'): void {
    if (!this.closed) this.pool.close(this, reason);
  }
  dispose(): void {
    this.closed = true;
    this.ready = false;
    clearTimeout(this.negotiation);
    clearTimeout(this.helloDeadline);
    clearTimeout(this.idle);
    for (const c of this.channels) c.close();
    this.channels.clear();
    this.ctl?.close();
    this.pc.close();
  }
}
export class SessionPool {
  private readonly sessions = new Map<string, PeerSession>();
  private readonly pendingAcks = new Map<string, { session: PeerSession; ack: () => void }>();
  private readonly reserves = new Map<string, { offer: string; timer: Timer }>();
  private readonly closing = new Map<
    string,
    { session: PeerSession; timer: Timer; retry: boolean }
  >();
  private readonly off: (() => void)[];
  constructor(
    readonly peerPort: PeerPort,
    readonly registration: Ready,
    readonly live: () => boolean,
    readonly events: SessionEvents,
    private readonly createPC = () => new RTCPeerConnection(ICE_CONFIGURATION),
  ) {
    this.off = [
      peerPort.on('Error', (m) => {
        if (!m.req) return;
        const pending = this.reserves.get(m.req);
        if (pending) {
          clearTimeout(pending.timer);
          this.reserves.delete(m.req);
          this.events.reservationFailed?.(pending.offer, `Session reservation: ${m.code}`);
        }
        const ack = this.pendingAcks.get(m.req);
        if (ack) ack.session.fail('failed');
      }),
      peerPort.on('Reserved', (r) => this.reserved(r)),
      peerPort.on('Connect', (m) => this.deliver(m.session, m.from, (s) => s.connect(m.sdp))),
      peerPort.on('Answer', (m) => this.deliver(m.session, m.from, (s) => s.answer(m.sdp))),
      peerPort.on('Candidate', (m) =>
        this.deliver(m.session, m.from, (s) => s.candidate(m.candidate ?? null)),
      ),
      peerPort.on('Ack', (m) => {
        const a = this.pendingAcks.get(m.req);
        if (a?.session.live) {
          this.pendingAcks.delete(m.req);
          a.ack();
        }
      }),
      peerPort.on('Closed', (m) => {
        const closing = this.closing.get(m.session);
        if (closing && sameEndpoint(m.peer, closing.session.peer)) {
          clearTimeout(closing.timer);
          this.closing.delete(m.session);
          this.events.lost(
            closing.session,
            closing.retry && !['revoked', 'offline'].includes(m.reason),
          );
        }
        const s = this.sessions.get(m.session);
        if (s && sameEndpoint(s.peer, m.peer)) {
          this.remove(s);
          this.events.lost(s, !['revoked', 'offline', 'done'].includes(m.reason));
        }
      }),
    ];
  }
  get channelCount(): number {
    return [...this.sessions.values()].reduce((n, s) => n + s.channels.size, 0);
  }
  get bufferedBytes(): number {
    return [...this.sessions.values()].reduce(
      (n, s) =>
        n +
        (s.ctl?.bufferedAmount ?? 0) +
        [...s.channels].reduce((sum, c) => sum + c.bufferedAmount, 0),
      0,
    );
  }
  forPeer(peer: Endpoint): PeerSession | undefined {
    return [...this.sessions.values()].find((s) => sameEndpoint(s.peer, peer));
  }
  reserve(peer: Endpoint, offer: string): void {
    check(this.live() && this.events.authorized(peer, offer));
    check(this.reserves.size < 64, 'Too many session requests');
    const req = randomId();
    const timer = setTimeout(() => {
      this.reserves.delete(req);
      this.events.reservationFailed?.(offer, 'Session reservation timed out');
    }, 10000);
    this.reserves.set(req, { offer, timer });
    this.peerPort.send('Reserve', {
      req,
      to: peer.player,
      target: peer,
      purpose: 'files',
      auth: { kind: 'offer', offer },
    });
  }
  private reserved(r: Reserved): void {
    if (r.req) {
      const pending = this.reserves.get(r.req);
      if (pending) {
        clearTimeout(pending.timer);
        this.reserves.delete(r.req);
      }
    }
    if (!this.live() || !this.events.authorized(r.peer, r.authorization.offer)) return;
    const existing = this.forPeer(r.peer);
    if (existing) {
      check(existing.id === r.session);
      return;
    }
    if (
      this.sessions.size >= 8 ||
      [...this.sessions.values()].filter((s) => !s.ready).length >= 2 ||
      ![endpointKey(this.registration.self), endpointKey(r.peer)].includes(endpointKey(r.initiator))
    ) {
      this.peerPort.send('Close', {
        req: randomId(),
        to: r.peer.player,
        target: r.peer,
        session: r.session,
        reason: 'protocol',
      });
      return;
    }
    const s = new PeerSession(this, r, this.registration.self, this.createPC);
    this.sessions.set(s.id, s);
    void s.initiate().catch(() => s.fail('failed'));
  }
  private deliver(id: string, from: Endpoint, fn: (s: PeerSession) => Promise<void>): void {
    const s = this.sessions.get(id);
    if (s?.live && sameEndpoint(s.peer, from)) void fn(s).catch(() => s.fail('protocol'));
  }
  signal(
    s: PeerSession,
    kind: 'Connect' | 'Answer' | 'Candidate' | 'Connected',
    extra: { sdp?: string; candidate?: Candidate; end?: true },
    ack = () => {},
  ): void {
    if (!s.live) return;
    const req = randomId();
    if (kind === 'Connect' || kind === 'Answer') this.pendingAcks.set(req, { session: s, ack });
    const target = { req, to: s.peer.player, target: s.peer, session: s.id };
    if (kind === 'Connect' || kind === 'Answer') {
      check(extra.sdp);
      this.peerPort.send(kind, { ...target, sdp: extra.sdp });
    } else if (kind === 'Candidate') this.peerPort.send(kind, { ...target, ...extra });
    else this.peerPort.send(kind, target);
  }
  close(s: PeerSession, reason: 'done' | 'failed' | 'protocol' | 'cancelled'): void {
    this.remove(s);
    if (!this.live()) {
      this.events.lost(s, false);
      return;
    }
    const retry = reason === 'failed';
    const timer = setTimeout(() => {
      this.closing.delete(s.id);
      this.events.lost(s, false);
    }, 5000);
    this.closing.set(s.id, { session: s, timer, retry });
    this.peerPort.send('Close', {
      req: randomId(),
      to: s.peer.player,
      target: s.peer,
      session: s.id,
      reason,
    });
  }
  private remove(s: PeerSession): void {
    this.sessions.delete(s.id);
    s.dispose();
    for (const [req, p] of this.pendingAcks) if (p.session === s) this.pendingAcks.delete(req);
  }
  dispose(): void {
    for (const r of this.reserves.values()) clearTimeout(r.timer);
    this.reserves.clear();
    for (const off of this.off) off();
    for (const s of [...this.sessions.values()]) {
      if (this.live())
        this.peerPort.send('Close', {
          req: randomId(),
          to: s.peer.player,
          target: s.peer,
          session: s.id,
          reason: 'cancelled',
        });
      this.remove(s);
    }
    for (const c of this.closing.values()) clearTimeout(c.timer);
    this.closing.clear();
  }
}
