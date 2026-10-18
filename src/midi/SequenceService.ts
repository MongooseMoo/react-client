import { performanceToAudioTime } from '../timing/outputClock';
import type { SequenceMix } from './SequenceGraph';
import type { SequenceOutput, SequenceVoice } from './SequenceOutput';
import type { SequenceData, SequenceWindow } from './SequencePayload';
import {
  ScoreTimeline,
  SourceRevisionGate,
  nextMeterBoundary,
  type CanonicalScore,
  type ScoreLoop,
  type ScorePart,
  type ScoreTransport,
  type SourceVersion,
} from './score';

export interface SequenceClock {
  acquire(id: string): () => void;
  subscribe(listener: () => void): () => void;
  estimate(): { clockId: string | null; status: string; offsetMs: number | null };
  getServerNow(): number | undefined;
  targetServerToPerformance(time: number): number | undefined;
  invalidate?(): void;
}
export interface SequenceMixer {
  readonly context: BaseAudioContext;
  part(id: string): {
    input: AudioNode;
    control(controller: number, value: number, time: number): void;
  };
  update(mix: SequenceMix): void;
  cancelFrom(time: number): void;
  prune(): void;
  retainParts?(ids: ReadonlySet<string>): void;
  fade(): void;
  route(destroying?: string): void;
  dispose(): void;
}
export interface SequencePlay extends SequenceMix {
  key: string;
  contentId: string;
  midi: SequenceData;
  transport: ScoreTransport;
  tag?: string;
}
export interface SequenceUpdate extends SequenceMix {
  key?: string;
  contentId?: string;
  midi?: SequenceData;
  transport?: ScoreTransport;
  replaceFromTick?: number;
  effectiveServerMs?: number;
}
interface Material {
  data: SequenceData;
  transport: ScoreTransport;
  contentId: string;
}
interface Document {
  score: CanonicalScore;
  timeline: ScoreTimeline;
  from: number;
  seq: number;
  material: Material;
  window?: SequenceWindow;
  chased?: { tick: number; parts: { id: string; values: number[] }[] };
}
interface OwnedVoice {
  voice: SequenceVoice;
  start: number;
  tick: number;
  endTick: number;
  part: ScorePart;
  document: Document;
  releaseScheduled: boolean;
  releaseBudget: () => void;
  pedalHeld?: boolean;
  keyEndServerMs?: number;
}
interface Source {
  key: string;
  tag?: string;
  gate: SourceRevisionGate;
  active: Material;
  pending?: Material;
  pendingLate?: boolean;
  generation: number;
  abort: AbortController;
  output?: SequenceOutput;
  graph?: SequenceMixer;
  releaseClock?: () => void;
  preparing?: Promise<void>;
  offset?: number;
  releaseAdmission?: () => void;
  joinServerMs?: number;
  needsJoin: boolean;
  ready: boolean;
  voices: Map<string, OwnedVoice>;
  submitted: Map<string, number>;
  progress: Map<string, number>;
  workRemaining: number;
  mix: SequenceMix;
}
interface Options {
  clock: SequenceClock;
  getOutput(): Promise<SequenceOutput | null>;
  createGraph(mix: SequenceMix): Promise<SequenceMixer>;
  now?: () => number;
  correctionMs?: () => number;
  error?: (key: string, message: string) => void;
  sync?: (key: string, sourceId: string) => void;
  budget?: SequenceBudget;
}

/** Shared by world playback and private auditions in this browser client. */
export class SequenceBudget {
  private sourceCount = 0;
  private voiceCount = 0;
  get remainingVoices(): number {
    return 256 - this.voiceCount;
  }
  acquireSource(): (() => void) | undefined {
    if (this.sourceCount >= 8) return undefined;
    this.sourceCount++;
    let released = false;
    return () => {
      if (!released) {
        released = true;
        this.sourceCount--;
      }
    };
  }
  reserveVoice(): (() => void) | undefined {
    if (this.voiceCount >= 256) return undefined;
    this.voiceCount++;
    let released = false;
    return () => {
      if (!released) {
        released = true;
        this.voiceCount--;
      }
    };
  }
}
export const sharedSequenceBudget = new SequenceBudget();

