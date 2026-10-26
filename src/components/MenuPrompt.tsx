import type React from "react";
import { useEffect, useMemo, useRef } from "react";
import AccessibleList from "./AccessibleList";
import type { WorldMongooseMenu } from "../mcp/packages/menu";
import "./MenuPrompt.css";

/** What the MOO's read() takes as "never mind": $command_utils:read aborts the command. */
export const MENU_ABORT = "@abort";

interface MenuPromptProps {
  menu: WorldMongooseMenu;
  /** Sends one line to the server: a choice's response, or MENU_ABORT. */
  onAnswer: (line: string) => void;
}

const DIGIT_WAIT_MS = 700;

// "your selection:" -> "Your selection"
const titleFor = (prompt: string): string => {
  const text = prompt.trim().replace(/:$/, "");
  return text ? text[0].toUpperCase() + text.slice(1) : "Choose one";
};

/**
 * A server menu shown in place of the input line. The choices are an APG
 * listbox (AccessibleList): arrows, Home/End and typeahead move, Enter or click
 * chooses. Typing a choice's number chooses it. Escape cancels the command
 * without the app-wide Escape that pauses sounds (App.tsx skips .menu-prompt).
 */
export default function MenuPrompt({ menu, onAnswer }: MenuPromptProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const digits = useRef({ text: "", timer: 0 });

  const choices = useMemo(
    () =>
      menu.items
        .filter((item) => item.response)
        .map((item, index) => ({ ...item, id: String(index) })),
    [menu],
  );
  const notes = menu.items.filter((item) => !item.response);

  useEffect(() => {
    rootRef.current?.querySelector<HTMLElement>('[role="listbox"]')?.focus();
  }, [menu]);

  useEffect(() => () => window.clearTimeout(digits.current.timer), []);

  const handleKeyDownCapture = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onAnswer(MENU_ABORT);
      return;
    }
    if (!/^[0-9]$/.test(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    // "1" waits briefly when there is also a "12"; otherwise it chooses at once.
    window.clearTimeout(digits.current.timer);
    const typed = digits.current.text + event.key;
    const exact = choices.find((choice) => choice.response === typed);
    const longer = choices.some(
      (choice) => choice.response !== typed && choice.response.startsWith(typed),
    );
    digits.current.text = longer ? typed : "";
    if (exact && !longer) {
      onAnswer(exact.response);
    } else if (exact) {
      digits.current.timer = window.setTimeout(() => {
        digits.current.text = "";
        onAnswer(exact.response);
      }, DIGIT_WAIT_MS);
    }
  };

  return (
    <div
      className="menu-prompt"
      ref={rootRef}
      role="group"
      aria-labelledby="menu-prompt-title"
      onKeyDownCapture={handleKeyDownCapture}
    >
      <div className="menu-prompt-header">
        <h2 id="menu-prompt-title" className="menu-prompt-title">
          {titleFor(menu.prompt)}
        </h2>
        <span className="menu-prompt-hint" aria-hidden="true">
          Enter to choose · Esc to cancel
        </span>
      </div>
      {notes.length > 0 && (
        <div className="menu-prompt-notes">
          {notes.map((note, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: notes are fixed for this menu and may repeat
            <p key={index}>{note.label}</p>
          ))}
        </div>
      )}
      <AccessibleList
        items={choices}
        listId="menu-prompt-list"
        labelledBy="menu-prompt-title"
        className="menu-prompt-list"
        renderItem={(item) => (
          <>
            <span className="menu-prompt-key">{item.response}</span>
            <span className="menu-prompt-label">{item.label}</span>
          </>
        )}
        getItemTextValue={(item) => item.label}
        onActivate={(index) => onAnswer(choices[index].response)}
      />
      <button
        type="button"
        className="menu-prompt-cancel"
        onClick={() => onAnswer(MENU_ABORT)}
      >
        Cancel
      </button>
    </div>
  );
}
