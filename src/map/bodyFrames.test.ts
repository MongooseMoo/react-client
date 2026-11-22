import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { PLAN_CHARACTERS } from "../avatar/bodyPlans.fixture";
import { type FigureParams, figureParams } from "../avatar/figure";
import { FRAME_NAMES } from "../gmcp/Room";
import { builtFrames, figureFrames, frameEnd, frameMatrix, reclineMatrix } from "./bodyFrames";
import { figureGeometry, figureParts } from "./figureMesh";

const POSTURES = ["standing", "sitting", "reclining"] as const;
const person = (posture: (typeof POSTURES)[number], build = "average", height = 1.75) => figureParams({ posture, build }, { height });
const close = (a: THREE.Vector3, b: THREE.Vector3) => expect(a.distanceTo(b)).toBeLessThan(1e-9);

/** The human figure's joints as `figureParts` placed them before the frames existed, in its own frame, as built. */
function joints(p: FigureParams, side: -1 | 1) {
  const H = p.height, s = H / 1.75;
  const sitting = p.posture === "sitting";
  const drop = sitting ? H * p.legShare - 0.26 * H : 0;
  const hipZ = H * p.legShare - drop;
  const legR = p.limbRadius * 1.15;
  const x = side * p.hipHalf * 0.55;
  const neckBase = H - p.headHeight - 0.045 * H - drop;
  const shoulder = new THREE.Vector3(side * p.shoulderHalf, 0, neckBase - p.limbRadius * 1.2);
  const wrist = new THREE.Vector3(side * (p.hipHalf + p.limbRadius * 1.6), sitting ? 0.08 * s : 0, hipZ - 0.02 * H);
  const ankle = new THREE.Vector3(x, sitting ? 0.24 * H : 0, 0.06 * s + legR);
  const knee = sitting ? new THREE.Vector3(x, 0.24 * H, 0.26 * H) : ankle.clone().lerp(new THREE.Vector3(x, 0, hipZ - legR * 0.5), 0.5);
  return {
    hip: new THREE.Vector3(x, 0, hipZ), knee, ankle, shoulder, wrist, elbow: shoulder.clone().lerp(wrist, 0.5),
    waist: hipZ + 0.05 * H, hipsBottom: hipZ - 0.07 * H, neckBase, headCentre: H - p.headHeight / 2 - drop,
  };
}

