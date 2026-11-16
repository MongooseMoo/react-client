import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { overlayHex } from "../avatar/colour";
import { type FigureParams, type HairTexture, HORN_TONE, type Seam, STUBBLE_OPACITY } from "../avatar/figure";

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
  /**
   * Per vertex, how far toward `tone` its colour goes (0 to 1): the hair's sheen on curls and coils and on a bun's
   * crown, so texture and form show on hair whose colour lighting alone barely changes.
   */
  shade?: Float32Array;
  tone?: string;
}

const named = (part: Part, name: string): Part => ({ ...part, name });

const RADIAL = 10;
/** The white of the 3D eye, behind the iris. */
export const EYE_WHITE = "#ece8e0";
/** How tall a seam outline band is, metres: a line, not a ring. */
export const BAND_HEIGHT = 0.006;
/** How far out from the surface a seam band lies, as a factor of the part's radius. */
const BAND_OUT = 1.03;
/**
 * How wide the hairline and a beard's edge are, metres: about 3 px when the head is 150 px tall. They were 14 and
 * 12 mm in pure white or black, and read as a headband and a chin strap.
 */
export const HAIRLINE_WIDTH = 0.005;
/** How far the hair or head-covering cap leans back from upright, radians. */
export const CAP_LEAN = 0.66;

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
): Float32Array | undefined {
  if (texture === "straight") return undefined;
  const bumps = new Float32Array(g.getAttribute("position").count);
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
          ? [0.09, Math.sin(around * 7) * Math.sin(down * 9)]
          : [0.1, Math.sin(around * 11) * Math.sin(down * 14)];
    bumps[i] = 0.5 + 0.5 * f;
    const lift = (headR * rise * bumps[i]) / Math.max(1e-6, d.length());
    q.addScaledVector(d, lift);
    positions.setXYZ(i, q.x, q.y, q.z);
  }
  positions.needsUpdate = true;
  g.computeVertexNormals();
  return bumps;
}

/** How far a texture's peaks go toward the hair's sheen: wave crests, curls and coils catch the light. */
const SHEEN_ON_PEAKS = 0.75;

/** The part with its texture's peaks shaded toward the hair's sheen (troughs keep the hair's colour); unchanged for straight hair. */
function sheened(part: Part, bumps: Float32Array | undefined, sheen: string | undefined): Part {
  if (!bumps || !sheen) return part;
  return { ...part, shade: bumps.map((b) => SHEEN_ON_PEAKS * b * b), tone: sheen };
}

/**
 * A beard's strands: every other column of its vertices (a geometry laid out in rows of `columns` vertices, as a
 * sphere strip or an open cone is) goes all the way to the beard's tone off the skin, the rest stay near the beard's
 * colour. A beard of the skin's own darkness, one flat colour, showed only its thin edge line, a chin strap.
 */
function strands(count: number, columns: number): Float32Array {
  const shade = new Float32Array(count);
  for (let i = 0; i < count; i++) shade[i] = (i % columns) % 2 ? 1 : 0.15;
  return shade;
}

/** Stubble's stipple: points across the face and up it (about 50 shown after those round the back are left out). */
const STUBBLE_DOTS_ACROSS = 16;
const STUBBLE_DOTS_UP = 4;

const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/**
 * How far up a beard or stubble reaches at azimuth `phi` round the head (π/2 the front), as radians from straight
 * down: under the mouth in front (0.96), rising over the cheeks beside it, to the sideburns in front of each ear
 * (1.75, a little above eye height there), and back down behind the jaw.
 */
export function beardTop(phi: number): number {
  const off = Math.abs(phi - Math.PI / 2);
  return 0.96 + 0.79 * smooth((off - 0.25) / 0.9) - 0.79 * smooth((off - 1.5) / 0.5);
}

/**
 * A piece of a sphere of radius `r` laid out as THREE.SphereGeometry lays one out (its pole on +y, azimuth `phi`
 * from `phiStart` across `phiLength`), whose polar extent runs from `from(phi)` to `to(phi)` at each azimuth, so its
 * edges can follow a face's features rather than a circle.
 */
