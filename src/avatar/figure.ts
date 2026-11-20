import { type ResolvedPlan, resolvePlan } from "./bodyPlan";
import { colourHex, contrast, hexOrUndefined, inkFor, MIN_CONTRAST, sheenFor, toneOff } from "./colour";
import { HAIR_LENGTHS } from "./hairLengths";

/**
 * A person's figure as numbers, colours and part choices, from the Room.Layout
 * `appearance` map. Shared by the 3D figure (src/map/figureMesh.ts), the SVG
 * portrait and the plan token, so all three show the same person. Imports no
 * three.js. The decoder checks nothing, so every field is read as possibly
 * missing or of the wrong type; anything unusable counts as unremarkable.
 */

export type Posture = "standing" | "sitting" | "reclining";
/** No hair, or one of the game's hair length bands (hairLengths.ts). */
export type HairShape = "none" | (typeof HAIR_LENGTHS)[number][0];
export type HairTexture = "straight" | "wavy" | "curly" | "coily";
/**
 * `hair.style`, as the game sends it (`$appearance.vocab["hair.style"]`, read live 2026-11-16 with
 * `ops/moo-agent moo ';$appearance.vocab["hair.style"]'`), with the shortest hair in cm the game
 * offers it for (that list's third column). A form can put any style on any length; hair shorter than its style's
 * minimum is drawn loose, the plain drawing for its length.
 */
export const HAIR_STYLE_MIN_CM = {
  loose: 0,
  ponytail: 18,
  braided: 18,
  bun: 30,
  topknot: 18,
  dreadlocks: 8,
  spiky: 2.5,
  mohawk: 2.5,
  swept_back: 8,
  brushed: 2.5,
  voluminous: 8,
} as const;
export type HairStyle = keyof typeof HAIR_STYLE_MIN_CM;
export type FacialHair ="none" | "stubble" | "moustache" | "goatee" | "beard";
export type ExtraPart = "tail" | "wings" | "antlers" | "horns";
/** `face.ears` as the game sends it; `average` when none is sent or the value is unknown. */
export const EAR_KINDS = ["average", "small", "large", "pointed"] as const;
export type Ears = (typeof EAR_KINDS)[number];
/** `features` keys the portrait draws; others are ignored. */
export const FEATURES = ["freckles", "glasses", "sunglasses", "eyepatch", "earrings", "beauty_mark", "dimples"] as const;
export type Feature = (typeof FEATURES)[number];
/** Where two differently coloured regions of the figure meet. */
export type Seam = "hairline" | "jawline" | "neck" | "waist" | "hips" | "wrists" | "ankles";

/** Stubble is drawn at this opacity over the skin, in the portrait and on the 3D figure alike. */
export const STUBBLE_OPACITY = 0.45;

/** Body areas a garment can cover, as the server names them. */
export const AREAS = ["head", "neck", "torso", "arms", "hands", "waist", "legs", "feet"] as const;
export type Area = (typeof AREAS)[number];

/** Widths relative to an average build: shoulders, waist, hips, limbs. */
export interface BuildShape {
  shoulders: number;
  waist: number;
  hips: number;
  limbs: number;
}

/** The game's builds (`$appearance.vocab["build"]`). Any other value is drawn as average. */
export const BUILDS: Readonly<Record<string, BuildShape>> = {
  average: { shoulders: 1, waist: 1, hips: 1, limbs: 1 },
  slender: { shoulders: 0.93, waist: 0.86, hips: 0.92, limbs: 0.88 },
  thin: { shoulders: 0.86, waist: 0.8, hips: 0.85, limbs: 0.8 },
  athletic: { shoulders: 1.12, waist: 0.95, hips: 1, limbs: 1.08 },
  muscular: { shoulders: 1.25, waist: 1.05, hips: 1.05, limbs: 1.25 },
  curvy: { shoulders: 0.95, waist: 0.9, hips: 1.2, limbs: 1.02 },
  stocky: { shoulders: 1.2, waist: 1.15, hips: 1.08, limbs: 1.22 },
  chunky: { shoulders: 1.15, waist: 1.25, hips: 1.2, limbs: 1.18 },
  pudgy: { shoulders: 1.02, waist: 1.3, hips: 1.15, limbs: 1.08 },
  dumpy: { shoulders: 1.05, waist: 1.25, hips: 1.25, limbs: 1.1 },
};

