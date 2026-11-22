import * as THREE from "three";
import type { FigureParams } from "../avatar/figure";
import type { FrameName } from "../gmcp/Room";

/**
 * Body frames: one box per segment of the human figure (and the humanoid body plans built on its skeleton), the one
 * source of where each segment is. `figureParts` and `humanoidParts` draw from them, and worn and held things are
 * placed in them (docs/room-layout.md, "Body frames").
 *
 * Everything here is in the figure's own frame, the frame `figureParts` builds in: origin on the floor between the
 * feet, facing +y, z up, the wearer's right +x. (The person's body frame on the wire faces -y with the wearer's left
 * +x: the figure is the body frame turned half round, so the axes below, the wearer's left and back, are the same
 * directions in both.)
 *
 * A frame is a box: `origin` its lower end, unit axes `x` (the wearer's left), `y` (backward) and `z` (along the
 * segment from its lower joint to its upper one; the foot's up from the sole, the hand's from the fingertips up to the
 * wrist), and `size` its width (along x), depth (y) and length (z), metres. A point (u, v, t) in frame units sits at
 * origin + u*size.x*x + v*size.y*y + t*size.z*z; u and v run -0.5 to 0.5 across the segment, t 0 to 1 along it.
 */
export interface BodyFrame {
  origin: THREE.Vector3;
  x: THREE.Vector3;
  y: THREE.Vector3;
  z: THREE.Vector3;
  size: THREE.Vector3;
}

export type BodyFrames = Record<FrameName, BodyFrame>;

/** A digitigrade knee: forward by this share of the height, up by this share of the hip's height. */
export const KNEE = new THREE.Vector3(0, 0.04, 0.62);
/** A digitigrade heel (hock): back by this share of the height and up by this share. */
export const HOCK = new THREE.Vector3(0, -0.05, 0.14);

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
/** The wearer's left and back in the figure's own frame. */
const LEFT = v(-1, 0, 0);
const BACK = v(0, -1, 0);

/** The upper end of a frame: origin + length along z. */
export const frameEnd = (f: BodyFrame): THREE.Vector3 => f.origin.clone().addScaledVector(f.z, f.size.z);

/**
 * A frame from `from` to `to` (its z), `w` x `d` across. Its x is the wearer's left made square to z, and its y is z x x, so x, y, z stay right-handed and y faces backward when z is up.
 */
function segment(from: THREE.Vector3, to: THREE.Vector3, w: number, d: number): BodyFrame {
  const z = to.clone().sub(from);
  const length = z.length();
  z.normalize();
  const x = LEFT.clone().addScaledVector(z, -LEFT.dot(z)).normalize();
  return { origin: from.clone(), x, y: z.clone().cross(x), z, size: v(w, d, length) };
}

/** A frame standing on `origin` with the figure's own axes turned by `turn`. */
function upright(origin: THREE.Vector3, size: THREE.Vector3, turn?: THREE.Matrix4): BodyFrame {
  const axis = (a: THREE.Vector3) => (turn ? a.clone().transformDirection(turn) : a.clone());
  return { origin, x: axis(LEFT), y: axis(BACK), z: axis(v(0, 0, 1)), size };
}

/**
 * The frames as the figure is built, before a reclining figure is laid down (`figureGeometry` lays the whole figure
 * down by `reclineMatrix`): standing, or sitting with the thighs forward. Human and humanoid plans; undefined for an
 * animal or unknown plan, which has no human skeleton.
 */
