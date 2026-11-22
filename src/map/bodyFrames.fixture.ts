import type { LayoutFramePart, LayoutGarment, LayoutHeld, LayoutThing } from "../gmcp/Room";

/**
 * Hand-written worn and held things in the body frames' units (docs/room-layout.md, "Body frames"), for tests and
 * pictures until the game sends them: a suit of armour, a shield on the left forearm and a sword in the main hand.
 * Frame units: u across (the wearer's left +), v front to back (the back +, so the face is at -v), t along 0 to 1.
 */

const steel = { name: "steel", hex: "#a8b0b8" };
const darkSteel = { name: "dark steel", hex: "#6c747c" };
const leather = { name: "brown leather", hex: "#6b4a2b" };
const canvas = { name: "olive canvas", hex: "#5d6a3a" };
const oak = { name: "oak", hex: "#8b5a2b" };

const ACROSS: [[number, number, number], [number, number, number], [number, number, number]] = [[0, 1, 0], [0, 0, 1], [1, 0, 0]];
const UPSIDE_DOWN: [[number, number, number], [number, number, number], [number, number, number]] = [[1, 0, 0], [0, -1, 0], [0, 0, -1]];
const DOME: Array<[number, number]> = [[1, 0], [0.97, 0.25], [0.87, 0.5], [0.66, 0.75], [0.36, 0.93], [0, 1]];

/** An ellipse of 16 points anticlockwise from the wearer's left (+x), as fractions of a box, half-widths `rx`, `ry`. */
const ring = (rx: number, ry: number): Array<[number, number]> =>
  Array.from({ length: 16 }, (_, i): [number, number] => [0.5 + rx * Math.cos((i * Math.PI) / 8), 0.5 + ry * Math.sin((i * Math.PI) / 8)]);
const part = (frame: LayoutFramePart["frame"], fields: Omit<LayoutFramePart, "frame">): LayoutFramePart => ({ frame, ...fields });
const steelMade = { species: "steel", family: "metal" };
/** The garment with each part made of `material` (`LayoutFormPart.material`), as the game sends a part's material. */
const madeOf = (garment: LayoutGarment, material: { species: string; family: string }): LayoutGarment =>
  ({ ...garment, form_parts: garment.form_parts?.map((p) => ({ material, ...p })) });
const sides = <T>(make: (side: "left" | "right", u: number) => T[]): T[] => [...make("left", 1), ...make("right", -1)];

/** An open-faced helm: rim, dome and nose guard on the head frame. */
export const HELM: LayoutGarment = madeOf({
  name: "an open-faced steel helm", areas: ["head"], layer: 3, colour: steel,
  form_parts: [
    part("head", { shape: "lathe", center: [0, 0.02, 0.86], size: [1.14, 1.1, 0.5], profile: DOME }),
    part("head", { shape: "cylinder", center: [0, 0.02, 0.62], size: [1.2, 1.16, 0.05], colour: darkSteel }),
    part("head", { shape: "box", center: [0, -0.6, 0.52], size: [0.08, 0.05, 0.22] }),
  ],
}, steelMade);

/** A breastplate and backplate in one lofted shell over the torso, with a pauldron on each shoulder. */
export const CUIRASS: LayoutGarment = madeOf({
  name: "a steel cuirass with pauldrons", areas: ["torso"], layer: 3, colour: steel,
  form_parts: [
    // A lofted shell: narrow at the waist, full at the chest, drawn in to the neck at the top (open there and at the
    // waist), with an opening for each arm below the shoulders.
    part("torso", {
      shape: "loft", center: [0, 0, 0.55], size: [1.08, 1.2, 1.1], wall: [0.03, 0.03, 0.03], caps: "none", smooth: true,
      sections: [[0, 0.36, 0.4], [0.4, 0.44, 0.46], [0.65, 0.49, 0.49], [0.85, 0.5, 0.5], [1, 0.28, 0.4]].map(([z, rx, ry]) => ({ z, outline: ring(rx, ry) })),
      holes: [[2, 3, 15, 1], [2, 3, 7, 9]],
    }),
    ...sides((_side, u) => [part("torso", { shape: "lathe", center: [u * 0.5, 0, 0.93], size: [0.46, 1.06, 0.24], profile: DOME, colour: darkSteel })]),
  ],
}, steelMade);