describe("body frames", () => {
  it("gives every frame the wire names, with unit axes square to each other: x the wearer's left, y back, z along", () => {
    for (const posture of POSTURES) {
      const frames = figureFrames(person(posture)) ?? {};
      expect(Object.keys(frames).sort()).toEqual([...FRAME_NAMES].sort());
      for (const [name, f] of Object.entries(frames)) {
        for (const a of [f.x, f.y, f.z]) expect(a.length(), name).toBeCloseTo(1, 9);
        expect(f.x.dot(f.y), name).toBeCloseTo(0, 9);
        expect(f.x.dot(f.z), name).toBeCloseTo(0, 9);
        close(f.y, f.z.clone().cross(f.x));
        expect(f.size.toArray().every((n) => n > 0), name).toBe(true);
      }
    }
    // Standing, the figure faces +y in its own frame: back is -y, the wearer's left is -x.
    const f = figureFrames(person("standing")) as NonNullable<ReturnType<typeof figureFrames>>;
    close(f.torso.y, new THREE.Vector3(0, -1, 0));
    close(f.torso.x, new THREE.Vector3(-1, 0, 0));
    expect(f.left_hand.origin.x).toBeLessThan(0);
  });

  it("puts each frame's two ends at the figure's joints, standing and sitting, for every build and height", () => {
    for (const posture of ["standing", "sitting"] as const) {
      for (const build of ["slender", "average", "stocky"]) {
        for (const height of [1.5, 1.75, 2.0]) {
          const p = person(posture, build, height);
          const f = figureFrames(p) as NonNullable<ReturnType<typeof figureFrames>>;
          for (const [side, name] of [[-1, "left"], [1, "right"]] as const) {
            const j = joints(p, side);
            close(f[`${name}_thigh`].origin, j.knee);
            close(frameEnd(f[`${name}_thigh`]), j.hip);
            close(f[`${name}_shin`].origin, j.ankle);
            close(frameEnd(f[`${name}_shin`]), j.knee);
            close(f[`${name}_upper_arm`].origin, j.elbow);
            close(frameEnd(f[`${name}_upper_arm`]), j.shoulder);
            close(f[`${name}_forearm`].origin, j.wrist);
            close(frameEnd(f[`${name}_forearm`]), j.elbow);
            close(frameEnd(f[`${name}_hand`]), j.wrist);
            expect(frameEnd(f[`${name}_foot`]).z).toBeCloseTo(0.06 * (height / 1.75), 9);
          }
          const j = joints(p, 1);
          expect(f.waist.origin.z).toBeCloseTo(j.hipsBottom, 9);
          expect(frameEnd(f.waist).z).toBeCloseTo(j.waist, 9);
          expect(f.torso.origin.z).toBeCloseTo(j.waist, 9);
          expect(frameEnd(f.torso).z).toBeCloseTo(j.neckBase, 9);
          expect(f.neck.origin.z).toBeCloseTo(j.neckBase - 0.01, 9);
          expect(f.head.origin.z + f.head.size.z / 2).toBeCloseTo(j.headCentre, 9);
          expect(frameEnd(f.head).z).toBeCloseTo(p.top, 9);
        }
      }
    }
  });

  it("draws each limb between its frame's ends: the arm bent at the elbow, the standing leg at the knee", () => {
    for (const posture of ["standing", "sitting"] as const) {
      const p = person(posture);
      const f = builtFrames(p) as NonNullable<ReturnType<typeof builtFrames>>;
      const parts = figureParts(p);
      const box = (name: string) => parts.filter((x) => x.name === name).map((x) => new THREE.Box3().setFromBufferAttribute(x.geometry.getAttribute("position") as THREE.BufferAttribute));
      // Each side's forearm reaches the wrist (its lower end, rounded by the arm's radius) and stops at the elbow.
      for (const [i, name] of [[0, "left"], [1, "right"]] as const) {
        const fore = box("forearm")[i];
        const wrist = f[`${name}_forearm`].origin;
        expect(fore.min.z).toBeCloseTo(wrist.z - p.limbRadius, 2);
        const elbow = f[`${name}_upper_arm`].origin;
        expect(fore.max.z).toBeGreaterThanOrEqual(elbow.z - 1e-6);
        expect(fore.max.z).toBeLessThan(elbow.z + p.limbRadius * 0.2);
        expect(box("upper arm")[i].max.z).toBeCloseTo(frameEnd(f[`${name}_upper_arm`]).z + p.limbRadius, 2);
        expect(box("shin")[i].min.z).toBeCloseTo(f[`${name}_shin`].origin.z - f[`${name}_shin`].size.x / 2, 2);
      }
    }
  });

  it("lays the frames down with the figure when reclining, by the one matrix the figure is laid down with", () => {
    const standing = figureFrames(person("standing")) as NonNullable<ReturnType<typeof figureFrames>>;
    const p = person("reclining");
    const lying = figureFrames(p) as NonNullable<ReturnType<typeof figureFrames>>;
    const m = reclineMatrix(p);
    for (const name of FRAME_NAMES) {
      close(lying[name].origin, standing[name].origin.clone().applyMatrix4(m));
      close(frameEnd(lying[name]), frameEnd(standing[name]).applyMatrix4(m));
    }
    // The head lies toward -y, face up; the figure's drawn top of the head is where the head frame ends (its faceted
    // ball a few millimetres inside the round it is cut from).
    expect(frameEnd(lying.head).y).toBeLessThan(lying.left_foot.origin.y);
    close(lying.head.y, new THREE.Vector3(0, 0, -1));
    const g = figureGeometry(p);
    expect((g.boundingBox as THREE.Box3).min.y).toBeCloseTo(frameEnd(lying.head).y, 2);
  });

  it("follows a humanoid plan's hunch, droop and digitigrade legs, and gives an animal none", () => {
    for (const ch of PLAN_CHARACTERS) {
      const p = figureParams(ch.appearance, { height: ch.height });
      const f = figureFrames(p);
      if (p.plan.kind === "human") continue;
      if (p.plan.kind !== "humanoid") {
        expect(f, ch.name).toBeUndefined();
        continue;
      }
      expect(f, ch.name).toBeDefined();
      if (!f) continue;
      // A hunched plan leans its torso forward (+y in the figure's own frame) from the hips.
      if (p.plan.hunch > 0) expect(frameEnd(f.torso).y, ch.name).toBeGreaterThan(f.torso.origin.y);
      for (const name of ["left", "right"] as const) close(f[`${name}_thigh`].origin, frameEnd(f[`${name}_shin`]));
    }
  });

  it("maps frame units onto the frame: (0, 0, 0) its lower end, t = 1 its upper end, u = 0.5 half its width to the wearer's left", () => {
    const f = (figureFrames(person("standing")) as NonNullable<ReturnType<typeof figureFrames>>).left_forearm;
    const m = frameMatrix(f);
    close(new THREE.Vector3(0, 0, 0).applyMatrix4(m), f.origin);
    close(new THREE.Vector3(0, 0, 1).applyMatrix4(m), frameEnd(f));
    close(new THREE.Vector3(0.5, 0, 0).applyMatrix4(m), f.origin.clone().addScaledVector(f.x, f.size.x / 2));
    close(new THREE.Vector3(0, -0.5, 0.5).applyMatrix4(m), f.origin.clone().addScaledVector(f.y, -f.size.y / 2).addScaledVector(f.z, f.size.z / 2));
    // The wearer's left is the figure's -x.
    expect(new THREE.Vector3(0.5, 0, 0).applyMatrix4(m).x).toBeLessThan(f.origin.x);
  });
});
