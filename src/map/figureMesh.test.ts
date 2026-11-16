import * as THREE from "three";
import { describe, expect, it } from "vitest";

import { contrast, INK_DARK, INK_LIGHT, MIN_CONTRAST, overlayHex } from "../avatar/colour";
import { figureParams, HORN_TONE, STUBBLE_OPACITY } from "../avatar/figure";
import { BAND_HEIGHT, EYE_WHITE, figureGeometry, figureParts, HAIRLINE_WIDTH } from "./figureMesh";

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

/**
 * How wide an edge line is: its spread along the axis it runs round (the hair cap's axis, leaning back from
 * upright by the cap's tilt, for the hairline; straight up for a beard's edge).
 */
function lineWidth(part: { geometry: THREE.BufferGeometry }, seam: "hairline" | "jawline"): number {
  const positions = part.geometry.getAttribute("position");
  if (seam === "jawline") {
    // The beard's edge follows the beard's rising edge: two rows of points, the line's width the widest gap between them.
    const half = positions.count / 2;
    const at = (i: number) => new THREE.Vector3().fromBufferAttribute(positions, i);
    return Math.max(...Array.from({ length: half }, (_, i) => at(i).distanceTo(at(i + half))));
  }
  const axis = new THREE.Vector3(0, 1, 0).applyEuler(new THREE.Euler(Math.PI / 2 + 0.5, 0, 0));
  const along: number[] = [];
  for (let i = 0; i < positions.count; i++) along.push(new THREE.Vector3().fromBufferAttribute(positions, i).dot(axis));
  return Math.max(...along) - Math.min(...along);
}

/** A vertex's distance from the head's centre in the head ellipsoid's own units (half widths 0.84, 0.95 and 1 head radius): 1 is on the head. */
const onHead = (v: THREE.Vector3, headR: number, headZ: number) => Math.hypot(v.x / (0.84 * headR), v.y / (0.95 * headR), (v.z - headZ) / headR);

// Short sandy hair on light skin: under 3:1 and alike in colour, so its edge is outlined.
const lightHair = { skin: { hex: "#eadaba" }, eyes: { hex: "#3d6fb6" }, hair: { length_cm: 5, texture: "straight", hex: "#c8ad86" } };

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

