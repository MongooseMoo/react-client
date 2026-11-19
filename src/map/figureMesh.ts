import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { contrast, INK_DARK, overlayHex, toneOff } from "../avatar/colour";
import { type Ears, type FigureParams, HANGS_LOOSE, type HairTexture, HORN_TONE, type Seam, STUBBLE_OPACITY } from "../avatar/figure";

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
/**
 * Skin whose contrast with the eye white is under this (the palette's very pale to light, 1.0 to 1.15) gets a lid round
 * each white: the white vanished into it. On tan skin (1.5) and darker the white shows by itself.
 */
export const LIDDED_BELOW = 1.3;
/** The middle of a 3D eye when the appearance gives no eye colour: a dark pupil, not a claimed iris colour. */
export const EYE_PUPIL = INK_DARK;
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
  /** How much of the texture's rise a vertex gets (0 to 1): a short cut's curls fade out at the sides. */
  amount: (q: THREE.Vector3) => number = () => 1,
  /** The height where the waves are in step with the cap's (`along` speeds them up only below and above it). */
  pivot = 0,
  /**
   * Wavy hair only: how far, in radians of a wave, a wave's crest swings up and down round the head, how many times
   * round, and how far it is broken strand by strand (a fast swing that varies from column to column).
   */
  wave: { swing: number; lobes: number; strands: number } = { swing: 1.6, lobes: 5, strands: 0 },
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
    const down = ((at.z - pivot) * along + pivot) / headR;
    // How far out, as a share of the head radius, at the peaks.
    const [rise, f] =
      texture === "wavy"
        ? // Each wave's crest swings up and down round the head: set level all round, the waves were stripes.
          [0.05, Math.sin(down * 7 + wave.swing * Math.sin(around * wave.lobes) + wave.strands * Math.sin(around * 17))]
        : texture === "curly"
          ? [0.09, Math.sin(around * 7) * Math.sin(down * 9)]
          : [0.1, Math.sin(around * 11) * Math.sin(down * 14)];
    bumps[i] = 0.5 + 0.5 * f;
    const lift = (headR * rise * bumps[i] * amount(q)) / Math.max(1e-6, d.length());
    q.addScaledVector(d, lift);
    positions.setXYZ(i, q.x, q.y, q.z);
  }
  positions.needsUpdate = true;
  g.computeVertexNormals();
  return bumps;
}

/**
 * Ringlets on a fall laid out in rows of `columns + 1` vertices (a cylinder's, and its two-sided copy's): a lock to
 * every two columns, its middle column raised and its edge columns left low, so locks hang side by side with open
 * grooves between them. Each lock twists down its length, its middle swinging out and in and from side to side once
 * every `perTurn` rows, each lock out of step with the next, and ends a little longer or shorter than its neighbours
 * (`ends`, metres at most). The two front edges stay flat. Raised by up to 0.12 head radii outward from
 * `centre(vertex)`, times `amount(vertex)`; returns how far each vertex is raised (0 to 1). One curl at every third
 * vertex made separate six-sided lumps with dark outlines, a honeycomb or reptile scales; a wave of curls read at the
 * vertices showed only its ridges round the fall, long loose locks.
 */
