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


export class GMCPCharItems extends GMCPPackage {
  public packageName: string = "Char.Items";

  // --- Server Messages ---

  handleList(data: GMCPMessageCharItemsList): void {
    console.log(`Received Char.Items.List for ${data.location}:`, data.items);
    const itemsWithLocation = data.items.map(item => ({ ...item, location: data.location }));
    this.client.emit("itemsList", { ...data, items: itemsWithLocation });
  }

  handleAdd(data: GMCPMessageCharItemsAdd): void {
    console.log(`Received Char.Items.Add for ${data.location}:`, data.item);
    const itemWithLocation = { ...data.item, location: data.location };
    this.client.emit("itemAdd", { ...data, item: itemWithLocation });
  }

  handleRemove(data: GMCPMessageCharItemsRemove): void {
    console.log(`Received Char.Items.Remove for ${data.location}:`, data.item);
    const itemWithLocationDetails = { ...data.item, location: data.location };
    this.client.emit("itemRemove", { ...data, item: itemWithLocationDetails });
  }

  handleUpdate(data: GMCPMessageCharItemsUpdate): void {
    console.log(`Received Char.Items.Update for ${data.location}:`, data.item);
    const itemWithLocation = { ...data.item, location: data.location };
    this.client.emit("itemUpdate", { ...data, item: itemWithLocation });
  }

  // --- Client Messages ---

  sendContentsRequest(itemId: string): void {
    // Docs say number, but let's use string for consistency if IDs can be non-numeric
    this.sendData("Contents", itemId);
  }

  sendInventoryRequest(): void {
    this.sendData("Inv", ""); // Empty body as per docs
  }

  sendRoomRequest(): void {
    this.sendData("Room", ""); // Empty body as per docs
  }
}
