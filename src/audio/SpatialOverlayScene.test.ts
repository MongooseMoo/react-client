import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SpatialEmitter } from '../gmcp/Client/Spatial';
import { SpatialOverlayScene, type OverlayMember } from './SpatialOverlayScene';
import type { SpatialOverlayManager } from './SpatialOverlayManager';
import type { TransparencyDuck } from './TransparencyDuck';

function emitter(over: Partial<SpatialEmitter> & { id: string }): SpatialEmitter {
  return { binding: 'world', ...over };
}

function makeManager() {
  return {
    addOverlay: vi.fn(),
    removeOverlay: vi.fn(),
  } as unknown as SpatialOverlayManager & {
    addOverlay: ReturnType<typeof vi.fn>;
    removeOverlay: ReturnType<typeof vi.fn>;
  };
}

function makeDuck() {
  return {
    activate: vi.fn(),
    deactivate: vi.fn(),
  } as unknown as TransparencyDuck & {
    activate: ReturnType<typeof vi.fn>;
    deactivate: ReturnType<typeof vi.fn>;
  };
}

describe('SpatialOverlayScene', () => {
  let manager: ReturnType<typeof makeManager>;
  let duck: ReturnType<typeof makeDuck>;
  let made: Array<{ emitterId: string; overlayId: string; member: OverlayMember & { stop: ReturnType<typeof vi.fn> } }>;
  let factory: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    manager = makeManager();
    duck = makeDuck();
    made = [];
    factory = vi.fn((e: SpatialEmitter, overlayId: string) => {
      const member = { stop: vi.fn() };
      made.push({ emitterId: e.id, overlayId, member });
      return member;
    });
  });

  function scene() {
    return new SpatialOverlayScene(manager, duck, factory);
  }

  it('ignores world (non-overlay) emitters entirely', () => {
    const s = scene();
    s.syncScene([emitter({ id: 'w1' }), emitter({ id: 'w2' })]);
    expect(manager.addOverlay).not.toHaveBeenCalled();
    expect(factory).not.toHaveBeenCalled();
    expect(s.size).toBe(0);
  });

  it('creates a head-stable overlay + members + duck for head-frame emitters', () => {
    const s = scene();
    s.syncScene([
      emitter({ id: 'c1', overlay: 'sphere', frame: 'head', transparency: 0.3 }),
      emitter({ id: 'c2', overlay: 'sphere', frame: 'head', transparency: 0.3 }),
    ]);
    expect(manager.addOverlay).toHaveBeenCalledWith('sphere', { headStable: true });
    expect(factory).toHaveBeenCalledTimes(2);
    expect(duck.activate).toHaveBeenLastCalledWith('sphere', 0.3);
    expect(s.size).toBe(1);
  });

  it('does not recreate a surviving member on re-sync (no stutter)', () => {
    const s = scene();
    const first = [emitter({ id: 'c1', overlay: 'sphere', frame: 'head' })];
    s.syncScene(first);
    s.syncScene(first);
    expect(factory).toHaveBeenCalledTimes(1);
    expect(made[0].member.stop).not.toHaveBeenCalled();
  });

  it('stops a member whose emitter left, keeps the overlay if others remain', () => {
    const s = scene();
    s.syncScene([
      emitter({ id: 'c1', overlay: 'sphere', frame: 'head' }),
      emitter({ id: 'c2', overlay: 'sphere', frame: 'head' }),
    ]);
    s.syncScene([emitter({ id: 'c2', overlay: 'sphere', frame: 'head' })]);
    const c1 = made.find((m) => m.emitterId === 'c1');
    expect(c1?.member.stop).toHaveBeenCalledTimes(1);
    expect(manager.removeOverlay).not.toHaveBeenCalled();
    expect(s.size).toBe(1);
  });

  it('tears down an overlay (members + manager + duck) when it leaves the scene', () => {
    const s = scene();
    s.syncScene([emitter({ id: 'c1', overlay: 'sphere', frame: 'head' })]);
    s.syncScene([emitter({ id: 'w1' })]);
    expect(made[0].member.stop).toHaveBeenCalledTimes(1);
    expect(manager.removeOverlay).toHaveBeenCalledWith('sphere');
    expect(duck.deactivate).toHaveBeenCalledWith('sphere');
    expect(s.size).toBe(0);
  });

  it('retries member creation when the factory returns undefined', () => {
    const s = scene();
    factory.mockReturnValueOnce(undefined);
    const list = [emitter({ id: 'c1', overlay: 'sphere', frame: 'head' })];
    s.syncScene(list); // factory returns undefined → no member stored
    s.syncScene(list); // retries
    expect(factory).toHaveBeenCalledTimes(2);
    expect(s.size).toBe(1);
  });

  it('clear tears down everything', () => {
    const s = scene();
    s.syncScene([
      emitter({ id: 'c1', overlay: 'a', frame: 'head' }),
      emitter({ id: 'c2', overlay: 'b', frame: 'world' }),
    ]);
    s.clear();
    expect(manager.removeOverlay).toHaveBeenCalledWith('a');
    expect(manager.removeOverlay).toHaveBeenCalledWith('b');
    expect(s.size).toBe(0);
  });
});
