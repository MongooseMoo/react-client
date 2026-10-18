import { describe, expect, it } from 'vitest';

import {
  FacingHeading,
  HeadingFilter,
  type OrientationAngles,
  turnAboutUp,
  wrapDegrees,
  type Vector3,
} from './headYaw';

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

type Matrix = [Vector3, Vector3, Vector3];

function multiply(a: Matrix, b: Matrix): Matrix {
  const row = (r: number): Vector3 => [0, 1, 2].map((c) =>
    a[r][0] * b[0][c] + a[r][1] * b[1][c] + a[r][2] * b[2][c]) as Vector3;
  return [row(0), row(1), row(2)];
}

const D = Math.PI / 180;
const rotZ = (deg: number): Matrix => {
  const c = Math.cos(deg * D);
  const s = Math.sin(deg * D);
  return [[c, -s, 0], [s, c, 0], [0, 0, 1]];
};
const rotX = (deg: number): Matrix => {
  const c = Math.cos(deg * D);
  const s = Math.sin(deg * D);
  return [[1, 0, 0], [0, c, -s], [0, s, c]];
};
const rotY = (deg: number): Matrix => {
  const c = Math.cos(deg * D);
  const s = Math.sin(deg * D);
  return [[c, 0, s], [0, 1, 0], [-s, 0, c]];
};

/** The W3C alpha/beta/gamma of a device-to-earth rotation R = Rz(alpha) Rx(beta) Ry(gamma). */
function anglesOf(r: Matrix): OrientationAngles {
  return {
    alpha: Math.atan2(-r[0][1], r[1][1]) / D,
    beta: Math.asin(r[2][1]) / D,
    gamma: Math.atan2(-r[2][0], r[2][2]) / D,
  };
}

/** One reading's heading from a fresh FacingHeading. */
function deviceHeading(angles: OrientationAngles, screenAngle: number): number | null {
  return new FacingHeading().read(angles, screenAngle);
}

describe('FacingHeading', () => {
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

  it('ignores roll about the back of an upright device (the review case)', () => {
    // Back still pointing north, rolled about 30 degrees sideways.
    expect(deviceHeading({ alpha: 270, beta: 60, gamma: 89.999999 }, 0)).toBeCloseTo(0, 3);
  });

  it.each([0, 90, 270])('ignores pure roll of an upright device at screen angle %i', (screenAngle) => {
    for (const facing of [0, 40, 200]) {
      for (const pitch of [60, 80]) {
        const upright = multiply(rotZ(-facing), rotX(pitch));
        for (const roll of [-60, -30, 0, 30, 60]) {
          // Roll is a turn about the device's own back axis (device z).
          const heading = deviceHeading(anglesOf(multiply(upright, rotZ(roll))), screenAngle);
          expect(wrapDegrees((heading ?? Number.NaN) - facing)).toBeCloseTo(0, 6);
        }
      }
    }
  });

  it('ignores pure roll of a flat device about its screen-up axis, in portrait and landscape', () => {
    for (const facing of [0, 75]) {
      for (const roll of [-20, -10, 10, 20]) {
        // Portrait: screen up is device +y.
        const portrait = multiply(multiply(rotZ(-facing), rotY(0)), rotY(roll));
        expect(wrapDegrees((deviceHeading(anglesOf(portrait), 0) ?? Number.NaN) - facing)).toBeCloseTo(0, 6);
        // Landscape at angle 90: screen up is device +x, so the device is turned a
        // quarter counter-clockwise; roll is about device x.
        const landscape = multiply(rotZ(90 - facing), rotX(roll));
        expect(wrapDegrees((deviceHeading(anglesOf(landscape), 90) ?? Number.NaN) - facing)).toBeCloseTo(0, 6);
      }
    }
  });

  it('stays continuous while pitching from flat to upright with a roll, and never loses the heading', () => {
    const facing = new FacingHeading();
    let previous: number | null = null;
    // (anglesOf is degenerate at exactly 90 degrees of pitch, so stop at 85.)
    // A rolled device's facing axis really does swing a little as it pitches
    // (up to about 2 degrees per degree near flat here); the bound catches a
    // jump at an axis switch, which would be tens of degrees.
    for (let pitch = 0; pitch <= 85; pitch += 1) {
      const heading = facing.read(anglesOf(multiply(multiply(rotZ(-20), rotX(pitch)), rotY(25))), 0);
      expect(heading).not.toBeNull();
      if (previous !== null && heading !== null) {
        expect(Math.abs(wrapDegrees(heading - previous))).toBeLessThan(3);
      }
      previous = heading;
    }
    // And back again, through the other switch point.
    for (let pitch = 85; pitch >= 0; pitch -= 1) {
      const heading = facing.read(anglesOf(multiply(multiply(rotZ(-20), rotX(pitch)), rotY(25))), 0);
      if (previous !== null && heading !== null) {
        expect(Math.abs(wrapDegrees(heading - previous))).toBeLessThan(3);
      }
      previous = heading;
    }
  });

  it('reads a turn after an axis switch as the full turn', () => {
    const facing = new FacingHeading();
    // Start flat (screen-up axis), pitch upright (switches to the back axis).
    for (let pitch = 0; pitch <= 85; pitch += 5) facing.read(anglesOf(rotX(pitch)), 0);
    const before = facing.read(anglesOf(rotX(85)), 0) ?? Number.NaN;
    const after = facing.read(anglesOf(multiply(rotZ(-30), rotX(85))), 0) ?? Number.NaN;
    expect(wrapDegrees(after - before)).toBeCloseTo(30, 6);
  });
});

describe('HeadingFilter', () => {
  it('passes the first reading through unchanged', () => {
    const filter = new HeadingFilter();
    expect(filter.update(42, 0)).toBe(42);
  });

  it('snap lands on the latest heading, unwrapped, and stays settled there', () => {
    const filter = new HeadingFilter();
    filter.update(350, 0);
    filter.update(20, 16); // 30 degrees on, through 360
    expect(filter.settled).toBe(false);
    expect(filter.snap()).toBe(380);
    expect(filter.settled).toBe(true);
    expect(filter.update(20, 32)).toBe(380);
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
