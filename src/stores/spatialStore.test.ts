import { beforeEach, describe, expect, it } from "vitest";

import { useSpatialStore } from "./spatialStore";
import type { SpatialEntity } from "../gmcp/Client/Spatial";

const entity = (id: string, position: [number, number, number]): SpatialEntity => ({
  id,
  position,
});

describe("spatialStore", () => {
  beforeEach(() => {
    useSpatialStore.getState().reset();
  });

  it("starts empty", () => {
    const state = useSpatialStore.getState();
    expect(state.spatialEntities).toEqual({});
    expect(state.spatialEmitters).toEqual({});
    expect(state.listenerEntityId).toBe("");
    expect(state.listenerPosition).toBeNull();
    expect(state.listenerOrientation).toEqual({ forward: null, up: null });
  });

  it("setScene replaces the whole scene", () => {
    useSpatialStore.setState({ spatialEntities: { stale: entity("stale", [9, 9, 9]) } });
    useSpatialStore.getState().setScene({
      listenerEntityId: "p1",
      listenerPosition: [1, 2, 3],
      listenerOrientation: { forward: [0, 1, 0], up: [0, 0, 1] },
      spatialEntities: { p1: entity("p1", [1, 2, 3]) },
      spatialEmitters: {},
    });

    const state = useSpatialStore.getState();
    expect(state.listenerEntityId).toBe("p1");
    expect(Object.keys(state.spatialEntities)).toEqual(["p1"]);
  });

  it("enterEntity adds without mutating the previous map", () => {
    const before = useSpatialStore.getState().spatialEntities;
    useSpatialStore.getState().enterEntity(entity("p2", [4, 5, 6]));

    expect(useSpatialStore.getState().spatialEntities.p2).toEqual(entity("p2", [4, 5, 6]));
    expect(before).toEqual({}); // previous reference untouched (immutable update)
  });

  it("leaveEntity removes the entity and emitters bound to it", () => {
    useSpatialStore.setState({
      spatialEntities: { p2: entity("p2", [4, 5, 6]) },
      spatialEmitters: {
        "radio-1": { id: "radio-1", binding: "entity", sourceEntity: "p2" },
        "drip-1": { id: "drip-1", binding: "world" },
      },
    });
    useSpatialStore.getState().leaveEntity("p2");

    const state = useSpatialStore.getState();
    expect(state.spatialEntities).toEqual({});
    expect(Object.keys(state.spatialEmitters)).toEqual(["drip-1"]);
  });

  it("moveEntity merges coordinates and velocity onto the existing entity", () => {
    useSpatialStore.setState({
      spatialEntities: { p1: { id: "p1", name: "Q", position: [1, 1, 1] } },
    });
    useSpatialStore.getState().moveEntity({
      entityId: "p1",
      position: [2, 3, 4],
      velocity: [0.5, 0, 0],
    });

    expect(useSpatialStore.getState().spatialEntities.p1).toEqual({
      id: "p1",
      name: "Q",
      position: [2, 3, 4],
      velocity: [0.5, 0, 0],
    });
  });

  it("setListenerPosition keeps the existing entity id when none is given", () => {
    useSpatialStore.setState({ listenerEntityId: "p1" });
    useSpatialStore.getState().setListenerPosition([7, 8, 9]);

    const state = useSpatialStore.getState();
    expect(state.listenerEntityId).toBe("p1");
    expect(state.listenerPosition).toEqual([7, 8, 9]);
  });

  it("startEmitter and stopEmitter add and remove by id", () => {
    useSpatialStore.getState().startEmitter({ id: "e1", binding: "world" });
    expect(useSpatialStore.getState().spatialEmitters.e1).toBeTruthy();

    useSpatialStore.getState().stopEmitter("e1");
    expect(useSpatialStore.getState().spatialEmitters.e1).toBeUndefined();
  });

  it("reset clears the scene", () => {
    useSpatialStore.setState({
      spatialEntities: { p1: entity("p1", [1, 2, 3]) },
      listenerEntityId: "p1",
      listenerPosition: [1, 2, 3],
    });
    useSpatialStore.getState().reset();

    const state = useSpatialStore.getState();
    expect(state.spatialEntities).toEqual({});
    expect(state.listenerEntityId).toBe("");
    expect(state.listenerPosition).toBeNull();
  });
});
