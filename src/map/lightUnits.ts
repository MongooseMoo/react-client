/**
 * Light in physical units for the 3D room view: what the MOO sends (lumens, lux, kelvin) turned into what three.js
 * takes, the camera exposure for a room's light, the eye's rod saturation at night, and the room's light in words.
 *
 * Sources. Lagarde and de Rousiers 2014, "Moving Frostbite to Physically Based Rendering 3.0" (hub
 * `papers/Lagarde_2014_MovingFrostbitePhysicallyBasedRendering/notes.md`): point I = phi / 4 pi (eq. 15), the exact
 * cone I = phi / (2 pi (1 - cos(theta / 2))) (eq. 16), emitter luminance L = phi / (A pi) (Table 12), EV100 from
 * average luminance with K = 12.5 and exposure 1 / (1.2 x 2^EV100) (p.27, p.85-86), middle grey 0.18 (p.85).
 * Jensen et al. 2000, "Night Rendering" (hub `papers/Jensen_2000_NightRendering/notes.md`): rod saturation s, the
 * mesopic range 0.01 to 4 cd/m^2 (p.6) and Fig. 2's luminance ranges (p.2). Colours are in `lightColour.ts`, kept
 * apart so the Room tab's words do not load the colour tables.
 *
 * three.js r187 (checked in its shader source): DirectionalLight intensity is illuminance in lux, Point and Spot
 * intensity is candela, Ambient and Hemisphere intensity is irradiance in lux, and a pixel's value is luminance in
 * cd/m^2 before exposure and tone mapping.
 */
import { isLayoutPose, type LayoutLightSource, type LayoutRoomLight, type LayoutVector, thingLight } from "../gmcp/Room";
import type { PlacedThing } from "./roomLayout";

/** A thing's light and where it is: its body's centre (the wire gives a light no position of its own). */
export interface PlacedLight {
  thingId: string;
  name: string;
  light: LayoutLightSource;
  at: LayoutVector;
}

/** Every thing in the room that sends a well-formed light, with where it is. */
export function placedLights(placed: PlacedThing[]): PlacedLight[] {
  const out: PlacedLight[] = [];
  for (const { thing, bounds: b } of placed) {
    const light = thingLight(thing);
    if (!light) continue;
    const at: LayoutVector = isLayoutPose(thing.pose) ? thing.pose.centre_m : [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, (b.z0 + b.z1) / 2];
    out.push({ thingId: thing.id, name: thing.name, light, at });
  }
  return out;
}

/** A point (or ball) source's luminous intensity, candela, from its flux in lumens: I = phi / 4 pi. */
export const pointCandela = (lumens: number): number => lumens / (4 * Math.PI);

/** A spotlight's luminous intensity, candela, from its flux and full cone angle: I = phi / (2 pi (1 - cos(cone / 2))). */
export function spotCandela(lumens: number, coneDeg: number): number {
  const half = (Math.min(coneDeg, 360) * Math.PI) / 360;
  return lumens / (2 * Math.PI * (1 - Math.cos(half)));
}

/** Frostbite's punctual light size, metres: a source with no radius sent is drawn this big. */
export const PUNCTUAL_RADIUS = 0.01;

/**
 * The luminance of a source's glowing surface, cd/m^2: L = phi / (A pi), a Lambertian emitter of area A. A point
 * source is a ball (A = 4 pi r^2); an area source is a disk, and a spotlight a disk facing its beam (A = pi r^2). Off,
 * it is 0.
 */
export function emitterLuminance(light: LayoutLightSource): number {
  if (!light.on) return 0;
  const r = light.radius && light.radius > 0 ? light.radius : PUNCTUAL_RADIUS;
  const area = light.shape === "point" ? 4 * Math.PI * r * r : Math.PI * r * r;
  return light.lumens / (area * Math.PI);
}

/** Middle grey: the reflectance a reflected-light meter assumes (Frostbite p.85). */
export const MIDDLE_GREY = 0.18;
/** Reflected-light meter calibration constant K (Frostbite p.27). */
export const METER_K = 12.5;

/** The luminance of a middle-grey matte surface lit by `lux`: what a meter reads in the room, cd/m^2. */
export const meteredLuminance = (lux: number): number => (Math.max(0, lux) * MIDDLE_GREY) / Math.PI;

/**
 * The lowest luminance the view adapts to: Jensen et al.'s lower mesopic bound, where colour vision ends (0.01 cd/m^2,
 * p.6). A darker room is not brightened further, so it shows darker in proportion and a room with no light is black.
 * This floor is the client's choice, anchored to that bound; the paper models no adaptation.
 */
export const ADAPTATION_FLOOR = 0.01;

/** EV100 from average luminance (Frostbite p.27): log2(L x 100 / K), with L no lower than ADAPTATION_FLOOR. */
export const ev100 = (averageLuminance: number): number => Math.log2((Math.max(ADAPTATION_FLOOR, averageLuminance) * 100) / METER_K);

/** Exposure for an EV100 (Frostbite p.85-86): 1 / L_max, L_max = 1.2 x 2^EV100. A pixel is luminance times this. */
export const exposureFor = (ev: number): number => 1 / (1.2 * 2 ** ev);

