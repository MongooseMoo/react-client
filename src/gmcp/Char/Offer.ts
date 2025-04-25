import { GMCPMessage, GMCPPackage } from "../package";

// Basic structure based on documentation
interface OfferItem {
    name: string;
    weight: number; // Assuming number, adjust if needed
    rent: number;   // Assuming number, adjust if needed
}

export class GMCPMessageCharOffer extends GMCPMessage {
    items: OfferItem[] = [];
    total_count: number = 0;
    total_weight: number = 0;
    total_rent: number = 0;
}

export class GMCPCharOffer extends GMCPPackage {
    public packageName: string = "Char.Offer";

    // Handler for response messages
    handleOffer(data: GMCPMessageCharOffer): void {
        console.log("Received Char.Offer:", data);
        // TODO: Implement logic to handle offer data (e.g., display in UI)
        this.client.emit("offer", data); // Example: emit an event
    }

    // Method to request offer data
    sendOfferRequest(): void {
        this.sendData("Offer", {}); // Send empty object as per docs
    }
}
