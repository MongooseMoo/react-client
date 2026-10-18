import { FacingHeading, HeadingFilter, wrapDegrees, type OrientationAngles } from './headYaw';

const DEG = Math.PI / 180;

/** While the head moves, a change smaller than this (degrees) is not sent on. */
const MIN_STEP_DEGREES = 0.05;
/** The output frame: at most one yaw is sent per frame, however fast the sensor reads. */
const FRAME_MS = 1000 / 60;

export interface HeadTrackerOptions {
  /** Where deviceorientation events arrive: the window. */
  target: Pick<EventTarget, 'addEventListener' | 'removeEventListener'>;
  /** screen.orientation.angle, read on every reading. */
  screenAngle: () => number;
  /** Subscribe to screen-angle changes; returns the unsubscribe. */
  onScreenChange: (listener: () => void) => () => void;
  /** Milliseconds, for the filter's sample intervals. */
  now: () => number;
  setTimer: (callback: () => void, ms: number) => number;
  clearTimer: (id: number) => void;
  /** Receives the head yaw in radians, clockwise from straight ahead. */
  onYaw: (yaw: number) => void;
}

function angle(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** The angles of a deviceorientation event; null for each one the device lacks. */
export function orientationAngles(event: Event): OrientationAngles {
  return {
    alpha: 'alpha' in event ? angle(event.alpha) : null,
    beta: 'beta' in event ? angle(event.beta) : null,
    gamma: 'gamma' in event ? angle(event.gamma) : null,
  };
}

/**
 * Turns deviceorientation readings into a head yaw relative to "straight
 * ahead". The first reading after `start` is straight ahead and is sent at
 * once; `recenter` makes the current heading straight ahead again, also at
 * once. Everything else is sent from one output frame every
 * {@link FRAME_MS}: readings feed the filter ({@link HeadingFilter}) as they
 * arrive, and each frame sends the filtered yaw if it moved by
 * {@link MIN_STEP_DEGREES} (or at all, once the filter has settled, so the
 * yaw lands exactly).
 *
 * Browsers send a reading only when the device's pose changes (Chromium does),
 * so a device held still goes quiet while the filter is still gliding. A frame
 * with no new reading feeds the last heading again, until the filter settles
 * and the frames stop. The latest raw angles are kept, so a screen rotation
 * that lands after the last reading is applied too.
 */
export class HeadTracker {
  private readonly options: HeadTrackerOptions;
  private readonly filter = new HeadingFilter();
  private readonly facing = new FacingHeading();
  private listening = false;
  /** The filtered, unwrapped heading; null before a reading. */
  private heading: number | null = null;
  /** The unwrapped heading that is straight ahead; null until a reading sets it. */
  private reference: number | null = null;
  private sentDegrees: number | null = null;
  /** The latest reading's angles, kept to recompute when the screen turns. */
  private angles: OrientationAngles | null = null;
  /** The latest raw heading, fed again while the filter settles. */
  private rawHeading: number | null = null;
  /** A reading arrived since the last frame. */
  private fresh = false;
  private frameTimer: number | null = null;
  private unsubscribeScreen: (() => void) | null = null;

  constructor(options: HeadTrackerOptions) {
    this.options = options;
  }

  /** Whether a reading with angles has arrived since `start`. */
  get hasReading(): boolean {
    return this.heading !== null;
  }

  /** The current head yaw in degrees, (-180, 180], positive to the right. */
  get yawDegrees(): number {
    return this.heading === null || this.reference === null
      ? 0
      : wrapDegrees(this.heading - this.reference);
  }

  start(): void {
    if (this.listening) {
      return;
    }
    this.listening = true;
    this.clear();
    this.options.target.addEventListener('deviceorientation', this.handleOrientation);
    this.unsubscribeScreen = this.options.onScreenChange(this.handleScreenChange);
  }

  stop(): void {
    if (!this.listening) {
      return;
    }
    this.listening = false;
    this.options.target.removeEventListener('deviceorientation', this.handleOrientation);
    this.unsubscribeScreen?.();
    this.unsubscribeScreen = null;
    this.clear();
    this.options.onYaw(0);
  }

  /**
   * Make where the device points now straight ahead (or the next reading,
   * before there is one). The filter jumps to the latest heading first, so
   * nothing left of its glide turns the scene after the recenter.
   */
  recenter(): void {
    if (this.rawHeading === null) {
      this.reference = null;
      return;
    }
    this.heading = this.filter.snap();
    this.reference = this.heading;
    this.send(0);
  }

  private clear(): void {
    if (this.frameTimer !== null) {
      this.options.clearTimer(this.frameTimer);
      this.frameTimer = null;
    }
    this.filter.reset();
    this.facing.reset();
    this.heading = null;
    this.reference = null;
    this.sentDegrees = null;
    this.angles = null;
    this.rawHeading = null;
    this.fresh = false;
  }

  private readonly handleOrientation = (event: Event): void => {
    this.angles = orientationAngles(event);
    this.take();
  };

  private readonly handleScreenChange = (): void => {
    if (this.angles) {
      this.take();
    }
  };

  /** Read the kept angles at the current screen angle into the filter. */
  private take(): void {
    if (!this.angles) {
      return;
    }
    const heading = this.facing.read(this.angles, this.options.screenAngle());
    if (heading === null) {
      return;
    }
    this.rawHeading = heading;
    this.heading = this.filter.update(heading, this.options.now());
    this.fresh = true;
    if (this.reference === null) {
      this.reference = this.heading;
      this.send(0);
    }
    this.frameTimer ??= this.options.setTimer(this.frame, FRAME_MS);
  }

  private readonly frame = (): void => {
    this.frameTimer = null;
    const hadReading = this.fresh;
    this.fresh = false;
    if (!hadReading && this.rawHeading !== null && !this.filter.settled) {
      this.heading = this.filter.update(this.rawHeading, this.options.now());
    }
    const settled = this.filter.settled;
    this.send(settled ? 0 : MIN_STEP_DEGREES);
    if (hadReading || !settled) {
      this.frameTimer = this.options.setTimer(this.frame, FRAME_MS);
    }
  };

  /** Send the yaw if it moved by more than `minStep` degrees (any change when 0). */
  private send(minStep: number): void {
    const yaw = this.yawDegrees;
    if (this.sentDegrees !== null) {
      const moved = Math.abs(wrapDegrees(yaw - this.sentDegrees));
      if (moved === 0 || moved < minStep) {
        return;
      }
    }
    this.sentDegrees = yaw;
    this.options.onYaw(yaw * DEG);
  }
}
