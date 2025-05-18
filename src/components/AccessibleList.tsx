import React, { useState, useRef, useEffect, useCallback } from 'react';
import './AccessibleList.css'; // Import the CSS file

interface AccessibleListItem {
    id: string; // Unique identifier for the item
    // Add other common properties if needed, or allow generic type T
    [key: string]: any; // Allow arbitrary properties for flexibility
}

interface AccessibleListRenderResult {
    node: React.ReactNode;
    labelId?: string; // This will effectively be unused by renderItem's new signature but kept for type compatibility if other parts rely on it.
}

interface AccessibleListProps<T extends AccessibleListItem> {
    items: T[];
    renderItem: (item: T, index: number, isSelected: boolean) => React.ReactNode; // Updated signature
    listId: string; // Unique ID for the listbox element
    labelledBy: string; // ID of the element labelling this list
    className?: string; // Optional class for the container div
    itemClassName?: (item: T, index: number, isSelected: boolean) => string; // Optional function for item classes
    getItemTextValue?: (item: T) => string; // Function to get text value for typeahead
    onSelectedIndexChange?: (index: number) => void; // Callback for when selected index changes
}

const AccessibleList = <T extends AccessibleListItem>({
    items,
    renderItem,
    listId,
    labelledBy,
    className = '',
    itemClassName,
    getItemTextValue = (item) => (item.name || item.id || '').toString().toLowerCase(), // Default text value getter
    onSelectedIndexChange,
}: AccessibleListProps<T>) => {
    const [selectedIndex, setSelectedIndexState] = useState<number>(-1);
    const containerRef = useRef<HTMLDivElement>(null);

    const setSelectedIndex = useCallback((index: number) => {
        setSelectedIndexState(index);
        if (onSelectedIndexChange) {
            onSelectedIndexChange(index);
        }
    }, [onSelectedIndexChange]);

    const handleFocus = () => {
        if (selectedIndex === -1 && items.length > 0) {
            setSelectedIndex(0); // Uses the new setSelectedIndex
        }
    };

    useEffect(() => {
        // Reset index if items change and selected index becomes invalid
        if (selectedIndex >= items.length) {
            setSelectedIndex(items.length > 0 ? 0 : -1); // Uses the new setSelectedIndex
        }
        // Ensure the selected item is visible
        if (selectedIndex !== -1 && items[selectedIndex]) { // Add check for items[selectedIndex]
            const selectedElId = `${listId}-item-${items[selectedIndex]?.id}`;
            const selectedEl = document.getElementById(selectedElId);
            if (selectedEl) {
                selectedEl.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex, items, listId]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        if (items.length === 0) return;

        let newIndex = selectedIndex;
        let preventDefault = true; // Assume prevention unless specified otherwise

        switch (e.key) {
            case "ArrowDown":
                newIndex = (selectedIndex + 1) % items.length;
                break;
            case "ArrowUp":
                newIndex = (selectedIndex - 1 + items.length) % items.length;
                break;
            case "Home":
                newIndex = 0;
                break;
            case "End":
                newIndex = items.length - 1;
                break;
            case "PageUp":
                // Implement PageUp logic if needed, e.g., jump 5 items
                newIndex = Math.max(selectedIndex - 5, 0);
                break;
            case "PageDown":
                // Implement PageDown logic if needed, e.g., jump 5 items
                newIndex = Math.min(selectedIndex + 5, items.length - 1);
                break;
            default:
                if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    // Typeahead logic
                    const letter = e.key.toLowerCase();
                    let startIndex = selectedIndex === -1 ? 0 : (selectedIndex + 1) % items.length;
                    let foundIndex = -1;
                    for (let i = 0; i < items.length; i++) {
                        const idx = (startIndex + i) % items.length;
                        const itemText = getItemTextValue(items[idx]);
                        if (itemText.startsWith(letter)) {
                            foundIndex = idx;
                            break;
                        }
                    }
                    if (foundIndex !== -1) {
                        newIndex = foundIndex;
                    } else {
                        preventDefault = false; // Don't prevent default if no match found
                    }
                } else {
                    preventDefault = false; // Don't prevent default for unhandled keys
                }
                break;
        }

        if (newIndex !== selectedIndex) {
            setSelectedIndex(newIndex);
        }

        if (preventDefault) {
            e.preventDefault();
        }
    }, [selectedIndex, items, getItemTextValue]);

    return (
        <div
            id={listId}
            className={`accessible-list-container ${className}`}
            ref={containerRef}
            tabIndex={0} // Make the container focusable
            role="listbox"
            aria-labelledby={labelledBy}
            aria-activedescendant={selectedIndex !== -1 ? `${listId}-item-${items[selectedIndex]?.id}` : undefined}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
        >
            {/* Add className to ul */}
            <ul role="none" className="accessible-list-ul">
                {items.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    // renderItem now directly returns React.ReactNode
                    const itemContent = renderItem(item, index, isSelected);
                    const classes = itemClassName ? itemClassName(item, index, isSelected) : '';
                    return (
                        <li
                            key={item.id}
                            id={`${listId}-item-${item.id}`}
                            className={`${classes} ${isSelected ? 'selected' : ''}`}
                            role="option"
                            aria-selected={isSelected}
                            // aria-labelledby removed as item content will label it
                            // Optional: Add onClick handler if items should be selectable by mouse
                            onClick={() => setSelectedIndex(index)} // Uses the new setSelectedIndex
                        >
                            {itemContent}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default AccessibleList;
