import { GMCPPackage } from "./package";


export class GMCPAutoLogin extends GMCPPackage {
    public packageName: string = "Auth.Autologin";

    handleToken(data: string): void {
        localStorage.setItem("LoginRefreshToken", data);
    }

    sendLogin(): void {
        var token = localStorage.getItem("LoginRefreshToken");
        if (token)
            this.sendData("Login", token);
    }
}
