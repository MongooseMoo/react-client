import * as THREE from "three";
import { figureParams } from "../avatar/figure";
import type { LayoutThing, LayoutVector, RoomLayout } from "../gmcp/Room";
import { FigureCache, figureMesh } from "./figureMesh";

export { FigureCache };
import type { LayoutArrival } from "../stores/roomStore";
import {
  type Bounds,
  exitWall,
  isPerson,
  mainMaterial,
  nearestWall,
  type PlacedThing,
  scaleBarLength,
  thingForm,
  type Wall,
} from "./roomLayout";

/**
 * The Room.Layout room as a three.js scene, built from `placeThings` output.
 * The scene uses the MOO frame as it is (x east, y north, z up, metres; the
 * camera's up is +z), so no coordinate is converted. Things are drawn by what
 * they are (`thingForm`) and coloured by their main material.
 */

export type CameraMode = "dollhouse" | "eyes";

/** Colour by a thing's largest material. Species not listed are drawn NEUTRAL. */
export const MATERIAL_COLOURS: Readonly<Record<string, number>> = {
  wood: 0x8b5a2b,
  pine: 0x8b5a2b,
  lcd: 0x16161a,
  paper: 0xefe6c8,
  foam: 0x6f7d9c,
  cotton: 0x6f7d9c,
  plastic: 0x9a9a9e,
  metal: 0x8f9aa6,
  steel: 0x8f9aa6,
};
export const NEUTRAL = 0xb8b2a6;
export const PERSON_COLOUR = 0x4ade80;
export const YOU_COLOUR = 0x5ba0ff;
export const DOORWAY_COLOUR = 0xfb923c;
const FLOOR_COLOUR = 0x34343f;
const WALL_COLOUR = 0xd9d4ca;
const CEILING_COLOUR = 0xc8c4bb;
const FRAME_COLOUR = 0x3a2a1a;
const SCREEN_COLOUR = 0x101014;

/** Wall thickness, outside the room's box. */
const WALL_THICKNESS = 0.08;
/** How high a wall facing the dollhouse camera stays, so it does not hide the room. */
export const CUT_WALL_HEIGHT = 0.3;
export const DEFAULT_EYE_HEIGHT = 1.6;
/** Vertical fields of view, degrees: the dollhouse, and your eyes (about what a person takes in without turning). */
export const DOLLHOUSE_FOV = 50;
export const EYES_FOV = 70;

export function thingColour(thing: LayoutThing): number {
  const species = mainMaterial(thing);
  return species !== undefined && Object.hasOwn(MATERIAL_COLOURS, species) ? MATERIAL_COLOURS[species] : NEUTRAL;
}

export interface RoomSceneInput {
  layout: RoomLayout;
  placed: PlacedThing[];
  arrivals: Array<{ arrival: LayoutArrival; at: LayoutVector }>;
  youId: string;
  /** Each person's Client.Spatial forward in the MOO frame, by id; a figure faces it. */
  facings?: Record<string, LayoutVector | undefined>;
  /** Figure geometries kept across rebuilds; without one, every figure is built afresh and freed with the scene. */
  figures?: FigureCache;
}

const hexString = (colour: number) => `#${colour.toString(16).padStart(6, "0")}`;

export interface RoomScene {
  root: THREE.Group;
  /** Each wall's group, origin on the floor, so scaling z cuts it low. */
  walls: Record<Wall, THREE.Group>;
  ceiling: THREE.Mesh;
  /** The doorway openings and floor hatches; each has `userData.exit`, the exit's name. */
  exits: THREE.Object3D[];
  /** Each thing's and arrival's group by id; `userData.form` says how it was drawn. */
  things: Map<string, THREE.Group>;
  /** Where each thing's or arrival's label belongs: just above it. */
  labelAnchors: Map<string, THREE.Vector3>;
}

/** Builds meshes, sharing one material per colour within a scene. */
class Builder {
  private materials = new Map<string, THREE.Material>();

