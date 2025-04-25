import { GMCPMessage, GMCPPackage } from "./package";

class GmcpMessageCharName extends GMCPMessage {
  public name!: string;
  public fullname: string = "";
}

export class GMCPChar extends GMCPPackage {
  public packageName: string = "Char";

  handleName(data: GmcpMessageCharName): void {
    this.client.worldData.playerId = data.name;
    this.client.worldData.playerName = data.fullname;
    this.client.emit("statustext", `Logged in as ${data.fullname}`);
  }
  // --- Vitals ---
  handleVitals(data: any): void { // Use 'any' for now, define specific interface later if needed
    console.log("Received Char.Vitals:", data);
    // TODO: Parse and update character vitals state (HP, MP, etc.)
    this.client.emit("vitals", data);
  }

  // --- StatusVars ---
  handleStatusVars(data: { [key: string]: string }): void {
    console.log("Received Char.StatusVars:", data);
    // TODO: Store the definitions of status variables
    this.client.emit("statusVars", data);
  }

  // --- Status ---
  handleStatus(data: { [key: string]: string }): void {
    console.log("Received Char.Status:", data);
    // TODO: Update character status based on received values
    this.client.emit("statusUpdate", data);
  }

  // --- Login ---
  sendLogin(name: string, password: string): void {
    this.client.sendGmcp(
      "Char.Login",
      JSON.stringify({ name: name, password: password })
    );
  }
}
