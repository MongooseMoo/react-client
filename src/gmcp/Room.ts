import { useMapStore } from "../stores/mapStore";
import { useRoomStore } from "../stores/roomStore";
import { useSessionStore } from "../stores/sessionStore";
import { inbound } from "../protocol/messages";
import { gmcpJsonMessage } from "./messages";
import { GMCPMessage, GMCPPackage } from "./package";

// More detailed Room.Info structure based on IRE docs
export class GMCPMessageRoomInfo extends GMCPMessage {
  num: number = 0; // Docs say number
  name: string = "";
  area: string = "";
  environment?: string;
  coords?: string; // "area,X,Y,Z,building"
  map?: string; // "url X Y"
  details?: string[]; // ["shop", "bank"]
  exits?: { [key: string]: number }; // {"n": 12344, "se": 12336}
  /** Mongoose addition: under the same keys as `exits`, each exit's earcon, placed at its doorway. */
  earcons?: { [key: string]: unknown };
  /**
   * Mongoose addition: under the same keys as `exits`, the way each exit faces ("north", "up"),
   * from the direction stored on the exit. Exits that face no way ("in", a named door) are absent.
   */
  directions?: { [key: string]: string };
}

/** A Room.Layout point or extent: metres, room-local MOO frame (x east, y north, z up). */
export type LayoutVector = [number, number, number];

/** Native body attitude, in MOO w,x,y,z order. Gaze is separate. */
export type LayoutQuaternion = [number, number, number, number];

export interface LayoutPose {
  centre_m: LayoutVector;
  dimensions_m: LayoutVector;
  body_quaternion: LayoutQuaternion;
  /** No custom collision shapes: draw the intrinsic box through its body pose. */
  box: boolean;
  /** Native unposed stature for the existing person figure, when supplied. */
  figure_height_m?: number;
  /** Native physical posture, available even without an appearance record. */
  posture?: "standing" | "sitting" | "reclining";
}

export interface LayoutFront {
  axis: LayoutVector;
  yaw: number;
  direction: string;
}

export interface LayoutRelation { kind: string; target: string; text: string }

export interface LayoutDrawerItem {
  id: string;
  lifetime: string;
  name: string;
  command: string;
}

export interface LayoutFitting extends LayoutDrawerItem {
  opened: boolean;
  contents: LayoutDrawerItem[];
}

/**
 * A hinge turns its part `position` radians about `axis` through `origin` (right-hand rule); a slide moves it
 * `position` metres along `axis`. Axis and origin are host-local, like a part's centre and basis.
 */
export interface LayoutJoint {
  type: "hinge" | "slide";
  axis: LayoutVector;
  /** Hinges only: the pivot, metres. */
  origin?: LayoutVector;
  /** Radians for a hinge, metres for a slide. */
  range: [number, number];
  position: number;
}

export type LayoutPartShape = "box" | "cylinder" | "sphere" | "capsule" | "cone" | "lathe" | "extrude" | "sweep" | "loft";

/** A loft's cross-section: `outline` (fractions of the box across x and y, anticlockwise) at height fraction `z`. */
export interface LayoutLoftSection {
  z: number;
  outline: Array<[number, number]>;
}

/**
 * One authored part, in metres, relative to the centre and axes of the host's pose. Every shape fills the box
 * `center`/`size`/`basis`: its axis is basis column 3, from -size[2]/2 (bottom) to +size[2]/2 (top), and a round
 * shape's cross-section is an ellipse size[0] x size[1] across.
 */
