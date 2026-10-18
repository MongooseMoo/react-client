/** Core.Time policy. The session owner, rather than this pure model, owns timers. */
export const CLOCK_POLICY = Object.freeze({
  startupProbes: 8,
  minimumProbeSpacingMs: 150,
  replyTimeoutMs: 2000,
  refreshProbes: 3,
  refreshIntervalMs: 15000,
  maximumSamples: 16,
  freshnessMs: 30000,
  maximumDelayMs: 2000,
});

export interface ClockExchange {
  clockId: string;
  c1Ms: number;
  s2Ms: number;
  s3Ms: number;
  c4Ms: number;
}

export interface ClockSample {
  clockId: string;
  receivedMs: number;
  offsetMs: number;
  delayMs: number;
}

export interface ClockEstimate {
  clockId: string | null;
  status: 'unavailable' | 'provisional' | 'current' | 'stale';
  offsetMs: number | null;
  /** Half the worst supporting round trip; network asymmetry remains unknown. */
  uncertaintyMs: number | null;
  supportingSamples: number;
  oldestSupportingMs: number | null;
  ageMs: number | null;
}

const validTime = (value: number): boolean => Number.isFinite(value) && value >= 0;

export function clockSample(exchange: ClockExchange): ClockSample | undefined {
  const { clockId, c1Ms, s2Ms, s3Ms, c4Ms } = exchange;
  if (
    typeof clockId !== 'string' ||
    clockId.length === 0 ||
    clockId.length > 128 ||
    ![c1Ms, s2Ms, s3Ms, c4Ms].every(validTime) ||
    c4Ms < c1Ms ||
    s3Ms < s2Ms
  )
    return undefined;
  const delayMs = c4Ms - c1Ms - (s3Ms - s2Ms);
  // Only floating point round-off may produce a negative network duration.
  if (delayMs < -0.001 || delayMs > CLOCK_POLICY.maximumDelayMs) return undefined;
  const offsetMs = (s2Ms - c1Ms + (s3Ms - c4Ms)) / 2;
  if (!Number.isFinite(offsetMs)) return undefined;
  return { clockId, receivedMs: c4Ms, offsetMs, delayMs: Math.max(0, delayMs) };
}

/** Request identity/echo matching must happen before submitting an exchange here. */
export class ClockEstimator {
  private samples: ClockSample[] = [];
  private clockId: string | null = null;
  private lastReceivedMs: number | undefined;

  reset(): void {
    this.samples = [];
    this.clockId = null;
    this.lastReceivedMs = undefined;
  }

  add(exchange: ClockExchange): { accepted: boolean; clockChanged: boolean } {
    const sample = clockSample(exchange);
    if (!sample) return { accepted: false, clockChanged: false };
    const clockChanged = this.clockId !== null && sample.clockId !== this.clockId;
    if (
      clockChanged ||
      (this.lastReceivedMs !== undefined && sample.receivedMs < this.lastReceivedMs)
    ) {
      this.reset();
    }
    this.clockId = sample.clockId;
    this.lastReceivedMs = sample.receivedMs;
    this.samples.push(sample);
    if (this.samples.length > CLOCK_POLICY.maximumSamples) this.samples.shift();
    return { accepted: true, clockChanged };
  }

  estimate(nowMs: number): ClockEstimate {
    const unavailable: ClockEstimate = {
      clockId: this.clockId,
      status: this.samples.length ? 'stale' : 'unavailable',
      offsetMs: null,
      uncertaintyMs: null,
      supportingSamples: 0,
      oldestSupportingMs: null,
      ageMs: null,
    };
    if (!validTime(nowMs)) return unavailable;
    const supporting = this.samples
      .filter(
        (sample) =>
          nowMs >= sample.receivedMs && nowMs - sample.receivedMs <= CLOCK_POLICY.freshnessMs,
      )
      .sort((a, b) => a.delayMs - b.delayMs || b.receivedMs - a.receivedMs)
      .slice(0, 3);
    if (!supporting.length) return unavailable;
    const offsets = supporting.map((sample) => sample.offsetMs).sort((a, b) => a - b);
    const offsetMs =
      offsets.length === 2
        ? (offsets[0] + offsets[1]) / 2
        : offsets[Math.floor(offsets.length / 2)];
    const oldestSupportingMs = Math.min(...supporting.map((sample) => sample.receivedMs));
    return {
      clockId: this.clockId,
      status: supporting.length === 3 ? 'current' : 'provisional',
      offsetMs,
      uncertaintyMs: Math.max(...supporting.map((sample) => sample.delayMs)) / 2,
      supportingSamples: supporting.length,
      oldestSupportingMs,
      ageMs: nowMs - oldestSupportingMs,
    };
  }
}

export function serverToPerformanceMs(
  serverMs: number,
  estimate: ClockEstimate,
): number | undefined {
  if (!Number.isFinite(serverMs) || estimate.status !== 'current' || estimate.offsetMs === null)
    return undefined;
  return serverMs - estimate.offsetMs;
}

export function clockCorrection(
  previousOffsetMs: number,
  nextOffsetMs: number,
): 'ignore' | 'unsubmitted' | 'rejoin' {
  const difference = Math.abs(nextOffsetMs - previousOffsetMs);
  return difference < 5 ? 'ignore' : difference <= 30 ? 'unsubmitted' : 'rejoin';
}
