import { colourHex, INK_DARK, INK_LIGHT, overlayHex } from "./colour";
import type { BuildShape, Ears, ExtraPart } from "./figure";

/**
 * Body plans: how a person whose `body_plan` is not "human body" is drawn. The game sends a whole-body form's
 * species as `body_plan` ("werewolf", "mallard duck"), none of the character's own record (no skin, hair, eyes,
 * face or build), and the form's own look as `covering` and `eyes`. These entries hold each plan's shape and the
 * colours used when the form sends none. Adding or changing a plan is one entry here; the 3D figure
 * (src/map/bodyPlanMesh.ts), the portrait (planPortrait.tsx) and the plan token read the entry. Imports no three.js.
 */

/** The body plan the game sends for a character in no form; it, or no `body_plan` at all, draws the human figure. */
export const HUMAN_PLAN = "human body";

/**
 * What covers a body: `covering.kind` on the wire (`$appearance.vocab["covering"]`). `fur` gives a bushy tail and
 * `crystal` flat cut facets; the others are drawn smooth.
 */
export const COVERINGS = ["skin", "fur", "hide", "feathers", "scales", "crystal"] as const;
export type Covering = (typeof COVERINGS)[number];

/** Where a plan puts the covering's second and third colours, in order. */
export type ColourSlot = "accent" | "head" | "wing";

/** The head a humanoid plan wears on the human skeleton. */
export type PlanHead = "wolf" | "slack" | "ghoul" | "primate" | "crystal" | "shark";

/** How a plan's sent colours land, shared by humanoid and animal plans. */
interface PlanColours {
  covering: Covering;
  eyes: string;
  /** A second colour: a muzzle, face patch, jaw, underside, breast or band. */
  accent: string;
  /** The covering's second and third colours go to these, in order. */
  secondary: ColourSlot[];
  /**
   * With a covering colour sent and no colour sent for the accent, the accent is this tone of the covering's main
   * colour (a werewolf's lighter muzzle, a snake's darker bands, a song bird's lighter breast). Without it the plan's
   * own accent stays: a mark of the species, drawn the same in 3D and in the portrait (the shark's white underside).
   */
  accentTone?: "darker" | "lighter";
}

/**
 * How far a colour toward the dark or light ink makes each tone of the covering's main colour that the form does not
 * send: an animal's head a shade darker than its body, its wings darker again, an accent toned by `accentTone`.
 */
export const TONE_STEP = { head: 0.12, wing: 0.25, accent: 0.35 } as const;

export interface HumanoidPlan extends PlanColours {
  kind: "humanoid";
  /** The body's colour: fur, skin or crystal. */
  skin: string;
  /** The head's own colour, when it is not the body's (a shark head on a human body). */
  headColour?: string;
  /**
   * `head`: the form covers only the head; the body is the person's own, drawn from the record's `skin`, `build` and
   * `garments` (the shark head). The covering's main colour is then the head's.
   */
  covers: "body" | "head";
  /** The neck's thickness against the human figure's (a wolf's thick neck); 1 when absent. */
  neckScale?: number;
  /** A bare chest in the accent, on the front of an unclothed torso (the primate's). */
  chest?: true;
  /** Bare hands and feet in the accent where no garment covers them (the primate's palms and soles). */
  bareHands?: true;
  head: PlanHead;
  /** How far the upper body leans forward from the hips, radians. */
  hunch: number;
  /** Floor to hip, as a share of the height. */
  legShare: number;
  /** Floor to wrist, standing, as a share of the height (the human figure's is about 0.45). */
  wristShare: number;
  /** Arms reach forward from the shoulders by this angle, radians (0 hangs straight down). */
  reach: number;
  /** The head droops forward (positive) and to one side, radians. */
  droop: number;
  /** Standing on the toes with a raised heel, like a dog's hind leg. */
  digitigrade: boolean;
  /** Widths relative to an average build. */
  shape: BuildShape;
  extras: ExtraPart[];
  ears: Ears | "none";
  /** Head height as a share of the height (the human figure's is 1/7.5). */
  headShare: number;
}

/**
 * The animal figures: three drawn one species each (duck, snake, song bird) and the families drawn from a shape
 * (`quad`, `swim`, `bug`, `arms`, `shell` below), so each species the game's taxa send is one entry.
 */
