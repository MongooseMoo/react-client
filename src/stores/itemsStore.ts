import { create } from "zustand";

import type { Item, ItemLocation } from "../gmcp/Char/Items";

interface ItemsState {
  itemsByLocation: Record<string, Item[]>;
  hasReceivedList: boolean;
  setLocationItems: (location: ItemLocation, items: Item[]) => void;
  addItem: (location: ItemLocation, item: Item) => void;
  removeItem: (location: ItemLocation, item: Item) => void;
  updateItem: (location: ItemLocation, item: Item) => void;
  reset: () => void;
}

export const useItemsStore = create<ItemsState>((set) => ({
  itemsByLocation: {},
  hasReceivedList: false,
  setLocationItems: (location, items) =>
    set((state) => ({
      itemsByLocation: {
        ...state.itemsByLocation,
        [location]: items.map((item) => itemWithLocation(location, item)),
      },
      hasReceivedList: true,
    })),
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
    set((state) => ({
      itemsByLocation: {
        ...state.itemsByLocation,
        [location]: (state.itemsByLocation[location] ?? []).filter(
          (currentItem) => currentItem.id !== item.id,
        ),
      },
    })),
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
  reset: () => set({ itemsByLocation: {}, hasReceivedList: false }),
}));

function itemWithLocation(location: ItemLocation, item: Item): Item {
  return { ...item, location };
}
