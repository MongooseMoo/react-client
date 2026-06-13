import { inbound } from "../protocol/messages";
import { gmcpJsonMessage } from "./messages";
import { GMCPMessage, GMCPPackage } from "./package";

// Data structure is not defined in the provided docs, using 'any' for now.
// Should contain group info as seen in the GROUP command.
export class GMCPMessageGroupInfo extends GMCPMessage {
    [key: string]: unknown;
}

const groupInfo = gmcpJsonMessage<"Info", GMCPMessageGroupInfo>("Info");

const GMCPGroupBase = GMCPPackage.with({
    packageName: "Group",
    messages: [inbound(groupInfo)] as const,
});

export class GMCPGroup extends GMCPGroupBase {
    constructor(client: ConstructorParameters<typeof GMCPGroupBase>[0]) {
        super(client);
        this.on("info", (data) => this.handleInfo(data));
    }

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
