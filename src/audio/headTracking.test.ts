import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { isHeadRecenterShortcut, reservedReason } from '../reservedShortcuts';
import { usePreferences } from '../stores/preferencesStore';
import { HeadTrackingController, type HeadTrackingEnvironment, useHeadTrackingStore } from './headTracking';

const DEG = Math.PI / 180;

function setup(options: { permission?: () => Promise<string> } = {}) {
  const target = new EventTarget();
  /** deviceorientation listeners currently registered on the window. */
  const orientationListeners = new Set<EventListenerOrEventListenerObject>();
  let now = 0;
  const timers = new Map<number, { due: number; callback: () => void }>();
  let nextTimer = 1;
  const screenListeners = new Set<() => void>();
  const announce = vi.fn<(message: string) => void>();
  const env: HeadTrackingEnvironment = {
    target: {
      addEventListener: (type: string, listener: EventListenerOrEventListenerObject | null) => {
        if (type === 'deviceorientation' && listener) orientationListeners.add(listener);
        target.addEventListener(type, listener);
      },
      removeEventListener: (type: string, listener: EventListenerOrEventListenerObject | null) => {
        if (type === 'deviceorientation' && listener) orientationListeners.delete(listener);
        target.removeEventListener(type, listener);
      },
    },
    screenAngle: () => 0,
    onScreenChange: (listener) => {
      screenListeners.add(listener);
      return () => screenListeners.delete(listener);
    },
    now: () => now,
    permissionRequest: () => options.permission,
    setTimer: (callback, ms) => {
      const id = nextTimer++;
      timers.set(id, { due: now + ms, callback });
      return id;
    },
    clearTimer: (id) => {
      timers.delete(id);
    },
    announce,
  };
  const controller = new HeadTrackingController(env);
  const sink = {
    setHeadYaw: vi.fn<(yaw: number) => void>(),
    setHeadTracking: vi.fn<(active: boolean) => void>(),
  };
  /** Move the clock on, running each timer as it comes due. */
  const advance = (ms: number) => {
    const end = now + ms;
    for (;;) {
      const next = [...timers.entries()].sort((a, b) => a[1].due - b[1].due)[0];
      if (!next || next[1].due > end) break;
      timers.delete(next[0]);
      now = Math.max(now, next[1].due);
      next[1].callback();
    }
    now = end;
  };
  const reading = (alpha: number | null, ms = 16) => {
    advance(ms);
    target.dispatchEvent(
      Object.assign(new Event('deviceorientation'), {
        alpha,
        beta: alpha === null ? null : 0,
        gamma: alpha === null ? null : 0,
      }),
    );
  };
  /** A reading with exactly these fields (a device may send only some angles). */
  const dispatch = (fields: { alpha: number | null; beta: number | null; gamma: number | null }, ms = 16) => {
    advance(ms);
    target.dispatchEvent(Object.assign(new Event('deviceorientation'), fields));
  };
  return { controller, sink, reading, dispatch, advance, announce, timers, orientationListeners, screenListeners };
}

const headTrackingPreference = () => usePreferences.getState().sound.headTracking;

function setPreference(headTracking: boolean): void {
  const { sound, setSound } = usePreferences.getState();
  setSound({ ...sound, headTracking });
}

function keydown(init: KeyboardEventInit): KeyboardEvent {
  return new KeyboardEvent('keydown', { cancelable: true, ...init });
}

