import { GMCPMessage, GMCPPackage } from "../../package";

// Data structure is not defined in the provided docs, using 'any' for now.
export class GMCPMessageCharStatusAffectedBy extends GMCPMessage {
    [key: string]: any; // Represents affects
}

export class GMCPCharStatusAffectedBy extends GMCPPackage {
    public packageName: string = "Char.Status.AffectedBy";

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