  constructor(private figures?: FigureCache) {}

  material(colour: number, options: { opacity?: number; emissive?: number } = {}): THREE.Material {
    const key = `${colour}:${options.opacity ?? 1}:${options.emissive ?? 0}`;
    let material = this.materials.get(key);
    if (!material) {
      material = new THREE.MeshStandardMaterial({
        color: colour,
        roughness: 0.8,
        metalness: 0.05,
        transparent: options.opacity !== undefined,
        opacity: options.opacity ?? 1,
        emissive: options.emissive ?? 0x000000,
        depthWrite: options.opacity === undefined,
      });
      this.materials.set(key, material);
    }
    return material;
  }

  /** A box between two corners, no side thinner than 1 cm. */
  box(b: Bounds, material: THREE.Material, part: string): THREE.Mesh {
    const size = (lo: number, hi: number) => Math.max(0.01, hi - lo);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size(b.x0, b.x1), size(b.y0, b.y1), size(b.z0, b.z1)), material);
    mesh.position.set((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, (b.z0 + b.z1) / 2);
    mesh.userData.part = part;
    return mesh;
  }

  sphere(centre: LayoutVector, r: number, material: THREE.Material, part: string): THREE.Mesh {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(Math.max(0.01, r), 24, 16), material);
    mesh.position.set(centre[0], centre[1], centre[2]);
    mesh.userData.part = part;
    return mesh;
  }

  /** One material for every figure: each part's colour is in the geometry's vertex colours. */
  figureMaterial(): THREE.Material {
    let material = this.materials.get("figure");
    if (!material) {
      material = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.8, metalness: 0.05 });
      this.materials.set("figure", material);
    }
    return material;
  }

  /**
   * A person from the floor (z0) to z1 at (x, y), drawn from their appearance
   * (or, without one, the same figure in `base`), facing `facing`. Returns the
   * mesh and how high the figure's crown is, for the label.
   */
  person(
    appearance: unknown,
    x: number,
    y: number,
    z0: number,
    z1: number,
    base: number,
    facing: LayoutVector | undefined,
  ): { mesh: THREE.Mesh; top: number } {
    const params = figureParams(appearance, { height: z1 - z0, base: hexString(base) });
    return { mesh: figureMesh(params, x, y, z0, facing, this.figureMaterial(), this.figures), top: z0 + params.top };
  }
}

const centre = (b: Bounds) => [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2] as const;

