import { describe, expect, it } from 'vitest';
import { SourceRevisionGate } from './revisions';
import { nextMeterBoundary, ScoreTimeline, TempoTimeline } from './timeline';
import { mediaPosition, scorePosition } from './transport';
import vectors from './transport-vectors.json';
import type { MediaTransport, ScoreTransport, TransportState } from './types';
import { parseScore, validateScore } from './validate';
import { validateTransport } from './validateTransport';

const identity = { version: 1 as const, clockId: 'runtime', sourceId: 'performance', revision: 0 };
function scoreInput() {
  return {
    version: 1,
    contentId: 'composition-v1',
    ppq: 960,
    durationTicks: 3840,
    tempos: [{ tick: 0, bpm: 120 }],
    meters: [{ tick: 0, numerator: 4, denominator: 4 }],
    parts: [
      {
        id: 'piano',
        name: 'Piano',
        kind: 'melodic',
        program: 0,
        channelHint: 0,
        notes: [
          [0, 960, 60, 90],
          [0, 480, 60, 100],
        ],
        controls: [],
        programs: [],
      },
    ],
  };
}

describe('independent transport vectors shared with MOO', () => {
  const tempo = new TempoTimeline(vectors.tempos);
  const looped = new ScoreTimeline(vectors, vectors.loop);
  const ordinary = new ScoreTimeline(vectors);
  for (const vector of vectors.tempoCases) {
    it(`maps tempo tick ${vector.tick} to ${vector.ms} ms and back`, () => {
      expect(tempo.timeAtTick(vector.tick)).toBeCloseTo(vector.ms, 8);
      expect(tempo.tickAtTime(vector.ms)).toBeCloseTo(vector.tick, 8);
    });
  }
  for (const vector of vectors.loopCases) {
    it(`maps unfolded tick ${vector.unwrappedTick}, occurrence ${vector.occurrence}`, () => {
      expect(looped.timeAtTick(vector.unwrappedTick)).toBeCloseTo(vector.ms, 8);
      expect(looped.tickAtTime(vector.ms)).toBeCloseTo(vector.unwrappedTick, 8);
      expect(looped.contentPosition(vector.unwrappedTick)).toEqual({
        tick: vector.contentTick,
        occurrence: vector.occurrence,
        terminal: vector.terminal,
      });
    });
  }
  for (const vector of vectors.scoreCases) {
    it(vector.name, () => {
      const transport: ScoreTransport = {
        ...identity,
        kind: 'score',
        state: vector.state as TransportState,
        anchorTick: vector.anchorTick,
        anchorServerMs: vector.anchorServerMs,
      };
      expect(
        scorePosition(transport, vector.looped ? looped : ordinary, vector.nowMs),
      ).toMatchObject({
        unwrappedTick: vector.unwrappedTick,
        contentTick: vector.contentTick,
        terminal: vector.terminal,
        state: vector.terminal ? 'stopped' : vector.state,
      });
    });
  }

  it('supports infinite loops without iterating passes and validates safe terminal arithmetic', () => {
    const infinite = new ScoreTimeline(vectors, { ...vectors.loop, plays: -1 });
    expect(infinite.contentPosition(2880000960)).toEqual({
      tick: 960,
      occurrence: 1000000,
      terminal: false,
    });
    expect(infinite.tickAtTime(2250000500)).toBe(2880000960);
    expect(
      () => new ScoreTimeline(vectors, { ...vectors.loop, plays: Number.MAX_SAFE_INTEGER }),
    ).toThrow(RangeError);
    expect(() => new ScoreTimeline(vectors, { startTick: 0, endTick: 0, plays: 1 })).toThrow(
      RangeError,
    );
  });

  it('round trips fractional triplets and tempo-map positions across repeated regions', () => {
    for (let tick = 0; tick < 9600; tick += 320 / 7)
      expect(looped.tickAtTime(looped.timeAtTick(tick))).toBeCloseTo(tick, 7);
  });

  it('uses a new meter tick as a new bar, including imported off-grid changes', () => {
    const meters = [
      { tick: 0, numerator: 4, denominator: 4 },
      { tick: 2000, numerator: 6, denominator: 8 },
    ];
    expect(nextMeterBoundary(1000, meters)).toBe(2000);
    expect(nextMeterBoundary(2001, meters)).toBe(4880);
    expect(nextMeterBoundary(2001, meters, 'beat')).toBe(2480);
  });
});