/** Illuminance the view assumes when the MOO sends no room light (an ordinary indoor level), only to stay readable. */
export const FILL_LUX = 100;

/** The exposure for a room: from its sent lux, else from FILL_LUX. */
export const roomExposure = (light: LayoutRoomLight | undefined): number => exposureFor(ev100(meteredLuminance(light?.lux ?? FILL_LUX)));

/** Jensen et al.'s mesopic range, cd/m^2: rods fully active below, cones alone above (p.6). */
export const MESOPIC_LOW = 0.01;
export const MESOPIC_HIGH = 4.0;

/**
 * Rod saturation s for a photopic luminance Y, cd/m^2 (Jensen et al. 2000 p.6): 0 when log10 Y < -2 (scotopic),
 * 1 above log10 Y = 0.6 (photopic), a smoothstep in log10 Y between.
 */
export function rodSaturation(y: number): number {
  const l = Math.log10(Math.max(y, 1e-12));
  if (l <= -2) return 0;
  if (l >= 0.6) return 1;
  const t = (l + 2) / 2.6;
  return 3 * t * t - 2 * t * t * t;
}

/** Whether the room's metered luminance is below photopic, so night vision applies to some of it. */
export const needsNightVision = (light: LayoutRoomLight | undefined): boolean =>
  light !== undefined && meteredLuminance(light.lux) < MESOPIC_HIGH;

/**
 * The luminance above which the words say "bright": midway, in log10, between where Jensen et al.'s Fig. 2 places
 * indoor lighting (about 10^1.5 cd/m^2) and sunlight (about 10^4.5), read off the figure.
 */
export const BRIGHT_LUMINANCE = 1000;

/** The illuminance a light gives a level floor at the room's centre, lux, from a source at `at` (room frame). */
export function illuminanceAtCentre(light: LayoutLightSource, at: LayoutVector): number {
  if (!light.on) return 0;
  const d2 = at[0] * at[0] + at[1] * at[1] + at[2] * at[2];
  const d = Math.sqrt(d2);
  if (d === 0) return 0;
  const cosFloor = at[2] / d;
  if (cosFloor <= 0) return 0;
  if (light.shape === "spot" && light.dir && light.cone_deg !== undefined) {
    const toCentre = [-at[0] / d, -at[1] / d, -at[2] / d];
    const cos = toCentre[0] * light.dir[0] + toCentre[1] * light.dir[1] + toCentre[2] * light.dir[2];
    if (cos < Math.cos((light.cone_deg * Math.PI) / 360)) return 0;
    return (spotCandela(light.lumens, light.cone_deg) * cosFloor) / Math.max(d2, 0.01);
  }
  return (pointCandela(light.lumens) * cosFloor) / Math.max(d2, 0.01);
}

/** A value to two significant figures, as a plain number (150, 5, 0.2, 0.0008). */
const twoFigures = (n: number): string => String(Number(n.toPrecision(2)));

/**
 * The room's light in words, for the Room tab: how bright (by Jensen et al.'s ranges on the metered luminance) and
 * what gives most of it at the room's centre, from the sent light alone. Undefined when the MOO sends no room light.
 * `sources` are the room's things that send a light, with where it is (`placedLights`).
 */
export function lightWords(light: LayoutRoomLight | undefined, sources: PlacedLight[]): string | undefined {
  if (!light) return undefined;
  const l = meteredLuminance(light.lux);
  const level = light.lux === 0 || l < MESOPIC_LOW ? "dark" : l < MESOPIC_HIGH ? "dim" : l < BRIGHT_LUMINANCE ? "well lit" : "bright";
  const lux = `about ${twoFigures(light.lux)} lux`;
  if (light.lux === 0) return "Light: dark, no light.";
  const shares: Array<{ text: string; lux: number }> = [];
  const sky = light.sky;
  if (sky) {
    const sun = sky.sun;
    if (sun && sun.dir[2] > 0) shares.push({ text: "daylight", lux: sun.lux * sun.dir[2] });
    // Sky light is daylight with the sun up, twilight with it sent below the horizon, and plain skylight when no sun is
    // sent (night, or a sky the MOO gives no sun).
    shares.push({ text: !sun ? "skylight" : sun.dir[2] > 0 ? "daylight" : "twilight", lux: sky.diffuse_lux });
    if (sky.moon && sky.moon.dir[2] > 0) shares.push({ text: "moonlight", lux: sky.moon.lux * sky.moon.dir[2] });
  }
  for (const { name, light: source, at } of sources) shares.push({ text: `from ${name}`, lux: illuminanceAtCentre(source, at) });
  const totals = new Map<string, number>();
  for (const share of shares) totals.set(share.text, (totals.get(share.text) ?? 0) + share.lux);
  let best: [string, number] | undefined;
  for (const entry of totals) if (entry[1] > 0 && (!best || entry[1] > best[1])) best = entry;
  return best ? `Light: ${level} (${lux}), mostly ${best[0]}.` : `Light: ${level} (${lux}).`;
}
