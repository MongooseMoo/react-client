import { GMCPMessage, GMCPPackage } from "../package";

export interface RiftItem {
    name: string;
    amount: number; // Docs say number
    desc: string;
}

export class GmcPIRERift extends GMCPPackage {
    public packageName: string = "IRE.Rift";

    // --- Server Messages ---
    handleList(items: RiftItem[]): void {
        console.log("Received IRE.Rift.List:", items);
        // TODO: Update rift item list display
        this.client.emit("riftList", items);
    }

    handleChange(item: RiftItem): void {
        console.log("Received IRE.Rift.Change:", item);
        // TODO: Update specific item amount/info in rift display
        this.client.emit("riftChange", item);
    }

    // --- Client Messages ---
    sendRequest(): void {
        this.sendData("Request"); // No body needed
    }
}
