// Pure translation: an engine-neutral wire `EffectSpec` → a cacophony build
// plan (`ResolvedEffect`). No AudioContext, no nodes — so the whole, detail-dense
// mapping (factory choice, unit conversions, clamping, unknown-dropping) is
// unit-testable in isolation. `buildEffect` turns the plan into a live effect.
//
// Degradation rules (design §6) live here:
//   - unknown `type`            → return null (caller skips the effect, plays dry)
//   - unknown param / bad mode  → ignored (only known wire names are read)
//   - out-of-range value        → clamped to the documented range
//
// The cacophony option names that appear below are the ONLY place they exist in
// the client — they never travel on the wire (design §0.3, V1).

import { PER_EFFECT_PRESETS } from './presets';
import {
  BIQUAD_TYPES,
  type BiquadType,
  type DistortionCurve,
  type EffectSpec,
  type ResolvedEffect,
  type Waveform,
  type WorkletFactory,
} from './types';

/** Default sample rate for the plate-reverb pre-delay (seconds → samples). */
const DEFAULT_SAMPLE_RATE = 48000;

const WAVEFORMS: readonly Waveform[] = ['sine', 'triangle', 'square'];
const DISTORTION_CURVES: readonly DistortionCurve[] = ['hard', 'soft'];
/** Wire distortion curve → cacophony waveshaper `shape` alias. */
const CURVE_TO_SHAPE: Record<DistortionCurve, 'hardclip' | 'tanh'> = {
  hard: 'hardclip',
  soft: 'tanh',
};

const BIQUAD_TYPE_SET: ReadonlySet<string> = new Set(BIQUAD_TYPES);

const clamp = (value: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, value));

