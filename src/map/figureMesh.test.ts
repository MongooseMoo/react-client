import * as THREE from "three";
import { describe, expect, it } from "vitest";

import { overlayHex } from "../avatar/colour";
import { figureParams, STUBBLE_OPACITY } from "../avatar/figure";
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

describe("eyepatch", () => {
  it("runs its strap around the head on the surface, through the patch, not through the head", () => {
    const { p, headR, headZ } = standing({ skin: { hex: "#d7bd96" }, features: ["eyepatch"] });
    const strap = vertices(p, "strap");
    expect(strap.length).toBeGreaterThan(50);
    for (const v of strap) {
      const r = onHead(v, headR, headZ);
      expect(r).toBeGreaterThan(0.99);
      expect(r).toBeLessThan(1.1);
    }
    // It goes all the way round: in front and behind the head, and out at both sides.
    expect(Math.max(...strap.map((v) => v.y))).toBeGreaterThan(0.9 * headR);
    expect(Math.min(...strap.map((v) => v.y))).toBeLessThan(-0.9 * headR);
    // It passes the patch over the left eye (x -0.32, at eye height).
    const nearPatch = strap.filter((v) => Math.abs(v.x + 0.32 * headR) < 0.1 * headR && v.y > 0.8 * headR);
    expect(nearPatch.length).toBeGreaterThan(0);
  });
});

describe("figure hair", () => {
  const hairOf = (length_cm: number, texture = "straight") => standing({ skin: { hex: "#f3e7db" }, hair: { length_cm, texture, hex: "#9a3001" } });

  it("lets medium and long hair fall around the back and sides of the head, not as a flat board", () => {
    for (const length of [18, 40]) {
      const { p, headR, headZ } = hairOf(length);
      const hair = vertices(p, "hair");
      expect(hair.length, String(length)).toBeGreaterThan(0);
      // It wraps: behind the head (the board stopped 0.37 to 0.87 head radii back) and out at both sides.
      expect(Math.min(...hair.map((v) => v.y)), String(length)).toBeLessThan(-0.95 * headR);
      expect(Math.max(...hair.map((v) => v.x)), String(length)).toBeGreaterThan(0.84 * headR);
      expect(Math.min(...hair.map((v) => v.x)), String(length)).toBeLessThan(-0.84 * headR);
      // It falls from under the cap downward, and long hair further.
      expect(Math.max(...hair.map((v) => v.z))).toBeLessThan(headZ + 0.3 * headR);
    }
    const low = (length: number) => Math.min(...vertices(hairOf(length).p, "hair").map((v) => v.z));
    expect(low(40)).toBeLessThan(low(18));
    expect(vertices(hairOf(5).p, "hair")).toEqual([]);
  });

  it("shows texture: straight hair is smooth, wavy, curly and coily hair stand out unevenly", () => {
    // How rough the cap is: the mean change in distance from the head's centre between neighbouring vertices.
    const roughness = (texture: string) => {
      const { p, headR, headZ } = hairOf(5, texture);
      const r = vertices(p, "cap").map((v) => onHead(v, headR, headZ));
      let sum = 0;
      for (let i = 1; i < r.length; i++) sum += Math.abs(r[i] - r[i - 1]);
      return sum / (r.length - 1);
    };
    const smooth = roughness("straight");
    for (const texture of ["wavy", "curly", "coily"]) expect(roughness(texture), texture).toBeGreaterThan(smooth * 2);
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

  it("shapes a beard to the jaw: on the head's surface, standing out a little, below the mouth", () => {
    const { p, headR, headZ } = standing({ skin: { hex: "#3a312a" }, facial_hair: { kind: "beard", hex: "#141414" } });
    const beard = vertices(p, "beard");
    expect(beard.length).toBeGreaterThan(50);
    const radii = beard.map((v) => onHead(v, headR, headZ));
    // A box stood out to 1.6 at its corners; the shell follows the head at 1.1 to 1.25.
    expect(Math.min(...radii)).toBeGreaterThan(0.99);
    expect(Math.max(...radii)).toBeLessThan(1.3);
    // Its front edge is below the mouth, so the mouth shows.
    const mouthLow = Math.min(...vertices(p, "mouth").map((v) => v.z));
    const frontEdge = Math.max(...beard.filter((v) => Math.abs(v.x) < headR * 0.2 && v.y > 0).map((v) => v.z));
    expect(frontEdge).toBeLessThan(mouthLow);
    // A black beard on dark brown skin is under 3:1, so its edge is outlined.
    expect(p.outlined).toContain("jawline");
    expect(vertices(p, "jawline").length).toBeGreaterThan(0);
    // The moustache sits above the mouth.
    expect(Math.min(...vertices(p, "moustache").map((v) => v.z))).toBeGreaterThan(mouthLow - headR * 0.05);
  });

  it("lays stubble flat on the skin as a shadow, not a mask over the face", () => {
    const { p, headR, headZ } = standing({ skin: { hex: "#d7bd96" }, facial_hair: { kind: "stubble", hex: "#7d7d7d" } });
    const stubble = vertices(p, "stubble");
    expect(stubble.length).toBeGreaterThan(50);
    for (const v of stubble) expect(onHead(v, headR, headZ)).toBeLessThan(1.03);
    // The portrait's 45% stubble over the skin, not the solid grey.
    const part = figureParts(p).find((x) => x.name === "stubble");
    expect(part?.colour).toBe(overlayHex("#d7bd96", "#7d7d7d", STUBBLE_OPACITY));
    expect(p.outlined).not.toContain("jawline");
    // Nothing of it reaches the mouth or above.
    expect(Math.max(...stubble.map((v) => v.z))).toBeLessThan(Math.min(...vertices(p, "mouth").map((v) => v.z)));
  });

  it("draws no face on a hidden face, nor on the plain figure of someone without appearance", () => {
    for (const p of [standing({ ...lightHair, face_hidden: true }).p, figureParams(undefined, { height: 1.75, base: "#4ade80" })]) {
      expect(figureParts(p).filter((x) => x.name === "mouth" || x.name === "brow" || x.name === "eye")).toEqual([]);
    }
  });
});
