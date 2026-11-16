/**
 * Tests only: draws the invented test characters for tests/visual/avatars/shoot.mjs.
 * `?view=portraits` portraits at the People list size and at 4x;
 * `?view=vocab` one portrait per game vocabulary value and beard length;
 * `?view=plan` plan tokens; `?view=figures&angle=front|three` 3D close-ups
 * (`angle=back` from behind; `&set=vocab`: every hair style, build and beard length instead of the test characters);
 * `?view=room&n=8` the real 3D view (Dollhouse), with `window.measure(seconds)`
 * moving one person every frame and reporting frame times.
 */
import { options, render } from "preact";
import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import "../../../src/tokens.css";
import "../../../src/index.css";
import "../../../src/components/MapPanel.css";
import { TEST_CHARACTERS, type TestCharacter } from "../../../src/avatar/characters.fixture";
import { figureParams } from "../../../src/avatar/figure";
import AvatarPortrait from "../../../src/avatar/portrait";
import { GAME_BEARD_LENGTHS, GAME_HAIR_LENGTHS, GAME_VOCABULARY, VOCABULARY_BASE, type VocabularyField, withValue } from "../../../src/avatar/vocabulary.fixture";
import PlayerCard from "../../../src/components/PlayerCard";
import RoomLayout3D from "../../../src/components/RoomLayout3D";
import RoomLayoutPicture from "../../../src/components/RoomLayoutPicture";
import type { LayoutAppearance, RoomLayout } from "../../../src/gmcp/Room";
import { placeThings } from "../../../src/map/roomLayout";
import { crowdLayout, livingRoomLayout, translateLayoutThing, withBodyFacings } from "../../../src/map/roomLayout.fixture";
import { buildRoomScene, cutWalls, DOLLHOUSE_FOV, dollhousePose } from "../../../src/map/roomScene";

const params = new URLSearchParams(location.search);
const view = params.get("view") ?? "portraits";

/** The game's vocabulary one value at a time on a plain person, plus beard lengths: rows of [caption, appearance]. */
const VOCAB_ROWS: Array<[string, Array<[string, Record<string, unknown>]>]> = [
  ...(Object.keys(GAME_VOCABULARY) as VocabularyField[]).map(
    (field) => [field, GAME_VOCABULARY[field].map((value) => [value, withValue(field, value)])] as [string, Array<[string, Record<string, unknown>]>],
  ),
  [
    // Bald, then each of the game's hair length bands at its lowest length.
    "hair.length_cm",
    [
      ["bald", { ...withValue("hair.texture", "straight"), hair: undefined }],
      ...GAME_HAIR_LENGTHS.map(([band, low]) => [`${band} ${low}`, { ...withValue("hair.texture", "straight"), hair: { ...VOCABULARY_BASE.hair, length_cm: low } }] as [string, Record<string, unknown>]),
    ],
  ],
  [
    // Every style on cropped hair: those the game needs longer hair for are drawn loose.
    "hair.style at 4 cm",
    GAME_VOCABULARY["hair.style"].map((style) => [style, { ...withValue("hair.style", style), hair: { ...(withValue("hair.style", style).hair as object), length_cm: 4 } }] as [string, Record<string, unknown>]),
  ],
  [
    "facial_hair.length_cm",
    [
      ["no length", withValue("facial_hair.kind", "beard")],
      ...GAME_BEARD_LENGTHS.map(([band, low]) => [`${band} ${low}`, withValue("facial_hair.length_cm", low)] as [string, Record<string, unknown>]),
    ],
  ],
];
/** `set=vocab` in the figures view: hair lengths, hair styles, then every build, then beard lengths. */
const VOCAB_CHARACTERS: TestCharacter[] = [
  ...(VOCAB_ROWS.find(([field]) => field === "hair.length_cm")?.[1] ?? []).map(([name, appearance]) => ({ name: `hair ${name}`, height: 1.75, appearance: appearance as LayoutAppearance })),
  ...GAME_VOCABULARY["hair.style"].map((style) => ({ name: `hair ${style}`, height: 1.75, appearance: withValue("hair.style", style) as LayoutAppearance })),
  ...GAME_VOCABULARY.build.map((build) => ({ name: `build ${build}`, height: 1.75, appearance: withValue("build", build) as LayoutAppearance })),
  ...(VOCAB_ROWS.at(-1)?.[1] ?? []).map(([name, appearance]) => ({ name: `beard ${name}`, height: 1.75, appearance: appearance as LayoutAppearance })),
];
/**
 * `set=face`: the faces, beards and hair the readability checks look at (shoot.mjs --face): the darkest and palest
 * palette skins with black, brown, blonde and white hair and beards, short beards and stubble on light and dark
 * skin, buns, textured hair in tied styles, and chin- and shoulder-length hair beside a very long beard.
 */
