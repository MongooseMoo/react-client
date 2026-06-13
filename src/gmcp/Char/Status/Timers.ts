import { inbound } from "../../../protocol/messages";
import { gmcpJsonMessage } from "../../messages";
import { GMCPMessage, GMCPPackage } from "../../package";

// Data structure is not defined in the provided docs, using 'any' for now.
export class GMCPMessageCharStatusTimers extends GMCPMessage {
    [key: string]: unknown; // Represents timers
}

const timers = gmcpJsonMessage<"Timers", GMCPMessageCharStatusTimers>("Timers");

const GMCPCharStatusTimersBase = GMCPPackage.with({
    packageName: "Char.Status.Timers",
    messages: [inbound(timers)] as const,
});

export class GMCPCharStatusTimers extends GMCPCharStatusTimersBase {
    constructor(client: ConstructorParameters<typeof GMCPCharStatusTimersBase>[0]) {
        super(client);
        this.on("timers", (data) => this.handleTimers(data));
    }

    // Handler for response messages
    handleTimers(data: GMCPMessageCharStatusTimers): void {
        console.log("Received Char.Status.Timers:", data);
        // TODO: Implement logic to handle timers data
        this.client.emit("statusTimers", data); // Example: emit an event
    }

    // Method to request timers data
    sendTimersRequest(): void {
        this.sendData("Timers", {}); // Send empty object as per docs
    }
}
