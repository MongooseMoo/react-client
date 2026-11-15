import type { LayoutAppearance } from "../gmcp/Room";

/**
 * Twelve invented characters covering heights, builds, hair, skin tones
 * (Monk scale values), garments, facial hair, marks, a hidden face, traits
 * and postures. Names are made up; no real character goes in a fixture. Tests only.
 */

export interface TestCharacter {
  name: string;
  /** Floor to crown, metres: the height of their Room.Layout box. */
  height: number;
  appearance: LayoutAppearance;
}

const c = (name: string, hex: string) => ({ name, hex });

/** Every `hex` an appearance supplies, anywhere in it, lower-cased. */
export function suppliedHexes(value: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(value)) for (const v of value) suppliedHexes(v, out);
  else if (value !== null && typeof value === "object") {
    for (const [key, v] of Object.entries(value)) {
      if (key === "hex" && typeof v === "string") out.add(v.toLowerCase());
      else suppliedHexes(v, out);
    }
  }
  return out;
}

export const TEST_CHARACTERS: TestCharacter[] = [
  {
    name: "Aster Vell",
    height: 1.62,
    appearance: {
      label: "the short red-haired woman",
      build: "thin",
      age_years: 24,
      skin: c("fair", "#f3e7db"),
      hair: { length_cm: 40, texture: "straight", style: "loose", ...c("red", "#9a3001") },
      eyes: c("green", "#3a7d44"),
      face: { shape: "heart", nose: "button", lips: "full", brows: "arched", ears: "average" },
      garments: [
        { name: "a navy jumper", areas: ["torso", "arms"], layer: 2, colour: c("navy", "#01153e") },
        { name: "grey trousers", areas: ["waist", "legs"], layer: 1, colour: c("grey", "#6b6b6b") },
        { name: "black boots", areas: ["feet"], layer: 1, colour: c("black", "#1b1b1b") },
      ],
    },
  },
  {
    name: "Bram Okoro",
    height: 1.94,
    appearance: {
      label: "the tall bearded man",
      build: "muscular",
      age_years: 41,
      skin: c("dark brown", "#3a312a"),
      hair: { length_cm: 1.5, texture: "coily", ...c("black", "#141414") },
      facial_hair: { kind: "beard", ...c("black", "#141414") },
      eyes: c("brown", "#5b3a1e"),
      face: { shape: "square", nose: "average", lips: "full", brows: "thick" },
      garments: [
        { name: "a mustard shirt", areas: ["torso", "arms"], layer: 1, colour: c("mustard", "#ceb301") },
        { name: "brown trousers", areas: ["waist", "legs"], layer: 1, colour: c("brown", "#653700") },
        { name: "tan shoes", areas: ["feet"], layer: 1, colour: c("tan", "#d1b26f") },
      ],
    },
  },
  {
    name: "Cleo Marsh",
    height: 1.7,
    appearance: {
      build: "curvy",
      age_years: 33,
      skin: c("light brown", "#a07e56"),
      hair: { length_cm: 18, texture: "curly", ...c("dark brown", "#341c02") },
      eyes: c("hazel", "#8e7618"),
      face: { shape: "round", nose: "average", lips: "full" },
      marks: [{ kind: "piercing", area: "nose" }],
      garments: [{ name: "a teal dress", areas: ["torso", "waist", "legs"], layer: 1, colour: c("teal", "#029386") }],
    },
  },
  {
    name: "Dov Lindqvist",
    height: 1.78,
    appearance: {
      build: "average",
      age_years: 67,
      skin: c("pale", "#f6ede4"),
      hair: { length_cm: 3, texture: "straight", ...c("white", "#e8e8e8") },
      facial_hair: { kind: "moustache", ...c("white", "#e8e8e8") },
      eyes: c("blue", "#3d6fb6"),
      face: { shape: "long", nose: "hooked", lips: "thin", brows: "bushy" },
      marks: [{ kind: "scar", area: "cheek" }],
      garments: [
        { name: "a white shirt", areas: ["torso", "arms"], layer: 1, colour: c("white", "#f4f1ea") },
        { name: "a beige coat", areas: ["torso", "arms"], layer: 3, colour: c("beige", "#e6daa6") },
        { name: "olive trousers", areas: ["waist", "legs"], layer: 1, colour: c("olive", "#6e750e") },
      ],
    },
  },
  {
    name: "Esme Tarrow",
    height: 1.55,
    appearance: {
      build: "pudgy",
      age_years: 19,
      skin: c("tan", "#d7bd96"),
      hair: { length_cm: 9, texture: "wavy", ...c("blonde", "#e5c76b") },
      eyes: c("grey", "#8a9399"),
      face: { shape: "oval", nose: "pudgy", lips: "narrow" },
      garments: [
        { name: "a pink hoodie", areas: ["head", "torso", "arms"], layer: 2, colour: c("pink", "#ff81c0") },
        { name: "blue jeans", areas: ["waist", "legs"], layer: 1, colour: c("denim", "#3b5b92") },
      ],
    },
  },
  {
    name: "Faro Quint",
    height: 1.82,
    appearance: {
      build: "athletic",
      age_years: 28,
      skin: c("brown", "#825c43"),
      hair: { length_cm: 30, texture: "coily", ...c("black", "#141414") },
      eyes: c("brown", "#5b3a1e"),
      face: { shape: "oval", nose: "average", lips: "full" },
      garments: [
        { name: "a brown jacket", areas: ["torso", "arms"], layer: 2, colour: c("chestnut", "#742802") },
        { name: "black leggings", areas: ["waist", "legs"], layer: 1, colour: c("black", "#1b1b1b") },
        { name: "brown boots", areas: ["feet"], layer: 1, colour: c("brown", "#653700") },
      ],
    },
  },
  {
    name: "Gwen Ashby",
    height: 1.31,
    appearance: {
      build: "average",
      age_years: 10,
      skin: c("light", "#eadaba"),
      hair: { length_cm: 22, texture: "straight", ...c("light brown", "#ad8150") },
      eyes: c("blue", "#3d6fb6"),
      face: { shape: "round", nose: "button", lips: "thin" },
      garments: [{ name: "a yellow raincoat", areas: ["torso", "arms", "waist"], layer: 2, colour: c("yellow", "#ffd400") }],
    },
  },
  {
    name: "Hale Brennick",
    height: 1.85,
    appearance: {
      build: "chunky",
      age_years: 52,
      skin: c("medium", "#d7bd96"),
      facial_hair: { kind: "stubble", ...c("grey", "#7d7d7d") },
      eyes: c("grey", "#8a9399"),
      face: { shape: "square", nose: "previously broken", lips: "chapped" },
      garments: [
        { name: "a green flannel shirt", areas: ["torso", "arms"], layer: 1, colour: c("forest", "#0b5509") },
        { name: "khaki trousers", areas: ["waist", "legs"], layer: 1, colour: c("khaki", "#aaa662") },
        { name: "leather gloves", areas: ["hands"], layer: 1, colour: c("brown", "#653700") },
      ],
    },
  },
  {
    name: "Ines Corvald",
    height: 1.68,
    appearance: {
      build: "dumpy",
      age_years: 45,
      body_plan: "human",
      skin: c("deep brown", "#604134"),
      eyes: c("dark brown", "#3b2412"),
      face_hidden: true,
      garments: [
        { name: "a maroon cloak", areas: ["head", "neck", "torso", "arms", "legs"], layer: 4, colour: c("maroon", "#650021") },
        { name: "black boots", areas: ["feet"], layer: 1, colour: c("black", "#1b1b1b") },
      ],
    },
  },
  {
    name: "Jory Fenn",
    height: 2.05,
    appearance: {
      build: "thin",
      age_years: 30,
      body_plan: "faun",
      traits: ["antlers", "tail", "pointed ears"],
      skin: c("light brown", "#a07e56"),
      hair: { length_cm: 12, texture: "wavy", ...c("auburn", "#9a3001") },
      facial_hair: { kind: "goatee", ...c("auburn", "#9a3001") },
      eyes: c("amber", "#feb308"),
      face: { shape: "long", ears: "pointed" },
      garments: [{ name: "a moss tunic", areas: ["torso", "waist"], layer: 1, colour: c("moss", "#658b38") }],
    },
  },
  {
    name: "Kit Sarne",
    height: 1.74,
    appearance: {
      posture: "sitting",
      build: "athletic",
      age_years: 36,
      body_plan: "winged",
      traits: ["wings", "horns"],
      skin: c("very dark", "#292420"),
      hair: { length_cm: 60, texture: "straight", ...c("silver", "#c5c9c7") },
      eyes: c("violet", "#9a0eea"),
      face: { shape: "oval", brows: "thin" },
      marks: [{ kind: "tattoo", area: "forehead" }],
      garments: [
        { name: "a crimson robe", areas: ["torso", "arms", "waist", "legs"], layer: 2, colour: c("crimson", "#8c000f") },
        { name: "sandals", areas: ["feet"], layer: 1, colour: c("tan", "#d1b26f") },
      ],
    },
  },
  {
    name: "Lio Danner",
    height: 1.76,
    appearance: {
      posture: "reclining",
      build: "average",
      age_years: 22,
      skin: c("olive", "#eadaba"),
      hair: { length_cm: 6, texture: "curly", ...c("ginger", "#b5651d") },
      eyes: c("green", "#3a7d44"),
      face: { shape: "oval", nose: "average", lips: "average" },
      garments: [
        { name: "a sky-blue vest", areas: ["torso"], layer: 1, colour: c("sky blue", "#75bbfd") },
        { name: "white shorts", areas: ["waist", "legs"], layer: 1, colour: c("white", "#f4f1ea") },
      ],
    },
  },
];
