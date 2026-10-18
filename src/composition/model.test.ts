import { describe, it, expect } from 'vitest';
import {
  newComposition,
  compileComposition,
  quantizeNotes,
  updateComposition,
  undoComposition,
  redoComposition,
  draftFromScore,
} from './model';
import { CompositionCapture } from './capture';
import { importSmf, exportSmf } from './smf';
import WebAudioTinySynth from '@xrnavigation/webaudio-tinysynth';

const text = (value: string) => [...value].map((char) => char.charCodeAt(0));
const chunk = (name: string, bytes: number[]) => [
  ...text(name),
  bytes.length >>> 24,
  (bytes.length >>> 16) & 255,
  (bytes.length >>> 8) & 255,
  bytes.length & 255,
  ...bytes,
];
// Independent SMF bytes: PPQ480; conductor ends at480, piano at960; 3/4,
// tempo120 then60; program/channel zero, CC7 and track-name/marker/key metadata.
function fixture() {
  const conductor = [
    0,
    255,
    3,
    9,
    ...text('Conductor'),
    0,
    255,
    0x58,
    4,
    3,
    2,
    24,
    8,
    0,
    255,
    0x51,
    3,
    7,
    161,
    32,
    0,
    255,
    0x59,
    2,
    1,
    0,
    0,
    255,
    6,
    5,
    ...text('Verse'),
    0x83,
    0x60,
    255,
    0x51,
    3,
    15,
    66,
    64,
    0,
    255,
    0x2f,
    0,
  ];
  const piano = [
    0,
    255,
    3,
    5,
    ...text('Piano'),
    0,
    0xc0,
    0,
    0,
    0xb0,
    7,
    100,
    0,
    0x90,
    60,
    100,
    0x83,
    0x60,
    0x80,
    60,
    0,
    0x83,
    0x60,
    255,
    0x2f,
    0,
  ];
  return new Uint8Array([
    77,
    84,
    104,
    100,
    0,
    0,
    0,
    6,
    0,
    1,
    0,
    2,
    1,
    224,
    ...chunk('MTrk', conductor),
    ...chunk('MTrk', piano),
  ]).buffer;
}
describe('musical pattern arrangement', () => {
  it('fills or truncates explicit section lengths without losing rests or trailing silence', () => {
    const base = newComposition(),
      pattern = base.patterns[0],
      part = base.parts[0];
    const draft = {
      ...base,
      patterns: [
        {
          ...pattern,
          durationTicks: 960,
          parts: [
            { partId: part.id, notes: [[0, 720, 60, 100] as const], controls: [], programs: [] },
          ],
        },
      ],
      sections: [{ ...base.sections[0], lengthTicks: 2400, repeat: 2, mode: 'fill' as const }],
    };
    const filled = compileComposition(draft);
    expect(filled.durationTicks).toBe(4800);
    expect(filled.parts[0].notes).toEqual([
      [0, 720, 60, 100],
      [960, 720, 60, 100],
      [1920, 480, 60, 100],
      [2400, 720, 60, 100],
      [3360, 720, 60, 100],
      [4320, 480, 60, 100],
    ]);
    expect(
      compileComposition({ ...draft, sections: [{ ...draft.sections[0], mode: 'truncate' }] })
        .parts[0].notes,
    ).toHaveLength(2);
  });
  it('mute/solo is audition policy while exports retain all parts, and undo restores original timing', () => {
    const base = newComposition(),
      pattern = base.patterns[0],
      part = base.parts[0];
    const original = {
      ...base,
      parts: [{ ...part, mute: true }],
      patterns: [
        {
          ...pattern,
          parts: [
            { partId: part.id, notes: [[130, 310, 60, 100] as const], controls: [], programs: [] },
          ],
        },
      ],
    };
    expect(compileComposition(original).parts[0].notes).toHaveLength(0);
    expect(compileComposition(original, undefined, false).parts[0].notes).toHaveLength(1);
    const quantized = quantizeNotes(original.patterns[0].parts[0].notes, 240, 0.5, 3840);
    expect(quantized).toEqual([[360, 240, 60, 100]]);
    const history = updateComposition(
      { present: original, past: [], future: [] },
      { ...original, name: 'Edited' },
    );
    expect(undoComposition(history).present).toBe(original);
    expect(redoComposition(undoComposition(history)).present.name).toBe('Edited');
  });
});
describe('timestamped capture', () => {
  it('maps real timestamps across tempo changes and retains original receipt timing for overdub', () => {
    const draft = newComposition();
    const score = {
      ...compileComposition(draft),
      tempos: [
        { tick: 0, bpm: 120 },
        { tick: 960, bpm: 60 },
      ],
    };
    const capture = new CompositionCapture({
      score,
      partId: draft.parts[0].id,
      patternId: draft.patterns[0].id,
      startPerformanceMs: 1000,
    });
    const message = (data: number[]) => ({
      rawData: { data: new Uint8Array(data), hex: '', type: '' },
    });
    capture.input(message([0x90, 60, 100]), 990); // Count-in: not recorded.
    capture.input(message([0x90, 60, 100]), 1250.25);
    capture.input(message([0x80, 60, 0]), 1750.25);
    const result = capture.finish(2000);
    expect(result.notes).toEqual([[480, 720, 60, 100]]);
    expect(result.take.events.map((event) => event.performanceTimeMs)).toEqual([1250.25, 1750.25]);
    expect(result.take.unquantizedNotes).toEqual(result.notes);
  });
  it('closes held keys at stop and ignores malformed/system input', () => {
    const draft = newComposition(),
      score = compileComposition(draft);
    const capture = new CompositionCapture({
      score,
      partId: draft.parts[0].id,
      patternId: draft.patterns[0].id,
      startPerformanceMs: 0,
    });
    const input = (data: number[], time: number) =>
      capture.input({ rawData: { data: new Uint8Array(data), hex: '', type: '' } }, time);
    input([0x90, 60], 0);
    input([0xff], 0);
    input([0x90, 62, 90], 100);
    expect(capture.finish(500).notes).toEqual([[192, 768, 62, 90]]);
  });
});
describe('bounded faithful SMF authoring', () => {
  it('pairs note releases by channel across physical tracks, preserving onset ownership', () => {
    const bytes = WebAudioTinySynth.writeMIDI({
      format: 1,
      timebase: 3840,
      maxTick: 1920,
      tempo: 120,
      copyright: '',
      text: '',
      ev: [],
      tracks: [
        { endTick: 1920, events: [{ t: 0, kind: 'midi', message: [0x90, 60, 100] }] },
        { endTick: 1920, events: [{ t: 960, kind: 'midi', message: [0x80, 60, 0] }] },
      ],
    });
    const imported = importSmf(bytes);
    expect(imported.score.parts[0].notes).toEqual([[0, 960, 60, 100]]);
    expect(imported.score.parts[1].notes).toEqual([]);
  });
  it('retains later key changes and format-zero channel separation through editable drafts', () => {
    const bytes = WebAudioTinySynth.writeMIDI({
      format: 0,
      timebase: 3840,
      maxTick: 1920,
      tempo: 120,
      copyright: '',
      text: '',
      ev: [],
      tracks: [
        {
          endTick: 1920,
          events: [
            { t: 0, kind: 'meta', type: 0x59, data: [0, 0] },
            { t: 960, kind: 'meta', type: 0x59, data: [254, 1] },
            { t: 0, kind: 'midi', message: [0x90, 60, 100] },
            { t: 480, kind: 'midi', message: [0x80, 60, 0] },
            { t: 0, kind: 'midi', message: [0x91, 64, 100] },
            { t: 480, kind: 'midi', message: [0x81, 64, 0] },
          ],
        },
      ],
    });
    const imported = importSmf(bytes);
    const draft = draftFromScore(imported.score, 'Key changes', imported.sourceFormat);
    const score = compileComposition(draft, undefined, false);
    expect(score.metadata).toContainEqual({ tick: 960, type: 0x59, data: [254, 1] });
    const exported = WebAudioTinySynth.parseMIDI(exportSmf(score, draft.sourceFormat));
    expect(exported.format).toBe(0);
    expect(exported.tracks).toHaveLength(1);
    expect(exported.tracks[0].events).toContainEqual({
      t: 960,
      kind: 'meta',
      type: 0x59,
      data: [254, 1],
    });
    expect(importSmf(exportSmf(score, 0)).score.parts.map((part) => part.channelHint)).toEqual([
      0, 1,
    ]);
  });
  it('chases shared-channel program and controller state across physical tracks', () => {
    const bytes = WebAudioTinySynth.writeMIDI({
      format: 1,
      timebase: 3840,
      maxTick: 1920,
      tempo: 120,
      copyright: '',
      text: '',
      ev: [],
      tracks: [
        {
          endTick: 1920,
          events: [
            { t: 0, kind: 'midi', message: [0xc0, 40] },
            { t: 480, kind: 'midi', message: [0xb0, 7, 80] },
            { t: 960, kind: 'midi', message: [0xc0, 0] },
          ],
        },
        {
          endTick: 1920,
          events: [
            { t: 0, kind: 'midi', message: [0x90, 60, 100] },
            { t: 1440, kind: 'midi', message: [0x80, 60, 0] },
          ],
        },
      ],
    });
    const imported = importSmf(bytes);
    expect(imported.score.parts[1].program).toBe(40);
    expect(imported.score.parts[1].programs).toEqual([
      { tick: 0, program: 40 },
      { tick: 960, program: 0 },
    ]);
    expect(imported.score.parts[1].controls).toEqual([{ tick: 480, controller: 7, value: 80 }]);
    const again = importSmf(exportSmf(imported.score, 1));
    expect(again.score.parts[1].programs).toEqual(imported.score.parts[1].programs);
    expect(again.score.parts[1].controls).toEqual(imported.score.parts[1].controls);
  });
  it('imports independent byte fixtures, preserves metadata/track EOT and exports musical positions faithfully', () => {
    const imported = importSmf(fixture());
    expect(imported.score.tempos).toEqual([
      { tick: 0, bpm: 120 },
      { tick: 960, bpm: 60 },
    ]);
    expect(imported.score.meters).toEqual([{ tick: 0, numerator: 3, denominator: 4 }]);
    expect(imported.score.parts.map((part) => [part.name, part.endTick])).toEqual([
      ['Conductor', 960],
      ['Piano', 1920],
    ]);
    expect(imported.score.parts[1].notes).toEqual([[0, 960, 60, 100]]);
    const draft = draftFromScore(imported.score, 'Imported', imported.sourceFormat);
    const exported = WebAudioTinySynth.parseMIDI(
      exportSmf(compileComposition(draft, undefined, false), draft.sourceFormat),
    );
    expect(exported.timebase).toBe(3840);
    expect(exported.tracks.map((track) => [track.name, track.endTick])).toEqual([
      ['Conductor', 960],
      ['Piano', 1920],
    ]);
    expect(exported.tracks[0].events).toContainEqual({
      t: 0,
      kind: 'meta',
      type: 6,
      data: text('Verse'),
    });
    expect(exported.tracks[0].events).toContainEqual({
      t: 0,
      kind: 'meta',
      type: 0x58,
      data: [3, 2, 24, 8],
    });
    expect(exported.tracks[1].events).toContainEqual({ t: 0, kind: 'midi', message: [0xc0, 0] });
    expect(exported.tracks[1].events).toContainEqual({
      t: 960,
      kind: 'midi',
      message: [0x80, 60, 0],
    });
  });
  it('enforces byte budgets before parsing', () => {
    expect(() => importSmf(new ArrayBuffer(1048577))).toThrow('1 MiB');
  });
});