/** Sleeves split at the elbow, with a cop over each elbow. */
export const SLEEVES: LayoutGarment = madeOf({
  name: "a pair of armoured sleeves", areas: ["arms"], layer: 2, colour: steel,
  form_parts: sides((side) => [
    part(`${side}_upper_arm`, { shape: "cylinder", center: [0, 0, 0.5], size: [1.3, 1.3, 1.0] }),
    part(`${side}_forearm`, { shape: "cone", center: [0, 0, 0.5], size: [1.25, 1.25, 1.0], basis: UPSIDE_DOWN, top: 0.85 }),
    part(`${side}_forearm`, { shape: "sphere", center: [0, 0.1, 1.0], size: [1.45, 1.45, 0.45], colour: darkSteel }),
  ]),
}, steelMade);

/** Leggings split at the knee, with a cop over each knee. */
export const LEGGINGS: LayoutGarment = madeOf({
  name: "a pair of armoured leggings", areas: ["legs"], layer: 2, colour: steel,
  form_parts: sides((side) => [
    part(`${side}_thigh`, { shape: "cylinder", center: [0, 0, 0.5], size: [1.25, 1.25, 1.0] }),
    part(`${side}_shin`, { shape: "cone", center: [0, 0, 0.5], size: [1.25, 1.25, 1.0], basis: UPSIDE_DOWN, top: 0.8 }),
    part(`${side}_shin`, { shape: "sphere", center: [0, -0.1, 1.0], size: [1.5, 1.5, 0.5], colour: darkSteel }),
  ]),
}, steelMade);

/** Tall boots: the foot and a shaft up the shin. */
export const BOOTS: LayoutGarment = madeOf({
  name: "a pair of tall boots", areas: ["feet"], layer: 4, colour: leather,
  form_parts: sides((side) => [
    part(`${side}_foot`, { shape: "box", center: [0, -0.02, 0.55], size: [1.12, 1.1, 1.15] }),
    part(`${side}_shin`, { shape: "cylinder", center: [0, 0, 0.18], size: [1.45, 1.45, 0.62] }),
  ]),
}, { species: "leather", family: "leather" });

/** A pack behind the torso: a body and two tanks. */
export const PACK: LayoutGarment = madeOf({
  name: "a canvas pack", areas: [], layer: 5, colour: canvas,
  form_parts: [
    part("torso", { shape: "box", center: [0, 0.82, 0.56], size: [0.7, 0.6, 0.62] }),
    ...sides((_side, u) => [part("torso", { shape: "capsule", center: [u * 0.2, 1.18, 0.6], size: [0.28, 0.5, 0.7], colour: darkSteel })]),
  ],
}, { species: "canvas", family: "cloth" });

/** A round shield with a boss, worn on the outside of the left forearm. Areas: none (the game sends a worn shield so). */
export const SHIELD: LayoutGarment = madeOf({
  name: "a round shield", areas: [], layer: 6, colour: oak,
  form_parts: [
    // The board lies across the forearm's outside (+u): its face's axis along u.
    part("left_forearm", { shape: "cylinder", center: [0.8, 0, 0.5], size: [5.6, 2.0, 0.35], basis: ACROSS }),
    part("left_forearm", { shape: "sphere", center: [1.05, 0, 0.5], size: [1.3, 0.45, 0.6], basis: ACROSS, colour: steel }),
  ],
}, { species: "oak", family: "wood" });

/** The whole suit, in the order the game would send it. */
export const ARMOUR: LayoutGarment[] = [SLEEVES, LEGGINGS, CUIRASS, HELM, BOOTS, PACK, SHIELD];

/** An arming sword lying along +x from its pommel, metres about its box's centre; the grip is the hand's. */
export const SWORD: LayoutHeld = {
  hand: "main", name: "a steel arming sword", id: "#159080", lifetime: "sword-1", size: [0.92, 0.18, 0.03],
  grip: { center: [-0.33, 0, 0], axis: [1, 0, 0] },
  form_parts: [
    // The blade to its point, one outline carried through its thickness, bevelled to an edge all round.
    {
      shape: "extrude", center: [0.095, 0, 0], size: [0.7, 0.045, 0.008], colour: steel, material: steelMade, role: "blade", label: "blade",
      outline: [[0, 0.1], [0.86, 0.08], [1, 0.5], [0.86, 0.92], [0, 0.9]], bevel: [0.012, 0.004],
    },
    { shape: "box", center: [-0.265, 0, 0], size: [0.025, 0.18, 0.02], colour: darkSteel, role: "crossguard", label: "crossguard" },
    { shape: "cylinder", center: [-0.33, 0, 0], size: [0.03, 0.03, 0.11], basis: ACROSS, colour: leather, role: "grip", label: "grip" },
    { shape: "sphere", center: [-0.405, 0, 0], size: [0.045, 0.045, 0.045], colour: darkSteel, role: "pommel", label: "pommel" },
  ],
};

