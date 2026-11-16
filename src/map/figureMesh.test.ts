import * as THREE from "three";
import { describe, expect, it } from "vitest";

import { figureParams } from "../avatar/figure";
import { figureParts } from "./figureMesh";

/** A standing figure's parameters (in its own frame: facing +y, z up) and its head's measurements. */
const standing = (appearance: Record<string, unknown>) => {
  const p = figureParams(appearance, { height: 1.75, base: "#888888" });
  const headR = p.headHeight / 2;
  return { p, headR, headZ: p.height - headR };
};

/** Every vertex of the parts with this name. */
function vertices(p: ReturnType<typeof figureParams>, name: string): THREE.Vector3[] {
  const out: THREE.Vector3[] = [];
  for (const part of figureParts(p).filter((x) => x.name === name)) {
    const positions = part.geometry.getAttribute("position");
    for (let i = 0; i < positions.count; i++) out.push(new THREE.Vector3().fromBufferAttribute(positions, i));
  }
  return out;
}

/** A vertex's distance from the head's centre in the head ellipsoid's own units (half widths 0.84, 0.95 and 1 head radius): 1 is on the head. */
const onHead = (v: THREE.Vector3, headR: number, headZ: number) => Math.hypot(v.x / (0.84 * headR), v.y / (0.95 * headR), (v.z - headZ) / headR);

// Short hair whose colour is under 3:1 against the skin, so its edge is outlined.
const lightHair = { skin: { hex: "#eadaba" }, eyes: { hex: "#3d6fb6" }, hair: { length_cm: 5, texture: "straight", hex: "#ad8150" } };

describe("figure head", () => {
  it("keeps the hair cap off the face: its front edge is above the eyes, for straight and coily hair", () => {
    for (const texture of ["straight", "coily"]) {
      const { p, headR, headZ } = standing({ ...lightHair, hair: { ...lightHair.hair, texture } });
      const eyeTop = headZ + headR * 0.22;
      // In front of the eyes (they sit at x ±0.32 head radii); beside the temples the edge comes lower.
      const front = vertices(p, "cap").filter((v) => v.y > headR * 0.6 && Math.abs(v.x) < headR * 0.5);
      expect(front.length, texture).toBeGreaterThan(0);
      expect(Math.min(...front.map((v) => v.z)), texture).toBeGreaterThan(eyeTop);
    }
  });

  it("puts the cap outside the head everywhere, so no skin shows through it", () => {
    for (const appearance of [lightHair, { skin: { hex: "#604134" }, garments: [{ areas: ["head"], layer: 1, colour: { hex: "#650021" } }] }]) {
      const { p, headR, headZ } = standing(appearance);
      const cap = vertices(p, "cap");
      expect(cap.length).toBeGreaterThan(50);
      expect(Math.min(...cap.map((v) => onHead(v, headR, headZ)))).toBeGreaterThan(1.02);
    }
  });

  it("runs the hairline outline along the cap's edge, above the eyes in front", () => {
    const { p, headR, headZ } = standing(lightHair);
    expect(p.outlined).toContain("hairline");
    const front = vertices(p, "hairline").filter((v) => v.y > headR * 0.6 && Math.abs(v.x) < headR * 0.5);
    expect(front.length).toBeGreaterThan(0);
    expect(Math.min(...front.map((v) => v.z))).toBeGreaterThan(headZ + headR * 0.22);
  });

  it("hangs earrings from the side of the head, not in the air beside it", () => {
    const { p, headR, headZ } = standing({ skin: { hex: "#d7bd96" }, features: ["earrings"] });
    const rings = vertices(p, "earring");
    for (const side of [-1, 1]) {
      const ring = rings.filter((v) => Math.sign(v.x) === side);
      // How far each ring vertex is outside the head's surface at its own height; the ring reaches into the lobe.
      const gaps = ring.map((v) => (Math.abs(v.x) - 0.84 * headR * Math.sqrt(Math.max(0, 1 - ((v.z - headZ) / headR) ** 2))) / headR);
      expect(Math.min(...gaps)).toBeLessThanOrEqual(0);
      expect(Math.min(...gaps)).toBeGreaterThan(-0.1);
    }
  });
});

describe("figure face", () => {
  it("seats the eyes in the head: they stand out of the face by less than half their size", () => {
    const { p, headR, headZ } = standing(lightHair);
    const eyes = vertices(p, "eye");
    expect(eyes.length).toBeGreaterThan(0);
    // The furthest any eye vertex reaches outside the head, in head radii; the eye's radius is 0.1.
    const out = Math.max(...eyes.map((v) => onHead(v, headR, headZ))) - 1;
    expect(out).toBeLessThan(0.05);
  });

  it("draws a mouth in the face ink and brows in the hair colour, on the face, for a described person", () => {
    const { p, headR, headZ } = standing(lightHair);
    const mouth = vertices(p, "mouth");
    const brows = vertices(p, "brow");
    expect(mouth.length).toBeGreaterThan(0);
    expect(brows.length).toBeGreaterThan(0);
    expect(figureParts(p).find((x) => x.name === "mouth")?.colour).toBe(p.colours.faceInk);
    expect(figureParts(p).find((x) => x.name === "brow")?.colour).toBe("#ad8150");
    // The mouth is low on the front of the face, the brows just above the eyes; both sit on the surface.
    for (const v of mouth) {
      expect(v.z).toBeLessThan(headZ - headR * 0.3);
      expect(v.y).toBeGreaterThan(headR * 0.6);
    }
    for (const v of brows) expect(v.z).toBeGreaterThan(headZ + headR * 0.22);
    for (const v of [...mouth, ...brows]) expect(Math.abs(onHead(v, headR, headZ) - 1)).toBeLessThan(0.1);
  });

  it("draws no face on a hidden face, nor on the plain figure of someone without appearance", () => {
    for (const p of [standing({ ...lightHair, face_hidden: true }).p, figureParams(undefined, { height: 1.75, base: "#4ade80" })]) {
      expect(figureParts(p).filter((x) => x.name === "mouth" || x.name === "brow" || x.name === "eye")).toEqual([]);
    }
  });
});
