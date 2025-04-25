import { GMCPMessage, GMCPPackage } from "./package";

export class GMCPRedirect extends GMCPPackage {
    public packageName: string = "Redirect";

    // Handler for Redirect.Window
    handleWindow(windowName: string): void {
        const targetWindow = windowName || "main"; // Default to "main" if empty
        console.log(`Received Redirect.Window: ${targetWindow}`);
        // TODO: Implement logic to redirect subsequent output to the specified window/pane
        this.client.emit("redirectWindow", targetWindow);
    }

    // No client messages defined in IRE docs for this package
}