describe('media transport', () => {
  const media: MediaTransport = {
    ...identity,
    kind: 'media',
    state: 'playing',
    anchorServerMs: 1000,
    positionMs: 100,
    durationMs: 5000,
    rate: 2,
    mode: 'finite',
  };
  it('applies rate only to playing elapsed time and preserves future or paused anchors', () => {
    expect(mediaPosition(media, 500).positionMs).toBe(100);
    expect(mediaPosition(media, 2000).positionMs).toBe(2100);
    expect(mediaPosition({ ...media, state: 'paused' }, 2000).positionMs).toBe(100);
    expect(mediaPosition({ ...media, mode: 'live' }, 2000)).toMatchObject({
      positionMs: 100,
      terminal: false,
    });
    expect(mediaPosition(media, 4000)).toMatchObject({
      positionMs: 5000,
      terminal: true,
      state: 'stopped',
    });
  });

  it('does not wrap a finite loop terminal to its beginning or play an implicit suffix', () => {
    const loop = { startMs: 1000, endMs: 3000, plays: 2 };
    expect(mediaPosition({ ...media, loop, positionMs: 0 }, 2500)).toMatchObject({
      unwrappedMs: 3000,
      positionMs: 1000,
      occurrence: 1,
      terminal: false,
    });
    expect(mediaPosition({ ...media, loop, positionMs: 0 }, 3500)).toMatchObject({
      unwrappedMs: 5000,
      positionMs: 3000,
      occurrence: 1,
      terminal: true,
    });
    expect(
      mediaPosition({ ...media, loop: { ...loop, plays: -1 }, positionMs: 0 }, 3500),
    ).toMatchObject({ positionMs: 1000, occurrence: 2, terminal: false });
  });
});

