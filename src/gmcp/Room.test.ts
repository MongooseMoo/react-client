import { beforeEach, describe, expect, it, vi } from "vitest";

import { sampleLayout } from "../map/roomLayout.fixture";
import nativeFront from "../map/roomLayout.native-front.sample.json";
import fittedDesk from "../map/roomLayout.fitted-desk.sample.json";
import trestle from "../map/roomLayout.trestle.sample.json";
import { useRoomStore } from "../stores/roomStore";
import { GMCPClientSpatial } from "./Client/Spatial";
import { GMCPRoom, type GMCPMessageRoomInfo, partMaterial } from "./Room";

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

  it("accepts the office trestle from the wire and rejects malformed role and basis updates", () => {
    const layout = { ...sampleLayout(), room_lifetime: "office", things: [trestle] };
    room.receive("Layout", layout);
    const boxes = () => useRoomStore.getState().roomLayout?.things[0].form_parts;
    expect(boxes()).toEqual(trestle.form_parts);
    const update = (part: unknown) => room.receive("LayoutUpdate", {
      num: layout.num, room_lifetime: layout.room_lifetime, bodies: [{ ...trestle, form_parts: [part] }],
    });
    update({ ...trestle.form_parts[0], role: "slab\nlook" });
    expect(boxes()).toEqual(trestle.form_parts);
    update({ ...trestle.form_parts[0], basis: [[1, 0, 0], [0, 0, 0], [0, 0, 1]] });
    expect(boxes()).toEqual(trestle.form_parts);
    update(trestle.form_parts[1]);
    expect(boxes()).toEqual([trestle.form_parts[1]]);
  });

  it("accepts every part shape with its own fields and drops a list holding a part it cannot draw", () => {
    const base = { center: [0, 0, 0], size: [0.1, 0.1, 0.2] };
    const good = [
      { ...base, shape: "box", wall: [0.01, 0.01, 0.01] },
      { ...base, shape: "cylinder", wall: [0.005, 0.005, 0.01] },
      { ...base, shape: "sphere" },
      { ...base, shape: "capsule", wall: [0.01, 0.01, 0.02] },
      { ...base, shape: "cone", top: 0 },
      { ...base, shape: "lathe", profile: [[0.5, 0], [1, 0.4], [0.3, 1]] },
    ];
    const parts = (form_parts: unknown[]) => {
      room.receive("Layout", { ...sampleLayout(), things: [{ ...trestle, form_parts }] });
      return useRoomStore.getState().roomLayout?.things[0].form_parts;
    };
    expect(parts(good)).toEqual(good);
    for (const bad of [
      { ...base },
      { ...base, shape: "torus" },
      { ...base, shape: "cone" },
      { ...base, shape: "cone", top: 1.5 },
      { ...base, shape: "lathe", profile: [[0.5, 0]] },
      { ...base, shape: "lathe", profile: [[2, 0], [1, 1]] },
      { ...base, shape: "cylinder", wall: [0.05, 0.01, 0.01] },
      { ...base, shape: "box", wall: [0.01, 0.01, 0.2] },
      // A closed shell needs room for its wall at both ends.
      { ...base, shape: "sphere", wall: [0.01, 0.01, 0.1] },
    ]) expect(parts([good[0], bad])).toBeUndefined();
    const door = { ...base, shape: "box", joint: { type: "hinge", axis: [0, 0, 1], origin: [0.05, 0, 0], range: [0, 1.6], position: 0.4 } };
    const drawer = { ...base, shape: "box", joint: { type: "slide", axis: [0, -1, 0], range: [0, 0.3], position: 0.3 } };
    expect(parts([door, drawer])).toEqual([door, drawer]);
    for (const joint of [
      { ...door.joint, type: "ball" },
      { ...door.joint, axis: [0, 0, 2] },
      { ...door.joint, origin: undefined },
      { ...door.joint, range: [1.6, 0] },
      { ...door.joint, position: 2 },
      { ...drawer.joint, position: undefined },
    ]) expect(parts([door, { ...base, shape: "box", joint }])).toBeUndefined();
    // The old spelling is not read.
    room.receive("Layout", { ...sampleLayout(), things: [{ ...trestle, form_parts: undefined, form_boxes: trestle.form_parts }] });
    expect(useRoomStore.getState().roomLayout?.things[0].form_parts).toBeUndefined();
  });

  it("reads a part's material, and keeps a part whose material is malformed, drawn without it", () => {
    const base = { center: [0, 0, 0], size: [0.1, 0.1, 0.2], shape: "box" };
    const steel = { ...base, material: { species: "steel", family: "metal" } };
    const malformed = [
      { ...base, material: "steel" },
      { ...base, material: { species: "steel" } },
      { ...base, material: { species: "", family: "metal" } },
      { ...base, material: { species: "steel", family: 3 } },
      { ...base, material: ["steel", "metal"] },
      { ...base, material: null },
    ];
    room.receive("Layout", { ...sampleLayout(), things: [{ ...trestle, form_parts: [steel, ...malformed, base] }] });
    const parts = useRoomStore.getState().roomLayout?.things[0].form_parts ?? [];
    // Every part is kept: a malformed material never drops the list.
    expect(parts).toHaveLength(malformed.length + 2);
    expect(partMaterial(parts[0])).toEqual({ species: "steel", family: "metal" });
    for (const part of parts.slice(1)) expect(partMaterial(part)).toBeUndefined();
    // "energy field" is a family the game has, with a space in its name.
    expect(partMaterial({ ...base, shape: "box", center: [0, 0, 0], size: [1, 1, 1], material: { species: "energy field", family: "energy field" } }))
      .toEqual({ species: "energy field", family: "energy field" });
  });

  it("refreshes and clears fitted parts on native body updates for the same host incarnation", () => {
    const layout = { ...sampleLayout(), room_lifetime: "current-room",
      things: [{ ...fittedDesk, name: "a wooden desk", kind: "object", mounted: false, fixed: false }] };
    room.receive("Layout", layout);
    const fittingBoxes = () => useRoomStore.getState().roomLayout?.things[0].form_parts;
    expect(fittingBoxes()).toEqual(fittedDesk.form_parts);
    const update = (body: unknown) => room.receive("LayoutUpdate",
      { num: layout.num, room_lifetime: layout.room_lifetime, bodies: [body] });
    const { form_parts, ...bare } = fittedDesk;
    update({ ...bare, lifetime: "recycled" });
    expect(fittingBoxes()).toEqual(form_parts);
    update(bare);
    expect(fittingBoxes()).toBeUndefined();
    update(fittedDesk);
    expect(fittingBoxes()).toEqual(form_parts);
  });

  it("accepts the real MOO front/pose/finish projection and matching physical updates", () => {
    room.receive("Layout", nativeFront);
    const actual = useRoomStore.getState().roomLayout;
    const chair = actual?.things[0];
    expect(actual?.finishes).toEqual({ floor: "oak", wall: "drywall", ceiling: "drywall" });
    expect(chair?.front?.direction).toBe("north");
    expect(chair?.pose?.dimensions_m).toEqual([0.6, 0.6, 0.65]);
    if (!chair?.pose || !actual) throw new Error("missing native physical record");
    room.receive("LayoutUpdate", { num: actual.num, room_lifetime: actual.room_lifetime,
      bodies: [{ id: chair.id, lifetime: chair.lifetime, pose: chair.pose, shapes: chair.shapes, front: chair.front }] });
    expect(useRoomStore.getState().roomLayout?.things[0].pose).toEqual(chair.pose);
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
