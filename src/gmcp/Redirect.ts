import { inbound } from "../protocol/messages";
import { gmcpJsonMessage } from "./messages";
import { GMCPPackage } from "./package";

const redirectWindow = gmcpJsonMessage<"Window", string>("Window");

const GMCPRedirectBase = GMCPPackage.with({
    packageName: "Redirect",
    messages: [inbound(redirectWindow)] as const,
});

export class GMCPRedirect extends GMCPRedirectBase {
    constructor(client: ConstructorParameters<typeof GMCPRedirectBase>[0]) {
        super(client);
        this.on("window", (windowName) => this.handleWindow(windowName));
    }

    // Handler for Redirect.Window
    handleWindow(windowName: string): void {
        const targetWindow = windowName || "main"; // Default to "main" if empty
        console.log(`Received Redirect.Window: ${targetWindow}`);
        // TODO: Implement logic to redirect subsequent output to the specified window/pane
    }

    // No client messages defined in IRE docs for this package
}
