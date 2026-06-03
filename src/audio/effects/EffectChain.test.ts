import type { Bus, Cacophony } from 'cacophony';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EffectChain } from './EffectChain';

type MockBus = {
  name: string | null;
  input: Record<string, unknown>;
  addFilter: ReturnType<typeof vi.fn>;
  removeFilter: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  drainTo: ReturnType<typeof vi.fn>;
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  rampFilterParam: ReturnType<typeof vi.fn>;
  setFilterBypassed: ReturnType<typeof vi.fn>;
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
    input: { __input: name },
    // addFilter returns the node it was given (mirrors cacophony returning the built node).
    addFilter: vi.fn(async (arg: unknown) => arg),
    removeFilter: vi.fn(),
    destroy: vi.fn(),
    drainTo: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    rampFilterParam: vi.fn(),
    setFilterBypassed: vi.fn(),
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

  it('automate ramps the translated cacophony param(s) on the effect node', async () => {
    const { cacophony, createdBuses } = makeCacophony(master);
    await EffectChain.create(cacophony, 'cave', [{ type: 'reverb', id: 'env' }]);
    const bus = createdBuses.get('cave')!;
    const chain = await EffectChain.create(cacophony, 'cave2', [{ type: 'reverb', id: 'env' }]);
    const bus2 = createdBuses.get('cave2')!;
    chain.automate('env', { mix: 0.8, decayTime: 4 }, { duration: 1500, curve: 'linear' });
    expect(bus2.rampFilterParam).toHaveBeenCalledWith(expect.anything(), 'mix', 0.8, {
      duration: 1500,
      type: 'linear',
    });
    expect(bus2.rampFilterParam).toHaveBeenCalledWith(expect.anything(), 'decayTime', 4, {
      duration: 1500,
      type: 'linear',
    });
    void bus;
  });

  it('automate on plate reverb ramps both wet AND dry (mix split)', async () => {
    const { cacophony, createdBuses } = makeCacophony(master);
    const chain = await EffectChain.create(cacophony, 'cave', [
      { type: 'reverb', algorithm: 'plate', id: 'r' },
    ]);
    const bus = createdBuses.get('cave')!;
    chain.automate('r', { mix: 0.4 });
    const rampedParams = bus.rampFilterParam.mock.calls.map((c) => c[1]);
    expect(rampedParams).toContain('wet');
    expect(rampedParams).toContain('dry');
  });

  it('automate no-ops on a missing target', async () => {
    const { cacophony, createdBuses } = makeCacophony(master);
    const chain = await EffectChain.create(cacophony, 'cave', [{ type: 'reverb' }]);
    const bus = createdBuses.get('cave')!;
    chain.automate('nonexistent', { mix: 0.5 });
    expect(bus.rampFilterParam).not.toHaveBeenCalled();
  });

  it('setBypass toggles cacophony filter bypass for the targeted effect', async () => {
    const { cacophony, createdBuses } = makeCacophony(master);
    const chain = await EffectChain.create(cacophony, 'cave', [{ type: 'reverb', id: 'env' }]);
    const bus = createdBuses.get('cave')!;
    chain.setBypass('env', true);
    expect(bus.setFilterBypassed).toHaveBeenCalledWith(expect.anything(), true);
  });

  it('honors EffectSpec.bypass at build time', async () => {
    const { cacophony, createdBuses } = makeCacophony(master);
    await EffectChain.create(cacophony, 'cave', [{ type: 'reverb', bypass: true }]);
    const bus = createdBuses.get('cave')!;
    expect(bus.setFilterBypassed).toHaveBeenCalledWith(expect.anything(), true);
  });

  it('createAnonymous builds on an unnamed bus and destroys WITHOUT a drain', async () => {
    const { cacophony } = makeCacophony(master);
    const chain = await EffectChain.createAnonymous(cacophony, [{ type: 'distortion' }]);
    expect(cacophony.createBus).toHaveBeenCalledWith();
    const anon = (cacophony.createBus as ReturnType<typeof vi.fn>).mock.results[0]
      ?.value as MockBus;
    chain.destroy(master as unknown as Bus);
    expect(anon.destroy).toHaveBeenCalledWith(undefined); // anonymous: no drainTo
  });

  it('connectDownstream rewires the inline bus from master to a chain bus', async () => {
    const { cacophony } = makeCacophony(master);
    const chain = await EffectChain.createAnonymous(cacophony, [{ type: 'distortion' }]);
    const anon = (cacophony.createBus as ReturnType<typeof vi.fn>).mock.results[0]
      ?.value as MockBus;
    const target = makeBus('cave');
    chain.connectDownstream(target as unknown as Bus);
    expect(anon.disconnect).toHaveBeenCalledWith(master); // drop the auto master edge
    expect(anon.connect).toHaveBeenCalledWith(target);
  });
});
