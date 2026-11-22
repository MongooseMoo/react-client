import * as THREE from "three";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { type LayoutFormPart, outlineArea, simpleOutline } from "../gmcp/Room";

/**
 * Surfaces for the form-part shapes that are not turned: an extrude (an outline given thickness, its edges
 * optionally chamfered), a sweep (a section carried along a path), a loft (sections joined, with openings, as a
 * solid or a shell) and a box with rounded edges. Each is built in metres about its box's centre, so a round tube
 * stays round and a chamfer keeps its width whatever the box's proportions, then put in the unit box (-0.5 to 0.5
 * on each axis) that a part's basis-and-size matrix stretches back into place. See docs/room-layout.md.
 */

type V3 = [number, number, number];

/** Faces meeting at more than this are drawn as an edge; gentler turns are shaded round. */
export const CREASE_DEGREES = 40;
/** Steps round a sweep's section, round a rounded box's corner, and through a sweep's rounded ends and bends. */
const AROUND = 24;
const CORNER_STEPS = 6;
const END_STEPS = 6;
/** Rings between two of a smooth loft's sections or a smooth sweep's points. */
const SMOOTH_STEPS = 8;

/** A triangle mesh being built, in metres. */
class Mesh {
  points: V3[] = [];
  triangles: number[] = [];

  add(p: V3): number {
    this.points.push(p);
    return this.points.length - 1;
  }

  /** Joins each ring to the next (each a closed loop, all the same length) as a band, leaving out the quads `skip` names. */
  band(rings: number[][], skip?: (ring: number, j: number) => boolean): void {
    for (let k = 0; k + 1 < rings.length; k++) {
      const n = rings[k].length;
      for (let j = 0; j < n; j++) {
        if (skip?.(k, j)) continue;
        const a = rings[k][j], b = rings[k][(j + 1) % n], c = rings[k + 1][(j + 1) % n], d = rings[k + 1][j];
        // Rings anticlockwise about the direction they advance in face outward.
        this.triangles.push(a, b, c, a, c, d);
      }
    }
  }

  /** Closes a flat ring, facing along +z (`up`) or -z; corners repeated in a row (a collapsed corner) count once. */
  cap(ring: number[], up: boolean): void {
    const kept = ring.filter((index, i) => {
      const p = this.points[index], q = this.points[ring[(i + 1) % ring.length]];
      return Math.hypot(p[0] - q[0], p[1] - q[1]) > 1e-9;
    });
    if (kept.length < 3) return;
    const flat = kept.map((index) => new THREE.Vector2(this.points[index][0], this.points[index][1]));
    for (const [i, j, k] of THREE.ShapeUtils.triangulateShape(flat, [])) {
      // ShapeUtils.area is positive for anticlockwise points, and an anticlockwise triangle faces +z.
      const anticlockwise = THREE.ShapeUtils.area([flat[i], flat[j], flat[k]]) > 0;
      this.triangles.push(...(anticlockwise === up ? [kept[i], kept[j], kept[k]] : [kept[i], kept[k], kept[j]]));
    }
  }

  /** A ring's points added to the mesh. */
  ring(points: V3[]): number[] {
    return points.map((p) => this.add(p));
  }
}

/**
 * The finished surface: built in millimetres so `toCreasedNormals`, which matches corners to 1/100 of a unit, never
 * merges two near ones, shaded round where its faces turn gently and creased where they turn sharply, then divided
 * by the part's size into its unit box, each normal carried with it (times the size, which the mesh's matrix undoes).
 */
function finish(mesh: Mesh, size: V3, open: boolean): THREE.BufferGeometry {
  const built = new THREE.BufferGeometry();
  built.setAttribute("position", new THREE.Float32BufferAttribute(mesh.points.flatMap(([x, y, z]) => [x * 1000, y * 1000, z * 1000]), 3));
  built.setIndex(mesh.triangles);
  const geometry = toCreasedNormals(built, (CREASE_DEGREES * Math.PI) / 180);
  built.dispose();
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const n = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    position.setXYZ(i, position.getX(i) / (1000 * size[0]), position.getY(i) / (1000 * size[1]), position.getZ(i) / (1000 * size[2]));
    n.set(normal.getX(i) * size[0], normal.getY(i) * size[1], normal.getZ(i) * size[2]).normalize();
    normal.setXYZ(i, n.x, n.y, n.z);
  }
  // An open shell (a loft with an opening or an uncapped end, and no wall) is seen from both sides.
  geometry.userData.open = open;
  return geometry;
}

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const addV = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const length = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V3): V3 => scale(a, 1 / (length(a) || 1));

