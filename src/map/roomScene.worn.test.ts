import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { figureParams } from "../avatar/figure";
import type { LayoutGarment, LayoutThing, RoomLayout } from "../gmcp/Room";
import { ARMOUR, armouredPerson, armourStand, CUIRASS, HELM, SHIELD, SWORD } from "./bodyFrames.fixture";
import { figureFrames } from "./bodyFrames";
import { placeThings } from "./roomLayout";
import { buildRoomScene, HELD_CLEARANCE, LAYER_GAP, scenePick, STAND_HEIGHT } from "./roomScene";

const room = (things: LayoutThing[]) => {
  const layout: RoomLayout = { num: 1, size: [8, 8, 3], exits: [], things };
  return buildRoomScene({ layout, placed: placeThings(layout), youId: "#none" });
};

/** Each mesh drawn for a thing whose part name starts with `prefix`, with its box in the room. */
function drawn(scene: ReturnType<typeof room>, id: string, prefix: string): Array<{ mesh: THREE.Mesh; box: THREE.Box3 }> {
  const out: Array<{ mesh: THREE.Mesh; box: THREE.Box3 }> = [];
  scene.things.get(id)?.traverse((o) => {
    if (o instanceof THREE.Mesh && String(o.userData.part ?? "").startsWith(prefix)) out.push({ mesh: o, box: new THREE.Box3().setFromObject(o) });
  });
  return out;
}

/** A frame point in the room for a person drawn at the origin facing south (`armouredPerson` with no yaw). */
function roomPoint(posture: "standing" | "sitting" | "reclining", frame: "head" | "right_hand", t: number): THREE.Vector3 {
  const p = figureParams({ posture }, { height: 1.75 });
  const f = figureFrames(p)?.[frame];
  if (!f) throw new Error("no frame");
  // The figure is its own frame turned half round about z.
  return f.origin.clone().addScaledVector(f.z, f.size.z * t).applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);
}

