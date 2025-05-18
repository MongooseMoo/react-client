import React, { useCallback, useEffect, useState } from 'react';
import type MudClient from '../client';
import { Item, ItemLocation } from '../gmcp/Char/Items';
import InventoryList from './InventoryList';
import './InventoryList.css'; // Styles for inventory tab, list, and card container
import ItemCard from './ItemCard';

interface InventoryProps {
  client: MudClient;
}

const Inventory: React.FC<InventoryProps> = ({ client }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const updateInventory = useCallback((location: ItemLocation, newItems: Item[]) => {
    if (location === 'inv') {
      setItems(newItems);
      if (newItems.length === 0 || !newItems.find(item => item.id === selectedItem?.id)) {
        setSelectedItem(null);
      }
      client.emit('inventoryDataReceived'); // Signal for sidebar tab condition
    }
  }, [client, selectedItem?.id]);

  const addItemToInventory = useCallback((location: ItemLocation, item: Item) => {
    if (location === 'inv') {
      setItems(prev => {
        if (prev.some(i => i.id === item.id)) return prev; // Avoid duplicates
        const newItems = [...prev, item];
        client.emit('inventoryDataReceived');
        return newItems;
      });
    }
  }, [client]);

  const removeItemFromInventory = useCallback((location: ItemLocation, itemToRemove: Item) => {
    if (location === 'inv') {
      setItems(prev => {
        const newItems = prev.filter(item => item.id !== itemToRemove.id);
        if (newItems.length < prev.length) {
          client.emit('inventoryDataReceived');
        }
        if (selectedItem?.id === itemToRemove.id) {
          setSelectedItem(null);
        }
        return newItems;
      });
    }
  }, [client, selectedItem?.id]);

  const updateItemInInventory = useCallback((location: ItemLocation, updatedItem: Item) => {
    if (location === 'inv') {
      setItems(prev => prev.map(item => item.id === updatedItem.id ? { ...item, ...updatedItem } : item));
      if (selectedItem?.id === updatedItem.id) {
        setSelectedItem(prevSelectedItem => prevSelectedItem ? { ...prevSelectedItem, ...updatedItem } : null);
      }
      client.emit('inventoryDataReceived');
    }
  }, [client, selectedItem?.id]);

  useEffect(() => {
    const handleList = (data: any) => updateInventory(data.location, data.items);
    const handleAdd = (data: any) => addItemToInventory(data.location, data.item);
    const handleRemove = (data: any) => removeItemFromInventory(data.location, data.item);
    const handleUpdate = (data: any) => updateItemInInventory(data.location, data.item);

    client.on('itemsList', handleList);
    client.on('itemAdd', handleAdd);
    client.on('itemRemove', handleRemove);
    client.on('itemUpdate', handleUpdate);

    const charItemsHandler = client.gmcpHandlers['Char.Items'] as any;
    if (charItemsHandler?.sendInventoryRequest) {
      charItemsHandler.sendInventoryRequest();
    }

    return () => {
      client.off('itemsList', handleList);
      client.off('itemAdd', handleAdd);
      client.off('itemRemove', handleRemove);
      client.off('itemUpdate', handleUpdate);
    };
  }, [client, updateInventory, addItemToInventory, removeItemFromInventory, updateItemInInventory]);

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
