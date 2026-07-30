import { inbound, outbound } from "../protocol/messages";
import {
    loadStoredValue,
    saveStoredValue,
    type LocalStorageSchema,
} from "../persistence";
import { gmcpJsonMessage } from "./messages";
import { GMCPPackage } from "./package";

const authToken = gmcpJsonMessage<"Token", string>("Token");
const authLogin = gmcpJsonMessage<"Login", never, string>("Login");
const authTokenSchema: LocalStorageSchema<string> = {
    key: "LoginRefreshToken",
    version: 1,
    migrate: (data, storedVersion) =>
        storedVersion <= 1 && typeof data === "string" ? data : undefined,
};

const GMCPAutoLoginBase = GMCPPackage.with({
    packageName: "Auth.Autologin",
    messages: [
        inbound(authToken),
        outbound(authLogin),
    ] as const,
});

export class GMCPAutoLogin extends GMCPAutoLoginBase {
    constructor(client: ConstructorParameters<typeof GMCPAutoLoginBase>[0]) {
        super(client);
        this.on("token", (data) => this.handleToken(data));
    }

    handleToken(data: string): void {
        saveStoredValue(authTokenSchema, data);
    }

    sendStoredLogin(): void {
        const token = loadStoredValue(authTokenSchema, "");
        if (token) {
            this.sendLogin(token);
        }
    }
}
