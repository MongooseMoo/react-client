import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  GMCPClientSpatial,
  type SpatialEmitter,
  type SpatialEntity,
} from "./Spatial";

function createMockClient() {
  return {
    emit: vi.fn(),
    sendGmcp: vi.fn(),
    worldData: {
      liveKitTokens: [],
      playerId: "",
      playerName: "",
      roomId: "",
      roomPlayers: [],
      spatialEntities: {} as Record<string, SpatialEntity>,
      spatialEmitters: {} as Record<string, SpatialEmitter>,
      listenerEntityId: "",
      listenerPosition: null,
      listenerOrientation: { forward: null, up: null },
    },
  };
}

describe("GMCPClientSpatial", () => {
  let client: ReturnType<typeof createMockClient>;
  let handler: GMCPClientSpatial;

  beforeEach(() => {
    vi.clearAllMocks();
    client = createMockClient();
    handler = new GMCPClientSpatial(client as any);
  });

  it("replaces stale scene state on Scene snapshot", () => {
    client.worldData.roomId = "old-room";
    client.worldData.listenerEntityId = "old-listener";
    client.worldData.spatialEntities = {
      stale: {
        id: "stale",
        position: [9, 9, 9],
      },
    };
    client.worldData.spatialEmitters = {
      "old-emitter": {
        id: "old-emitter",
        binding: "world",
      },
    };

    handler.handleScene({
      roomId: "new-room",
      listenerId: "player-1",
      listenerPosition: [1, 2, 3],
      listenerOrientation: {
        forward: [0, 1, 0],
        up: [0, 0, 1],
      },
      entities: [
        {
          id: "player-1",
          name: "Q",
          kind: "player",
          position: [1, 2, 3],
        },
      ],
      emitters: [
        {
          id: "radio-1",
          binding: "entity",
          sourceEntity: "player-1",
          mediaKey: "radio-1",
        },
      ],
    });

    expect(client.worldData.roomId).toBe("new-room");
    expect(client.worldData.listenerEntityId).toBe("player-1");
    expect(client.worldData.listenerPosition).toEqual([1, 2, 3]);
    expect(client.worldData.listenerOrientation).toEqual({
      forward: [0, 1, 0],
      up: [0, 0, 1],
    });
    expect(client.worldData.spatialEntities).toEqual({
      "player-1": {
        id: "player-1",
        name: "Q",
        kind: "player",
        position: [1, 2, 3],
      },
    });
    expect(client.worldData.spatialEmitters).toEqual({
      "radio-1": {
        id: "radio-1",
        binding: "entity",
        sourceEntity: "player-1",
        mediaKey: "radio-1",
      },
    });
    expect(client.emit).toHaveBeenCalledWith(
      "spatialScene",
      expect.objectContaining({ roomId: "new-room", listenerId: "player-1" }),
    );
  });

  it("adds one entity on EntityEnter", () => {
    handler.handleEntityEnter({
      entity: {
        id: "player-2",
        name: "Daiverd",
        position: [4, 5, 6],
      },
    });

    expect(client.worldData.spatialEntities["player-2"]).toEqual({
      id: "player-2",
      name: "Daiverd",
      position: [4, 5, 6],
    });
    expect(client.emit).toHaveBeenCalledWith("spatialEntityEnter", {
      id: "player-2",
      name: "Daiverd",
      position: [4, 5, 6],
    });
  });

  it("removes an entity and its bound emitters on EntityLeave", () => {
    client.worldData.spatialEntities = {
      "player-2": {
        id: "player-2",
        position: [4, 5, 6],
      },
    };
    client.worldData.spatialEmitters = {
      "radio-1": {
        id: "radio-1",
        binding: "entity",
        sourceEntity: "player-2",
      },
      "drip-1": {
        id: "drip-1",
        binding: "world",
      },
    };

    handler.handleEntityLeave({ entityId: "player-2" });

    expect(client.worldData.spatialEntities).toEqual({});
    expect(client.worldData.spatialEmitters).toEqual({
      "drip-1": {
        id: "drip-1",
        binding: "world",
      },
    });
    expect(client.emit).toHaveBeenCalledWith("spatialEntityLeave", "player-2");
  });

  it("updates stored coordinates and velocity on EntityMove", () => {
    client.worldData.spatialEntities = {
      "player-1": {
        id: "player-1",
        name: "Q",
        kind: "player",
        position: [1, 1, 1],
      },
    };

    handler.handleEntityMove({
      entityId: "player-1",
      position: [2, 3, 4],
      velocity: [0.5, 0, 0],
      forward: [1, 0, 0],
      up: [0, 0, 1],
    });

    expect(client.worldData.spatialEntities["player-1"]).toEqual({
      id: "player-1",
      name: "Q",
      kind: "player",
      position: [2, 3, 4],
      velocity: [0.5, 0, 0],
      forward: [1, 0, 0],
      up: [0, 0, 1],
    });
    expect(client.emit).toHaveBeenCalledWith("spatialEntityMove", {
      id: "player-1",
      name: "Q",
      kind: "player",
      position: [2, 3, 4],
      velocity: [0.5, 0, 0],
      forward: [1, 0, 0],
      up: [0, 0, 1],
    });
  });

  it("updates listener position and orientation messages", () => {
    handler.handleListenerPosition({
      listenerId: "player-1",
      position: [7, 8, 9],
    });
    handler.handleListenerOrientation({
      listenerId: "player-1",
      forward: [0, 1, 0],
      up: [0, 0, 1],
    });

    expect(client.worldData.listenerEntityId).toBe("player-1");
    expect(client.worldData.listenerPosition).toEqual([7, 8, 9]);
    expect(client.worldData.listenerOrientation).toEqual({
      forward: [0, 1, 0],
      up: [0, 0, 1],
    });
    expect(client.emit).toHaveBeenCalledWith("spatialListenerPosition", {
      listenerId: "player-1",
      position: [7, 8, 9],
    });
    expect(client.emit).toHaveBeenCalledWith("spatialListenerOrientation", {
      listenerId: "player-1",
      forward: [0, 1, 0],
      up: [0, 0, 1],
    });
  });
});
