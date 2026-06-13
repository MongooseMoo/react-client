import { inbound, outbound } from "../../protocol/messages";
import { gmcpJsonMessage } from "../messages";
import { GMCPMessage, GMCPPackage } from "../package";

const DEFAULT_TOKEN_TTL_MS = 5 * 60 * 1000;

export class GMCPMessageClientWebPushToken extends GMCPMessage {
  token: string = "";
  expires_at?: number;
}

const webPushToken = gmcpJsonMessage<"Token", GMCPMessageClientWebPushToken>("Token");
const webPushRequest = gmcpJsonMessage<"Request", never, void>("Request", {
  encode(): unknown {
    return {};
  },
  decode(payload: unknown): never {
    return payload as never;
  },
});

const GMCPClientWebPushBase = GMCPPackage.with({
  packageName: "Client.WebPush",
  messages: [
    inbound(webPushToken),
    outbound(webPushRequest),
  ] as const,
});

export class GMCPClientWebPush extends GMCPClientWebPushBase {

  private token: string | null = null;
  private expiresAt: number | null = null;

  constructor(client: ConstructorParameters<typeof GMCPClientWebPushBase>[0]) {
    super(client);
    this.on("token", (data) => this.handleToken(data));
  }

  handleToken(data: GMCPMessageClientWebPushToken): void {
    this.token = data.token || null;
    this.expiresAt = typeof data.expires_at === "number" ? data.expires_at : null;
    this.client.emit("webpushToken", {
      expiresAt: this.expiresAt,
      token: this.token,
    });
  }

  async requestToken(): Promise<string | null> {
    if (this.hasUsableToken()) {
      return this.token;
    }

    return new Promise((resolve) => {
      const timeout = window.setTimeout(() => {
        cleanup();
        console.error("[webpush] token request timed out");
        resolve(null);
      }, 5_000);

      const handleToken = (payload: { token: string | null }) => {
        cleanup();
        resolve(payload.token);
      };

      const cleanup = () => {
        window.clearTimeout(timeout);
        this.client.off("webpushToken", handleToken);
      };

      this.client.on("webpushToken", handleToken);
      this.sendRequest();
    });
  }

  shutdown(): void {
    this.token = null;
    this.expiresAt = null;
  }

  private hasUsableToken(): boolean {
    if (!this.token) {
      return false;
    }
    if (this.expiresAt == null) {
      return true;
    }

    return Date.now() + DEFAULT_TOKEN_TTL_MS / 10 < this.expiresAt;
  }
}
