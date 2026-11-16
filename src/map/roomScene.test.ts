import * as THREE from "three";
import { describe, expect, it } from "vitest";

import { suppliedHexes, TEST_CHARACTERS } from "../avatar/characters.fixture";
import { figureParams, NEUTRAL_CLOTHING, NEUTRAL_SKIN } from "../avatar/figure";
import type { RoomLayout } from "../gmcp/Room";
import { crowdLayout, livingRoomLayout } from "./roomLayout.fixture";
import laundry from "./roomLayout.sample-1770.json";
import livingRoom from "./roomLayout.sample-25828.json";
import { placeThings } from "./roomLayout";
import {
  buildRoomScene,
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
  YOU_COLOUR,
  ZOOM_STEP,
  zoomedFov,
} from "./roomScene";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const build = (layout: RoomLayout, youId = "#99") =>
  buildRoomScene({ layout, placed: placeThings(layout, {}), arrivals: [], youId });

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
    const scene = buildRoomScene({ layout, placed: placeThings(layout, {}), arrivals: [], youId: "#99", facings: { "#9": [1, 0, 0] } });
    const colours = figureColours("#9", scene);
    expect(colours.length).toBeGreaterThan(3);
    const supplied = suppliedHexes(ch.appearance);
    const ink = figureParams(ch.appearance, { height: 1.7, base: "#000000" }).colours.ink;
    for (const c of colours) expect(supplied.has(hex(c)) || hex(c) === ink, hex(c)).toBe(true);
    const body = meshes(scene.things.get("#9"))[0];
    // Facing east: its own +y turned onto +x.
    expect(new THREE.Vector3(0, 1, 0).applyEuler(body.rotation).x).toBeCloseTo(1);
    const bounds = box(body);
    expect(bounds.min.z).toBeCloseTo(0, 1);
    expect(bounds.max.z).toBeLessThan(1.8);
    expect(scene.labelAnchors.get("#9")?.z).toBeGreaterThan(bounds.max.z - 0.2);
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
      return buildRoomScene({ layout, placed: placeThings(layout, {}), arrivals: [], youId: "#99", figures });
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
    // Freckles, a mole and dimples stay in the portrait.
    expect(inkVertices({ ...plain, features: ["freckles", "mole", "dimples"] }).zs).toHaveLength(bare.zs.length);
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
      const placed = placeThings(layout, {});
      let scene = buildRoomScene({ layout, placed, arrivals: [], youId: "", figures });
      // Fresh builds are slow; fewer rounds keep the suite quick.
      const rounds = figures ? 30 : 5;
      const start = performance.now();
      for (let i = 0; i < rounds; i++) {
        disposeRoomScene(scene);
        scene = buildRoomScene({ layout, placed, arrivals: [], youId: "", figures });
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
    const first = buildRoomScene({ layout, placed: placeThings(layout, {}), arrivals: [], youId: "", figures });
    const geometryOf = (scene: ReturnType<typeof buildRoomScene>, id: string) => meshes(scene.things.get(id))[0].geometry;
    const kept = geometryOf(first, "#p0");
    const changed = geometryOf(first, "#p1");
    const leaving = geometryOf(first, "#p2");
    const freed = new Set<THREE.BufferGeometry>();
    for (const g of [kept, changed, leaving]) g.addEventListener("dispose", () => freed.add(g));
    disposeRoomScene(first);
    expect(freed.size).toBe(0);

    // #p0 moves and turns, #p1 changes clothes, #p2 leaves.
    const next: RoomLayout = {
      ...layout,
      things: [
        { ...layout.things[0], origin: [0, 0, 0] },
        { ...layout.things[1], appearance: { ...layout.things[1].appearance, garments: [] } },
      ],
    };
    const second = buildRoomScene({
      layout: next,
      placed: placeThings(next, { "#p0": [1, 1, 0] }),
      arrivals: [],
      youId: "",
      figures,
      facings: { "#p0": [1, 0, 0] },
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
    const placed = placeThings(layout, {});
    buildRoomScene({ layout, placed, arrivals: [], youId: "" }); // warm-up
    const start = performance.now();
    const scene = buildRoomScene({ layout, placed, arrivals: [], youId: "" });
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

  it("draws someone who entered after the layout as a person standing at their Client.Spatial point", () => {
    const layout = livingRoomLayout();
    const scene = buildRoomScene({
      layout,
      placed: placeThings(layout, {}),
      arrivals: [{ arrival: { id: "#77", name: "Zed", kind: "player" }, at: [1, -1, 1.6] }],
      youId: "#99",
    });
    const zed = scene.things.get("#77");
    expect(zed?.userData.form).toBe("person");
    const body = box(meshes(zed)[0]);
    expect(body.min.z).toBeCloseTo(0, 1);
    expect((body.min.x + body.max.x) / 2).toBeCloseTo(1, 1);
    expect(figureColours("#77", scene)).toEqual([PERSON_COLOUR]);
    expect(scene.labelAnchors.get("#77")?.z).toBeGreaterThan(1.6);
  });
});

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
    const placed = placeThings(layout, {});
    const you = placed.find((p) => p.thing.id === "#99")?.bounds;
    const pose = eyesPose(layout, null, null, you);
    expect(pose.position[0]).toBeCloseTo(1.6);
    expect(pose.position[1]).toBeCloseTo(0.4);
    expect(pose.position[2]).toBeCloseTo(1.7);
    expect(pose.target[1] - pose.position[1]).toBeCloseTo(1);
    expect(eyesPose(layout, [0, 0, 0], null, undefined).position[2]).toBe(DEFAULT_EYE_HEIGHT);
  });
});
