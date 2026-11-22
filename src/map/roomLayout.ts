import type { LayoutExit, LayoutFormPart, LayoutShape, LayoutThing, LayoutVector, RoomLayout } from "../gmcp/Room";
import { stripMudAnsiTags } from "../stripMudAnsiTags";
import { appearanceLabel } from "../avatar/figure";
import { isLayoutPose } from "../gmcp/Room";

/**
 * Pure geometry for the Room.Layout picture and its text. Everything here is
 * in metres in the room-local MOO frame (x east, y north, z up, x/y origin
 * at the room centre) except `toSvg`, which flips y so north is up on screen.
 */

export interface Bounds {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  z0: number;
  z1: number;
}

/** One shape seen from above: a box's rectangle or a sphere's circle, with its height range. */
export type Footprint =
  | { type: "rect"; bounds: Bounds }
  | { type: "circle"; cx: number; cy: number; r: number; bounds: Bounds };

export interface PlacedThing {
  thing: LayoutThing;
  footprints: Footprint[];
  bounds: Bounds;
}

export type Wall = "north" | "south" | "east" | "west";

/** Rotate a declared local direction by the supplied physical body attitude. */
export function bodyDirection(thing: LayoutThing, axis: LayoutVector): LayoutVector | undefined {
  if (!isLayoutPose(thing.pose)) return undefined;
  const [rw, rx, ry, rz] = thing.pose.body_quaternion;
  const length = Math.hypot(rw, rx, ry, rz);
  const [w, x, y, z] = [rw / length, rx / length, ry / length, rz / length];
  const [vx, vy, vz] = axis;
  const tx = 2 * (y * vz - z * vy);
  const ty = 2 * (z * vx - x * vz);
  const tz = 2 * (x * vy - y * vx);
  return [vx + w * tx + y * tz - z * ty, vy + w * ty + z * tx - x * tz, vz + w * tz + x * ty - y * tx];
}

export function frontDirection(thing: LayoutThing): LayoutVector | undefined {
  const axis = thing.front?.axis;
  return Array.isArray(axis) && axis.length === 3 && axis.every(Number.isFinite) ? bodyDirection(thing, axis) : undefined;
}

/** The projected solid body, built from intrinsic corners rather than rotating its world bounds. */
export function bodyFootprint(thing: LayoutThing): Array<[number, number]> | undefined {
  const pose = thing.pose;
  if (!isLayoutPose(pose) || !pose.box) return undefined;
  const points: Array<[number, number]> = [];
  for (const x of [-0.5, 0.5]) for (const y of [-0.5, 0.5]) for (const z of [-0.5, 0.5]) {
    const rotated = bodyDirection(thing, [x * pose.dimensions_m[0], y * pose.dimensions_m[1], z * pose.dimensions_m[2]]);
    if (rotated) points.push([pose.centre_m[0] + rotated[0], pose.centre_m[1] + rotated[1]]);
  }
  return convexHull(points);
}

/**
 * A round part's outline from bottom to top as `[rx, ry, z]` in its unit box: rx and ry the radius as a fraction of
 * the half-extent across basis 1 and 2, z from -0.5 (bottom) to 0.5 (top), closed on the axis at a solid end.
 * A hollow open part (cylinder, cone, lathe with `wall`) goes up its outside, across its rim and back down its
 * cavity. A sphere or capsule with `wall` cut to an `arc` (a curved plate) goes up its outside and back down its
 * cavity; uncut, only its outside is drawn. Undefined for the shapes that are not turned (box, extrude, sweep, loft).
 */
