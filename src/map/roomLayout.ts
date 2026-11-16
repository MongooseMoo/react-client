import type { LayoutExit, LayoutShape, LayoutThing, LayoutVector, RoomLayout } from "../gmcp/Room";
import type { LayoutArrival } from "../stores/roomStore";
import { stripMudAnsiTags } from "../stripMudAnsiTags";
import { appearanceLabel } from "../avatar/figure";

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
 * Each thing's footprints where it is now: its layout shapes moved by how far
 * Client.Spatial says it has gone from its layout `origin`. `positions` are
 * current Client.Spatial positions in the MOO frame, by thing id; a thing
 * without one, or without an `origin`, stays where the layout put it.
 * Things without shapes are left out.
 */
export function placeThings(layout: RoomLayout, positions: Record<string, LayoutVector | undefined>): PlacedThing[] {
  const placed: PlacedThing[] = [];
  for (const thing of layout.things) {
    if (thing.shapes.length === 0) continue;
    const now = positions[thing.id];
    const origin = thing.origin;
    const offset: LayoutVector =
      now && origin ? [now[0] - origin[0], now[1] - origin[1], now[2] - origin[2]] : [0, 0, 0];
    const footprints = thing.shapes.map((shape) => shapeFootprint(shape, offset));
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

/**
 * A thing's name with what it is and what it is made of, when the server
 * says: "coffee table (table, wood)". People are listed under People with
 * the server's label for them when it sends one: "Ann (the red-haired woman)".
 */
export function namedWithKind(thing: LayoutThing, youId: string): string {
  const name = displayName(thing, youId);
  if (isPerson(thing)) {
    const label = appearanceLabel(thing.appearance);
    return label ? `${name} (${stripMudAnsiTags(label) || label})` : name;
  }
  const kind = [thing.classes?.[0], mainMaterial(thing)].filter(Boolean);
  return kind.length > 0 ? `${name} (${kind.join(", ")})` : name;
}

export function describeThing(placed: PlacedThing, size: LayoutVector, youId: string): string {
  const { thing, bounds } = placed;
  const parts = [namedWithKind(thing, youId), describePlace(bounds, size)];
  if (thing.mounted) parts.push(bounds.z0 > 0.05 ? `mounted ${metres(bounds.z0)} up` : "mounted");
  else if (thing.fixed && thing.kind === "object") parts.push("fixed in place");
  return parts.join(", ");
}

/** A thing the server sent without shapes: it is in the room but cannot be drawn. */
export function describeUnshaped(thing: LayoutThing, youId: string): string {
  return `${namedWithKind(thing, youId)}, no size or place given`;
}

/** Something that entered after the layout, at its Client.Spatial point (MOO frame). */
export function describeArrival(arrival: LayoutArrival, at: LayoutVector | undefined, size: LayoutVector, youId: string): string {
  if (!at) return `${displayName(arrival, youId)}, no place given`;
  return `${displayName(arrival, youId)}, ${describePlace({ x0: at[0], x1: at[0], y0: at[1], y1: at[1], z0: at[2], z1: at[2] }, size)}`;
}

export function describeExit(exit: LayoutExit, size: LayoutVector): string {
  const wall = exitWall(exit, size);
  const halfW = size[0] / 2;
  const halfD = size[1] / 2;
  const [x, y] = exit.at;
  const name = stripMudAnsiTags(exit.name) || exit.name;
  if (wall === "north" || wall === "south") {
    return `${name}: ${metres(exit.width)} doorway in the ${wall} wall, ${axisWords(halfW - x, x + halfW, "east", "west")}`;
  }
  if (wall === "east" || wall === "west") {
    return `${name}: ${metres(exit.width)} doorway in the ${wall} wall, ${axisWords(halfD - y, y + halfD, "north", "south")}`;
  }
  return `${name}: not in a wall, ${axisWords(halfD - y, y + halfD, "north", "south")}, ${axisWords(halfW - x, x + halfW, "east", "west")}`;
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

/** The picture's accessible name: room size and what is in it, arrivals included. */
export function layoutSummary(roomName: string, layout: RoomLayout, arrivals: LayoutArrival[] = []): string {
  const [w, d, h] = layout.size;
  const everyone = [...layout.things, ...arrivals];
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
  /** Half-size of what it labels, so the first tries sit just beside it. */
  radius: number;
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
      // Two labels side by side keep LABEL_SPACE between them, so their names do not run together.
      const spaced = { ...box, x0: box.x0 - LABEL_SPACE / 2, x1: box.x1 + LABEL_SPACE / 2 };
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
 * and, given `within`, inside it. A label with no such spot is left out; the
 * thing keeps its title and its line in the lists, and zooming in makes room.
 */
export function placeLabels(requests: LabelRequest[], fontSize: number, within?: Box, avoid: Box[] = []): PlacedLabel[] {
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
    for (let ring = 1; ring <= 2; ring++) {
      const gap = fontSize * (ring - 1) * 1.2;
      // Beside the thing: clear of it by the label's own half-width across, half-height up and down.
      const across = request.radius + own.x1 + gap;
      const upDown = request.radius + own.y1 + gap;
      for (const [dx, dy] of directions) {
        const diagonal = dx !== 0 && dy !== 0 ? Math.SQRT1_2 : 1;
        candidates.push([request.x + dx * across * diagonal, request.y + dy * upDown * diagonal]);
      }
    }
    for (const [x, y] of candidates) {
      const box = labelBox(request.text, x, y, fontSize);
      if ((within && !inside(box, within)) || taken.some((other) => overlaps(box, other))) continue;
      taken.push(box);
      result.push({ id: request.id, text: request.text, x, y });
      break;
    }
  }
  return result;
}
