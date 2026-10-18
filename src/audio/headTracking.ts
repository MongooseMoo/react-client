import { announce } from '@react-aria/live-announcer';
import { create } from 'zustand';

import { isHeadRecenterShortcut } from '../reservedShortcuts';
import { usePreferences } from '../stores/preferencesStore';
import { HeadTracker, hasAllAngles, orientationAngles } from './HeadTracker';

/**
 * Whether this device can track the head: `available` once a reading with
 * all three angles has arrived (what tracking needs, {@link hasAllAngles}), `needs-permission` where the browser sends none until
 * the player allows motion access (iOS), `none` when no such reading came,
 * `unknown` while the first check listens, `checking` while a check the
 * player asked for listens. Desktops define DeviceOrientationEvent and may
 * send one reading with null angles, so only real angles count.
 */
export type SensorAvailability = 'unknown' | 'checking' | 'available' | 'needs-permission' | 'none';

/**
 * `waiting`: on, no reading yet. `no-readings`: on, but none arrived in
 * {@link NO_READING_MS}. `blocked`: the player refused motion access.
 * `paused`: the device is near the flipped-over pose, or came out of it
 * pointing elsewhere; the yaw is held until it points back or a recenter.
 */
export type HeadTrackingStatus = 'off' | 'waiting' | 'tracking' | 'paused' | 'no-readings' | 'blocked';

export interface HeadTrackingState {
  sensor: SensorAvailability;
  status: HeadTrackingStatus;
  /** The head's turn from straight ahead in degrees, positive right; refreshed at most every READOUT_MS. */
  yawDegrees: number;
}

export const useHeadTrackingStore = create<HeadTrackingState>()(() => ({
  sensor: 'unknown',
  status: 'off',
  yawDegrees: 0,
}));

/** Where the head yaw goes: MediaService. */
export interface HeadYawSink {
  setHeadYaw(yaw: number): void;
  /** Tracking on (glide every listener path) or off (the server-driven policy, exactly). */
  setHeadTracking(active: boolean): void;
}

export interface HeadTrackingEnvironment {
  target: Pick<EventTarget, 'addEventListener' | 'removeEventListener'>;
  screenAngle: () => number;
  /** Subscribe to screen-angle changes; returns the unsubscribe. */
  onScreenChange: (listener: () => void) => () => void;
  now: () => number;
  /** DeviceOrientationEvent.requestPermission where the browser has one. */
  permissionRequest: () => (() => Promise<string>) | undefined;
  setTimer: (callback: () => void, ms: number) => number;
  clearTimer: (id: number) => void;
  announce: (message: string) => void;
}

/** How long to listen for a first real reading before deciding there is no sensor. */
const PROBE_MS = 3000;
/** How long after turning on before saying no readings have arrived. */
const NO_READING_MS = 3000;
/** The readout refresh: the head bearing changes every frame, a person reads it far slower. */
const READOUT_MS = 250;

/**
 * Head tracking's lifecycle: detects the sensor, asks for motion permission,
 * follows the `sound.headTracking` preference, and feeds the {@link HeadTracker}'s
 * yaw to the media service. One instance serves the app ({@link headTracking});
 * `attach` binds it to a media service for as long as that service lives.
 */
export class HeadTrackingController {
  private readonly env: HeadTrackingEnvironment;
  private readonly tracker: HeadTracker;
  private sink: HeadYawSink | null = null;
  private probeTimer: number | null = null;
  private noReadingTimer: number | null = null;
  private readoutTimer: number | null = null;
  private lastReadoutMs = Number.NEGATIVE_INFINITY;
  /** The player turned it on in this session, so a missing reading is worth saying aloud. */
  private startedByPlayer = false;
  /** A recenter or stop ends a pause; what it announces itself is enough. */
  private quietResume = false;
  /** Motion access was granted in this session (a permission-gated browser). */
  private permissionGranted = false;

  constructor(env: HeadTrackingEnvironment) {
    this.env = env;
    this.tracker = new HeadTracker({
      target: env.target,
      screenAngle: env.screenAngle,
      onScreenChange: env.onScreenChange,
      now: env.now,
      setTimer: env.setTimer,
      clearTimer: env.clearTimer,
      onYaw: (yaw) => this.handleYaw(yaw),
      onPausedChange: (paused) => this.handlePausedChange(paused),
    });
  }

  attach(sink: HeadYawSink): () => void {
    this.sink = sink;
    const unsubscribe = usePreferences.subscribe(
      (state) => state.sound.headTracking,
      (enabled) => (enabled ? this.startTracking() : this.stopTracking()),
      { fireImmediately: true },
    );
    this.startProbe();
    return () => {
      unsubscribe();
      // Stops a running availability check too.
      this.stopTracking();
      this.sink = null;
    };
  }