/** A bow for the off hand: a swept limb curving back from its grip at the middle, and its string. */
export const BOW: LayoutHeld = {
  hand: "off", name: "a yew longbow", id: "#159099", lifetime: "bow-1", size: [1.2, 0.16, 0.04],
  grip: { center: [0, -0.064, 0], axis: [1, 0, 0] },
  form_parts: [
    {
      shape: "sweep", center: [0, 0, 0], size: [1.2, 0.16, 0.04], colour: { name: "yew", hex: "#b5763a" }, material: { species: "yew", family: "wood" },
      role: "bow", label: "bow", smooth: true, aspect: 1.5,
      path: [[0, 0.95, 0.5], [0.25, 0.35, 0.5], [0.5, 0.1, 0.5], [0.75, 0.35, 0.5], [1, 0.95, 0.5]], radius: [0.006, 0.011, 0.014, 0.011, 0.006],
    },
    { shape: "sweep", center: [0, 0.074, 0], size: [1.19, 0.004, 0.004], colour: { name: "linen", hex: "#d8ccb0" }, role: "string", label: "string", path: [[0, 0.5, 0.5], [1, 0.5, 0.5]], radius: [0.0015, 0.0015] },
  ],
};

/** A person in the armour (or `garments`) at `x`, in a posture, of a build and height. */
export function armouredPerson(id: string, x: number, opts: { posture?: "standing" | "sitting" | "reclining"; build?: string; height?: number; garments?: LayoutGarment[]; held?: LayoutHeld[]; y?: number; yaw?: number } = {}): LayoutThing {
  const height = opts.height ?? 1.75;
  const posture = opts.posture ?? "standing";
  const boxH = posture === "standing" ? height : posture === "sitting" ? height * 0.79 : height * 0.25;
  const [w, d] = posture === "reclining" ? [0.5, height] : [0.5, 0.5];
  const y = opts.y ?? 0;
  const yaw = opts.yaw ?? 0;
  return {
    id, name: id, kind: "player", fixed: false, mounted: false, lifetime: id,
    shapes: [{ box: [[x - w / 2, x + w / 2], [y - d / 2, y + d / 2], [0, boxH]] }],
    pose: { centre_m: [x, y, boxH / 2], dimensions_m: [w, d, boxH], body_quaternion: [Math.cos(yaw / 2), 0, 0, Math.sin(yaw / 2)], box: true, figure_height_m: height, posture },
    appearance: {
      posture, build: opts.build ?? "average", age_years: 30,
      skin: { name: "tan", hex: "#c69c72" }, eyes: { name: "brown", hex: "#5a3a22" },
      hair: { length_cm: 20, texture: "wavy", style: "loose", name: "black", hex: "#1c1c1c" },
      garments: [{ name: "a linen shirt", areas: ["torso", "arms", "waist", "legs"], layer: 1, colour: { name: "linen", hex: "#d8ccb0" } }, ...(opts.garments ?? ARMOUR)],
      held: opts.held ?? [SWORD, BOW],
    },
  };
}

/** A stand at `x` wearing the armour. */
export function armourStand(id: string, x: number, y = 0, garments: LayoutGarment[] = ARMOUR, held: LayoutHeld[] = []): LayoutThing {
  return {
    id, name: "armour stand", kind: "object", fixed: true, mounted: false, lifetime: id,
    shapes: [{ box: [[x - 0.3, x + 0.3], [y - 0.3, y + 0.3], [0, 1.8]] }],
    pose: { centre_m: [x, y, 0.9], dimensions_m: [0.6, 0.6, 1.8], body_quaternion: [1, 0, 0, 0], box: true },
    stand: { garments, held },
  };
}