/** A fraction of the box (0 to 1 on an axis) in metres from its centre. */
const metres = (size: V3) => (f: number, axis: number) => (f - 0.5) * size[axis];

/**
 * An anticlockwise outline moved in by `d` metres: each corner where its two edges, each moved in by `d`, meet
 * (a very sharp corner's point is cut short at four times `d`).
 */
export function insetOutline(points: Array<[number, number]>, d: number): Array<[number, number]> {
  const n = points.length;
  return points.map(([x, y], i) => {
    const [px, py] = points[(i + n - 1) % n], [qx, qy] = points[(i + 1) % n];
    const e1 = [x - px, y - py], e2 = [qx - x, qy - y];
    const l1 = Math.hypot(e1[0], e1[1]) || 1, l2 = Math.hypot(e2[0], e2[1]) || 1;
    // Inward is to the left of an anticlockwise edge.
    const n1 = [-e1[1] / l1, e1[0] / l1], n2 = [-e2[1] / l2, e2[0] / l2];
    const miter = [n1[0] + n2[0], n1[1] + n2[1]];
    const along = 1 + n1[0] * n2[0] + n1[1] * n2[1];
    const k = Math.min(d / Math.max(along, 1e-9), (4 * d) / (Math.hypot(miter[0], miter[1]) || 1));
    return [x + miter[0] * k, y + miter[1] * k];
  });
}

/**
 * The bevel's inset, metres: `wanted`, or less where the outline is too narrow for it, the most that keeps the inset
 * outline a simple anticlockwise polygon with every edge still running its way. A blade whose inset reaches its
 * middle ends as a sliver along it: its two chamfers meet at an edge.
 */
export function bevelInset(points: Array<[number, number]>, wanted: number): number {
  const fits = (d: number) => {
    const inner = insetOutline(points, d);
    if (outlineArea(inner) <= 0 || !simpleOutline(inner)) return false;
    return inner.every(([x, y], i) => {
      const [nx, ny] = inner[(i + 1) % inner.length], [ox, oy] = points[i], [px, py] = points[(i + 1) % points.length];
      return (nx - x) * (px - ox) + (ny - y) * (py - oy) > 0;
    });
  };
  if (fits(wanted)) return wanted;
  let lo = 0, hi = wanted;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (fits(mid)) lo = mid;
    else hi = mid;
  }
  return lo;
}

/** An extrude: its outline through the box's height, each face's edge chamfered `bevel` [inset, depth] metres. */
export function extrudeGeometry(part: LayoutFormPart): THREE.BufferGeometry {
  const size = part.size;
  const at = metres(size);
  const outline = (part.outline ?? []).map(([x, y]): [number, number] => [at(x, 0), at(y, 1)]);
  const half = size[2] / 2;
  const [wantedInset, wantedDepth] = part.bevel ?? [0, 0];
  const depth = Math.min(wantedDepth, half);
  const inset = wantedInset > 0 && depth > 0 ? bevelInset(outline, wantedInset) : 0;
  const mesh = new Mesh();
  const flat = (points: Array<[number, number]>, z: number) => mesh.ring(points.map(([x, y]): V3 => [x, y, z]));
  const rings = inset > 0
    ? [flat(insetOutline(outline, inset), -half), flat(outline, -half + depth), flat(outline, half - depth), flat(insetOutline(outline, inset), half)]
    : [flat(outline, -half), flat(outline, half)];
  mesh.band(rings);
  mesh.cap(rings[0], false);
  mesh.cap(rings[rings.length - 1], true);
  return finish(mesh, size, false);
}

/** One ring's place on a sweep: its centre, the way the path runs there, and its half-thickness. */
interface Station {
  at: V3;
  along: V3;
  r: number;
}

