import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { overlayHex } from "../avatar/colour";
import { type FigureParams, type HairTexture, type Seam, STUBBLE_OPACITY } from "../avatar/figure";

/**
 * A person's 3D figure from `figureParams`: three.js primitives, each painted
 * one colour through a vertex colour, merged into one geometry so a person is
 * one mesh and one draw call. Built in the figure's own frame (origin on the
 * floor under the figure, facing +y, z up) and then turned to `facing` and
 * moved to where the person is. Imported only by roomScene.ts, inside the lazy
 * 3D chunk.
 */

export interface Part {
  geometry: THREE.BufferGeometry;
  colour: string;
  /** What the part is, for parts that tests look at by name (cap, brow, mouth, beard, strap, …). */
  name?: string;
}

const named = (part: Part, name: string): Part => ({ ...part, name });

const RADIAL = 10;
/** How far the hair or head-covering cap leans back from upright, radians. */
const CAP_LEAN = 0.5;

function placed(geometry: THREE.BufferGeometry, colour: string, at: THREE.Vector3, rotation?: THREE.Euler, scale?: THREE.Vector3): Part {
  const m = new THREE.Matrix4().compose(at, new THREE.Quaternion().setFromEuler(rotation ?? new THREE.Euler()), scale ?? new THREE.Vector3(1, 1, 1));
  geometry.applyMatrix4(m);
  return { geometry, colour };
}

/**
 * Raises the surface of a hair part outward from `centre(vertex)`, never inward, so the
 * texture shows: wavy hair in ripples across its fall, curly in bumps, coily in small
 * tight bumps. Straight hair is left smooth. Positions are in metres, `headR` sets the scale.
 */
function textured(
  g: THREE.BufferGeometry,
  centre: (q: THREE.Vector3) => THREE.Vector3,
  texture: HairTexture,
  headR: number,
  /** Waves per head radius along the hair's fall relative to the cap's: fewer on long falls, which have fewer facets. */
  along = 1,
  /**
   * For a thin band along the cap's edge: its axis. The texture is read where each vertex
   * meets the band's middle line, so the band's two edges rise together and do not twist.
   */
  band?: THREE.Vector3,
): void {
  if (texture === "straight") return;
  const positions = g.getAttribute("position");
  const q = new THREE.Vector3();
  const d = new THREE.Vector3();
  const at = new THREE.Vector3();
  let middle = 0;
  if (band) {
    for (let i = 0; i < positions.count; i++) middle += q.fromBufferAttribute(positions, i).sub(centre(q)).dot(band);
    middle /= positions.count;
  }
  for (let i = 0; i < positions.count; i++) {
    q.fromBufferAttribute(positions, i);
    d.subVectors(q, centre(q));
    at.copy(q);
    if (band) at.addScaledVector(band, middle - d.dot(band));
    const around = Math.atan2(at.y - centre(q).y, at.x - centre(q).x);
    const down = (at.z / headR) * along;
    // How far out, as a share of the head radius, at the peaks.
    const [rise, f] =
      texture === "wavy"
        ? [0.05, Math.sin(down * 7)]
        : texture === "curly"
          ? [0.07, Math.sin(around * 7) * Math.sin(down * 9)]
          : [0.08, Math.sin(around * 11) * Math.sin(down * 14)];
    const lift = (headR * rise * (0.5 + 0.5 * f)) / Math.max(1e-6, d.length());
    q.addScaledVector(d, lift);
    positions.setXYZ(i, q.x, q.y, q.z);
  }
  positions.needsUpdate = true;
  g.computeVertexNormals();
}

/** The geometry and its back faces, so an open surface (hair falling behind the neck) is seen from inside too. */
function twoSided(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const back = g.clone();
  const index = back.getIndex();
  if (index) {
    const a = index.array;
    const flipped = new Uint32Array(a.length);
    for (let i = 0; i < a.length; i += 3) {
      flipped[i] = a[i];
      flipped[i + 1] = a[i + 2];
      flipped[i + 2] = a[i + 1];
    }
    back.setIndex(new THREE.BufferAttribute(flipped, 1));
  }
  const normals = back.getAttribute("normal");
  for (let i = 0; i < normals.count; i++) normals.setXYZ(i, -normals.getX(i), -normals.getY(i), -normals.getZ(i));
  const both = mergeGeometries([g, back], false);
  g.dispose();
  back.dispose();
  if (!both) throw new Error("hair could not be made two-sided");
  return both;
}

