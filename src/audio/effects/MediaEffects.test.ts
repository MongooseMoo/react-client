import type { Bus, Cacophony } from 'cacophony';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildEffectsSupport, MediaEffects } from './MediaEffects';

function makeBus(name: string | null) {
  return {
    name,
    addFilter: vi.fn(async (arg: unknown) => arg),
    removeFilter: vi.fn(),
    destroy: vi.fn(),
    drainTo: vi.fn(),
    destroyed: false,
    gain: 1,
    output: { gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() } },
  };
}

function makeCacophony() {
  const master = makeBus('master');
  const created = new Map<string, ReturnType<typeof makeBus>>();
  const noop = (name: string) => vi.fn(() => ({ __effect: name }));
  const cacophony = {
    context: { sampleRate: 48000, currentTime: 0 },
    createBus: vi.fn((name?: string) => {
      const b = makeBus(name ?? null);
      if (name) created.set(name, b);
      return b as unknown as Bus;
    }),
    getBus: vi.fn(
      (name: string) => (name === 'master' ? master : created.get(name)) as unknown as Bus,
    ),
    createFdnReverb: noop('fdn'),
    createReverb: noop('plate'),
    createDelay: noop('delay'),
    createChorus: noop('chorus'),
    createFlanger: noop('flanger'),
    createVibrato: noop('vibrato'),
    createDoubling: noop('doubling'),
    createPhaser: noop('phaser'),
    createTremolo: noop('tremolo'),
    createAutoPan: noop('autopan'),
    createDistortion: noop('distortion'),
    createCompressor: noop('compressor'),
    createLimiter: noop('limiter'),
    createGate: noop('gate'),
    createBiquadFilter: vi.fn((o: unknown) => ({ __biquad: o })),
  };
  return { cacophony: cacophony as unknown as Cacophony, master, created };
}

describe('MediaEffects', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates a named chain and exposes it for routing', async () => {
    const { cacophony, created } = makeCacophony();
    const fx = new MediaEffects(cacophony);
    await fx.setChain({ id: 'cave', effects: [{ type: 'reverb' }] });
    expect(cacophony.createBus).toHaveBeenCalledWith('cave');
    expect(fx.hasChain('cave')).toBe(true);
    expect(created.get('cave')!.addFilter).toHaveBeenCalledTimes(1);
  });

  it('replaces an existing chain in place (no second createBus)', async () => {
    const { cacophony } = makeCacophony();
    const fx = new MediaEffects(cacophony);
    await fx.setChain({ id: 'cave', effects: [{ type: 'reverb' }] });
    await fx.setChain({ id: 'cave', effects: [{ type: 'distortion' }] });
    expect(cacophony.createBus).toHaveBeenCalledTimes(1);
  });

  it('removes a chain when effects is empty (destroying, draining to master)', async () => {
    const { cacophony, created, master } = makeCacophony();
    const fx = new MediaEffects(cacophony);
    await fx.setChain({ id: 'cave', effects: [{ type: 'reverb' }] });
    const bus = created.get('cave')!;
    await fx.setChain({ id: 'cave', effects: [] });
    expect(bus.destroy).toHaveBeenCalledWith({ drainTo: master });
    expect(fx.hasChain('cave')).toBe(false);
  });

  it('expands a known chain preset (telephone → bandpass + distortion + compressor)', async () => {
    const { cacophony, created } = makeCacophony();
    const fx = new MediaEffects(cacophony);
    await fx.setChain({ id: 'phone', preset: 'telephone' });
    expect(created.get('phone')!.addFilter).toHaveBeenCalledTimes(3);
  });

  it('treats an unknown chain preset as a no-op (does not disturb existing chains)', async () => {
    const { cacophony } = makeCacophony();
    const fx = new MediaEffects(cacophony);
    await fx.setChain({ id: 'cave', effects: [{ type: 'reverb' }] });
    await fx.setChain({ id: 'cave', preset: 'no-such-preset' });
    expect(fx.hasChain('cave')).toBe(true);
    expect(cacophony.createBus).toHaveBeenCalledTimes(1); // unchanged
  });

  it('caps effects per chain at the advertised maximum', async () => {
    const { cacophony, created } = makeCacophony();
    const fx = new MediaEffects(cacophony);
    const many = Array.from({ length: 20 }, () => ({ type: 'reverb' }) as const);
    await fx.setChain({ id: 'big', effects: many });
    expect(created.get('big')!.addFilter).toHaveBeenCalledTimes(8); // maxEffectsPerChain
  });

  it('removeChain destroys the bus with a drain to master', async () => {
    const { cacophony, created, master } = makeCacophony();
    const fx = new MediaEffects(cacophony);
    await fx.setChain({ id: 'cave', effects: [{ type: 'reverb' }] });
    const bus = created.get('cave')!;
    fx.removeChain('cave');
    expect(bus.destroy).toHaveBeenCalledWith({ drainTo: master });
  });

  it('shutdown tears down every chain', async () => {
    const { cacophony, created } = makeCacophony();
    const fx = new MediaEffects(cacophony);
    await fx.setChain({ id: 'a', effects: [{ type: 'reverb' }] });
    await fx.setChain({ id: 'b', effects: [{ type: 'distortion' }] });
    fx.shutdown();
    expect(created.get('a')!.destroy).toHaveBeenCalled();
    expect(created.get('b')!.destroy).toHaveBeenCalled();
    expect(fx.hasChain('a')).toBe(false);
  });
});

describe('buildEffectsSupport', () => {
  it('advertises only legal wire type names and P0 capabilities', () => {
    const s = buildEffectsSupport();
    expect(s.types).toContain('reverb');
    expect(s.types).toContain('lowpass');
    expect(s.types).not.toContain('biquad'); // V8: never advertise a non-wire name
    expect(s.types).not.toContain('echo'); // alias, not advertised
    expect(s.reverbAlgorithms).toEqual(['fdn', 'plate']);
    expect(s.chains).toBe(true);
    expect(s.automation).toBe(false); // P2
  });
});
