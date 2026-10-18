import { TempoTimeline } from './timeline';
import {
  type CanonicalScore,
  SCORE_LIMITS,
  SCORE_PPQ,
  type ScoreBend,
  type ScoreControl,
  type ScoreMetadata,
  type ScoreMeter,
  type ScoreNote,
  type ScorePart,
  type ScoreProgram,
  type ScoreTempo,
} from './types';

export type ScoreValidation =
  | {
      ok: true;
      score: CanonicalScore;
      encodedBytes: number;
      eventCount: number;
      inline: boolean;
      unsupported: readonly string[];
    }
  | { ok: false; error: string };

class InvalidScore extends Error {}
const fail = (message: string): never => {
  throw new InvalidScore(message);
};
const record = (value: unknown): Record<string, unknown> => {
  if (value === null || typeof value !== 'object' || Array.isArray(value))
    return fail('Expected score object');
  return value as Record<string, unknown>;
};
const integer = (value: unknown, min: number, max = Number.MAX_SAFE_INTEGER): number => {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > max)
    return fail('Integer outside score bounds');
  return value;
};
const number = (value: unknown, min: number, max: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max)
    return fail('Number outside score bounds');
  return value;
};
const text = (value: unknown, maximum: number, empty = false): string => {
  if (typeof value !== 'string' || (!empty && !value.length) || value.length > maximum)
    return fail('Invalid score identifier or label');
  return value;
};
const array = (value: unknown, maximum: number = SCORE_LIMITS.events): unknown[] => {
  if (!Array.isArray(value) || value.length > maximum) return fail('Score array exceeds bounds');
  return value;
};
const byteLength = (value: string): number => new TextEncoder().encode(value).byteLength;