/** A thin stroke on the face (brow, mouth, moustache): a capsule with few facets, since it is a few pixels wide. */
const stroke = (a: THREE.Vector3, b: THREE.Vector3, radius: number, colour: string): Part => limb(a, b, radius, colour, false);

/** A capsule between two points. */
function limb(a: THREE.Vector3, b: THREE.Vector3, radius: number, colour: string, fine = true): Part {
  const length = a.distanceTo(b);
  const geometry = new THREE.CapsuleGeometry(radius, Math.max(0.001, length), fine ? 3 : 1, fine ? RADIAL : 6);
  // Capsules stand along y; turn y onto the segment.
  const direction = new THREE.Vector3().subVectors(b, a).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  geometry.applyMatrix4(new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1)));
  return { geometry, colour };
}

/** An upright cylinder (along z) from z0 to z1, its depth (y) squashed by `depth`. */
function trunk(z0: number, z1: number, rBottom: number, rTop: number, depth: number, colour: string, y = 0): Part {
  const geometry = new THREE.CylinderGeometry(rTop, rBottom, Math.max(0.001, z1 - z0), RADIAL * 2);
  return placed(geometry, colour, new THREE.Vector3(0, y, (z0 + z1) / 2), new THREE.Euler(Math.PI / 2, 0, 0), new THREE.Vector3(1, 1, depth));
}

function ball(at: THREE.Vector3, radius: number, colour: string, scale?: THREE.Vector3, segments = RADIAL): Part {
  return placed(new THREE.SphereGeometry(radius, segments, Math.max(4, segments - 2)), colour, at, undefined, scale);
}

function block(at: THREE.Vector3, size: THREE.Vector3, colour: string, rotation?: THREE.Euler): Part {
  return placed(new THREE.BoxGeometry(size.x, size.y, size.z), colour, at, rotation);
}

/** A thin band (an outline) around something upright at height z. */
function band(x: number, y: number, z: number, radius: number, depth: number, colour: string): Part {
  const geometry = new THREE.CylinderGeometry(radius, radius, 0.014, RADIAL * 2, 1, true);
  return placed(geometry, colour, new THREE.Vector3(x, y, z), new THREE.Euler(Math.PI / 2, 0, 0), new THREE.Vector3(1, 1, depth));
}

