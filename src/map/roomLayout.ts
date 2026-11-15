import type { LayoutExit, LayoutShape, LayoutThing, LayoutVector, RoomLayout } from "../gmcp/Room";
import type { LayoutArrival } from "../stores/roomStore";
import { stripMudAnsiTags } from "../stripMudAnsiTags";

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

export function describeThing(placed: PlacedThing, size: LayoutVector, youId: string): string {
  const { thing, bounds } = placed;
  const parts = [displayName(thing, youId), describePlace(bounds, size)];
  if (thing.mounted) parts.push(bounds.z0 > 0.05 ? `mounted ${metres(bounds.z0)} up` : "mounted");
  else if (thing.fixed && thing.kind === "object") parts.push("fixed in place");
  return parts.join(", ");
}

/** A thing the server sent without shapes: it is in the room but cannot be drawn. */
export function describeUnshaped(thing: LayoutThing, youId: string): string {
  return `${displayName(thing, youId)}, no size or place given`;
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
  /** The label had to move away from its thing; draw a leader line back to (anchorX, anchorY). */
  leader: boolean;
  anchorX: number;
  anchorY: number;
}

interface Box {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

/** A label's box when its text is centred on (x, y): text width estimated at 0.6 em a character. */
function labelBox(text: string, x: number, y: number, fontSize: number): Box {
  const halfW = (text.length * 0.6 * fontSize) / 2 + fontSize * 0.2;
  const halfH = fontSize * 0.65;
  return { x0: x - halfW, x1: x + halfW, y0: y - halfH, y1: y + halfH };
}

/**
 * Places labels so none overlap: each tries its thing's centre, then rings of
 * positions around it, and takes the first free one. A label that moved more
 * than beside its thing gets a leader line. When nothing is free it goes at
 * its thing's centre.
 */
export function placeLabels(requests: LabelRequest[], fontSize: number): PlacedLabel[] {
  const taken: Box[] = [];
  const result: PlacedLabel[] = [];
  const directions = [
    [0, 0],
    [0, -1],
    [0, 1],
    [1, 0],
    [-1, 0],
    [1, -1],
    [-1, -1],
    [1, 1],
    [-1, 1],
  ];
  for (const request of requests) {
    let chosen: { x: number; y: number; ring: number } | null = null;
    for (let ring = 0; ring < 6 && !chosen; ring++) {
      const distance = ring === 0 ? 0 : request.radius + fontSize * (0.9 + ring - 1);
      for (const [dx, dy] of ring === 0 ? [directions[0]] : directions.slice(1)) {
        const x = request.x + dx * distance * (dx !== 0 && dy !== 0 ? Math.SQRT1_2 : 1);
        const y = request.y + dy * distance * (dx !== 0 && dy !== 0 ? Math.SQRT1_2 : 1);
        const box = labelBox(request.text, x, y, fontSize);
        if (!taken.some((other) => overlaps(box, other))) {
          chosen = { x, y, ring };
          break;
        }
      }
    }
    const spot = chosen ?? { x: request.x, y: request.y, ring: 0 };
    taken.push(labelBox(request.text, spot.x, spot.y, fontSize));
    result.push({
      id: request.id,
      text: request.text,
      x: spot.x,
      y: spot.y,
      leader: spot.ring > 1,
      anchorX: request.x,
      anchorY: request.y,
    });
  }
  return result;
}
