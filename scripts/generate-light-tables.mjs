#!/usr/bin/env node
/**
 * Writes the two generated light data files the 3D room view reads:
 *
 * - src/map/lightTables.ts: the colour of a blackbody by colour temperature, and the linear map from
 *   linear sRGB to scotopic (rod) luminance. Derived from the CIE's published tables, which are
 *   CC BY-SA 4.0 and are not copied into the repository: only numbers computed from them are.
 *     CIE 2019, Colour-matching functions of CIE 1931 standard colorimetric observer, CIE, Vienna,
 *       DOI 10.25039/CIE.DS.xvudnb9b, https://files.cie.co.at/Publications-datasets/CIE_xyz_1931_2deg.csv
 *       (sha256 fa663e3535a7e0763a745993a1f0a192eb0275ac46ad2d1befd7626841e713c1)
 *     CIE 2019, CIE spectral luminous efficiency for scotopic vision, CIE, Vienna,
 *       DOI 10.25039/CIE.DS.gr6w4b5g, https://files.cie.co.at/Publications-datasets/CIE_sle_scotopic.csv
 *       (sha256 6a75d3fdbcbf5e9e9a07478511933eefeda953f3e2cc14b74459e5a099ec3759)
 * - src/map/hosekWilkieRGB.ts: the RGB coefficient set of Hosek and Wilkie's sky model, from
 *   ArHosekSkyModelData_RGB.h in their reference code 1.4a
 *   (https://cgg.mff.cuni.cz/projects/SkylightModelling/HosekWilkie_SkylightModel_C_Source.1.4a.zip),
 *   under its 3-clause BSD licence, which the generated file carries.
 *
 * Usage: node scripts/generate-light-tables.mjs <CIE_xyz_1931_2deg.csv> <CIE_sle_scotopic.csv> <ArHosekSkyModelData_RGB.h>
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const [xyzPath, scotopicPath, hosekPath] = process.argv.slice(2);
if (!xyzPath || !scotopicPath || !hosekPath) {
  console.error("usage: generate-light-tables.mjs <CIE_xyz_1931_2deg.csv> <CIE_sle_scotopic.csv> <ArHosekSkyModelData_RGB.h>");
  process.exit(2);
}

const expect = {
  [xyzPath]: "fa663e3535a7e0763a745993a1f0a192eb0275ac46ad2d1befd7626841e713c1",
  [scotopicPath]: "6a75d3fdbcbf5e9e9a07478511933eefeda953f3e2cc14b74459e5a099ec3759",
};
for (const [path, sha] of Object.entries(expect)) {
  const got = createHash("sha256").update(readFileSync(path)).digest("hex");
  if (got !== sha) throw new Error(`${path}: sha256 ${got}, expected ${sha} (not the CIE's published file)`);
}

const rows = (path) => readFileSync(path, "utf8").trim().split(/\r?\n/).map((line) => line.split(",").map(Number))
  .filter((r) => r.every((n) => Number.isFinite(n)));
const cmf = new Map(rows(xyzPath).map(([l, x, y, z]) => [l, [x, y, z]]));
const scotopic = new Map(rows(scotopicPath).map(([l, v]) => [l, v]));

// Linear sRGB (Rec. 709 primaries, D65) from CIE XYZ: the inverse of three.js's LINEAR_REC709_TO_XYZ
// (src/math/ColorManagement.js), so the client and this table use one matrix.
const TO_XYZ = [
  [0.4123908, 0.3575843, 0.1804808],
  [0.212639, 0.7151687, 0.0721923],
  [0.0193308, 0.1191948, 0.9505322],
];
function invert3(m) {
  const [[a, b, c], [d, e, f], [g, h, i]] = m;
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C;
  return [
    [A / det, -(b * i - c * h) / det, (b * f - c * e) / det],
    [B / det, (a * i - c * g) / det, -(a * f - c * d) / det],
    [C / det, -(a * h - b * g) / det, (a * e - b * d) / det],
  ];
}
const FROM_XYZ = invert3(TO_XYZ);
const mul = (m, v) => m.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);

// Planck's law, spectral radiant exitance up to a constant: lambda^-5 / (exp(c2 / (lambda T)) - 1), c2 = hc/k.
const C2 = 1.4387769e-2; // m K
const planck = (nm, kelvin) => {
  const l = nm * 1e-9;
  return 1 / (l ** 5 * Math.expm1(C2 / (l * kelvin)));
};

/** A blackbody's colour in linear sRGB, out-of-gamut negatives clipped to 0, scaled to luminance (Y) 1. */
function blackbody(kelvin) {
  const xyz = [0, 0, 0];
  for (const [nm, [x, y, z]] of cmf) {
    const p = planck(nm, kelvin);
    xyz[0] += p * x;
    xyz[1] += p * y;
    xyz[2] += p * z;
  }
  const rgb = mul(FROM_XYZ, xyz).map((c) => Math.max(0, c));
  const luminance = rgb[0] * TO_XYZ[1][0] + rgb[1] * TO_XYZ[1][1] + rgb[2] * TO_XYZ[1][2];
  return rgb.map((c) => c / luminance);
}