  /**
   * Turn head tracking on. Call it straight from the player's click or key
   * press: iOS grants motion access only inside a user gesture, so the
   * permission request is made before anything is awaited.
   */
  async enable(): Promise<void> {
    const request = this.env.permissionRequest();
    if (request) {
      let result: string;
      try {
        result = await request();
      } catch {
        result = 'denied';
      }
      if (result !== 'granted') {
        this.stopProbe();
        this.setPreference(false);
        useHeadTrackingStore.setState({ status: 'blocked' });
        this.env.announce('Motion access was not allowed, so head tracking is off.');
        return;
      }
      this.permissionGranted = true;
    }
    this.env.announce('Head tracking on. Straight ahead is the way you face now.');
    if (usePreferences.getState().sound.headTracking) {
      // Already on but without readings (permission had lapsed): start over.
      this.stopTracking();
      this.startedByPlayer = true;
      this.startTracking();
      return;
    }
    this.startedByPlayer = true;
    this.setPreference(true);
  }

  disable(): void {
    this.setPreference(false);
    this.env.announce('Head tracking off.');
  }

  recenter(): void {
    if (useHeadTrackingStore.getState().status === 'off') {
      this.env.announce('Head tracking is off.');
      return;
    }
    this.quietResume = true;
    const done = this.tracker.recenter();
    this.quietResume = false;
    this.publishReadout(true);
    this.env.announce(
      done ? 'Recentered. Straight ahead is the way you face now.' : 'Recentering on the next reading.',
    );
  }

  /** The app-wide keydown handler's share: Alt+Shift+O recenters. */
  handleKeyDown(event: KeyboardEvent): void {
    if (!isHeadRecenterShortcut(event)) {
      return;
    }
    event.preventDefault();
    this.recenter();
  }

  private setPreference(headTracking: boolean): void {
    const { sound, setSound } = usePreferences.getState();
    if (sound.headTracking !== headTracking) {
      setSound({ ...sound, headTracking });
    }
  }

  private startTracking(): void {
    if (!this.sink) {
      return;
    }
    useHeadTrackingStore.setState({ status: 'waiting', yawDegrees: 0 });
    this.sink.setHeadTracking(true);
    this.tracker.start();
    this.clearNoReadingTimer();
    this.noReadingTimer = this.env.setTimer(() => {
      this.noReadingTimer = null;
      if (this.tracker.hasReading) {
        return;
      }
      const announceIt = this.startedByPlayer;
      if (this.env.permissionRequest() && !this.permissionGranted) {
        // Behind a permission gate not yet passed this session (iOS forgets it across
        // reloads): no readings means no permission yet, so ask again rather than give up.
        useHeadTrackingStore.setState({ status: 'no-readings' });
        if (announceIt) {
          this.env.announce('No motion readings yet. Use Allow motion access to try again.');
        }
        return;
      }
      // Nothing gated it and still no complete reading: there is no sensor to wait for.
      // Off, with "Check again" in the controls; said aloud only when the player turned
      // it on, not when a saved preference restored it at load.
      useHeadTrackingStore.setState({ sensor: 'none' });
      this.setPreference(false);
      if (announceIt) {
        this.env.announce('No motion sensor found. Head tracking is off.');
      }
    }, NO_READING_MS);
  }

  private stopTracking(): void {
    this.clearNoReadingTimer();
    this.clearReadoutTimer();
    this.startedByPlayer = false;
    // The tracker hands back a zero yaw as it stops; the sink then puts back the
    // server-driven smoothing and writes the server facing exactly.
    this.quietResume = true;
    this.tracker.stop();
    this.quietResume = false;
    this.sink?.setHeadTracking(false);
    // Off means no sensor work at all, a running availability check included.
    if (this.probeTimer !== null) {
      this.stopProbe();
    }
    useHeadTrackingStore.setState((state) => ({
      status: state.status === 'blocked' ? 'blocked' : 'off',
      yawDegrees: 0,
    }));
  }

  private handleYaw(yaw: number): void {
    this.sink?.setHeadYaw(yaw);
    if (!this.tracker.hasReading) {
      return;
    }
    const { status } = useHeadTrackingStore.getState();
    if (status === 'waiting' || status === 'no-readings') {
      this.clearNoReadingTimer();
      useHeadTrackingStore.setState({ status: 'tracking', sensor: 'available' });
    }
    this.publishReadout(false);
  }

  private handlePausedChange(paused: boolean): void {
    if (paused) {
      useHeadTrackingStore.setState({ status: 'paused' });
      this.env.announce('Head tracking paused. Recenter to resume, or turn back to where you were facing.');
      return;
    }
    useHeadTrackingStore.setState({ status: 'tracking' });
    if (!this.quietResume) {
      this.env.announce('Head tracking resumed.');
    }
  }

  /** Refresh the readout now if it is due (or forced), else once the interval is up. */
  private publishReadout(force: boolean): void {
    const wait = READOUT_MS - (this.env.now() - this.lastReadoutMs);
    if (force || wait <= 0) {
      this.clearReadoutTimer();
      this.lastReadoutMs = this.env.now();
      useHeadTrackingStore.setState({ yawDegrees: this.tracker.yawDegrees });
      return;
    }
    this.readoutTimer ??= this.env.setTimer(() => {
      this.readoutTimer = null;
      this.publishReadout(true);
    }, wait);
  }

