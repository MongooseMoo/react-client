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

export class GMCPRoom extends GMCPPackage {
    public packageName: string = "Room"; // Corrected: packageName should be instance property
    public name: string = "";
    public id: string = "";
    public exits: string[] = [];
    public people: string[] = [];

    handleInfo(data: GMCPMessageRoomInfo): void {
        this.name = data.name;
        this.name = data.name;
        this.id = data.num.toString(); // Store as string if needed elsewhere
        this.client.worldData.roomId = this.id;
        this.client.currentRoomInfo = data; // Store the data on the client
        // TODO: Update other room properties (exits, area, etc.) based on data
        console.log("Received Room.Info:", data);
        this.client.emit("roomInfo", data); // Emit the full data for live updates
    }

    handleWrongDir(direction: string): void {
        console.log(`Received Room.WrongDir: ${direction}`);
        // TODO: Indicate failed movement attempt in UI?
        this.client.emit("roomWrongDir", direction);
    }

    handlePlayers(players: RoomPlayer[]): void {
        console.log("Received Room.Players:", players);
        // TODO: Update the list of players in the room
        this.client.emit("roomPlayers", players);
    }

    handleAddPlayer(player: RoomPlayer): void {
        console.log("Received Room.AddPlayer:", player);
        // TODO: Add player to the room list
        this.client.emit("roomAddPlayer", player);
    }

    handleRemovePlayer(playerName: string): void {
        // Docs example shows just the name string
        console.log("Received Room.RemovePlayer:", playerName);
        // TODO: Remove player from the room list
        this.client.emit("roomRemovePlayer", playerName);
    }

}
