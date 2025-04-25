import { GMCPMessage, GMCPPackage } from "./package";

// Data structure is not defined in the provided docs, using 'any' for now.
// Should contain group info as seen in the GROUP command.
export class GMCPMessageGroupInfo extends GMCPMessage {
    [key: string]: any;
}

export class GMCPGroup extends GMCPPackage {
    public packageName: string = "Group"; // Assuming base package is "Group"

    // Handler for response messages for Group.Info
    handleInfo(data: GMCPMessageGroupInfo): void {
        console.log("Received Group.Info:", data);
        // TODO: Implement logic to handle group info data
        this.client.emit("groupInfo", data); // Example: emit an event
    }

    // Method to request group info data
    sendInfoRequest(): void {
        this.sendData("Info", {}); // Send empty object as per docs
    }
}
