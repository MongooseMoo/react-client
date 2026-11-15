import { describe, expect, it } from "vitest";

import type { RoomLayout } from "../gmcp/Room";
import { sampleLayout } from "./roomLayout.fixture";
import laundry from "./roomLayout.sample-1770.json";
import {
  describeExit,
  describeArrival,
  describePlace,
  describeThing,
  displayName,
  exitWall,
  layoutSummary,
  placeLabels,
  placeThings,
  scaleBarLength,
  shapeFootprint,
  toSvg,
} from "./roomLayout";

describe("room layout geometry", () => {
  it("does not move a thing that has no origin (payloads from before origin)", () => {
    const layout = laundry as unknown as RoomLayout;
    const [washer] = placeThings(layout, { "#23011": [2, 2, 0] });
    expect(washer.bounds).toEqual({ x0: -2.8, x1: -2.2, y0: 1.0, y1: 1.65, z0: 0, z1: 0.85 });
  });

  it("shows names without colour markup, and marks you", () => {
    expect(displayName({ id: "#5", name: "[red]oak table[normal]" }, "#99")).toBe("oak table");
    expect(displayName({ id: "#99", name: "[bold]Q" }, "#99")).toBe("Q (you)");
    expect(describeExit({ name: "[cyan]west[normal]", to: 1, at: [-2.7, 0, 0], width: 0.9 }, [6, 8, 3])).toBe(
      "west: 0.9 m doorway in the west wall, midway between the north and south walls",
    );
    expect(describeArrival({ id: "#7", name: "[green]Zed", kind: "player" }, [2.9, 0, 0], [6, 8, 3], "#99")).toBe(
      "Zed, midway between the north and south walls, near the east wall",
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

  it("moves a thing's shapes by how far Client.Spatial says it went from its origin", () => {
    const [table, q] = placeThings(sampleLayout(), { "#99": [0.2, 1.0, 1.67] });
    expect(table.bounds).toEqual({ x0: -0.5, x1: 0.5, y0: 0.2, y1: 1.0, z0: 0, z1: 1.05 });
    expect(q.bounds.x0).toBeCloseTo(0.0);
    expect(q.bounds.x1).toBeCloseTo(0.4);
    expect(q.bounds.y0).toBeCloseTo(0.8);
    expect(q.bounds.y1).toBeCloseTo(1.2);
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
    const placed = placeThings(layout, {});
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
    const [table, q] = placeThings(sampleLayout(), {});
    expect(describeThing(q, sampleLayout().size, "#99")).toBe("Q (you), 0.6 m from the south wall, 0.5 m from the east wall");
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
    expect(labels[0]).toMatchObject({ x: 0, y: 0, leader: false });
  });
});
