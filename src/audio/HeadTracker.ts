import {
  devicePose,
  HeadingFilter,
  type OrientationAngles,
  type Quaternion,
  wrapDegrees,
  yawFrom,
} from './headYaw';

const DEG = Math.PI / 180;

/** While the head moves, a change smaller than this (degrees) is not sent on. */
const MIN_STEP_DEGREES = 0.05;
/** The output frame: at most one yaw is sent per frame, however fast the sensor reads. */
const FRAME_MS = 1000 / 60;

/**
 * The badly conditioned region around the flipped-over pose, by
 * {@link RelativeYaw.conditioning}, which is cos(s / 2) for a tilt (swing) s
 * away from the straight-ahead pose. Two things grow as s nears 180: sensor
 * noise, moved into the yaw about 1 / conditioning times; and the coupling of
 * a tilt about a not-quite-horizontal axis (a phone rolled when recentered)
 * into yaw, which grows like tan(s / 2). Flipping a phone recentered with a
 * 20 degree roll swings it about 150 degrees and reads as a turn of over 100.
 * So readings are held from a tilt of 120 degrees (ILL_ENTER 0.5: noise at
 * most doubled, coupling factor tan 60 = 1.7) until it is back under about
 * 105 (ILL_LEAVE 0.61); the gap keeps a pose near the edge from flickering in
 * and out. Ordinary handling stays well inside: tipping a phone from flat to
 * upright is a tilt of 90 (conditioning 0.71). Leaning back past about 120
 * from where it was recentered (lying down, phone overhead) pauses tracking.
 */
const ILL_ENTER = 0.5;
const ILL_LEAVE = 0.61;
/** Held this long, tracking pauses and says so. */
const PAUSE_AFTER_MS = 2000;
/**
 * Coming out of a hold this far or more from the held yaw would swing the
 * scene, so tracking pauses instead, until the device points back within it
 * or the player recenters.
 */
const RESUME_WITHIN_DEGREES = 20;

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
  /** Tracking paused (true: the yaw is held until the device points back, or a recenter) or resumed. */
  onPausedChange: (paused: boolean) => void;
}