export function partProfile(part: LayoutFormPart): Array<[number, number, number]> | undefined {
  const [a, b, c] = part.size;
  const quarter = (from: number, steps = 8) => Array.from({ length: steps + 1 }, (_, i) => from + (Math.PI / 2) * (i / steps));
  // A closed shell's cavity is the same shape [a - 2wx, b - 2wy, c - 2wz] about the same centre.
  const shell = (outside: Array<[number, number, number]>): Array<[number, number, number]> => {
    if (!part.wall || !part.arc) return outside;
    const [wx, wy, wz] = part.wall;
    const fx = (a - 2 * wx) / a, fy = (b - 2 * wy) / b, fz = (c - 2 * wz) / c;
    return [...outside, ...outside.map(([rx, ry, z]): [number, number, number] => [rx * fx, ry * fy, z * fz]).reverse()];
  };
  switch (part.shape) {
    case "box":
    case "extrude":
    case "sweep":
    case "loft":
      return undefined;
    case "sphere":
      return shell([...quarter(-Math.PI / 2), ...quarter(0).slice(1)].map((t) => [Math.cos(t), Math.cos(t), Math.sin(t) / 2]));
    case "capsule": {
      // Each end cap is half an ellipsoid min(a, b)/2 high.
      const cap = Math.min(0.5, Math.min(a, b) / 2 / c);
      const bottom = quarter(0).map((t): [number, number, number] => [Math.sin(t), Math.sin(t), -0.5 + cap * (1 - Math.cos(t))]);
      return shell([...bottom, ...bottom.map(([r, , z]): [number, number, number] => [r, r, -z]).reverse()]);
    }
  }
  // Cylinder, cone and lathe: the outside from bottom to top, r and the height fraction from the bottom.
  const side: Array<[number, number]> = part.shape === "cylinder" ? [[1, 0], [1, 1]]
    : part.shape === "cone" ? [[1, 0], [part.top ?? 0, 1]]
    : part.profile && part.profile[0][1] > part.profile[part.profile.length - 1][1] ? [...part.profile].reverse() : [...(part.profile ?? [])];
  const outside = side.map(([r, z]): [number, number, number] => [r, r, z - 0.5]);
  const bottom: Array<[number, number, number]> = side[0][0] > 0 ? [[0, 0, side[0][1] - 0.5]] : [];
  if (!part.wall) {
    const last = side[side.length - 1];
    return [...bottom, ...outside, ...(last[0] > 0 ? [[0, 0, last[1] - 0.5] as [number, number, number]] : [])];
  }
  // The cavity is the same shape [a - 2wx, b - 2wy, c - wz], raised wz/2: its floor is wz above the bottom.
  const [wx, wy, wz] = part.wall;
  const fx = (a - 2 * wx) / a, fy = (b - 2 * wy) / b, floor = wz / c;
  const cavity = side.map(([r, z]): [number, number, number] => [r * fx, r * fy, floor + z * (1 - floor) - 0.5]).reverse();
  const cavityBottom = cavity[cavity.length - 1];
  return [...bottom, ...outside, ...cavity, ...(cavityBottom[0] > 0 ? [[0, 0, cavityBottom[2]] as [number, number, number]] : [])];
}

/**
 * A part's centre and basis columns in the host frame with its joint at `position` (the joint's own unless given):
 * a hinge turns the rest pose `position` radians about its axis through its origin, right-handed; a slide moves it
 * `position` metres along its axis. A part without a joint is at its rest pose.
 */
