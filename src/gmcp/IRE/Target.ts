import { GMCPMessage, GMCPPackage } from "../package";

export interface TargetInfo {
    id: string; // Example shows string ID
    short_desc: string;
    hpperc: string; // Percentage as string
}

export class GmcPIRETarget extends GMCPPackage {
    public packageName: string = "IRE.Target";

    // --- Server Messages ---
    handleSet(targetId: string): void {
        // Server informs client of target set via cycling (e.g., tab)
        console.log(`Received IRE.Target.Set (from server): ${targetId}`);
        // TODO: Update client-side target display/state
        this.client.emit("targetSet", targetId);
    }

    handleInfo(data: TargetInfo): void {
        console.log("Received IRE.Target.Info:", data);
        // TODO: Update detailed target information display
        this.client.emit("targetInfo", data);
    }

    // --- Client Messages ---
    sendSet(targetId: string): void {
        // Client informs server of manually set target
        this.sendData("Set", targetId);
    }

    // IRE.Target.Request is mentioned but not defined in the docs provided.
    // Assuming it might be intended to request IRE.Target.Info.
    sendRequestInfo(): void {
        // This is an assumption based on the pattern.
        // The actual message name might differ or not exist.
        console.warn("Sending hypothetical IRE.Target.RequestInfo - verify actual message if needed.");
        this.sendData("RequestInfo"); // Hypothetical message name
    }
}