const SKIN = { deep: "#292420", veryDark: "#3a312a", tan: "#d7bd96", veryPale: "#f6ede4" };
const HAIR = { black: "#1b1612", brown: "#653700", blonde: "#e3c27a", white: "#eeeeea" };
const faceOf = (
  name: string,
  skin: string,
  hair: Record<string, unknown> | undefined,
  facial: Record<string, unknown> | undefined,
  extra: Record<string, unknown> = {},
): TestCharacter => ({
  name,
  height: 1.75,
  appearance: {
    build: "average",
    skin: { hex: skin },
    eyes: { hex: "#5b3a1e" },
    face: { shape: "square", nose: "average", lips: "average", brows: "average" },
    garments: [{ name: "a shirt", areas: ["torso", "arms"], layer: 1, colour: { hex: "#ceb301" } }],
    ...(hair ? { hair } : {}),
    ...(facial ? { facial_hair: facial } : {}),
    ...extra,
  } as LayoutAppearance,
});
const FACE_CHARACTERS: TestCharacter[] = [
  ...(["deep", "veryPale"] as const).flatMap((skin) =>
    (Object.keys(HAIR) as Array<keyof typeof HAIR>).map((hair) =>
      faceOf(`${skin} skin, ${hair} hair, full beard`, SKIN[skin], { length_cm: 3, texture: "coily", hex: HAIR[hair] }, { kind: "beard", length_cm: 8, hex: HAIR[hair] }),
    ),
  ),
  faceOf("very dark skin, black short beard", SKIN.veryDark, { length_cm: 1.5, texture: "coily", hex: HAIR.black }, { kind: "beard", length_cm: 2, hex: HAIR.black }),
  faceOf("tan skin, black short beard", SKIN.tan, { length_cm: 2.5, texture: "straight", style: "mohawk", hex: HAIR.black }, { kind: "beard", length_cm: 2, hex: HAIR.black }, { face: { shape: "angular", brows: "heavy" } }),
  faceOf("very pale skin, brown short beard", SKIN.veryPale, { length_cm: 9, texture: "straight", hex: HAIR.brown }, { kind: "beard", length_cm: 3, hex: HAIR.brown }),
  faceOf("deep skin, black stubble", SKIN.deep, { length_cm: 2.5, texture: "straight", hex: HAIR.black }, { kind: "stubble", hex: HAIR.black }),
  faceOf("very pale skin, black stubble", SKIN.veryPale, { length_cm: 2.5, texture: "straight", hex: HAIR.black }, { kind: "stubble", hex: HAIR.black }),
  faceOf("tan skin, brown stubble", SKIN.tan, { length_cm: 9, texture: "straight", hex: HAIR.brown }, { kind: "stubble", hex: HAIR.brown }),
  faceOf("deep skin, black coily bun", SKIN.deep, { length_cm: 50, texture: "coily", style: "bun", hex: HAIR.black }, undefined),
  faceOf("very pale skin, black bun", SKIN.veryPale, { length_cm: 50, texture: "straight", style: "bun", hex: HAIR.black }, undefined),
  faceOf("curly ponytail", SKIN.tan, { length_cm: 30, texture: "curly", style: "ponytail", hex: HAIR.black }, undefined),
  faceOf("wavy braids", SKIN.tan, { length_cm: 75, texture: "wavy", style: "braided", hex: HAIR.brown }, undefined),
  faceOf("curly loose", SKIN.veryPale, { length_cm: 30, texture: "curly", hex: HAIR.brown }, undefined),
  faceOf("coily loose", SKIN.deep, { length_cm: 50, texture: "coily", hex: HAIR.black }, undefined),
  faceOf("chin-length, very long beard", SKIN.tan, { length_cm: 18, texture: "straight", hex: HAIR.black }, { kind: "beard", length_cm: 40, hex: HAIR.black }),
  faceOf("shoulder-length, very long beard", SKIN.tan, { length_cm: 30, texture: "straight", hex: HAIR.black }, { kind: "beard", length_cm: 40, hex: HAIR.black }),
];
const CHARACTERS = params.get("set") === "vocab" ? VOCAB_CHARACTERS : params.get("set") === "face" ? FACE_CHARACTERS : TEST_CHARACTERS;
const root = document.getElementById("root") as HTMLElement;
document.body.style.background = "#14141a";
document.body.style.color = "#e8e8ed";
const noop = () => {};

