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
    ...(loop ? { loop } : {}),
  };
}
export function decodeMediaCues(raw: unknown): readonly MediaCue[] | undefined {
  if (raw === undefined) return undefined;
  if (!Array.isArray(raw) || raw.length > 512) throw new TypeError('Too many media cues');
  const ids = new Set<string>();
  let bytes = 0,
    previous = -1;
  return raw.map((value) => {
    const r = object(value),
      id = mediaIdentity(r.id),
      startMs = number(r.startMs),
      endMs = number(r.endMs);
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
      /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(r.text)
    )
      throw new TypeError('Invalid UTF-8 cue text');
    bytes += length;
    if (bytes > 65536) throw new TypeError('Media cue text exceeds budget');
    ids.add(id);
    previous = startMs;
    return { id, startMs, endMs, text: r.text };
  });
}
export function decodeMediaCueWindows(raw: unknown): readonly MediaCueWindow[] | undefined {
  if (raw === undefined) return undefined;
  if (!Array.isArray(raw) || raw.length > 512) throw new TypeError('Invalid media cue windows');
  let previous = -1,
    count = 0,
    textBytes = 0;
  const ids = new Set<string>(),
    seqs = new Set<number>();
  const windows = raw.map((value) => {
    const r = object(value),
      seq = number(r.seq),
      fromMs = number(r.fromMs),
      toMs = number(r.toMs);
    if (
      !Number.isSafeInteger(seq) ||
      seqs.has(seq) ||
      fromMs < previous ||
      toMs <= fromMs ||
      Object.keys(r).some((key) => !['seq', 'fromMs', 'toMs', 'cues'].includes(key))
    )
      throw new TypeError('Invalid media cue window span');
    if (!Array.isArray(r.cues) || count + r.cues.length > 512)
      throw new TypeError('Media cue count exceeds budget');
    count += r.cues.length;
    const cues = decodeMediaCues(r.cues) ?? [];
    for (const cue of cues) {
      if (cue.startMs >= toMs || cue.endMs <= fromMs || ids.has(cue.id))
        throw new TypeError('Media cue outside span or duplicate ID');
      ids.add(cue.id);
      textBytes += new TextEncoder().encode(cue.text).byteLength;
    }
    if (textBytes > 65536) throw new TypeError('Media cue text exceeds ring budget');
    seqs.add(seq);
    previous = toMs;
    return { seq, fromMs, toMs, cues };
  });
  if (new TextEncoder().encode(JSON.stringify(windows)).byteLength > 16384)
    throw new TypeError('Media cue packet exceeds byte budget');
  return windows;
}
export function mergeMediaCueWindows(
  previous: readonly MediaCueWindow[],
  incoming: readonly MediaCueWindow[],
  nowMs: number,
): readonly MediaCueWindow[] {
  const result = [...previous];
  for (const window of incoming) {
    const old = result.find((candidate) => candidate.seq === window.seq);
    if (old) {
      if (JSON.stringify(old) !== JSON.stringify(window))
        throw new TypeError('Conflicting immutable cue window');
      continue;
    }
    result.push(window);
  }
  result.sort((a, b) => a.fromMs - b.fromMs);
  const retained = result.filter(
    (window) => window.toMs > nowMs || window.cues.some((cue) => cue.endMs > nowMs),
  );
  let count = 0,
    bytes = 0,
    end = -1;
  const ids = new Set<string>();
  for (const window of retained) {
    if (window.fromMs < end) throw new TypeError('Overlapping cue windows');
    end = window.toMs;
    for (const cue of window.cues) {
      if (ids.has(cue.id)) throw new TypeError('Duplicate cue identity');
      ids.add(cue.id);
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
}
export function decodeMediaSync(raw: unknown): MediaSyncReply {
  const r = object(raw),
    transport = decodeFileTransport(r.transport);
  const sourceId = mediaIdentity(r.sourceId);
  if (transport.sourceId !== sourceId) throw new TypeError('Sync source mismatch');
  return {
    key: mediaIdentity(r.key),
    sourceId,
    requestId: mediaIdentity(r.requestId),
    transport,
    ...(r.contentId === undefined ? {} : { contentId: mediaIdentity(r.contentId) }),
  };
}
