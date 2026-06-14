import { inbound, outbound } from "../protocol/messages";
import { gmcpJsonMessage } from "./messages";
import { GMCPPackage } from "./package";

const authToken = gmcpJsonMessage<"Token", string>("Token");
const authLogin = gmcpJsonMessage<"Login", never, string>("Login");

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
        localStorage.setItem("LoginRefreshToken", data);
    }

    sendStoredLogin(): void {
        const token = localStorage.getItem("LoginRefreshToken");
        if (token) {
            this.sendLogin(token);
        }
    }
}
