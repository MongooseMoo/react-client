import { describe, expect, it } from "vitest";
import { type RoomLayout, roomFinish, roomLight, thingLight } from "../gmcp/Room";
import {
  ADAPTATION_FLOOR,
  emitterLuminance,
  ev100,
  exposureFor,
  FILL_LUX,
  illuminanceAtCentre,
  lightWords,
  meteredLuminance,
  needsNightVision,
  placedLights,
  pointCandela,
  rodSaturation,
  roomExposure,
  spotCandela,
} from "./lightUnits";
import { kelvinColour, luminance, scotopicLuminance } from "./lightColour";
import { WHITE_Y_OVER_V } from "./lightTables";
import { sampleLayout } from "./roomLayout.fixture";
import { placeThings } from "./roomLayout";

describe("light units", () => {
  it("turns lumens into candela: point phi / 4 pi, spot phi / 2 pi (1 - cos(cone / 2))", () => {
    expect(pointCandela(1200)).toBeCloseTo(95.493, 3);
    expect(spotCandela(1200, 360)).toBeCloseTo(pointCandela(1200), 9);
    // A hemisphere (180 degrees) spreads it over 2 pi steradians.
    expect(spotCandela(1200, 180)).toBeCloseTo(1200 / (2 * Math.PI), 9);
    // Narrower is brighter, the same flux in a smaller solid angle.
    expect(spotCandela(1200, 30)).toBeGreaterThan(spotCandela(1200, 60));
  });

  it("gives an emitter the luminance phi / (A pi) of its ball or disc, and none when off", () => {
    // Frostbite Table 12's example: a 0.15 m sphere of 1500 lm, 1688 cd/m^2.
    expect(emitterLuminance({ lumens: 1500, cct: 2700, shape: "point", radius: 0.15, on: true })).toBeCloseTo(1688.4, 0);
    // An area source is a disk: phi / (r^2 pi^2) (Table 12).
    expect(emitterLuminance({ lumens: 1500, cct: 2700, shape: "area", radius: 0.15, on: true })).toBeCloseTo(1500 / (0.15 * 0.15 * Math.PI * Math.PI), 6);
    expect(emitterLuminance({ lumens: 1500, cct: 2700, shape: "spot", radius: 0.15, cone_deg: 60, dir: [0, 0, -1], on: true }))
      .toBeCloseTo(1500 / (Math.PI * 0.15 * 0.15 * Math.PI), 6);
    expect(emitterLuminance({ lumens: 1500, cct: 2700, shape: "point", radius: 0.15, on: false })).toBe(0);
    // Without a radius, Frostbite's 1 cm punctual size.
    expect(emitterLuminance({ lumens: 15, cct: 1900, shape: "point", on: true })).toBeCloseTo(15 / (4 * Math.PI * 1e-4 * Math.PI), 6);
  });

  it("colours a blackbody at luminance 1: warm at a candle, near white at 6500 K, blue beyond", () => {
    for (const k of [1000, 1850, 2700, 4000, 6500, 10000, 25000, 500, 90000]) expect(luminance(kelvinColour(k))).toBeCloseTo(1, 9);
    const [r, g, b] = kelvinColour(1850);
    expect(r).toBeGreaterThan(g);
    expect(g).toBeGreaterThan(b);
    const white = kelvinColour(6500);
    for (const c of white) expect(Math.abs(c - 1)).toBeLessThan(0.06);
    const [r2, , b2] = kelvinColour(12000);
    expect(b2).toBeGreaterThan(r2);
    // Between table rows it is interpolated, so it changes smoothly.
    const a = kelvinColour(2700), c = kelvinColour(2750), d = kelvinColour(2800);
    expect(c[0]).toBeLessThan(a[0]);
    expect(c[0]).toBeGreaterThan(d[0]);
  });

  it("gives a white field the Y/V the CIE tables give (Jensen et al. print 0.4468)", () => {
    expect(WHITE_Y_OVER_V).toBeGreaterThan(0.43);
    expect(WHITE_Y_OVER_V).toBeLessThan(0.46);
    // Blackbody light: rods see relatively more of bluer light.
    const ratio = (k: number) => scotopicLuminance(kelvinColour(k)) / luminance(kelvinColour(k));
    expect(ratio(6500)).toBeGreaterThan(ratio(2700));
    expect(ratio(2700)).toBeCloseTo(1.336, 1);
  });

  it("meters a room by Frostbite's EV100 and exposes it so middle grey sits below saturation", () => {
    const L = meteredLuminance(100);
    expect(L).toBeCloseTo((100 * 0.18) / Math.PI, 12);
    expect(ev100(L)).toBeCloseTo(Math.log2((L * 100) / 12.5), 12);
    const exposure = exposureFor(ev100(L));
    // L_max = 1.2 x 2^EV100: middle grey lands at 1 / 9.6 of it.
    expect(L * exposure).toBeCloseTo(1 / 9.6, 9);
    // Below the adaptation floor the view stops adapting: a dark room shows darker in proportion.
    expect(ev100(ADAPTATION_FLOOR / 100)).toBe(ev100(ADAPTATION_FLOOR));
    expect(meteredLuminance(0.001) * exposureFor(ev100(meteredLuminance(0.001)))).toBeLessThan(0.01);
  });

  it("uses the neutral fill's exposure when the MOO sends no light", () => {
    expect(roomExposure(undefined)).toBe(exposureFor(ev100(meteredLuminance(FILL_LUX))));
    expect(roomExposure({ lux: 0.2 })).toBeGreaterThan(roomExposure({ lux: 500 }));
    expect(needsNightVision(undefined)).toBe(false);
    expect(needsNightVision({ lux: 500 })).toBe(false);
    expect(needsNightVision({ lux: 0.2 })).toBe(true);
  });

  it("saturates the rods as Jensen et al. say: 0 below 0.01 cd/m^2, 1 above 4, smooth between", () => {
    expect(rodSaturation(0.001)).toBe(0);
    expect(rodSaturation(0.01)).toBe(0);
    expect(rodSaturation(4.0)).toBeCloseTo(1, 3);
    expect(rodSaturation(100)).toBe(1);
    let last = 0;
    for (let l = -2; l <= 0.6; l += 0.1) {
      const s = rodSaturation(10 ** l);
      expect(s).toBeGreaterThanOrEqual(last);
      last = s;
    }
    expect(rodSaturation(10 ** (-2 + 1.3))).toBeCloseTo(0.5, 9);
  });

  it("gives a point source's illuminance at the room's centre by inverse square and the floor's tilt", () => {
    const lamp = { lumens: 1200, cct: 2700, shape: "point" as const, on: true };
    expect(illuminanceAtCentre(lamp, [0, 0, 2])).toBeCloseTo(pointCandela(1200) / 4, 9);
    expect(illuminanceAtCentre(lamp, [2, 0, 2])).toBeCloseTo((pointCandela(1200) * Math.SQRT1_2) / 8, 9);
    expect(illuminanceAtCentre(lamp, [0, 0, -1])).toBe(0);
    expect(illuminanceAtCentre({ ...lamp, on: false }, [0, 0, 2])).toBe(0);
    const spot = { ...lamp, shape: "spot" as const, cone_deg: 20, dir: [1, 0, 0] as [number, number, number] };
    expect(illuminanceAtCentre(spot, [0, 0, 2])).toBe(0);
  });
});

