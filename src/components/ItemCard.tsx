import React from 'react';
import { Item } from '../gmcp/Char/Items'; // Assuming Item interface is here
import './ItemCard.css';

interface ItemCardProps {
    item: Item;
    onDrop: (item: Item) => void;
    onWear?: (item: Item) => void;
    onRemove?: (item: Item) => void;
    onGet?: (item: Item) => void; // Added onGet prop
    // isSelected is no longer needed as card is only shown for the selected item
    // detailsId is no longer needed
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onDrop, onWear, onRemove, onGet }) => {
    // const attributes = parseAttributes(item.Attrib); // Removed attribute parsing
    const itemTitle = item.name; // Title is just the item name for now

    const isWearable = item.Attrib?.includes('W');
    const isWorn = item.Attrib?.includes('w');

    const handleDropClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent click from propagating to parent elements if any
        if (onDrop) onDrop(item);
    };

    const handleGetClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onGet) onGet(item);
    };

    return (
        <div className="item-card" title={itemTitle} data-item-id={item.id}>
            {item.icon && <img src={item.icon} alt="" className="item-icon" />}
            <div className="item-details"> {/* The id attribute, which previously used detailsId, was removed here */}
                <div className="item-name">{item.name}</div>
                {/* Attribute display removed for now */}
            </div>
            <div className="item-actions">
                {item.location === 'room' && onGet && (
                    <button
                        className="item-get-button" // New class for styling
                        onClick={handleGetClick}
                        aria-label={`Get ${item.name}`}
                        tabIndex={0}
                        accessKey="g" 
                    >
                        Get
                    </button>
                )}
                {item.location === 'inv' && isWearable && !isWorn && onWear && (
                    <button
                        className="item-wear-button"
                        onClick={() => onWear(item)}
                        aria-label={`Wear ${item.name}`}
                        tabIndex={0}
                        accessKey="w"
                    >
                        Wear
                    </button>
                )}
                {item.location === 'inv' && isWorn && onRemove && (
                    <button
                        className="item-remove-button"
                        onClick={() => onRemove(item)}
                        aria-label={`Remove ${item.name}`}
                        tabIndex={0}
                        accessKey="r"
                    >
                        Remove
                    </button>
                )}
                {item.location === 'inv' && onDrop && (
                    <button
                        className="item-drop-button"
                        onClick={handleDropClick}
                        aria-label={`Drop ${item.name}`}
                        tabIndex={0} 
                        accessKey="d"
                    >
                        {/* Visual symbol for this button is rendered using a CSS ::before pseudo-element */}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ItemCard;