/** A sweep's centre line as stations: a curve through its points, or straight runs whose bends are rounded. */
function sweepStations(points: V3[], radii: number[], smooth: boolean): Station[] {
  // Repeated points make no run.
  const kept = points.map((p, i) => ({ p, r: radii[i] })).filter(({ p }, i) => i === 0 || length(sub(p, points[i - 1])) > 1e-9);
  if (kept.length < 2) return [];
  if (smooth && kept.length > 2) {
    const curve = new THREE.CatmullRomCurve3(kept.map(({ p }) => new THREE.Vector3(...p)), false, "centripetal");
    const count = (kept.length - 1) * SMOOTH_STEPS;
    return Array.from({ length: count + 1 }, (_, i) => {
      const u = i / count;
      const along = curve.getTangent(u);
      const span = u * (kept.length - 1), k = Math.min(Math.floor(span), kept.length - 2), f = span - k;
      return { at: curve.getPoint(u).toArray() as V3, along: along.toArray() as V3, r: kept[k].r + (kept[k + 1].r - kept[k].r) * f };
    });
  }
  const stations: Station[] = [];
  for (let i = 0; i + 1 < kept.length; i++) {
    const along = unit(sub(kept[i + 1].p, kept[i].p));
    if (i > 0) {
      // The bend: the section turns about the joint from the last run's way to this one's.
      const before = stations[stations.length - 1].along;
      const turn = Math.acos(Math.max(-1, Math.min(1, dot(before, along))));
      const steps = Math.ceil(turn / ((15 * Math.PI) / 180));
      const from = new THREE.Vector3(...before), to = new THREE.Vector3(...along);
      const q = new THREE.Quaternion().setFromUnitVectors(from, to);
      for (let s = 1; s < steps; s++) {
        const way = from.clone().applyQuaternion(new THREE.Quaternion().slerp(q, s / steps));
        stations.push({ at: kept[i].p, along: way.toArray() as V3, r: kept[i].r });
      }
    }
    stations.push({ at: kept[i].p, along, r: kept[i].r }, { at: kept[i + 1].p, along, r: kept[i + 1].r });
  }
  return stations;
}

/**
 * A sweep: an elliptic section `radius` (half its thickness) by `radius * aspect` (half its width) along `path`,
 * its width lying across the path as near the box's x-y plane as it can, its ends rounded closed.
 */
export function sweepGeometry(part: LayoutFormPart): THREE.BufferGeometry {
  const size = part.size;
  const at = metres(size);
  const points = (part.path ?? []).map((p): V3 => [at(p[0], 0), at(p[1], 1), at(p[2], 2)]);
  const stations = sweepStations(points, part.radius ?? [], part.smooth === true);
  const aspect = part.aspect ?? 1;
  const mesh = new Mesh();
  if (!stations.length) return finish(mesh, size, false);
  // Each station's width direction: level (across the path, in the x-y plane) where the path is not upright, kept
  // from the last station where it is, and never flipped from one station to the next, so the tube does not twist.
  let width: V3 | undefined;
  const frames = stations.map(({ along }) => {
    const level = cross([0, 0, 1], along);
    let w: V3 = length(level) > 1e-6 ? unit(level)
      : width ? unit(sub(width, scale(along, dot(width, along)))) : unit(sub([1, 0, 0], scale(along, along[0])));
    if (length(w) < 1e-6) w = unit(cross(along, [0, 1, 0]));
    if (width && dot(w, width) < 0) w = scale(w, -1);
    width = w;
    return { w, h: cross(along, w) };
  });
  const ringAt = (centre: V3, w: V3, h: V3, r: number) => mesh.ring(Array.from({ length: AROUND }, (_, k) => {
    const t = (2 * Math.PI * k) / AROUND;
    return addV(centre, addV(scale(w, r * aspect * Math.cos(t)), scale(h, r * Math.sin(t))));
  }));
  // Each end is half an ellipsoid reaching `r` past the end along the path.
  const end = (i: number, toward: -1 | 1) => Array.from({ length: END_STEPS }, (_, s) => {
    const phi = (Math.PI / 2) * (1 - s / END_STEPS);
    const { at: c, along, r } = stations[i];
    return ringAt(addV(c, scale(along, toward * r * Math.sin(phi))), frames[i].w, frames[i].h, r * Math.cos(phi));
  });
  const last = stations.length - 1;
  const rings = [
    ...end(0, -1),
    ...stations.map(({ at: c, r }, i) => ringAt(c, frames[i].w, frames[i].h, r)),
    ...end(last, 1).reverse(),
  ];
  mesh.band(rings);
  return finish(mesh, size, false);
}

