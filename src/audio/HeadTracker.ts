import { deviceHeading, HeadingFilter, wrapDegrees, type OrientationAngles } from './headYaw';

const DEG = Math.PI / 180;

/** A change smaller than this (degrees) is not sent on: below sensor noise and hearing. */
const MIN_STEP_DEGREES = 0.05;
/** How often the last heading is fed again while the filter catches up to it. */
const SETTLE_MS = 1000 / 60;

export interface HeadTrackerOptions {
  /** Where deviceorientation events arrive: the window. */
  target: Pick<EventTarget, 'addEventListener' | 'removeEventListener'>;
  /** screen.orientation.angle, read on every reading. */
  screenAngle: () => number;
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
 * ahead". The first reading after `start` is straight ahead; `recenter` makes
 * the current heading straight ahead again. Readings are filtered
 * ({@link HeadingFilter}) and only a change of at least
 * {@link MIN_STEP_DEGREES} is sent on.
 *
 * Browsers send a reading only when the device's pose changes (Chromium does),
 * so a device held still goes quiet while the filter is still gliding toward
 * its last heading. Until the filter settles, the last heading is fed again
 * every {@link SETTLE_MS}, so the yaw always lands on where the device points.
 */
export class HeadTracker {
  private readonly options: HeadTrackerOptions;
  private readonly filter = new HeadingFilter();
  private listening = false;
  /** The filtered, unwrapped heading of the latest reading; null before one. */
  private heading: number | null = null;
  /** The unwrapped heading that is straight ahead; null until a reading sets it. */
  private reference: number | null = null;
  private sentDegrees: number | null = null;
  /** The latest raw heading, fed again while the filter settles. */
  private rawHeading: number | null = null;
  private settleTimer: number | null = null;

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
    this.filter.reset();
    this.heading = null;
    this.reference = null;
    this.sentDegrees = null;
    this.options.target.addEventListener('deviceorientation', this.handleOrientation);
  }

  stop(): void {
    if (!this.listening) {
      return;
    }
    this.listening = false;
    this.options.target.removeEventListener('deviceorientation', this.handleOrientation);
    this.clearSettleTimer();
    this.rawHeading = null;
    this.heading = null;
    this.reference = null;
    this.sentDegrees = null;
    this.options.onYaw(0);
  }

  /** Make the current heading straight ahead (or the next reading, before there is one). */
  recenter(): void {
    this.reference = this.heading;
    if (this.heading !== null) {
      this.send(true);
    }
  }

  private readonly handleOrientation = (event: Event): void => {
    const heading = deviceHeading(orientationAngles(event), this.options.screenAngle());
    if (heading === null) {
      return;
    }
    this.rawHeading = heading;
    this.feed(heading);
  };

  private feed(heading: number): void {
    this.clearSettleTimer();
    this.heading = this.filter.update(heading, this.options.now());
    this.reference ??= this.heading;
    this.send(false);
    if (!this.filter.settled) {
      this.settleTimer = this.options.setTimer(() => {
        this.settleTimer = null;
        if (this.rawHeading !== null) {
          this.feed(this.rawHeading);
        }
      }, SETTLE_MS);
    }
  }

  private clearSettleTimer(): void {
    if (this.settleTimer !== null) {
      this.options.clearTimer(this.settleTimer);
      this.settleTimer = null;
    }
  }

  private send(force: boolean): void {
    const yaw = this.yawDegrees;
    if (!force && this.sentDegrees !== null && Math.abs(wrapDegrees(yaw - this.sentDegrees)) < MIN_STEP_DEGREES) {
      return;
    }
    this.sentDegrees = yaw;
    this.options.onYaw(yaw * DEG);
  }
}
