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

export type AnimalKind = "duck" | "snake" | "songbird";

export interface AnimalPlan extends PlanColours {
  kind: "animal";
  animal: AnimalKind;
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

/**
 * The plans the game uses today (`#2955.body_profiles`, read 2026-11-20 into
 * reports/player-avatars-forms-wire-2026-11-19.md). Keys are `body_plan` exactly as the game sends it.
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
