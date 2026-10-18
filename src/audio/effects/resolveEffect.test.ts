import { describe, expect, it } from 'vitest';

import { resolveEffect } from './resolveEffect';
import type { ResolvedEffect } from './types';

/** Narrow a result to a worklet plan (throws in-test if it isn't). */
function worklet(r: ResolvedEffect | null): Extract<ResolvedEffect, { kind: 'worklet' }> {
  expect(r).not.toBeNull();
  expect(r?.kind).toBe('worklet');
  return r as Extract<ResolvedEffect, { kind: 'worklet' }>;
}

function biquad(r: ResolvedEffect | null): Extract<ResolvedEffect, { kind: 'biquad' }> {
  expect(r).not.toBeNull();
  expect(r?.kind).toBe('biquad');
  return r as Extract<ResolvedEffect, { kind: 'biquad' }>;
}

describe('resolveEffect — type → factory mapping', () => {
  it.each([
    ['delay', 'createDelay'],
    ['echo', 'createDelay'], // echo is an alias of delay
    ['chorus', 'createChorus'],
    ['flanger', 'createFlanger'],
    ['vibrato', 'createVibrato'],
    ['doubling', 'createDoubling'],
    ['phaser', 'createPhaser'],
    ['tremolo', 'createTremolo'],
    ['autopan', 'createAutoPan'],
    ['distortion', 'createDistortion'],
    ['compressor', 'createCompressor'],
    ['limiter', 'createLimiter'],
    ['gate', 'createGate'],
  ])('maps %s → %s', (type, factory) => {
    expect(worklet(resolveEffect({ type })).factory).toBe(factory);
  });

  it('maps reverb to FDN by default and Dattorro for algorithm:plate', () => {
    expect(worklet(resolveEffect({ type: 'reverb' })).factory).toBe('createFdnReverb');
    expect(worklet(resolveEffect({ type: 'reverb', algorithm: 'plate' })).factory).toBe(
      'createReverb',
    );
    // unknown algorithm falls back to fdn
    expect(worklet(resolveEffect({ type: 'reverb', algorithm: 'bogus' })).factory).toBe(
      'createFdnReverb',
    );
  });

  it.each([
    'lowpass',
    'highpass',
    'bandpass',
    'lowshelf',
    'highshelf',
    'peaking',
    'notch',
    'allpass',
  ])('maps biquad type %s', (type) => {
    const r = biquad(resolveEffect({ type, params: { frequency: 1000 } }));
    expect(r.options.type).toBe(type);
    expect(r.options.frequency).toBe(1000);
  });

  it('returns null for an unknown type (caller skips, sound plays dry)', () => {
    expect(resolveEffect({ type: 'warp-drive' })).toBeNull();
    expect(resolveEffect({ type: '' })).toBeNull();
  });
});

describe('resolveEffect — FDN reverb', () => {
  it('passes the neutral vocabulary through 1:1', () => {
    const r = worklet(
      resolveEffect({
        type: 'reverb',
        params: { decayTime: 2.5, preDelay: 0.05, damping: 0.4, diffusion: 0.7, mix: 0.45 },
      }),
    );
    expect(r.options).toEqual({
      decayTime: 2.5,
      preDelay: 0.05,
      damping: 0.4,
      diffusion: 0.7,
      mix: 0.45,
    });
  });

  it('clamps out-of-range values', () => {
    const r = worklet(
      resolveEffect({ type: 'reverb', params: { decayTime: 999, damping: 5, mix: -1 } }),
    );
    expect(r.options.decayTime).toBe(20);
    expect(r.options.damping).toBe(1);
    expect(r.options.mix).toBe(0);
  });
});

describe('resolveEffect — plate (Dattorro) reverb translation', () => {
  it('converts preDelay seconds → samples using the sample rate', () => {
    const r = worklet(
      resolveEffect({ type: 'reverb', algorithm: 'plate', params: { preDelay: 0.01 } }, 48000),
    );
    expect(r.options.preDelay).toBe(480); // 0.01s * 48000
  });

  it('splits mix into wet and dry = 1 − mix', () => {
    const r = worklet(resolveEffect({ type: 'reverb', algorithm: 'plate', params: { mix: 0.3 } }));
    expect(r.options.wet).toBeCloseTo(0.3);
    expect(r.options.dry).toBeCloseTo(0.7);
    expect(r.options.mix).toBeUndefined(); // never leaks the FDN name onto the plate
  });

  it('maps decayTime → a monotonic normalized decay in (0, 0.95]', () => {
    const short = worklet(
      resolveEffect({ type: 'reverb', algorithm: 'plate', params: { decayTime: 1 } }),
    );
    const long = worklet(
      resolveEffect({ type: 'reverb', algorithm: 'plate', params: { decayTime: 10 } }),
    );
    expect(short.options.decay).toBeGreaterThan(0);
    expect(long.options.decay).toBeGreaterThan(short.options.decay as number);
    expect(long.options.decay).toBeLessThanOrEqual(0.95);
  });

  it('maps diffusion → both input-diffusion stages', () => {
    const r = worklet(
      resolveEffect({ type: 'reverb', algorithm: 'plate', params: { diffusion: 0.6 } }),
    );
    expect(r.options.inputDiffusion1).toBe(0.6);
    expect(r.options.inputDiffusion2).toBe(0.6);
  });
});

