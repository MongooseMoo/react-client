import { describe, expect, it } from "vitest";
import { HOSEK_RGB, HOSEK_RGB_RADIANCE } from "./hosekWilkieRGB";
import { kelvinColour, luminance } from "./lightColour";
import { channelRadiance, cookChannel, cookSky, DISC_SOLID_ANGLE, skyIrradiance, skyLook } from "./sky";

const at = (degrees: number): [number, number, number] => {
  const e = (degrees * Math.PI) / 180;
  return [0, Math.cos(e), Math.sin(e)];
};

describe("Hosek-Wilkie sky", () => {
  it("carries the reference code's whole RGB set", () => {
    expect(HOSEK_RGB.map((c) => c.length)).toEqual([1080, 1080, 1080]);
    expect(HOSEK_RGB_RADIANCE.map((c) => c.length)).toEqual([120, 120, 120]);
  });

  it("cooks at a control point to that point's stored coefficients", () => {
    // Turbidity 1, albedo 0, sun at the zenith (x = 1): the sixth control point, parameters 0..8 at offset 45.
    const { config, radiance } = cookChannel(0, 1, 0, Math.PI / 2);
    expect(config).toEqual(HOSEK_RGB[0].slice(45, 54));
    expect(radiance).toBe(HOSEK_RGB_RADIANCE[0][5]);
    // At turbidity 10 only that turbidity is used (the reference code stops before an 11th).
    const top = cookChannel(2, 10, 1, 0);
    expect(top.config).toEqual(HOSEK_RGB[2].slice(9 * 6 * 10 + 9 * 6 * 9, 9 * 6 * 10 + 9 * 6 * 9 + 9));
  });

  it("stays finite with the sun below the horizon, evaluated at elevation 0", () => {
    const below = cookSky(at(-8), [0.1, 0.1, 0.1]);
    const horizon = cookSky(at(0), [0.1, 0.1, 0.1]);
    expect(below.map((c) => c.config)).toEqual(horizon.map((c) => c.config));
    for (const c of below) for (const v of [...c.config, c.radiance]) expect(Number.isFinite(v)).toBe(true);
    for (const theta of [0, 0.5, 1.2, Math.PI / 2]) expect(Number.isFinite(channelRadiance(below[0], theta, 0.3))).toBe(true);
  });

  it("is brighter toward the sun than away from it, and bluer overhead than at a low sun's horizon", () => {
    const sky = cookSky(at(30), [0.1, 0.1, 0.1]);
    const towards = sky.map((c) => channelRadiance(c, (60 * Math.PI) / 180, 0.1));
    const away = sky.map((c) => channelRadiance(c, (60 * Math.PI) / 180, Math.PI - 0.1));
    expect(luminance(towards as [number, number, number])).toBeGreaterThan(luminance(away as [number, number, number]));
    const zenith = sky.map((c) => channelRadiance(c, 0, (60 * Math.PI) / 180));
    expect(zenith[2]).toBeGreaterThan(zenith[0]);
  });

  it("scales the dome so a level surface under it gets the sent diffuse_lux in the sent colour", () => {
    const sky = { sun: { dir: at(35), lux: 90000, cct: 5500 }, diffuse_lux: 14000, cct: 7000 };
    const look = skyLook(sky);
    const e = skyIrradiance(look.channels, sky.sun.dir);
    const got = e.map((v, c) => v * look.scale[c]) as [number, number, number];
    const want = kelvinColour(7000).map((c) => c * 14000);
    for (let c = 0; c < 3; c++) expect(got[c]).toBeCloseTo(want[c], 0);
    expect(luminance(got)).toBeCloseTo(14000, 0);
  });

  it("draws the sun's disc at its sent illuminance over the disc's solid angle, and no disc below the horizon", () => {
    const look = skyLook({ sun: { dir: at(35), lux: 90000, cct: 5500 }, diffuse_lux: 14000, cct: 7000 });
    expect(luminance(look.sun?.radiance ?? [0, 0, 0])).toBeCloseTo(90000 / DISC_SOLID_ANGLE, -2);
    expect(skyLook({ sun: { dir: at(-10), lux: 0, cct: 2000 }, diffuse_lux: 4, cct: 9000 }).sun).toBeUndefined();
  });

  it("draws a uniform sky of diffuse_lux when no sun is sent", () => {
    const look = skyLook({ diffuse_lux: 0.01, cct: 9000 });
    expect(look.patternSun).toBeUndefined();
    expect(luminance(look.uniform) * Math.PI).toBeCloseTo(0.01, 9);
  });
});
