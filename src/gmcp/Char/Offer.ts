import { duplex } from "../../protocol/messages";
import { gmcpJsonMessage } from "../messages";
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

const charOffer = gmcpJsonMessage<"Offer", GMCPMessageCharOffer, Record<string, never>>("Offer");

const GMCPCharOfferBase = GMCPPackage.with({
    packageName: "Char.Offer",
    messages: [duplex(charOffer)] as const,
});

export class GMCPCharOffer extends GMCPCharOfferBase {
    constructor(client: ConstructorParameters<typeof GMCPCharOfferBase>[0]) {
        super(client);
        this.on("offer", (data) => this.handleOffer(data));
    }

    // Handler for response messages
    handleOffer(data: GMCPMessageCharOffer): void {
        console.log("Received Char.Offer:", data);
        // TODO: Implement logic to handle offer data (e.g., display in UI)
    }
}