function angle(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Whether a reading has all three angles, finite: what tracking needs, and so what detection counts. */
export function hasAllAngles(angles: OrientationAngles): boolean {
  return angles.alpha !== null && angles.beta !== null && angles.gamma !== null;
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
 * The raw yaw of a reading is {@link yawFrom} the straight-ahead pose: a
 * function of that pose and the reading alone, so returning to a pose returns
 * to its yaw. Near the flipped-over pose the yaw means nothing, so readings
 * there are held (see {@link ILL_ENTER}); a hold longer than
 * {@link PAUSE_AFTER_MS}, or one left far from the held yaw, pauses tracking.
 *
 * Browsers send a reading only when the device's pose changes (Chromium does),
 * so a device held still goes quiet while the filter is still gliding. A frame
 * with no new reading feeds the last raw yaw again, until the filter settles
 * and the frames stop. The latest raw angles are kept, so a screen rotation
 * that lands after the last reading is applied too.
 */
export class HeadTracker {
  private readonly options: HeadTrackerOptions;
  private readonly filter = new HeadingFilter();
  private listening = false;
  /** The pose that is straight ahead; null until a reading (or a recenter) sets it. */
  private reference: Quaternion | null = null;
  /** The filtered, unwrapped yaw in degrees; null before a reading. */
  private heading: number | null = null;
  private sentDegrees: number | null = null;
  /** The latest reading's angles, kept to recompute when the screen turns. */
  private angles: OrientationAngles | null = null;
  /** The latest raw yaw, fed again while the filter settles. */
  private rawYaw: number | null = null;
  /** A reading arrived since the last frame. */
  private fresh = false;
  private frameTimer: number | null = null;
  private unsubscribeScreen: (() => void) | null = null;
  /** Readings are in the badly conditioned region: held. */
  private holding = false;
  /** Paused: the yaw stays held until the device points back or the player recenters. */
  private paused = false;
  private pauseTimer: number | null = null;

  constructor(options: HeadTrackerOptions) {
    this.options = options;
  }

  /** Whether a reading with angles has arrived since `start`. */
  get hasReading(): boolean {
    return this.heading !== null;
  }

  /** The current head yaw in degrees, (-180, 180], positive to the right. */
  get yawDegrees(): number {
    return this.heading === null ? 0 : wrapDegrees(this.heading);
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
    const wasPaused = this.paused;
    this.clear();
    this.options.onYaw(0);
    if (wasPaused) {
      this.options.onPausedChange(false);
    }
  }

  /**
   * Make the latest pose straight ahead (or the next reading's, before there
   * is one). The filter starts again at 0, so nothing left of its glide turns
   * the scene after the recenter.
   */
  recenter(): void {
    const pose = this.angles ? devicePose(this.angles, this.options.screenAngle()) : null;
    if (!pose || this.heading === null) {
      this.reference = null;
      return;
    }
    // The latest pose is level with itself: any hold or pause is over.
    this.reference = pose;
    this.holding = false;
    this.clearPauseTimer();
    this.filter.reset();
    this.rawYaw = 0;
    this.heading = this.filter.update(0, this.options.now());
    this.send(0);
    this.setPaused(false);
  }

  private clear(): void {
    if (this.frameTimer !== null) {
      this.options.clearTimer(this.frameTimer);
      this.frameTimer = null;
    }
    this.clearPauseTimer();
    this.holding = false;
    this.paused = false;
    this.filter.reset();
    this.reference = null;
    this.heading = null;
    this.sentDegrees = null;
    this.angles = null;
    this.rawYaw = null;
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
    const pose = this.angles ? devicePose(this.angles, this.options.screenAngle()) : null;
    if (!pose) {
      return;
    }
    const first = this.reference === null;
    this.reference ??= pose;
    const { yaw, conditioning } = yawFrom(this.reference, pose);
    if (conditioning < (this.holding ? ILL_LEAVE : ILL_ENTER)) {
      if (!this.holding) {
        this.holding = true;
        this.pauseTimer = this.options.setTimer(() => {
          this.pauseTimer = null;
          this.setPaused(true);
        }, PAUSE_AFTER_MS);
      }
      return;
    }
    const leftHold = this.holding;
    if (leftHold) {
      this.holding = false;
      this.clearPauseTimer();
    }
    if (leftHold || this.paused) {
      // Resume only near what the player hears now; anything further would swing the scene.
      if (Math.abs(wrapDegrees(yaw - this.yawDegrees)) > RESUME_WITHIN_DEGREES) {
        this.setPaused(true);
        return;
      }
      this.setPaused(false);
    }
    this.rawYaw = yaw;
    this.heading = this.filter.update(yaw, this.options.now());
    this.fresh = true;
    if (first) {
      this.send(0);
    }
    this.frameTimer ??= this.options.setTimer(this.frame, FRAME_MS);
  }

  private readonly frame = (): void => {
    this.frameTimer = null;
    const hadReading = this.fresh;
    this.fresh = false;
    if (!hadReading && this.rawYaw !== null && !this.filter.settled) {
      this.heading = this.filter.update(this.rawYaw, this.options.now());
    }
    const settled = this.filter.settled;
    this.send(settled ? 0 : MIN_STEP_DEGREES);
    if (hadReading || !settled) {
      this.frameTimer = this.options.setTimer(this.frame, FRAME_MS);
    }
  };

  private setPaused(paused: boolean): void {
    if (paused === this.paused) {
      return;
    }
    this.paused = paused;
    this.options.onPausedChange(paused);
  }

  private clearPauseTimer(): void {
    if (this.pauseTimer !== null) {
      this.options.clearTimer(this.pauseTimer);
      this.pauseTimer = null;
    }
  }

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
