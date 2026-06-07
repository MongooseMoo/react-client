import { create } from "zustand";
import type {
  SpatialEmitter,
  SpatialEntity,
  SpatialListenerOrientation,
  SpatialVector,
} from "../gmcp/Client/Spatial";

/**
 * Spatial-audio scene state: the entities and emitters in the scene and the
 * listener's pose. Previously a mutable bag on client.worldData mutated in
 * place by the GMCP Client.Spatial handler. The handler now writes here via
 * getState() (immutable updates); the LiveKit audio bridge reads entity
 * positions via getState(). Cacophony listener sync and the spatial* client
 * events stay in the handler — the events are re-sync notifications for the
 * imperative Web Audio consumers, not a competing source of truth.
 */
interface MovedEntity {
  entityId: string;
  position: SpatialVector;
  velocity?: SpatialVector;
  forward?: SpatialVector;
  up?: SpatialVector;
}

interface SpatialState {
  spatialEntities: Record<string, SpatialEntity>;
  spatialEmitters: Record<string, SpatialEmitter>;
  listenerEntityId: string;
  listenerPosition: SpatialVector | null;
  listenerOrientation: SpatialListenerOrientation;
  setScene: (scene: {
    listenerEntityId: string;
    listenerPosition: SpatialVector | null;
    listenerOrientation: SpatialListenerOrientation;
    spatialEntities: Record<string, SpatialEntity>;
    spatialEmitters: Record<string, SpatialEmitter>;
  }) => void;
  enterEntity: (entity: SpatialEntity) => void;
  leaveEntity: (entityId: string) => void;
  moveEntity: (data: MovedEntity) => void;
  setListenerPosition: (position: SpatialVector, listenerId?: string) => void;
  setListenerOrientation: (
    orientation: SpatialListenerOrientation,
    listenerId?: string
  ) => void;
  startEmitter: (emitter: SpatialEmitter) => void;
  stopEmitter: (emitterId: string) => void;
  reset: () => void;
}

const emptyScene = {
  spatialEntities: {} as Record<string, SpatialEntity>,
  spatialEmitters: {} as Record<string, SpatialEmitter>,
  listenerEntityId: "",
  listenerPosition: null as SpatialVector | null,
  listenerOrientation: { forward: null, up: null } as SpatialListenerOrientation,
};

export const useSpatialStore = create<SpatialState>((set) => ({
  ...emptyScene,
  setScene: (scene) => set({ ...scene }),
  enterEntity: (entity) =>
    set((state) => ({
      spatialEntities: { ...state.spatialEntities, [entity.id]: entity },
    })),
  leaveEntity: (entityId) =>
    set((state) => {
      const spatialEntities = { ...state.spatialEntities };
      delete spatialEntities[entityId];
      const spatialEmitters = Object.fromEntries(
        Object.entries(state.spatialEmitters).filter(
          ([, emitter]) => emitter.sourceEntity !== entityId
        )
      );
      return { spatialEntities, spatialEmitters };
    }),
  moveEntity: (data) =>
    set((state) => {
      const current = state.spatialEntities[data.entityId];
      return {
        spatialEntities: {
          ...state.spatialEntities,
          [data.entityId]: {
            ...current,
            id: data.entityId,
            position: data.position,
            velocity: data.velocity ?? current?.velocity,
            forward: data.forward ?? current?.forward,
            up: data.up ?? current?.up,
          },
        },
      };
    }),
  setListenerPosition: (position, listenerId) =>
    set((state) => ({
      listenerPosition: position,
      listenerEntityId: listenerId ?? state.listenerEntityId,
    })),
  setListenerOrientation: (orientation, listenerId) =>
    set((state) => ({
      listenerOrientation: orientation,
      listenerEntityId: listenerId ?? state.listenerEntityId,
    })),
  startEmitter: (emitter) =>
    set((state) => ({
      spatialEmitters: { ...state.spatialEmitters, [emitter.id]: emitter },
    })),
  stopEmitter: (emitterId) =>
    set((state) => {
      const spatialEmitters = { ...state.spatialEmitters };
      delete spatialEmitters[emitterId];
      return { spatialEmitters };
    }),
  reset: () => set({ ...emptyScene }),
}));