/** A garment colour the server did not supply: drawn as plain cloth, never as bare skin. */
export const UNCOLOURED_GARMENT = "#8a8a94";

export interface FigureColours {
  skin: string;
  /** What is drawn over the top of the head: a head garment, else hair (when any), else skin. */
  head: string;
  neck: string;
  torso: string;
  arms: string;
  hands: string;
  hips: string;
  legs: string;
  feet: string;
  hair?: string;
  facialHair?: string;
  eyes?: string;
  /** Outline colour for seams below MIN_CONTRAST. */
  ink: string;
  /** The ink that stands out on the skin: pupils, nose, mouth, face marks and features. */
  faceInk: string;
  /**
   * The 3D hairline: the colour over the head (hair or a head garment) as `toneOff` gives it against the skin,
   * so the edge of black hair on dark skin is a grey of the hair, not a white band.
   */
  hairEdge: string;
  /** Brows: the hair's colour (else the beard's, else the face ink), toned off the skin by the same rule. */
  brow: string;
  /** The facial hair's edge and stubble's dots, by the same rule; undefined without facial hair. */
  facialHairEdge?: string;
  /** `sheenFor(hair)`: texture, a bun's form and strands on the hair; undefined without hair. */
  hairSheen?: string;
  /**
   * The skin's own tone off itself (`toneOff(skin, skin)`): the 3D ears' forward edge is shaded toward it, so an ear
   * shows against the head on every skin, as the brows and the collar line do.
   */
  earEdge: string;
  /**
   * The 3D collar line where the neck meets the clothing: the clothing's colour toned off the neck by the same rule,
   * so a dark neck above dark clothing is not ringed in white ink.
   */
  collarEdge: string;
}

export interface FigureParams {
  /** False for a person with no appearance map: the plain figure, with no face drawn. */
  described: boolean;
  /** Floor to crown, metres, standing. */
  height: number;
  posture: Posture;
  /** Crown height above the floor in this posture, metres. */
  top: number;
  headHeight: number;
  /** Half widths, metres. */
  shoulderHalf: number;
  waistHalf: number;
  hipHalf: number;
  limbRadius: number;
  /** Legs' share of the height (floor to hip). */
  legShare: number;
  build: string;
  colours: FigureColours;
  hair: HairShape;
  /** Hair bulk relative to straight hair: curly and coily stand out further, more the longer the hair (`HAIR_BULK`). */
  hairVolume: number;
  /** The hair's texture as sent; anything else, or none, is straight. */
  hairTexture: HairTexture;
  /** How the hair is worn; `loose` when none is sent, the style is unknown, the hair is too short for it, or no hair is drawn. */
  hairStyle: HairStyle;
  headCovered: boolean;
  facialHair: FacialHair;
  /** A beard's `facial_hair.length_cm`, within the game's 0 to 100; undefined for another kind or no length. */
  beardLength?: number;
  /** `beardReach(beardLength)`, with it. */
  beardReach?: number;
  faceHidden: boolean;
  extras: ExtraPart[];
  /** `face.ears`; pointed also for the body plan's `pointed ears` trait. */
  ears: Ears;
  /** Whether hair or a head garment covers the ears (`earsCovered`): the portrait and the 3D figure both leave them out then. */
  earsHidden: boolean;
  /** Known `features`, in the order given, each once; none on a hidden face. */
  features: Feature[];
  /** Seams whose two sides fall below 3:1 contrast, drawn with an outline in `colours.ink`. */
  outlined: Seam[];
  /**
   * The body plan drawn (bodyPlan.ts): `human` for "human body" or none, which is everything above; a known plan
   * with the form's colours over its own; or `unknown`, a placeholder.
   */
  plan: ResolvedPlan;
  /** Width (x) and depth (y) of the person's box, metres, when known: an animal plan is sized to fit it. */
  footprint?: Footprint;
}

