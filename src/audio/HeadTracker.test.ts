import { describe, expect, it, vi } from 'vitest';

import { HeadTracker } from './HeadTracker';

const DEG = Math.PI / 180;
const FRAME_MS = 1000 / 60;

function setup(screenAngle = 0) {
  const target = new EventTarget();
  let now = 0;
  let angle = screenAngle;
  const onYaw = vi.fn<(yaw: number) => void>();
  const timers = new Map<number, { due: number; callback: () => void }>();
  let nextTimer = 1;
  const screenListeners = new Set<() => void>();
  const tracker = new HeadTracker({
    target,
    screenAngle: () => angle,
    onScreenChange: (listener) => {
      screenListeners.add(listener);
      return () => screenListeners.delete(listener);
    },
    now: () => now,
    setTimer: (callback, ms) => {
      const id = nextTimer++;
      timers.set(id, { due: now + ms, callback });
      return id;
    },
    clearTimer: (id) => {
      timers.delete(id);
    },
    onYaw,
  });
  /** Move the clock on, running each timer when it comes due. */
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
  /** A reading `ms` after the last, of a flat device whose alpha is `alpha`. */
  const turn = (alpha: number | null, ms = FRAME_MS, beta: number | null = 0, gamma: number | null = 0) => {
    advance(ms);
    target.dispatchEvent(Object.assign(new Event('deviceorientation'), { alpha, beta, gamma }));
  };
  /** Hold one reading long enough for the filter to settle on it. */
  const hold = (alpha: number) => {
    for (let i = 0; i < 120; i += 1) turn(alpha);
    advance(2000);
  };
  const lastYawDegrees = () => (onYaw.mock.lastCall?.[0] ?? Number.NaN) / DEG;
  const rotateScreen = (value: number) => {
    angle = value;
    for (const listener of screenListeners) listener();
  };
  return { tracker, turn, hold, advance, timers, screenListeners, onYaw, lastYawDegrees, rotateScreen };
}

