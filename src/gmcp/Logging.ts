import { inbound } from "../protocol/messages";
import { gmcpJsonMessage } from "./messages";
import { GMCPMessage, GMCPPackage } from "./package";

// Data structure is not defined in the provided docs, using 'any' for now.
export class GMCPMessageLoggingError extends GMCPMessage {
    [key: string]: unknown; // Represents error information
}

const loggingError = gmcpJsonMessage<"Error", GMCPMessageLoggingError>("Error");

const GMCPLoggingBase = GMCPPackage.with({
    packageName: "Logging",
    messages: [inbound(loggingError)] as const,
});

export class GMCPLogging extends GMCPLoggingBase {
    constructor(client: ConstructorParameters<typeof GMCPLoggingBase>[0]) {
        super(client);
        this.on("error", (data) => this.handleError(data));
    }

    // Handler for broadcast messages for Logging.Error
    handleError(data: GMCPMessageLoggingError): void {
        console.error("Received Logging.Error from server:", data);
        // TODO: Implement logic to display or handle the error
    }

    // No request method as it's broadcast only
}
