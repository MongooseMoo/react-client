import type { MediaTransport } from '../midi/score';

export interface MediaCue {
  readonly id: string;
  readonly startMs: number;
  readonly endMs: number;
  readonly text: string;
}
export interface MediaCueWindow {
  readonly seq: number;
  readonly fromMs: number;
  readonly toMs: number;
  readonly cues: readonly MediaCue[];
}
function checkOverlap(left: MediaCueWindow, right: MediaCueWindow): void {
  const leftIds = new Map(left.cues.map((cue) => [cue.id, cue])),
    rightIds = new Map(right.cues.map((cue) => [cue.id, cue]));
  for (const cue of left.cues)
    if (cue.endMs > right.fromMs && JSON.stringify(rightIds.get(cue.id)) !== JSON.stringify(cue))
      throw new TypeError('Window omits overlapping cue');
  for (const cue of right.cues)
    if (cue.startMs < left.toMs && JSON.stringify(leftIds.get(cue.id)) !== JSON.stringify(cue))
      throw new TypeError('Window invents overlapping cue');
}
const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new TypeError('Expected shared media object');
  return value as Record<string, unknown>;
};
const number = (value: unknown, positive = false): number => {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > Number.MAX_SAFE_INTEGER ||
    (positive && !value)
  )
    throw new TypeError('Invalid media time/rate');
  return value;
};
const integer = (value: unknown): number => {
  const result = number(value);
  if (!Number.isSafeInteger(result)) throw new TypeError('Expected safe integer media position');
  return result;
};
const bytes = (value: string): number => new TextEncoder().encode(value).byteLength;
function containsControlText(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code < 32 || (code >= 127 && code <= 159) || code === 8232 || code === 8233) return true;
  }
  return false;
}
export const mediaIdentity = (value: unknown): string => {
  if (typeof value !== 'string' || !value.length || value.length > 128)
    throw new TypeError('Invalid media identity');
  return value;
};
export function decodeFileTransport(raw: unknown): MediaTransport {
  const r = object(raw);
  if (
    r.version !== 1 ||
    r.kind !== 'media' ||
    !['preparing', 'playing', 'paused', 'stopped'].includes(String(r.state)) ||
    !['finite', 'live'].includes(String(r.mode))
  )
    throw new TypeError('Invalid file transport');
  const revision = number(r.revision);
  if (!Number.isSafeInteger(revision)) throw new TypeError('Invalid media revision');
  const durationMs = r.durationMs === undefined ? undefined : number(r.durationMs);
  const positionMs = number(r.positionMs);
  let loop: MediaTransport['loop'];
  if (r.loop !== undefined) {
    const l = object(r.loop),
      startMs = number(l.startMs),
      endMs = number(l.endMs);
    if (
      r.mode !== 'finite' ||
      startMs >= endMs ||
      durationMs === undefined ||
      endMs > durationMs ||
      typeof l.plays !== 'number' ||
      !Number.isSafeInteger(l.plays) ||
      (l.plays !== -1 && l.plays < 1) ||
      (l.plays !== -1 && !Number.isSafeInteger(startMs + l.plays * (endMs - startMs)))
    )
      throw new TypeError('Invalid media loop');
    loop = { startMs, endMs, plays: l.plays };
  }
  if (r.mode === 'live' && durationMs !== undefined)
    throw new TypeError('Live media has no finite duration');
  return {
    version: 1,
    kind: 'media',
    clockId: mediaIdentity(r.clockId),
    sourceId: mediaIdentity(r.sourceId),
    revision,
    state: r.state as MediaTransport['state'],
    anchorServerMs: number(r.anchorServerMs),
    positionMs,
    durationMs,
    rate: number(r.rate, true),
    mode: r.mode as MediaTransport['mode'],
    ...(r.discontinuity === undefined ? {} : { discontinuity: integer(r.discontinuity) }),
    ...(loop ? { loop } : {}),
  };
}
export function decodeMediaCues(
  raw: unknown,
  onCue?: (cue: MediaCue) => void,
): readonly MediaCue[] | undefined {
  if (raw === undefined) return undefined;
  if (!Array.isArray(raw) || raw.length > 512) throw new TypeError('Too many media cues');
  const ids = new Set<string>();
  let bytes = 0,
    previous = -1;
  return raw.map((value) => {
    const r = object(value),
      id = mediaIdentity(r.id),
      startMs = integer(r.startMs),
      endMs = integer(r.endMs);
    if (
      !/^[A-Za-z0-9:_-]+$/.test(id) ||
      Object.keys(r).some((key) => !['id', 'startMs', 'endMs', 'text'].includes(key))
    )
      throw new TypeError('Invalid media cue fields');
    if (ids.has(id) || startMs < previous || endMs <= startMs || typeof r.text !== 'string')
      throw new TypeError('Invalid media cue');
    if (r.text.length > 4096) throw new TypeError('Media cue text exceeds record budget');
    const length = new TextEncoder().encode(r.text).byteLength;
    if (
      length > 4096 ||
      containsControlText(r.text) ||
      /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(r.text)
    )
      throw new TypeError('Invalid UTF-8 cue text');
    bytes += length;
    if (bytes > 65536) throw new TypeError('Media cue text exceeds budget');
    ids.add(id);
    previous = startMs;
    const cue = { id, startMs, endMs, text: r.text };
    onCue?.(cue);
    return cue;
  });
}
export function decodeMediaCueWindows(raw: unknown): readonly MediaCueWindow[] | undefined {
  if (raw === undefined) return undefined;
  if (!Array.isArray(raw) || raw.length > 512) throw new TypeError('Invalid media cue windows');
  let previous: MediaCueWindow | undefined,
    textBytes = 0,
    encodedBytes = 2;
  const ids = new Map<string, MediaCue>();
  const windows = raw.map((value) => {
    const r = object(value),
      seq = integer(r.seq),
      fromMs = integer(r.fromMs),
      toMs = integer(r.toMs);
    if (
      (previous && (seq !== previous.seq + 1 || fromMs !== previous.toMs)) ||
      toMs <= fromMs ||
      Object.keys(r).some((key) => !['seq', 'fromMs', 'toMs', 'cues'].includes(key))
    )
      throw new TypeError('Invalid media cue window span');
    if (!Array.isArray(r.cues) || r.cues.length > 512)
      throw new TypeError('Media cue count exceeds budget');
    encodedBytes +=
      bytes(`{"seq":${seq},"fromMs":${fromMs},"toMs":${toMs},"cues":[]}`) + (previous ? 1 : 0);
    let cueIndex = 0;
    const cues =
      decodeMediaCues(r.cues, (cue) => {
        if (cue.startMs >= toMs || cue.endMs <= fromMs)
          throw new TypeError('Media cue outside span');
        const known = ids.get(cue.id);
        if (known && JSON.stringify(known) !== JSON.stringify(cue))
          throw new TypeError('Conflicting overlapping cue');
        if (!known) {
          ids.set(cue.id, cue);
          textBytes += bytes(cue.text);
        }
        if (ids.size > 512 || textBytes > 65536)
          throw new TypeError('Media cue distinct-ID budget exceeded');
        encodedBytes += bytes(JSON.stringify(cue)) + (cueIndex++ ? 1 : 0);
        if (encodedBytes > 16384) throw new TypeError('Media cue packet exceeds byte budget');
      }) ?? [];
    if (encodedBytes > 16384) throw new TypeError('Media cue packet exceeds byte budget');
    const window = { seq, fromMs, toMs, cues };
    if (previous) checkOverlap(previous, window);
    previous = window;
    return window;
  });
  return windows;
}
export class MediaCueGap extends TypeError {}
export function mergeMediaCueWindows(
  previous: readonly MediaCueWindow[],
  incoming: readonly MediaCueWindow[],
  options: { replace?: boolean; maxSeq?: number } = {},
): readonly MediaCueWindow[] {
  const result: MediaCueWindow[] = options.replace ? [] : [...previous];
  const maxSeq = options.maxSeq ?? previous.at(-1)?.seq ?? -1;
  for (const window of incoming) {
    const old = previous.find((candidate) => candidate.seq === window.seq);
    if (old) {
      if (JSON.stringify(old) !== JSON.stringify(window))
        throw new TypeError('Conflicting immutable cue window');
      if (!options.replace) continue;
    }
    if (!old && window.seq <= maxSeq) continue;
    const last = result.at(-1);
    if (
      (last && (window.seq !== last.seq + 1 || window.fromMs !== last.toMs)) ||
      (!last && !options.replace && maxSeq >= 0 && window.seq !== maxSeq + 1)
    )
      throw new MediaCueGap('Missing or nonadjacent cue window');
    if (last) checkOverlap(last, window);
    result.push(window);
  }
  const retained = result.slice(-4);
  let count = 0,
    bytes = 0,
    end = -1;
  const ids = new Map<string, MediaCue>();
  for (const window of retained) {
    if (window.fromMs < end) throw new TypeError('Overlapping cue windows');
    end = window.toMs;
    for (const cue of window.cues) {
      const known = ids.get(cue.id);
      if (known) {
        if (JSON.stringify(known) !== JSON.stringify(cue))
          throw new TypeError('Conflicting overlapping cue');
        continue;
      }
      ids.set(cue.id, cue);
      count++;
      bytes += new TextEncoder().encode(cue.text).byteLength;
    }
  }
  if (count > 512 || bytes > 65536) throw new TypeError('Media cue ring exceeds budget');
  return retained;
}
export interface MediaSyncRequest {
  key: string;
  sourceId: string;
  requestId: string;
}
export interface MediaSourceError {
  key: string;
  sourceId: string;
  revision: number;
  code: 'FETCH_FAILED' | 'DECODE_FAILED' | 'SEEK_UNAVAILABLE';
}
export interface MediaSyncReply extends MediaSyncRequest {
  transport: MediaTransport;
  contentId?: string;
  cueWindows?: readonly MediaCueWindow[];
}
export function decodeMediaSync(raw: unknown): MediaSyncReply {
  const r = object(raw),
    transport = decodeFileTransport(r.transport);
  if (r.cues !== undefined) throw new TypeError('Sync uses cueWindows');
  const sourceId = mediaIdentity(r.sourceId);
  if (transport.sourceId !== sourceId) throw new TypeError('Sync source mismatch');
  if (
    r.cueWindows !== undefined &&
    (transport.mode !== 'finite' || transport.discontinuity === undefined)
  )
    throw new TypeError('Cue Sync requires finite transport and discontinuity');
  return {
    key: mediaIdentity(r.key),
    sourceId,
    requestId: mediaIdentity(r.requestId),
    transport,
    ...(r.cueWindows === undefined ? {} : { cueWindows: decodeMediaCueWindows(r.cueWindows) }),
    ...(r.contentId === undefined ? {} : { contentId: mediaIdentity(r.contentId) }),
  };
}
