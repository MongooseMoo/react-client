import { eventKey, matchesEvent, type Chord, type Modifier } from "./keystrokeChords";
import { usePreferences, type NavigationKeyScheme } from "./stores/preferencesStore";
import type { StatusReadout } from "./status/statusText";

/**
 * Every key the client keeps for itself, so a server key layer cannot take it.
 * When a shortcut is added to App.tsx, useChannelHistory.tsx, input.tsx or an
 * accessKey, add it here too.
 */
interface ReservedShortcut {
  keys: readonly string[];
  modifiers: readonly Modifier[];
  /** The handler ignores any other modifiers held with these. */
  anyOtherModifiers?: boolean;
  reason: string;
}

// H: Firefox fires access keys on Alt+Shift (K is the player card's "Look"), and Chrome keeps
// Alt+Shift with A, I, N and T.
export const KEYS_MODE_CHORD: Chord = { key: "h", modifiers: ["alt", "shift"] };

/** Alt+Shift+H, the key marked H on the player's layout. */
export function isKeysModeToggle(event: KeyboardEvent): boolean {
  return matchesEvent(KEYS_MODE_CHORD, event);
}

// F1 is the same key on every layout; plain F1 stays the games' (rules).
export const KEYS_HELP_CHORD: Chord = { key: "f1", modifiers: ["alt", "shift"] };

/** Alt+Shift+F1: key help, where each key says what it does instead of doing it. */
export function isKeysHelpToggle(event: KeyboardEvent): boolean {
  return event.altKey && event.shiftKey && !event.ctrlKey && !event.metaKey && event.code === "F1";
}

export const INTERACT_MODE_CHORD: Chord = { key: "`", modifiers: ["alt"] };

/** Alt+backtick by physical key: interact mode (gmcp/Client/Keystrokes.ts), whatever the layout types there. */
export function isInteractModeToggle(event: KeyboardEvent): boolean {
  return event.altKey && !event.shiftKey && !event.ctrlKey && !event.metaKey && event.code === "Backquote";
}

export const HEAD_RECENTER_CHORD: Chord = { key: "o", modifiers: ["alt", "shift"] };

/** Alt+Shift+O: recenters head tracking (src/audio/headTracking.ts). */
export function isHeadRecenterShortcut(event: KeyboardEvent): boolean {
  return matchesEvent(HEAD_RECENTER_CHORD, event);
}

// D for dictate. Alt+Shift with a letter reaches the page past NVDA's and JAWS's browse mode,
// and no browser uses Alt+Shift+D.
export const VOICE_COMMAND_CHORD: Chord = { key: "d", modifiers: ["alt", "shift"] };

/** Alt+Shift+D: listens for a voice command. */
export function isVoiceCommandToggle(event: KeyboardEvent): boolean {
  return matchesEvent(VOICE_COMMAND_CHORD, event);
}

/** The Alt+letter buffer keys of each scheme the player can choose (useChannelHistory.tsx). */
export const navigationKeyMaps: Record<NavigationKeyScheme, { up: string; down: string; left: string; right: string }> = {
  jkli: { up: "i", down: "k", left: "j", right: "l" },
  wasd: { up: "w", down: "s", left: "a", right: "d" },
  "dvorak-rh": { up: "c", down: "t", left: "h", right: "n" },
  "dvorak-lh": { up: ",", down: "o", left: "a", right: "e" },
};

/** Whether a key event is this navigation key, on the player's layout. Modifiers are the caller's to check. */
export function matchesNavKey(e: KeyboardEvent, navKey: string): boolean {
  return eventKey(e) === navKey;
}

// Alter Aeon's keys. H and T are also Dvorak right-hand buffer keys; the buffer keys win.
const STATUS_KEYS: Record<string, StatusReadout> = { h: "health", m: "power", v: "body", t: "target" };

const STATUS_REASONS: Record<StatusReadout, string> = {
  health: "Alt+H reads your health",
  power: "Alt+M reads your power reserves",
  body: "Alt+V reads your body reserve",
  target: "Alt+T reads your target's health",
};

/** Whether the player's buffer scheme uses this letter. */
function schemeUses(scheme: NavigationKeyScheme, letter: string): boolean {
  return Object.values(navigationKeyMaps[scheme]).includes(letter);
}

/**
 * The status readout a plain Alt+letter asks for, or nothing when the key is not a status key
 * or the player's buffer scheme already uses it.
 */
export function statusReadoutFor(event: KeyboardEvent, scheme: NavigationKeyScheme): StatusReadout | undefined {
  if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return undefined;
  if (Object.values(navigationKeyMaps[scheme]).some((navKey) => matchesNavKey(event, navKey))) return undefined;
  const letter = eventKey(event);
  return Object.hasOwn(STATUS_KEYS, letter) ? STATUS_KEYS[letter] : undefined;
}

