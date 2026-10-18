import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { isHeadRecenterShortcut, reservedReason } from '../reservedShortcuts';
import { usePreferences } from '../stores/preferencesStore';
import { HeadTrackingController, type HeadTrackingEnvironment, useHeadTrackingStore } from './headTracking';

const DEG = Math.PI / 180;

function setup(options: { permission?: () => Promise<string> } = {}) {
  const target = new EventTarget();
  let now = 0;
  const timers = new Map<number, () => void>();
  let nextTimer = 1;
  const announce = vi.fn<(message: string) => void>();
  const env: HeadTrackingEnvironment = {
    target,
    screenAngle: () => 0,
    now: () => now,
    permissionRequest: () => options.permission,
    setTimer: (callback) => {
      const id = nextTimer++;
      timers.set(id, callback);
      return id;
    },
    clearTimer: (id) => {
      timers.delete(id);
    },
    announce,
  };
  const controller = new HeadTrackingController(env);
  const sink = { setHeadYaw: vi.fn<(yaw: number) => void>() };
  const reading = (alpha: number | null, ms = 16) => {
    now += ms;
    target.dispatchEvent(
      Object.assign(new Event('deviceorientation'), {
        alpha,
        beta: alpha === null ? null : 0,
        gamma: alpha === null ? null : 0,
      }),
    );
  };
  const runTimers = () => {
    const pending = [...timers.values()];
    timers.clear();
    for (const callback of pending) callback();
  };
  return { controller, sink, reading, runTimers, announce, timers };
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
    it('finds a sensor only from a reading with angles', () => {
      const { controller, sink, reading, runTimers } = setup();
      detach = controller.attach(sink);
      expect(useHeadTrackingStore.getState().sensor).toBe('unknown');
      reading(null); // what a desktop sends
      expect(useHeadTrackingStore.getState().sensor).toBe('unknown');
      reading(12);
      expect(useHeadTrackingStore.getState().sensor).toBe('available');
      runTimers();
      expect(useHeadTrackingStore.getState().sensor).toBe('available');
    });

    it('decides there is none when no reading with angles arrives', () => {
      const { controller, sink, reading, runTimers } = setup();
      detach = controller.attach(sink);
      reading(null);
      runTimers();
      expect(useHeadTrackingStore.getState().sensor).toBe('none');
    });

    it('needs permission before it can tell, where the browser asks for it', () => {
      const { controller, sink, runTimers } = setup({ permission: async () => 'granted' });
      detach = controller.attach(sink);
      runTimers();
      expect(useHeadTrackingStore.getState().sensor).toBe('needs-permission');
    });
  });

  it('turning on drives the listener from readings and announces it', async () => {
    const { controller, sink, reading, runTimers, announce } = setup();
    detach = controller.attach(sink);
    await controller.enable();
    expect(headTrackingPreference()).toBe(true);
    expect(useHeadTrackingStore.getState().status).toBe('waiting');
    expect(announce).toHaveBeenLastCalledWith(expect.stringMatching(/^Head tracking on/));

    reading(0);
    expect(useHeadTrackingStore.getState().status).toBe('tracking');
    expect(sink.setHeadYaw).toHaveBeenLastCalledWith(0);
    for (let i = 0; i < 120; i += 1) reading(340);
    expect(sink.setHeadYaw.mock.lastCall?.[0]).toBeCloseTo(20 * DEG, 2);
    // The readout refreshes on a timer, after the head has settled.
    runTimers();
    expect(useHeadTrackingStore.getState().yawDegrees).toBeCloseTo(20, 0);
  });

  it('asks for motion permission and stays off when it is refused', async () => {
    const { controller, sink, announce } = setup({ permission: async () => 'denied' });
    detach = controller.attach(sink);
    await controller.enable();
    expect(headTrackingPreference()).toBe(false);
    expect(useHeadTrackingStore.getState().status).toBe('blocked');
    expect(announce).toHaveBeenLastCalledWith(expect.stringContaining('Motion access was not allowed'));
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

  it('turning off hands the listener back to the server facing', async () => {
    const { controller, sink, reading, announce } = setup();
    detach = controller.attach(sink);
    await controller.enable();
    reading(0);
    for (let i = 0; i < 60; i += 1) reading(300);
    controller.disable();
    expect(headTrackingPreference()).toBe(false);
    expect(sink.setHeadYaw).toHaveBeenLastCalledWith(0);
    expect(useHeadTrackingStore.getState()).toMatchObject({ status: 'off', yawDegrees: 0 });
    expect(announce).toHaveBeenLastCalledWith('Head tracking off.');
    const calls = sink.setHeadYaw.mock.calls.length;
    reading(200);
    expect(sink.setHeadYaw).toHaveBeenCalledTimes(calls);
  });

  it('says so when no readings arrive after turning on', async () => {
    const { controller, sink, runTimers, announce } = setup();
    detach = controller.attach(sink);
    await controller.enable();
    runTimers();
    expect(useHeadTrackingStore.getState().status).toBe('no-readings');
    expect(announce).toHaveBeenLastCalledWith(expect.stringContaining('No motion readings'));
  });

  it('recenters, announcing it', async () => {
    const { controller, sink, reading, announce } = setup();
    detach = controller.attach(sink);
    await controller.enable();
    reading(0);
    for (let i = 0; i < 120; i += 1) reading(300);
    controller.recenter();
    expect(sink.setHeadYaw).toHaveBeenLastCalledWith(0);
    expect(useHeadTrackingStore.getState().yawDegrees).toBe(0);
    expect(announce).toHaveBeenLastCalledWith(expect.stringMatching(/^Recentered/));
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
    expect(useHeadTrackingStore.getState().status).toBe('waiting');
    reading(10);
    expect(useHeadTrackingStore.getState().status).toBe('tracking');
    expect(announce).not.toHaveBeenCalled();
  });

  it('detaching stops tracking and zeroes the head yaw', async () => {
    const { controller, sink, reading, timers } = setup();
    const stop = controller.attach(sink);
    await controller.enable();
    reading(0);
    for (let i = 0; i < 60; i += 1) reading(300);
    stop();
    expect(sink.setHeadYaw).toHaveBeenLastCalledWith(0);
    expect(timers.size).toBe(0);
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
