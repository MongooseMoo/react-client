import * as THREE from "three";
import { describe, expect, it } from "vitest";
import type { LayoutFormPart } from "../gmcp/Room";
import { bevelInset, insetOutline } from "./partShapes";
import { partFootprints } from "./roomLayout";
import { partGeometry } from "./roomScene";

const box = (geometry: THREE.BufferGeometry) => {
  geometry.computeBoundingBox();
  return geometry.boundingBox as THREE.Box3;
};

/** Every vertex normal is a unit vector (no NaN, no zero) on every triangle that has area. */
function soundNormals(geometry: THREE.BufferGeometry): boolean {
  const g = geometry.index ? geometry.toNonIndexed() : geometry;
  const p = g.getAttribute("position"), n = g.getAttribute("normal");
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), v = new THREE.Vector3();
  for (let i = 0; i < p.count; i += 3) {
    a.fromBufferAttribute(p, i);
    b.fromBufferAttribute(p, i + 1);
    c.fromBufferAttribute(p, i + 2);
    if (b.clone().sub(a).cross(c.clone().sub(a)).length() < 1e-10) continue;
    for (let k = 0; k < 3; k++) if (Math.abs(v.fromBufferAttribute(n, i + k).length() - 1) > 1e-3) return false;
  }
  return true;
}

/** Whether every edge of every triangle with area is shared by exactly two such triangles: a closed surface. */
function closed(geometry: THREE.BufferGeometry): boolean {
  const g = geometry.index ? geometry.toNonIndexed() : geometry;
  const p = g.getAttribute("position");
  const id = (i: number) => [p.getX(i), p.getY(i), p.getZ(i)].map((x) => Math.round(x * 1e5)).join(",");
  const edges = new Map<string, number>();
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < p.count; i += 3) {
    a.fromBufferAttribute(p, i);
    b.fromBufferAttribute(p, i + 1);
    c.fromBufferAttribute(p, i + 2);
    if (b.clone().sub(a).cross(c.clone().sub(a)).length() < 1e-9) continue;
    const ids = [id(i), id(i + 1), id(i + 2)];
    for (let e = 0; e < 3; e++) {
      const [s, t] = [ids[e], ids[(e + 1) % 3]];
      if (s === t) continue;
      const key = s < t ? `${s}|${t}` : `${t}|${s}`;
      edges.set(key, (edges.get(key) ?? 0) + 1);
    }
  }
  return [...edges.values()].every((uses) => uses === 2);
}

/**
 * What a ray from `from` toward `to` meets on the part's unit-box surface, nearest first: one hit per crossing (a ray
 * along the edge two triangles share is reported by both).
 */
function hits(geometry: THREE.BufferGeometry, from: [number, number, number], to: [number, number, number]) {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
  const origin = new THREE.Vector3(...from);
  const all = new THREE.Raycaster(origin, new THREE.Vector3(...to).sub(origin).normalize()).intersectObject(mesh);
  return all.filter((hit, i) => i === 0 || hit.distance - all[i - 1].distance > 1e-6);
}

/** The surface's outward side at a hit: its normal points back toward the ray's start. */
const facesRay = (hit: THREE.Intersection, from: [number, number, number]) =>
  (hit.face as THREE.Face).normal.dot(new THREE.Vector3(...from).sub(hit.point)) > 0;

const expectFills = (geometry: THREE.BufferGeometry, axes = [0, 1, 2]) => {
  const b = box(geometry);
  for (const axis of axes) {
    expect(b.min.getComponent(axis)).toBeCloseTo(-0.5, 3);
    expect(b.max.getComponent(axis)).toBeCloseTo(0.5, 3);
  }
};

