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

  describe('pending definitions and revisions', () => {
    /** The next createBus returns a bus whose addFilter waits for release(). */
    function deferNextBus(cacophony: Cacophony) {
      let release: () => void = () => undefined;
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      const bus = makeBus('deferred');
      bus.addFilter = vi.fn(async (arg: unknown) => {
        await gate;
        return arg;
      });
      vi.mocked(cacophony.createBus).mockImplementationOnce(() => bus as unknown as Bus);
      return { bus, release };
    }

    it('lets the newer Chain win when an older build resolves late', async () => {
      const { cacophony } = makeCacophony();
      const fx = new MediaEffects(cacophony);
      const old = deferNextBus(cacophony);
      const first = fx.setChain({ id: 'workshop', effects: [{ type: 'reverb' }] });
      await vi.waitFor(() => expect(old.bus.addFilter).toHaveBeenCalled());
      const second = fx.setChain({
        id: 'workshop',
        effects: [{ type: 'lowpass', params: { frequency: 400 } }],
      });
      old.release();
      await Promise.all([first, second]);

      expect(old.bus.destroy).toHaveBeenCalled();
      const live = fx.getChain('workshop');
      expect(live?.bus).not.toBe(old.bus);
      expect(cacophony.createBiquadFilter).toHaveBeenCalledWith({ type: 'lowpass', frequency: 400 });
    });

    it('whenChainReady waits for a pending definition', async () => {
      const { cacophony } = makeCacophony();
      const fx = new MediaEffects(cacophony);
      const pending = deferNextBus(cacophony);
      void fx.setChain({ id: 'workshop', effects: [{ type: 'reverb' }] });
      let ready = false;
      const waiting = fx.whenChainReady('workshop').then(() => {
        ready = true;
      });
      await vi.waitFor(() => expect(pending.bus.addFilter).toHaveBeenCalled());
      expect(ready).toBe(false);
      pending.release();
      await waiting;
      expect(fx.hasChain('workshop')).toBe(true);
    });

    it('a ChainStop during a pending build discards the build', async () => {
      const { cacophony } = makeCacophony();
      const fx = new MediaEffects(cacophony);
      const pending = deferNextBus(cacophony);
      const build = fx.setChain({ id: 'workshop', effects: [{ type: 'reverb' }] });
      await vi.waitFor(() => expect(pending.bus.addFilter).toHaveBeenCalled());
      fx.removeChain('workshop');
      pending.release();
      await build;
      expect(fx.hasChain('workshop')).toBe(false);
      expect(pending.bus.destroy).toHaveBeenCalled();
    });

    it('accepts the captured MOO Chain definition (contract case "chain")', async () => {
      const { cacophony } = makeCacophony();
      const fx = new MediaEffects(cacophony);
      await fx.setChain({
        id: 'workshop',
        effects: [{ id: 'muffle', type: 'lowpass', params: { frequency: 400 } }],
        gain: 1,
        fadein: 0,
      });
      expect(fx.hasChain('workshop')).toBe(true);
      expect(cacophony.createBiquadFilter).toHaveBeenCalledWith({ type: 'lowpass', frequency: 400 });
    });
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

  describe('chain observer', () => {
    it('hears a chain once it exists, and not again when it is redefined in place', async () => {
      const { cacophony } = makeCacophony();
      const observer = {
        chainCreated: vi.fn((id: string) => expect(fx.hasChain(id)).toBe(true)),
        chainDestroying: vi.fn(),
      };
      const fx = new MediaEffects(cacophony, observer);

      await fx.setChain({ id: 'cave', effects: [{ type: 'reverb' }] });
      await fx.setChain({ id: 'cave', effects: [{ type: 'distortion' }] });

      expect(observer.chainCreated).toHaveBeenCalledTimes(1);
      expect(observer.chainCreated).toHaveBeenCalledWith('cave');
      expect(observer.chainDestroying).not.toHaveBeenCalled();
    });

    it('hears a chain going while its bus is still alive, on every way it can go', async () => {
      const { cacophony, created } = makeCacophony();
      const observer = {
        chainCreated: vi.fn(),
        chainDestroying: vi.fn((id: string) => {
          expect(fx.hasChain(id)).toBe(true);
          expect(created.get(id)!.destroy).not.toHaveBeenCalled();
        }),
      };
      const fx = new MediaEffects(cacophony, observer);
      for (const id of ['stopped', 'emptied', 'shutdown']) {
        await fx.setChain({ id, effects: [{ type: 'reverb' }] });
      }

      fx.removeChain('stopped');
      await fx.setChain({ id: 'emptied', effects: [] });
      fx.shutdown();
      fx.removeChain('never-defined');

      expect(observer.chainDestroying.mock.calls).toEqual([['stopped'], ['emptied'], ['shutdown']]);
      expect(created.get('shutdown')!.destroy).toHaveBeenCalled();
    });
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
    expect(s.automation).toBe(true);
  });
});
