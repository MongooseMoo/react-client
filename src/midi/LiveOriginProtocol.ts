export interface MidiNoteInput {
  note: number;
  velocity: number;
  on: boolean;
  channel: number;
}
export interface MidiControlInput {
  channel: number;
  controller: 7 | 10 | 11 | 64;
  value: number;
}
export interface MidiProgramInput {
  channel: number;
  program: number;
}
export interface LiveNote extends MidiNoteInput {
  originId: string;
  eventId: number;
}
export interface LiveControl extends MidiControlInput {
  originId: string;
}
export interface LiveProgram extends MidiProgramInput {
  originId: string;
}
export interface LiveReleaseAll {
  originId: string;
}
const object = (value: unknown, keys: readonly string[]): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new TypeError('MIDI message must be an object');
  if (Object.keys(value).some((key) => !keys.includes(key)))
    throw new TypeError('Unexpected MIDI field');
  return value as Record<string, unknown>;
};
const integer = (value: unknown, min: number, max: number): number => {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > max)
    throw new TypeError('MIDI number outside bounds');
  return value;
};
function origin(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !/^[A-Za-z0-9:_-]{1,128}$/.test(value) ||
    value.startsWith('server:')
  )
    throw new TypeError('Invalid MIDI origin');
  return value;
}
const noteKeys = ['note', 'velocity', 'on', 'channel'];
const controlKeys = ['channel', 'controller', 'value'];
const programKeys = ['channel', 'program'];
function note(data: Record<string, unknown>): MidiNoteInput {
  if (typeof data.on !== 'boolean') throw new TypeError('MIDI note on must be boolean');
  const result = {
    note: integer(data.note, 0, 127),
    velocity: integer(data.velocity, 0, 127),
    on: data.on,
    channel: integer(data.channel, 0, 15),
  };
  if (result.on && result.velocity === 0)
    throw new TypeError('An active note needs positive velocity');
  return result;
}
function control(data: Record<string, unknown>): MidiControlInput {
  const controller = integer(data.controller, 0, 127);
  if (controller !== 7 && controller !== 10 && controller !== 11 && controller !== 64)
    throw new TypeError('Unsupported live MIDI controller');
  return {
    channel: integer(data.channel, 0, 15),
    controller,
    value: integer(data.value, 0, 127),
  };
}
function program(data: Record<string, unknown>): MidiProgramInput {
  return {
    channel: integer(data.channel, 0, 15),
    program: integer(data.program, 0, 127),
  };
}
export function decodeMidiNoteInput(value: unknown): MidiNoteInput {
  return note(object(value, noteKeys));
}
export function decodeMidiControlInput(value: unknown): MidiControlInput {
  return control(object(value, controlKeys));
}
export function decodeMidiProgramInput(value: unknown): MidiProgramInput {
  return program(object(value, programKeys));
}
export function decodeMidiNotePlayback(value: unknown): LiveNote {
  const data = object(value, [...noteKeys, 'originId', 'eventId']);
  return { ...note(data), originId: origin(data.originId), eventId: integer(data.eventId, 0, Number.MAX_SAFE_INTEGER) };
}
export function decodeMidiControlPlayback(value: unknown): LiveControl {
  const data = object(value, [...controlKeys, 'originId']);
  return { ...control(data), originId: origin(data.originId) };
}
export function decodeMidiProgramPlayback(value: unknown): LiveProgram {
  const data = object(value, [...programKeys, 'originId']);
  return { ...program(data), originId: origin(data.originId) };
}
export function decodeLiveReleaseAll(value: unknown): LiveReleaseAll {
  return { originId: origin(object(value, ['originId']).originId) };
}