/** A box's width across (x) and depth front to back (y), metres. */
export interface Footprint {
  width: number;
  depth: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const finite = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

/** A vocabulary key exactly as the game sends it (`previously_broken`, `beauty_mark`); no other spelling. */
export const vocabKey = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);

/** A trait name, which the body plan writes in words ("pointed ears"), as a key. */
const word = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() !== "" ? value.trim().toLowerCase().replace(/[\s-]+/g, "_") : undefined;

/** The appearance map when it is a map at all. */
export function appearanceRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

/** The server's label for this person, as plain text, or undefined. */
export function appearanceLabel(value: unknown): string | undefined {
  const record = appearanceRecord(value);
  const label = record?.label;
  return typeof label === "string" && label.trim() !== "" ? label.trim() : undefined;
}

interface Garment {
  areas: Area[];
  layer: number;
  colour: string;
  order: number;
}

function garments(record: Record<string, unknown>): Garment[] {
  const list = Array.isArray(record.garments) ? record.garments : [];
  const out: Garment[] = [];
  list.forEach((g, order) => {
    if (!isRecord(g) || !Array.isArray(g.areas)) return;
    const areas = g.areas.filter((a): a is Area => typeof a === "string" && (AREAS as readonly string[]).includes(a));
    if (areas.length === 0) return;
    out.push({ areas, layer: finite(g.layer) ?? 0, colour: colourHex(g.colour) ?? UNCOLOURED_GARMENT, order });
  });
  return out;
}

/** The outermost garment's colour on each covered area: highest layer, then latest in the list. */
export function outermostByArea(value: unknown): Partial<Record<Area, string>> {
  const record = appearanceRecord(value);
  const byArea: Partial<Record<Area, Garment>> = {};
  for (const g of record ? garments(record) : []) {
    for (const area of g.areas) {
      const held = byArea[area];
      if (!held || g.layer > held.layer || (g.layer === held.layer && g.order > held.order)) byArea[area] = g;
    }
  }
  const colours: Partial<Record<Area, string>> = {};
  for (const area of AREAS) if (byArea[area]) colours[area] = byArea[area]?.colour;
  return colours;
}

/**
 * How far a beard of `lengthCm` reaches, from 0 (cropped to the jaw) to 1 at the game's
 * "very long" band (40 cm) and beyond. The portrait and the 3D figure both draw by it.
 */
export function beardReach(lengthCm: number): number {
  return Math.min(1, Math.max(0, lengthCm) / 40);
}

/** The game's band for a hair length, as the game picks it; `none` for no length or bald (0 or less). */
export function hairShape(lengthCm: number | undefined): HairShape {
  if (lengthCm === undefined || lengthCm <= 0) return "none";
  for (const [band, , highest] of HAIR_LENGTHS) if (highest === 0 || lengthCm < highest) return band;
  return "waist-length";
}

/** Bands long enough to fall round the head rather than lie on it. */
export const FALLING_HAIR: readonly HairShape[] = ["chin-length", "shoulder-length", "long", "waist-length"];

/** Styles worn down, so hair past the jaw falls round the head (the portrait's side locks, the 3D fall). */
export const HANGS_LOOSE: readonly HairStyle[] = ["loose", "voluminous", "brushed", "swept_back"];
/** Styles whose cap is combed or shaved smooth, whatever the texture. */
const SMOOTH_CAP: readonly HairStyle[] = ["mohawk", "brushed", "swept_back"];

/**
 * Whether the ears are covered: by a head garment; by voluminous hair; by hair worn down past the jaw; or by a
 * curly, coily or wavy cap at full bulk (chin-length and longer), which stands out past them. Cropped and short
 * hair of every texture lies close at the sides, so the ears show. One rule for the portrait and the 3D figure.
 */
export function earsCovered(p: Pick<FigureParams, "headCovered" | "hair" | "hairStyle" | "hairTexture">): boolean {
  if (p.headCovered) return true;
  if (p.hair === "none") return false;
  if (p.hairStyle === "voluminous") return true;
  return FALLING_HAIR.includes(p.hair) && (HANGS_LOOSE.includes(p.hairStyle) || (p.hairTexture !== "straight" && !SMOOTH_CAP.includes(p.hairStyle)));
}

