import { describe, expect, it, vi } from 'vitest';

import { HeadTracker } from './HeadTracker';

const DEG = Math.PI / 180;

function setup(screenAngle = 0) {
  const target = new EventTarget();
  let now = 0;
  let angle = screenAngle;
  const onYaw = vi.fn<(yaw: number) => void>();
  const tracker = new HeadTracker({
    target,
    screenAngle: () => angle,
    now: () => now,
    onYaw,
  });
  /** A flat device whose alpha is `alpha`, after `ms` more milliseconds. */
  const turn = (alpha: number | null, ms = 16, beta: number | null = 0, gamma: number | null = 0) => {
    now += ms;
    target.dispatchEvent(Object.assign(new Event('deviceorientation'), { alpha, beta, gamma }));
  };
  /** Hold one reading long enough for the filter to settle on it. */
  const hold = (alpha: number) => {
    for (let i = 0; i < 120; i += 1) turn(alpha);
  };
  const lastYawDegrees = () => (onYaw.mock.lastCall?.[0] ?? Number.NaN) / DEG;
  return { tracker, turn, hold, onYaw, lastYawDegrees, setAngle: (value: number) => { angle = value; } };
}

describe('HeadTracker', () => {
  it('ignores readings until started', () => {
    const { turn, onYaw } = setup();
    turn(10);
    expect(onYaw).not.toHaveBeenCalled();
  });

  it('takes the first reading as straight ahead', () => {
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
    const { tracker, turn, onYaw } = setup();
    tracker.start();
    turn(5);
    for (let alpha = 5; alpha >= -10; alpha -= 1) {
      turn((alpha + 360) % 360);
    }
    const yaws = onYaw.mock.calls.map(([yaw]) => yaw / DEG);
    for (let i = 1; i < yaws.length; i += 1) {
      expect(Math.abs(yaws[i] - yaws[i - 1])).toBeLessThan(2);
    }
    expect(yaws.at(-1)).toBeGreaterThan(0);
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

  it('recentering before any reading waits for the next one', () => {
    const { tracker, turn, onYaw } = setup();
    tracker.start();
    tracker.recenter();
    expect(onYaw).not.toHaveBeenCalled();
    turn(77);
    expect(onYaw).toHaveBeenLastCalledWith(0);
  });

  it('keeps the heading when the device turns into landscape with the screen', () => {
    const { tracker, hold, setAngle, lastYawDegrees } = setup();
    tracker.start();
    hold(0);
    // A quarter turn counter-clockwise in the hand: alpha 90, screen angle 90.
    setAngle(90);
    hold(90);
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
    const { tracker, turn, onYaw } = setup();
    tracker.start();
    turn(50);
    turn(50);
    turn(50);
    expect(onYaw).toHaveBeenCalledTimes(1);
  });

  it('stop removes the listener and hands back a zero yaw', () => {
    const { tracker, turn, hold, onYaw } = setup();
    tracker.start();
    turn(0);
    hold(320);
    tracker.stop();
    expect(onYaw).toHaveBeenLastCalledWith(0);
    const calls = onYaw.mock.calls.length;
    turn(200);
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
