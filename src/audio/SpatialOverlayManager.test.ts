import type { Cacophony } from 'cacophony';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SpatialOverlay } from './SpatialOverlay';
import { SpatialOverlayManager } from './SpatialOverlayManager';

// Mock SpatialOverlay so the manager's bookkeeping + yaw routing are tested in
// isolation from bus/renderer wiring.
const instances: Array<{
  options: unknown;
  setWorldYaw: ReturnType<typeof vi.fn>;
  setInstrumentYaw: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}> = [];

vi.mock('./SpatialOverlay', () => ({
  SpatialOverlay: {
    create: vi.fn((_cacophony: unknown, options: unknown) => {
      const inst = {
        options,
        setWorldYaw: vi.fn(),
        setInstrumentYaw: vi.fn(),
        destroy: vi.fn(),
      };
      instances.push(inst);
      return inst;
    }),
  },
}));

const cacophony = {} as unknown as Cacophony;

describe('SpatialOverlayManager', () => {
  beforeEach(() => {
    instances.length = 0;
    vi.clearAllMocks();
  });

  it('creates an overlay under its id (name passed through)', () => {
    const mgr = new SpatialOverlayManager(cacophony);
    const overlay = mgr.addOverlay('sensor-sphere', { headStable: true });
    expect(SpatialOverlay.create).toHaveBeenCalledWith(cacophony, {
      name: 'sensor-sphere',
      headStable: true,
    });
    expect(mgr.get('sensor-sphere')).toBe(overlay as unknown);
    expect(mgr.has('sensor-sphere')).toBe(true);
    expect(mgr.size).toBe(1);
  });

  it('re-adding an id destroys the previous overlay', () => {
    const mgr = new SpatialOverlayManager(cacophony);
    mgr.addOverlay('ov');
    mgr.addOverlay('ov');
    expect(instances[0].destroy).toHaveBeenCalledTimes(1);
    expect(mgr.size).toBe(1);
  });

  it('setWorldYaw fans out to every overlay (head-stable opt-out is internal)', () => {
    const mgr = new SpatialOverlayManager(cacophony);
    mgr.addOverlay('a');
    mgr.addOverlay('b');
    instances.forEach((i) => {
      i.setWorldYaw.mockClear();
    });

    mgr.setWorldYaw(0.9);
    expect(instances[0].setWorldYaw).toHaveBeenCalledWith(0.9);
    expect(instances[1].setWorldYaw).toHaveBeenCalledWith(0.9);
  });

  it('a newly added overlay adopts the current world yaw', () => {
    const mgr = new SpatialOverlayManager(cacophony);
    mgr.setWorldYaw(1.4);
    mgr.addOverlay('late');
    expect(instances[0].setWorldYaw).toHaveBeenCalledWith(1.4);
  });

  it('setInstrumentYaw targets one overlay only', () => {
    const mgr = new SpatialOverlayManager(cacophony);
    mgr.addOverlay('a');
    mgr.addOverlay('b');

    mgr.setInstrumentYaw('b', 0.3);
    expect(instances[0].setInstrumentYaw).not.toHaveBeenCalled();
    expect(instances[1].setInstrumentYaw).toHaveBeenCalledWith(0.3);
  });

  it('removeOverlay destroys and drops it', () => {
    const mgr = new SpatialOverlayManager(cacophony);
    mgr.addOverlay('a');
    mgr.removeOverlay('a');
    expect(instances[0].destroy).toHaveBeenCalledTimes(1);
    expect(mgr.has('a')).toBe(false);
    expect(mgr.size).toBe(0);
  });

  it('destroyAll tears down every overlay', () => {
    const mgr = new SpatialOverlayManager(cacophony);
    mgr.addOverlay('a');
    mgr.addOverlay('b');
    mgr.destroyAll();
    expect(instances[0].destroy).toHaveBeenCalledTimes(1);
    expect(instances[1].destroy).toHaveBeenCalledTimes(1);
    expect(mgr.size).toBe(0);
  });
});