export type AnimalKind = "duck" | "snake" | "songbird" | "quadruped" | "fish" | "arthropod" | "tentacled" | "mollusc";

/** Parts a four-legged body can carry beyond its legs, head and tail. */
export type QuadPart = "trunk" | "tusks" | "horns" | "antlers" | "shell" | "wings";

/**
 * A four-legged body, in shares of its body's length from chest to rump (the neck, head and tail are added to that
 * length): `height` floor to back, `girth` belly to back, `neck`, `head` and `tail` lengths, `leg` a leg's radius.
 */
export interface QuadShape {
  height: number;
  girth: number;
  neck: number;
  head: number;
  tail: number;
  leg: number;
  ears: "pointed" | "round" | "long" | "floppy" | "fan" | "none";
  /** Legs set out to the sides and the belly near the floor, as a lizard, crocodile, turtle or frog stands. */
  sprawl?: true;
  parts?: QuadPart[];
}

/** How high an arthropod's body is carried on its legs, in body lengths: high enough that the legs show beneath it. */
export const ARTHROPOD_BODY_Z = 0.24;

export interface AnimalPlan extends PlanColours {
  kind: "animal";
  animal: AnimalKind;
  /** The `quadruped` figure's shape. */
  quad?: QuadShape;
  /** The `fish` figure: `girth` belly to back as a share of its length; `fluke` a whale's level tail and a blowhole. */
  swim?: { girth: number; fluke?: true };
  /** The `arthropod` figure: walking legs, a front pair of claws (a crab's), wings over the back (a bee's), feelers. */
  bug?: { legs: 6 | 8; segments: 2 | 3; claws?: true; wings?: true; antennae?: true };
  /** The `tentacled` figure: how many arms, hanging from a bell (a jellyfish) or spread from a mantle (an octopus). */
  arms?: { count: number; mantle?: true };
  /** The `mollusc` figure's shell: coiled on the back (a snail), two valves (a clam), or none (a slug). */
  shell?: "coil" | "valves" | "none";
  /** The body's colour. */
  skin: string;
  /** The head; with a covering colour sent and none for the head, a shade darker than the body (TONE_STEP). */
  head: string;
  /** The folded wings (duck and bird); with a covering colour sent and none for them, darker than the body. */
  wing: string;
  /** Bill, beak or tongue: a mark of the species, never taken from the covering (the mallard's yellow bill). */
  beak: string;
  /** Legs and feet: a mark of the species too. */
  feet: string;
}

export type PlanSpec = HumanoidPlan | AnimalPlan;

const AVERAGE: BuildShape = { shoulders: 1, waist: 1, hips: 1, limbs: 1 };

/** The dark of a nose, mouth, hoof or claw: a mark of the species, never taken from the covering. */
const DARK_MARK = "#2a2420";

/** What a family plan's entry gives: its covering and colours; the rest is the family's. */
interface FamilyLook {
  covering: Covering;
  skin: string;
  /** The head's colour when the form sends none: the body's unless given. */
  head?: string;
  /** Underside, muzzle, bands, shell or belly: lighter or darker than the body, as `tone` says. */
  accent: string;
  tone?: "darker" | "lighter";
  eyes?: string;
  /** Feet, hooves, legs or claws. */
  feet?: string;
  /** Nose, mouth, beak or sting. */
  mark?: string;
}

/** A plan of one of the shape-drawn families, its covering's second colour going to the accent. */
function family(animal: AnimalKind, look: FamilyLook, shape: Partial<AnimalPlan>): AnimalPlan {
  return {
    kind: "animal",
    animal,
    covering: look.covering,
    secondary: ["accent"],
    accentTone: look.tone ?? "lighter",
    skin: look.skin,
    head: look.head ?? look.skin,
    wing: look.skin,
    accent: look.accent,
    beak: look.mark ?? DARK_MARK,
    feet: look.feet ?? DARK_MARK,
    eyes: look.eyes ?? "#111111",
    ...shape,
  };
}

