import { inbound } from "../../protocol/messages";
import { gmcpJsonMessage } from "../messages";
import { GMCPMessage, GMCPPackage } from "../package";

// Data structure is not defined in the provided docs, using 'any' for now.
export class GMCPMessageCharPrompt extends GMCPMessage {
    [key: string]: unknown; // Allows arbitrary prompt values
}

const charPrompt = gmcpJsonMessage<"Prompt", GMCPMessageCharPrompt>("Prompt");

const GMCPCharPromptBase = GMCPPackage.with({
    packageName: "Char.Prompt",
    messages: [inbound(charPrompt)] as const,
});

export class GMCPCharPrompt extends GMCPCharPromptBase {
    constructor(client: ConstructorParameters<typeof GMCPCharPromptBase>[0]) {
        super(client);
        this.on("prompt", (data) => this.handlePrompt(data));
    }

    // Handler for broadcast messages
    handlePrompt(data: GMCPMessageCharPrompt): void {
        console.log("Received Char.Prompt:", data);
        // TODO: Implement logic to handle prompt data (e.g., update UI)
        this.client.emit("prompt", data); // Example: emit an event
    }

    // Method to request prompt data
    sendPromptRequest(): void {
        this.sendData("Prompt", {}); // Send empty object as per docs
    }
}
