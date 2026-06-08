import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GMCPClientSpatial } from './Spatial';
import { useSpatialStore } from '../../stores/spatialStore';
import { useSessionStore } from '../../stores/sessionStore';

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
    emit: vi.fn(),
    gmcp: {
      send: vi.fn(),
    },
  };
}

describe('GMCPClientSpatial', () => {
  let client: ReturnType<typeof createMockClient>;
  let handler: GMCPClientSpatial;

  beforeEach(() => {
    vi.clearAllMocks();
    useSpatialStore.getState().reset();
    useSessionStore.getState().reset();
    client = createMockClient();
    handler = new GMCPClientSpatial(client as any);
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
    expect(spatial.listenerPosition).toEqual([1, 2, 3]);
    expect(spatial.listenerOrientation).toEqual({
      forward: [0, 1, 0],
      up: [0, 0, 1],
    });
    expect(client.media.cacophony.listenerPosition).toEqual([1, 2, 3]);
    expect(client.media.cacophony.listenerForwardOrientation).toEqual([0, 1, 0]);
    expect(client.media.cacophony.listenerUpOrientation).toEqual([0, 0, 1]);
    expect(spatial.spatialEntities).toEqual({
      'player-1': {
        id: 'player-1',
        name: 'Q',
        kind: 'player',
        position: [1, 2, 3],
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
    expect(client.emit).toHaveBeenCalledWith(
      'spatialScene',
      expect.objectContaining({ roomId: 'new-room', listenerId: 'player-1' }),
    );
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
      position: [4, 5, 6],
    });
    expect(client.emit).toHaveBeenCalledWith('spatialEntityEnter', {
      id: 'player-2',
      name: 'Daiverd',
      position: [4, 5, 6],
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
    expect(client.emit).toHaveBeenCalledWith('spatialEntityLeave', 'player-2');
  });

  it('updates stored coordinates and velocity on EntityMove', () => {
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

    expect(useSpatialStore.getState().spatialEntities['player-1']).toEqual({
      id: 'player-1',
      name: 'Q',
      kind: 'player',
      position: [2, 3, 4],
      velocity: [0.5, 0, 0],
      forward: [1, 0, 0],
      up: [0, 0, 1],
    });
    expect(client.emit).toHaveBeenCalledWith('spatialEntityMove', {
      id: 'player-1',
      name: 'Q',
      kind: 'player',
      position: [2, 3, 4],
      velocity: [0.5, 0, 0],
      forward: [1, 0, 0],
      up: [0, 0, 1],
    });
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
    expect(spatial.listenerPosition).toEqual([7, 8, 9]);
    expect(spatial.listenerOrientation).toEqual({
      forward: [0, 1, 0],
      up: [0, 0, 1],
    });
    expect(client.media.cacophony.listenerPosition).toEqual([7, 8, 9]);
    expect(client.media.cacophony.listenerForwardOrientation).toEqual([0, 1, 0]);
    expect(client.media.cacophony.listenerUpOrientation).toEqual([0, 0, 1]);
    expect(client.emit).toHaveBeenCalledWith('spatialListenerPosition', {
      listenerId: 'player-1',
      position: [7, 8, 9],
    });
    expect(client.emit).toHaveBeenCalledWith('spatialListenerOrientation', {
      listenerId: 'player-1',
      forward: [0, 1, 0],
      up: [0, 0, 1],
    });
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
