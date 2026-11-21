import * as THREE from "three";
import { colourHex, hexToNumber } from "../avatar/colour";
import { type Footprint, figureParams } from "../avatar/figure";
import { isLayoutPose, type LayoutPose, type LayoutThing, type LayoutVector, type RoomLayout } from "../gmcp/Room";
import { FigureCache, figureMesh, headOutline } from "./figureMesh";

export { FigureCache };
import {
  type Bounds,
  type Box,
  exitWall,
  isPerson,
  mainMaterial,
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
  youId: string;
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
  /**
   * What each thing's or arrival's label sits just above on screen: a person's head outline,
   * the middle of a thing's top. The first point is where the label hangs.
   */
  labelPoints: Map<string, THREE.Vector3[]>;
  /** Each person's head as drawn (everything above the chin: hair, hat, antlers), as its box's eight corners. */
  heads: Map<string, THREE.Vector3[]>;
  /**
   * Each person's floor ring, shown by `updateTinyMarkers` while their figure is too small to find in the picture. The
   * rings sit outside the things' groups, so no ray cast at the things meets one and no figure's drawn box includes one.
   */
  markers: Map<string, THREE.Mesh>;
}

/** The box round a figure geometry's vertices above `chin`, worked out once per geometry. */
function headBox(geometry: THREE.BufferGeometry, chin: number): THREE.Box3 {
  const kept = geometry.userData.headBox as { chin: number; box: THREE.Box3 } | undefined;
  if (kept && kept.chin === chin) return kept.box;
  const box = new THREE.Box3();
  const position = geometry.getAttribute("position");
  const v = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i);
    if (v.z >= chin) box.expandByPoint(v);
  }
  // Nothing above the chin (an animal fitted lower than its box): the whole figure counts as its head.
  if (box.isEmpty() && position.count > 0) box.setFromBufferAttribute(position as THREE.BufferAttribute);
  geometry.userData.headBox = { chin, box };
  return box;
}

const boxCorners = (b: THREE.Box3): THREE.Vector3[] =>
  [0, 1, 2, 3, 4, 5, 6, 7].map((i) => new THREE.Vector3(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z));

/** How rough a crystal body's surface is (a figure's is 0.8): low enough for a sheen on its faces. */
export const CRYSTAL_ROUGHNESS = 0.35;
/** A faint cool light from within a crystal body, so its faces turned from the light are not dead grey: it reads as
 * light passing through, without a transparent material (which a single merged mesh cannot sort). */
export const CRYSTAL_GLOW = 0x1c2633;

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

  /**
   * One material for every figure: each part's colour is in the geometry's vertex colours. A body with a crystal
   * covering gets a second, glossy one with flat shading, so its cut faces catch the light as crystal does.
   */
  figureMaterial(crystal = false): THREE.Material {
    const key = crystal ? "figure-crystal" : "figure";
    let material = this.materials.get(key);
    if (!material) {
      material = crystal
        ? new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: CRYSTAL_ROUGHNESS, metalness: 0, flatShading: true, emissive: CRYSTAL_GLOW })
        : new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.8, metalness: 0.05 });
      this.materials.set(key, material);
    }
    return material;
  }

  /**
   * A person from the floor (z0) to z1 at (x, y), drawn from their appearance
   * (or, without one, the same figure in `base`), facing `facing`. Returns the
   * mesh and the points its label sits above: the head's outline (`headOutline`).
   */
  person(
    appearance: unknown,
    x: number,
    y: number,
    z0: number,
    z1: number,
    base: number,
    pose?: LayoutPose,
    footprint?: Footprint,
  ): { mesh: THREE.Mesh; label: THREE.Vector3[]; head: THREE.Vector3[]; animal: boolean } {
    const visible = pose?.posture ? {
      ...(typeof appearance === "object" && appearance !== null && !Array.isArray(appearance) ? appearance : {}),
      posture: pose.posture,
    } : appearance;
    // The box across and front to back: the pose's own when it has one, else the room-frame box (a figure without a
    // pose faces south, so its width and depth are the box's x and y).
    const across = pose ? { width: pose.dimensions_m[0], depth: pose.dimensions_m[1] } : footprint;
    const params = figureParams(visible, { height: pose?.figure_height_m ?? pose?.dimensions_m[2] ?? (z1 - z0), base: hexString(base), footprint: across });
    const crystal = params.plan.kind === "humanoid" && params.plan.covering === "crystal";
    const mesh = figureMesh(params, x, y, z0, undefined, this.figureMaterial(crystal), this.figures);
    if (pose) {
      const q = bodyQuaternion(pose);
      mesh.quaternion.premultiply(q);
      const offset = new THREE.Vector3(0, 0, -pose.dimensions_m[2] / 2).applyQuaternion(q);
      mesh.position.fromArray(pose.centre_m).add(offset);
    }
    mesh.updateMatrixWorld();
    const chin = params.top - params.headHeight * 1.05;
    const outline = headOutline(mesh.geometry, chin);
    const toWorld = (p: THREE.Vector3) => p.clone().applyMatrix4(mesh.matrixWorld);
    return { mesh, label: outline.map(toWorld), head: boxCorners(headBox(mesh.geometry, chin)).map(toWorld), animal: params.plan.kind === "animal" };
  }
}

