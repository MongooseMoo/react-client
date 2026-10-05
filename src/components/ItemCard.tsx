import React from 'react';
import { Item } from '../gmcp/Char/Items'; // Assuming Item interface is here
import { type ItemAction, itemActions } from '../itemActions';
import './ItemCard.css';

interface ItemCardProps {
    item: Item;
    onAction: (action: ItemAction) => void;
    // isSelected is no longer needed as card is only shown for the selected item
    // detailsId is no longer needed
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onAction }) => {
    // const attributes = parseAttributes(item.Attrib); // Removed attribute parsing
    const itemTitle = item.name; // Title is just the item name for now

    return (
        <div className="item-card" title={itemTitle} data-item-id={item.id}>
            {item.icon && <img src={item.icon} alt="" className="item-icon" />}
            <div className="item-details"> {/* The id attribute, which previously used detailsId, was removed here */}
                <div className="item-name">{item.name}</div>
                {/* Attribute display removed for now */}
            </div>
            <div className="item-actions">
                {itemActions(item).map((action) => (
                    <button
                        key={action.command}
                        type="button"
                        className="item-action-button"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent click from propagating to parent elements if any
                            onAction(action);
                        }}
                        aria-label={action.description}
                    >
                        {action.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ItemCard;
