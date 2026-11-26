import type { LayoutAppearance, LayoutColour } from "../gmcp/Room";
import { type TestCharacter, TEST_CHARACTERS } from "./characters.fixture";
import { GAME_PALETTE } from "./vocabulary.fixture";

/** A palette colour as the wire carries it, from `group.key` (vocabulary.fixture.ts). */
const colour = (group: keyof typeof GAME_PALETTE, key: string): LayoutColour => {
  const [name, hex] = GAME_PALETTE[group][key];
  return { name, hex };
};

/**
 * The form looks the game stores today (`#2955.body_profiles[id]["look"]`, the table in section 1d of
 * reports/player-avatars-forms-wire-2026-11-19.md), as `$appearance:look` sends them: `covering` and, where the look
 * has them, `eyes`. Keyed by `body_plan`.
 */
export const GAME_LOOKS: Readonly<Record<string, { covering: { kind: string; colours: LayoutColour[] }; eyes?: LayoutColour }>> = {
  werewolf: { covering: { kind: "fur", colours: [colour("hair", "grey"), colour("hair", "dark_brown")] } },
  zombie: { covering: { kind: "skin", colours: [colour("hair", "grey")] }, eyes: colour("eyes", "grey") },
  rakghoul: { covering: { kind: "hide", colours: [colour("hair", "grey"), colour("fabric", "charcoal")] } },
  "devolved primate": { covering: { kind: "fur", colours: [colour("hair", "dark_brown")] } },
  "quartz-crystallized body": { covering: { kind: "crystal", colours: [colour("fabric", "white"), colour("fabric", "grey")] } },
  "human with a transfigured shark head": { covering: { kind: "skin", colours: [colour("hair", "grey")] }, eyes: colour("eyes", "dark_brown") },
  "mallard duck": { covering: { kind: "feathers", colours: [colour("fabric", "brown"), colour("fabric", "green"), colour("fabric", "grey")] }, eyes: colour("eyes", "dark_brown") },
  snake: { covering: { kind: "scales", colours: [colour("hair", "brown")] } },
  "song bird": { covering: { kind: "feathers", colours: [colour("hair", "brown")] } },
};

/** One invented person in each plan the game sends, with no look sent: the client's own colours for each plan. */
const NO_LOOK: TestCharacter[] = [
  { name: "werewolf", height: 2.1, appearance: { label: "a werewolf", body_plan: "werewolf", traits: ["fur", "claws", "tail"], posture: "standing" } },
  { name: "zombie", height: 1.75, appearance: { label: "a zombie", body_plan: "zombie", traits: ["undead"], posture: "standing" } },
  { name: "rakghoul", height: 1.7, appearance: { label: "a rakghoul", body_plan: "rakghoul", posture: "standing" } },
  { name: "devolved primate", height: 1.5, appearance: { label: "a devolved primate", body_plan: "devolved primate", traits: ["fur"], posture: "standing" } },
  { name: "quartz", height: 1.8, appearance: { label: "a quartz figure", body_plan: "quartz-crystallized body", posture: "standing" } },
  { name: "shark head", height: 1.8, appearance: { label: "a shark-headed man", body_plan: "human with a transfigured shark head", posture: "standing" } },
  { name: "mallard duck", height: 0.42, box: [0.3, 0.6], appearance: { label: "the mallard duck", body_plan: "mallard duck", posture: "standing" } },
  { name: "snake", height: 0.14, box: [0.3, 1.3], appearance: { label: "the snake", body_plan: "snake", posture: "standing" } },
  { name: "song bird", height: 0.14, box: [0.08, 0.17], appearance: { label: "the song bird", body_plan: "song bird", posture: "standing" } },
];

/**
 * One invented person in each body plan the game sends today, shaped as the game sends a whole-body form
 * (reports/player-avatars-forms-wire-2026-11-19.md, sections 1a and 1d): `body_plan`, the form's `traits`, its
 * `label`, none of the person's skin, hair, face or build. First a human for comparison, then each plan with no look
 * sent, then each plan with the look the game sends (`<plan>, game look`); the shark head's game look keeps the
 * person's own skin, build, age and garments, as the game sends it. Then a plan the client does not know and a
 * humanoid form wearing garments. Names are made up. Tests and the picture harness only.
 */