describe("extrude", () => {
  // A blade 0.8 m long, 0.06 m wide, 0.006 m thick: its tip at the top.
  const blade: LayoutFormPart = {
    shape: "extrude", center: [0, 0, 0], size: [0.06, 0.8, 0.006],
    outline: [[0, 0], [1, 0], [1, 0.85], [0.5, 1], [0, 0.85]],
  };

  it("fills its box with its outline through the box's height, closed, and shaded soundly", () => {
    const geometry = partGeometry(blade);
    expectFills(geometry);
    expect(closed(geometry)).toBe(true);
    expect(soundNormals(geometry)).toBe(true);
    // A ray down through the outline meets its top face from above, and misses beside the tip.
    const down = hits(geometry, [0, 0, 2], [0, 0, -2]);
    expect(down).toHaveLength(2);
    expect(facesRay(down[0], [0, 0, 2])).toBe(true);
    expect(hits(geometry, [0.45, 0.48, 2], [0.45, 0.48, -2])).toHaveLength(0);
  });

  it("chamfers both faces by its bevel, down to a sharp edge where the inset reaches the middle", () => {
    const geometry = partGeometry({ ...blade, bevel: [0.004, 0.002] });
    expectFills(geometry);
    expect(closed(geometry)).toBe(true);
    expect(soundNormals(geometry)).toBe(true);
    // On the top face the blade is 4 mm narrower each side; at mid thickness it is its full width.
    const p = geometry.getAttribute("position");
    const top = [], middle = [];
    for (let i = 0; i < p.count; i++) (Math.abs(p.getZ(i) - 0.5) < 1e-6 ? top : Math.abs(p.getZ(i)) < 0.2 ? middle : []).push(p.getX(i));
    expect(Math.max(...top) * 0.06).toBeCloseTo(0.03 - 0.004, 4);
    expect(Math.max(...middle) * 0.06).toBeCloseTo(0.03, 4);
    // An inset as wide as the blade and a depth of half its thickness: a knife edge, still the whole width.
    const edge = partGeometry({ ...blade, bevel: [0.05, 0.003] });
    expectFills(edge, [0, 1]);
    expect(closed(edge)).toBe(true);
    const q = edge.getAttribute("position");
    let widestFace = 0;
    for (let i = 0; i < q.count; i++) if (Math.abs(Math.abs(q.getZ(i)) - 0.5) < 1e-6) widestFace = Math.max(widestFace, Math.abs(q.getX(i)));
    expect(widestFace * 0.06).toBeLessThan(0.002);
  });

  it("insets an outline only as far as it can stay a simple outline", () => {
    const square: Array<[number, number]> = [[0, 0], [1, 0], [1, 1], [0, 1]];
    expect(insetOutline(square, 0.1)).toEqual([[0.1, 0.1], [0.9, 0.1], [0.9, 0.9], [0.1, 0.9]].map(([x, y]) => [expect.closeTo(x), expect.closeTo(y)]));
    expect(bevelInset(square, 0.2)).toBe(0.2);
    expect(bevelInset(square, 2)).toBeGreaterThan(0.49);
    expect(bevelInset(square, 2)).toBeLessThan(0.5);
  });
});

