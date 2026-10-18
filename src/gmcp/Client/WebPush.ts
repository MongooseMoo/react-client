import { inbound, outbound } from "../../protocol/messages";
import { gmcpJsonMessage } from "../messages";
import { GMCPMessage, GMCPPackage } from "../package";
import type { SessionGrant } from '../../tabSession';

export interface EnrollmentToken {
  version: 2;
  serverKey: string;
  playerUuid: string;
  playerRef: string;
  sessionId: string;
  installationId: string;
  requestId: string;
  token: string;
  expires_at: number;
}
const sessionToken = gmcpJsonMessage<'SessionToken', unknown>('SessionToken');
const sessionRequest = gmcpJsonMessage<'SessionRequest', never, {
  version: 2; sessionId: string; installationId: string; requestId: string;
}>('SessionRequest');

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
    inbound(sessionToken), outbound(sessionRequest),
  ] as const,
});

export class GMCPClientWebPush extends GMCPClientWebPushBase {
  override readonly packageVersion = 2;

  private token: string | null = null;
  private expiresAt: number | null = null;
  private readonly pending = new Set<() => void>();

  constructor(client: ConstructorParameters<typeof GMCPClientWebPushBase>[0]) {
    super(client);
    this.on("token", (data) => this.handleToken(data));
  }

  handleToken(data: GMCPMessageClientWebPushToken): void {
    this.token = data.token || null;
    this.expiresAt = typeof data.expires_at === "number" ? data.expires_at * 1000 : null;
  }

  async requestToken(): Promise<string | null> {
    if (this.hasUsableToken()) {
      return this.token;
    }

    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        cleanup();
        console.error("[webpush] token request timed out");
        resolve(null);
      }, 5_000);

      const handleToken = (payload: GMCPMessageClientWebPushToken) => {
        cleanup();
        resolve(payload.token || null);
      };

      const cleanup = () => {
        window.clearTimeout(timeout);
        this.off("token", handleToken);
        this.pending.delete(cancel);
      };

      const cancel = () => {
        cleanup();
        resolve(null);
      };

      this.pending.add(cancel);
      this.on("token", handleToken);
      try {
        this.sendRequest();
      } catch (error) {
        cleanup();
        reject(error);
      }
    });
  }

  requestSessionToken(owner: SessionGrant): Promise<EnrollmentToken | undefined> {
    const requestId = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      const finish = (token?: EnrollmentToken) => { cleanup(); resolve(token); };
      const timeout = window.setTimeout(() => finish(), 5000);
      const cancel = () => finish();
      const receive = (value: unknown) => {
        if (typeof value !== 'object' || value === null) return;
        const data = value as Record<string, unknown>;
        if (data.version !== 2 || data.requestId !== requestId || data.sessionId !== owner.sessionId ||
            data.installationId !== owner.installationId || data.playerUuid !== owner.playerUuid ||
            data.playerRef !== owner.playerRef || typeof data.serverKey !== 'string' ||
            typeof data.token !== 'string' || !data.token || typeof data.expires_at !== 'number' ||
            data.expires_at * 1000 <= Date.now()) return;
        finish({ version: 2, serverKey: data.serverKey, requestId, sessionId: owner.sessionId,
          installationId: owner.installationId, playerUuid: owner.playerUuid, playerRef: owner.playerRef,
          token: data.token, expires_at: data.expires_at });
      };
      const cleanup = () => {
        window.clearTimeout(timeout);
        this.off('sessionToken', receive);
        this.pending.delete(cancel);
      };
      this.pending.add(cancel);
      this.on('sessionToken', receive);
      try { this.sendSessionRequest({ version: 2, sessionId: owner.sessionId, installationId: owner.installationId, requestId }); }
      catch (error) { cleanup(); reject(error); }
    });
  }

  override reset(): void {
    for (const cancel of this.pending) cancel();
    this.token = null;
    this.expiresAt = null;
  }

  shutdown(): void {
    this.reset();
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
