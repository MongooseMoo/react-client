import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  SequenceService,
  SequenceBudget,
  noteReleaseTick,
  loopReleaseTick,
} from './SequenceService';
import { ScoreTimeline } from './score';
import type { CanonicalScore, ScorePart } from './score';
import type { SequenceVoice, SequenceNote } from './SequenceOutput';
import { decodeSequenceData } from './SequencePayload';
import { SequenceOutputNotReady } from './SequenceOutput';

async function settled() {
  for (let i = 0; i < 12; i++) await Promise.resolve();
}

const part: ScorePart = {
  id: 'p',
  name: 'Piano',
  kind: 'melodic',
  program: 0,
  notes: [[0, 960, 60, 100]],
  controls: [
    { tick: 0, controller: 64, value: 127 },
    { tick: 1920, controller: 64, value: 0 },
  ],
  programs: [],
};
const score: CanonicalScore = {
  version: 1,
  contentId: 'content',
  ppq: 960,
  durationTicks: 3840,
  tempos: [{ tick: 0, bpm: 120 }],
  meters: [{ tick: 0, numerator: 4, denominator: 4 }],
  parts: [part],
};
function setup() {
  const output = vi.fn(async () => null),
    acquire = vi.fn(() => vi.fn());
  const clock = {
    acquire,
    subscribe: () => () => {},
    estimate: () => ({ clockId: 'runtime', status: 'current' as const, offsetMs: 0 }),
    getServerNow: () => 1000,
    targetServerToPerformance: (value: number) => value,
  };
  const service = new SequenceService({
    clock,
    getOutput: output,
    createGraph: vi.fn(),
    now: () => 1000,
  });
  return { service, output, acquire };
}
const play = {
  key: 'music',
  contentId: 'content',
  midi: { version: 1 as const, score },
  transport: {
    version: 1 as const,
    clockId: 'runtime',
    sourceId: 'source',
    revision: 1,
    kind: 'score' as const,
    state: 'paused' as const,
    anchorServerMs: 1000,
    anchorTick: 960,
    durationTicks: 3840,
  },
};
afterEach(() => vi.useRealTimers());