/** The figure's parts, standing or sitting, in its own frame. */
export function figureParts(p: FigureParams): Part[] {
  const c = p.colours;
  const H = p.height;
  const s = H / 1.75;
  const out: Part[] = [];
  const sitting = p.posture === "sitting";
  const legTop = H * p.legShare;
  const seat = 0.26 * H;
  // Everything above the hips drops by this much when seated.
  const drop = sitting ? legTop - seat : 0;
  const hipZ = legTop - drop;
  const neckBase = H - p.headHeight - 0.045 * H - drop;
  const headCentreZ = H - p.headHeight / 2 - drop;
  const headR = p.headHeight / 2;
  const legR = p.limbRadius * 1.15;
  const hipX = p.hipHalf * 0.55;
  const ankleZ = 0.06 * s;
  const outlined = new Set<Seam>(p.outlined);

  // Legs and feet.
  for (const side of [-1, 1]) {
    const x = side * hipX;
    if (sitting) {
      const knee = new THREE.Vector3(x, 0.24 * H, seat);
      out.push(limb(new THREE.Vector3(x, 0, hipZ), knee, legR, c.legs));
      out.push(limb(knee, new THREE.Vector3(x, 0.24 * H, ankleZ + legR), legR * 0.9, c.legs));
      out.push(block(new THREE.Vector3(x, 0.24 * H + 0.04 * s, ankleZ / 2), new THREE.Vector3(legR * 2.2, 0.16 * s, ankleZ), c.feet));
      if (outlined.has("ankles")) out.push(band(x, 0.24 * H, ankleZ + 0.02 * s, legR * 1.05, 1, c.ink));
    } else {
      out.push(limb(new THREE.Vector3(x, 0, ankleZ + legR), new THREE.Vector3(x, 0, hipZ - legR * 0.5), legR, c.legs));
      out.push(block(new THREE.Vector3(x, 0.04 * s, ankleZ / 2), new THREE.Vector3(legR * 2.2, 0.16 * s, ankleZ), c.feet));
      if (outlined.has("ankles")) out.push(band(x, 0, ankleZ + 0.02 * s, legR * 1.05, 1, c.ink));
    }
    if (outlined.has("hips")) out.push(band(x, sitting ? 0.06 * s : 0, hipZ - 0.07 * H, legR * 1.08, 1, c.ink));
  }

  // Hips, torso, shoulders.
  const waistZ = hipZ + 0.05 * H;
  out.push(trunk(hipZ - 0.07 * H, waistZ, p.hipHalf, p.waistHalf, 0.62, c.hips));
  out.push(trunk(waistZ, neckBase, p.waistHalf, p.shoulderHalf * 0.92, 0.55, c.torso));
  const shoulderZ = neckBase - p.limbRadius * 1.2;
  out.push(limb(new THREE.Vector3(-p.shoulderHalf * 0.9, 0, shoulderZ), new THREE.Vector3(p.shoulderHalf * 0.9, 0, shoulderZ), p.limbRadius * 1.35, c.torso));
  if (outlined.has("waist")) out.push(band(0, 0, waistZ, p.waistHalf * 1.03, 0.62, c.ink));

  // Arms and hands, hanging a little away from the body.
  const wristZ = hipZ - 0.02 * H;
  for (const side of [-1, 1]) {
    const shoulder = new THREE.Vector3(side * p.shoulderHalf, 0, shoulderZ);
    const wrist = new THREE.Vector3(side * (p.hipHalf + p.limbRadius * 1.6), sitting ? 0.08 * s : 0, wristZ);
    out.push(limb(shoulder, wrist, p.limbRadius, c.arms));
    out.push(ball(new THREE.Vector3(wrist.x, wrist.y, wrist.z - p.limbRadius * 1.3), p.limbRadius * 1.25, c.hands));
    if (outlined.has("wrists")) out.push(band(wrist.x, wrist.y, wrist.z, p.limbRadius * 1.1, 1, c.ink));
  }

  // Neck and head.
  const neckR = 0.045 * s;
  out.push(trunk(neckBase - 0.01, headCentreZ - headR * 0.6, neckR, neckR, 1, c.neck));
  if (outlined.has("neck")) out.push(band(0, 0, neckBase, neckR * 1.25, 1, c.ink));
  const headScale = new THREE.Vector3(0.84, 0.95, 1);
  out.push(ball(new THREE.Vector3(0, 0, headCentreZ), headR, c.skin, headScale, 14));
  // Nose: which way the person faces.
  out.push(placed(new THREE.ConeGeometry(headR * 0.13, headR * 0.3, 6), c.skin, new THREE.Vector3(0, headR * 0.98, headCentreZ - headR * 0.08), new THREE.Euler(0, 0, 0)));

  // The face's surface: how far forward (y) the head ellipsoid is at a point (x, z) on it, z from the head's centre.
  const faceY = (x: number, z: number) =>
    headR * headScale.y * Math.sqrt(Math.max(0, 1 - (x / (headR * headScale.x)) ** 2 - (z / (headR * headScale.z)) ** 2));
  // A face only for a described person; the plain figure of someone without appearance stays plain.
  if (p.described && !p.faceHidden) {
    const eyeR = headR * 0.1;
    for (const side of [-1, 1]) {
      const ex = side * headR * 0.32;
      const ez = headR * 0.12;
      // Seated in the head: the eye stands out of the face by less than half its radius.
      if (c.eyes) out.push(named(ball(new THREE.Vector3(ex, faceY(ex, ez) - eyeR * 0.6, headCentreZ + ez), eyeR, c.eyes, undefined, 8), "eye"));
      // A brow over each eye, in the hair colour as in the portrait, following the face.
      const inner = side * headR * 0.16;
      const outer = side * headR * 0.48;
      const bz = headR * 0.3;
      const brow = c.hair ?? c.facialHair ?? c.faceInk;
      const browInner = new THREE.Vector3(inner, faceY(inner, bz), headCentreZ + bz);
      const browOuter = new THREE.Vector3(outer, faceY(outer, bz - headR * 0.03), headCentreZ + bz - headR * 0.03);
      out.push(named(stroke(browInner, browOuter, headR * 0.035, brow), "brow"));
    }
    // The mouth: a shallow smile across the lower face, in the face ink.
    const mz = -headR * 0.45;
    const corner = headR * 0.24;
    const middle = new THREE.Vector3(0, faceY(0, mz - headR * 0.04), headCentreZ + mz - headR * 0.04);
    for (const side of [-1, 1]) {
      const end = new THREE.Vector3(side * corner, faceY(corner, mz), headCentreZ + mz);
      out.push(named(stroke(middle, end, headR * 0.03, c.faceInk), "mouth"));
    }
  }

  // Over the head: a head garment, or hair by its length.
  if (p.headCovered || p.hair !== "none") {
    // A little larger than the head all round, so the tilted cap's facets stay outside the head's.
    const v = p.headCovered ? 1.06 : 1.05 * p.hairVolume;
    const capReach = Math.PI * 0.55;
    // Textured hair needs enough facets for its curls to show.
    const fine = !p.headCovered && p.hairTexture !== "straight";
    const cap = new THREE.SphereGeometry(headR, fine ? 24 : 16, fine ? 12 : 9, 0, Math.PI * 2, 0, capReach);
    // A sphere's pole is +y. Turning by more than a right angle about x takes it
    // past +z toward -y: the cap leans back, its front edge above the eyes
    // (the forehead shows) and its back edge low on the nape.
    // Centred on the head: shifting it back let the forehead show through the cap's front.
    const capAt = new THREE.Vector3(0, 0, headCentreZ);
    const capTurn = new THREE.Euler(Math.PI / 2 + CAP_LEAN, 0, 0);
    const capScale = new THREE.Vector3(headScale.x * v, v, headScale.y * v);
    const capPart = named(placed(cap, c.head, capAt, capTurn, capScale), "cap");
    if (!p.headCovered) textured(capPart.geometry, () => capAt, p.hairTexture, headR);
    out.push(capPart);
    if (outlined.has("hairline")) {
      // The outline runs along the cap's edge, so it is built where that edge is and turned with the cap.
      const edgeR = headR * Math.sin(capReach) * 1.02;
      const edge = new THREE.CylinderGeometry(edgeR, edgeR, 0.014, RADIAL * 2, 1, true);
      edge.translate(0, headR * Math.cos(capReach), 0);
      const hairline = named(placed(edge, c.ink, capAt, capTurn, capScale), "hairline");
      // Raised with the cap's texture, so the curls do not cover it.
      const capAxis = new THREE.Vector3(0, 1, 0).applyEuler(capTurn);
      if (!p.headCovered) textured(hairline.geometry, () => capAt, p.hairTexture, headR, 1, capAxis);
      out.push(hairline);
    }
  }
  if (!p.headCovered && (p.hair === "medium" || p.hair === "long")) {
    // Hair falling from under the cap around the back and sides of the head, widening a little
    // as it falls: to the jaw when medium, past the shoulders when long. Open at the front.
    const v = 1.04 * p.hairVolume;
    const top = headCentreZ + headR * 0.1;
    const bottom = p.hair === "long" ? shoulderZ - 0.12 * H : headCentreZ - headR * 1.15;
    const long = p.hair === "long";
    // Around the back, and forward on each side to just in front of the ears.
    const around = 3.8;
    const fine = p.hairTexture !== "straight";
    const fall = new THREE.CylinderGeometry(headR, headR * (long ? 1.25 : 1.12), top - bottom, 20, fine ? 10 : 3, true, -around / 2, around);
    // A cylinder stands along y with its seam at +z; turned upright (+z) its middle faces -y, the back.
    fall.rotateX(Math.PI / 2);
    // Long hair lies back over the shoulders rather than through them.
    fall.scale(headScale.x * v, headScale.y * v, 1);
    fall.translate(0, long ? -headR * 0.25 : 0, (top + bottom) / 2);
    const hang = { geometry: twoSided(fall), colour: c.head };
    textured(hang.geometry, (q) => new THREE.Vector3(0, long ? -headR * 0.25 : 0, q.z), p.hairTexture, headR, 0.4);
    out.push(named(hang, "hair"));
  }

  // Facial hair, shaped from the head's own ellipsoid so it follows the jaw.
  if (c.facialHair && p.facialHair !== "none") {
    const fh = c.facialHair;
    // A piece of the head ellipsoid around its lowest point, `k` times the head's size: up to
    // `reach` radians from straight down, across `span` radians centred on `toward` (π/2 is the
    // front; 0 and π the sides). `drop` stretches it downward, as a beard hangs below the chin.
    const toHead = (g: THREE.BufferGeometry, k: number, drop = 1) => {
      g.rotateX(-Math.PI / 2);
      g.scale(headScale.x * k, headScale.y * k, headScale.z * k * drop);
      g.translate(0, 0, headCentreZ);
      return g;
    };
    const shell = (reach: number, toward: number, span: number, k: number, colour: string, drop = 1): Part => ({
      geometry: toHead(new THREE.SphereGeometry(headR, 16, 6, toward - span / 2, span, 0, reach), k, drop),
      colour,
    });
    // The upper edge of a shell, for an outline where the facial hair meets skin of nearly its own lightness.
    const shellEdge = (reach: number, toward: number, span: number, k: number, drop = 1): Part => {
      const r = headR * Math.sin(reach) * 1.01;
      const g = new THREE.CylinderGeometry(r, r, 0.012, 16, 1, true, toward - span / 2 - Math.PI / 2, span);
      g.translate(0, headR * Math.cos(reach), 0);
      return { geometry: toHead(g, k, drop), colour: c.ink };
    };
    const front = Math.PI / 2;
    // Below the mouth (which sits at -0.45 to -0.49 head radii), across the jaw from ear to ear.
    const jawReach = 0.96;
    const jawSpan = 4.0;
    if (p.facialHair === "beard" || p.facialHair === "stubble") {
      const full = p.facialHair === "beard";
      // A beard stands out and hangs; stubble lies on the skin.
      const k = full ? 1.12 : 1.012;
      const drop = full ? 1.12 : 1;
      // Stubble is a shadow on the skin: its colour laid over the skin, as the portrait draws it.
      const colour = full ? fh : overlayHex(c.skin, fh, STUBBLE_OPACITY);
      out.push(named(shell(jawReach, front, jawSpan, k, colour, drop), full ? "beard" : "stubble"));
      // A full beard runs up the side of the face in front of each ear; on stubble that strip read as a pale patch.
      for (const side of full ? [-1, 1] : []) out.push(named(shell(1.75, front + side * 1.3, 0.35, k - 0.006, colour, drop), "beard"));
      if (full && outlined.has("jawline")) out.push(named(shellEdge(jawReach, front, jawSpan, k, drop), "jawline"));
    } else if (p.facialHair === "goatee") {
      out.push(named(shell(0.75, front, 0.9, 1.1, fh, 1.08), "beard"));
      if (outlined.has("jawline")) out.push(named(shellEdge(0.75, front, 0.9, 1.1, 1.08), "jawline"));
    }
    if (p.facialHair === "moustache" || p.facialHair === "beard" || p.facialHair === "goatee") {
      // Two strokes over the upper lip, from under the nose out to the corners of the mouth.
      const top = -headR * 0.32;
      const middle = new THREE.Vector3(0, faceY(0, top) + headR * 0.02, headCentreZ + top);
      for (const side of [-1, 1]) {
        const end = new THREE.Vector3(side * headR * 0.28, faceY(headR * 0.28, -headR * 0.43) + headR * 0.02, headCentreZ - headR * 0.43);
        out.push(named(stroke(middle, end, headR * 0.06, fh), "moustache"));
      }
    }
  }

  // Features big enough to read at figure size, in the face ink as in the
  // portrait. Freckles, a mole and dimples are left to the portrait.
  const fi = c.faceInk;
  const eyeZ = headCentreZ + headR * 0.12;
  const lensY = headR * 1.0;
  const lensR = headR * 0.2;
  const rim = headR * 0.04;
  // The ellipsoid head's half width at height z: temples, straps and earrings end on its surface.
  const headSide = (z: number) => headR * headScale.x * Math.sqrt(Math.max(0, 1 - ((z - headCentreZ) / (headR * headScale.z)) ** 2));
  for (const feature of p.features) {
    if (feature === "glasses" || feature === "sunglasses") {
      for (const side of [-1, 1]) {
        const lens = new THREE.Vector3(side * headR * 0.32, lensY, eyeZ);
        if (feature === "glasses") {
          // A torus lies across z; turn it to face forward (+y).
          out.push(placed(new THREE.TorusGeometry(lensR, rim, 4, 12), fi, lens, new THREE.Euler(Math.PI / 2, 0, 0)));
        } else {
          // A cylinder's axis is y, so a short one is a forward-facing disc.
          out.push(placed(new THREE.CylinderGeometry(lensR * 1.1, lensR * 1.1, rim * 1.5, 12), fi, lens));
        }
        // Temple: from the lens's outer edge back to above the ear.
        out.push(limb(new THREE.Vector3(side * (headR * 0.32 + lensR), lensY - rim, eyeZ), new THREE.Vector3(side * headSide(eyeZ), 0, eyeZ), rim * 0.8, fi));
      }
      out.push(limb(new THREE.Vector3(-headR * 0.32 + lensR, lensY, eyeZ), new THREE.Vector3(headR * 0.32 - lensR, lensY, eyeZ), rim * 0.8, fi));
    } else if (feature === "eyepatch") {
      // Over the left eye (-x, as the portrait draws it on the viewer's right), with a strap to above the right ear.
      const patch = new THREE.Vector3(-headR * 0.32, lensY, eyeZ);
      out.push(placed(new THREE.CylinderGeometry(lensR * 1.15, lensR * 1.15, rim * 1.5, 12), fi, patch));
      // The strap: a ring lying on the head, through the patch and up over the right temple, round the back.
      // Built on a unit sphere (where the head is round), then stretched to the head's half widths.
      const unit = new THREE.Vector3(patch.x / headScale.x, patch.y / headScale.y, (patch.z - headCentreZ) / headScale.z).normalize();
      const rightAndUp = new THREE.Vector3(1, 0, 0.5).normalize();
      const normal = new THREE.Vector3().crossVectors(unit, rightAndUp).normalize();
      const ring = new THREE.TorusGeometry(1, (rim * 0.8) / headR, 4, 40);
      ring.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal));
      ring.scale(headR * headScale.x * 1.03, headR * headScale.y * 1.03, headR * headScale.z * 1.03);
      ring.translate(0, 0, headCentreZ);
      out.push(named({ geometry: ring, colour: fi }, "strap"));
    } else if (feature === "earrings") {
      for (const side of [-1, 1]) {
        // A ring hanging from each earlobe, turned to face sideways.
        const lobe = headCentreZ - headR * 0.35;
        const at = new THREE.Vector3(side * (headSide(lobe) + rim), 0, lobe);
        out.push(named(placed(new THREE.TorusGeometry(headR * 0.12, rim * 0.9, 4, 10), fi, at, new THREE.Euler(0, Math.PI / 2, 0)), "earring"));
      }
    }
  }

  // Parts from the body plan's traits.
  const crown = headCentreZ + headR * 0.8;
  const accent = c.hair ?? c.skin;
  for (const extra of p.extras) {
    if (extra === "tail") {
      out.push(limb(new THREE.Vector3(0, -p.hipHalf * 0.55, hipZ - 0.02 * H), new THREE.Vector3(0, -p.hipHalf * 0.55 - 0.35 * s, sitting ? 0.03 : hipZ - 0.3 * H), p.limbRadius * 0.6, accent));
    } else if (extra === "wings") {
      for (const side of [-1, 1]) {
        out.push(block(new THREE.Vector3(side * p.shoulderHalf * 1.4, -0.12 * s, shoulderZ - 0.12 * H), new THREE.Vector3(0.45 * s, 0.02 * s, 0.5 * H * 0.6), accent, new THREE.Euler(0, side * 0.35, side * 0.5)));
      }
    } else if (extra === "antlers") {
      for (const side of [-1, 1]) {
        const base = new THREE.Vector3(side * headR * 0.45, 0, crown);
        const tip = new THREE.Vector3(side * headR * 1.5, -headR * 0.2, crown + headR * 1.4);
        out.push(limb(base, tip, headR * 0.07, accent));
        out.push(limb(base.clone().lerp(tip, 0.5), new THREE.Vector3(side * headR * 0.7, headR * 0.3, crown + headR * 1.2), headR * 0.06, accent));
      }
    } else if (extra === "horns") {
      for (const side of [-1, 1]) {
        out.push(placed(new THREE.ConeGeometry(headR * 0.16, headR * 0.7, 6), accent, new THREE.Vector3(side * headR * 0.45, headR * 0.15, crown + headR * 0.2), new THREE.Euler(Math.PI / 2, 0, -side * 0.35)));
      }
    } else if (extra === "pointed_ears") {
      for (const side of [-1, 1]) {
        out.push(placed(new THREE.ConeGeometry(headR * 0.14, headR * 0.6, 4), c.skin, new THREE.Vector3(side * headR * 0.95, -headR * 0.05, headCentreZ + headR * 0.25), new THREE.Euler(Math.PI / 2, 0, -side * 1.0)));
      }
    }
  }
  return out;
}