describe('bounded canonical score validation', () => {
  it('retains channel/program zero and same-pitch row identities, copying immutable content', () => {
    const input = scoreInput();
    const result = validateScore(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    input.parts[0].notes[0][2] = 10;
    expect(result.score.parts[0]).toMatchObject({
      program: 0,
      channelHint: 0,
      notes: [
        [0, 960, 60, 90],
        [0, 480, 60, 100],
      ],
    });
    expect(Object.isFrozen(result.score.parts[0].notes[0])).toBe(true);
    expect(result.inline).toBe(true);
    expect(result.unsupported).toEqual([]);
  });

  it('normalizes duplicate tempo/meter positions with the last authored edit', () => {
    const input = scoreInput();
    input.tempos = [
      { tick: 960, bpm: 60 },
      { tick: 0, bpm: 100 },
      { tick: 0, bpm: 120 },
    ];
    expect(validateScore(input)).toMatchObject({
      ok: true,
      score: {
        tempos: [
          { tick: 0, bpm: 120 },
          { tick: 960, bpm: 60 },
        ],
      },
    });
    const { tempos: _tempos, meters: _meters, ...withDefaults } = input;
    expect(validateScore(withDefaults)).toMatchObject({
      ok: true,
      score: {
        tempos: [{ tick: 0, bpm: 120 }],
        meters: [{ tick: 0, numerator: 4, denominator: 4 }],
      },
    });
  });

  it('preserves bounded track metadata and unsupported controls/bends without pretending to play them', () => {
    const input = scoreInput();
    const result = validateScore({
      ...input,
      metadata: [{ tick: 0, type: 1, data: [65, 66] }],
      parts: [
        {
          ...input.parts[0],
          endTick: 3840,
          controls: [{ tick: 960, controller: 1, value: 127 }],
          bends: [{ tick: 0, value: 8192 }],
          metadata: [{ tick: 0, type: 3, data: [80] }],
        },
      ],
    });
    expect(result).toMatchObject({
      ok: true,
      unsupported: ['controller:1', 'pitchBend'],
      score: {
        metadata: [{ tick: 0, type: 1, data: [65, 66] }],
        parts: [{ endTick: 3840, bends: [{ tick: 0, value: 8192 }] }],
      },
    });
  });

  it('rejects unsafe lengths, velocity-zero note-ons, invalid percussion and notes beyond EOT', () => {
    const base = scoreInput();
    for (const note of [
      [0, 0, 60, 90],
      [0, 960, 60, 0],
      [3840, 1, 60, 90],
      [Number.MAX_SAFE_INTEGER, 1, 60, 90],
      [0, 960, 128, 90],
    ]) {
      expect(validateScore({ ...base, parts: [{ ...base.parts[0], notes: [note] }] }).ok).toBe(
        false,
      );
    }
    expect(
      validateScore({
        ...base,
        parts: [{ ...base.parts[0], kind: 'percussion', notes: [[0, 960, 34, 90]] }],
      }).ok,
    ).toBe(false);
    expect(validateScore({ ...base, parts: [{ ...base.parts[0], endTick: 100 }] }).ok).toBe(false);
    expect(validateScore({ ...base, parts: [base.parts[0], base.parts[0]] }).ok).toBe(false);
    expect(validateScore({ ...base, meters: [{ tick: 0, numerator: 4, denominator: 3 }] }).ok).toBe(
      false,
    );
    expect(
      validateScore({
        ...base,
        parts: [
          {
            ...base.parts[0],
            notes: [
              [960, 1, 60, 90],
              [0, 1, 60, 90],
            ],
          },
        ],
      }).ok,
    ).toBe(false);
  });

  it('bounds event, part, duration and metadata work before traversing declarations', () => {
    const input = scoreInput();
    expect(validateScore({ ...input, parts: Array(17).fill(input.parts[0]) }).ok).toBe(false);
    expect(
      validateScore({
        ...input,
        parts: [{ ...input.parts[0], notes: Array(20001).fill([0, 1, 60, 90]) }],
      }).ok,
    ).toBe(false);
    expect(validateScore({ ...input, durationTicks: 2000000 }).ok).toBe(false);
    expect(
      validateScore({ ...input, metadata: [{ tick: 0, type: 1, data: Array(4097).fill(65) }] }).ok,
    ).toBe(false);
    expect(
      validateScore({
        ...input,
        metadata: Array(17).fill({ tick: 0, type: 1, data: Array(4096).fill(65) }),
      }).ok,
    ).toBe(false);
    expect(parseScore(' '.repeat(1048577)).ok).toBe(false);
    expect(parseScore('{').ok).toBe(false);
  });

  it('distinguishes inline limits from the larger asset budget', () => {
    const input = scoreInput();
    const result = validateScore({
      ...input,
      parts: [{ ...input.parts[0], notes: Array(2000).fill([0, 1, 60, 90]) }],
    });
    expect(result).toMatchObject({ ok: true, inline: false, eventCount: 2002 });
  });
});

describe('transport validation', () => {
  const base = {
    ...identity,
    kind: 'score',
    state: 'playing',
    anchorServerMs: 1000,
    anchorTick: 0,
    durationTicks: 3840,
  };
  it('accepts revision and program zero but rejects rate, unsafe sequence numbers and impossible loops', () => {
    expect(validateTransport(base).ok).toBe(true);
    for (const input of [
      { ...base, rate: 1 },
      { ...base, revision: Number.MAX_SAFE_INTEGER + 1 },
      { ...base, loop: { startTick: 0, endTick: 3841, plays: 1 } },
      { ...base, loop: { startTick: 0, endTick: 3840, plays: 0 } },
    ])
      expect(validateTransport(input).ok).toBe(false);
    expect(
      validateTransport({
        ...base,
        anchorTick: 7000,
        loop: { startTick: 0, endTick: 3840, plays: 2 },
      }).ok,
    ).toBe(true);
    expect(
      validateTransport({
        ...identity,
        kind: 'media',
        state: 'paused',
        anchorServerMs: 1000,
        positionMs: 0,
        rate: 1,
        mode: 'live',
        loop: { startMs: 0, endMs: 2000, plays: -1 },
      }).ok,
    ).toBe(false);
  });
});

describe('source lifetime and future revision ownership', () => {
  const first = {
    clockId: 'runtime',
    sourceId: 'performance',
    revision: 1,
    contentId: 'content-a',
  };
  it('requires Play for a grant and does not restart an idempotent re-Play', () => {
    const gate = new SourceRevisionGate();
    expect(gate.update(first)).toBe('rejected');
    expect(gate.play(first, 'different-runtime')).toBe('rejected');
    expect(gate.play(first, 'runtime')).toBe('replace');
    expect(gate.play(first, 'runtime')).toBe('unchanged');
    expect(gate.update({ ...first, sourceId: 'other' })).toBe('rejected');
    expect(gate.play({ ...first, sourceId: 'other' }, 'runtime')).toBe('replace');
  });

  it('keeps old prefix ownership until the future boundary and rejects stale or conflicting edits', () => {
    const gate = new SourceRevisionGate();
    gate.play(first, 'runtime');
    const second = {
      ...first,
      revision: 2,
      contentId: 'content-b',
      replaceFromTick: 3840,
      effectiveServerMs: 10000,
    };
    expect(gate.replaceFuture(second, 5000)).toBe('pending');
    expect(gate.active).toEqual(first);
    expect(gate.accepts(first, 3839)).toBe(true);
    expect(gate.accepts(first, 3840)).toBe(false);
    expect(gate.accepts(second, 3840)).toBe(true);
    expect(gate.replaceFuture({ ...second, contentId: 'collision' }, 5000)).toBe('rejected');
    expect(gate.replaceFuture({ ...second, replaceFromTick: 4000 }, 5000)).toBe('rejected');
    expect(gate.update(first)).toBe('stale');
    expect(gate.advance(9999)).toBe(false);
    expect(gate.advance(10000)).toBe(true);
    expect(gate.active?.contentId).toBe('content-b');
    expect(gate.pending).toBeUndefined();
  });

  it('supersedes pending edits without stealing the active prefix; higher immediate controls cancel pending work', () => {
    const gate = new SourceRevisionGate();
    gate.play(first, 'runtime');
    const pending = {
      ...first,
      revision: 2,
      contentId: 'b',
      replaceFromTick: 3840,
      effectiveServerMs: 10000,
    };
    gate.replaceFuture(pending, 5000);
    expect(gate.replaceFuture({ ...pending, revision: 3, contentId: 'c' }, 5000)).toBe('pending');
    expect(gate.active).toEqual(first);
    expect(gate.update({ ...first, revision: 4 })).toBe('active');
    expect(gate.pending).toBeUndefined();
    expect(gate.advance(11000)).toBe(false);
    expect(gate.replaceFuture({ ...pending, revision: 5 }, 11000)).toBe('late-replacement');
    gate.reset();
    expect(gate.active).toBeUndefined();
  });
});
