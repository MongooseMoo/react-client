import * as THREE from "three";
import { describe, expect, it } from "vitest";

import { suppliedHexes, TEST_CHARACTERS } from "../avatar/characters.fixture";
import { figureParams, NEUTRAL_CLOTHING, NEUTRAL_SKIN } from "../avatar/figure";
import type { RoomLayout } from "../gmcp/Room";
import { EYE_WHITE } from "./figureMesh";
import { crowdLayout, livingRoomLayout, translateLayoutThing, withBodyFacings } from "./roomLayout.fixture";
import laundry from "./roomLayout.sample-1770.json";
import livingRoom from "./roomLayout.sample-25828.json";
import { placeLabelsOver, placeThings } from "./roomLayout";
import {
  buildRoomScene,
  updateRoomBodies,
  CUT_WALL_HEIGHT,
  cutWalls,
  DEFAULT_EYE_HEIGHT,
  DOLLHOUSE_FOV,
  disposeRoomScene,
  dollhouseMaxDistance,
  dollhousePose,
  EYES_FOV,
  EYES_MIN_FOV,
  eyesPose,
  FigureCache,
  MATERIAL_COLOURS,
  NEUTRAL,
  PERSON_COLOUR,
  panTo,
  PICK_TOLERANCE,
  Pinch,
  screenBox,
  screenTop,
  WHEEL_NOTCHES,
  wheelNotches,
  wheelStep,
  wheelZoom,
  wheelZoomPoint,
  zoomFocus,
  YOU_COLOUR,
  ZOOM_NEAREST,
  ZOOM_STEP,
  zoomedFov,
  zoomedFovBy,
} from "./roomScene";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const build = (layout: RoomLayout, youId = "#99") =>
  buildRoomScene({ layout, placed: placeThings(layout), youId });

const meshes = (group: THREE.Object3D | undefined) =>
  (group?.children ?? []).filter((c): c is THREE.Mesh => c instanceof THREE.Mesh);
const parts = (group: THREE.Object3D | undefined) => meshes(group).map((m) => m.userData.part);
const colour = (mesh: THREE.Mesh) => (mesh.material as THREE.MeshStandardMaterial).color.getHex();
const box = (mesh: THREE.Mesh) => new THREE.Box3().setFromObject(mesh);
const hex = (colour: number) => `#${colour.toString(16).padStart(6, "0")}`;
/** The distinct colours painted on a person's figure (its vertex colours, as sRGB numbers), sorted. */
const figureColours = (id: string, scene: ReturnType<typeof buildRoomScene>): number[] => {
  const attribute = meshes(scene.things.get(id))[0].geometry.getAttribute("color");
  const found = new Set<number>();
  const c = new THREE.Color();
  for (let i = 0; i < attribute.count; i++) found.add(c.setRGB(attribute.getX(i), attribute.getY(i), attribute.getZ(i)).getHex());
  return [...found].sort((a, b) => a - b);
};