export const KELVIN_MIN = 1000;
export const KELVIN_MAX = 25000;
export const KELVIN_STEP = 100;
const kelvin = [];
for (let k = KELVIN_MIN; k <= KELVIN_MAX; k += KELVIN_STEP) kelvin.push(...blackbody(k).map((c) => Number(c.toFixed(5))));

// Scotopic luminance from linear sRGB, fitted to what this renderer carries: for each blackbody from KELVIN_MIN to
// KELVIN_MAX, its exact scotopic luminance V = 1700 lm/W x integral(spectrum x V'(lambda)) against its linear sRGB
// (whose luminance is 683 x integral(spectrum x ybar)), by least squares on relative error.
const K_SCOTOPIC = 1700, K_PHOTOPIC = 683;
const samples = [];
for (let k = KELVIN_MIN; k <= KELVIN_MAX; k += KELVIN_STEP) {
  const xyz = [0, 0, 0];
  let v = 0;
  for (const [nm, [x, y, z]] of cmf) {
    const p = planck(nm, k);
    xyz[0] += K_PHOTOPIC * p * x; xyz[1] += K_PHOTOPIC * p * y; xyz[2] += K_PHOTOPIC * p * z;
    if (scotopic.has(nm)) v += K_SCOTOPIC * p * scotopic.get(nm);
  }
  const rgb = mul(FROM_XYZ, xyz);
  samples.push({ rgb: rgb.map((c) => c / v), v: 1 }); // relative: each sample scaled to V = 1
}
const ata = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
const atb = [0, 0, 0];
for (const { rgb, v } of samples) for (let i = 0; i < 3; i++) {
  atb[i] += rgb[i] * v;
  for (let j = 0; j < 3; j++) ata[i][j] += rgb[i] * rgb[j];
}
const vrgb = mul(invert3(ata), atb);
let worst = 0;
for (const { rgb } of samples) worst = Math.max(worst, Math.abs(vrgb[0] * rgb[0] + vrgb[1] * rgb[1] + vrgb[2] * rgb[2] - 1));
// Checked against Jensen et al. 2000 p.6, which prints Y/V = 0.4468 for a uniform white field.
let sumY = 0, sumV = 0;
for (const [l] of scotopic) if (cmf.has(l)) { sumY += K_PHOTOPIC * cmf.get(l)[1]; sumV += K_SCOTOPIC * scotopic.get(l); }
const whiteRatioExact = sumY / sumV;

