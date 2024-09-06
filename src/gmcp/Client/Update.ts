import { GMCPMessage, GMCPPackage } from "../package";
import { preferencesStore, PrefActionType } from "../../PreferencesStore";

export class GMCPMessageClientUpdateAvailable extends GMCPMessage {
    public readonly version!: string;
    public readonly description?: string;
    public readonly urgency?: 'low' | 'medium' | 'high' | 'critical';
}

export class GMCPClientUpdate extends GMCPPackage {
    public packageName: string = "Client.Update";

    handleAvailable(data: GMCPMessageClientUpdateAvailable): void {
        const { autoUpdate } = preferencesStore.getState().general;
        
        if (autoUpdate) {
            this.installUpdate();
        } else {
            this.notifyUpdateAvailable(data);
        }
    }

    private notifyUpdateAvailable(data: GMCPMessageClientUpdateAvailable): void {
        this.client.emit("updateAvailable", {
            version: data.version,
            description: data.description,
            urgency: data.urgency
        });
    }

    installUpdate(): void {
        // In a real-world scenario, you might want to do some cleanup or state saving here
        window.location.reload();
    }

    sendReady(): void {
        this.sendData("Ready", { version: "1.0.0" }); // Replace with actual version
    }
}
