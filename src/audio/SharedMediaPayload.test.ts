import { describe, expect, it } from 'vitest';
import { decodeMediaPlay, decodeMediaUpdate } from './mediaPayloads';
import {
  decodeMediaCueWindows,
  mergeMediaCueWindows,
  MediaCueGap,
  decodeMediaSync,
} from './SharedMediaPayload';
const transport = {
  version: 1,
  kind: 'media',
  clockId: 'clock',
  sourceId: 'source',
  revision: 1,
  state: 'paused',
  anchorServerMs: 100,
  positionMs: 2000,
  durationMs: 10000,
  rate: 1,
  mode: 'finite',
  discontinuity: 0,
};
const window = {
  seq: 0,
  fromMs: 1000,
  toMs: 4000,
  cues: [{ id: 'cue', startMs: 1000, endMs: 3000, text: 'A caption' }],
};
describe('shared media boundary', () => {
  it('keeps shared rate authoritative while preserving legacy pitch control', () => {
    expect(() =>
      decodeMediaPlay({ key: 'tv', name: 'movie', transport, pitchSemitones: 1 }),
    ).toThrow();
    expect(() => decodeMediaUpdate({ key: 'tv', transport, pitchSemitones: 1 })).toThrow();
    expect(decodeMediaPlay({ name: 'legacy', pitchSemitones: 1 })).toMatchObject({
      pitchSemitones: 1,
    });
  });
  it('retains file transport/windows and rejects empty file names independently of score decoding', () => {
    expect(
      decodeMediaPlay({ key: 'tv', name: 'movie', transport, cueWindows: [window] }),
    ).toMatchObject({ mediaKind: 'file', transport, cueWindows: [window] });
    expect(() => decodeMediaPlay({ key: 'tv', name: '', transport })).toThrow();
    expect(decodeMediaUpdate({ key: 'tv', transport })).toMatchObject({ transport });
    const score = {
      version: 1,
      contentId: 'content',
      ppq: 960,
      durationTicks: 960,
      tempos: [{ tick: 0, bpm: 120 }],
      meters: [{ tick: 0, numerator: 4, denominator: 4 }],
      parts: [],
    };
    expect(
      decodeMediaPlay({
        key: 'score',
        name: '',
        type: 'music',
        contentId: 'content',
        midi: { version: 1, score },
        transport: {
          version: 1,
          clockId: 'clock',
          sourceId: 'score-source',
          revision: 1,
          state: 'paused',
          anchorServerMs: 100,
          kind: 'score',
          anchorTick: 0,
          durationTicks: 960,
        },
      }).mediaKind,
    ).toBe('score');
    expect(decodeMediaPlay({ key: 'file', name: 'movie', transport }).mediaKind).toBe('file');
  });
  it.each([NaN, Infinity, -1, '2'])('rejects invalid media time %s', (value) => {
    expect(() =>
      decodeMediaPlay({ key: 'tv', name: 'movie', transport: { ...transport, positionMs: value } }),
    ).toThrow();
  });
  it('bounds UTF-8 bytes, total packet bytes, identifiers, axes and live cues', () => {
    const decode = (cue: unknown) => decodeMediaCueWindows([{ ...window, cues: [cue] }]);
    expect(() => decode({ ...window.cues[0], text: '🎵'.repeat(1025) })).toThrow();
    expect(() => decode({ ...window.cues[0], text: '\uD800' })).toThrow();
    expect(() => decode({ ...window.cues[0], id: 'cue with space' })).toThrow();
    expect(() => decode({ ...window.cues[0], endMs: 1000 })).toThrow();
    expect(() =>
      decodeMediaPlay({
        key: 'tv',
        name: 'movie',
        transport: { ...transport, mode: 'live', durationMs: undefined },
        cueWindows: [window],
      }),
    ).toThrow();
    expect(() =>
      decodeMediaCueWindows([
        {
          ...window,
          cues: Array.from({ length: 5 }, (_, index) => ({
            ...window.cues[0],
            id: `c${index}`,
            text: 'x'.repeat(4096),
          })),
        },
      ]),
    ).toThrow(/packet/);
  });
  it('retransmits immutably and rejects conflicting known seq or nonadjacent spans', () => {
    const next = {
      ...window,
      seq: 1,
      fromMs: 4000,
      toMs: 6000,
      cues: [{ ...window.cues[0], id: 'next', startMs: 4000, endMs: 5000 }],
    };
    expect(mergeMediaCueWindows([window], [window, next])).toEqual([window, next]);
    expect(() => mergeMediaCueWindows([window], [{ ...window, toMs: 5000 }])).toThrow(
      /Conflicting/,
    );
    expect(() => mergeMediaCueWindows([window], [{ ...next, fromMs: 3000 }])).toThrow(MediaCueGap);
  });
  it('requires integer bounds, single-line UTF8 and an explicit cue discontinuity', () => {
    for (const text of ['line\nline', 'tab\ttext', '\u0000', '\u0085', '\u2028'])
      expect(() =>
        decodeMediaCueWindows([{ ...window, cues: [{ ...window.cues[0], text }] }]),
      ).toThrow();
    expect(() => decodeMediaCueWindows([{ ...window, fromMs: 1000.5 }])).toThrow();
    expect(() =>
      decodeMediaPlay({
        key: 'tv',
        name: 'movie',
        transport: { ...transport, discontinuity: undefined },
        cueWindows: [window],
      }),
    ).toThrow();
    expect(
      decodeMediaSync({
        key: 'tv',
        sourceId: 'source',
        requestId: 'r',
        transport,
        cueWindows: [window],
      }).cueWindows,
    ).toEqual([window]);
  });
  it('carries a long cue identically through adjacent windows and counts distinct IDs', () => {
    const cues = Array.from({ length: 160 }, (_, index) => ({
      id: `c${index}`,
      startMs: 0,
      endMs: 4000,
      text: 'caption',
    }));
    const windows = Array.from({ length: 4 }, (_, seq) => ({
      seq,
      fromMs: seq * 1000,
      toMs: (seq + 1) * 1000,
      cues,
    }));
    let ring = [] as readonly (typeof windows)[number][];
    for (const value of windows) {
      const decoded = decodeMediaCueWindows([value]) ?? [];
      ring = mergeMediaCueWindows(ring, decoded);
    }
    expect(ring).toHaveLength(4);
    expect(new Set(ring.flatMap((w) => w.cues.map((c) => c.id))).size).toBe(160);
    expect(() => decodeMediaCueWindows([windows[0], { ...windows[1], cues: [] }])).toThrow(
      /overlapping/,
    );
    expect(() =>
      decodeMediaCueWindows([
        windows[0],
        { ...windows[1], cues: [{ ...cues[0], text: 'different' }, ...cues.slice(1)] },
      ]),
    ).toThrow();
  });
  it('evicts the oldest window before applying union caps and ignores evicted retransmits', () => {
    const make = (seq: number) => ({
      seq,
      fromMs: seq * 1000,
      toMs: (seq + 1) * 1000,
      cues: Array.from({ length: 128 }, (_, index) => ({
        id: `c${seq}_${index}`,
        startMs: seq * 1000,
        endMs: (seq + 1) * 1000,
        text: 'x',
      })),
    });
    const previous = Array.from({ length: 4 }, (_, seq) => make(seq));
    const ring = mergeMediaCueWindows(previous, [make(4)]);
    expect(ring.map((w) => w.seq)).toEqual([1, 2, 3, 4]);
    expect(ring.flatMap((w) => w.cues)).toHaveLength(512);
    expect(mergeMediaCueWindows(ring, [make(0)])).toEqual(ring);
    expect(() => mergeMediaCueWindows(ring, [make(6)])).toThrow(MediaCueGap);
  });
  it('limits each batch to three adjacent windows while allowing a four-window retained ring', () => {
    const windows = Array.from({ length: 4 }, (_, seq) => ({
      seq,
      fromMs: seq * 1000,
      toMs: (seq + 1) * 1000,
      cues: [],
    }));
    expect(decodeMediaCueWindows(windows.slice(0, 3))).toHaveLength(3);
    expect(() => decodeMediaCueWindows(windows)).toThrow();
    expect(mergeMediaCueWindows(windows.slice(0, 3), windows.slice(3))).toHaveLength(4);
  });
});
