import { describe, expect, it } from 'vitest';

import {
  devicePose,
  HeadingFilter,
  type OrientationAngles,
  turnAboutUp,
  wrapDegrees,
  type Vector3,
  yawFrom,
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
  const row = (r: number): Vector3 => [
    a[r][0] * b[0][0] + a[r][1] * b[1][0] + a[r][2] * b[2][0],
    a[r][0] * b[0][1] + a[r][1] * b[1][1] + a[r][2] * b[2][1],
    a[r][0] * b[0][2] + a[r][1] * b[1][2] + a[r][2] * b[2][2],
  ];
  return [row(0), row(1), row(2)];
}

const D = Math.PI / 180;

/** Rotation by `deg` about the unit `axis` (earth east, north, up), right-handed. */
function rotAbout(axis: Vector3, deg: number): Matrix {
  const [x, y, z] = axis;
  const c = Math.cos(deg * D);
  const s = Math.sin(deg * D);
  const t = 1 - c;
  return [
    [t * x * x + c, t * x * y - s * z, t * x * z + s * y],
    [t * x * y + s * z, t * y * y + c, t * y * z - s * x],
    [t * x * z - s * y, t * y * z + s * x, t * z * z + c],
  ];
}
const rotZ = (deg: number) => rotAbout([0, 0, 1], deg);
const rotX = (deg: number) => rotAbout([1, 0, 0], deg);
const rotY = (deg: number) => rotAbout([0, 1, 0], deg);

/** The W3C alpha/beta/gamma of a device-to-earth rotation R = Rz(alpha) Rx(beta) Ry(gamma). */
function anglesOf(r: Matrix): OrientationAngles {
  if (Math.abs(r[2][1]) > 1 - 1e-12) {
    // beta is +-90 (gimbal lock): alpha and gamma turn about the same axis, so take
    // gamma 0, leaving R = Rz(alpha) Rx(beta) with alpha in the first column.
    return { alpha: Math.atan2(r[1][0], r[0][0]) / D, beta: Math.sign(r[2][1]) * 90, gamma: 0 };
  }
  return {
    alpha: Math.atan2(-r[0][1], r[1][1]) / D,
    beta: Math.asin(Math.max(-1, Math.min(1, r[2][1]))) / D,
    gamma: Math.atan2(-r[2][0], r[2][2]) / D,
  };
}

/** The head yaw from a reference pose to a current one, both given as rotations. */
function yawBetween(reference: Matrix, current: Matrix, screenAngle = 0): number {
  const from = devicePose(anglesOf(reference), screenAngle);
  const to = devicePose(anglesOf(current), screenAngle);
  if (!from || !to) throw new Error('no pose');
  return yawFrom(from, to).yaw;
}

/** Reference poses: flat, upright, pitched and rolled, facing various ways. */
const REFERENCES: Array<[string, Matrix]> = [
  ['flat, facing north', rotZ(0)],
  ['flat, facing 75', rotZ(-75)],
  ['upright, facing north', rotX(80)],
  ['upright, facing 200', multiply(rotZ(-200), rotX(80))],
  ['pitched 45, rolled 20, facing 30', multiply(multiply(rotZ(-30), rotX(45)), rotY(20))],
  ['pitched 60, rolled -35', multiply(rotX(60), rotY(-35))],
];

/** Earth-horizontal axes (a head held level rolls and nods about these). */
const HORIZONTAL_AXES: Vector3[] = [0, 45, 90, 135].map((deg) => [Math.cos(deg * D), Math.sin(deg * D), 0]);

