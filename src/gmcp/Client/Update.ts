/**
 * GMCP Client.Update Package
 *
 * This package implements the Client.Update GMCP protocol for handling client updates.
 * The protocol allows the server to notify the client about available updates.
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
 * 3. Version Format:
 *    - Versions are specified in semantic versioning format: major.minor.patch
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
   * Checks if the available version is newer and notifies the client.
   */
  handleAvailable(data: GMCPMessageClientUpdateAvailable): void {
    if (this.isNewerVersion(data.version)) {
      this.notifyUpdateAvailable(data);
    }
  }

  /**
   * Compares the available version with the current version.
   * Returns true if the available version is newer.
   */
  private isNewerVersion(availableVersion: string): boolean {
    const current = this.parseVersion(this.currentVersion);
    const available = this.parseVersion(availableVersion);

    for (let i = 0; i < 3; i++) {
      if (available[i] > current[i]) return true;
      if (available[i] < current[i]) return false;
    }

    return false;
  }

  /**
   * Parses a version string into an array of numbers.
   */
  private parseVersion(version: string): number[] {
    return version.split('.').map(Number);
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
   * Sends the Client.Update.Ready message to the server.
   * This informs the server that the client is ready to receive update notifications.
   */
  sendReady(): void {
    this.sendData("Ready", { version: this.currentVersion });
  }
}