describe("sweep", () => {
  it("fills its box with a round tube along a straight path, its ends rounded closed", () => {
    const rod: LayoutFormPart = { shape: "sweep", center: [0, 0, 0], size: [1.2, 0.2, 0.2], path: [[0.1 / 1.2, 0.5, 0.5], [1.1 / 1.2, 0.5, 0.5]], radius: [0.1, 0.1] };
    const geometry = partGeometry(rod);
    expectFills(geometry);
    expect(closed(geometry)).toBe(true);
    expect(soundNormals(geometry)).toBe(true);
    // Across its middle a ray enters and leaves once, meeting the outside first.
    const across = hits(geometry, [0.013, -2, 0.021], [0.013, 2, 0.021]);
    expect(across).toHaveLength(2);
    expect(facesRay(across[0], [0.013, -2, 0.021])).toBe(true);
  });

  it("lays a wide section's width across a bow's curve, and bends round each joint without a gap", () => {
    // A bow in the x-z plane: tips at the top and bottom, the grip nearest +x... no, at x = 0.
    const bow: LayoutFormPart = {
      shape: "sweep", center: [0, 0, 0], size: [0.3, 0.06, 1.4],
      path: [[0.8, 0.5, 0.02], [0.3, 0.5, 0.3], [0.1, 0.5, 0.5], [0.3, 0.5, 0.7], [0.8, 0.5, 0.98]],
      radius: [0.008, 0.012, 0.015, 0.012, 0.008], aspect: 2,
    };
    for (const smooth of [false, true]) {
      const geometry = partGeometry({ ...bow, smooth });
      expect(closed(geometry)).toBe(true);
      expect(soundNormals(geometry)).toBe(true);
      // At the grip the section is 2 x 0.015 m across y (its width) and 0.015 x 2 along x... thickness 0.03 m.
      const b = new THREE.Box3();
      const p = geometry.getAttribute("position");
      for (let i = 0; i < p.count; i++) if (Math.abs(p.getZ(i)) < 0.005) b.expandByPoint(new THREE.Vector3(p.getX(i) * 0.3, p.getY(i) * 0.06, 0));
      expect(b.max.y - b.min.y).toBeCloseTo(0.06, 2);
      expect(b.max.x - b.min.x).toBeLessThan(0.04);
    }
  });
});

describe("loft", () => {
  // A breastplate: an oval torso from waist to shoulders, open at the neck and waist, with arm holes on each side.
  const ring = (z: number, w: number, d: number): { z: number; outline: Array<[number, number]> } => ({
    z, outline: Array.from({ length: 16 }, (_, i): [number, number] => {
      const t = (2 * Math.PI * i) / 16;
      return [0.5 + (w / 2) * Math.cos(t), 0.5 + (d / 2) * Math.sin(t)];
    }),
  });
  const torso: LayoutFormPart = {
    shape: "loft", center: [0, 0, 0], size: [0.4, 0.26, 0.5],
    sections: [ring(0, 0.85, 0.8), ring(0.5, 0.8, 0.85), ring(0.8, 1, 1), ring(1, 0.6, 0.6)],
    // Points 15, 0, 1 face +x: the right arm hole between the middle and top sections; points 7 to 9 the left.
    holes: [[1, 3, 15, 2], [1, 3, 7, 10]],
    caps: "none",
  };

  it("leaves its holes and uncapped ends open, seen from both sides", () => {
    const geometry = partGeometry(torso);
    expect(geometry.userData.open).toBe(true);
    expect(soundNormals(geometry)).toBe(true);
    // Side to side at shoulder height a ray passes out through both arm holes; lower down it meets both sides.
    expect(hits(geometry, [2, 0.013, 0.15], [-2, 0.013, 0.15])).toHaveLength(0);
    expect(hits(geometry, [2, 0.013, -0.3], [-2, 0.013, -0.3])).toHaveLength(2);
    // Front to back at shoulder height, where there is no hole: both sides.
    expect(hits(geometry, [0.013, -2, 0.15], [0.013, 2, 0.15])).toHaveLength(2);
    // Down through the open neck and waist: nothing.
    expect(hits(geometry, [0.013, 0.021, 2], [0.013, 0.021, -2])).toHaveLength(0);
    // Its widest points side to side lie in the arm holes, so it fills its box front to back and top to bottom only.
    expectFills(geometry, [1, 2]);
  });

  it("is a closed shell with its wall, the holes edged", () => {
    const geometry = partGeometry({ ...torso, wall: [0.004, 0.004, 0.004] });
    expect(geometry.userData.open).toBe(false);
    expect(closed(geometry)).toBe(true);
    expect(soundNormals(geometry)).toBe(true);
    // Through the front, below the arm holes, a ray crosses the wall twice on each side: outer and inner skin.
    expect(hits(geometry, [0.013, -2, -0.3], [0.013, 2, -0.3])).toHaveLength(4);
    // Still open side to side through the arm holes.
    expect(hits(geometry, [2, 0.013, 0.15], [-2, 0.013, 0.15])).toHaveLength(0);
  });

  it("is a closed solid with both caps, straight or smooth between sections", () => {
    for (const smooth of [false, true]) {
      const geometry = partGeometry({ ...torso, holes: undefined, caps: undefined, smooth });
      expect(geometry.userData.open).toBe(false);
      expect(closed(geometry)).toBe(true);
      expect(soundNormals(geometry)).toBe(true);
      const down = hits(geometry, [0.013, 0.021, 2], [0.013, 0.021, -2]);
      expect(down).toHaveLength(2);
      expect(facesRay(down[0], [0.013, 0.021, 2])).toBe(true);
    }
  });
});

