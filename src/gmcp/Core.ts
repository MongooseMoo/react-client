import { GMCPMessage, GMCPPackage } from "./package";


export class GMCPMessageCoreClient extends GMCPMessage {
  public readonly name: string;
  public readonly version: string;

  constructor(name: string, version: string) {
    super();
    this.name = name;
    this.version = version;
  }
}


export class GMCPCore extends GMCPPackage {
  public packageName: string = "Core";

  sendHello(): void {
    this.sendData("Hello", { client: "Mongoose Client", version: "0.1" });
  }

  sendKeepAlive(): void {
    this.sendData("KeepAlive");
  }

  sendPing(avgPing?: number): void {
    this.sendData("Ping", avgPing);
  }

  handlePing(): void {
    // Server replied to our ping, potentially update latency metrics
    console.log("Received Core.Ping response from server.");
    this.client.emit("corePing"); // Example event
  }

  handleGoodbye(reason: string): void {
    console.log(`Server sent Core.Goodbye: ${reason}`);
    this.client.emit("coreGoodbye", reason);
    // Optionally trigger disconnect logic here or let the main client handle it
  }
}

// --- Core.Supports ---

export interface GMCPMessageCoreSupportsSet extends GMCPMessage {
  modules: string[];
}

export class GMCPCoreSupports extends GMCPPackage {
  packageName = "Core.Supports";

  // Sends the initial list of supported packages
  sendSet(): void {
    const packages = Object.values(this.client.gmcpHandlers)
      .filter(p => p.packageName && p.packageVersion) // Ensure package has name and version
      .map(p => `${p.packageName} ${p.packageVersion!.toString()}`);
    this.sendData("Set", packages);
  }

  // Adds packages to the supported list
  sendAdd(packagesToAdd: { name: string; version: number }[]): void {
    const packageStrings = packagesToAdd.map(p => `${p.name} ${p.version}`);
    this.sendData("Add", packageStrings);
  }

  // Removes packages from the supported list
  sendRemove(packagesToRemove: string[]): void {
    this.sendData("Remove", packagesToRemove); // Version number is optional/ignored
  }

  // Note: Server doesn't send Core.Supports messages to the client according to IRE docs.
}
