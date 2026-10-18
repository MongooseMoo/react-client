export type Modifier = "ctrl" | "alt" | "shift" | "meta";

/** A key and its exact modifiers. `key` is a lower-cased KeyboardEvent.key value. */
export interface Chord {
  key: string;
  modifiers: Modifier[];
}

const MODIFIER_ORDER: Modifier[] = ["ctrl", "alt", "shift", "meta"];

const MODIFIER_ALIASES: Record<string, Modifier> = {
  ctrl: "ctrl",
  control: "ctrl",
  alt: "alt",
  option: "alt",
  shift: "shift",
  meta: "meta",
  cmd: "meta",
};

const KEY_ALIASES: Record<string, string> = {
  left: "arrowleft",
  right: "arrowright",
  up: "arrowup",
  down: "arrowdown",
  esc: "escape",
  space: " ",
  del: "delete",
};

const KEY_NAMES: Record<string, string> = {
  " ": "Space",
  arrowleft: "Left Arrow",
  arrowright: "Right Arrow",
  arrowup: "Up Arrow",
  arrowdown: "Down Arrow",
  pageup: "Page Up",
  pagedown: "Page Down",
};

const MODIFIER_NAMES: Record<Modifier, string> = {
  ctrl: "Ctrl",
  alt: "Alt",
  shift: "Shift",
  meta: "Meta",
};

const LONE_MODIFIER_KEYS = new Set(["shift", "control", "alt", "meta", "altgraph", "os"]);

function sortModifiers(modifiers: Iterable<Modifier>): Modifier[] {
  const present = new Set(modifiers);
  return MODIFIER_ORDER.filter((modifier) => present.has(modifier));
}

export function normalizeKey(key: string): string {
  const lower = key.toLowerCase();
  return KEY_ALIASES[lower] ?? lower;
}

/** Read a binding's key and modifiers as the server sent them. */
export function parseChord(
  key: string,
  modifiers: readonly string[],
): { chord: Chord; error?: undefined } | { chord?: undefined; error: string } {
  const parsed: Modifier[] = [];
  for (const name of modifiers) {
    const modifier = MODIFIER_ALIASES[name.toLowerCase()];
    if (!modifier) return { error: `Unknown modifier "${name}"` };
    parsed.push(modifier);
  }
  return { chord: { key: normalizeKey(key), modifiers: sortModifiers(parsed) } };
}

function eventModifiers(event: KeyboardEvent): Modifier[] {
  const modifiers: Modifier[] = [];
  if (event.ctrlKey) modifiers.push("ctrl");
  if (event.altKey) modifiers.push("alt");
  if (event.shiftKey) modifiers.push("shift");
  if (event.metaKey) modifiers.push("meta");
  return modifiers;
}

/** The letter or digit printed on the physical key, if it is one. */
function physicalCharacter(code: string): string | undefined {
  const match = /^(?:Key([A-Z])|Digit([0-9]))$/.exec(code);
  if (!match) return undefined;
  return (match[1] ?? match[2]).toLowerCase();
}

function sameModifiers(a: readonly Modifier[], b: readonly Modifier[]): boolean {
  const left = sortModifiers(a);
  const right = sortModifiers(b);
  return left.length === right.length && left.every((modifier, index) => modifier === right[index]);
}

export function chordsEqual(a: Chord, b: Chord): boolean {
  return a.key === b.key && sameModifiers(a.modifiers, b.modifiers);
}

export function matchesEvent(chord: Chord, event: KeyboardEvent): boolean {
  if (!sameModifiers(chord.modifiers, eventModifiers(event))) return false;
  if (event.key.toLowerCase() === chord.key) return true;
  return /^[a-z0-9]$/.test(chord.key) && physicalCharacter(event.code) === chord.key;
}

/** The chord a key press would bind, or nothing for a lone modifier key. */
export function chordFromEvent(event: KeyboardEvent): Chord | undefined {
  const typed = event.key.toLowerCase();
  if (LONE_MODIFIER_KEYS.has(typed)) return undefined;
  const physical = physicalCharacter(event.code);
  const key = physical !== undefined && !/^[a-z0-9]$/.test(typed) ? physical : typed;
  return { key, modifiers: eventModifiers(event) };
}

export function formatChord(chord: Chord): string {
  const keyName =
    KEY_NAMES[chord.key] ?? `${chord.key.charAt(0).toUpperCase()}${chord.key.slice(1)}`;
  return [...sortModifiers(chord.modifiers).map((modifier) => MODIFIER_NAMES[modifier]), keyName].join(
    "+",
  );
}

/** A chord without Ctrl, Alt or Meta takes a key the player types with. */
export function isTypingChord(chord: Chord): boolean {
  return !chord.modifiers.some((modifier) => modifier !== "shift");
}