const quad = (look: FamilyLook, shape: QuadShape) => family("quadruped", look, { quad: shape });
/** A perching bird drawn as the song bird is, in its own colours: breast in the accent, wings and tail in `wing`. */
const bird = (skin: string, head: string, wing: string, accent: string, beak: string, feet: string): AnimalPlan => ({
  kind: "animal",
  animal: "songbird",
  covering: "feathers",
  secondary: ["accent", "wing"],
  accentTone: "lighter",
  skin,
  head,
  wing,
  accent,
  beak,
  feet,
  eyes: "#111111",
});

/**
 * The families the game's taxa send as `body_plan` (`$taxon` anatomies' `species`, read live 2026-11-23): a body in a
 * form made from an animal of that taxon. Colours are each animal's common colouring; shapes in shares of the body's
 * length (QuadShape). Keys exactly as sent.
 */
const TAXON_PLANS: Record<string, PlanSpec> = {
  mammal: quad({ covering: "fur", skin: "#8a6f55", accent: "#c9b49a" }, { height: 0.6, girth: 0.32, neck: 0.15, head: 0.22, tail: 0.3, leg: 0.04, ears: "pointed" }),
  bat: quad({ covering: "fur", skin: "#4a3a30", accent: "#6e5a4a" }, { height: 0.32, girth: 0.3, neck: 0.04, head: 0.24, tail: 0.1, leg: 0.025, ears: "pointed", parts: ["wings"] }),
  bear: quad({ covering: "fur", skin: "#5b4030", accent: "#7a5a44" }, { height: 0.62, girth: 0.42, neck: 0.1, head: 0.24, tail: 0.05, leg: 0.07, ears: "round" }),
  cat: quad({ covering: "fur", skin: "#8c7a66", accent: "#d8cbb8" }, { height: 0.55, girth: 0.25, neck: 0.1, head: 0.18, tail: 0.7, leg: 0.03, ears: "pointed" }),
  dog: quad({ covering: "fur", skin: "#9a7650", accent: "#d9c3a2" }, { height: 0.68, girth: 0.3, neck: 0.18, head: 0.24, tail: 0.35, leg: 0.035, ears: "floppy" }),
  fox: quad({ covering: "fur", skin: "#b8642a", accent: "#efe6da" }, { height: 0.5, girth: 0.26, neck: 0.14, head: 0.22, tail: 0.6, leg: 0.025, ears: "pointed" }),
  pig: quad({ covering: "skin", skin: "#e3b5a4", accent: "#c98f80", tone: "darker", feet: "#6b4a3a" }, { height: 0.55, girth: 0.42, neck: 0.03, head: 0.26, tail: 0.12, leg: 0.045, ears: "floppy" }),
  rabbit: quad({ covering: "fur", skin: "#9b8a78", accent: "#e8e0d4" }, { height: 0.45, girth: 0.38, neck: 0.04, head: 0.22, tail: 0.08, leg: 0.035, ears: "long" }),
  wolf: quad({ covering: "fur", skin: "#7d7468", accent: "#cfc8bd" }, { height: 0.68, girth: 0.3, neck: 0.18, head: 0.25, tail: 0.4, leg: 0.035, ears: "pointed" }),
  ungulate: quad({ covering: "hide", skin: "#8a6a48", accent: "#d8c8b0" }, { height: 0.95, girth: 0.35, neck: 0.3, head: 0.28, tail: 0.25, leg: 0.03, ears: "pointed" }),
  horse: quad({ covering: "hide", skin: "#7b4a2a", accent: "#2b2420", tone: "darker" }, { height: 1.05, girth: 0.36, neck: 0.45, head: 0.32, tail: 0.4, leg: 0.035, ears: "pointed" }),
  mule: quad({ covering: "hide", skin: "#6b5a4a", accent: "#cfc2b0" }, { height: 1.0, girth: 0.36, neck: 0.4, head: 0.32, tail: 0.35, leg: 0.035, ears: "long" }),
  cow: quad({ covering: "hide", skin: "#7a4f33", accent: "#e8dccb" }, { height: 0.75, girth: 0.45, neck: 0.18, head: 0.28, tail: 0.45, leg: 0.045, ears: "floppy", parts: ["horns"] }),
  deer: quad({ covering: "fur", skin: "#9a6a3e", accent: "#e8dccb" }, { height: 1.0, girth: 0.32, neck: 0.35, head: 0.25, tail: 0.08, leg: 0.025, ears: "pointed", parts: ["antlers"] }),
  sheep: quad({ covering: "fur", skin: "#e9e3d4", head: "#4a423a", accent: "#d6cebc", tone: "darker" }, { height: 0.7, girth: 0.5, neck: 0.1, head: 0.24, tail: 0.1, leg: 0.03, ears: "floppy" }),
  goat: quad({ covering: "fur", skin: "#cfc3ae", accent: "#a89a82", tone: "darker" }, { height: 0.8, girth: 0.38, neck: 0.2, head: 0.25, tail: 0.1, leg: 0.03, ears: "pointed", parts: ["horns"] }),
  elephant: quad({ covering: "hide", skin: "#8a8580", accent: "#76716c", tone: "darker", feet: "#5e5a56" }, { height: 0.72, girth: 0.5, neck: 0.02, head: 0.3, tail: 0.3, leg: 0.09, ears: "fan", parts: ["trunk", "tusks"] }),
  primate: quad({ covering: "fur", skin: "#4b3a2e", head: "#3e3026", accent: "#c4a98f" }, { height: 0.6, girth: 0.36, neck: 0.05, head: 0.25, tail: 0.1, leg: 0.045, ears: "round" }),
  rodent: quad({ covering: "fur", skin: "#8a7b6a", accent: "#d4c8b8", mark: "#d98a8a" }, { height: 0.35, girth: 0.35, neck: 0.03, head: 0.25, tail: 0.8, leg: 0.02, ears: "round" }),
  armadillo: quad({ covering: "hide", skin: "#a49280", accent: "#8a7866", tone: "darker" }, { height: 0.35, girth: 0.38, neck: 0.03, head: 0.22, tail: 0.35, leg: 0.03, ears: "pointed", parts: ["shell"] }),
  "tasmanian devil": quad({ covering: "fur", skin: "#1e1a18", accent: "#efe8dc", mark: "#c97a7a" }, { height: 0.42, girth: 0.38, neck: 0.05, head: 0.28, tail: 0.3, leg: 0.04, ears: "round" }),
  reptile: quad({ covering: "scales", skin: "#6b7a3a", accent: "#c8c48a" }, { height: 0.18, girth: 0.14, neck: 0.08, head: 0.18, tail: 0.9, leg: 0.025, ears: "none", sprawl: true }),
  lizard: quad({ covering: "scales", skin: "#7a8a46", accent: "#d4d09a" }, { height: 0.16, girth: 0.13, neck: 0.08, head: 0.18, tail: 1.0, leg: 0.022, ears: "none", sprawl: true }),
  turtle: quad({ covering: "scales", skin: "#6b7a4a", accent: "#6b5a3a", tone: "darker" }, { height: 0.3, girth: 0.25, neck: 0.15, head: 0.15, tail: 0.08, leg: 0.05, ears: "none", sprawl: true, parts: ["shell"] }),
  crocodile: quad({ covering: "scales", skin: "#4a5a34", accent: "#b8b88a" }, { height: 0.14, girth: 0.12, neck: 0.04, head: 0.28, tail: 0.9, leg: 0.03, ears: "none", sprawl: true }),
  amphibian: quad({ covering: "skin", skin: "#5f8a3e", accent: "#d8d08a", eyes: "#c9a227" }, { height: 0.32, girth: 0.3, neck: 0.02, head: 0.28, tail: 0, leg: 0.04, ears: "none", sprawl: true }),
  dragon: quad({ covering: "scales", skin: "#7a2e24", accent: "#d9a24a", eyes: "#e0b030" }, { height: 0.7, girth: 0.35, neck: 0.4, head: 0.25, tail: 0.9, leg: 0.05, ears: "none", parts: ["wings", "horns"] }),
  bird: bird("#7a6a58", "#6a5a48", "#5e5040", "#c9b49a", "#3a3226", "#5a4a3c"),
  duck: { kind: "animal", animal: "duck", covering: "feathers", secondary: ["head", "wing"], skin: "#8f8272", head: "#1f5e3a", wing: "#9a9690", accent: "#6b3b26", beak: "#e0b22e", feet: "#e07a1f", eyes: "#111111" },
  chicken: bird("#b8642a", "#a65520", "#8a4a20", "#d48a4a", "#e0b22e", "#e0b22e"),
  raptor: bird("#6b4a2e", "#e8e0d0", "#5a3e26", "#e8dcc8", "#e0b22e", "#e0b22e"),
  owl: bird("#8a7058", "#9a8068", "#6e5844", "#e0d4c0", "#3a3226", "#8a7058"),
  fish: family("fish", { covering: "scales", skin: "#7f8f95", accent: "#e0e3dc", head: "#73838a" }, { swim: { girth: 0.26 } }),
  whale: family("fish", { covering: "skin", skin: "#4b5560", accent: "#9aa3a8" }, { swim: { girth: 0.2, fluke: true } }),
  "blue whale": family("fish", { covering: "skin", skin: "#5c7186", accent: "#8ea0b0" }, { swim: { girth: 0.14, fluke: true } }),
  "sperm whale": family("fish", { covering: "skin", skin: "#4a4a4c", accent: "#6a6a6c" }, { swim: { girth: 0.22, fluke: true } }),
  dolphin: family("fish", { covering: "skin", skin: "#6f7c88", accent: "#dfe3e6" }, { swim: { girth: 0.2, fluke: true } }),
  insect: family("arthropod", { covering: "hide", skin: "#3b3326", accent: "#5a4e3a" }, { bug: { legs: 6, segments: 3, antennae: true } }),
  bee: family("arthropod", { covering: "fur", skin: "#c99a2e", accent: "#2a2420", tone: "darker", head: "#2a2420" }, { bug: { legs: 6, segments: 3, antennae: true, wings: true } }),
  ant: family("arthropod", { covering: "hide", skin: "#3a2418", accent: "#2a1810", tone: "darker" }, { bug: { legs: 6, segments: 3, antennae: true } }),
  arachnid: family("arthropod", { covering: "hide", skin: "#3a3430", accent: "#5a504a" }, { bug: { legs: 8, segments: 2 } }),
  crustacean: family("arthropod", { covering: "hide", skin: "#b8442e", accent: "#e0a080", feet: "#b8442e" }, { bug: { legs: 8, segments: 2, claws: true, antennae: true } }),
  jellyfish: family("tentacled", { covering: "skin", skin: "#c9b6e0", accent: "#e8dcf4" }, { arms: { count: 10 } }),
  octopus: family("tentacled", { covering: "skin", skin: "#a0503a", accent: "#d08a70", eyes: "#d9b84a" }, { arms: { count: 8, mantle: true } }),
  mollusc: family("mollusc", { covering: "skin", skin: "#7a6a4e", accent: "#a89878" }, { shell: "none" }),
  "land slug": family("mollusc", { covering: "skin", skin: "#6e5e44", accent: "#94846a" }, { shell: "none" }),
  snail: family("mollusc", { covering: "skin", skin: "#8a7a5e", accent: "#b08a5a" }, { shell: "coil" }),
  bivalve: family("mollusc", { covering: "skin", skin: "#9a8f80", accent: "#c8bca8" }, { shell: "valves" }),
};