describe('yawFrom (the head yaw from the recentered pose)', () => {
  it('is 0 for the reference pose itself', () => {
    for (const [, reference] of REFERENCES) {
      expect(yawBetween(reference, reference)).toBeCloseTo(0, 9);
    }
  });

  it('reads a turn about the vertical as that turn, clockwise positive, from any pose', () => {
    for (const [, reference] of REFERENCES) {
      for (const turn of [-170, -45, 10, 90, 179]) {
        // Rz(-turn) is a clockwise turn by `turn`, seen from above.
        expect(yawBetween(reference, multiply(rotZ(-turn), reference))).toBeCloseTo(turn, 6);
      }
    }
  });

  it('adds no yaw for a turn about any earth-horizontal axis, from any pose', () => {
    for (const [, reference] of REFERENCES) {
      for (const axis of HORIZONTAL_AXES) {
        for (const tilt of [-60, -20, 30, 60]) {
          expect(yawBetween(reference, multiply(rotAbout(axis, tilt), reference))).toBeCloseTo(0, 6);
        }
      }
    }
  });

  it('reads the turn alone for a turn about the vertical with one earth-horizontal tilt', () => {
    for (const [, reference] of REFERENCES) {
      for (const axis of HORIZONTAL_AXES) {
        const pose = multiply(multiply(rotZ(-40), rotAbout(axis, 35)), reference);
        expect(yawBetween(reference, pose)).toBeCloseTo(40, 6);
      }
    }
  });

  it('adds no yaw for a sideways roll of an upright device (its back axis is horizontal)', () => {
    const upright = devicePose({ alpha: 0, beta: 90, gamma: 0 }, 0);
    const rolled = devicePose({ alpha: 270, beta: 60, gamma: 89.999999 }, 0);
    if (!upright || !rolled) throw new Error('no pose');
    expect(yawFrom(upright, rolled).yaw).toBeCloseTo(0, 4);
  });

  // Documented behaviour, not a goal. A roll about an axis that is NOT
  // earth-horizontal couples into yaw: here the device is tipped 30 degrees from
  // upright (pitch 60) and then rolled 30 degrees about its own back, which keeps
  // the back pointing exactly where it did. The twist reads part of that roll as
  // a turn. Handheld, the main gesture is turning about the vertical, which reads
  // exactly; a fixed facing axis would avoid this but brings back the axis
  // singularities and switching of the earlier designs. The preference help says
  // that tilting sideways while tipped forward turns the sound a little.
  it('reads a roll while tipped forward as partly a turn (documented, review round 3)', () => {
    const tipped = rotX(60);
    const tippedAndRolled = multiply(tipped, rotZ(30));
    // Recentered while tipped: about 15 degrees.
    expect(yawBetween(tipped, tippedAndRolled)).toBeCloseTo(-15.2615, 3);
    // Recentered upright, then tipped and rolled: about 8 degrees.
    expect(yawBetween(rotX(90), tippedAndRolled)).toBeCloseTo(-8.2132, 3);
  });

  it.each([90, 270])('compensates a turn into landscape with the screen (angle %i)', (angle) => {
    const portrait = devicePose({ alpha: 0, beta: 0, gamma: 0 }, 0);
    // Flat, turned a quarter in the hand with the screen: the facing has not changed.
    const landscape = devicePose({ alpha: angle, beta: 0, gamma: 0 }, angle);
    if (!portrait || !landscape) throw new Error('no pose');
    expect(yawFrom(portrait, landscape).yaw).toBeCloseTo(0, 9);
  });

  it.each([0, 90, 270])('returns to exactly the start after repeated pitch cycles (screen angle %i)', (screenAngle) => {
    for (const gamma of [20, 25, -35]) {
      const start = devicePose({ alpha: 0, beta: 0, gamma }, screenAngle);
      if (!start) throw new Error('no pose');
      for (let cycle = 0; cycle < 3; cycle += 1) {
        for (let beta = 0; beta <= 85; beta += 1) devicePose({ alpha: 0, beta, gamma }, screenAngle);
        let end: number | null = null;
        for (let beta = 85; beta >= 0; beta -= 1) {
          const pose = devicePose({ alpha: 0, beta, gamma }, screenAngle);
          if (pose) end = yawFrom(start, pose).yaw;
        }
        expect(end).toBeCloseTo(0, 9);
      }
    }
  });

  it('returns to exactly the start after a mixed pitch, roll and turn loop', () => {
    const at = (t: number): OrientationAngles => ({
      alpha: 30 * Math.sin(t),
      beta: 40 + 40 * Math.sin(2 * t),
      gamma: 50 * Math.cos(3 * t),
    });
    const start = devicePose(at(0), 0);
    if (!start) throw new Error('no pose');
    for (let cycle = 1; cycle <= 3; cycle += 1) {
      const end = devicePose(at(cycle * 2 * Math.PI), 0);
      if (!end) throw new Error('no pose');
      expect(yawFrom(start, end).yaw).toBeCloseTo(0, 9);
    }
  });

  it('reports how well conditioned the yaw is: 1 level with the reference, 0 flipped over', () => {
    const flat = devicePose({ alpha: 0, beta: 0, gamma: 0 }, 0);
    if (!flat) throw new Error('no pose');
    const at = (beta: number, gamma = 0) => {
      const pose = devicePose({ alpha: 0, beta, gamma }, 0);
      if (!pose) throw new Error('no pose');
      return yawFrom(flat, pose);
    };
    expect(at(0).conditioning).toBeCloseTo(1, 9);
    // A tilt of t from the reference: conditioning cos(t / 2).
    expect(at(90).conditioning).toBeCloseTo(Math.cos(Math.PI / 4), 9);
    expect(at(180).conditioning).toBeCloseTo(0, 9);
    // A turn about the vertical does not lower it.
    const turned = devicePose({ alpha: 120, beta: 0, gamma: 0 }, 0);
    if (!turned) throw new Error('no pose');
    expect(yawFrom(flat, turned).conditioning).toBeCloseTo(1, 9);
  });

  it('is badly conditioned near the flip, and tame above the leave threshold (0.61)', () => {
    const flat = devicePose({ alpha: 0, beta: 0, gamma: 0 }, 0);
    if (!flat) throw new Error('no pose');
    const yawAt = (beta: number, gamma: number) => {
      const pose = devicePose({ alpha: 0, beta, gamma }, 0);
      if (!pose) throw new Error('no pose');
      return yawFrom(flat, pose);
    };
    // The review case: at beta 179.9, a 0.1 degree wobble swings the yaw by about 90.
    expect(yawAt(179.9, 0.1).conditioning).toBeLessThan(0.15);
    expect(Math.abs(wrapDegrees(yawAt(179.9, 0.1).yaw - yawAt(179.9, -0.1).yaw))).toBeGreaterThan(90);
    // At conditioning 0.61 or more, the same 0.2 degree wobble moves the yaw by under
    // twice as much (the amplification is about 1 / conditioning).
    for (const beta of [104, 90, 45]) {
      const conditioning = yawAt(beta, 0).conditioning;
      expect(conditioning).toBeGreaterThanOrEqual(0.61);
      const amplification = Math.abs(wrapDegrees(yawAt(beta, 0.1).yaw - yawAt(beta, -0.1).yaw)) / 0.2;
      expect(amplification).toBeLessThan(2);
      expect(amplification).toBeLessThanOrEqual(1 / conditioning + 0.01);
    }
  });

  it('has no pose for a reading without angles', () => {
    expect(devicePose({ alpha: null, beta: null, gamma: null }, 0)).toBeNull();
    expect(devicePose({ alpha: 10, beta: null, gamma: 0 }, 0)).toBeNull();
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
