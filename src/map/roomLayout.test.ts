import { describe, expect, it } from "vitest";

import type { RoomLayout } from "../gmcp/Room";
import { livingRoomLayout, sampleLayout, translateLayoutThing } from "./roomLayout.fixture";
import laundry from "./roomLayout.sample-1770.json";
import livingSample from "./roomLayout.sample-25828.json";
import {
  type Bounds,
  labelOrder,
  mainMaterial,
  namedWithKind,
  nearestWall,
  thingForm,
  describeExit,
  describePlace,
  describeThing,
  displayName,
  exitWall,
  layoutPersonNamed,
  layoutSummary,
  placeLabels,
  placeLabelsOver,
  placeThings,
  shortLabel,
  scaleBarLength,
  shapeFootprint,
  toSvg,
} from "./roomLayout";

describe("room layout geometry", () => {
  it("uses the supplied world shapes without an acoustic position", () => {
    const layout = laundry as unknown as RoomLayout;
    const [washer] = placeThings(layout);
    expect(washer.bounds).toEqual({ x0: -2.8, x1: -2.2, y0: 1.0, y1: 1.65, z0: 0, z1: 0.85 });
  });

  it("shows names without colour markup, and marks you", () => {
    expect(displayName({ id: "#5", name: "[red]oak table[normal]" }, "#99")).toBe("oak table");
    expect(displayName({ id: "#99", name: "[bold]Q" }, "#99")).toBe("Q (you)");
    expect(describeExit({ name: "[cyan]west[normal]", to: 1, at: [-2.7, 0, 0], width: 0.9 }, [6, 8, 3])).toBe(
      "west: 0.9 m doorway in the west wall, midway between the north and south walls",
    );
  });

  it("reads boxes as rectangles and spheres as circles from above", () => {
    expect(shapeFootprint({ box: [[-0.5, 0.5], [0.2, 1.0], [0.0, 0.75]] })).toEqual({
      type: "rect",
      bounds: { x0: -0.5, x1: 0.5, y0: 0.2, y1: 1.0, z0: 0, z1: 0.75 },
    });
    const circle = shapeFootprint({ sphere: [[0.1, 0.4, 0.9], 0.15] });
    expect(circle.type).toBe("circle");
    expect(circle.bounds.x0).toBeCloseTo(-0.05);
    expect(circle.bounds.y1).toBeCloseTo(0.55);
  });

  it("puts north up: larger north is smaller SVG y, east stays right", () => {
    expect(toSvg(1, 2)).toEqual([1, -2]);
    const [, northY] = toSvg(0, 2.5);
    const [, southY] = toSvg(0, -2.5);
    expect(northY).toBeLessThan(southY);
  });

  it("reads a translated physical record without moving unrelated things", () => {
    const [table, q] = placeThings(translateLayoutThing(sampleLayout(), "#99", [-1.0, 2.0, 0]));
    expect(table.bounds).toEqual({ x0: -0.5, x1: 0.5, y0: 0.2, y1: 1.0, z0: 0, z1: 1.05 });
    expect(q.bounds.x0).toBeCloseTo(0.0);
    expect(q.bounds.x1).toBeCloseTo(0.4);
    expect(q.bounds.y0).toBeCloseTo(0.0);
    expect(q.bounds.y1).toBeCloseTo(0.4);
    expect(q.bounds.z0).toBeCloseTo(0);
  });

  it("finds the wall a doorway is in, and none for a point inside the room or in a corner", () => {
    const size = sampleLayout().size;
    expect(exitWall(sampleLayout().exits[0], size)).toBe("west");
    expect(exitWall({ name: "north", to: 1, at: [0, 2.565, 0], width: 1 }, size)).toBe("north");
    expect(exitWall({ name: "down", to: 1, at: [0, 0, 0], width: 1 }, size)).toBeNull();
    expect(exitWall({ name: "northeast", to: 1, at: [1.7145, 2.3085, 0], width: 1 }, size)).toBeNull();
  });

  it("reads the real laundry room payload (room 1770, 2026-11-14)", () => {
    const layout = laundry as unknown as RoomLayout;
    // Default doorways sit 5% of the room in from their wall ($spatial_utils:coords_for_edge).
    expect(layout.exits.map((exit) => exitWall(exit, layout.size))).toEqual(["south", "west"]);
    const placed = placeThings(layout);
    expect(placed).toHaveLength(12);
    expect(placed.some((p) => p.thing.id === "#39832")).toBe(false);
    expect(layoutSummary("Laundry", layout)).toBe(
      "Layout of Laundry: 6.0 m east to west, 8.0 m north to south, 3.0 m high; 2 exits, 0 people, 13 things.",
    );
    expect(describeExit(layout.exits[0], layout.size)).toBe(
      "south: 0.9 m doorway in the south wall, midway between the east and west walls",
    );
    const pump = placed.find((p) => p.thing.id === "#10211") as (typeof placed)[number];
    expect(describeThing(pump, layout.size, "")).toBe("wall-mounted heat pump, against the south wall, against the west wall");
  });

  it("says where things are in plain words", () => {
    const size: [number, number, number] = [4, 6, 2.5];
    expect(describePlace({ x0: -1.9, x1: -1.0, y0: 0.5, y1: 1.8, z0: 0, z1: 1 }, size)).toBe(
      "1.2 m from the north wall, near the west wall",
    );
    expect(describePlace({ x0: -0.5, x1: 0.5, y0: -3, y1: -2, z0: 0, z1: 1 }, size)).toBe(
      "against the south wall, midway between the east and west walls",
    );
    const [table, q] = placeThings(sampleLayout());
    expect(describeThing(q, sampleLayout().size, "#99")).toBe("Ondine (you), 0.6 m from the south wall, 0.5 m from the east wall");
    expect(describeThing(table, sampleLayout().size, "#99")).toBe(
      "oak table, 1.6 m from the north wall, midway between the east and west walls",
    );
    expect(describeExit(sampleLayout().exits[0], sampleLayout().size)).toBe(
      "west: 0.9 m doorway in the west wall, 1.3 m from the south wall",
    );
  });

  it("sums the room up for the picture's label", () => {
    const layout = sampleLayout();
    expect(layoutSummary("Le Salon", layout)).toBe(
      "Layout of Le Salon: 3.8 m east to west, 5.1 m north to south, 2.4 m high; 1 exit, 1 person, 1 thing.",
    );
  });

  it("picks a 1, 2 or 5 scale bar near a quarter of the width", () => {
    expect(scaleBarLength(3.81)).toBe(0.5);
    expect(scaleBarLength(10)).toBe(2);
    expect(scaleBarLength(40)).toBe(10);
  });

  it("keeps labels from overlapping", () => {
    const fontSize = 0.2;
    const labels = placeLabels(
      [
        { id: "a", text: "chair", x: 0, y: 0, radius: 0.2 },
        { id: "b", text: "chair", x: 0.05, y: 0, radius: 0.2 },
        { id: "c", text: "chair", x: 0, y: 0.05, radius: 0.2 },
      ],
      fontSize,
    );
    const boxes = labels.map((l) => ({ x0: l.x - 0.4, x1: l.x + 0.4, y0: l.y - 0.13, y1: l.y + 0.13 }));
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const b = boxes[j];
        expect(a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1).toBe(false);
      }
    }
    expect(labels[0]).toMatchObject({ x: 0, y: 0 });
  });

  describe("3D labels (placeLabelsOver)", () => {
    const gap = 3;
    // The drawn label: 12 px text at line-height 1.2. Widths are the bold text's as Chromium draws it
    // (about 0.48 em a character; the old estimate of 0.58 em made "Hale Brennick" 96 px instead of 75).
    const height = 14.4;
    const width = (text: string) => text.length * 5.77;
    const frame = { x0: 4, x1: 272, y0: 4, y1: 203 };
    type Asked = { id: string; text: string; x: number; top: number };
    const ask = (requests: Asked[]) => requests.map((r) => ({ ...r, width: width(r.text), height }));
    const boxOf = (l: { text: string; x: number; y: number }) => ({ x0: l.x - width(l.text) / 2, x1: l.x + width(l.text) / 2, y0: l.y - height / 2, y1: l.y + height / 2 });
    // Each shown label spans the middle of what it names, its bottom at least `gap` and at most two label heights above its top, none overlapping.
    const attached = (requests: Asked[], labels: ReturnType<typeof placeLabelsOver>) => {
      for (const label of labels) {
        const asked = requests.find((r) => r.id === label.id) as Asked;
        const box = boxOf(label);
        expect(box.x0, label.id).toBeLessThan(asked.x);
        expect(box.x1, label.id).toBeGreaterThan(asked.x);
        expect(asked.top - box.y1, label.id).toBeGreaterThanOrEqual(gap - 1e-9);
        expect(asked.top - box.y1, label.id).toBeLessThanOrEqual(2 * height + 1e-9);
      }
      for (let i = 0; i < labels.length; i++) {
        for (let j = i + 1; j < labels.length; j++) {
          const a = boxOf(labels[i]);
          const b = boxOf(labels[j]);
          // Side by side they keep 6 px apart, so two names never read as one.
          expect(a.x0 - 6 < b.x1 && b.x0 - 6 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1, `${labels[i].id} against ${labels[j].id}`).toBe(false);
        }
      }
    };

    it("keeps a lone label centred over what it names, its bottom the gap above the top", () => {
      const labels = placeLabelsOver(ask([{ id: "a", text: "Winxie Wink", x: 120, top: 100 }]), gap, frame);
      expect(labels).toEqual([{ id: "a", text: "Winxie Wink", x: 120, y: 100 - gap - height / 2 }]);
    });

    it("moves the second of two clashing labels only as far as it must, staying over its figure", () => {
      const requests = [
        { id: "a", text: "Generic Janet", x: 120, top: 100 },
        { id: "b", text: "deepsqueak", x: 135, top: 102 },
      ];
      const labels = placeLabelsOver(ask(requests), gap, frame);
      expect(labels.map((l) => l.id)).toEqual(["a", "b"]);
      attached(requests, labels);
      expect(Math.hypot(labels[1].x - 135, labels[1].y - (102 - gap - height / 2))).toBeLessThan(height * 1.5);
    });

    it("keeps Your eyes' row of heads to the rule: each label over its own head, never above two label heights", () => {
      // At eye level every standing head is on nearly the same row (the harness's Your eyes among 24), so labels
      // climb and slide as far as allowed. The old placement let one rise to 2.6 label heights and slide off its figure.
      const names = ["Kit Sarne", "Lio Danner", "Mott Ansel", "Esme Tarrow", "Faro Quint", "Gwen Ashby", "Ines Corvald", "Hale Brennick", "Dov Lindqvist", "Cleo Marsh"];
      const requests = names.map((text, i) => ({ id: `#p${i}`, text, x: 20 + i * 25, top: 104 + (i % 3) }));
      const labels = placeLabelsOver(ask(requests), gap, frame);
      expect(labels.length).toBeGreaterThan(4);
      attached(requests, labels);
    });

    it("keeps every label of a crowd over its own figure, leaving out the ones with no room", () => {
      const names = ["Kit Sarne", "Lio Danner", "Mott Ansel", "Esme Tarrow", "Faro Quint", "Gwen Ashby", "Ines Corvald", "Hale Brennick (you)"];
      const requests = names.map((text, i) => ({ id: `#p${i}`, text, x: 60 + (i % 4) * 45, top: 100 + Math.floor(i / 4) * 12 }));
      const labels = placeLabelsOver(ask(requests), gap, frame);
      expect(labels.length).toBeGreaterThan(3);
      attached(requests, labels);
    });

    it("keeps labels off every head but their own person's, moving them by the same rule or leaving them out", () => {
      // A thing's label asked for right where another person's head is drawn: it rises clear of the head.
      const head = { id: "#p1", x0: 110, x1: 130, y0: 80, y1: 100 };
      const thing = placeLabelsOver(ask([{ id: "#rack", text: "a newspaper rack", x: 120, top: 104 }]), gap, frame, [head]);
      expect(thing).toHaveLength(1);
      const box = boxOf(thing[0]);
      expect(box.x0 < head.x1 && head.x0 < box.x1 && box.y0 < head.y1 && head.y0 < box.y1).toBe(false);
      // Its own head never pushes a person's label away: it sits just above it as asked.
      expect(placeLabelsOver(ask([{ id: "#p1", text: "Bram Okoro", x: 120, top: 80 }]), gap, frame, [head])).toEqual([
        { id: "#p1", text: "Bram Okoro", x: 120, y: 80 - gap - height / 2 },
      ]);
      // A face filling the picture's middle leaves no free spot within two label heights: the label is left out.
      const face = { id: "#p1", x0: 20, x1: 256, y0: 30, y1: 200 };
      expect(placeLabelsOver(ask([{ id: "#rack", text: "a newspaper rack", x: 120, top: 120 }]), gap, frame, [face])).toEqual([]);
    });

    it("keeps a label at the picture's edge inside it and still over its figure, or leaves it out", () => {
      const requests = [{ id: "a", text: "Hale Brennick (you)", x: 266, top: 130 }];
      const labels = placeLabelsOver(ask(requests), gap, frame);
      expect(labels).toHaveLength(1);
      expect(boxOf(labels[0]).x1).toBeLessThanOrEqual(frame.x1);
      attached(requests, labels);
      // A figure at the very edge with a name too short to reach in over it from inside the frame: left out, not moved off it.
      expect(placeLabelsOver(ask([{ id: "b", text: "Kit Sarne", x: 2, top: 130 }]), gap, frame)).toEqual([]);
    });
  });

  it("leaves out a label that has no free spot inside the room, and shortens long names", () => {
    const fontSize = 0.2;
    const room = { x0: -1, x1: 1, y0: -1, y1: 1 };
    const labels = placeLabels(
      [
        { id: "a", text: "table", x: 0, y: 0, radius: 0.1 },
        { id: "b", text: "a very long wide label", x: 0.9, y: 0.9, radius: 0.1 },
      ],
      fontSize,
      room,
    );
    expect(labels.map((l) => l.id)).toEqual(["a"]);
    expect(shortLabel("keyboard stand which holds electric keyboard")).toBe("keyboard stand which…");
    expect(shortLabel("oak table")).toBe("oak table");
  });
});

