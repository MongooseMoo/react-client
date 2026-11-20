import type React from 'react';
import type { Item } from '../gmcp/Char/Items';
import AccessibleList from './AccessibleList';
// Note: InventoryList.css is now imported by the parent Inventory.tsx

interface InventoryListProps {
  items: Item[];
  /** The selected item's id, or null: the selection is the items store's, shared with the Room tab and interact mode. */
  selectedId: string | null;
  onSelect: (id: string) => void;
  listId: string;
  labelledBy: string;
  focusReturnId?: string;
}

const renderInventoryItem = (item: Item) => <span>{item.name}</span>;
// Applied to the <li> by AccessibleList; styled in InventoryList.css.
const getInventoryItemClassName = () => "inventory-list-li";
const getInventoryItemTextValue = (item: Item) => (item.name ? item.name.toLowerCase() : '');

const InventoryList: React.FC<InventoryListProps> = ({
  items,
  selectedId,
  onSelect,
  listId,
  labelledBy,
  focusReturnId,
}) => (
  <AccessibleList
    items={items}
    renderItem={renderInventoryItem}
    listId={listId}
    labelledBy={labelledBy}
    className="inventory-accessible-list" // Class for the AccessibleList's root div
    itemClassName={getInventoryItemClassName}
    getItemTextValue={getInventoryItemTextValue}
    selectedId={selectedId}
    onSelect={onSelect}
    focusReturnId={focusReturnId}
  />
);

export default InventoryList;
