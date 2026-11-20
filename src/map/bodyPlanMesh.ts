import * as THREE from "three";
import type { AnimalPlan, HumanoidPlan } from "../avatar/bodyPlan";
import { INK_DARK, overlayHex } from "../avatar/colour";
import { type FigureParams, HORN_TONE } from "../avatar/figure";
import { ball, block, cone, limb, type Part, placed, trunk, wing } from "./figureMesh";

/**
 * 3D figures for body plans other than the human one (src/avatar/bodyPlan.ts): humanoid plans on a skeleton like
 * the human figure's with their own head, stance and colours; small animal figures fitted to the person's box; and a
 * plain placeholder for a plan the client does not know. Built in the figure's own frame, as `figureParts` is
 * (origin on the floor under the figure, facing +y, z up), and merged and turned by `figureGeometry`.
 */

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const named = (part: Part, name: string): Part => ({ ...part, name });

function transform(parts: Part[], matrix: THREE.Matrix4): Part[] {
  for (const part of parts) part.geometry.applyMatrix4(matrix);
  return parts;
}

/** The parts for `p.plan`, which is not the human plan. */
export function planParts(p: FigureParams): Part[] {
  const plan = p.plan;
  if (plan.kind === "humanoid") return humanoidParts(p, plan);
  if (plan.kind === "animal") return animalParts(p, plan);
  return placeholderParts(p);
}

/**
 * A plan the client does not know: a plain rounded pillar the height of the box and as wide as its footprint allows,
 * in the plain person colour. It claims no shape and no colour for the body.
 */
export function placeholderParts(p: FigureParams): Part[] {
  const H = p.height;
  const across = p.footprint ? Math.min(p.footprint.width, p.footprint.depth) : 0.36 * (H / 1.75);
  const r = Math.max(0.02, Math.min(across * 0.45, H / 4));
  return [named(limb(v(0, 0, r), v(0, 0, Math.max(r * 1.01, H - r)), r, p.colours.skin), "placeholder")];
}

/**
 * How far each facet of a crystal goes toward the lighter colour (`tone`), in turn: some well toward it, some a little,
 * some not at all, and some as far away from it (darker faces), so the cut reads as crystal and not as plain stone.
 */
export const FACET_SHADES = [0.8, 0.4, 0.1, -0.25, 0.6, -0.1, 0.25] as const;

/**
 * Flat facets for a crystal covering: each triangle its own, with a flat normal, shaded in turn by FACET_SHADES toward
 * or away from `tone`, so the body reads as cut crystal rather than smooth skin.
 */
function faceted(part: Part, tone: string): Part {
  const g = part.geometry.index ? part.geometry.toNonIndexed() : part.geometry;
  if (g !== part.geometry) part.geometry.dispose();
  const count = g.getAttribute("position").count;
  g.setIndex([...Array(count).keys()]);
  g.computeVertexNormals();
  const shade = new Float32Array(count);
  for (let k = 0; k < count / 3; k++) shade.fill(FACET_SHADES[(k * 3) % FACET_SHADES.length], k * 3, k * 3 + 3);
  return { ...part, geometry: g, shade, tone };
}

/** The shark's snout: the head ellipsoid's half widths across, front to back and up, in head radii. */
export const SNOUT = new THREE.Vector3(0.85, 1.35, 0.85);

