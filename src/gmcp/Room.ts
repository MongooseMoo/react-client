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

/** Authored boxes in metres, relative to the centre and axes of the host's pose. */
export interface LayoutFormBox {
  center: LayoutVector;
  size: LayoutVector;
  basis?: [LayoutVector, LayoutVector, LayoutVector];
  role?: string;
  label?: string;
  fitting?: LayoutFitting;
}

export interface LayoutBody {
  id: string;
  lifetime: string;
  pose: LayoutPose;
  shapes: LayoutShape[];
  front?: LayoutFront;
  relation?: LayoutRelation;
  form_boxes?: LayoutFormBox[];
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
  form_boxes?: LayoutFormBox[];
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

function validFormBox(value: unknown): value is LayoutFormBox {
  if (!record(value) || !vector(value.center) || !vector(value.size) || !value.size.every((n) => n > 0)) return false;
  if (value.basis !== undefined && !(Array.isArray(value.basis) && value.basis.length === 3 &&
    value.basis.every((axis) => vector(axis) && Math.abs(Math.hypot(...axis) - 1) < 0.001))) return false;
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

const validFormBoxes = (value: unknown): value is LayoutFormBox[] => Array.isArray(value) && value.every(validFormBox);
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
    (value.form_boxes === undefined || validFormBoxes(value.form_boxes)) &&
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
      things: data.things.map((thing) => thing.form_boxes === undefined || validFormBoxes(thing.form_boxes)
        ? thing : { ...thing, form_boxes: undefined }),
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
