import { describe, it, expect } from 'vitest';
import { decodeMediaPlay } from '../audio/mediaPayloads';
import { decodeSequenceData } from './SequencePayload';
import { SequenceLane } from './SequenceGraph';
const score = {
  version: 1,
  contentId: 'content',
  ppq: 960,
  durationTicks: 3840,
  tempos: [{ tick: 0, bpm: 120 }],
  meters: [{ tick: 0, numerator: 4, denominator: 4 }],
  parts: [
    {
      id: 'p',
      name: 'Piano',
      kind: 'melodic',
      program: 0,
      notes: [[0, 960, 60, 100]],
      controls: [],
      programs: [],
    },
  ],
};
const transport = {
  version: 1,
  clockId: 'runtime',
  sourceId: 'source',
  revision: 1,
  kind: 'score',
  state: 'playing',
  anchorTick: 0,
  anchorServerMs: 1000,
  durationTicks: 3840,
};
const frame = {
  key: 'music',
  name: '',
  type: 'music',
  contentId: 'content',
  midi: { version: 1, score },
  transport,
};
const window = {
  seq: 0,
  fromTick: 1920,
  toTick: 3840,
  anchorServerMs: 1000,
  contentId: 'content',
  revision: 1,
  tempos: [{ tick: 1920, bpm: 120 }],
  meters: [{ tick: 1920, numerator: 4, denominator: 4, barOriginTick: 0 }],
  parts: [{ ...score.parts[0], notes: [[1920, 2880, 60, 100]] }],
};
describe('sequence wire decoder', () => {
  it('recognizes a complete valid score before empty-filename URL resolution', () => {
    const result = decodeMediaPlay(frame);
    expect(result.mediaKind).toBe('score');
    expect(result.midi).toMatchObject({ score: { contentId: 'content' } });
    expect(() => decodeMediaPlay({ name: '' })).toThrow();
    expect(() => decodeMediaPlay({ ...frame, midi: undefined })).toThrow();
    expect(() => decodeMediaPlay({ ...frame, type: 'sound' })).toThrow();
    expect(() => decodeMediaPlay({ ...frame, contentId: 'another' })).toThrow();
    expect(() =>
      decodeMediaPlay({ ...frame, midi: { version: 1, score, stream: true, windows: [] } }),
    ).toThrow();
  });
  it('normalizes bounded anchored windows without losing absolute bar phase or long release', () => {
    const result = decodeSequenceData(
      { version: 1, stream: true, windows: [window] },
      'content',
      1,
    );
    expect(result).toMatchObject({
      windows: [{ fromTick: 1920, barOriginTick: 0, score: { durationTicks: 2880 } }],
    });
    if ('stream' in result) {
      expect(result.windows[0].score.parts[0].notes).toEqual([[0, 2880, 60, 100]]);
      expect(result.windows[0].score.tempos[0].tick).toBe(0);
    }
    expect(() =>
      decodeSequenceData(
        {
          version: 1,
          stream: true,
          windows: [{ ...window, meters: [{ tick: 1920, numerator: 4, denominator: 4 }] }],
        },
        'content',
        1,
      ),
    ).toThrow();
    expect(() =>
      decodeSequenceData(
        { version: 1, stream: true, windows: [window, { ...window, seq: 1 }] },
        'content',
        1,
      ),
    ).toThrow();
    expect(() =>
      decodeSequenceData(
        { version: 1, stream: true, windows: [{ ...window, contentId: 'other' }] },
        'content',
        1,
      ),
    ).toThrow();
  });
  it('validates public same-origin asset references without fetching them', () => {
    const content = { sha256: 'a'.repeat(64), url: '/api/music/content', byteLength: 100 };
    expect(decodeSequenceData({ version: 1, content }, 'content', 1)).toEqual({
      version: 1,
      content,
    });
    for (const url of [
      'https://evil.invalid/a',
      '//evil.invalid/a',
      '/\\evil.invalid/a',
      '/\n/evil.invalid/a',
    ])
      expect(() =>
        decodeSequenceData({ version: 1, content: { ...content, url } }, 'content', 1),
      ).toThrow();
  });
  it('recalls suffix automation and restores the actual prefix value at large timestamps', () => {
    const applied: { value: number; time: number }[] = [];
    const parameter = {
      value: 0,
      cancelScheduledValues: () => {},
      setValueAtTime: (value: number, time: number) => applied.push({ value, time }),
    } as unknown as AudioParam;
    const lane = new SequenceLane(parameter, 1);
    lane.set(0.5, 1000000);
    lane.set(0, 1000001);
    lane.cancelFrom(1000001);
    expect(applied.at(-1)).toEqual({ value: 0.5, time: 1000001 });
    lane.set(0.8, 1000002);
    lane.prune(1000002);
    expect(lane.valueAt(1000003)).toBe(0.8);
  });
});
