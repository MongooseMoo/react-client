import { inbound } from "../../protocol/messages";
import { gmcpJsonMessage } from "../messages";
import { GMCPPackage } from "../package";

const displayFixedFont = gmcpJsonMessage<"FixedFont", "start" | "stop">("FixedFont");
const displayOhmap = gmcpJsonMessage<"Ohmap", "start" | "stop">("Ohmap");

const GmcPIREDisplayBase = GMCPPackage.with({
    packageName: "IRE.Display",
    messages: [
        inbound(displayFixedFont),
        inbound(displayOhmap),
    ] as const,
});

export class GmcPIREDisplay extends GmcPIREDisplayBase {
    constructor(client: ConstructorParameters<typeof GmcPIREDisplayBase>[0]) {
        super(client);
        this.on("fixedFont", (data) => this.handleFixedFont(data));
        this.on("ohmap", (data) => this.handleOhmap(data));
    }

    handleFixedFont(state: "start" | "stop"): void {
        console.log(`Received IRE.Display.FixedFont: ${state}`);
        // TODO: Toggle fixed-width font rendering for subsequent output
    }

    handleOhmap(state: "start" | "stop"): void {
        console.log(`Received IRE.Display.Ohmap: ${state}`);
        // TODO: Toggle handling of overhead map data
    }

    // No client messages defined
}
