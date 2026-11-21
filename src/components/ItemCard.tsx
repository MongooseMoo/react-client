import React from 'react';
import type { IconType } from 'react-icons';
import {
    FaArrowDown,
    FaBed,
    FaBox,
    FaBoxOpen,
    FaChair,
    FaGift,
    FaHandRock,
    FaLock,
    FaLockOpen,
    FaSignInAlt,
} from 'react-icons/fa';
import { Item } from '../gmcp/Char/Items'; // Assuming Item interface is here
import { type ItemAction, itemActions } from '../itemActions';
import './ItemCard.css';
import { useFocusRecovery } from '../hooks/useFocusRecovery';

// The server names the verbs, so only the ones listed here get an icon.
const ACTION_ICONS = new Map<string, IconType>([
    ['sit', FaChair],
    ['lie', FaBed],
    ['take', FaHandRock],
    ['remove', FaHandRock],
    ['put', FaSignInAlt],
    ['open', FaBoxOpen],
    ['close', FaBox],
    ['give', FaGift],
    ['drop', FaArrowDown],
    ['bolt', FaLock],
    ['unbolt', FaLockOpen],
]);

interface ItemCardProps {
    item: Item;
    onAction: (action: ItemAction) => void;
    focusReturnId?: string;
    focusFallbackId?: string;
    /** Where the thing is, in words, when the room's layout says ("on the low table"). */
    where?: string;
    /** What it is and is made of, when the room's layout says ("table, wood"). */
    kind?: string;
    // isSelected is no longer needed as card is only shown for the selected item
    // detailsId is no longer needed
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onAction, focusReturnId, focusFallbackId, where, kind }) => {
    const cardRef = React.useRef<HTMLDivElement>(null);
    useFocusRecovery(cardRef, focusReturnId, focusFallbackId);
    // const attributes = parseAttributes(item.Attrib); // Removed attribute parsing
    const itemTitle = item.name; // Title is just the item name for now

    return (
        <div ref={cardRef} className="item-card" title={itemTitle} data-item-id={item.id}>
            {item.icon && <img src={item.icon} alt="" className="item-icon" />}
            <div className="item-details"> {/* The id attribute, which previously used detailsId, was removed here */}
                <div className="item-name">{item.name}</div>
                {where && <div className="item-attributes item-where">{where}</div>}
                {kind && <div className="item-attributes item-kind">{kind}</div>}
            </div>
            <div className="item-actions">
                {itemActions(item).map((action) => {
                    const Icon = ACTION_ICONS.get(action.verb);
                    return (
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
                            {Icon && <Icon aria-hidden="true" />}
                            {action.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ItemCard;
