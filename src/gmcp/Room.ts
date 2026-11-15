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
}

/** A Room.Layout point or extent: metres, room-local MOO frame (x east, y north, z up). */
export type LayoutVector = [number, number, number];

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
}

export interface LayoutThing {
  /** `tostr(obj)`, the same id Client.Spatial uses. */
  id: string;
  name: string;
  kind: "player" | "person" | "object";
  fixed: boolean;
  mounted: boolean;
  shapes: LayoutShape[];
  /** Where Client.Spatial places this thing when the layout was built (its `:sound_origin()`). Without it the thing is not moved. */
  origin?: LayoutVector;
}

/** Mongoose `Room.Layout`: the inside of a spatial room, drawn by the client. See docs/room-layout.md. */
export interface RoomLayout {
  num: number;
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

const GMCPRoomBase = GMCPPackage.with({
  packageName: "Room",
  messages: [
    inbound(roomInfo),
    inbound(roomWrongDir),
    inbound(roomPlayers),
    inbound(roomAddPlayer),
    inbound(roomRemovePlayer),
    inbound(roomLayout),
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
    this.on("layout", (data) => useRoomStore.getState().setRoomLayout(data));
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