export interface LayoutFormPart {
  shape: LayoutPartShape;
  center: LayoutVector;
  size: LayoutVector;
  basis?: [LayoutVector, LayoutVector, LayoutVector];
  /** Cone only: top diameter over bottom diameter, 0 (a point) to 1. */
  top?: number;
  /** Lathe only: `[r, z]` pairs revolved about the axis; r a fraction of the half-extent, z of the height from the bottom. */
  profile?: Array<[number, number]>;
  /** Wall thickness in metres along basis 1, 2, 3: hollow. Box, cylinder, cone and lathe are open at the top; a loft is a shell. */
  wall?: LayoutVector;
  /** Box only: the edge radius, metres. */
  round?: number;
  /** Cylinder, cone, sphere, capsule and lathe: `[start, sweep]` radians about the axis from basis 1 toward basis 2. */
  arc?: [number, number];
  /** Extrude: the outline, 3 to 128 `[x, y]` fractions of the box, a simple anticlockwise polygon, through the box's height. */
  outline?: Array<[number, number]>;
  /** Extrude: `[inset, depth]` metres, a chamfer round the outline on both faces. */
  bevel?: [number, number];
  /** Sweep: the centre line, 2 to 32 `[x, y, z]` fractions of the box. */
  path?: LayoutVector[];
  /** Sweep: the section's half-thickness at each path point, metres (its half-width is that times `aspect`). */
  radius?: number[];
  /** Sweep: the section's width over its thickness (1 when absent). */
  aspect?: number;
  /** Sweep and loft: a curve through the points or sections instead of straight runs. */
  smooth?: boolean;
  /** Loft: 2 to 16 sections, `z` rising, each outline with the same number of points. */
  sections?: LayoutLoftSection[];
  /** Loft: which ends are closed ("both" when absent). */
  caps?: "both" | "none" | "top" | "bottom";
  /** Loft: openings `[s0, s1, i0, i1]`, the skin between sections s0 and s1 and points i0 to i1 (wrapping when i0 > i1). */
  holes?: Array<[number, number, number, number]>;
  /** How the part moves. With a joint, `center` and `basis` are its rest pose and `position` says where it is now. */
  joint?: LayoutJoint;
  role?: string;
  label?: string;
  /** MOO palette entry for this part. The renderer reads its validated hex value. */
  colour?: unknown;
  /** What the part is made of, `{species, family}`. Read through `partMaterial`; anything malformed there is ignored. */
  material?: unknown;
  fitting?: LayoutFitting;
}

/** A part's material: its species (`steel`, `oak`) and that species' family (`metal`, `wood`). */
export interface LayoutPartMaterial {
  species: string;
  family: string;
}

/** A part's `material` when it is well formed (two non-empty names), else undefined: the part is drawn without it. */
export function partMaterial(part: LayoutFormPart): LayoutPartMaterial | undefined {
  const m = part.material;
  return record(m) && typeof m.species === "string" && m.species.trim() !== "" && typeof m.family === "string" && m.family.trim() !== ""
    ? { species: m.species, family: m.family } : undefined;
}

export interface LayoutBody {
  id: string;
  lifetime: string;
  pose: LayoutPose;
  shapes: LayoutShape[];
  front?: LayoutFront;
  relation?: LayoutRelation;
  form_parts?: LayoutFormPart[];
}

export interface RoomLayoutUpdate {
  num: number;
  room_lifetime: string;
  bodies: LayoutBody[];
}

/** A world box `[[x0,x1],[y0,y1],[z0,z1]]` or a sphere `[[cx,cy,cz], r]`. */
export type LayoutShape =
  | { box: [[number, number], [number, number], [number, number]] }
  | { sphere: [LayoutVector, number] };

export interface LayoutExit {
  /** `exit:title()`, the same key Room.Info `exits` uses. */
  name: string;
  /** Destination object number. */
  to: number;
  /** Doorway centre point. */
  at: LayoutVector;
  /** Doorway width along its wall. */
  width: number;
  /** Unit vector out of the room the exit faces (x east, y north, z up); `[]` when it faces no way. */
  facing?: LayoutVector | [];
}

export interface LayoutThing {
  /** `tostr(obj)`, the same id Client.Spatial uses. */
  id: string;
  name: string;
  kind: "player" | "person" | "object";
  fixed: boolean;
  mounted: boolean;
  shapes: LayoutShape[];
  lifetime?: string;
  pose?: LayoutPose;
  front?: LayoutFront;
  relation?: LayoutRelation;
  state?: { opened?: boolean; lit?: boolean; mode?: string };
  form_parts?: LayoutFormPart[];
  /** Acoustic snapshot origin; never a physical drawing position. */
  origin?: LayoutVector;
  /** Registered `$` names of the thing's ancestors, nearest first (`table`, `furniture`, `thing`). */
  classes?: string[];
  /** Capability names the thing declares (`furniture_seating`, `support_surface`). */
  capabilities?: string[];
  /** What it is made of: species with their fractions of the whole; `[]` when it declares none. */
  material?: LayoutMaterial[];
  /**
   * People only (`player`, `person`): how they look to this recipient. Absent when the character has
   * no appearance record. Nothing here is checked by the decoder, so every field may be missing or wrong.
   */
  appearance?: LayoutAppearance;
}