/**
 * The plans the game uses today (`#2955.body_profiles`, read 2026-11-20 into
 * reports/player-avatars-forms-wire-2026-11-19.md), then the taxa's (TAXON_PLANS). Keys are `body_plan` exactly as the
 * game sends it.
 */
export const BODY_PLANS: Readonly<Record<string, PlanSpec>> = {
  werewolf: {
    kind: "humanoid",
    skin: "#7a6b5a",
    covering: "fur",
    covers: "body",
    neckScale: 1.8,
    // The covering's second colour: the muzzle and jaw (and the ruff in the portrait).
    secondary: ["accent"],
    accentTone: "lighter",
    eyes: "#d9a326",
    accent: "#b8a68e",
    head: "wolf",
    hunch: 0.3,
    legShare: 0.5,
    wristShare: 0.4,
    reach: 0.25,
    droop: 0,
    digitigrade: true,
    shape: { shoulders: 1.3, waist: 1.05, hips: 1, limbs: 1.3 },
    extras: ["tail"],
    ears: "pointed",
    headShare: 1 / 5.8,
  },
  zombie: {
    kind: "humanoid",
    skin: "#8b9a7a",
    covering: "skin",
    covers: "body",
    // The covering's second colour: the sunken lids and the open mouth.
    secondary: ["accent"],
    accentTone: "darker",
    eyes: "#d8d6b8",
    accent: "#5e6b52",
    head: "slack",
    hunch: 0.16,
    legShare: 0.47,
    wristShare: 0.47,
    reach: 0.55,
    droop: 0.3,
    digitigrade: false,
    shape: { shoulders: 0.92, waist: 0.9, hips: 0.95, limbs: 0.9 },
    extras: [],
    ears: "average",
    headShare: 1 / 7.5,
  },
  rakghoul: {
    kind: "humanoid",
    skin: "#dcd5c6",
    covering: "hide",
    covers: "body",
    // The covering's second colour: the heavy jaw.
    secondary: ["accent"],
    accentTone: "darker",
    eyes: "#8c2a1e",
    accent: "#c4bba8",
    head: "ghoul",
    hunch: 0.22,
    legShare: 0.47,
    wristShare: 0.4,
    reach: 0.15,
    droop: 0,
    digitigrade: false,
    shape: { shoulders: 1.05, waist: 0.82, hips: 0.88, limbs: 0.85 },
    extras: [],
    ears: "small",
    headShare: 1 / 7,
  },
  "devolved primate": {
    kind: "humanoid",
    // A mid brown: the darker #3d3029 read as a black shape in the room's light, face and all.
    skin: "#76604c",
    covering: "fur",
    chest: true,
    bareHands: true,
    covers: "body",
    // The covering's second colour: the bare face, muzzle and ears.
    secondary: ["accent"],
    accentTone: "lighter",
    eyes: "#2a1a10",
    accent: "#c4a98f",
    head: "primate",
    hunch: 0.32,
    legShare: 0.36,
    wristShare: 0.2,
    reach: 0.1,
    droop: 0,
    digitigrade: false,
    shape: { shoulders: 1.2, waist: 1.15, hips: 1.05, limbs: 1.25 },
    extras: [],
    ears: "small",
    headShare: 1 / 6.2,
  },
  "quartz-crystallized body": {
    kind: "humanoid",
    // A pale cool blue, a step under the white facets, so the facets show against it.
    skin: "#bccbdc",
    covering: "crystal",
    covers: "body",
    // The covering's second colour: the facets that catch the light and the crystal spur.
    secondary: ["accent"],
    accentTone: "lighter",
    eyes: "#6f8fae",
    accent: "#f4f8fc",
    head: "crystal",
    hunch: 0,
    legShare: 0.47,
    wristShare: 0.45,
    reach: 0,
    droop: 0,
    digitigrade: false,
    shape: { shoulders: 1.08, waist: 1, hips: 1, limbs: 1.1 },
    extras: [],
    ears: "none",
    headShare: 1 / 7.5,
  },
  "human with a transfigured shark head": {
    kind: "humanoid",
    // The human body's colour when the record sends no `skin`: the figure code's neutral skin.
    skin: "#b9b0a6",
    covering: "skin",
    covers: "head",
    // The covering's main colour is the shark's grey; its second, the white underside.
    secondary: ["accent"],
    eyes: "#111111",
    accent: "#eceae4",
    headColour: "#7d8b96",
    head: "shark",
    hunch: 0,
    legShare: 0.47,
    wristShare: 0.45,
    reach: 0,
    droop: 0,
    digitigrade: false,
    shape: AVERAGE,
    extras: [],
    ears: "none",
    headShare: 1 / 6,
  },
  "mallard duck": {
    kind: "animal",
    animal: "duck",
    covering: "feathers",
    // The covering's second colour is the green head, its third the grey wings (the game sends brown, green, grey).
    secondary: ["head", "wing"],
    skin: "#8f8272",
    head: "#1f5e3a",
    wing: "#9a9690",
    accent: "#6b3b26",
    beak: "#e0b22e",
    feet: "#e07a1f",
    eyes: "#111111",
  },
  snake: {
    kind: "animal",
    animal: "snake",
    covering: "scales",
    // The covering's second colour: the bands.
    secondary: ["accent"],
    accentTone: "darker",
    skin: "#5f6b32",
    head: "#55602c",
    wing: "#5f6b32",
    accent: "#3e4721",
    beak: "#b8323a",
    feet: "#5f6b32",
    eyes: "#d9b84a",
  },
  "song bird": {
    kind: "animal",
    animal: "songbird",
    covering: "feathers",
    // The covering's second colour: the breast; its third, the wings and tail. With only one colour sent, the breast
    // is a lighter tone of it: the orange of the plan's own look is not a colour the game sent.
    secondary: ["accent", "wing"],
    accentTone: "lighter",
    skin: "#7a5a3c",
    head: "#6e5034",
    wing: "#6e5034",
    accent: "#d5793a",
    beak: "#3a3226",
    feet: "#5a4a3c",
    eyes: "#111111",
  },
  ...TAXON_PLANS,
};

