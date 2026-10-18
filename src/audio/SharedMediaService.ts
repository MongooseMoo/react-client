import type { MediaTransport } from '../midi/score';
import type { ClientMediaUpdatePayload } from './MediaService';
import { mediaPosition } from '../midi/score';
import type { SharedClock, SharedClockChange } from '../timing/SharedClock';
import { outputDelaySeconds, performanceToAudioTime } from '../timing/outputClock';
import {
  mergeMediaCueWindows,
  MediaCueGap,
  type MediaCue,
  type MediaCueWindow,
  type MediaSyncReply,
  type MediaSyncRequest,
} from './SharedMediaPayload';

export interface SharedMediaVoice {
  readonly supportsClipLoop?: boolean;
  prepareTransport?(transport: MediaTransport): void;
  prepareSeek(seconds: number, signal: AbortSignal): Promise<void>;
  currentTime(): number;
  start(options: {
    at?: number;
    rate: number;
    offsetSeconds: number;
    loopRegion?: { startSeconds: number; endSeconds: number };
    stopAt?: number;
  }): Promise<void> | void;
  pause(): void;
  dispose(): void;
  activate?(): void;
  retire?(atAudioSeconds: number): Promise<void>;
  updateMix?(data: ClientMediaUpdatePayload): void;
}
export interface SharedMediaGrant {
  key: string;
  name: string;
  type?: string;
  tag?: string;
  title?: string;
  transport: MediaTransport;
  cueWindows?: readonly MediaCueWindow[];
}
export interface SharedMediaPresentation {
  key: string;
  sourceId: string;
  discontinuity: number;
  retainedCueIds: readonly string[];
  title: string;
  state: 'preparing' | 'playing' | 'paused' | 'unavailable';
  cues: readonly MediaCue[];
  message?: string;
}
interface Source {
  grant: SharedMediaGrant;
  voice?: SharedMediaVoice;
  factory: () => SharedMediaVoice;
  abort: AbortController;
  operation: number;
  localPaused: boolean;
  syncAt: number;
  rendering: boolean;
  occurrence: number;
  cueSignature: string;
  lastCues: readonly MediaCue[];
  preparing?: number;
  settled?: boolean;
  reportedError?: boolean;
  maxCueSeq: number;
  cueSyncPending?: Promise<void>;
  awaitingCueSnapshot?: boolean;
  presentationState?: SharedMediaPresentation['state'];
  presentationMessage?: string;
  snapshotPromise?: Promise<MediaSyncReply | undefined>;
  retryTimer?: ReturnType<typeof setTimeout>;
  retiringVoice?: SharedMediaVoice;
  retiringFactory?: () => SharedMediaVoice;
  retiringActive?: boolean;
}
interface Pending {
  source: Source;
  request: MediaSyncRequest;
  resolve: (reply: MediaSyncReply | undefined) => void;
  timer: ReturnType<typeof setTimeout>;
}
interface Options {
  clock: Pick<
    SharedClock,
    'acquire' | 'subscribe' | 'estimate' | 'getServerNow' | 'targetServerToPerformance'
  >;
  context: BaseAudioContext;
  sendSync: (request: MediaSyncRequest) => void;
  present?: (presentation: SharedMediaPresentation | { key: string; removed: true }) => void;
  error?: (
    key: string,
    message: string,
    transport: MediaTransport,
    code?: 'SEEK_UNAVAILABLE' | 'SYNC_UNAVAILABLE' | 'CAPABILITY_UNAVAILABLE',
  ) => void;
  now?: () => number;
  correctionMs?: () => number;
}
class MediaSyncUnavailable extends Error {}
export class MediaCapabilityUnavailable extends Error {}

