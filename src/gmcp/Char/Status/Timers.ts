import { duplex } from "../../../protocol/messages";
import { gmcpJsonMessage } from "../../messages";
import { GMCPMessage, GMCPPackage } from "../../package";

// Data structure is not defined in the provided docs, using 'any' for now.
export class GMCPMessageCharStatusTimers extends GMCPMessage {
    [key: string]: unknown; // Represents timers
}

const timers = gmcpJsonMessage<
    "Timers",
    GMCPMessageCharStatusTimers,
    Record<string, never>
>("Timers");

const GMCPCharStatusTimersBase = GMCPPackage.with({
    packageName: "Char.Status.Timers",
    messages: [duplex(timers)] as const,
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
    }
}