/** Pedal state at key release, followed by its first pedal-up. */
const pedalMaps = new WeakMap<ScorePart, readonly { tick: number; down: boolean }[]>();
function pedals(part: ScorePart): readonly { tick: number; down: boolean }[] {
  const cached = pedalMaps.get(part);
  if (cached) return cached;
  const events: { tick: number; down: boolean }[] = [];
  let down = false;
  for (const event of part.controls)
    if (event.controller === 64 && event.value >= 64 !== down) {
      down = event.value >= 64;
      events.push({ tick: event.tick, down });
    }
  pedalMaps.set(part, events);
  return events;
}
function pedalAt(part: ScorePart, tick: number) {
  const events = pedals(part);
  let low = 0,
    high = events.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (events[middle].tick <= tick) low = middle + 1;
    else high = middle;
  }
  return { events, index: low - 1, down: low > 0 && events[low - 1].down };
}
export function noteReleaseTick(
  part: ScorePart,
  endTick: number,
  finiteEnd?: number,
): number | undefined {
  const state = pedalAt(part, endTick);
  return state.down ? (state.events[state.index + 1]?.tick ?? finiteEnd) : endTick;
}

/** Chase loop-start pedal state; never inspect a nonplaying authored suffix. */
export function loopReleaseTick(
  part: ScorePart,
  endTick: number,
  timeline: ScoreTimeline,
  loop: ScoreLoop,
): number | undefined {
  const position = timeline.contentPosition(endTick);
  if (position.terminal) return endTick;
  const state = pedalAt(part, position.tick);
  if (!state.down) return endTick;
  const next = state.events[state.index + 1];
  if (next && next.tick < loop.endTick) return endTick + next.tick - position.tick;
  const length = loop.endTick - loop.startTick;
  const boundary =
    endTick < loop.startTick ? loop.startTick : loop.startTick + (position.occurrence + 1) * length;
  if (timeline.terminalTick !== undefined && boundary >= timeline.terminalTick)
    return timeline.terminalTick;
  const start = pedalAt(part, loop.startTick);
  if (!start.down) return boundary;
  const candidate = start.events[start.index + 1];
  const up = candidate && candidate.tick < loop.endTick ? candidate : undefined;
  return up ? boundary + up.tick - loop.startTick : timeline.terminalTick;
}

/** A granted source owns all its future voices and automation; content never grants playback. */
export class SequenceService {
  private readonly sources = new Map<string, Source>();
  private readonly unsubscribe: () => void;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private suspended = false;
  private closed = false;
  private readonly budget: SequenceBudget;
  private readonly documentCache = new WeakMap<Material, Document[]>();
  private context: BaseAudioContext | undefined;
  private readonly retiring = new Set<() => void>();
  private readonly now: () => number;
  constructor(private readonly options: Options) {
    this.now = options.now ?? (() => performance.now());
    this.budget = options.budget ?? sharedSequenceBudget;
    this.unsubscribe = options.clock.subscribe(() => this.clockChanged());
  }
  has(key: string): boolean {
    return this.sources.has(key);
  }
  version(key: string): SourceVersion | undefined {
    return this.sources.get(key)?.gate.active;
  }
  private identity(material: Material): SourceVersion {
    return { ...material.transport, contentId: material.contentId };
  }

  async play(data: SequencePlay): Promise<void> {
    if (this.closed) return;
    const material: Material = {
      data: data.midi,
      contentId: data.contentId,
      transport: data.transport,
    };
    const previous = this.sources.get(data.key);
    if (previous?.active.transport.sourceId === data.transport.sourceId) {
      this.update(data);
      return;
    }
    if (previous) this.remove(previous);
    const gate = new SourceRevisionGate();
    const runtime = this.options.clock.estimate().clockId ?? data.transport.clockId;
    if (gate.play(this.identity(material), runtime) === 'rejected') return;
    const source: Source = {
      key: data.key,
      tag: data.tag,
      gate,
      active: material,
      generation: 0,
      abort: new AbortController(),
      needsJoin: true,
      ready: false,
      voices: new Map(),
      submitted: new Map(),
      progress: new Map(),
      workRemaining: 20000,
      mix: data,
    };
    this.sources.set(data.key, source);
    if (data.transport.state === 'stopped') {
      this.remove(source);
      return;
    }
    if (
      !this.suspended &&
      (data.transport.state === 'playing' || data.transport.state === 'preparing')
    )
      await this.prepare(source);
  }