/** A plan with the wire's colours for the form put over its own (`covering`, `eyes`, and for `covers: "head"`, `skin`). */
export type ResolvedPlan =
  | { kind: "human" }
  | { kind: "unknown"; name: string }
  | ({ name: string } & PlanSpec);

/** The person's body plan as the game sent it: "human body" when none is sent or it is not a word. */
export function bodyPlanName(record: Record<string, unknown>): string {
  const plan = record.body_plan;
  return typeof plan === "string" && plan.trim() !== "" ? plan.trim() : HUMAN_PLAN;
}

/**
 * How to draw this appearance record. A missing `body_plan` or "human body" is the human figure. A plan in
 * BODY_PLANS gets its own look with the form's sent look over its defaults: `covering.kind` (or `covering` as a plain
 * word); `covering.colours`, the
 * first for the body (the head for a plan covering only the head) and the rest into the plan's `secondary` slots in
 * order; `eyes`. A plan covering only the head draws its body in the record's `skin`. Each colour is taken by its
 * position. A place with no colour sent: with the main colour sent, a tone of it (TONE_STEP; the accent only where the
 * plan has `accentTone`), so a form drawn in one sent colour shows only that colour and its tones; with no colour
 * sent at all, the plan's default. Bills, beaks, feet, eyes and an accent without `accentTone` are marks of the
 * species, kept the same in 3D and in the portrait. Any other plan is unknown: a placeholder, with no colour invented.
 */