export function posedPart(part: LayoutFormPart, position = part.joint?.position ?? 0): { center: LayoutVector; basis: [LayoutVector, LayoutVector, LayoutVector] } {
  const basis = part.basis ?? [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const joint = part.joint;
  if (!joint) return { center: part.center, basis };
  const k = joint.axis;
  if (joint.type === "slide") return { center: add(part.center, [k[0] * position, k[1] * position, k[2] * position]), basis };
  const cos = Math.cos(position), sin = Math.sin(position);
  const turn = ([x, y, z]: LayoutVector): LayoutVector => {
    const along = (k[0] * x + k[1] * y + k[2] * z) * (1 - cos);
    return [
      x * cos + (k[1] * z - k[2] * y) * sin + k[0] * along,
      y * cos + (k[2] * x - k[0] * z) * sin + k[1] * along,
      z * cos + (k[0] * y - k[1] * x) * sin + k[2] * along,
    ];
  };
  const origin = joint.origin ?? [0, 0, 0];
  const arm = turn([part.center[0] - origin[0], part.center[1] - origin[1], part.center[2] - origin[2]]);
  return { center: add(origin, arm), basis: [turn(basis[0]), turn(basis[1]), turn(basis[2])] };
}

/** A part seen from above in the room frame: an ellipse when it is round and stands upright, else its outline. */
export type PartFootprint =
  | { type: "ellipse"; cx: number; cy: number; rx: number; ry: number; /** Radians anticlockwise from east. */ angle: number }
  | { type: "polygon"; points: Array<[number, number]> };

/**
 * Each of a posed thing's form parts seen from above where its joint has it now, lowest top first so higher parts
 * are drawn over lower ones.
 */
export function partFootprints(thing: LayoutThing): Array<{ part: LayoutFormPart; footprint: PartFootprint }> {
  const pose = thing.pose;
  if (!isLayoutPose(pose) || !thing.form_parts?.length) return [];
  const rotate = (v: LayoutVector) => bodyDirection(thing, v) as LayoutVector;
  const drawn = thing.form_parts.map((part) => {
    const posed = posedPart(part);
    const [e1, e2, e3] = posed.basis.map(rotate);
    const centre = add(pose.centre_m, rotate(posed.center));
    const world = ([u, v, w]: LayoutVector): LayoutVector => [0, 1, 2].map((i) =>
      centre[i] + e1[i] * u * part.size[0] + e2[i] * v * part.size[1] + e3[i] * w * part.size[2]) as LayoutVector;
    const points = partSamples(part).map(world);
    const top = Math.max(...points.map((p) => p[2]));
    const upright = Math.abs(Math.abs(e3[2]) - 1) < 1e-6 && Math.abs(e1[0] * e2[0] + e1[1] * e2[1]) < 1e-6;
    const profile = partProfile(part);
    if (profile && upright && !part.arc) {
      const widest = Math.max(...profile.map(([r]) => r));
      const footprint: PartFootprint = { type: "ellipse", cx: centre[0], cy: centre[1],
        rx: (widest * part.size[0]) / 2, ry: (widest * part.size[1]) / 2, angle: Math.atan2(e1[1], e1[0]) };
      return { part, footprint, top };
    }
    return { part, footprint: { type: "polygon", points: convexHull(points.map(([x, y]): [number, number] => [x, y])) } as PartFootprint, top };
  });
  return drawn.sort((p, q) => p.top - q.top).map(({ part, footprint }) => ({ part, footprint }));
}

/**
 * Points on a part's surface in its unit box (-0.5 to 0.5 on each axis), enough for its outline from any side: a
 * turned shape's rings (only the angles of its `arc`, with its axis), an extrude's outline on both faces, a sweep's
 * path widened by its reach on each axis, a loft's sections, else the box's corners.
 */
export function partSamples(part: LayoutFormPart): LayoutVector[] {
  const [a, b, c] = part.size;
  const profile = partProfile(part);
  if (profile) {
    const [start, sweep] = part.arc ?? [0, 2 * Math.PI];
    // A whole turn in 32 steps; an arc from its start to its end inclusive.
    const steps = part.arc ? 31 : 32;
    const angles = Array.from({ length: 32 }, (_, i) => start + (sweep * i) / steps);
    return profile.flatMap(([rx, ry, z]) => [
      ...angles.map((t): LayoutVector => [(rx / 2) * Math.cos(t), (ry / 2) * Math.sin(t), z]),
      ...(part.arc ? [[0, 0, z] as LayoutVector] : []),
    ]);
  }
  if (part.shape === "extrude" && part.outline) {
    return part.outline.flatMap(([x, y]) => [-0.5, 0.5].map((z): LayoutVector => [x - 0.5, y - 0.5, z]));
  }
  if (part.shape === "sweep" && part.path && part.radius) {
    const reach = Math.max(1, part.aspect ?? 1);
    return part.path.flatMap(([x, y, z], i) => {
      const r = (part.radius as number[])[i] * reach;
      return [-1, 1].flatMap((sx) => [-1, 1].flatMap((sy) => [-1, 1].map((sz): LayoutVector =>
        [x - 0.5 + (sx * r) / a, y - 0.5 + (sy * r) / b, z - 0.5 + (sz * r) / c])));
    });
  }
  if (part.shape === "loft" && part.sections) {
    return part.sections.flatMap(({ z, outline }) => outline.map(([x, y]): LayoutVector => [x - 0.5, y - 0.5, z - 0.5]));
  }
  return [-0.5, 0.5].flatMap((u) => [-0.5, 0.5].flatMap((v) => [-0.5, 0.5].map((w): LayoutVector => [u, v, w])));
}

/** The convex outline round `points`, anticlockwise. */
function convexHull(input: Array<[number, number]>): Array<[number, number]> {
  const points = [...input];
  points.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (a: number[], b: number[], c: number[]) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const half = (ordered: Array<[number, number]>) => {
    const edge: Array<[number, number]> = [];
    for (const point of ordered) {
      while (edge.length > 1 && cross(edge[edge.length - 2], edge[edge.length - 1], point) <= 1e-12) edge.pop();
      edge.push(point);
    }
    return edge.slice(0, -1);
  };
  return [...half(points), ...half([...points].reverse())];
}

const add = (a: LayoutVector, b: LayoutVector): LayoutVector => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

export function shapeFootprint(shape: LayoutShape, offset: LayoutVector = [0, 0, 0]): Footprint {
  if ("box" in shape) {
    const [[x0, x1], [y0, y1], [z0, z1]] = shape.box;
    return {
      type: "rect",
      bounds: { x0: x0 + offset[0], x1: x1 + offset[0], y0: y0 + offset[1], y1: y1 + offset[1], z0: z0 + offset[2], z1: z1 + offset[2] },
    };
  }
  const [centre, r] = shape.sphere;
  const [cx, cy, cz] = add(centre, offset);
  return { type: "circle", cx, cy, r, bounds: { x0: cx - r, x1: cx + r, y0: cy - r, y1: cy + r, z0: cz - r, z1: cz + r } };
}

function union(all: Bounds[]): Bounds {
  return all.reduce((u, b) => ({
    x0: Math.min(u.x0, b.x0),
    x1: Math.max(u.x1, b.x1),
    y0: Math.min(u.y0, b.y0),
    y1: Math.max(u.y1, b.y1),
    z0: Math.min(u.z0, b.z0),
    z1: Math.max(u.z1, b.z1),
  }));
}

/**
 * Current exact world footprints from the MOO's room projection. Acoustic
 * origins and gaze do not move physical geometry. Things without shapes are left out.
 */
export function placeThings(layout: RoomLayout): PlacedThing[] {
  const placed: PlacedThing[] = [];
  for (const thing of layout.things) {
    if (thing.shapes.length === 0) continue;
    const footprints = thing.shapes.map((shape) => shapeFootprint(shape));
    placed.push({ thing, footprints, bounds: union(footprints.map((f) => f.bounds)) });
  }
  return placed;
}

/** MOO (east, north) to SVG user units: metres, y down, so north is up. */
export function toSvg(x: number, y: number): [number, number] {
  return [x, 0 - y];
}

/**
 * How far in from a wall, as a fraction of the room across it, a doorway
 * point may sit and still be in that wall. The MOO puts a wall's default
 * doorway 5% of the room in from it ($spatial_utils:coords_for_edge, the
 * same threshold as its "against the wall").
 */
const DOORWAY_INSET = 0.05;

/**
 * The wall a doorway is in, or null when its point is not by exactly one
 * wall: a corner, or a hatch, ladder or stairs inside the room.
 */
export function exitWall(exit: LayoutExit, size: LayoutVector): Wall | null {
  const [x, y] = exit.at;
  const [w, d] = size;
  const slack = 1e-6;
  const walls: Array<[Wall, boolean]> = [
    ["north", Math.abs(d / 2 - y) <= d * DOORWAY_INSET + slack],
    ["south", Math.abs(y + d / 2) <= d * DOORWAY_INSET + slack],
    ["east", Math.abs(w / 2 - x) <= w * DOORWAY_INSET + slack],
    ["west", Math.abs(x + w / 2) <= w * DOORWAY_INSET + slack],
  ];
  const inWalls = walls.filter(([, near]) => near).map(([wall]) => wall);
  return inWalls.length === 1 ? inWalls[0] : null;
}

export function metres(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded.toFixed(1)} m`;
}

/** Where along one axis something sits, from its gaps to the two walls on that axis. */
function axisWords(lowGap: number, highGap: number, lowWall: Wall, highWall: Wall): string {
  const nearer = lowGap <= highGap ? lowWall : highWall;
  const gap = Math.max(0, Math.min(lowGap, highGap));
  if (gap < 0.05) return `against the ${nearer} wall`;
  if (gap < 0.5) return `near the ${nearer} wall`;
  if (Math.abs(lowGap - highGap) < 0.2) return `midway between the ${lowWall} and ${highWall} walls`;
  return `${metres(gap)} from the ${nearer} wall`;
}

/** A thing's place in the room in plain words: "1.2 m from the north wall, near the west wall". */
export function describePlace(bounds: Bounds, size: LayoutVector): string {
  const halfW = size[0] / 2;
  const halfD = size[1] / 2;
  const northSouth = axisWords(halfD - bounds.y1, bounds.y0 + halfD, "north", "south");
  const eastWest = axisWords(halfW - bounds.x1, bounds.x0 + halfW, "east", "west");
  return `${northSouth}, ${eastWest}`;
}

/** A name as shown: its colour markup removed (names are `title()`), and "(you)" after your own. */
export function displayName(item: { id: string; name: string }, youId: string): string {
  const name = stripMudAnsiTags(item.name) || item.id;
  return item.id === youId ? `${name} (you)` : name;
}

/**
 * How a thing is drawn, from the first of its MOO classes (nearest first)
 * that has a drawing. Things with none of these classes are plain boxes.
 */
export type ThingForm = "table" | "seat" | "shelf" | "picture" | "screen" | "door" | "flat" | "box";

const FORM_BY_CLASS: Record<string, ThingForm> = {
  table: "table",
  chair: "seat",
  furniture: "seat",
  old_furniture: "seat",
  bookshelf: "shelf",
  cabinet: "shelf",
  moving_photograph: "picture",
  tv: "screen",
  door_leaf: "door",
  book: "flat",
  note: "flat",
};

export function thingForm(thing: LayoutThing): ThingForm {
  for (const name of thing.classes ?? []) {
    const form = FORM_BY_CLASS[name];
    if (form) return form;
  }
  return "box";
}

/** The species with the largest fraction of a thing's material, or undefined when none is sent. */
export function mainMaterial(thing: LayoutThing): string | undefined {
  let best: { species: string; fraction: number } | undefined;
  for (const part of thing.material ?? []) {
    if (!best || part.fraction > best.fraction) best = part;
  }
  return best?.species;
}

/** The wall a footprint is closest to; ties go north, south, east, west in that order. */
export function nearestWall(bounds: Bounds, size: LayoutVector): Wall {
  const gaps: Array<[Wall, number]> = [
    ["north", size[1] / 2 - bounds.y1],
    ["south", bounds.y0 + size[1] / 2],
    ["east", size[0] / 2 - bounds.x1],
    ["west", bounds.x0 + size[0] / 2],
  ];
  return gaps.reduce((best, gap) => (gap[1] < best[1] ? gap : best))[0];
}

/**
 * The things to label, most important first: you, other people, then things
 * largest footprint first. Things on the walls are not labelled; each keeps
 * its title and its line in the lists. Every view labels in this order.
 */
export function labelOrder(placed: PlacedThing[], youId: string): PlacedThing[] {
  const area = (p: PlacedThing) => (p.bounds.x1 - p.bounds.x0) * (p.bounds.y1 - p.bounds.y0);
  return placed
    .filter((p) => isPerson(p.thing) || !p.thing.mounted)
    .sort(
      (a, b) =>
        Number(b.thing.id === youId) - Number(a.thing.id === youId) ||
        Number(isPerson(b.thing)) - Number(isPerson(a.thing)) ||
        area(b) - area(a),
    );
}

/** What a thing is and what it is made of, when the server says: "table, wood". "" when it says neither. */
export function thingKind(thing: LayoutThing): string {
  return [thing.classes?.[0], mainMaterial(thing)].filter(Boolean).join(", ");
}

/** The server's label for a person ("the red-haired woman"), colour markup removed; undefined when it sends none. */
export function personLabel(thing: LayoutThing): string | undefined {
  const label = appearanceLabel(thing.appearance);
  return label ? stripMudAnsiTags(label) || label : undefined;
}

/**
 * Where a thing is, in words. What it rests on is the server's (`relation.text`: "on the low table")
 * when sent; otherwise its place by the walls from `bounds`, or "no size or place given" for a thing
 * sent without shapes. Then how it is fixed, and its native details.
 */
export function describeWhere(thing: LayoutThing, bounds: Bounds | undefined, size: LayoutVector): string {
  const parts: string[] = [];
  if (typeof thing.relation?.text !== "string") parts.push(bounds ? describePlace(bounds, size) : "no size or place given");
  if (bounds && thing.mounted) parts.push(bounds.z0 > 0.05 ? `mounted ${metres(bounds.z0)} up` : "mounted");
  else if (bounds && thing.fixed && thing.kind === "object") parts.push("fixed in place");
  parts.push(...semanticDetails(thing));
  return parts.join(", ");
}

/** Native words and public states; unknown facts make no claim. */
export function semanticDetails(thing: LayoutThing): string[] {
  const details: string[] = [];
  if (typeof thing.relation?.text === "string") details.push(thing.relation.text);
  if (!thing.relation && (thing.pose?.posture === "sitting" || thing.pose?.posture === "reclining")) details.push(thing.pose.posture);
  if (typeof thing.front?.direction === "string") details.push(`faces ${thing.front.direction}`);
  if (typeof thing.state?.opened === "boolean") details.push(thing.state.opened ? "open" : "closed");
  if (typeof thing.state?.lit === "boolean") details.push(thing.state.lit ? "lit" : "unlit");
  if (typeof thing.state?.mode === "string") details.push(thing.state.mode);
  return details;
}

/** A doorway named and placed: "west: 0.9 m doorway in the west wall, 1.3 m from the south wall". */
export function describeExit(exit: LayoutExit, size: LayoutVector): string {
  return `${stripMudAnsiTags(exit.name) || exit.name}: ${describeDoorway(exit, size)}`;
}

/** Where a doorway is, without its name, for beside the exit's own button. */
export function describeDoorway(exit: LayoutExit, size: LayoutVector): string {
  const wall = exitWall(exit, size);
  const halfW = size[0] / 2;
  const halfD = size[1] / 2;
  const [x, y] = exit.at;
  if (wall === "north" || wall === "south") {
    return `${metres(exit.width)} doorway in the ${wall} wall, ${axisWords(halfW - x, x + halfW, "east", "west")}`;
  }
  if (wall === "east" || wall === "west") {
    return `${metres(exit.width)} doorway in the ${wall} wall, ${axisWords(halfD - y, y + halfD, "north", "south")}`;
  }
  return `not in a wall, ${axisWords(halfD - y, y + halfD, "north", "south")}, ${axisWords(halfW - x, x + halfW, "east", "west")}`;
}

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function isPerson(thing: { kind: string }): boolean {
  return thing.kind === "player" || thing.kind === "person";
}

/**
 * The layout's person for a Room.Players entry, matched by name: Room.Players
 * carries no object number, so its `name` or `fullname` is compared, ignoring
 * case and colour markup, with each person's layout name.
 */
export function layoutPersonNamed(layout: RoomLayout | null | undefined, names: string[]): LayoutThing | undefined {
  const wanted = new Set(names.map((n) => (stripMudAnsiTags(n) || n).trim().toLowerCase()).filter(Boolean));
  return layout?.things.find((t) => isPerson(t) && wanted.has((stripMudAnsiTags(t.name) || t.name).trim().toLowerCase()));
}

/** The picture's accessible name: room size and its authoritative contents. */
export function layoutSummary(roomName: string, layout: RoomLayout): string {
  const [w, d, h] = layout.size;
  const everyone = layout.things;
  const people = everyone.filter(isPerson).length;
  const things = everyone.length - people;
  return `Layout of ${roomName || "this room"}: ${metres(w)} east to west, ${metres(d)} north to south, ${metres(h)} high; ` +
    `${count(layout.exits.length, "exit", "exits")}, ${count(people, "person", "people")}, ${count(things, "thing", "things")}.`;
}

/** A scale bar length near a quarter of the room's width: 1, 2 or 5 times a power of ten metres. */
export function scaleBarLength(width: number): number {
  const target = Math.max(width / 4, 0.01);
  const power = 10 ** Math.floor(Math.log10(target));
  const step = [5, 2, 1].find((m) => m * power <= target) ?? 1;
  return step * power;
}

export interface LabelRequest {
  id: string;
  text: string;
  /** Where the label belongs, in SVG units. */
  x: number;
  y: number;
  /** Half the size of what it labels, across and up and down, so the first tries sit just beside it. */
  rx: number;
  ry: number;
  /** The footprint of what it labels, SVG units: its label goes over no other thing's footprint that this one does not overlap, when it can (`placeLabels`). */
  footprint?: Box;
}

/** `requests` with `selectedId`'s moved to the front, so the selected thing's label is placed first and always shows. */
export function selectedFirst<T extends { id: string }>(requests: T[], selectedId: string | null | undefined): T[] {
  const index = selectedId ? requests.findIndex((r) => r.id === selectedId) : -1;
  return index <= 0 ? requests : [requests[index], ...requests.slice(0, index), ...requests.slice(index + 1)];
}

export interface PlacedLabel {
  id: string;
  text: string;
  x: number;
  y: number;
}

export interface Box {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
const inside = (a: Box, b: Box) => a.x0 >= b.x0 && a.x1 <= b.x1 && a.y0 >= b.y0 && a.y1 <= b.y1;

/** A label's box when its text is centred on (x, y): text width estimated at 0.58 em a character. */
function labelBox(text: string, x: number, y: number, fontSize: number): Box {
  const halfW = (text.length * 0.58 * fontSize) / 2 + fontSize * 0.25;
  const halfH = fontSize * 0.7;
  return { x0: x - halfW, x1: x + halfW, y0: y - halfH, y1: y + halfH };
}

const LABEL_MAX = 22;

/** A label's text: a long name cut at a word near LABEL_MAX characters, with an ellipsis. */
export function shortLabel(text: string): string {
  if (text.length <= LABEL_MAX) return text;
  const cut = text.slice(0, LABEL_MAX - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space >= LABEL_MAX / 2 ? cut.slice(0, space) : cut).replace(/[\s,;:(-]+$/, "")}…`;
}