function bodyQuaternion(pose: LayoutPose): THREE.Quaternion {
  const [w, x, y, z] = pose.body_quaternion;
  return new THREE.Quaternion(x, y, z, w).normalize();
}

const centre = (b: Bounds) => [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2] as const;

/** The parts of one thing that is not a person, by its form. */
function thingMeshes(builder: Builder, placed: PlacedThing): THREE.Mesh[] {
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
      const seat = builder.box({ ...b, z1: b.z0 + h * 0.45 }, surface, "seat");
      const front = thing.front?.axis;
      if (!front || Math.hypot(front[0], front[1]) < 1e-6) return [seat];
      const norm = Math.hypot(front[0], front[1]);
      const fx = front[0] / norm, fy = front[1] / norm;
      const thickness = Math.min(w, d) * 0.22;
      const reach = (Math.abs(fx) * w + Math.abs(fy) * d) / 2 - thickness / 2;
      const width = Math.abs(fy) * w + Math.abs(fx) * d;
      const back = builder.box({ x0: -width / 2, x1: width / 2, y0: -thickness / 2, y1: thickness / 2, z0: b.z0, z1: b.z1 }, surface, "back");
      back.rotation.z = Math.atan2(-fx, fy);
      back.position.x = (b.x0 + b.x1) / 2 - fx * reach;
      back.position.y = (b.y0 + b.y1) / 2 - fy * reach;
      return [seat, back];
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
      return [builder.box(b, builder.material(SCREEN_COLOUR, { emissive: thing.state?.mode === "running" ? 0x0a1020 : 0 }), "screen")];
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
      return collisionMeshes(builder, placed);
  }
}

