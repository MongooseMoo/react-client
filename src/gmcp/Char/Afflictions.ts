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


export class GMCPCharAfflictions extends GMCPPackage {
    public packageName: string = "Char.Afflictions";

    // Handler for the full list of afflictions
    handleList(data: Affliction[]): void {
        console.log("Received Char.Afflictions.List:", data);
        // TODO: Replace current afflictions list with this data
        this.client.emit("afflictionsList", data);
    }

    // Handler for adding a single affliction
    handleAdd(data: Affliction): void {
        console.log("Received Char.Afflictions.Add:", data);
        // TODO: Add this affliction to the list
        this.client.emit("afflictionAdd", data);
    }

    // Handler for removing afflictions (by name)
    handleRemove(data: string[]): void {
        console.log("Received Char.Afflictions.Remove:", data);
        // TODO: Remove these afflictions from the list
        this.client.emit("afflictionRemove", data);
    }

    // No client-side messages defined in the docs for this package
}
