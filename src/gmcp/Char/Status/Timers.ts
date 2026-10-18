import { inbound, outbound } from '../../../protocol/messages';
import { parseTimerUpdate, type TimerSnapshot, type TimerUpdate } from '../../../timing/deadlines';
import { gmcpJsonMessage } from '../../messages';
import { GMCPPackage } from '../../package';

const request = gmcpJsonMessage<'Request', never, { requestId: string }>('Request');
const update = gmcpJsonMessage<'Update', TimerUpdate>('Update', {
  encode(value: TimerUpdate): unknown {
    return value;
  },
  decode(value: unknown): TimerUpdate {
    const result = parseTimerUpdate(value);
    if (!result) throw new Error('Invalid timer snapshot');
    return result;
  },
});
const TimersBase = GMCPPackage.with({
  packageName: 'Char.Status.Timers',
  messages: [outbound(request), inbound(update)] as const,
});
const emptySnapshot = (): TimerSnapshot =>
  Object.freeze({ clockId: null, revision: -1, timers: Object.freeze([]), received: false });

/** Connection-owned deadline projection; this package never performs quest settlement. */
export class GMCPCharStatusTimers extends TimersBase {
  private current = emptySnapshot();
  private readonly listeners = new Set<(snapshot: TimerSnapshot) => void>();
  private readonly unsubscribeClock: () => void;
  private releaseClock?: () => void;
  private lastRequestMs = Number.NEGATIVE_INFINITY;
  private pendingRequestId?: string;
  private serial = 0;
  private refreshTimer?: ReturnType<typeof setTimeout>;

  get snapshot(): TimerSnapshot {
    return this.current;
  }

  constructor(client: ConstructorParameters<typeof TimersBase>[0]) {
    super(client);
    this.on('update', (value) => this.handleUpdate(value));
    this.unsubscribeClock = client.sharedClock.subscribe((change) => {
      if (
        change.reason === 'reset' ||
        change.reason === 'restored' ||
        change.reason === 'runtime' ||
        (this.current.clockId !== null &&
          change.estimate.clockId !== null &&
          this.current.clockId !== change.estimate.clockId)
      ) {
        this.clearSnapshot();
        if (client.sharedClock.ready) this.scheduleSnapshot();
      } else this.publish();
    });
  }

  subscribe(listener: (snapshot: TimerSnapshot) => void): () => void {
    this.listeners.add(listener);
    listener(this.current);
    return () => this.listeners.delete(listener);
  }

  requestSnapshot(): boolean {
    if (!this.client.gmcp.ready || !this.client.gmcp.sessionReady) return false;
    const now = performance.now();
    if (now - this.lastRequestMs < 1000) return false;
    this.lastRequestMs = now;
    const requestId = `timers:${this.client.gmcp.generation}:${++this.serial}`;
    this.pendingRequestId = requestId;
    this.sendRequest({ requestId });
    return true;
  }

  handleUpdate(value: TimerUpdate): boolean {
    const update = parseTimerUpdate(value);
    if (!update || (update.requestId !== undefined && update.requestId !== this.pendingRequestId))
      return false;
    const clock = this.client.sharedClock.estimate();
    if (clock.status === 'current' && clock.clockId !== update.clockId) return false;
    if (this.current.clockId === update.clockId && update.revision <= this.current.revision)
      return false;
    if (update.requestId !== undefined) this.pendingRequestId = undefined;
    this.current = Object.freeze({
      clockId: update.clockId,
      revision: update.revision,
      timers: update.timers,
      received: true,
    });
    if (update.timers.length && !this.releaseClock)
      this.releaseClock = this.client.sharedClock.acquire('deadline-timers');
    else if (!update.timers.length) {
      this.releaseClock?.();
      this.releaseClock = undefined;
    }
    this.publish();
    return true;
  }

  override reset(): void {
    this.clearSnapshot();
    this.lastRequestMs = Number.NEGATIVE_INFINITY;
  }

  private clearSnapshot(): void {
    clearTimeout(this.refreshTimer);
    this.refreshTimer = undefined;
    this.current = emptySnapshot();
    this.pendingRequestId = undefined;
    this.releaseClock?.();
    this.releaseClock = undefined;
    this.publish();
  }

  private scheduleSnapshot(): void {
    if (!this.client.gmcp.ready || !this.client.gmcp.sessionReady) return;
    const wait = Math.max(0, this.lastRequestMs + 1000 - performance.now());
    if (wait === 0) this.requestSnapshot();
    else
      this.refreshTimer = setTimeout(() => {
        this.refreshTimer = undefined;
        this.requestSnapshot();
      }, wait);
  }

  override shutdown(): void {
    this.unsubscribeClock();
    this.reset();
    this.listeners.clear();
  }

  private publish(): void {
    for (const listener of this.listeners) listener(this.current);
  }
}
