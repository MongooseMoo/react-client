/**
 * Head-tracking math: the head's yaw from DeviceOrientationEvent poses, a
 * filter that removes its jitter, and turning the listener's facing by a head
 * yaw.
 *
 * Angles here run clockwise seen from above, the same sense as
 * `MediaService`'s listener yaw (`atan2(x, -z)` in Web Audio axes): a head
 * turned to the right is a positive yaw.
 */

export type Vector3 = [number, number, number];

const DEG = Math.PI / 180;

/** Wrap an angle in degrees into (-180, 180]. */
export function wrapDegrees(degrees: number): number {
  const wrapped = ((((degrees + 180) % 360) + 360) % 360) - 180;
  return wrapped === -180 ? 180 : wrapped;
}

/** The angles of a DeviceOrientationEvent, in degrees; null where the device has none. */
export interface OrientationAngles {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
}

/** A rotation as a unit quaternion [w, x, y, z], in earth axes (x east, y north, z up). */
export type Quaternion = [number, number, number, number];

function multiply(a: Quaternion, b: Quaternion): Quaternion {
  return [
    a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
    a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
    a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
    a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0],
  ];
}

/** A turn of `degrees` about the unit axis (x, y, z). */
function turn(degrees: number, x: number, y: number, z: number): Quaternion {
  const half = (degrees * DEG) / 2;
  const s = Math.sin(half);
  return [Math.cos(half), x * s, y * s, z * s];
}

/**
 * The pose of what the player faces with: the device's W3C Z-X'-Y'' rotation
 * (alpha about the earth's up axis, then beta about the device's x, then
 * gamma about its y), turned in the device's plane by the screen angle so its
 * "up" is the screen's up. Turning the device into landscape with the screen
 * then leaves this pose, and the head's yaw, where they were. Null when the
 * reading has no angles.
 */
export function devicePose(angles: OrientationAngles, screenAngle: number): Quaternion | null {
  const { alpha, beta, gamma } = angles;
  if (alpha === null || beta === null || gamma === null) {
    return null;
  }
  return multiply(
    multiply(multiply(turn(alpha, 0, 0, 1), turn(beta, 1, 0, 0)), turn(gamma, 0, 1, 0)),
    turn(-screenAngle, 0, 0, 1),
  );
}

export interface RelativeYaw {
  /** Degrees, (-180, 180], positive to the right. */
  yaw: number;
  /**
   * How well the pose determines the yaw, 0 to 1: cos(t / 2) for a tilt t
   * away from the reference about a horizontal axis. A wobble of d in the pose
   * moves the yaw by about d / conditioning, so near 0 (the device flipped over
   * from the reference) the yaw is meaningless.
   */
  conditioning: number;
}

/**
 * The head's yaw: how far the pose has turned about the vertical since the
 * `reference` pose (straight ahead, set by recentering), with how well that
 * is determined.
 *
 * It is the twist about the earth's up axis of the rotation from the
 * reference to the pose (a swing-twist decomposition). It depends only on the
 * two poses, so the same pose always gives the same yaw, whatever path led
 * there. A turn about the vertical is read in full, and a turn about an
 * earth-horizontal axis (nodding or rolling while level) adds nothing, however
 * the device is held or mounted. A roll about an axis that is not horizontal
 * (rolling sideways while tipped forward) couples partly into yaw: 30 degrees
 * of roll at 30 degrees of tip reads as about 15 degrees of turn.
 *
 * At a half turn about a horizontal axis from the reference (the device
 * flipped over), every vertical turn is the same pose: there the yaw is
 * undefined and `conditioning` is 0.
 */
export function yawFrom(reference: Quaternion, pose: Quaternion): RelativeYaw {
  const [w, , , z] = multiply(pose, [reference[0], -reference[1], -reference[2], -reference[3]]);
  return {
    // A right-handed twist about up is counter-clockwise; the yaw runs clockwise.
    yaw: wrapDegrees(0 - (2 * Math.atan2(z, w)) / DEG),
    conditioning: Math.hypot(w, z),
  };
}

