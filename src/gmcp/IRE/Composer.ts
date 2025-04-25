import { GMCPMessage, GMCPPackage } from "../package";

export class GMCPMessageIREComposerEdit extends GMCPMessage {
    title: string = "";
    text: string = "";
}

export class GMCPMessageIREComposerSetBuffer extends GMCPMessage {
    buffer: string = "";
}

export class GmcPIREComposer extends GMCPPackage {
    public packageName: string = "IRE.Composer";

    // --- Server Messages ---
    handleEdit(data: GMCPMessageIREComposerEdit): void {
        console.log(`Received IRE.Composer.Edit (Title: ${data.title}):`, data.text);
        // TODO: Open an editor interface with the provided title and text
        this.client.emit("composerEdit", data);
    }

    // --- Client Messages ---
    sendSetBuffer(text: string): void {
        // Note: IRE docs example shows just the string, not an object.
        // Let's follow the example.
        this.sendData("SetBuffer", text);
    }

    // Helper for IRE-specific commands (***save, ***quit)
    sendEditorCommand(command: string): void {
        // These are sent as regular commands, not GMCP messages
        this.client.sendCommand(command);
    }
}
