import { colourHex, contrast, hexOrUndefined, inkFor, MIN_CONTRAST } from "./colour";

/**
 * A person's figure as numbers, colours and part choices, from the Room.Layout
 * `appearance` map. Shared by the 3D figure (src/map/figureMesh.ts), the SVG
 * portrait and the plan token, so all three show the same person. Imports no
 * three.js. The decoder checks nothing, so every field is read as possibly
 * missing or of the wrong type; anything unusable counts as unremarkable.
 */

export type Posture = "standing" | "sitting" | "reclining";
export type HairShape = "none" | "short" | "medium" | "long";
export type FacialHair = "none" | "stubble" | "moustache" | "goatee" | "beard";
export type ExtraPart = "tail" | "wings" | "antlers" | "horns" | "pointed_ears";
/** Where two differently coloured regions of the figure meet. */
export type Seam = "hairline" | "neck" | "waist" | "hips" | "wrists" | "ankles";

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

/** The eight chargen builds. Any other value is drawn as average. */
export const BUILDS: Readonly<Record<string, BuildShape>> = {
  average: { shoulders: 1, waist: 1, hips: 1, limbs: 1 },
  thin: { shoulders: 0.86, waist: 0.8, hips: 0.85, limbs: 0.8 },
  athletic: { shoulders: 1.12, waist: 0.95, hips: 1, limbs: 1.08 },
  muscular: { shoulders: 1.25, waist: 1.05, hips: 1.05, limbs: 1.25 },
  curvy: { shoulders: 0.95, waist: 0.9, hips: 1.2, limbs: 1.02 },
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
}

export interface FigureParams {
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
  /** Hair bulk relative to straight hair: curly and coily stand out further. */
  hairVolume: number;
  headCovered: boolean;
  facialHair: FacialHair;
  faceHidden: boolean;
  extras: ExtraPart[];
  /** Seams whose two sides fall below 3:1 contrast, drawn with an outline in `colours.ink`. */
  outlined: Seam[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const finite = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

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

export function hairShape(lengthCm: number | undefined): HairShape {
  if (lengthCm === undefined || lengthCm < 1) return "none";
  if (lengthCm < 8) return "short";
  if (lengthCm < 25) return "medium";
  return "long";
}

const HAIR_VOLUME: Readonly<Record<string, number>> = { straight: 1, wavy: 1.06, curly: 1.16, coily: 1.26 };
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
  pointed_ears: "pointed_ears",
};

export interface FigureOptions {
  /** Floor to crown, metres: the person's Room.Layout box height. */
  height: number;
  /** The colour of a person drawn without appearance (today's person or you colour). */
  base: string;
}

/** Seat height for a sitting figure, as a share of standing height. */
const SEAT_SHARE = 0.26;

export function figureParams(appearance: unknown, { height: rawHeight, base }: FigureOptions): FigureParams {
  const record = appearanceRecord(appearance) ?? {};
  const height = Math.min(4, Math.max(0.5, Number.isFinite(rawHeight) ? rawHeight : 1.75));
  const scale = height / 1.75;
  const buildName = word(record.build);
  const build = buildName !== undefined && Object.hasOwn(BUILDS, buildName) ? buildName : "average";
  const shape = BUILDS[build];
  const age = finite(record.age_years);
  // Children carry a bigger head for their height.
  const headShare = age !== undefined && age < 13 ? 1 / 5.8 : age !== undefined && age < 17 ? 1 / 6.8 : 1 / 7.5;
  const headHeight = height * headShare;

  const skin = colourHex(record.skin) ?? hexOrUndefined(base) ?? "#888888";
  const hairRecord = isRecord(record.hair) ? record.hair : undefined;
  const hairHex = hexOrUndefined(hairRecord?.hex);
  const covered = outermostByArea(record);
  const hair = hairHex && !covered.head ? hairShape(finite(hairRecord?.length_cm)) : "none";
  const hairVolume = HAIR_VOLUME[word(hairRecord?.texture) ?? "straight"] ?? 1;

  const facialRecord = isRecord(record.facial_hair) ? record.facial_hair : undefined;
  const facialKind = word(facialRecord?.kind);
  const facialHex = hexOrUndefined(facialRecord?.hex) ?? hairHex;
  const faceHidden = record.face_hidden === true;
  const facialHair: FacialHair =
    !faceHidden && facialHex && FACIAL_HAIR.includes(facialKind as FacialHair) ? (facialKind as FacialHair) : "none";

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
  };

  const seams: Array<[Seam, string, string]> = [
    ["hairline", colours.head, skin],
    ["neck", colours.neck, colours.torso],
    ["waist", colours.torso, colours.hips],
    ["hips", colours.hips, colours.legs],
    ["wrists", colours.arms, colours.hands],
    ["ankles", colours.legs, colours.feet],
  ];
  // A seam between two different colours that do not reach 3:1 gets an outline.
  const weak = seams.filter(([, a, b]) => a !== b && contrast(a, b) < MIN_CONTRAST);
  const outlined = weak.map(([seam]) => seam);
  colours.ink = inkFor(...(weak.length > 0 ? weak.flatMap(([, a, b]) => [a, b]) : [skin, torso]));

  const traits = Array.isArray(record.traits) ? record.traits : [];
  const extras: ExtraPart[] = [];
  for (const trait of traits) {
    const part = TRAIT_PARTS[word(trait) ?? ""];
    if (part && !extras.includes(part)) extras.push(part);
  }

  const posture = POSTURES.includes(word(record.posture) as Posture) ? (word(record.posture) as Posture) : "standing";
  const legShare = 0.47;
  const top =
    posture === "standing" ? height : posture === "sitting" ? height * (1 - legShare) + height * SEAT_SHARE : height * 0.16;

  return {
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
    headCovered: covered.head !== undefined,
    facialHair,
    faceHidden,
    extras,
    outlined,
  };
}

/** Every fill colour a figure draws (outline ink aside), for checks. */
export function figureFills(params: FigureParams): Set<string> {
  const c = params.colours;
  return new Set(
    [c.skin, c.head, c.neck, c.torso, c.arms, c.hands, c.hips, c.legs, c.feet, c.hair, c.facialHair, c.eyes].filter(
      (x): x is string => x !== undefined,
    ),
  );
}

/** The plan token's colours: the body by the main garment (or skin), the head by hair or head covering (or skin). */
export function tokenColours(appearance: unknown): { body?: string; head?: string } | undefined {
  const record = appearanceRecord(appearance);
  if (!record) return undefined;
  // Without a skin colour, a bare part keeps the token's usual colour.
  const skin = colourHex(record.skin);
  const { colours, headCovered, hair } = figureParams(record, { height: 1.75, base: "#000000" });
  const body = outermostByArea(record).torso ?? skin;
  const head = headCovered || hair !== "none" ? colours.head : skin;
  return body === undefined && head === undefined ? undefined : { body, head };
}