export interface HeadingFilterOptions {
  /** Cutoff at rest, in Hz: lower removes more jitter while the head is still. */
  minCutoffHz: number;
  /** How fast the cutoff rises with turning speed (Hz per degree per second). */
  speedCoefficient: number;
  /** Cutoff for the turning-speed estimate, in Hz. */
  speedCutoffHz: number;
}

const DEFAULT_FILTER: HeadingFilterOptions = {
  minCutoffHz: 1,
  speedCoefficient: 0.05,
  speedCutoffHz: 4,
};

/** Fallback sample interval when timestamps repeat or run backwards. */
const DEFAULT_DT_S = 1 / 60;

function smoothing(cutoffHz: number, dtS: number): number {
  const tau = 1 / (2 * Math.PI * cutoffHz);
  return 1 / (1 + tau / dtS);
}

/**
 * A One Euro filter over a heading. It works on the unwrapped heading, so a
 * turn through 0/360 stays continuous instead of swinging the long way round,
 * and returns that unwrapped value. At rest its cutoff is low, which settles
 * sensor jitter; it rises with turning speed, so a quick turn arrives with
 * little lag.
 */
export class HeadingFilter {
  private readonly options: HeadingFilterOptions;
  private lastRaw: number | null = null;
  private unwrapped = 0;
  private value = 0;
  private speed = 0;
  private lastTimeMs = 0;

  constructor(options: Partial<HeadingFilterOptions> = {}) {
    this.options = { ...DEFAULT_FILTER, ...options };
  }

  reset(): void {
    this.lastRaw = null;
    this.speed = 0;
  }

  /** Whether the output has caught up with the latest heading (within a hundredth of a degree). */
  get settled(): boolean {
    return this.lastRaw === null || Math.abs(this.unwrapped - this.value) < 0.01;
  }

  /** Feed a heading in degrees taken at `timeMs`; returns the filtered unwrapped heading. */
  update(headingDegrees: number, timeMs: number): number {
    if (this.lastRaw === null) {
      this.lastRaw = headingDegrees;
      this.unwrapped = headingDegrees;
      this.value = headingDegrees;
      this.lastTimeMs = timeMs;
      return this.value;
    }
    const elapsed = (timeMs - this.lastTimeMs) / 1000;
    const dtS = elapsed > 0 ? elapsed : DEFAULT_DT_S;
    this.lastTimeMs = timeMs;
    this.unwrapped += wrapDegrees(headingDegrees - this.lastRaw);
    this.lastRaw = headingDegrees;

    const rawSpeed = (this.unwrapped - this.value) / dtS;
    this.speed += smoothing(this.options.speedCutoffHz, dtS) * (rawSpeed - this.speed);
    const cutoff = this.options.minCutoffHz + this.options.speedCoefficient * Math.abs(this.speed);
    this.value += smoothing(cutoff, dtS) * (this.unwrapped - this.value);
    return this.value;
  }
}

/**
 * The facing `forward` turned by `yaw` radians about the `up` axis, clockwise
 * seen from above (from the tip of `up`): the head's turn applied to the body.
 * Up itself does not change under a turn about it.
 */
export function turnAboutUp(forward: Vector3, up: Vector3, yaw: number): Vector3 {
  if (yaw === 0) {
    return forward;
  }
  const length = Math.hypot(up[0], up[1], up[2]);
  if (!(length > 0)) {
    return forward;
  }
  const k: Vector3 = [up[0] / length, up[1] / length, up[2] / length];
  // Rodrigues' rotation by -yaw about k (a right-handed turn about up is counter-clockwise).
  const cos = Math.cos(-yaw);
  const sin = Math.sin(-yaw);
  const cross: Vector3 = [
    k[1] * forward[2] - k[2] * forward[1],
    k[2] * forward[0] - k[0] * forward[2],
    k[0] * forward[1] - k[1] * forward[0],
  ];
  const along = (k[0] * forward[0] + k[1] * forward[1] + k[2] * forward[2]) * (1 - cos);
  return [
    forward[0] * cos + cross[0] * sin + k[0] * along,
    forward[1] * cos + cross[1] * sin + k[1] * along,
    forward[2] * cos + cross[2] * sin + k[2] * along,
  ];
}