describe("what things are", () => {
  const living = livingRoomLayout();
  const byId = (id: string) => living.things.find((t) => t.id === id) as RoomLayout["things"][number];

  it("draws a thing by the first of its classes that has a drawing, nearest first", () => {
    expect(thingForm(byId("#1"))).toBe("table");
    expect(thingForm(byId("#2"))).toBe("seat");
    expect(thingForm(byId("#3"))).toBe("shelf");
    expect(thingForm({ ...byId("#1"), classes: ["tv", "table"] })).toBe("screen");
    expect(thingForm(byId("#8"))).toBe("box");
    expect(thingForm({ ...byId("#8"), classes: undefined })).toBe("box");
  });

  it("finds the main material and names a thing with its class and material", () => {
    expect(mainMaterial(byId("#2"))).toBe("cotton");
    expect(mainMaterial(byId("#8"))).toBeUndefined();
    expect(namedWithKind(byId("#1"), "#99")).toBe("coffee table (table, wood)");
    expect(namedWithKind(byId("#8"), "#99")).toBe("robot vacuum (thing)");
    expect(namedWithKind({ ...byId("#8"), classes: undefined }, "#99")).toBe("robot vacuum");
    const placed = placeThings(living);
    const table = placed.find((p) => p.thing.id === "#1");
    expect(table && describeThing(table, living.size, "#99")).toBe(
      "coffee table (table, wood), midway between the north and south walls, midway between the east and west walls",
    );
  });

  it("names things in the live sample with their nearest class and main material, people plainly", () => {
    const live = livingSample as RoomLayout;
    const named = (id: string) => namedWithKind(live.things.find((t) => t.id === id) as RoomLayout["things"][number], "#2");
    expect(named("#29617")).toBe("coffee table (table, pine)");
    expect(named("#25860")).toBe("A flat screen television named Moonbase (tv, lcd)");
    expect(named("#28049")).toBe("There Will Come Soft Rains (audio_play)");
    expect(named("#2")).toBe("Player 6 (you)");
    expect(named("#6574")).toBe("Person 1");
  });

  it("reads material components with extra keys, and an empty material as none", () => {
    const thing = (id: string) => livingSample.things.find((t) => t.id === id) as RoomLayout["things"][number];
    expect(mainMaterial(thing("#3963"))).toBe("plastic"); // entries carry phase, frozen_fraction, vapor_fraction too
    expect(mainMaterial(thing("#28049"))).toBeUndefined(); // sent as []
    expect(namedWithKind(thing("#28049"), "#2")).toBe("There Will Come Soft Rains (audio_play)");
  });

  it("finds the wall a thing is nearest", () => {
    const placed = placeThings(living);
    const wall = (id: string) => nearestWall(placed.find((p) => p.thing.id === id)?.bounds as Bounds, living.size);
    expect(wall("#2")).toBe("north");
    expect(wall("#3")).toBe("west");
    expect(wall("#5")).toBe("south");
    expect(wall("#6")).toBe("east");
  });

  it("labels you first, then people, then things largest first, and not things on the walls", () => {
    const order = labelOrder(placeThings(living), "#99").map((p) => p.thing.id);
    expect(order.slice(0, 2)).toEqual(["#99", "#9"]);
    expect(order[2]).toBe("#2");
    expect(order).not.toContain("#4");
  });
});

describe("people's labels and names", () => {
  it("lists a person with the server's label, and a person without one by name alone", () => {
    const layout = livingRoomLayout();
    const person = layout.things.find((t) => t.id === "#9") as RoomLayout["things"][number];
    expect(namedWithKind(person, "#99")).toBe("Person 1");
    expect(namedWithKind({ ...person, appearance: { label: "the [red]tall woman" } }, "#99")).toBe("Person 1 (the tall woman)");
    expect(namedWithKind({ ...person, appearance: { label: 7 } as never }, "#99")).toBe("Person 1");
  });

  it("finds the layout person for a Room.Players entry by name or full name, never an object", () => {
    const layout = livingRoomLayout();
    expect(layoutPersonNamed(layout, ["player 1", "Player 1, the Curious"])?.id).toBe("#99");
    expect(layoutPersonNamed(layout, ["nobody", "PERSON 1"])?.id).toBe("#9");
    expect(layoutPersonNamed(layout, ["sofa"])).toBeUndefined();
    expect(layoutPersonNamed(null, ["Player 1"])).toBeUndefined();
  });
});
