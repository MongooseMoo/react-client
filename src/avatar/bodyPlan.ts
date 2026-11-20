import { colourHex } from "./colour";
import type { BuildShape, Ears, ExtraPart } from "./figure";

/**
 * Body plans: how a person whose `body_plan` is not "human body" is drawn. The game sends a whole-body form's
 * species as `body_plan` ("werewolf", "mallard duck") and none of the character's own record (no skin, hair, eyes,
 * face or build), so these entries hold each plan's own look. Adding or changing a plan is one entry here; the 3D
 * figure (src/map/bodyPlanMesh.ts), the portrait (planPortrait.tsx) and the plan token read the entry.
 * Imports no three.js.
 */

/** The body plan the game sends for a character in no form; it, or no `body_plan` at all, draws the human figure. */
export const HUMAN_PLAN = "human body";

/** What covers a body. The wire may send one for a form (`covering`); it picks a colour only when no `skin` is sent. */
export const COVERINGS = ["skin", "fur", "scales", "feathers", "stone"] as const;
export type Covering = (typeof COVERINGS)[number];
/** A covering's colour, for a form whose `covering` differs from its plan's and that sends no `skin`. */
export const COVERING_TONE: Readonly<Record<Covering, string>> = {
  skin: "#b9b0a6",
  fur: "#6f6151",
  scales: "#5f6b3c",
  feathers: "#8a7258",
  stone: "#c8cdd2",
};

/** The head a humanoid plan wears on the human skeleton. */
export type PlanHead = "wolf" | "slack" | "ghoul" | "primate" | "crystal" | "shark";

export interface HumanoidPlan {
  kind: "humanoid";
  /** The body's colour: fur, skin or stone. */
  skin: string;
  covering: Covering;
  eyes: string;
  /** A second colour: the muzzle and chest, the face patch, the jaw, a shark's underside. */
  accent: string;
  /** The head's own colour, when it is not the body's (a shark head on a human body). */
  headColour?: string;
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

export interface AnimalPlan {
  kind: "animal";
  animal: AnimalKind;
  covering: Covering;
  /** The body's colour. */
  skin: string;
  head: string;
  /** Breast, belly or pattern. */
  accent: string;
  /** Bill or beak. */
  beak: string;
  feet: string;
  eyes: string;
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
    eyes: "#d9a326",
    accent: "#b8a68e",
    head: "wolf",
    hunch: 0.3,
    legShare: 0.44,
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
    covering: "skin",
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
    skin: "#3d3029",
    covering: "fur",
    eyes: "#6b4a2a",
    accent: "#8f7461",
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
    skin: "#d5dde6",
    covering: "stone",
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
    skin: "#b9b0a6",
    covering: "skin",
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
    skin: "#8f8272",
    head: "#1f5e3a",
    accent: "#6b3b26",
    beak: "#e0b22e",
    feet: "#e07a1f",
    eyes: "#111111",
  },
  snake: {
    kind: "animal",
    animal: "snake",
    covering: "scales",
    skin: "#5f6b32",
    head: "#55602c",
    accent: "#3e4721",
    beak: "#b8323a",
    feet: "#5f6b32",
    eyes: "#d9b84a",
  },
  "song bird": {
    kind: "animal",
    animal: "songbird",
    covering: "feathers",
    skin: "#7a5a3c",
    head: "#6e5034",
    accent: "#d5793a",
    beak: "#3a3226",
    feet: "#5a4a3c",
    eyes: "#111111",
  },
};

/** A plan with the wire's colours for the form put over its own (`skin`, `eyes`, `covering`). */
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
 * BODY_PLANS gets its own look, with a sent `skin` colour (or, without one, a sent `covering` other than the plan's
 * own) and a sent `eyes` colour over its defaults. Any other plan is unknown: a placeholder, with no colour invented.
 */
export function resolvePlan(record: Record<string, unknown>): ResolvedPlan {
  const name = bodyPlanName(record);
  if (name === HUMAN_PLAN) return { kind: "human" };
  const spec = Object.hasOwn(BODY_PLANS, name) ? BODY_PLANS[name] : undefined;
  if (!spec) return { kind: "unknown", name };
  const coveringWord = typeof record.covering === "string" ? record.covering.trim().toLowerCase() : "";
  const covering = (COVERINGS as readonly string[]).includes(coveringWord) ? (coveringWord as Covering) : spec.covering;
  const skin = colourHex(record.skin) ?? (covering !== spec.covering ? COVERING_TONE[covering] : spec.skin);
  const eyes = colourHex(record.eyes) ?? spec.eyes;
  return { ...spec, name, covering, skin, eyes };
}