describe("worn and held things on figures", () => {
  it("draws each garment's parts on the person, the helm's dome over the head in every posture", () => {
    for (const posture of ["standing", "sitting", "reclining"] as const) {
      const scene = room([armouredPerson("#1", 0, { posture })]);
      const parts = drawn(scene, "#1", "worn ");
      expect(parts.length, posture).toBe(ARMOUR.reduce((n, g) => n + (g.form_parts?.length ?? 0), 0));
      const dome = drawn(scene, "#1", `worn ${HELM.name}`)[0].box;
      // The dome holds the crown of the head, wherever the head is.
      expect(dome.containsPoint(roomPoint(posture, "head", 0.95)), posture).toBe(true);
    }
  });

  it("selects the person on a click on a worn or held part, and the stand on a click on its parts", () => {
    const scene = room([armouredPerson("#1", 0), armourStand("#9", 2)]);
    for (const { mesh } of [...drawn(scene, "#1", "worn "), ...drawn(scene, "#1", "held ")]) expect(scenePick(mesh)).toEqual({ kind: "thing", id: "#1" });
    const stand = [...drawn(scene, "#9", "stand"), ...drawn(scene, "#9", "worn ")];
    expect(stand.length).toBeGreaterThan(7);
    for (const { mesh } of stand) expect(scenePick(mesh)).toEqual({ kind: "thing", id: "#9" });
  });

  it("draws a later layer outside an earlier one: the same part a layer up is drawn wider", () => {
    const shell = (name: string, layer: number): LayoutGarment => ({ ...CUIRASS, name, layer, form_parts: CUIRASS.form_parts?.slice(0, 1) });
    // Sent outer first: the layer, not the order sent, decides.
    const scene = room([armouredPerson("#1", 0, { garments: [shell("outer", 5), shell("inner", 2)], held: [] })]);
    const width = (name: string) => {
      const b = drawn(scene, "#1", `worn ${name}`)[0].box;
      return b.max.x - b.min.x;
    };
    expect(width("outer") / width("inner")).toBeCloseTo(1 + LAYER_GAP, 2);
  });

  it("keeps a garment with parts and no known area (a worn shield), and hides the hair under a helm drawn from parts", () => {
    const scene = room([armouredPerson("#1", 0, { garments: [SHIELD], held: [] })]);
    expect(drawn(scene, "#1", `worn ${SHIELD.name}`)).toHaveLength(2);
    const bare = { hair: { length_cm: 30, hex: "#222222" } };
    expect(figureParams(bare, { height: 1.75 }).hair).not.toBe("none");
    const helmOnly = { ...bare, garments: [{ ...HELM, areas: [] }] };
    expect(figureParams(helmOnly, { height: 1.75 })).toMatchObject({ hair: "none", headCovered: true });
  });

  it("holds a thing with its grip across the palm, its long end forward and 45 degrees down, rigid at its own size", () => {
    const scene = room([armouredPerson("#1", 0, { garments: [], held: [SWORD] })]);
    const parts = drawn(scene, "#1", `held ${SWORD.name}`);
    // Parts in the order sent: blade, crossguard, grip, pommel.
    const centre = (i: number) => new THREE.Box3().setFromObject(parts[i].mesh, true).getCenter(new THREE.Vector3());
    expect(centre(2).distanceTo(roomPoint("standing", "right_hand", 0.5))).toBeLessThan(1e-3);
    // The blade runs from the grip toward the person's front (south, -y in the room) and down, at 45 degrees.
    const along = centre(0).sub(centre(2)).normalize();
    expect(along.y).toBeCloseTo(-Math.SQRT1_2, 2);
    expect(along.z).toBeCloseTo(-Math.SQRT1_2, 2);
    const all = new THREE.Box3();
    for (const { mesh } of parts) all.union(new THREE.Box3().setFromObject(mesh, true));
    expect(all.min.distanceTo(all.max)).toBeGreaterThan(0.85);
  });

  it("draws nothing worn or held below the floor, raising a held thing toward level and turning a limb's parts, in every posture, build and height", () => {
    const people: LayoutThing[] = [];
    for (const posture of ["standing", "sitting", "reclining"] as const) {
      for (const build of ["slender", "average", "stocky"]) {
        for (const height of [1.2, 1.5, 1.75, 2.0]) people.push(armouredPerson(`#${people.length + 1}`, 1.2 * people.length, { posture, build, height }));
      }
    }
    const scene = room(people);
    for (const person of people) {
      for (const { mesh } of drawn(scene, person.id, "worn ")) expect(new THREE.Box3().setFromObject(mesh, true).min.z, person.id).toBeGreaterThanOrEqual(-1e-6);
      const held = new THREE.Box3();
      for (const { mesh } of drawn(scene, person.id, "held ")) held.union(new THREE.Box3().setFromObject(mesh, true));
      const lying = person.pose?.posture === "reclining";
      expect(held.min.z, person.id).toBeGreaterThanOrEqual(lying ? 0 : HELD_CLEARANCE - 1e-6);
    }
  });

  it("lays a held thing flat on the floor toward the feet when reclining, and turns a forearm's shield over the arm, face up", () => {
    const scene = room([armouredPerson("#1", 0, { posture: "reclining", garments: [SHIELD], held: [SWORD] })]);
    const sword = new THREE.Box3();
    for (const { mesh } of drawn(scene, "#1", "held ")) sword.union(new THREE.Box3().setFromObject(mesh, true));
    expect(sword.min.z).toBeGreaterThanOrEqual(0);
    expect(sword.max.z - sword.min.z).toBeLessThan(0.2);
    expect(sword.max.y - sword.min.y).toBeGreaterThan(0.85);
    const board = drawn(scene, "#1", `worn ${SHIELD.name}`)[0];
    expect(new THREE.Box3().setFromObject(board.mesh, true).min.z).toBeGreaterThanOrEqual(-1e-6);
    // Turned by the least angle that clears: its face (its basis 3, the frame's u) points mostly up.
    const face = new THREE.Vector3().setFromMatrixColumn(board.mesh.matrixWorld, 2).normalize();
    expect(face.z).toBeGreaterThan(0.7);
  });

  it("draws a stand as a neutral figure the neutral height, wearing the armour by the person's path", () => {
    const scene = room([armourStand("#9", 0)]);
    expect(scene.things.get("#9")?.userData.form).toBe("stand");
    const body = new THREE.Box3();
    for (const { box } of drawn(scene, "#9", "stand")) body.union(box);
    expect(body.min.z).toBeCloseTo(0, 3);
    expect(body.max.z).toBeGreaterThan(STAND_HEIGHT * 0.99);
    const stand = drawn(scene, "#9", "worn ");
    const person = drawn(room([armouredPerson("#1", 0, { held: [] })]), "#1", "worn ");
    // An average 1.75 m person and the stand wear the same armour in the same places.
    expect(stand.length).toBe(person.length);
    stand.forEach(({ box }, i) => {
      expect(box.min.distanceTo(person[i].box.min)).toBeLessThan(1e-6);
      expect(box.max.distanceTo(person[i].box.max)).toBeLessThan(1e-6);
    });
  });
});