function scheduler(
  material: CanonicalScore = score,
  budget = new SequenceBudget(),
  loadScore?: ConstructorParameters<typeof SequenceService>[0]['loadScore'],
) {
  vi.useFakeTimers();
  let now = 0;
  const context = {
    get currentTime() {
      return now / 1000;
    },
    state: 'running',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as BaseAudioContext;
  const starts: {
    note: SequenceNote;
    voice: SequenceVoice;
    stop: ReturnType<typeof vi.fn>;
    release: ReturnType<typeof vi.fn>;
    finish: () => void;
  }[] = [];
  const output = {
    context,
    prepare: vi.fn(async () => {}),
    playNote: (note: SequenceNote) => {
      let resolve: () => void = () => {};
      let ended = false;
      const done = new Promise<void>((r) => {
        resolve = r;
      });
      const stop = vi.fn(() => {
          ended = true;
          resolve();
        }),
        release = vi.fn();
      const voice: SequenceVoice = {
        get state() {
          return ended ? 'ended' : note.startTime > now / 1000 ? 'scheduled' : 'playing';
        },
        ended: done,
        stop,
        release,
      };
      starts.push({
        note,
        voice,
        stop,
        release,
        finish: () => {
          ended = true;
          resolve();
        },
      });
      return voice;
    },
  };
  const mix = {
    context,
    part: () => ({ input: {} as AudioNode, control: vi.fn() }),
    update: vi.fn(),
    cancelFrom: vi.fn(),
    prune: vi.fn(),
    fade: vi.fn(),
    route: vi.fn(),
    dispose: vi.fn(),
  };
  const clock = {
    acquire: () => () => {},
    subscribe: () => () => {},
    estimate: () => ({ clockId: 'runtime', status: 'current', offsetMs: 0 }),
    getServerNow: () => now,
    targetServerToPerformance: (time: number) => time,
  };
  const error = vi.fn();
  const getOutput = vi.fn(async () => output);
  const service = new SequenceService({
    clock,
    getOutput,
    createGraph: async () => mix,
    now: () => now,
    budget,
    error,
    loadScore,
  });
  const request = {
    ...play,
    midi: { version: 1 as const, score: material },
    transport: {
      ...play.transport,
      state: 'playing' as const,
      anchorTick: 0,
      durationTicks: material.durationTicks,
    },
  };
  return {
    service,
    starts,
    mix,
    request,
    error,
    output,
    getOutput,
    clock,
    context,
    time: (value: number) => {
      now = value;
      service.wake();
    },
  };
}

describe('shared score ownership', () => {
  it('loads immutable assets through the exact source context before output preparation', async () => {
    const contentId = '7f1a0010-0000-4000-8000-000000000001';
    const authored = { ...score, contentId };
    let resolve: (score: CanonicalScore) => void = () => {};
    const loadScore = vi.fn(
      () =>
        new Promise<CanonicalScore>((done) => {
          resolve = done;
        }),
    );
    const s = scheduler(authored, new SequenceBudget(), loadScore);
    const descriptor = {
      url: `https://mongoose.world/api/midi/content/${contentId}`,
      sha256: 'a'.repeat(64),
      byteLength: 100,
    };
    const loading = s.service.play({
      ...s.request,
      contentId,
      midi: { version: 1, content: descriptor },
    });
    await settled();
    expect(loadScore).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'music',
        sourceId: 'source',
        contentId,
        descriptor,
        signal: expect.any(AbortSignal),
      }),
    );
    expect(s.output.prepare).not.toHaveBeenCalled();
    resolve(authored);
    await loading;
    s.time(850);
    expect(s.output.prepare).toHaveBeenCalledOnce();
    expect(s.starts).toHaveLength(1);
    s.service.shutdown();
  });
  it('aborts a stopped source asset load and refuses its late result', async () => {
    let resolve: (score: CanonicalScore) => void = () => {};
    const loadScore = vi.fn(
      () =>
        new Promise<CanonicalScore>((done) => {
          resolve = done;
        }),
    );
    const s = scheduler(score, new SequenceBudget(), loadScore);
    const loading = s.service.play({
      ...s.request,
      midi: { version: 1, content: { url: '/unused', sha256: 'a'.repeat(64), byteLength: 100 } },
    });
    await settled();
    const signal = loadScore.mock.calls[0]?.[0]?.signal;
    s.service.stop('music');
    expect(signal.aborted).toBe(true);
    resolve(score);
    await loading;
    s.time(850);
    expect(s.output.prepare).not.toHaveBeenCalled();
    expect(s.starts).toHaveLength(0);
    expect(s.service.has('music')).toBe(false);
    s.service.shutdown();
  });
  it('retires every old output handle on output switch and requires a fresh Play grant', async () => {
    const s = scheduler();
    await s.service.play(s.request);
    s.time(850);
    expect(s.starts).toHaveLength(1);
    s.service.reset();
    expect(s.starts[0].stop).toHaveBeenCalled();
    s.time(875);
    s.service.update(s.request);
    await settled();
    expect(s.service.has('music')).toBe(false);
    expect(s.starts).toHaveLength(1);
    await s.service.play(s.request);
    expect(s.starts).toHaveLength(2);
    s.service.shutdown();
  });
  it('joins at an authored meter change inside a window instead of skipping to the old bar grid', async () => {
    const s = scheduler();
    s.time(1200);
    const midi = decodeSequenceData(
      {
        version: 1,
        stream: true,
        windows: [
          {
            seq: 0,
            fromTick: 0,
            toTick: 7680,
            anchorServerMs: 1000,
            contentId: 'content',
            revision: 1,
            tempos: [{ tick: 0, bpm: 120 }],
            meters: [
              { tick: 0, numerator: 4, denominator: 4, barOriginTick: 0 },
              { tick: 960, numerator: 3, denominator: 4, barOriginTick: 960 },
            ],
            parts: [{ ...part, controls: [], notes: [[960, 100, 65, 100]] }],
          },
        ],
      },
      'content',
      1,
    );
    await s.service.play({ ...s.request, midi });
    s.time(1325);
    expect(s.starts.map((v) => v.note.note)).toEqual([65]);
    expect(s.starts[0].note.startTime).toBe(1.5);
    s.service.shutdown();
  });
  it('joins at a non-bar-aligned loop reset before the following meter-grid boundary', async () => {
    const s = scheduler({
      ...score,
      parts: [{ ...part, notes: [[0, 100, 65, 100]], controls: [] }],
    });
    s.time(1200);
    await s.service.play({
      ...s.request,
      transport: { ...s.request.transport, loop: { startTick: 0, endTick: 1920, plays: -1 } },
    });
    s.time(1825);
    expect(s.starts.map((v) => v.note.note)).toEqual([65]);
    expect(s.starts[0].note.startTime).toBe(2);
    s.service.shutdown();
  });
  it('validates every window capability before preparing or submitting any window', async () => {
    const s = scheduler();
    const windows = [0, 1].map((seq) => ({
      seq,
      fromTick: seq * 1920,
      toTick: (seq + 1) * 1920,
      anchorServerMs: 1000 + seq * 1000,
      contentId: 'content',
      revision: 1,
      tempos: [{ tick: seq * 1920, bpm: 120 }],
      meters: [{ tick: seq * 1920, numerator: 4, denominator: 4, barOriginTick: 0 }],
      parts: [
        {
          ...part,
          notes: seq ? [] : [[0, 100, 60, 100]],
          controls: seq ? [{ tick: 1920, controller: 1, value: 127 }] : [],
        },
      ],
    }));
    await s.service.play({
      ...s.request,
      midi: decodeSequenceData({ version: 1, stream: true, windows }, 'content', 1),
    });
    expect(s.output.prepare).not.toHaveBeenCalled();
    expect(s.starts).toHaveLength(0);
    expect(s.service.has('music')).toBe(false);
    s.service.shutdown();
  });
  it('waits for an added window instrument and does not prepare again after a failed retransmission', async () => {
    const s = scheduler();
    const window = (seq: number, program: number) => ({
      seq,
      fromTick: seq * 1920,
      toTick: (seq + 1) * 1920,
      anchorServerMs: 1000 + seq * 1000,
      contentId: 'content',
      revision: 1,
      tempos: [{ tick: seq * 1920, bpm: 120 }],
      meters: [{ tick: seq * 1920, numerator: 4, denominator: 4, barOriginTick: 0 }],
      parts: [{ ...part, program, controls: [], notes: [[seq * 1920, 100, 64, 100]] }],
    });
    const midi = (seq: number, program: number) =>
      decodeSequenceData(
        { version: 1, stream: true, windows: [window(seq, program)] },
        'content',
        1,
      );
    await s.service.play({ ...s.request, midi: midi(0, 0) });
    let finish = () => {};
    s.output.prepare.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    s.service.update({ ...s.request, midi: midi(1, 40) });
    s.time(1825);
    expect(s.starts).toHaveLength(0);
    finish();
    await settled();
    finish();
    await settled();
    s.time(1850);
    expect(s.starts.map((v) => v.note.program)).toEqual([40]);
    const count = s.output.prepare.mock.calls.length;
    s.service.update({ ...s.request, midi: midi(1, 41) });
    await settled();
    expect(s.service.has('music')).toBe(false);
    expect(s.output.prepare).toHaveBeenCalledTimes(count);
    s.service.shutdown();
  });
  it('cancels old scheduled handles on context interruption and rejoins after running resumes', async () => {
    const s = scheduler();
    await s.service.play(s.request);
    s.time(850);
    expect(s.starts).toHaveLength(1);
    const changed = (s.context.addEventListener as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as () => void;
    Object.defineProperty(s.context, 'state', { value: 'suspended', configurable: true });
    changed();
    expect(s.starts[0].stop).toHaveBeenCalled();
    Object.defineProperty(s.context, 'state', { value: 'running', configurable: true });
    changed();
    s.time(875);
    expect(s.starts).toHaveLength(2);
    s.service.shutdown();
  });
  it('waits for all replacement programs and percussion before submitting their voices', async () => {
    const s = scheduler({ ...score, durationTicks: 7680 });
    await s.service.play(s.request);
    let finish = () => {};
    s.output.prepare.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    s.service.update({
      key: 'music',
      contentId: 'new',
      midi: {
        version: 1,
        score: {
          ...score,
          contentId: 'new',
          durationTicks: 7680,
          parts: [
            {
              ...part,
              kind: 'percussion',
              notes: [[3840, 100, 38, 100]],
              programs: [{ tick: 3840, program: 40 }],
            },
          ],
        },
      },
      transport: { ...s.request.transport, revision: 2 },
      replaceFromTick: 3840,
      effectiveServerMs: 3000,
    });
    s.time(2801);
    expect(s.starts).toHaveLength(0);
    expect(s.error).not.toHaveBeenCalled();
    finish();
    await settled();
    s.time(2825);
    expect(s.starts.map((v) => [v.note.program, v.note.percussion, v.note.note])).toEqual([
      [40, true, 38],
    ]);
    s.service.shutdown();
  });
  it('rejects a replacement mapping mismatch without cancelling the accepted prefix or suffix', async () => {
    const s = scheduler({
      ...score,
      durationTicks: 7680,
      parts: [{ ...part, notes: [[3840, 100, 64, 100]] }],
    });
    await s.service.play(s.request);
    s.time(2801);
    s.service.update({
      key: 'music',
      contentId: 'new',
      midi: { version: 1, score: { ...score, contentId: 'new' } },
      transport: { ...s.request.transport, revision: 2 },
      replaceFromTick: 3840,
      effectiveServerMs: 3001,
    });
    expect(s.starts[0].stop).not.toHaveBeenCalled();
    s.time(3000);
    expect(s.service.version('music')?.revision).toBe(1);
    expect(s.error).toHaveBeenCalledWith(
      'music',
      'Replacement boundary does not match its score timeline',
    );
    s.service.shutdown();
  });
  it('treats a same-source Play under a new runtime as a fresh silent grant until that clock is current', async () => {
    const s = scheduler();
    await s.service.play(s.request);
    s.time(850);
    await s.service.play({ ...s.request, transport: { ...s.request.transport, clockId: 'next' } });
    expect(s.starts[0].stop).toHaveBeenCalled();
    expect(s.service.version('music')?.clockId).toBe('next');
    s.time(875);
    expect(s.service.has('music')).toBe(true);
    expect(s.starts).toHaveLength(1);
    s.clock.estimate = () => ({ clockId: 'next', status: 'current', offsetMs: 0 });
    s.time(900);
    await settled();
    expect(s.starts).toHaveLength(2);
    s.service.shutdown();
  });
  it('keeps prepared stream notes audible while a future instrument loads', async () => {
    const s = scheduler();
    const window = (seq: number, program: number) => ({
      seq,
      fromTick: seq * 1920,
      toTick: (seq + 1) * 1920,
      anchorServerMs: 1000 + seq * 1000,
      contentId: 'content',
      revision: 1,
      tempos: [{ tick: seq * 1920, bpm: 120 }],
      meters: [{ tick: seq * 1920, numerator: 4, denominator: 4, barOriginTick: 0 }],
      parts: [{ ...part, program, controls: [], notes: [[seq * 1920 + 960, 100, 60 + seq, 100]] }],
    });
    const midi = (seq: number, program: number) =>
      decodeSequenceData(
        { version: 1, stream: true, windows: [window(seq, program)] },
        'content',
        1,
      );
    await s.service.play({ ...s.request, midi: midi(0, 0) });
    let finish = () => {};
    s.output.prepare.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    s.service.update({ ...s.request, midi: midi(1, 40) });
    s.time(1325);
    expect(s.starts.map((v) => [v.note.note, v.note.program])).toEqual([[60, 0]]);
    finish();
    await settled();
    s.time(2325);
    expect(s.starts.map((v) => [v.note.note, v.note.program])).toEqual([
      [60, 0],
      [61, 40],
    ]);
    s.service.shutdown();
  });
  it('chases only the window containing a future replacement boundary', async () => {
    const s = scheduler({ ...score, durationTicks: 7680 });
    await s.service.play(s.request);
    const control = vi.fn();
    vi.spyOn(s.mix, 'part').mockImplementation(() => ({ input: {} as AudioNode, control }));
    const windows = [1, 2].map((seq) => ({
      seq,
      fromTick: seq * 1920,
      toTick: (seq + 1) * 1920,
      anchorServerMs: 1000 + seq * 1000,
      contentId: 'new',
      revision: 2,
      tempos: [{ tick: seq * 1920, bpm: 120 }],
      meters: [{ tick: seq * 1920, numerator: 4, denominator: 4, barOriginTick: 0 }],
      parts: [
        {
          ...part,
          notes: [],
          controls: [{ tick: seq * 1920, controller: 7, value: seq === 1 ? 50 : 10 }],
        },
      ],
    }));
    s.service.update({
      key: 'music',
      contentId: 'new',
      midi: decodeSequenceData({ version: 1, stream: true, windows }, 'new', 2),
      transport: { ...s.request.transport, revision: 2 },
      replaceFromTick: 1920,
      effectiveServerMs: 2000,
    });
    await settled();
    expect(control.mock.calls.filter((call) => call[0] === 7)).toEqual([[7, 50, 2]]);
    s.service.shutdown();
  });
  it('joins at a window boundary rather than extrapolating its meter past the window', async () => {
    const s = scheduler();
    const windows = [0, 1].map((seq) => ({
      seq,
      fromTick: seq * 480,
      toTick: (seq + 1) * 480,
      anchorServerMs: 1000 + seq * 250,
      contentId: 'content',
      revision: 1,
      tempos: [{ tick: seq * 480, bpm: 120 }],
      meters: [{ tick: seq * 480, numerator: 4, denominator: 4, barOriginTick: 0 }],
      parts: [{ ...part, controls: [], notes: [[seq * 480, 100, 60 + seq, 100]] }],
    }));
    s.time(1100);
    await s.service.play({
      ...s.request,
      midi: decodeSequenceData({ version: 1, stream: true, windows }, 'content', 1),
    });
    expect(s.starts.map((v) => [v.note.note, v.note.startTime])).toEqual([[61, 1.25]]);
    s.service.shutdown();
  });
  it('preserves the final release until its owned voice ends naturally', async () => {
    const s = scheduler({
      ...score,
      durationTicks: 1920,
      parts: [{ ...part, controls: [], notes: [[960, 960, 60, 100]] }],
    });
    await s.service.play(s.request);
    s.time(1325);
    s.time(2001);
    expect(s.starts[0].release).toHaveBeenCalledOnce();
    expect(s.starts[0].stop).not.toHaveBeenCalled();
    expect(s.mix.dispose).not.toHaveBeenCalled();
    s.starts[0].finish();
    await settled();
    expect(s.mix.dispose).toHaveBeenCalledOnce();
    s.service.shutdown();
  });
  it('retires admission when a final release is interrupted by suspension', async () => {
    const budget = new SequenceBudget();
    const s = scheduler(
      {
        ...score,
        durationTicks: 1920,
        parts: [{ ...part, controls: [], notes: [[960, 960, 60, 100]] }],
      },
      budget,
    );
    await s.service.play(s.request);
    s.time(1325);
    s.time(2001);
    s.service.setSuspended(true);
    s.service.setSuspended(false);
    await settled();
    expect(s.mix.dispose).toHaveBeenCalledOnce();
    const leases = Array.from({ length: 8 }, () => budget.acquireSource());
    expect(leases.every(Boolean)).toBe(true);
    for (const lease of leases) lease?.();
    s.service.shutdown();
  });
  it('never lets an older window preparation undo a committed replacement', async () => {
    const s = scheduler();
    const window = (seq: number, contentId: string, revision: number, program: number) => ({
      seq,
      fromTick: seq * 3840,
      toTick: (seq + 1) * 3840,
      anchorServerMs: 1000 + seq * 2000,
      contentId,
      revision,
      tempos: [{ tick: seq * 3840, bpm: 120 }],
      meters: [{ tick: seq * 3840, numerator: 4, denominator: 4, barOriginTick: 0 }],
      parts: [
        {
          ...part,
          program,
          controls: [],
          notes: [[seq * 3840 + 960, 100, program === 50 ? 65 : 60, 100]],
        },
      ],
    });
    const midi = (seq: number, id: string, revision: number, program: number) =>
      decodeSequenceData(
        { version: 1, stream: true, windows: [window(seq, id, revision, program)] },
        id,
        revision,
      );
    await s.service.play({ ...s.request, midi: midi(0, 'content', 1, 0) });
    let finishOld = () => {};
    s.output.prepare.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishOld = resolve;
        }),
    );
    s.service.update({ ...s.request, midi: midi(1, 'content', 1, 40) });
    s.service.update({
      key: 'music',
      contentId: 'new',
      midi: midi(1, 'new', 2, 50),
      transport: { ...s.request.transport, revision: 2 },
      replaceFromTick: 3840,
      effectiveServerMs: 3000,
    });
    await settled();
    s.time(3001);
    finishOld();
    await settled();
    s.time(3325);
    expect(s.starts.map((v) => [v.note.note, v.note.program])).toEqual([[65, 50]]);
    expect(s.error).not.toHaveBeenCalled();
    expect(s.service.version('music')?.revision).toBe(2);
    s.service.shutdown();
  });
  it.each([
    false,
    true,
  ])('merges pending revision resends with replacement fields %s', async (withBoundary) => {
    const s = scheduler();
    const window = (seq: number, id: string, revision: number) => ({
      seq,
      fromTick: seq * 3840,
      toTick: (seq + 1) * 3840,
      anchorServerMs: 1000 + seq * 2000,
      contentId: id,
      revision,
      tempos: [{ tick: seq * 3840, bpm: 120 }],
      meters: [{ tick: seq * 3840, numerator: 4, denominator: 4, barOriginTick: 0 }],
      parts: [{ ...part, controls: [], notes: [[seq * 3840 + 960, 100, 60 + seq, 100]] }],
    });
    const midi = (seq: number, id: string, revision: number) =>
      decodeSequenceData(
        { version: 1, stream: true, windows: [window(seq, id, revision)] },
        id,
        revision,
      );
    await s.service.play({ ...s.request, midi: midi(0, 'content', 1) });
    const boundary = { replaceFromTick: 3840, effectiveServerMs: 3000 };
    s.service.update({
      key: 'music',
      contentId: 'new',
      midi: midi(1, 'new', 2),
      transport: { ...s.request.transport, revision: 2 },
      ...boundary,
    });
    await settled();
    s.service.update({
      key: 'music',
      contentId: 'new',
      midi: midi(2, 'new', 2),
      transport: { ...s.request.transport, revision: 2 },
      ...(withBoundary ? boundary : {}),
    });
    await settled();
    s.time(3325);
    s.time(5325);
    expect(s.starts.map((v) => v.note.note)).toEqual([61, 62]);
    expect(s.error).not.toHaveBeenCalled();
    s.service.shutdown();
  });
  it.each([
    false,
    true,
  ])('handles a pending window load across the boundary with failure %s', async (fails) => {
    const s = scheduler();
    const window = (seq: number, id: string, revision: number) => ({
      seq,
      fromTick: seq * 3840,
      toTick: (seq + 1) * 3840,
      anchorServerMs: 1000 + seq * 2000,
      contentId: id,
      revision,
      tempos: [{ tick: seq * 3840, bpm: 120 }],
      meters: [{ tick: seq * 3840, numerator: 4, denominator: 4, barOriginTick: 0 }],
      parts: [{ ...part, controls: [], notes: [[seq * 3840 + 960, 100, 60 + seq, 100]] }],
    });
    const midi = (seq: number, id: string, revision: number) =>
      decodeSequenceData(
        { version: 1, stream: true, windows: [window(seq, id, revision)] },
        id,
        revision,
      );
    await s.service.play({ ...s.request, midi: midi(0, 'content', 1) });
    s.service.update({
      key: 'music',
      contentId: 'new',
      midi: midi(1, 'new', 2),
      transport: { ...s.request.transport, revision: 2 },
      replaceFromTick: 3840,
      effectiveServerMs: 3000,
    });
    await settled();
    let finish = () => {};
    s.output.prepare.mockImplementationOnce(
      () =>
        new Promise<void>((resolve, reject) => {
          finish = () => (fails ? reject(new Error('Instrument fetch failed')) : resolve());
        }),
    );
    s.service.update({
      key: 'music',
      contentId: 'new',
      midi: midi(2, 'new', 2),
      transport: { ...s.request.transport, revision: 2 },
    });
    s.time(3001);
    finish();
    await settled();
    s.time(5325);
    if (fails) {
      expect(s.starts).toHaveLength(0);
      expect(s.error).toHaveBeenCalledWith('music', 'Instrument fetch failed');
      expect(s.service.has('music')).toBe(false);
    } else {
      expect(s.starts.map((v) => v.note.note)).toEqual([62]);
      expect(s.error).not.toHaveBeenCalled();
    }
    s.service.shutdown();
  });
  it('reports a future edit received without a current clock instead of silently losing it', async () => {
    const s = scheduler({ ...score, durationTicks: 7680 });
    await s.service.play(s.request);
    s.clock.getServerNow = () => undefined as unknown as number;
    s.service.update({
      key: 'music',
      contentId: 'new',
      midi: { version: 1, score: { ...score, contentId: 'new' } },
      transport: { ...s.request.transport, revision: 2 },
      replaceFromTick: 3840,
      effectiveServerMs: 3000,
    });
    expect(s.error).toHaveBeenCalledWith('music', 'Replacement requires a current shared clock');
    expect(s.service.version('music')?.revision).toBe(1);
    s.service.shutdown();
  });
  it('accepts a fractional boundary serialized with MOO precision', async () => {
    const material = {
      ...score,
      durationTicks: 7680,
      tempos: [{ tick: 0, bpm: 90 }],
      parts: [{ ...part, controls: [], notes: [[3840, 100, 64, 100]] as ScorePart['notes'] }],
    };
    const s = scheduler(material);
    await s.service.play(s.request);
    s.service.update({
      key: 'music',
      contentId: 'new',
      midi: { version: 1, score: { ...material, contentId: 'new' } },
      transport: { ...s.request.transport, revision: 2 },
      replaceFromTick: 3840,
      effectiveServerMs: Number((1000 + (4 * 60000) / 90).toPrecision(15)),
    });
    await settled();
    s.time(3667);
    expect(s.service.version('music')?.revision).toBe(2);
    expect(s.error).not.toHaveBeenCalled();
    s.service.shutdown();
  });
  it('does not reserve an output admission while an unconfirmed runtime waits', async () => {
    const s = scheduler();
    for (let index = 0; index < 8; index++)
      await s.service.play({
        ...s.request,
        key: `waiting-${index}`,
        transport: { ...s.request.transport, clockId: 'unconfirmed' },
      });
    expect(s.getOutput).not.toHaveBeenCalled();
    await s.service.play({ ...s.request, key: 'overflow' });
    expect(s.service.has('overflow')).toBe(false);
    expect(s.error).toHaveBeenCalledWith('overflow', 'Music source limit reached');
    s.service.shutdown();
  });
  it('retains a supported but temporarily unavailable output and retries exactly on readiness', async () => {
    const s = scheduler();
    let ready = () => {};
    const unsubscribe = vi.fn();
    s.getOutput.mockRejectedValueOnce(
      new SequenceOutputNotReady((listener) => {
        ready = listener;
        return unsubscribe;
      }),
    );
    await s.service.play(s.request);
    expect(s.service.has('music')).toBe(true);
    expect(s.error).not.toHaveBeenCalled();
    s.time(850);
    expect(s.starts).toHaveLength(0);
    ready();
    await settled();
    s.time(875);
    expect(s.starts).toHaveLength(1);
    expect(unsubscribe).toHaveBeenCalledOnce();
    s.service.shutdown();
  });
  it('does not readmit a completed finite source after page resume', async () => {
    const s = scheduler();
    await s.service.play(s.request);
    s.time(3001);
    expect(s.getOutput).toHaveBeenCalledOnce();
    s.service.setSuspended(true);
    s.service.setSuspended(false);
    await settled();
    expect(s.getOutput).toHaveBeenCalledOnce();
    s.service.shutdown();
  });
  it('prepares a preparing-state grant received while the page was suspended', async () => {
    const s = scheduler();
    s.service.setSuspended(true);
    await s.service.play({
      ...s.request,
      transport: { ...s.request.transport, state: 'preparing' },
    });
    expect(s.getOutput).not.toHaveBeenCalled();
    s.service.setSuspended(false);
    await settled();
    expect(s.getOutput).toHaveBeenCalledOnce();
    expect(s.starts).toHaveLength(0);
    s.service.shutdown();
  });
  it('admits eight sources, refuses the ninth, and reuses only released admission', async () => {
    const budget = new SequenceBudget();
    const players = Array.from({ length: 9 }, () => scheduler(score, budget));
    for (const s of players) await s.service.play(s.request);
    expect(players.map((s) => s.service.has('music'))).toEqual([
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      false,
    ]);
    players[0].service.shutdown();
    await players[8].service.play(players[8].request);
    expect(players[8].service.has('music')).toBe(true);
    for (const s of players) s.service.shutdown();
  });
  it('fails explicitly when a tiny loop exceeds the occurrence work budget', async () => {
    const s = scheduler({ ...score, parts: [] });
    await s.service.play({
      ...s.request,
      transport: { ...s.request.transport, loop: { startTick: 0, endTick: 1, plays: -1 } },
    });
    s.time(850);
    s.time(1000);
    expect(s.error).toHaveBeenCalledWith('music', expect.stringContaining('density'));
    expect(s.service.has('music')).toBe(false);
    s.service.shutdown();
  });
  it('a paused listener gets a silent grant without opening output or clock timers', async () => {
    const { service, output, acquire } = setup();
    await service.play(play);
    expect(service.has('music')).toBe(true);
    expect(output).not.toHaveBeenCalled();
    expect(acquire).not.toHaveBeenCalled();
    service.stop({ key: 'music' });
    expect(service.has('music')).toBe(false);
    service.shutdown();
  });
  it('Update cannot create a grant and same revision cannot replace content', async () => {
    const { service } = setup();
    service.update(play);
    expect(service.has('music')).toBe(false);
    await service.play(play);
    await service.play({ ...play, contentId: 'changed' });
    expect(service.version('music')?.contentId).toBe('content');
    service.shutdown();
  });
  it('sustain changes independent release time and ends at a finite EOT', () => {
    expect(noteReleaseTick(part, 960, 3840)).toBe(1920);
    expect(noteReleaseTick({ ...part, controls: [part.controls[0]] }, 960, 3840)).toBe(3840);
    expect(noteReleaseTick({ ...part, controls: [part.controls[0]] }, 960)).toBeUndefined();
    expect(noteReleaseTick({ ...part, controls: [] }, 960)).toBe(960);
  });
  it('loop pedal chase releases a held occurrence at the next reset and ignores the authored suffix', () => {
    const loop = { startTick: 0, endTick: 1920, plays: 3 },
      timeline = new ScoreTimeline(score, loop);
    const held = {
      ...part,
      controls: [
        { tick: 960, controller: 64, value: 127 },
        { tick: 3000, controller: 64, value: 0 },
      ],
    };
    expect(loopReleaseTick(held, 1440, timeline, loop)).toBe(1920);
    expect(loopReleaseTick(held, 3360, timeline, loop)).toBe(3840);
    expect(
      loopReleaseTick(
        { ...held, controls: [{ tick: 0, controller: 64, value: 127 }] },
        1440,
        timeline,
        loop,
      ),
    ).toBe(5760);
  });
  it('submits absolute voices once, retains same-source rePlay, and cancels the actual future handle', async () => {
    const { service, starts, mix, request, time } = scheduler();
    await service.play(request);
    time(850);
    expect(starts).toHaveLength(1);
    expect(starts[0].note.startTime).toBe(1);
    expect(starts[0].release).not.toHaveBeenCalled();
    await service.play(request);
    time(875);
    expect(starts).toHaveLength(1);
    service.update({ key: 'music', volume: 20 });
    expect(mix.update).toHaveBeenCalled();
    expect(starts).toHaveLength(1);
    service.stop({ key: 'music' });
    expect(starts[0].stop).toHaveBeenCalled();
    service.shutdown();
  });
  it('commits sustain release only inside the submit horizon', async () => {
    const { service, starts, request, time } = scheduler();
    await service.play(request);
    time(850);
    expect(starts[0].release).not.toHaveBeenCalled();
    time(1801);
    expect(starts[0].release).toHaveBeenCalledWith(2);
    service.shutdown();
  });
  it('drops an onset less than five ms ahead rather than relying on synth clamping', async () => {
    const { service, starts, request, time } = scheduler();
    await service.play(request);
    time(998);
    expect(starts).toHaveLength(0);
    service.shutdown();
  });
  it('late join waits for the next bar and never attacks elapsed notes', async () => {
    const material = {
      ...score,
      durationTicks: 7680,
      parts: [
        {
          ...part,
          notes: [
            [0, 100, 60, 100],
            [3840, 100, 64, 100],
          ] as const,
        },
      ],
    };
    const { service, starts, request, time } = scheduler(material);
    time(1200);
    await service.play(request);
    time(2801);
    expect(starts).toHaveLength(1);
    expect(starts[0].note.note).toBe(64);
    expect(starts[0].note.startTime).toBe(3);
    service.shutdown();
  });
  it('refuses excess onsets at the source cap without stealing an admitted voice', async () => {
    const material = {
      ...score,
      parts: [{ ...part, notes: Array.from({ length: 100 }, () => [0, 960, 60, 100] as const) }],
    };
    const { service, starts, request, time } = scheduler(material);
    await service.play(request);
    time(850);
    expect(starts).toHaveLength(64);
    expect(starts.every((voice) => voice.stop.mock.calls.length === 0)).toBe(true);
    service.shutdown();
  });
  it('shares the 256-voice budget with private auditions and releases reservations on shutdown', async () => {
    const budget = new SequenceBudget(),
      material = {
        ...score,
        parts: [{ ...part, notes: Array.from({ length: 100 }, () => [0, 960, 60, 100] as const) }],
      };
    const players = Array.from({ length: 5 }, () => scheduler(material, budget));
    for (const player of players) {
      await player.service.play(player.request);
      player.time(850);
    }
    expect(players.map((player) => player.starts.length)).toEqual([64, 64, 64, 64, 0]);
    for (const player of players) player.service.shutdown();
    const releases = Array.from({ length: 256 }, () => budget.reserveVoice());
    expect(releases.every(Boolean)).toBe(true);
    expect(budget.reserveVoice()).toBeUndefined();
    for (const release of releases) {
      release?.();
      release?.();
    }
    expect(budget.reserveVoice()).toBeTypeOf('function');
  });
  it('a pending future content edit preserves the prefix and does not double attack at activation', async () => {
    const material = {
      ...score,
      durationTicks: 7680,
      parts: [
        {
          ...part,
          controls: [],
          notes: [
            [0, 100, 60, 100],
            [3840, 100, 64, 100],
          ] as const,
        },
      ],
    };
    const { service, starts, request, time } = scheduler(material);
    await service.play(request);
    time(850);
    service.update({
      key: 'music',
      contentId: 'new',
      midi: {
        version: 1,
        score: {
          ...material,
          contentId: 'new',
          parts: [{ ...material.parts[0], notes: [[3840, 100, 67, 100]] }],
        },
      },
      transport: { ...request.transport, revision: 2 },
      replaceFromTick: 3840,
      effectiveServerMs: 3000,
    });
    await settled();
    time(2801);
    expect(starts.map((v) => v.note.note)).toEqual([60, 67]);
    time(3000);
    time(3025);
    expect(starts.map((v) => v.note.note)).toEqual([60, 67]);
    expect(service.version('music')?.contentId).toBe('new');
    service.shutdown();
  });
  it('keeps a pedal-held note across a window and releases it on a later immutable window', async () => {
    const { service, starts, request, time } = scheduler();
    const window = (seq: number) => ({
      seq,
      fromTick: seq * 1920,
      toTick: (seq + 1) * 1920,
      anchorServerMs: 1000 + seq * 1000,
      contentId: 'content',
      revision: 1,
      tempos: [{ tick: seq * 1920, bpm: 120 }],
      meters: [{ tick: seq * 1920, numerator: 4, denominator: 4, barOriginTick: 0 }],
      parts: [
        {
          ...part,
          notes: seq === 0 ? [[0, 960, 60, 100]] : [],
          controls: [{ tick: seq * 1920, controller: 64, value: seq === 0 ? 127 : 0 }],
        },
      ],
    });
    await service.play({
      ...request,
      midi: decodeSequenceData({ version: 1, stream: true, windows: [window(0)] }, 'content', 1),
    });
    time(850);
    expect(starts).toHaveLength(1);
    time(1500);
    expect(starts[0].release).not.toHaveBeenCalled();
    service.update({
      key: 'music',
      contentId: 'content',
      transport: request.transport,
      midi: decodeSequenceData({ version: 1, stream: true, windows: [window(1)] }, 'content', 1),
    });
    await settled();
    time(1801);
    expect(starts[0].release).toHaveBeenCalledWith(2);
    service.update({
      key: 'music',
      contentId: 'content',
      transport: request.transport,
      midi: decodeSequenceData({ version: 1, stream: true, windows: [window(1)] }, 'content', 1),
    });
    expect(starts).toHaveLength(1);
    service.shutdown();
  });
  it('a late suffix edit cancels its committed old onset, retains prefix automation, and rejoins a later bar', async () => {
    const material = {
      ...score,
      durationTicks: 11520,
      parts: [
        {
          ...part,
          controls: [],
          notes: [
            [0, 100, 60, 100],
            [3840, 100, 64, 100],
          ] as const,
        },
      ],
    };
    const { service, starts, mix, request, time } = scheduler(material);
    await service.play(request);
    time(850);
    time(2801);
    expect(starts.map((v) => v.note.note)).toEqual([60, 64]);
    service.update({
      key: 'music',
      contentId: 'new',
      midi: {
        version: 1,
        score: {
          ...material,
          contentId: 'new',
          parts: [
            {
              ...material.parts[0],
              notes: [
                [3840, 100, 67, 100],
                [7680, 100, 69, 100],
              ],
            },
          ],
        },
      },
      transport: { ...request.transport, revision: 2 },
      replaceFromTick: 3840,
      effectiveServerMs: 3000,
    });
    expect(starts[1].stop).toHaveBeenCalled();
    expect(starts[0].stop).not.toHaveBeenCalled();
    expect(mix.cancelFrom).toHaveBeenLastCalledWith(3);
    await settled();
    time(3000);
    time(4801);
    expect(starts.map((v) => v.note.note)).toEqual([60, 64, 69]);
    expect(starts[2].note.startTime).toBe(5);
    service.shutdown();
  });
  it('rejects pathological repeated controller density with bounded owned work', async () => {
    const material = {
      ...score,
      parts: [
        {
          ...part,
          notes: [],
          controls: Array.from({ length: 1000 }, () => ({ tick: 0, controller: 7, value: 100 })),
        },
      ],
    };
    const { service, request, time, error } = scheduler(material);
    await service.play({
      ...request,
      transport: { ...request.transport, loop: { startTick: 0, endTick: 1, plays: -1 } },
    });
    time(850);
    expect(service.has('music')).toBe(false);
    expect(error).toHaveBeenCalledWith('music', expect.stringContaining('density'));
    service.shutdown();
  });
});