/** Least space between two 3D labels side by side, pixels (the plan's estimate left about this much). */
const LABEL_SPACE = 6;
/**
 * Least space between two 3D labels one above the other, as a share of a label's height: a gap a third
 * of a line tall, so a stack of names reads as separate names, each near its own thing, and a crowded
 * shelf shows fewer of them instead of a solid block of text.
 */
const LABEL_LEAD = 1 / 3;

/** A 3D view's label to place: what it names, and the label's size as drawn, in screen pixels. */
export interface LabelOver {
  id: string;
  text: string;
  /** The middle of what it names, across. */
  x: number;
  /** The top of what it names as drawn (a person's head, a thing's top), down from the picture's top. */
  top: number;
  width: number;
  height: number;
}

/**
 * The 3D views' labels: placed in request order (most important first) so none
 * overlap, each as near its spot (centred over what it names, its bottom `gap`
 * above the top) as a free place allows. A label moves up, or sideways only so far
 * that its text still spans the middle of what it names, never down onto it, and
 * its bottom never more than two label heights above that top; a person's label
 * moves sideways only so far that its middle stays over their own head as drawn,
 * so it never sits over the space beside them. The first free place nearest its
 * spot wins. A label with none, or none inside `within`, is left out; the lists
 * still name it. Sizes are the labels' own, as drawn.
 * `heads` are the people's heads as drawn on screen, each with its person's id:
 * no label is placed over one, except its own person's (which it sits above).
 */