/** A named palette colour: the word the MOO uses for it and its `#rrggbb` value. */
export interface LayoutColour {
  name: string;
  hex: string;
}

/** One visible mark on a part of the body not covered by clothing. */
export interface LayoutMark {
  kind: string;
  area: string;
}

/** One worn garment: the body areas it covers (head, neck, torso, arms, hands, waist, legs, feet) and its layer, higher outside. */
export interface LayoutGarment {
  name: string;
  areas: string[];
  layer: number;
  colour?: LayoutColour;
}

/** `things[].appearance` in Room.Layout (see docs/room-layout.md). Every key is optional. */
export interface LayoutAppearance {
  /** The shortest phrase that tells this person from the others present, computed by the server for this recipient. */
  label?: string;
  posture?: "standing" | "sitting" | "reclining";
  /** Species or body plan, and traits such as `tail`, `wings`, `antlers`. */
  body_plan?: string;
  traits?: string[];
  /**
   * A whole-body form's own look: `kind` (`skin`, `fur`, `hide`, `feathers`, `scales`, `crystal`) and one to three
   * colours, main first. Never sent for a character in no form.
   */
  covering?: { kind?: string; colours?: LayoutColour[] };
  /** One of the game's builds: average, slender, thin, athletic, muscular, curvy, stocky, chunky, pudgy, dumpy. */
  build?: string;
  age_years?: number;
  skin?: LayoutColour;
  /** Absent when bald or covered. */
  hair?: { length_cm?: number; texture?: string; style?: string; name?: string; hex?: string };
  /** `length_cm`: how long a beard is, from the game's beard length bands. */
  facial_hair?: { kind?: string; length_cm?: number; name?: string; hex?: string };
  eyes?: LayoutColour;
  face?: { shape?: string; nose?: string; lips?: string; brows?: string; ears?: string };
  /** Small features by key: `freckles`, `glasses`, … */
  features?: string[];
  /** A form hides the face; hair, eyes and face are then the form's. */
  face_hidden?: boolean;
  marks?: LayoutMark[];
  garments?: LayoutGarment[];
}

/** One component of a thing's material: the stored component map, which may carry more keys (`phase`, `frozen_fraction`…). */
export interface LayoutMaterial {
  species: string;
  fraction: number;
}

/** Mongoose `Room.Layout`: the inside of a spatial room, drawn by the client. See docs/room-layout.md. */
export interface RoomLayout {
  num: number;
  room_lifetime?: string;
  finishes?: Partial<Record<"floor" | "wall" | "ceiling", string>>;
  /** `room:dimensions()`: width (east-west), depth (north-south), height. The room spans ±width/2, ±depth/2. */
  size: LayoutVector;
  exits: LayoutExit[];
  things: LayoutThing[];
}

export interface RoomPlayer {
  name: string;
  fullname: string;
}

const roomInfo = gmcpJsonMessage<"Info", GMCPMessageRoomInfo>("Info");
const roomWrongDir = gmcpJsonMessage<"WrongDir", string>("WrongDir");
const roomPlayers = gmcpJsonMessage<"Players", RoomPlayer[]>("Players");
const roomAddPlayer = gmcpJsonMessage<"AddPlayer", RoomPlayer>("AddPlayer");
const roomRemovePlayer = gmcpJsonMessage<"RemovePlayer", string>("RemovePlayer");
const roomLayout = gmcpJsonMessage<"Layout", RoomLayout>("Layout");
const roomLayoutUpdate = gmcpJsonMessage<"LayoutUpdate", unknown>("LayoutUpdate");

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const vector = (value: unknown): value is LayoutVector =>
  Array.isArray(value) && value.length === 3 && value.every(finite);
const namedTarget = (value: unknown): value is LayoutDrawerItem =>
  record(value) && typeof value.id === "string" && /^#\d+$/.test(value.id) &&
  typeof value.name === "string" && typeof value.lifetime === "string" && !!value.lifetime &&
  typeof value.command === "string";