/**
 * A loft: its sections joined point to point (by straight lines, or curves when `smooth`), its `holes` left open,
 * its ends closed as `caps` says. With `wall` it is a shell that thick, its openings and open ends edged; without,
 * a solid when closed all round, else an open skin seen from both sides.
 */
export function loftGeometry(part: LayoutFormPart): THREE.BufferGeometry {
  const size = part.size;
  const at = metres(size);
  const sections = part.sections ?? [];
  const columns = sections[0]?.outline.length ?? 0;
  const steps = part.smooth && sections.length > 2 ? SMOOTH_STEPS : 1;
  // Each column (point j of every section) runs up through the sections, as a curve when smooth; `steps` rings per
  // span between two sections, and one at the last section.
  const curves = steps > 1 ? Array.from({ length: columns }, (_, j) => new THREE.CatmullRomCurve3(
    sections.map(({ z, outline }) => new THREE.Vector3(at(outline[j][0], 0), at(outline[j][1], 1), at(z, 2))), false, "centripetal")) : [];
  const ringPoints: V3[][] = [];
  for (let k = 0; k <= (sections.length - 1) * steps; k++) {
    ringPoints.push(Array.from({ length: columns }, (_, j): V3 => {
      if (steps > 1) return curves[j].getPoint(k / ((sections.length - 1) * steps)).toArray() as V3;
      const { z, outline } = sections[k];
      return [at(outline[j][0], 0), at(outline[j][1], 1), at(z, 2)];
    }));
  }
  const holes = part.holes ?? [];
  // The quad above ring k at column j is open when its section span and its edge between points lie in a hole.
  const skip = (k: number, j: number) => {
    const span = Math.floor(k / steps);
    return holes.some(([s0, s1, i0, i1]) => span >= s0 && span < s1 && (i0 < i1 ? j >= i0 && j < i1 : j >= i0 || j < i1));
  };
  const caps = part.caps ?? "both";
  const mesh = new Mesh();
  const rings = ringPoints.map((ring) => mesh.ring(ring));
  mesh.band(rings, skip);
  if (caps === "both" || caps === "bottom") mesh.cap(rings[0], false);
  if (caps === "both" || caps === "top") mesh.cap(rings[rings.length - 1], true);
  if (part.wall) return finish(shell(mesh, part.wall), size, false);
  return finish(mesh, size, holes.length > 0 || caps !== "both");
}

/**
 * A skin given thickness: an inner skin set in by `wall` (metres along x, y and z) along each corner's normal, deeper
 * where faces meet at an angle so the wall keeps its thickness there, facing inward; each edge of the skin that
 * bounds an opening joined to its inner copy by a strip.
 */