/** The parts of one thing that is not a person, by its form. */
function thingMeshes(builder: Builder, placed: PlacedThing, size: LayoutVector): THREE.Mesh[] {
  const { thing, bounds: b } = placed;
  const colour = thingColour(thing);
  const surface = builder.material(colour);
  const w = b.x1 - b.x0;
  const d = b.y1 - b.y0;
  const h = b.z1 - b.z0;
  switch (thingForm(thing)) {
    case "table": {
      const top = Math.min(0.05, h * 0.15);
      const leg = Math.min(0.06, Math.min(w, d) / 5);
      const ix = Math.min(w * 0.08, 0.05);
      const iy = Math.min(d * 0.08, 0.05);
      const legs = [
        [b.x0 + ix, b.y0 + iy],
        [b.x1 - ix - leg, b.y0 + iy],
        [b.x0 + ix, b.y1 - iy - leg],
        [b.x1 - ix - leg, b.y1 - iy - leg],
      ].map(([x, y]) => builder.box({ x0: x, x1: x + leg, y0: y, y1: y + leg, z0: b.z0, z1: b.z1 - top }, surface, "leg"));
      return [builder.box({ ...b, z0: b.z1 - top }, surface, "top"), ...legs];
    }
    case "seat": {
      // A seat to half its height, and a back the full height on its side nearest a wall.
      const seat = builder.box({ ...b, z1: b.z0 + h * 0.45 }, surface, "seat");
      const back = { ...b };
      const wall = nearestWall(b, size);
      if (wall === "north") back.y0 = b.y1 - d * 0.22;
      if (wall === "south") back.y1 = b.y0 + d * 0.22;
      if (wall === "east") back.x0 = b.x1 - w * 0.22;
      if (wall === "west") back.x1 = b.x0 + w * 0.22;
      return [seat, builder.box(back, surface, "back")];
    }
    case "shelf": {
      const shelves: THREE.Mesh[] = [builder.box(b, surface, "body")];
      const line = builder.material(new THREE.Color(colour).multiplyScalar(0.55).getHex());
      for (let z = b.z0 + 0.35; z < b.z1 - 0.1; z += 0.35) {
        shelves.push(
          builder.box({ x0: b.x0 - 0.008, x1: b.x1 + 0.008, y0: b.y0 - 0.008, y1: b.y1 + 0.008, z0: z, z1: z + 0.02 }, line, "shelf"),
        );
      }
      return shelves;
    }
    case "picture": {
      // A dark frame, and the picture itself standing just proud of it on both faces.
      const thinX = w <= d;
      const mx = thinX ? -0.006 : w * 0.12;
      const my = thinX ? d * 0.12 : -0.006;
      const mz = h * 0.12;
      return [
        builder.box(b, builder.material(FRAME_COLOUR), "frame"),
        builder.box({ x0: b.x0 + mx, x1: b.x1 - mx, y0: b.y0 + my, y1: b.y1 - my, z0: b.z0 + mz, z1: b.z1 - mz }, surface, "picture"),
      ];
    }
    case "screen":
      return [builder.box(b, builder.material(SCREEN_COLOUR, { emissive: 0x0a1020 }), "screen")];
    case "door": {
      // The leaf, and a knob near its free end on the side facing the middle of the room.
      const alongX = w >= d;
      const [cx, cy] = centre(b);
      const knobZ = Math.min(b.z0 + 0.95, b.z1 - 0.05);
      const knob: LayoutVector = alongX
        ? [b.x0 + w * 0.85, cy + (cy > 0 ? -1 : 1) * (d / 2 + 0.03), knobZ]
        : [cx + (cx > 0 ? -1 : 1) * (w / 2 + 0.03), b.y0 + d * 0.85, knobZ];
      return [builder.box(b, surface, "leaf"), builder.sphere(knob, 0.03, builder.material(0xc0b080), "knob")];
    }
    case "flat":
      return [builder.box({ ...b, z1: b.z0 + Math.min(h, 0.05) }, surface, "block")];
    case "box":
      return placed.footprints.map((f) =>
        f.type === "circle"
          ? builder.sphere([f.cx, f.cy, (f.bounds.z0 + f.bounds.z1) / 2], f.r, surface, "sphere")
          : builder.box(f.bounds, surface, "box"),
      );
  }
}

