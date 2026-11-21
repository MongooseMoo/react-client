import type React from 'react';
import { useCallback, useEffect } from 'react';
import { HOLDING_LISTS } from '../boundNames';
import type MudClient from '../client';
import type { Item } from '../gmcp/Char/Items';
import { type ItemAction, performItemAction } from '../itemActions';
import { useItemsStore } from '../stores/itemsStore';
import InventoryList from './InventoryList';
import './InventoryList.css'; // Styles for inventory tab, list, and card container
import ItemCard from './ItemCard';

interface InventoryProps {
  client: MudClient;
}

const EMPTY_ITEMS: Item[] = [];

const Inventory: React.FC<InventoryProps> = ({ client }) => {
  const items = useItemsStore((state) => state.itemsByLocation.inv ?? EMPTY_ITEMS);
  // The one selection, shared with the Room tab, the room picture and interact mode.
  const selectedId = useItemsStore((state) => state.selected?.id ?? null);
  const select = useItemsStore((state) => state.select);
  const selectedItem = items.find((item) => item.id === selectedId) ?? null;

  useEffect(() => {
    client.gmcp.handlers['Char.Items']?.sendInv("");
  }, [client]);

  const handleItemAction = useCallback((action: ItemAction) => {
    performItemAction(client, action);
  }, [client]);

  const headingId = "inventory-heading";
  const listId = HOLDING_LISTS.inventory.listId;

  return (
    <div className="inventory-tab-content" role="region" aria-labelledby={headingId}>
      <h4 id={headingId} tabIndex={-1}>Inventory</h4>
      {items.length === 0 ? (
        <p>Your inventory is empty.</p>
      ) : (
        <InventoryList
          items={items}
          selectedId={selectedItem?.id ?? null}
          onSelect={select}
          listId={listId}
          labelledBy={headingId}
          focusReturnId={headingId}
        />
      )}
      {selectedItem && (
        <div className="selected-item-card-container" style={{ marginTop: '1rem' }}>
          <ItemCard
            item={selectedItem}
            onAction={handleItemAction}
            focusReturnId={listId}
            focusFallbackId={headingId}
          />
        </div>
      )}
    </div>
  );
};

export default Inventory;
