import { inbound } from "../../protocol/messages";
import { gmcpJsonMessage } from "../messages";
import { GMCPMessage, GMCPPackage } from "../package";

export interface Affliction {
    name: string;
    cure: string;
    desc: string;
}

export class GMCPMessageCharAfflictionsList extends GMCPMessage {
    afflictions: Affliction[] = [];
}

export class GMCPMessageCharAfflictionsAdd extends GMCPMessage implements Affliction {
    name: string = "";
    cure: string = "";
    desc: string = "";
}

export class GMCPMessageCharAfflictionsRemove extends GMCPMessage {
    names: string[] = [];
}


const afflictionsList = gmcpJsonMessage<"List", Affliction[]>("List");
const afflictionsAdd = gmcpJsonMessage<"Add", Affliction>("Add");
const afflictionsRemove = gmcpJsonMessage<"Remove", string[]>("Remove");

const GMCPCharAfflictionsBase = GMCPPackage.with({
    packageName: "Char.Afflictions",
    messages: [
        inbound(afflictionsList),
        inbound(afflictionsAdd),
        inbound(afflictionsRemove),
    ] as const,
});

export class GMCPCharAfflictions extends GMCPCharAfflictionsBase {
    constructor(client: ConstructorParameters<typeof GMCPCharAfflictionsBase>[0]) {
        super(client);
        this.on("list", (data) => this.handleList(data));
        this.on("add", (data) => this.handleAdd(data));
        this.on("remove", (data) => this.handleRemove(data));
    }

    // Handler for the full list of afflictions
    handleList(data: Affliction[]): void {
        console.log("Received Char.Afflictions.List:", data);
        // TODO: Replace current afflictions list with this data
    }

    // Handler for adding a single affliction
    handleAdd(data: Affliction): void {
        console.log("Received Char.Afflictions.Add:", data);
        // TODO: Add this affliction to the list
    }

    // Handler for removing afflictions (by name)
    handleRemove(data: string[]): void {
        console.log("Received Char.Afflictions.Remove:", data);
        // TODO: Remove these afflictions from the list
    }

    // No client-side messages defined in the docs for this package
}
