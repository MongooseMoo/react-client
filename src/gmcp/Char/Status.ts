import { GMCPMessage, GMCPPackage } from "../package";

// Data structure is not defined in the provided docs, using 'any' for now.
// Should contain conditions, affects, timers.
export class GMCPMessageCharStatus extends GMCPMessage {
    [key: string]: any;
}

export class GMCPCharStatus extends GMCPPackage {
    public packageName: string = "Char.Status";

    // Handler for response messages
    handleStatus(data: GMCPMessageCharStatus): void {
        console.log("Received Char.Status:", data);
        // TODO: Implement logic to handle status data
        this.client.emit("status", data); // Example: emit an event
    }

    // Method to request status data
    sendStatusRequest(): void {
        this.sendData("Status", {}); // Send empty object as per docs
    }
}
