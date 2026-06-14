import { inbound, outbound } from "../../protocol/messages";
import { gmcpJsonMessage } from "../messages";
import { GMCPMessage, GMCPPackage } from "../package";

export interface Item {
  id: string; // Docs say number, but examples show string IDs sometimes
  name: string;
  icon?: string;
  Attrib?: string; // wWlgctmdx
  location?: ItemLocation; // Added location
}

export type ItemLocation = "inv" | "room" | string; // "repNUMBER" for containers

export class GMCPMessageCharItemsList extends GMCPMessage {
  location: ItemLocation = "room";
  items: Item[] = [];
}

export class GMCPMessageCharItemsAdd extends GMCPMessage {
  location: ItemLocation = "room";
  item: Item = { id: "", name: "" };
}

// Remove message uses item ID according to docs, but example shows full item object?
// Let's stick to the example for now, but be aware of the discrepancy.
export class GMCPMessageCharItemsRemove extends GMCPMessage {
  location: ItemLocation = "room";
  item: Item = { id: "", name: "" }; // Using item object based on example
  // item: { id: string }; // Alternative based on text description
}

export class GMCPMessageCharItemsUpdate extends GMCPMessage {
  location: ItemLocation = "inv"; // Only for inventory items per docs
  item: Item = { id: "", name: "" };
}


const itemsList = gmcpJsonMessage<"List", GMCPMessageCharItemsList>("List");
const itemsAdd = gmcpJsonMessage<"Add", GMCPMessageCharItemsAdd>("Add");
const itemsRemove = gmcpJsonMessage<"Remove", GMCPMessageCharItemsRemove>("Remove");
const itemsUpdate = gmcpJsonMessage<"Update", GMCPMessageCharItemsUpdate>("Update");
const itemsContents = gmcpJsonMessage<"Contents", never, string>("Contents");
const itemsInv = gmcpJsonMessage<"Inv", never, string>("Inv");
const itemsRoom = gmcpJsonMessage<"Room", never, string>("Room");

const GMCPCharItemsBase = GMCPPackage.with({
  packageName: "Char.Items",
  messages: [
    inbound(itemsList),
    inbound(itemsAdd),
    inbound(itemsRemove),
    inbound(itemsUpdate),
    outbound(itemsContents),
    outbound(itemsInv),
    outbound(itemsRoom),
  ] as const,
});

export class GMCPCharItems extends GMCPCharItemsBase {
  constructor(client: ConstructorParameters<typeof GMCPCharItemsBase>[0]) {
    super(client);
    this.on("list", (data) => this.handleList(data));
    this.on("add", (data) => this.handleAdd(data));
    this.on("remove", (data) => this.handleRemove(data));
    this.on("update", (data) => this.handleUpdate(data));
  }

  // --- Server Messages ---

  handleList(data: GMCPMessageCharItemsList): void {
    console.log(`Received Char.Items.List for ${data.location}:`, data.items);
  }

  handleAdd(data: GMCPMessageCharItemsAdd): void {
    console.log(`Received Char.Items.Add for ${data.location}:`, data.item);
  }

  handleRemove(data: GMCPMessageCharItemsRemove): void {
    console.log(`Received Char.Items.Remove for ${data.location}:`, data.item);
  }

  handleUpdate(data: GMCPMessageCharItemsUpdate): void {
    console.log(`Received Char.Items.Update for ${data.location}:`, data.item);
  }
}
