/**
 * The lights of a room in the 3D view, all from Room.Layout in physical units (`lightUnits.ts`): each thing's sent
 * light, the sun and Moon and the sky when daylight reaches the room, and the light bouncing off the room's own
 * surfaces (`captureRoomLight`). Nothing is invented: a room with no `light` on the wire gets only a neutral fill of
 * FILL_LUX from above (FILL_GROUND of it from below) so it stays readable.
 */
import * as THREE from "three";
import type { LayoutRoomLight, LayoutSkyBody, LayoutVector, RoomLayout } from "../gmcp/Room";
import { roomLight } from "../gmcp/Room";
import type { PlacedThing } from "./roomLayout";
import { kelvinColour } from "./lightColour";
import { FILL_LUX, illuminanceAtCentre, type PlacedLight, placedLights, pointCandela, spotCandela } from "./lightUnits";
import { skyDome, skyLook } from "./sky";

/** The neutral fill's light on a downward face as a share of an upward face's: about what a floor bounces (the client's choice). */
export const FILL_GROUND = 0.3;

/** How many lights draw shadows: the strongest at the room's centre. Each point light's shadow is six renders. */
export const MAX_SHADOW_LIGHTS = 4;
/** Shadow map texels on a side: a directional light's, and a point or spot light's (per cube face). */
export const DIRECTIONAL_SHADOW_SIZE = 2048;
export const LOCAL_SHADOW_SIZE = 512;
const SHADOW_SOFTNESS = 3;

const linear = (rgb: [number, number, number]) => new THREE.Color().setRGB(rgb[0], rgb[1], rgb[2], THREE.LinearSRGBColorSpace);

/** A directional light toward `dir` of `lux`, its shadow camera fitted round the room's box as the light sees it. */
export function directionalLight(size: LayoutVector, dir: LayoutVector, lux: number, cct: number): THREE.DirectionalLight {
  const [w, d, h] = size;
  const light = new THREE.DirectionalLight(linear(kelvinColour(cct)), lux);
  const reach = Math.hypot(w, d, h) + 2;
  light.position.set(dir[0] * reach, dir[1] * reach, h / 2 + dir[2] * reach);
  light.target.position.set(0, 0, h / 2);
  const view = new THREE.Matrix4().lookAt(light.position, light.target.position, THREE.Object3D.DEFAULT_UP)
    .setPosition(light.position).invert();
  const box = new THREE.Box3();
  for (const x of [-w / 2, w / 2]) for (const y of [-d / 2, d / 2]) for (const z of [0, h]) {
    box.expandByPoint(new THREE.Vector3(x, y, z).applyMatrix4(view));
  }
  const margin = 0.1;
  const camera = light.shadow.camera;
  camera.left = box.min.x - margin;
  camera.right = box.max.x + margin;
  camera.bottom = box.min.y - margin;
  camera.top = box.max.y + margin;
  camera.near = Math.max(0.05, -box.max.z - margin);
  camera.far = -box.min.z + margin;
  camera.updateProjectionMatrix();
  light.shadow.mapSize.set(DIRECTIONAL_SHADOW_SIZE, DIRECTIONAL_SHADOW_SIZE);
  light.shadow.radius = SHADOW_SOFTNESS;
  const texel = Math.max(camera.right - camera.left, camera.top - camera.bottom) / DIRECTIONAL_SHADOW_SIZE;
  light.shadow.normalBias = texel * 1.5;
  light.shadow.bias = -0.0002;
  return light;
}

/**
 * A thing's light as three.js draws it: a spotlight of I = phi / (2 pi (1 - cos(cone / 2))) candela along `dir`
 * (a cone wider than 180 degrees, which three cannot draw, as a point light of that intensity), else a point light of
 * I = phi / 4 pi. Decay 2 (inverse square), no cut-off. Its target, for a spotlight, is its child's `userData.target`.
 */
