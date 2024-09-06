/**
 * GMCP Client.Update Package
 *
 * This package implements the Client.Update GMCP protocol for handling client updates.
 * The protocol allows the server to notify the client about available updates and
 * provides mechanisms for the client to handle these updates automatically or manually.
 *
 * Protocol Specification:
 * 1. Server-to-Client Messages:
 *    - Client.Update.Available: Notifies the client of an available update
 *      Format: { version: string, description?: string, urgency?: 'low' | 'medium' | 'high' | 'critical' }
 *
 * 2. Client-to-Server Messages:
 *    - Client.Update.Ready: Sent by the client to indicate it's ready to receive updates
 *      Format: { version: string }
 *
 * 3. Update Process:
 *    - If auto-update is enabled, the client will automatically install the update
 *    - If auto-update is disabled, the client will notify the user of the available update
 *    - The update installation process involves reloading the client application
 *
 * 4. Version Comparison:
 *    - The client compares the available version with its current version
 *    - Updates are only processed if the available version is newer
 *
 * 5. Update Urgency:
 *    - The server can specify an urgency level for the update
 *    - Clients may use this information to adjust the visibility or priority of update notifications
 */

import { GMCPMessage, GMCPPackage } from "../package";
import { preferencesStore, PrefActionType } from "../../PreferencesStore";

export type UpdatePriority = "low" | "medium" | "high" | "critical";

export class GMCPMessageClientUpdateAvailable extends GMCPMessage {
  public readonly version!: string;
  public readonly description?: string;
  public readonly urgency?: UpdatePriority;
}

export class GMCPClientUpdate extends GMCPPackage {
  public packageName: string = "Client.Update";
  private currentVersion: string = "1.0.0"; // This should be updated with each release

  /**
   * Handles the Client.Update.Available message from the server.
   * Checks if the available version is newer, and then either
   * installs the update automatically or notifies the user based on preferences.
   */
  handleAvailable(data: GMCPMessageClientUpdateAvailable): void {
    if (this.isNewerVersion(data.version)) {
      const { autoUpdate } = preferencesStore.getState().general;

      if (autoUpdate) {
        this.installUpdate();
      } else {
        this.notifyUpdateAvailable(data);
      }
    }
  }

  /**
   * Compares the available version with the current version.
   * Returns true if the available version is newer.
   */
  private isNewerVersion(availableVersion: string): boolean {
    const current = this.currentVersion.split(".").map(Number);
    const available = availableVersion.split(".").map(Number);

    for (let i = 0; i < 3; i++) {
      if (available[i] > current[i]) return true;
      if (available[i] < current[i]) return false;
    }

    return false;
  }

  /**
   * Notifies the client application about an available update.
   * This typically triggers a UI update to inform the user.
   */
  private notifyUpdateAvailable(data: GMCPMessageClientUpdateAvailable): void {
    this.client.emit("updateAvailable", {
      version: data.version,
      description: data.description,
      urgency: data.urgency,
    });
  }

  /**
   * Installs the update by reloading the client application.
   * In a real-world scenario, this method might perform additional
   * tasks such as downloading update files or preparing for the update.
   */
  installUpdate(): void {
    // Perform any necessary cleanup or state saving here
    localStorage.setItem("pendingUpdate", "true");
    window.location.reload();
  }

  /**
   * Sends the Client.Update.Ready message to the server.
   * This informs the server that the client is ready to receive update notifications.
   */
  sendReady(): void {
    this.sendData("Ready", { version: this.currentVersion });
  }
}