describe("buildRoomScene", () => {
  it("draws native sitting posture without requiring a person's appearance record", () => {
    const layout = livingRoomLayout();
    layout.things = [{ ...layout.things[0], id: "#plain", kind: "person", appearance: undefined,
      shapes: [{ box: [[0, 0.4], [0, 0.3], [0, 0.99]] }],
      pose: { centre_m: [0.2, 0.15, 0.495], dimensions_m: [0.4, 0.3, 0.99],
        body_quaternion: [1, 0, 0, 0], box: true, figure_height_m: 1.8, posture: "sitting" } }];
    const scene = build(layout);
    const figure = meshes(scene.things.get("#plain"))[0];
    const expected = figureParams({ posture: "sitting" }, { height: 1.8, base: hex(PERSON_COLOUR) });
    expect(box(figure).max.z).toBeCloseTo(expected.top, 1);
    // The existing figure's seated crown is 1.8 * (1 - 0.47 + 0.26) = 1.422 m.
    expect(box(figure).max.z).toBeCloseTo(1.422, 2);
    disposeRoomScene(scene);
  });
  it("retains meshes and updates world label points during native rigid movement", () => {
    const layout = livingRoomLayout();
    const placed = placeThings(layout);
    const scene = buildRoomScene({ layout, placed, youId: "" });
    const seat = scene.things.get("#2");
    if (!seat) throw new Error("missing seat");
    const geometry = meshes(seat)[0].geometry;
    const point = scene.labelPoints.get("#2")?.[0].clone();
    if (!point) throw new Error("missing label point");
    const moved = translateLayoutThing(layout, "#2", [1, -0.5, 0]);
    expect(updateRoomBodies(scene, placed, placeThings(moved))).toBe(true);
    expect(scene.things.get("#2")).toBe(seat);
    expect(meshes(seat)[0].geometry).toBe(geometry);
    expect(scene.labelPoints.get("#2")?.[0].toArray()).toEqual(point.add(new THREE.Vector3(1, -0.5, 0)).toArray());
    disposeRoomScene(scene);
  });
  it("turns a seat's declared local front through its native body pose", () => {
    const layout: RoomLayout = { num: 1, size: [6, 6, 3], exits: [], things: [{
      id: "#seat", name: "seat", kind: "object", fixed: false, mounted: false, classes: ["chair"],
      shapes: [{ box: [[-0.5, 0.5], [-1, 1], [0, 1]] }],
      pose: { centre_m: [0, 0, 0.5], dimensions_m: [2, 1, 1], body_quaternion: [Math.SQRT1_2, 0, 0, Math.SQRT1_2], box: true },
      front: { axis: [1, 0, 0], yaw: Math.PI, direction: "north" },
    }] };
    const scene = build(layout);
    const back = meshes(scene.things.get("#seat")).find((mesh) => mesh.userData.part === "back");
    expect(back).toBeDefined();
    if (!back) throw new Error("missing supplied seat back");
    expect(box(back).max.y).toBeLessThan(-0.7);
    const seat = scene.things.get("#seat");
    if (!seat) throw new Error("missing seat");
    const bounds = new THREE.Box3().setFromObject(seat);
    expect(bounds.min.x).toBeCloseTo(-0.5);
    expect(bounds.max.x).toBeCloseTo(0.5);
    expect(bounds.min.y).toBeCloseTo(-1);
    expect(bounds.max.y).toBeCloseTo(1);
    disposeRoomScene(scene);
  });

  it("keeps custom world shapes unrotated and a frontless seat without an invented back", () => {
    const layout = livingRoomLayout();
    layout.things = [{ ...layout.things[1], front: undefined }, {
      id: "#custom", name: "custom", kind: "object", fixed: false, mounted: false,
      shapes: [{ box: [[1, 3], [0, 0.5], [0, 1]] }],
      pose: { centre_m: [2, 0.25, 0.5], dimensions_m: [0.5, 2, 1], body_quaternion: [Math.SQRT1_2, 0, 0, Math.SQRT1_2], box: false },
    }];
    const scene = build(layout);
    expect(parts(scene.things.get("#2"))).toEqual(["seat"]);
    const custom = box(meshes(scene.things.get("#custom"))[0]);
    expect(custom.min.x).toBeCloseTo(1);
    expect(custom.max.x).toBeCloseTo(3);
    expect(custom.max.y).toBeCloseTo(0.5);
    disposeRoomScene(scene);
  });

  it("draws the real laundry room: one mesh per shape of a plain thing, doorways in the south and west walls", () => {
    const layout = laundry as RoomLayout;
    const scene = build(layout);
    const shaped = layout.things.filter((t) => t.shapes.length > 0);
    expect([...scene.things.keys()].sort()).toEqual(shaped.map((t) => t.id).sort());
    for (const thing of shaped) {
      if (thing.kind !== "object") continue;
      expect(meshes(scene.things.get(thing.id))).toHaveLength(thing.shapes.length);
    }
    // A washer sits where its box says: x -2.8..-2.2, y 1.0..1.65, z 0..0.85.
    const washer = box(meshes(scene.things.get("#23011"))[0]);
    // Geometry is stored in 32-bit floats.
    expect(washer.min.distanceTo(new THREE.Vector3(-2.8, 1, 0))).toBeLessThan(1e-6);
    expect(washer.max.distanceTo(new THREE.Vector3(-2.2, 1.65, 0.85))).toBeLessThan(1e-6);

    // Each doorway is an opening in its wall and a threshold on the floor; both send the exit.
    expect(scene.exits.map((e) => `${e.userData.exit} ${e.userData.part}`).sort()).toEqual([
      "south doorway",
      "south threshold",
      "west doorway",
      "west threshold",
    ]);
    expect(parts(scene.walls.south)).toContain("doorway");
    expect(parts(scene.walls.west)).toContain("doorway");
    expect(parts(scene.walls.north)).toEqual(["wall"]);
    disposeRoomScene(scene);
  });

  it("leaves a gap in the wall exactly where the doorway is", () => {
    const scene = build(laundry as RoomLayout);
    const doorway = box(scene.exits.find((e) => e.userData.exit === "south") as THREE.Mesh);
    // South exit: at x 0, 0.9 m wide.
    expect(doorway.min.x).toBeCloseTo(-0.45);
    expect(doorway.max.x).toBeCloseTo(0.45);
    const solid = meshes(scene.walls.south).filter((m) => m.userData.part === "wall").map(box);
    expect(solid.some((b) => b.max.x > -0.45 + 1e-6 && b.min.x < 0.45 - 1e-6)).toBe(false);
  });

  it("draws things by their class", () => {
    const scene = build(livingRoomLayout());
    const form = (id: string) => scene.things.get(id)?.userData.form;
    expect(form("#1")).toBe("table");
    expect(parts(scene.things.get("#1"))).toEqual(["top", "leg", "leg", "leg", "leg"]);
    expect(form("#2")).toBe("seat");
    expect(parts(scene.things.get("#2"))).toEqual(["seat", "back"]);
    // The sofa is against the north wall, so its back is on its north side.
    const sofaBack = box(meshes(scene.things.get("#2"))[1]);
    expect(sofaBack.max.y).toBeCloseTo(2.0);
    expect(sofaBack.min.y).toBeGreaterThan(1.6);
    expect(form("#3")).toBe("shelf");
    expect(parts(scene.things.get("#3")).filter((p) => p === "shelf").length).toBeGreaterThanOrEqual(4);
    expect(form("#4")).toBe("picture");
    expect(parts(scene.things.get("#4"))).toEqual(["frame", "picture"]);
    expect(form("#5")).toBe("screen");
    expect(form("#6")).toBe("door");
    expect(parts(scene.things.get("#6"))).toEqual(["leaf", "knob"]);
    expect(form("#7")).toBe("flat");
    const book = box(meshes(scene.things.get("#7"))[0]);
    expect(book.max.z - book.min.z).toBeLessThanOrEqual(0.05 + 1e-6);
    expect(form("#8")).toBe("box");
    expect(meshes(scene.things.get("#8"))[0].geometry).toBeInstanceOf(THREE.SphereGeometry);
  });

  it("colours things by their largest material, people without appearance green and you blue", () => {
    const scene = build(livingRoomLayout());
    const first = (id: string) => colour(meshes(scene.things.get(id))[0]);
    expect(first("#1")).toBe(MATERIAL_COLOURS.wood);
    expect(first("#2")).toBe(MATERIAL_COLOURS.cotton);
    expect(colour(meshes(scene.things.get("#4"))[1])).toBe(MATERIAL_COLOURS.paper);
    expect(first("#8")).toBe(NEUTRAL);
    expect(figureColours("#99", scene)).toEqual([YOU_COLOUR]);
    expect(figureColours("#9", scene)).toEqual([PERSON_COLOUR]);
    // A person is one merged mesh with vertex colours, not a capsule.
    expect(meshes(scene.things.get("#9"))).toHaveLength(1);
    expect(meshes(scene.things.get("#9"))[0].geometry.getAttribute("color")).toBeDefined();
  });

  it("draws a person from their appearance, facing their Client.Spatial forward", () => {
    const layout = livingRoomLayout();
    const ch = TEST_CHARACTERS[1];
    layout.things = layout.things.map((t) => (t.id === "#9" ? { ...t, appearance: ch.appearance } : t));
    const faced = withBodyFacings(layout, { "#9": [1, 0, 0] });
    const scene = buildRoomScene({ layout: faced, placed: placeThings(faced), youId: "#99" });
    const colours = figureColours("#9", scene);
    expect(colours.length).toBeGreaterThan(3);
    // Every colour is one the game supplied, or one the figure derives from them: its outline and face inks, the
    // hair edge, brow and facial hair edge toned off the skin, the eye white, and shades from a hair colour toward
    // its sheen on textured hair (Bram's coily cap). Nothing else.
    const fc = figureParams(ch.appearance, { height: 1.7, base: "#000000" }).colours;
    const allowed = new Set([...suppliedHexes(ch.appearance), fc.ink, fc.faceInk, fc.hairEdge, fc.brow, fc.facialHairEdge, EYE_WHITE].filter((x): x is string => x !== undefined));
    const onSheen = (c: number) => {
      if (!fc.hair || !fc.hairSheen) return false;
      // Shading mixes in linear colour, as figureGeometry does; allow the last bit of 8-bit rounding.
      const [from, to, got] = [new THREE.Color(fc.hair), new THREE.Color(fc.hairSheen), new THREE.Color(c)];
      for (let step = 0; step <= 1000; step++) {
        const at = from.clone().lerp(to, step / 1000);
        if (Math.abs(at.r - got.r) + Math.abs(at.g - got.g) + Math.abs(at.b - got.b) < 0.006) return true;
      }
      return false;
    };
    for (const c of colours) expect(allowed.has(hex(c)) || onSheen(c), hex(c)).toBe(true);
    // Bram's coily black hair shows its texture: shades toward the sheen are present.
    expect(colours.some((c) => !allowed.has(hex(c)) && onSheen(c))).toBe(true);
    const body = meshes(scene.things.get("#9"))[0];
    // Facing east: its own +y turned onto +x.
    expect(new THREE.Vector3(0, 1, 0).applyEuler(body.rotation).x).toBeCloseTo(1);
    const bounds = box(body);
    expect(bounds.min.z).toBeCloseTo(0, 1);
    expect(bounds.max.z).toBeLessThan(1.8);
    // The label hangs at the crown, and its outline holds the head and nothing below the chin.
    const label = scene.labelPoints.get("#9") as THREE.Vector3[];
    expect(label[0].z).toBeCloseTo(bounds.max.z, 3);
    expect(Math.min(...label.map((p) => p.z))).toBeGreaterThan(1.4);
  });

  it("draws a record without skin or garments in the same neutral skin and clothing as the portrait and plan token", () => {
    const layout = livingRoomLayout();
    const appearance = { hair: { length_cm: 75, hex: "#a33a1f" }, eyes: { hex: "#4f7a3a" }, build: "dumpy" };
    layout.things = layout.things.map((t) => (t.id === "#9" ? { ...t, appearance } : t));
    const colours = figureColours("#9", build(layout)).map(hex);
    expect(colours).toContain(NEUTRAL_SKIN);
    expect(colours).toContain(NEUTRAL_CLOTHING);
    expect(colours).not.toContain(hex(PERSON_COLOUR));
    // A person with no appearance at all keeps the plain look.
    expect(figureColours("#9", build(livingRoomLayout())).map(hex)).toEqual([hex(PERSON_COLOUR)]);
  });

  it("draws glasses, sunglasses, an eyepatch and earrings on the figure's head in the ink, not on a hidden face", () => {
    // Pale skin and no garments: the ink is dark and appears only where a feature (or outline) is drawn.
    const plain = { skin: { hex: "#f0d8c0" }, eyes: { hex: "#3a7d44" } };
    const figures = new FigureCache();
    const sceneOf = (appearance: Record<string, unknown>) => {
      const layout = livingRoomLayout();
      layout.things = layout.things.map((t) => (t.id === "#9" ? { ...t, appearance } : t));
      return buildRoomScene({ layout, placed: placeThings(layout), youId: "#99", figures });
    };
    const inkVertices = (appearance: Record<string, unknown>) => {
      const scene = sceneOf(appearance);
      const body = meshes(scene.things.get("#9"))[0];
      const ink = new THREE.Color(figureParams(appearance, { height: 1.7, base: "#000000" }).colours.faceInk);
      const colours = body.geometry.getAttribute("color");
      const positions = body.geometry.getAttribute("position");
      const head = box(body);
      const zs: number[] = [];
      for (let i = 0; i < colours.count; i++) {
        if (Math.abs(colours.getX(i) - ink.r) + Math.abs(colours.getY(i) - ink.g) + Math.abs(colours.getZ(i) - ink.b) < 1e-6) zs.push(positions.getZ(i));
      }
      return { zs, top: head.max.z, geometry: body.geometry };
    };
    // The bare face has only its mouth in the face ink.
    const bare = inkVertices(plain);
    expect(bare.zs.length).toBeGreaterThan(0);
    expect(Math.min(...bare.zs)).toBeGreaterThan(bare.top - 0.3);
    for (const feature of ["glasses", "sunglasses", "eyepatch", "earrings"]) {
      const drawn = inkVertices({ ...plain, features: [feature] });
      expect(drawn.zs.length, feature).toBeGreaterThan(bare.zs.length);
      // Every inked vertex is on the head: within its top quarter-metre.
      expect(Math.min(...drawn.zs), feature).toBeGreaterThan(drawn.top - 0.3);
      // A feature is part of the figure's look, so it gets its own geometry.
      expect(drawn.geometry, feature).not.toBe(bare.geometry);
    }
    // Freckles, a beauty mark and dimples stay in the portrait.
    expect(inkVertices({ ...plain, features: ["freckles", "beauty_mark", "dimples"] }).zs).toHaveLength(bare.zs.length);
    expect(inkVertices({ ...plain, face_hidden: true, features: ["glasses", "earrings"] }).zs).toHaveLength(0);
    figures.dispose();
  });

  it("seats a sitting person lower and lays a reclining one down", () => {
    const layout = livingRoomLayout();
    const posed = (posture: "sitting" | "reclining") => {
      layout.things = layout.things.map((t) => (t.id === "#9" ? { ...t, appearance: { posture } } : t));
      return box(meshes(build(layout).things.get("#9"))[0]);
    };
    const standing = box(meshes(build(livingRoomLayout()).things.get("#9"))[0]);
    const sitting = posed("sitting");
    const reclining = posed("reclining");
    expect(sitting.max.z).toBeLessThan(standing.max.z - 0.3);
    expect(reclining.max.z).toBeLessThan(0.5);
    expect(Math.max(reclining.max.x - reclining.min.x, reclining.max.y - reclining.min.y)).toBeGreaterThan(1.4);
  });

  it("rebuilds rooms of 8 and 40 people with unchanged appearances, as while someone moves, reusing their figures", () => {
    const rebuild = (count: number, figures?: FigureCache) => {
      const layout = crowdLayout(count);
      const placed = placeThings(layout);
      let scene = buildRoomScene({ layout, placed, youId: "", figures });
      // Fresh builds are slow; fewer rounds keep the suite quick.
      const rounds = figures ? 30 : 5;
      const start = performance.now();
      for (let i = 0; i < rounds; i++) {
        disposeRoomScene(scene);
        scene = buildRoomScene({ layout, placed, youId: "", figures });
      }
      const ms = (performance.now() - start) / rounds;
      disposeRoomScene(scene);
      figures?.dispose();
      return ms;
    };
    for (const count of [8, 40]) {
      const fresh = rebuild(count);
      const kept = rebuild(count, new FigureCache());
      console.log(`rebuild: ${count} people, ${fresh.toFixed(2)} ms fresh, ${kept.toFixed(2)} ms reusing figures (means of 5 and 30)`);
      expect(kept).toBeLessThan(fresh / 2);
    }
  });

  it("reuses an unchanged figure's geometry, frees it when the person leaves or changes, and moves it on the mesh", () => {
    const figures = new FigureCache();
    const layout = crowdLayout(3);
    const first = buildRoomScene({ layout, placed: placeThings(layout), youId: "", figures });
    const geometryOf = (scene: ReturnType<typeof buildRoomScene>, id: string) => meshes(scene.things.get(id))[0].geometry;
    const kept = geometryOf(first, "#p0");
    const changed = geometryOf(first, "#p1");
    const leaving = geometryOf(first, "#p2");
    const freed = new Set<THREE.BufferGeometry>();
    for (const g of [kept, changed, leaving]) g.addEventListener("dispose", () => freed.add(g));
    disposeRoomScene(first);
    expect(freed.size).toBe(0);

    // #p0 moves and turns, #p1 changes clothes, #p2 leaves.
    let next: RoomLayout = {
      ...layout,
      things: [
        { ...layout.things[0], origin: [0, 0, 0] },
        { ...layout.things[1], appearance: { ...layout.things[1].appearance, garments: [] } },
      ],
    };
    next = withBodyFacings(translateLayoutThing(next, "#p0", [1, 1, 0]), { "#p0": [1, 0, 0] });
    const second = buildRoomScene({
      layout: next,
      placed: placeThings(next),
      youId: "",
      figures,
    });
    expect(geometryOf(second, "#p0")).toBe(kept);
    expect(meshes(second.things.get("#p0"))[0].position.x).toBeCloseTo(-2 + 1);
    expect(geometryOf(second, "#p1")).not.toBe(changed);
    expect(freed.size).toBe(2);
    expect(freed.has(changed) && freed.has(leaving)).toBe(true);
    expect(figures.size).toBe(2);

    disposeRoomScene(second);
    figures.dispose();
    expect(freed.has(kept)).toBe(true);
  });

  it("builds forty figures quickly and cheaply", () => {
    const layout = crowdLayout(40);
    const people = layout.things;
    const placed = placeThings(layout);
    buildRoomScene({ layout, placed, youId: "" }); // warm-up
    const start = performance.now();
    const scene = buildRoomScene({ layout, placed, youId: "" });
    const ms = performance.now() - start;
    const triangles = people.map((p) => {
      const g = meshes(scene.things.get(p.id))[0].geometry;
      return (g.index ? g.index.count : g.getAttribute("position").count) / 3;
    });
    console.log(
      `figures: 40 built in ${ms.toFixed(1)} ms; triangles per figure ${Math.min(...triangles)}..${Math.max(...triangles)}, total ${triangles.reduce((a, b) => a + b, 0)}`,
    );
    expect(Math.max(...triangles)).toBeLessThan(5000);
    expect(ms).toBeLessThan(1000);
    disposeRoomScene(scene);
  });

  it("draws the live living-room sample (#25828) by class and material", () => {
    const layout = livingRoom as RoomLayout;
    const scene = build(layout, "#2");
    const forms = new Map<string, number>();
    for (const group of scene.things.values()) forms.set(group.userData.form, (forms.get(group.userData.form) ?? 0) + 1);
    expect(Object.fromEntries(forms)).toEqual({
      box: 20,
      picture: 11,
      person: 8,
      table: 4,
      flat: 2,
      shelf: 2,
      seat: 1,
      screen: 1,
      door: 1,
    });
    expect(scene.exits.map((e) => e.userData.exit).filter((name, i, all) => all.indexOf(name) === i).sort()).toEqual([
      "east",
      "north",
      "west",
    ]);
    const first = (id: string) => colour(meshes(scene.things.get(id))[0]);
    expect(first("#36230")).toBe(MATERIAL_COLOURS.steel); // keyboard stand
    expect(first("#29293")).toBe(MATERIAL_COLOURS.cotton); // blue sofa
    expect(first("#29617")).toBe(MATERIAL_COLOURS.wood); // coffee table: pine is a wood
    expect(first("#29972")).toBe(NEUTRAL); // weather station: no material
    expect(figureColours("#2", scene)).toEqual([YOU_COLOUR]);
  });

  it("draws only the supplied physical identities", () => {
    const layout = livingRoomLayout();
    const scene = build(layout);
    expect([...scene.things.keys()].sort()).toEqual(layout.things.map((thing) => thing.id).sort());
    disposeRoomScene(scene);
  });});