export function placeLabelsOver(requests: LabelOver[], gap: number, within?: Box, heads: Array<Box & { id: string }> = []): PlacedLabel[] {
  const taken: Box[] = [];
  const result: PlacedLabel[] = [];
  for (const request of requests) {
    const { width, height } = request;
    const own = heads.find((head) => head.id === request.id);
    // Sideways only while the label's text still reaches over the middle, by a margin of 2 px.
    const reach = Math.max(0, width / 2 - 2);
    const across = Math.max(1, reach / 4);
    // Up in quarter-label steps, the last exactly where the bottom is two label heights above the top.
    const highest = Math.max(0, 2 * height - gap);
    const rises: number[] = [];
    for (let up = 0; up < highest - 1e-9; up += height / 4) rises.push(up);
    rises.push(highest);
    const offsets: Array<[number, number]> = [];
    for (const up of rises) {
      for (let side = -4; side <= 4; side++) if (Math.abs(side * across) <= reach + 1e-9) offsets.push([side * across, -up]);
    }
    offsets.sort((a, b) => a[0] ** 2 + a[1] ** 2 - (b[0] ** 2 + b[1] ** 2));
    for (const [dx, dy] of offsets) {
      const x = request.x + dx;
      // A person's label keeps its middle over their own head (it may always stay where it was asked).
      if (own && dx !== 0 && (x < own.x0 || x > own.x1)) continue;
      const y = request.top - gap - height / 2 + dy;
      const box = { x0: x - width / 2, x1: x + width / 2, y0: y - height / 2, y1: y + height / 2 };
      // Two labels side by side keep LABEL_SPACE between them, one above the other LABEL_LEAD of a line, so their names do not run together.
      const lead = (height * LABEL_LEAD) / 2;
      const spaced = { x0: box.x0 - LABEL_SPACE / 2, x1: box.x1 + LABEL_SPACE / 2, y0: box.y0 - lead, y1: box.y1 + lead };
      if ((within && !inside(box, within)) || taken.some((other) => overlaps(spaced, other))) continue;
      if (heads.some((head) => head.id !== request.id && overlaps(box, head))) continue;
      taken.push(spaced);
      result.push({ id: request.id, text: request.text, x, y });
      break;
    }
  }
  return result;
}

