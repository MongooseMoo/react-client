import { create } from "zustand";

import type { Item, ItemLocation } from "../gmcp/Char/Items";
import { useRoomStore } from "./roomStore";

/**
 * The one thing or person the player has chosen: in the Room tab's lists, in the room picture, in
 * the inventory, or with interact mode. `id` is the server's (`"#29612"`), or a player's Room.Players
 * name when nothing gives them an id; `lifetime` is the thing's in Room.Layout, when it is there.
 */
export interface SelectedTarget {
  id: string;
  lifetime?: string;
}

interface ItemsState {
  itemsByLocation: Record<string, Item[]>;
  hasReceivedList: boolean;
  selected: SelectedTarget | null;
  setLocationItems: (location: ItemLocation, items: Item[]) => void;
  addItem: (location: ItemLocation, item: Item) => void;
  removeItem: (location: ItemLocation, item: Item) => void;
  updateItem: (location: ItemLocation, item: Item) => void;
  /** Chooses what is here by id, or nothing. Choosing never sends a command. */
  select: (id: string | null) => void;
  reset: () => void;
}

type Lists = Record<string, Item[]>;
type Room = Pick<ReturnType<typeof useRoomStore.getState>, "roomLayout" | "roomPlayers">;

const carried = (lists: Lists, id: string) => (lists.inv ?? []).some((item) => item.id === id);

/** Whether the target is still here: in the layout as the same incarnation, carried, in the room's list, or a player present. */
function here(target: SelectedTarget, lists: Lists, room: Room): boolean {
  const thing = room.roomLayout?.things.find((candidate) => candidate.id === target.id);
  if (thing) return target.lifetime === undefined || thing.lifetime === undefined || thing.lifetime === target.lifetime;
  return carried(lists, target.id) ||
    (lists.room ?? []).some((item) => item.id === target.id) ||
    room.roomPlayers.some((player) => player.name === target.id);
}

const kept = (selected: SelectedTarget | null, lists: Lists) =>
  selected && here(selected, lists, useRoomStore.getState()) ? selected : null;

export const useItemsStore = create<ItemsState>((set) => ({
  itemsByLocation: {},
  hasReceivedList: false,
  selected: null,
  setLocationItems: (location, items) =>
    set((state) => {
      const itemsByLocation = {
        ...state.itemsByLocation,
        [location]: items.map((item) => itemWithLocation(location, item)),
      };
      return { itemsByLocation, hasReceivedList: true, selected: kept(state.selected, itemsByLocation) };
    }),
  addItem: (location, item) =>
    set((state) => {
      const currentItems = state.itemsByLocation[location] ?? [];
      if (currentItems.some((currentItem) => currentItem.id === item.id)) {
        return state;
      }
      return {
        itemsByLocation: {
          ...state.itemsByLocation,
          [location]: [...currentItems, itemWithLocation(location, item)],
        },
      };
    }),
  removeItem: (location, item) =>
    set((state) => {
      const itemsByLocation = {
        ...state.itemsByLocation,
        [location]: (state.itemsByLocation[location] ?? []).filter(
          (currentItem) => currentItem.id !== item.id,
        ),
      };
      return { itemsByLocation, selected: kept(state.selected, itemsByLocation) };
    }),
  updateItem: (location, item) =>
    set((state) => ({
      itemsByLocation: {
        ...state.itemsByLocation,
        [location]: (state.itemsByLocation[location] ?? []).map((currentItem) =>
          currentItem.id === item.id
            ? { ...currentItem, ...itemWithLocation(location, item) }
            : currentItem,
        ),
      },
    })),
  select: (id) =>
    set((state) => {
      if (id === null) return state.selected === null ? state : { selected: null };
      const lifetime = useRoomStore.getState().roomLayout?.things.find((thing) => thing.id === id)?.lifetime;
      const selected = kept(lifetime === undefined ? { id } : { id, lifetime }, state.itemsByLocation);
      return selected?.id === state.selected?.id && selected?.lifetime === state.selected?.lifetime ? state : { selected };
    }),
  reset: () => set({ itemsByLocation: {}, hasReceivedList: false, selected: null }),
}));

// The selection follows the room: Room.Info for another room drops it unless it is carried, and a
// layout or player list that no longer holds it drops it.
useRoomStore.subscribe((room, before) => {
  const { selected, itemsByLocation } = useItemsStore.getState();
  if (!selected) return;
  const moved = room.roomInfo?.num !== before.roomInfo?.num && !carried(itemsByLocation, selected.id);
  if (moved || !here(selected, itemsByLocation, room)) useItemsStore.setState({ selected: null });
});

function itemWithLocation(location: ItemLocation, item: Item): Item {
  return { ...item, location };
}
