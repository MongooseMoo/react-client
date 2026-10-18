import { CLOCK_POLICY, type ClockEstimate, ClockEstimator, clockCorrection } from './clock';

export interface TimeRequest {
  id: string;
  c1Ms: number;
}
export interface TimeReply extends TimeRequest {
  clockId: string;
  s2Ms: number;
  s3Ms: number;
}
export interface LocalClockMapping {
  clockId: string;
  serverNowMs: number;
  performanceNowMs: number;
}
export interface SharedClockChange {
  estimate: ClockEstimate;
  reason: 'subscribe' | 'sample' | 'runtime' | 'reset' | 'restored' | 'stale' | 'local';
  correction: 'ignore' | 'unsubmitted' | 'rejoin';
}

/** MOO generate_json prints floats with 15 significant decimal digits. */
function matchesTimestampEcho(localMs: number, echoedMs: number): boolean {
  if (!Number.isFinite(echoedMs) || echoedMs < 0) return false;
  if (echoedMs === localMs) return true;
  const decimalRounding = localMs === 0 ? 0 : 0.5 * 10 ** (Math.floor(Math.log10(localMs)) - 14);
  const binaryRounding = 2 * Number.EPSILON * Math.max(localMs, echoedMs);
  return Math.abs(echoedMs - localMs) <= decimalRounding + binaryRounding;
}

/** One connection clock shared by leased consumers; no timer survives the last lease. */
export class SharedClock {
  get ready(): boolean {
    return this.mode !== 'offline';
  }
  private readonly estimator = new ClockEstimator();
  private readonly leases = new Set<symbol>();
  private readonly listeners = new Set<(change: SharedClockChange) => void>();
  private mode: 'offline' | 'network' | 'local' = 'offline';
  private local?: LocalClockMapping;
  private outstanding?: TimeRequest;
  private probeTimer?: ReturnType<typeof setTimeout>;
  private replyTimer?: ReturnType<typeof setTimeout>;
  private freshnessTimer?: ReturnType<typeof setTimeout>;
  private remaining = 0;
  private serial = 0;
  private generation = 0;
  private lastSentMs = Number.NEGATIVE_INFINITY;
  private publishedOffsetMs: number | null = null;

  constructor(
    private readonly send: (request: TimeRequest) => void,
    private readonly now: () => number = () => performance.now(),
  ) {}