/** A head in its own frame: centred on the origin, facing +y, `r` the head's half height, `neckR` the neck's radius. */
function headParts(p: FigureParams, plan: HumanoidPlan, r: number, neckR: number): Part[] {
  const c = p.colours;
  const skin = plan.headColour ?? c.skin;
  const eyes = c.eyes ?? INK_DARK;
  const out: Part[] = [];
  const pair = (make: (side: number) => Part) => [-1, 1].map(make);
  switch (plan.head) {
    case "wolf": {
      // A broad skull, a long muzzle in the lighter fur with a dark nose at its tip, tall pointed ears.
      out.push(named(ball(v(0, 0, 0), r, skin, v(0.92, 0.95, 0.9), 12), "skull"));
      out.push(named(ball(v(0, r * 0.95, -r * 0.28), r * 0.5, plan.accent, v(0.72, 1.55, 0.68), 10), "muzzle"));
      out.push(named(ball(v(0, r * 0.8, -r * 0.58), r * 0.36, plan.accent, v(0.66, 1.3, 0.45), 8), "jaw"));
      out.push(named(ball(v(0, r * 1.7, -r * 0.18), r * 0.15, INK_DARK, undefined, 8), "nose"));
      out.push(...pair((side) => named(cone(v(side * r * 0.5, -r * 0.1, r * 0.6), v(side * 0.32, -0.1, 1).normalize(), r * 0.28, r * 0.85, skin, 4), "ear")));
      out.push(...pair((side) => named(ball(v(side * r * 0.36, r * 0.74, r * 0.16), r * 0.11, eyes, undefined, 8), "eye")));
      break;
    }
    case "slack": {
      // A human head, slack: pale eyes set unevenly, the mouth hanging open.
      out.push(named(ball(v(0, 0, 0), r, skin, v(0.84, 0.95, 1), 12), "skull"));
      out.push(...pair((side) => named(ball(v(side * r * 0.32, r * 0.84, r * (side < 0 ? 0.14 : 0.06)), r * 0.11, eyes, undefined, 8), "eye")));
      out.push(...pair((side) => named(ball(v(side * r * 0.32, r * 0.93, r * (side < 0 ? 0.14 : 0.06)), r * 0.04, INK_DARK, undefined, 6), "pupil")));
      out.push(named(placed(new THREE.ConeGeometry(r * 0.13, r * 0.3, 6), skin, v(0, r * 0.98, -r * 0.08)), "nose"));
      out.push(named(ball(v(0, r * 0.84, -r * 0.48), r * 0.16, plan.accent, v(1.2, 0.5, 1), 8), "mouth"));
      out.push(...pair((side) => named(ball(v(side * r * 0.84, 0, 0), r * 0.22, skin, v(0.5, 1, 1.3), 8), "ear")));
      break;
    }
    case "ghoul": {
      // Pale and hairless with a heavy, jutting jaw and small deep-set eyes.
      out.push(named(ball(v(0, 0, r * 0.08), r, skin, v(0.8, 0.92, 1), 12), "skull"));
      out.push(named(ball(v(0, r * 0.32, -r * 0.55), r * 0.62, plan.accent, v(1.08, 0.95, 0.72), 10), "jaw"));
      out.push(named(block(v(0, r * 0.92, -r * 0.58), v(r * 0.7, r * 0.06, r * 0.07), INK_DARK), "mouth"));
      out.push(...pair((side) => named(ball(v(side * r * 0.3, r * 0.78, r * 0.18), r * 0.09, eyes, undefined, 8), "eye")));
      out.push(...pair((side) => named(cone(v(side * r * 0.74, 0, r * 0.1), v(side, -0.3, 0.5).normalize(), r * 0.16, r * 0.4, skin, 4), "ear")));
      break;
    }
    case "primate": {
      // Dark fur with a lighter bare face, a heavy brow ridge over the eyes, a low muzzle and round ears.
      out.push(named(ball(v(0, 0, 0), r, skin, v(0.95, 0.9, 0.95), 12), "skull"));
      out.push(named(ball(v(0, r * 0.42, -r * 0.08), r * 0.7, plan.accent, v(0.85, 0.75, 0.95), 10), "face"));
      out.push(named(limb(v(-r * 0.46, r * 0.82, r * 0.26), v(r * 0.46, r * 0.82, r * 0.26), r * 0.14, skin, false), "brow"));
      out.push(named(ball(v(0, r * 0.86, -r * 0.36), r * 0.38, plan.accent, v(1.1, 0.8, 0.75), 8), "muzzle"));
      out.push(...pair((side) => named(ball(v(side * r * 0.12, r * 1.15, -r * 0.3), r * 0.05, INK_DARK, undefined, 6), "nostril")));
      out.push(...pair((side) => named(ball(v(side * r * 0.3, r * 0.92, r * 0.1), r * 0.09, eyes, undefined, 8), "eye")));
      out.push(...pair((side) => named(ball(v(side * r * 0.95, 0, 0), r * 0.26, plan.accent, v(0.5, 1, 1.1), 8), "ear")));
      break;
    }
    case "crystal": {
      // A faceted stone head with darker facets for eyes and a crystal spur over the crown.
      out.push(named(placed(new THREE.IcosahedronGeometry(r, 0), skin, v(0, 0, 0), undefined, v(0.86, 0.95, 1.05)), "skull"));
      out.push(...pair((side) => named(placed(new THREE.OctahedronGeometry(r * 0.12, 0), eyes, v(side * r * 0.32, r * 0.82, r * 0.12)), "eye")));
      out.push(named(cone(v(r * 0.15, -r * 0.2, r * 0.75), v(0.25, -0.35, 1).normalize(), r * 0.2, r * 0.7, plan.accent, 4), "spur"));
      break;
    }
    case "shark": {
      // A grey shark's head: a long snout over a white underside, a dark mouth curving round the front of the
      // underside, black eyes standing out of the snout's sides (seen face-on, as a shark's are), nostrils at the tip,
      // a dorsal fin on the crown, and the head narrowing down to the person's neck with gill slits on each side.
      out.push(named(ball(v(0, r * 0.25, 0), r, skin, SNOUT, 12), "snout"));
      out.push(named(ball(v(0, r * 0.32, -r * 0.3), r, plan.accent, v(0.78, 1.25, 0.58), 10), "underside"));
      // The mouth: an arc lying on the underside's surface 0.36 head radii below the middle, round the front.
      const arc = 1.9;
      const mouth = new THREE.TorusGeometry(1, 0.06, 3, 16, arc);
      mouth.rotateZ(Math.PI / 2 - arc / 2);
      mouth.scale(r * 0.8, r * 1.27, r);
      mouth.translate(0, r * 0.32, -r * 0.36);
      out.push(named({ geometry: mouth, colour: INK_DARK }, "mouth"));
      for (const side of [-1, 1]) {
        // On the snout's surface 48 degrees round from straight ahead, a little above the middle, and standing out.
        const theta = (48 * Math.PI) / 180;
        out.push(named(ball(v(side * r * SNOUT.x * Math.sin(theta), r * 0.25 + r * SNOUT.y * Math.cos(theta), r * 0.08), r * 0.12, eyes, undefined, 8), "eye"));
        out.push(named(ball(v(side * r * 0.17, r * 1.54, -r * 0.1), r * 0.045, INK_DARK, undefined, 6), "nostril"));
        for (let i = 0; i < 3; i++) out.push(named(block(v(side * r * 0.5, -r * (0.05 + i * 0.14), -r * 0.82), v(r * 0.05, r * 0.035, r * 0.3), overlayHex(skin, INK_DARK, 0.55)), "gill"));
      }
      // The taper: from the person's neck out to the head's underside, a shark's body narrowing into its head.
      const taperTop = -r * 0.45;
      const taperBottom = -r * 1.2;
      const taper = new THREE.CylinderGeometry(r * 0.6, neckR * 1.05, taperTop - taperBottom, 12, 1);
      taper.rotateX(Math.PI / 2);
      taper.translate(0, r * 0.05, (taperTop + taperBottom) / 2);
      out.push(named({ geometry: taper, colour: skin }, "taper"));
      const fin = new THREE.ConeGeometry(r * 0.42, r * 0.95, 4);
      fin.scale(0.22, 1, 1);
      fin.rotateX(Math.PI / 2 - 0.45);
      out.push(named(placed(fin, skin, v(0, -r * 0.2, r * 0.95)), "fin"));
      break;
    }
  }
  if (p.headCovered) {
    // A hood or hat: the head garment's colour over the top and back of the head.
    const hood = new THREE.SphereGeometry(r * 1.08, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2);
    hood.rotateX(-0.5);
    out.push(named({ geometry: hood, colour: c.head }, "hood"));
  }
  return out;
}

