export interface LatencySnapshot {
  status: 'unavailable' | 'measuring' | 'current' | 'stale';
  rttMs: number | null;
  averageMs: number | null;
}

export const PING_INTERVAL_MS = 5000;
export const PING_TIMEOUT_MS = 15000;

/** Core.Ping has no request ID: keep one request outstanding until it replies. */
export class ConnectionLatency {
  private interval?: ReturnType<typeof setInterval>;
  private timeout?: ReturnType<typeof setTimeout>;
  private sentAt: number | undefined;
  private samples: number[] = [];

  constructor(
    private readonly send: (averageMs: number | undefined) => void,
    private readonly publish: (snapshot: LatencySnapshot) => void,
    private readonly now: () => number = () => performance.now(),
  ) {}

  start(): void {
    if (this.interval !== undefined) return;
    this.publish({ status: 'measuring', rttMs: null, averageMs: null });
    this.interval = setInterval(() => this.probe(), PING_INTERVAL_MS);
    this.probe();
  }

  probe(): void {
    if (this.interval === undefined || this.sentAt !== undefined) return;
    this.sentAt = this.now();
    this.timeout = setTimeout(() => this.expire(), PING_TIMEOUT_MS);
    this.send(this.average());
  }

  receive(): void {
    if (this.sentAt === undefined) return;
    const elapsed = this.now() - this.sentAt;
    clearTimeout(this.timeout);
    this.timeout = undefined;
    this.sentAt = undefined;
    if (elapsed >= PING_TIMEOUT_MS || elapsed < 0) {
      this.expire();
      return;
    }
    this.samples.push(elapsed);
    if (this.samples.length > 5) this.samples.shift();
    this.publish({ status: 'current', rttMs: Math.round(elapsed), averageMs: this.average() ?? null });
  }

  stop(): void {
    clearInterval(this.interval);
    clearTimeout(this.timeout);
    this.interval = undefined;
    this.timeout = undefined;
    this.sentAt = undefined;
    this.samples = [];
    this.publish({ status: 'unavailable', rttMs: null, averageMs: null });
  }

  private average(): number | undefined {
    return this.samples.length
      ? Math.round(this.samples.reduce((sum, sample) => sum + sample, 0) / this.samples.length)
      : undefined;
  }

  private expire(): void {
    // Keep sentAt until the late response arrives; a new untagged request would
    // mistake that response for its own. Reconnection resets the whole tracker.
    this.samples = [];
    this.publish({ status: 'stale', rttMs: null, averageMs: null });
  }
}