/**
 * Places labels in request order (most important first) so none overlap:
 * each tries its thing's centre, then just beside it, then a little further,
 * and takes the first spot that is free (of other labels and of `avoid`)
 * and, given `within`, inside it. Given `footprints` (the things drawn, each
 * with its id), it first takes the nearest free spot that covers no stranger's
 * footprint: a stranger overlaps neither its own (`LabelRequest.footprint`) nor
 * lies centred on anything that does. So a sword's name stays on or beside its
 * own rack and the other things on it, never over the next shelf unit, while a
 * chair's may still lie over the rug it stands on. Its middle is also nearer
 * its own footprint than any stranger's. On a crowded shelf the names
 * with no such spot are left out rather than put over the next one. A label
 * with no free spot is left out; the thing keeps its title and its line in the
 * lists, and zooming in makes room. Place the selected thing's first
 * (`selectedFirst`) and it always has the most room.
 */
export function placeLabels(
  requests: LabelRequest[],
  fontSize: number,
  within?: Box,
  avoid: Box[] = [],
  footprints: Array<Box & { id: string }> = [],
): PlacedLabel[] {
  const taken: Box[] = [...avoid];
  const result: PlacedLabel[] = [];
  const directions = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
    [1, -1],
    [-1, -1],
    [1, 1],
    [-1, 1],
  ];
  for (const request of requests) {
    const candidates: Array<[number, number]> = [[request.x, request.y]];
    const own = labelBox(request.text, 0, 0, fontSize);
    // Rings 1 and 2 are every label's places; ring 3 only a thing's, as long as it keeps off strangers' footprints (below).
    const rings: Array<Array<[number, number]>> = [];
    for (let ring = 1; ring <= 3; ring++) {
      const gap = fontSize * (ring - 1) * 1.2;
      // Beside the thing: clear of it by the label's own half-width across, half-height up and down.
      const across = request.rx + own.x1 + gap;
      const upDown = request.ry + own.y1 + gap;
      const spots: Array<[number, number]> = [];
      for (const [dx, dy] of directions) {
        const diagonal = dx !== 0 && dy !== 0 ? Math.SQRT1_2 : 1;
        spots.push([request.x + dx * across * diagonal, request.y + dy * upDown * diagonal]);
      }
      // Above and below, a label wider than its thing also tries lining up with the thing's west or east end.
      const slide = own.x1 - request.rx;
      if (slide > 0) for (const dy of [1, -1]) for (const dx of [1, -1]) spots.push([request.x + dx * slide, request.y + dy * upDown]);
      // A spot that crosses the room's edge (a shelf against a wall) also tries sliding back just inside it.
      if (within) {
        for (const [x, y] of [...spots]) {
          const inX = Math.min(Math.max(x, within.x0 + own.x1), within.x1 - own.x1);
          if (inX !== x) spots.push([inX, y]);
        }
      }
      rings.push(spots);
    }
    candidates.push(...rings[0], ...rings[1]);
    const free = (box: Box) => !(within && !inside(box, within)) && !taken.some((other) => overlaps(box, other));
    const ownFootprint = request.footprint;
    // What its own thing overlaps (the shelf it lies on, the rug under it), and whatever lies on those: anything else is a stranger.
    const under = ownFootprint ? footprints.filter((f) => f.id === request.id || overlaps(f, ownFootprint)) : [];
    const centredIn = (f: Box) => under.some((u) => {
      const x = (f.x0 + f.x1) / 2;
      const y = (f.y0 + f.y1) / 2;
      return x > u.x0 && x < u.x1 && y > u.y0 && y < u.y1;
    });
    const strangers = ownFootprint ? footprints.filter((f) => !under.includes(f) && !centredIn(f)) : [];
    // How far a label's middle is from a footprint: 0 on it.
    const away = (x: number, y: number, f: Box) => Math.hypot(Math.max(f.x0 - x, 0, x - f.x1), Math.max(f.y0 - y, 0, y - f.y1));
    const clear = ([x, y]: [number, number]) => {
      const box = labelBox(request.text, x, y, fontSize);
      // Nearer its own thing than any stranger, so it never reads as the next shelf's.
      const mine = ownFootprint ? away(x, y, ownFootprint) : 0;
      return free(box) && !strangers.some((f) => overlaps(box, f) || away(x, y, f) < mine);
    };
    const spot = (ownFootprint ? [...candidates, ...rings[2]] : candidates).find(clear);
    if (!spot) continue;
    taken.push(labelBox(request.text, spot[0], spot[1], fontSize));
    result.push({ id: request.id, text: request.text, x: spot[0], y: spot[1] });
  }
  return result;
}
