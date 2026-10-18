import { validateScore, type CanonicalScore } from '../../midi/score';

export const SCORE_JSON_LIMIT = 1048576;
export const CONTENT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
function invalid(): never {
  throw new TypeError('Invalid canonical score JSON');
}

/** The outer envelope uses the same ASCII transport escaping, without score restrictions. */
export function asciiJson(value: unknown): string {
  return JSON.stringify(value).replace(
    /[~\u007f-\uffff]/g,
    (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`,
  );
}

/** Bounded lexical admission precedes JSON.parse, including keys before native case folding. */
export function scanCanonicalJson(text: string): void {
  if (!text.length || text.length > SCORE_JSON_LIMIT) invalid();
  let pos = 0,
    nodes = 0;
  const count = () => {
    if (++nodes > 100000) invalid();
  };
  const string = (decodeKey = false): string => {
    pos++;
    let decoded = '';
    while (pos < text.length) {
      const code = text.charCodeAt(pos++);
      if (code === 34) return decoded;
      if (code < 32 || code > 126 || code === 126) invalid();
      if (code !== 92) {
        if (decodeKey) decoded += String.fromCharCode(code);
        continue;
      }
      const escaped = text[pos++];
      if (escaped === '"' || escaped === '\\') {
        if (decodeKey) decoded += escaped;
        continue;
      }
      if (escaped !== 'u') invalid();
      const hex = text.slice(pos, pos + 4);
      if (!/^[0-9a-f]{4}$/.test(hex)) invalid();
      pos += 4;
      const value = Number.parseInt(hex, 16);
      if (value !== 126 && value < 128) invalid();
      if ((value >= 128 && value <= 159) || value === 0x2028 || value === 0x2029) invalid();
      if (value >= 0xdc00 && value <= 0xdfff) invalid();
      if (value >= 0xd800 && value <= 0xdbff) {
        if (text.slice(pos, pos + 2) !== '\\u') invalid();
        const low = text.slice(pos + 2, pos + 6);
        if (!/^[0-9a-f]{4}$/.test(low)) invalid();
        const lowValue = Number.parseInt(low, 16);
        if (lowValue < 0xdc00 || lowValue > 0xdfff) invalid();
        if (decodeKey) decoded += String.fromCharCode(value, lowValue);
        pos += 6;
      } else if (decodeKey) decoded += String.fromCharCode(value);
    }
    return invalid();
  };
  const value = (depth: number): void => {
    count();
    const char = text[pos];
    if (char === '{' || char === '[') {
      if (depth >= 8) invalid();
      pos++;
      const object = char === '{',
        close = object ? '}' : ']';
      const keys = new Set<string>();
      if (text[pos] === close) {
        pos++;
        return;
      }
      for (;;) {
        if (object) {
          if (text[pos] !== '"') invalid();
          const key = string(true).replace(/[A-Z]/g, (letter) => letter.toLowerCase());
          if (keys.has(key)) invalid();
          keys.add(key);
          if (text[pos++] !== ':') invalid();
        }
        value(depth + 1);
        if (text[pos] === close) {
          pos++;
          return;
        }
        if (text[pos++] !== ',') invalid();
      }
    }
    if (char === '"') {
      string();
      return;
    }
    const scalar = /^(?:-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?|true|false|null)/.exec(
      text.slice(pos),
    );
    if (!scalar) invalid();
    pos += scalar[0].length;
  };
  value(0);
  if (pos !== text.length) invalid();
}

const record = (value: unknown, allowed: string[]): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid();
  const result = value as Record<string, unknown>;
  if (Object.keys(result).some((key) => !allowed.includes(key))) invalid();
  return result;
};
function rows(input: unknown, allowed: string[]): void {
  if (input === undefined) return;
  if (!Array.isArray(input)) invalid();
  for (const row of input) record(row, allowed);
}
function strictSchema(input: unknown): void {
  const score = record(input, [
    'version',
    'contentId',
    'ppq',
    'durationTicks',
    'tempos',
    'meters',
    'parts',
    'metadata',
  ]);
  if (typeof score.contentId !== 'string' || !CONTENT_ID.test(score.contentId)) invalid();
  rows(score.tempos, ['tick', 'bpm']);
  rows(score.meters, ['tick', 'numerator', 'denominator']);
  rows(score.metadata, ['tick', 'type', 'data']);
  if (!Array.isArray(score.parts)) invalid();
  for (const item of score.parts) {
    const part = record(item, [
      'id',
      'name',
      'kind',
      'program',
      'channelHint',
      'endTick',
      'notes',
      'controls',
      'programs',
      'bends',
      'metadata',
    ]);
    rows(part.controls, ['tick', 'controller', 'value']);
    rows(part.programs, ['tick', 'program']);
    rows(part.bends, ['tick', 'value']);
    rows(part.metadata, ['tick', 'type', 'data']);
  }
}

export function decodeCanonicalScore(text: string): CanonicalScore {
  scanCanonicalJson(text);
  const input: unknown = JSON.parse(text);
  strictSchema(input);
  const result = validateScore(input);
  if (!result.ok) throw new TypeError(result.error);
  return result.score;
}

export function encodeCanonicalScore(score: CanonicalScore): string {
  strictSchema(score);
  const text = asciiJson(score);
  decodeCanonicalScore(text);
  return text;
}