/** A digitigrade knee: forward by this share of the height, up by this share of the hip's height. */
export const KNEE = new THREE.Vector3(0, 0.04, 0.62);
/** A digitigrade heel (hock): back by this share of the height and up by this share. */
export const HOCK = new THREE.Vector3(0, -0.05, 0.14);

/** A humanoid plan: the human skeleton with this plan's stance, proportions, head and colours. */
function humanoidParts(p: FigureParams, plan: HumanoidPlan): Part[] {
  const c = p.colours;
  const H = p.height;
  const s = H / 1.75;
  const crystal = plan.covering === "crystal";
  const sitting = p.posture === "sitting";
  const legTop = H * p.legShare;
  const seat = 0.26 * H;
  const drop = sitting ? legTop - seat : 0;
  const hipZ = legTop - drop;
  const headR = p.headHeight / 2;
  const legR = p.limbRadius * 1.15;
  const hipX = p.hipHalf * 0.55;
  const ankleZ = 0.06 * s;
  const out: Part[] = [];

  // Legs and feet.
  for (const side of [-1, 1]) {
    const x = side * hipX;
    if (sitting) {
      const knee = v(x, 0.24 * H, seat);
      out.push(limb(v(x, 0, hipZ), knee, legR, c.legs, !crystal));
      out.push(limb(knee, v(x, 0.24 * H, ankleZ + legR), legR * 0.9, c.legs, !crystal));
      out.push(block(v(x, 0.24 * H + 0.04 * s, ankleZ / 2), v(legR * 2.2, 0.16 * s, ankleZ), c.feet));
    } else if (plan.digitigrade) {
      // Standing on the toes, as a dog's hind leg stands: a short thigh a little forward to a high knee, a long shin
      // back to a raised heel well off the floor, and the foot near upright down to a paw. Every bend is shallow, so
      // the leg reads as standing; deep bends with the knee low read as a squat.
      const knee = KNEE.clone().multiply(v(1, H, hipZ)).setX(x);
      const hock = HOCK.clone().multiplyScalar(H).setX(x);
      out.push(named(limb(v(x, 0, hipZ), knee, legR * 1.15, c.legs, !crystal), "thigh"));
      out.push(named(limb(knee, hock, legR * 0.85, c.legs, !crystal), "shin"));
      out.push(named(limb(hock, v(x, 0.03 * H, ankleZ), legR * 0.65, c.feet, !crystal), "heel"));
      out.push(named(ball(v(x, 0.06 * H, ankleZ * 0.6), legR * 1.05, c.feet, v(1, 1.7, 0.6), 8), "paw"));
    } else {
      out.push(limb(v(x, 0, ankleZ + legR), v(x, 0, hipZ - legR * 0.5), legR, c.legs, !crystal));
      out.push(block(v(x, 0.04 * s, ankleZ / 2), v(legR * 2.2, 0.16 * s, ankleZ), c.feet));
    }
  }

  // The upper body, built upright from the hips and then leaned forward by the hunch. Its length is chosen so the
  // crown, leaned, still comes to the box's top.
  const lean = new THREE.Matrix4().makeRotationX(-plan.hunch);
  const toBody = new THREE.Matrix4().makeTranslation(0, 0, hipZ).multiply(lean);
  const upright = (H - drop - hipZ) / Math.cos(plan.hunch);
  const neckLen = 0.045 * H;
  const neckBase = upright - p.headHeight - neckLen;
  const waistZ = 0.05 * H;
  const shoulderZ = neckBase - p.limbRadius * 1.2;
  const neckR = 0.045 * s * plan.shape.limbs * (plan.neckScale ?? 1);
  // Crystal is cut: six-sided hips, torso and neck, so the facets are broad and sharp.
  const sides = crystal ? 6 : undefined;
  const body: Part[] = [
    trunk(-0.07 * H, waistZ, p.hipHalf, p.waistHalf, 0.62, c.hips, 0, sides),
    trunk(waistZ, neckBase, p.waistHalf, p.shoulderHalf * 0.92, 0.55, c.torso, 0, sides),
    limb(v(-p.shoulderHalf * 0.9, 0, shoulderZ), v(p.shoulderHalf * 0.9, 0, shoulderZ), p.limbRadius * 1.35, c.torso, !crystal),
    // Up into the head, as the human figure's neck goes to 0.6 head radii below the head's middle.
    trunk(neckBase - 0.01, upright - headR * 1.6, neckR, neckR, 1, c.neck, 0, sides),
  ];
  if (plan.chest && c.torso === c.skin) {
    // A bare chest: the front of a large flat ellipsoid set inside the torso, so only a shield of it shows, from the
    // breastbone down toward the belly. (A small ball standing out of the fur read as a stain.)
    // Wide across the chest and tapering down: two shields, the upper broad under the shoulders, the lower narrower.
    const span = neckBase - waistZ;
    body.push(named(ball(v(0, p.shoulderHalf * 0.1, waistZ + span * 0.7), 1, plan.accent, v(p.shoulderHalf * 0.72, p.shoulderHalf * 0.42, span * 0.24), 12), "chest"));
    body.push(named(ball(v(0, p.waistHalf * 0.12, waistZ + span * 0.35), 1, plan.accent, v(p.waistHalf * 0.6, p.waistHalf * 0.45, span * 0.3), 12), "chest"));
  }
  if (crystal) {
    // Crystal points growing from the shoulders and the upper back, in the lighter colour.
    for (const [x, y, dx, dy, k] of [[-0.75, -0.1, -0.5, -0.3, 1], [0.7, -0.15, 0.45, -0.4, 0.8], [0.25, -0.45, 0.2, -0.8, 0.9], [-0.3, -0.4, -0.3, -0.7, 0.7]]) {
      body.push(named(cone(v(x * p.shoulderHalf, y * p.shoulderHalf, shoulderZ + p.limbRadius * 0.4), v(dx, dy, 1).normalize(), 0.035 * s * k, 0.16 * s * k, plan.accent, 4), "shard"));
    }
  }
  out.push(...transform(body, toBody));

  // The head, set back upright (so the face looks ahead, not at the floor), then drooped as the plan says.
  const headCentre = v(0, 0, upright - headR).applyMatrix4(toBody);
  const headTurn = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(-plan.droop, plan.droop * 0.6, 0));
  out.push(...transform(headParts(p, plan, headR, neckR), new THREE.Matrix4().makeTranslation(headCentre.x, headCentre.y, headCentre.z).multiply(headTurn)));

  // Arms: from the leaned shoulders down to the plan's wrist height, reaching forward by its angle.
  const wristZ = sitting ? hipZ + 0.02 * H : Math.max(0.05 * H, plan.wristShare * H);
  for (const side of [-1, 1]) {
    const shoulder = v(side * p.shoulderHalf, 0, shoulderZ).applyMatrix4(toBody);
    const fall = Math.max(0.12 * H, shoulder.z - wristZ);
    const wrist = v(side * (p.hipHalf + p.limbRadius * 1.6), shoulder.y + Math.tan(plan.reach) * fall + (sitting ? 0.08 * s : 0), shoulder.z - fall);
    out.push(named(limb(shoulder, wrist, p.limbRadius, c.arms, !crystal), "arm"));
    const along = wrist.clone().sub(shoulder).normalize();
    out.push(named(ball(wrist.clone().addScaledVector(along, p.limbRadius * 1.3), p.limbRadius * 1.25, c.hands, undefined, 8), "hand"));
  }

  // Parts from the plan and from the traits sent.
  const accent = c.skin;
  const crown = headCentre.z + headR * 0.8;
  for (const extra of p.extras) {
    if (extra === "tail") {
      // A bushy tail in fur, a thin one otherwise, hanging from the base of the spine.
      const root = v(0, -p.hipHalf * 0.6, hipZ);
      const tip = v(0, root.y - 0.3 * s, sitting ? 0.04 : hipZ - 0.16 * H);
      out.push(named(limb(root, tip, p.limbRadius * (plan.covering === "fur" ? 0.85 : 0.6), accent, false), "tail"));
    } else if (extra === "horns" || extra === "antlers") {
      for (const side of [-1, 1]) {
        const base = v(headCentre.x + side * headR * 0.45, headCentre.y, crown);
        if (extra === "horns") out.push(named(cone(base, v(side * 0.35, 0.2, 1).normalize(), headR * 0.16, headR * 0.7, HORN_TONE, 6), "horn"));
        else out.push(named(limb(base, base.clone().add(v(side * headR, -headR * 0.2, headR * 1.4)), headR * 0.07, HORN_TONE, false), "antler"));
      }
    } else if (extra === "wings") {
      for (const side of [-1, 1]) out.push(named(wing(side, s, v(side * p.shoulderHalf * 0.45, -0.1 * s, shoulderZ - 0.04 * H).applyMatrix4(toBody), accent), "wing"));
    }
  }
  return crystal ? out.map((part) => faceted(part, plan.accent)) : out;
}

