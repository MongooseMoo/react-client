import * as THREE from "three";
import { describe, expect, it } from "vitest";

import { figureParams } from "../avatar/figure";
import { figureGeometry } from "./figureMesh";

/** A standing figure in its own frame (facing +y, z up) and its head's measurements. */
const standing = (appearance: Record<string, unknown>) => {
  const p = figureParams(appearance, { height: 1.75, base: "#888888" });
  const geometry = figureGeometry(p);
  const headR = p.headHeight / 2;
  return { p, geometry, headR, headZ: p.height - headR };
};

/** Positions of the vertices painted `hex`. */
function painted(geometry: THREE.BufferGeometry, hex: string): THREE.Vector3[] {
  const target = new THREE.Color(hex);
  const colours = geometry.getAttribute("color");
  const positions = geometry.getAttribute("position");
  const out: THREE.Vector3[] = [];
  for (let i = 0; i < colours.count; i++) {
    const d = Math.abs(colours.getX(i) - target.r) + Math.abs(colours.getY(i) - target.g) + Math.abs(colours.getZ(i) - target.b);
    if (d < 1e-6) out.push(new THREE.Vector3().fromBufferAttribute(positions, i));
  }
  return out;
}

// Short hair whose colour is under 3:1 against the skin, so its edge is outlined.
const lightHair = { skin: { hex: "#eadaba" }, eyes: { hex: "#3d6fb6" }, hair: { length_cm: 5, texture: "straight", hex: "#ad8150" } };

describe("figure head", () => {
  it("keeps the hair cap off the face: its front edge is above the eyes, for straight and coily hair", () => {
    for (const texture of ["straight", "coily"]) {
      const { p, geometry, headR, headZ } = standing({ ...lightHair, hair: { ...lightHair.hair, texture } });
      const eyeTop = headZ + headR * 0.22;
      // In front of the eyes (they sit at x ±0.32 head radii); beside the temples the edge comes lower.
      const front = painted(geometry, p.colours.head).filter((v) => v.y > headR * 0.6 && Math.abs(v.x) < headR * 0.5);
      expect(front.length, texture).toBeGreaterThan(0);
      expect(Math.min(...front.map((v) => v.z)), texture).toBeGreaterThan(eyeTop);
    }
  });

  it("puts the cap outside the head everywhere, so no skin shows through it", () => {
    for (const appearance of [lightHair, { skin: { hex: "#604134" }, garments: [{ areas: ["head"], layer: 1, colour: { hex: "#650021" } }] }]) {
      const { p, geometry, headR, headZ } = standing(appearance);
      const cap = painted(geometry, p.colours.head);
      expect(cap.length).toBeGreaterThan(50);
      // Each cap vertex, in the head ellipsoid's own units (half widths 0.84, 0.95 and 1 head radius).
      const inside = cap.map((v) => Math.hypot(v.x / (0.84 * headR), v.y / (0.95 * headR), (v.z - headZ) / headR));
      expect(Math.min(...inside)).toBeGreaterThan(1.02);
    }
  });

  it("runs the hairline outline along the cap's edge, above the eyes in front", () => {
    const { p, geometry, headR, headZ } = standing(lightHair);
    expect(p.outlined).toContain("hairline");
    const outline = painted(geometry, p.colours.ink).filter((v) => v.z > headZ - headR);
    const front = outline.filter((v) => v.y > headR * 0.6 && Math.abs(v.x) < headR * 0.5);
    expect(front.length).toBeGreaterThan(0);
    expect(Math.min(...front.map((v) => v.z))).toBeGreaterThan(headZ + headR * 0.22);
  });

  it("hangs earrings from the side of the head, not in the air beside it", () => {
    const { p, geometry, headR, headZ } = standing({ skin: { hex: "#d7bd96" }, features: ["earrings"] });
    const rings = painted(geometry, p.colours.faceInk);
    for (const side of [-1, 1]) {
      const ring = rings.filter((v) => Math.sign(v.x) === side);
      // How far each ring vertex is outside the head's surface at its own height; the ring reaches into the lobe.
      const gaps = ring.map((v) => (Math.abs(v.x) - 0.84 * headR * Math.sqrt(Math.max(0, 1 - ((v.z - headZ) / headR) ** 2))) / headR);
      expect(Math.min(...gaps)).toBeLessThanOrEqual(0);
      expect(Math.min(...gaps)).toBeGreaterThan(-0.1);
    }
  });
});
