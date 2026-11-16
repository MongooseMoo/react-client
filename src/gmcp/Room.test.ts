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

  it("keeps acoustic membership separate from the physical room", () => {
    room.receive("Layout", sampleLayout());
    const spatial = new GMCPClientSpatial(client as never);
    spatial.receive("EntityLeave", { entityId: "#5678" });
    spatial.receive("EntityEnter", { entity: { id: "#unseen", position: [0, 0, 0] } });
    expect(useRoomStore.getState().roomLayout).toEqual(sampleLayout());
  });

  const body = () => ({
    id: "#5678", lifetime: "thing-1",
    pose: { centre_m: [1, 1, 0.5], dimensions_m: [1, 1, 1], body_quaternion: [1, 0, 0, 0], box: true },
    shapes: [{ box: [[0.5, 1.5], [0.5, 1.5], [0, 1]] }],
    front: { axis: [0, -1, 0], yaw: 0, direction: "south" },
  } satisfies import("./Room").LayoutBody);

  function currentLayout() {
    const layout = sampleLayout();
    layout.room_lifetime = "room-1";
    layout.things = layout.things.map((thing) => ({ ...thing, lifetime: "thing-1" }));
    room.receive("Layout", layout);
    return layout;
  }

  it("applies body data only to an existing matching incarnation", () => {
    currentLayout();
    const changed = body();
    room.receive("LayoutUpdate", { num: 1234, room_lifetime: "room-1", bodies: [changed] });
    const actual = useRoomStore.getState().roomLayout?.things.find((thing) => thing.id === "#5678");
    expect(actual?.pose).toEqual(changed.pose);
    expect(actual?.shapes).toEqual(changed.shapes);
    expect(actual?.front).toEqual(changed.front);
    const kept = useRoomStore.getState().roomLayout;
    room.receive("LayoutUpdate", { num: 1234, room_lifetime: "room-1", bodies: [{ ...changed, lifetime: "replacement" }, { ...changed, id: "#new" }] });
    expect(useRoomStore.getState().roomLayout).toBe(kept);
  });

  it("rejects other rooms and old room incarnations", () => {
    const layout = currentLayout();
    room.receive("LayoutUpdate", { num: 999, room_lifetime: "room-1", bodies: [body()] });
    room.receive("LayoutUpdate", { num: 1234, room_lifetime: "old-room", bodies: [body()] });
    room.receive("Info", info(999));
    room.receive("Layout", layout);
    expect(useRoomStore.getState().roomLayout).toBeNull();
  });

  it("keeps the last valid scene when a body update is malformed", () => {
    const layout = currentLayout();
    const valid = body();
    for (const invalid of [
      { ...valid, pose: { ...valid.pose, centre_m: [NaN, 0, 0] } },
      { ...valid, pose: { ...valid.pose, body_quaternion: [0, 0, 0, 0] } },
      { ...valid, shapes: [{ box: [[2, 1], [0, 1], [0, 1]] }] },
    ]) room.receive("LayoutUpdate", { num: 1234, room_lifetime: "room-1", bodies: [invalid] });
    expect(useRoomStore.getState().roomLayout).toEqual(layout);
  });
});
