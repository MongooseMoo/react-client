import {
  validateScore,
  validateTransport,
  type CanonicalScore,
  type ScoreTransport,
} from './score';

export interface SequenceWindow {
  readonly seq: number;
  readonly fromTick: number;
  readonly toTick: number;
  readonly anchorServerMs: number;
  readonly contentId: string;
  readonly revision: number;
  readonly barOriginTick: number;
  /** Local ticks relative to fromTick; never a growing global tempo history. */
  readonly score: CanonicalScore;
}
export type SequenceData =
  | { readonly version: 1; readonly score: CanonicalScore }
  | { readonly version: 1; readonly stream: true; readonly windows: readonly SequenceWindow[] }
  | {
      readonly version: 1;
      readonly content: {
        readonly sha256: string;
        readonly url: string;
        readonly byteLength: number;
      };
    };

const record = (input: unknown): Record<string, unknown> => {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new TypeError('Invalid sequence object');
  return input as Record<string, unknown>;
};
const integer = (input: unknown): number => {
  if (typeof input !== 'number' || !Number.isSafeInteger(input) || input < 0)
    throw new TypeError('Invalid sequence tick or revision');
  return input;
};
export const sequenceId = (input: unknown): string => {
  if (typeof input !== 'string' || !input || input.length > 128)
    throw new TypeError('Invalid sequence identity');
  return input;
};
function unsafePath(value: string): boolean {
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index);
    if (code < 32 || code === 127 || code === 92) return true;
  }
  return false;
}

function window(
  input: unknown,
  contentId: string,
  revision: number,
  count: (length: number) => void,
): SequenceWindow {
  const raw = record(input);
  const fromTick = integer(raw.fromTick),
    toTick = integer(raw.toTick);
  if (
    toTick <= fromTick ||
    !Number.isFinite(raw.anchorServerMs) ||
    typeof raw.anchorServerMs !== 'number' ||
    raw.anchorServerMs < 0 ||
    raw.anchorServerMs > Number.MAX_SAFE_INTEGER
  )
    throw new TypeError('Invalid sequence window anchor');
  if (raw.contentId !== contentId || raw.revision !== revision)
    throw new TypeError('Window identity mismatch');
  const shift = (tick: unknown): number => {
    const value = integer(tick);
    if (value < fromTick) throw new TypeError('Window event precedes window');
    return value - fromTick;
  };
  const list = (input: unknown, maximum = 8000): unknown[] => {
    if (!Array.isArray(input) || input.length > maximum)
      throw new TypeError('Window list exceeds budget');
    return input;
  };
  let durationTicks = toTick - fromTick;
  const parts = list(raw.parts, 16).map((item) => {
    const part = record(item);
    const noteRows = list(part.notes);
    count(noteRows.length);
    const notes = noteRows.map((input) => {
      const note = list(input, 4);
      if (note.length !== 4) throw new TypeError('Invalid window note');
      const tick = shift(note[0]),
        duration = integer(note[1]);
      if (
        tick >= toTick - fromTick ||
        !Number.isSafeInteger(tick + duration) ||
        !Number.isSafeInteger(integer(note[0]) + duration)
      )
        throw new TypeError('Window onset or end outside bounds');
      durationTicks = Math.max(durationTicks, tick + duration);
      return [tick, duration, note[2], note[3]];
    });
    const events = (input: unknown): Record<string, unknown>[] => {
      const entries = list(input ?? []);
      count(entries.length);
      return entries.map((item) => {
        const event = record(item);
        const tick = shift(event.tick);
        if (tick >= toTick - fromTick) throw new TypeError('Window control outside range');
        return { tick, controller: event.controller, value: event.value, program: event.program };
      });
    };
    return {
      id: part.id,
      name: part.name,
      kind: part.kind,
      program: part.program,
      channelHint: part.channelHint,
      notes,
      controls: events(part.controls),
      programs: events(part.programs),
      bends: part.bends === undefined ? undefined : events(part.bends),
    };
  });
  const map = (input: unknown) => {
    const entries = list(input);
    count(entries.length);
    return entries.map((item) => {
      const event = record(item);
      const tick = shift(event.tick);
      if (tick >= toTick - fromTick) throw new TypeError('Window map outside range');
      return { tick, bpm: event.bpm, numerator: event.numerator, denominator: event.denominator };
    });
  };
  const tempos = map(raw.tempos),
    meters = map(raw.meters);
  if (tempos[0]?.tick !== 0 || meters[0]?.tick !== 0)
    throw new TypeError('Window maps require chased state at fromTick');
  const firstMeter = record(list(raw.meters)[0]);
  const barOriginTick = integer(firstMeter.barOriginTick);
  if (barOriginTick > fromTick) throw new TypeError('Window bar origin follows its anchor');
  for (const item of list(raw.meters).slice(1)) {
    const meter = record(item);
    if (meter.barOriginTick !== meter.tick)
      throw new TypeError('Authored meter change requires its own bar origin');
  }
  const result = validateScore({
    version: 1,
    ppq: 960,
    contentId,
    durationTicks,
    parts,
    tempos,
    meters,
  });
  if (!result.ok) throw new TypeError(result.error);
  return Object.freeze({
    seq: integer(raw.seq),
    fromTick,
    toTick,
    anchorServerMs: raw.anchorServerMs,
    contentId,
    revision,
    barOriginTick,
    score: result.score,
  });
}