const HAIR_VOLUME: Readonly<Record<HairTexture, number>> = { straight: 1, wavy: 1.06, curly: 1.16, coily: 1.26 };
/**
 * How much of its texture's bulk (`HAIR_VOLUME`) hair of each band has: cropped curls lie close, short ones stand up
 * a little, from chin length on the full mass. At full bulk at every length, 3 cm coily hair was a full afro.
 */
const HAIR_BULK: Readonly<Record<HairShape, number>> = { none: 0, shaved: 0, cropped: 0.2, short: 0.5, "chin-length": 1, "shoulder-length": 1, long: 1, "waist-length": 1 };
const FACIAL_HAIR: readonly FacialHair[] = ["none", "stubble", "moustache", "goatee", "beard"];
const POSTURES: readonly Posture[] = ["standing", "sitting", "reclining"];

/** Trait names (and spellings of them) that add a part to the figure. */
const TRAIT_PARTS: Readonly<Record<string, ExtraPart>> = {
  tail: "tail",
  wings: "wings",
  wing: "wings",
  antlers: "antlers",
  antler: "antlers",
  horns: "horns",
  horn: "horns",
};

/**
 * The skin drawn when an appearance map has none (the old character system
 * never stored one). A light warm grey, not a human skin tone, so it claims no
 * one's complexion; black hair stands out from it at 8:1, and white hair gets
 * the hairline outline. The portrait, the 3D figure and the plan token all use it.
 */
export const NEUTRAL_SKIN = "#b9b0a6";
/**
 * Clothing drawn on torso, arms, waist, legs and feet when an appearance map
 * lists no garments, so a described person looks dressed rather than bare: a
 * dark slate, 3.7:1 against the neutral skin.
 */
export const NEUTRAL_CLOTHING = "#4b5262";
/**
 * Horns and antlers, in the portrait and on the 3D figure. The wire's `traits` name them
 * but give no colour, so they are drawn in one bone tone rather than the hair's colour.
 */
export const HORN_TONE = "#d6c9a8";

export interface FigureOptions {
  /** Floor to crown, metres: the person's Room.Layout box height. */
  height: number;
  /** The colour of a person with no appearance map at all (today's person or you colour): the plain figure. */
  base?: string;
  /** The person's box across and front to back, metres: sizes an animal plan and an unknown plan's placeholder. */
  footprint?: Footprint;
}

/** Seat height for a sitting figure, as a share of standing height. */
const SEAT_SHARE = 0.26;