  update(data: SequenceUpdate): void {
    const source = data.key ? this.sources.get(data.key) : undefined;
    if (!source) return;
    // Mix-only movement never seeks, restarts, recompiles or grants a source.
    if (!data.transport) {
      source.mix = { ...source.mix, ...data };
      source.graph?.update(data);
      return;
    }
    const transport = data.transport;
    if (
      transport.sourceId !== source.active.transport.sourceId ||
      transport.clockId !== source.active.transport.clockId
    )
      return;
    const contentId = data.contentId ?? source.active.contentId;
    const next: Material = { transport, contentId, data: data.midi ?? source.active.data };
    if (data.replaceFromTick !== undefined && data.effectiveServerMs !== undefined) {
      if (!data.midi) return;
      const now = this.options.clock.getServerNow();
      if (now === undefined) return;
      const previousBoundary = source.gate.pending?.effectiveServerMs;
      const decision = source.gate.replaceFuture(
        {
          ...this.identity(next),
          replaceFromTick: data.replaceFromTick,
          effectiveServerMs: data.effectiveServerMs,
        },
        now,
      );
      if (decision !== 'pending' && decision !== 'late-replacement') return;
      const superseded = source.pending,
        oldBoundary = previousBoundary;
      source.pending = next;
      source.pendingLate = decision === 'late-replacement';
      const boundary = this.audioTime(source, data.effectiveServerMs);
      if (boundary !== undefined) {
        source.graph?.cancelFrom(Math.max(source.graph.context.currentTime, boundary));
        for (const owned of source.voices.values())
          if (owned.document.material === superseded || owned.tick >= data.replaceFromTick)
            owned.voice.stop();
        for (const [id, time] of source.submitted)
          if (time >= Math.min(data.effectiveServerMs, oldBoundary ?? Infinity))
            source.submitted.delete(id);
        for (const [id, time] of source.progress)
          source.progress.set(id, Math.min(time, data.effectiveServerMs, oldBoundary ?? Infinity));
        // Already committed output cannot be recalled in the past. Take the safe join path.
        if (boundary <= (source.output?.context.currentTime ?? 0) + 0.2) source.pendingLate = true;
      }
      void this.prepareMaterial(source, next)
        .then(() => {
          if (source.pending !== next || !this.current(source)) return;
          if (!source.pendingLate)
            for (const doc of this.documents(next))
              this.chase(source, doc, data.effectiveServerMs ?? now);
          this.wake();
        })
        .catch((error) => {
          if (source.pending === next) this.fail(source, error);
        });
      this.wake();
      return;
    }
    const decision = source.gate.update(this.identity(next));
    if (decision === 'rejected' || decision === 'stale') return;
    if (decision === 'unchanged') {
      // Generated retransmission adds immutable windows without resetting the prefix.
      if (data.midi && 'stream' in data.midi && 'stream' in source.active.data) {
        this.mergeWindows(source, data.midi);
        const material = source.active;
        void this.prepareMaterial(source, material)
          .then(() => this.wake())
          .catch((error) => {
            if (source.active === material) this.fail(source, error);
          });
      }
      source.mix = { ...source.mix, ...data };
      source.graph?.update(data);
      this.wake();
      return;
    }
    this.cancelWork(source);
    source.generation++;
    source.abort.abort();
    source.abort = new AbortController();
    source.preparing = undefined;
    source.ready = false;
    source.pending = undefined;
    source.pendingLate = false;
    source.active = next;
    source.needsJoin = true;
    source.mix = { ...source.mix, ...data };
    source.graph?.update(data);
    if (transport.state === 'stopped') {
      this.remove(source);
      return;
    }
    if (transport.state === 'paused') {
      this.park(source);
      return;
    }
    void this.prepare(source).catch((error) => this.fail(source, error));
  }

  private mergeWindows(source: Source, data: Extract<SequenceData, { stream: true }>): void {
    if (!('stream' in source.active.data)) return;
    const windows = new Map(source.active.data.windows.map((window) => [window.seq, window]));
    for (const window of data.windows) {
      const existing = windows.get(window.seq);
      if (existing && JSON.stringify(existing) !== JSON.stringify(window)) {
        this.fail(source, new Error('Changed retransmitted music window'));
        return;
      }
      windows.set(window.seq, window);
    }
    const retained = [...windows.values()].sort((a, b) => a.seq - b.seq).slice(-5);
    if (
      new Set(retained.flatMap((window) => window.score.parts.map((part) => part.id))).size > 16
    ) {
      this.fail(source, new Error('Stream part limit exceeded'));
      return;
    }
    if (
      retained.some((window, index) => index > 0 && window.fromTick < retained[index - 1].toTick)
    ) {
      this.fail(source, new Error('Overlapping generated music windows'));
      return;
    }
    const bytes = new TextEncoder().encode(JSON.stringify(retained)).byteLength;
    const events = retained.reduce(
      (sum, w) =>
        sum +
        w.score.tempos.length +
        w.score.meters.length +
        w.score.parts.reduce(
          (n, p) =>
            n + p.notes.length + p.controls.length + p.programs.length + (p.bends?.length ?? 0),
          0,
        ),
      0,
    );
    if (bytes > 65536 || events > 8000) {
      this.fail(source, new Error('Music window ring limit exceeded'));
      return;
    }
    source.active = { ...source.active, data: { version: 1, stream: true, windows: retained } };
  }