function statusReason(chord: Chord): string | undefined {
  if (chord.modifiers.length !== 1 || chord.modifiers[0] !== "alt") return undefined;
  const readout = Object.hasOwn(STATUS_KEYS, chord.key) ? STATUS_KEYS[chord.key] : undefined;
  if (!readout || schemeUses(usePreferences.getState().keyboard.navigationKeyScheme, chord.key)) return undefined;
  return STATUS_REASONS[readout];
}

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const ARROWS = ["arrowleft", "arrowright", "arrowup", "arrowdown"];
// Every scheme's letters: the input and output suppress all of them with Alt.
export const BUFFER_LETTERS = ["i", "j", "k", "l", "w", "a", "s", "d", "c", "h", "t", "n", "o", "e", ","];
// toolbar.tsx and PlayerCard.tsx; browsers use Alt or Alt+Shift (Ctrl+Alt on a Mac).
const ACCESS_KEYS = ["l", "c", "e", "p", "u", "g", "s", "k", "f"];

const RESERVED_SHORTCUTS: readonly ReservedShortcut[] = [
  {
    keys: [KEYS_MODE_CHORD.key],
    modifiers: KEYS_MODE_CHORD.modifiers,
    reason: "Alt+Shift+H turns keys mode on and off",
  },
  {
    keys: [KEYS_HELP_CHORD.key],
    modifiers: KEYS_HELP_CHORD.modifiers,
    reason: "Alt+Shift+F1 turns key help on and off",
  },
  {
    keys: [INTERACT_MODE_CHORD.key],
    modifiers: INTERACT_MODE_CHORD.modifiers,
    reason: "Alt+backtick turns interact mode on and off",
  },
  {
    keys: [HEAD_RECENTER_CHORD.key],
    modifiers: HEAD_RECENTER_CHORD.modifiers,
    reason: "Alt+Shift+O recenters head tracking",
  },
  {
    keys: [VOICE_COMMAND_CHORD.key],
    modifiers: VOICE_COMMAND_CHORD.modifiers,
    reason: "Alt+Shift+D listens for a voice command",
  },
  { keys: ["w", "t", "n", "tab"], modifiers: ["ctrl"], reason: "The browser keeps this key" },
  { keys: ["w", "t", "n", "tab"], modifiers: ["ctrl", "shift"], reason: "The browser keeps this key" },
  { keys: DIGITS, modifiers: ["ctrl"], reason: "Reviews recent output" },
  { keys: DIGITS, modifiers: ["ctrl", "shift"], reason: "Opens a sidebar destination" },
  { keys: ["escape"], modifiers: [], anyOtherModifiers: true, reason: "Escape pauses client sounds" },
  { keys: ["control"], modifiers: ["ctrl"], reason: "Ctrl stops speech" },
  { keys: ["enter"], modifiers: [], reason: "Enter sends the command" },
  { keys: ["tab"], modifiers: [], reason: "Tab completes and moves focus" },
  { keys: ["tab"], modifiers: ["shift"], reason: "Shift+Tab moves focus" },
  { keys: ARROWS, modifiers: ["alt"], reason: "Changes buffer and reviews channel messages" },
  { keys: BUFFER_LETTERS, modifiers: ["alt"], reason: "Changes buffer and reviews channel messages" },
  { keys: DIGITS, modifiers: ["alt"], reason: "Reads a recent channel message" },
  { keys: DIGITS, modifiers: ["alt", "shift"], anyOtherModifiers: true, reason: "Selects a numbered buffer" },
  {
    keys: ["pageup", "pagedown", "home", "end"],
    modifiers: ["alt"],
    anyOtherModifiers: true,
    reason: "Moves through channel messages",
  },
  { keys: [" "], modifiers: ["alt"], reason: "Repeats the reviewed channel message" },
  { keys: ["enter"], modifiers: ["alt"], reason: "Opens the reviewed message's link" },
  {
    keys: [" "],
    modifiers: ["alt", "shift"],
    anyOtherModifiers: true,
    reason: "Copies the reviewed channel message",
  },
  { keys: ["t"], modifiers: ["alt", "shift"], anyOtherModifiers: true, reason: "Toggles channel timestamps" },
  { keys: ["r"], modifiers: ["alt", "shift"], reason: "Changes how the channel is read aloud" },
  { keys: ["delete"], modifiers: ["alt", "shift"], anyOtherModifiers: true, reason: "Deletes the current buffer" },
  { keys: ACCESS_KEYS, modifiers: ["alt"], reason: "A toolbar or player access key" },
  { keys: ACCESS_KEYS, modifiers: ["alt", "shift"], reason: "A toolbar or player access key" },
  { keys: ACCESS_KEYS, modifiers: ["ctrl", "alt"], reason: "A toolbar or player access key" },
];

function covers(shortcut: ReservedShortcut, chord: Chord): boolean {
  if (!shortcut.keys.includes(chord.key)) return false;
  if (!shortcut.modifiers.every((modifier) => chord.modifiers.includes(modifier))) return false;
  return shortcut.anyOtherModifiers === true || chord.modifiers.length === shortcut.modifiers.length;
}

/** Why the client keeps this chord, or nothing when a layer may bind it. */
export function reservedReason(chord: Chord): string | undefined {
  return statusReason(chord) ?? RESERVED_SHORTCUTS.find((shortcut) => covers(shortcut, chord))?.reason;
}
