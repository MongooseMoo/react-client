import { GMCPMessage, GMCPPackage } from "./package";

class GmcpMessageCharName extends GMCPMessage {
  public name!: string;
  public fullname: string = "";
  public uuid?: string = "";
}

export class GMCPChar extends GMCPPackage {
  public packageName: string = "Char";

  handleName(data: GmcpMessageCharName): void {
    this.client.worldData.playerId = data.name;
    this.client.worldData.playerName = data.fullname;
    if (data.uuid) {
      this.client.setUuid(data.uuid);
    }
    this.client.emit("statustext", `Logged in as ${data.fullname}`);
  }

  sendLogin(name: string, password: string): void {
    this.client.sendGmcp(
      "Char.Login",
      JSON.stringify({ name: name, password: password })
    );
  }
}