describe('resolveEffect — string mode params (engine-neutral)', () => {
  it('maps distortion curve hard→hardclip, soft→tanh', () => {
    expect(
      worklet(resolveEffect({ type: 'distortion', params: { curve: 'hard' } })).options.shape,
    ).toBe('hardclip');
    expect(
      worklet(resolveEffect({ type: 'distortion', params: { curve: 'soft' } })).options.shape,
    ).toBe('tanh');
  });

  it('ignores an invalid curve (degradation — cacophony default stands)', () => {
    expect(
      worklet(resolveEffect({ type: 'distortion', params: { curve: 'spicy' } })).options.shape,
    ).toBeUndefined();
  });

  it('passes a valid tremolo waveform through as the cacophony shape alias', () => {
    expect(
      worklet(resolveEffect({ type: 'tremolo', params: { waveform: 'triangle' } })).options.shape,
    ).toBe('triangle');
  });

  it('ignores an invalid tremolo waveform', () => {
    expect(
      worklet(resolveEffect({ type: 'tremolo', params: { waveform: 'sawtooth' } })).options.shape,
    ).toBeUndefined();
  });
});

describe('resolveEffect — delay family', () => {
  it('maps delayTime/feedback directly and mix → feedforward (wet tap)', () => {
    const r = worklet(
      resolveEffect({ type: 'delay', params: { delayTime: 300, feedback: 0.4, mix: 0.5 } }),
    );
    expect(r.options.delayTime).toBe(300);
    expect(r.options.feedback).toBe(0.4);
    expect(r.options.feedforward).toBe(0.5);
  });

  it('clamps feedback below 1 to stay stable', () => {
    const r = worklet(resolveEffect({ type: 'delay', params: { feedback: 5 } }));
    expect(r.options.feedback as number).toBeLessThan(1);
  });
});

describe('resolveEffect — dynamics', () => {
  it('limiter ignores ratio but keeps threshold/attack/release', () => {
    const r = worklet(
      resolveEffect({ type: 'limiter', params: { threshold: -6, ratio: 8, attack: 0.01 } }),
    );
    expect(r.options.threshold).toBe(-6);
    expect(r.options.attack).toBe(0.01);
    expect(r.options.ratio).toBeUndefined();
  });

  it('compressor keeps ratio and makeup; gate keeps ratio but drops makeup', () => {
    const comp = worklet(resolveEffect({ type: 'compressor', params: { ratio: 4, makeup: 6 } }));
    expect(comp.options.ratio).toBe(4);
    expect(comp.options.makeup).toBe(6);
    const gate = worklet(resolveEffect({ type: 'gate', params: { ratio: 0.1, makeup: 6 } }));
    expect(gate.options.ratio).toBe(0.1);
    expect(gate.options.makeup).toBeUndefined();
  });
});

describe('resolveEffect — biquad', () => {
  it('clamps frequency/Q/gain and only writes provided params', () => {
    const r = biquad(
      resolveEffect({ type: 'peaking', params: { frequency: 99999, Q: 2, gain: 100 } }),
    );
    expect(r.options.frequency).toBe(24000);
    expect(r.options.Q).toBe(2);
    expect(r.options.gain).toBe(40);
  });

  it('omits absent params', () => {
    const r = biquad(resolveEffect({ type: 'lowpass', params: { frequency: 800 } }));
    expect(r.options).toEqual({ type: 'lowpass', frequency: 800 });
  });
});

describe('resolveEffect — unknown params are ignored', () => {
  it('drops params with no wire meaning for the type', () => {
    const r = worklet(
      resolveEffect({ type: 'tremolo', params: { rate: 5, nonsense: 42, frequency: 1000 } }),
    );
    expect(r.options).toEqual({ rate: 5 }); // nonsense + frequency (not a tremolo param) dropped
  });
});

describe('resolveEffect — presets', () => {
  it('fills params from a per-effect preset', () => {
    const r = worklet(resolveEffect({ type: 'reverb', preset: 'cave' }));
    expect(r.options.decayTime).toBe(2.8);
    expect(r.options.mix).toBe(0.45);
  });

  it('lets explicit params override the preset', () => {
    const r = worklet(resolveEffect({ type: 'reverb', preset: 'cave', params: { mix: 0.1 } }));
    expect(r.options.decayTime).toBe(2.8); // from preset
    expect(r.options.mix).toBe(0.1); // overridden
  });

  it('ignores an unknown preset name (degradation)', () => {
    const r = worklet(
      resolveEffect({ type: 'reverb', preset: 'no-such-preset', params: { mix: 0.2 } }),
    );
    expect(r.options).toEqual({ mix: 0.2 });
  });

  it('applies a string-mode preset value (distortion light → soft/tanh)', () => {
    const r = worklet(resolveEffect({ type: 'distortion', preset: 'light' }));
    expect(r.options.shape).toBe('tanh');
    expect(r.options.drive).toBe(4);
  });
});
