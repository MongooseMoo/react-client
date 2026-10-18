// Wire vocabulary for the MCMP effects extension (GMCP `Client.Media`).
//
// This is the ENGINE-NEUTRAL contract that travels on the wire. It describes
// effect *intent* in real units (Hz, ms, dB, seconds; 0..1 for normalized
// mixes) and names mode-like values with words ("sine", "hard"), NEVER with
// cacophony's internal option names or integer enums. The translation to
// cacophony lives entirely in `resolveEffect.ts`, so the same wire format could
// drive a different audio engine. See `plans/mcmp-effects-design.md` §1, §4.

/** Reverb algorithm discriminator (protocol-level, NOT a `params` key). */
export type ReverbAlgorithm = 'fdn' | 'plate';

/** Tremolo / auto-pan LFO waveform. Maps to cacophony's `shape` string alias. */
export type Waveform = 'sine' | 'triangle' | 'square';

/** Distortion nonlinearity. Maps to cacophony's waveshaper `shape` alias. */
export type DistortionCurve = 'hard' | 'soft';

/** Biquad filter wire types — the EQ/filter building blocks. */
export const BIQUAD_TYPES = [
  'lowpass',
  'highpass',
  'bandpass',
  'lowshelf',
  'highshelf',
  'peaking',
  'notch',
  'allpass',
] as const;
export type BiquadType = (typeof BIQUAD_TYPES)[number];

/**
 * Worklet-backed effect wire types. `echo` is an accepted alias of `delay`
 * (not advertised separately); every other name is advertised verbatim.
 */
export const WORKLET_EFFECT_TYPES = [
  'reverb',
  'delay',
  'chorus',
  'flanger',
  'vibrato',
  'doubling',
  'phaser',
  'tremolo',
  'autopan',
  'distortion',
  'compressor',
  'limiter',
  'gate',
] as const;
export type WorkletEffectType = (typeof WORKLET_EFFECT_TYPES)[number];

/** Every legal wire `type` value. `echo` is additionally accepted as an alias. */
export type EffectType = WorkletEffectType | BiquadType;

/**
 * The exact set advertised in `Client.Media.EffectsSupport.types` — every name
 * a server may legally send as a `type` (V8: never advertise a non-wire name
 * like "biquad"). `echo` is intentionally omitted (it is an alias of `delay`).
 */
export const ADVERTISED_EFFECT_TYPES: readonly string[] = [
  ...WORKLET_EFFECT_TYPES,
  ...BIQUAD_TYPES,
];

/** One effect on the wire — shared by named chains and inline per-sound chains. */
export interface EffectSpec {
  /** REQUIRED. A value in {@link EffectType} (or the `echo` alias). Unknown → dropped. */
  type: string;
  /** Optional. Names this effect for automation targeting within a chain. */
  id?: string;
  /** Optional. Reverb only: `"fdn"` (default) or `"plate"`. */
  algorithm?: string;
  /** Optional. Per-effect preset name; explicit `params` override preset values. */
  preset?: string;
  /** Optional. Intent params (numbers) + mode strings (`waveform`, `curve`). */
  params?: Record<string, number | string>;
  /** Optional. Mute without removing (P2 — keeps the automation target alive). */
  bypass?: boolean;
}

/** A named environment chain (`Client.Media.Chain`). */
export interface ChainSpec {
  /** REQUIRED. Names the bus. `"master"` is the global-overlay special case. */
  id: string;
  /** Ordered effect chain. Empty/absent = remove the chain. */
  effects?: EffectSpec[];
  /** Optional shorthand: a chain-preset name expanded client-side to `effects`. */
  preset?: string;
  /** Optional bus output level (0..). */
  gain?: number;
  /** Optional ms ramp applied to the bus gain when (dis)engaging. */
  fadein?: number;
}

/** cacophony factory names this client builds worklet effects through. */
export type WorkletFactory =
  | 'createFdnReverb'
  | 'createReverb'
  | 'createDelay'
  | 'createChorus'
  | 'createFlanger'
  | 'createVibrato'
  | 'createDoubling'
  | 'createPhaser'
  | 'createTremolo'
  | 'createAutoPan'
  | 'createDistortion'
  | 'createCompressor'
  | 'createLimiter'
  | 'createGate';

/**
 * The translated, engine-FACING plan produced by `resolveEffect`. A pure value
 * (no audio nodes) so the translation is unit-testable without an AudioContext;
 * `buildEffect` turns it into a live cacophony effect.
 */
export type ResolvedEffect =
  | {
      kind: 'biquad';
      type: BiquadType;
      /** cacophony `createBiquadFilter` options. */
      options: { type: BiquadType; frequency?: number; Q?: number; gain?: number };
    }
  | {
      kind: 'worklet';
      factory: WorkletFactory;
      /** cacophony factory options (string values allowed for mode params). */
      options: Record<string, number | string>;
    };
