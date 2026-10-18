import { duplex } from "../protocol/messages";
import { gmcpJsonMessage } from "./messages";
import { GMCPMessage, GMCPPackage } from "./package";

// Data structure is not defined in the provided docs, using 'any' for now.
// Should contain group info as seen in the GROUP command.
export class GMCPMessageGroupInfo extends GMCPMessage {
    [key: string]: unknown;
}

const groupInfo = gmcpJsonMessage<"Info", GMCPMessageGroupInfo, Record<string, never>>("Info");

const GMCPGroupBase = GMCPPackage.with({
    packageName: "Group",
    messages: [duplex(groupInfo)] as const,
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
    }
}
