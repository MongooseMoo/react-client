import { useSessionStore } from "../stores/sessionStore";
import {
  useCharacterStatusStore,
  type Effect,
  type Meter,
  type Target,
} from "../stores/characterStatusStore";
import { usePersonalDataStore } from '../stores/personalDataStore';
import { inbound, outbound } from "../protocol/messages";
import { gmcpJsonMessage } from "./messages";
import { GMCPMessage, GMCPPackage } from "./package";

class GmcpMessageCharName extends GMCPMessage {
  public name!: string;
  public fullname: string = "";
  public uuid?: string;
}

const charName = gmcpJsonMessage<"Name", GmcpMessageCharName>("Name");
const charVitals = gmcpJsonMessage<"Vitals", Meter[]>("Vitals");
const charEffects = gmcpJsonMessage<"Effects", Effect[]>("Effects");
// {} when the player has no engaged opponent.
type NoTarget = { [K in keyof Target]?: never };
const charTarget = gmcpJsonMessage<"Target", Target | NoTarget>("Target");
const charStatusVars = gmcpJsonMessage<"StatusVars", Record<string, string>>("StatusVars");
const charStatus = gmcpJsonMessage<"Status", Record<string, string>>("Status");
const charLogin = gmcpJsonMessage<"Login", never, { name: string; password: string }>("Login");

const GMCPCharBase = GMCPPackage.with({
  packageName: "Char",
  messages: [
    inbound(charName),
    inbound(charVitals),
    inbound(charEffects),
    inbound(charTarget),
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
    this.on("effects", (data) => this.handleEffects(data));
    this.on("target", (data) => this.handleTarget(data));
    this.on("statusVars", (data) => this.handleStatusVars(data));
    this.on("status", (data) => this.handleStatus(data));
  }

  handleName(data: GmcpMessageCharName): void {
    if (typeof data.name !== 'string' || !data.name ||
        (data.uuid !== undefined && typeof data.uuid !== 'string')) return;
    const previous = useSessionStore.getState();
    this.client.gmcp.confirmIdentity(data.name, data.uuid ?? '');
    if (data.uuid || !this.client.liveServer) {
      usePersonalDataStore.getState().confirm({ runtime: this.client.runtimeNamespace,
        playerUuid: data.uuid ?? '', playerRef: data.name });
    }
    previous.setPlayer(data.name, data.fullname, data.uuid);
  }
  // --- Vitals ---
  handleVitals(data: Meter[]): void {
    useCharacterStatusStore.getState().setMeters(data, performance.now());
  }

  // --- Effects: the whole list on every change ---
  handleEffects(data: Effect[]): void {
    useCharacterStatusStore.getState().setEffects(data);
  }

  // --- Target ---
  handleTarget(data: Target | NoTarget): void {
    useCharacterStatusStore.getState().setTarget(data.name === undefined ? null : data);
  }

  // --- StatusVars ---
  handleStatusVars(data: { [key: string]: string }): void {
    console.log("Received Char.StatusVars:", data);
    // TODO: Store the definitions of status variables
  }

  // --- Status ---
  handleStatus(data: { [key: string]: string }): void {
    console.log("Received Char.Status:", data);
    // TODO: Update character status based on received values
  }

  override reset(): void {
    useCharacterStatusStore.getState().reset();
    useSessionStore.getState().reset();
  }
}
