import { inbound, outbound } from "../../protocol/messages";
import { gmcpJsonMessage } from "../messages";
import { GMCPPackage } from "../package";

export interface RiftItem {
    name: string;
    amount: number; // Docs say number
    desc: string;
}

const riftList = gmcpJsonMessage<"List", RiftItem[]>("List");
const riftChange = gmcpJsonMessage<"Change", RiftItem>("Change");
const riftRequest = gmcpJsonMessage<"Request", never, void>("Request");

const GmcPIRERiftBase = GMCPPackage.with({
    packageName: "IRE.Rift",
    messages: [
        inbound(riftList),
        inbound(riftChange),
        outbound(riftRequest),
    ] as const,
});

export class GmcPIRERift extends GmcPIRERiftBase {
    constructor(client: ConstructorParameters<typeof GmcPIRERiftBase>[0]) {
        super(client);
        this.on("list", (data) => this.handleList(data));
        this.on("change", (data) => this.handleChange(data));
    }

    // --- Server Messages ---
    handleList(items: RiftItem[]): void {
        console.log("Received IRE.Rift.List:", items);
        // TODO: Update rift item list display
    }

    handleChange(item: RiftItem): void {
        console.log("Received IRE.Rift.Change:", item);
        // TODO: Update specific item amount/info in rift display
    }
}
