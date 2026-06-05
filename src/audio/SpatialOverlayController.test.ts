import type { Cacophony } from 'cacophony';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SpatialEmitter } from '../gmcp/Client/Spatial';
import { SpatialOverlayController } from './SpatialOverlayController';
import type { OverlayMember } from './SpatialOverlayScene';

// Mock the leaf units so the controller's wiring is tested in isolation.
const managerInstances: Array<{
  setWorldYaw: ReturnType<typeof vi.fn>;
  setInstrumentYaw: ReturnType<typeof vi.fn>;
  destroyAll: ReturnType<typeof vi.fn>;
}> = [];

vi.mock('./SpatialOverlayManager', () => ({
  SpatialOverlayManager: vi.fn().mockImplementation(() => {
    const inst = {
      setWorldYaw: vi.fn(),
      setInstrumentYaw: vi.fn(),
      destroyAll: vi.fn(),
      addOverlay: vi.fn(),
      removeOverlay: vi.fn(),
      get: vi.fn(),
    };
    managerInstances.push(inst);
    return inst;
  }),
}));

function makeBus(name: string | null) {
  return {
    name,
    input: { __input: name },
    destroy: vi.fn(),
    destroyed: false,
    gain: 1,
    output: { gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() } },
  };
}

function emitter(over: Partial<SpatialEmitter> & { id: string }): SpatialEmitter {
  return { binding: 'world', ...over };
}

describe('SpatialOverlayController', () => {
  let cacophony: Cacophony;
  let worldSink: { rampGain: ReturnType<typeof vi.fn> };
  let memberFactory: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    managerInstances.length = 0;
    vi.clearAllMocks();
    cacophony = {
      context: { sampleRate: 48000, currentTime: 0 },
      createBus: vi.fn((name?: string) => makeBus(name ?? null)),
    } as unknown as Cacophony;
    worldSink = { rampGain: vi.fn() };
    memberFactory = vi.fn(
      (): OverlayMember => ({ stop: vi.fn() }),
    );
  });

  function make() {
    return new SpatialOverlayController(cacophony, { worldSink, memberFactory });
  }

  it('handleScene reconciles overlay emitters into the scene (factory invoked)', () => {
    const ctrl = make();
    ctrl.handleScene([
      emitter({ id: 'c1', overlay: 'sphere', frame: 'head', transparency: 0.3 }),
      emitter({ id: 'w1' }),
    ]);
    expect(memberFactory).toHaveBeenCalledTimes(1);
    expect(memberFactory).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'c1', overlay: 'sphere' }),
      'sphere',
    );
    // duck dipped to the overlay transparency
    expect(worldSink.rampGain).toHaveBeenCalledWith(0.3, expect.any(Number));
  });

  it('handleWorldYaw drives the manager', () => {
    const ctrl = make();
    ctrl.handleWorldYaw(1.1);
    expect(managerInstances[0].setWorldYaw).toHaveBeenCalledWith(1.1);
  });

  it('setInstrumentYaw targets one overlay on the manager', () => {
    const ctrl = make();
    ctrl.setInstrumentYaw('sphere', 0.4);
    expect(managerInstances[0].setInstrumentYaw).toHaveBeenCalledWith('sphere', 0.4);
  });

  it('clear tears down scene + manager + duck and restores the world', () => {
    const ctrl = make();
    ctrl.handleScene([emitter({ id: 'c1', overlay: 'sphere', frame: 'head', transparency: 0.5 })]);
    worldSink.rampGain.mockClear();
    ctrl.clear();
    expect(managerInstances[0].destroyAll).toHaveBeenCalledTimes(1);
    // duck restored world to unity
    expect(worldSink.rampGain).toHaveBeenCalledWith(1, expect.any(Number));
  });

  it('a member is dropped when its emitter leaves the scene', () => {
    const ctrl = make();
    const stop = vi.fn();
    memberFactory.mockReturnValueOnce({ stop });
    ctrl.handleScene([emitter({ id: 'c1', overlay: 'sphere', frame: 'head' })]);
    ctrl.handleScene([]); // c1 gone
    expect(stop).toHaveBeenCalledTimes(1);
  });
});