  private async prepare(source: Source): Promise<void> {
    if (source.preparing) return source.preparing;
    if (!source.releaseClock)
      source.releaseClock = this.options.clock.acquire(`score:${source.key}`);
    const generation = source.generation;
    const work = (async () => {
      if (!source.output) {
        source.releaseAdmission ??= this.budget.acquireSource();
        if (!source.releaseAdmission) throw new Error('Music source limit reached');
        const output = await this.options.getOutput();
        if (!this.current(source, generation)) {
          output?.dispose?.();
          return;
        }
        if (!output) throw new Error('Selected MIDI output cannot render shared scores');
        source.output = output;
        if (this.context !== output.context) {
          this.context?.removeEventListener('statechange', this.contextChanged);
          this.context = output.context;
          this.context.addEventListener('statechange', this.contextChanged);
        }
      }
      await this.prepareMaterial(source, source.active);
      if (!this.current(source, generation)) return;
      if (!source.graph) {
        const graph = await this.options.createGraph(source.mix);
        if (!this.current(source, generation)) {
          graph.dispose();
          return;
        }
        if (graph.context !== source.output?.context) {
          graph.dispose();
          throw new Error('MIDI score must share the client audio context');
        }
        source.graph = graph;
      }
      source.ready = true;
      this.wake();
    })();
    source.preparing = work;
    try {
      await work;
    } catch (error) {
      if (this.current(source, generation)) this.fail(source, error);
    } finally {
      if (source.preparing === work) source.preparing = undefined;
    }
  }
  private async prepareMaterial(source: Source, material: Material): Promise<void> {
    if ('content' in material.data)
      throw new Error(
        'Score asset delivery is unavailable until its authenticated endpoint is configured',
      );
    for (const document of this.documents(material)) {
      for (const part of document.score.parts) {
        if (
          part.bends?.length ||
          part.controls.some((c) => ![7, 10, 11, 64].includes(c.controller))
        )
          throw new Error('Score requires unsupported pitch bend or controller');
      }
      await source.output?.prepare(document.score.parts, source.abort.signal);
    }
  }
  private current(source: Source, generation = source.generation): boolean {
    return (
      this.sources.get(source.key) === source &&
      source.generation === generation &&
      !source.abort.signal.aborted
    );
  }

  private documents(material: Material): Document[] {
    const cached = this.documentCache.get(material);
    if (cached) return cached;
    let documents: Document[] = [];
    if ('score' in material.data)
      documents = [
        {
          score: material.data.score,
          timeline: new ScoreTimeline(material.data.score, material.transport.loop),
          from: 0,
          seq: -1,
          material,
        },
      ];
    if ('stream' in material.data)
      documents = material.data.windows.map((window) => ({
        score: window.score,
        timeline: new ScoreTimeline(window.score),
        from: window.fromTick,
        seq: window.seq,
        material,
        window,
      }));
    this.documentCache.set(material, documents);
    return documents;
  }
  private serverAt(document: Document, tick: number): number {
    return document.window
      ? document.window.anchorServerMs + document.timeline.timeAtTick(tick - document.from)
      : document.material.transport.anchorServerMs +
          document.timeline.timeAtTick(tick) -
          document.timeline.timeAtTick(document.material.transport.anchorTick);
  }
  private tickAt(document: Document, time: number): number {
    const elapsed = document.window
      ? time - document.window.anchorServerMs
      : time -
        document.material.transport.anchorServerMs +
        document.timeline.timeAtTick(document.material.transport.anchorTick);
    return document.from + document.timeline.tickAtTime(Math.max(0, elapsed));
  }
  private audioTime(source: Source, serverMs: number): number | undefined {
    const context = source.output?.context;
    if (!context || source.offset === undefined) return undefined;
    const timestamp = (
      context as BaseAudioContext & { getOutputTimestamp?: () => AudioTimestamp }
    ).getOutputTimestamp?.();
    return performanceToAudioTime(
      serverMs - source.offset,
      {
        running: context.state === 'running',
        currentTime: context.currentTime,
        performanceNowMs: this.now(),
        outputTimestamp:
          timestamp?.contextTime !== undefined && timestamp.performanceTime !== undefined
            ? { contextTime: timestamp.contextTime, performanceTime: timestamp.performanceTime }
            : undefined,
      },
      this.options.correctionMs?.() ?? 0,
    )?.audioTime;
  }