declare global {
  interface Window {
    ready?: boolean;
    measure?: (seconds: number) => Promise<unknown>;
    screenOf?: (id: string) => { x: number; y: number };
    labelReport?: () => {
      width: number;
      height: number;
      labels: Array<{ id: string; text: string; x0: number; x1: number; y0: number; y1: number }>;
      heads: Array<{ id: string; x0: number; x1: number; y0: number; y1: number; cx: number }>;
      camera: number[] | null;
      fov: number | null;
      boxes: Array<{ id: string; box: number[][] }>;
    };
  }
}

if (view === "portraits") {
  render(
    <table style={{ borderSpacing: "16px 8px" }}>
      <tbody>
        {(params.get("set") === "face" ? FACE_CHARACTERS : TEST_CHARACTERS).map((ch) => (
          <tr key={ch.name}>
            <td style={{ width: "12em" }}>{ch.name}</td>
            <td>
              <AvatarPortrait appearance={ch.appearance} size={32} />
            </td>
            <td>
              <AvatarPortrait appearance={ch.appearance} size={128} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>,
    root,
  );
  window.ready = true;
} else if (view === "vocab") {
  // One table per field, one portrait (at 96 px) per value, captioned with the value.
  render(
    <div>
      {VOCAB_ROWS.map(([field, values]) => (
        <table key={field} data-field={field} style={{ borderSpacing: "8px 4px", marginBottom: 8 }}>
          <tbody>
            <tr>
              <th style={{ width: "10em", textAlign: "left" }}>{field}</th>
              {values.map(([value, appearance]) => (
                <td key={value} style={{ textAlign: "center", font: "12px sans-serif" }}>
                  <AvatarPortrait appearance={appearance} size={96} />
                  <div>{value}</div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      ))}
    </div>,
    root,
  );
  window.ready = true;
} else if (view === "plan") {
  const layout = crowdLayout(TEST_CHARACTERS.length);
  render(
    <div style={{ width: 960 }}>
      <RoomLayoutPicture layout={layout} placed={placeThings(layout)} youId="" label="test room" onExit={noop} onSave={noop} />
    </div>,
    root,
  );
  window.ready = true;
} else if (view === "card") {
  // The player card as the Room tab shows it, in a side panel 276 px wide (the live guest check's width).
  const appearance = TEST_CHARACTERS[1].appearance;
  render(
    <div className="sidebar" style={{ width: 276, boxSizing: "border-box", padding: 8 }}>
      <PlayerCard player={{ name: "bram", fullname: "Bram Okoro" }} appearance={appearance} onLook={noop} onFollow={noop} />
    </div>,
    root,
  );
  window.ready = true;
} else if (view === "figures") {
  // One close-up per character, alone in the living room, facing south toward the camera.
  const angle = { three: Math.PI / 4, side: Math.PI / 2, back: Math.PI }[params.get("angle") ?? ""] ?? 0;
  const cell = { w: 300, h: 420 };
  const cols = 4;
  const rows = Math.ceil(CHARACTERS.length / cols);
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(cell.w * cols, cell.h * rows);
  renderer.setClearColor(0x14141a);
  renderer.setScissorTest(true);
  const frame = document.createElement("div");
  frame.style.position = "relative";
  frame.appendChild(renderer.domElement);
  root.appendChild(frame);
  CHARACTERS.forEach((ch, i) => {
    const layout: RoomLayout = livingRoomLayout();
    layout.things = [
      {
        id: "#p",
        name: ch.name,
        kind: "person",
        fixed: true,
        mounted: false,
        shapes: [{ box: [[-0.2, 0.2], [-0.2, 0.2], [0, ch.height]] }],
        appearance: ch.appearance,
      },
    ];
    const room = buildRoomScene({ layout, placed: placeThings(layout), youId: "" });
    const scene = new THREE.Scene();
    scene.add(room.root);
    const fov = DOLLHOUSE_FOV * 0.7;
    const camera = new THREE.PerspectiveCamera(fov, cell.w / cell.h, 0.05, 50);
    camera.up.set(0, 0, 1);
    // Whole figure: far enough that it (and antlers) fits. Head: the top 30 cm of the figure, close.
    const bounds = new THREE.Box3().setFromObject(room.things.get("#p") as THREE.Object3D);
    const head = params.get("zoom") === "head";
    const lying = ch.appearance.posture === "reclining";
    if (head && lying) {
      // Lying on the back, face up. The figure lies head toward its own -y and is turned to
      // face south, so its head is at the room's +y end: look down at the face from above it.
      const at = new THREE.Vector3(0, bounds.max.y - 0.12, bounds.max.z - 0.05);
      camera.position.set(Math.sin(angle) * 0.35, at.y - Math.cos(angle) * 0.35, at.z + 0.65);
      camera.lookAt(at);
    } else {
      const lookZ = head ? bounds.max.z - 0.14 : ch.height * 0.5;
      // `dist=1.05`: the head camera that far away, metres (about 150 px of head in a 420 px cell).
      const distance = head ? Number(params.get("dist") ?? "0.75") : (ch.height * 0.62) / Math.tan(((fov / 2) * Math.PI) / 180);
      camera.position.set(Math.sin(angle) * distance, -Math.cos(angle) * distance, lookZ + (head ? 0.05 : 0.3));
      camera.lookAt(0, 0, lookZ);
    }
    cutWalls(room, layout, camera.position, "dollhouse");
    const x = (i % cols) * cell.w;
    const y = (rows - 1 - Math.floor(i / cols)) * cell.h;
    renderer.setViewport(x, y, cell.w, cell.h);
    renderer.setScissor(x, y, cell.w, cell.h);
    renderer.render(scene, camera);
    const caption = document.createElement("div");
    caption.textContent = ch.name;
    Object.assign(caption.style, { position: "absolute", left: `${(i % cols) * cell.w + 6}px`, top: `${Math.floor(i / cols) * cell.h + 4}px`, font: "14px sans-serif" });
    frame.appendChild(caption);
  });
  window.ready = true;
} else if (view === "room") {
  const count = Number(params.get("n") ?? "8");
  const layout = crowdLayout(count);
  // `size=50`: the same people in a square room that many metres across, like a large live room.
  const size = Number(params.get("size") ?? "0");
  if (size > 0) layout.size = [size, size, layout.size[2]];
  // `spread=6`: the people's places multiplied by that much, so they stand apart across a large room.
  const spread = Number(params.get("spread") ?? "1");
  for (const thing of layout.things) {
    const [xs, ys] = thing.shapes[0].box as [[number, number], [number, number], [number, number]];
    const [cx, cy] = [(xs[0] + xs[1]) / 2, (ys[0] + ys[1]) / 2];
    thing.shapes[0].box = [[cx * spread - 0.2, cx * spread + 0.2], [cy * spread - 0.2, cy * spread + 0.2], (thing.shapes[0].box as number[][])[2] as [number, number]];
  }
  // `places=0,4.8;0,2.05`: where each person stands (#p0, #p1, …), metres from the room's middle, as in a live room.
  const places = params.get("places")?.split(";").map((p) => p.split(",").map(Number));
  places?.forEach(([x, y], i) => {
    const thing = layout.things[i];
    if (thing) thing.shapes[0].box = [[x - 0.2, x + 0.2], [y - 0.2, y + 0.2], (thing.shapes[0].box as number[][])[2] as [number, number]];
  });
  // `face=north`: everyone faces north (away from the dollhouse's opening camera); by default, south.
  // `rack=#p1`: a newspaper rack (1.3 m, a shelf) stands 1.5 m north of that person, behind them from the opening camera.
  const rackFor = params.get("rack");
  const rackOwner = layout.things.find((t) => t.id === rackFor);
  if (rackOwner) {
    const [xs, ys] = rackOwner.shapes[0].box as number[][];
    const [cx, cy] = [(xs[0] + xs[1]) / 2, (ys[0] + ys[1]) / 2 + 1.5];
    layout.things.push({
      id: "#rack",
      name: "a newspaper rack of The Daily Caption",
      kind: "object",
      fixed: true,
      mounted: false,
      shapes: [{ box: [[cx - 0.4, cx + 0.4], [cy - 0.2, cy + 0.2], [0, 1.3]] }],
      classes: ["shelf", "thing"],
    });
  }
  const facing: Record<string, [number, number, number]> = { north: [0, 1, 0], south: [0, -1, 0], east: [1, 0, 0], west: [-1, 0, 0] };
  const faced = facing[params.get("face") ?? ""];
  const bodyLayout = withBodyFacings(layout, faced ? Object.fromEntries(layout.things.map((t) => [t.id, faced])) : {});
  const width = Number(params.get("width") ?? "960");
  const mode = params.get("mode") === "eyes" ? "eyes" : "dollhouse";
  // Where a person's head is in the opening Dollhouse picture, in page pixels: what the wheel is pointed at.
  window.screenOf = (id: string) => {
    const frame = document.querySelector(".room-layout-3d") as HTMLElement;
    const rect = frame.getBoundingClientRect();
    const camera = new THREE.PerspectiveCamera(DOLLHOUSE_FOV, rect.width / rect.height, 0.05, 200);
    camera.up.set(0, 0, 1);
    const pose = dollhousePose(layout);
    camera.position.set(...pose.position);
    camera.lookAt(...pose.target);
    camera.updateMatrixWorld();
    const box = (layout.things.find((t) => t.id === id)?.shapes[0].box ?? [[0, 0], [0, 0], [0, 0]]) as number[][];
    const head = new THREE.Vector3((box[0][0] + box[0][1]) / 2, (box[1][0] + box[1][1]) / 2, box[2][1] * 0.93).project(camera);
    return { x: rect.left + ((head.x + 1) / 2) * rect.width, y: rect.top + ((1 - head.y) / 2) * rect.height };
  };
  // Time every WebGL render the 3D view makes, and keep its draw counts. WebGLRenderer
  // sets `render` on each instance, so the scene's before/after hooks are used instead.
  let renderMs = 0;
  let renderStart = 0;
  let info = { calls: 0, triangles: 0 };
  let seen: { scene: THREE.Scene; camera: THREE.Camera } | null = null;
  THREE.Scene.prototype.onBeforeRender = function (this: THREE.Scene, _renderer, _scene, camera) {
    renderStart = performance.now();
    seen = { scene: this, camera };
  };
  // The last drawn picture: each shown label's box, and each visible person's head as drawn (every
  // figure vertex above the chin, projected), in CSS pixels from the picture's top left.
  window.labelReport = () => {
    const frame = (document.querySelector(".room-layout-3d") as HTMLElement).getBoundingClientRect();
    const owner = new Map<Element, string>();
    seen?.scene.traverse((object) => {
      if (object instanceof CSS2DObject) owner.set(object.element, object.parent?.userData.thingId as string);
    });
    const labels = [...document.querySelectorAll<HTMLElement>(".rl3d-label")]
      .filter((e) => getComputedStyle(e).display !== "none")
      .map((e) => {
        const r = e.getBoundingClientRect();
        return { id: owner.get(e) ?? "", text: e.textContent ?? "", x0: r.left - frame.left, x1: r.right - frame.left, y0: r.top - frame.top, y1: r.bottom - frame.top };
      });
    const heads: Array<{ id: string; x0: number; x1: number; y0: number; y1: number; cx: number }> = [];
    if (seen) {
      const { scene, camera } = seen;
      scene.updateMatrixWorld(true);
      const v = new THREE.Vector3();
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh) || object.parent?.userData.form !== "person" || !object.parent.visible) return;
        const id = object.parent.userData.thingId as string;
        const thing = layout.things.find((t) => t.id === id);
        const height = thing ? (thing.shapes[0].box as number[][])[2][1] : 1.7;
        const p = figureParams(thing?.appearance, { height, base: "#000000" });
        const chin = p.top - p.headHeight * 1.05 + (thing ? (thing.shapes[0].box as number[][])[2][0] : 0);
        const position = object.geometry.getAttribute("position");
        const box = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };
        for (let i = 0; i < position.count; i++) {
          v.fromBufferAttribute(position, i).applyMatrix4(object.matrixWorld);
          if (v.z < chin) continue;
          v.project(camera);
          if (Math.abs(v.z) > 1) continue;
          const x = ((v.x + 1) / 2) * frame.width;
          const y = ((1 - v.y) / 2) * frame.height;
          box.x0 = Math.min(box.x0, x);
          box.x1 = Math.max(box.x1, x);
          box.y0 = Math.min(box.y0, y);
          box.y1 = Math.max(box.y1, y);
        }
        if (box.x0 <= box.x1 && box.x1 > 0 && box.x0 < frame.width && box.y1 > 0 && box.y0 < frame.height) {
          heads.push({ id, ...box, cx: (box.x0 + box.x1) / 2 });
        }
      });
    }
    const at = seen?.camera.position;
    // Each person's box in the room (metres), to tell whether the camera is inside one.
    const boxes = layout.things.map((t) => ({ id: t.id, box: t.shapes[0].box as number[][] }));
    const fov = seen?.camera instanceof THREE.PerspectiveCamera ? seen.camera.fov : null;
    return { width: frame.width, height: frame.height, labels, heads, camera: at ? [at.x, at.y, at.z] : null, fov, boxes };
  };
  THREE.Scene.prototype.onAfterRender = (renderer: THREE.WebGLRenderer) => {
    renderMs += performance.now() - renderStart;
    info = { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles };
  };
  const draw = (offset: [number, number, number] | undefined) =>
    render(
      <div style={{ width }}>
        <RoomLayout3D
          layout={bodyLayout}
          placed={placeThings(offset ? translateLayoutThing(bodyLayout, "#p0", offset) : bodyLayout)}
          youId={params.get("you") ?? ""}
          label="test room"
          mode={mode}
          onExit={noop}
        />
      </div>,
      root,
    );
  draw(undefined);
  window.ready = true;
  window.measure = (seconds: number) =>
    new Promise((resolve) => {
      // Run effects (the room rebuild) in the same task as the render, so each frame's work can be timed.
      options.requestAnimationFrame = (callback: () => void) => callback();
      const work: number[] = [];
      const gl: number[] = [];
      const intervals: number[] = [];
      let last = 0;
      let step = 0;
      const end = performance.now() + seconds * 1000;
      const frame = (now: number) => {
        if (last) intervals.push(now - last);
        last = now;
        step++;
        renderMs = 0;
        const start = performance.now();
        const a = step * 0.05;
        draw([Math.cos(a) * 0.5 + 0.5, Math.sin(a) * 0.5, 0]);
        work.push(performance.now() - start);
        gl.push(renderMs);
        if (now < end) requestAnimationFrame(frame);
        else {
          const stat = (xs: number[]) => {
            const s = [...xs].sort((p, q) => p - q);
            return { median: s[Math.floor(s.length / 2)], p95: s[Math.floor(s.length * 0.95)], worst: s[s.length - 1] };
          };
          const ctx = document.createElement("canvas").getContext("webgl2");
          const debug = ctx?.getExtension("WEBGL_debug_renderer_info");
          resolve({
            people: count,
            frames: work.length,
            workMs: stat(work),
            webglRenderMs: stat(gl),
            frameIntervalMs: stat(intervals),
            calls: info.calls,
            triangles: info.triangles,
            gpu: debug && ctx ? ctx.getParameter(debug.UNMASKED_RENDERER_WEBGL) : "unknown",
          });
        }
      };
      requestAnimationFrame(frame);
    });
}
