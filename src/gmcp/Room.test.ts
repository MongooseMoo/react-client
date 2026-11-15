import { beforeEach, describe, expect, it, vi } from "vitest";

import { sampleLayout } from "../map/roomLayout.fixture";
import { useRoomStore } from "../stores/roomStore";
import { GMCPClientSpatial } from "./Client/Spatial";
import { GMCPRoom, type GMCPMessageRoomInfo } from "./Room";

const info = (num: number) => ({ num, name: `Room ${num}`, area: "Area" }) as GMCPMessageRoomInfo;

function createMockClient() {
  return {
    gmcp: { send: vi.fn(), handlers: {} },
    media: { sceneChanged: vi.fn(), setListenerPosition: vi.fn(), setListenerOrientation: vi.fn() },
  };
}

describe("Room.Layout", () => {
  let client: ReturnType<typeof createMockClient>;
  let room: GMCPRoom;

  beforeEach(() => {
    useRoomStore.getState().reset();
    client = createMockClient();
    room = new GMCPRoom(client as never);
  });

  it("stores a received Room.Layout", () => {
    room.receive("Info", info(1234));
    expect(room.receive("Layout", sampleLayout())).toBe(true);
    expect(useRoomStore.getState().roomLayout).toEqual(sampleLayout());
  });

  it("keeps the layout when Room.Info repeats its room, and drops it for another room", () => {
    room.receive("Layout", sampleLayout());
    room.receive("Info", info(1234));
    expect(useRoomStore.getState().roomLayout?.num).toBe(1234);
    room.receive("Info", info(1235));
    expect(useRoomStore.getState().roomLayout).toBeNull();
  });

  it("is cleared by a reset", () => {
    room.receive("Layout", sampleLayout());
    room.reset();
    expect(useRoomStore.getState().roomLayout).toBeNull();
  });

  it("stops drawing a thing when Client.Spatial says it left", () => {
    room.receive("Layout", sampleLayout());
    const spatial = new GMCPClientSpatial(client as never);
    spatial.receive("EntityLeave", { entityId: "#5678" });
    expect(useRoomStore.getState().roomLayout?.things.map((thing) => thing.id)).toEqual(["#99"]);
  });
});
