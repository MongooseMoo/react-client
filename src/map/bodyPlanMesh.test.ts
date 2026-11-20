import * as THREE from "three";
import { describe, expect, it } from "vitest";

import { PLAN_CHARACTERS } from "../avatar/bodyPlans.fixture";
import { figureParams } from "../avatar/figure";
import { planParts } from "./bodyPlanMesh";
import { figureGeometry, headOutline } from "./figureMesh";

const params = (name: string) => {
  const ch = PLAN_CHARACTERS.find((c) => c.name === name);
  if (!ch) throw new Error(name);
  const [width, depth] = ch.box ?? [0.4, 0.4];
  return figureParams(ch.appearance, { height: ch.height, base: "#3a7bd5", footprint: { width, depth } });
};
const names = (name: string) => planParts(params(name)).map((part) => part.name);
const bounds = (p: ReturnType<typeof figureParams>) => {
  const g = figureGeometry(p);
  const box = new THREE.Box3().setFromBufferAttribute(g.getAttribute("position") as THREE.BufferAttribute);
  return { g, box };
};

describe("body plan figures", () => {
  it("builds every plan's figure within the 5,000-triangle budget", () => {
    for (const ch of PLAN_CHARACTERS) {
      const { g } = bounds(params(ch.name));
      const triangles = (g.getIndex()?.count ?? 0) / 3;
      expect(triangles, ch.name).toBeGreaterThan(20);
      expect(triangles, ch.name).toBeLessThan(5000);
    }
  });

  it("gives each humanoid plan its own head", () => {
    expect(names("werewolf")).toEqual(expect.arrayContaining(["muzzle", "nose", "ear", "tail", "thigh", "shin", "paw"]));
    expect(names("zombie")).toEqual(expect.arrayContaining(["mouth", "pupil"]));
    expect(names("rakghoul")).toEqual(expect.arrayContaining(["jaw"]));
    expect(names("devolved primate")).toEqual(expect.arrayContaining(["brow", "face", "muzzle"]));
    expect(names("quartz")).toEqual(expect.arrayContaining(["spur"]));
    expect(names("shark head")).toEqual(expect.arrayContaining(["snout", "underside", "fin", "gill"]));
  });

  it("draws stone as flat facets shaded toward the plan's light tone", () => {
    for (const part of planParts(params("quartz"))) {
      expect(part.tone).toBe("#f4f8fc");
      expect(part.shade?.length).toBe(part.geometry.getAttribute("position").count);
    }
  });

  it("stands a humanoid's crown at the box's top and leans a hunched plan forward", () => {
    for (const name of ["werewolf", "zombie", "devolved primate", "shark head"]) {
      const p = params(name);
      expect(bounds(p).box.max.z, name).toBeGreaterThan(p.height * 0.93);
      expect(bounds(p).box.max.z, name).toBeLessThan(p.height * 1.12);
    }
    // The werewolf's head is ahead of its hips (+y is where it faces).
    const wolf = planParts(params("werewolf"));
    const nose = new THREE.Box3().setFromBufferAttribute(wolf.find((x) => x.name === "nose")?.geometry.getAttribute("position") as THREE.BufferAttribute);
    expect(nose.min.y).toBeGreaterThan(0.15);
  });

  it("fits each animal inside its box, facing +y with its head at the front", () => {
    for (const name of ["mallard duck", "snake", "song bird"]) {
      const ch = PLAN_CHARACTERS.find((c) => c.name === name);
      const [w, d] = ch?.box ?? [0, 0];
      const { box } = bounds(params(name));
      expect(box.max.x - box.min.x, name).toBeLessThanOrEqual(w * 1.01);
      expect(box.max.y - box.min.y, name).toBeLessThanOrEqual(d * 1.01);
      expect(box.max.z, name).toBeLessThanOrEqual((ch?.height ?? 0) * 1.01);
      const head = planParts(params(name)).find((x) => x.name === "head");
      const at = new THREE.Box3().setFromBufferAttribute(head?.geometry.getAttribute("position") as THREE.BufferAttribute);
      expect(at.getCenter(new THREE.Vector3()).y, name).toBeGreaterThan(0);
    }
  });

  it("draws an unknown plan as one plain pillar the box's height, in the person colour", () => {
    const p = params("unknown plan");
    const parts = planParts(p);
    expect(parts.map((x) => x.name)).toEqual(["placeholder"]);
    expect(parts[0].colour).toBe("#3a7bd5");
    const { box } = bounds(p);
    expect(box.max.z).toBeCloseTo(1.2, 2);
    expect(box.max.x - box.min.x).toBeLessThanOrEqual(0.6);
  });

  it("gives a label point above an animal fitted lower than its box", () => {
    // A duck in a tall narrow box: fitted by its width, it stands well below the box's top.
    const p = figureParams({ body_plan: "mallard duck" }, { height: 1.5, footprint: { width: 0.2, depth: 0.5 } });
    const g = figureGeometry(p);
    const outline = headOutline(g, p.top - p.headHeight * 1.05);
    expect(outline.length).toBeGreaterThan(1);
    expect(Number.isFinite(outline[0].z)).toBe(true);
  });
});