function sphereStrip(r: number, across: number, rows: number, phiStart: number, phiLength: number, from: (phi: number) => number, to: (phi: number) => number): THREE.BufferGeometry {
  const positions: number[] = [];
  const index: number[] = [];
  for (let iy = 0; iy <= rows; iy++) {
    for (let ix = 0; ix <= across; ix++) {
      const phi = phiStart + (phiLength * ix) / across;
      const theta = from(phi) + ((to(phi) - from(phi)) * iy) / rows;
      positions.push(-r * Math.cos(phi) * Math.sin(theta), r * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta));
    }
  }
  const at = (ix: number, iy: number) => iy * (across + 1) + ix;
  for (let iy = 0; iy < rows; iy++) {
    for (let ix = 0; ix < across; ix++) {
      const a = at(ix + 1, iy);
      const b = at(ix, iy);
      const c = at(ix, iy + 1);
      const d = at(ix + 1, iy + 1);
      index.push(a, b, d, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
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

/**
 * One wing, rooted at `root` on the shoulder blade: a wing outline (a curved leading edge out
 * to the tip, a scalloped trailing edge back to the root) given a little thickness, spread
 * up and out to `side` and swept back. Sizes are for a 1.75 m figure times `s`.
 */
function wing(side: number, s: number, root: THREE.Vector3, colour: string): Part {
  const outline = new THREE.Shape();
  // x outward from the root, y up; metres for a 1.75 m figure.
  outline.moveTo(0, 0);
  outline.quadraticCurveTo(0.15, 0.32, 0.62, 0.44);
  outline.quadraticCurveTo(0.56, 0.26, 0.5, 0.2);
  outline.quadraticCurveTo(0.46, 0.05, 0.37, 0.08);
  outline.quadraticCurveTo(0.33, -0.1, 0.23, -0.05);
  outline.quadraticCurveTo(0.18, -0.26, 0.08, -0.22);
  outline.quadraticCurveTo(0.04, -0.1, 0, -0.08);
  outline.closePath();
  const geometry = new THREE.ExtrudeGeometry(outline, { depth: 0.015, bevelEnabled: false, curveSegments: 4 });
  // Merging needs every part indexed; an extrusion comes without an index.
  geometry.setIndex([...Array(geometry.getAttribute("position").count).keys()]);
  geometry.translate(0, 0, -0.0075);
  // The outline's plane stands upright (its y up, its thickness front to back) ...
  geometry.rotateX(Math.PI / 2);
  // ... the left wing is the right one turned half round, so its faces stay outward ...
  if (side < 0) geometry.rotateZ(Math.PI);
  // ... and each sweeps back from the shoulders.
  geometry.rotateZ(-side * 0.5);
  geometry.scale(s, s, s);
  geometry.translate(root.x, root.y, root.z);
  return { geometry, colour };
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
  // A thin line lying almost on the surface (callers give a radius a few per cent out),
  // so it parts two alike colours without standing out as a ring.
  const geometry = new THREE.CylinderGeometry(radius, radius, BAND_HEIGHT, RADIAL * 2, 1, true);
  return placed(geometry, colour, new THREE.Vector3(x, y, z), new THREE.Euler(Math.PI / 2, 0, 0), new THREE.Vector3(1, 1, depth));
}

/** A cone standing on `base` and pointing along `dir` (a unit vector), `length` long. */
function cone(base: THREE.Vector3, dir: THREE.Vector3, radius: number, length: number, colour: string, segments = 5): Part {
  const g = new THREE.ConeGeometry(radius, length, segments, 1, true);
  g.applyMatrix4(new THREE.Matrix4().compose(base.clone().addScaledVector(dir, length / 2), new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir), new THREE.Vector3(1, 1, 1)));
  return { geometry: g, colour };
}

/**
 * What a hair style adds to the cap and falling hair: a ponytail, braids, a bun, a topknot,
 * locks, spikes, a mohawk's crest or a brushed parting. Loose, swept-back and voluminous hair
 * are drawn by the cap and fall alone. Hanging parts reach down by the hair's length.
 */
function styleParts(p: FigureParams, style: FigureParams["hairStyle"], headCentreZ: number, headR: number, headScale: THREE.Vector3, capV: number): Part[] {
  const s = p.height / 1.75;
  const hairColour = p.colours.head;
  const sheen = p.colours.hairSheen;
  const hang =
    { none: 0, shaved: 0, cropped: 0.04, short: 0.08, "chin-length": 0.18, "shoulder-length": 0.28, long: 0.42, "waist-length": 0.58 }[p.hair] * s;
  // A point on the hair's surface (just outside the head ellipsoid) in direction (x, y, z) from the head's centre.
  const onHair = (x: number, y: number, z: number, out = 1.08) => {
    const d = new THREE.Vector3(x, y, z).normalize();
    return new THREE.Vector3(d.x * headR * headScale.x * out, d.y * headR * headScale.y * out, headCentreZ + d.z * headR * headScale.z * out);
  };
  const out: Part[] = [];
  switch (style) {
    case "ponytail": {
      // Gathered at the back of the head and hanging down behind.
      const tie = onHair(0, -1, 0.25, 1.05);
      const end = new THREE.Vector3(0, tie.y - headR * 0.35, tie.z - Math.max(hang, 0.1 * s));
      out.push(named(limb(tie, end, headR * 0.2, hairColour), "ponytail"));
      out.push(named(ball(tie, headR * 0.14, p.colours.ink, undefined, 6), "ponytail"));
      break;
    }
    case "braided":
      // Two braids from behind the ears down the back: a rope with plaited links along it.
      for (const side of [-1, 1]) {
        const start = onHair(side * 0.75, -0.55, -0.35, 1.02);
        const end = new THREE.Vector3(side * headR * 0.85, -headR * 0.95, start.z - Math.max(hang, 0.12 * s));
        out.push(named(limb(start, end, headR * 0.13, hairColour), "braid"));
        const links = 7;
        for (let i = 0; i < links; i++) out.push(named(ball(start.clone().lerp(end, i / (links - 1)), headR * 0.17, hairColour, undefined, 6), "braid"));
      }
      break;
    case "bun": {
      // High on the back of the crown, standing clear of the cap (`capV`, the cap's size), so it shows above the
      // head from the front and as a ball from the side. Set at 1.1 head radii it sat inside a coily cap.
      const r = headR * 0.46;
      const centre = onHair(0, -0.65, 0.76, capV + 0.36);
      const bun = named(ball(centre, r, hairColour, undefined, 12), "bun");
      const bumps = textured(bun.geometry, () => centre, p.hairTexture, headR * 0.6);
      // Its crown catches the light (the sheen), so a black bun on black hair still reads as a round mass.
      const normals = bun.geometry.getAttribute("normal");
      const up = new THREE.Vector3(0, -0.35, 1).normalize();
      const shade = new Float32Array(normals.count);
      for (let i = 0; i < normals.count; i++) {
        const lit = Math.max(0, normals.getX(i) * up.x + normals.getY(i) * up.y + normals.getZ(i) * up.z);
        shade[i] = Math.min(1, 0.55 * lit * lit + (bumps ? 0.4 * bumps[i] * bumps[i] : 0));
      }
      out.push(sheen ? { ...bun, shade, tone: sheen } : bun);
      // Where it is gathered: a ring in the sheen round its base, between it and the cap.
      const base = onHair(0, -0.65, 0.76, capV + 0.02);
      const tie = new THREE.TorusGeometry(r * 0.62, headR * 0.06, 4, 14);
      tie.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), centre.clone().sub(base).normalize()));
      tie.translate(...base.clone().lerp(centre, 0.45).toArray());
      out.push(named({ geometry: tie, colour: sheen ?? p.colours.ink }, "bun"));
      break;
    }
    case "topknot": {
      // Sitting on the crown, its tie just under it.
      const knot = onHair(0, -0.1, 1, 1.22);
      out.push(named(ball(knot, headR * 0.26, hairColour, undefined, 8), "topknot"));
      out.push(named(ball(onHair(0, -0.1, 1, 1.05), headR * 0.14, p.colours.ink, undefined, 6), "topknot"));
      break;
    }
    case "dreadlocks":
      // Ropes from all round the back and sides of the head, hanging down.
      for (let i = 0; i < 11; i++) {
        const a = Math.PI * (0.9 + (1.2 * i) / 10);
        const top = onHair(Math.cos(a), Math.sin(a), 0.15, 1.02);
        const end = new THREE.Vector3(top.x * 1.2, top.y * 1.2, top.z - Math.max(hang, 0.1 * s) * (i % 2 ? 0.85 : 1));
        out.push(named(stroke(top, end, headR * 0.11, hairColour), "lock"));
      }
      break;
    case "spiky":
      // Spikes standing out all over the top of the head.
      for (let i = 0; i < 9; i++) {
        const around = (i * Math.PI * 2) / 8;
        const dir = i === 8 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(Math.cos(around) * 0.7, Math.sin(around) * 0.7, 0.75).normalize();
        out.push(named(cone(onHair(dir.x, dir.y, dir.z, 1.0), dir, headR * 0.14, headR * 0.55, hairColour), "spike"));
      }
      break;
    case "mohawk":
      // One tall, narrow crest from the forehead over the crown to the nape.
      out.push(named(ball(new THREE.Vector3(0, -headR * 0.1, headCentreZ + headR * 0.72), headR, hairColour, new THREE.Vector3(0.16, 1.02, 0.62), 10), "crest"));
      break;
    case "brushed":
      // A side parting from the forehead back over the crown.
      out.push(named(stroke(onHair(-0.35, 0.25, 0.9, 1.07), onHair(-0.35, -0.5, 0.8, 1.07), headR * 0.03, p.colours.ink), "parting"));
      break;
    default:
      break;
  }
  return out;
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
      if (outlined.has("ankles")) out.push(named(band(x, 0.24 * H, ankleZ + 0.02 * s, legR * BAND_OUT, 1, c.ink), "band"));
    } else {
      out.push(limb(new THREE.Vector3(x, 0, ankleZ + legR), new THREE.Vector3(x, 0, hipZ - legR * 0.5), legR, c.legs));
      out.push(block(new THREE.Vector3(x, 0.04 * s, ankleZ / 2), new THREE.Vector3(legR * 2.2, 0.16 * s, ankleZ), c.feet));
      if (outlined.has("ankles")) out.push(named(band(x, 0, ankleZ + 0.02 * s, legR * BAND_OUT, 1, c.ink), "band"));
    }
    // Just below the hips' lower edge, where the legs come out, so it shows.
    if (outlined.has("hips")) out.push(named(band(x, sitting ? 0.06 * s : 0, hipZ - 0.07 * H - BAND_HEIGHT, legR * BAND_OUT, 1, c.ink), "band"));
  }

  // Hips, torso, shoulders.
  const waistZ = hipZ + 0.05 * H;
  out.push(trunk(hipZ - 0.07 * H, waistZ, p.hipHalf, p.waistHalf, 0.62, c.hips));
  out.push(trunk(waistZ, neckBase, p.waistHalf, p.shoulderHalf * 0.92, 0.55, c.torso));
  const shoulderZ = neckBase - p.limbRadius * 1.2;
  out.push(limb(new THREE.Vector3(-p.shoulderHalf * 0.9, 0, shoulderZ), new THREE.Vector3(p.shoulderHalf * 0.9, 0, shoulderZ), p.limbRadius * 1.35, c.torso));
  if (outlined.has("waist")) out.push(named(band(0, 0, waistZ, p.waistHalf * BAND_OUT, 0.62, c.ink), "band"));

  // Arms and hands, hanging a little away from the body.
  const wristZ = hipZ - 0.02 * H;
  for (const side of [-1, 1]) {
    const shoulder = new THREE.Vector3(side * p.shoulderHalf, 0, shoulderZ);
    const wrist = new THREE.Vector3(side * (p.hipHalf + p.limbRadius * 1.6), sitting ? 0.08 * s : 0, wristZ);
    out.push(limb(shoulder, wrist, p.limbRadius, c.arms));
    out.push(ball(new THREE.Vector3(wrist.x, wrist.y, wrist.z - p.limbRadius * 1.3), p.limbRadius * 1.25, c.hands));
    if (outlined.has("wrists")) out.push(named(band(wrist.x, wrist.y, wrist.z, p.limbRadius * BAND_OUT, 1, c.ink), "band"));
  }

  // Neck and head.
  const neckR = 0.045 * s;
  out.push(trunk(neckBase - 0.01, headCentreZ - headR * 0.6, neckR, neckR, 1, c.neck));
  // Just above the torso's top and the shoulder bar (which rises 0.15 limb radii over the neck's base), so it shows.
  const collarZ = neckBase + p.limbRadius * 0.15 + BAND_HEIGHT;
  // In the clothing's tone off the neck (`collarEdge`): in the ink, a dark neck over dark clothing wore a white ring.
  if (outlined.has("neck")) out.push(named(band(0, 0, collarZ, neckR * BAND_OUT, 1, c.collarEdge), "band"));
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
      // Seated in the head: the eye stands out of the face by less than half its radius. Its white, with the
      // iris in the eye's colour at its front: an eye in its colour alone vanished on skin of its own darkness.
      if (c.eyes) {
        const centre = new THREE.Vector3(ex, faceY(ex, ez) - eyeR * 0.7, headCentreZ + ez);
        out.push(named(ball(centre, eyeR, EYE_WHITE, undefined, 8), "eye"));
        // The iris stands a little proud of the white, so its facets are not lost inside the white's.
        out.push(named(ball(centre.clone().add(new THREE.Vector3(0, eyeR * 0.45, 0)), eyeR * 0.65, c.eyes, undefined, 8), "eye"));
      }
      // A brow over each eye, in the hair colour toned off the skin (`brow`), as in the portrait, following the face.
      const inner = side * headR * 0.16;
      const outer = side * headR * 0.48;
      const bz = headR * 0.285;
      const brow = c.brow;
      const browInner = new THREE.Vector3(inner, faceY(inner, bz), headCentreZ + bz);
      const browOuter = new THREE.Vector3(outer, faceY(outer, bz - headR * 0.015), headCentreZ + bz - headR * 0.015);
      out.push(named(stroke(browInner, browOuter, headR * 0.045, brow), "brow"));
    }
    // The mouth: a shallow smile across the lower face, in the face ink.
    const mz = -headR * 0.45;
    const corner = headR * 0.24;
    const middle = new THREE.Vector3(0, faceY(0, mz - headR * 0.04), headCentreZ + mz - headR * 0.04);
    for (const side of [-1, 1]) {
      const end = new THREE.Vector3(side * corner, faceY(corner, mz), headCentreZ + mz);
      out.push(named(stroke(middle, end, headR * 0.04, c.faceInk), "mouth"));
    }
  }

  // Over the head: a head garment, or hair by its length and style.
  const style = p.headCovered ? "loose" : p.hairStyle;
  // Styles combed close to the head are smooth whatever the texture; a shaved mohawk side is a shadow on the skin.
  // A shaved head, like a mohawk's sides, is a shadow of the hair's colour on the scalp.
  const shaved = !p.headCovered && (style === "mohawk" || p.hair === "shaved");
  const capTexture: HairTexture = shaved || style === "brushed" || style === "swept_back" ? "straight" : p.hairTexture;
  // A little larger than the head all round, so the tilted cap's facets stay outside the head's; cropped hair lies closer.
  const v = p.headCovered
    ? 1.06
    : shaved
      ? 1.04
      : (p.hair === "cropped" ? 1.035 : 1.05) * p.hairVolume * (style === "voluminous" ? 1.25 : 1);
  if (p.headCovered || p.hair !== "none") {
    const capReach = Math.PI * 0.55;
    // Textured hair needs enough facets for its curls to show; coils are tighter, so they need more.
    const fine = !p.headCovered && capTexture !== "straight";
    const coils = fine && capTexture === "coily";
    const cap = new THREE.SphereGeometry(headR, coils ? 28 : fine ? 24 : 16, fine ? 12 : 9, 0, Math.PI * 2, 0, capReach);
    // A sphere's pole is +y. Turning by more than a right angle about x takes it
    // past +z toward -y: the cap leans back, its front edge above the eyes
    // (the forehead shows) and its back edge low on the nape. Swept-back hair leaves a higher forehead.
    // Centred on the head: shifting it back let the forehead show through the cap's front.
    const capAt = new THREE.Vector3(0, 0, headCentreZ);
    const capTurn = new THREE.Euler(Math.PI / 2 + CAP_LEAN + (style === "swept_back" ? 0.3 : 0), 0, 0);
    // The cap's own depth axis, once turned, points down and back; it takes the head's extent along that direction,
    // so a cap leaning far enough back to clear the brows still covers the head behind.
    const depth = new THREE.Vector3(0, 0, 1).applyEuler(capTurn);
    const depthExtent = 1 / Math.hypot(depth.x / headScale.x, depth.y / headScale.y, depth.z / headScale.z);
    const capScale = new THREE.Vector3(headScale.x * v, v, depthExtent * v);
    const capColour = shaved ? overlayHex(c.skin, c.head, STUBBLE_OPACITY) : c.head;
    const capPart = named(placed(cap, capColour, capAt, capTurn, capScale), "cap");
    if (!p.headCovered) out.push(sheened(capPart, textured(capPart.geometry, () => capAt, capTexture, headR), c.hairSheen));
    else out.push(capPart);
    if (outlined.has("hairline") && !shaved) {
      // The hair's own edge, a tone of the hair that stands 3:1 off the skin (`hairEdge`): a thin line lying on
      // the cap just above its rim, built there and turned with the cap. A white ring standing out from the
      // head read as a headband on black hair over dark skin.
      const rim = capReach - HAIRLINE_WIDTH / headR / 2;
      const edgeR = headR * Math.sin(rim) * 1.006;
      const edge = new THREE.CylinderGeometry(edgeR, edgeR, HAIRLINE_WIDTH, RADIAL * 2, 1, true);
      edge.translate(0, headR * Math.cos(rim), 0);
      const hairline = named(placed(edge, c.hairEdge, capAt, capTurn, capScale), "hairline");
      // Raised with the cap's texture, so the curls do not cover it.
      const capAxis = new THREE.Vector3(0, 1, 0).applyEuler(capTurn);
      if (!p.headCovered) textured(hairline.geometry, () => capAt, capTexture, headR, 1, capAxis);
      out.push(hairline);
    }
  }
  // Only hair worn down falls round the head; hair tied up, braided, locked, spiked or shaved does not.
  const fallsDown = style === "loose" || style === "voluminous" || style === "brushed" || style === "swept_back";
  // How far hair worn down falls, by the game's band: to the jaw, onto the shoulders, past them, to the waist.
  const fallBottom: Partial<Record<FigureParams["hair"], number>> = {
    "chin-length": headCentreZ - headR * 1.15,
    "shoulder-length": shoulderZ - 0.03 * H,
    long: shoulderZ - 0.12 * H,
    "waist-length": waistZ + 0.02 * H,
  };
  const bottom = fallBottom[p.hair];
  if (!p.headCovered && fallsDown && bottom !== undefined) {
    // Hair falling from under the cap around the back and sides of the head, widening a little
    // as it falls. Open at the front.
    const v = 1.04 * p.hairVolume * (style === "voluminous" ? 1.2 : 1);
    const top = headCentreZ + headR * 0.1;
    // Hair reaching the shoulders or further lies back over them rather than through them.
    const long = p.hair !== "chin-length";
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
    const bumps = textured(hang.geometry, (q) => new THREE.Vector3(0, long ? -headR * 0.25 : 0, q.z), p.hairTexture, headR, 0.4);
    out.push(sheened(named(hang, "hair"), bumps, c.hairSheen));
  }
  if (!p.headCovered && p.hair !== "none") out.push(...styleParts(p, style, headCentreZ, headR, headScale, v));

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
    const shell = (reach: number, toward: number, span: number, k: number, colour: string, drop = 1, across = 16): Part => ({
      geometry: toHead(new THREE.SphereGeometry(headR, across, 6, toward - span / 2, span, 0, reach), k, drop),
      colour,
    });
    // The upper edge of a shell where the facial hair meets skin of nearly its own lightness: a thin line of the
    // facial hair's own tone off the skin (`facialHairEdge`), lying on the shell just below its edge.
    const shellEdge = (reach: number, toward: number, span: number, k: number, drop = 1): Part => {
      const rim = reach - HAIRLINE_WIDTH / headR / 2;
      const r = headR * Math.sin(rim) * 1.006;
      const g = new THREE.CylinderGeometry(r, r, HAIRLINE_WIDTH, 16, 1, true, toward - span / 2 - Math.PI / 2, span);
      g.translate(0, headR * Math.cos(rim), 0);
      return { geometry: toHead(g, k, drop), colour: c.facialHairEdge ?? c.ink };
    };
    const front = Math.PI / 2;
    // Across the jaw from behind one ear to behind the other.
    const jawSpan = 4.0;
    if (p.facialHair === "beard" || p.facialHair === "stubble") {
      const full = p.facialHair === "beard";
      // A beard stands out and hangs, a short one less than a full one; stubble lies on the skin.
      const thick = p.beardReach === undefined ? 0.12 : 0.06 + 0.06 * Math.min(1, p.beardReach * 4);
      const k = full ? 1 + thick : 1.012;
      const drop = full ? 1 + thick : 1;
      // Stubble is a shadow on the skin: its colour laid over the skin, as the portrait draws it.
      const colour = full ? fh : overlayHex(c.skin, fh, STUBBLE_OPACITY);
      // Beard and stubble cover the cheeks and the chin, not only the jaw's underside, which from a camera above
      // read as a chin strap: the area's upper edge (`beardTop`) is under the mouth in front, rises over the
      // cheeks and up in front of each ear, and comes back down behind the jaw.
      const across = 20;
      const area = toHead(sphereStrip(headR, across, 6, front - jawSpan / 2, jawSpan, () => 0, beardTop), k, drop);
      // A beard's strands are shaded toward its tone off the skin (`facialHairEdge`, the beard itself when it already stands off).
      const strandsOf = (g: THREE.BufferGeometry, columns: number) => (c.facialHairEdge ? { shade: strands(g.getAttribute("position").count, columns), tone: c.facialHairEdge } : {});
      out.push(named({ geometry: area, colour, ...(full ? strandsOf(area, across + 1) : {}) }, full ? "beard" : "stubble"));
      if (full && outlined.has("jawline")) {
        // Along that edge, just inside it, a thin line in the beard's tone off the skin.
        const band = HAIRLINE_WIDTH / headR;
        const edge = sphereStrip(headR * 1.006, 20, 1, front - jawSpan / 2, jawSpan, (phi) => beardTop(phi) - band, beardTop);
        out.push(named({ geometry: toHead(edge, k, drop), colour: c.facialHairEdge ?? c.ink }, "jawline"));
      }
      if (!full) {
        // Stubble is also a stipple of short hairs, in its colour toned off the skin (`facialHairEdge`): a shadow
        // alone barely changes dark skin. Small points, set on a jittered grid over the area.
        const dot = c.facialHairEdge ?? fh;
        const r = headR * 0.028;
        for (let i = 0; i < STUBBLE_DOTS_ACROSS; i++) {
          for (let j = 0; j < STUBBLE_DOTS_UP; j++) {
            const jitter = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453;
            const u = (i + 0.5 + 0.35 * Math.sin(jitter)) / STUBBLE_DOTS_ACROSS;
            const phi = front - jawSpan / 2 + jawSpan * u;
            // Only where the face shows, not round the back of the jaw.
            if (Math.abs(phi - front) > 1.45) continue;
            const theta = beardTop(phi) * (j + 0.5 + 0.3 * Math.cos(jitter)) / (STUBBLE_DOTS_UP + 0.3);
            const at = new THREE.Vector3(-Math.cos(phi) * Math.sin(theta), Math.cos(theta), Math.sin(phi) * Math.sin(theta)).multiplyScalar(headR * 1.02);
            // Four faces each: an octahedron's eight took a stubbled figure over the 5,000-triangle budget.
            const g = new THREE.TetrahedronGeometry(r * 1.2, 0);
            g.setIndex([...Array(g.getAttribute("position").count).keys()]);
            g.translate(at.x, at.y, at.z);
            out.push(named({ geometry: toHead(g, 1, 1), colour: dot }, "stubble-dot"));
          }
        }
      }
      // A beard longer than a full one hangs below the chin over the chest, narrowing to its end:
      // a cone from under the jaw, its length the beard's beyond 10 cm (at most a third of the height).
      if (full && p.beardLength !== undefined && p.beardLength > 10) {
        const hang = Math.min((p.beardLength - 10) / 100, H / 3);
        const chinZ = headCentreZ - headR * k * drop;
        // Its wide end starts inside the jaw beard, so the two read as one.
        const top = new THREE.Vector3(0, headR * 0.75, chinZ + headR * 0.6);
        // It lies on the chest: the torso's top reaches 0.92 x 0.55 of the shoulder half width forward.
        const end = new THREE.Vector3(0, p.shoulderHalf * 0.92 * 0.55 + headR * 0.3, chinZ - hang);
        const segments = 10;
        const cone = new THREE.ConeGeometry(headR * 0.62, top.distanceTo(end), segments, 1, true);
        // A cone points along +y, its wide end at -y: turn it to point from the jaw down to the end, flattened front to back.
        cone.scale(1, 1, 0.4);
        cone.applyMatrix4(
          new THREE.Matrix4().compose(
            top.clone().add(end).multiplyScalar(0.5),
            new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3().subVectors(end, top).normalize()),
            new THREE.Vector3(1, 1, 1),
          ),
        );
        // Both sides keep the cone's layout (rows of segments + 1 vertices), so the strands line up on each.
        const hanging = twoSided(cone);
        out.push(named({ geometry: hanging, colour: fh, ...strandsOf(hanging, segments + 1) }, "beard"));
      }
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
  // portrait. Freckles, a beauty mark and dimples are left to the portrait.
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
        // A thin stroke, a few pixels wide like the brows: a fine capsule cost 140 triangles each.
        out.push(stroke(new THREE.Vector3(side * (headR * 0.32 + lensR), lensY - rim, eyeZ), new THREE.Vector3(side * headSide(eyeZ), 0, eyeZ), rim * 0.8, fi));
      }
      out.push(stroke(new THREE.Vector3(-headR * 0.32 + lensR, lensY, eyeZ), new THREE.Vector3(headR * 0.32 - lensR, lensY, eyeZ), rim * 0.8, fi));
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
      for (const side of [-1, 1]) out.push(named(wing(side, s, new THREE.Vector3(side * p.shoulderHalf * 0.45, -0.1 * s, shoulderZ - 0.04 * H), accent), "wing"));
    } else if (extra === "antlers") {
      for (const side of [-1, 1]) {
        const base = new THREE.Vector3(side * headR * 0.45, 0, crown);
        const tip = new THREE.Vector3(side * headR * 1.5, -headR * 0.2, crown + headR * 1.4);
        out.push(named(limb(base, tip, headR * 0.07, HORN_TONE), "antler"));
        out.push(named(limb(base.clone().lerp(tip, 0.5), new THREE.Vector3(side * headR * 0.7, headR * 0.3, crown + headR * 1.2), headR * 0.06, HORN_TONE), "antler"));
      }
    } else if (extra === "horns") {
      for (const side of [-1, 1]) {
        const horn = placed(new THREE.ConeGeometry(headR * 0.16, headR * 0.7, 6), HORN_TONE, new THREE.Vector3(side * headR * 0.45, headR * 0.15, crown + headR * 0.2), new THREE.Euler(Math.PI / 2, 0, -side * 0.35));
        out.push(named(horn, "horn"));
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
  const toward = new THREE.Color();
  const geometries = figureParts(p).map(({ geometry: g, colour: hex, shade, tone }) => {
    g.deleteAttribute("uv");
    colour.set(hex);
    if (tone) toward.set(tone);
    const count = g.getAttribute("position").count;
    const colours = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = shade && tone ? shade[i] : 0;
      colours.set([colour.r + (toward.r - colour.r) * t, colour.g + (toward.g - colour.g) * t, colour.b + (toward.b - colour.b) * t], i * 3);
    }
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
 * The head's outline in the figure's own frame: the point on its axis at its
 * crown, then, for cameras all round it and from below to straight above, the
 * point of everything above `chin` (hair, hats, antlers) that is highest in that
 * camera's picture. The highest of them on screen is where the head ends, whatever
 * the view. Kept on the geometry, so a cached figure works it out once.
 */
export function headOutline(geometry: THREE.BufferGeometry, chin: number): THREE.Vector3[] {
  if (geometry.userData.headOutline) return geometry.userData.headOutline as THREE.Vector3[];
  const position = geometry.getAttribute("position");
  const head: number[] = [];
  let top = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < position.count; i++) {
    const z = position.getZ(i);
    if (z < chin) continue;
    head.push(position.getX(i), position.getY(i), z);
    top = Math.max(top, z);
  }
  const chosen = new Set<number>();
  // A camera at elevation e and azimuth a sees "up" in its picture as (-sin e cos a, -sin e sin a, cos e).
  for (const degrees of [-60, -40, -20, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90]) {
    const e = (degrees * Math.PI) / 180;
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * 2 * Math.PI;
      const ux = -Math.sin(e) * Math.cos(a);
      const uy = -Math.sin(e) * Math.sin(a);
      const uz = Math.cos(e);
      let best = 0;
      let bestDot = Number.NEGATIVE_INFINITY;
      for (let i = 0; i < head.length; i += 3) {
        const dot = head[i] * ux + head[i + 1] * uy + head[i + 2] * uz;
        if (dot > bestDot) {
          bestDot = dot;
          best = i;
        }
      }
      if (head.length) chosen.add(best);
    }
  }
  const outline = [new THREE.Vector3(0, 0, top), ...[...chosen].map((i) => new THREE.Vector3(head[i], head[i + 1], head[i + 2]))];
  geometry.userData.headOutline = outline;
  return outline;
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