export function builtFrames(p: FigureParams): BodyFrames | undefined {
  const plan = p.plan.kind === "humanoid" ? p.plan : p.plan.kind === "human" ? undefined : null;
  if (plan === null) return undefined;
  const H = p.height;
  const s = H / 1.75;
  const sitting = p.posture === "sitting";
  const legTop = H * p.legShare;
  const seat = 0.26 * H;
  // Everything above the hips drops by this much when seated.
  const drop = sitting ? legTop - seat : 0;
  const hipZ = legTop - drop;
  const headR = p.headHeight / 2;
  const legR = p.limbRadius * 1.15;
  const hipX = p.hipHalf * 0.55;
  const ankleZ = 0.06 * s;
  const frames = {} as BodyFrames;

  // Legs and feet.
  for (const [side, name] of [[-1, "left"], [1, "right"]] as const) {
    const x = side * hipX;
    const hip = v(x, 0, hipZ);
    let knee: THREE.Vector3, ankle: THREE.Vector3, shinR = legR, thighR = legR;
    let foot: BodyFrame;
    if (sitting) {
      knee = v(x, 0.24 * H, seat);
      ankle = v(x, 0.24 * H, ankleZ + legR);
      shinR = legR * 0.9;
      foot = upright(v(x, 0.24 * H + 0.04 * s, 0), v(legR * 2.2, 0.16 * s, ankleZ));
    } else if (plan?.digitigrade) {
      // Standing on the toes: a short thigh a little forward to a high knee, a long shin back to a raised heel (the
      // shin's lower end), and the paw on the floor.
      knee = KNEE.clone().multiply(v(1, H, hipZ)).setX(x);
      ankle = HOCK.clone().multiplyScalar(H).setX(x);
      thighR = legR * 1.15;
      shinR = legR * 0.85;
      foot = upright(v(x, 0.06 * H, 0), v(legR * 2.1, legR * 3.57, ankleZ));
    } else {
      // The leg was one limb from the ankle to just under the hip; the knee is its middle.
      ankle = v(x, 0, ankleZ + legR);
      knee = ankle.clone().lerp(v(x, 0, hipZ - legR * 0.5), 0.5);
      foot = upright(v(x, 0.04 * s, 0), v(legR * 2.2, 0.16 * s, ankleZ));
    }
    frames[`${name}_thigh` as const] = segment(knee, hip, thighR * 2, thighR * 2);
    frames[`${name}_shin` as const] = segment(ankle, knee, shinR * 2, shinR * 2);
    frames[`${name}_foot` as const] = foot;
  }

  // The upper body, built upright from the hips and then leaned forward by a humanoid plan's hunch. Its length is
  // chosen so the crown, leaned, still comes to the box's top.
  const hunch = plan?.hunch ?? 0;
  const toBody = new THREE.Matrix4().makeTranslation(0, 0, hipZ).multiply(new THREE.Matrix4().makeRotationX(-hunch));
  const body = (x: number, y: number, z: number) => v(x, y, z).applyMatrix4(toBody);
  const tall = (H - drop - hipZ) / Math.cos(hunch);
  const neckBase = tall - p.headHeight - 0.045 * H;
  const waistZ = 0.05 * H;
  const shoulderZ = neckBase - p.limbRadius * 1.2;
  const neckR = 0.045 * s * (plan ? plan.shape.limbs * (plan.neckScale ?? 1) : 1);
  const leaned = (from: THREE.Vector3, to: THREE.Vector3, w: number, d: number) => segment(body(from.x, from.y, from.z), body(to.x, to.y, to.z), w, d);
  frames.waist = leaned(v(0, 0, -0.07 * H), v(0, 0, waistZ), p.hipHalf * 2, Math.max(p.hipHalf, p.waistHalf) * 2 * 0.62);
  frames.torso = leaned(v(0, 0, waistZ), v(0, 0, neckBase), p.shoulderHalf * 2, Math.max(p.waistHalf, p.shoulderHalf * 0.92) * 2 * 0.55);
  // Up into the head, to 0.6 head radii below its middle.
  frames.neck = leaned(v(0, 0, neckBase - 0.01), v(0, 0, tall - headR * 1.6), neckR * 2, neckR * 2);

  // The head, set back upright (so the face looks ahead, not at the floor), then drooped as a plan says.
  const headCentre = body(0, 0, tall - headR);
  const turn = plan ? new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(-plan.droop, plan.droop * 0.6, 0)) : undefined;
  const headUp = v(0, 0, 1).transformDirection(turn ?? new THREE.Matrix4());
  frames.head = upright(headCentre.clone().addScaledVector(headUp, -headR), v(2 * 0.84 * headR, 2 * 0.95 * headR, p.headHeight), turn);

  // Arms, hanging a little away from the body (a plan's to its wrist height, reaching forward by its angle); the
  // elbow is the middle of the arm. The hand hangs below the wrist, a plan's on along the arm.
  for (const [side, name] of [[-1, "left"], [1, "right"]] as const) {
    const shoulder = body(side * p.shoulderHalf, 0, shoulderZ);
    let wrist: THREE.Vector3;
    if (plan) {
      const wristZ = sitting ? hipZ + 0.02 * H : Math.max(0.05 * H, plan.wristShare * H);
      const fall = Math.max(0.12 * H, shoulder.z - wristZ);
      wrist = v(side * (p.hipHalf + p.limbRadius * 1.6), shoulder.y + Math.tan(plan.reach) * fall + (sitting ? 0.08 * s : 0), shoulder.z - fall);
    } else {
      wrist = v(side * (p.hipHalf + p.limbRadius * 1.6), sitting ? 0.08 * s : 0, hipZ - 0.02 * H);
    }
    const elbow = shoulder.clone().lerp(wrist, 0.5);
    const r = p.limbRadius;
    frames[`${name}_upper_arm` as const] = segment(elbow, shoulder, r * 2, r * 2);
    frames[`${name}_forearm` as const] = segment(wrist, elbow, r * 2, r * 2);
    const down = plan ? wrist.clone().sub(shoulder).normalize() : v(0, 0, -1);
    frames[`${name}_hand` as const] = segment(wrist.clone().addScaledVector(down, r * 2.55), wrist, r * 2.5, r * 2.5);
  }
  return frames;
}

/** Lying on the back: head toward -y, face up, back just above the floor, centred on the spot. */
export function reclineMatrix(p: Pick<FigureParams, "height">): THREE.Matrix4 {
  return new THREE.Matrix4().makeTranslation(0, p.height / 2, 0.13 * (p.height / 1.75)).multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
}

/** The frames as the figure is drawn in its own frame, in its posture: standing, sitting or reclining. */
export function figureFrames(p: FigureParams): BodyFrames | undefined {
  const frames = builtFrames(p);
  if (!frames || p.posture !== "reclining") return frames;
  const m = reclineMatrix(p);
  for (const f of Object.values(frames)) {
    f.origin.applyMatrix4(m);
    for (const a of [f.x, f.y, f.z]) a.transformDirection(m);
  }
  return frames;
}

/** The matrix taking frame units (u, v, t) to the figure's own frame. */
export function frameMatrix(f: BodyFrame): THREE.Matrix4 {
  return new THREE.Matrix4().makeBasis(f.x.clone().multiplyScalar(f.size.x), f.y.clone().multiplyScalar(f.size.y), f.z.clone().multiplyScalar(f.size.z)).setPosition(f.origin);
}
