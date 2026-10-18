import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TransparencyDuck } from './TransparencyDuck';

function makeSink() {
  return { rampGain: vi.fn() };
}

describe('TransparencyDuck', () => {
  let sink: ReturnType<typeof makeSink>;

  beforeEach(() => {
    sink = makeSink();
  });

  it('dips the world to an overlay transparency when it activates', () => {
    const duck = new TransparencyDuck(sink, 120);
    duck.activate('sphere', 0.3);
    expect(duck.worldGain).toBe(0.3);
    expect(sink.rampGain).toHaveBeenLastCalledWith(0.3, 120);
  });

  it('the most opaque active overlay wins (min transparency)', () => {
    const duck = new TransparencyDuck(sink);
    duck.activate('a', 0.6);
    duck.activate('b', 0.2);
    expect(duck.worldGain).toBe(0.2);
    duck.activate('c', 0.9);
    expect(duck.worldGain).toBe(0.2);
  });

  it('restores toward unity as overlays deactivate, fully at the last', () => {
    const duck = new TransparencyDuck(sink);
    duck.activate('a', 0.6);
    duck.activate('b', 0.2);
    duck.deactivate('b');
    expect(duck.worldGain).toBe(0.6);
    duck.deactivate('a');
    expect(duck.worldGain).toBe(1);
    expect(sink.rampGain).toHaveBeenLastCalledWith(1, 120);
  });

  it('clamps transparency into [0,1] and treats non-finite as fully transparent', () => {
    const duck = new TransparencyDuck(sink);
    duck.activate('over', 1.7);
    expect(duck.worldGain).toBe(1);
    duck.activate('under', -0.5);
    expect(duck.worldGain).toBe(0);
    duck.deactivate('under');
    duck.activate('nan', Number.NaN);
    expect(duck.worldGain).toBe(1);
  });

  it('deactivate is a no-op for an unknown id (no spurious ramp)', () => {
    const duck = new TransparencyDuck(sink);
    duck.activate('a', 0.5);
    sink.rampGain.mockClear();
    duck.deactivate('ghost');
    expect(sink.rampGain).not.toHaveBeenCalled();
  });

  it('clear restores the world and only ramps when something was active', () => {
    const duck = new TransparencyDuck(sink);
    duck.clear();
    expect(sink.rampGain).not.toHaveBeenCalled();
    duck.activate('a', 0.4);
    sink.rampGain.mockClear();
    duck.clear();
    expect(duck.worldGain).toBe(1);
    expect(sink.rampGain).toHaveBeenCalledWith(1, 120);
  });
});
