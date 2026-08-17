import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GMCPClientSpatial } from './Spatial';
import { VectorTweener, type TweenScheduler } from '../../audio/vectorTween';
import { useSpatialStore } from '../../stores/spatialStore';
import { useSessionStore } from '../../stores/sessionStore';

/** Manual clock + frame queue driving the handler's motion tweener. */
function createMotionHarness() {
  let now = 0;
  let queued: (() => void) | null = null;
  const scheduler: TweenScheduler = {
    schedule: (callback) => {
      queued = callback;
      return callback;
    },
    cancel: (handle) => {
      if (queued === handle) {
        queued = null;
      }
    },
  };
  const motion = new VectorTweener({ scheduler, now: () => now });
  const step = (ms: number) => {
    now += ms;
    const frame = queued;
    queued = null;
    frame?.();
  };
  return { motion, step };
}

function createMockClient() {
  const cacophony = {
    listenerForwardOrientation: [9, 9, 9],
    listenerPosition: [9, 9, 9],
    listenerUpOrientation: [9, 9, 9],
  };
  return {
    media: {
      cacophony,
      setListenerOrientation: vi.fn((orientation) => {
        cacophony.listenerForwardOrientation = orientation?.forward ?? [0, 0, -1];
        cacophony.listenerUpOrientation = orientation?.up ?? [0, 1, 0];
      }),
      setListenerPosition: vi.fn((position) => {
        cacophony.listenerPosition = position ?? [0, 0, 0];
      }),
    },
    gmcp: {
      send: vi.fn(),
    },
  };
}

