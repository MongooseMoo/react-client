import { duplex, inbound, outbound } from "../protocol/messages";
import { gmcpJsonMessage } from "./messages";
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


const coreHello = gmcpJsonMessage<
  "Hello",
  never,
  { client: string; version: string }
>("Hello");
const coreKeepAlive = gmcpJsonMessage<"KeepAlive", never, void>("KeepAlive");
const corePing = gmcpJsonMessage<"Ping", undefined, number | undefined>("Ping", {
  encode(payload: number | undefined): unknown {
    return payload;
  },
  decode(): undefined {
    return undefined;
  },
});
const coreGoodbye = gmcpJsonMessage<"Goodbye", string>("Goodbye");

const GMCPCoreBase = GMCPPackage.with({
  packageName: "Core",
  messages: [
    outbound(coreHello),
    outbound(coreKeepAlive),
    duplex(corePing),
    inbound(coreGoodbye),
  ] as const,
});

export class GMCPCore extends GMCPCoreBase {
  constructor(client: ConstructorParameters<typeof GMCPCoreBase>[0]) {
    super(client);
    this.on("ping", () => this.handlePing());
    this.on("goodbye", (reason) => this.handleGoodbye(reason));
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

type AdvertisedGMCPPackage = GMCPPackage & { packageVersion: number };

const supportsSet = gmcpJsonMessage<"Set", never, string[]>("Set");
const supportsAdd = gmcpJsonMessage<"Add", never, string[]>("Add");
const supportsRemove = gmcpJsonMessage<"Remove", never, string[]>("Remove");

const GMCPCoreSupportsBase = GMCPPackage.with({
  packageName: "Core.Supports",
  messages: [
    outbound(supportsSet),
    outbound(supportsAdd),
    outbound(supportsRemove),
  ] as const,
});

export class GMCPCoreSupports extends GMCPCoreSupportsBase {
  advertisedModules(): string[] {
    return Object.values(this.client.gmcp.handlers)
      .filter(isAdvertisedGMCPPackage)
      .map(p => `${p.packageName} ${p.packageVersion.toString()}`);
  }

  // Note: Server doesn't send Core.Supports messages to the client according to IRE docs.
}

function isAdvertisedGMCPPackage(
  gmcpPackage: GMCPPackage | undefined,
): gmcpPackage is AdvertisedGMCPPackage {
  return Boolean(
    gmcpPackage?.packageName &&
      gmcpPackage.packageVersion !== undefined &&
      gmcpPackage.enabled,
  );
}
