/**
 * The sky over a room that daylight reaches (`Room.Layout` `light.sky`): its brightness pattern from Hosek and Wilkie
 * 2012, "An Analytic Model for Full Spectral Sky-Dome Radiance" (hub `papers/Hosek_2012_AnalyticModelFullSpectral/
 * notes.md`; its reference code 1.4a's RGB coefficients, `hosekWilkieRGB.ts`, under that code's BSD licence), its
 * strength and overall colour from the MOO: the dome is scaled so the illuminance it gives a level surface is the
 * sent `diffuse_lux` in the colour of the sent `cct`. The model excludes the sun's disc (paper p.5); the sun and Moon
 * are drawn as discs of their sent illuminance. The model is fitted for the sun at or above the horizon only, so a sun
 * below it is evaluated at elevation 0 (as the reference code requires to avoid NaN), and the sent `diffuse_lux` sets
 * how dark that sky is.
 */
import * as THREE from "three";
import type { LayoutSky, LayoutVector } from "../gmcp/Room";
import { HOSEK_RGB, HOSEK_RGB_RADIANCE } from "./hosekWilkieRGB";
import { kelvinColour } from "./lightColour";

/** Linke turbidity the client draws with: 3, "clear temperate" (paper p.2). The MOO sends none. */
export const SKY_TURBIDITY = 3;
/** Ground albedo: 0.1, the value of the paper's own comparison images (Fig. 4). The MOO sends no ground. */
export const DEFAULT_GROUND_ALBEDO = 0.1;
/**
 * The solid angle of the sun's disc, steradians (Frostbite p.36: 0.000066 to 0.000071). The Moon is drawn the same
 * size: Frostbite's full-Moon disc luminance (~2500 cd/m^2, p.60) and Jensen et al.'s full-Moon illuminance (0.2 lux)
 * give 0.2 / 2500 = 8e-5 sr, the same size within their precision.
 */
export const DISC_SOLID_ANGLE = 6.8e-5;

/** One channel's nine parameters (stored A B C D E F G I H, as the reference code does) and master radiance. */
export interface SkyChannel {
  config: number[];
  radiance: number;
}

const bezier = (m: readonly number[], at: number, stride: number, x: number): number =>
  (1 - x) ** 5 * m[at] + 5 * (1 - x) ** 4 * x * m[at + stride] + 10 * (1 - x) ** 3 * x ** 2 * m[at + 2 * stride] +
  10 * (1 - x) ** 2 * x ** 3 * m[at + 3 * stride] + 5 * (1 - x) * x ** 4 * m[at + 4 * stride] + x ** 5 * m[at + 5 * stride];

/**
 * One channel cooked for a turbidity (1 to 10), ground albedo (0 to 1) and solar elevation (radians, clamped to 0 to
 * pi/2): `ArHosekSkyModel_CookConfiguration` and `_CookRadianceConfiguration` of the reference code.
 */
export function cookChannel(channel: number, turbidity: number, albedo: number, elevation: number): SkyChannel {
  const t = Math.min(10, Math.max(1, turbidity));
  const a = Math.min(1, Math.max(0, albedo));
  const x = (Math.min(Math.PI / 2, Math.max(0, elevation)) / (Math.PI / 2)) ** (1 / 3);
  const intT = Math.floor(t);
  const rem = t - intT;
  const data = HOSEK_RGB[channel];
  const rad = HOSEK_RGB_RADIANCE[channel];
  const config = new Array<number>(9).fill(0);
  let radiance = 0;
  const corners: Array<[number, number, number]> = [[0, intT, (1 - a) * (1 - rem)], [1, intT, a * (1 - rem)]];
  // The reference code stops before the upper turbidity at 10.
  if (intT < 10) corners.push([0, intT + 1, (1 - a) * rem], [1, intT + 1, a * rem]);
  for (const [alb, turb, weight] of corners) {
    const base = 9 * 6 * 10 * alb + 9 * 6 * (turb - 1);
    for (let i = 0; i < 9; i++) config[i] += weight * bezier(data, base + i, 9, x);
    radiance += weight * bezier(rad, 6 * 10 * alb + 6 * (turb - 1), 1, x);
  }
  return { config, radiance };
}

