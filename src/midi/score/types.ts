export const SCORE_PPQ = 960;
export const SCORE_LIMITS = Object.freeze({
  bytes: 1048576,
  parts: 16,
  events: 20000,
  durationMs: 600000,
  metadataBytes: 65536,
  metadataRecordBytes: 4096,
  inlineBytes: 16384,
  inlineEvents: 2000,
  voicesPerSource: 64,
  voicesPerClient: 256,
  renderingSources: 8,
});

/** Event identity is its row index, scoped to contentId, part and occurrence. */
export type ScoreNote = readonly [
  tick: number,
  durationTicks: number,
  note: number,
  velocity: number,
];
export interface ScoreTempo {
  readonly tick: number;
  readonly bpm: number;
}
export interface ScoreMeter {
  readonly tick: number;
  readonly numerator: number;
  readonly denominator: number;
}
export interface ScoreControl {
  readonly tick: number;
  readonly controller: number;
  readonly value: number;
}
export interface ScoreProgram {
  readonly tick: number;
  readonly program: number;
}
export interface ScoreBend {
  readonly tick: number;
  readonly value: number;
}
export interface ScoreMetadata {
  readonly tick: number;
  readonly type: number;
  readonly data: readonly number[];
}
export interface ScorePart {
  readonly id: string;
  readonly name: string;
  readonly kind: 'melodic' | 'percussion';
  readonly program: number;
  readonly channelHint?: number;
  readonly endTick?: number;
  readonly notes: readonly ScoreNote[];
  readonly controls: readonly ScoreControl[];
  readonly programs: readonly ScoreProgram[];
  readonly bends?: readonly ScoreBend[];
  readonly metadata?: readonly ScoreMetadata[];
}
export interface CanonicalScore {
  readonly version: 1;
  readonly contentId: string;
  readonly ppq: 960;
  readonly durationTicks: number;
  readonly tempos: readonly ScoreTempo[];
  readonly meters: readonly ScoreMeter[];
  readonly parts: readonly ScorePart[];
  readonly metadata?: readonly ScoreMetadata[];
}
export interface ScoreLoop {
  readonly startTick: number;
  readonly endTick: number;
  readonly plays: number;
}
export type TransportState = 'preparing' | 'playing' | 'paused' | 'stopped';
export interface TransportIdentity {
  readonly version: 1;
  readonly clockId: string;
  readonly sourceId: string;
  readonly revision: number;
}
export interface ScoreTransport extends TransportIdentity {
  readonly kind: 'score';
  readonly state: TransportState;
  readonly anchorServerMs: number;
  readonly anchorTick: number;
  readonly durationTicks?: number;
  readonly loop?: ScoreLoop;
}
export interface MediaTransport extends TransportIdentity {
  readonly kind: 'media';
  readonly state: TransportState;
  readonly anchorServerMs: number;
  readonly positionMs: number;
  readonly durationMs?: number;
  readonly rate: number;
  readonly mode: 'finite' | 'live';
  readonly loop?: { readonly startMs: number; readonly endMs: number; readonly plays: number };
}