describe('GMCPClientSpatial', () => {
  let client: ReturnType<typeof createMockClient>;
  let handler: GMCPClientSpatial;
  let step: (ms: number) => void;

  beforeEach(() => {
    vi.clearAllMocks();
    useSpatialStore.getState().reset();
    useSessionStore.getState().reset();
    client = createMockClient();
    const harness = createMotionHarness();
    step = harness.step;
    handler = new GMCPClientSpatial(
      client as unknown as ConstructorParameters<typeof GMCPClientSpatial>[0],
      harness.motion,
    );
  });

  it('replaces stale scene state on Scene snapshot', () => {
    useSessionStore.setState({ roomId: 'old-room' });
    useSpatialStore.setState({
      listenerEntityId: 'old-listener',
      spatialEntities: {
        stale: {
          id: 'stale',
          position: [9, 9, 9],
        },
      },
      spatialEmitters: {
        'old-emitter': {
          id: 'old-emitter',
          binding: 'world',
        },
      },
    });

    handler.handleScene({
      roomId: 'new-room',
      listenerId: 'player-1',
      listenerPosition: [1, 2, 3],
      listenerOrientation: {
        forward: [0, 1, 0],
        up: [0, 0, 1],
      },
      entities: [
        {
          id: 'player-1',
          name: 'Q',
          kind: 'player',
          position: [1, 2, 3],
        },
      ],
      emitters: [
        {
          id: 'radio-1',
          binding: 'entity',
          sourceEntity: 'player-1',
          mediaKey: 'radio-1',
        },
      ],
    });

    const spatial = useSpatialStore.getState();
    expect(useSessionStore.getState().roomId).toBe('new-room');
    expect(spatial.listenerEntityId).toBe('player-1');
    expect(spatial.listenerPosition).toEqual([-1, 3, 2]);
    expect(spatial.listenerOrientation).toEqual({
      forward: [0, 0, 1],
      up: [0, 1, 0],
    });
    expect(client.media.cacophony.listenerPosition).toEqual([-1, 3, 2]);
    expect(client.media.cacophony.listenerForwardOrientation).toEqual([0, 0, 1]);
    expect(client.media.cacophony.listenerUpOrientation).toEqual([0, 1, 0]);
    expect(spatial.spatialEntities).toEqual({
      'player-1': {
        id: 'player-1',
        name: 'Q',
        kind: 'player',
        position: [-1, 3, 2],
      },
    });
    expect(spatial.spatialEmitters).toEqual({
      'radio-1': {
        id: 'radio-1',
        binding: 'entity',
        sourceEntity: 'player-1',
        mediaKey: 'radio-1',
      },
    });
  });

  it('adds one entity on EntityEnter', () => {
    handler.handleEntityEnter({
      entity: {
        id: 'player-2',
        name: 'Daiverd',
        position: [4, 5, 6],
      },
    });

    expect(useSpatialStore.getState().spatialEntities['player-2']).toEqual({
      id: 'player-2',
      name: 'Daiverd',
      position: [-4, 6, 5],
    });
  });

  it('removes an entity and its bound emitters on EntityLeave', () => {
    useSpatialStore.setState({
      spatialEntities: {
        'player-2': {
          id: 'player-2',
          position: [4, 5, 6],
        },
      },
      spatialEmitters: {
        'radio-1': {
          id: 'radio-1',
          binding: 'entity',
          sourceEntity: 'player-2',
        },
        'drip-1': {
          id: 'drip-1',
          binding: 'world',
        },
      },
    });

    handler.handleEntityLeave({ entityId: 'player-2' });

    expect(useSpatialStore.getState().spatialEntities).toEqual({});
    expect(useSpatialStore.getState().spatialEmitters).toEqual({
      'drip-1': {
        id: 'drip-1',
        binding: 'world',
      },
    });
  });

  it('glides EntityMove position and forward to the target coordinates', () => {
    useSpatialStore.setState({
      spatialEntities: {
        'player-1': {
          id: 'player-1',
          name: 'Q',
          kind: 'player',
          position: [1, 1, 1],
        },
      },
    });

    handler.handleEntityMove({
      entityId: 'player-1',
      position: [2, 3, 4],
      velocity: [0.5, 0, 0],
      forward: [1, 0, 0],
      up: [0, 0, 1],
    });

    // Velocity and up land immediately; position stays put until frames run.
    const beforeFrames = useSpatialStore.getState().spatialEntities['player-1'];
    expect(beforeFrames.position).toEqual([1, 1, 1]);
    expect(beforeFrames.velocity).toEqual([-0.5, 0, 0]);
    expect(beforeFrames.up).toEqual([0, 1, 0]);

    // Halfway through the (clamped 600ms) glide the position is interpolated.
    step(300);
    const midway = useSpatialStore.getState().spatialEntities['player-1'];
    expect(midway.position).toEqual([-0.5, 2.5, 2]);

    step(300);
    expect(useSpatialStore.getState().spatialEntities['player-1']).toEqual({
      id: 'player-1',
      name: 'Q',
      kind: 'player',
      position: [-2, 4, 3],
      velocity: [-0.5, 0, 0],
      forward: [-1, 0, 0],
      up: [0, 1, 0],
    });
  });

  it('snaps EntityMove for an entity with no known prior position', () => {
    handler.handleEntityMove({
      entityId: 'player-9',
      position: [2, 3, 4],
    });

    expect(useSpatialStore.getState().spatialEntities['player-9'].position).toEqual([-2, 4, 3]);
  });

  it('glides the listener between known positions and syncs cacophony per frame', () => {
    useSpatialStore.setState({ listenerPosition: [0, 0, 0] });

    handler.handleListenerPosition({
      listenerId: 'player-1',
      position: [1, 0, 0],
    });

    // 1m at the 2 m/s default speed = 500ms.
    step(250);
    expect(useSpatialStore.getState().listenerPosition).toEqual([-0.5, 0, 0]);
    expect(client.media.cacophony.listenerPosition).toEqual([-0.5, 0, 0]);

    step(250);
    expect(useSpatialStore.getState().listenerPosition).toEqual([-1, 0, 0]);
    expect(client.media.cacophony.listenerPosition).toEqual([-1, 0, 0]);
  });

  it('drops in-flight glides on a Scene snapshot', () => {
    useSpatialStore.setState({
      spatialEntities: {
        'player-1': { id: 'player-1', position: [0, 0, 0] },
      },
    });
    handler.handleEntityMove({ entityId: 'player-1', position: [10, 0, 0] });

    handler.handleScene({
      roomId: 'next-room',
      listenerId: 'player-1',
      entities: [{ id: 'player-1', position: [5, 5, 5] }],
      emitters: [],
    });
    step(600);

    expect(useSpatialStore.getState().spatialEntities['player-1'].position).toEqual([-5, 5, 5]);
  });

  it('updates listener position and orientation messages', () => {
    handler.handleListenerPosition({
      listenerId: 'player-1',
      position: [7, 8, 9],
    });
    handler.handleListenerOrientation({
      listenerId: 'player-1',
      forward: [0, 1, 0],
      up: [0, 0, 1],
    });

    const spatial = useSpatialStore.getState();
    expect(spatial.listenerEntityId).toBe('player-1');
    expect(spatial.listenerPosition).toEqual([-7, 9, 8]);
    expect(spatial.listenerOrientation).toEqual({
      forward: [0, 0, 1],
      up: [0, 1, 0],
    });
    expect(client.media.cacophony.listenerPosition).toEqual([-7, 9, 8]);
    expect(client.media.cacophony.listenerForwardOrientation).toEqual([0, 0, 1]);
    expect(client.media.cacophony.listenerUpOrientation).toEqual([0, 1, 0]);
  });

  it('resets cacophony listener state to defaults when a Scene omits listener vectors', () => {
    handler.handleScene({
      roomId: 'new-room',
      listenerId: 'player-1',
      entities: [],
      emitters: [],
    });

    expect(useSpatialStore.getState().listenerPosition).toBeNull();
    expect(useSpatialStore.getState().listenerOrientation).toEqual({
      forward: null,
      up: null,
    });
    expect(client.media.cacophony.listenerPosition).toEqual([0, 0, 0]);
    expect(client.media.cacophony.listenerForwardOrientation).toEqual([0, 0, -1]);
    expect(client.media.cacophony.listenerUpOrientation).toEqual([0, 1, 0]);
  });
});
