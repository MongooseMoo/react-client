import type React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { webAudioToMongooseVector } from "../audio/mongooseCoordinates";
import type { LayoutVector, RoomLayout } from "../gmcp/Room";
import {
  type Box,
  displayName,
  isPerson,
  type LabelOver,
  labelOrder,
  type PlacedThing,
  placeLabelsOver,
  shortLabel,
} from "../map/roomLayout";
import {
  FigureCache,
  buildRoomScene,
  type CameraMode,
  type CameraPose,
  cutWalls,
  DOLLHOUSE_FOV,
  disposeRoomScene,
  dollhouseMaxDistance,
  dollhousePose,
  EYES_FOV,
  panTo,
  zoomFocus,
  eyesPose,
  Pinch,
  type RoomScene,
  screenBox,
  screenTop,
  wheelNotches,
  wheelStep,
  wheelZoom,
  wheelZoomPoint,
  ZOOM_NEAREST,
  type ZoomPick,
  ZOOM_STEP,
  zoomedFov,
  zoomedFovBy,
} from "../map/roomScene";
import type { LayoutArrival } from "../stores/roomStore";
import { useSpatialStore } from "../stores/spatialStore";

/**
 * The Room.Layout room in 3D: Dollhouse (orbit around it) or Your eyes (from
 * where you stand, facing where you face, turning as you turn). Loaded only
 * when one of those views is chosen, so three.js stays out of startup. It is
 * one image to a screen reader; RoomLayoutView's lists say the room in words.
 */

interface RoomLayout3DProps {
  layout: RoomLayout;
  placed: PlacedThing[];
  arrivals: Array<{ arrival: LayoutArrival; at: LayoutVector }>;
  youId: string;
  /** Each person's Client.Spatial forward in the MOO frame, by id. */
  facings: Record<string, LayoutVector | undefined>;
  label: string;
  mode: CameraMode;
  onExit: (name: string) => void;
}

/** Space between a label and the top of what it names, CSS pixels. */
const LABEL_GAP = 3;

/**
 * A label's size as drawn, CSS pixels: its text's width in its own computed font (the
 * label has no padding), and its line height. Kept by class and text, which fix it.
 */
function labelSize(element: HTMLElement, sizes: Map<string, { width: number; height: number }>): { width: number; height: number } {
  const key = `${element.className}\n${element.textContent}`;
  let size = sizes.get(key);
  if (!size) {
    const style = getComputedStyle(element);
    const fontSize = Number.parseFloat(style.fontSize);
    const context = document.createElement("canvas").getContext("2d");
    if (!context || !(fontSize > 0)) return { width: 0, height: 0 };
    context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const lineHeight = Number.parseFloat(style.lineHeight);
    size = { width: context.measureText(element.textContent ?? "").width, height: lineHeight > 0 ? lineHeight : fontSize * 1.2 };
    sizes.set(key, size);
  }
  return size;
}

interface Stage {
  renderer: THREE.WebGLRenderer;
  labels: CSS2DRenderer;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  scene: THREE.Scene;
  room: RoomScene | null;
  /** People's figure geometries, reused while their look is unchanged. */
  figures: FigureCache;
  labelObjects: Map<string, CSS2DObject>;
  /** Labels' drawn sizes (`labelSize`). */
  labelSizes: Map<string, { width: number; height: number }>;
  /** People's labels as last shown, screen boxes in CSS pixels from the picture's top left: the wheel picks a person by their label. */
  personLabels: Array<Box & { id: string }>;
  render: () => void;
}

function webglAvailable(): boolean {
  const probe = document.createElement("canvas");
  return Boolean(probe.getContext("webgl2") ?? probe.getContext("webgl"));
}

function applyPose(stage: Stage, pose: CameraPose) {
  stage.camera.position.set(...pose.position);
  stage.controls.target.set(...pose.target);
  stage.camera.lookAt(stage.controls.target);
}

