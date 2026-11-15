import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { FigureParams, Seam } from "../avatar/figure";

/**
 * A person's 3D figure from `figureParams`: three.js primitives, each painted
 * one colour through a vertex colour, merged into one geometry so a person is
 * one mesh and one draw call. Built in the figure's own frame (origin on the
 * floor under the figure, facing +y, z up) and then turned to `facing` and
 * moved to where the person is. Imported only by roomScene.ts, inside the lazy
 * 3D chunk.
 */

interface Part {
  geometry: THREE.BufferGeometry;
  colour: string;
}

const RADIAL = 10;
/** How far the hair or head-covering cap leans back from upright, radians. */
const CAP_LEAN = 0.5;

function placed(geometry: THREE.BufferGeometry, colour: string, at: THREE.Vector3, rotation?: THREE.Euler, scale?: THREE.Vector3): Part {
  const m = new THREE.Matrix4().compose(at, new THREE.Quaternion().setFromEuler(rotation ?? new THREE.Euler()), scale ?? new THREE.Vector3(1, 1, 1));
  geometry.applyMatrix4(m);
  return { geometry, colour };
}

/** A capsule between two points. */
function limb(a: THREE.Vector3, b: THREE.Vector3, radius: number, colour: string): Part {
  const length = a.distanceTo(b);
  const geometry = new THREE.CapsuleGeometry(radius, Math.max(0.001, length), 3, RADIAL);
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
function parts(p: FigureParams): Part[] {
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

  if (!p.faceHidden && c.eyes) {
    for (const side of [-1, 1]) {
      out.push(ball(new THREE.Vector3(side * headR * 0.32, headR * 0.86, headCentreZ + headR * 0.12), headR * 0.1, c.eyes, undefined, 6));
    }
  }

  // Over the head: a head garment, or hair by its length.
  if (p.headCovered || p.hair !== "none") {
    // A little larger than the head all round, so the tilted cap's facets stay outside the head's.
    const v = p.headCovered ? 1.06 : 1.05 * p.hairVolume;
    const capReach = Math.PI * 0.55;
    const cap = new THREE.SphereGeometry(headR, 16, 9, 0, Math.PI * 2, 0, capReach);
    // A sphere's pole is +y. Turning by more than a right angle about x takes it
    // past +z toward -y: the cap leans back, its front edge above the eyes
    // (the forehead shows) and its back edge low on the nape.
    // Centred on the head: shifting it back let the forehead show through the cap's front.
    const capAt = new THREE.Vector3(0, 0, headCentreZ);
    const capTurn = new THREE.Euler(Math.PI / 2 + CAP_LEAN, 0, 0);
    const capScale = new THREE.Vector3(headScale.x * v, v, headScale.y * v);
    out.push(placed(cap, c.head, capAt, capTurn, capScale));
    if (outlined.has("hairline")) {
      // The outline runs along the cap's edge, so it is built where that edge is and turned with the cap.
      const edgeR = headR * Math.sin(capReach) * 1.02;
      const edge = new THREE.CylinderGeometry(edgeR, edgeR, 0.014, RADIAL * 2, 1, true);
      edge.translate(0, headR * Math.cos(capReach), 0);
      out.push(placed(edge, c.ink, capAt, capTurn, capScale));
    }
  }
  if (!p.headCovered && (p.hair === "medium" || p.hair === "long")) {
    const bottom = p.hair === "long" ? shoulderZ - 0.12 * H : headCentreZ - headR * 1.15;
    const top = headCentreZ + headR * 0.4;
    const width = headR * 1.7 * p.hairVolume;
    out.push(block(new THREE.Vector3(0, -headR * 0.62, (top + bottom) / 2), new THREE.Vector3(width, headR * 0.5 * p.hairVolume, top - bottom), c.head));
  }

  // Facial hair on the chin and lip.
  if (c.facialHair && p.facialHair !== "none") {
    const fh = c.facialHair;
    const chinZ = headCentreZ - headR * 0.62;
    if (p.facialHair === "beard" || p.facialHair === "stubble") {
      const depth = p.facialHair === "beard" ? headR * 0.45 : headR * 0.12;
      out.push(block(new THREE.Vector3(0, headR * 0.62, chinZ), new THREE.Vector3(headR * 1.25, depth, headR * 0.7), fh));
    } else if (p.facialHair === "goatee") {
      out.push(block(new THREE.Vector3(0, headR * 0.72, chinZ - headR * 0.1), new THREE.Vector3(headR * 0.45, headR * 0.3, headR * 0.45), fh));
    }
    if (p.facialHair === "moustache" || p.facialHair === "beard" || p.facialHair === "goatee") {
      out.push(block(new THREE.Vector3(0, headR * 0.9, headCentreZ - headR * 0.32), new THREE.Vector3(headR * 0.7, headR * 0.12, headR * 0.12), fh));
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
      const strapTop = eyeZ + headR * 0.45;
      out.push(limb(patch, new THREE.Vector3(headSide(strapTop), 0, strapTop), rim * 0.8, fi));
      out.push(limb(patch, new THREE.Vector3(-headSide(eyeZ), 0, eyeZ), rim * 0.8, fi));
    } else if (feature === "earrings") {
      for (const side of [-1, 1]) {
        // A ring hanging from each earlobe, turned to face sideways.
        const lobe = headCentreZ - headR * 0.35;
        const at = new THREE.Vector3(side * (headSide(lobe) + rim), 0, lobe);
        out.push(placed(new THREE.TorusGeometry(headR * 0.12, rim * 0.9, 4, 10), fi, at, new THREE.Euler(0, Math.PI / 2, 0)));
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
  const geometries = parts(p).map(({ geometry: g, colour: hex }) => {
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