export function figureParams(appearance: unknown, { height: rawHeight, base, footprint }: FigureOptions): FigureParams {
  const record = appearanceRecord(appearance) ?? {};
  const plan = resolvePlan(record);
  if (plan.kind !== "human") return planParams(record, plan, rawHeight, base, footprint);
  const height = Math.min(4, Math.max(0.5, Number.isFinite(rawHeight) ? rawHeight : 1.75));
  const scale = height / 1.75;
  const buildName = vocabKey(record.build);
  const build = buildName !== undefined && Object.hasOwn(BUILDS, buildName) ? buildName : "average";
  const shape = BUILDS[build];
  const age = finite(record.age_years);
  // Children carry a bigger head for their height.
  const headShare = age !== undefined && age < 13 ? 1 / 5.8 : age !== undefined && age < 17 ? 1 / 6.8 : 1 / 7.5;
  const headHeight = height * headShare;

  // No appearance map at all: the plain figure in `base`. A map without skin or
  // garments (most records today): a person in the neutral skin and clothing.
  const described = appearanceRecord(appearance) !== undefined;
  const skin = colourHex(record.skin) ?? (described ? NEUTRAL_SKIN : (hexOrUndefined(base) ?? NEUTRAL_SKIN));
  const hairRecord = isRecord(record.hair) ? record.hair : undefined;
  const hairHex = hexOrUndefined(hairRecord?.hex);
  const worn = outermostByArea(record);
  const covered: Partial<Record<Area, string>> =
    described && Object.keys(worn).length === 0
      ? { torso: NEUTRAL_CLOTHING, arms: NEUTRAL_CLOTHING, waist: NEUTRAL_CLOTHING, legs: NEUTRAL_CLOTHING, feet: NEUTRAL_CLOTHING }
      : worn;
  const hair = hairHex && !covered.head ? hairShape(finite(hairRecord?.length_cm)) : "none";
  const textureWord = vocabKey(hairRecord?.texture) ?? "straight";
  const hairTexture: HairTexture = Object.hasOwn(HAIR_VOLUME, textureWord) ? (textureWord as HairTexture) : "straight";
  const hairVolume = 1 + (HAIR_VOLUME[hairTexture] - 1) * HAIR_BULK[hair];
  const styleKey = vocabKey(hairRecord?.style) ?? "";
  const hairCm = finite(hairRecord?.length_cm) ?? 0;
  const hairStyle: HairStyle =
    hair !== "none" && Object.hasOwn(HAIR_STYLE_MIN_CM, styleKey) && hairCm >= HAIR_STYLE_MIN_CM[styleKey as HairStyle] ? (styleKey as HairStyle) : "loose";

  const facialRecord = isRecord(record.facial_hair) ? record.facial_hair : undefined;
  const facialKind = vocabKey(facialRecord?.kind);
  const facialHex = hexOrUndefined(facialRecord?.hex) ?? hairHex;
  const faceHidden = record.face_hidden === true;
  const facialHair: FacialHair =
    !faceHidden && facialHex && FACIAL_HAIR.includes(facialKind as FacialHair) ? (facialKind as FacialHair) : "none";
  const facialLength = finite(facialRecord?.length_cm);
  const beardLength = facialHair === "beard" && facialLength !== undefined ? Math.min(100, Math.max(0, facialLength)) : undefined;

  const torso = covered.torso ?? skin;
  const legs = covered.legs ?? skin;
  const colours: FigureColours = {
    skin,
    head: covered.head ?? (hair !== "none" && hairHex ? hairHex : skin),
    neck: covered.neck ?? skin,
    torso,
    arms: covered.arms ?? skin,
    hands: covered.hands ?? skin,
    hips: covered.waist ?? covered.legs ?? covered.torso ?? skin,
    legs,
    feet: covered.feet ?? skin,
    hair: hair !== "none" ? hairHex : undefined,
    facialHair: facialHair !== "none" ? facialHex : undefined,
    eyes: faceHidden ? undefined : colourHex(record.eyes),
    ink: "",
    faceInk: inkFor(skin),
    hairEdge: "",
    brow: "",
    collarEdge: "",
    earEdge: toneOff(skin, skin),
  };
  colours.hairEdge = toneOff(colours.head, skin);
  colours.collarEdge = toneOff(colours.torso, colours.neck);
  // A brow in the hair's colour (or the beard's, or the face ink without either), toned off the skin.
  colours.brow = toneOff(colours.hair ?? colours.facialHair ?? colours.faceInk, skin);
  if (colours.facialHair) colours.facialHairEdge = toneOff(colours.facialHair, skin);
  if (colours.hair) colours.hairSheen = sheenFor(colours.hair);

  const outlined = outlineSeams(colours, facialHair === "beard" || facialHair === "goatee" ? facialHex : undefined);

  const traits = Array.isArray(record.traits) ? record.traits : [];
  const extras = traitExtras(record);
  const face = isRecord(record.face) ? record.face : {};
  const earKey = vocabKey(face.ears) ?? "";
  const ears: Ears = traits.some((t) => word(t) === "pointed_ears") ? "pointed" : (EAR_KINDS as readonly string[]).includes(earKey) ? (earKey as Ears) : "average";

  const features: Feature[] = [];
  for (const key of faceHidden || !Array.isArray(record.features) ? [] : record.features) {
    const feature = vocabKey(key) as Feature;
    if ((FEATURES as readonly string[]).includes(feature) && !features.includes(feature)) features.push(feature);
  }

  const posture = POSTURES.includes(word(record.posture) as Posture) ? (word(record.posture) as Posture) : "standing";
  const legShare = 0.47;
  const top =
    posture === "standing" ? height : posture === "sitting" ? height * (1 - legShare) + height * SEAT_SHARE : height * 0.16;

  return {
    described,
    height,
    posture,
    top,
    headHeight,
    shoulderHalf: 0.2 * scale * shape.shoulders,
    waistHalf: 0.14 * scale * shape.waist,
    hipHalf: 0.16 * scale * shape.hips,
    limbRadius: 0.05 * scale * shape.limbs,
    legShare,
    build,
    colours,
    hair,
    hairVolume,
    hairTexture,
    hairStyle,
    headCovered: covered.head !== undefined,
    earsHidden: earsCovered({ headCovered: covered.head !== undefined, hair, hairStyle, hairTexture }),
    facialHair,
    ...(beardLength !== undefined ? { beardLength, beardReach: beardReach(beardLength) } : {}),
    faceHidden,
    extras,
    ears,
    features,
    outlined,
    plan,
  };
}

