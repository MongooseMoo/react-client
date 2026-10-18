import { describe, expect, it } from 'vitest';

import { deviceHeading, HeadingFilter, turnAboutUp, wrapDegrees, type Vector3 } from './headYaw';

/** Listener yaw as MediaService reads it from a forward vector. */
function listenerYaw(forward: Vector3): number {
  return Math.atan2(forward[0], -forward[2]);
}

function expectVector(actual: Vector3, expected: Vector3): void {
  actual.forEach((value, index) => {
    expect(value).toBeCloseTo(expected[index], 9);
  });
}

describe('wrapDegrees', () => {
  it('wraps into (-180, 180]', () => {
    expect(wrapDegrees(0)).toBe(0);
    expect(wrapDegrees(190)).toBe(-170);
    expect(wrapDegrees(-190)).toBe(170);
    expect(wrapDegrees(360)).toBe(0);
    expect(wrapDegrees(-180)).toBe(180);
    expect(wrapDegrees(180)).toBe(180);
    expect(wrapDegrees(725)).toBe(5);
  });
});

describe('deviceHeading', () => {
  it('reads a flat device by where its top edge points, clockwise from the zero', () => {
    expect(deviceHeading({ alpha: 0, beta: 0, gamma: 0 }, 0)).toBeCloseTo(0);
    // alpha grows counter-clockwise, so a device turned left by 90 heads 270.
    expect(deviceHeading({ alpha: 90, beta: 0, gamma: 0 }, 0)).toBeCloseTo(270);
    expect(deviceHeading({ alpha: 270, beta: 0, gamma: 0 }, 0)).toBeCloseTo(90);
  });

  it('reads an upright device by where its back points', () => {
    expect(deviceHeading({ alpha: 0, beta: 90, gamma: 0 }, 0)).toBeCloseTo(0);
    expect(deviceHeading({ alpha: 30, beta: 90, gamma: 0 }, 0)).toBeCloseTo(330);
    // Tilting between flat and upright does not move the heading.
    expect(deviceHeading({ alpha: 30, beta: 45, gamma: 0 }, 0)).toBeCloseTo(330);
  });

  it('compensates for the screen angle, so turning the device to landscape keeps the heading', () => {
    // Facing north, flat, in portrait.
    const portrait = deviceHeading({ alpha: 0, beta: 0, gamma: 0 }, 0);
    // Same facing; the device turned a quarter counter-clockwise into landscape
    // (screen angle 90), so its alpha is now 90.
    const landscape = deviceHeading({ alpha: 90, beta: 0, gamma: 0 }, 90);
    expect(landscape).toBeCloseTo(portrait ?? Number.NaN);
    // The other landscape (device turned clockwise, screen angle 270).
    expect(deviceHeading({ alpha: 270, beta: 0, gamma: 0 }, 270)).toBeCloseTo(0);
    // Upright in landscape (screen top along the device's +x, now pointing up),
    // its back facing east.
    expect(deviceHeading({ alpha: 0, beta: 0, gamma: -90 }, 90)).toBeCloseTo(90);
  });

  it('returns null when the reading has no angles', () => {
    expect(deviceHeading({ alpha: null, beta: null, gamma: null }, 0)).toBeNull();
    expect(deviceHeading({ alpha: 10, beta: null, gamma: 0 }, 0)).toBeNull();
  });
});

describe('HeadingFilter', () => {
  it('passes the first reading through unchanged', () => {
    const filter = new HeadingFilter();
    expect(filter.update(42, 0)).toBe(42);
  });

  it('unwraps across 0/360 instead of swinging the long way round', () => {
    const filter = new HeadingFilter();
    filter.update(359, 0);
    const next = filter.update(1, 16);
    // Continuous: just above 359, never back toward 1 through 180.
    expect(next).toBeGreaterThan(359);
    expect(next).toBeLessThanOrEqual(361);
    let value = next;
    for (let t = 32; t < 1000; t += 16) value = filter.update(1, t);
    expect(value).toBeCloseTo(361, 1);
  });

  it('settles small jitter at rest', () => {
    const filter = new HeadingFilter();
    filter.update(100, 0);
    let max = 0;
    for (let i = 1; i < 120; i += 1) {
      const jitter = i % 2 === 0 ? 0.4 : -0.4;
      max = Math.max(max, Math.abs(filter.update(100 + jitter, i * 16) - 100));
    }
    expect(max).toBeLessThan(0.15);
  });

  it('follows a fast turn with little lag', () => {
    const filter = new HeadingFilter();
    // 180 degrees per second for half a second, sampled at 60 Hz.
    let value = 0;
    let truth = 0;
    for (let i = 0; i <= 30; i += 1) {
      truth = i * 3;
      value = filter.update(truth, i * (1000 / 60));
    }
    // Within about 5 degrees (under 30 ms of lag at this speed).
    expect(truth - value).toBeLessThan(5);
  });
});

describe('turnAboutUp', () => {
  it('turns the facing clockwise seen from above, matching the listener yaw', () => {
    const turned = turnAboutUp([0, 0, -1], [0, 1, 0], Math.PI / 2);
    expectVector(turned, [1, 0, 0]);
    expect(listenerYaw(turned)).toBeCloseTo(Math.PI / 2);
  });

  it('adds the head yaw to the body yaw', () => {
    const body: Vector3 = [-1, 0, 0]; // facing west: yaw -90 degrees
    const turned = turnAboutUp(body, [0, 1, 0], Math.PI / 6);
    expect(listenerYaw(turned)).toBeCloseTo(-Math.PI / 2 + Math.PI / 6);
  });

  it('turns about the body up axis, keeping the facing perpendicular to it', () => {
    const up: Vector3 = [0, Math.SQRT1_2, Math.SQRT1_2];
    const forward: Vector3 = [0, Math.SQRT1_2, -Math.SQRT1_2];
    const turned = turnAboutUp(forward, up, 0.7);
    const dot = turned[0] * up[0] + turned[1] * up[1] + turned[2] * up[2];
    expect(dot).toBeCloseTo(0, 9);
    expect(Math.hypot(...turned)).toBeCloseTo(1, 9);
  });

  it('returns the facing unchanged for a zero yaw', () => {
    const forward: Vector3 = [0.3, 0.1, -0.9];
    expect(turnAboutUp(forward, [0, 1, 0], 0)).toEqual(forward);
  });
});
