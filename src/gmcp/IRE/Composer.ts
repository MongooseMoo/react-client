import { inbound, outbound } from "../../protocol/messages";
import { gmcpJsonMessage } from "../messages";
import { GMCPMessage, GMCPPackage } from "../package";

export class GMCPMessageIREComposerEdit extends GMCPMessage {
    title: string = "";
    text: string = "";
}

export class GMCPMessageIREComposerSetBuffer extends GMCPMessage {
    buffer: string = "";
}

const composerEdit = gmcpJsonMessage<"Edit", GMCPMessageIREComposerEdit>("Edit");
const composerSetBuffer = gmcpJsonMessage<"SetBuffer", never, string>("SetBuffer");

const GmcPIREComposerBase = GMCPPackage.with({
    packageName: "IRE.Composer",
    messages: [
        inbound(composerEdit),
        outbound(composerSetBuffer),
    ] as const,
});

export class GmcPIREComposer extends GmcPIREComposerBase {
    constructor(client: ConstructorParameters<typeof GmcPIREComposerBase>[0]) {
        super(client);
        this.on("edit", (data) => this.handleEdit(data));
    }

    // --- Server Messages ---
    handleEdit(data: GMCPMessageIREComposerEdit): void {
        console.log(`Received IRE.Composer.Edit (Title: ${data.title}):`, data.text);
        // TODO: Open an editor interface with the provided title and text
        this.client.emit("composerEdit", data);
    }

    // Helper for IRE-specific commands (***save, ***quit)
    sendEditorCommand(command: string): void {
        // These are sent as regular commands, not GMCP messages
        this.client.sendCommand(command);
    }
}