/**
 * An animal fitted into its box: built at its natural proportions, then scaled evenly to fit width, depth and height;
 * the song bird to width and height only, its beak-to-tail length running past a shallow box.
 * A snake is built to its box and its length, never scaled: shrunk to a thin box it was a speck in the room.
 */
function animalParts(p: FigureParams, plan: AnimalPlan): Part[] {
  const H = p.height;
  const snake = plan.animal === "snake";
  const parts = snake
    ? snakeParts(plan, p.footprint?.width ?? H * 2, p.footprint?.depth ?? H * 8, H)
    : plan.animal === "duck"
      ? duckParts(plan)
      : songbirdParts(plan);
  // Its real extent, measured, and centred over the box's middle on the floor.
  const box = new THREE.Box3();
  for (const part of parts) {
    part.geometry.computeBoundingBox();
    if (part.geometry.boundingBox) box.union(part.geometry.boundingBox);
  }
  const extent = box.getSize(new THREE.Vector3());
  const middle = box.getCenter(new THREE.Vector3());
  const width = p.footprint?.width ?? H * (extent.x / extent.z);
  const depth = p.footprint?.depth ?? H * (extent.y / extent.z);
  // The song bird stands its box's height, narrowed only to the box's width: its beak-to-tail length is its own and
  // runs past a box shallower than that. Fitted to the depth of the box the game sends (0.08 x 0.06 x 0.12 m), it was
  // drawn 5 cm tall (the second live check of 2026-11-20 saw a speck).
  const k = snake ? 1 : plan.animal === "songbird" ? Math.min(width / extent.x, H / extent.z) : Math.min(width / extent.x, depth / extent.y, H / extent.z);
  return transform(parts, new THREE.Matrix4().makeScale(k, k, k).multiply(new THREE.Matrix4().makeTranslation(-middle.x, -middle.y, -box.min.z)));
}