/** File grants use the connection's clock. No wall clock or network-offset estimator lives here. */
export class SharedMediaService {
  private readonly sources = new Map<string, Source>();
  private readonly pending = new Map<string, Pending>();
  private release?: () => void;
  private unsubscribe: () => void;
  private timer?: ReturnType<typeof setInterval>;
  private serial = 0;
  private readonly requestTimes = new Map<string, number>();
  private suspended = false;
  private readonly now: () => number;
  constructor(private readonly options: Options) {
    this.now = options.now ?? (() => performance.now());
    this.unsubscribe = options.clock.subscribe((change) => this.clockChanged(change));
    options.context.addEventListener?.('statechange', this.contextChanged);
  }
  has(key: string): boolean {
    return this.sources.has(key);
  }
  acceptsTransport(key: string, transport: MediaTransport): boolean {
    const current = this.sources.get(key)?.grant.transport;
    return (
      !current ||
      current.sourceId !== transport.sourceId ||
      (current.clockId === transport.clockId && transport.revision >= current.revision)
    );
  }
  async attach(
    grant: SharedMediaGrant,
    factory: () => SharedMediaVoice,
    replaceVoice = false,
  ): Promise<void> {
    const old = this.sources.get(grant.key);
    if (old?.grant.transport.sourceId === grant.transport.sourceId) {
      if (
        grant.transport.clockId !== old.grant.transport.clockId ||
        grant.transport.revision < old.grant.transport.revision
      )
        return;
      if (!this.update(grant, replaceVoice)) return;
      if (replaceVoice && this.sources.get(grant.key) === old) {
        const audible = old.retiringVoice ?? old.voice;
        const previousFactory = old.retiringFactory ?? old.factory;
        const active = old.retiringVoice ? old.retiringActive : old.rendering;
        old.retiringVoice = undefined;
        if (old.voice && old.voice !== audible) old.voice.dispose();
        old.voice = undefined;
        this.cancelOperation(old);
        old.retiringVoice = audible;
        old.retiringFactory = previousFactory;
        old.retiringActive = active;
        old.factory = factory;
        await this.reconcile(old, true);
      }
      return;
    }
    if (old) this.remove(old);
    if (grant.transport.state === 'stopped') return;
    if (this.sources.size >= 16) throw new RangeError('Shared media source limit reached');
    const source: Source = {
      grant: {
        ...grant,
        cueWindows:
          grant.cueWindows === undefined
            ? undefined
            : mergeMediaCueWindows([], grant.cueWindows, { replace: true }),
      },
      factory,
      abort: new AbortController(),
      operation: 0,
      localPaused: false,
      syncAt: -Infinity,
      rendering: false,
      occurrence: -1,
      cueSignature: '',
      lastCues: [],
      maxCueSeq: grant.cueWindows?.at(-1)?.seq ?? -1,
    };
    this.sources.set(grant.key, source);
    if (!this.release) this.release = this.options.clock.acquire('shared file media');
    if (!this.timer) this.timer = setInterval(() => this.tick(), 100);
    await this.reconcile(source, true);
  }
  update(
    data: {
      key?: string;
      transport?: MediaTransport;
      cueWindows?: readonly MediaCueWindow[];
    },
    deferRendering = false,
  ): boolean {
    const source = data.key ? this.sources.get(data.key) : undefined;
    if (!source) return false;
    const incoming = data.transport;
    if (!incoming) source.retiringVoice?.updateMix?.(data);
    if (incoming) {
      const old = source.grant.transport;
      if (
        incoming.sourceId !== old.sourceId ||
        incoming.clockId !== old.clockId ||
        incoming.revision < old.revision
      )
        return false;
      if (
        (incoming.discontinuity ?? 0) < (old.discontinuity ?? 0) ||
        (incoming.revision === old.revision &&
          (incoming.discontinuity ?? 0) !== (old.discontinuity ?? 0))
      )
        throw new TypeError('Invalid transport discontinuity');
      let cueWindows = source.grant.cueWindows;
      if (data.cueWindows !== undefined) {
        try {
          cueWindows = mergeMediaCueWindows(cueWindows ?? [], data.cueWindows, {
            replace: incoming.revision > old.revision,
            maxSeq: source.maxCueSeq,
          });
        } catch (error) {
          if (error instanceof MediaCueGap) {
            this.syncCues(source);
            return false;
          }
          throw error;
        }
        source.maxCueSeq = Math.max(source.maxCueSeq, data.cueWindows.at(-1)?.seq ?? -1);
      }
      source.retiringVoice?.updateMix?.(data);
      if (incoming.revision === old.revision) {
        source.grant = { ...source.grant, cueWindows };
        if (data.cueWindows !== undefined) this.acceptCueCoverage(source);
        this.cues(source);
        return true;
      }
      source.grant = { ...source.grant, transport: incoming, cueWindows };
      if (
        (incoming.discontinuity ?? 0) > (old.discontinuity ?? 0) &&
        data.cueWindows === undefined &&
        cueWindows !== undefined
      ) {
        source.awaitingCueSnapshot = true;
        source.cueSignature = '';
        this.present(
          source,
          source.localPaused || this.suspended ? 'paused' : 'preparing',
          undefined,
          [],
        );
      }
      if (data.cueWindows !== undefined) this.acceptCueCoverage(source);
      source.reportedError = false;
      if (incoming.state === 'stopped') {
        this.remove(source);
        return true;
      }
      if (deferRendering) return true;
      this.cancelOperation(source);
      void this.reconcile(source, false);
      if (source.awaitingCueSnapshot) this.syncCues(source);
    }
    return true;
  }
  receiveSync(reply: MediaSyncReply): boolean {
    const p = this.pending.get(reply.requestId);
    if (!p || p.request.key !== reply.key || p.request.sourceId !== reply.sourceId) return false;
    const current = p.source.grant.transport;
    if (reply.transport.clockId !== current.clockId || reply.transport.revision < current.revision)
      return false;
    if (
      (reply.transport.discontinuity ?? 0) < (current.discontinuity ?? 0) ||
      (reply.transport.revision === current.revision &&
        (reply.transport.discontinuity ?? 0) !== (current.discontinuity ?? 0))
    )
      return false;
    const cueWindows =
      reply.cueWindows === undefined
        ? undefined
        : mergeMediaCueWindows(p.source.grant.cueWindows ?? [], reply.cueWindows, {
            replace: true,
            maxSeq: p.source.maxCueSeq,
          });
    this.pending.delete(reply.requestId);
    clearTimeout(p.timer);
    p.resolve({ ...reply, ...(cueWindows === undefined ? {} : { cueWindows }) });
    return true;
  }
  private applySnapshot(source: Source, reply: MediaSyncReply): void {
    if (
      (reply.transport.discontinuity ?? 0) > (source.grant.transport.discontinuity ?? 0) &&
      reply.cueWindows === undefined &&
      source.grant.cueWindows !== undefined
    )
      source.awaitingCueSnapshot = true;
    source.grant = {
      ...source.grant,
      transport: reply.transport,
      ...(reply.cueWindows === undefined ? {} : { cueWindows: reply.cueWindows }),
    };
    source.maxCueSeq = Math.max(source.maxCueSeq, reply.cueWindows?.at(-1)?.seq ?? -1);
    if (reply.cueWindows !== undefined) this.acceptCueCoverage(source);
    if (reply.transport.state === 'stopped') this.remove(source);
  }
  private acceptCueCoverage(source: Source): void {
    const now = this.options.clock.getServerNow();
    if (now === undefined) return;
    const position = mediaPosition(source.grant.transport, now).unwrappedMs;
    if (
      source.grant.cueWindows?.some((window) => window.fromMs <= position && position < window.toMs)
    )
      source.awaitingCueSnapshot = false;
  }
  private syncCues(source: Source): void {
    if (source.cueSyncPending) return;
    const operation = source.operation;
    source.cueSyncPending = this.snapshot(source)
      .then((reply) => {
        if (!reply || !this.current(source, operation)) return;
        const changed = reply.transport.revision > source.grant.transport.revision;
        this.applySnapshot(source, reply);
        if (this.sources.get(source.grant.key) !== source) return;
        if (changed) {
          this.cancelOperation(source);
          void this.reconcile(source, false);
        } else this.cues(source);
      })
      .finally(() => {
        source.cueSyncPending = undefined;
      });
  }
  localPause(key: string): void {
    const source = this.sources.get(key);
    if (!source) return;
    source.localPaused = true;
    this.cancelOperation(source);
    this.present(source, 'paused');
  }
  async localResume(key: string): Promise<void> {
    const source = this.sources.get(key);
    if (!source) return;
    this.cancelOperation(source);
    source.localPaused = false;
    await this.reconcile(source, true);
  }
  setSuspended(value: boolean): void {
    if (this.suspended === value) return;
    this.suspended = value;
    for (const source of this.sources.values()) {
      this.cancelOperation(source);
      if (!value && !source.localPaused) void this.reconcile(source, true);
      else this.present(source, 'paused');
    }
  }
  stop(selectors: { key?: string; name?: string; type?: string; tag?: string }): void {
    const all = !selectors.key && !selectors.name && !selectors.type && !selectors.tag;
    for (const source of [...this.sources.values()]) {
      const g = source.grant;
      if (
        all ||
        g.key === selectors.key ||
        (selectors.name !== undefined && g.name === selectors.name) ||
        (selectors.type !== undefined && g.type === selectors.type) ||
        (selectors.tag !== undefined && g.tag === selectors.tag)
      )
        this.remove(source);
    }
  }
  reset(): void {
    for (const source of [...this.sources.values()]) this.remove(source);
  }
  shutdown(): void {
    this.reset();
    this.unsubscribe();
    this.options.context.removeEventListener?.('statechange', this.contextChanged);
  }
  private readonly contextChanged = (): void => {
    for (const source of this.sources.values()) {
      this.cancelOperation(source);
      if (this.options.context.state === 'running' && !this.suspended && !source.localPaused)
        void this.reconcile(source, true);
      else if (this.suspended || source.localPaused) this.present(source, 'paused');
      else this.present(source, 'preparing', 'Audio requires Resume');
    }
  };
  private current(source: Source, operation: number): boolean {
    return (
      this.sources.get(source.grant.key) === source &&
      source.operation === operation &&
      !source.abort.signal.aborted
    );
  }
  private cancelOperation(source: Source): void {
    clearTimeout(source.retryTimer);
    source.retryTimer = undefined;
    source.snapshotPromise = undefined;
    source.operation++;
    source.abort.abort();
    source.abort = new AbortController();
    source.voice?.pause();
    source.retiringVoice?.pause();
    source.retiringActive = false;
    source.rendering = false;
    source.settled = false;
    for (const [id, p] of this.pending)
      if (p.source === source) {
        clearTimeout(p.timer);
        this.pending.delete(id);
        p.resolve(undefined);
      }
  }
  private remove(source: Source): void {
    this.cancelOperation(source);
    this.sources.delete(source.grant.key);
    source.voice?.dispose();
    source.retiringVoice?.dispose();
    source.retiringVoice = undefined;
    source.retiringFactory = undefined;
    this.options.present?.({ key: source.grant.key, removed: true });
    if (!this.sources.size) {
      this.release?.();
      this.release = undefined;
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
  private retirePrevious(source: Source, at: number): void {
    const previous = source.retiringVoice;
    if (!previous) return;
    const finish = () => {
      previous.dispose();
      if (source.retiringVoice === previous) {
        source.retiringVoice = undefined;
        source.retiringFactory = undefined;
        source.retiringActive = false;
      }
    };
    if (previous.retire) void previous.retire(at).then(finish, finish);
    else {
      previous.pause();
      finish();
    }
  }
  private snapshot(source: Source): Promise<MediaSyncReply | undefined> {
    if (source.snapshotPromise) return source.snapshotPromise;
    const promise = this.sendSnapshot(source);
    source.snapshotPromise = promise;
    void promise.then(
      () => {
        if (source.snapshotPromise === promise) source.snapshotPromise = undefined;
      },
      () => {
        if (source.snapshotPromise === promise) source.snapshotPromise = undefined;
      },
    );
    return promise;
  }
  private async sendSnapshot(source: Source): Promise<MediaSyncReply | undefined> {
    const operation = source.operation,
      signal = source.abort.signal;
    while (this.current(source, operation)) {
      const now = this.now();
      for (const [key, time] of this.requestTimes)
        if (time <= now - 1000) this.requestTimes.delete(key);
      const globalDelay =
        this.requestTimes.size >= 16 ? Math.min(...this.requestTimes.values()) + 1000 - now : 0;
      const delay = Math.max(
        (this.requestTimes.get(source.grant.key) ?? -Infinity) + 1000 - now,
        globalDelay,
      );
      if (delay <= 0) break;
      await new Promise<void>((resolve) => {
        const timer = setTimeout(done, delay);
        function done() {
          clearTimeout(timer);
          signal.removeEventListener('abort', done);
          resolve();
        }
        signal.addEventListener('abort', done, { once: true });
      });
    }
    if (!this.current(source, operation) || signal.aborted) return undefined;
    source.syncAt = this.now();
    this.requestTimes.set(source.grant.key, source.syncAt);
    const request = {
      key: source.grant.key,
      sourceId: source.grant.transport.sourceId,
      requestId: `media:${++this.serial}`,
    };
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.pending.delete(request.requestId);
        resolve(undefined);
      }, 2000);
      this.pending.set(request.requestId, { source, request, resolve, timer });
      this.options.sendSync(request);
    });
  }
  private async reconcile(source: Source, fresh: boolean): Promise<void> {
    const operation = source.operation,
      signal = source.abort.signal;
    if (this.suspended || source.localPaused || source.preparing === operation) return;
    clearTimeout(source.retryTimer);
    source.retryTimer = undefined;
    const serverNow = this.options.clock.getServerNow();
    if (serverNow === undefined) {
      this.present(source, 'preparing', 'Measuring shared time');
      return;
    }
    if (this.options.clock.estimate().clockId !== source.grant.transport.clockId) {
      this.remove(source);
      return;
    }
    source.preparing = operation;
    this.present(source, 'preparing');
    const deadline = setTimeout(() => {
      if (!this.current(source, operation)) return;
      const previous = source.retiringActive ? source.retiringVoice : undefined,
        previousFactory = source.retiringFactory;
      if (previous) source.retiringVoice = undefined;
      this.cancelOperation(source);
      if (previous) {
        source.voice?.dispose();
        source.voice = previous;
        source.factory = previousFactory ?? source.factory;
        source.retiringFactory = undefined;
        source.voice.activate?.();
        source.rendering = true;
        source.settled = true;
        this.present(source, 'playing', 'Keeping the current source; its replacement timed out');
        return;
      }
      source.settled = true;
      this.present(source, 'unavailable', 'Shared media preparation timed out');
    }, 15000);
    try {
      source.voice ??= source.factory();
      const voice = source.voice;
      if (source.grant.transport.loop && voice.supportsClipLoop !== true)
        throw new MediaCapabilityUnavailable(
          'Shared clip loops require a prepared native buffer source; HTML clip loops are unsupported',
        );
      voice.prepareTransport?.(source.grant.transport);
      if (source.grant.transport.mode === 'finite') {
        const initialPosition = mediaPosition(source.grant.transport, serverNow);
        if (!initialPosition.terminal)
          await voice.prepareSeek(initialPosition.positionMs / 1000, signal);
        if (!this.current(source, operation)) return;
      }
      if (fresh) {
        let reply: MediaSyncReply | undefined;
        for (let attempt = 0; attempt < 3 && !reply; attempt++) {
          reply = await this.snapshot(source);
          if (!this.current(source, operation)) return;
        }
        if (!reply) throw new MediaSyncUnavailable('Waiting for a fresh shared media snapshot');
        this.applySnapshot(source, reply);
        if (this.sources.get(source.grant.key) !== source) return;
      }
      for (let attempt = 0; attempt < 4; attempt++) {
        const now = this.options.clock.getServerNow();
        if (now === undefined) {
          this.present(source, 'preparing', 'Shared clock unavailable');
          return;
        }
        const transport = source.grant.transport;
        const correction = this.options.correctionMs?.() ?? 0;
        const targetServerMs =
          transport.state === 'playing'
            ? Math.max(
                transport.anchorServerMs,
                now + 250 * 2 ** attempt + Math.max(0, -correction),
              )
            : now;
        const position = mediaPosition(transport, targetServerMs);
        if (position.terminal || position.state === 'stopped') {
          this.remove(source);
          return;
        }
        if (transport.loop && voice.supportsClipLoop !== true)
          throw new MediaCapabilityUnavailable(
            'Shared clip loops require a prepared native buffer source; HTML clip loops are unsupported',
          );
        voice.prepareTransport?.(transport);
        if (transport.mode === 'finite') {
          await voice.prepareSeek(position.positionMs / 1000, signal);
          if (!this.current(source, operation)) return;
          const after = this.options.clock.getServerNow();
          if (after === undefined) return;
          if (Math.abs(voice.currentTime() * 1000 - position.positionMs) > 250) {
            if (attempt < 3) continue;
            throw new Error('Shared media seek did not converge');
          }
        }
        source.occurrence = position.occurrence;
        if (position.state !== 'playing') {
          this.retirePrevious(source, this.options.context.currentTime);
          source.settled = true;
          this.present(source, position.state === 'preparing' ? 'preparing' : 'paused');
          this.cues(source);
          return;
        }
        const target = this.options.clock.targetServerToPerformance(targetServerMs);
        const context = this.options.context;
        const timestamp =
          'getOutputTimestamp' in context && typeof context.getOutputTimestamp === 'function'
            ? (context.getOutputTimestamp() as AudioTimestamp)
            : undefined;
        const outputTimestamp =
          timestamp?.contextTime !== undefined && timestamp.performanceTime !== undefined
            ? { contextTime: timestamp.contextTime, performanceTime: timestamp.performanceTime }
            : undefined;
        const mapping =
          target === undefined
            ? undefined
            : performanceToAudioTime(
                target,
                {
                  running: context.state === 'running',
                  currentTime: context.currentTime,
                  performanceNowMs: this.now(),
                  outputTimestamp,
                },
                correction,
              );
        if (!mapping) {
          this.present(source, 'preparing', 'Audio requires Resume');
          return;
        }
        if (mapping.audioTime < this.options.context.currentTime + 0.02) {
          if (attempt < 3) continue;
          throw new Error('Shared media seek preparation exceeded its scheduling lead');
        }
        const terminalMs = transport.loop
          ? transport.loop.plays === -1
            ? undefined
            : transport.loop.startMs +
              transport.loop.plays * (transport.loop.endMs - transport.loop.startMs)
          : transport.durationMs;
        clearTimeout(deadline);
        voice.activate?.();
        await voice.start({
          at: Math.max(context.currentTime, mapping.audioTime),
          rate: transport.rate,
          offsetSeconds: position.positionMs / 1000,
          ...(transport.loop
            ? {
                loopRegion: {
                  startSeconds: transport.loop.startMs / 1000,
                  endSeconds: transport.loop.endMs / 1000,
                },
              }
            : {}),
          ...(terminalMs === undefined
            ? {}
            : {
                stopAt:
                  mapping.audioTime + (terminalMs - position.unwrappedMs) / 1000 / transport.rate,
              }),
        });
        if (!this.current(source, operation)) {
          voice.pause();
          return;
        }
        this.retirePrevious(source, mapping.audioTime);
        source.rendering = true;
        source.settled = true;
        this.present(source, 'playing');
        this.cues(source);
        return;
      }
    } catch (error) {
      if (!this.current(source, operation) || signal.aborted) return;
      source.voice?.pause();
      source.rendering = false;
      source.settled = true;
      if (
        source.retiringVoice &&
        source.retiringActive &&
        !(error instanceof MediaSyncUnavailable)
      ) {
        source.voice?.dispose();
        source.voice = source.retiringVoice;
        source.factory = source.retiringFactory ?? source.factory;
        source.retiringVoice = undefined;
        source.retiringFactory = undefined;
        source.retiringActive = false;
        source.voice.activate?.();
        source.rendering = true;
        this.present(
          source,
          'playing',
          'Keeping the current source; its replacement could not be prepared',
        );
        return;
      }
      if (error instanceof MediaSyncUnavailable) {
        source.settled = false;
        this.present(source, source.retiringActive ? 'playing' : 'preparing', error.message);
        source.retryTimer = setTimeout(() => {
          source.retryTimer = undefined;
          if (this.current(source, operation)) void this.reconcile(source, true);
        }, 5000);
        return;
      }
      const message =
        error instanceof Error && error.name === 'NotAllowedError'
          ? 'Audio blocked; use Resume to join current playback'
          : error instanceof Error
            ? error.message
            : 'Shared media unavailable';
      this.present(source, 'unavailable', message);
      if (!source.reportedError && !(error instanceof Error && error.name === 'NotAllowedError')) {
        source.reportedError = true;
        this.options.error?.(
          source.grant.key,
          message,
          source.grant.transport,
          error instanceof MediaCapabilityUnavailable
            ? 'CAPABILITY_UNAVAILABLE'
            : 'SEEK_UNAVAILABLE',
        );
      }
    } finally {
      clearTimeout(deadline);
      if (source.preparing === operation) source.preparing = undefined;
    }
  }
  private clockChanged(change: SharedClockChange): void {
    for (const source of [...this.sources.values()]) {
      if (change.estimate.clockId && change.estimate.clockId !== source.grant.transport.clockId) {
        this.remove(source);
        continue;
      }
      if (change.estimate.status !== 'current' || change.correction === 'rejoin') {
        this.cancelOperation(source);
        this.present(source, 'preparing', 'Measuring shared time');
      }
      if (
        change.estimate.status === 'current' &&
        !source.rendering &&
        !source.settled &&
        !source.localPaused &&
        !this.suspended
      )
        void this.reconcile(source, true);
    }
  }
  private tick(): void {
    for (const source of [...this.sources.values()]) {
      if (this.suspended || source.localPaused) continue;
      if (source.settled && !source.rendering && source.grant.transport.state === 'playing')
        continue;
      this.cues(source);
      const now = this.options.clock.getServerNow();
      if (now === undefined) continue;
      const p = mediaPosition(
        source.grant.transport,
        Math.max(0, now - (source.rendering ? (this.options.correctionMs?.() ?? 0) : 0)),
      );
      if (p.terminal) {
        this.remove(source);
        continue;
      }
      if (source.rendering && !source.snapshotPromise && this.now() - source.syncAt >= 10000) {
        // Snapshot requests are bounded per key; only correct audible drift outside 250 ms.
        void this.snapshot(source).then((reply) => {
          if (!reply || this.sources.get(source.grant.key) !== source) return;
          if (reply.transport.revision < source.grant.transport.revision) return;
          this.applySnapshot(source, reply);
          if (this.sources.get(source.grant.key) !== source) return;
          const current = this.options.clock.getServerNow();
          const context = this.options.context;
          const timestamp =
            'getOutputTimestamp' in context && typeof context.getOutputTimestamp === 'function'
              ? (context.getOutputTimestamp() as AudioTimestamp)
              : undefined;
          const outputDelayMs =
            outputDelaySeconds({
              running: context.state === 'running',
              currentTime: context.currentTime,
              performanceNowMs: this.now(),
              outputTimestamp:
                timestamp?.contextTime !== undefined && timestamp.performanceTime !== undefined
                  ? {
                      contextTime: timestamp.contextTime,
                      performanceTime: timestamp.performanceTime,
                    }
                  : undefined,
            }) * 1000;
          if (
            current !== undefined &&
            (reply.transport.state !== 'playing' ||
              (reply.transport.mode === 'finite' &&
                Math.abs(
                  mediaPosition(
                    reply.transport,
                    Math.max(0, current - (this.options.correctionMs?.() ?? 0) + outputDelayMs),
                  ).positionMs -
                    (source.voice?.currentTime() ?? 0) * 1000,
                ) > 250))
          ) {
            this.cancelOperation(source);
            void this.reconcile(source, false);
          }
        });
      }
    }
  }
  private cues(source: Source): void {
    if (source.localPaused || this.suspended) return;
    if (source.presentationState !== 'playing' && source.presentationState !== 'paused') return;
    const now = this.options.clock.getServerNow();
    if (now === undefined) return;
    const p = mediaPosition(source.grant.transport, now);
    const transport = source.grant.transport;
    const covered =
      source.grant.cueWindows?.some(
        (window) => window.fromMs <= p.unwrappedMs && p.unwrappedMs < window.toMs,
      ) ?? false;
    if (source.grant.cueWindows !== undefined && (source.awaitingCueSnapshot || !covered))
      this.syncCues(source);
    const eligible =
      !source.awaitingCueSnapshot &&
      covered &&
      (transport.state === 'paused' ||
        (transport.state === 'playing' && now >= transport.anchorServerMs));
    const distinct = new Map<string, MediaCue>();
    if (eligible)
      for (const window of source.grant.cueWindows ?? [])
        for (const cue of window.cues)
          if (cue.startMs <= p.unwrappedMs && cue.endMs > p.unwrappedMs) distinct.set(cue.id, cue);
    const cues = [...distinct.values()];
    const signature = `${transport.discontinuity ?? 0}:${cues.map((c) => c.id).join(',')}`;
    if (signature === source.cueSignature) return;
    source.cueSignature = signature;
    this.present(source, source.presentationState, source.presentationMessage, cues);
  }
  private present(
    source: Source,
    state: SharedMediaPresentation['state'],
    message?: string,
    cues?: readonly MediaCue[],
  ): void {
    source.presentationState = state;
    source.presentationMessage = message;
    const currentCues =
      cues ?? (state === 'preparing' || state === 'unavailable' ? [] : source.lastCues);
    if ((state === 'preparing' || state === 'unavailable') && cues === undefined)
      source.cueSignature = '';
    source.lastCues = currentCues;
    this.options.present?.({
      key: source.grant.key,
      sourceId: source.grant.transport.sourceId,
      discontinuity: source.grant.transport.discontinuity ?? 0,
      retainedCueIds: [
        ...new Set(
          (source.grant.cueWindows ?? []).flatMap((window) => window.cues.map((cue) => cue.id)),
        ),
      ],
      title: source.grant.title ?? source.grant.name,
      state,
      cues: currentCues,
      message,
    });
  }
}