const unit = (value: unknown): value is LayoutVector => vector(value) && Math.abs(Math.hypot(...value) - 1) < 0.001;
const fraction = (value: unknown): value is number => finite(value) && value >= 0 && value <= 1;
const SHAPES: readonly LayoutPartShape[] = ["box", "cylinder", "sphere", "capsule", "cone", "lathe", "extrude", "sweep", "loft"];
/** The shapes made by turning an outline about the axis, which may be cut to an `arc`. */
const TURNED: readonly LayoutPartShape[] = ["cylinder", "sphere", "capsule", "cone", "lathe"];

const fractionPair = (value: unknown): value is [number, number] => Array.isArray(value) && value.length === 2 && value.every(fraction);
const fractionPoints = (value: unknown, least: number, most: number): value is Array<[number, number]> =>
  Array.isArray(value) && value.length >= least && value.length <= most && value.every(fractionPair);

/** Twice the signed area of a closed outline: positive when it runs anticlockwise. */
export function outlineArea(points: Array<[number, number]>): number {
  let twice = 0;
  for (let i = 0; i < points.length; i++) {
    const [x0, y0] = points[i], [x1, y1] = points[(i + 1) % points.length];
    twice += x0 * y1 - x1 * y0;
  }
  return twice;
}

/** Whether no two edges of a closed outline cross or touch, other than neighbours at their shared corner. */
export function simpleOutline(points: Array<[number, number]>): boolean {
  const n = points.length;
  const side = (a: number[], b: number[], c: number[]) => Math.sign((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
  const within = (a: number[], b: number[], c: number[]) =>
    Math.min(a[0], b[0]) <= c[0] && c[0] <= Math.max(a[0], b[0]) && Math.min(a[1], b[1]) <= c[1] && c[1] <= Math.max(a[1], b[1]);
  for (let i = 0; i < n; i++) {
    const a = points[i], b = points[(i + 1) % n];
    if (a[0] === b[0] && a[1] === b[1]) return false;
    for (let j = i + 1; j < n; j++) {
      if (j === i + 1 || (i === 0 && j === n - 1)) continue;
      const c = points[j], d = points[(j + 1) % n];
      const [s1, s2, s3, s4] = [side(a, b, c), side(a, b, d), side(c, d, a), side(c, d, b)];
      if (s1 !== s2 && s3 !== s4) return false;
      if ((s1 === 0 && within(a, b, c)) || (s2 === 0 && within(a, b, d)) || (s3 === 0 && within(c, d, a)) || (s4 === 0 && within(c, d, b))) return false;
    }
  }
  return true;
}

const whole = (value: unknown): value is number => Number.isInteger(value);

/** The fields of an extrude, sweep or loft, a box's `round` and a turned shape's `arc`, as docs/room-layout.md gives them. */
function validShapeFields(value: Record<string, unknown>, shape: LayoutPartShape, size: LayoutVector): boolean {
  if (value.round !== undefined && !(shape === "box" && finite(value.round) && value.round > 0 && value.round <= Math.min(...size) / 2 + 1e-9)) return false;
  if (value.arc !== undefined && !(TURNED.includes(shape) && Array.isArray(value.arc) && value.arc.length === 2 &&
    value.arc.every(finite) && value.arc[1] > 0 && value.arc[1] < 2 * Math.PI)) return false;
  if (value.smooth !== undefined && typeof value.smooth !== "boolean") return false;
  // Only a loft has a shell; an extrude or sweep is always solid.
  if ((shape === "extrude" || shape === "sweep") && value.wall !== undefined) return false;
  if (shape === "extrude") {
    if (!fractionPoints(value.outline, 3, 128) || outlineArea(value.outline) <= 0 || !simpleOutline(value.outline)) return false;
    const bevel = value.bevel;
    return bevel === undefined || (Array.isArray(bevel) && bevel.length === 2 && bevel.every(finite) && bevel[0] >= 0 && bevel[1] >= 0 &&
      bevel[1] <= size[2] / 2 + 1e-9);
  }
  if (shape === "sweep") {
    const { path, radius, aspect } = value;
    return Array.isArray(path) && path.length >= 2 && path.length <= 32 && path.every((p) => vector(p) && p.every(fraction)) &&
      Array.isArray(radius) && radius.length === path.length && radius.every((r) => finite(r) && r > 0) &&
      (aspect === undefined || (finite(aspect) && aspect > 0));
  }
  if (shape === "loft") {
    const { sections, caps, holes } = value;
    if (!Array.isArray(sections) || sections.length < 2 || sections.length > 16) return false;
    if (!sections.every((s) => record(s) && fraction(s.z) && fractionPoints(s.outline, 3, 48) && outlineArea(s.outline) >= -1e-9)) return false;
    const n = sections[0].outline.length;
    if (!sections.every((s, i) => s.outline.length === n && (i === 0 || s.z > sections[i - 1].z))) return false;
    if (caps !== undefined && !(caps === "both" || caps === "none" || caps === "top" || caps === "bottom")) return false;
    return holes === undefined || (Array.isArray(holes) && holes.every((h) => Array.isArray(h) && h.length === 4 && h.every(whole) &&
      h[0] >= 0 && h[0] < h[1] && h[1] < sections.length && h[2] >= 0 && h[2] < n && h[3] >= 0 && h[3] < n && h[2] !== h[3]));
  }
  return true;
}

function validFormPart(value: unknown): value is LayoutFormPart {
  if (!record(value) || !vector(value.center) || !vector(value.size) || !value.size.every((n) => n > 0)) return false;
  const shape = value.shape;
  if (typeof shape !== "string" || !SHAPES.includes(shape as LayoutPartShape)) return false;
  if (shape === "cone" && !fraction(value.top)) return false;
  if (shape === "lathe" && !(Array.isArray(value.profile) && value.profile.length >= 2 &&
    value.profile.every((point: unknown) => Array.isArray(point) && point.length === 2 && point.every(fraction)))) return false;
  if (!validShapeFields(value, shape as LayoutPartShape, value.size)) return false;
  if (value.wall !== undefined) {
    const [a, b, c] = value.size;
    const closed = shape === "sphere" || shape === "capsule";
    if (!vector(value.wall) || !value.wall.every((n) => n >= 0) || 2 * value.wall[0] >= a || 2 * value.wall[1] >= b ||
      (closed ? 2 : 1) * value.wall[2] >= c) return false;
  }
  if (value.basis !== undefined && !(Array.isArray(value.basis) && value.basis.length === 3 &&
    value.basis.every(unit))) return false;
  const joint = value.joint;
  if (joint !== undefined && !(record(joint) && (joint.type === "hinge" || joint.type === "slide") && unit(joint.axis) &&
    (joint.type === "slide" || vector(joint.origin)) && pair(joint.range) && finite(joint.position) &&
    joint.position >= joint.range[0] - 1e-9 && joint.position <= joint.range[1] + 1e-9)) return false;
  if (value.role !== undefined || value.label !== undefined) {
    if (typeof value.role !== "string" || !value.role.trim() || /[\r\n\0]/.test(value.role) ||
      typeof value.label !== "string" || !value.label.trim()) return false;
  }
  const fitting = value.fitting;
  if (fitting === undefined) return true;
  if (!record(fitting) || !namedTarget(fitting) || typeof fitting.opened !== "boolean" || !Array.isArray(fitting.contents)) return false;
  return (!fitting.command || fitting.command === `${fitting.opened ? "close" : "open"} ${fitting.id}`) &&
    (fitting.opened || fitting.contents.length === 0) && fitting.contents.every((item: unknown) =>
      namedTarget(item) && (!item.command || item.command === `get ${item.id} from ${fitting.id}`));
}

const validFormParts = (value: unknown): value is LayoutFormPart[] => Array.isArray(value) && value.every(validFormPart);
const pair = (value: unknown): value is [number, number] =>
  Array.isArray(value) && value.length === 2 && value.every(finite) && value[1] >= value[0];
const shape = (value: unknown): value is LayoutShape => record(value) && (
  (Array.isArray(value.box) && value.box.length === 3 && value.box.every(pair)) ||
  (Array.isArray(value.sphere) && value.sphere.length === 2 && vector(value.sphere[0]) && finite(value.sphere[1]) && value.sphere[1] > 0)
);

export function isLayoutPose(pose: unknown): pose is LayoutPose {
  if (!record(pose)) return false;
  const q = pose.body_quaternion;
  return vector(pose.centre_m) && vector(pose.dimensions_m) && pose.dimensions_m.every((n) => n >= 0) &&
    typeof pose.box === "boolean" && Array.isArray(q) && q.length === 4 && q.every(finite) &&
    Number.isFinite(Math.hypot(...q)) && Math.hypot(...q) > 0 &&
    (pose.figure_height_m === undefined || (finite(pose.figure_height_m) && pose.figure_height_m > 0)) &&
    (pose.posture === undefined || pose.posture === "standing" || pose.posture === "sitting" || pose.posture === "reclining");
}

function body(value: unknown): value is LayoutBody {
  return record(value) && typeof value.id === "string" && typeof value.lifetime === "string" && isLayoutPose(value.pose) &&
    Array.isArray(value.shapes) && value.shapes.every(shape) &&
    (value.form_parts === undefined || validFormParts(value.form_parts)) &&
    (value.front === undefined || (record(value.front) && vector(value.front.axis) &&
      finite(value.front.yaw) && typeof value.front.direction === "string")) &&
    (value.relation === undefined || (record(value.relation) && typeof value.relation.kind === "string" &&
      typeof value.relation.target === "string" && typeof value.relation.text === "string"));
}

function layoutUpdate(value: unknown): value is RoomLayoutUpdate {
  return record(value) && finite(value.num) && typeof value.room_lifetime === "string" &&
    Array.isArray(value.bodies) && value.bodies.every(body);
}

const GMCPRoomBase = GMCPPackage.with({
  packageName: "Room",
  messages: [
    inbound(roomInfo),
    inbound(roomWrongDir),
    inbound(roomPlayers),
    inbound(roomAddPlayer),
    inbound(roomRemovePlayer),
    inbound(roomLayout),
    inbound(roomLayoutUpdate),
  ] as const,
});

export class GMCPRoom extends GMCPRoomBase {
  public name: string = "";
  public id: string = "";
  public exits: string[] = [];
  public people: string[] = [];

  constructor(client: ConstructorParameters<typeof GMCPRoomBase>[0]) {
    super(client);
    this.on("info", (data) => this.handleInfo(data));
    this.on("wrongDir", (data) => this.handleWrongDir(data));
    this.on("players", (data) => this.handlePlayers(data));
    this.on("addPlayer", (data) => this.handleAddPlayer(data));
    this.on("removePlayer", (data) => this.handleRemovePlayer(data));
    this.on("layout", (data) => useRoomStore.getState().setRoomLayout({
      ...data,
      things: data.things.map((thing) => thing.form_parts === undefined || validFormParts(thing.form_parts)
        ? thing : { ...thing, form_parts: undefined }),
    }));
    this.on("layoutUpdate", (data) => {
      if (layoutUpdate(data)) useRoomStore.getState().updateRoomLayout(data);
    });
  }

  handleInfo(data: GMCPMessageRoomInfo): void {
    this.name = data.name;
    this.id = data.num.toString(); // Store as string if needed elsewhere
    useSessionStore.getState().setRoomId(this.id);
    // setRoomInfo replaces the room and clears the player list for the new room.
    useRoomStore.getState().setRoomInfo(data);
    // TODO: Update other room properties (exits, area, etc.) based on data
    console.log("Received Room.Info:", data);
  }

  handleWrongDir(direction: string): void {
    console.log(`Received Room.WrongDir: ${direction}`);
    // TODO: Indicate failed movement attempt in UI?
  }

  handlePlayers(players: RoomPlayer[]): void {
    console.log("Received Room.Players:", players);
    useRoomStore.getState().setRoomPlayers(players);
  }

  handleAddPlayer(player: RoomPlayer): void {
    console.log("Received Room.AddPlayer:", player);
    useRoomStore.getState().addPlayer(player);
  }

  handleRemovePlayer(playerName: string): void {
    // playerName is the ID (name property of RoomPlayer)
    // Docs example shows just the name string
    console.log("Received Room.RemovePlayer:", playerName);
    useRoomStore.getState().removePlayer(playerName);
  }

  override reset(): void {
    this.name = "";
    this.id = "";
    this.exits = [];
    this.people = [];
    useRoomStore.getState().reset();
    useMapStore.getState().reset();
  }
}