/** Validates, copies and freezes canonical wire data. It never retains arbitrary input properties. */
export function validateScore(input: unknown): ScoreValidation {
  try {
    const source = record(input);
    if (source.version !== 1 || source.ppq !== SCORE_PPQ) fail('Unsupported score version or PPQ');
    const contentId = text(source.contentId, 128);
    const durationTicks = integer(source.durationTicks, 0);
    let eventCount = 0;
    let metadataBytes = 0;
    const unsupported = new Set<string>();
    const count = (length: number): void => {
      eventCount += length;
      if (eventCount > SCORE_LIMITS.events) fail('Score event budget exceeded');
    };
    const label = (value: unknown, max: number, empty = false): string => {
      const result = text(value, max, empty);
      metadataBytes += byteLength(result);
      if (metadataBytes > SCORE_LIMITS.metadataBytes) fail('Score metadata budget exceeded');
      return result;
    };
    const tick = (value: unknown): number => integer(value, 0, durationTicks);
    const metadata = (value: unknown): readonly ScoreMetadata[] | undefined => {
      if (value === undefined) return undefined;
      const entries = array(value);
      count(entries.length);
      return Object.freeze(
        entries
          .map((entry) => {
            const item = record(entry);
            const bytes = array(item.data, SCORE_LIMITS.metadataRecordBytes);
            metadataBytes += bytes.length;
            if (metadataBytes > SCORE_LIMITS.metadataBytes) fail('Score metadata budget exceeded');
            return Object.freeze({
              tick: tick(item.tick),
              type: integer(item.type, 0, 127),
              data: Object.freeze(bytes.map((byte) => integer(byte, 0, 255))),
            });
          })
          .sort((a, b) => a.tick - b.tick),
      );
    };
    const normalizeMap = <T extends { readonly tick: number }>(entries: T[]): readonly T[] => {
      entries.sort((a, b) => a.tick - b.tick);
      const normalized: T[] = [];
      for (const entry of entries) {
        if (normalized.at(-1)?.tick === entry.tick) normalized[normalized.length - 1] = entry;
        else normalized.push(entry);
      }
      if (normalized[0]?.tick !== 0) fail('Tempo and meter maps must begin at zero');
      return Object.freeze(normalized);
    };
    const rawTempos = array(source.tempos ?? [{ tick: 0, bpm: 120 }]);
    const rawMeters = array(source.meters ?? [{ tick: 0, numerator: 4, denominator: 4 }]);
    count(rawTempos.length + rawMeters.length);
    const tempos = normalizeMap<ScoreTempo>(
      rawTempos.map((entry) => {
        const item = record(entry);
        return Object.freeze({ tick: tick(item.tick), bpm: number(item.bpm, 20, 400) });
      }),
    );
    const meters = normalizeMap<ScoreMeter>(
      rawMeters.map((entry) => {
        const item = record(entry);
        const denominator = integer(item.denominator, 1, 128);
        if ((denominator & (denominator - 1)) !== 0)
          fail('Meter denominator must be a power of two');
        return Object.freeze({
          tick: tick(item.tick),
          numerator: integer(item.numerator, 1, 32),
          denominator,
        });
      }),
    );
    const nominalDuration = new TempoTimeline(tempos).timeAtTick(durationTicks);
    if (nominalDuration > SCORE_LIMITS.durationMs) fail('Score exceeds ten-minute duration budget');
    const ids = new Set<string>();
    const parts = array(source.parts, SCORE_LIMITS.parts).map((entry): ScorePart => {
      const part = record(entry);
      const id = label(part.id, 128);
      if (ids.has(id)) fail('Duplicate score part ID');
      ids.add(id);
      const name = label(part.name ?? '', 256, true);
      const kind =
        part.kind === 'melodic'
          ? 'melodic'
          : part.kind === 'percussion'
            ? 'percussion'
            : fail('Invalid part kind');
      const program = integer(part.program, 0, 127);
      const channelHint =
        part.channelHint === undefined ? undefined : integer(part.channelHint, 0, 15);
      const endTick = part.endTick === undefined ? undefined : tick(part.endTick);
      const noteEntries = array(part.notes);
      const controlEntries = array(part.controls ?? []);
      const programEntries = array(part.programs ?? []);
      const bendEntries = array(part.bends ?? []);
      count(
        noteEntries.length + controlEntries.length + programEntries.length + bendEntries.length,
      );
      // Rows remain in authored order. A scheduler may index them, but must not change row identity.
      let previousTick = -1;
      const notes = noteEntries.map((value): ScoreNote => {
        const row = array(value, 4);
        if (row.length !== 4) fail('A note row has exactly four values');
        const onset = tick(row[0]);
        const duration = integer(row[1], 1, durationTicks);
        if (!Number.isSafeInteger(onset + duration) || onset + duration > durationTicks)
          fail('Note ends outside score');
        if (onset < previousTick) fail('Note rows must be ordered by tick');
        previousTick = onset;
        const pitch = integer(
          row[2],
          kind === 'percussion' ? 35 : 0,
          kind === 'percussion' ? 81 : 127,
        );
        const velocity = integer(row[3], 1, 127);
        return Object.freeze([onset, duration, pitch, velocity]);
      });
      const controls = controlEntries
        .map((entry): ScoreControl => {
          const item = record(entry);
          const controller = integer(item.controller, 0, 127);
          if (![7, 10, 11, 64].includes(controller)) unsupported.add(`controller:${controller}`);
          return Object.freeze({
            tick: tick(item.tick),
            controller,
            value: integer(item.value, 0, 127),
          });
        })
        .sort((a, b) => a.tick - b.tick);
      const programs = programEntries
        .map((entry): ScoreProgram => {
          const item = record(entry);
          return Object.freeze({ tick: tick(item.tick), program: integer(item.program, 0, 127) });
        })
        .sort((a, b) => a.tick - b.tick);
      const bends = bendEntries
        .map((entry): ScoreBend => {
          const item = record(entry);
          unsupported.add('pitchBend');
          return Object.freeze({ tick: tick(item.tick), value: integer(item.value, 0, 16383) });
        })
        .sort((a, b) => a.tick - b.tick);
      const partMetadata = metadata(part.metadata);
      if (
        endTick !== undefined &&
        (notes.some((note) => note[0] + note[1] > endTick) ||
          [...controls, ...programs, ...bends, ...(partMetadata ?? [])].some(
            (event) => event.tick > endTick,
          ))
      )
        fail('Part event extends beyond its end tick');
      return Object.freeze({
        id,
        name,
        kind,
        program,
        notes: Object.freeze(notes),
        controls: Object.freeze(controls),
        programs: Object.freeze(programs),
        ...(channelHint === undefined ? {} : { channelHint }),
        ...(endTick === undefined ? {} : { endTick }),
        ...(bends.length ? { bends: Object.freeze(bends) } : {}),
        ...(partMetadata === undefined ? {} : { metadata: partMetadata }),
      });
    });
    const scoreMetadata = metadata(source.metadata);
    const score: CanonicalScore = Object.freeze({
      version: 1,
      contentId,
      ppq: SCORE_PPQ,
      durationTicks,
      tempos,
      meters,
      parts: Object.freeze(parts),
      ...(scoreMetadata === undefined ? {} : { metadata: scoreMetadata }),
    });
    const encodedBytes = byteLength(JSON.stringify(score));
    if (encodedBytes > SCORE_LIMITS.bytes) fail('Score byte budget exceeded');
    return {
      ok: true,
      score,
      encodedBytes,
      eventCount,
      inline: encodedBytes <= SCORE_LIMITS.inlineBytes && eventCount <= SCORE_LIMITS.inlineEvents,
      unsupported: Object.freeze([...unsupported]),
    };
  } catch (error) {
    if (error instanceof InvalidScore || error instanceof RangeError)
      return { ok: false, error: error.message };
    throw error;
  }
}

/** Check the byte budget before parsing untrusted encoded content. */
export function parseScore(json: string): ScoreValidation {
  if (json.length > SCORE_LIMITS.bytes || byteLength(json) > SCORE_LIMITS.bytes)
    return { ok: false, error: 'Score byte budget exceeded' };
  let input: unknown;
  try {
    input = JSON.parse(json);
  } catch {
    return { ok: false, error: 'Invalid score JSON' };
  }
  return validateScore(input);
}
