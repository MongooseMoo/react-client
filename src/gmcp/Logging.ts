import { GMCPMessage, GMCPPackage } from "./package";

// Data structure is not defined in the provided docs, using 'any' for now.
export class GMCPMessageLoggingError extends GMCPMessage {
    [key: string]: any; // Represents error information
}

export class GMCPLogging extends GMCPPackage {
    public packageName: string = "Logging"; // Assuming base package is "Logging"

    // Handler for broadcast messages for Logging.Error
    handleError(data: GMCPMessageLoggingError): void {
        console.error("Received Logging.Error from server:", data);
        // TODO: Implement logic to display or handle the error
        this.client.emit("gmcpError", data); // Example: emit an event
    }

    // No request method as it's broadcast only
}
