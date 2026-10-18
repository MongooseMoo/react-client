import {
  SCORE_PPQ,
  validateScore,
  type CanonicalScore,
  type ScorePart,
  type ScoreNote,
  type ScoreControl,
  type ScoreProgram,
  type ScoreMetadata,
  type ScoreTempo,
  type ScoreMeter,
} from '../midi/score';

export interface ComposerPart {
  id: string;
  name: string;
  kind: 'melodic' | 'percussion';
  program: number;
  gain: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  channelHint?: number;
}
export interface PatternPart {
  partId: string;
  notes: readonly ScoreNote[];
  controls: readonly ScoreControl[];
  programs: readonly ScoreProgram[];
  metadata?: readonly ScoreMetadata[];
  bends?: ScorePart['bends'];
  endTick?: number;
}
export interface Pattern {
  id: string;
  name: string;
  durationTicks: number;
  parts: readonly PatternPart[];
}
export interface ArrangementSection {
  id: string;
  patternId: string;
  lengthTicks: number;
  repeat: number;
  mode: 'fill' | 'truncate';
}
export interface CapturedInput {
  performanceTimeMs: number;
  data: readonly number[];
}
export interface CaptureTake {
  id: string;
  partId: string;
  patternId: string;
  startPerformanceMs: number;
  endPerformanceMs: number;
  startTick: number;
  events: readonly CapturedInput[];
  unquantizedNotes: readonly ScoreNote[];
}
export interface CompositionDraft {
  version: 1;
  id: string;
  revisionId?: string;
  name: string;
  parts: readonly ComposerPart[];
  patterns: readonly Pattern[];
  sections: readonly ArrangementSection[];
  tempos: readonly ScoreTempo[];
  meters: readonly ScoreMeter[];
  key: number;
  minor: boolean;
  takes: readonly CaptureTake[];
  metadata?: readonly ScoreMetadata[];
  sourceFormat?: 0 | 1;
  updatedAt: number;
}
export interface CompositionHistory {
  present: CompositionDraft;
  past: readonly CompositionDraft[];
  future: readonly CompositionDraft[];
}
const id = () => crypto.randomUUID();
export function newComposition(): CompositionDraft {
  const partId = id(),
    patternId = id();
  return {
    version: 1,
    id: id(),
    revisionId: id(),
    name: 'Untitled composition',
    parts: [
      {
        id: partId,
        name: 'Piano',
        kind: 'melodic',
        program: 0,
        gain: 100,
        pan: 64,
        mute: false,
        solo: false,
      },
    ],
    patterns: [
      {
        id: patternId,
        name: 'Pattern 1',
        durationTicks: 3840,
        parts: [{ partId, notes: [], controls: [], programs: [] }],
      },
    ],
    sections: [{ id: id(), patternId, lengthTicks: 3840, repeat: 1, mode: 'truncate' }],
    tempos: [{ tick: 0, bpm: 120 }],
    meters: [{ tick: 0, numerator: 4, denominator: 4 }],
    key: 0,
    minor: false,
    takes: [],
    updatedAt: Date.now(),
  };
}
const integer = (value: number, min: number, max = Number.MAX_SAFE_INTEGER) => {
  if (!Number.isSafeInteger(value) || value < min || value > max)
    throw new RangeError('Composition value outside bounds');
  return value;
};
const compiledIds = new WeakMap<CompositionDraft, Map<string, string>>();
/** Materializes explicit section repeats. Publication supplies a frozen UUID contentId;
 * private variants cache their own UUID for this immutable draft object. */
