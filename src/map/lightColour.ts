/**
 * Light's colour for the 3D view: a blackbody's colour by colour temperature and the scotopic (rod) luminance of a
 * colour, from numbers derived from the CIE's tables (`lightTables.ts`, made by scripts/generate-light-tables.mjs).
 * Loaded only with the 3D view.
 */
import { BLACKBODY_LINEAR_SRGB, KELVIN_MAX, KELVIN_MIN, KELVIN_STEP, SCOTOPIC_FROM_LINEAR_SRGB } from "./lightTables";

/** A blackbody's colour at `kelvin` (clamped to the table, 1000 to 25000 K) in linear sRGB, at luminance 1. */
export function kelvinColour(kelvin: number): [number, number, number] {
  const k = Math.min(KELVIN_MAX, Math.max(KELVIN_MIN, kelvin));
  const at = (k - KELVIN_MIN) / KELVIN_STEP;
  const i = Math.min(Math.floor(at), (KELVIN_MAX - KELVIN_MIN) / KELVIN_STEP - 1);
  const t = at - i;
  const c = (n: number) => BLACKBODY_LINEAR_SRGB[i * 3 + n] * (1 - t) + BLACKBODY_LINEAR_SRGB[(i + 1) * 3 + n] * t;
  const rgb: [number, number, number] = [c(0), c(1), c(2)];
  const y = luminance(rgb);
  return [rgb[0] / y, rgb[1] / y, rgb[2] / y];
}

/** Luminance (CIE Y) of linear sRGB, by three.js's Rec. 709 coefficients. */
export const luminance = ([r, g, b]: readonly [number, number, number]): number => 0.212639 * r + 0.7151687 * g + 0.0721923 * b;

/** Scotopic luminance of linear sRGB radiance (`SCOTOPIC_FROM_LINEAR_SRGB`). */
export const scotopicLuminance = ([r, g, b]: readonly [number, number, number]): number =>
  SCOTOPIC_FROM_LINEAR_SRGB[0] * r + SCOTOPIC_FROM_LINEAR_SRGB[1] * g + SCOTOPIC_FROM_LINEAR_SRGB[2] * b;