describe("cameras", () => {
  it("cuts the walls the dollhouse camera is outside of, and none from your eyes", () => {
    const layout = livingRoomLayout();
    const scene = build(layout);
    // Above and beyond the south-east corner.
    const camera = new THREE.Vector3(4, -4, 5);
    cutWalls(scene, layout, camera, "dollhouse");
    const cut = CUT_WALL_HEIGHT / layout.size[2];
    expect(scene.walls.south.scale.z).toBeCloseTo(cut);
    expect(scene.walls.east.scale.z).toBeCloseTo(cut);
    expect(scene.walls.north.scale.z).toBe(1);
    expect(scene.walls.west.scale.z).toBe(1);
    expect(scene.ceiling.visible).toBe(false);
    cutWalls(scene, layout, camera, "eyes");
    expect(Object.values(scene.walls).map((w) => w.scale.z)).toEqual([1, 1, 1, 1]);
    expect(scene.ceiling.visible).toBe(true);
  });

  it("zooms the dollhouse in with + : the camera comes closer to what it looks at", () => {
    const camera = new THREE.PerspectiveCamera(DOLLHOUSE_FOV, 4 / 3, 0.05, 200);
    camera.up.set(0, 0, 1);
    const controls = new OrbitControls(camera, document.createElement("div"));
    camera.position.set(0, -10, 5);
    controls.update();
    const before = camera.position.distanceTo(controls.target);
    controls.dollyIn(ZOOM_STEP);
    expect(camera.position.distanceTo(controls.target)).toBeLessThan(before * 0.9);
    // The scale it used to be given, 1.15, moved the camera away.
    const at = camera.position.distanceTo(controls.target);
    controls.dollyIn(1.15);
    expect(camera.position.distanceTo(controls.target)).toBeGreaterThan(at);
    controls.dispose();
  });

  it("zooms the dollhouse toward your own face with the keyboard, or the room's middle when you are not in it", () => {
    const big: RoomLayout = { ...livingRoomLayout(), size: [50, 50, 50] };
    const you = { x0: 18, x1: 18.4, y0: -12, y1: -11.6, z0: 0, z1: 1.75 };
    const face = zoomFocus(you, big);
    expect(face.toArray()).toEqual([18.2, -11.8, 1.575]);
    expect(zoomFocus(undefined, big).toArray()).toEqual(dollhousePose(big).target);

    const camera = new THREE.PerspectiveCamera(DOLLHOUSE_FOV, 4 / 3, 0.05, 200);
    camera.up.set(0, 0, 1);
    const controls = new OrbitControls(camera, document.createElement("div"));
    controls.maxDistance = dollhouseMaxDistance(big);
    const pose = dollhousePose(big);
    camera.position.set(...pose.position);
    controls.target.set(...pose.target);
    controls.update();
    const direction = camera.position.clone().sub(controls.target).normalize();
    const orbit = camera.position.distanceTo(controls.target);
    // What + does: slide over to the face, unturned, then come a step closer to it.
    panTo(camera, controls.target, face);
    controls.dollyIn(ZOOM_STEP);
    expect(controls.target.distanceTo(face)).toBeLessThan(1e-9);
    expect(camera.position.clone().sub(controls.target).normalize().distanceTo(direction)).toBeLessThan(1e-6);
    expect(camera.position.distanceTo(face)).toBeCloseTo(orbit * ZOOM_STEP, 6);
    // Thirty presses bring the camera within arm's length of the face.
    for (let i = 0; i < 29; i++) {
      panTo(camera, controls.target, face);
      controls.dollyIn(ZOOM_STEP);
    }
    expect(camera.position.distanceTo(face)).toBeLessThan(2);
    controls.dispose();
  });

  it("wheel-zooms the dollhouse onto the person under the pointer, then turns around them", () => {
    // A 50 m room; Bram stands 9 m south-west of the middle, facing north (away from the opening camera).
    const big: RoomLayout = { ...livingRoomLayout(), size: [50, 50, 50] };
    const bram = TEST_CHARACTERS[1];
    big.things = [
      {
        id: "#p1",
        name: bram.name,
        kind: "person",
        fixed: true,
        mounted: false,
        shapes: [{ box: [[-9.2, -8.8], [-9.2, -8.8], [0, bram.height]] }],
        appearance: bram.appearance,
      },
    ];
    const placed = placeThings(big);
    const faced = withBodyFacings(big, { "#p1": [0, 1, 0] });
    const scene = buildRoomScene({ layout: faced, placed: placeThings(faced), youId: "" });
    const camera = new THREE.PerspectiveCamera(DOLLHOUSE_FOV, 4 / 3, 0.05, 200);
    camera.up.set(0, 0, 1);
    const controls = new OrbitControls(camera, document.createElement("div"));
    controls.maxDistance = dollhouseMaxDistance(big);
    const pose = dollhousePose(big);
    camera.position.set(...pose.position);
    controls.target.set(...pose.target);
    controls.update();
    // The walls as the dollhouse draws them from here: cut low on the sides the camera is outside of.
    cutWalls(scene, big, camera.position, "dollhouse");
    scene.root.updateMatrixWorld(true);

    // The pointer on his head: the zoom heads for his face, not the floor behind him.
    const size = { width: 276, height: 207 };
    const pixel = (p: THREE.Vector3) => {
      camera.updateMatrixWorld();
      const v = p.clone().project(camera);
      return { x: ((v.x + 1) / 2) * size.width, y: ((1 - v.y) / 2) * size.height };
    };
    const face = zoomFocus(placed[0].bounds, big);
    const head = new THREE.Vector3(-9, -9, bram.height * 0.95);
    const point = wheelZoomPoint(camera, pixel(head), size, scene, placed, big)?.point;
    expect(point?.distanceTo(face)).toBeLessThan(1e-9);
    // On bare floor, the floor; over the walls into the dark, nothing.
    const floor = wheelZoomPoint(camera, pixel(new THREE.Vector3(5, 5, 0)), size, scene, placed, big)?.point;
    expect(floor?.distanceTo(new THREE.Vector3(5, 5, 0))).toBeLessThan(1e-6);
    const sky = camera.position.clone().addScaledVector(new THREE.Vector3(0, 1, 0.2).normalize(), 100);
    expect(wheelZoomPoint(camera, pixel(sky), size, scene, placed, big)).toBeUndefined();

    const inMiddle = () => {
      camera.updateMatrixWorld();
      const at = face.clone().project(camera);
      return Math.hypot(at.x, at.y);
    };
    expect(inMiddle()).toBeGreaterThan(0.2);
    const step = wheelStep(big);
    for (let i = 0; i < WHEEL_NOTCHES; i++) {
      wheelZoom(camera.position, controls.target, face, step);
      controls.update();
    }
    // Close, and his face in the middle of the picture.
    expect(camera.position.distanceTo(face)).toBeLessThan(2.5);
    expect(inMiddle()).toBeLessThan(0.02);
    // Turning half way round keeps him in the middle, and ends in front of him (north of him).
    for (let i = 0; i < 18; i++) {
      controls.rotateLeft(Math.PI / 18);
      expect(inMiddle()).toBeLessThan(0.02);
    }
    expect(camera.position.y).toBeGreaterThan(face.y);
    // Zooming out backs away from what it turns around.
    const near = camera.position.distanceTo(controls.target);
    wheelZoom(camera.position, controls.target, face, 1 / step);
    controls.update();
    expect(camera.position.distanceTo(controls.target)).toBeCloseTo(near / step, 6);
    controls.dispose();
    disposeRoomScene(scene);
  });

  it("picks a person a pixel or two tall from beside them, zooms onto their face and never into their body", () => {
    // The live check's case: a 50 m room in a 276 x 207 picture, where a person at the opening view is about 1 x 3 px.
    const big: RoomLayout = { ...livingRoomLayout(), size: [50, 50, 50] };
    const bram = TEST_CHARACTERS[1];
    const box = (x: number, y: number, top: number) => [[x - 0.2, x + 0.2], [y - 0.2, y + 0.2], [0, top]] as [[number, number], [number, number], [number, number]];
    big.things = [
      { id: "#p1", name: bram.name, kind: "person", fixed: true, mounted: false, shapes: [{ box: box(-9, -9, bram.height) }], appearance: bram.appearance },
      // A rack 1.5 m behind him (north), and a person hidden behind a tall cabinet.
      { id: "#rack", name: "rack", kind: "object", fixed: true, mounted: false, shapes: [{ box: [[-9.4, -8.6], [-7.7, -7.3], [0, 1.3]] }], classes: ["shelf", "thing"] },
      { id: "#p2", name: "Hidden", kind: "person", fixed: true, mounted: false, shapes: [{ box: box(6, 6, 1.7) }] },
      { id: "#cab", name: "cabinet", kind: "object", fixed: true, mounted: false, shapes: [{ box: [[5, 7.5], [3.5, 4.5], [0, 4]] }], classes: ["shelf", "thing"] },
    ];
    const placed = placeThings(big);
    const faced = withBodyFacings(big, { "#p1": [0, 1, 0] });
    const scene = buildRoomScene({ layout: faced, placed: placeThings(faced), youId: "" });
    scene.root.updateMatrixWorld(true);
    const size = { width: 276, height: 207 };
    const camera = new THREE.PerspectiveCamera(DOLLHOUSE_FOV, size.width / size.height, 0.05, 200);
    camera.up.set(0, 0, 1);
    const pose = dollhousePose(big);
    camera.position.set(...pose.position);
    const target = new THREE.Vector3(...pose.target);
    camera.lookAt(target);
    camera.updateMatrixWorld();
    const pixel = (p: THREE.Vector3) => {
      const v = p.clone().project(camera);
      return { x: ((v.x + 1) / 2) * size.width, y: ((1 - v.y) / 2) * size.height };
    };
    const face = zoomFocus(placed[0].bounds, big);
    // His whole figure is under 4 px tall here.
    const feet = pixel(new THREE.Vector3(-9, -9, 0));
    const crown = pixel(new THREE.Vector3(-9, -9, bram.height));
    expect(feet.y - crown.y).toBeLessThan(4);
    // Two pixels to his right at mid height (the ray meets the floor behind him): his face. Before, the floor.
    const beside = { x: Math.max(feet.x, crown.x) + 2.5, y: (feet.y + crown.y) / 2 };
    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2((beside.x / size.width) * 2 - 1, -(beside.y / size.height) * 2 + 1), camera);
    expect(ray.intersectObject(scene.things.get("#p1") as THREE.Object3D, true)).toEqual([]);
    const pick = wheelZoomPoint(camera, beside, size, scene, placed, big);
    expect(pick?.point.distanceTo(face)).toBeLessThan(1e-9);
    // Beyond the tolerance, the floor or the rack, not him.
    const far = wheelZoomPoint(camera, { x: beside.x + PICK_TOLERANCE + 2, y: beside.y }, size, scene, placed, big);
    expect(far?.point.distanceTo(face)).toBeGreaterThan(0.5);
    // A person hidden behind the cabinet is not picked from beside them; the cabinet is.
    const hidden = wheelZoomPoint(camera, pixel(new THREE.Vector3(6, 6, 1.5)), size, scene, placed, big);
    expect(hidden?.point.distanceTo(zoomFocus(placed[2].bounds, big))).toBeGreaterThan(0.5);

    // Twenty notches from there, then any number more: close, his face in the middle, the camera never inside his box (grown by 10 cm).
    const step = wheelStep(big);
    const grown = new THREE.Box3(new THREE.Vector3(-9.3, -9.3, 0), new THREE.Vector3(-8.7, -8.7, bram.height + 0.1));
    for (let i = 1; i <= 60; i++) {
      wheelZoom(camera.position, target, pick?.point as THREE.Vector3, step, pick?.nearest);
      camera.lookAt(target);
      camera.updateMatrixWorld();
      expect(grown.containsPoint(camera.position), `notch ${i}`).toBe(false);
      expect(camera.position.distanceTo(face), `notch ${i}`).toBeGreaterThanOrEqual(ZOOM_NEAREST - 1e-9);
      if (i === 20) {
        expect(camera.position.distanceTo(face)).toBeLessThan(2.5);
        const v = face.clone().project(camera);
        expect(Math.hypot(v.x, v.y)).toBeLessThan(0.05);
      }
    }
    disposeRoomScene(scene);
  });

  describe("wheel with the pointer on or near a name label (live guest check, 2026-11-16)", () => {
    // The live check's room #3510: 10 x 10 m, the viewer at the north door, three people; a 276 x 207 picture.
    type Range = [number, number];
    const standing = (id: string, name: string, x: number, y: number, ch: (typeof TEST_CHARACTERS)[number]) => ({
      id,
      name,
      kind: "person" as const,
      fixed: true,
      mounted: false,
      shapes: [{ box: [[x - 0.2, x + 0.2], [y - 0.2, y + 0.2], [0, 1.75]] as [Range, Range, Range] }],
      appearance: ch.appearance,
    });
    const size = { width: 276, height: 207 };
    const LABEL_HEIGHT = 14.4;
    const LABEL_WIDTH = 72;

    /** The room in the dollhouse's whole-room view, walls cut as drawn, and helpers to find people on screen. */
    const dollhouse = (layout: RoomLayout, youId: string) => {
      const placed = placeThings(layout, {});
      const scene = buildRoomScene({ layout, placed, arrivals: [], youId });
      const camera = new THREE.PerspectiveCamera(DOLLHOUSE_FOV, size.width / size.height, 0.05, 400);
      camera.up.set(0, 0, 1);
      const pose = dollhousePose(layout);
      camera.position.set(...pose.position);
      const target = new THREE.Vector3(...pose.target);
      camera.lookAt(target);
      camera.updateMatrixWorld();
      cutWalls(scene, layout, camera.position, "dollhouse");
      scene.root.updateMatrixWorld(true);
      // Where a person's label hangs (the top of their head as drawn), as the 3D view finds it.
      const headTop = (id: string) => screenTop(scene.labelPoints.get(id) as THREE.Vector3[], camera, size.width, size.height) as { x: number; top: number };
      // A person's label as drawn: centred at `x`, its bottom at `bottom`.
      const label = (id: string, x: number, bottom: number) => ({ id, x0: x - LABEL_WIDTH / 2, x1: x + LABEL_WIDTH / 2, y0: bottom - LABEL_HEIGHT, y1: bottom });
      const face = (id: string) => zoomFocus((placed.find((p) => p.thing.id === id) as (typeof placed)[number]).bounds, layout);
      return { placed, scene, camera, target, headTop, label, face };
    };
    // In the room or on its walls (drawn 8 cm thick, outside the room's box).
    const inRoom = (p: THREE.Vector3, layout: RoomLayout) =>
      Math.abs(p.x) <= layout.size[0] / 2 + 0.08 + 1e-6 && Math.abs(p.y) <= layout.size[1] / 2 + 0.08 + 1e-6 && p.z >= -1e-6 && p.z <= layout.size[2] + 1e-6;

    const room3510 = (): RoomLayout => ({
      num: 3510,
      size: [10, 10, 3],
      exits: [{ name: "north", to: 3509, at: [0, 5, 0], width: 1 }],
      things: [
        standing("#v", "Viewer Vosk", 0, 4.8, TEST_CHARACTERS[0]),
        standing("#s2", "Tamsin Reed", 0, 2.05, TEST_CHARACTERS[2]),
        standing("#s1", "Orrin Vale", -2.04, 2.76, TEST_CHARACTERS[1]),
        standing("#s3", "Tangra Moss", -3.45, 0.8, TEST_CHARACTERS[3]),
      ],
    });

    it("picks the person whose label the pointer is on or just under, though their head is further than the pick distance", () => {
      const layout = room3510();
      const { placed, scene, camera, headTop, label, face } = dollhouse(layout, "#v");
      // S1's label raised 27 px above the head (stacked); the pointer 8 px under it, 19 px above the head.
      const s1 = headTop("#s1");
      const s1Label = label("#s1", s1.x, s1.top - 27);
      const underS1 = { x: s1.x, y: s1Label.y1 + 8 };
      expect(wheelZoomPoint(camera, underS1, size, scene, placed, layout, [s1Label])?.point.distanceTo(face("#s1"))).toBeLessThan(1e-9);
      // S3's label pushed 17 px to the side; the pointer 8 px under its middle.
      const s3 = headTop("#s3");
      const s3Label = label("#s3", s3.x - 17, s3.top - 3);
      const underS3 = { x: s3.x - 17, y: s3Label.y1 + 8 };
      expect(wheelZoomPoint(camera, underS3, size, scene, placed, layout, [s1Label, s3Label])?.point.distanceTo(face("#s3"))).toBeLessThan(1e-9);
      // On the label itself, too.
      expect(wheelZoomPoint(camera, { x: s1.x + 20, y: s1Label.y0 + 5 }, size, scene, placed, layout, [s1Label, s3Label])?.point.distanceTo(face("#s1"))).toBeLessThan(1e-9);
      disposeRoomScene(scene);
    });

    it("never zooms through a wall or out of the room, wherever the pointer is", () => {
      const layout = room3510();
      const { placed, scene, camera, target, headTop } = dollhouse(layout, "#v");
      const s1 = headTop("#s1");
      const s3 = headTop("#s3");
      // The live check's two pointers with no label known there (above S1's head on the wall behind, beside S3), and a sweep of the whole picture.
      const pointers = [
        { x: s1.x, y: s1.top - 19 },
        { x: s3.x - 17, y: s3.top + 5 },
      ];
      for (let x = 2; x < size.width; x += 18) for (let y = 2; y < size.height; y += 15) pointers.push({ x, y });
      const start = camera.position.clone();
      const startTarget = target.clone();
      const step = wheelStep(layout);
      for (const at of pointers) {
        const where = `pointer (${at.x.toFixed(1)}, ${at.y.toFixed(1)})`;
        const pick = wheelZoomPoint(camera, at, size, scene, placed, layout);
        if (pick) expect(inRoom(pick.point, layout), where).toBe(true);
        // Sixty notches from the whole-room view: the camera never passes a wall the dollhouse draws full height (north, west here).
        const position = start.clone();
        const orbit = startTarget.clone();
        for (let i = 0; i < 60; i++) {
          wheelZoom(position, orbit, pick?.point ?? orbit.clone(), step, pick?.nearest ?? ZOOM_NEAREST);
          expect(position.y, `${where}, notch ${i + 1}`).toBeLessThan(layout.size[1] / 2);
          expect(position.x, `${where}, notch ${i + 1}`).toBeGreaterThan(-layout.size[0] / 2);
        }
      }
      disposeRoomScene(scene);
    });

    it("lets the label under the pointer win over a nearer head of someone else further back", () => {
      // The live check's room #442 (50 x 50 m): S1 at (3.9, 0), the viewer at (21.9, 0), and another person further back.
      const layout: RoomLayout = {
        num: 442,
        size: [50, 50, 4],
        exits: [],
        things: [standing("#v", "Viewer Vosk", 21.9, 0, TEST_CHARACTERS[0]), standing("#s1", "Orrin Vale", 3.9, 0, TEST_CHARACTERS[1])],
      };
      const first = dollhouse(layout, "#v");
      const s1 = first.headTop("#s1");
      // S1's label 14 px above the head; the pointer 3 px under it, about 10 px above the head.
      const s1Label = first.label("#s1", s1.x, s1.top - 14);
      const pointer = { x: s1.x, y: s1Label.y1 + 3 };
      expect(s1.top - pointer.y).toBeGreaterThan(PICK_TOLERANCE - 2);
      // The other person stands where the pointer's ray meets waist height, further back: the pointer is on their figure.
      const ray = new THREE.Raycaster();
      ray.setFromCamera(new THREE.Vector2((pointer.x / size.width) * 2 - 1, -(pointer.y / size.height) * 2 + 1), first.camera);
      const waist = ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), -1.2), new THREE.Vector3()) as THREE.Vector3;
      expect(first.camera.position.distanceTo(waist)).toBeGreaterThan(first.camera.position.distanceTo(first.face("#s1")));
      disposeRoomScene(first.scene);
      layout.things.push(standing("#other", "Kestrel Ash", waist.x, waist.y, TEST_CHARACTERS[2]));
      const { placed, scene, camera, face, label } = dollhouse(layout, "#v");
      // Without the label the nearer figure wins (what the live check saw); with it, S1.
      expect(wheelZoomPoint(camera, pointer, size, scene, placed, layout)?.point.distanceTo(face("#other"))).toBeLessThan(1e-9);
      const pick = wheelZoomPoint(camera, pointer, size, scene, placed, layout, [label("#s1", s1Label.x0 + LABEL_WIDTH / 2, s1Label.y1)]);
      expect(pick?.point.distanceTo(face("#s1"))).toBeLessThan(1e-9);
      disposeRoomScene(scene);
    });
  });

  it("brings a person close in about twenty wheel notches in a room of any size", () => {
    // OrbitControls' fixed 0.95 a notch took 80 and more in a 50 m room.
    for (const size of [5, 12, 50, 100]) {
      const layout: RoomLayout = { ...livingRoomLayout(), size: [size, size, Math.min(size, 4)] };
      const pose = dollhousePose(layout);
      const camera = new THREE.Vector3(...pose.position);
      const target = new THREE.Vector3(...pose.target);
      // A face a third of the way out toward the south-west corner.
      const face = new THREE.Vector3(-size / 6, -size / 6, 1.6);
      const step = wheelStep(layout);
      let notches = 0;
      while (camera.distanceTo(face) > 2 && notches < 200) {
        wheelZoom(camera, target, face, step);
        notches++;
      }
      expect(notches, `${size} m room`).toBeGreaterThanOrEqual(15);
      expect(notches, `${size} m room`).toBeLessThanOrEqual(25);
    }
    // A room smaller than its close-up distance keeps the small-room step.
    expect(wheelStep({ ...livingRoomLayout(), size: [1, 1, 2] })).toBe(0.95);
  });

  it("puts a person's label just over the head as drawn, from any distance and angle", () => {
    // Every standing test character: long hair, an afro, hoods, a cloak, antlers.
    for (const ch of TEST_CHARACTERS.filter((c) => (c.appearance.posture ?? "standing") === "standing")) {
      const layout = livingRoomLayout();
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
      const scene = build(layout);
      scene.root.updateMatrixWorld(true);
      const figure = meshes(scene.things.get("#p"))[0];
      const position = figure.geometry.getAttribute("position");
      const points = scene.labelPoints.get("#p") as THREE.Vector3[];
      const params = figureParams(ch.appearance, { height: ch.height, base: "#000000" });
      for (const distance of [0.8, 1.5, 4, 20, 80]) {
        for (const [turn, rise] of [[0, 0.1], [Math.PI / 2, 0.5], [Math.PI, 1], [-Math.PI / 4, 1.4]]) {
          const camera = new THREE.PerspectiveCamera(DOLLHOUSE_FOV, 4 / 3, 0.05, 200);
          camera.up.set(0, 0, 1);
          const head = new THREE.Vector3(0, 0, ch.height - 0.1);
          camera.position.set(Math.sin(turn) * Math.cos(rise), -Math.cos(turn) * Math.cos(rise), Math.sin(rise)).multiplyScalar(distance).add(head);
          camera.lookAt(head);
          camera.updateMatrixWorld();
          const shown = screenTop(points, camera, 800, 600);
          expect(shown).toBeDefined();
          // No point of the head, hair, hat or antlers (all above the chin) is drawn above the label's line
          // on screen, and the head's top is right below it (within 3 px), so the label stays close.
          const chin = params.top - params.headHeight * 1.05;
          let highest = Number.POSITIVE_INFINITY;
          const v = new THREE.Vector3();
          for (let i = 0; i < position.count; i++) {
            v.fromBufferAttribute(position, i).applyMatrix4(figure.matrixWorld);
            if (v.z < chin) continue;
            v.project(camera);
            if (Math.abs(v.z) <= 1) highest = Math.min(highest, ((1 - v.y) / 2) * 600);
          }
          const where = `${ch.name} at ${distance} m, turn ${turn.toFixed(2)}, rise ${rise}`;
          expect(highest, where).toBeGreaterThanOrEqual((shown?.top ?? 0) - 1);
          expect(highest - (shown?.top ?? 0), where).toBeLessThan(3);
        }
      }
    }
  });

  it("places no label over any person's head as drawn, close up with people and a thing behind", () => {
    // Bram faces the camera; Cleo stands 1 m behind him and a tall rack 1.6 m behind; the camera comes close from a little above.
    const layout = livingRoomLayout();
    const person = (id: string, ch: (typeof TEST_CHARACTERS)[number], x: number, y: number) => ({
      id,
      name: ch.name,
      kind: "person" as const,
      fixed: true,
      mounted: false,
      shapes: [{ box: [[x - 0.2, x + 0.2], [y - 0.2, y + 0.2], [0, ch.height]] as [[number, number], [number, number], [number, number]] }],
      appearance: ch.appearance,
    });
    layout.things = [
      person("#bram", TEST_CHARACTERS[1], 0, 0),
      person("#cleo", TEST_CHARACTERS[2], 0.15, 1),
      { id: "#rack", name: "a newspaper rack of The Daily Caption", kind: "object", fixed: true, mounted: false, shapes: [{ box: [[-0.4, 0.4], [1.4, 1.8], [0, 1.3]] }], classes: ["shelf", "thing"] },
    ];
    const placed = placeThings(layout);
    const scene = buildRoomScene({ layout, placed, youId: "" });
    scene.root.updateMatrixWorld(true);
    const [w, h] = [276, 207];
    const order = ["#bram", "#cleo", "#rack"];
    const texts: Record<string, string> = { "#bram": "Bram Okoro", "#cleo": "Cleo Marsh", "#rack": "a newspaper rack of…" };
    // Each person's head as drawn: every figure vertex above the chin, projected.
    const drawnHead = (id: string, camera: THREE.Camera) => {
      const figure = meshes(scene.things.get(id))[0];
      const ch = id === "#bram" ? TEST_CHARACTERS[1] : TEST_CHARACTERS[2];
      const params = figureParams(ch.appearance, { height: ch.height, base: "#000000" });
      const chin = params.top - params.headHeight * 1.05;
      const position = figure.geometry.getAttribute("position");
      const box = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };
      const v = new THREE.Vector3();
      for (let i = 0; i < position.count; i++) {
        v.fromBufferAttribute(position, i).applyMatrix4(figure.matrixWorld);
        if (v.z < chin) continue;
        v.project(camera);
        box.x0 = Math.min(box.x0, ((v.x + 1) / 2) * w);
        box.x1 = Math.max(box.x1, ((v.x + 1) / 2) * w);
        box.y0 = Math.min(box.y0, ((1 - v.y) / 2) * h);
        box.y1 = Math.max(box.y1, ((1 - v.y) / 2) * h);
      }
      return box;
    };
    const overHead = (labels: ReturnType<typeof placeLabelsOver>, camera: THREE.Camera) =>
      labels.flatMap((label) => {
        const half = texts[label.id].length * 3;
        const box = { x0: label.x - half, x1: label.x + half, y0: label.y - 7.2, y1: label.y + 7.2 };
        return ["#bram", "#cleo"]
          .filter((id) => {
            const head = drawnHead(id, camera);
            return box.x0 < head.x1 && head.x0 < box.x1 && box.y0 < head.y1 && head.y0 < box.y1;
          })
          .map((id) => `${label.id} over ${id}`);
      });
    let coveredBefore = 0;
    for (const distance of [0.9, 1.3, 2, 3]) {
      for (const rise of [0, 0.15, 0.35]) {
        for (const turn of [-0.3, 0, 0.3]) {
          const camera = new THREE.PerspectiveCamera(DOLLHOUSE_FOV, w / h, 0.05, 200);
          camera.up.set(0, 0, 1);
          const face = new THREE.Vector3(0, 0, TEST_CHARACTERS[1].height * 0.9);
          camera.position.set(Math.sin(turn) * Math.cos(rise), -Math.cos(turn) * Math.cos(rise), Math.sin(rise)).multiplyScalar(distance).add(face);
          camera.lookAt(face);
          camera.updateMatrixWorld();
          // As the 3D view asks: centred over the top as drawn, with the drawn label size; heads from `heads`.
          const requests = order.flatMap((id) => {
            const shown = screenTop(scene.labelPoints.get(id) as THREE.Vector3[], camera, w, h);
            return shown ? [{ id, text: texts[id], x: shown.x, top: shown.top, width: texts[id].length * 6, height: 14.4 }] : [];
          });
          const heads = ["#bram", "#cleo"].flatMap((id) => {
            const box = screenBox(scene.heads.get(id) as THREE.Vector3[], camera, w, h);
            return box ? [{ id, ...box }] : [];
          });
          const frame = { x0: 4, x1: w - 4, y0: 4, y1: h - 4 };
          const where = `distance ${distance}, rise ${rise}, turn ${turn}`;
          expect(overHead(placeLabelsOver(requests, 3, frame, heads), camera), where).toEqual([]);
          coveredBefore += overHead(placeLabelsOver(requests, 3, frame), camera).length;
        }
      }
    }
    // Without the heads kept clear (the old placement), labels did lie over faces in these views.
    expect(coveredBefore).toBeGreaterThan(0);
    disposeRoomScene(scene);
  });

  it("reads two fingers as a pinch: spacing before over after, onto where it began", () => {
    const pinch = new Pinch();
    pinch.down(1, 100, 200);
    expect(pinch.move(1, 90, 200)).toBeUndefined(); // one finger turns; it is no pinch
    pinch.down(2, 190, 200);
    expect(pinch.pinching).toBe(true);
    // Spread from 100 px apart to 200: twice as close, onto the midpoint where they started.
    const a = pinch.move(1, 40, 200);
    const b = pinch.move(2, 240, 200);
    expect(a?.at).toEqual({ x: 140, y: 200 });
    expect(b?.at).toEqual({ x: 140, y: 200 });
    expect((a?.scale ?? 0) * (b?.scale ?? 0)).toBeCloseTo(0.5, 9);
    // A third finger ends it; lifting back to two does not start a new one until a finger comes down again.
    pinch.down(3, 0, 0);
    expect(pinch.move(1, 10, 200)).toBeUndefined();
    pinch.up(3);
    expect(pinch.pinching).toBe(false);
    expect(pinch.move(1, 0, 200)).toBeUndefined();
  });

  it("pinches the dollhouse onto a person, then one finger turns round them", () => {
    const big: RoomLayout = { ...livingRoomLayout(), size: [50, 50, 50] };
    const face = new THREE.Vector3(-9, -9, 1.75);
    const camera = new THREE.PerspectiveCamera(DOLLHOUSE_FOV, 4 / 3, 0.05, 200);
    camera.up.set(0, 0, 1);
    const element = document.createElement("div");
    // jsdom lays nothing out: give the picture its size, and pointer capture as a browser has it.
    Object.assign(element, { setPointerCapture: () => {}, releasePointerCapture: () => {} });
    Object.defineProperties(element, { clientWidth: { value: 800 }, clientHeight: { value: 600 } });
    document.body.appendChild(element);
    const controls = new OrbitControls(camera, element);
    controls.touches.TWO = null;
    controls.maxDistance = dollhouseMaxDistance(big);
    const pose = dollhousePose(big);
    camera.position.set(...pose.position);
    controls.target.set(...pose.target);
    controls.update();
    const touch = (type: string, pointerId: number, x: number, y: number) => {
      const event = new MouseEvent(type, { clientX: x, clientY: y, bubbles: true });
      Object.defineProperties(event, { pointerId: { value: pointerId }, pointerType: { value: "touch" }, pageX: { value: x }, pageY: { value: y } });
      element.dispatchEvent(event);
      return event;
    };
    const inMiddle = () => {
      camera.updateMatrixWorld();
      const at = face.clone().project(camera);
      return Math.hypot(at.x, at.y);
    };

    // Two fingers spread apart: the controls do nothing with them; the pinch zooms onto the face.
    const pinch = new Pinch();
    const before = camera.position.clone();
    touch("pointerdown", 1, 300, 300);
    pinch.down(1, 300, 300);
    touch("pointerdown", 2, 310, 300);
    pinch.down(2, 310, 300);
    for (let i = 1; i <= 40; i++) {
      const was = camera.position.clone();
      touch("pointermove", 2, 310 + i * 10, 300);
      expect(camera.position.distanceTo(was)).toBe(0);
      const step = pinch.move(2, 310 + i * 10, 300);
      if (step) {
        wheelZoom(camera.position, controls.target, face, step.scale);
        controls.update();
      }
    }
    // Forty-one times as far apart: forty-one times closer.
    expect(camera.position.distanceTo(face)).toBeCloseTo(before.distanceTo(face) / 41, 6);
    expect(inMiddle()).toBeLessThan(0.02);
    touch("pointerup", 2, 710, 300);
    pinch.up(2);

    // The finger left down drags sideways: the controls turn the view round the face, which stays in the middle.
    const near = camera.position.distanceTo(face);
    const start = camera.position.clone();
    for (let i = 1; i <= 20; i++) {
      touch("pointermove", 1, 300 + i * 15, 300);
      expect(inMiddle()).toBeLessThan(0.02);
    }
    expect(camera.position.distanceTo(start)).toBeGreaterThan(near * 0.5);
    // Round the face: the turn centre is within millimetres of it after the pinch.
    expect(camera.position.distanceTo(face)).toBeCloseTo(near, 1);
    touch("pointerup", 1, 600, 300);
    controls.dispose();
    element.remove();
  });

  it("counts one mouse-wheel notch as one notch, whatever the browser sends for it, and a trackpad in proportion", () => {
    // One notch as browsers' source builds it (log: reports/player-avatars-client-3d-labels-2026-11-16.md).
    expect(wheelNotches(-100, 0)).toBe(1); // Chromium, Windows, 3 lines, any display scale
    expect(wheelNotches(200, 0)).toBe(1); // Chromium, Windows set to 6 lines; or page zoom 50%
    expect(wheelNotches(-120, 0)).toBe(1); // Chromium, Linux X11
    expect(wheelNotches(-3, 1)).toBe(1); // Firefox, Windows, deltaMode read first
    expect(wheelNotches(-6, 1)).toBe(1); // Firefox with its system scroll speed-up
    expect(wheelNotches(1, 2)).toBe(1); // "one screen at a time"
    // A high-resolution wheel's quarter-notch events, and a trackpad's stream of small deltas, add up in proportion.
    expect(wheelNotches(25, 0) * 4).toBeCloseTo(1, 9);
    expect(wheelNotches(0.75, 1) * 4).toBeCloseTo(1, 9);
    expect(Array.from({ length: 50 }, () => wheelNotches(4, 0)).reduce((a, b) => a + b, 0)).toBeCloseTo(2, 9);
    // Chromium at page zoom 300% sends a notch as 33.3 (and Playwright's wheel at device scale 3 arrives so too):
    // the event alone cannot tell it from a trackpad's 33 px, so it counts as a third.
    expect(wheelNotches(100 / 3, 0)).toBeCloseTo(1 / 3, 9);
  });

  it("zooms Your eyes by a wheel's notches, fractions too, within the same limits as the keys", () => {
    expect(zoomedFovBy(EYES_FOV, 1)).toBeCloseTo(zoomedFov(EYES_FOV, "+") as number, 9);
    expect(zoomedFovBy(EYES_FOV, 0.25) ** 4 / EYES_FOV ** 3).toBeCloseTo(zoomedFovBy(EYES_FOV, 1), 6);
    expect(zoomedFovBy(EYES_FOV, -3)).toBe(EYES_FOV);
    expect(zoomedFovBy(EYES_MIN_FOV, 5)).toBe(EYES_MIN_FOV);
  });

  it("lets the dollhouse reach a large room's whole-room view", () => {
    const big: RoomLayout = { ...livingRoomLayout(), size: [50, 50, 50] };
    const pose = dollhousePose(big);
    const distance = Math.hypot(...pose.position.map((v, i) => v - pose.target[i]));
    // A 50 m room needs about 87 m; the fixed limit was 60.
    expect(distance).toBeGreaterThan(60);
    expect(dollhouseMaxDistance(big)).toBeGreaterThan(distance);
    expect(dollhouseMaxDistance(livingRoomLayout())).toBe(60);
  });

  it("zooms Your eyes by narrowing the field of view, within limits", () => {
    expect(zoomedFov(EYES_FOV, "+")).toBeLessThan(EYES_FOV);
    expect(zoomedFov(EYES_FOV, "-")).toBe(EYES_FOV);
    expect(zoomedFov(30, "-")).toBeGreaterThan(30);
    let fov = EYES_FOV;
    for (let i = 0; i < 40; i++) fov = zoomedFov(fov, "=") ?? fov;
    expect(fov).toBe(EYES_MIN_FOV);
    expect(zoomedFov(20, "0")).toBe(EYES_FOV);
    expect(zoomedFov(20, "x")).toBeUndefined();
  });

  it("starts the dollhouse above the room's south side, looking into it", () => {
    const layout = livingRoomLayout();
    const { position, target } = dollhousePose(layout);
    expect(position[1]).toBeLessThan(-layout.size[1] / 2);
    expect(position[2]).toBeGreaterThan(layout.size[2]);
    expect(Math.abs(target[0])).toBeLessThan(0.01);
    expect(Math.abs(target[1])).toBeLessThan(0.01);
  });

  it("puts your eyes at your Client.Spatial position facing your forward", () => {
    const layout = livingRoomLayout();
    const pose = eyesPose(layout, [1.6, 0.4, 1.67], [-2, 0, 0], undefined);
    expect(pose.position).toEqual([1.6, 0.4, 1.67]);
    expect(pose.target[0]).toBeCloseTo(0.6);
    expect(pose.target[1]).toBeCloseTo(0.4);
    expect(pose.target[2]).toBeCloseTo(1.67);
  });

  it("without a position uses your body, and without a facing looks north", () => {
    const layout = livingRoomLayout();
    const placed = placeThings(layout);
    const you = placed.find((p) => p.thing.id === "#99")?.bounds;
    const pose = eyesPose(layout, null, null, you);
    expect(pose.position[0]).toBeCloseTo(1.6);
    expect(pose.position[1]).toBeCloseTo(0.4);
    expect(pose.position[2]).toBeCloseTo(1.7);
    expect(pose.target[1] - pose.position[1]).toBeCloseTo(1);
    expect(eyesPose(layout, [0, 0, 0], null, undefined).position[2]).toBe(DEFAULT_EYE_HEIGHT);
  });
});