  private clockChanged(): void {
    if (this.closed) return;
    const estimate = this.options.clock.estimate();
    for (const source of [...this.sources.values()]) {
      if (estimate.clockId && estimate.clockId !== source.active.transport.clockId) {
        this.remove(source);
        continue;
      }
      if (estimate.status !== 'current' || estimate.offsetMs === null) {
        this.cancelWork(source);
        source.needsJoin = true;
        continue;
      }
      if (source.offset === undefined) source.offset = estimate.offsetMs;
      else {
        const difference = Math.abs(source.offset - estimate.offsetMs);
        if (difference >= 5) {
          source.offset = estimate.offsetMs;
          if (difference > 30) {
            this.cancelWork(source);
            source.needsJoin = true;
          }
        }
      }
    }
    this.wake();
  }
  private readonly contextChanged = (): void => {
    for (const source of this.sources.values()) {
      this.cancelWork(source);
      source.needsJoin = true;
    }
    if (this.context?.state === 'running') this.options.clock.invalidate?.();
    this.wake();
  };
  setSuspended(suspended: boolean): void {
    if (this.suspended === suspended) return;
    this.suspended = suspended;
    for (const source of this.sources.values()) {
      this.cancelWork(source);
      source.needsJoin = true;
    }
    if (!suspended) {
      this.options.clock.invalidate?.();
      for (const source of this.sources.values())
        if (source.active.transport.state === 'playing' && !source.ready) void this.prepare(source);
    }
    this.wake();
  }
  /** Public for deterministic scheduler/replay probes; the normal owner arms one 25ms wake. */
  wake(): void {
    if (this.timer !== undefined) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    if (this.closed || this.suspended) return;
    const estimate = this.options.clock.estimate(),
      now = this.options.clock.getServerNow();
    if (estimate.status !== 'current' || estimate.offsetMs === null || now === undefined) return;
    let rendering = false;
    for (const source of [...this.sources.values()]) {
      if (
        !source.ready ||
        !source.output ||
        !source.graph ||
        source.output.context.state !== 'running' ||
        source.active.transport.state !== 'playing'
      )
        continue;
      if (estimate.clockId !== source.active.transport.clockId) {
        this.remove(source);
        continue;
      }
      source.offset ??= estimate.offsetMs;
      rendering = true;
      try {
        this.render(source, now);
      } catch (error) {
        this.fail(source, error);
      }
    }
    if (rendering)
      this.timer = setTimeout(() => {
        this.timer = undefined;
        this.wake();
      }, 25);
  }
  private render(source: Source, now: number): void {
    source.workRemaining = 20000;
    let pending = source.gate.pending;
    if (pending && source.pending && source.gate.advance(now)) {
      source.active = source.pending;
      source.pending = undefined;
      if (source.pendingLate) {
        source.needsJoin = true;
        source.pendingLate = false;
      }
      pending = undefined;
    }
    const documents = this.documents(source.active);
    if (!documents.length) return;
    const current =
      documents.find(
        (doc) =>
          !doc.window ||
          (now >= doc.window.anchorServerMs && now <= this.serverAt(doc, doc.window.toTick)),
      ) ?? documents.find((doc) => this.serverAt(doc, doc.from) >= now);
    if (!current) {
      this.cancelWork(source);
      source.needsJoin = true;
      return;
    }
    if (
      !current.window &&
      current.timeline.terminalTick !== undefined &&
      now >= this.serverAt(current, current.timeline.terminalTick)
    ) {
      this.park(source);
      return;
    }
    if (source.needsJoin) {
      let join = now;
      if (now > this.serverAt(current, current.from) + 5) {
        const tick = this.tickAt(current, now + 5),
          position = current.timeline.contentPosition(tick - current.from);
        const local = position.tick;
        let meter = current.score.meters[0];
        for (const entry of current.score.meters) {
          if (entry.tick > local) break;
          meter = entry;
        }
        const phase =
          current.window && meter.tick === 0
            ? current.window.barOriginTick - current.from
            : meter.tick;
        const boundaryAt = (unit: 'bar' | 'beat') =>
          current.window
            ? phase +
              Math.ceil(
                (local - phase) /
                  (((4 * 960) / meter.denominator) * (unit === 'bar' ? meter.numerator : 1)),
              ) *
                (((4 * 960) / meter.denominator) * (unit === 'bar' ? meter.numerator : 1))
            : nextMeterBoundary(local, current.score.meters, unit);
        let boundary = boundaryAt('bar');
        let unwrapped = tick + (boundary - local);
        if (this.serverAt(current, unwrapped) - now > 4000) {
          boundary = boundaryAt('beat');
          unwrapped = tick + (boundary - local);
        }
        join = this.serverAt(current, unwrapped);
      } else join = Math.max(now, this.serverAt(current, current.from));
      source.joinServerMs = join;
      source.needsJoin = false;
      source.graph?.cancelFrom(source.output?.context.currentTime ?? 0);
      this.chase(source, current, join);
    }
    const low = Math.max(now, source.joinServerMs ?? now),
      high = now + 200;
    for (const doc of documents)
      this.submit(source, doc, low, Math.min(high, pending?.effectiveServerMs ?? Infinity));
    if (source.pending && pending && !source.pendingLate)
      for (const doc of this.documents(source.pending))
        this.submit(source, doc, Math.max(low, pending.effectiveServerMs), high);
    this.releaseVoices(source, [
      ...documents,
      ...(source.pending ? this.documents(source.pending) : []),
    ]);
    for (const [id, time] of source.submitted) if (time < now - 1000) source.submitted.delete(id);
    source.graph?.prune();
    const partIds = new Set(
      [...documents, ...(source.pending ? this.documents(source.pending) : [])].flatMap((doc) =>
        doc.score.parts.map((part) => part.id),
      ),
    );
    for (const owned of source.voices.values()) partIds.add(owned.part.id);
    source.graph?.retainParts?.(partIds);
    const progressKeys = new Set(
      [...documents, ...(source.pending ? this.documents(source.pending) : [])].map((doc) =>
        JSON.stringify([doc.material.contentId, doc.seq]),
      ),
    );
    for (const key of source.progress.keys())
      if (!progressKeys.has(key)) source.progress.delete(key);
  }

