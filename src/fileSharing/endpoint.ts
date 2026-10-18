import { check, MAX_FILE, randomId, sameEndpoint, type PeerPort, type Ready } from './protocol';
type Timer = ReturnType<typeof setTimeout>;
interface Options {
  peer: PeerPort;
  owner: string;
  player: string;
  acquire(digest: string, persistent: boolean): Promise<void>;
  lost(reason: string): void | Promise<void>;
  ready?(ready: Ready): void;
  changed?(): void;
  parked?(): void;
  random?(): number;
  locks?: LockManager;
}
/** Files-only election. This controller has no reference to game login or socket methods. */
export class EndpointController {
  ready?: Ready;
  status = '';
  parked = false;
  private active = false;
  private elected = false;
  private attempt = 0;
  private request?: { req: string; endpoint: string };
  private seq = 0;
  private leaseDeadline = 0;
  private timers = new Set<Timer>();
  private helloTimer?: Timer;
  private leaseTimer?: Timer;
  private notice?: Timer;
  private stable?: Timer;
  private electionAbort?: AbortController;
  private unlock?: () => void;
  private unsubscribe: (() => void)[] = [];
  private transition: Promise<void> = Promise.resolve();
  private acquiring?: Promise<void>;
  private stopping?: Promise<void>;
  private errors: number[] = [];
  awaitingIdentity = false;
  constructor(private readonly options: Options) {}
  private later(ms: number, work: () => void): Timer {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      work();
    }, ms);
    this.timers.add(timer);
    return timer;
  }
  private clear(timer?: Timer): void {
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(timer);
    }
  }
  get valid(): boolean {
    return Boolean(
      this.active && this.elected && this.ready && performance.now() < this.leaseDeadline,
    );
  }
  async start(): Promise<void> {
    if (this.active || this.parked) return;
    this.active = true;
    const p = this.options.peer;
    this.unsubscribe = [
      p.on('Ready', (r) => this.receivedReady(r)),
      p.on('Lease', (l) => {
        if (!this.ready || !sameEndpoint(l.self, this.ready.self)) return;
        if (l.hub !== this.ready.hub) {
          this.recover('hub changed');
          return;
        }
        if (l.seq <= this.seq) return;
        if (l.seq === 2147483647) {
          this.recover('lease sequence exhausted');
          return;
        }
        this.seq = l.seq;
        this.renew();
      }),
      p.on('End', (e) => {
        if (!this.ready || !sameEndpoint(e.self, this.ready.self)) return;
        if (e.reason === 'superseded') {
          this.parked = true;
          this.options.parked?.();
          this.status = 'File transfers are active in another tab';
          void this.stop();
        } else if (e.reason === 'identity') {
          this.awaitingIdentity = true;
          void this.stop();
        } else this.recover(e.reason);
      }),
      p.on('Error', (e) => {
        this.reportError();
        if (e.req === this.request?.req || e.code === 'stale-endpoint')
          this.recover(e.code, e.retryAfterMs);
      }),
    ];
    const digest = [
      ...new Uint8Array(
        await crypto.subtle.digest('SHA-256', new TextEncoder().encode(this.options.owner)),
      ),
    ]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('');
    if (!this.active) return;
    const locks = this.options.locks ?? navigator.locks;
    const grant = async () => {
      if (!this.active) return;
      this.elected = true;
      this.status = '';
      this.options.changed?.();
      this.acquiring = this.options.acquire(digest, Boolean(locks));
      await this.acquiring;
      if (!this.active) return;
      this.beginNotice();
      this.hello();
    };
    if (!locks) {
      await grant();
      return;
    }
    this.status = 'File transfers are active in another tab';
    this.options.changed?.();
    this.electionAbort = new AbortController();
    void locks
      .request(
        `file-sharing-v2:endpoint:${digest}`,
        { mode: 'exclusive', signal: this.electionAbort.signal },
        async () => {
          await grant();
          if (this.active)
            await new Promise<void>((resolve) => {
              this.unlock = resolve;
            });
        },
      )
      .catch((error) => {
        if (this.active) {
          this.status = `File transfers unavailable: ${String(error)}`;
          this.options.changed?.();
          void this.stop();
        }
      });
  }
  reportError(): void {
    const now = performance.now();
    this.errors = this.errors.filter((t) => now - t < 1000);
    this.errors.push(now);
    if (this.errors.length >= 10) this.recover('error flood');
  }
  invalidate(reason: string): void {
    this.recover(reason);
  }
  private hello(): void {
    if (!this.active || !this.elected || this.parked) return;
    const req = randomId();
    const endpoint = randomId();
    this.request = { req, endpoint };
    this.helloTimer = this.later(10000, () => this.recover('Ready timeout'));
    this.options.peer.send('Hello', {
      req,
      endpoint,
      peer: 1,
      files: 1,
      data: 1,
      features: ['base'],
      maxReceiveSize: MAX_FILE,
    });
  }
  private receivedReady(r: Ready): void {
    if (
      !this.active ||
      !this.elected ||
      r.req !== this.request?.req ||
      r.self.endpoint !== this.request.endpoint
    )
      return;
    if (this.ready) return; // A cached Ready cannot renew an online lease.
    check(r.self.player === this.options.player);
    this.clear(this.helloTimer);
    this.clear(this.notice);
    this.notice = undefined;
    this.ready = r;
    this.seq = 0;
    this.status = '';
    this.renew();
    this.clear(this.stable);
    this.stable = this.later(30000, () => {
      if (this.valid) this.attempt = 0;
    });
    this.options.ready?.(r);
    this.options.changed?.();
  }
  private renew(): void {
    this.leaseDeadline = performance.now() + 30000;
    this.clear(this.leaseTimer);
    this.leaseTimer = this.later(30000, () => this.recover('lease expired'));
  }
  private beginNotice(): void {
    if (!this.notice)
      this.notice = this.later(30000, () => {
        this.notice = undefined;
        if (!this.ready && this.active) {
          this.status = 'File transfers unavailable; retrying';
          this.options.changed?.();
        }
      });
  }
  private recover(reason: string, minimum = 0): void {
    if (!this.active || !this.elected || (!this.ready && !this.request)) return;
    this.clear(this.helloTimer);
    this.clear(this.leaseTimer);
    this.clear(this.stable);
    this.ready = undefined;
    this.request = undefined;
    this.beginNotice();
    const random = this.options.random ?? Math.random;
    const delay = Math.min(
      60000,
      Math.max(
        minimum,
        Math.min(60000, 1000 * 2 ** Math.min(this.attempt++, 6)) * (1 + random() / 4),
      ),
    );
    this.recoverStorage(reason, delay);
  }
  private recoverStorage(reason: string, delay: number): void {
    this.transition = this.transition
      .catch(() => {})
      .then(async () => {
        if (!this.active || !this.elected) return;
        try {
          await this.options.lost(reason);
          if (this.active && this.elected) this.later(delay, () => this.hello());
        } catch (error) {
          this.status = `File storage unavailable; retrying: ${String(error)}`;
          this.options.changed?.();
          if (this.active && this.elected)
            this.later(delay, () => this.recoverStorage(reason, Math.min(60000, delay * 2)));
        }
      });
  }
  async activateThisTab(): Promise<void> {
    await this.stop();
    this.parked = false;
    await this.start();
  }
  stop(): Promise<void> {
    if (this.stopping) return this.stopping;
    if (!this.active) return Promise.resolve();
    this.stopping = this.stopWork().finally(() => {
      this.stopping = undefined;
    });
    return this.stopping;
  }
  private async stopWork(): Promise<void> {
    if (!this.active) return;
    this.active = false;
    this.elected = false;
    this.ready = undefined;
    this.request = undefined;
    for (const timer of this.timers) clearTimeout(timer);
    this.timers.clear();
    this.notice = undefined;
    for (const off of this.unsubscribe) off();
    this.unsubscribe = [];
    this.electionAbort?.abort();
    try {
      await this.acquiring?.catch(() => {});
      await this.transition.catch(() => {});
      await this.options.lost(this.parked ? 'superseded' : 'stopped');
    } catch (error) {
      this.status = `File storage unavailable: ${String(error)}`;
    } finally {
      this.unlock?.();
      this.unlock = undefined;
      this.options.changed?.();
    }
  }
}
