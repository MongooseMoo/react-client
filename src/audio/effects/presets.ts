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
    chamber: { decayTime: 1.4, damping: 0.35, diffusion: 0.65, mix: 0.3 },
    cathedral: { decayTime: 5.0, damping: 0.3, diffusion: 0.75, mix: 0.5 },
    arena: { decayTime: 3.6, damping: 0.2, diffusion: 0.7, mix: 0.45 },
    dream: { decayTime: 8.0, damping: 0.5, diffusion: 0.9, mix: 0.6 },
  },
  distortion: {
    warm: { drive: 2, curve: 'soft', mix: 0.4 },
    light: { drive: 4, curve: 'soft', mix: 0.5 },
    crunch: { drive: 9, curve: 'soft', mix: 0.7 },
    heavy: { drive: 16, curve: 'hard', mix: 0.9 },
    fuzz: { drive: 40, curve: 'hard', mix: 1, output: 0.6 },
  },
  delay: {
    slapback: { delayTime: 120, feedback: 0.15, mix: 0.4 },
    echo: { delayTime: 350, feedback: 0.45, mix: 0.5 },
    dub: { delayTime: 500, feedback: 0.6, mix: 0.55 },
    canyon: { delayTime: 750, feedback: 0.5, mix: 0.5 },
  },
  chorus: {
    subtle: { rate: 0.4, depth: 3, mix: 0.3 },
    lush: { rate: 0.8, depth: 6, mix: 0.5 },
  },
  flanger: {
    jet: { rate: 0.25, depth: 4, feedback: 0.7, mix: 0.5 },
    sweep: { rate: 0.5, depth: 6, feedback: 0.5, mix: 0.5 },
  },
  phaser: {
    slow: { frequency: 500, rate: 0.3, depth: 1.5, stages: 4, mix: 0.5 },
    swirl: { frequency: 800, rate: 1.2, depth: 2, stages: 6, feedback: 0.4, mix: 0.6 },
  },
  tremolo: {
    soft: { rate: 4, depth: 0.4, waveform: 'sine' },
    chop: { rate: 8, depth: 0.9, waveform: 'square' },
  },
  compressor: {
    glue: { threshold: -18, ratio: 3, knee: 6, attack: 0.01, release: 0.2 },
    squash: { threshold: -28, ratio: 8, knee: 3, attack: 0.003, release: 0.1, makeup: 6 },
  },
  gate: {
    tight: { threshold: -45, ratio: 0.05, attack: 0.001, release: 0.08 },
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
  // Intimate small room.
  room: [
    {
      type: 'reverb',
      algorithm: 'fdn',
      params: { decayTime: 0.7, damping: 0.4, diffusion: 0.5, mix: 0.22 },
    },
  ],
  // Huge open arena with a slapback tail.
  stadium: [
    { type: 'delay', params: { delayTime: 180, feedback: 0.25, mix: 0.3 } },
    {
      type: 'reverb',
      algorithm: 'fdn',
      params: { decayTime: 4.5, damping: 0.25, diffusion: 0.75, mix: 0.5 },
    },
  ],
  // Lo-fi old recording: band-limited, gently distorted, wobbly.
  vinyl: [
    { type: 'highpass', params: { frequency: 120, Q: 0.7 } },
    { type: 'lowpass', params: { frequency: 6500, Q: 0.7 } },
    { type: 'distortion', params: { drive: 3, curve: 'soft', mix: 0.3 } },
    { type: 'tremolo', params: { rate: 0.7, depth: 0.15, waveform: 'sine' } },
  ],
  // Damaged transmission: harsh band + heavy clip + gating pump.
  brokenSpeaker: [
    { type: 'bandpass', params: { frequency: 1200, Q: 1.2 } },
    { type: 'distortion', params: { drive: 14, curve: 'hard', mix: 0.85 } },
  ],
  // Ethereal, detuned, far-away.
  ghost: [
    { type: 'chorus', params: { rate: 0.5, depth: 8, mix: 0.6 } },
    { type: 'highpass', params: { frequency: 400, Q: 0.7 } },
    {
      type: 'reverb',
      algorithm: 'fdn',
      params: { decayTime: 5, damping: 0.5, diffusion: 0.9, mix: 0.6 },
    },
  ],
  // Dizzy / intoxicated: slow pitch wobble + smear.
  drunk: [
    { type: 'vibrato', params: { rate: 1.2, depth: 6 } },
    {
      type: 'reverb',
      algorithm: 'fdn',
      params: { decayTime: 2, damping: 0.6, diffusion: 0.85, mix: 0.4 },
    },
  ],
};
