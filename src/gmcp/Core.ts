import { duplex, inbound, outbound } from "../protocol/messages";
import { gmcpJsonMessage } from "./messages";
import { GMCPMessage, GMCPPackage } from "./package";
import { validateAdvertisedModules, validateSupportRequestId } from './playbackSupport';


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
  override sendData(messageName: string, data?: unknown): void {
    if (messageName === 'Ping' && data === undefined) {
      this.client.gmcp.send('Core.Ping', '');
      return;
    }
    super.sendData(messageName, data);
  }

  constructor(client: ConstructorParameters<typeof GMCPCoreBase>[0]) {
    super(client);
    this.on("goodbye", (reason) => this.handleGoodbye(reason));
  }

  handleGoodbye(reason: string): void {
    console.log(`Server sent Core.Goodbye: ${reason}`);
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
  override sendData(messageName: string, data?: unknown): void {
    this.publish(messageName, data);
  }

  refreshCurrentSupport(requestId?: string): void {
    if (requestId !== undefined) validateSupportRequestId(requestId);
    this.publish('Set', this.advertisedModules(), requestId);
  }

  private publish(messageName: string, data?: unknown, requestId?: string): void {
    if (messageName === 'Set') data = validateAdvertisedModules(data);
    super.sendData(messageName, data);
    if (!this.client.gmcp.ready) return;
    if ((messageName === 'Add' || messageName === 'Remove' || messageName === 'Set') && Array.isArray(data)) {
      const hasClock = data.some((entry) => typeof entry === 'string' && entry.split(' ')[0] === 'Core.Time');
      this.client.gmcp.require('Client.Media').sendPlaybackSupport(requestId === undefined ? undefined : { requestId });
      if (messageName === 'Set' || hasClock) this.client.sharedClock?.setNetworkReady(messageName !== 'Remove' && hasClock && !this.client.localConnection);
    }
  }

  advertisedModules(): string[] {
    return validateAdvertisedModules(Object.values(this.client.gmcp.handlers)
      .filter(isAdvertisedGMCPPackage)
      .map(p => `${p.packageName} ${p.packageVersion.toString()}`));
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
