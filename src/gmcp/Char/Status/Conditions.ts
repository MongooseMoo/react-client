import { duplex } from "../../../protocol/messages";
import { gmcpJsonMessage } from "../../messages";
import { GMCPMessage, GMCPPackage } from "../../package";

// Data structure is not defined in the provided docs, using 'any' for now.
export class GMCPMessageCharStatusConditions extends GMCPMessage {
    [key: string]: unknown; // Represents conditions
}

const conditions = gmcpJsonMessage<
    "Conditions",
    GMCPMessageCharStatusConditions,
    Record<string, never>
>("Conditions");

const GMCPCharStatusConditionsBase = GMCPPackage.with({
    packageName: "Char.Status.Conditions",
    messages: [duplex(conditions)] as const,
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
}
