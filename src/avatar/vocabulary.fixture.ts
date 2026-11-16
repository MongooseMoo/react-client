/**
 * The game's appearance vocabulary, as the MOO's `$appearance` object held it when read
 * on 2026-11-15 with `ops/moo-agent moo ';$appearance.vocab'` (and `.palette`,
 * `.beard_lengths`), read-only. Each list is in the game's order; the first key of each
 * field is the plain middle (the game gives it no words), drawn as the default.
 * When the game's vocabulary changes, read it again the same way and replace these
 * lists: src/avatar/vocabulary.test.tsx then fails for any value the client does not draw.
 * Tests only.
 */

export const GAME_VOCABULARY = {
  build: ["average", "slender", "thin", "athletic", "muscular", "curvy", "stocky", "chunky", "pudgy", "dumpy"],
  "face.brows": ["average", "thick", "thin", "arched", "bushy", "heavy"],
  "face.ears": ["average", "small", "large", "pointed"],
  "face.lips": ["average", "thin", "full", "narrow", "chapped"],
  "face.nose": ["average", "button", "hooked", "previously_broken", "pudgy", "broad", "upturned"],
  "face.shape": ["oval", "round", "square", "heart", "long", "angular"],
  "face.teeth": ["white", "gleaming_white", "crooked", "filed", "pointed", "yellow", "rotting"],
  "facial_hair.kind": ["none", "stubble", "moustache", "goatee", "beard"],
  features: ["freckles", "dimples", "beauty_mark", "glasses", "earrings", "eyepatch", "sunglasses"],
  "hair.style": ["loose", "ponytail", "braided", "bun", "topknot", "dreadlocks", "spiky", "mohawk", "swept_back", "brushed", "voluminous"],
  "hair.texture": ["straight", "wavy", "curly", "coily"],
} as const;

export type VocabularyField = keyof typeof GAME_VOCABULARY;

/** `$appearance.palette`: each group's keys with the name and hex the wire carries. */
export const GAME_PALETTE: Readonly<Record<"eyes" | "fabric" | "hair" | "skin", Readonly<Record<string, readonly [string, string]>>>> = {
  eyes: {
    amber: ["amber", "#c08a1e"],
    blue: ["blue", "#4a7ab5"],
    brown: ["brown", "#5b3a1e"],
    dark_brown: ["dark brown", "#3a2412"],
    green: ["green", "#4f7a3a"],
    grey: ["grey", "#8a9aa5"],
    hazel: ["hazel", "#8e7618"],
    violet: ["violet", "#7a4fa0"],
  },
  fabric: {
    bellflower_blue: ["bellflower blue", "#5d7fc4"],
    black: ["black", "#1a1a1a"],
    blue: ["blue", "#2a52be"],
    bronze: ["bronze", "#cd7f32"],
    brown: ["brown", "#6b4423"],
    charcoal: ["charcoal", "#36454f"],
    copper: ["copper", "#b87333"],
    cream: ["cream", "#f3ead3"],
    crimson: ["crimson", "#dc143c"],
    gold: ["gold", "#d4af37"],
    green: ["green", "#2e7d32"],
    grey: ["grey", "#808080"],
    light_brown: ["light brown", "#ad8150"],
    navy: ["navy", "#1f2a44"],
    orange: ["orange", "#e07b28"],
    pink: ["pink", "#e48fb0"],
    purple: ["purple", "#6a3d9a"],
    red: ["red", "#b22222"],
    scarlet: ["scarlet", "#ff2400"],
    silver: ["silver", "#c0c0c0"],
    tan: ["tan", "#d2b48c"],
    white: ["white", "#f2f2f0"],
    yellow: ["yellow", "#e8c547"],
  },
  hair: {
    auburn: ["auburn", "#9a3001"],
    black: ["black", "#1b1612"],
    blonde: ["blonde", "#e3c27a"],
    blue: ["blue", "#2f5fb3"],
    brown: ["brown", "#653700"],
    dark_brown: ["dark brown", "#3b2417"],
    green: ["green", "#3f8f4a"],
    grey: ["grey", "#9a9893"],
    light_brown: ["light brown", "#ad8150"],
    pink: ["pink", "#e07aa8"],
    platinum: ["platinum blonde", "#ece4d0"],
    red: ["red", "#a33a1f"],
    strawberry_blonde: ["strawberry blonde", "#d29a6b"],
    violet: ["violet", "#7a4fa0"],
    white: ["white", "#eeeeea"],
  },
  skin: {
    monk01: ["very pale", "#f6ede4"],
    monk02: ["pale", "#f3e7db"],
    monk03: ["fair", "#f7ead0"],
    monk04: ["light", "#eadaba"],
    monk05: ["tan", "#d7bd96"],
    monk06: ["light brown", "#a07e56"],
    monk07: ["brown", "#825c43"],
    monk08: ["dark brown", "#604134"],
    monk09: ["very dark brown", "#3a312a"],
    monk10: ["deep brown", "#292420"],
  },
};

/** A plain described person (invented) that one vocabulary value at a time is set on, for tests and shots. */
export const VOCABULARY_BASE = {
  build: "average",
  skin: { name: "tan", hex: "#d7bd96" },
  hair: { length_cm: 10, texture: "straight", name: "brown", hex: "#653700" },
  eyes: { name: "green", hex: "#4f7a3a" },
  face: { shape: "oval", nose: "average", lips: "average", brows: "average", ears: "average" },
  garments: [{ name: "a blue shirt", areas: ["torso", "arms"], layer: 1, colour: { name: "blue", hex: "#2a52be" } }],
};

/** VOCABULARY_BASE with `field` (a vocabulary path such as "face.nose") set to `value`. */
export function withValue(field: string, value: string | number): Record<string, unknown> {
  const out: Record<string, unknown> = structuredClone(VOCABULARY_BASE);
  const [head, tail] = field.split(".");
  if (field === "features") out.features = [value];
  else if (field === "facial_hair.length_cm") out.facial_hair = { kind: "beard", length_cm: value, name: "brown", hex: "#653700" };
  else if (head === "facial_hair") out.facial_hair = { kind: value, name: "brown", hex: "#653700" };
  // Texture and style show on hair that falls past the jaw.
  else if (field === "hair.texture") out.hair = { ...VOCABULARY_BASE.hair, length_cm: 30, texture: value };
  else if (field === "hair.style") out.hair = { ...VOCABULARY_BASE.hair, length_cm: 30, style: value };
  else if (tail) out[head] = { ...(out[head] as Record<string, unknown>), [tail]: value };
  else out[head] = value;
  return out;
}

/**
 * The shortest hair in cm the game offers each `hair.style` for (the third column of
 * `$appearance.vocab["hair.style"]`) and the game's hair length bands (`$appearance.hair_lengths`).
 * The client draws from these, so they live once (figure.ts and hairLengths.ts), with when they were read.
 */
export { HAIR_STYLE_MIN_CM as GAME_HAIR_STYLE_MIN_CM } from "./figure";
export { HAIR_LENGTHS as GAME_HAIR_LENGTHS } from "./hairLengths";

/** `$appearance.beard_lengths`: band name, lowest and highest cm (0 means no upper end). */
export const GAME_BEARD_LENGTHS: ReadonlyArray<readonly [string, number, number]> = [
  ["short", 2.0, 3.0],
  ["full", 6.0, 12.0],
  ["long", 20.0, 30.0],
  ["very long", 40.0, 0.0],
];
