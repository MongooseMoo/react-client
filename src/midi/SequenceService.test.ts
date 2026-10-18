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

function scheduler(material: CanonicalScore = score, budget = new SequenceBudget()) {
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
      starts.push({ note, voice, stop, release });
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
  const service = new SequenceService({
    clock,
    getOutput: async () => output,
    createGraph: async () => mix,
    now: () => now,
    budget,
    error,
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
    time: (value: number) => {
      now = value;
      service.wake();
    },
  };
}

describe('shared score ownership', () => {
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
    await Promise.resolve();
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