describe("round box", () => {
  const sofa: LayoutFormPart = { shape: "box", center: [0, 0, 0], size: [2, 0.9, 0.8], round: 0.1 };

  it("fills its box with its edges rounded", () => {
    const geometry = partGeometry(sofa);
    expectFills(geometry);
    expect(closed(geometry)).toBe(true);
    expect(soundNormals(geometry)).toBe(true);
    // Every point lies within 0.1 m of the core box (0.9 x 0.35 x 0.3 m half-sizes): its corners and edges are round,
    // and some points lie that far out from a corner of the core, not only along an axis.
    const p = geometry.getAttribute("position");
    let farthest = 0, cornerOut = 0;
    for (let i = 0; i < p.count; i++) {
      const out = [Math.abs(p.getX(i) * 2) - 0.9, Math.abs(p.getY(i) * 0.9) - 0.35, Math.abs(p.getZ(i) * 0.8) - 0.3].map((v) => Math.max(0, v));
      farthest = Math.max(farthest, Math.hypot(...out));
      if (out.every((v) => v > 0.01)) cornerOut = Math.max(cornerOut, Math.hypot(...out));
    }
    expect(farthest).toBeLessThan(0.1 + 1e-6);
    expect(cornerOut).toBeGreaterThan(0.099);
    // Straight down through its top: one flat face, facing up.
    const down = hits(geometry, [0.013, 0.021, 2], [0.013, 0.021, -2]);
    expect(down).toHaveLength(2);
    expect(facesRay(down[0], [0.013, 0.021, 2])).toBe(true);
  });

  it("is open at the top with a rounded cavity when hollow", () => {
    const geometry = partGeometry({ ...sofa, wall: [0.05, 0.05, 0.05] });
    expect(closed(geometry)).toBe(true);
    expect(soundNormals(geometry)).toBe(true);
    // Down through the middle: the cavity's floor (its top side), then the bottom.
    const down = hits(geometry, [0.013, 0.021, 2], [0.013, 0.021, -2]);
    expect(down).toHaveLength(2);
    expect(down[0].point.z * 0.8).toBeCloseTo(-0.4 + 0.05, 4);
    expect(facesRay(down[0], [0.013, 0.021, 2])).toBe(true);
  });
});

