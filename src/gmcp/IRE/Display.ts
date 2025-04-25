import { GMCPMessage, GMCPPackage } from "../package";

export class GmcPIREDisplay extends GMCPPackage {
    public packageName: string = "IRE.Display";

    handleFixedFont(state: "start" | "stop"): void {
        console.log(`Received IRE.Display.FixedFont: ${state}`);
        // TODO: Toggle fixed-width font rendering for subsequent output
        this.client.emit("displayFixedFont", state);
    }

    handleOhmap(state: "start" | "stop"): void {
        console.log(`Received IRE.Display.Ohmap: ${state}`);
        // TODO: Toggle handling of overhead map data
        this.client.emit("displayOhmap", state);
    }

    // No client messages defined
}
