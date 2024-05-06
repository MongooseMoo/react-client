import { GMCPMessage, GMCPPackage } from "../package";

export class GMCPMessageCommLiveKitToken extends GMCPMessage {
    token: string = "";
}

export class GMCPCommLiveKit extends GMCPPackage {
    public packageName: string = "Comm.LiveKit";

    handleroom_token(data: GMCPMessageCommLiveKitToken): void {
        this.client.worldData.liveKitTokens.push(data.token);
        this.client.emit("livekitToken", data.token);
    }

    handleroom_leave(data: GMCPMessageCommLiveKitToken): void {
        this.client.worldData.liveKitTokens = this.client.worldData.liveKitTokens.filter((token) => token !== data.token);
        this.client.emit("livekitLeave", data.token);
    }
}