export const PLAN_CHARACTERS: TestCharacter[] = [
  { name: "human (Aster)", height: TEST_CHARACTERS[0].height, appearance: { ...TEST_CHARACTERS[0].appearance, body_plan: "human body" } },
  ...NO_LOOK,
  ...NO_LOOK.map((ch): TestCharacter => {
    const plan = ch.appearance.body_plan ?? "";
    const own =
      plan === "human with a transfigured shark head"
        ? {
            skin: colour("skin", "monk09"),
            build: "muscular",
            age_years: 41,
            garments: [{ name: "a mustard shirt", areas: ["torso", "arms"], layer: 1, colour: colour("fabric", "yellow") }],
          }
        : {};
    return { ...ch, name: `${ch.name}, game look`, height: plan === "human with a transfigured shark head" ? 1.85 : ch.height, appearance: { ...ch.appearance, ...own, ...GAME_LOOKS[plan] } };
  }),
  { name: "unknown plan", height: 1.2, box: [0.6, 0.6], appearance: { label: "a clockwork automaton", body_plan: "clockwork automaton" } },
  {
    name: "zombie, dressed",
    height: 1.75,
    appearance: {
      label: "a zombie in a brown coat",
      body_plan: "zombie",
      garments: [
        { name: "a torn brown coat", areas: ["torso", "arms"], layer: 2, colour: colour("fabric", "brown") },
        { name: "grey trousers", areas: ["waist", "legs"], layer: 1, colour: colour("fabric", "grey") },
      ],
      marks: [{ kind: "scar", area: "cheek" }],
    },
  },
];

/** The look the game sends for a plan, with the form's label and traits as the live check of 2026-11-20 saw them. */
const sent = (plan: string, label: string, traits: string[] = []): LayoutAppearance => ({ label, body_plan: plan, traits, posture: "standing", ...GAME_LOOKS[plan] });

/**
 * The animal forms in the boxes the game sends since it sends their real sizes (second live check of 2026-11-20,
 * reports/player-avatars-live-forms-second-2026-11-20.md): a mallard duck 0.22 x 0.58 x 0.30 m, a snake 0.04 x 0.75 x
 * 0.04 m lying along the floor, a song bird 0.08 x 0.06 x 0.12 m; and a plain person for scale. Names are made up.
 * Tests and the picture harness only.
 */
export const REAL_SIZE_FORM_CHARACTERS: TestCharacter[] = [
  { name: "person, for scale", height: 1.75, appearance: { label: "a person", body_plan: "human body", skin: colour("skin", "monk04"), posture: "standing" } },
  { name: "mallard duck, real size", height: 0.3, box: [0.22, 0.58], appearance: sent("mallard duck", "a duck", ["bird", "wings", "tail"]) },
  { name: "snake, real size", height: 0.04, box: [0.04, 0.75], appearance: sent("snake", "a snake", ["tail"]) },
  { name: "song bird, real size", height: 0.12, box: [0.08, 0.06], appearance: sent("song bird", "a bird", ["bird", "wings", "tail"]) },
];

/**
 * The forms in the boxes the game sent for them in the live check of 2026-11-20 (raw Room.Layout,
 * reports/player-avatars-client-forms-live-fixes-2026-11-20.md): a snake in a 0.16 x 0.16 m box 3.08 m tall, a duck
 * in 0.88 x 2.31 x 1.19 m, a song bird in 1.21 x 0.91 x 1.82 m; then a snake in a thin low box and in a small cube; the
 * shark head on a person with no garments sent; a person with antlers; and a plain person for scale. Names are made
 * up. Tests and the picture harness only.
 */
export const LIVE_FORM_CHARACTERS: TestCharacter[] = [
  { name: "person, for scale", height: 1.75, appearance: { label: "a person", body_plan: "human body", skin: colour("skin", "monk04"), posture: "standing" } },
  { name: "snake, as sent", height: 3.08, box: [0.16, 0.16], appearance: sent("snake", "a snake", ["tail"]) },
  { name: "mallard duck, as sent", height: 1.19, box: [0.88, 2.31], appearance: sent("mallard duck", "a duck", ["bird", "wings", "tail"]) },
  { name: "song bird, as sent", height: 1.82, box: [1.21, 0.91], appearance: sent("song bird", "a bird", ["bird", "wings", "tail"]) },
  { name: "snake, thin low box", height: 0.08, box: [0.1, 1], appearance: sent("snake", "a snake", ["tail"]) },
  { name: "snake, small cube", height: 0.1, box: [0.1, 0.1], appearance: sent("snake", "a snake", ["tail"]) },
  {
    name: "shark head, no garments",
    height: 1.75,
    appearance: { ...sent("human with a transfigured shark head", "a person"), skin: colour("skin", "monk04"), build: "average", age_years: 30 },
  },
  { name: "antlers", height: 1.75, appearance: { label: "a person", body_plan: "human body", skin: colour("skin", "monk04"), hair: { name: "brown", hex: "#6a4e2e", length_cm: 8, texture: "straight", style: "loose" }, traits: ["antlers"], posture: "standing" } },
];

