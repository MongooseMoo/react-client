/**
 * Head-tracking math: the device's heading from a DeviceOrientationEvent, a
 * filter that removes its jitter, and turning the listener's facing by a head
 * yaw.
 *
 * Angles here run clockwise seen from above, the same sense as
 * `MediaService`'s listener yaw (`atan2(x, -z)` in Web Audio axes): a head
 * turned to the right is a positive yaw.
 */

export type Vector3 = [number, number, number];

const DEG = Math.PI / 180;

/** Below this horizontal length the device's facing is too close to vertical to read. */
const MIN_HORIZONTAL = 1e-3;

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

/**
 * The device's heading in degrees [0, 360), clockwise from the sensor's zero,
 * or null when the reading has no angles or the device faces straight up or
 * down.
 *
 * The device's pose is the W3C Z-X'-Y'' rotation (alpha about the earth's
 * up axis, then beta, then gamma). The facing it reads is the screen's up
 * direction plus the device's back, flattened onto the ground: a device held
 * flat faces where the top of its screen points, a device held upright faces
 * where its back points, and anything between agrees with both. The screen's
 * up is the device's +y turned by `screenAngle` (screen.orientation.angle),
 * so turning the device into landscape does not move the heading.
 */
export function deviceHeading(angles: OrientationAngles, screenAngle: number): number | null {
  const { alpha, beta, gamma } = angles;
  if (alpha === null || beta === null || gamma === null) {
    return null;
  }
  const cA = Math.cos(alpha * DEG);
  const sA = Math.sin(alpha * DEG);
  const cB = Math.cos(beta * DEG);
  const sB = Math.sin(beta * DEG);
  const cG = Math.cos(gamma * DEG);
  const sG = Math.sin(gamma * DEG);
  // Facing in device axes: screen up (+y turned by the screen angle) plus back (-z).
  const vx = Math.sin(screenAngle * DEG);
  const vy = Math.cos(screenAngle * DEG);
  const vz = -1;
  // First two rows of Rz(alpha) * Rx(beta) * Ry(gamma): earth east and north.
  const east = (cA * cG - sA * sB * sG) * vx - sA * cB * vy + (cA * sG + sA * sB * cG) * vz;
  const north = (sA * cG + cA * sB * sG) * vx + cA * cB * vy + (sA * sG - cA * sB * cG) * vz;
  if (Math.hypot(east, north) < MIN_HORIZONTAL) {
    return null;
  }
  const heading = Math.atan2(east, north) / DEG;
  return heading < 0 ? heading + 360 : heading;
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
