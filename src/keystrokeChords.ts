export type Modifier = "ctrl" | "alt" | "shift" | "meta";

/** A key and its exact modifiers. `key` is a lower-cased key name, as `eventKey` reads one. */
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

const PHYSICAL_PUNCTUATION: Record<string, string> = {
  Backquote: "`",
  Minus: "-",
  Equal: "=",
  BracketLeft: "[",
  BracketRight: "]",
  Backslash: "\\",
  Semicolon: ";",
  Quote: "'",
  Comma: ",",
  Period: ".",
  Slash: "/",
};

/** What this physical key types on a US QWERTY keyboard, for the keys that type a character. */
function physicalCharacter(code: string): string | undefined {
  const match = /^(?:Key([A-Z])|Digit([0-9]))$/.exec(code);
  if (match) return (match[1] ?? match[2]).toLowerCase();
  return PHYSICAL_PUNCTUATION[code];
}

/**
 * The key a press means, lower-cased. This is what the player's layout typed, so Ctrl+I is the
 * key marked I on Dvorak or AZERTY. Two cases fall back to the key's US QWERTY name: the layout
 * typed no ASCII character (Option on a Mac, Cyrillic, a dead key), or a digit key typed
 * punctuation (Shift+1, unshifted AZERTY), so digit shortcuts work on every layout.
 * `event.code` alone names the key's position, whatever the layout types there.
 */
export function eventKey(event: KeyboardEvent): string {
  const typed = normalizeKey(event.key);
  const physical = physicalCharacter(event.code);
  if (physical === undefined) return typed;
  if (/^[0-9]$/.test(physical)) return /^[0-9]$/.test(typed) ? typed : physical;
  return /^[\x21-\x7e]$/.test(typed) ? typed : physical;
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
  // The typed character also counts, so a binding sent as Shift+! still matches Shift+1.
  return eventKey(event) === chord.key || normalizeKey(event.key) === chord.key;
}

/** The chord a key press would bind, or nothing for a lone modifier key. */
export function chordFromEvent(event: KeyboardEvent): Chord | undefined {
  if (LONE_MODIFIER_KEYS.has(event.key.toLowerCase())) return undefined;
  return { key: eventKey(event), modifiers: eventModifiers(event) };
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
