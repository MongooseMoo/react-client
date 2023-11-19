import { GMCPMessage, GMCPPackage } from "./package";

export class GMCPMessageRoomInfo extends GMCPMessage {
    num: string = "";
    name: string = "";
    area: string = "";
}

export class GMCPRoom extends GMCPPackage {
    public static readonly packageName: string = "Room";
    public name: string = "";
    public id: string = "";
    public exits: string[] = [];
    public people: string[] = [];

    handleInfo(data: GMCPMessageRoomInfo): void {
        this.name = data.name;
        this.id = data.num;
        this.client.worldData.roomId = this.id;
        this.client.emit("room", this);
    }
}