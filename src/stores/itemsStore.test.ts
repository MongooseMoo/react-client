import { beforeEach, describe, expect, it } from "vitest";

import type { RoomLayout } from "../gmcp/Room";
import { useItemsStore } from "./itemsStore";
import { useRoomStore } from "./roomStore";

const layout = (num: number, things: Array<{ id: string; lifetime?: string }>): RoomLayout => ({
  num,
  room_lifetime: "room-life",
  size: [4, 4, 2.5],
  exits: [],
  things: things.map((thing) => ({ ...thing, name: thing.id, kind: "object", fixed: false, mounted: false, shapes: [] })),
});

const info = (num: number) => ({ num, name: `Room ${num}`, area: "Test" });

describe("itemsStore selection", () => {
  beforeEach(() => {
    useItemsStore.getState().reset();
    useRoomStore.getState().reset();
  });

  it("holds one selected target, with the layout's lifetime when the thing is in the layout", () => {
    useRoomStore.getState().setRoomInfo(info(1));
    useRoomStore.getState().setRoomLayout(layout(1, [{ id: "#7", lifetime: "radio-life" }]));
    useItemsStore.getState().setLocationItems("room", [{ id: "#7", name: "radio" }, { id: "#8", name: "note" }]);

    useItemsStore.getState().select("#7");
    expect(useItemsStore.getState().selected).toEqual({ id: "#7", lifetime: "radio-life" });
    useItemsStore.getState().select("#8");
    expect(useItemsStore.getState().selected).toEqual({ id: "#8" });
    useItemsStore.getState().select(null);
    expect(useItemsStore.getState().selected).toBeNull();
  });

  it("clears when the selected thing leaves its list", () => {
    useItemsStore.getState().setLocationItems("room", [{ id: "#7", name: "radio" }, { id: "#8", name: "note" }]);
    useItemsStore.getState().select("#7");
    useItemsStore.getState().removeItem("room", { id: "#8", name: "note" });
    expect(useItemsStore.getState().selected?.id).toBe("#7");
    useItemsStore.getState().removeItem("room", { id: "#7", name: "radio" });
    expect(useItemsStore.getState().selected).toBeNull();

    useItemsStore.getState().setLocationItems("room", [{ id: "#7", name: "radio" }]);
    useItemsStore.getState().select("#7");
    useItemsStore.getState().setLocationItems("room", [{ id: "#9", name: "lamp" }]);
    expect(useItemsStore.getState().selected).toBeNull();
  });

  it("keeps a thing that is only in the layout, until the layout drops it or its lifetime changes", () => {
    useRoomStore.getState().setRoomInfo(info(1));
    useRoomStore.getState().setRoomLayout(layout(1, [{ id: "#20", lifetime: "biscuit-life" }]));
    useItemsStore.getState().select("#20");
    useItemsStore.getState().setLocationItems("room", [{ id: "#7", name: "radio" }]);
    expect(useItemsStore.getState().selected).toEqual({ id: "#20", lifetime: "biscuit-life" });

    useRoomStore.getState().setRoomLayout(layout(1, [{ id: "#20", lifetime: "another-life" }]));
    expect(useItemsStore.getState().selected).toBeNull();

    useItemsStore.getState().select("#20");
    useRoomStore.getState().setRoomLayout(layout(1, []));
    expect(useItemsStore.getState().selected).toBeNull();
  });

  it("clears a room thing when the room changes, and keeps something carried", () => {
    useRoomStore.getState().setRoomInfo(info(1));
    useItemsStore.getState().setLocationItems("room", [{ id: "#7", name: "radio" }]);
    useItemsStore.getState().setLocationItems("inv", [{ id: "#3", name: "key" }]);
    useItemsStore.getState().select("#7");
    useRoomStore.getState().setRoomInfo(info(2));
    expect(useItemsStore.getState().selected).toBeNull();

    useItemsStore.getState().select("#3");
    useRoomStore.getState().setRoomInfo(info(3));
    expect(useItemsStore.getState().selected).toEqual({ id: "#3" });
  });

  it("keeps a player known only from Room.Players, by name, while they are here", () => {
    useRoomStore.getState().setRoomInfo(info(1));
    useRoomStore.getState().setRoomPlayers([{ name: "marlow", fullname: "Marlow" }]);
    useItemsStore.getState().select("marlow");
    expect(useItemsStore.getState().selected).toEqual({ id: "marlow" });
    useRoomStore.getState().removePlayer("marlow");
    expect(useItemsStore.getState().selected).toBeNull();
  });

  it("refuses to select what is not here, and selecting sends nothing anywhere", () => {
    useItemsStore.getState().setLocationItems("room", [{ id: "#7", name: "radio" }]);
    useItemsStore.getState().select("#404");
    expect(useItemsStore.getState().selected).toBeNull();
  });
});