describe("Room.Layout light readers", () => {
  const layout = (extra: Partial<RoomLayout>): RoomLayout => ({ ...sampleLayout(), ...extra });

  it("reads a room's light and drops what is malformed", () => {
    expect(roomLight(layout({}))).toBeUndefined();
    expect(roomLight(layout({ light: { lux: -1 } }))).toBeUndefined();
    expect(roomLight(layout({ light: { lux: 40 } }))).toEqual({ lux: 40 });
    const sky = { sun: { dir: [0, 0.6, 0.8], lux: 90000, cct: 5500 }, diffuse_lux: 12000, cct: 7000 };
    expect(roomLight(layout({ light: { lux: 50000, sky } }))).toEqual({ lux: 50000, sky });
    // A sky whose sun points nowhere is dropped; the room's lux is kept.
    expect(roomLight(layout({ light: { lux: 50000, sky: { ...sky, sun: { ...sky.sun, dir: [0, 0, 2] } } } }))).toEqual({ lux: 50000 });
  });

  it("reads a thing's light and gives none for a malformed one", () => {
    const thing = sampleLayout().things[0];
    expect(thingLight(thing)).toBeUndefined();
    expect(thingLight({ ...thing, light: { lumens: 800, cct: 2700, shape: "point", radius: 0.04, on: true } }))
      .toEqual({ lumens: 800, cct: 2700, shape: "point", radius: 0.04, on: true });
    expect(thingLight({ ...thing, light: { lumens: 800, cct: 2700, shape: "spot", on: true } })).toBeUndefined();
    expect(thingLight({ ...thing, light: { lumens: 800, cct: 2700, shape: "laser", on: true } })).toBeUndefined();
    expect(thingLight({ ...thing, light: { lumens: 800, cct: 2700, shape: "point" } })).toBeUndefined();
  });

  it("reads the live MOO's records (#3964:layout_data for #19597, 2026-11-22)", () => {
    const live = layout({
      light: { lux: 2.98415518297304 },
      finishes: { ceiling: { name: "" }, floor: { name: "" }, wall: { name: "" } },
    });
    expect(roomLight(live)).toEqual({ lux: 2.98415518297304 });
    // An empty name is no finish.
    expect(roomFinish(live, "floor")).toBeUndefined();
    const lamp = { ...sampleLayout().things[0], light: { cct: 2700.0, lumens: 1200.0, on: true, radius: 0.0, shape: "point" } };
    expect(thingLight(lamp)).toEqual({ lumens: 1200, cct: 2700, shape: "point", radius: 0, on: true });
    // Radius 0 is drawn at Frostbite's 1 cm punctual size.
    expect(emitterLuminance({ lumens: 1200, cct: 2700, shape: "point", radius: 0, on: true })).toBeCloseTo(1200 / (4 * Math.PI * 1e-4 * Math.PI), 3);
  });

  it("reads a finish's name, colour and response, leaving out what it does not know", () => {
    const l = layout({ finishes: { floor: { name: "oak", colour: "#a0703f", response: "satin" }, wall: { name: "tile", colour: "red", response: "shiny" }, ceiling: "plaster" } });
    expect(roomFinish(l, "floor")).toEqual({ name: "oak", colour: "#a0703f", response: "satin" });
    expect(roomFinish(l, "wall")).toEqual({ name: "tile" });
    expect(roomFinish(l, "ceiling")).toBeUndefined();
  });
});