export function resolvePlan(record: Record<string, unknown>): ResolvedPlan {
  const name = bodyPlanName(record);
  if (name === HUMAN_PLAN) return { kind: "human" };
  const spec = Object.hasOwn(BODY_PLANS, name) ? BODY_PLANS[name] : undefined;
  if (!spec) return { kind: "unknown", name };
  // The wire's `{kind, colours}`; a plain word is taken as the kind alone; anything else counts as not sent.
  const sent: Record<string, unknown> =
    typeof record.covering === "string"
      ? { kind: record.covering.trim().toLowerCase() }
      : record.covering !== null && typeof record.covering === "object" && !Array.isArray(record.covering)
        ? (record.covering as Record<string, unknown>)
        : {};
  const covering = (COVERINGS as readonly string[]).includes(sent.kind as string) ? (sent.kind as Covering) : spec.covering;
  const hexes = (Array.isArray(sent.colours) ? sent.colours : []).slice(0, 3).map(colourHex);
  const main = hexes[0];
  const eyes = colourHex(record.eyes) ?? spec.eyes;
  const slots: Partial<Record<ColourSlot, string>> = {};
  spec.secondary.forEach((slot, i) => {
    const hex = hexes[i + 1];
    if (hex) slots[slot] = hex;
  });
  const accent = slots.accent ?? (main && spec.accentTone ? overlayHex(main, spec.accentTone === "darker" ? INK_DARK : INK_LIGHT, TONE_STEP.accent) : spec.accent);
  if (spec.kind === "animal") {
    const head = slots.head ?? (main ? overlayHex(main, INK_DARK, TONE_STEP.head) : spec.head);
    const wing = slots.wing ?? (main ? overlayHex(main, INK_DARK, TONE_STEP.wing) : spec.wing);
    return { ...spec, name, covering, eyes, accent, skin: main ?? spec.skin, head, wing };
  }
  if (spec.covers === "head") {
    return { ...spec, name, covering, eyes, accent, skin: colourHex(record.skin) ?? spec.skin, headColour: main ?? spec.headColour };
  }
  return { ...spec, name, covering, eyes, accent, skin: main ?? spec.skin };
}
