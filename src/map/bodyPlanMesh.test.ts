import * as THREE from "three";
import { describe, expect, it } from "vitest";

import { BODY_PLANS } from "../avatar/bodyPlan";
import { PLAN_CHARACTERS } from "../avatar/bodyPlans.fixture";
import { contrast, INK_DARK } from "../avatar/colour";
import { figureParams } from "../avatar/figure";
import { FACET_SHADES, HOCK, KNEE, planParts } from "./bodyPlanMesh";
import { figureGeometry, headOutline } from "./figureMesh";
import { placeThings } from "./roomLayout";
import { livingRoomLayout } from "./roomLayout.fixture";
import { buildRoomScene, CRYSTAL_ROUGHNESS } from "./roomScene";

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

  it("draws a crystal covering as flat facets shaded toward the accent: the plan's, or the sent second colour", () => {
    for (const part of planParts(params("quartz"))) {
      expect(part.tone).toBe("#f4f8fc");
      expect(part.shade?.length).toBe(part.geometry.getAttribute("position").count);
    }
    for (const part of planParts(params("quartz, game look"))) expect(part.tone).toBe("#808080");
    expect(planParts(params("zombie")).every((part) => part.tone === undefined)).toBe(true);
  });

  it("colours a duck's wings and head from the sent look", () => {
    const parts = planParts(params("mallard duck, game look"));
    expect(parts.filter((x) => x.name === "wing").map((x) => x.colour)).toEqual(["#808080", "#808080"]);
    expect(parts.find((x) => x.name === "head")?.colour).toBe("#2e7d32");
    expect(parts.find((x) => x.name === "body")?.colour).toBe("#6b4423");
  });

  it("gives a fur covering a bushy tail and others a thin one", () => {
    const tail = (appearance: Record<string, unknown>) => {
      const part = planParts(figureParams(appearance, { height: 2 })).find((x) => x.name === "tail");
      const box = new THREE.Box3().setFromBufferAttribute(part?.geometry.getAttribute("position") as THREE.BufferAttribute);
      return box.max.x - box.min.x;
    };
    expect(tail({ body_plan: "werewolf" })).toBeGreaterThan(tail({ body_plan: "werewolf", covering: { kind: "scales" } }) * 1.3);
  });

  it("draws the shark head's body like the person's and its head in the form's grey", () => {
    const parts = planParts(params("shark head, game look"));
    expect(parts.find((x) => x.name === "snout")?.colour).toBe("#9a9893");
    expect(parts.filter((x) => x.name === "arm").map((x) => x.colour)).toEqual(["#e8c547", "#e8c547"]);
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

  it("stands the werewolf on its toes with shallow bends, not in a squat: the knee bent no tighter than 120 degrees, set high", () => {
    const H = 2.1;
    const hip = new THREE.Vector3(0, 0, BODY_PLANS.werewolf.kind === "humanoid" ? BODY_PLANS.werewolf.legShare * H : 0);
    const knee = new THREE.Vector3(0, KNEE.y * H, KNEE.z * hip.z);
    const hock = HOCK.clone().multiplyScalar(H);
    const bend = (hip.clone().sub(knee).angleTo(hock.clone().sub(knee)) * 180) / Math.PI;
    expect(bend).toBeGreaterThanOrEqual(120);
    expect(knee.z).toBeGreaterThan(H * 0.28);
    expect(hock.z).toBeGreaterThan(H * 0.1);
    // The figure built from them: the thigh's lowest point (the knee) is that high.
    const thigh = planParts(params("werewolf")).find((x) => x.name === "thigh");
    const box = new THREE.Box3().setFromBufferAttribute(thigh?.geometry.getAttribute("position") as THREE.BufferAttribute);
    expect(box.min.z).toBeGreaterThan(H * 0.25);
  });

  it("sets the shark's eyes standing out of its snout, far enough forward to be seen face-on, and tapers the head into the neck", () => {
    const parts = planParts(params("shark head"));
    const boxOf = (part: { geometry: THREE.BufferGeometry }) => new THREE.Box3().setFromBufferAttribute(part.geometry.getAttribute("position") as THREE.BufferAttribute);
    const snout = boxOf(parts.find((x) => x.name === "snout") as { geometry: THREE.BufferGeometry });
    const middle = snout.getCenter(new THREE.Vector3());
    const half = snout.getSize(new THREE.Vector3()).multiplyScalar(0.5);
    for (const eye of parts.filter((x) => x.name === "eye")) {
      const at = boxOf(eye).getCenter(new THREE.Vector3()).sub(middle).divide(half);
      // On or outside the snout's surface (an ellipsoid filling its box), and in its front half.
      expect(at.length()).toBeGreaterThan(0.95);
      expect(at.y).toBeGreaterThan(0.5);
    }
    const taper = boxOf(parts.find((x) => x.name === "taper") as { geometry: THREE.BufferGeometry });
    expect(taper.max.x - taper.min.x).toBeGreaterThan(half.x);
    expect(taper.min.z).toBeLessThan(snout.min.z);
    expect(parts.some((x) => x.name === "mouth")).toBe(true);
  });

  it("gives the primate fur that stands out from black and a lighter face, chest, hands and feet, with or without a sent look", () => {
    for (const name of ["devolved primate", "devolved primate, game look"]) {
      const p = params(name);
      const plan = p.plan.kind === "humanoid" ? p.plan : undefined;
      expect(contrast(plan?.accent ?? "", p.colours.skin), name).toBeGreaterThanOrEqual(2);
      expect(p.colours.hands, name).toBe(plan?.accent);
      expect(p.colours.feet, name).toBe(plan?.accent);
      expect(planParts(p).filter((x) => x.name === "chest").length, name).toBeGreaterThan(0);
    }
    expect(contrast(params("devolved primate").colours.skin, INK_DARK)).toBeGreaterThanOrEqual(3);
    // A sent body colour is drawn as sent, however dark.
    expect(params("devolved primate, game look").colours.skin).toBe("#3b2417");
  });

  it("cuts a crystal body into lighter and darker faces with points on the shoulders, drawn glossy", () => {
    expect(Math.min(...FACET_SHADES)).toBeLessThan(0);
    expect(Math.max(...FACET_SHADES)).toBeGreaterThan(0.5);
    const parts = planParts(params("quartz"));
    expect(parts.filter((x) => x.name === "shard").length).toBeGreaterThanOrEqual(3);
    const shades = new Set(parts.flatMap((x) => [...(x.shade ?? [])]));
    expect([...shades].some((t) => t < 0) && [...shades].some((t) => t > 0.5)).toBe(true);
    const layout = livingRoomLayout();
    const ch = PLAN_CHARACTERS.find((c) => c.name === "quartz");
    layout.things = [{ id: "#q", name: "q", kind: "person", fixed: true, mounted: false, shapes: [{ box: [[-0.2, 0.2], [-0.2, 0.2], [0, 1.8]] }], appearance: ch?.appearance }];
    const room = buildRoomScene({ layout, placed: placeThings(layout), youId: "" });
    const material = (room.things.get("#q")?.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
    expect(material.roughness).toBe(CRYSTAL_ROUGHNESS);
    expect(material.roughness).toBeLessThan(0.5);
    expect(material.flatShading).toBe(true);
    // Everyone else keeps the plain figure material.
    layout.things[0].appearance = PLAN_CHARACTERS.find((c) => c.name === "zombie")?.appearance;
    const plain = (buildRoomScene({ layout, placed: placeThings(layout), youId: "" }).things.get("#q")?.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
    expect(plain.roughness).toBe(0.8);
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
