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

const GMCPRoomBase = GMCPPackage.with({
  packageName: "Room",
  messages: [
    inbound(roomInfo),
    inbound(roomWrongDir),
    inbound(roomPlayers),
    inbound(roomAddPlayer),
    inbound(roomRemovePlayer),
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
}
