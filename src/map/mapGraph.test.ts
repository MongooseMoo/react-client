import { describe, expect, it } from "vitest";
import { emptyMap, findPath, layoutArea, recordRoom, type MapData } from "./mapGraph";

function visit(map: MapData, num: number, exits: Record<string, number>, area = "Town", name = `Room ${num}`): MapData {
  return recordRoom(map, { num, name, area, exits });
}

describe("recordRoom", () => {
  it("keys exits by short direction whatever the server sent", () => {
    const map = recordRoom(emptyMap(), {
      num: 1, name: "Square", area: "Town", environment: "outdoors",
      exits: { north: 2, NE: 3, u: 4, hatch: 5 },
    });
    expect(map.rooms["1"]).toEqual({
      id: 1, name: "Square", area: "Town", environment: "outdoors",
      exits: { n: 2, ne: 3, u: 4, hatch: 5 },
    });
  });

  it("returns the same map when a revisit changes nothing", () => {
    const first = visit(emptyMap(), 1, { n: 2 });
    expect(visit(first, 1, { north: 2 })).toBe(first);
    expect(visit(first, 1, { n: 2, e: 3 })).not.toBe(first);
  });

  it("ignores rooms and exits that are not room numbers", () => {
    const map = recordRoom(emptyMap(), { num: 7, name: "A", area: "", exits: { n: -1, s: 1.5, e: 8 } });
    expect(map.rooms["7"].exits).toEqual({ e: 8 });
    expect(recordRoom(map, { num: -1, name: "B", area: "" })).toBe(map);
  });
});

describe("layoutArea", () => {
  it("places rooms by the direction of the exits between them", () => {
    let map = visit(emptyMap(), 1, { n: 2, e: 3, u: 4 });
    map = visit(map, 2, { s: 1 });
    map = visit(map, 3, { w: 1 });
    map = visit(map, 4, { d: 1 });
    const placed = layoutArea(map, "Town");
    const at = (id: number) => {
      const p = placed.get(id)!;
      return [p.x, p.y, p.z];
    };
    expect(at(1)).toEqual([0, 0, 0]);
    expect(at(2)).toEqual([0, -1, 0]);
    expect(at(3)).toEqual([1, 0, 0]);
    expect(at(4)).toEqual([0, 0, 1]);
  });

  it("follows one-way exits backwards so the far room still joins", () => {
    // Only room 5 is known to lead west into room 1.
    let map = visit(emptyMap(), 1, {});
    map = visit(map, 5, { w: 1 });
    const placed = layoutArea(map, "Town");
    expect([placed.get(5)!.x, placed.get(5)!.y]).toEqual([1, 0]);
  });

  it("moves a room to the nearest free cell instead of drawing it on top of another", () => {
    // 1 -n-> 2 and 1 -e-> 3 -n-> 4, but 4 also claims to be east of 2: no overlap either way.
    let map = visit(emptyMap(), 1, { n: 2, e: 3 });
    map = visit(map, 3, { n: 4, w: 1 });
    map = visit(map, 2, { n: 5, s: 1 });
    map = visit(map, 5, { s: 3 });
    const placed = layoutArea(map, "Town");
    const cells = [...placed.values()].map((p) => `${p.x},${p.y},${p.z}`);
    expect(new Set(cells).size).toBe(cells.length);
  });

  it("leaves rooms of other areas out and gives each separate group its own place", () => {
    let map = visit(emptyMap(), 1, { n: 2 });
    map = visit(map, 2, { s: 1, e: 9 });
    map = visit(map, 9, { w: 2 }, "Forest");
    map = visit(map, 20, {});
    const placed = layoutArea(map, "Town");
    expect([...placed.keys()].sort((a, b) => a - b)).toEqual([1, 2, 20]);
    expect(placed.get(20)!.x).toBeGreaterThan(placed.get(1)!.x);
  });
});

describe("findPath", () => {
  const map = (() => {
    let m = visit(emptyMap(), 1, { n: 2, e: 3 });
    m = visit(m, 2, { s: 1, e: 4 });
    m = visit(m, 3, { w: 1, n: 4 });
    m = visit(m, 4, { w: 2, s: 3, u: 5 });
    m = visit(m, 5, { d: 4 }, "Tower");
    return m;
  })();

  it("finds the shortest route across areas", () => {
    expect(findPath(map, 1, 5)).toEqual(["n", "e", "u"]);
    // Two three-step routes back; ties go to the first exit in compass order (s before w).
    expect(findPath(map, 5, 1)).toEqual(["d", "s", "w"]);
  });

  it("is empty when already there and null when no known exits lead there", () => {
    expect(findPath(map, 3, 3)).toEqual([]);
    expect(findPath(visit(map, 6, {}), 1, 6)).toBeNull();
  });
});
