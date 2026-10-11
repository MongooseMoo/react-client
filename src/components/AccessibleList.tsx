import React, { useState, useRef, useLayoutEffect } from 'react';
import { useFocusRecovery } from '../hooks/useFocusRecovery';
import './AccessibleList.css';

interface AccessibleListItem {
  id: string;
  [key: string]: any;
}

interface AccessibleListProps<T extends AccessibleListItem> {
  items: T[];
  renderItem: (item: T, index: number, isSelected: boolean) => React.ReactNode;
  listId: string;
  labelledBy: string;
  className?: string;
  itemClassName?: (item: T, index: number, isSelected: boolean) => string;
  getItemTextValue?: (item: T) => string;
  onSelectedIndexChange?: (index: number) => void;
  onActivate?: (index: number) => void;
  /** Surviving heading/control used only if this focused list is removed. */
  focusReturnId?: string;
}

const AccessibleList = <T extends AccessibleListItem>({
  items, renderItem, listId, labelledBy, className = '', itemClassName,
  getItemTextValue = (item) => (item.name || item.id || '').toString(),
  onSelectedIndexChange, onActivate, focusReturnId,
}: AccessibleListProps<T>) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const previousIndex = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const notifiedSelection = useRef({ id: null as string | null, index: -1 });
  const selectionCallback = useRef(onSelectedIndexChange);
  selectionCallback.current = onSelectedIndexChange;
  const typeahead = useRef({ text: '', time: 0 });
  useFocusRecovery(containerRef, focusReturnId);

  const retainedIndex = items.findIndex((item) => item.id === selectedId);
  const selectedIndex = selectedId === null ? -1 : retainedIndex >= 0 ? retainedIndex :
    items.length > 0 ? Math.min(previousIndex.current, items.length - 1) : -1;
  const resolvedId = items[selectedIndex]?.id ?? null;

  useLayoutEffect(() => {
    if (selectedId !== resolvedId) setSelectedId(resolvedId);
    if (selectedIndex >= 0) previousIndex.current = selectedIndex;
    if (notifiedSelection.current.id !== resolvedId || notifiedSelection.current.index !== selectedIndex) {
      notifiedSelection.current = { id: resolvedId, index: selectedIndex };
      selectionCallback.current?.(selectedIndex);
    }
    // Background refreshes must not scroll a panel the user is not using.
    if (resolvedId && document.activeElement === containerRef.current) {
      document.getElementById(`${listId}-item-${resolvedId}`)?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedId, resolvedId, selectedIndex, listId]);

  const select = (index: number) => {
    previousIndex.current = index;
    setSelectedId(items[index]?.id ?? null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!items.length || event.ctrlKey || event.metaKey || event.altKey) return;
    let next = selectedIndex;
    switch (event.key) {
      case 'ArrowDown': next = (selectedIndex + 1) % items.length; break;
      case 'ArrowUp': next = selectedIndex < 0 ? items.length - 1 : (selectedIndex - 1 + items.length) % items.length; break;
      case 'Home': next = 0; break;
      case 'End': next = items.length - 1; break;
      case 'PageUp': next = Math.max(selectedIndex - 5, 0); break;
      case 'PageDown': next = Math.min(selectedIndex + 5, items.length - 1); break;
      case 'Enter':
        if (!onActivate || selectedIndex < 0) return;
        event.preventDefault();
        onActivate(selectedIndex);
        return;
      default: {
        if (event.key.length !== 1 || event.key === ' ') return;
        const now = Date.now();
        const prior = now - typeahead.current.time < 700 ? typeahead.current.text : '';
        const text = prior + event.key.toLowerCase();
        const repeated = [...text].every((character) => character === text[0]);
        const query = repeated ? text[0] : text;
        const start = prior && !repeated ? Math.max(selectedIndex, 0) : (selectedIndex + 1) % items.length;
        typeahead.current = { text: repeated ? query : text, time: now };
        next = -1;
        for (let offset = 0; offset < items.length; offset++) {
          const index = (start + offset) % items.length;
          if (getItemTextValue(items[index]).toLowerCase().startsWith(query)) { next = index; break; }
        }
        if (next < 0) return;
        event.preventDefault();
        select(next);
        return;
      }
    }
    typeahead.current = { text: '', time: 0 };
    event.preventDefault();
    select(next);
  };

  return (
    <div id={listId} className={`accessible-list-container ${className}`} ref={containerRef}
      tabIndex={0} role="listbox" aria-labelledby={labelledBy}
      aria-activedescendant={resolvedId ? `${listId}-item-${resolvedId}` : undefined}
      onFocus={() => { if (selectedIndex < 0 && items.length) select(0); }}
      onBlur={() => { typeahead.current = { text: '', time: 0 }; }} onKeyDown={handleKeyDown}>
      <ul role="none" className="accessible-list-ul">
        {items.map((item, index) => {
          const selected = index === selectedIndex;
          return (
            // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: the listbox owns option keyboard operation.
            <li role="option" key={item.id} id={`${listId}-item-${item.id}`}
              className={`${itemClassName?.(item, index, selected) ?? ''} ${selected ? 'selected' : ''}`}
              aria-selected={selected} onClick={() => { select(index); containerRef.current?.focus(); onActivate?.(index); }}>
              {renderItem(item, index, selected)}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AccessibleList;
