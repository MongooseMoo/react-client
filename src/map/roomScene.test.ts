import * as THREE from "three";
import { describe, expect, it } from "vitest";

import type { RoomLayout } from "../gmcp/Room";
import { livingRoomLayout } from "./roomLayout.fixture";
import laundry from "./roomLayout.sample-1770.json";
import livingRoom from "./roomLayout.sample-25828.json";
import { placeThings } from "./roomLayout";
import {
  buildRoomScene,
  CUT_WALL_HEIGHT,
  cutWalls,
  DEFAULT_EYE_HEIGHT,
  disposeRoomScene,
  dollhousePose,
  eyesPose,
  MATERIAL_COLOURS,
  NEUTRAL,
  PERSON_COLOUR,
  YOU_COLOUR,
} from "./roomScene";

const build = (layout: RoomLayout, youId = "#99") =>
  buildRoomScene({ layout, placed: placeThings(layout, {}), arrivals: [], youId });

const meshes = (group: THREE.Object3D | undefined) =>
  (group?.children ?? []).filter((c): c is THREE.Mesh => c instanceof THREE.Mesh);
const parts = (group: THREE.Object3D | undefined) => meshes(group).map((m) => m.userData.part);
const colour = (mesh: THREE.Mesh) => (mesh.material as THREE.MeshStandardMaterial).color.getHex();
const box = (mesh: THREE.Mesh) => new THREE.Box3().setFromObject(mesh);

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

  it("colours things by their largest material, people green and you blue", () => {
    const scene = build(livingRoomLayout());
    const first = (id: string) => colour(meshes(scene.things.get(id))[0]);
    expect(first("#1")).toBe(MATERIAL_COLOURS.wood);
    expect(first("#2")).toBe(MATERIAL_COLOURS.cotton);
    expect(colour(meshes(scene.things.get("#4"))[1])).toBe(MATERIAL_COLOURS.paper);
    expect(first("#8")).toBe(NEUTRAL);
    expect(first("#99")).toBe(YOU_COLOUR);
    expect(first("#9")).toBe(PERSON_COLOUR);
    expect(meshes(scene.things.get("#9"))[0].geometry).toBeInstanceOf(THREE.CapsuleGeometry);
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
    expect(first("#2")).toBe(YOU_COLOUR);
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
    expect(body.min.z).toBeCloseTo(0);
    expect((body.min.x + body.max.x) / 2).toBeCloseTo(1);
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