/** A mallard drake about a metre long: grey-brown body, chestnut breast, green head over a white ring, yellow bill. */
function duckParts(plan: AnimalPlan): Part[] {
  const tail = overlayHex(plan.skin, INK_DARK, 0.65);
  const parts: Part[] = [
    named(ball(v(0, -0.02, 0.32), 0.2, plan.skin, v(1.1, 2.05, 0.95), 12), "body"),
    named(ball(v(0, 0.24, 0.3), 0.17, plan.accent, v(1.05, 1, 1.05), 10), "breast"),
    // Folded wings along the upper sides of the body.
    ...[-1, 1].map((side) => named(ball(v(side * 0.16, -0.08, 0.38), 0.13, plan.wing, v(0.55, 2.1, 0.75), 10), "wing")),
    named(cone(v(0, -0.38, 0.37), v(0, -1, 0.4).normalize(), 0.09, 0.17, tail, 5), "tail"),
    named(limb(v(0, 0.3, 0.42), v(0, 0.36, 0.6), 0.065, plan.head, false), "neck"),
    named(placed(new THREE.TorusGeometry(0.068, 0.014, 3, 10), "#f2f0ea", v(0, 0.31, 0.45)), "ring"),
    named(ball(v(0, 0.38, 0.65), 0.1, plan.head, v(0.9, 1.15, 0.95), 10), "head"),
    named(ball(v(0, 0.53, 0.61), 0.06, plan.beak, v(0.9, 1.6, 0.38), 8), "bill"),
    ...[-1, 1].map((side) => named(ball(v(side * 0.072, 0.42, 0.68), 0.013, plan.eyes, undefined, 6), "eye")),
  ];
  for (const side of [-1, 1]) {
    parts.push(named(limb(v(side * 0.07, 0.02, 0.15), v(side * 0.07, 0.04, 0.02), 0.018, plan.feet, false), "leg"));
    parts.push(named(block(v(side * 0.07, 0.08, 0.008), v(0.08, 0.1, 0.016), plan.feet), "foot"));
  }
  return parts;
}