export function sourceLight({ light, at, thingId }: PlacedLight, size: LayoutVector): THREE.PointLight | THREE.SpotLight {
  const colour = linear(kelvinColour(light.cct));
  const reach = Math.hypot(...size);
  let three: THREE.PointLight | THREE.SpotLight;
  if (light.shape === "spot" && light.dir && light.cone_deg !== undefined && light.cone_deg <= 180) {
    const spot = new THREE.SpotLight(colour, spotCandela(light.lumens, light.cone_deg), 0, (light.cone_deg * Math.PI) / 360, 0, 2);
    spot.target.position.set(at[0] + light.dir[0], at[1] + light.dir[1], at[2] + light.dir[2]);
    three = spot;
  } else {
    const candela = light.shape === "spot" && light.cone_deg !== undefined ? spotCandela(light.lumens, light.cone_deg) : pointCandela(light.lumens);
    three = new THREE.PointLight(colour, candela, 0, 2);
  }
  three.position.set(...at);
  three.shadow.mapSize.set(LOCAL_SHADOW_SIZE, LOCAL_SHADOW_SIZE);
  three.shadow.camera.near = Math.max(0.02, light.radius ?? 0.02);
  three.shadow.camera.far = reach;
  three.shadow.bias = -0.0005;
  three.shadow.normalBias = 0.01;
  three.shadow.radius = SHADOW_SOFTNESS;
  three.userData.thingId = thingId;
  three.name = `light of ${thingId}`;
  return three;
}

export interface RoomLights {
  /** Everything to add to the room's root: lights, spot targets, the sky dome. */
  objects: THREE.Object3D[];
  /** The sky dome, when daylight reaches the room. */
  sky?: THREE.Mesh;
  /** The lights casting shadows (at most MAX_SHADOW_LIGHTS). */
  shadowed: THREE.Light[];
  /** The room's sent light, if any. */
  light?: LayoutRoomLight;
}

type Albedo = [number, number, number];

/** The room's lights from the wire. Without a sent `light`, the neutral fill (FILL_LUX from above) and nothing else. */
export function roomLights(layout: RoomLayout, placed: PlacedThing[]): RoomLights {
  const light = roomLight(layout);
  const objects: THREE.Object3D[] = [];
  const candidates: Array<{ light: THREE.Light; lux: number }> = [];
  if (!light) {
    // Neutral, from no direction and casting no shadow: FILL_LUX on an upward face, FILL_GROUND of it on a downward
    // one, so shapes read by how they face without any source being invented.
    const fill = new THREE.HemisphereLight(0xffffff, new THREE.Color(FILL_GROUND, FILL_GROUND, FILL_GROUND), FILL_LUX);
    fill.position.set(0, 0, 1);
    fill.name = "fill (no light sent)";
    objects.push(fill);
  }
  for (const source of placedLights(placed)) {
    if (!source.light.on || source.light.lumens <= 0) continue;
    const three = sourceLight(source, layout.size);
    objects.push(three);
    if (three instanceof THREE.SpotLight) objects.push(three.target);
    candidates.push({ light: three, lux: illuminanceAtCentre(source.light, source.at) || source.light.lumens * 1e-6 });
  }
  let sky: THREE.Mesh | undefined;
  const daylight = light?.sky;
  if (daylight) {
    const look = skyLook(daylight);
    sky = skyDome(look, 150);
    objects.push(sky);
    const body = (b: LayoutSkyBody | undefined, name: string) => {
      if (!b || b.lux <= 0 || b.dir[2] <= 0) return;
      const three = directionalLight(layout.size, b.dir, b.lux, b.cct);
      three.name = name;
      objects.push(three, three.target);
      candidates.push({ light: three, lux: b.lux * b.dir[2] });
    };
    body(daylight.sun, "sun");
    body(daylight.moon, "moon");
    // The sky's light: `diffuse_lux` on a level surface in its colour, as three's hemisphere light gives an upward
    // face. Nothing from below: light bounced off the floor is in the room's captured light (`captureRoomLight`).
    const hemisphere = new THREE.HemisphereLight(
      linear(kelvinColour(daylight.cct).map((c) => c * daylight.diffuse_lux) as Albedo),
      0x000000,
      1,
    );
    hemisphere.position.set(0, 0, 1);
    hemisphere.name = "sky light";
    objects.push(hemisphere);
  }
  candidates.sort((a, b) => b.lux - a.lux);
  const shadowed = candidates.slice(0, MAX_SHADOW_LIGHTS).map((c) => c.light);
  for (const l of shadowed) l.castShadow = true;
  return { objects, sky, shadowed, light };
}