  private chase(source: Source, doc: Document, time: number): void {
    const audio = this.audioTime(source, time);
    if (audio === undefined) return;
    const local = doc.timeline.contentPosition(this.tickAt(doc, time) - doc.from).tick;
    if (doc.chased?.tick !== local) {
      doc.chased = {
        tick: local,
        parts: doc.score.parts.map((part) => {
          const values = [100, 64, 127];
          for (const event of part.controls) {
            if (event.tick > local) break;
            const index = [7, 10, 11].indexOf(event.controller);
            if (index >= 0) values[index] = event.value;
          }
          return { id: part.id, values };
        }),
      };
    }
    for (const part of doc.chased.parts) {
      const graph = source.graph?.part(part.id);
      if (!graph) continue;
      for (let index = 0; index < 3; index++)
        graph.control(
          [7, 10, 11][index],
          part.values[index],
          Math.max(audio, source.output?.context.currentTime ?? 0),
        );
    }
  }
  private submit(source: Source, doc: Document, low: number, high: number): void {
    if (high < low || !source.graph || !source.output) return;
    const progressKey = JSON.stringify([doc.material.contentId, doc.seq]);
    low = Math.max(low, source.progress.get(progressKey) ?? 0);
    if (high < low) return;
    const firstTick = Math.max(doc.from, this.tickAt(doc, low)),
      lastTick = this.tickAt(doc, high);
    const loop = doc.window ? undefined : doc.material.transport.loop;
    const length = loop ? loop.endTick - loop.startTick : 0;
    const firstOccurrence =
      loop && firstTick >= loop.startTick ? Math.floor((firstTick - loop.startTick) / length) : 0;
    const lastOccurrence = loop
      ? Math.min(
          firstOccurrence + 255,
          Math.max(firstOccurrence, Math.floor((lastTick - loop.startTick) / length)),
        )
      : 0;
    for (let occurrence = firstOccurrence; occurrence <= lastOccurrence; occurrence++) {
      const offset = loop ? occurrence * length : 0;
      const minimum = Math.max(
        0,
        firstTick - doc.from - offset,
        loop && occurrence > 0 ? loop.startTick : 0,
      );
      const maximum = Math.min(lastTick - doc.from - offset, loop ? loop.endTick : Infinity);
      const lowerBound = <T>(values: readonly T[], tick: (value: T) => number) => {
        let start = 0,
          end = values.length;
        while (start < end) {
          const middle = Math.floor((start + end) / 2);
          if (tick(values[middle]) < minimum) start = middle + 1;
          else end = middle;
        }
        return start;
      };
      for (const part of doc.score.parts) {
        for (let row = lowerBound(part.notes, (note) => note[0]); row < part.notes.length; row++) {
          if (source.voices.size >= 64 || this.budget.remainingVoices === 0) break;
          const note = part.notes[row],
            local = note[0];
          if (local > maximum) break;
          if (loop && (local >= loop.endTick || (local < loop.startTick && occurrence > 0)))
            continue;
          const tick = doc.from + local + (loop && local >= loop.startTick ? offset : 0);
          if (
            tick < firstTick ||
            tick > lastTick ||
            (doc.window && tick >= doc.window.toTick) ||
            (doc.timeline.terminalTick !== undefined &&
              !doc.window &&
              tick >= doc.timeline.terminalTick)
          )
            continue;
          const time = this.serverAt(doc, tick),
            id = JSON.stringify([doc.material.contentId, doc.seq, part.id, row, occurrence]);
          if (
            time < low ||
            time > high ||
            source.submitted.has(id) ||
            !source.gate.accepts(this.identity(doc.material), tick)
          )
            continue;
          const audio = this.audioTime(source, time);
          if (
            audio === undefined ||
            audio < source.output.context.currentTime + 0.005 ||
            source.voices.size >= 64
          )
            continue;
          if (--source.workRemaining < 0 || source.submitted.size >= 20000)
            throw new Error('Score event density exceeds the render budget');
          let program = part.program;
          if (!Number.isSafeInteger(tick) || !Number.isSafeInteger(tick + note[1]))
            throw new RangeError('Score occurrence exceeds safe tick bounds');
          for (const event of part.programs) if (event.tick <= local) program = event.program;
          const releaseBudget = this.budget.reserveVoice();
          if (!releaseBudget) continue;
          source.submitted.set(id, time);
          let voice: SequenceVoice;
          try {
            voice = source.output.playNote({
              program,
              percussion: part.kind === 'percussion',
              note: note[2],
              velocity: note[3],
              startTime: audio,
              destination: source.graph.part(part.id).input,
            });
          } catch (error) {
            releaseBudget();
            throw error;
          }
          const owned: OwnedVoice = {
            voice,
            start: time,
            tick,
            endTick: tick + note[1],
            part,
            document: doc,
            releaseScheduled: false,
            releaseBudget,
          };
          source.voices.set(id, owned);
          void voice.ended.then(() => {
            if (source.voices.get(id) === owned) {
              source.voices.delete(id);
              releaseBudget();
            }
          });
        }
        for (
          let row = lowerBound(part.controls, (event) => event.tick);
          row < part.controls.length;
          row++
        ) {
          const event = part.controls[row];
          if (event.tick > maximum) break;
          if (event.controller === 64) continue;
          if (
            loop &&
            (event.tick >= loop.endTick || (event.tick < loop.startTick && occurrence > 0))
          )
            continue;
          const tick = doc.from + event.tick + (loop && event.tick >= loop.startTick ? offset : 0),
            time = this.serverAt(doc, tick);
          const id = JSON.stringify([
            'cc',
            doc.material.contentId,
            doc.seq,
            part.id,
            row,
            occurrence,
          ]);
          if (
            time < low ||
            time > high ||
            source.submitted.has(id) ||
            !source.gate.accepts(this.identity(doc.material), tick)
          )
            continue;
          if (--source.workRemaining < 0 || source.submitted.size >= 20000)
            throw new Error('Score event density exceeds the render budget');
          source.submitted.set(id, time);
          const audio = this.audioTime(source, time);
          if (audio !== undefined)
            source.graph
              .part(part.id)
              .control(
                event.controller,
                event.value,
                Math.max(audio, source.output.context.currentTime),
              );
        }
      }
      if (loop) {
        const tick = loop.startTick + offset,
          time = this.serverAt(doc, tick),
          id = JSON.stringify(['chase', doc.material.contentId, occurrence]);
        if (
          time >= low &&
          time <= high &&
          !source.submitted.has(id) &&
          source.gate.accepts(this.identity(doc.material), tick)
        ) {
          if (--source.workRemaining < 0 || source.submitted.size >= 20000)
            throw new Error('Score event density exceeds the render budget');
          this.chase(source, doc, time);
          source.submitted.set(id, time);
        }
      }
    }
    source.progress.set(progressKey, high);
  }
  private releaseVoices(source: Source, documents: Document[]): void {
    for (const owned of source.voices.values()) {
      if (owned.releaseScheduled) continue;
      let release: number | undefined;
      if (!owned.document.window) {
        const doc = owned.document,
          position = doc.timeline.contentPosition(owned.tick);
        const localEnd = position.tick + (owned.endTick - owned.tick);
        const loop = doc.material.transport.loop;
        const local = loop
          ? loopReleaseTick(owned.part, owned.endTick, doc.timeline, loop)
          : noteReleaseTick(owned.part, localEnd, doc.score.durationTicks);
        if (local !== undefined)
          release = this.serverAt(doc, loop ? local : owned.tick + (local - position.tick));
        // Suffix edits own future pedal state, including a held prefix voice.
        const boundary = source.gate.pending;
        if (
          boundary &&
          source.pending &&
          release !== undefined &&
          release >= boundary.effectiveServerMs
        ) {
          const next = this.documents(source.pending)[0],
            part = next?.score.parts.find((part) => part.id === owned.part.id);
          if (next && part) {
            const at = Math.max(owned.endTick, boundary.replaceFromTick);
            const after = noteReleaseTick(part, at, next.score.durationTicks);
            release = after === undefined ? undefined : this.serverAt(next, after);
          }
        } else if (source.active !== doc.material && release !== undefined) {
          const next = documents.find((next) => !next.window && next.material === source.active),
            part = next?.score.parts.find((part) => part.id === owned.part.id);
          if (next && part) {
            const after = noteReleaseTick(
              part,
              Math.max(owned.endTick, source.active.transport.anchorTick),
              next.score.durationTicks,
            );
            release = after === undefined ? undefined : this.serverAt(next, after);
          }
        }
      } else {
        const window = documents.find(
          (doc) => doc.window && owned.endTick >= doc.from && owned.endTick < doc.window.toTick,
        );
        const part = window?.score.parts.find((p) => p.id === owned.part.id);
        if (window && part) {
          const localEnd = owned.endTick - window.from;
          owned.keyEndServerMs = this.serverAt(window, owned.endTick);
          const local = noteReleaseTick(part, localEnd);
          if (local !== undefined) release = this.serverAt(window, window.from + local);
          else {
            owned.pedalHeld = true;
            for (const future of documents.filter((doc) => doc.from > window.from)) {
              const up = future.score.parts
                .find((p) => p.id === owned.part.id)
                ?.controls.find((c) => c.controller === 64 && c.value < 64);
              if (up) {
                release = this.serverAt(future, future.from + up.tick);
                break;
              }
            }
          }
        } else if (owned.pedalHeld && owned.keyEndServerMs !== undefined) {
          for (const future of documents) {
            const up = future.score.parts
              .find((p) => p.id === owned.part.id)
              ?.controls.find(
                (c) => c.controller === 64 && c.value < 64 && future.from + c.tick >= owned.endTick,
              );
            if (up) {
              release = this.serverAt(future, future.from + up.tick);
              break;
            }
          }
        }
      }
      if (release !== undefined) {
        const audio = this.audioTime(source, release),
          now = source.output?.context.currentTime ?? 0;
        if (audio !== undefined && audio <= now + 0.2) {
          owned.voice.release(Math.max(audio, now));
          owned.releaseScheduled = true;
        }
      }
    }
  }
  private cancelWork(source: Source): void {
    for (const owned of source.voices.values()) {
      owned.voice.stop();
      owned.releaseBudget();
    }
    source.voices.clear();
    source.submitted.clear();
    source.progress.clear();
    source.graph?.cancelFrom(source.output?.context.currentTime ?? 0);
  }
  private park(source: Source): void {
    this.cancelWork(source);
    source.ready = false;
    source.graph?.dispose();
    source.graph = undefined;
    source.output?.dispose?.();
    source.output = undefined;
    source.releaseClock?.();
    source.releaseClock = undefined;
    source.releaseAdmission?.();
    source.releaseAdmission = undefined;
  }
  stop(select: { key?: string; type?: string; tag?: string; name?: string }): void {
    for (const source of [...this.sources.values()])
      if (
        (!select.key && !select.type && !select.tag && !select.name) ||
        select.key === source.key ||
        select.type === 'music' ||
        (select.tag !== undefined && select.tag === source.tag)
      )
        this.remove(source);
    this.wake();
  }
  private remove(source: Source): void {
    this.sources.delete(source.key);
    source.generation++;
    source.abort.abort();
    source.releaseClock?.();
    source.releaseClock = undefined;
    source.releaseAdmission?.();
    source.releaseAdmission = undefined;
    // Future sources are stopped immediately; only currently audible voices get the short bus fade.
    const now = this.options.clock.getServerNow() ?? Infinity;
    for (const owned of source.voices.values()) if (owned.start > now) owned.voice.stop();
    source.graph?.fade();
    let timer: ReturnType<typeof setTimeout> | undefined,
      finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      if (timer !== undefined) clearTimeout(timer);
      this.retiring.delete(finish);
      this.cancelWork(source);
      source.graph?.dispose();
      source.output?.dispose?.();
      source.graph = undefined;
      source.output = undefined;
    };
    if (source.voices.size && source.output?.context.state === 'running') {
      this.retiring.add(finish);
      timer = setTimeout(finish, 10);
    } else finish();
  }
  private fail(source: Source, error: unknown): void {
    if (!this.current(source)) return;
    this.options.error?.(source.key, error instanceof Error ? error.message : String(error));
    this.remove(source);
  }
  updateMixes(): void {
    for (const source of this.sources.values()) source.graph?.update(source.mix);
  }
  chainChanged(destroying?: string): void {
    for (const source of this.sources.values()) source.graph?.route(destroying);
  }
  reset(): void {
    for (const source of [...this.sources.values()]) this.remove(source);
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
  }
  shutdown(): void {
    this.reset();
    for (const finish of this.retiring) finish();
    this.closed = true;
    this.unsubscribe();
    this.context?.removeEventListener('statechange', this.contextChanged);
  }
}