/** One wall's solid pieces around its doorways, and the doorways as orange openings. */
function buildWall(builder: Builder, layout: RoomLayout, wall: Wall, exits: THREE.Object3D[]): THREE.Group {
  const [w, d, h] = layout.size;
  const t = WALL_THICKNESS;
  const doorTop = Math.min(2.05, h * 0.85);
  const alongX = wall === "north" || wall === "south";
  // Walls along x run past the corners to close them.
  const [lo, hi] = alongX ? [-w / 2 - t, w / 2 + t] : [-d / 2, d / 2];
  const piece = (a: number, b: number, z0: number, z1: number): Bounds => {
    if (wall === "north") return { x0: a, x1: b, y0: d / 2, y1: d / 2 + t, z0, z1 };
    if (wall === "south") return { x0: a, x1: b, y0: -d / 2 - t, y1: -d / 2, z0, z1 };
    if (wall === "east") return { x0: w / 2, x1: w / 2 + t, y0: a, y1: b, z0, z1 };
    return { x0: -w / 2 - t, x1: -w / 2, y0: a, y1: b, z0, z1 };
  };
  const group = new THREE.Group();
  group.name = `${wall} wall`;
  group.userData.wall = wall;
  const solid = builder.material(WALL_COLOUR);
  // Lit from within a little, so the orange reads as orange in shade.
  const doorway = builder.material(DOORWAY_COLOUR, { opacity: 0.55, emissive: 0x6a2e08 });
  const sillMaterial = builder.material(DOORWAY_COLOUR, { emissive: 0x8a3c0a });

  const openings = layout.exits
    .filter((exit) => exitWall(exit, layout.size) === wall)
    .map((exit) => {
      const c = alongX ? exit.at[0] : exit.at[1];
      return { exit, a: Math.max(lo, c - exit.width / 2), b: Math.min(hi, c + exit.width / 2) };
    })
    .sort((p, q) => p.a - q.a);

  let from = lo;
  for (const { exit, a, b } of openings) {
    if (a > from) group.add(builder.box(piece(from, a, 0, h), solid, "wall"));
    if (h > doorTop) group.add(builder.box(piece(a, b, doorTop, h), solid, "lintel"));
    const opening = builder.box(piece(a, b, 0, doorTop), doorway, "doorway");
    opening.userData.exit = exit.name;
    group.add(opening);
    exits.push(opening);
    // An orange threshold on the floor, so the doorway shows even where its wall is cut low.
    const sill = piece(a, b, 0, 0.012);
    const reach = 0.15;
    if (wall === "north") sill.y0 -= reach;
    if (wall === "south") sill.y1 += reach;
    if (wall === "east") sill.x0 -= reach;
    if (wall === "west") sill.x1 += reach;
    const threshold = builder.box(sill, sillMaterial, "threshold");
    threshold.userData.exit = exit.name;
    group.add(threshold);
    exits.push(threshold);
    from = Math.max(from, b);
  }
  if (hi > from) group.add(builder.box(piece(from, hi, 0, h), solid, "wall"));
  return group;
}