describe('HeadTrackingController', () => {
  let detach: (() => void) | undefined;

  beforeEach(() => {
    setPreference(false);
    useHeadTrackingStore.setState({ sensor: 'unknown', status: 'off', yawDegrees: 0 });
  });

  afterEach(() => {
    detach?.();
    detach = undefined;
    setPreference(false);
  });

  describe('sensor detection', () => {
    it('finds a sensor only from a reading with angles, then stops listening', () => {
      const { controller, sink, reading, orientationListeners } = setup();
      detach = controller.attach(sink);
      expect(orientationListeners.size).toBe(1);
      expect(useHeadTrackingStore.getState().sensor).toBe('unknown');
      reading(null); // what a desktop sends
      expect(useHeadTrackingStore.getState().sensor).toBe('unknown');
      reading(12);
      expect(useHeadTrackingStore.getState().sensor).toBe('available');
      expect(orientationListeners.size).toBe(0);
    });

    it('decides there is none when no reading with angles arrives, and stops listening', () => {
      const { controller, sink, reading, advance, orientationListeners } = setup();
      detach = controller.attach(sink);
      reading(null);
      advance(3000);
      expect(useHeadTrackingStore.getState().sensor).toBe('none');
      expect(orientationListeners.size).toBe(0);
      reading(12);
      expect(useHeadTrackingStore.getState().sensor).toBe('none');
    });

    it('does not count a reading with only some angles, on the first check or a retry', () => {
      const { controller, sink, dispatch, advance, announce } = setup();
      detach = controller.attach(sink);
      dispatch({ alpha: 12, beta: null, gamma: null });
      dispatch({ alpha: 12, beta: 3, gamma: null });
      expect(useHeadTrackingStore.getState().sensor).toBe('unknown');
      advance(3000);
      expect(useHeadTrackingStore.getState().sensor).toBe('none');

      controller.checkSensorAgain();
      dispatch({ alpha: 12, beta: null, gamma: null });
      expect(useHeadTrackingStore.getState().sensor).toBe('checking');
      dispatch({ alpha: 12, beta: 3, gamma: -4 });
      expect(useHeadTrackingStore.getState().sensor).toBe('available');
      expect(announce).toHaveBeenLastCalledWith('Motion sensor found. Head tracking is available.');
    });

    it('checking again after a timeout finds a sensor that arrives late', () => {
      const { controller, sink, reading, advance, announce, orientationListeners } = setup();
      detach = controller.attach(sink);
      advance(3000);
      expect(useHeadTrackingStore.getState().sensor).toBe('none');
      expect(announce).not.toHaveBeenCalled(); // the automatic check is silent

      controller.checkSensorAgain();
      expect(useHeadTrackingStore.getState().sensor).toBe('checking');
      expect(announce).toHaveBeenLastCalledWith('Checking for a motion sensor.');
      expect(orientationListeners.size).toBe(1);

      reading(12);
      expect(useHeadTrackingStore.getState().sensor).toBe('available');
      expect(announce).toHaveBeenLastCalledWith('Motion sensor found. Head tracking is available.');
      expect(orientationListeners.size).toBe(0);
    });

    it('checking again that finds nothing says so and stops listening', () => {
      const { controller, sink, reading, advance, announce, orientationListeners, timers } = setup();
      detach = controller.attach(sink);
      advance(3000);
      controller.checkSensorAgain();
      reading(null);
      advance(3000);
      expect(useHeadTrackingStore.getState().sensor).toBe('none');
      expect(announce).toHaveBeenLastCalledWith('No motion sensor found.');
      expect(orientationListeners.size).toBe(0);
      expect(timers.size).toBe(0);
    });

    it('checking again does nothing while a check runs or once a sensor is known', () => {
      const { controller, sink, reading, advance, orientationListeners } = setup();
      detach = controller.attach(sink);
      controller.checkSensorAgain(); // the first check is still running
      expect(useHeadTrackingStore.getState().sensor).toBe('unknown');
      expect(orientationListeners.size).toBe(1);
      advance(3000);
      controller.checkSensorAgain();
      controller.checkSensorAgain();
      expect(orientationListeners.size).toBe(1);
      reading(5);
      controller.checkSensorAgain();
      expect(useHeadTrackingStore.getState().sensor).toBe('available');
      expect(orientationListeners.size).toBe(0);
    });

    it('needs permission before it can tell, and does not listen before it is asked', () => {
      const { controller, sink, advance, orientationListeners, timers } = setup({
        permission: async () => 'granted',
      });
      detach = controller.attach(sink);
      expect(useHeadTrackingStore.getState().sensor).toBe('needs-permission');
      expect(orientationListeners.size).toBe(0);
      expect(timers.size).toBe(0);
      advance(5000);
      expect(useHeadTrackingStore.getState().sensor).toBe('needs-permission');
    });
  });

  it('turning on drives the listener from readings and announces it', async () => {
    const { controller, sink, reading, advance, announce } = setup();
    detach = controller.attach(sink);
    await controller.enable();
    expect(headTrackingPreference()).toBe(true);
    expect(sink.setHeadTracking).toHaveBeenLastCalledWith(true);
    expect(useHeadTrackingStore.getState().status).toBe('waiting');
    expect(announce).toHaveBeenLastCalledWith(expect.stringMatching(/^Head tracking on/));

    reading(0);
    expect(useHeadTrackingStore.getState().status).toBe('tracking');
    expect(sink.setHeadYaw).toHaveBeenLastCalledWith(0);
    for (let i = 0; i < 120; i += 1) reading(340);
    advance(2000);
    expect(sink.setHeadYaw.mock.lastCall?.[0]).toBeCloseTo(20 * DEG, 6);
    expect(useHeadTrackingStore.getState().yawDegrees).toBeCloseTo(20, 3);
  });

  it('asks for motion permission and stays off when it is refused', async () => {
    const { controller, sink, announce, orientationListeners } = setup({ permission: async () => 'denied' });
    detach = controller.attach(sink);
    await controller.enable();
    expect(headTrackingPreference()).toBe(false);
    expect(useHeadTrackingStore.getState().status).toBe('blocked');
    expect(announce).toHaveBeenLastCalledWith(expect.stringContaining('Motion access was not allowed'));
    expect(orientationListeners.size).toBe(0);
    expect(sink.setHeadTracking).not.toHaveBeenCalledWith(true);
  });

  it('treats a permission request that throws as refused', async () => {
    const { controller, sink } = setup({
      permission: () => Promise.reject(new Error('NotAllowedError')),
    });
    detach = controller.attach(sink);
    await controller.enable();
    expect(headTrackingPreference()).toBe(false);
    expect(useHeadTrackingStore.getState().status).toBe('blocked');
  });

  it('turns on once permission is granted', async () => {
    const permission = vi.fn(async () => 'granted');
    const { controller, sink, reading } = setup({ permission });
    detach = controller.attach(sink);
    await controller.enable();
    expect(permission).toHaveBeenCalledOnce();
    expect(headTrackingPreference()).toBe(true);
    reading(40);
    expect(useHeadTrackingStore.getState().sensor).toBe('available');
    expect(useHeadTrackingStore.getState().status).toBe('tracking');
  });

  it('turning off hands the listener back to the server facing and stops all listening', async () => {
    const { controller, sink, reading, advance, announce, orientationListeners, screenListeners, timers } =
      setup();
    detach = controller.attach(sink);
    await controller.enable();
    reading(0);
    for (let i = 0; i < 60; i += 1) reading(300);
    controller.disable();
    expect(headTrackingPreference()).toBe(false);
    expect(sink.setHeadYaw).toHaveBeenLastCalledWith(0);
    expect(sink.setHeadTracking).toHaveBeenLastCalledWith(false);
    expect(useHeadTrackingStore.getState()).toMatchObject({ status: 'off', yawDegrees: 0 });
    expect(announce).toHaveBeenLastCalledWith('Head tracking off.');
    expect(orientationListeners.size).toBe(0);
    expect(screenListeners.size).toBe(0);
    expect(timers.size).toBe(0);
    const calls = sink.setHeadYaw.mock.calls.length;
    reading(200);
    advance(1000);
    expect(sink.setHeadYaw).toHaveBeenCalledTimes(calls);
  });

  it('turning off before the probe has decided stops the probe too', async () => {
    const { controller, sink, orientationListeners, timers } = setup();
    detach = controller.attach(sink);
    await controller.enable();
    controller.disable();
    expect(orientationListeners.size).toBe(0);
    expect(timers.size).toBe(0);
  });

  it('says so when no readings arrive after turning on', async () => {
    const { controller, sink, advance, announce } = setup();
    detach = controller.attach(sink);
    await controller.enable();
    advance(3000);
    expect(useHeadTrackingStore.getState().status).toBe('no-readings');
    expect(announce).toHaveBeenLastCalledWith(expect.stringContaining('No motion readings'));
  });

  it('recenters at once, announcing it', async () => {
    const { controller, sink, reading, announce } = setup();
    detach = controller.attach(sink);
    await controller.enable();
    reading(0);
    reading(300); // mid-turn
    controller.recenter();
    expect(sink.setHeadYaw).toHaveBeenLastCalledWith(0);
    expect(useHeadTrackingStore.getState().yawDegrees).toBe(0);
    expect(announce).toHaveBeenLastCalledWith(expect.stringMatching(/^Recentered/));
  });

  describe('near the flipped-over pose', () => {
    const PAUSED = 'Head tracking paused. Recenter to resume, or turn back to where you were facing.';

    it('after a turn, resumes by turning back to where the player was facing, not to the start', async () => {
      const { controller, sink, reading, dispatch, advance, announce } = setup();
      detach = controller.attach(sink);
      await controller.enable();
      reading(0);
      reading(320); // turned 40 right
      advance(2000);
      dispatch({ alpha: 320, beta: 170, gamma: 0 });
      advance(2500);
      expect(useHeadTrackingStore.getState().status).toBe('paused');
      expect(announce).toHaveBeenLastCalledWith(PAUSED);
      reading(0); // the way it started: 40 from where it was facing, so still paused
      expect(useHeadTrackingStore.getState().status).toBe('paused');
      reading(325); // back within 20 of where it was facing
      expect(useHeadTrackingStore.getState().status).toBe('tracking');
      expect(announce).toHaveBeenLastCalledWith('Head tracking resumed.');
    });

    it('recentering while paused after an incomplete reading says it waits, then resumes', async () => {
      const { controller, sink, reading, dispatch, advance, announce } = setup();
      detach = controller.attach(sink);
      await controller.enable();
      reading(300);
      dispatch({ alpha: 300, beta: 170, gamma: 0 });
      advance(2500);
      dispatch({ alpha: 300, beta: null, gamma: null });
      announce.mockClear();
      controller.recenter();
      expect(announce.mock.calls.map(([message]) => message)).toEqual(['Recentering on the next reading.']);
      reading(200);
      expect(useHeadTrackingStore.getState().status).toBe('tracking');
      expect(sink.setHeadYaw).toHaveBeenLastCalledWith(0);
      expect(announce.mock.calls.map(([message]) => message)).toEqual(['Recentering on the next reading.']);
    });

    it('pauses after two seconds there, says so once, and resumes when the phone comes back', async () => {
      const { controller, sink, reading, dispatch, advance, announce } = setup();
      detach = controller.attach(sink);
      await controller.enable();
      reading(0);
      dispatch({ alpha: 0, beta: 170, gamma: 0 });
      advance(2500);
      for (let i = 0; i < 10; i += 1) dispatch({ alpha: 0, beta: 170, gamma: i % 2 });
      expect(useHeadTrackingStore.getState().status).toBe('paused');
      expect(announce.mock.calls.filter(([message]) => message === PAUSED)).toHaveLength(1);

      reading(5); // back near the way it started
      expect(useHeadTrackingStore.getState().status).toBe('tracking');
      expect(announce).toHaveBeenLastCalledWith('Head tracking resumed.');
    });

    it('recentering while paused resumes, saying only that it recentered', async () => {
      const { controller, sink, reading, dispatch, advance, announce } = setup();
      detach = controller.attach(sink);
      await controller.enable();
      reading(0);
      dispatch({ alpha: 0, beta: 170, gamma: 0 });
      advance(2500);
      announce.mockClear();
      controller.recenter();
      expect(useHeadTrackingStore.getState().status).toBe('tracking');
      expect(announce.mock.calls.map(([message]) => message)).toEqual([
        'Recentered. Straight ahead is the way you face now.',
      ]);
    });

    it('turning off while paused says only that it is off', async () => {
      const { controller, sink, reading, dispatch, advance, announce } = setup();
      detach = controller.attach(sink);
      await controller.enable();
      reading(0);
      dispatch({ alpha: 0, beta: 170, gamma: 0 });
      advance(2500);
      announce.mockClear();
      controller.disable();
      expect(useHeadTrackingStore.getState().status).toBe('off');
      expect(announce.mock.calls.map(([message]) => message)).toEqual(['Head tracking off.']);
    });
  });

  it('recenter while off only says that head tracking is off', () => {
    const { controller, sink, announce } = setup();
    detach = controller.attach(sink);
    controller.recenter();
    expect(sink.setHeadYaw).not.toHaveBeenCalled();
    expect(announce).toHaveBeenLastCalledWith('Head tracking is off.');
  });

  it('resumes from the saved preference without announcing at load', () => {
    setPreference(true);
    const { controller, sink, reading, announce } = setup();
    detach = controller.attach(sink);
    expect(sink.setHeadTracking).toHaveBeenLastCalledWith(true);
    expect(useHeadTrackingStore.getState().status).toBe('waiting');
    reading(10);
    expect(useHeadTrackingStore.getState().status).toBe('tracking');
    expect(announce).not.toHaveBeenCalled();
  });

  it('detaching stops tracking and every listener and timer', async () => {
    const { controller, sink, reading, timers, orientationListeners, screenListeners } = setup();
    const stop = controller.attach(sink);
    await controller.enable();
    reading(0);
    for (let i = 0; i < 60; i += 1) reading(300);
    stop();
    expect(sink.setHeadYaw).toHaveBeenLastCalledWith(0);
    expect(sink.setHeadTracking).toHaveBeenLastCalledWith(false);
    expect(timers.size).toBe(0);
    expect(orientationListeners.size).toBe(0);
    expect(screenListeners.size).toBe(0);
    const calls = sink.setHeadYaw.mock.calls.length;
    reading(100);
    expect(sink.setHeadYaw).toHaveBeenCalledTimes(calls);
  });

  it('handles the recenter shortcut and leaves other keys alone', async () => {
    const { controller, sink, reading, announce } = setup();
    detach = controller.attach(sink);
    await controller.enable();
    reading(0);

    const other = keydown({ key: 'O', code: 'KeyO', altKey: true });
    controller.handleKeyDown(other);
    expect(other.defaultPrevented).toBe(false);

    const shortcut = keydown({ key: 'Ø', code: 'KeyO', altKey: true, shiftKey: true });
    controller.handleKeyDown(shortcut);
    expect(shortcut.defaultPrevented).toBe(true);
    expect(announce).toHaveBeenLastCalledWith(expect.stringMatching(/^Recentered/));
  });
});

describe('isHeadRecenterShortcut', () => {
  it('matches Alt+Shift+O by physical key only', () => {
    expect(isHeadRecenterShortcut(keydown({ code: 'KeyO', altKey: true, shiftKey: true }))).toBe(true);
    expect(isHeadRecenterShortcut(keydown({ code: 'KeyO', altKey: true, shiftKey: true, ctrlKey: true }))).toBe(false);
    expect(isHeadRecenterShortcut(keydown({ code: 'KeyO', shiftKey: true }))).toBe(false);
    expect(isHeadRecenterShortcut(keydown({ code: 'KeyP', altKey: true, shiftKey: true }))).toBe(false);
  });

  it('is kept from server key layers', () => {
    expect(reservedReason({ key: 'o', modifiers: ['alt', 'shift'] })).toBe('Alt+Shift+O recenters head tracking');
  });
});