/** The parts as one geometry, each part's colour in a `color` attribute (linear, as three.js expects). */
export function figureGeometry(p: FigureParams): THREE.BufferGeometry {
  const colour = new THREE.Color();
  const geometries = figureParts(p).map(({ geometry: g, colour: hex }) => {
    g.deleteAttribute("uv");
    colour.set(hex);
    const count = g.getAttribute("position").count;
    const colours = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) colours.set([colour.r, colour.g, colour.b], i * 3);
    g.setAttribute("color", new THREE.BufferAttribute(colours, 3));
    return g;
  });
  const merged = mergeGeometries(geometries, false);
  for (const g of geometries) g.dispose();
  if (!merged) throw new Error("figure parts could not be merged");
  if (p.posture === "reclining") {
    // Lying on the back: head toward -y, face up, back just above the floor, centred on the spot.
    merged.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    merged.translate(0, p.height / 2, 0.13 * (p.height / 1.75));
  }
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  return merged;
}

/**
 * Figure geometries kept between room rebuilds, keyed by their figure
 * parameters. The 3D room is rebuilt on every Client.Spatial step while
 * anyone moves; a person whose parameters are unchanged gets the same
 * geometry back, since position and facing live on the mesh. Meshes using a
 * kept geometry are marked `userData.keptGeometry` so `disposeRoomScene`
 * leaves it; `sweep` frees what the latest build did not use.
 */
