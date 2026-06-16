import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import type MudClient from '../client';
import type { Item } from '../gmcp/Char/Items';
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
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    client.gmcp.handlers['Char.Items']?.sendInv("");
  }, [client]);

  useEffect(() => {
    if (!selectedItem) return;
    setSelectedItem(items.find((item) => item.id === selectedItem.id) ?? null);
  }, [items, selectedItem]);

  const handleItemSelected = (item: Item | null) => {
    setSelectedItem(item);
  };

  const handleDropItem = useCallback((itemToDrop: Item) => {
    client.sendCommand(`drop ${itemToDrop.id}`);
  }, [client]);

  const handleWearItem = useCallback((itemToWear: Item) => {
    client.sendCommand(`wear ${itemToWear.id}`);
  }, [client]);

  const handleRemoveItem = useCallback((itemToRemove: Item) => {
    client.sendCommand(`remove ${itemToRemove.id}`);
  }, [client]);

  const headingId = "inventory-heading";
  const listId = "inventory-listbox";

  return (
    <div className="inventory-tab-content" role="region" aria-labelledby={headingId}>
      <h4 id={headingId} tabIndex={-1}>Inventory</h4>
      {items.length === 0 ? (
        <p>Your inventory is empty.</p>
      ) : (
        <InventoryList
          items={items}
          onItemSelected={handleItemSelected}
          listId={listId}
          labelledBy={headingId}
        />
      )}
      {selectedItem && (
        <div className="selected-item-card-container" style={{ marginTop: '1rem' }}>
          <ItemCard
            item={selectedItem}
            onDrop={handleDropItem}
            onWear={handleWearItem}
            onRemove={handleRemoveItem}
          />
        </div>
      )}
    </div>
  );
};

export default Inventory;