/** Read a finite number from the merged params, or `undefined`. */
function num(params: Record<string, number | string>, key: string): number | undefined {
  const v = params[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

/** Read a string from the merged params, or `undefined`. */
function str(params: Record<string, number | string>, key: string): string | undefined {
  const v = params[key];
  return typeof v === 'string' ? v : undefined;
}

/**
 * Copy `wireKey` from `params` into `out[outKey]`, clamped to `[lo, hi]`, only
 * when present and finite. Unknown/absent params are simply never written, which
 * is exactly the "unknown param ignored" degradation rule.
 */
function mapNum(
  params: Record<string, number | string>,
  wireKey: string,
  out: Record<string, number | string>,
  outKey: string,
  lo: number,
  hi: number,
): void {
  const v = num(params, wireKey);
  if (v !== undefined) {
    out[outKey] = clamp(v, lo, hi);
  }
}

/** Merge a per-effect preset (if any) under the explicit params (params win). */
function mergedParams(spec: EffectSpec): Record<string, number | string> {
  const preset =
    spec.preset !== undefined ? PER_EFFECT_PRESETS[spec.type]?.[spec.preset] : undefined;
  return { ...(preset ?? {}), ...(spec.params ?? {}) };
}

/** FDN reverb: the neutral vocabulary maps almost 1:1. */
function resolveFdnReverb(p: Record<string, number | string>): Record<string, number> {
  const o: Record<string, number | string> = {};
  mapNum(p, 'decayTime', o, 'decayTime', 0.001, 20);
  mapNum(p, 'preDelay', o, 'preDelay', 0, 1);
  mapNum(p, 'damping', o, 'damping', 0, 1);
  mapNum(p, 'diffusion', o, 'diffusion', 0, 1);
  mapNum(p, 'mix', o, 'mix', 0, 1);
  return o as Record<string, number>;
}

/**
 * Plate (Dattorro) reverb: the option set is disjoint from FDN, so the neutral
 * vocabulary is translated and APPROXIMATED (design §4 reverb note):
 *   preDelay(s) → samples;  mix → wet, dry = 1−mix;
 *   decayTime(s) → normalized `decay`;  diffusion → inputDiffusion1/2.
 */
function resolvePlateReverb(
  p: Record<string, number | string>,
  sampleRate: number,
): Record<string, number> {
  const o: Record<string, number> = {};
  const preDelay = num(p, 'preDelay');
  if (preDelay !== undefined) {
    o.preDelay = clamp(Math.round(preDelay * sampleRate), 0, sampleRate - 1);
  }
  const mix = num(p, 'mix');
  if (mix !== undefined) {
    const wet = clamp(mix, 0, 1);
    o.wet = wet;
    o.dry = 1 - wet;
  }
  const decayTime = num(p, 'decayTime');
  if (decayTime !== undefined) {
    // Monotonic T60(s) → 0..1 decay coefficient. Documented approximation: a
    // longer tail maps toward (but never reaches) full regeneration.
    o.decay = clamp(1 - Math.exp(-Math.max(0, decayTime) / 3), 0, 0.95);
  }
  const damping = num(p, 'damping');
  if (damping !== undefined) {
    o.damping = clamp(damping, 0, 1);
  }
  const diffusion = num(p, 'diffusion');
  if (diffusion !== undefined) {
    const d = clamp(diffusion, 0, 1);
    o.inputDiffusion1 = d;
    o.inputDiffusion2 = d;
  }
  return o;
}

/** Shared modulated-delay family mapping (delay/chorus/flanger/vibrato/doubling). */
function resolveModulatedDelay(p: Record<string, number | string>): Record<string, number> {
  const o: Record<string, number> = {};
  mapNum(p, 'delayTime', o, 'delayTime', 0, 1000);
  mapNum(p, 'depth', o, 'depth', 0, 50);
  mapNum(p, 'rate', o, 'rate', 0, 20);
  mapNum(p, 'feedback', o, 'feedback', -0.9999999, 0.9999999);
  // `mix` has no direct option on the unified delay circuit; map it to the wet
  // (feedforward) tap, leaving the preset's `blend`/character intact (§4 approx).
  const mix = num(p, 'mix');
  if (mix !== undefined) {
    o.feedforward = clamp(mix, 0, 1);
  }
  return o;
}

function resolvePhaser(p: Record<string, number | string>): Record<string, number> {
  const o: Record<string, number> = {};
  mapNum(p, 'frequency', o, 'frequency', 20, 10000);
  mapNum(p, 'rate', o, 'rate', 0, 20);
  mapNum(p, 'depth', o, 'depth', 0, 4);
  mapNum(p, 'stages', o, 'stages', 2, 12);
  mapNum(p, 'feedback', o, 'feedback', -0.95, 0.95);
  mapNum(p, 'mix', o, 'mix', 0, 1);
  return o;
}

function resolveTremolo(p: Record<string, number | string>): Record<string, number | string> {
  const o: Record<string, number | string> = {};
  mapNum(p, 'rate', o, 'rate', 0, 20);
  mapNum(p, 'depth', o, 'depth', 0, 1);
  mapNum(p, 'stereoPhase', o, 'stereoPhase', 0, 180);
  const waveform = str(p, 'waveform');
  if (waveform !== undefined && (WAVEFORMS as readonly string[]).includes(waveform)) {
    o.shape = waveform; // cacophony 0.25 accepts the string alias directly
  }
  return o;
}

function resolveAutoPan(p: Record<string, number | string>): Record<string, number> {
  const o: Record<string, number> = {};
  mapNum(p, 'rate', o, 'rate', 0, 20);
  mapNum(p, 'depth', o, 'depth', 0, 1);
  return o;
}

function resolveDistortion(p: Record<string, number | string>): Record<string, number | string> {
  const o: Record<string, number | string> = {};
  mapNum(p, 'drive', o, 'drive', 0, 100);
  mapNum(p, 'mix', o, 'mix', 0, 1);
  mapNum(p, 'output', o, 'output', 0, 4);
  const curve = str(p, 'curve');
  if (curve !== undefined && (DISTORTION_CURVES as readonly string[]).includes(curve)) {
    o.shape = CURVE_TO_SHAPE[curve as DistortionCurve];
  }
  return o;
}

function resolveDynamics(
  p: Record<string, number | string>,
  factory: 'createCompressor' | 'createLimiter' | 'createGate',
): Record<string, number> {
  const o: Record<string, number> = {};
  mapNum(p, 'threshold', o, 'threshold', -100, 0);
  mapNum(p, 'knee', o, 'knee', 0, 40);
  mapNum(p, 'attack', o, 'attack', 0, 1);
  mapNum(p, 'release', o, 'release', 0, 5);
  // `ratio` is meaningful for compressor and gate; the limiter ignores it.
  if (factory !== 'createLimiter') {
    mapNum(p, 'ratio', o, 'ratio', 0.05, 1000);
  }
  if (factory === 'createCompressor') {
    mapNum(p, 'makeup', o, 'makeup', -24, 24);
  }
  return o;
}

function resolveBiquad(type: BiquadType, p: Record<string, number | string>): ResolvedEffect {
  const options: { type: BiquadType; frequency?: number; Q?: number; gain?: number } = { type };
  const frequency = num(p, 'frequency');
  if (frequency !== undefined) {
    options.frequency = clamp(frequency, 10, 24000);
  }
  const q = num(p, 'Q');
  if (q !== undefined) {
    options.Q = clamp(q, 0.0001, 1000);
  }
  const gain = num(p, 'gain');
  if (gain !== undefined) {
    options.gain = clamp(gain, -40, 40);
  }
  return { kind: 'biquad', type, options };
}

/** Map a worklet wire type to its cacophony factory (after the `echo` alias). */
const SIMPLE_FACTORY: Partial<Record<string, WorkletFactory>> = {
  chorus: 'createChorus',
  flanger: 'createFlanger',
  vibrato: 'createVibrato',
  doubling: 'createDoubling',
};

/**
 * Translate one wire {@link EffectSpec} into a cacophony build plan, or `null`
 * if the `type` is unknown (the caller skips it and the sound still plays dry).
 *
 * @param spec       the wire effect.
 * @param sampleRate used only for the plate-reverb pre-delay (seconds → samples).
 */
export function resolveEffect(
  spec: EffectSpec,
  sampleRate: number = DEFAULT_SAMPLE_RATE,
): ResolvedEffect | null {
  const type = spec.type === 'echo' ? 'delay' : spec.type;
  const p = mergedParams(spec);

  if (BIQUAD_TYPE_SET.has(type)) {
    return resolveBiquad(type as BiquadType, p);
  }

  switch (type) {
    case 'reverb': {
      const plate = spec.algorithm === 'plate';
      return {
        kind: 'worklet',
        factory: plate ? 'createReverb' : 'createFdnReverb',
        options: plate ? resolvePlateReverb(p, sampleRate) : resolveFdnReverb(p),
      };
    }
    case 'delay':
      return { kind: 'worklet', factory: 'createDelay', options: resolveModulatedDelay(p) };
    case 'chorus':
    case 'flanger':
    case 'vibrato':
    case 'doubling':
      return {
        kind: 'worklet',
        factory: SIMPLE_FACTORY[type] as WorkletFactory,
        options: resolveModulatedDelay(p),
      };
    case 'phaser':
      return { kind: 'worklet', factory: 'createPhaser', options: resolvePhaser(p) };
    case 'tremolo':
      return { kind: 'worklet', factory: 'createTremolo', options: resolveTremolo(p) };
    case 'autopan':
      return { kind: 'worklet', factory: 'createAutoPan', options: resolveAutoPan(p) };
    case 'distortion':
      return { kind: 'worklet', factory: 'createDistortion', options: resolveDistortion(p) };
    case 'compressor':
      return {
        kind: 'worklet',
        factory: 'createCompressor',
        options: resolveDynamics(p, 'createCompressor'),
      };
    case 'limiter':
      return {
        kind: 'worklet',
        factory: 'createLimiter',
        options: resolveDynamics(p, 'createLimiter'),
      };
    case 'gate':
      return {
        kind: 'worklet',
        factory: 'createGate',
        options: resolveDynamics(p, 'createGate'),
      };
    default:
      return null; // unknown type — caller skips, sound plays dry
  }
}