/** Custom native world shapes stay in their supplied frame. */
function collisionMeshes(builder: Builder, placed: PlacedThing): THREE.Mesh[] {
  const material = builder.material(thingColour(placed.thing));
  return placed.footprints.map((f) => f.type === "circle"
    ? builder.sphere([f.cx, f.cy, (f.bounds.z0 + f.bounds.z1) / 2], f.r, material, "sphere")
    : builder.box(f.bounds, material, "box"));
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
  group.userData.finish = layout.finishes?.wall;
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

export function buildRoomScene({ layout, placed, youId, figures }: RoomSceneInput): RoomScene {
  const builder = new Builder(figures);
  const [w, d] = layout.size;
  const root = new THREE.Group();
  const exits: THREE.Object3D[] = [];

  root.add(new THREE.HemisphereLight(0xffffff, 0x444450, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(w * 0.4, -d * 0.6, 6);
  root.add(sun);

  const floor = builder.box({ x0: -w / 2, x1: w / 2, y0: -d / 2, y1: d / 2, z0: -0.02, z1: 0 }, builder.material(FLOOR_COLOUR), "floor");
  floor.userData.finish = layout.finishes?.floor;
  root.add(floor);
  // Seen only from your eyes; the dollhouse looks in from above.
  const ceiling = builder.box(
    { x0: -w / 2 - WALL_THICKNESS, x1: w / 2 + WALL_THICKNESS, y0: -d / 2 - WALL_THICKNESS, y1: d / 2 + WALL_THICKNESS, z0: layout.size[2], z1: layout.size[2] + 0.02 },
    builder.material(CEILING_COLOUR),
    "ceiling",
  );
  ceiling.userData.finish = layout.finishes?.ceiling;
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
  const labelPoints = new Map<string, THREE.Vector3[]>();
  const heads = new Map<string, THREE.Vector3[]>();
  for (const p of placed) {
    const group = new THREE.Group();
    group.name = p.thing.id;
    group.userData.thingId = p.thing.id;
    const [x, y] = centre(p.bounds);
    if (isPerson(p.thing)) {
      group.userData.form = "person";
      const base = p.thing.id === youId ? YOU_COLOUR : PERSON_COLOUR;
      const { mesh, label, head, animal } = builder.person(p.thing.appearance, x, y, p.bounds.z0, p.bounds.z1, base, isLayoutPose(p.thing.pose) ? p.thing.pose : undefined, {
        width: p.bounds.x1 - p.bounds.x0,
        depth: p.bounds.y1 - p.bounds.y0,
      });
      group.add(mesh);
      // An animal form is drawn smaller than its box or beside it: a zoom onto it frames the figure (`personFocus`).
      group.userData.animal = animal;
      labelPoints.set(p.thing.id, label);
      heads.set(p.thing.id, head);
    } else {
      group.userData.form = thingForm(p.thing);
      const pose = p.thing.pose;
      if (isLayoutPose(pose) && (pose.box || p.thing.form_boxes?.length)) {
        const [w, d, h] = pose.dimensions_m;
        const local: PlacedThing = { ...p, bounds: { x0: -w / 2, x1: w / 2, y0: -d / 2, y1: d / 2, z0: -h / 2, z1: h / 2 } };
        if (p.thing.form_boxes?.length) {
          const surface = thingColour(p.thing);
          const wood = builder.material(surface);
          const face = builder.material(new THREE.Color(surface).multiplyScalar(0.78).getHex());
          for (const { center: [x, y, z], size: [w, d, h], basis, role, fitting, colour } of p.thing.form_boxes) {
            const hex = colourHex(colour);
            const material = hex ? builder.material(hexToNumber(hex)) : fitting ? face : wood;
            const mesh = builder.box({
              x0: -0.5, x1: 0.5, y0: -0.5, y1: 0.5, z0: -0.5, z1: 0.5,
            }, material, fitting?.name ?? role ?? "form");
            mesh.position.set(x, y, z);
            // Nested rotations and unequal scales can produce non-orthogonal edges.
            if (basis) mesh.matrix.makeBasis(new THREE.Vector3(...basis[0]), new THREE.Vector3(...basis[1]), new THREE.Vector3(...basis[2]));
            mesh.matrix.scale(new THREE.Vector3(w, d, h)).setPosition(mesh.position);
            mesh.matrixAutoUpdate = false;
            if (fitting) mesh.userData.fitting = fitting.lifetime;
            if (role && p.thing.lifetime) mesh.userData.inspect = [p.thing.id, p.thing.lifetime, role];
            group.add(mesh);
          }
        } else if (thingForm(p.thing) === "box") group.add(builder.box(local.bounds, builder.material(thingColour(p.thing)), "box"));
        else for (const mesh of thingMeshes(builder, local)) group.add(mesh);
        group.quaternion.copy(bodyQuaternion(pose));
        group.position.fromArray(pose.centre_m);
      } else if (isLayoutPose(pose)) {
        for (const mesh of collisionMeshes(builder, p)) group.add(mesh);
      } else {
        for (const mesh of thingMeshes(builder, p)) group.add(mesh);
      }
      labelPoints.set(p.thing.id, [new THREE.Vector3(x, y, p.bounds.z1)]);
    }
    root.add(group);
    things.set(p.thing.id, group);
  }
  // Figures of people who left, or whose look changed, are freed now.
  figures?.sweep();
  // A floor ring for each person, hidden until `updateTinyMarkers` finds their figure too small to see.
  const markers = new Map<string, THREE.Mesh>();
  const rings = new THREE.Group();
  rings.name = "tiny figure markers";
  const ring = new THREE.RingGeometry(MARKER_INNER, 1, 40);
  for (const [id, group] of things) {
    if (group.userData.form !== "person") continue;
    const marker = new THREE.Mesh(ring, new THREE.MeshBasicMaterial({ color: MARKER_COLOUR, transparent: true, opacity: 0, depthWrite: false }));
    marker.name = `marker ${id}`;
    marker.visible = false;
    rings.add(marker);
    markers.set(id, marker);
  }
  root.add(rings);
  root.updateMatrixWorld(true);
  return { root, walls, ceiling, exits, things, labelPoints, heads, markers };
}

/** A figure shorter than this on screen, CSS pixels, gets its floor ring; from MARKER_FULL_PX down the ring is at full strength. */
export const TINY_FIGURE_PX = 16;
const MARKER_FULL_PX = 10;
/** The ring's radius on screen, CSS pixels: round a figure a few pixels tall, about the size of a pick target (PICK_TOLERANCE). */
const MARKER_RADIUS_PX = 11;
/** The ring's inner radius as a share of its outer one: a line about 1.5 px wide. */
const MARKER_INNER = 0.86;
/** The person label's colour (`.rl3d-label-person` in RoomLayoutView.css); the view sets each ring to its own label's. */
const MARKER_COLOUR = 0xe8e8ed;

/** How strongly a figure `px` CSS pixels tall on screen is ringed: 1 up to MARKER_FULL_PX, fading to 0 at TINY_FIGURE_PX. */
export function markerOpacity(px: number): number {
  return Math.min(1, Math.max(0, (TINY_FIGURE_PX - px) / (TINY_FIGURE_PX - MARKER_FULL_PX)));
}

/**
 * Shows a thin ring on the floor round each person whose figure is drawn under TINY_FIGURE_PX tall in a `width` x
 * `height` Dollhouse picture (a song bird across the room), fading it out as the figure grows, so a sighted player can
 * find a figure at its true size; hides every ring in Your eyes. The figure itself is never enlarged.
 */
export function updateTinyMarkers(scene: RoomScene, camera: THREE.PerspectiveCamera, width: number, height: number, mode: CameraMode): void {
  const drawn = new THREE.Box3();
  const middle = new THREE.Vector3();
  for (const [id, marker] of scene.markers) {
    const group = scene.things.get(id);
    marker.visible = false;
    if (mode !== "dollhouse" || !group?.visible) continue;
    drawn.setFromObject(group);
    if (drawn.isEmpty()) continue;
    const seen = screenBox(boxCorners(drawn), camera, width, height);
    if (!seen) continue;
    const opacity = markerOpacity(seen.y1 - seen.y0);
    if (opacity === 0) continue;
    drawn.getCenter(middle);
    // Metres per CSS pixel at the figure's distance, so the ring is the same size on screen at any zoom.
    const perPixel = (2 * camera.position.distanceTo(middle) * Math.tan(((camera.fov / 2) * Math.PI) / 180)) / height;
    const footprint = Math.hypot(drawn.max.x - drawn.min.x, drawn.max.y - drawn.min.y) / 2;
    marker.scale.setScalar(Math.max(MARKER_RADIUS_PX * perPixel, footprint * 1.3));
    // Just above the floor under the figure, so the floor never hides it.
    marker.position.set(middle.x, middle.y, drawn.min.z + 0.003);
    (marker.material as THREE.MeshBasicMaterial).opacity = opacity;
    marker.visible = true;
  }
}

/** Move existing rigid bodies without replacing meshes, materials or figure geometry. */
export function updateRoomBodies(room: RoomScene, before: PlacedThing[], after: PlacedThing[]): boolean {
  if (before.length !== after.length) return false;
  const changes: Array<{ old: PlacedThing; next: PlacedThing; delta: THREE.Matrix4 }> = [];
  for (let i = 0; i < before.length; i++) {
    const old = before[i];
    const next = after[i];
    if (old.thing === next.thing) continue;
    const a = old.thing.pose;
    const b = next.thing.pose;
    if (old.thing.id !== next.thing.id || !room.things.has(next.thing.id) ||
      !isLayoutPose(a) || !isLayoutPose(b) || (!b.box && !isPerson(next.thing)) ||
      a.box !== b.box || a.figure_height_m !== b.figure_height_m || a.posture !== b.posture ||
      a.dimensions_m.some((n, axis) => n !== b.dimensions_m[axis]) ||
      old.thing.appearance !== next.thing.appearance || old.thing.state !== next.thing.state || old.thing.form_boxes !== next.thing.form_boxes ||
      old.thing.material !== next.thing.material || old.thing.classes !== next.thing.classes ||
      JSON.stringify(old.thing.front?.axis) !== JSON.stringify(next.thing.front?.axis)) return false;
    const matrix = (pose: LayoutPose) => new THREE.Matrix4().compose(
      new THREE.Vector3(...pose.centre_m), bodyQuaternion(pose), new THREE.Vector3(1, 1, 1));
    changes.push({ old, next, delta: matrix(b).multiply(matrix(a).invert()) });
  }
  for (const { next, delta } of changes) {
    const group = room.things.get(next.thing.id);
    if (!group) return false;
    group.applyMatrix4(delta);
    if (isPerson(next.thing)) {
      for (const point of room.heads.get(next.thing.id) ?? []) point.applyMatrix4(delta);
      for (const point of room.labelPoints.get(next.thing.id) ?? []) point.applyMatrix4(delta);
    } else {
      const [x, y] = centre(next.bounds);
      room.labelPoints.set(next.thing.id, [new THREE.Vector3(x, y, next.bounds.z1)]);
    }
  }
  room.root.updateMatrixWorld(true);
  return true;
}

/**
 * The screen box, in pixels from the top left of a `width` x `height` picture, round
 * `points` (a head's box corners). Undefined when any of them is behind the camera or beyond its far plane.
 */
export function screenBox(points: THREE.Vector3[], camera: THREE.Camera, width: number, height: number): { x0: number; x1: number; y0: number; y1: number } | undefined {
  const at = new THREE.Vector3();
  const box = { x0: Number.POSITIVE_INFINITY, x1: Number.NEGATIVE_INFINITY, y0: Number.POSITIVE_INFINITY, y1: Number.NEGATIVE_INFINITY };
  for (const point of points) {
    at.copy(point).project(camera);
    if (at.z < -1 || at.z > 1) return undefined;
    const x = ((at.x + 1) / 2) * width;
    const y = ((1 - at.y) / 2) * height;
    box.x0 = Math.min(box.x0, x);
    box.x1 = Math.max(box.x1, x);
    box.y0 = Math.min(box.y0, y);
    box.y1 = Math.max(box.y1, y);
  }
  return box;
}

/**
 * Where label points (`RoomScene.labelPoints`) show on a `width` x `height` picture, in
 * pixels from the top left: across, where the first point is; down, the highest of the
 * rest (the first itself when it is alone). Undefined when the first point is behind the
 * camera or beyond its far plane.
 */
export function screenTop(points: THREE.Vector3[], camera: THREE.Camera, width: number, height: number): { x: number; top: number } | undefined {
  const at = new THREE.Vector3().copy(points[0]).project(camera);
  if (at.z < -1 || at.z > 1) return undefined;
  const x = at.x;
  let top = points.length === 1 ? at.y : Number.NEGATIVE_INFINITY;
  for (let i = 1; i < points.length; i++) {
    at.copy(points[i]).project(camera);
    if (at.z >= -1 && at.z <= 1) top = Math.max(top, at.y);
  }
  return { x: ((x + 1) / 2) * width, top: ((1 - top) / 2) * height };
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

/**
 * Moves the dollhouse's camera and the point it orbits by the same amount, so the camera
 * looks at `point` from the same angle and distance: the view slides over to it, unturned.
 */
export function panTo(camera: THREE.Object3D, target: THREE.Vector3, point: THREE.Vector3): void {
  const shift = new THREE.Vector3().subVectors(point, target);
  camera.position.add(shift);
  target.add(shift);
}

/** Where keyboard zoom heads in the dollhouse: your own face, or the room's middle when you are not in the layout. */
export function zoomFocus(you: Bounds | undefined, layout: RoomLayout): THREE.Vector3 {
  if (!you) return new THREE.Vector3(...dollhousePose(layout).target);
  return new THREE.Vector3((you.x0 + you.x1) / 2, (you.y0 + you.y1) / 2, you.z0 + (you.z1 - you.z0) * 0.9);
}

/** What a zoom onto a person heads for and how near it may come; `box` is what is drawn of them, for picking. */
export interface PersonFocus {
  point: THREE.Vector3;
  /** The least distance from `point` at which the whole of what is drawn fits the picture: 0 for a person. */
  frame: number;
  /** The corners of the box the person takes on screen: their Room.Layout box, or an animal's figure as drawn. */
  box: THREE.Vector3[];
}

/**
 * Where a zoom onto a person heads. A person: their face (`zoomFocus` of their box), with nothing more to frame. An
 * animal form (a duck, a snake, a song bird) is drawn smaller than its box, or coiled beside a thin one: the middle of
 * the figure as drawn, from no nearer than the distance at which all of it fits a `fov` picture, so the close-up
 * shows the whole animal and the arrow keys turn round it, not round empty air at a person's head height.
 */
export function personFocus(scene: RoomScene, person: PlacedThing, layout: RoomLayout, fov = DOLLHOUSE_FOV): PersonFocus {
  const b = person.bounds;
  const group = scene.things.get(person.thing.id);
  if (!group?.userData.animal) {
    return { point: zoomFocus(b, layout), frame: 0, box: boxCorners(new THREE.Box3(new THREE.Vector3(b.x0, b.y0, b.z0), new THREE.Vector3(b.x1, b.y1, b.z1))) };
  }
  const drawn = new THREE.Box3().setFromObject(group);
  const radius = drawn.getBoundingSphere(new THREE.Sphere()).radius;
  // Never so near that the camera's near plane cuts into it.
  const frame = Math.max((radius / Math.sin(((fov / 2) * Math.PI) / 180)) * 1.1, radius + DOLLHOUSE_NEAR * 2);
  return { point: drawn.getCenter(new THREE.Vector3()), frame, box: boxCorners(drawn) };
}

/** How many wheel notches bring the dollhouse from its whole-room view to WHEEL_CLOSE from a person, in a room of any size. */
export const WHEEL_NOTCHES = 20;
/** Metres from a face at which a person fills the dollhouse picture to the shoulders. */
export const WHEEL_CLOSE = 1.5;

/**
 * What one dollhouse wheel notch toward the pointer multiplies the camera's distance by:
 * WHEEL_NOTCHES of them go from the room's whole-room view to WHEEL_CLOSE, so a large room
 * zooms faster per notch than a small one. Never slower than 0.95, the step of small rooms.
 */
export function wheelStep(layout: RoomLayout, fov = DOLLHOUSE_FOV): number {
  const pose = dollhousePose(layout, fov);
  const distance = Math.hypot(...pose.position.map((v, i) => v - pose.target[i]));
  return Math.min(0.95, (WHEEL_CLOSE / distance) ** (1 / WHEEL_NOTCHES));
}

/**
 * How many wheel notches a wheel event is: at most one, and a smaller event in proportion to a
 * notch of 100 pixels, 3 lines or one page. What browsers send for one notch of a mouse wheel
 * (from their source; see docs/room-layout.md): Chromium 100 px on Windows at the default 3 lines
 * at any display scale (6 lines: 200), 120 px on Linux, never lines; Firefox 3 lines (6 with its
 * own speed-up) when `deltaMode` is read before `deltaY`, which callers must do. So every notch
 * is one; a trackpad's small deltas add up smoothly; a page zoom above 100% in Chromium divides
 * its notch (200%: 50 px, half a notch), which the event alone cannot tell from a trackpad.
 */
export function wheelNotches(deltaY: number, deltaMode: number): number {
  return Math.min(1, Math.abs(deltaY) / (deltaMode === 1 ? 3 : deltaMode === 2 ? 1 : 100));
}

/**
 * How near the pointer must be to a person as drawn, CSS pixels, for the wheel or a pinch to
 * pick them: half of the 24 CSS px minimum target of WCAG 2.2 success criterion 2.5.8, so
 * even a person a pixel tall is a target at least 24 px across.
 */
export const PICK_TOLERANCE = 12;
/**
 * The least distance, metres, the dollhouse camera keeps from what it zooms onto (OrbitControls' minDistance too), but
 * for an animal form smaller than that frames: the camera comes as near as its whole figure fits (`personFocus`).
 */
export const ZOOM_NEAREST = 0.5;
/** The 3D view's camera near plane, metres: nothing nearer the camera than this is drawn. */
export const DOLLHOUSE_NEAR = 0.05;
/** Room left round a person's box that a zoom onto them never brings the camera into, metres. */
const PERSON_CLEARANCE = 0.15;

/** What a dollhouse zoom heads for, and how near the camera may come to it. */
export interface ZoomPick {
  point: THREE.Vector3;
  /** The camera stops this far from `point`: outside what owns it. */
  nearest: number;
  /**
   * What a notch's scale is raised to on the way to `point`: 1, except for a figure that frames nearer than
   * ZOOM_NEAREST (a song bird), where it is the power that brings the camera to `nearest` in the WHEEL_NOTCHES a
   * person's face takes to reach WHEEL_CLOSE (`wheelPace`).
   */
  pace: number;
}

/**
 * How much faster per notch a zoom heads for something it may come `nearest` to: 1 from ZOOM_NEAREST up, so a person,
 * a duck or a snake zooms as before; for a smaller figure, the power of a notch's scale that covers the distance from
 * the room's whole-room view to `nearest` in the notches a person's face takes from there to WHEEL_CLOSE.
 */
export function wheelPace(nearest: number, layout: RoomLayout, fov = DOLLHOUSE_FOV): number {
  if (nearest >= ZOOM_NEAREST) return 1;
  const pose = dollhousePose(layout, fov);
  const whole = Math.hypot(...pose.position.map((v, i) => v - pose.target[i]));
  return whole > WHEEL_CLOSE ? Math.max(1, Math.log(nearest / whole) / Math.log(WHEEL_CLOSE / whole)) : 1;
}

/** The least distance OrbitControls keeps the camera from what it turns round while zooming onto `pick`: ZOOM_NEAREST, or nearer for a figure that frames nearer. */
export function orbitNearest(pick: ZoomPick | undefined): number {
  return Math.min(ZOOM_NEAREST, pick?.nearest ?? ZOOM_NEAREST);
}

const thingIdOf = (object: THREE.Object3D | null): string | undefined => {
  while (object && object.userData.thingId === undefined) object = object.parent;
  return object?.userData.thingId as string | undefined;
};

/** What a click in a 3D view can land on: the things and people drawn, the walls with their doorways, and the floor hatches. */
export function pickables(scene: RoomScene): THREE.Object3D[] {
  return [
    ...Array.from(scene.things.values()).filter((thing) => thing.visible),
    ...Object.values(scene.walls),
    ...scene.exits.filter((exit) => exit.parent === scene.root),
  ];
}

/** What a click on `object` means. */
export type ScenePick =
  | { kind: "fitting"; lifetime: string }
  | { kind: "inspect"; id: string; lifetime: string; role: string }
  | { kind: "exit"; name: string }
  | { kind: "thing"; id: string };

/**
 * A fitted drawer's face is its drawer, an authored part is that part, a doorway is its exit;
 * anything else drawn for a thing or person is that thing or person. A wall or nothing is nothing.
 */
export function scenePick(object: THREE.Object3D | null | undefined): ScenePick | undefined {
  if (!object) return undefined;
  if (object.userData.fitting) return { kind: "fitting", lifetime: object.userData.fitting };
  if (object.userData.inspect) {
    const [id, lifetime, role] = object.userData.inspect as [string, string, string];
    return { kind: "inspect", id, lifetime, role };
  }
  if (object.userData.exit) return { kind: "exit", name: object.userData.exit };
  const id = thingIdOf(object);
  return id === undefined ? undefined : { kind: "thing", id };
}

export const SELECTION_COLOUR = 0xffffff;

/**
 * The mark round the selected thing or person: the edges of its box, a little outside it, as dashed
 * lines, with a small block at each corner. The dashes and corner blocks mark it by shape, not by
 * colour alone. It is drawn over everything, so nothing in front hides it, and it belongs to no
 * thing's group, so no click lands on it. Free it with `disposeSelectionOutline`.
 */
export function selectionOutline(bounds: Bounds): THREE.Group {
  const size = new THREE.Vector3(bounds.x1 - bounds.x0, bounds.y1 - bounds.y0, bounds.z1 - bounds.z0);
  const gap = Math.min(0.08, Math.max(0.03, Math.max(size.x, size.y, size.z) * 0.04));
  size.addScalar(gap * 2);
  const group = new THREE.Group();
  group.name = "selection";
  group.position.set((bounds.x0 + bounds.x1) / 2, (bounds.y0 + bounds.y1) / 2, (bounds.z0 + bounds.z1) / 2);
  const box = new THREE.BoxGeometry(size.x, size.y, size.z);
  const edges = new THREE.EdgesGeometry(box);
  box.dispose();
  const lines = new THREE.LineSegments(edges, new THREE.LineDashedMaterial({
    color: SELECTION_COLOUR, dashSize: gap * 1.6, gapSize: gap, depthTest: false, transparent: true,
  }));
  lines.computeLineDistances();
  lines.renderOrder = 1000;
  group.add(lines);
  const corner = new THREE.BoxGeometry(gap, gap, gap);
  const solid = new THREE.MeshBasicMaterial({ color: SELECTION_COLOUR, depthTest: false, transparent: true });
  for (const x of [-0.5, 0.5]) for (const y of [-0.5, 0.5]) for (const z of [-0.5, 0.5]) {
    const block = new THREE.Mesh(corner, solid);
    block.position.set(x * size.x, y * size.y, z * size.z);
    block.renderOrder = 1000;
    group.add(block);
  }
  group.updateMatrixWorld(true);
  return group;
}

export function disposeSelectionOutline(outline: THREE.Group): void {
  outline.removeFromParent();
  const freed = new Set<{ dispose: () => void }>();
  outline.traverse((object) => {
    if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
      freed.add(object.geometry);
      freed.add(object.material as THREE.Material);
    }
  });
  for (const resource of freed) resource.dispose();
}

/** How far (x, y) is from `box`, pixels: 0 inside it. */
const offBox = (at: { x: number; y: number }, box: Box) => Math.hypot(Math.max(box.x0 - at.x, 0, at.x - box.x1), Math.max(box.y0 - at.y, 0, at.y - box.y1));

/**
 * What a dollhouse wheel zoom or pinch at (x, y), pixels from the top left of a `width` x
 * `height` picture, heads for. A person's face when one of the people's `labels` as drawn
 * (screen boxes, each with its person's id) is within PICK_TOLERANCE of the pointer (the
 * nearest label), else when a visible person is drawn within PICK_TOLERANCE of it (the
 * nearest one), else the first thing or wall under the pointer, else the room's floor;
 * undefined when there is none of them (pointing over the walls or through a doorway into
 * the dark), so a zoom never heads for a point outside the room.
 * `nearest` keeps the camera outside the person (their box and PERSON_CLEARANCE) and at least ZOOM_NEAREST away. An
 * animal form is picked by its figure as drawn and heads for its middle, from far enough to frame all of it (`personFocus`).
 */
export function wheelZoomPoint(
  camera: THREE.Camera,
  at: { x: number; y: number },
  size: { width: number; height: number },
  scene: RoomScene,
  placed: PlacedThing[],
  layout: RoomLayout,
  labels: Array<Box & { id: string }> = [],
): ZoomPick | undefined {
  const caster = new THREE.Raycaster();
  caster.setFromCamera(new THREE.Vector2((at.x / size.width) * 2 - 1, -(at.y / size.height) * 2 + 1), camera);
  const things = [...scene.things.values()].filter((group) => group.visible);
  const eye = camera.getWorldPosition(new THREE.Vector3());

  // People near the pointer: first those whose label it is on or near (nearest label first), then those drawn
  // near it (nearest first, then nearest the camera); each only if nothing hides their face.
  const fov = camera instanceof THREE.PerspectiveCamera ? camera.fov : DOLLHOUSE_FOV;
  const near: Array<{ person: PlacedThing; focus: PersonFocus; byLabel: boolean; off: number; depth: number }> = [];
  for (const person of placed) {
    if (scene.things.get(person.thing.id)?.userData.form !== "person" || !scene.things.get(person.thing.id)?.visible) continue;
    const focus = personFocus(scene, person, layout, fov);
    const depth = eye.distanceTo(focus.point);
    const label = labels.find((l) => l.id === person.thing.id);
    const labelOff = label ? offBox(at, label) : Number.POSITIVE_INFINITY;
    if (labelOff <= PICK_TOLERANCE) {
      near.push({ person, focus, byLabel: true, off: labelOff, depth });
      continue;
    }
    const box = screenBox(focus.box, camera, size.width, size.height);
    if (!box) continue;
    const off = offBox(at, box);
    if (off <= PICK_TOLERANCE) near.push({ person, focus, byLabel: false, off, depth });
  }
  near.sort((p, q) => Number(q.byLabel) - Number(p.byLabel) || p.off - q.off || p.depth - q.depth);
  for (const { person, focus, depth } of near) {
    const face = focus.point;
    const sight = new THREE.Raycaster(eye, face.clone().sub(eye).normalize(), 0, depth);
    const first = sight.intersectObjects(things, true)[0];
    if (first && thingIdOf(first.object) !== person.thing.id) continue;
    // An animal's frame already keeps the camera outside all of it (its Room.Layout box is not what is drawn), and a
    // small one may come nearer than ZOOM_NEAREST, faster per notch, so a song bird ends as large as a duck does.
    const nearest = focus.frame > 0 ? focus.frame : Math.max(ZOOM_NEAREST, outOfBox(face, eye, person.bounds, PERSON_CLEARANCE));
    return { point: face, nearest, pace: wheelPace(nearest, layout, fov) };
  }

  // The walls as drawn (cut low or full height) stop the ray, so it never reaches a point beyond them.
  const hit = caster.intersectObjects([...things, ...Object.values(scene.walls)], true)[0];
  if (hit) return { point: hit.point.clone(), nearest: ZOOM_NEAREST, pace: 1 };
  const floor = caster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), new THREE.Vector3());
  const [w, d] = layout.size;
  return floor && Math.abs(floor.x) <= w / 2 && Math.abs(floor.y) <= d / 2 ? { point: floor, nearest: ZOOM_NEAREST, pace: 1 } : undefined;
}

/** How far from `point`, inside box `b` grown by `clearance`, the line toward `toward` leaves it. */
function outOfBox(point: THREE.Vector3, toward: THREE.Vector3, b: Bounds, clearance: number): number {
  const grown = new THREE.Box3(new THREE.Vector3(b.x0 - clearance, b.y0 - clearance, b.z0), new THREE.Vector3(b.x1 + clearance, b.y1 + clearance, b.z1 + clearance));
  const direction = toward.clone().sub(point).normalize();
  // From far along the line back toward the point, the first crossing of the grown box is where the line leaves it.
  const far = point.clone().addScaledVector(direction, 1000);
  const entry = new THREE.Ray(far, direction.clone().negate()).intersectBox(grown, new THREE.Vector3());
  return entry ? point.distanceTo(entry) : 0;
}

/**
 * Two fingers on the dollhouse, from their pointer events. Each move while
 * exactly two are down gives the zoom scale for `wheelZoom` (the fingers'
 * spacing before over after: spreading them comes closer) and the midpoint
 * where the pinch began, which is what it zooms onto.
 */
export class Pinch {
  private fingers = new Map<number, { x: number; y: number }>();
  private start: { x: number; y: number } | null = null;

  down(id: number, x: number, y: number): void {
    this.fingers.set(id, { x, y });
    this.start = this.fingers.size === 2 ? this.midpoint() : null;
  }

  move(id: number, x: number, y: number): { scale: number; at: { x: number; y: number } } | undefined {
    if (!this.fingers.has(id)) return undefined;
    const before = this.spacing();
    this.fingers.set(id, { x, y });
    const after = this.spacing();
    if (this.fingers.size !== 2 || !this.start || before === 0 || after === 0 || before === after) return undefined;
    return { scale: before / after, at: this.start };
  }

  up(id: number): void {
    this.fingers.delete(id);
    this.start = null;
  }

  /** Whether a pinch began with this pair of fingers and both are still down. */
  get pinching(): boolean {
    return this.start !== null;
  }

  private spacing(): number {
    const [a, b] = [...this.fingers.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  }

  private midpoint(): { x: number; y: number } {
    const [a, b] = [...this.fingers.values()];
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }
}

/**
 * One dollhouse zoom, a wheel notch's or a pinch step's, by `scale` (below 1 comes closer). Zooming in moves the
 * camera toward `point` and the point it orbits onto `point` a little faster, so what
 * was zoomed onto comes to the middle of the picture and the arrow keys then turn
 * around it. Zooming out backs away from the point it orbits. Zooming in never brings the
 * camera nearer `point` than `nearest` (a `ZoomPick`'s), so it stays outside what it zooms onto. `pace` (a
 * `ZoomPick`'s) raises the scale to that power both ways, so zooming back out by as many notches returns as far.
 */
export function wheelZoom(camera: THREE.Vector3, target: THREE.Vector3, point: THREE.Vector3, step: number, nearest = 0, pace = 1): void {
  const scale = step ** pace;
  if (scale < 1) {
    const distance = camera.distanceTo(point);
    const toward = distance > nearest ? Math.max(scale, nearest / distance) : 1;
    camera.sub(point).multiplyScalar(toward).add(point);
    target.sub(point).multiplyScalar(scale * scale).add(point);
  } else {
    camera.sub(target).multiplyScalar(scale).add(target);
  }
}

/** Your eyes' field of view after a zoom key (`+`/`=` in, `-`/`_` out, `0` back), or undefined for any other key. */
export function zoomedFov(fov: number, key: string): number | undefined {
  if (key === "+" || key === "=") return zoomedFovBy(fov, 1);
  if (key === "-" || key === "_") return zoomedFovBy(fov, -1);
  if (key === "0") return EYES_FOV;
  return undefined;
}

/** Your eyes' field of view after `steps` zoom steps (in when positive; a wheel's notches, fractions too), within limits. */
export function zoomedFovBy(fov: number, steps: number): number {
  return Math.min(EYES_FOV, Math.max(EYES_MIN_FOV, fov * ZOOM_STEP ** steps));
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
