import type React from "react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import "./historySearch.css";

type Props = {
  /** Returns matches for a query, most recent first. */
  search: (query: string) => string[];
  /** Called with the chosen command. */
  onAccept: (command: string) => void;
  /** Called when the search is dismissed without choosing. */
  onCancel: () => void;
};

/**
 * Reverse history search (Ctrl+R), presented as an editable combobox with a
 * listbox popup per the APG combobox pattern. DOM focus stays on the search
 * input; the highlighted option is conveyed via aria-activedescendant. A
 * polite live region announces the match count, since activedescendant alone
 * is unreliable across screen readers.
 */
const HistorySearch = ({ search, onAccept, onCancel }: Props) => {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;

  const matches = useMemo(() => search(query), [search, query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Clamp the highlight when the match list shrinks under it.
  useEffect(() => {
    setActiveIndex((index) => Math.min(index, Math.max(matches.length - 1, 0)));
  }, [matches.length]);

  const optionId = (index: number) => `${baseId}-option-${index}`;

  const accept = useCallback(() => {
    if (matches.length > 0) {
      onAccept(matches[activeIndex]);
    } else {
      onCancel();
    }
  }, [matches, activeIndex, onAccept, onCancel]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      accept();
    } else if (e.key === "ArrowDown" || (e.key.toLowerCase() === "r" && e.ctrlKey)) {
      // ArrowDown / Ctrl+R both step to the next (older) match, readline-style.
      e.preventDefault();
      if (matches.length > 0) {
        setActiveIndex((index) => (index + 1) % matches.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (matches.length > 0) {
        setActiveIndex((index) => (index - 1 + matches.length) % matches.length);
      }
    }
  };

  return (
    <div className="history-search">
      <label htmlFor={`${baseId}-input`} className="history-search-label">
        Search command history
      </label>
      <input
        id={`${baseId}-input`}
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={matches.length > 0}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={matches.length > 0 ? optionId(activeIndex) : undefined}
        autoComplete="off"
        spellCheck={false}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(0);
        }}
        onKeyDown={handleKeyDown}
        className="history-search-input"
      />
      <div id={listboxId} role="listbox" aria-label="Matching commands" className="history-search-list">
        {matches.map((command, index) => (
          <div
            key={optionId(index)}
            id={optionId(index)}
            role="option"
            tabIndex={-1}
            aria-selected={index === activeIndex}
            className={
              index === activeIndex
                ? "history-search-option history-search-option-active"
                : "history-search-option"
            }
            onMouseDown={(e) => {
              // Accept on mousedown so the click doesn't blur the input first.
              e.preventDefault();
              onAccept(command);
            }}
          >
            {command}
          </div>
        ))}
      </div>
      <div aria-live="polite" className="sr-only">
        {matches.length === 0
          ? "No matching commands"
          : `${matches.length} matching command${matches.length === 1 ? "" : "s"}`}
      </div>
    </div>
  );
};

export default HistorySearch;