/**
 * A small perching bird: a plump body, a breast in its accent standing out in front, a small round head with a pointed
 * beak and an eye each side, folded wings reaching back toward a raised tail, and short legs.
 */
function songbirdParts(plan: AnimalPlan): Part[] {
  const parts: Part[] = [
    named(ball(v(0, 0, 0.33), 0.2, plan.skin, v(0.9, 1.35, 1), 12), "body"),
    named(ball(v(0, 0.17, 0.31), 0.15, plan.accent, v(0.9, 0.95, 1), 10), "breast"),
    named(ball(v(0, 0.2, 0.57), 0.12, plan.head, undefined, 10), "head"),
    named(cone(v(0, 0.29, 0.57), v(0, 1, -0.15).normalize(), 0.045, 0.13, plan.beak, 5), "beak"),
    named(block(v(0, -0.4, 0.41), v(0.16, 0.26, 0.025), plan.wing, new THREE.Euler(-0.5, 0, 0)), "tail"),
    ...[-1, 1].map((side) => named(ball(v(side * 0.085, 0.28, 0.61), 0.02, plan.eyes, undefined, 6), "eye")),
    ...[-1, 1].map((side) => named(ball(v(side * 0.15, -0.1, 0.39), 0.12, plan.wing, v(0.35, 2, 0.75), 8), "wing")),
  ];
  for (const side of [-1, 1]) {
    parts.push(named(limb(v(side * 0.05, 0.03, 0.16), v(side * 0.05, 0.05, 0.02), 0.012, plan.feet, false), "leg"));
    parts.push(named(block(v(side * 0.05, 0.08, 0.006), v(0.03, 0.08, 0.012), plan.feet), "foot"));
  }
  return parts;
}

