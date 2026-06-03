// Client-side preset tables for the MCMP effects extension.
//
// Two levels (design §4):
//   - PER-EFFECT presets: `effect.preset` fills that effect's intent params
//     (explicit `params` still override). Keyed by effect TYPE then preset name.
//   - CHAIN presets: `Chain.preset` expands to a whole ordered effect list
//     client-side (e.g. "telephone" = bandpass → distortion → compressor).
//
// Presets are plain data in engine-neutral wire vocabulary — the obvious place
// to grow the library without touching the protocol or the translator.

import type { EffectSpec } from './types';

/** `PER_EFFECT_PRESETS[type][name]` → intent params merged under `effect.params`. */
export const PER_EFFECT_PRESETS: Readonly<
  Record<string, Record<string, Record<string, number | string>>>
> = {
  reverb: {
    room: { decayTime: 0.8, damping: 0.3, diffusion: 0.5, mix: 0.25 },
    hall: { decayTime: 1.8, damping: 0.25, diffusion: 0.6, mix: 0.35 },
    plate: { decayTime: 1.2, damping: 0.2, diffusion: 0.8, mix: 0.4 },
    cave: { decayTime: 2.8, damping: 0.4, diffusion: 0.7, mix: 0.45 },
    cathedral: { decayTime: 5.0, damping: 0.3, diffusion: 0.75, mix: 0.5 },
    dream: { decayTime: 8.0, damping: 0.5, diffusion: 0.9, mix: 0.6 },
  },
  distortion: {
    light: { drive: 4, curve: 'soft', mix: 0.5 },
    heavy: { drive: 16, curve: 'hard', mix: 0.9 },
    fuzz: { drive: 40, curve: 'hard', mix: 1, output: 0.6 },
  },
  delay: {
    slapback: { delayTime: 120, feedback: 0.15, mix: 0.4 },
    echo: { delayTime: 350, feedback: 0.45, mix: 0.5 },
  },
};

/**
 * `CHAIN_PRESETS[name]` → an ordered effect list (engine-neutral wire specs).
 * Expanded by `handleChain` when a `Chain.preset` is sent instead of `effects`.
 */
export const CHAIN_PRESETS: Readonly<Record<string, EffectSpec[]>> = {
  // A narrow telephone band (~300–3400 Hz) plus light grit and leveling.
  telephone: [
    { type: 'bandpass', params: { frequency: 1010, Q: 0.4 } },
    { type: 'distortion', preset: 'light', params: { mix: 0.3 } },
    { type: 'compressor', params: { threshold: -28, ratio: 6 } },
  ],
  // Muffled highs + a long, dark reverb.
  underwater: [
    { type: 'lowpass', params: { frequency: 700, Q: 0.7 } },
    {
      type: 'reverb',
      algorithm: 'fdn',
      params: { decayTime: 3.5, damping: 0.75, diffusion: 0.8, mix: 0.5 },
    },
  ],
  // AM-radio band + saturation.
  radio: [
    { type: 'bandpass', params: { frequency: 1500, Q: 0.5 } },
    { type: 'distortion', params: { drive: 6, curve: 'soft', mix: 0.5 } },
  ],
  // Mid honk + hard saturation, band-limited.
  megaphone: [
    { type: 'peaking', params: { frequency: 1500, gain: 9, Q: 1 } },
    { type: 'distortion', params: { drive: 8, curve: 'hard', mix: 0.8 } },
    { type: 'bandpass', params: { frequency: 1500, Q: 0.7 } },
  ],
  // A big, dark, modulated space.
  cathedral: [
    {
      type: 'reverb',
      algorithm: 'fdn',
      params: { decayTime: 6, damping: 0.35, diffusion: 0.8, mix: 0.5 },
    },
  ],
};