describe("arc", () => {
  it("cuts a turned shape to its arc and closes the cut faces", () => {
    // Half a cylinder, from +x round through +y to -x.
    const half: LayoutFormPart = { shape: "cylinder", center: [0, 0, 0], size: [0.4, 0.4, 0.2], arc: [0, Math.PI] };
    const geometry = partGeometry(half);
    expect(closed(geometry)).toBe(true);
    expect(soundNormals(geometry)).toBe(true);
    const b = box(geometry);
    expect(b.min.y).toBeCloseTo(0, 6);
    expect(b.max.y).toBeCloseTo(0.5, 3);
    // Nothing on the -y side; from there a ray meets the flat cut face first, facing it.
    expect(hits(geometry, [0.2, -0.3, 0], [0.2, -0.3, 0.1]).length).toBe(0);
    const cut = hits(geometry, [0.2, -2, 0], [0.2, 2, 0]);
    expect(cut[0].point.y).toBeCloseTo(0, 6);
    expect(facesRay(cut[0], [0.2, -2, 0])).toBe(true);
  });

  it("makes a visor of a hollow sphere's arc: a curved plate with its edges closed", () => {
    // The front quarter of a helmet, about +y.
    const visor: LayoutFormPart = { shape: "sphere", center: [0, 0, 0], size: [0.24, 0.26, 0.28], wall: [0.004, 0.004, 0.004], arc: [Math.PI / 4, Math.PI / 2] };
    const geometry = partGeometry(visor);
    expect(closed(geometry)).toBe(true);
    expect(soundNormals(geometry)).toBe(true);
    // Out from the middle toward +y the ray crosses the plate's inner then outer skin; toward -y there is nothing.
    const out = hits(geometry, [0, 0, 0], [0, 1, 0]);
    expect(out).toHaveLength(2);
    expect(out[1].point.y - out[0].point.y).toBeGreaterThan(0);
    expect(hits(geometry, [0, 0, 0], [0, -1, 0])).toHaveLength(0);
    expect(hits(geometry, [0, 0, 0], [1, 0, 0])).toHaveLength(0);
  });

  it("keeps a whole turn as before", () => {
    const whole = partGeometry({ shape: "cylinder", center: [0, 0, 0], size: [0.4, 0.4, 0.2] });
    expectFills(whole);
    expect(soundNormals(whole)).toBe(true);
  });
});

describe("the Plan's view of the new shapes", () => {
  const thing = (part: LayoutFormPart) => ({
    id: "#1", name: "it", kind: "object" as const, fixed: false, mounted: false, shapes: [],
    pose: { centre_m: [0, 0, 0.5] as [number, number, number], dimensions_m: [1, 1, 1] as [number, number, number], body_quaternion: [1, 0, 0, 0] as [number, number, number, number], box: true },
    form_parts: [part],
  });

  it("draws an arc as its wedge, not the whole ring", () => {
    const [{ footprint }] = partFootprints(thing({ shape: "cylinder", center: [0, 0, 0], size: [0.4, 0.4, 0.2], arc: [0, Math.PI] }));
    expect(footprint.type).toBe("polygon");
    if (footprint.type !== "polygon") return;
    expect(Math.min(...footprint.points.map(([, y]) => y))).toBeCloseTo(0, 6);
    expect(Math.max(...footprint.points.map(([, y]) => y))).toBeCloseTo(0.2, 3);
  });

  it("draws an extrude by its outline, a sweep by its tube's reach, a loft by its sections", () => {
    const [extrude] = partFootprints(thing({ shape: "extrude", center: [0, 0, 0], size: [0.4, 0.2, 0.1], outline: [[0, 0], [1, 0], [0.5, 1]] }));
    expect(extrude.footprint).toEqual({ type: "polygon", points: expect.arrayContaining([[expect.closeTo(0), expect.closeTo(0.1)]]) });
    if (extrude.footprint.type === "polygon") expect(extrude.footprint.points).toHaveLength(3);
    const [sweep] = partFootprints(thing({ shape: "sweep", center: [0, 0, 0], size: [1, 0.2, 0.2], path: [[0.1, 0.5, 0.5], [0.9, 0.5, 0.5]], radius: [0.1, 0.1] }));
    if (sweep.footprint.type === "polygon") {
      expect(Math.max(...sweep.footprint.points.map(([x]) => x))).toBeCloseTo(0.5);
      expect(Math.max(...sweep.footprint.points.map(([, y]) => y))).toBeCloseTo(0.1);
    }
    const [loft] = partFootprints(thing({ shape: "loft", center: [0, 0, 0], size: [0.4, 0.4, 0.4],
      sections: [{ z: 0, outline: [[0, 0], [1, 0], [1, 1], [0, 1]] }, { z: 1, outline: [[0.4, 0.4], [0.6, 0.4], [0.6, 0.6], [0.4, 0.6]] }] }));
    expect(loft.footprint.type).toBe("polygon");
    if (loft.footprint.type === "polygon") expect(Math.max(...loft.footprint.points.map(([x]) => x))).toBeCloseTo(0.2);
  });
});
