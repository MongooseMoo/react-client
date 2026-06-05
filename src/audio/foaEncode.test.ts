import { describe, expect, it } from 'vitest';

import { ambisonicDirectionFromWorld, foaEncodeGainsACN } from './foaEncode';

const close = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) < eps;

describe('foaEncodeGainsACN (ACN/SN3D, [W,Y,Z,X])', () => {
  it('W is always 1 (omnidirectional component)', () => {
    expect(foaEncodeGainsACN([1, 0, 0])[0]).toBe(1);
    expect(foaEncodeGainsACN([0, 0, 1])[0]).toBe(1);
  });

  it('encodes a front source (ambisonic +x) onto the X channel (ACN 3)', () => {
    const [w, y, z, x] = foaEncodeGainsACN([1, 0, 0]);
    expect(w).toBe(1);
    expect(close(x, 1)).toBe(true);
    expect(close(y, 0)).toBe(true);
    expect(close(z, 0)).toBe(true);
  });

  it('encodes a left source (ambisonic +y) onto the Y channel (ACN 1)', () => {
    const [, y, z, x] = foaEncodeGainsACN([0, 1, 0]);
    expect(close(y, 1)).toBe(true);
    expect(close(x, 0)).toBe(true);
    expect(close(z, 0)).toBe(true);
  });

  it('encodes an up source (ambisonic +z) onto the Z channel (ACN 2)', () => {
    const [, y, z, x] = foaEncodeGainsACN([0, 0, 1]);
    expect(close(z, 1)).toBe(true);
    expect(close(x, 0)).toBe(true);
    expect(close(y, 0)).toBe(true);
  });

  it('normalizes a non-unit direction (gains are direction cosines)', () => {
    const [, y, z, x] = foaEncodeGainsACN([3, 0, 0]); // magnitude 3, all front
    expect(close(x, 1)).toBe(true);
    expect(close(y, 0)).toBe(true);
    expect(close(z, 0)).toBe(true);
  });

  it('a 45° front-left direction splits between X and Y equally', () => {
    const [, y, z, x] = foaEncodeGainsACN([1, 1, 0]);
    const inv = 1 / Math.SQRT2;
    expect(close(x, inv)).toBe(true);
    expect(close(y, inv)).toBe(true);
    expect(close(z, 0)).toBe(true);
  });

  it('a degenerate (zero) direction encodes omnidirectional only', () => {
    const [w, y, z, x] = foaEncodeGainsACN([0, 0, 0]);
    expect(w).toBe(1);
    expect(y).toBe(0);
    expect(z).toBe(0);
    expect(x).toBe(0);
  });
});

describe('ambisonicDirectionFromWorld (Web Audio → ambiX axis map)', () => {
  it('Web Audio forward (−z) maps to ambisonic front (+x)', () => {
    expect(ambisonicDirectionFromWorld([0, 0, -1])).toEqual([1, -0, 0]);
  });

  it('Web Audio right (+x) maps to ambisonic right (−left)', () => {
    expect(ambisonicDirectionFromWorld([1, 0, 0])).toEqual([-0, -1, 0]);
  });

  it('Web Audio up (+y) maps to ambisonic up (+z)', () => {
    expect(ambisonicDirectionFromWorld([0, 1, 0])).toEqual([-0, -0, 1]);
  });

  it('composes with the encoder: a contact dead ahead lands on +X', () => {
    const dir = ambisonicDirectionFromWorld([0, 0, -5]); // 5 units forward
    const [, y, z, x] = foaEncodeGainsACN(dir);
    expect(close(x, 1)).toBe(true);
    expect(close(y, 0)).toBe(true);
    expect(close(z, 0)).toBe(true);
  });
});
