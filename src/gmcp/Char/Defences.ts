import { GMCPMessage, GMCPPackage } from "../package";

export interface Defence {
    name: string;
    desc: string;
}

export class GMCPMessageCharDefencesList extends GMCPMessage {
    defences: Defence[] = [];
}

export class GMCPMessageCharDefencesAdd extends GMCPMessage implements Defence {
    name: string = "";
    desc: string = "";
}

export class GMCPMessageCharDefencesRemove extends GMCPMessage {
    names: string[] = [];
}

export class GMCPCharDefences extends GMCPPackage {
    public packageName: string = "Char.Defences";

    // Handler for the full list of defences
    handleList(data: Defence[]): void {
        console.log("Received Char.Defences.List:", data);
        // TODO: Replace current defences list with this data
        this.client.emit("defencesList", data);
    }

    // Handler for adding a single defence
    handleAdd(data: Defence): void {
        console.log("Received Char.Defences.Add:", data);
        // TODO: Add this defence to the list
        this.client.emit("defenceAdd", data);
    }

    // Handler for removing defences (by name)
    handleRemove(data: string[]): void {
        console.log("Received Char.Defences.Remove:", data);
        // TODO: Remove these defences from the list
        this.client.emit("defenceRemove", data);
    }

    // No client-side messages defined in the docs for this package
}
