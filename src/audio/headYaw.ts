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

/**
 * Hysteresis for the facing axis, as the horizontal length of the device's
 * back: above BACK_ON the back is the facing, below SCREEN_UP_ON the screen's
 * up is. Between them the axis in use stays.
 */
const BACK_ON = 0.6;
const SCREEN_UP_ON = 0.4;

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

/** A device vector in earth axes (east, north, up) under the W3C Z-X'-Y'' pose. */
function toEarth(alpha: number, beta: number, gamma: number, v: Vector3): Vector3 {
  const cA = Math.cos(alpha * DEG);
  const sA = Math.sin(alpha * DEG);
  const cB = Math.cos(beta * DEG);
  const sB = Math.sin(beta * DEG);
  const cG = Math.cos(gamma * DEG);
  const sG = Math.sin(gamma * DEG);
  // Rz(alpha) * Rx(beta) * Ry(gamma), applied to v.
  return [
    (cA * cG - sA * sB * sG) * v[0] - sA * cB * v[1] + (cA * sG + sA * sB * cG) * v[2],
    (sA * cG + cA * sB * sG) * v[0] + cA * cB * v[1] + (sA * sG - cA * sB * cG) * v[2],
    -cB * sG * v[0] + sB * v[1] + cB * cG * v[2],
  ];
}

/** Compass azimuth of an earth vector, degrees clockwise from north. */
function azimuth(v: Vector3): number {
  return Math.atan2(v[0], v[1]) / DEG;
}

type FacingAxis = 'back' | 'screen-up';

/**
 * The device's heading in degrees [0, 360), clockwise from the sensor's zero.
 *
 * The pose is the W3C Z-X'-Y'' rotation (alpha about the earth's up axis,
 * then beta, then gamma). The heading is the compass direction of one device
 * axis, the facing: the device's back while it is held upright (its back's
 * horizontal length above {@link BACK_ON}), the screen's up while it lies
 * flat (below {@link SCREEN_UP_ON}), and between those, whichever was in use.
 * A roll about the facing axis cannot move where that axis points, so a head
 * tilted sideways does not turn the scene. The two axes are perpendicular, so
 * whichever is in use is at least 0.4 horizontal (the back) or 0.8 (the
 * screen's up): neither is ever read near vertical.
 *
 * The screen's up is the device's +y turned by `screenAngle`
 * (screen.orientation.angle), so turning the device into landscape with the
 * screen does not move the heading. When the axis changes, an offset carries
 * the heading across, so the output never jumps; turns after it read in full.
 * The object keeps that axis and offset, so use one per tracking session.
 */
export class FacingHeading {
  private axis: FacingAxis | null = null;
  private offset = 0;

  reset(): void {
    this.axis = null;
    this.offset = 0;
  }

  /** The heading of a reading, or null when it has no angles. */
  read(angles: OrientationAngles, screenAngle: number): number | null {
    const { alpha, beta, gamma } = angles;
    if (alpha === null || beta === null || gamma === null) {
      return null;
    }
    const back = toEarth(alpha, beta, gamma, [0, 0, -1]);
    const screenUp = toEarth(alpha, beta, gamma, [
      Math.sin(screenAngle * DEG),
      Math.cos(screenAngle * DEG),
      0,
    ]);
    const backHorizontal = Math.hypot(back[0], back[1]);
    const headingOf = (axis: FacingAxis) => azimuth(axis === 'back' ? back : screenUp);

    let axis: FacingAxis;
    if (this.axis === null) {
      axis = backHorizontal >= (BACK_ON + SCREEN_UP_ON) / 2 ? 'back' : 'screen-up';
    } else if (this.axis === 'back' && backHorizontal < SCREEN_UP_ON) {
      axis = 'screen-up';
    } else if (this.axis === 'screen-up' && backHorizontal > BACK_ON) {
      axis = 'back';
    } else {
      axis = this.axis;
    }
    if (this.axis !== null && axis !== this.axis) {
      this.offset = wrapDegrees(this.offset + headingOf(this.axis) - headingOf(axis));
    }
    this.axis = axis;
    const heading = (headingOf(axis) + this.offset) % 360;
    return heading < 0 ? heading + 360 : heading;
  }
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

  /** Jump the output to the latest heading (unwrapped) and return it: nothing left to glide. */
  snap(): number {
    this.value = this.unwrapped;
    this.speed = 0;
    return this.value;
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
