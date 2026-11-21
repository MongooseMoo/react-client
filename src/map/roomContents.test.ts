import { describe, expect, it } from "vitest";

import type { Item } from "../gmcp/Char/Items";
import type { LayoutThing, RoomLayout } from "../gmcp/Room";
import { roomContents } from "./roomContents";

const thing = (id: string, name: string, more: Partial<LayoutThing> = {}): LayoutThing => ({
  id, name, kind: "object", fixed: false, mounted: false, shapes: [{ box: [[-0.5, 0.5], [-0.3, 0.3], [0, 0.45]] }], ...more,
});

/** A sitting room: a low table with a radio and a plate on it, four biscuits on the plate, Ann, a cat that is a person, and you. */
const sittingRoom = (): RoomLayout => ({
  num: 7,
  size: [5, 4, 2.5],
  exits: [],
  things: [
    thing("#10", "low table", { classes: ["table"], material: [{ species: "wood", fraction: 1 }] }),
    thing("#11", "portable radio", { relation: { kind: "on", target: "#10", text: "on the low table" } }),
    thing("#12", "plate", { relation: { kind: "on", target: "#10", text: "on the low table" } }),
    ...[1, 2, 3, 4].map((n) => thing(`#2${n}`, "biscuit", { relation: { kind: "on", target: "#12", text: "on the plate" } })),
    thing("#30", "Ann", { kind: "player", appearance: { label: "the red-haired woman" } }),
    thing("#31", "tabby cat", { kind: "person", relation: { kind: "on", target: "#10", text: "on the low table" } }),
    thing("#99", "Ondine", { kind: "player" }),
  ],
});

const items: Item[] = [
  { id: "#11", name: "portable radio", verbs: [["pause", "#11"]] },
  { id: "#10", name: "low table" },
  { id: "#12", name: "plate" },
  { id: "#40", name: "a draught" },
  { id: "#30", name: "Ann", verbs: [["wave", "#30"]] },
  { id: "#31", name: "tabby cat", verbs: [["pet", "#31"]] },
];

describe("roomContents", () => {
  it("joins the room's items and its layout by id into one list of things, each once, with where it is", () => {
    const { things } = roomContents(items, [], sittingRoom(), "#99");
    expect(things.map((entry) => [entry.id, entry.name, entry.where])).toEqual([
      ["#11", "portable radio", "on the low table"],
      ["#10", "low table", "midway between the north and south walls, midway between the east and west walls"],
      ["#12", "plate", "on the low table"],
      ["#40", "a draught", ""],
      ["#21", "biscuit", "on the plate"],
      ["#22", "biscuit", "on the plate"],
      ["#23", "biscuit", "on the plate"],
      ["#24", "biscuit", "on the plate"],
    ]);
    const radio = things[0];
    expect(radio.item?.verbs).toEqual([["pause", "#11"]]);
    expect(radio.thing?.id).toBe("#11");
    expect(things[3].thing).toBeUndefined();
    expect(things[4].item).toBeUndefined();
  });

  it("lists people by the layout's kind, joined by id, with the Room.Players entry for those who are players", () => {
    const { people, things } = roomContents(items, [{ name: "ann", fullname: "Ann" }], sittingRoom(), "#99");
    expect(people.map((entry) => [entry.id, entry.name, entry.where])).toEqual([
      ["#30", "Ann", "midway between the north and south walls, midway between the east and west walls"],
      ["#99", "Ondine (you)", "midway between the north and south walls, midway between the east and west walls"],
      ["#31", "tabby cat", "on the low table"],
    ]);
    expect(people[0].player).toEqual({ name: "ann", fullname: "Ann" });
    expect(people[0].item?.id).toBe("#30");
    expect(people[0].thing?.appearance).toEqual({ label: "the red-haired woman" });
    expect(people[2].player).toBeUndefined();
    expect(people[2].item?.verbs).toEqual([["pet", "#31"]]);
    expect(things.some((entry) => ["#30", "#31", "#99"].includes(entry.id))).toBe(false);
  });

  it("with no layout, tells players from things by name as before, and still gives each its item id", () => {
    const { people, things } = roomContents(
      [{ id: "#11", name: "portable radio" }, { id: "#30", name: "Ann" }],
      [{ name: "ann", fullname: "Ann" }, { name: "zed", fullname: "Zed the Unseen" }],
      null,
      "#99",
    );
    expect(things.map((entry) => entry.id)).toEqual(["#11"]);
    expect(people.map((entry) => [entry.id, entry.name, entry.where])).toEqual([["#30", "Ann", ""], ["zed", "Zed the Unseen", ""]]);
    expect(people[1].player?.name).toBe("zed");
    expect(people[1].item).toBeUndefined();
  });

  it("lists a player the layout does not hold, and removes colour markup from names", () => {
    const { people } = roomContents([{ id: "#50", name: "[red]Zed" }], [{ name: "zed", fullname: "Zed" }], sittingRoom(), "#99");
    expect(people.map((entry) => entry.name)).toContain("Zed");
    expect(people.find((entry) => entry.name === "Zed")?.id).toBe("#50");
  });
});