/** The parts the body plan's traits add (`tail`, `wings`, `antlers`, `horns`), each once, in the order given. */
function traitExtras(record: Record<string, unknown>, extras: ExtraPart[] = []): ExtraPart[] {
  for (const trait of Array.isArray(record.traits) ? record.traits : []) {
    const part = TRAIT_PARTS[word(trait) ?? ""];
    if (part && !extras.includes(part)) extras.push(part);
  }
  return extras;
}

/**
 * The seams whose two sides differ and fall under 3:1, which get an outline, and sets `colours.ink`. A seam between
 * two different colours under 3:1 gets an outline whatever their hues: colours told apart by hue alone (green on
 * brown, crimson on near-black) look alike to someone with red-green colour blindness. `jaw` is a beard or goatee's
 * colour against the skin; stubble is shading, never outlined.
 */
function outlineSeams(colours: FigureColours, jaw: string | undefined): Seam[] {
  const skin = colours.skin;
  const seams: Array<[Seam, string, string]> = [
    ["hairline", colours.head, skin],
    ...(jaw ? [["jawline", jaw, skin] as [Seam, string, string]] : []),
    ["neck", colours.neck, colours.torso],
    ["waist", colours.torso, colours.hips],
    ["hips", colours.hips, colours.legs],
    ["wrists", colours.arms, colours.hands],
    ["ankles", colours.legs, colours.feet],
  ];
  const weak = seams.filter(([, a, b]) => a !== b && contrast(a, b) < MIN_CONTRAST);
  colours.ink = inkFor(...(weak.length > 0 ? weak.flatMap(([, a, b]) => [a, b]) : [skin, colours.torso]));
  return weak.map(([seam]) => seam);
}

/**
 * A person in a body plan other than the human one. No hair, facial hair, face or features are read, and no neutral
 * skin or clothing is filled in; colours come from the form's `covering` and `eyes` (resolvePlan). A plan covering only
 * the head (the shark head) draws the body from the record's `skin` and `build`. A humanoid plan keeps `garments` when
 * sent, `traits` parts and `posture`; an animal plan and an unknown plan's placeholder are sized by the box
 * (`footprint` and `height`) and always stand.
 */