export class FigureCache {
  private geometries = new Map<string, THREE.BufferGeometry>();
  private used = new Set<string>();

  geometry(p: FigureParams): THREE.BufferGeometry {
    const key = JSON.stringify(p);
    let geometry = this.geometries.get(key);
    if (!geometry) {
      geometry = figureGeometry(p);
      this.geometries.set(key, geometry);
    }
    this.used.add(key);
    return geometry;
  }

  /** Frees every geometry not asked for since the last sweep: people who left or whose look changed. */
  sweep(): void {
    for (const [key, geometry] of this.geometries) {
      if (this.used.has(key)) continue;
      geometry.dispose();
      this.geometries.delete(key);
    }
    this.used.clear();
  }

  get size(): number {
    return this.geometries.size;
  }

  dispose(): void {
    for (const geometry of this.geometries.values()) geometry.dispose();
    this.geometries.clear();
    this.used.clear();
  }
}

/**
 * The figure as one mesh standing at (x, y, z0), turned to face `facing`
 * (a MOO-frame direction; only its horizontal part counts). Without a facing
 * the figure faces south. With a cache, the geometry is the cache's.
 */
export function figureMesh(
  p: FigureParams,
  x: number,
  y: number,
  z0: number,
  facing: readonly number[] | undefined,
  material: THREE.Material,
  cache?: FigureCache,
): THREE.Mesh {
  const mesh = new THREE.Mesh(cache ? cache.geometry(p) : figureGeometry(p), material);
  if (cache) mesh.userData.keptGeometry = true;
  const fx = facing?.[0] ?? 0;
  const fy = facing?.[1] ?? 0;
  // Turning by θ about z takes +y to (-sin θ, cos θ).
  mesh.rotation.z = Math.hypot(fx, fy) > 1e-6 ? Math.atan2(-fx, fy) : Math.PI;
  mesh.position.set(x, y, z0);
  mesh.userData.part = "body";
  return mesh;
}