/** Eq. 8 times the master radiance, for view zenith angle theta and view-sun angle gamma (`GetRadianceInternal`). */
export function channelRadiance({ config: c, radiance }: SkyChannel, theta: number, gamma: number): number {
  const cosG = Math.cos(gamma);
  const expM = Math.exp(c[4] * gamma);
  const rayM = cosG * cosG;
  const mieM = (1 + cosG * cosG) / (1 + c[8] * c[8] - 2 * c[8] * cosG) ** 1.5;
  const zenith = Math.sqrt(Math.max(0, Math.cos(theta)));
  return (1 + c[0] * Math.exp(c[1] / (Math.cos(theta) + 0.01))) * (c[2] + c[3] * expM + c[5] * rayM + c[6] * mieM + c[7] * zenith) * radiance;
}

/** The sky's shape cooked for a sun direction (room frame, z up) and ground albedo per channel. */
export function cookSky(sunDir: LayoutVector, albedo: readonly [number, number, number]): SkyChannel[] {
  const elevation = Math.asin(Math.max(-1, Math.min(1, sunDir[2])));
  return [0, 1, 2].map((c) => cookChannel(c, SKY_TURBIDITY, albedo[c], elevation));
}

/** The level-surface illuminance of a cooked sky per channel, by numerical integration over the upper hemisphere. */
export function skyIrradiance(channels: SkyChannel[], sunDir: LayoutVector, steps = 48): [number, number, number] {
  const sun = new THREE.Vector3(sunDir[0], sunDir[1], Math.max(0, sunDir[2])).normalize();
  const e: [number, number, number] = [0, 0, 0];
  const dTheta = Math.PI / 2 / steps;
  const dPhi = (2 * Math.PI) / (steps * 2);
  const v = new THREE.Vector3();
  for (let i = 0; i < steps; i++) {
    const theta = (i + 0.5) * dTheta;
    const weight = Math.cos(theta) * Math.sin(theta) * dTheta * dPhi;
    for (let j = 0; j < steps * 2; j++) {
      const phi = (j + 0.5) * dPhi;
      v.set(Math.sin(theta) * Math.cos(phi), Math.sin(theta) * Math.sin(phi), Math.cos(theta));
      const gamma = Math.acos(Math.max(-1, Math.min(1, v.dot(sun))));
      for (let c = 0; c < 3; c++) e[c] += channelRadiance(channels[c], theta, gamma) * weight;
    }
  }
  return e;
}

/** Everything the dome shader needs, in cd/m^2 and unit vectors. */
export interface SkyLook {
  /** Cooked channels and the per-channel factor that makes the dome give the sent diffuse_lux in the sent colour. */
  channels: SkyChannel[];
  scale: [number, number, number];
  /** The sun direction the pattern is evaluated for (its elevation clamped at 0); undefined when no sun is sent. */
  patternSun?: THREE.Vector3;
  /** A uniform sky's radiance, used when no sun is sent. */
  uniform: [number, number, number];
  sun?: { dir: THREE.Vector3; radiance: [number, number, number] };
  moon?: { dir: THREE.Vector3; radiance: [number, number, number] };
  /** The ground below the horizon: albedo times the light on a level surface, over pi. */
  ground: [number, number, number];
}

const scaled = (c: [number, number, number], k: number): [number, number, number] => [c[0] * k, c[1] * k, c[2] * k];
const disc = (body: { dir: LayoutVector; lux: number; cct: number } | undefined) => body && body.lux > 0 && body.dir[2] > -0.02
  ? { dir: new THREE.Vector3(...body.dir).normalize(), radiance: scaled(kelvinColour(body.cct), body.lux / DISC_SOLID_ANGLE) }
  : undefined;