  private clearReadoutTimer(): void {
    if (this.readoutTimer !== null) {
      this.env.clearTimer(this.readoutTimer);
      this.readoutTimer = null;
    }
  }

  private clearNoReadingTimer(): void {
    if (this.noReadingTimer !== null) {
      this.env.clearTimer(this.noReadingTimer);
      this.noReadingTimer = null;
    }
  }

  /**
   * Find out whether there is a sensor, listening for at most {@link PROBE_MS}.
   * Where the browser asks for motion access first, nothing is sent before it
   * is asked, so nothing is listened for: the toggle shows, and tracking finds
   * out once the player allows it.
   */
  private startProbe(): void {
    if (useHeadTrackingStore.getState().sensor === 'available') {
      return;
    }
    if (this.env.permissionRequest()) {
      useHeadTrackingStore.setState({ sensor: 'needs-permission' });
      return;
    }
    this.probeTimer = this.env.setTimer(() => {
      this.probeTimer = null;
      const asked = useHeadTrackingStore.getState().sensor === 'checking';
      this.stopProbe();
      if (asked) {
        this.env.announce('No motion sensor found.');
      }
    }, PROBE_MS);
    this.env.target.addEventListener('deviceorientation', this.handleProbe);
  }

  /**
   * Check for a sensor again, after a check found none (the player's "Check
   * again"): one more bounded listen, announced, as the automatic one is not.
   */
  checkSensorAgain(): void {
    if (useHeadTrackingStore.getState().sensor !== 'none') {
      return;
    }
    useHeadTrackingStore.setState({ sensor: 'checking' });
    this.env.announce('Checking for a motion sensor.');
    this.startProbe();
  }

  /** Stop listening; a check still undecided has found nothing. */
  private stopProbe(): void {
    this.env.target.removeEventListener('deviceorientation', this.handleProbe);
    if (this.probeTimer !== null) {
      this.env.clearTimer(this.probeTimer);
      this.probeTimer = null;
    }
    const { sensor } = useHeadTrackingStore.getState();
    if (sensor === 'unknown' || sensor === 'checking') {
      useHeadTrackingStore.setState({ sensor: 'none' });
    }
  }

  private readonly handleProbe = (event: Event): void => {
    if (!hasAllAngles(orientationAngles(event))) {
      return;
    }
    const asked = useHeadTrackingStore.getState().sensor === 'checking';
    useHeadTrackingStore.setState({ sensor: 'available' });
    this.stopProbe();
    if (asked) {
      this.env.announce('Motion sensor found. Head tracking is available.');
    }
  };
}

/** The parts of the window the permission gate reads. */
export interface PermissionWindow {
  DeviceOrientationEvent?: unknown;
  matchMedia?: (query: string) => { matches: boolean };
}

/**
 * DeviceOrientationEvent.requestPermission, where motion readings really wait
 * for it: a touch-first device (iOS). Desktop Chrome has the method too, and it
 * resolves "granted" on a machine with no sensor, so the method alone says
 * nothing; there the ordinary bounded check decides.
 */
export function browserPermissionRequest(win: PermissionWindow | undefined): (() => Promise<string>) | undefined {
  const eventClass = win?.DeviceOrientationEvent;
  if (typeof eventClass !== 'function' || !('requestPermission' in eventClass)) {
    return undefined;
  }
  const request = eventClass.requestPermission;
  if (typeof request !== 'function' || !win?.matchMedia?.('(pointer: coarse)').matches) {
    return undefined;
  }
  return async () => String(await request.call(eventClass));
}

function screenAngle(): number {
  const angle = window.screen?.orientation?.angle;
  if (typeof angle === 'number') {
    return angle;
  }
  // iOS Safari before 16.4 has only the older window.orientation.
  const legacy: unknown = Reflect.get(window, 'orientation');
  return typeof legacy === 'number' ? legacy : 0;
}

/** screen.orientation's change event, and the older orientationchange where that is missing (iOS). */
function onScreenChange(listener: () => void): () => void {
  const orientation = window.screen?.orientation;
  orientation?.addEventListener('change', listener);
  window.addEventListener('orientationchange', listener);
  return () => {
    orientation?.removeEventListener('change', listener);
    window.removeEventListener('orientationchange', listener);
  };
}

/** The app's head tracking, bound to the browser. */
export const headTracking = new HeadTrackingController({
  target: typeof window === 'undefined' ? new EventTarget() : window,
  screenAngle,
  onScreenChange,
  now: () => performance.now(),
  permissionRequest: () => browserPermissionRequest(typeof window === 'undefined' ? undefined : window),
  setTimer: (callback, ms) => window.setTimeout(callback, ms),
  clearTimer: (id) => window.clearTimeout(id),
  announce: (message) => announce(message, 'polite'),
});
