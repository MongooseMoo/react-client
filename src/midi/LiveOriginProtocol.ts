export interface LiveNote {
  note: number;
  velocity: number;
  on: boolean;
  channel: number;
  duration?: number;
  originId?: string;
  eventId?: number;
}
export interface LiveControl {
  channel: number;
  controller: 7 | 10 | 11 | 64;
  value: number;
  originId?: string;
}
export interface LiveProgram {
  channel: number;
  program: number;
  originId?: string;
}
export interface LiveReleaseAll {
  originId: string;
}
const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new TypeError('MIDI message must be an object');
  return value as Record<string, unknown>;
};
const integer = (value: unknown, min: number, max: number): number => {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > max)
    throw new TypeError('MIDI number outside bounds');
  return value;
};
function origin(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (
    typeof value !== 'string' ||
    !/^[A-Za-z0-9:_-]{1,128}$/.test(value) ||
    value.startsWith('server:')
  )
    throw new TypeError('Invalid MIDI origin');
  return value;
}
export function decodeLiveNote(value: unknown): LiveNote {
  const data = object(value);
  const originId = origin(data.originId);
  if ((originId === undefined) !== (data.eventId === undefined))
    throw new TypeError('MIDI note identity must be complete');
  const on =
    typeof data.on === 'boolean'
      ? data.on
      : originId === undefined && (data.on === 0 || data.on === 1)
        ? data.on === 1
        : (() => {
            throw new TypeError('MIDI note on must be boolean');
          })();
  const result: LiveNote = {
    note: integer(data.note, 0, 127),
    velocity: integer(data.velocity, 0, 127),
    on,
    channel: integer(data.channel ?? 0, 0, 15),
  };
  if (on && result.velocity === 0) throw new TypeError('An active note needs positive velocity');
  if (data.duration !== undefined) result.duration = integer(data.duration, 1, 600000);
  if (originId !== undefined) {
    result.originId = originId;
    result.eventId = integer(data.eventId, 0, Number.MAX_SAFE_INTEGER);
  }
  return result;
}
export function decodeLiveControl(value: unknown): LiveControl {
  const data = object(value);
  const controller = integer(data.controller, 0, 127);
  if (controller !== 7 && controller !== 10 && controller !== 11 && controller !== 64)
    throw new TypeError('Unsupported live MIDI controller');
  return {
    channel: integer(data.channel ?? 0, 0, 15),
    controller,
    value: integer(data.value, 0, 127),
    originId: origin(data.originId),
  };
}
export function decodeLiveProgram(value: unknown): LiveProgram {
  const data = object(value);
  return {
    channel: integer(data.channel ?? 0, 0, 15),
    program: integer(data.program, 0, 127),
    originId: origin(data.originId),
  };
}
export function decodeLiveReleaseAll(value: unknown): LiveReleaseAll {
  const id = origin(object(value).originId);
  if (id === undefined) throw new TypeError('MIDI release requires an origin');
  return { originId: id };
}