describe('HeadTracker', () => {
  it('ignores readings until started', () => {
    const { turn, onYaw } = setup();
    turn(10);
    expect(onYaw).not.toHaveBeenCalled();
  });

  it('takes the first reading as straight ahead, at once', () => {
    const { tracker, turn, onYaw } = setup();
    tracker.start();
    turn(123);
    expect(onYaw).toHaveBeenLastCalledWith(0);
    expect(tracker.hasReading).toBe(true);
  });

  it('reports a turn to the right as a positive yaw', () => {
    const { tracker, turn, hold, lastYawDegrees } = setup();
    tracker.start();
    turn(0);
    // alpha falls as the device turns clockwise.
    hold(330);
    expect(lastYawDegrees()).toBeCloseTo(30, 1);
    expect(tracker.yawDegrees).toBeCloseTo(30, 1);
  });

  it('crosses the alpha wrap at 0/360 without a jump', () => {
    const { tracker, turn, advance, onYaw } = setup();
    tracker.start();
    turn(5);
    for (let alpha = 5; alpha >= -10; alpha -= 1) {
      turn((alpha + 360) % 360);
    }
    advance(2000);
    const yaws = onYaw.mock.calls.map(([yaw]) => yaw / DEG);
    for (let i = 1; i < yaws.length; i += 1) {
      expect(Math.abs(yaws[i] - yaws[i - 1])).toBeLessThan(2);
    }
    expect(yaws.at(-1)).toBeCloseTo(15, 1);
  });

  it('settles on the true heading when readings stop with the device', () => {
    // Chromium sends deviceorientation only when the reading changes, so a
    // device held still goes quiet part-way through the filter's glide.
    const { tracker, turn, advance, timers, lastYawDegrees } = setup();
    tracker.start();
    turn(0);
    turn(330);
    advance(FRAME_MS);
    expect(lastYawDegrees()).toBeLessThan(29);
    advance(1500);
    expect(lastYawDegrees()).toBeCloseTo(30, 1);
    expect(timers.size).toBe(0);
  });

  it('sends at most one yaw per frame however fast the sensor reads', () => {
    const { tracker, turn, advance, onYaw } = setup();
    tracker.start();
    turn(0);
    // 120 Hz, a degree a reading, for one second.
    for (let i = 1; i <= 120; i += 1) turn((360 - i) % 360, 1000 / 120);
    const duringTurn = onYaw.mock.calls.length;
    // The first reading plus one per 1/60 s frame.
    expect(duringTurn).toBeLessThanOrEqual(62);
    expect(duringTurn).toBeGreaterThan(50);
    advance(2000);
    expect((onYaw.mock.lastCall?.[0] ?? Number.NaN) / DEG).toBeCloseTo(120, 1);
  });

  it('recenter makes the current heading straight ahead', () => {
    const { tracker, turn, hold, lastYawDegrees } = setup();
    tracker.start();
    turn(0);
    hold(300);
    expect(lastYawDegrees()).toBeCloseTo(60, 1);
    tracker.recenter();
    expect(lastYawDegrees()).toBe(0);
    hold(270);
    expect(lastYawDegrees()).toBeCloseTo(30, 1);
  });

  it('recentering mid-turn stays at zero while the device holds still (the review case)', () => {
    const { tracker, turn, advance, lastYawDegrees, timers } = setup();
    tracker.start();
    turn(0);
    turn(300, 16);
    tracker.recenter();
    expect(lastYawDegrees()).toBe(0);
    advance(2000);
    expect(lastYawDegrees()).toBe(0);
    expect(tracker.yawDegrees).toBe(0);
    expect(timers.size).toBe(0);
  });

  it('recentering before any reading waits for the next one', () => {
    const { tracker, turn, onYaw } = setup();
    tracker.start();
    tracker.recenter();
    expect(onYaw).not.toHaveBeenCalled();
    turn(77);
    expect(onYaw).toHaveBeenLastCalledWith(0);
  });

  it('keeps the heading when the device turns into landscape with the screen', () => {
    const { tracker, hold, rotateScreen, lastYawDegrees } = setup();
    tracker.start();
    hold(0);
    // A quarter turn counter-clockwise in the hand: alpha 90, screen angle 90.
    rotateScreen(90);
    hold(90);
    expect(lastYawDegrees()).toBeCloseTo(0, 1);
  });

  it('applies a screen rotation that lands after the last reading (the review case)', () => {
    const { tracker, turn, advance, rotateScreen, lastYawDegrees } = setup();
    tracker.start();
    turn(0);
    turn(90); // the device turned into landscape; the screen has not followed yet
    rotateScreen(90); // no new reading after this
    advance(2000);
    expect(lastYawDegrees()).toBeCloseTo(0, 1);
  });

  it('skips readings without angles (a desktop fires one of these)', () => {
    const { tracker, turn, onYaw } = setup();
    tracker.start();
    turn(null, 16, null, null);
    expect(onYaw).not.toHaveBeenCalled();
    expect(tracker.hasReading).toBe(false);
  });

  it('does not resend a yaw that has not moved', () => {
    const { tracker, turn, advance, onYaw } = setup();
    tracker.start();
    turn(50);
    turn(50);
    turn(50);
    advance(1000);
    expect(onYaw).toHaveBeenCalledTimes(1);
  });

  it('stop removes its listeners, cancels its timers and hands back a zero yaw', () => {
    const { tracker, turn, advance, onYaw, timers, screenListeners } = setup();
    tracker.start();
    expect(screenListeners.size).toBe(1);
    turn(0);
    turn(320);
    tracker.stop();
    expect(onYaw).toHaveBeenLastCalledWith(0);
    expect(timers.size).toBe(0);
    expect(screenListeners.size).toBe(0);
    const calls = onYaw.mock.calls.length;
    turn(200);
    advance(1000);
    expect(onYaw).toHaveBeenCalledTimes(calls);
    expect(tracker.hasReading).toBe(false);
  });

  it('starts fresh after a restart', () => {
    const { tracker, turn, hold, lastYawDegrees } = setup();
    tracker.start();
    turn(0);
    hold(300);
    tracker.stop();
    tracker.start();
    turn(180);
    expect(lastYawDegrees()).toBe(0);
  });
});