const RoomLayout3D: React.FC<RoomLayout3DProps> = ({ layout, placed, arrivals, youId, facings, label, mode, onExit }) => {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Stage | null>(null);
  const modeRef = useRef(mode);
  const onExitRef = useRef(onExit);
  onExitRef.current = onExit;
  const [supported] = useState(webglAvailable);
  const listenerPosition = useSpatialStore((state) => state.listenerPosition);
  const listenerForward = useSpatialStore((state) => state.listenerOrientation.forward);
  // What labels to place and in what order, read by every render.
  const labelPlan = useRef<Array<{ id: string; text: string; person: boolean }>>([]);

  // The renderer, camera, controls and label layer live as long as the component.
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame || !supported) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x14141a);
    renderer.domElement.setAttribute("aria-hidden", "true");
    frame.appendChild(renderer.domElement);
    const labels = new CSS2DRenderer();
    labels.domElement.className = "room-layout-3d-labels";
    labels.domElement.setAttribute("aria-hidden", "true");
    frame.appendChild(labels.domElement);

    const camera = new THREE.PerspectiveCamera(DOLLHOUSE_FOV, 4 / 3, 0.05, 200);
    camera.up.set(0, 0, 1);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = ZOOM_NEAREST;
    // The controls turn the view (drag, one finger) and nothing else: the wheel never reaches them
    // (`onWheel` below takes it), and two fingers are left to `onTouchPointer`, which zooms the same way.
    controls.touches.TWO = null;
    const scene = new THREE.Scene();

    const stage: Stage = {
      renderer,
      labels,
      camera,
      controls,
      scene,
      room: null,
      figures: new FigureCache(),
      labelObjects: new Map(),
      labelSizes: new Map(),
      personLabels: [],
      render: () => {
        if (stage.room) cutWalls(stage.room, layoutRef.current, camera.position, modeRef.current);
        renderer.render(scene, camera);
        placeVisibleLabels(stage);
        labels.render(scene, camera);
      },
    };
    stageRef.current = stage;
    controls.addEventListener("change", stage.render);

    const resize = () => {
      const width = frame.clientWidth;
      const height = frame.clientHeight;
      if (width === 0 || height === 0) return;
      renderer.setSize(width, height, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      labels.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      stage.render();
    };
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
    observer?.observe(frame);
    resize();
    // Taken on the way down to the canvas, so the orbit controls' own wheel zoom never runs.
    const wheel = (event: WheelEvent) => onWheelRef.current(event);
    frame.addEventListener("wheel", wheel, { capture: true, passive: false });

    return () => {
      frame.removeEventListener("wheel", wheel, { capture: true });
      observer?.disconnect();
      controls.removeEventListener("change", stage.render);
      controls.dispose();
      if (stage.room) disposeRoomScene(stage.room);
      stage.figures.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      labels.domElement.remove();
      stageRef.current = null;
    };
  }, [supported]);

  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  /** Shows the labels that fit, most important first, each just above its head or thing; hides the rest. */
  function placeVisibleLabels(stage: Stage) {
    const width = stage.labels.domElement.clientWidth || stage.renderer.domElement.clientWidth;
    const height = stage.labels.domElement.clientHeight || stage.renderer.domElement.clientHeight;
    const requests: LabelOver[] = [];
    const anchors = new Map<string, [number, number]>();
    const projected = new THREE.Vector3();
    for (const { id, text } of labelPlan.current) {
      const points = stage.room?.labelPoints.get(id);
      const object = stage.labelObjects.get(id);
      if (!points || !object) continue;
      object.visible = false;
      if (!object.parent?.visible) continue;
      const shown = screenTop(points, stage.camera, width, height);
      if (!shown) continue;
      // Where CSS2DRenderer puts the label before it is moved: its object's point.
      projected.copy(object.position).project(stage.camera);
      anchors.set(id, [((projected.x + 1) / 2) * width, ((1 - projected.y) / 2) * height]);
      const size = labelSize(object.element, stage.labelSizes);
      if (size.width === 0) continue;
      // Centred over the head (or thing), its bottom edge LABEL_GAP pixels above the head's top as drawn: clear of hair and face at any zoom.
      requests.push({ id, text, x: shown.x, top: shown.top, ...size });
    }
    // Every head drawn in the picture is kept clear of labels (you are not drawn in your own eyes).
    const heads: Array<Box & { id: string }> = [];
    for (const [id, corners] of stage.room?.heads ?? []) {
      if (!stage.room?.things.get(id)?.visible) continue;
      const box = screenBox(corners, stage.camera, width, height);
      if (box) heads.push({ id, ...box });
    }
    const inset = 4;
    const placedLabels = placeLabelsOver(requests, LABEL_GAP, { x0: inset, x1: width - inset, y0: inset, y1: height - inset }, heads);
    const people = new Set(labelPlan.current.filter((p) => p.person).map((p) => p.id));
    stage.personLabels = [];
    for (const placedLabel of placedLabels) {
      const object = stage.labelObjects.get(placedLabel.id);
      const anchor = anchors.get(placedLabel.id);
      if (!object || !anchor) continue;
      object.visible = true;
      object.element.style.translate = `${placedLabel.x - anchor[0]}px ${placedLabel.y - anchor[1]}px`;
      const size = requests.find((r) => r.id === placedLabel.id);
      if (size && people.has(placedLabel.id)) {
        stage.personLabels.push({
          id: placedLabel.id,
          x0: placedLabel.x - size.width / 2,
          x1: placedLabel.x + size.width / 2,
          y0: placedLabel.y - size.height / 2,
          y1: placedLabel.y + size.height / 2,
        });
      }
    }
  }

  // The room itself: rebuilt when the layout, the things' places or the arrivals change.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const previous = stage.room;
    if (previous) stage.scene.remove(previous.root);
    for (const object of stage.labelObjects.values()) object.removeFromParent();
    stage.labelObjects.clear();

    const room = buildRoomScene({ layout, placed, arrivals, youId, facings, figures: stage.figures });
    stage.room = room;
    stage.scene.add(room.root);
    // In your own eyes you are not drawn.
    const you = room.things.get(youId);
    if (you) you.visible = mode !== "eyes";

    const ordered = labelOrder(placed, youId);
    const plan = [
      ...ordered.filter((p) => isPerson(p.thing)).map((p) => ({ id: p.thing.id, text: displayName(p.thing, youId), person: true })),
      ...arrivals.map(({ arrival }) => ({ id: arrival.id, text: displayName(arrival, youId), person: isPerson(arrival) })),
      ...ordered.filter((p) => !isPerson(p.thing)).map((p) => ({ id: p.thing.id, text: displayName(p.thing, youId), person: false })),
    ];
    labelPlan.current = plan;
    for (const { id, text, person } of plan) {
      const points = room.labelPoints.get(id);
      const group = room.things.get(id);
      if (!points || !group) continue;
      const element = document.createElement("div");
      element.className = id === youId ? "rl3d-label rl3d-label-you" : person ? "rl3d-label rl3d-label-person" : "rl3d-label";
      element.textContent = shortLabel(text);
      // In the label layer from the start, so its drawn size can be read before it is first shown.
      element.style.display = "none";
      stage.labels.domElement.appendChild(element);
      const object = new CSS2DObject(element);
      object.position.copy(points[0]);
      object.visible = false;
      group.add(object);
      stage.labelObjects.set(id, object);
    }
    stage.render();
    // Free the previous room only once the new one is drawn. three.js shares a
    // compiled shader between materials alike and deletes it when the last one is
    // disposed; disposing first made it recompile every shader on every rebuild,
    // which is every frame while anyone moves.
    if (previous) disposeRoomScene(previous);
  }, [layout, placed, arrivals, youId, facings, mode]);

  // A new room or a new view starts the dollhouse at its whole-room view.
  const youBounds = placed.find((p) => p.thing.id === youId)?.bounds;
  useEffect(() => {
    const stage = stageRef.current;
    modeRef.current = mode;
    if (!stage) return;
    stage.controls.enabled = mode === "dollhouse";
    stage.camera.fov = mode === "eyes" ? EYES_FOV : DOLLHOUSE_FOV;
    stage.camera.updateProjectionMatrix();
    wheelFocus.current = null;
    if (mode === "dollhouse") {
      // Far enough out for this room's whole-room view, however large the room.
      stage.controls.maxDistance = dollhouseMaxDistance(layout);
      applyPose(stage, dollhousePose(layout));
      stage.controls.update();
      stage.render();
    }
  }, [mode, layout.num]);

  // Your eyes follow your Client.Spatial position and facing.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || mode !== "eyes") return;
    const position = listenerPosition ? webAudioToMongooseVector(listenerPosition) : null;
    const forward = listenerForward ? webAudioToMongooseVector(listenerForward) : null;
    applyPose(stage, eyesPose(layout, position, forward, youBounds));
    stage.render();
  }, [mode, layout, listenerPosition, listenerForward, youBounds?.x0, youBounds?.y0, youBounds?.z1]);

  // A doorway click sends its exit, unless the pointer was turning the view.
  const down = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    onTouchPointer(event);
    down.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    onTouchPointer(event);
    const start = down.current;
    down.current = null;
    const stage = stageRef.current;
    if (!stage?.room || !start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 4) return;
    const rect = stage.renderer.domElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const pointer = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    const ray = new THREE.Raycaster();
    ray.setFromCamera(pointer, stage.camera);
    const hit = ray.intersectObjects(stage.room.exits, false)[0];
    if (hit) onExitRef.current(hit.object.userData.exit as string);
  };

  /** Your eyes zoom by narrowing the field of view, as binoculars would; they stay where you stand. */
  const zoomEyes = (key: string): boolean => {
    const stage = stageRef.current;
    const fov = stage ? zoomedFov(stage.camera.fov, key) : undefined;
    if (!stage || fov === undefined) return false;
    stage.camera.fov = fov;
    stage.camera.updateProjectionMatrix();
    stage.render();
    return true;
  };

  // What the dollhouse wheel is zooming onto, kept while the pointer stays where it was.
  const wheelFocus = useRef<{ x: number; y: number; pick: ZoomPick | undefined } | null>(null);
  const onWheel = (event: WheelEvent) => {
    const stage = stageRef.current;
    if (!stage) return;
    event.preventDefault();
    event.stopPropagation();
    // deltaMode first: Firefox then reports a mouse wheel in lines, not in pixels of the page's font.
    const deltaMode = event.deltaMode;
    const deltaY = event.deltaY;
    if (deltaY === 0) return;
    const notches = wheelNotches(deltaY, deltaMode) * (deltaY < 0 ? 1 : -1);
    if (mode === "eyes") {
      stage.camera.fov = zoomedFovBy(stage.camera.fov, notches);
      stage.camera.updateProjectionMatrix();
      stage.render();
      return;
    }
    zoomOnto(stage, event.clientX, event.clientY, wheelStep(layout) ** notches);
  };
  const onWheelRef = useRef(onWheel);
  onWheelRef.current = onWheel;

  /**
   * One dollhouse zoom by `scale` onto what is at (clientX, clientY) (`wheelZoomPoint`: a person
   * whose shown label is within PICK_TOLERANCE first, then a person drawn within it): picked there the first time, and kept while the wheel
   * or pinch stays within 4 px of it. The camera stops short of it, outside what it zooms onto.
   */
  const zoomOnto = (stage: Stage, clientX: number, clientY: number, scale: number) => {
    const focus = wheelFocus.current;
    if (!focus || Math.hypot(clientX - focus.x, clientY - focus.y) > 4) {
      const rect = stage.renderer.domElement.getBoundingClientRect();
      const pick = stage.room
        ? wheelZoomPoint(stage.camera, { x: clientX - rect.left, y: clientY - rect.top }, rect, stage.room, placed, layout, stage.personLabels)
        : undefined;
      wheelFocus.current = { x: clientX, y: clientY, pick };
    }
    const pick = wheelFocus.current?.pick;
    wheelZoom(stage.camera.position, stage.controls.target, pick?.point ?? stage.controls.target.clone(), scale, pick?.nearest ?? ZOOM_NEAREST);
    stage.controls.update();
    stage.render();
  };

  // Two fingers zoom like the wheel, onto what is under the point where the pinch began.
  const pinch = useRef(new Pinch());
  const onTouchPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage || event.pointerType !== "touch" || mode !== "dollhouse") return;
    if (event.type === "pointerdown") pinch.current.down(event.pointerId, event.clientX, event.clientY);
    else if (event.type === "pointerup" || event.type === "pointercancel") pinch.current.up(event.pointerId);
    else {
      const step = pinch.current.move(event.pointerId, event.clientX, event.clientY);
      if (step) zoomOnto(stage, step.at.x, step.at.y, step.scale);
    }
  };

  /** Slides the dollhouse view over to your figure, unturned, then moves the camera `scale` times as far from it. */
  const zoomToward = (stage: Stage, scale: number) => {
    wheelFocus.current = null;
    panTo(stage.camera, stage.controls.target, zoomFocus(youBounds, layout));
    stage.controls.dollyIn(scale);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage || event.altKey || event.ctrlKey || event.metaKey) return;
    if (mode === "eyes") {
      if (zoomEyes(event.key)) event.preventDefault();
      return;
    }
    const turn = Math.PI / 18;
    // OrbitControls multiplies the camera's distance by the scale it is given: below 1 comes closer.
    const actions: Record<string, () => void> = {
      ArrowLeft: () => stage.controls.rotateLeft(-turn),
      ArrowRight: () => stage.controls.rotateLeft(turn),
      ArrowUp: () => stage.controls.rotateUp(turn / 2),
      ArrowDown: () => stage.controls.rotateUp(-turn / 2),
      // Zoom heads for your own figure (nothing else can be chosen from the keyboard here).
      "+": () => zoomToward(stage, ZOOM_STEP),
      "=": () => zoomToward(stage, ZOOM_STEP),
      "-": () => zoomToward(stage, 1 / ZOOM_STEP),
      _: () => zoomToward(stage, 1 / ZOOM_STEP),
      "0": () => {
        wheelFocus.current = null;
        applyPose(stage, dollhousePose(layout));
        stage.controls.update();
      },
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
    stage.render();
  };

  if (!supported) {
    return <p role="status">This browser cannot draw 3D (it offers no WebGL). The Plan view and the lists below show the room.</p>;
  }

  return (
    <div
      ref={frameRef}
      className="room-layout-3d"
      role="img"
      aria-label={label}
      tabIndex={0}
      data-mode={mode}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onTouchPointer}
      onPointerCancel={onTouchPointer}
      onKeyDown={onKeyDown}
    />
  );
};

export default RoomLayout3D;
