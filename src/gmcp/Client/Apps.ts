import { announce } from "@react-aria/live-announcer";
import { duplex, outbound, inbound } from "../../protocol/messages";
import { useAppsStore } from "../../stores/appsStore";
import { gmcpJsonMessage } from "../messages";
import { GMCPMessage, GMCPPackage } from "../package";

/** One app that can act as the player on the web (approved with @approve, or a drive password). */
export class GMCPMessageClientAppsApp extends GMCPMessage {
    public readonly name!: string;
    /** When it was approved, in seconds since 1970. */
    public readonly approved!: number;
}

export class GMCPMessageClientAppsList extends GMCPMessage {
    public readonly apps!: GMCPMessageClientAppsApp[];
}

export class GMCPMessageClientAppsResult extends GMCPMessage {
    public readonly ok!: number;
    public readonly message!: string;
}

/** The apps the Apps tab can get a password for: the WebDAV drive, the MQTT broker and the MCP server. */
export type ClientAppsPasswordApp = "drive" | "mqtt" | "mcp";

/**
 * A new password for one app and where to use it: for "drive" the WebDAV
 * address to mount, for "mqtt" the broker (mqtts://host:port) and the topics
 * the player may use, for "mcp" the MCP server address that AI tools such as
 * Claude Code connect to. Shown once; asking again replaces that app's password.
 */
export class GMCPMessageClientAppsPassword extends GMCPMessage {
    public readonly app!: ClientAppsPasswordApp;
    public readonly url!: string;
    public readonly user!: string;
    public readonly password!: string;
    /** For "mqtt": the player's own topic filter, such as players/123/#. */
    public readonly topics?: string;
}

export class GMCPMessageClientAppsPasswordRequest extends GMCPMessage {
    public readonly app!: ClientAppsPasswordApp;
}

export class GMCPMessageClientAppsApprove extends GMCPMessage {
    public readonly code!: string;
}

export class GMCPMessageClientAppsRevoke extends GMCPMessage {
    public readonly name!: string;
}

type Empty = Record<string, never>;

const appsList = gmcpJsonMessage<"List", GMCPMessageClientAppsList, Empty>("List");
const appsPassword = gmcpJsonMessage<"Password", GMCPMessageClientAppsPassword, GMCPMessageClientAppsPasswordRequest>("Password");
const appsResult = gmcpJsonMessage<"Result", GMCPMessageClientAppsResult>("Result");
const appsApprove = gmcpJsonMessage<"Approve", never, GMCPMessageClientAppsApprove>("Approve");
const appsRevoke = gmcpJsonMessage<"Revoke", never, GMCPMessageClientAppsRevoke>("Revoke");

const GMCPClientAppsBase = GMCPPackage.with({
    packageName: "Client.Apps",
    messages: [
        duplex(appsList),
        duplex(appsPassword),
        inbound(appsResult),
        outbound(appsApprove),
        outbound(appsRevoke),
    ] as const,
});

/**
 * Client.Apps: the apps that can act as the player on the web, approving an
 * app's device code, revoking one, and a password for the MOO's WebDAV drive,
 * its MQTT broker or its MCP server. The server answers List, Result and Password; see
 * docs/GMCP/client-apps.md.
 */
export class GMCPClientApps extends GMCPClientAppsBase {
    constructor(client: ConstructorParameters<typeof GMCPClientAppsBase>[0]) {
        super(client);
        this.on("list", (data) => useAppsStore.getState().setApps(data.apps ?? []));
        this.on("result", (data) => {
            useAppsStore.getState().setResult(data);
            announce(data.message, "assertive");
        });
        this.on("password", (data) => {
            useAppsStore.getState().setPassword(data);
            const label = data.app === "mqtt" ? "MQTT" : data.app === "mcp" ? "Claude Code" : "Drive";
            announce(`${label} password ready. It is shown once.`, "assertive");
        });
    }

    reset(): void {
        useAppsStore.getState().reset();
    }
}