export function buildRoomScene({ layout, placed, arrivals, youId, facings = {}, figures }: RoomSceneInput): RoomScene {
  const builder = new Builder(figures);
  const [w, d] = layout.size;
  const root = new THREE.Group();
  const exits: THREE.Object3D[] = [];

  root.add(new THREE.HemisphereLight(0xffffff, 0x444450, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(w * 0.4, -d * 0.6, 6);
  root.add(sun);

  const floor = builder.box({ x0: -w / 2, x1: w / 2, y0: -d / 2, y1: d / 2, z0: -0.02, z1: 0 }, builder.material(FLOOR_COLOUR), "floor");
  root.add(floor);
  // Seen only from your eyes; the dollhouse looks in from above.
  const ceiling = builder.box(
    { x0: -w / 2 - WALL_THICKNESS, x1: w / 2 + WALL_THICKNESS, y0: -d / 2 - WALL_THICKNESS, y1: d / 2 + WALL_THICKNESS, z0: layout.size[2], z1: layout.size[2] + 0.02 },
    builder.material(CEILING_COLOUR),
    "ceiling",
  );
  root.add(ceiling);

  // Floor grid at the plan's scale-bar step, so both views measure alike.
  const step = scaleBarLength(w);
  const points: number[] = [];
  for (let x = Math.ceil(-w / 2 / step) * step; x < w / 2; x += step) {
    if (x > -w / 2) points.push(x, -d / 2, 0.002, x, d / 2, 0.002);
  }
  for (let y = Math.ceil(-d / 2 / step) * step; y < d / 2; y += step) {
    if (y > -d / 2) points.push(-w / 2, y, 0.002, w / 2, y, 0.002);
  }
  const grid = new THREE.BufferGeometry();
  grid.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  const gridLines = new THREE.LineSegments(grid, new THREE.LineBasicMaterial({ color: 0x9999aa, transparent: true, opacity: 0.18 }));
  gridLines.userData.part = "grid";
  root.add(gridLines);

  const walls = {} as Record<Wall, THREE.Group>;
  for (const wall of ["north", "south", "east", "west"] as const) {
    walls[wall] = buildWall(builder, layout, wall, exits);
    root.add(walls[wall]);
  }

  // Exits not in a wall (hatches, ladders, stairs): an orange square where they are.
  for (const exit of layout.exits) {
    if (exitWall(exit, layout.size)) continue;
    const half = Math.max(exit.width, 0.4) / 2;
    const [x, y, z] = exit.at;
    const hatch = builder.box(
      { x0: x - half, x1: x + half, y0: y - half, y1: y + half, z0: z, z1: z + 0.02 },
      builder.material(DOORWAY_COLOUR, { opacity: 0.6 }),
      "hatch",
    );
    hatch.userData.exit = exit.name;
    root.add(hatch);
    exits.push(hatch);
  }

  const things = new Map<string, THREE.Group>();
  const labelAnchors = new Map<string, THREE.Vector3>();
  for (const p of placed) {
    const group = new THREE.Group();
    group.name = p.thing.id;
    group.userData.thingId = p.thing.id;
    const [x, y] = centre(p.bounds);
    if (isPerson(p.thing)) {
      group.userData.form = "person";
      const base = p.thing.id === youId ? YOU_COLOUR : PERSON_COLOUR;
      const { mesh, top } = builder.person(p.thing.appearance, x, y, p.bounds.z0, p.bounds.z1, base, facings[p.thing.id]);
      group.add(mesh);
      labelAnchors.set(p.thing.id, new THREE.Vector3(x, y, top + 0.12));
    } else {
      group.userData.form = thingForm(p.thing);
      for (const mesh of thingMeshes(builder, p, layout.size)) group.add(mesh);
      labelAnchors.set(p.thing.id, new THREE.Vector3(x, y, p.bounds.z1 + 0.12));
    }
    root.add(group);
    things.set(p.thing.id, group);
  }
  for (const { arrival, at } of arrivals) {
    const group = new THREE.Group();
    group.name = arrival.id;
    group.userData.thingId = arrival.id;
    if (isPerson(arrival)) {
      group.userData.form = "person";
      // Client.Spatial puts a person at head height; the body stands on the floor below it.
      const crown = Math.max(at[2] + 0.12, 1.0);
      const base = arrival.id === youId ? YOU_COLOUR : PERSON_COLOUR;
      const { mesh, top } = builder.person(undefined, at[0], at[1], 0, crown, base, facings[arrival.id]);
      group.add(mesh);
      labelAnchors.set(arrival.id, new THREE.Vector3(at[0], at[1], top + 0.12));
    } else {
      group.userData.form = "box";
      const s = 0.1;
      group.add(builder.box({ x0: at[0] - s, x1: at[0] + s, y0: at[1] - s, y1: at[1] + s, z0: at[2] - s, z1: at[2] + s }, builder.material(NEUTRAL), "box"));
      labelAnchors.set(arrival.id, new THREE.Vector3(at[0], at[1], at[2] + s + 0.12));
    }
    root.add(group);
    things.set(arrival.id, group);
  }

  // Figures of people who left, or whose look changed, are freed now.
  figures?.sweep();
  return { root, walls, ceiling, exits, things, labelAnchors };
}

/**
 * In the dollhouse, each wall the camera is outside of is cut down to
 * CUT_WALL_HEIGHT, so the room stays in view from any side, and there is no
 * ceiling; from your eyes every wall stands full height under the ceiling.
 */
export function cutWalls(scene: RoomScene, layout: RoomLayout, camera: THREE.Vector3, mode: CameraMode): void {
  const [w, d, h] = layout.size;
  const outside: Record<Wall, boolean> = {
    north: camera.y > d / 2,
    south: camera.y < -d / 2,
    east: camera.x > w / 2,
    west: camera.x < -w / 2,
  };
  const cut = Math.min(1, CUT_WALL_HEIGHT / h);
  for (const wall of ["north", "south", "east", "west"] as const) {
    scene.walls[wall].scale.z = mode === "dollhouse" && outside[wall] ? cut : 1;
  }
  scene.ceiling.visible = mode === "eyes";
}

export interface CameraPose {
  position: LayoutVector;
  target: LayoutVector;
}

/** The dollhouse's starting view: from above the south-east, looking at the middle of the room. */
export function dollhousePose(layout: RoomLayout, fov = DOLLHOUSE_FOV): CameraPose {
  const [w, d, h] = layout.size;
  const target: LayoutVector = [0, 0, Math.min(h, 2) * 0.25];
  // Far enough that the room's floor fills most of the view: its half-diagonal fits the field of view.
  const radius = Math.hypot(w, d) / 2;
  const distance = (radius / Math.sin(((fov / 2) * Math.PI) / 180)) * 1.05;
  const direction = new THREE.Vector3(0.45, -1, 1.05).normalize().multiplyScalar(distance);
  return { position: [target[0] + direction.x, target[1] + direction.y, target[2] + direction.z], target };
}

/** One zoom-in step multiplies the dollhouse camera's distance, or Your eyes' field of view, by this. */
export const ZOOM_STEP = 0.87;
/** The narrowest field of view Your eyes zoom to, degrees: about eight times magnified. */
export const EYES_MIN_FOV = 10;

/** How far out the dollhouse may go: at least 60 m, and always far enough for the room's whole-room view. */
export function dollhouseMaxDistance(layout: RoomLayout, fov = DOLLHOUSE_FOV): number {
  const pose = dollhousePose(layout, fov);
  const distance = Math.hypot(...pose.position.map((v, i) => v - pose.target[i]));
  return Math.max(60, distance * 1.5);
}

/** Your eyes' field of view after a zoom key (`+`/`=` in, `-`/`_` out, `0` back), or undefined for any other key. */
export function zoomedFov(fov: number, key: string): number | undefined {
  if (key === "+" || key === "=") return Math.max(EYES_MIN_FOV, fov * ZOOM_STEP);
  if (key === "-" || key === "_") return Math.min(EYES_FOV, fov / ZOOM_STEP);
  if (key === "0") return EYES_FOV;
  return undefined;
}

/**
 * Your eyes: at your Client.Spatial position (or your body's top when there is
 * none), looking along your Client.Spatial forward. `position` and
 * `forward` are in the MOO frame. Without either, the middle of the room
 * facing north.
 */
export function eyesPose(
  layout: RoomLayout,
  position: LayoutVector | null,
  forward: LayoutVector | null,
  you: Bounds | undefined,
): CameraPose {
  const at: LayoutVector = position
    ? [position[0], position[1], position[2] > 0.8 ? position[2] : DEFAULT_EYE_HEIGHT]
    : you
      ? [(you.x0 + you.x1) / 2, (you.y0 + you.y1) / 2, Math.max(you.z1 - 0.1, 0.8)]
      : [0, 0, Math.min(DEFAULT_EYE_HEIGHT, layout.size[2] * 0.8)];
  const length = forward ? Math.hypot(forward[0], forward[1], forward[2]) : 0;
  const [fx, fy, fz] = forward && length > 1e-6 ? forward.map((v) => v / length) : [0, 1, 0];
  return { position: at, target: [at[0] + fx, at[1] + fy, at[2] + fz] };
}

/** Frees every geometry and material in the scene. */
export function disposeRoomScene(scene: RoomScene): void {
  const materials = new Set<THREE.Material>();
  scene.root.traverse((object) => {
    if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
      // A kept figure geometry belongs to its FigureCache, which frees it.
      if (!object.userData.keptGeometry) object.geometry.dispose();
      const material = object.material as THREE.Material | THREE.Material[];
      for (const m of Array.isArray(material) ? material : [material]) materials.add(m);
    }
  });
  for (const material of materials) material.dispose();
}
