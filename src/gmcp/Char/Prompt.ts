import { GMCPMessage, GMCPPackage } from "../package";

// Data structure is not defined in the provided docs, using 'any' for now.
export class GMCPMessageCharPrompt extends GMCPMessage {
    [key: string]: any; // Allows any prompt values
}

export class GMCPCharPrompt extends GMCPPackage {
    public packageName: string = "Char.Prompt";

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