export function decodeSequenceData(
  input: unknown,
  contentId: string,
  revision: number,
): SequenceData {
  const raw = record(input);
  if (
    raw.version !== 1 ||
    [raw.score !== undefined, raw.stream !== undefined, raw.content !== undefined].filter(Boolean)
      .length !== 1
  )
    throw new TypeError('Conflicting or unsupported sequence variants');
  if (raw.score !== undefined) {
    const result = validateScore(raw.score);
    if (!result.ok) throw new TypeError(result.error);
    if (result.score.contentId !== contentId || !result.inline)
      throw new TypeError('Inline score identity or budget mismatch');
    return { version: 1, score: result.score };
  }
  if (raw.content !== undefined) {
    const content = record(raw.content);
    if (
      typeof content.sha256 !== 'string' ||
      !/^[a-f0-9]{64}$/i.test(content.sha256) ||
      typeof content.url !== 'string' ||
      !content.url.startsWith('/') ||
      content.url.startsWith('//') ||
      content.url.length > 2048 ||
      unsafePath(content.url) ||
      new URL(content.url, 'https://mongoose.world').origin !== 'https://mongoose.world' ||
      !Number.isSafeInteger(content.byteLength) ||
      typeof content.byteLength !== 'number' ||
      content.byteLength < 1 ||
      content.byteLength > 1048576
    )
      throw new TypeError('Invalid sequence content locator');
    return {
      version: 1,
      content: { sha256: content.sha256, url: content.url, byteLength: content.byteLength },
    };
  }
  if (raw.stream !== true || !Array.isArray(raw.windows) || raw.windows.length > 5)
    throw new TypeError('Invalid sequence stream');
  let physicalEvents = 0;
  const count = (length: number) => {
    physicalEvents += length;
    if (physicalEvents > 8000) throw new TypeError('Sequence window event limit exceeded');
  };
  const windows = raw.windows.map((entry) => window(entry, contentId, revision, count));
  if (new Set(windows.flatMap((window) => window.score.parts.map((part) => part.id))).size > 16)
    throw new TypeError('Stream part limit exceeded');
  let bytes = 0,
    events = 0;
  for (let i = 0; i < windows.length; i++) {
    const item = windows[i],
      previous = windows[i - 1];
    if (previous && (item.seq <= previous.seq || item.fromTick < previous.toTick))
      throw new TypeError('Overlapping or unordered sequence windows');
    const checked = validateScore(item.score);
    if (!checked.ok) throw new TypeError(checked.error);
    bytes += checked.encodedBytes;
    events += checked.eventCount;
  }
  if (bytes > 65536 || events > 8000) throw new TypeError('Sequence window ring exceeds budget');
  return { version: 1, stream: true, windows: Object.freeze(windows) };
}

export function decodeScoreTransport(input: unknown): ScoreTransport {
  const result = validateTransport(input);
  if (!result.ok || result.transport.kind !== 'score')
    throw new TypeError('Invalid score transport');
  return result.transport;
}
