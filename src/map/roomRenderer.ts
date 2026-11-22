import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * The renderer every 3D room picture draws with (Dollhouse and Your eyes, and the layout preview), and the studio
 * room its surfaces mirror (`RoomSceneInput.environment`, made once in code, no downloaded picture). Free both with
 * `dispose`.
 */
export function roomRenderer(): { renderer: THREE.WebGLRenderer; environment: THREE.Texture; dispose: () => void } {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x14141a);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // Neutral keeps the game's colours as sent in ordinary light and rolls off highlights instead of clipping them.
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  // Shadows depend on the room, not the camera: redrawn only when something in it is built, moves or is hidden
  // (the caller sets `shadowMap.needsUpdate`), not on every turn of the view.
  renderer.shadowMap.autoUpdate = false;
  // Given to each scene's materials (`buildRoomScene`), not set as `scene.environment`, which would override each
  // surface's own strength.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const studio = new RoomEnvironment();
  const environment = pmrem.fromScene(studio, 0.04).texture;
  studio.dispose();
  pmrem.dispose();
  return {
    renderer,
    environment,
    dispose: () => {
      environment.dispose();
      renderer.dispose();
    },
  };
}
