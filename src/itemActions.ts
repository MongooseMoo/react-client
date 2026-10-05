import type MudClient from "./client";
import type { Item } from "./gmcp/Char/Items";
import { setInputTextAndFocus } from "./inputFocus";

/** Stands in a verb's syntax where the player supplies the text. */
const ANYTHING = "<anything>";

export interface ItemAction {
  /** Button text: the verb and its fixed words, e.g. "Take" or "Put … in". */
  label: string;
  /** The same with the item named, e.g. "Put … in chest". */
  description: string;
  /** The command line, with each slot the player must fill left empty. */
  command: string;
  /** Where the first empty slot is in `command`; absent when the command is complete. */
  caret?: number;
}

/**
 * What the player can do to an item, from the verbs the server lists for it.
 * Each verb is its names joined by "/" (a "*" marks how far a name can be
 * abbreviated) followed by its arguments in typing order: the item's own id,
 * a preposition, or "<anything>".
 */
export function itemActions(item: Item): ItemAction[] {
  const actions = new Map<string, ItemAction>();
  for (const [names, ...args] of item.verbs ?? []) {
    const name = names.split("/")[0].replaceAll("*", "").replaceAll(ANYTHING, "");
    if (name === "") {
      continue;
    }
    let command = name;
    let caret: number | undefined;
    const label = [name];
    const description = [name];
    for (const arg of args) {
      command += " ";
      if (arg === ANYTHING) {
        caret ??= command.length;
        label.push("…");
        description.push("…");
      } else if (arg === item.id) {
        command += arg;
        description.push(item.name);
      } else {
        command += arg;
        label.push(arg);
        description.push(arg);
      }
    }
    if (!actions.has(command)) {
      actions.set(command, {
        label: capitalize(label.join(" ")),
        description: capitalize(description.join(" ")),
        command,
        caret,
      });
    }
  }
  return [...actions.values()];
}

/** Send a complete command; put an incomplete one in the input for the player to finish. */
export function performItemAction(client: Pick<MudClient, "sendCommand">, action: ItemAction): void {
  if (action.caret === undefined) {
    client.sendCommand(action.command);
  } else {
    setInputTextAndFocus(action.command, action.caret);
  }
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
