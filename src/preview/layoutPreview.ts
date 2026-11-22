import * as THREE from "three";
import { drawableLayout, formPartsProblem } from "../gmcp/Room";
import { placeThings } from "../map/roomLayout";
import { roomRenderer } from "../map/roomRenderer";
import { buildRoomScene, disposeRoomScene, type RoomScene } from "../map/roomScene";
import { PREVIEW_VIEWS, previewLayout } from "./previewInput";

/**
 * The page `scripts/preview-layout.mjs` drives: draws a Room.Layout (or one thing's form parts) with the client's own
 * scene code and lights, walls and ceiling left out, and turns the camera to each fixed view. Not part of the app:
 * nothing imports it, so the production bundle never holds it. See docs/room-layout.md, "Previewing forms".
 */

const WIDTH = 960;
const HEIGHT = 720;
const FOV = 35;

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
      load: (input: unknown) => { things: Array<{ id: string; name: string; parts: number; problem?: string }> };
      view: (name: string) => void;
    };
  }
}

window.preview = {
  /**
   * Draws `input` (see `previewLayout`); says, per thing, how many parts were sent and, when the client would not draw
   * them, the decoder's reason (`formPartsProblem`: the first part it rejects, and why).
   */
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
      things: sent.things.map((thing) => ({
        id: thing.id,
        name: thing.name,
        parts: Array.isArray(thing.form_parts) ? thing.form_parts.length : 0,
        ...(thing.form_parts === undefined ? {} : { problem: formPartsProblem(thing.form_parts) }),
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
