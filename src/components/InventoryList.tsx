import React from 'react';
import { Item } from '../gmcp/Char/Items';
import AccessibleList from './AccessibleList';
// Note: InventoryList.css is now imported by the parent Inventory.tsx

interface InventoryListProps {
  items: Item[];
  onItemSelected: (item: Item | null) => void;
  listId: string;
  labelledBy: string;
}

const InventoryList: React.FC<InventoryListProps> = ({
  items,
  onItemSelected,
  listId,
  labelledBy,
}) => {

  const handleSelectionChange = (index: number) => {
    if (index > -1 && items[index]) {
      onItemSelected(items[index]);
    } else {
      onItemSelected(null);
    }
  };

  const renderInventoryItem = (item: Item, index: number, isSelected: boolean) => {
    return (
      <span > {/* Apply title to span for hover effect */}
        {item.name}
      </span>
    );
  };


  const getInventoryItemClassName = (item: Item, index: number, isSelected: boolean): string => {
    // This class is applied to the <li> element by AccessibleList.
    // It will be styled by rules in InventoryList.css (imported by parent)
    // or AccessibleList.css
    let classes = "inventory-list-li";
    return classes;
  };

  const getInventoryItemTextValue = (item: Item): string => {
    return item.name ? item.name.toLowerCase() : '';
  };

  return (
    <AccessibleList
      items={items}
      renderItem={renderInventoryItem}
      listId={listId}
      labelledBy={labelledBy}
      className="inventory-accessible-list" // Class for the AccessibleList's root div
      itemClassName={getInventoryItemClassName}
      getItemTextValue={getInventoryItemTextValue}
      onSelectedIndexChange={handleSelectionChange}
    />
  );
};

export default InventoryList;
