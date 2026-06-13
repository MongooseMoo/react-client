import { inbound } from "../../protocol/messages";
import { GMCPMessage, GMCPPackage } from "../package";
import { useLiveKitStore } from "../../stores/liveKitStore";
import { gmcpJsonMessage } from "../messages";

export class GMCPMessageCommLiveKitToken extends GMCPMessage {
    token: string = "";
}

const roomToken = gmcpJsonMessage<"room_token", GMCPMessageCommLiveKitToken>("room_token");
const roomLeave = gmcpJsonMessage<"room_leave", GMCPMessageCommLiveKitToken>("room_leave");

const GMCPCommLiveKitBase = GMCPPackage.with({
    packageName: "Comm.LiveKit",
    messages: [inbound(roomToken), inbound(roomLeave)] as const,
});

export class GMCPCommLiveKit extends GMCPCommLiveKitBase {
    constructor(client: ConstructorParameters<typeof GMCPCommLiveKitBase>[0]) {
        super(client);
        this.on("roomToken", (data) => this.handleroom_token(data));
        this.on("roomLeave", (data) => this.handleroom_leave(data));
    }

    handleroom_token(data: GMCPMessageCommLiveKitToken): void {
        useLiveKitStore.getState().addToken(data.token);
        this.client.emit("livekitToken", data.token);
    }

    handleroom_leave(data: GMCPMessageCommLiveKitToken): void {
        useLiveKitStore.getState().removeToken(data.token);
        this.client.emit("livekitLeave", data.token);
    }
}
