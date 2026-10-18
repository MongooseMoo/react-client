import type { ScorePart } from './score';

export interface SequenceVoice {
  readonly state: 'scheduled' | 'playing' | 'releasing' | 'ended';
  readonly ended: Promise<void>;
  release(audioTime?: number): void;
  stop(): void;
}
export interface SequenceNote {
  readonly program: number;
  readonly percussion: boolean;
  readonly note: number;
  readonly velocity: number;
  readonly startTime: number;
  readonly destination: AudioNode;
}
/** No relative channel-message scheduler is accepted by a shared-score renderer. */
export interface SequenceOutput {
  readonly context: BaseAudioContext;
  prepare(parts: readonly ScorePart[], signal: AbortSignal): Promise<void>;
  playNote(note: SequenceNote): SequenceVoice;
  dispose?(): void;
}

export const SEQUENCE_SUPPORT = Object.freeze({
  version: 1,
  maxParts: 16,
  maxEvents: 20000,
  maxBytes: 1048576,
  percussion: true,
  controllers: [7, 10, 11, 64],
  pitchBend: false,
});