function shell(outer: Mesh, wall: V3): Mesh {
  const count = outer.points.length;
  const normals: V3[] = Array.from({ length: count }, () => [0, 0, 0]);
  const faces: V3[] = [];
  const t = outer.triangles;
  for (let f = 0; f < t.length; f += 3) {
    const [a, b, c] = [outer.points[t[f]], outer.points[t[f + 1]], outer.points[t[f + 2]]];
    const n = cross(sub(b, a), sub(c, a));
    faces.push(unit(n));
    for (const v of [t[f], t[f + 1], t[f + 2]]) normals[v] = addV(normals[v], n);
  }
  const shallowest = new Array<number>(count).fill(1);
  const vertexNormals = normals.map(unit);
  for (let f = 0; f < t.length; f += 3) {
    for (const v of [t[f], t[f + 1], t[f + 2]]) shallowest[v] = Math.min(shallowest[v], dot(vertexNormals[v], faces[f / 3]));
  }
  const mesh = new Mesh();
  mesh.points = [...outer.points];
  mesh.triangles = [...t];
  const inner = outer.points.map((p, v) => {
    const n = vertexNormals[v];
    const deeper = 1 / Math.max(0.35, shallowest[v]);
    return mesh.add(sub(p, [n[0] * wall[0] * deeper, n[1] * wall[1] * deeper, n[2] * wall[2] * deeper]));
  });
  for (let f = 0; f < t.length; f += 3) mesh.triangles.push(inner[t[f]], inner[t[f + 2]], inner[t[f + 1]]);
  // An edge used by one triangle bounds an opening: a strip joins it to its inner copy, facing out of the opening.
  const uses = new Map<string, number>();
  const key = (a: number, b: number) => (a < b ? `${a}:${b}` : `${b}:${a}`);
  for (let f = 0; f < t.length; f += 3) for (let e = 0; e < 3; e++) {
    const k = key(t[f + e], t[f + ((e + 1) % 3)]);
    uses.set(k, (uses.get(k) ?? 0) + 1);
  }
  for (let f = 0; f < t.length; f += 3) for (let e = 0; e < 3; e++) {
    const a = t[f + e], b = t[f + ((e + 1) % 3)];
    if (uses.get(key(a, b)) === 1) mesh.triangles.push(b, a, inner[a], b, inner[a], inner[b]);
  }
  return mesh;
}

/**
 * A box with its edges rounded `round` metres. With `wall` it is open at the top: its cavity, `wall` in from each
 * side and up from the bottom, has its own edges rounded by what is left of the radius (none when the wall is
 * thicker than it).
 */
export function roundedBoxGeometry(part: LayoutFormPart): THREE.BufferGeometry {
  const size = part.size;
  const [a, b, c] = size;
  const r = Math.min(part.round ?? 0, a / 2, b / 2, c / 2);
  const mesh = new Mesh();
  // A rounded rectangle anticlockwise: its corners' centres at (±hx, ±hy), each corner a quarter circle of radius ρ.
  const ring = (hx: number, hy: number, rho: number, z: number) => mesh.ring([[1, 1], [-1, 1], [-1, -1], [1, -1]].flatMap(([sx, sy], corner) =>
    Array.from({ length: CORNER_STEPS + 1 }, (_, s): V3 => {
      const angle = (Math.PI / 2) * (corner + s / CORNER_STEPS);
      return [sx * hx + rho * Math.cos(angle), sy * hy + rho * Math.sin(angle), z];
    })));
  const fillet = (from: number, to: number) => Array.from({ length: CORNER_STEPS + 1 }, (_, s) => from + ((to - from) * s) / CORNER_STEPS);
  const hx = a / 2 - r, hy = b / 2 - r;
  // Up the outside: round the bottom edge, then straight up.
  const rings = fillet(0, Math.PI / 2).map((t) => ring(hx, hy, r * Math.sin(t), -c / 2 + r * (1 - Math.cos(t))));
  if (!part.wall) {
    rings.push(...fillet(Math.PI / 2, Math.PI).map((t) => ring(hx, hy, r * Math.sin(t), c / 2 - r * (1 + Math.cos(t)))));
    mesh.band(rings);
    mesh.cap(rings[0], false);
    mesh.cap(rings[rings.length - 1], true);
    return finish(mesh, size, false);
  }
  const [wx, wy, wz] = part.wall;
  const inner = Math.max(0, Math.min(r - Math.max(wx, wy), a / 2 - wx, b / 2 - wy, (c - wz) / 2));
  const ix = a / 2 - wx - inner, iy = b / 2 - wy - inner, floor = -c / 2 + wz;
  // Up to the rim, across it, and down the cavity to its floor, rounding the floor's edge.
  rings.push(ring(hx, hy, r, c / 2), ring(ix, iy, inner, c / 2));
  rings.push(...(inner > 0
    ? fillet(Math.PI / 2, 0).map((t) => ring(ix, iy, inner * Math.sin(t), floor + inner * (1 - Math.cos(t))))
    : [ring(ix, iy, 0, floor)]));
  mesh.band(rings);
  mesh.cap(rings[0], false);
  mesh.cap(rings[rings.length - 1], true);
  return finish(mesh, size, false);
}