/**
 * The thinnest a snake's body is drawn, metres of radius. At 6 cm across a snake shows as a body, not a line, in the
 * Dollhouse's whole-room view of a 10 m room (about 3 px of body; the live check of 2026-11-20 saw a speck).
 */
export const SNAKE_MIN_RADIUS = 0.03;
/** The shortest a snake is drawn, metres, however small its box. */
export const SNAKE_MIN_LENGTH = 0.6;
/** A snake's body radius as a share of its length (a slender snake's), before SNAKE_MIN_RADIUS. */
const SNAKE_GIRTH = 0.022;

/**
 * A snake on the floor, banded in its two colours, its head raised on its neck with eyes and a forked tongue, facing
 * +y. Its length is the box's longest side, whichever way the game puts it (the game's box for a snake can stand on
 * end: 0.16 x 0.16 m and 3.08 m tall on 2026-11-20); its body is as thick as a slender snake of that length and never
 * thinner than SNAKE_MIN_RADIUS. In a box at least 0.8 of its length front to back it lies in an S along the box;
 * otherwise it lies coiled in a flat spiral round the box's middle, its neck rising from the centre. Its head rises
 * between 10% and 15% of its length, above the top of a box too low for that (a raised head is what reads as a snake).
 */
function snakeParts(plan: AnimalPlan, width: number, depth: number, height: number): Part[] {
  const L = Math.max(SNAKE_MIN_LENGTH, width, depth, height);
  const r0 = Math.max(SNAKE_MIN_RADIUS, L * SNAKE_GIRTH);
  const headR = r0 * 1.3;
  const lift = Math.max(L * 0.1, Math.min(L * 0.15, height - 2 * r0 - headR));
  // The body's centre line, tail tip first, ending where the neck begins.
  const body: THREE.Vector3[] = [];
  if (depth >= L * 0.8) {
    const along = depth * 0.85;
    // Within the box's width where it allows an S at all (the capsules' bends stand a little proud of the radius).
    const amp = Math.max(r0 * 1.5, Math.min(width / 2 - r0 * 1.2, L * 0.12));
    for (let i = 0; i <= 14; i++) body.push(v(amp * Math.sin((i / 14) * Math.PI * 2.5), -along / 2 + (i / 14) * along * 0.9, r0));
  } else {
    // An Archimedean spiral, coils 2.3 radii apart, from the outside (the tail) in to a gap at the middle for the neck.
    const spacing = r0 * 2.3;
    const inner = r0 * 2.2;
    const outer = Math.sqrt((L * 0.85 * spacing) / Math.PI + inner * inner);
    const turns = (outer - inner) / spacing;
    const N = Math.max(16, Math.min(40, Math.round(turns * 14)));
    for (let i = 0; i <= N; i++) {
      const theta = turns * Math.PI * 2 * (1 - i / N);
      const rho = inner + (spacing * theta) / (Math.PI * 2);
      body.push(v(rho * Math.sin(theta), rho * Math.cos(theta), r0));
    }
  }
  // The neck: from the body's end, forward (+y) and up to the raised head, a quarter curve.
  const base = body[body.length - 1];
  const ahead = v(0, 1, 0);
  const rise = (t: number) => base.clone().addScaledVector(ahead, L * 0.06 * Math.sin((t * Math.PI) / 2)).setZ(r0 + lift * (1 - Math.cos((t * Math.PI) / 2)));
  const neck = [1, 2, 3, 4].map((i) => rise(i / 4));
  const line = [...body, ...neck];
  const parts: Part[] = [];
  for (let i = 0; i < line.length - 1; i++) {
    const t = (i + 0.5) / (line.length - 1);
    const inNeck = i >= body.length - 1;
    // Thin at the tail, full from a third of the way along, a little thinner up the neck.
    const radius = r0 * (0.3 + 0.7 * Math.min(1, t / 0.3)) * (inNeck ? 0.85 : 1);
    parts.push(named(limb(line[i], line[i + 1], radius, !inNeck && Math.floor(i / 2) % 2 ? plan.accent : plan.skin, false), "segment"));
  }
  const head = line[line.length - 1].clone().addScaledVector(ahead, headR * 0.9);
  const turn = new THREE.Euler(0, 0, 0);
  parts.push(named(placed(new THREE.SphereGeometry(headR, 10, 8), plan.head, head, turn, v(1, 1.5, 0.7)), "head"));
  for (const side of [-1, 1]) {
    const eye = v(side * headR * 0.75, headR * 0.45, headR * 0.3).applyEuler(turn).add(head);
    parts.push(named(ball(eye, headR * 0.2, plan.eyes, undefined, 6), "eye"));
  }
  const mouth = head.clone().addScaledVector(ahead, headR * 1.45);
  parts.push(named(limb(mouth, mouth.clone().addScaledVector(ahead, headR * 1.1), headR * 0.08, plan.beak, false), "tongue"));
  return parts;
}
