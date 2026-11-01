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

/** Where and how to mount the WebDAV drive. The password is shown once; asking again replaces it. */
export class GMCPMessageClientAppsDrive extends GMCPMessage {
    public readonly url!: string;
    public readonly user!: string;
    public readonly password!: string;
}

export class GMCPMessageClientAppsApprove extends GMCPMessage {
    public readonly code!: string;
}

export class GMCPMessageClientAppsRevoke extends GMCPMessage {
    public readonly name!: string;
}

type Empty = Record<string, never>;

const appsList = gmcpJsonMessage<"List", GMCPMessageClientAppsList, Empty>("List");
const appsDrive = gmcpJsonMessage<"Drive", GMCPMessageClientAppsDrive, Empty>("Drive");
const appsResult = gmcpJsonMessage<"Result", GMCPMessageClientAppsResult>("Result");
const appsApprove = gmcpJsonMessage<"Approve", never, GMCPMessageClientAppsApprove>("Approve");
const appsRevoke = gmcpJsonMessage<"Revoke", never, GMCPMessageClientAppsRevoke>("Revoke");

const GMCPClientAppsBase = GMCPPackage.with({
    packageName: "Client.Apps",
    messages: [
        duplex(appsList),
        duplex(appsDrive),
        inbound(appsResult),
        outbound(appsApprove),
        outbound(appsRevoke),
    ] as const,
});

/**
 * Client.Apps: the apps that can act as the player on the web, approving an
 * app's device code, revoking one, and a password for mounting the MOO's
 * WebDAV drive. The server answers List, Result and Drive; see
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
        this.on("drive", (data) => {
            useAppsStore.getState().setDrive(data);
            announce("Drive password ready. It is shown once.", "assertive");
        });
    }

    reset(): void {
        useAppsStore.getState().reset();
    }
}
