import { GMCPMessage, GMCPPackage } from "../package";
import { useLiveKitStore } from "../../stores/liveKitStore";

export class GMCPMessageCommLiveKitToken extends GMCPMessage {
    token: string = "";
}

export class GMCPCommLiveKit extends GMCPPackage {
    public packageName: string = "Comm.LiveKit";

    handleroom_token(data: GMCPMessageCommLiveKitToken): void {
        useLiveKitStore.getState().addToken(data.token);
        this.client.emit("livekitToken", data.token);
    }

    handleroom_leave(data: GMCPMessageCommLiveKitToken): void {
        useLiveKitStore.getState().removeToken(data.token);
        this.client.emit("livekitLeave", data.token);
    }
}