/**
 * The `body_plan` each of the game's taxa sends (`$taxon` anatomies' `species`, read live 2026-11-23), other than the
 * snake, human and the non-animal taxa, with a box of the animal's own proportions (width, depth, height in metres;
 * the forms keep the person's mass, so these are shapes, not sizes the game promises). Tests only.
 */
export const TAXON_FORMS: ReadonlyArray<{ plan: string; box: [number, number, number] }> = [
  { plan: "mammal", box: [0.3, 0.9, 0.6] },
  { plan: "bat", box: [0.3, 0.12, 0.08] },
  { plan: "bear", box: [0.8, 2.2, 1.2] },
  { plan: "cat", box: [0.15, 0.8, 0.3] },
  { plan: "dog", box: [0.3, 1.0, 0.6] },
  { plan: "fox", box: [0.2, 1.0, 0.4] },
  { plan: "pig", box: [0.4, 1.4, 0.8] },
  { plan: "rabbit", box: [0.15, 0.4, 0.25] },
  { plan: "wolf", box: [0.3, 1.6, 0.8] },
  { plan: "ungulate", box: [0.4, 1.8, 1.5] },
  { plan: "horse", box: [0.6, 2.4, 1.65] },
  { plan: "mule", box: [0.55, 2.2, 1.6] },
  { plan: "cow", box: [0.75, 2.1, 1.45] },
  { plan: "deer", box: [0.4, 1.8, 1.6] },
  { plan: "sheep", box: [0.5, 1.3, 0.9] },
  { plan: "goat", box: [0.4, 1.3, 0.9] },
  { plan: "elephant", box: [1.6, 6.0, 3.2] },
  { plan: "primate", box: [0.6, 1.2, 0.8] },
  { plan: "rodent", box: [0.04, 0.18, 0.05] },
  { plan: "armadillo", box: [0.25, 0.8, 0.25] },
  { plan: "tasmanian devil", box: [0.25, 0.9, 0.35] },
  { plan: "reptile", box: [0.2, 0.6, 0.08] },
  { plan: "lizard", box: [0.1, 0.4, 0.05] },
  { plan: "turtle", box: [0.3, 0.45, 0.2] },
  { plan: "crocodile", box: [0.8, 4.5, 0.6] },
  { plan: "amphibian", box: [0.08, 0.12, 0.06] },
  { plan: "dragon", box: [2, 6, 3] },
  { plan: "bird", box: [0.08, 0.17, 0.14] },
  { plan: "duck", box: [0.22, 0.58, 0.3] },
  { plan: "chicken", box: [0.25, 0.45, 0.45] },
  { plan: "raptor", box: [0.3, 0.6, 0.6] },
  { plan: "owl", box: [0.3, 0.35, 0.5] },
  { plan: "fish", box: [0.1, 0.5, 0.15] },
  { plan: "whale", box: [3, 15, 3] },
  { plan: "blue whale", box: [4, 25, 4] },
  { plan: "sperm whale", box: [3.5, 16, 3.5] },
  { plan: "dolphin", box: [0.6, 2.5, 0.6] },
  { plan: "insect", box: [0.01, 0.02, 0.008] },
  { plan: "bee", box: [0.006, 0.015, 0.006] },
  { plan: "ant", box: [0.002, 0.005, 0.002] },
  { plan: "arachnid", box: [0.04, 0.03, 0.01] },
  { plan: "crustacean", box: [0.2, 0.15, 0.08] },
  { plan: "jellyfish", box: [0.3, 0.3, 0.4] },
  { plan: "octopus", box: [1, 1, 0.4] },
  { plan: "mollusc", box: [0.02, 0.1, 0.03] },
  { plan: "land slug", box: [0.02, 0.1, 0.03] },
  { plan: "snail", box: [0.02, 0.06, 0.04] },
  { plan: "bivalve", box: [0.08, 0.07, 0.03] },
];
