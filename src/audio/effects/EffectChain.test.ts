import type { Bus, Cacophony } from 'cacophony';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EffectChain } from './EffectChain';

type MockBus = {
  name: string | null;
  addFilter: ReturnType<typeof vi.fn>;
  removeFilter: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  drainTo: ReturnType<typeof vi.fn>;
  destroyed: boolean;
  gain: number;
  output: {
    gain: {
      value: number;
      setValueAtTime: ReturnType<typeof vi.fn>;
      linearRampToValueAtTime: ReturnType<typeof vi.fn>;
    };
  };
};

function makeBus(name: string | null): MockBus {
  return {
    name,
    // addFilter returns the node it was given (mirrors cacophony returning the built node).
    addFilter: vi.fn(async (arg: unknown) => arg),
    removeFilter: vi.fn(),
    destroy: vi.fn(),
    drainTo: vi.fn(),
    destroyed: false,
    gain: 1,
    output: { gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() } },
  };
}

function makeCacophony(masterBus: MockBus) {
  const createdBuses = new Map<string, MockBus>();
  const factoryCalls: Array<{ factory: string; options: unknown }> = [];
  const factory = (name: string) =>
    vi.fn((options: unknown) => {
      factoryCalls.push({ factory: name, options });
      return { __effect: name }; // a CacophonyEffect sentinel
    });

  const cacophony = {
    context: { sampleRate: 48000, currentTime: 0 },
    createBus: vi.fn((name?: string) => {
      const b = makeBus(name ?? null);
      if (name) createdBuses.set(name, b);
      return b as unknown as Bus;
    }),
    getBus: vi.fn(
      (name: string) => (name === 'master' ? masterBus : createdBuses.get(name)) as unknown as Bus,
    ),
    createFdnReverb: factory('createFdnReverb'),
    createReverb: factory('createReverb'),
    createDelay: factory('createDelay'),
    createChorus: factory('createChorus'),
    createFlanger: factory('createFlanger'),
    createVibrato: factory('createVibrato'),
    createDoubling: factory('createDoubling'),
    createPhaser: factory('createPhaser'),
    createTremolo: factory('createTremolo'),
    createAutoPan: factory('createAutoPan'),
    createDistortion: factory('createDistortion'),
    createCompressor: factory('createCompressor'),
    createLimiter: factory('createLimiter'),
    createGate: factory('createGate'),
    createBiquadFilter: vi.fn((options: unknown) => {
      factoryCalls.push({ factory: 'createBiquadFilter', options });
      return { __biquad: options };
    }),
  };
  return { cacophony: cacophony as unknown as Cacophony, createdBuses, factoryCalls };
}

describe('EffectChain', () => {
  let master: MockBus;

  beforeEach(() => {
    vi.clearAllMocks();
    master = makeBus('master');
  });

  it('builds effects in order onto a freshly created named bus', async () => {
    const { cacophony, createdBuses, factoryCalls } = makeCacophony(master);
    await EffectChain.create(cacophony, 'cave', [
      { type: 'reverb', params: { mix: 0.4 } },
      { type: 'lowpass', params: { frequency: 800 } },
    ]);
    expect(cacophony.createBus).toHaveBeenCalledWith('cave');
    const bus = createdBuses.get('cave')!;
    expect(bus.addFilter).toHaveBeenCalledTimes(2);
    // ordered: reverb then biquad
    expect(factoryCalls.map((c) => c.factory)).toEqual(['createFdnReverb', 'createBiquadFilter']);
  });

  it('master overlay uses the master bus, never createBus', async () => {
    const { cacophony } = makeCacophony(master);
    await EffectChain.create(cacophony, 'master', [
      { type: 'lowpass', params: { frequency: 500 } },
    ]);
    expect(cacophony.createBus).not.toHaveBeenCalled();
    expect(cacophony.getBus).toHaveBeenCalledWith('master');
    expect(master.addFilter).toHaveBeenCalledTimes(1);
  });

  it('destroy() on a named chain drains live sounds to master, then destroys', async () => {
    const { cacophony, createdBuses } = makeCacophony(master);
    const chain = await EffectChain.create(cacophony, 'cave', [{ type: 'reverb' }]);
    const bus = createdBuses.get('cave')!;
    chain.destroy(master as unknown as Bus);
    expect(bus.destroy).toHaveBeenCalledWith({ drainTo: master });
  });

  it('destroy() on the master overlay removes only its own filters and NEVER destroys', async () => {
    const { cacophony } = makeCacophony(master);
    const chain = await EffectChain.create(cacophony, 'master', [
      { type: 'lowpass', params: { frequency: 500 } },
      { type: 'highpass', params: { frequency: 100 } },
    ]);
    chain.destroy(master as unknown as Bus);
    expect(master.removeFilter).toHaveBeenCalledTimes(2);
    expect(master.destroy).not.toHaveBeenCalled();
  });

  it('skips unknown effect types but builds the rest (degradation)', async () => {
    const { cacophony, createdBuses, factoryCalls } = makeCacophony(master);
    await EffectChain.create(cacophony, 'cave', [
      { type: 'warp-drive' }, // unknown → skipped
      { type: 'reverb' },
    ]);
    const bus = createdBuses.get('cave')!;
    expect(bus.addFilter).toHaveBeenCalledTimes(1);
    expect(factoryCalls.map((c) => c.factory)).toEqual(['createFdnReverb']);
  });

  it('skips an effect whose build (addFilter) rejects, continuing the chain', async () => {
    const { cacophony, createdBuses } = makeCacophony(master);
    // First addFilter rejects (worklet load failure), second succeeds.
    const bus = makeBus('cave');
    let call = 0;
    bus.addFilter = vi.fn(async (arg: unknown) => {
      call += 1;
      if (call === 1) throw new Error('worklet load failed');
      return arg;
    });
    (cacophony.createBus as ReturnType<typeof vi.fn>).mockReturnValue(bus as unknown as Bus);
    void createdBuses;
    await EffectChain.create(cacophony, 'cave', [{ type: 'reverb' }, { type: 'distortion' }]);
    expect(bus.addFilter).toHaveBeenCalledTimes(2); // both attempted
    // The chain survived the first failure.
  });

  it('replace() dips the bus gain around the structural rebuild', async () => {
    const { cacophony, createdBuses } = makeCacophony(master);
    const chain = await EffectChain.create(cacophony, 'cave', [{ type: 'reverb' }]);
    const bus = createdBuses.get('cave')!;
    const seen: number[] = [];
    let g = bus.gain;
    Object.defineProperty(bus, 'gain', {
      get: () => g,
      set: (v: number) => {
        g = v;
        seen.push(v);
      },
    });
    await chain.replace([{ type: 'distortion' }]);
    // gain was driven to 0 during the rebuild and restored afterwards.
    expect(seen).toContain(0);
    expect(g).not.toBe(0);
    // old reverb removed, new distortion added
    expect(bus.removeFilter).toHaveBeenCalledTimes(1);
  });
});
