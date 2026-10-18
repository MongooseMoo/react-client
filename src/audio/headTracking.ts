import { announce } from '@react-aria/live-announcer';
import { create } from 'zustand';

import { isHeadRecenterShortcut } from '../reservedShortcuts';
import { usePreferences } from '../stores/preferencesStore';
import { HeadTracker, orientationAngles } from './HeadTracker';

/**
 * Whether this device can track the head: `available` once a reading with
 * angles has arrived, `needs-permission` where the browser sends none until
 * the player allows motion access (iOS), `none` when no such reading came,
 * `unknown` while still listening. Desktops define DeviceOrientationEvent and
 * may send one reading with null angles, so only real angles count.
 */
export type SensorAvailability = 'unknown' | 'available' | 'needs-permission' | 'none';

/**
 * `waiting`: on, no reading yet. `no-readings`: on, but none arrived in
 * {@link NO_READING_MS}. `blocked`: the player refused motion access.
 */
export type HeadTrackingStatus = 'off' | 'waiting' | 'tracking' | 'no-readings' | 'blocked';

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
}

export interface HeadTrackingEnvironment {
  target: Pick<EventTarget, 'addEventListener' | 'removeEventListener'>;
  screenAngle: () => number;
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

  constructor(env: HeadTrackingEnvironment) {
    this.env = env;
    this.tracker = new HeadTracker({
      target: env.target,
      screenAngle: env.screenAngle,
      now: env.now,
      setTimer: env.setTimer,
      clearTimer: env.clearTimer,
      onYaw: (yaw) => this.handleYaw(yaw),
    });
  }

  attach(sink: HeadYawSink): () => void {
    this.sink = sink;
    this.startProbe();
    const unsubscribe = usePreferences.subscribe(
      (state) => state.sound.headTracking,
      (enabled) => (enabled ? this.startTracking() : this.stopTracking()),
      { fireImmediately: true },
    );
    return () => {
      unsubscribe();
      this.stopTracking();
      this.stopProbe();
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
        this.setPreference(false);
        useHeadTrackingStore.setState({ status: 'blocked' });
        this.env.announce('Motion access was not allowed, so head tracking is off.');
        return;
      }
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
    this.tracker.recenter();
    this.publishReadout(true);
    this.env.announce('Recentered. Straight ahead is the way you face now.');
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
    this.tracker.start();
    this.clearNoReadingTimer();
    this.noReadingTimer = this.env.setTimer(() => {
      this.noReadingTimer = null;
      if (this.tracker.hasReading) {
        return;
      }
      useHeadTrackingStore.setState({ status: 'no-readings' });
      if (this.startedByPlayer) {
        this.env.announce(
          this.env.permissionRequest()
            ? 'No motion readings yet. Use Allow motion access to try again.'
            : 'No motion readings from this device, so head tracking is waiting.',
        );
      }
    }, NO_READING_MS);
  }

  private stopTracking(): void {
    this.clearNoReadingTimer();
    this.clearReadoutTimer();
    this.startedByPlayer = false;
    // The tracker hands back a zero yaw as it stops, which restores the server facing.
    this.tracker.stop();
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
    if (useHeadTrackingStore.getState().status !== 'tracking') {
      this.clearNoReadingTimer();
      useHeadTrackingStore.setState({ status: 'tracking', sensor: 'available' });
    }
    this.publishReadout(false);
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

  private startProbe(): void {
    const sensor = useHeadTrackingStore.getState().sensor;
    if (sensor === 'available') {
      return;
    }
    if (this.env.permissionRequest()) {
      useHeadTrackingStore.setState({ sensor: 'needs-permission' });
    } else {
      this.probeTimer = this.env.setTimer(() => {
        this.probeTimer = null;
        if (useHeadTrackingStore.getState().sensor === 'unknown') {
          useHeadTrackingStore.setState({ sensor: 'none' });
        }
      }, PROBE_MS);
    }
    // Keep listening past the timer: a reading that comes late still counts.
    this.env.target.addEventListener('deviceorientation', this.handleProbe);
  }

  private stopProbe(): void {
    this.env.target.removeEventListener('deviceorientation', this.handleProbe);
    if (this.probeTimer !== null) {
      this.env.clearTimer(this.probeTimer);
      this.probeTimer = null;
    }
  }

  private readonly handleProbe = (event: Event): void => {
    if (orientationAngles(event).alpha === null) {
      return;
    }
    this.stopProbe();
    useHeadTrackingStore.setState({ sensor: 'available' });
  };
}

function permissionRequest(): (() => Promise<string>) | undefined {
  const eventClass = typeof window === 'undefined' ? undefined : window.DeviceOrientationEvent;
  if (!eventClass || !('requestPermission' in eventClass)) {
    return undefined;
  }
  const request = eventClass.requestPermission;
  if (typeof request !== 'function') {
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

/** The app's head tracking, bound to the browser. */
export const headTracking = new HeadTrackingController({
  target: typeof window === 'undefined' ? new EventTarget() : window,
  screenAngle,
  now: () => performance.now(),
  permissionRequest,
  setTimer: (callback, ms) => window.setTimeout(callback, ms),
  clearTimer: (id) => window.clearTimeout(id),
  announce: (message) => announce(message, 'polite'),
});
