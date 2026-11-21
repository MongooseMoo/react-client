import { beforeEach, describe, expect, it } from "vitest";

import { boundNameIds, selectFirstHere } from "./boundNames";
import type { LayoutThing } from "./gmcp/Room";
import { useItemsStore } from "./stores/itemsStore";
import { useRoomStore } from "./stores/roomStore";

const thing = (id: string, name: string, more: Partial<LayoutThing> = {}): LayoutThing => ({
  id, name, kind: "object", fixed: false, mounted: false, lifetime: `${id}-life`,
  shapes: [{ box: [[-0.5, 0.5], [-0.3, 0.3], [0, 0.45]] }], ...more,
});

/** A sitting room: a radio in the item list and the layout, biscuits only in the layout, Ann, and a key you carry. */
function sittingRoom() {
  useRoomStore.getState().setRoomInfo({ num: 7, name: "Sitting room", exits: {} });
  useRoomStore.getState().setRoomLayout({
    num: 7, size: [5, 4, 2.5], exits: [],
    things: [thing("#11", "portable radio"), thing("#21", "biscuit"), thing("#22", "biscuit"), thing("#30", "Ann", { kind: "player" })],
  });
  useItemsStore.getState().setLocationItems("room", [{ id: "#11", name: "portable radio" }, { id: "#40", name: "a draught" }, { id: "#30", name: "Ann" }]);
  useItemsStore.getState().setLocationItems("inv", [{ id: "#50", name: "brass key" }]);
}

const selected = () => useItemsStore.getState().selected?.id ?? null;

beforeEach(() => {
  useItemsStore.getState().reset();
  useRoomStore.getState().reset();
});

describe("boundNameIds", () => {
  it("reads the ids of a bound name in order", () => {
    expect(boundNameIds("#29612")).toEqual(["#29612"]);
    expect(boundNameIds("#29612 #29613 #29614")).toEqual(["#29612", "#29613", "#29614"]);
    expect(boundNameIds("")).toEqual([]);
    expect(boundNameIds(undefined)).toEqual([]);
  });
});

describe("selectFirstHere", () => {
  it("selects a thing in the room's item list and says the Things list holds it", () => {
    sittingRoom();
    expect(selectFirstHere(["#11"])).toBe("things");
    expect(selected()).toBe("#11");
  });

  it("selects a thing only the layout holds", () => {
    sittingRoom();
    expect(selectFirstHere(["#21", "#22"])).toBe("things");
    expect(selected()).toBe("#21");
  });

  it("selects an item only the room's list holds, in a room with no layout", () => {
    useRoomStore.getState().setRoomInfo({ num: 8, name: "Cellar", exits: {} });
    useItemsStore.getState().setLocationItems("room", [{ id: "#40", name: "a draught" }]);
    expect(selectFirstHere(["#40"])).toBe("things");
    expect(selected()).toBe("#40");
  });

  it("passes over ids that have gone and selects the first that is here", () => {
    sittingRoom();
    expect(selectFirstHere(["#20", "#22", "#21"])).toBe("things");
    expect(selected()).toBe("#22");
  });

  it("says the People list holds a person", () => {
    sittingRoom();
    expect(selectFirstHere(["#30"])).toBe("people");
    expect(selected()).toBe("#30");
  });

  it("says the Inventory list holds a thing you carry", () => {
    sittingRoom();
    expect(selectFirstHere(["#50"])).toBe("inventory");
    expect(selected()).toBe("#50");
  });

  it("selects nothing, and keeps the selection there was, when none of the ids is here", () => {
    sittingRoom();
    useItemsStore.getState().select("#11");
    expect(selectFirstHere(["#20", "#77"])).toBeNull();
    expect(selectFirstHere([])).toBeNull();
    expect(selected()).toBe("#11");
  });

  it("no longer finds a thing once Room.Info names another room", () => {
    sittingRoom();
    useRoomStore.getState().setRoomInfo({ num: 9, name: "Hall", exits: {} });
    useItemsStore.getState().setLocationItems("room", []);
    expect(selectFirstHere(["#21", "#11"])).toBeNull();
    expect(selected()).toBeNull();
  });
});
