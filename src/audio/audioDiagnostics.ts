// In-memory audio diagnostics (sounds-todo/10-diagnostics-and-acceptance.md,
// "Browser diagnostics"). MediaService records each stage a sound passes
// through, so a silent sound can be traced to the stage that failed. Entries
// never carry credentials, URL queries, or fragments.

/** The most recent entries kept; older ones fall off the front. */
export const AUDIO_DIAGNOSTIC_CAPACITY = 500;

export const AUDIO_STAGES = [
  'received',
  'validated',
  'loading',
  'decoded',
  'routed',
  'started',
  'stopped',
  'released',
] as const;
export type AudioStage = (typeof AUDIO_STAGES)[number];

export const AUDIO_ERROR_CODES = [
  'INVALID_PAYLOAD',
  'CAPABILITY_UNAVAILABLE',
  'FETCH_FAILED',
  'DECODE_FAILED',
  'REGION_OUT_OF_RANGE',
  'SEEK_UNAVAILABLE',
  'STALE_GENERATION',
  'CAPACITY',
] as const;
export type AudioErrorCode = (typeof AUDIO_ERROR_CODES)[number];

/** Mix categories from sounds-todo/contracts.md § Mixing. */
export type AudioCategory = 'effects' | 'ambience' | 'music' | 'voice' | 'ui';

/** Optional wire provenance; never a database API for the browser. */
export interface AudioCatalogIds {
  readonly soundId?: string;
  readonly assetId?: string;
  readonly segmentId?: string;
}

/**
 * Shared-media timing. "prepared" = the voice is loaded and positioned,
 * "seeked" = the cursor moved to the target, "audible" = output started.
 */
export interface SharedMediaDiagnostics {
  readonly revision?: number;
  readonly rttMs?: number;
  readonly targetCursorMs?: number;
  readonly actualCursorMs?: number;
  readonly driftMs?: number;
  readonly phase?: 'prepared' | 'seeked' | 'audible';
}

export interface AudioDiagnosticError {
  readonly code: AudioErrorCode;
  readonly message?: string;
}

export interface AudioDiagnosticInput {
  readonly stage: AudioStage;
  readonly key?: string;
  readonly name?: string;
  readonly generation?: number;
  readonly catalog?: AudioCatalogIds;
  readonly category?: AudioCategory;
  readonly error?: AudioDiagnosticError;
  readonly shared?: SharedMediaDiagnostics;
}

export interface AudioDiagnosticEntry extends AudioDiagnosticInput {
  /** Increases by one per recorded entry, across clears. */
  readonly seq: number;
  /** Monotonic milliseconds (performance.now()). */
  readonly time: number;
}

const MAX_TEXT = 300;
const URL_IN_TEXT = /\b[a-z][a-z0-9+.-]*:\/\/[^\s'"<>`]+/gi;

/**
 * Remove credentials, the query string, and the fragment from a media URL or
 * relative name. A proxied URL (`...?url=<encoded>`) keeps its inner asset
 * URL, itself sanitized, since that names the file being played.
 */
export function sanitizeMediaUrl(value: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return value.replace(/[?#].*$/s, '');
  }
  const inner = parsed.searchParams.get('url');
  parsed.username = '';
  parsed.password = '';
  parsed.search = '';
  parsed.hash = '';
  const base = parsed.toString();
  return inner ? `${base}?url=${sanitizeMediaUrl(inner)}` : base;
}

/** Sanitize every URL inside free text (error messages) and bound its length. */
export function sanitizeMediaText(text: string): string {
  const cleaned = text.replace(URL_IN_TEXT, (url) => sanitizeMediaUrl(url));
  return cleaned.length > MAX_TEXT ? `${cleaned.slice(0, MAX_TEXT - 1)}…` : cleaned;
}

/** Classify a failed createSound: decodeAudioData rejects with EncodingError. */
export function classifyLoadError(error: unknown): 'FETCH_FAILED' | 'DECODE_FAILED' {
  const name = error instanceof Error || error instanceof DOMException ? error.name : '';
  return name === 'EncodingError' ? 'DECODE_FAILED' : 'FETCH_FAILED';
}

/** A bounded, sanitized one-line message for an unknown thrown value. */
export function errorMessage(error: unknown): string {
  const text = error instanceof Error ? error.message : String(error);
  return sanitizeMediaText(text);
}

function sanitize(input: AudioDiagnosticInput): AudioDiagnosticInput {
  return {
    ...input,
    key: input.key === undefined ? undefined : sanitizeMediaText(sanitizeMediaUrl(input.key)),
    name: input.name === undefined ? undefined : sanitizeMediaText(sanitizeMediaUrl(input.name)),
    error: input.error && {
      code: input.error.code,
      message:
        input.error.message === undefined ? undefined : sanitizeMediaText(input.error.message),
    },
  };
}

interface RingOptions {
  readonly capacity?: number;
  readonly now?: () => number;
}

export class AudioDiagnosticsRing {
  private readonly capacity: number;
  private readonly now: () => number;
  private readonly buffer: AudioDiagnosticEntry[] = [];
  private readonly listeners = new Set<() => void>();
  private seq = 0;
  private snapshot: readonly AudioDiagnosticEntry[] | null = null;

  constructor(options: RingOptions = {}) {
    this.capacity = options.capacity ?? AUDIO_DIAGNOSTIC_CAPACITY;
    this.now = options.now ?? (() => performance.now());
  }

  record(input: AudioDiagnosticInput): void {
    this.seq += 1;
    const entry: AudioDiagnosticEntry = { ...sanitize(input), seq: this.seq, time: this.now() };
    this.buffer.push(entry);
    if (this.buffer.length > this.capacity) {
      this.buffer.splice(0, this.buffer.length - this.capacity);
    }
    this.changed();
  }

  /** Oldest first. The same array is returned until the ring changes. */
  entries(): readonly AudioDiagnosticEntry[] {
    this.snapshot ??= [...this.buffer];
    return this.snapshot;
  }

  clear(): void {
    this.buffer.length = 0;
    this.changed();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private changed(): void {
    this.snapshot = null;
    for (const listener of [...this.listeners]) {
      listener();
    }
  }
}

/** One JSON object per line, dropping undefined fields, for copy and paste. */
export function formatAudioDiagnostics(entries: readonly AudioDiagnosticEntry[]): string {
  return entries
    .map((entry) => JSON.stringify({ ...entry, time: Math.round(entry.time * 1000) / 1000 }))
    .join('\n');
}
