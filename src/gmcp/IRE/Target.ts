import { duplex, inbound, outbound } from "../../protocol/messages";
import { gmcpJsonMessage } from "../messages";
import { GMCPPackage } from "../package";

export interface TargetInfo {
    id: string; // Example shows string ID
    short_desc: string;
    hpperc: string; // Percentage as string
}

const targetSet = gmcpJsonMessage<"Set", string>("Set");
const targetInfo = gmcpJsonMessage<"Info", TargetInfo>("Info");
const targetRequestInfo = gmcpJsonMessage<"RequestInfo", never, void>("RequestInfo");

const GmcPIRETargetBase = GMCPPackage.with({
    packageName: "IRE.Target",
    messages: [
        duplex(targetSet),
        inbound(targetInfo),
        outbound(targetRequestInfo),
    ] as const,
});

export class GmcPIRETarget extends GmcPIRETargetBase {
    constructor(client: ConstructorParameters<typeof GmcPIRETargetBase>[0]) {
        super(client);
        this.on("set", (data) => this.handleSet(data));
        this.on("info", (data) => this.handleInfo(data));
    }

    // --- Server Messages ---
    handleSet(targetId: string): void {
        // Server informs client of target set via cycling (e.g., tab)
        console.log(`Received IRE.Target.Set (from server): ${targetId}`);
        // TODO: Update client-side target display/state
        this.client.emit("targetSet", targetId);
    }

    handleInfo(data: TargetInfo): void {
        console.log("Received IRE.Target.Info:", data);
        // TODO: Update detailed target information display
        this.client.emit("targetInfo", data);
    }
}