function planParams(record: Record<string, unknown>, plan: Exclude<ResolvedPlan, { kind: "human" }>, rawHeight: number, base: string | undefined, footprint: Footprint | undefined): FigureParams {
  const height = Math.min(4, Math.max(0.05, Number.isFinite(rawHeight) ? rawHeight : 1.75));
  const scale = height / 1.75;
  const humanoid = plan.kind === "humanoid" ? plan : undefined;
  // An unknown plan has no colour of its own: the placeholder takes the plain person colour (you in blue).
  const main = plan.kind === "unknown" ? (hexOrUndefined(base) ?? UNCOLOURED_GARMENT) : plan.skin;
  const head = plan.kind === "unknown" ? main : plan.kind === "animal" ? plan.head : (plan.headColour ?? main);
  const worn = humanoid ? outermostByArea(record) : {};
  const colours: FigureColours = {
    skin: main,
    head: worn.head ?? head,
    neck: worn.neck ?? main,
    torso: worn.torso ?? main,
    arms: worn.arms ?? main,
    hands: worn.hands ?? (humanoid?.bareHands ? humanoid.accent : main),
    hips: worn.waist ?? worn.legs ?? worn.torso ?? main,
    legs: worn.legs ?? main,
    feet: worn.feet ?? (humanoid?.bareHands ? humanoid.accent : main),
    eyes: plan.kind === "unknown" ? undefined : plan.eyes,
    ink: "",
    faceInk: inkFor(head),
    hairEdge: head,
    brow: toneOff(head, head),
    earEdge: toneOff(main, main),
    collarEdge: main,
  };
  colours.collarEdge = toneOff(colours.torso, colours.neck);
  const outlined = humanoid ? outlineSeams(colours, undefined).filter((seam) => seam !== "hairline") : [];
  if (!humanoid) colours.ink = inkFor(main);
  const posture = humanoid && POSTURES.includes(word(record.posture) as Posture) ? (word(record.posture) as Posture) : "standing";
  const legShare = humanoid?.legShare ?? 0.47;
  const top = posture === "standing" ? height : posture === "sitting" ? height * (1 - legShare) + height * SEAT_SHARE : height * 0.16;
  // A plan covering only the head (the shark head) keeps the person's own build; the head stays the form's, so
  // `age_years`, which only sizes a human head, changes nothing here.
  const buildName = vocabKey(record.build);
  const ownBuild = humanoid?.covers === "head" && buildName !== undefined && Object.hasOwn(BUILDS, buildName) ? buildName : undefined;
  const shape = ownBuild ? BUILDS[ownBuild] : (humanoid?.shape ?? BUILDS.average);
  return {
    described: true,
    height,
    posture,
    top,
    // Animals and placeholders: the top 45% counts as the head, so the label sits over the whole of a small body.
    headHeight: humanoid ? height * humanoid.headShare : height * 0.45,
    shoulderHalf: 0.2 * scale * shape.shoulders,
    waistHalf: 0.14 * scale * shape.waist,
    hipHalf: 0.16 * scale * shape.hips,
    limbRadius: 0.05 * scale * shape.limbs,
    legShare,
    build: ownBuild ?? "average",
    colours,
    hair: "none",
    hairVolume: 1,
    hairTexture: "straight",
    hairStyle: "loose",
    headCovered: worn.head !== undefined,
    earsHidden: humanoid ? humanoid.ears === "none" || worn.head !== undefined : true,
    facialHair: "none",
    faceHidden: false,
    extras: humanoid ? traitExtras(record, [...humanoid.extras]) : [],
    ears: humanoid && humanoid.ears !== "none" ? humanoid.ears : "average",
    features: [],
    outlined,
    plan,
    ...(footprint && Number.isFinite(footprint.width) && Number.isFinite(footprint.depth) && footprint.width > 0 && footprint.depth > 0 ? { footprint: { width: footprint.width, depth: footprint.depth } } : {}),
  };
}

/** Every fill colour a figure draws (outline ink and the tones made from these, `brow`, `hairEdge`, `facialHairEdge`, `hairSheen` and `collarEdge`, aside), for checks. */
export function figureFills(params: FigureParams): Set<string> {
  const c = params.colours;
  return new Set(
    [c.skin, c.head, c.neck, c.torso, c.arms, c.hands, c.hips, c.legs, c.feet, c.hair, c.facialHair, c.eyes].filter(
      (x): x is string => x !== undefined,
    ),
  );
}

/**
 * The plan token's colours, the same as the figure's: the body by what covers the
 * torso (or the skin), the head by hair or head covering (or the skin); for a body
 * plan, its body and head colours. Undefined without an appearance map or for a
 * body plan the client does not know, so the token keeps its plain person colour.
 */
export function tokenColours(appearance: unknown): { body: string; head: string } | undefined {
  const record = appearanceRecord(appearance);
  if (!record) return undefined;
  const { colours, plan } = figureParams(record, { height: 1.75 });
  if (plan.kind === "unknown") return undefined;
  return { body: colours.torso, head: colours.head };
}
