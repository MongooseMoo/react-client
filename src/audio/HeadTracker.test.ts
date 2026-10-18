import { describe, expect, it, vi } from 'vitest';

import { HeadTracker } from './HeadTracker';

const DEG = Math.PI / 180;
const FRAME_MS = 1000 / 60;

function setup(screenAngle = 0) {
  const target = new EventTarget();
  let now = 0;
  let angle = screenAngle;
  const onYaw = vi.fn<(yaw: number) => void>();
  const onPausedChange = vi.fn<(paused: boolean) => void>();
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
    onPausedChange,
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
  return {
    tracker,
    turn,
    hold,
    advance,
    timers,
    screenListeners,
    onYaw,
    onPausedChange,
    lastYawDegrees,
    rotateScreen,
  };
}

// From a flat reference, a tilt of beta has conditioning cos(beta / 2): it enters
// the badly conditioned region below 0.5 (beta above 120) and leaves above 0.61
// (beta below about 105).
const INSIDE_BETA = 170;
const BETWEEN_BETA = 112; // conditioning 0.56: between the thresholds
const OUTSIDE_BETA = 90;

describe('HeadTracker near the flipped-over pose', () => {
  it('holds the last yaw through near-singular readings, however they wobble', () => {
    const { tracker, turn, advance, lastYawDegrees, onPausedChange } = setup();
    tracker.start();
    turn(0);
    turn(330); // a turn right: 30 degrees
    advance(2000);
    const settled = lastYawDegrees();
    expect(settled).toBeCloseTo(30, 1); // within the filter's 0.01 degree settling
    for (let i = 0; i < 60; i += 1) {
      turn(330, FRAME_MS, INSIDE_BETA, i % 2 === 0 ? 3 : -3);
    }
    advance(500);
    expect(lastYawDegrees()).toBeCloseTo(settled, 6);
    expect(onPausedChange).not.toHaveBeenCalled(); // under 2 s so far
  });

  it('holds a flip of a device that was rolled when recentered (the Chromium round-3 case)', () => {
    // Recentered rolled 20 degrees, then flipped to beta 170: a swing of about 150
    // degrees about an axis that is not quite horizontal, whose twist reads as a
    // turn of over 100 degrees. It must be held, not followed.
    const { tracker, turn, advance, lastYawDegrees } = setup();
    tracker.start();
    turn(15, FRAME_MS, 0, 20);
    for (let i = 0; i < 40; i += 1) turn(15, FRAME_MS, 170, i % 2 === 0 ? 2 : -2);
    advance(500);
    expect(lastYawDegrees()).toBeCloseTo(0, 6);
  });

  it('keeps tracking an ordinary tilt from flat to upright and a turn while upright', () => {
    const { tracker, turn, advance, lastYawDegrees, onPausedChange } = setup();
    tracker.start();
    turn(0);
    for (let beta = 0; beta <= 90; beta += 5) turn(0, FRAME_MS, beta, 0);
    turn(330, FRAME_MS, 90, 0);
    advance(2000);
    expect(lastYawDegrees()).toBeCloseTo(30, 1);
    expect(onPausedChange).not.toHaveBeenCalled();
  });

  it('uses hysteresis: between the thresholds it stays in whichever state it was', () => {
    const { tracker, turn, advance, lastYawDegrees } = setup();
    tracker.start();
    turn(0);
    // Coming from outside, a reading between the thresholds is still read.
    turn(330, FRAME_MS, BETWEEN_BETA, 0);
    advance(2000);
    const between = lastYawDegrees();
    expect(Number.isFinite(between)).toBe(true);
    expect(Math.abs(between)).toBeGreaterThan(1);
    // Once inside, the same reading is still held.
    turn(330, FRAME_MS, INSIDE_BETA, 0);
    advance(100);
    const held = lastYawDegrees();
    turn(300, FRAME_MS, BETWEEN_BETA, 0);
    advance(2000);
    expect(lastYawDegrees()).toBeCloseTo(held, 6);
  });

  it('after two seconds inside, pauses once', () => {
    const { tracker, turn, advance, onPausedChange } = setup();
    tracker.start();
    turn(0);
    turn(0, FRAME_MS, INSIDE_BETA, 0);
    advance(1900);
    expect(onPausedChange).not.toHaveBeenCalled();
    advance(200);
    expect(onPausedChange).toHaveBeenCalledTimes(1);
    expect(onPausedChange).toHaveBeenLastCalledWith(true);
    for (let i = 0; i < 30; i += 1) turn(0, FRAME_MS, INSIDE_BETA, i % 3);
    advance(5000);
    expect(onPausedChange).toHaveBeenCalledTimes(1);
  });

  it('recentering while paused after an incomplete reading resumes at 0 on the next complete one (round 4)', () => {
    const { tracker, turn, advance, lastYawDegrees, onPausedChange, timers } = setup();
    tracker.start();
    turn(0);
    turn(300); // a turn right: 60
    advance(2000);
    turn(300, FRAME_MS, INSIDE_BETA, 0);
    advance(2500);
    expect(onPausedChange).toHaveBeenLastCalledWith(true);
    turn(300, FRAME_MS, null, null); // incomplete: no pose to recenter on
    expect(tracker.recenter()).toBe(false); // not done yet: waits for a complete reading
    expect(onPausedChange).toHaveBeenLastCalledWith(false);
    expect(timers.size).toBeLessThanOrEqual(1); // no pause timer left (a frame may be pending)
    turn(200, FRAME_MS, 0, 0); // complete, 100 degrees from the held 60
    expect(lastYawDegrees()).toBe(0);
    turn(170, FRAME_MS, 0, 0); // and it tracks from there: 30 right
    advance(2000);
    expect(lastYawDegrees()).toBeCloseTo(30, 1);
    expect(onPausedChange).toHaveBeenCalledTimes(2);
  });

  it('a recenter with a complete latest reading takes effect at once', () => {
    const { tracker, turn, lastYawDegrees } = setup();
    tracker.start();
    turn(0);
    turn(300);
    expect(tracker.recenter()).toBe(true);
    expect(lastYawDegrees()).toBe(0);
  });

  it('comes out near the held yaw: resumes, then settles on where the device points', () => {
    const { tracker, turn, advance, lastYawDegrees, onPausedChange, timers } = setup();
    tracker.start();
    turn(0);
    turn(0, FRAME_MS, INSIDE_BETA, 0);
    advance(2500); // paused
    turn(350, FRAME_MS, OUTSIDE_BETA, 0); // out, 10 degrees from the held 0
    expect(onPausedChange).toHaveBeenLastCalledWith(false);
    advance(2000);
    expect(lastYawDegrees()).toBeCloseTo(10, 1);
    expect(timers.size).toBe(0);
  });

  it('comes out far from the held yaw: stays paused, without a swing, until recentered', () => {
    const { tracker, turn, advance, lastYawDegrees, onPausedChange, onYaw } = setup();
    tracker.start();
    turn(0);
    turn(0, FRAME_MS, INSIDE_BETA, 0); // inside, under 2 s
    turn(270, FRAME_MS, 0, 0); // out, but 90 degrees from the held 0
    expect(onPausedChange).toHaveBeenLastCalledWith(true);
    const calls = onYaw.mock.calls.length;
    for (let i = 0; i < 30; i += 1) turn(260 - i);
    advance(2000);
    expect(onYaw).toHaveBeenCalledTimes(calls);
    expect(lastYawDegrees()).toBeCloseTo(0, 6);

    tracker.recenter();
    expect(onPausedChange).toHaveBeenLastCalledWith(false);
    expect(lastYawDegrees()).toBe(0);
    turn(200); // from 231 (the last reading) a 31 degree turn right
    advance(2000);
    expect(lastYawDegrees()).toBeCloseTo(31, 1);
  });

  it('comes out far, then back near the held yaw: resumes without a recenter', () => {
    const { tracker, turn, advance, lastYawDegrees, onPausedChange } = setup();
    tracker.start();
    turn(0);
    turn(0, FRAME_MS, INSIDE_BETA, 0);
    turn(270, FRAME_MS, 0, 0); // paused, 90 away
    turn(5); // back within 20 degrees of the held 0
    expect(onPausedChange).toHaveBeenLastCalledWith(false);
    advance(2000);
    expect(lastYawDegrees()).toBeCloseTo(-5, 1);
  });

  it('stop clears a pause and its timer', () => {
    const { tracker, turn, timers, onPausedChange } = setup();
    tracker.start();
    turn(0);
    turn(0, FRAME_MS, INSIDE_BETA, 0);
    tracker.stop();
    expect(timers.size).toBe(0);
    expect(onPausedChange).not.toHaveBeenCalled();
  });

  it('stop after a pause reports the pause over', () => {
    const { tracker, turn, advance, onPausedChange } = setup();
    tracker.start();
    turn(0);
    turn(0, FRAME_MS, INSIDE_BETA, 0);
    advance(2500);
    tracker.stop();
    expect(onPausedChange).toHaveBeenLastCalledWith(false);
  });
});

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

  it('comes back to zero after each closed pitch cycle with a roll (the round-2 review case)', () => {
    const { tracker, turn, advance, lastYawDegrees, timers } = setup();
    tracker.start();
    turn(0, FRAME_MS, 0, 20);
    for (let cycle = 0; cycle < 3; cycle += 1) {
      for (let beta = 1; beta <= 85; beta += 1) turn(0, FRAME_MS, beta, 20);
      for (let beta = 84; beta >= 0; beta -= 1) turn(0, FRAME_MS, beta, 20);
      advance(2000);
      expect(lastYawDegrees()).toBeCloseTo(0, 6);
      expect(timers.size).toBe(0);
    }
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
