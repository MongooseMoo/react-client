import type { Cacophony } from 'cacophony';
import { describe, expect, it, vi } from 'vitest';

import { buildEffect } from './buildEffect';
import { resolveEffect } from './resolveEffect';
import type { ResolvedEffect } from './types';

/** A cacophony stub whose factories are spies returning sentinel objects. */
function stubCacophony() {
  const factories = [
    'createFdnReverb',
    'createReverb',
    'createDelay',
    'createChorus',
    'createFlanger',
    'createVibrato',
    'createDoubling',
    'createPhaser',
    'createTremolo',
    'createAutoPan',
    'createDistortion',
    'createCompressor',
    'createLimiter',
    'createGate',
    'createBiquadFilter',
  ] as const;
  const c: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const f of factories) {
    c[f] = vi.fn((opts: unknown) => ({ __factory: f, opts }));
  }
  return c as unknown as Cacophony & Record<string, ReturnType<typeof vi.fn>>;
}

describe('buildEffect', () => {
  it('dispatches a worklet plan to the matching factory with its options', () => {
    const c = stubCacophony();
    const resolved = resolveEffect({ type: 'reverb', params: { mix: 0.4 } }) as ResolvedEffect;
    buildEffect(c, resolved);
    expect(c.createFdnReverb).toHaveBeenCalledWith({ mix: 0.4 });
  });

  it('dispatches plate reverb to createReverb', () => {
    const c = stubCacophony();
    buildEffect(
      c,
      resolveEffect({ type: 'reverb', algorithm: 'plate', params: { mix: 0.5 } }) as ResolvedEffect,
    );
    expect(c.createReverb).toHaveBeenCalledTimes(1);
    expect(c.createFdnReverb).not.toHaveBeenCalled();
  });

  it('dispatches a biquad plan to createBiquadFilter with the type included', () => {
    const c = stubCacophony();
    buildEffect(
      c,
      resolveEffect({ type: 'lowpass', params: { frequency: 800 } }) as ResolvedEffect,
    );
    expect(c.createBiquadFilter).toHaveBeenCalledWith({ type: 'lowpass', frequency: 800 });
  });

  it('forwards the string shape alias for distortion', () => {
    const c = stubCacophony();
    buildEffect(
      c,
      resolveEffect({ type: 'distortion', params: { curve: 'soft', drive: 3 } }) as ResolvedEffect,
    );
    expect(c.createDistortion).toHaveBeenCalledWith({ drive: 3, shape: 'tanh' });
  });
});
