import { inbound } from "../protocol/messages";
import { gmcpJsonMessage } from "./messages";
import { GMCPPackage } from "./package";

const authToken = gmcpJsonMessage<"Token", string>("Token");

const GMCPAutoLoginBase = GMCPPackage.with({
    packageName: "Auth.Autologin",
    messages: [inbound(authToken)] as const,
});

export class GMCPAutoLogin extends GMCPAutoLoginBase {
    constructor(client: ConstructorParameters<typeof GMCPAutoLoginBase>[0]) {
        super(client);
        this.on("token", (data) => this.handleToken(data));
    }

    handleToken(data: string): void {
        localStorage.setItem("LoginRefreshToken", data);
    }

    sendLogin(): void {
        var token = localStorage.getItem("LoginRefreshToken");
        if (token)
            this.sendData("Login", token);
    }
}