describe("seam bands", () => {
  // A yellow raincoat over the torso, arms and waist on light skin: neck, wrists and hips are outlined.
  const raincoat = standing({ skin: { hex: "#eadaba" }, garments: [{ areas: ["torso", "arms", "waist"], layer: 1, colour: { hex: "#ffd400" } }] });

  it("draws thin lines lying close to the body, not raised rings", () => {
    const { p } = raincoat;
    expect(p.outlined).toEqual(expect.arrayContaining(["neck", "wrists", "hips"]));
    for (const part of figureParts(p).filter((x) => x.name === "band")) {
      const box = new THREE.Box3().setFromBufferAttribute(part.geometry.getAttribute("position") as THREE.BufferAttribute);
      // The old bands were 14 mm tall and stood up to a quarter of the part's radius out.
      // Positions are 32-bit floats.
      expect(box.max.z - box.min.z).toBeLessThanOrEqual(BAND_HEIGHT + 1e-6);
    }
  });

  it("puts the collar line above the torso's top, where it shows", () => {
    const { p } = raincoat;
    const neckBase = p.height - p.headHeight - 0.045 * p.height;
    // The shoulder bar rises 0.15 limb radii over the neck's base; the collar must be clear of it.
    const collar = vertices(p, "band").filter((v) => v.z > neckBase - 0.02);
    expect(collar.length).toBeGreaterThan(0);
    expect(Math.min(...collar.map((v) => v.z))).toBeGreaterThan(neckBase + p.limbRadius * 0.15);
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

describe("traits", () => {
  const winged = standing({ skin: { hex: "#292420" }, hair: { length_cm: 60, hex: "#c5c9c7" }, traits: ["wings", "horns", "antlers"] });

  it("draws horns and antlers in the bone tone, not the hair colour", () => {
    const parts = figureParts(winged.p);
    for (const name of ["horn", "antler"]) {
      const found = parts.filter((x) => x.name === name);
      expect(found.length, name).toBeGreaterThan(0);
      for (const part of found) expect(part.colour, name).toBe(HORN_TONE);
    }
  });

  it("gives wings a wing's outline, spread out and up behind the shoulders, not a flat panel", () => {
    const { p, headR } = winged;
    for (const side of [-1, 1]) {
      const wing = vertices(p, "wing").filter((v) => Math.sign(v.x) === side);
      // A box had 24 vertices; the outline has curves.
      expect(wing.length, String(side)).toBeGreaterThan(60);
      // Reaching well out beyond the shoulders and above them, and behind the body.
      expect(Math.max(...wing.map((v) => Math.abs(v.x))), String(side)).toBeGreaterThan(p.shoulderHalf + 0.25);
      expect(Math.max(...wing.map((v) => v.z))).toBeGreaterThan(p.height - 2 * p.headHeight);
      expect(Math.max(...wing.map((v) => v.y))).toBeLessThan(headR * 0.2);
    }
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

describe("figure hair texture and bun", () => {
  const hairOf = (texture: string, style = "loose", hex = "#1b1612", length_cm = 50) => standing({ skin: { hex: "#292420" }, hair: { length_cm, texture, style, hex } });

  it("shades curls, coils and waves toward the hair's sheen, also under tied styles, so texture shows on black hair", () => {
    for (const style of ["loose", "ponytail", "braided", "bun"]) {
      for (const texture of ["wavy", "curly", "coily"]) {
        const { p } = hairOf(texture, style);
        const cap = figureParts(p).find((x) => x.name === "cap");
        expect(cap?.tone, `${texture} ${style}`).toBe(p.colours.hairSheen);
        const shade = [...(cap?.shade ?? [])];
        // Peaks well toward the sheen, troughs left in the hair's colour.
        expect(Math.max(...shade), `${texture} ${style}`).toBeGreaterThan(0.5);
        expect(Math.min(...shade), `${texture} ${style}`).toBeLessThan(0.1);
      }
      // Straight hair stays one smooth colour.
      expect(figureParts(hairOf("straight", style).p).find((x) => x.name === "cap")?.shade, style).toBeUndefined();
    }
    // The sheen of black hair is a lighter tone of it; of white hair, a darker one.
    expect(contrast(hairOf("coily").p.colours.hairSheen as string, "#1b1612")).toBeGreaterThan(2);
    expect(contrast(hairOf("coily", "loose", "#eeeeea").p.colours.hairSheen as string, "#eeeeea")).toBeGreaterThan(2);
  });

  it("sets a bun clear of the cap, above the crown and out behind it, for every texture, with a tie and a lit crown", () => {
    for (const texture of ["straight", "wavy", "curly", "coily"]) {
      const { p, headR } = hairOf(texture, "bun");
      const cap = vertices(p, "cap");
      const bun = vertices(p, "bun");
      expect(bun.length, texture).toBeGreaterThan(0);
      // Seen from the front it rises over the cap's top; from the side it stands out behind the cap.
      expect(Math.max(...bun.map((v) => v.z)), texture).toBeGreaterThan(Math.max(...cap.map((v) => v.z)) + 0.15 * headR);
      expect(Math.min(...bun.map((v) => v.y)), texture).toBeLessThan(Math.min(...cap.filter((v) => v.z > p.height - 0.6 * headR).map((v) => v.y)) - 0.1 * headR);
      const parts = figureParts(p).filter((x) => x.name === "bun");
      // The ball, shaded toward the sheen on its crown, and the tie in the sheen.
      expect(parts.length, texture).toBe(2);
      expect(Math.max(...(parts[0].shade ?? [0])), texture).toBeGreaterThan(0.3);
      expect(parts[1].colour, texture).toBe(p.colours.hairSheen);
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
    // Sandy brows on light skin are under 3:1: they are drawn in a tone of the hair that reaches it.
    const brow = figureParts(p).find((x) => x.name === "brow")?.colour as string;
    expect(brow).toBe(p.colours.brow);
    expect(contrast(brow, lightHair.skin.hex)).toBeGreaterThanOrEqual(MIN_CONTRAST);
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
    // Nothing of it covers the mouth: in front of the mouth it stays below it.
    const underMouth = stubble.filter((v) => Math.abs(v.x) < 0.3 * headR && v.y > 0.5 * headR);
    expect(underMouth.length).toBeGreaterThan(0);
    expect(Math.max(...underMouth.map((v) => v.z))).toBeLessThan(Math.min(...vertices(p, "mouth").map((v) => v.z)));
  });

  /** Vertices of `name` on the cheek beside the mouth, above the mouth's level: what a beard on the jaw's underside lacked. */
  const onCheek = (p: ReturnType<typeof figureParams>, name: string, headR: number, headZ: number) =>
    vertices(p, name).filter((v) => v.y > 0.4 * headR && Math.abs(v.x) > 0.35 * headR && Math.abs(v.x) < 0.65 * headR && v.z > headZ - 0.35 * headR);

  it("covers the cheeks and the chin with a short beard and with stubble, not only the jaw's underside", () => {
    for (const skin of ["#292420", "#d7bd96", "#f6ede4"]) {
      const short = standing({ skin: { hex: skin }, facial_hair: { kind: "beard", length_cm: 2, hex: "#1b1612" } });
      const stubble = standing({ skin: { hex: skin }, facial_hair: { kind: "stubble", hex: "#1b1612" } });
      for (const [{ p, headR, headZ }, name] of [[short, "beard"], [stubble, "stubble"]] as const) {
        for (const side of [-1, 1]) expect(onCheek(p, name, headR, headZ).filter((v) => Math.sign(v.x) === side).length, `${skin} ${name}`).toBeGreaterThan(0);
        // And round the chin.
        expect(Math.min(...vertices(p, name).map((v) => v.z)), `${skin} ${name}`).toBeLessThan(headZ - 0.95 * headR);
      }
    }
  });

  it("keeps the heaviest stubbled figure under the 5,000-triangle budget", () => {
    // The stipple adds points; with the bulkiest hair and every feature the figure must still fit.
    for (const style of ["loose", "braided", "voluminous", "dreadlocks"]) {
      const p = figureParams(
        { build: "muscular", skin: { hex: "#292420" }, hair: { length_cm: 75, texture: "coily", style, hex: "#1b1612" }, facial_hair: { kind: "stubble", hex: "#1b1612" }, features: ["glasses", "earrings", "eyepatch", "sunglasses", "freckles", "dimples", "beauty_mark"] },
        { height: 1.75 },
      );
      const g = figureGeometry(p);
      expect((g.getIndex()?.count ?? 0) / 3, style).toBeLessThan(5000);
    }
  });

  it("stipples stubble with points that stand 3:1 off the skin, on dark and light skin", () => {
    for (const [skin, hair] of [["#292420", "#1b1612"], ["#f6ede4", "#1b1612"], ["#d7bd96", "#653700"], ["#d7bd96", "#7d7d7d"]]) {
      const { p, headR, headZ } = standing({ skin: { hex: skin }, facial_hair: { kind: "stubble", hex: hair } });
      const dots = figureParts(p).filter((x) => x.name === "stubble-dot");
      expect(dots.length, skin).toBeGreaterThan(30);
      for (const dot of dots) expect(contrast(dot.colour, skin), `${skin} ${hair}`).toBeGreaterThanOrEqual(MIN_CONTRAST);
      // On the face: in front of the ears and below the eyes.
      for (const v of vertices(p, "stubble-dot")) {
        expect(v.y, skin).toBeGreaterThan(0);
        expect(v.z, skin).toBeLessThan(headZ + 0.25 * headR);
      }
    }
  });

  // The darkest and palest palette skins, with black, brown, blonde and white hair and a full beard of the same colour.
  const SKINS = ["#292420", "#3a312a", "#f6ede4"];
  const HAIRS = ["#1b1612", "#653700", "#e3c27a", "#eeeeea"];
  const faceOf = (skin: string, hair: string) =>
    standing({ skin: { hex: skin }, eyes: { hex: "#5b3a1e" }, hair: { length_cm: 3, texture: "coily", hex: hair }, facial_hair: { kind: "beard", length_cm: 8, hex: hair } });

  it("edges hair and a beard that are close to the skin's darkness with a thin line in a tone of the hair, not a white or black band", () => {
    for (const skin of SKINS) {
      for (const hair of HAIRS) {
        const { p } = faceOf(skin, hair);
        const parts = figureParts(p);
        for (const seam of ["hairline", "jawline"] as const) {
          const lines = parts.filter((x) => x.name === seam);
          expect(lines.length > 0, `${skin} ${hair} ${seam}`).toBe(p.outlined.includes(seam));
          for (const line of lines) {
            // It stands 3:1 off the skin, so the edge shows without hue; and it is the hair's tone, not the ink.
            expect(contrast(line.colour, skin), `${skin} ${hair} ${seam}`).toBeGreaterThanOrEqual(MIN_CONTRAST);
            expect([INK_DARK, INK_LIGHT], `${skin} ${hair} ${seam}`).not.toContain(line.colour);
            // Thin: about 5 mm across, where the white band was 12 to 14 mm (and wider still with the cap's scale).
            expect(lineWidth(line, seam), `${skin} ${hair} ${seam}`).toBeLessThan(HAIRLINE_WIDTH * 2);
          }
        }
      }
    }
    // Black hair and beard on very dark skin (Bram's colours): both seams are drawn, in a grey of the hair.
    expect(faceOf("#3a312a", "#141414").p.outlined).toEqual(expect.arrayContaining(["hairline", "jawline"]));
  });

  it("gives eyes a white and an iris, so they read on the darkest and the palest skin", () => {
    for (const skin of SKINS) {
      const { p } = faceOf(skin, "#1b1612");
      const eyes = figureParts(p).filter((x) => x.name === "eye");
      expect(eyes.map((x) => x.colour).sort(), skin).toEqual([EYE_WHITE, EYE_WHITE, "#5b3a1e", "#5b3a1e"].sort());
      // Something of the eye stands 3:1 off the skin: the white on dark skin, the iris on pale.
      expect(Math.max(...eyes.map((x) => contrast(x.colour, skin))), skin).toBeGreaterThanOrEqual(MIN_CONTRAST);
    }
  });

  it("draws brows that stand 3:1 off the skin and a mouth in the face ink, on the darkest and palest skins", () => {
    for (const skin of SKINS) {
      for (const hair of HAIRS) {
        const parts = figureParts(faceOf(skin, hair).p);
        for (const name of ["brow", "mouth"]) {
          const found = parts.filter((x) => x.name === name);
          expect(found.length).toBeGreaterThan(0);
          for (const part of found) expect(contrast(part.colour, skin), `${skin} ${hair} ${name}`).toBeGreaterThanOrEqual(MIN_CONTRAST);
        }
      }
    }
  });

  it("draws no face on a hidden face, nor on the plain figure of someone without appearance", () => {
    for (const p of [standing({ ...lightHair, face_hidden: true }).p, figureParams(undefined, { height: 1.75, base: "#4ade80" })]) {
      expect(figureParts(p).filter((x) => x.name === "mouth" || x.name === "brow" || x.name === "eye")).toEqual([]);
    }
  });
});