function ringlets(
  g: THREE.BufferGeometry,
  columns: number,
  perTurn: number,
  centre: (q: THREE.Vector3) => THREE.Vector3,
  around: number,
  headR: number,
  ends: number,
  /** How much of the rise a vertex gets, from its position and its column. */
  amount: (q: THREE.Vector3, column: number) => number,
): Float32Array {
  const positions = g.getAttribute("position");
  const half = positions.count / 2;
  const rows = half / (columns + 1) - 1;
  const raised = new Float32Array(positions.count);
  const q = new THREE.Vector3();
  const d = new THREE.Vector3();
  for (let i = 0; i < positions.count; i++) {
    // The two-sided copy's second half repeats the first's vertices: both sides of a lock move alike.
    const j = i % half;
    const [ix, iy] = [j % (columns + 1), Math.floor(j / (columns + 1))];
    const lock = Math.floor(ix / 2);
    const middle = ix % 2 === 1;
    // Each lock its own: how many rows a turn takes (two thirds to one and a half times `perTurn`), where its turns
    // start, how far it stands out. All alike, the turns' bright sides lined up from lock to lock in a slanting lattice
    // of dashes, cable knit or scales rather than loose curls.
    const own = (k: number) => {
      const x = Math.sin(lock * 12.9898 + k * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };
    const turn = (2 * Math.PI * iy) / (perTurn * (0.67 + 0.83 * own(1))) + 2 * Math.PI * own(2);
    const flat = Math.min(1, Math.min(ix, columns - ix) / 2);
    const lift = (middle ? (0.45 + 0.3 * own(3)) + 0.3 * Math.sin(turn) : 0.12) * flat;
    // Sideways by up to 0.35 of a column's width, a quarter turn behind the swing out.
    const side = middle ? (0.2 + 0.15 * own(4)) * Math.cos(turn) * flat : 0;
    q.fromBufferAttribute(positions, i);
    d.subVectors(q, centre(q));
    const r = Math.max(1e-6, Math.hypot(d.x, d.y));
    const k = amount(q, ix);
    const across = (side * r * around) / columns;
    q.x += ((d.x / r) * headR * 0.12 * lift + (-d.y / r) * across) * k;
    q.y += ((d.y / r) * headR * 0.12 * lift + (d.x / r) * across) * k;
    // Uneven ends: each lock's tip lower by its own amount.
    if (iy === rows && middle) q.z -= ends * own(5);
    positions.setXYZ(i, q.x, q.y, q.z);
    raised[i] = lift;
  }
  positions.needsUpdate = true;
  g.computeVertexNormals();
  return raised;
}

/** How far a texture's peaks go toward the hair's sheen: wave crests, curls and coils catch the light. */
const SHEEN_ON_PEAKS = 0.75;

/**
 * A texture's average shade toward the sheen (`SHEEN_ON_PEAKS` times the mean of its bumps squared): a single ripple
 * for waves, a product of two for curls and coils. Where the cap meets falling hair, both fade to it.
 */
const MEAN_SHADE: Readonly<Record<HairTexture, number>> = { straight: 0, wavy: SHEEN_ON_PEAKS * 0.375, curly: SHEEN_ON_PEAKS * 0.3125, coily: SHEEN_ON_PEAKS * 0.3125 };

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
 * A band closing a sphere cap's rim (the last of its `rows`, laid out in rows of `across + 1` vertices) in to the head:
 * from each rim vertex straight in toward the cap's centre `at` to `inner(direction)` from it, drawn from both sides.
 * Its vertices are the rim's, then the inner ones, so a shade along the rim applies to both rows.
 */
function rimLip(g: THREE.BufferGeometry, across: number, rows: number, at: THREE.Vector3, inner: (d: THREE.Vector3) => number): THREE.BufferGeometry {
  const pos = g.getAttribute("position");
  const positions: number[] = [];
  const d = new THREE.Vector3();
  for (let ix = 0; ix <= across; ix++) positions.push(pos.getX(rows * (across + 1) + ix), pos.getY(rows * (across + 1) + ix), pos.getZ(rows * (across + 1) + ix));
  for (let ix = 0; ix <= across; ix++) {
    d.set(positions[ix * 3], positions[ix * 3 + 1], positions[ix * 3 + 2]).sub(at);
    const r = Math.min(d.length(), inner(d.clone().normalize()));
    d.setLength(r).add(at);
    positions.push(d.x, d.y, d.z);
  }
  const index: number[] = [];
  for (let ix = 0; ix < across; ix++) {
    const [a, b, c, e] = [ix, ix + 1, across + 1 + ix, across + 2 + ix];
    index.push(a, c, b, b, c, e);
  }
  const lip = new THREE.BufferGeometry();
  lip.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  lip.setIndex(index);
  lip.computeVertexNormals();
  const both = twoSided(lip);
  // Lit as the cap's rim above it, on both sides: with its own normals (turned down and in) it was lit dark and drew a
  // dark line along the hairline on pale skin.
  const normals = both.getAttribute("normal");
  const rim = g.getAttribute("normal");
  for (let i = 0; i < normals.count; i++) {
    const k = rows * (across + 1) + (i % (across + 1));
    normals.setXYZ(i, rim.getX(k), rim.getY(k), rim.getZ(k));
  }
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
  // Two segments round each end: the ends sit in the torso, the hands and the feet, and three cost 40 more triangles a limb.
  const geometry = new THREE.CapsuleGeometry(radius, Math.max(0.001, length), fine ? 2 : 1, fine ? RADIAL : 6);
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
 * A mohawk's crest: a fin standing out from the head along its middle line, from the forehead over the crown to the
 * nape, `height` head radii tall (narrowing toward its edge and easing in at its two ends), set in the head
 * ellipsoid of half widths `headScale` x `headR` centred `headZ` up. Its base lies inside the shaved cap.
 */
function crest(headR: number, headScale: THREE.Vector3, headZ: number, height: number): THREE.BufferGeometry {
  // Angles from straight up, toward the face positive: the forehead's hairline to the nape.
  const [front, back] = [1.25, -2.3];
  const rows = 14;
  const positions: number[] = [];
  const index: number[] = [];
  for (let i = 0; i <= rows; i++) {
    const u = i / rows;
    const beta = front + (back - front) * u;
    const ease = Math.min(1, u / 0.12, (1 - u) / 0.12);
    const out = 1 + height * Math.sqrt(Math.max(0, ease));
    const [dy, dz] = [Math.sin(beta), Math.cos(beta)];
    for (const [r, half] of [[1, 0.1], [out, 0.055]]) {
      for (const side of [-1, 1]) positions.push(side * half * headR, dy * r * headR * headScale.y, headZ + dz * r * headR * headScale.z);
    }
  }
  // Per row: base left, base right, top left, top right.
  const at = (i: number, k: number) => i * 4 + k;
  for (let i = 0; i < rows; i++) {
    // Each face listed so it faces out: the right side (+x), the left side (-x) and the top edge.
    for (const [a, b] of [[1, 3], [2, 0], [3, 2]]) index.push(at(i, a), at(i + 1, b), at(i + 1, a), at(i, a), at(i, b), at(i + 1, b));
  }
  // The two ends, the front one facing forward and the back one back.
  index.push(at(0, 0), at(0, 3), at(0, 1), at(0, 0), at(0, 2), at(0, 3));
  index.push(at(rows, 0), at(rows, 1), at(rows, 3), at(rows, 0), at(rows, 3), at(rows, 2));
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

/** How many columns of facets brushed hair's fringe has across the forehead. */
const FRINGE_ACROSS = 8;

/**
 * Brushed hair's fringe: a layer of hair lying on the forehead just outside the cap, from the parting on the left
 * (high) across to the right temple, its lower edge sweeping down from the parting toward that temple and staying
 * above the brows. `onCap(d)` is the way from the head's centre (`headZ` up) to the cap's surface in direction `d`.
 */
function fringe(headScale: THREE.Vector3, headZ: number, onCap: (d: THREE.Vector3) => THREE.Vector3): THREE.BufferGeometry {
  const across = FRINGE_ACROSS;
  const up = 2;
  const positions: number[] = [];
  for (let j = 0; j <= up; j++) {
    for (let i = 0; i <= across; i++) {
      const u = i / across;
      // Round the head from just left of the front (the parting's side) to the right temple, and the elevation above
      // the head's middle: the lower edge falls from 0.95 radians at the parting to 0.45 over the right brow and stays
      // there to the temple; the upper edge 0.45 radians above it, up on the cap.
      const theta = -0.45 + 1.55 * u;
      const e = 0.95 - 0.5 * Math.min(1, u / 0.6) + (0.45 * j) / up;
      const d = new THREE.Vector3(Math.cos(e) * Math.sin(theta) * headScale.x, Math.cos(e) * Math.cos(theta) * headScale.y, Math.sin(e) * headScale.z).normalize();
      // Just outside the cap, so it lies on the hair as a layer of its own.
      const q = onCap(d).multiplyScalar(1.03);
      positions.push(q.x, q.y, headZ + q.z);
    }
  }
  const index: number[] = [];
  const at = (i: number, j: number) => j * (across + 1) + i;
  // Wound so each face looks out of the head.
  for (let j = 0; j < up; j++) for (let i = 0; i < across; i++) index.push(at(i, j), at(i + 1, j + 1), at(i + 1, j), at(i, j), at(i, j + 1), at(i + 1, j + 1));
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

/**
 * What a hair style adds to the cap and falling hair: a ponytail, braids, a bun, a topknot,
 * locks, spikes, a mohawk's crest or a brushed parting. Loose, swept-back and voluminous hair
 * are drawn by the cap and fall alone. Hanging parts reach down by the hair's length.
 */
function styleParts(
  p: FigureParams,
  style: FigureParams["hairStyle"],
  headCentreZ: number,
  headR: number,
  headScale: THREE.Vector3,
  capV: number,
  /** The way from the head's centre to the cap's surface in a direction. */
  onCap: (d: THREE.Vector3) => THREE.Vector3,
): Part[] {
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
      // One tall, narrow crest standing up along the middle of the head from the forehead over the crown to the nape.
      // A single squashed ball rose only 0.3 head radii over the crown and sank into the head toward its ends: a tuft.
      out.push(named({ geometry: crest(headR, headScale, headCentreZ, p.hair === "cropped" ? 0.5 : 0.65), colour: hairColour }, "crest"));
      break;
    case "brushed": {
      // A side parting on the left, the scalp showing along it, and the hair from it brushed across the forehead in a
      // fringe that sweeps down toward the right temple. With only a thin parting line it looked the same as loose hair.
      out.push(named(stroke(onHair(-0.32, 0.45, 0.85, 1.07), onHair(-0.32, -0.45, 0.85, 1.07), headR * 0.035, p.colours.skin), "parting"));
      // Combed: every other column of the fringe a little toward the hair's sheen.
      const swept = fringe(headScale, headCentreZ, onCap);
      const combed = sheen ? { shade: strands(swept.getAttribute("position").count, FRINGE_ACROSS + 1).map((x) => x * 0.5), tone: sheen } : {};
      out.push(named({ geometry: swept, colour: hairColour, ...combed }, "fringe"));
      break;
    }
    default:
      break;
  }
  return out;
}

/** Each `face.ears` value's ear: half its height and half its depth front to back, in head radii. */
const EAR_SIZE: Readonly<Record<Ears, { half: number; depth: number }>> = {
  average: { half: 0.26, depth: 0.16 },
  small: { half: 0.19, depth: 0.12 },
  large: { half: 0.34, depth: 0.2 },
  pointed: { half: 0.26, depth: 0.15 },
};

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
    // Eight facets round: ten cost 120 more triangles for two hands a few pixels across, which the long falls' coils need.
    out.push(ball(new THREE.Vector3(wrist.x, wrist.y, wrist.z - p.limbRadius * 1.3), p.limbRadius * 1.25, c.hands, undefined, 8));
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
    const lidTone = contrast(c.skin, EYE_WHITE) < LIDDED_BELOW ? toneOff(c.skin, EYE_WHITE) : undefined;
    for (const side of [-1, 1]) {
      const ex = side * headR * 0.32;
      const ez = headR * 0.12;
      // Seated in the head: the eye stands out of the face by less than half its radius. Its white, with the
      // iris in the eye's colour at its front: an eye in its colour alone vanished on skin of its own darkness.
      // Without an eye colour, a dark pupil there, as the portrait draws a pupil: drawn only with a colour, a person
      // without one had no eyes in 3D, only brows.
      // Where the eye sits on the face, and which way the face looks there (the head ellipsoid's normal at the eye).
      const onFace = new THREE.Vector3(ex, faceY(ex, ez), headCentreZ + ez);
      const outward = new THREE.Vector3(side * 0.47, 1, 0.12).normalize();
      const turned = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), outward);
      // The white is a shallow dome on the face, round (twelve facets round it) and standing a third of its radius
      // proud; the iris or pupil a smaller dome on it, on a sphere just outside the white's. Balls of six facets read as
      // hex nuts close up (a ball of twelve took the heaviest figure over the 5,000-triangle budget); a dome of twelve
      // facets round costs a third of a twelve-facet ball.
      const reach = 0.6;
      const domeR = eyeR / Math.sin(reach);
      const domeCentre = onFace.clone().addScaledVector(outward, -domeR * Math.cos(reach) + eyeR * 0.05);
      const dome = (r: number, theta: number, colour: string, facets: number) => {
        const g = new THREE.SphereGeometry(r, facets, theta > 0.4 ? 2 : 1, 0, Math.PI * 2, 0, theta);
        g.applyQuaternion(turned);
        g.translate(domeCentre.x, domeCentre.y, domeCentre.z);
        return named({ geometry: g, colour }, "eye");
      };
      out.push(dome(domeR, reach, EYE_WHITE, 12));
      out.push(dome(domeR * 1.015, Math.asin(Math.min(1, (eyeR * 0.6) / (domeR * 1.015))), c.eyes ?? EYE_PUPIL, 10));
      if (lidTone) {
        // On skin nearly as pale as the white, a lid round it in the skin's tone off the white: without it the white
        // vanished into very pale skin and the eye read as a dark dot. A round ring lying on the face round the white,
        // twelve facets round like the white (six read as a hex nut), three sides to its section with one pointing out,
        // its inner edge where the white meets the face, so no skin shows between them.
        const lid = new THREE.TorusGeometry(eyeR * 1.1, eyeR * 0.2, 3, 12);
        // Lying in the face's slope there, so its side toward the nose is not buried in the face.
        lid.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), outward));
        lid.translate(onFace.x, onFace.y + eyeR * 0.06, onFace.z);
        out.push(named({ geometry: lid, colour: lidTone }, "eyelid"));
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
  // Cropped and short hair (not shaved, not voluminous) is cut close at the sides and fuller on top: the cap is `v` at
  // the sides, and grows toward `crownV` over the top (`taper`), its curls fading out toward the ears too. The same
  // bulk all round made 3 cm coily hair a full afro and hid the ears, and 3 cm and 10 cm straight hair alike.
  const cut = !p.headCovered && !shaved && style !== "voluminous" && (p.hair === "cropped" || p.hair === "short");
  const v = p.headCovered
    ? 1.06
    : shaved
      ? 1.04
      : cut
        ? p.hair === "cropped"
          ? 1.035
          : 1.05
        : 1.05 * p.hairVolume * (style === "voluminous" ? 1.25 : 1);
  // Short hair stands about a third of the head's size proud at the crown: with only straight hair's own bulk it
  // rose 0.08 head radii over cropped hair and the two looked the same from the front, and at a fifth only modestly
  // different on light skin. Curls and coils stand high by their own bulk.
  const straightish = p.hairTexture === "straight" || p.hairTexture === "wavy";
  const crownV = !cut ? v : p.hair === "short" ? v * (straightish ? 1.32 : p.hairVolume * 1.065) : v * p.hairVolume;
  /** How far toward the crown's bulk the hair is in direction `d` from the head's centre: none below the temples. */
  const taper = (d: THREE.Vector3) => smooth((d.z / d.length() - 0.1) / 0.8);
  /** The factor the cap's surface stands out by in direction `d`, over its plain size. */
  const bulge = (d: THREE.Vector3) => 1 + (crownV / v - 1) * taper(d);
  // The way from the head's centre to the cap's surface in direction `d` (a unit vector), set once the cap is built.
  let onCap = (d: THREE.Vector3) => d.clone().multiplyScalar(headR);
  // How far out the cap's surface is from the head's middle line at height z, in the horizontal direction (x, y), before
  // its texture; 0 below it. Set once the cap is built: the falling hair lies just outside it.
  let capAcross = (_x: number, _y: number, _z: number) => 0;
  // The cap's outward normal at a point (before its texture), for the falling hair's top to be lit as the cap is.
  let capNormal = (q: THREE.Vector3) => q.clone().normalize();
  // Only hair worn down falls round the head; hair tied up, braided, locked, spiked or shaved does not.
  const fallsDown = HANGS_LOOSE.includes(style);
  // How far hair worn down falls, by the game's band: to the jaw, onto the shoulders, past them, to the waist. Curls and
  // coils at chin length spring up into a mass ending above the jaw.
  const fallBottom: Partial<Record<FigureParams["hair"], number>> = {
    "chin-length": headCentreZ - headR * (p.hairTexture === "coily" ? 0.85 : p.hairTexture === "curly" ? 0.95 : 1.15),
    "shoulder-length": shoulderZ - 0.03 * H,
    long: shoulderZ - 0.12 * H,
    "waist-length": waistZ + 0.02 * H,
  };
  const bottom = fallBottom[p.hair];
  const falling = !p.headCovered && fallsDown && bottom !== undefined;
  // Where the falling hair starts, a little above the head's middle, under the cap.
  const fallTop = headCentreZ + headR * 0.1;
  /**
   * Curls or coils to the jaw: the fall carries the cap's own texture on, the same waves at the same heights (both read
   * it from the height above the floor), so cap and fall are one mass with no fade between them. Lumped, or with
   * coils turning faster than the cap's, the fall under the crown read as a rolled brim under a dome.
   */
  const matched = falling && p.hair === "chin-length" && (p.hairTexture === "curly" || p.hairTexture === "coily");
  /**
   * How much of the cap's texture is kept at a point (relative to the cap's centre): none round the back where the
   * falling hair covers the cap and meets it, coming in above the fall's top. The two textures crossing there drew a
   * jagged seam where the cap's lower edge ran over the fall.
   */
  const keptOver = (d: THREE.Vector3, over: number) =>
    falling && !matched ? 1 - smooth((fallTop + headR * over - (d.z + headCentreZ)) / (headR * over)) * smooth((0.45 - d.y / headR) / 0.3) : 1;
  // Over 0.15 head radii above the fall's top, its bumps' height over twice that, so the crown's outline comes down into
  // the fall's. Over 0.3 head radii, with the fall's own texture fading in over 0.2 below its top, a smooth band half a
  // head radius tall ran round the back between the crown's coils and the fall's locks, read as a ledge under the crown.
  const kept = (d: THREE.Vector3) => keptOver(d, 0.15);
  const keptRise = (d: THREE.Vector3) => keptOver(d, 0.3);
  if (p.headCovered || p.hair !== "none") {
    // Textured hair needs enough facets for its curls to show; coils are tighter, so they need more. A hairline drawn as
    // strands on the cap needs columns enough for them: twice straight hair's 16.
    const fine = !p.headCovered && capTexture !== "straight";
    const coils = fine && capTexture === "coily";
    const edged = outlined.has("hairline") && !shaved && !p.headCovered;
    // With 32 columns a vertex lands where the rim comes lowest over the brows, which 16 columns' chords cut across a
    // little higher: that cap reaches a little less far, so its edge stays as clear of the brows.
    const capReach = Math.PI * (edged && !fine ? 0.53 : 0.55);
    const across = coils ? 28 : fine ? 24 : edged ? 32 : 16;
    const rows = fine ? 12 : 9;
    const cap = new THREE.SphereGeometry(headR, across, rows, 0, Math.PI * 2, 0, capReach);
    // A sphere's pole is +y. Turning by more than a right angle about x takes it
    // past +z toward -y: the cap leans back, its front edge above the eyes
    // (the forehead shows) and its back edge low on the nape. Swept-back hair leaves a higher forehead.
    // Centred on the head: shifting it back let the forehead show through the cap's front.
    const capAt = new THREE.Vector3(0, 0, headCentreZ);
    // Brushed hair's cap sits as high, its fringe sweeping lower across the forehead from the parting.
    const capTurn = new THREE.Euler(Math.PI / 2 + CAP_LEAN + (style === "swept_back" || style === "brushed" ? 0.3 : 0), 0, 0);
    // The cap's own depth axis, once turned, points down and back; it takes the head's extent along that direction,
    // so a cap leaning far enough back to clear the brows still covers the head behind.
    const depth = new THREE.Vector3(0, 0, 1).applyEuler(capTurn);
    const depthExtent = 1 / Math.hypot(depth.x / headScale.x, depth.y / headScale.y, depth.z / headScale.z);
    const capScale = new THREE.Vector3(headScale.x * v, v, depthExtent * v);
    const unturn = new THREE.Quaternion().setFromEuler(capTurn).invert();
    onCap = (d) => {
      const local = d.clone().applyQuaternion(unturn);
      return d.clone().multiplyScalar((headR / Math.hypot(local.x / capScale.x, local.y / capScale.y, local.z / capScale.z)) * bulge(d));
    };
    /** Each vertex of a part placed round the cap moved out by the cap's bulge in its direction. */
    const bulged = (g: THREE.BufferGeometry) => {
      if (crownV === v) return;
      const positions = g.getAttribute("position");
      const q = new THREE.Vector3();
      for (let i = 0; i < positions.count; i++) {
        q.fromBufferAttribute(positions, i).sub(capAt);
        q.multiplyScalar(bulge(q)).add(capAt);
        positions.setXYZ(i, q.x, q.y, q.z);
      }
      positions.needsUpdate = true;
      g.computeVertexNormals();
    };
    // A short cut's curls fade out toward the sides, as its bulk does.
    const curlsAt = (q: THREE.Vector3) => {
      if (!cut) return 1;
      const d = q.clone().sub(capAt);
      return smooth((d.z / d.length() - 0.05) / 0.45);
    };
    const capColour = shaved ? overlayHex(c.skin, c.head, STUBBLE_OPACITY) : c.head;
    const capPart = named(placed(cap, capColour, capAt, capTurn, capScale), "cap");
    bulged(capPart.geometry);
    // The cap's last rows come in to lie on the head (`tuck`, 0 over the crown to 1 at the rim), so the hairline meets
    // the scalp. Standing out at its rim by the hair's bulk (a third of the head's size for coils), the cap's open
    // inside showed past the face at the temples, and the room's wall through it, its faces turned away not drawn.
    // Read from a point's direction from the cap's centre (its polar angle in the unturned cap), which the cap's bulge,
    // tuck and texture all leave as it is.
    /** How far from the cap's crown (0) to its rim (1) a point is: its polar angle in the unturned cap over the cap's reach. */
    const rimward = (at: THREE.Vector3) => {
      const local = at.clone().sub(capAt).applyQuaternion(unturn).divide(capScale);
      return Math.acos(Math.max(-1, Math.min(1, local.y / (local.length() || 1)))) / capReach;
    };
    const tuckAt = (at: THREE.Vector3) => (p.headCovered ? 0 : smooth((rimward(at) - 0.6) / 0.4));
    /**
     * The tuck at a point on the cap: the factor its distance across from the head's middle line is scaled by, in across
     * and not down (its height kept, so the hairline stays as clear of the brows).
     */
    const tuckScale = (at: THREE.Vector3) => {
      const t = tuckAt(at);
      if (t <= 0) return 1;
      const q = at.clone().sub(capAt);
      const r = q.length();
      const head = (headR * 1.03) / Math.hypot(q.x / (r * headScale.x), q.y / (r * headScale.y), q.z / (r * headScale.z));
      return head >= r ? 1 : (r + (head - r) * t) / r;
    };
    {
      const positions = capPart.geometry.getAttribute("position");
      const q = new THREE.Vector3();
      for (let i = 0; i < positions.count; i++) {
        const k = tuckScale(q.fromBufferAttribute(positions, i));
        if (k === 1) continue;
        positions.setXYZ(i, capAt.x + (q.x - capAt.x) * k, capAt.y + (q.y - capAt.y) * k, q.z);
      }
      positions.needsUpdate = true;
      capPart.geometry.computeVertexNormals();
    }
    // Where the cap's surface is (before its texture), for the falling hair to lie just outside it: along the
    // horizontal ray from the head's middle line at height z, the far crossing of the turned, scaled sphere, drawn in by
    // its tuck. Laid outside the untucked sphere, the falling hair stood off the tucked sides of the head: from the side
    // a step where it started, and coils to the jaw flaring at the ears.
    const turnQ = new THREE.Quaternion().setFromEuler(capTurn).invert();
    capAcross = (x, y, z) => {
      const r = Math.hypot(x, y) || 1;
      const a = new THREE.Vector3(x / r, y / r, 0).applyQuaternion(turnQ).divide(capScale);
      const b = new THREE.Vector3(0, 0, z - capAt.z).applyQuaternion(turnQ).divide(capScale);
      const [qa, qb, qc] = [a.dot(a), 2 * a.dot(b), b.dot(b) - headR * headR];
      const disc = qb * qb - 4 * qa * qc;
      if (disc < 0) return 0;
      const far = (-qb + Math.sqrt(disc)) / (2 * qa);
      return far * tuckScale(new THREE.Vector3((x / r) * far, (y / r) * far, z));
    };
    const turnFwd = new THREE.Quaternion().setFromEuler(capTurn);
    capNormal = (q) => {
      const local = q.clone().sub(capAt).applyQuaternion(turnQ).divide(capScale).divide(capScale);
      return local.applyQuaternion(turnFwd).normalize();
    };
    if (p.headCovered) out.push(capPart);
    else {
      const positions = capPart.geometry.getAttribute("position");
      const q = new THREE.Vector3();
      const keep = Array.from({ length: positions.count }, (_, i) => kept(q.fromBufferAttribute(positions, i).sub(capAt)));
      // Curls lift less toward the tucked rim, so it stays on the head.
      const bumps = textured(capPart.geometry, () => capAt, capTexture, headR, 1, undefined, (at) => curlsAt(at) * keptRise(at.clone().sub(capAt)) * (1 - 0.7 * tuckAt(at)));
      // The texture's peaks toward the sheen, faded out where the falling hair meets the cap (`kept`).
      const shade = new Float32Array(positions.count);
      // Faded to the texture's average shade, not to none: faded to the hair's plain colour it left a dark band there.
      if (bumps) for (let i = 0; i < positions.count; i++) shade[i] = SHEEN_ON_PEAKS * bumps[i] * bumps[i] * keep[i] + MEAN_SHADE[capTexture] * (1 - keep[i]);
      if (edged) {
        // The hair's edge, where it meets skin of nearly its own lightness, drawn on the cap itself: across the forehead
        // and temples its last rows are shaded in strands, every other column well toward the hair's tone off the skin
        // (`hairEdge`), fading out a row or two up. A white ring read as a headband, a grey line round the head as one
        // too, and a row of separate grey tips as a dotted line.
        // Each strand reaches up from the rim by its own length (the shortest fading out within the last row, the
        // longest well into the row above it):
        // all of one length, the strands read face-on as a soft band. They run over the forehead and temples only: on to
        // the sides of the head, every other column shaded drew a dotted line along the cap's outline from behind.
        for (let iy = 0; iy <= rows; iy++) {
          for (let ix = 0; ix <= across; ix++) {
            // Four lengths in turn across the strands, each next to two others.
            const length = (((ix >> 1) * 3) % 4) / 3;
            const near = smooth((iy / rows - (0.79 + 0.12 * length)) / 0.1);
            const i = iy * (across + 1) + ix;
            const front = smooth(((positions.getY(i) - capAt.y) / headR - 0.05) / 0.3);
            shade[i] = Math.max(shade[i], 0.9 * near * front * (ix % 2 ? 1 : 0.15));
          }
        }
      }
      const tone = edged ? c.hairEdge : c.hairSheen;
      out.push(bumps || edged ? { ...capPart, shade, tone } : capPart);
      // Its rim turned in to the head all round, a narrow band from the rim to just inside the head's surface: from a
      // little to one side the eye looked past the far side of the face in under the rim, onto the cap's inner side,
      // which (its faces turned away, not drawn) let the room's wall show in a thin pale sliver between hair and face.
      // Closing the rim costs one row; the whole cap two-sided took the heaviest figure over the 5,000-triangle budget.
      const lip = rimLip(capPart.geometry, across, rows, capAt, (d) => (headR * 0.97) / Math.hypot(d.x / headScale.x, d.y / headScale.y, d.z / headScale.z));
      // Rim and inner row, on each of its two sides.
      const rimShade = new Float32Array(4 * (across + 1));
      for (let k = 0; k < 4; k++) for (let ix = 0; ix <= across; ix++) rimShade[k * (across + 1) + ix] = shade[rows * (across + 1) + ix];
      out.push(named(bumps || edged ? { geometry: lip, colour: capColour, shade: rimShade, tone } : { geometry: lip, colour: capColour }, "rim"));
    }
  }
  if (falling && bottom !== undefined) {
    // Hair falling from under the cap around the back and sides of the head, widening a little
    // as it falls. Open at the front.
    const v = 1.04 * p.hairVolume * (style === "voluminous" ? 1.2 : 1);
    const top = fallTop;
    // Hair reaching the shoulders or further lies back over them rather than through them.
    const long = p.hair !== "chin-length";
    // Around the back, and forward on each side to just in front of the ears.
    const around = 3.8;
    const fine = p.hairTexture !== "straight";
    // A long fall of curls or coils hangs in ringlets (`ringlets`), two columns to a lock: coils in 10 narrower locks
    // over 20 columns and 12 rows, curls in 8 over 16 and 14 (the heaviest figure, 75 cm coily hair, stays under the
    // 5,000-triangle budget). A chin-length one (`matched`) gets 10 rows, four or more to each of the cap's waves; a long
    // wavy fall 12, for its waves.
    const ringed = long && (p.hairTexture === "curly" || p.hairTexture === "coily");
    const wavyFall = long && p.hairTexture === "wavy";
    const rows = ringed ? (p.hairTexture === "coily" ? 12 : 14) : matched ? 10 : fine ? 12 : 8;
    const columns = ringed && p.hairTexture === "curly" ? 16 : 20;
    const fall = new THREE.CylinderGeometry(headR, headR, top - bottom, columns, rows, true, -around / 2, around);
    // A cylinder stands along y with its seam at +z; turned upright (+z) its middle faces -y, the back.
    fall.rotateX(Math.PI / 2);
    fall.translate(0, 0, (top + bottom) / 2);
    // A long fall's rows closer together near the top, where it lies round the curve of the head: evenly spaced, its
    // first facet cut straight across the back of the head and the cap showed through it. A wavy, curly or coily fall
    // less so, so its lowest waves and curls are not stretched past what its rows can show.
    if (long) {
      const at = fall.getAttribute("position");
      const close = fine ? 1.25 : 1.6;
      for (let i = 0; i < at.count; i++) at.setZ(i, top - (top - bottom) * ((top - at.getZ(i)) / (top - bottom)) ** close);
    }
    // Its outline down the fall: round the back of the head, in toward the nape, then out over the shoulders to its
    // ends (a bob flicks out a little). A straight cone from the crown to the ends hung as a flat slab. Curls and coils
    // to the jaw continue the round of the cap and close in toward their ends, one rounded mass with it: swelling out
    // below the head's middle, they stood out past the crown from behind, a rolled brim under a dome.
    const nape = Math.max(headCentreZ - headR * 1.05, bottom + 0.35 * (top - bottom));
    const spread = long ? 1.3 : 1.12;
    const rounded = long ? 0 : { coily: 0.3, curly: 0.2 }[p.hairTexture as "coily" | "curly"] ?? 0;
    const across = (z: number) => {
      return z >= nape ? 1 - 0.1 * smooth((top - z) / (top - nape)) : 0.9 + (spread - 0.9) * smooth((nape - z) / (nape - bottom));
    };
    // Long hair lies back over the shoulders rather than through them: moved back below the nape, against the head above it.
    const back = (z: number) => (long ? -headR * 0.25 * smooth((nape - z) / (0.5 * (nape - bottom))) : 0);
    const positions = fall.getAttribute("position");
    /**
     * How far down from its top each column's ringlets take to come in, 0.05 to 0.3 head radii, each lock its own: all
     * coming in over one height, the locks began in a level line round the back of the head under the crown's coils, a
     * ledge. (Raising the locks' tops up the crown instead notched the head's outline between them.)
     */
    const comeIn = (ix: number) => {
      const lock = Math.floor(Math.min(ix, columns - 1) / 2);
      const x = Math.sin(lock * 12.9898 + 7 * 78.233) * 43758.5453;
      return headR * (0.05 + 0.25 * (x - Math.floor(x)));
    };
    /** Each column's top, once placed, for its texture to rise from. */
    const columnTops = new Float64Array(columns + 1);
    for (let i = 0; i < positions.count; i++) {
      // At its two front edges its top comes down a quarter of a head radius, toward where the cap's edge runs down the
      // side of the head, each column's rows spread over what is left: square at the corner, the fall's top and front
      // edge met in a hard corner at temple height, seen from the side.
      const fromBack = Math.abs(Math.atan2(positions.getX(i), -positions.getY(i)));
      const columnTop = long ? top - headR * 0.25 * smooth((fromBack - 1.6) / 0.3) : top;
      columnTops[i % (columns + 1)] = columnTop;
      const z = columnTop - ((columnTop - bottom) * (top - positions.getZ(i))) / (top - bottom);
      const k = across(z);
      // Straight hair's ends uneven: every other strand a little longer.
      const ragged = !fine && Math.abs(z - bottom) < 1e-5 && (i % (columns + 1)) % 2 ? -0.012 * s : 0;
      // Long hair's front edges follow the face: brought forward round the head beside the cheek and jaw (up to 0.3
      // radians, the front column most), then back in toward the neck below the jaw, each edge column by its own share so
      // the edge is uneven. Hanging straight down from the temple, the fall's front edge ran behind the cheek and jaw as a
      // plain straight line, seen from the side.
      let [gx, gy] = [positions.getX(i), positions.getY(i)];
      if (long) {
        const ixEdge = Math.min(i % (columns + 1), columns - (i % (columns + 1)));
        const toFront = Math.max(0, 1 - ixEdge / 3) * (0.8 + 0.2 * Math.sin(ixEdge * 2.3 + (i % (columns + 1) > columns / 2 ? 1 : 0)));
        const cheek = smooth((headCentreZ - headR * 0.05 - z) / (headR * 0.35)) * (1 - smooth((headCentreZ - headR * 0.85 - z) / (headR * 0.45)));
        const turn = 0.3 * toFront * cheek * Math.sign(gx);
        // Turned toward +y (the face) on each side: counter-clockwise on the +x side, clockwise on the -x side.
        [gx, gy] = [gx * Math.cos(turn) - gy * Math.sin(turn), gx * Math.sin(turn) + gy * Math.cos(turn)];
      }
      let [x, y] = [gx * headScale.x * v * k, gy * headScale.y * v * k + back(z)];
      // Never inside the cap: it lies just outside the cap's surface where that is further out, so the cap's lower edge
      // at the back is covered and the fall's top lies on the cap instead of crossing it. 2.5% out: more than the sag of
      // the fall's flat facets between its vertices round and down the curved cap, so the cap never shows through.
      // At its very top 1.2% out, a ledge of a millimetre or two: lying on the cap there, the cap's vertices showed
      // through the fall's facets in a dotted line down each side from behind.
      const r = Math.hypot(x, y);
      const cap = capAcross(x, y, z) * (1.012 + 0.013 * smooth((top - z) / (headR * 0.06)));
      // At its top it lies on the cap (as the cap is drawn in at the sides), and comes out to its own outline below:
      // standing at its own outline from the start, it began in a flat step at temple height, seen from the side. Its
      // two front edges lie on the head down past the ears, so they come out from under the cap rather than standing off
      // the side of the head in a hard upright edge.
      const ix = i % (columns + 1);
      const edge = Math.min(1, Math.min(ix, columns - ix) / 2) + (1 - Math.min(1, Math.min(ix, columns - ix) / 2)) * smooth((headCentreZ - headR * 0.2 - z) / (headR * 0.5));
      // Curls or coils to the jaw close in from the cap's own width at their top in that direction (`rounded`), so they
      // never stand out past it, at the ears or below the crown.
      const own = smooth((top - z) / (headR * 0.6)) * edge;
      const u = (top - z) / (top - bottom);
      // What the fall lies on there: the cap, or below the cap's rim (down the side of the face) the head itself, so the
      // front edges lie on the head there too. Chin-length curls kept their front edges at the cap's width at their
      // top all the way down, standing off the side of the head where the cap's rim runs down it: from behind and to
      // one side the wall showed between them and the cap, two dark specks at ear level.
      const dz = (z - headCentreZ) / (headR * headScale.z);
      const onHead = r > 0 && Math.abs(dz) < 1 ? (headR * 1.02 * Math.sqrt(1 - dz * dz)) / Math.hypot(x / r / headScale.x, y / r / headScale.y) : 0;
      // Its two front edges a little inside the cap where the cap is, so the cap's outline covers them: lying just
      // outside it they met it along a crack a fraction of a millimetre wide, which from behind and to one side showed
      // the room in a column of light dots near the top of the fall.
      const front = 1 - Math.min(1, Math.min(ix, columns - ix) / 2);
      const base = cap > 0 ? cap * (1 - 0.06 * front) : onHead;
      const want = rounded
        ? base + (Math.max(base, capAcross(x, y, top) * 1.012 * (1 - rounded * u * u)) - base) * edge
        : base > 0
          ? base + (Math.max(r, base) - base) * own
          : r;
      if (r > 0) [x, y] = [(x * want) / r, (y * want) / r];
      positions.setXYZ(i, x, y, z + ragged);
    }
    fall.computeVertexNormals();
    const hang = { geometry: twoSided(fall), colour: c.head };
    /** How much of its texture the fall has at height z: none at its top, where it meets the cap, all of it 0.2 head radii down. */
    const inFall = (z: number) => smooth((top - z) / (headR * (ringed ? 0.1 : 0.2)));
    // A wavy fall past the jaw waves as tightly as its rows allow (three rows to a wave, its 7 waves per head radius at
    // up to 1.6 times the cap's): at 0.4 it was smooth. A chin-length wavy fall keeps that slow swing, the bob that
    // coils and curls of that length are told from.
    // A chin-length fall of coils or curls turns a little faster than the cap below their meeting, where they are in step,
    // so it turns at least twice before its end.
    const along = matched ? (p.hairTexture === "coily" ? 1.3 : 1.6) : p.hairTexture === "wavy" && long ? Math.max(0.4, Math.min(1.6, (rows * 2 * Math.PI) / (3 * 7 * ((top - bottom) / headR)))) : 0.4;
    const centreOf = (q: THREE.Vector3) => new THREE.Vector3(0, back(q.z), q.z);
    const bumps = ringed
      ? // Each lock rises from its own column's top (lower at the two front edges, where the fall's top comes down the
        // side of the head, higher where a lock starts up the crown): read from the fall's top, the front locks were
        // already raised where they start and stood off the cap at the side, and from behind and above the wall showed
        // under them.
        ringlets(hang.geometry, columns, p.hairTexture === "coily" ? 3 : 4, centreOf, around, headR, 0.03 * s, (q, column) =>
          // Standing out slowly, over 0.45 head radii: standing out within 0.1 to 0.2, the locks bulged out under the
          // crown's outline from behind in a shelf.
          smooth((columnTops[column] - q.z) / (headR * 0.45)),
        )
      : // Chin-length curls rise from under the cap over their first 0.12 head radii: at full height from the top, the
        // fall's top edge stood off the cap at the sides (where the cap's own curls lie lower toward its rim), and from
        // behind and above the eye passed under it, down between hair and head and out at the face: two dark specks.
        // A long wavy fall's waves are in step with the cap's where they meet (`top`), and swing round the head in two
        // broad arcs broken strand by strand: swinging five times round as the cap's do, over the fall's 20 columns and
        // 12 rows, they broke into blotches like cobbles; level, they were a stack of rings.
        textured(
          hang.geometry,
          centreOf,
          p.hairTexture,
          headR,
          along,
          undefined,
          (q) => (matched ? smooth((top - q.z) / (headR * 0.12)) : inFall(q.z)),
          matched || wavyFall ? top : 0,
          wavyFall ? { swing: 1.3, lobes: 2, strands: 0.3 } : undefined,
        );
    // Near its top, lit as the cap it lies on: with the fall's own upright normals the light changed in a line there.
    // (Its inner side, the second half of the two-sided geometry, faces the other way.)
    {
      const at = hang.geometry.getAttribute("position");
      const normals = hang.geometry.getAttribute("normal");
      const q = new THREE.Vector3();
      const nq = new THREE.Vector3();
      for (let i = 0; i < at.count; i++) {
        q.fromBufferAttribute(at, i);
        // Its two front edges too, down past the ears, where they lie on the head: lit as the fall, they drew a hard
        // upright line down the side of the head.
        const ix = (i % (at.count / 2)) % (columns + 1);
        const edge = (1 - Math.min(1, Math.min(ix, columns - ix) / 2)) * (1 - smooth((headCentreZ - headR * 0.2 - q.z) / (headR * 0.5)));
        const t = Math.max(1 - smooth((top - q.z) / (headR * 0.35)), edge);
        if (t <= 0) continue;
        const cap = capNormal(q).multiplyScalar(i < at.count / 2 ? 1 : -1);
        nq.fromBufferAttribute(normals, i).lerp(cap, t).normalize();
        normals.setXYZ(i, nq.x, nq.y, nq.z);
      }
    }
    // Straight hair shows its strands: every other column toward the sheen, fading in below the cap so the fall meets
    // the cap without a line across the back of the head; a texture's peaks fade in the same way.
    const fallAt = hang.geometry.getAttribute("position");
    const straightStrands =
      !fine && c.hairSheen ? { shade: strands(fallAt.count, columns + 1).map((x, i) => x * 0.45 * smooth((top - fallAt.getZ(i)) / headR)), tone: c.hairSheen } : {};
    const fallPart = sheened(named({ ...hang, ...straightStrands }, "hair"), bumps, c.hairSheen);
    // Ringlets' sheen softer than the texture's on the cap (at its full strength each lock's turns were bright dashes),
    // brought up to the cap's average where they meet it.
    // A long wavy fall's sheen a little softer too, so its waves read as light on flowing hair rather than patches.
    const soft = ringed ? 0.55 : wavyFall ? 0.7 : 1;
    if (bumps && fallPart.shade && !matched) {
      // Ringlets fade in from their own column's top.
      const half = fallAt.count / 2;
      const faded = (i: number) => {
        const column = (i % half) % (columns + 1);
        return ringed ? smooth((columnTops[column] - fallAt.getZ(i)) / comeIn(column)) : inFall(fallAt.getZ(i));
      };
      fallPart.shade = fallPart.shade.map((x, i) => x * soft * faded(i) + MEAN_SHADE[p.hairTexture] * (1 - faded(i)));
    }
    out.push(fallPart);
  }
  if (!p.headCovered && p.hair !== "none") out.push(...styleParts(p, style, headCentreZ, headR, headScale, v, onCap));

  // Ears, sized and shaped by face.ears, on a described person, unless hair or a head garment covers them
  // (`earsHidden`, the rule the portrait uses too): an ear on each side of the head between the eyes' height and the
  // mouth's, flaring a little back. Each is shaded on its forward side toward the skin's tone off itself (`earEdge`),
  // so it shows against the head from the front on every skin: skin on skin, small ears on deep skin were lost.
  const earZ = headCentreZ + headR * 0.02;
  const thick = headR * 0.07;
  /** The ear part shaded toward `earEdge` where it faces forward. */
  const earShaded = (part: Part): Part => {
    const normals = part.geometry.getAttribute("normal");
    const shade = new Float32Array(normals.count);
    for (let i = 0; i < normals.count; i++) shade[i] = 0.9 * Math.min(1, Math.max(0, normals.getY(i) * 1.2));
    return { ...part, shade, tone: c.earEdge };
  };
  if (p.described && !p.earsHidden) {
    const size = EAR_SIZE[p.ears];
    for (const side of [-1, 1]) {
      const at = new THREE.Vector3(side * (headR * headScale.x + thick * 0.6), -headR * 0.08, earZ);
      out.push(earShaded(named(placed(new THREE.SphereGeometry(1, 8, 6), c.skin, at, new THREE.Euler(0.15, 0, side * 0.3), new THREE.Vector3(thick, headR * size.depth, headR * size.half)), "ear")));
      if (p.ears === "pointed") {
        // A point rising up and back from the ear's top.
        const base = at.clone().add(new THREE.Vector3(0, -headR * 0.05, headR * size.half * 0.8));
        out.push(earShaded(named(cone(base, new THREE.Vector3(side * 0.25, -0.35, 1).normalize(), headR * 0.06, headR * 0.38, c.skin, 4), "ear")));
      }
    }
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
      // 24 segments round the head: 40 cost 128 more triangles than the strap, a line, needs; three sides to its section
      // (four cost 48 more, which the round eyes need).
      const ring = new THREE.TorusGeometry(1, (rim * 0.8) / headR, 3, 24);
      ring.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal));
      ring.scale(headR * headScale.x * 1.03, headR * headScale.y * 1.03, headR * headScale.z * 1.03);
      ring.translate(0, 0, headCentreZ);
      out.push(named({ geometry: ring, colour: fi }, "strap"));
    } else if (feature === "earrings") {
      for (const side of [-1, 1]) {
        // A ring hanging from each earlobe, turned to face sideways.
        const lobe = headCentreZ - headR * 0.35;
        const at = new THREE.Vector3(side * (headSide(lobe) + rim), 0, lobe);
        // Three sides to its wire and eight round the ring: a ring a few pixels across, and four by ten took the heaviest
        // figure on very pale skin over the 5,000-triangle budget once coils hung in ringlets.
        out.push(named(placed(new THREE.TorusGeometry(headR * 0.12, rim * 0.9, 3, 8), fi, at, new THREE.Euler(0, Math.PI / 2, 0)), "earring"));
      }
    }
  }

  // Parts from the body plan's traits.
  const crown = headCentreZ + headR * 0.8;
  const accent = c.hair ?? c.skin;
  // The tail and antlers are thin: capsules with few facets (fine ones cost 140 triangles each, and with every
  // feature and trait the heaviest figure went over the 5,000-triangle budget).
  for (const extra of p.extras) {
    if (extra === "tail") {
      out.push(limb(new THREE.Vector3(0, -p.hipHalf * 0.55, hipZ - 0.02 * H), new THREE.Vector3(0, -p.hipHalf * 0.55 - 0.35 * s, sitting ? 0.03 : hipZ - 0.3 * H), p.limbRadius * 0.6, accent, false));
    } else if (extra === "wings") {
      for (const side of [-1, 1]) out.push(named(wing(side, s, new THREE.Vector3(side * p.shoulderHalf * 0.45, -0.1 * s, shoulderZ - 0.04 * H), accent), "wing"));
    } else if (extra === "antlers") {
      for (const side of [-1, 1]) {
        const base = new THREE.Vector3(side * headR * 0.45, 0, crown);
        const tip = new THREE.Vector3(side * headR * 1.5, -headR * 0.2, crown + headR * 1.4);
        out.push(named(limb(base, tip, headR * 0.07, HORN_TONE, false), "antler"));
        out.push(named(limb(base.clone().lerp(tip, 0.5), new THREE.Vector3(side * headR * 0.7, headR * 0.3, crown + headR * 1.2), headR * 0.06, HORN_TONE, false), "antler"));
      }
    } else if (extra === "horns") {
      for (const side of [-1, 1]) {
        const horn = placed(new THREE.ConeGeometry(headR * 0.16, headR * 0.7, 6), HORN_TONE, new THREE.Vector3(side * headR * 0.45, headR * 0.15, crown + headR * 0.2), new THREE.Euler(Math.PI / 2, 0, -side * 0.35));
        out.push(named(horn, "horn"));
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
