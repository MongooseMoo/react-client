import type { RefObject } from "react";
import { useInputStore } from "./stores/inputStore";

let commandInputRef: RefObject<HTMLTextAreaElement> | null = null;

/** Register the command input textarea so it can be focused imperatively from anywhere. */
export function registerCommandInput(ref: RefObject<HTMLTextAreaElement>): void {
  commandInputRef = ref;
}

/** Focus the registered command input, if one is present. */
export function focusCommandInput(): void {
  commandInputRef?.current?.focus();
}

/**
 * Set the command input text and focus it — used by UI actions such as paging a player.
 * `caret` puts the cursor at that position instead of at the end.
 */
export function setInputTextAndFocus(text: string, caret?: number): void {
  useInputStore.getState().setText(text);
  focusCommandInput();
  if (caret !== undefined) {
    // The textarea is controlled, so the new text is in it only after the next render.
    requestAnimationFrame(() => commandInputRef?.current?.setSelectionRange(caret, caret));
  }
}