  acquire(consumerId: string): () => void {
    const lease = Symbol(consumerId);
    this.leases.add(lease);
    if (this.leases.size === 1 && this.mode === 'network')
      this.beginBurst(CLOCK_POLICY.startupProbes);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.leases.delete(lease);
      if (!this.leases.size) this.cancelTimers();
    };
  }

  subscribe(listener: (change: SharedClockChange) => void): () => void {
    this.listeners.add(listener);
    listener({ estimate: this.estimate(), reason: 'subscribe', correction: 'ignore' });
    return () => this.listeners.delete(listener);
  }

  estimate(): ClockEstimate {
    if (this.mode === 'local' && this.local)
      return {
        clockId: this.local.clockId,
        status: 'current',
        offsetMs: this.local.serverNowMs - this.local.performanceNowMs,
        uncertaintyMs: 0,
        supportingSamples: 1,
        oldestSupportingMs: this.local.performanceNowMs,
        ageMs: Math.max(0, this.now() - this.local.performanceNowMs),
      };
    return this.estimator.estimate(this.now());
  }

  getServerNow(): number | undefined {
    const estimate = this.estimate();
    return estimate.status === 'current' && estimate.offsetMs !== null
      ? this.now() + estimate.offsetMs
      : undefined;
  }

  targetServerToPerformance(serverMs: number): number | undefined {
    const estimate = this.estimate();
    return Number.isFinite(serverMs) && estimate.status === 'current' && estimate.offsetMs !== null
      ? serverMs - estimate.offsetMs
      : undefined;
  }

  setNetworkReady(ready: boolean): void {
    if ((ready && this.mode === 'network') || (!ready && this.mode === 'offline')) return;
    this.cancelTimers();
    this.mode = ready ? 'network' : 'offline';
    this.local = undefined;
    this.estimator.reset();
    this.publishedOffsetMs = null;
    this.publish('reset', true);
    if (ready && this.leases.size) this.beginBurst(CLOCK_POLICY.startupProbes);
  }

  setLocalMapping(mapping: LocalClockMapping): boolean {
    if (
      typeof mapping.clockId !== 'string' ||
      !mapping.clockId.length ||
      mapping.clockId.length > 128 ||
      ![mapping.serverNowMs, mapping.performanceNowMs].every(
        (value) => Number.isFinite(value) && value >= 0,
      )
    )
      return false;
    this.cancelTimers();
    this.mode = 'local';
    this.estimator.reset();
    this.local = { ...mapping };
    this.publish('local', true);
    return true;
  }

  /** Page/audio restoration invalidates queued work even when the network socket survived. */
  invalidate(): void {
    this.cancelTimers();
    this.estimator.reset();
    this.publishedOffsetMs = null;
    if (this.mode === 'local') {
      this.local = undefined;
      this.mode = 'offline';
    }
    this.publish('restored', true);
    if (this.mode === 'network' && this.leases.size) this.beginBurst(CLOCK_POLICY.startupProbes);
  }

  receive(reply: TimeReply): boolean {
    const request = this.outstanding;
    if (
      this.mode !== 'network' ||
      !request ||
      reply.id !== request.id ||
      !matchesTimestampEcho(request.c1Ms, reply.c1Ms)
    )
      return false;
    const c4Ms = this.now();
    if (c4Ms - request.c1Ms >= CLOCK_POLICY.replyTimeoutMs || c4Ms < request.c1Ms) return false;
    // The ID correlates the reply. Never replace the original local send time
    // with the server's less precise JSON echo when computing delay or offset.
    const result = this.estimator.add({ ...reply, c1Ms: request.c1Ms, c4Ms });
    if (!result.accepted) return false;
    clearTimeout(this.replyTimer);
    this.replyTimer = undefined;
    this.outstanding = undefined;
    if (result.clockChanged) this.publishedOffsetMs = null;
    const generation = this.generation;
    this.publish(result.clockChanged ? 'runtime' : 'sample', result.clockChanged);
    if (generation !== this.generation) return true;
    if (result.clockChanged) this.remaining = CLOCK_POLICY.startupProbes;
    this.scheduleNext();
    return true;
  }

  shutdown(): void {
    this.cancelTimers();
    this.mode = 'offline';
    this.local = undefined;
    this.estimator.reset();
    this.leases.clear();
    this.listeners.clear();
  }

  private beginBurst(count: number): void {
    if (this.outstanding || this.probeTimer !== undefined) return;
    this.remaining = count;
    this.scheduleProbe(
      Math.max(0, this.lastSentMs + CLOCK_POLICY.minimumProbeSpacingMs - this.now()),
    );
  }

  private scheduleProbe(delayMs: number): void {
    const generation = this.generation;
    this.probeTimer = setTimeout(() => {
      this.probeTimer = undefined;
      if (generation !== this.generation || this.mode !== 'network' || !this.leases.size) return;
      this.publish('sample');
      if (generation !== this.generation || this.mode !== 'network' || !this.leases.size) return;
      this.remaining--;
      const request = { id: `${generation}:${++this.serial}`, c1Ms: this.now() };
      this.lastSentMs = request.c1Ms;
      this.outstanding = request;
      this.replyTimer = setTimeout(() => {
        this.replyTimer = undefined;
        if (generation !== this.generation) return;
        this.outstanding = undefined;
        this.publish('stale');
        this.scheduleNext();
      }, CLOCK_POLICY.replyTimeoutMs);
      this.send(request);
    }, delayMs);
  }

  private scheduleNext(): void {
    if (this.mode !== 'network' || !this.leases.size) return;
    if (this.remaining > 0)
      this.scheduleProbe(
        Math.max(0, this.lastSentMs + CLOCK_POLICY.minimumProbeSpacingMs - this.now()),
      );
    else {
      const generation = this.generation;
      this.probeTimer = setTimeout(() => {
        this.probeTimer = undefined;
        if (generation === this.generation) this.beginBurst(CLOCK_POLICY.refreshProbes);
      }, CLOCK_POLICY.refreshIntervalMs);
    }
  }

  private cancelTimers(): void {
    this.generation++;
    clearTimeout(this.probeTimer);
    clearTimeout(this.replyTimer);
    clearTimeout(this.freshnessTimer);
    this.probeTimer = undefined;
    this.replyTimer = undefined;
    this.freshnessTimer = undefined;
    this.outstanding = undefined;
    this.lastSentMs = Number.NEGATIVE_INFINITY;
  }

  private publish(reason: SharedClockChange['reason'], forceRejoin = false): void {
    const generation = this.generation;
    const estimate = this.estimate();
    const correction = forceRejoin
      ? 'rejoin'
      : this.publishedOffsetMs !== null && estimate.offsetMs !== null
        ? clockCorrection(this.publishedOffsetMs, estimate.offsetMs)
        : 'ignore';
    if (estimate.status === 'current' && estimate.offsetMs !== null && correction !== 'ignore')
      this.publishedOffsetMs = estimate.offsetMs;
    else if (this.publishedOffsetMs === null && estimate.status === 'current')
      this.publishedOffsetMs = estimate.offsetMs;
    for (const listener of this.listeners) listener({ estimate, reason, correction });
    if (generation !== this.generation) return;
    clearTimeout(this.freshnessTimer);
    this.freshnessTimer = undefined;
    if (this.mode === 'network' && this.leases.size && estimate.oldestSupportingMs !== null) {
      const remainingMs = estimate.oldestSupportingMs + CLOCK_POLICY.freshnessMs + 1 - this.now();
      if (remainingMs > 0)
        this.freshnessTimer = setTimeout(() => {
          this.freshnessTimer = undefined;
          this.publish('stale');
        }, remainingMs);
    }
  }
}
