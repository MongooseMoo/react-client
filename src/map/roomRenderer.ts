import * as THREE from "three";

/**
 * The renderer every 3D room picture draws with (Dollhouse and Your eyes, and the layout preview). Light is in
 * physical units (`lightUnits.ts`): a pixel is luminance in cd/m^2 before the room's exposure, which the caller sets
 * from the scene (`RoomScene.exposure`). Free it with `dispose`.
 */
export function roomRenderer(): { renderer: THREE.WebGLRenderer; dispose: () => void } {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  // Outside the room is nothing: black at any exposure.
  renderer.setClearColor(0x000000);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // AgX takes about 16 stops round middle grey and turns very bright light toward white, so a lamp's bulb or the sun
  // stays its colour's white rather than a hue (three r187's ACES fit bends bright colours' hue; Neutral is made for
  // ordinary light, not a range from moonlight to sun).
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  // Shadows depend on the room, not the camera: redrawn only when something in it is built, moves or is hidden
  // (the caller sets `shadowMap.needsUpdate`), not on every turn of the view.
  renderer.shadowMap.autoUpdate = false;
  return { renderer, dispose: () => renderer.dispose() };
}