describe("the room's light in words", () => {
  const withLamp = (lux: number, lumens = 800) => {
    const l = sampleLayout();
    l.things = [...l.things, { ...l.things[0], id: "#lamp", name: "brass lamp",
      pose: { centre_m: [0, 0, 1.5], dimensions_m: [0.3, 0.3, 0.4], body_quaternion: [1, 0, 0, 0], box: true },
      light: { lumens, cct: 2700, shape: "point", on: true } }];
    l.light = { lux };
    return l;
  };
  const words = (l: RoomLayout) => lightWords(roomLight(l), placedLights(placeThings(l)));

  it("says nothing when the MOO sends no light", () => {
    expect(words(sampleLayout())).toBeUndefined();
  });

  it("names the level by Jensen et al.'s ranges and the source that gives most of it", () => {
    expect(words(withLamp(150))).toBe("Light: well lit (about 150 lux), mostly from brass lamp.");
    expect(words(withLamp(5))).toBe("Light: dim (about 5 lux), mostly from brass lamp.");
    const none = sampleLayout();
    none.light = { lux: 0 };
    expect(words(none)).toBe("Light: dark, no light.");
    const starlit = sampleLayout();
    starlit.light = { lux: 0.0008 };
    expect(words(starlit)).toBe("Light: dark (about 0.0008 lux).");
  });

  it("says daylight, twilight or moonlight from the sent sky", () => {
    const day = sampleLayout();
    day.light = { lux: 60000, sky: { sun: { dir: [0, 0.6, 0.8], lux: 90000, cct: 5500 }, diffuse_lux: 12000, cct: 7000 } };
    expect(words(day)).toBe("Light: bright (about 60000 lux), mostly daylight.");
    const dusk = sampleLayout();
    dusk.light = { lux: 3, sky: { sun: { dir: [0, 0.995, -0.0998], lux: 0, cct: 2000 }, diffuse_lux: 3, cct: 9000 } };
    expect(words(dusk)).toBe("Light: dim (about 3 lux), mostly twilight.");
    const night = sampleLayout();
    night.light = { lux: 0.2, sky: { sun: { dir: [0, 0.6, -0.8], lux: 0, cct: 5500 }, moon: { dir: [0, 0.6, 0.8], lux: 0.25, cct: 4100 }, diffuse_lux: 0.01, cct: 9000 } };
    expect(words(night)).toBe("Light: dim (about 0.2 lux), mostly moonlight.");
    // The live MOO's Front Yard (#25904) at night, 2026-11-22: no sun sent.
    const yard = sampleLayout();
    yard.light = { lux: 0.0281655909865471, sky: { cct: 4002.70020467843, diffuse_lux: 1.58400333879189e-05 } };
    expect(roomLight(yard)?.sky).toEqual({ cct: 4002.70020467843, diffuse_lux: 1.58400333879189e-05 });
    expect(words(yard)).toBe("Light: dark (about 0.028 lux), mostly skylight.");
  });
});
