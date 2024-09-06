/**
 * GMCP Client.Update Package
 *
 * This package implements the Client.Update GMCP protocol for handling client updates.
 * The protocol allows the server to notify the client about available updates.
 *
 * Protocol Specification:
 * 1. Server-to-Client Messages:
 *    - Client.Update.Available: Notifies the client of an available update
 *      Format: { version: string, description?: string, urgency?: 'low' | 'medium' | 'high' | 'critical', url?: string }
 *
 * 2. Client-to-Server Messages:
 *    - Client.Update.Ready: Sent by the client to indicate it's ready to receive updates
 *      Format: { version: string }
 *
 * 3. Version Format:
 *    - Versions can be in any format, including Git hashes or semantic versioning
 *
 * 4. Update Urgency:
 *    - The server can specify an urgency level for the update
 *    - Clients may use this information to adjust the visibility or priority of update notifications
 */

import { GMCPMessage, GMCPPackage } from "../package";

export type UpdatePriority = "low" | "medium" | "high" | "critical";

export class GMCPMessageClientUpdateAvailable extends GMCPMessage {
  public readonly version!: string;
  public readonly description?: string;
  public readonly urgency?: UpdatePriority;
  public readonly url?: string;
}

export class GMCPClientUpdate extends GMCPPackage {
  public packageName: string = "Client.Update";
  private currentVersion: string = "unknown"; // This should be updated with each release or build

  /**
   * Handles the Client.Update.Available message from the server.
   * Notifies the client about the available update.
   */
  handleAvailable(data: GMCPMessageClientUpdateAvailable): void {
    if (this.currentVersion !== data.version) {
      this.notifyUpdateAvailable(data);
    }
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
      url: data.url,
    });
  }

  /**
   * Sends the Client.Update.Ready message to the server.
   * This informs the server that the client is ready to receive update notifications.
   */
  sendReady(): void {
    this.sendData("Ready", { version: this.currentVersion });
  }

  /**
   * Sets the current version of the client.
   * This should be called during client initialization with the current version or Git hash.
   */
  setCurrentVersion(version: string): void {
    this.currentVersion = version;
  }
}
