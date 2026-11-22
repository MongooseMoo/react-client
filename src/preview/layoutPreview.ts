import * as THREE from "three";
import { drawableLayout, type LayoutThing, type LayoutVector, type RoomLayout } from "../gmcp/Room";
import { placeThings } from "../map/roomLayout";
import { roomRenderer } from "../map/roomRenderer";
import { buildRoomScene, disposeRoomScene, type RoomScene } from "../map/roomScene";

/**
 * The page `scripts/preview-layout.mjs` drives: draws a Room.Layout (or one thing's form parts) with the client's own
 * scene code and lights, walls and ceiling left out, and turns the camera to each fixed view. Not part of the app:
 * nothing imports it, so the production bundle never holds it. See docs/room-layout.md, "Previewing forms".
 */

/** Where each view looks from, as a direction from the things' middle (x east, y north, z up). */
export const PREVIEW_VIEWS: Readonly<Record<string, LayoutVector>> = {
  front: [0, -1, 0.3],
  "three-quarter": [0.8, -1, 0.7],
  side: [1, 0, 0.3],
  back: [0, 1, 0.3],
  top: [0, 0, 1],
};

const WIDTH = 960;
const HEIGHT = 720;
const FOV = 35;

const record = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const box = (value: unknown): value is LayoutVector => Array.isArray(value) && value.length === 3 && value.every((n) => typeof n === "number" && n > 0);

/**
 * A Room.Layout to draw: `input` itself when it is one (it has `things`), else one thing made from
 * `{"size": [w, d, h], "form_parts": [...], "name"?, "material"?}` standing on the floor in the middle of a room
 * three times its width.
 */
export function previewLayout(input: unknown): RoomLayout {
  if (record(input) && Array.isArray(input.things) && box(input.size)) return input as unknown as RoomLayout;
  if (!record(input) || !box(input.size) || !Array.isArray(input.form_parts)) {
    throw new Error('Give a Room.Layout (with "size" and "things") or one thing\'s {"size": [w, d, h], "form_parts": [...]}.');
  }
  const [w, d, h] = input.size;
  const thing: LayoutThing = {
    id: "#1",
    name: typeof input.name === "string" ? input.name : "preview",
    kind: "object",
    fixed: true,
    mounted: false,
    lifetime: "preview",
    shapes: [{ box: [[-w / 2, w / 2], [-d / 2, d / 2], [0, h]] }],
    pose: { centre_m: [0, 0, h / 2], dimensions_m: [w, d, h], body_quaternion: [1, 0, 0, 0], box: true },
    form_parts: input.form_parts as LayoutThing["form_parts"],
    ...(Array.isArray(input.material) ? { material: input.material as LayoutThing["material"] } : {}),
  };
  const across = Math.max(3, 3 * Math.max(w, d));
  return { num: 0, size: [across, across, Math.max(2.5, h * 1.5)], exits: [], things: [thing] };
}

const { renderer, environment } = roomRenderer();
renderer.setPixelRatio(1);
renderer.setSize(WIDTH, HEIGHT);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(FOV, WIDTH / HEIGHT, 0.01, 100);
let room: RoomScene | undefined;

declare global {
  interface Window {
    preview?: {
      load: (input: unknown) => { things: Array<{ id: string; name: string; parts: number; drawn: boolean }> };
      view: (name: string) => void;
    };
  }
}

window.preview = {
  /** Draws `input` (see `previewLayout`); says, per thing, how many parts were sent and whether they are drawn. */
  load(input) {
    const sent = previewLayout(input);
    const layout = drawableLayout(sent);
    if (room) {
      scene.remove(room.root);
      disposeRoomScene(room);
    }
    room = buildRoomScene({ layout, placed: placeThings(layout), youId: "", environment });
    // The things, not the room: its walls and ceiling would stand between the camera and them.
    for (const wall of Object.values(room.walls)) wall.visible = false;
    room.ceiling.visible = false;
    scene.add(room.root);
    renderer.shadowMap.needsUpdate = true;
    return {
      things: sent.things.map((thing, i) => ({
        id: thing.id,
        name: thing.name,
        parts: thing.form_parts?.length ?? 0,
        drawn: thing.form_parts === undefined || layout.things[i].form_parts !== undefined,
      })),
    };
  },
  /** Frames everything drawn from the named view (PREVIEW_VIEWS) and draws it. */
  view(name) {
    const from = PREVIEW_VIEWS[name];
    if (!from || !room) throw new Error(`No view ${name}, or nothing loaded.`);
    const drawn = new THREE.Box3();
    for (const group of room.things.values()) drawn.expandByObject(group);
    const sphere = drawn.getBoundingSphere(new THREE.Sphere());
    const distance = (sphere.radius / Math.sin(((FOV / 2) * Math.PI) / 180)) * 1.1;
    const direction = new THREE.Vector3(...from).normalize();
    camera.position.copy(sphere.center).addScaledVector(direction, distance);
    // Seen from above, north is up the picture; from any other side, up is up.
    camera.up.set(0, name === "top" ? 1 : 0, name === "top" ? 0 : 1);
    camera.near = Math.max(0.005, distance / 100);
    camera.far = distance * 10;
    camera.updateProjectionMatrix();
    camera.lookAt(sphere.center);
    renderer.render(scene, camera);
  },
};