/** Moves the lights of things that moved by the same change as their bodies (`updateRoomBodies`). */
export function moveThingLights(root: THREE.Object3D, thingId: string, delta: THREE.Matrix4): void {
  for (const object of root.children) {
    if (object.userData.thingId !== thingId || !(object instanceof THREE.Light)) continue;
    object.position.applyMatrix4(delta);
    if (object instanceof THREE.SpotLight) object.target.position.applyMatrix4(delta);
  }
}

/** Material marked by the scene as a sent light's glow (`userData.emitter`); dark while the room is captured. */
const emitters = (root: THREE.Object3D) => {
  const out = new Set<THREE.MeshStandardMaterial>();
  root.traverse((o) => {
    if (o instanceof THREE.Mesh && (o.material as THREE.Material).userData?.emitter) out.add(o.material as THREE.MeshStandardMaterial);
  });
  return out;
};

/** How many times the room's light is bounced off its own surfaces (each a capture with the last one applied). */
export const BOUNCES = 2;

/**
 * Light bouncing off the room's own surfaces: the room as seen from its middle (lit by its real lights, the sky through
 * its doorways) captured into a prefiltered environment every surface is lit and mirrored by (radiance in cd/m^2,
 * `envMapIntensity` 1). Repeated BOUNCES times so light reaches a second surface. While capturing, what is not the room
 * is hidden (`hide`), as are the sun and Moon discs and each sent light's glow (both are already the lights themselves;
 * Frostbite p.73 notes captured emissives double-count). Returns the environment; the caller owns it.
 */
export function captureRoomLight(renderer: THREE.WebGLRenderer, scene: THREE.Scene, root: THREE.Object3D, size: LayoutVector, hide: THREE.Object3D[]): THREE.Texture {
  const was = hide.map((o) => o.visible);
  for (const o of hide) o.visible = false;
  const glows = [...emitters(root)];
  const intensities = glows.map((m) => m.emissiveIntensity);
  for (const m of glows) m.emissiveIntensity = 0;
  const sky = root.getObjectByName("sky") as THREE.Mesh | undefined;
  const skyMaterial = sky?.material as THREE.ShaderMaterial | undefined;
  const discs = skyMaterial ? [skyMaterial.uniforms.sunRadiance.value.clone(), skyMaterial.uniforms.moonRadiance.value.clone()] : [];
  if (skyMaterial) { skyMaterial.uniforms.sunRadiance.value.set(0, 0, 0); skyMaterial.uniforms.moonRadiance.value.set(0, 0, 0); }
  const materials = new Set<THREE.MeshStandardMaterial>();
  root.traverse((o) => {
    if (o instanceof THREE.Mesh && o.material instanceof THREE.MeshStandardMaterial) materials.add(o.material);
  });
  const pmrem = new THREE.PMREMGenerator(renderer);
  const at = new THREE.Vector3(0, 0, Math.min(size[2] / 2, 1.2));
  let environment: THREE.Texture | null = null;
  for (let i = 0; i < BOUNCES; i++) {
    for (const m of materials) { m.envMap = environment; m.envMapIntensity = 1; m.needsUpdate = true; }
    renderer.shadowMap.needsUpdate = true;
    const next = pmrem.fromScene(scene, 0, 0.02, 400, { position: at, size: 256 }).texture;
    environment?.dispose();
    environment = next;
  }
  pmrem.dispose();
  for (const m of materials) { m.envMap = environment; m.envMapIntensity = 1; m.needsUpdate = true; }
  glows.forEach((m, i) => { m.emissiveIntensity = intensities[i]; });
  if (skyMaterial) { skyMaterial.uniforms.sunRadiance.value.copy(discs[0]); skyMaterial.uniforms.moonRadiance.value.copy(discs[1]); }
  hide.forEach((o, i) => { o.visible = was[i]; });
  renderer.shadowMap.needsUpdate = true;
  return environment as THREE.Texture;
}
