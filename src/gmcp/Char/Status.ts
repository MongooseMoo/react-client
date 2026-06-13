import { duplex } from "../../protocol/messages";
import { gmcpJsonMessage } from "../messages";
import { GMCPMessage, GMCPPackage } from "../package";

// Data structure is not defined in the provided docs, using 'any' for now.
// Should contain conditions, affects, timers.
export class GMCPMessageCharStatus extends GMCPMessage {
    [key: string]: unknown;
}

const charStatus = gmcpJsonMessage<"Status", GMCPMessageCharStatus, Record<string, never>>("Status");

const GMCPCharStatusBase = GMCPPackage.with({
    packageName: "Char.Status",
    messages: [duplex(charStatus)] as const,
});

export class GMCPCharStatus extends GMCPCharStatusBase {
    constructor(client: ConstructorParameters<typeof GMCPCharStatusBase>[0]) {
        super(client);
        this.on("status", (data) => this.handleStatus(data));
    }

    // Handler for response messages
    handleStatus(data: GMCPMessageCharStatus): void {
        console.log("Received Char.Status:", data);
        // TODO: Implement logic to handle status data
        this.client.emit("status", data); // Example: emit an event
    }
}
