import { inbound } from "../../../protocol/messages";
import { gmcpJsonMessage } from "../../messages";
import { GMCPMessage, GMCPPackage } from "../../package";

// Data structure is not defined in the provided docs, using 'any' for now.
export class GMCPMessageCharStatusAffectedBy extends GMCPMessage {
    [key: string]: unknown; // Represents affects
}

const affectedBy = gmcpJsonMessage<"AffectedBy", GMCPMessageCharStatusAffectedBy>("AffectedBy");

const GMCPCharStatusAffectedByBase = GMCPPackage.with({
    packageName: "Char.Status.AffectedBy",
    messages: [inbound(affectedBy)] as const,
});

export class GMCPCharStatusAffectedBy extends GMCPCharStatusAffectedByBase {
    constructor(client: ConstructorParameters<typeof GMCPCharStatusAffectedByBase>[0]) {
        super(client);
        this.on("affectedBy", (data) => this.handleAffectedBy(data));
    }

    // Handler for response messages
    handleAffectedBy(data: GMCPMessageCharStatusAffectedBy): void {
        console.log("Received Char.Status.AffectedBy:", data);
        // TODO: Implement logic to handle affected by data
        this.client.emit("statusAffectedBy", data); // Example: emit an event
    }

    // Method to request affected by data
    sendAffectedByRequest(): void {
        this.sendData("AffectedBy", {}); // Send empty object as per docs
    }
}