const ts = `// Generated by scripts/generate-light-tables.mjs; do not edit. Numbers derived from the CIE's tables:
// CIE 2019, Colour-matching functions of CIE 1931 standard colorimetric observer, DOI 10.25039/CIE.DS.xvudnb9b;
// CIE 2019, CIE spectral luminous efficiency for scotopic vision, DOI 10.25039/CIE.DS.gr6w4b5g (both CC BY-SA 4.0).

/** Blackbody colour temperatures in the table: from KELVIN_MIN to KELVIN_MAX by KELVIN_STEP. */
export const KELVIN_MIN = ${KELVIN_MIN};
export const KELVIN_MAX = ${KELVIN_MAX};
export const KELVIN_STEP = ${KELVIN_STEP};
/**
 * A blackbody's colour at each temperature: Planck's law against the CIE 1931 2-degree observer (360-830 nm,
 * 1 nm), into linear sRGB, negatives clipped to 0, then scaled to luminance 1. Three numbers per temperature.
 */
// biome-ignore lint/suspicious/noApproximativeNumericConstant: computed colour values; one is near sqrt(2) by chance.
export const BLACKBODY_LINEAR_SRGB: readonly number[] = [${kelvin.join(",")}];

/**
 * Scotopic luminance (scotopic cd/m^2) from linear sRGB radiance whose luminance is in cd/m^2: V = r R + g G + b B.
 * Fitted by least squares on relative error to the exact scotopic luminance (1700 lm/W against the CIE V'(lambda))
 * of blackbodies from ${KELVIN_MIN} to ${KELVIN_MAX} K; worst error over them ${(worst * 100).toFixed(1)}%.
 */
export const SCOTOPIC_FROM_LINEAR_SRGB: readonly [number, number, number] = [${vrgb.map((c) => c.toFixed(5)).join(", ")}];
/** Photopic Y over scotopic V for an equal-energy spectrum, from the CIE tables (Jensen et al. 2000 p.6 print 0.4468). */
export const WHITE_Y_OVER_V = ${whiteRatioExact.toFixed(4)};
`;
writeFileSync(new URL("../src/map/lightTables.ts", import.meta.url), ts);

// Hosek-Wilkie RGB: the BSD notice from the header, then its six arrays as numbers.
const header = readFileSync(hosekPath, "utf8");
const notice = header.slice(header.indexOf("/*"), header.indexOf("*/") + 2);
const array = (name) => {
  const start = header.indexOf(`double ${name}[] =`);
  if (start < 0) throw new Error(`${name} not in ${hosekPath}`);
  const body = header.slice(header.indexOf("{", start) + 1, header.indexOf("};", start));
  const numbers = body.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").split(",").map((s) => s.trim()).filter(Boolean).map(Number);
  if (numbers.some((n) => !Number.isFinite(n))) throw new Error(`${name}: a value is not a number`);
  return numbers;
};
const datasets = [1, 2, 3].map((c) => array(`datasetRGB${c}`));
const radiances = [1, 2, 3].map((c) => array(`datasetRGBRad${c}`));
for (const d of datasets) if (d.length !== 1080) throw new Error(`a coefficient set has ${d.length} values, not 1080`);
for (const r of radiances) if (r.length !== 120) throw new Error(`a radiance set has ${r.length} values, not 120`);
const hw = `// Generated by scripts/generate-light-tables.mjs from ArHosekSkyModelData_RGB.h (Hosek-Wilkie reference code 1.4a);
// do not edit. The header's licence follows and covers these numbers.
${notice}

/**
 * Per channel (R, G, B: "sRGB primaries with a linear gamma ramp", per the header) 1080 coefficients: albedo 0
 * then 1, turbidity 1 to 10, six control points, nine parameters stored A B C D E F G I H.
 */
export const HOSEK_RGB: readonly (readonly number[])[] = [
${datasets.map((d) => `  [${d.join(",")}]`).join(",\n")},
];
/** Per channel 120 master radiance values: albedo 0 then 1, turbidity 1 to 10, six control points. */
export const HOSEK_RGB_RADIANCE: readonly (readonly number[])[] = [
${radiances.map((d) => `  [${d.join(",")}]`).join(",\n")},
];
`;
writeFileSync(new URL("../src/map/hosekWilkieRGB.ts", import.meta.url), hw);
console.log(`scotopic fit worst error ${(worst * 100).toFixed(2)}%; V coefficients on linear sRGB ${vrgb.map((c) => c.toFixed(4)).join(" ")}; white Y/V ${whiteRatioExact.toFixed(4)}`);
