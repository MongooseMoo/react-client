import { useSessionStore } from "../stores/sessionStore";
import { inbound, outbound } from "../protocol/messages";
import { gmcpJsonMessage } from "./messages";
import { GMCPMessage, GMCPPackage } from "./package";

class GmcpMessageCharName extends GMCPMessage {
  public name!: string;
  public fullname: string = "";
}

const charName = gmcpJsonMessage<"Name", GmcpMessageCharName>("Name");
const charVitals = gmcpJsonMessage<"Vitals", Record<string, unknown>>("Vitals");
const charStatusVars = gmcpJsonMessage<"StatusVars", Record<string, string>>("StatusVars");
const charStatus = gmcpJsonMessage<"Status", Record<string, string>>("Status");
const charLogin = gmcpJsonMessage<"Login", never, { name: string; password: string }>("Login");

const GMCPCharBase = GMCPPackage.with({
  packageName: "Char",
  messages: [
    inbound(charName),
    inbound(charVitals),
    inbound(charStatusVars),
    inbound(charStatus),
    outbound(charLogin),
  ] as const,
});

export class GMCPChar extends GMCPCharBase {
  constructor(client: ConstructorParameters<typeof GMCPCharBase>[0]) {
    super(client);
    this.on("name", (data) => this.handleName(data));
    this.on("vitals", (data) => this.handleVitals(data));
    this.on("statusVars", (data) => this.handleStatusVars(data));
    this.on("status", (data) => this.handleStatus(data));
  }

  handleName(data: GmcpMessageCharName): void {
    useSessionStore.getState().setPlayer(data.name, data.fullname);
    this.client.emit("statustext", `Logged in as ${data.fullname}`);
    this.client.gmcp.markSessionReady();
  }
  // --- Vitals ---
  handleVitals(data: Record<string, unknown>): void {
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
}
