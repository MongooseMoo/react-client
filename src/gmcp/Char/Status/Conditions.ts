import { inbound } from "../../../protocol/messages";
import { gmcpJsonMessage } from "../../messages";
import { GMCPMessage, GMCPPackage } from "../../package";

// Data structure is not defined in the provided docs, using 'any' for now.
export class GMCPMessageCharStatusConditions extends GMCPMessage {
    [key: string]: unknown; // Represents conditions
}

const conditions = gmcpJsonMessage<"Conditions", GMCPMessageCharStatusConditions>("Conditions");

const GMCPCharStatusConditionsBase = GMCPPackage.with({
    packageName: "Char.Status.Conditions",
    messages: [inbound(conditions)] as const,
});

export class GMCPCharStatusConditions extends GMCPCharStatusConditionsBase {
    constructor(client: ConstructorParameters<typeof GMCPCharStatusConditionsBase>[0]) {
        super(client);
        this.on("conditions", (data) => this.handleConditions(data));
    }

    // Handler for response messages
    handleConditions(data: GMCPMessageCharStatusConditions): void {
        console.log("Received Char.Status.Conditions:", data);
        // TODO: Implement logic to handle conditions data
        this.client.emit("statusConditions", data); // Example: emit an event
    }

    // Method to request conditions data
    sendConditionsRequest(): void {
        // The message name is just the last part
        this.sendData("Conditions", {}); // Send empty object as per docs
    }
}
