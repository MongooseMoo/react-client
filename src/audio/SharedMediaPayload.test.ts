import { describe, expect, it } from 'vitest';
import { decodeMediaPlay, decodeMediaUpdate } from './mediaPayloads';
import { decodeMediaCueWindows, mergeMediaCueWindows } from './SharedMediaPayload';
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
};
const window = {
  seq: 0,
  fromMs: 1000,
  toMs: 4000,
  cues: [{ id: 'cue', startMs: 1000, endMs: 3000, text: 'A caption' }],
};
describe('shared media boundary', () => {
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
  it('retransmits immutably, evicts past windows, rejects conflicting seq and overlapping spans', () => {
    const next = {
      ...window,
      seq: 1,
      fromMs: 4000,
      toMs: 6000,
      cues: [{ ...window.cues[0], id: 'next', startMs: 4000, endMs: 5000 }],
    };
    expect(mergeMediaCueWindows([window], [window, next], 4000)).toEqual([next]);
    expect(() => mergeMediaCueWindows([window], [{ ...window, toMs: 5000 }], 2000)).toThrow(
      /Conflicting/,
    );
    expect(() => mergeMediaCueWindows([window], [{ ...next, fromMs: 3000 }], 2000)).toThrow(
      /Overlapping/,
    );
  });
});
