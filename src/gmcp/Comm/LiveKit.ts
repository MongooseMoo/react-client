import { inbound } from "../../protocol/messages";
import { GMCPMessage, GMCPPackage } from "../package";
import { type LiveKitRoom, useLiveKitStore } from "../../stores/liveKitStore";
import { gmcpJsonMessage } from "../messages";

export class GMCPMessageCommLiveKitToken extends GMCPMessage {
    token: string = "";
}

function tokenField(raw: unknown, what: string): string {
    const token = (raw as { token?: unknown } | null)?.token;
    if (typeof token !== "string") {
        throw new TypeError(`${what}.token must be a string`);
    }
    return token;
}

/**
 * `room_token {token, chain?, send?}`: `chain` and `send` mean what they do on
 * `Client.Media.Play`. Checked here so a bad frame never reaches the audio graph.
 */
export function decodeRoomToken(raw: unknown): LiveKitRoom {
    const what = "Comm.LiveKit.room_token";
    const room: LiveKitRoom = { token: tokenField(raw, what) };
    const { chain, send } = raw as { chain?: unknown; send?: unknown };
    if (chain !== undefined) {
        if (typeof chain !== "string") {
            throw new TypeError(`${what}.chain must be a string`);
        }
        if (chain) {
            room.chain = chain;
        }
    }
    if (send !== undefined) {
        if (typeof send !== "number" || !(send >= 0 && send <= 1)) {
            throw new TypeError(`${what}.send must be a number within 0..1`);
        }
        if (!room.chain) {
            throw new TypeError(`${what}.send requires a chain`);
        }
        room.send = send;
    }
    return room;
}

const roomToken = gmcpJsonMessage<"room_token", LiveKitRoom>("room_token", {
    decode: decodeRoomToken,
    encode: (payload: LiveKitRoom): unknown => payload,
});
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

    handleroom_token(data: LiveKitRoom): void {
        useLiveKitStore.getState().setRoom(data);
    }

    handleroom_leave(data: GMCPMessageCommLiveKitToken): void {
        useLiveKitStore.getState().removeToken(data.token);
    }

    override reset(): void {
        useLiveKitStore.getState().reset();
    }
}