export function compileComposition(
  draft: CompositionDraft,
  patternId?: string,
  applyAuditionMix = true,
  contentId?: string,
): CanonicalScore {
  if (
    draft.parts.length > 16 ||
    !draft.parts.length ||
    draft.patterns.length > 64 ||
    draft.sections.length > 256
  )
    throw new RangeError('Composition structure exceeds limits');
  const solo = draft.parts.some((part) => part.solo);
  const parts = new Map<
    string,
    {
      definition: ComposerPart;
      endTick: number;
      notes: ScoreNote[];
      controls: ScoreControl[];
      programs: ScoreProgram[];
      metadata: ScoreMetadata[];
      bends: NonNullable<ScorePart['bends']>[number][];
    }
  >();
  for (const definition of draft.parts) {
    if (parts.has(definition.id)) throw new TypeError('Duplicate part ID');
    parts.set(definition.id, {
      definition,
      endTick: 0,
      notes: [],
      controls: [],
      programs: [],
      metadata: [],
      bends: [],
    });
  }
  const selected = patternId
    ? draft.patterns.find((pattern) => pattern.id === patternId)
    : undefined;
  if (patternId && !selected) throw new TypeError('Pattern no longer exists');
  const sections: readonly ArrangementSection[] = selected
    ? [
        {
          id: 'preview',
          patternId: selected.id,
          lengthTicks: selected.durationTicks,
          repeat: 1,
          mode: 'truncate',
        },
      ]
    : draft.sections;
  let cursor = 0,
    eventCount = 0;
  for (const section of sections) {
    const pattern = draft.patterns.find((item) => item.id === section.patternId);
    if (!pattern) throw new TypeError('Arrangement refers to a missing pattern');
    integer(pattern.durationTicks, 1);
    integer(section.lengthTicks, 1);
    integer(section.repeat, 1, 64);
    if (section.mode !== 'fill' && section.mode !== 'truncate')
      throw new TypeError('Unknown arrangement fill policy');
    const occurrences =
      section.mode === 'fill' ? Math.ceil(section.lengthTicks / pattern.durationTicks) : 1;
    if (occurrences * section.repeat > 20000)
      throw new RangeError('Arrangement expansion exceeds limits');
    for (let repeat = 0; repeat < section.repeat; repeat++) {
      const sectionStart = cursor;
      for (let occurrence = 0; occurrence < occurrences; occurrence++) {
        const offset = sectionStart + occurrence * pattern.durationTicks;
        const available = Math.min(
          pattern.durationTicks,
          section.lengthTicks - occurrence * pattern.durationTicks,
        );
        for (const material of pattern.parts) {
          const output = parts.get(material.partId);
          if (!output) throw new TypeError('Pattern refers to a missing part');
          output.endTick = Math.max(
            output.endTick,
            offset + Math.min(material.endTick ?? pattern.durationTicks, available),
          );
          const muted =
            applyAuditionMix && (output.definition.mute || (solo && !output.definition.solo));
          const rows = material.notes.filter((row) => row[0] < available);
          eventCount +=
            rows.length +
            material.controls.length +
            material.programs.length +
            (material.metadata?.length ?? 0) +
            (material.bends?.length ?? 0);
          if (eventCount > 20000) throw new RangeError('Expanded score exceeds 20000 events');
          if (!muted)
            for (const [tick, duration, note, velocity] of rows)
              output.notes.push([
                offset + tick,
                Math.min(duration, available - tick),
                note,
                velocity,
              ]);
          for (const event of material.controls)
            if (event.tick < available)
              output.controls.push({ ...event, tick: offset + event.tick });
          for (const event of material.programs)
            if (event.tick < available)
              output.programs.push({ ...event, tick: offset + event.tick });
          for (const event of material.metadata ?? [])
            if (event.tick <= available)
              output.metadata.push({ ...event, tick: offset + event.tick });
          for (const event of material.bends ?? [])
            if (event.tick < available) output.bends.push({ ...event, tick: offset + event.tick });
        }
      }
      cursor += section.lengthTicks;
      integer(cursor, 1);
    }
  }
  const durationTicks = cursor;
  let identities = compiledIds.get(draft);
  if (!identities) {
    identities = new Map();
    compiledIds.set(draft, identities);
  }
  const variant = JSON.stringify([patternId, applyAuditionMix]);
  if (!identities.has(variant)) identities.set(variant, id());
  const score = {
    version: 1,
    contentId:
      contentId ??
      (!patternId && !applyAuditionMix && draft.revisionId
        ? draft.revisionId
        : identities.get(variant)),
    ppq: SCORE_PPQ,
    durationTicks,
    tempos: draft.tempos.filter((event) => event.tick <= durationTicks),
    meters: draft.meters.filter((event) => event.tick <= durationTicks),
    metadata: [
      ...(draft.metadata ?? []).filter(
        (event) => event.tick <= durationTicks && (event.type !== 0x59 || event.tick !== 0),
      ),
      {
        tick: 0,
        type: 0x59,
        data: [draft.key < 0 ? 256 + draft.key : draft.key, draft.minor ? 1 : 0],
      },
    ],
    parts: [...parts.values()].map(
      ({ definition, endTick, notes, controls, programs, metadata, bends }) => ({
        id: definition.id,
        name: definition.name,
        kind: definition.kind,
        program: definition.program,
        channelHint: definition.channelHint,
        endTick,
        notes: notes.sort((a, b) => a[0] - b[0]),
        controls: [
          { tick: 0, controller: 7, value: definition.gain },
          { tick: 0, controller: 10, value: definition.pan },
          ...controls.filter(
            (event) => event.tick !== 0 || (event.controller !== 7 && event.controller !== 10),
          ),
        ].sort((a, b) => a.tick - b.tick),
        programs: programs.sort((a, b) => a.tick - b.tick),
        metadata: metadata.sort((a, b) => a.tick - b.tick),
        bends: bends.sort((a, b) => a.tick - b.tick),
      }),
    ),
  };
  const validation = validateScore(score);
  if (!validation.ok) throw new TypeError(validation.error);
  return validation.score;
}
export function updateComposition(
  history: CompositionHistory,
  next: CompositionDraft,
  alreadyValidated = false,
): CompositionHistory {
  if (!alreadyValidated) compileComposition(next);
  return {
    present: { ...next, revisionId: id(), updatedAt: Date.now() },
    past: [...history.past, history.present].slice(-20),
    future: [],
  };
}
/** Preserve an imported EOT until an authored event actually needs a later end. */
export function extendPartEnd(material: PatternPart): PatternPart {
  if (material.endTick === undefined) return material;
  const endTick = Math.max(
    material.endTick,
    ...material.notes.map(([tick, duration]) => tick + duration),
    ...material.controls.map((event) => event.tick),
    ...material.programs.map((event) => event.tick),
    ...(material.bends ?? []).map((event) => event.tick),
    ...(material.metadata ?? []).map((event) => event.tick),
  );
  return endTick === material.endTick ? material : { ...material, endTick };
}
export function undoComposition(history: CompositionHistory): CompositionHistory {
  const previous = history.past.at(-1);
  return previous
    ? {
        present: previous,
        past: history.past.slice(0, -1),
        future: [history.present, ...history.future].slice(0, 20),
      }
    : history;
}
export function redoComposition(history: CompositionHistory): CompositionHistory {
  const next = history.future[0];
  return next
    ? {
        present: next,
        past: [...history.past, history.present].slice(-20),
        future: history.future.slice(1),
      }
    : history;
}
/** Derive edited rows without replacing original take events or unquantized notes. */
export function quantizeNotes(
  notes: readonly ScoreNote[],
  grid: number,
  swing: number,
  durationTicks: number,
): readonly ScoreNote[] {
  integer(grid, 1, 3840);
  if (!Number.isFinite(swing) || swing < 0 || swing > 0.75)
    throw new RangeError('Swing must be within 0..75 percent');
  return notes
    .map(([tick, duration, note, velocity]): ScoreNote => {
      const step = Math.round(tick / grid);
      const onset = Math.max(
        0,
        Math.min(durationTicks - 1, Math.round(step * grid + (step % 2 ? swing * grid : 0))),
      );
      return [
        onset,
        Math.max(1, Math.min(Math.round(duration / grid) * grid || grid, durationTicks - onset)),
        note,
        velocity,
      ];
    })
    .sort((a, b) => a[0] - b[0]);
}
export function draftFromScore(
  score: CanonicalScore,
  name: string,
  sourceFormat?: 0 | 1,
): CompositionDraft {
  const patternId = id();
  const key = score.metadata?.find((event) => event.type === 0x59 && event.data.length >= 2);
  return {
    version: 1,
    id: id(),
    revisionId: id(),
    name,
    updatedAt: Date.now(),
    sourceFormat,
    parts: score.parts.map((part) => ({
      id: part.id,
      name: part.name,
      kind: part.kind,
      program: part.program,
      channelHint: part.channelHint,
      gain: part.controls.find((event) => event.tick === 0 && event.controller === 7)?.value ?? 100,
      pan: part.controls.find((event) => event.tick === 0 && event.controller === 10)?.value ?? 64,
      mute: false,
      solo: false,
    })),
    patterns: [
      {
        id: patternId,
        name: 'Imported song',
        durationTicks: Math.max(1, score.durationTicks),
        parts: score.parts.map((part) => ({
          partId: part.id,
          notes: part.notes,
          controls: part.controls,
          programs: part.programs,
          metadata: part.metadata,
          bends: part.bends,
          endTick: part.endTick,
        })),
      },
    ],
    sections: [
      {
        id: id(),
        patternId,
        lengthTicks: Math.max(1, score.durationTicks),
        repeat: 1,
        mode: 'truncate',
      },
    ],
    tempos: score.tempos,
    meters: score.meters,
    metadata: score.metadata,
    key: key ? (key.data[0] > 127 ? key.data[0] - 256 : key.data[0]) : 0,
    minor: Boolean(key?.data[1]),
    takes: [],
  };
}
