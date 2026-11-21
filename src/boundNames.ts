import { layoutOfRoom, roomContents } from "./map/roomContents";
import { useItemsStore } from "./stores/itemsStore";
import { useRoomStore } from "./stores/roomStore";
import { useSpatialStore } from "./stores/spatialStore";

/**
 * A bound name is a name in room text that the server has tied to what it names:
 * `<a class="thing" data-thing="#29612">portable radio</a>`, or several ids for a grouped phrase
 * ("four biscuits"). Activating one in the transcript selects the first of its things that is here
 * and lands in the list that holds it. It never sends a command. See `docs/room-layout.md`.
 */

/** The lists a thing that is here can be in: the Room tab's two, and the Inventory tab's. */
export type HoldingList = "things" | "people" | "inventory";

/** Each list's sidebar tab and the element id of its listbox. */
export const HOLDING_LISTS: Record<HoldingList, { tabId: string; listId: string }> = {
  things: { tabId: "room-tab", listId: "room-contents-list" },
  people: { tabId: "room-tab", listId: "room-players-list" },
  inventory: { tabId: "inventory-tab", listId: "inventory-listbox" },
};

/** The ids in a bound name's `data-thing`, in order. */
export function boundNameIds(value: string | undefined): string[] {
  return value ? value.split(" ") : [];
}

/**
 * Selects the first of these ids that is here now and says which list holds it. Here is what the
 * Room tab lists (the room's items and the layout's things, joined as it joins them) and what you
 * carry. When none is here it selects nothing, leaves the selection as it was, and returns null.
 */
export function selectFirstHere(ids: string[]): HoldingList | null {
  const { itemsByLocation, select } = useItemsStore.getState();
  const { roomInfo, roomPlayers, roomLayout } = useRoomStore.getState();
  const { things, people } = roomContents(
    itemsByLocation.room ?? [],
    roomPlayers,
    layoutOfRoom(roomLayout, roomInfo),
    useSpatialStore.getState().listenerEntityId,
  );
  const holds = (id: string): HoldingList | null =>
    people.some((entry) => entry.id === id) ? "people"
    : things.some((entry) => entry.id === id) ? "things"
    : (itemsByLocation.inv ?? []).some((item) => item.id === id) ? "inventory"
    : null;
  for (const id of ids) {
    const list = holds(id);
    if (!list) continue;
    select(id);
    return list;
  }
  return null;
}