/** The sky to draw for a sent `light.sky`, with the ground's albedo per channel. */
export function skyLook(sky: LayoutSky, albedo: [number, number, number] = [DEFAULT_GROUND_ALBEDO, DEFAULT_GROUND_ALBEDO, DEFAULT_GROUND_ALBEDO]): SkyLook {
  const colour = kelvinColour(sky.cct);
  const target = scaled(colour, sky.diffuse_lux);
  let channels: SkyChannel[] = [];
  let scale: [number, number, number] = [0, 0, 0];
  let patternSun: THREE.Vector3 | undefined;
  if (sky.sun) {
    channels = cookSky(sky.sun.dir, albedo);
    const e = skyIrradiance(channels, sky.sun.dir);
    scale = [0, 1, 2].map((c) => (e[c] > 0 ? target[c] / e[c] : 0)) as [number, number, number];
    patternSun = new THREE.Vector3(sky.sun.dir[0], sky.sun.dir[1], Math.max(0, sky.sun.dir[2])).normalize();
  }
  // A uniform sky of radiance L gives a level surface pi L.
  const uniform = scaled(target, 1 / Math.PI);
  const sunLevel = sky.sun ? sky.sun.lux * Math.max(0, sky.sun.dir[2]) : 0;
  const moonLevel = sky.moon ? sky.moon.lux * Math.max(0, sky.moon.dir[2]) : 0;
  const onLevel = [0, 1, 2].map((c) => target[c] + (sky.sun ? kelvinColour(sky.sun.cct)[c] * sunLevel : 0) +
    (sky.moon ? kelvinColour(sky.moon.cct)[c] * moonLevel : 0));
  const ground = [0, 1, 2].map((c) => (albedo[c] * onLevel[c]) / Math.PI) as [number, number, number];
  return { channels, scale, patternSun, uniform, sun: disc(sky.sun), moon: disc(sky.moon), ground };
}

const vertexShader = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

const fragmentShader = /* glsl */ `
#include <common>
uniform float config[27];
uniform vec3 scale;
uniform vec3 patternSun;
uniform bool hasPattern;
uniform vec3 uniformSky;
uniform vec3 ground;
uniform vec3 sunDir;
uniform vec3 sunRadiance;
uniform vec3 moonDir;
uniform vec3 moonRadiance;
uniform float discCos;
varying vec3 vWorld;

float channel(int c, float theta, float gamma) {
  int o = c * 9;
  float cosG = cos(gamma);
  float expM = exp(config[o + 4] * gamma);
  float rayM = cosG * cosG;
  float g = config[o + 8];
  float mieM = (1.0 + cosG * cosG) / pow(1.0 + g * g - 2.0 * g * cosG, 1.5);
  float zenith = sqrt(max(0.0, cos(theta)));
  return (1.0 + config[o] * exp(config[o + 1] / (cos(theta) + 0.01))) *
    (config[o + 2] + config[o + 3] * expM + config[o + 5] * rayM + config[o + 6] * mieM + config[o + 7] * zenith);
}

void main() {
  vec3 dir = normalize(vWorld - cameraPosition);
  vec3 radiance;
  if (dir.z < 0.0) {
    radiance = ground;
  } else if (hasPattern) {
    float theta = acos(clamp(dir.z, 0.0, 1.0));
    float gamma = acos(clamp(dot(dir, patternSun), -1.0, 1.0));
    radiance = vec3(channel(0, theta, gamma), channel(1, theta, gamma), channel(2, theta, gamma)) * scale;
    if (dot(dir, sunDir) > discCos) radiance += sunRadiance;
  } else {
    radiance = uniformSky;
  }
  if (dir.z >= 0.0 && dot(dir, moonDir) > discCos) radiance += moonRadiance;
  gl_FragColor = vec4(radiance, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

/** The sky dome, a sphere of `radius` round the room drawn behind everything, in cd/m^2 (tone mapped with the rest). */
export function skyDome(look: SkyLook, radius: number): THREE.Mesh {
  const config = look.channels.length ? look.channels.flatMap((c) => c.config) : new Array<number>(27).fill(0);
  const scale = look.channels.length ? look.channels.map((c, i) => c.radiance * look.scale[i]) : [0, 0, 0];
  const v = (c: readonly number[] | undefined) => new THREE.Vector3(...(c ?? [0, 0, 0]));
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      config: { value: config },
      scale: { value: v(scale) },
      patternSun: { value: look.patternSun ?? new THREE.Vector3(0, 0, 1) },
      hasPattern: { value: look.patternSun !== undefined },
      uniformSky: { value: v(look.uniform) },
      ground: { value: v(look.ground) },
      sunDir: { value: look.sun?.dir ?? new THREE.Vector3(0, 0, -1) },
      sunRadiance: { value: v(look.sun?.radiance) },
      moonDir: { value: look.moon?.dir ?? new THREE.Vector3(0, 0, -1) },
      moonRadiance: { value: v(look.moon?.radiance) },
      discCos: { value: 1 - DISC_SOLID_ANGLE / (2 * Math.PI) },
    },
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 32), material);
  mesh.name = "sky";
  mesh.renderOrder = -1;
  mesh.frustumCulled = false;
  mesh.userData.part = "sky";
  return mesh;
}
