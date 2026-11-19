import * as THREE from "three";
import { describe, expect, it } from "vitest";

import { contrast, INK_DARK, INK_LIGHT, MIN_CONTRAST, overlayHex } from "../avatar/colour";
import { figureParams, HORN_TONE, STUBBLE_OPACITY } from "../avatar/figure";
import { BAND_HEIGHT, CAP_LEAN, EYE_WHITE, figureGeometry, figureParts, HAIRLINE_WIDTH, LIDDED_BELOW } from "./figureMesh";

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
  const axis = new THREE.Vector3(0, 1, 0).applyEuler(new THREE.Euler(Math.PI / 2 + CAP_LEAN, 0, 0));
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

  it("marks the hairline on the cap's edge, above the eyes in front", () => {
    const { p, headR, headZ } = standing(lightHair);
    expect(p.outlined).toContain("hairline");
    const cap = figureParts(p).find((x) => x.name === "cap");
    const pos = cap?.geometry.getAttribute("position") as THREE.BufferAttribute;
    // The cap's vertices shaded toward the hair's edge tone, in front of the eyes.
    const marked = [...Array(pos.count).keys()].filter((i) => (cap?.shade?.[i] ?? 0) > 0.5 && pos.getY(i) > headR * 0.6 && Math.abs(pos.getX(i)) < headR * 0.5);
    expect(marked.length).toBeGreaterThan(0);
    expect(cap?.tone).toBe(p.colours.hairEdge);
    expect(Math.min(...marked.map((i) => pos.getZ(i)))).toBeGreaterThan(headZ + headR * 0.22);
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

  it("draws the collar line on a dark neck in a tone of the clothing, never a white or black ring", () => {
    // No garments: the neutral clothing, under 3:1 against the darkest skins, so the neck seam is outlined.
    for (const skin of ["#292420", "#3a312a", "#604134"]) {
      const { p } = standing({ skin: { hex: skin } });
      expect(p.outlined, skin).toContain("neck");
      const neckBase = p.height - p.headHeight - 0.045 * p.height;
      const collars = figureParts(p).filter((x) => x.name === "band" && new THREE.Box3().setFromBufferAttribute(x.geometry.getAttribute("position") as THREE.BufferAttribute).min.z > neckBase - 0.02);
      expect(collars.length, skin).toBe(1);
      expect([INK_DARK, INK_LIGHT], skin).not.toContain(collars[0].colour);
      expect(collars[0].colour, skin).toBe(p.colours.collarEdge);
      expect(contrast(collars[0].colour, skin), skin).toBeGreaterThanOrEqual(MIN_CONTRAST);
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
    // How rough the cap is: the mean change in distance from the head's centre between neighbouring vertices. At
    // chin length, where the cap has its texture all round (a cropped or short cut's curls fade out at the sides, and
    // its smooth rise to the crown counted as roughness).
    const roughness = (texture: string) => {
      const { p, headR, headZ } = hairOf(18, texture);
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
        // Toward the sheen; where the hair's edge against the skin is drawn on the cap (black on deep skin), toward
        // that edge tone, a tone of the hair 3:1 off the skin, for both.
        expect(cap?.tone, `${texture} ${style}`).toBe(p.outlined.includes("hairline") ? p.colours.hairEdge : p.colours.hairSheen);
        const shade = [...(cap?.shade ?? [])];
        // Peaks well toward the sheen, troughs left in the hair's colour.
        expect(Math.max(...shade), `${texture} ${style}`).toBeGreaterThan(0.5);
        expect(Math.min(...shade), `${texture} ${style}`).toBeLessThan(0.1);
      }
      // Straight hair stays one smooth colour, but for its hairline's strands at the cap's front rim (black on deep
      // skin): over the top of the head, nothing is shaded.
      const { p, headR, headZ } = hairOf("straight", style);
      const cap = figureParts(p).find((x) => x.name === "cap");
      const pos = cap?.geometry.getAttribute("position") as THREE.BufferAttribute;
      const high = [...Array(pos.count).keys()].filter((i) => pos.getZ(i) > headZ + headR * 0.85);
      expect(Math.max(0, ...high.map((i) => cap?.shade?.[i] ?? 0)), style).toBe(0);
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
        // The hairline is drawn on the cap itself, in strands toward the hair's tone off the skin (`hairEdge`).
        const cap = parts.find((x) => x.name === "cap");
        if (p.outlined.includes("hairline")) {
          expect(cap?.tone, `${skin} ${hair} hairline`).toBe(p.colours.hairEdge);
          expect(contrast(p.colours.hairEdge, skin), `${skin} ${hair} hairline`).toBeGreaterThanOrEqual(MIN_CONTRAST);
          expect([INK_DARK, INK_LIGHT], `${skin} ${hair} hairline`).not.toContain(p.colours.hairEdge);
        }
        for (const seam of ["jawline"] as const) {
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

  it("sets the brows clear below the hair's front edge and its hairline line, above the eyes, on every texture and on short fringes", () => {
    for (const skin of SKINS) {
      for (const [length_cm, texture, style] of [[3, "straight", "loose"], [5, "straight", "loose"], [10, "straight", "loose"], [10, "wavy", "loose"], [10, "curly", "loose"], [10, "coily", "loose"], [5, "straight", "brushed"], [13, "straight", "swept_back"], [30, "straight", "bun"]] as const) {
        const { p, headR, headZ } = standing({ skin: { hex: skin }, eyes: { hex: "#5b3a1e" }, hair: { length_cm, texture, style, hex: "#1b1612" } });
        const label = `${skin} ${length_cm} cm ${texture} ${style}`;
        const brows = vertices(p, "brow");
        const browTop = Math.max(...brows.map((v) => v.z));
        // Above the eyes (their tops at 0.22 head radii over the head's centre).
        expect(Math.min(...brows.map((v) => v.z)), label).toBeGreaterThan(headZ + headR * 0.22);
        // In front of the brows (x within their span), the cap's lowest point and the hairline line's lowest point stand
        // clear above the brows' top by at least the brow's own thickness, so the brows read as their own strokes.
        const front = (name: string) => vertices(p, name).filter((v) => v.y > headR * 0.5 && Math.abs(v.x) > headR * 0.14 && Math.abs(v.x) < headR * 0.5);
        // (The hairline is drawn on the cap itself.)
        for (const name of ["cap", "fringe"]) {
          const edge = front(name);
          // Only brushed hair has a fringe across the forehead.
          if (name === "fringe" && style !== "brushed") continue;
          expect(edge.length, `${label} ${name}`).toBeGreaterThan(0);
          expect(Math.min(...edge.map((v) => v.z)) - browTop, `${label} ${name}`).toBeGreaterThan(headR * 0.09);
        }
      }
    }
  });

  it("gives a beard of the skin's own darkness a surface that stands off the skin: strands shaded toward a 3:1 tone of the beard", () => {
    for (const [skin, hair] of [["#292420", "#1b1612"], ["#3a312a", "#1b1612"], ["#f6ede4", "#eeeeea"]]) {
      for (const length_cm of [2, 10, 40]) {
        const { p } = standing({ skin: { hex: skin }, hair: { length_cm: 10, hex: hair }, facial_hair: { kind: "beard", length_cm, hex: hair } });
        const label = `${skin} ${hair} ${length_cm} cm`;
        const beards = figureParts(p).filter((x) => x.name === "beard");
        expect(beards.length, label).toBeGreaterThan(0);
        for (const beard of beards) {
          // Its own colour, shaded toward the beard's tone off the skin (the same family: a grey of black, a grey of white).
          expect(beard.colour, label).toBe(hair);
          expect(beard.tone, label).toBe(p.colours.facialHairEdge);
          expect(contrast(beard.tone as string, skin), label).toBeGreaterThanOrEqual(MIN_CONTRAST);
          const shade = [...(beard.shade ?? [])];
          expect(shade.length, label).toBe(beard.geometry.getAttribute("position").count);
          // Strands: some of the surface reaches the tone, some stays the beard's colour.
          expect(shade.filter((t) => t >= 0.9).length / shade.length, label).toBeGreaterThan(0.3);
          expect(Math.min(...shade), label).toBeLessThan(0.3);
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

describe("ears", () => {
  const withEars = (ears: string | undefined, hair: Record<string, unknown> = { length_cm: 3, texture: "straight", hex: "#653700" }, extra: Record<string, unknown> = {}) =>
    standing({ skin: { hex: "#eadaba" }, eyes: { hex: "#5b3a1e" }, face: ears ? { ears } : {}, hair, ...extra });

  it("draws an ear on each side of the head, standing out past the hair, from brow to below the nose, for every face.ears", () => {
    for (const ears of ["average", "small", "large", "pointed"]) {
      for (const length_cm of [3, 10]) {
        const { p, headR, headZ } = withEars(ears, { length_cm, texture: "straight", hex: "#653700" });
        const label = `${ears} ${length_cm} cm`;
        const ear = vertices(p, "ear");
        expect(ear.length, label).toBeGreaterThan(0);
        for (const side of [-1, 1]) {
          const one = ear.filter((v) => Math.sign(v.x) === side);
          expect(one.length, `${label} ${side}`).toBeGreaterThan(0);
          // Beside the head, between the eyes' height and the mouth's.
          const zs = one.map((v) => v.z - headZ);
          expect(Math.max(...zs), label).toBeGreaterThan(headR * 0.12);
          expect(Math.min(...zs), label).toBeLessThan(-headR * 0.1);
          expect(Math.max(...zs), label).toBeLessThan(headR * (ears === "pointed" ? 0.9 : 0.5));
          // Seen from the front: further out than the hair and the head at the ear's height.
          const out = Math.max(...one.map((v) => Math.abs(v.x)));
          const around = vertices(p, "cap").filter((v) => Math.abs(v.z - headZ) < headR * 0.15);
          const head = headR * 0.84;
          expect(out - Math.max(head, ...around.map((v) => Math.abs(v.x))), label).toBeGreaterThan(headR * 0.06);
          // Seen from the side: its middle beside the head's, a little behind it, not hanging off the back of the head.
          const ys = one.map((v) => v.y);
          expect((Math.max(...ys) + Math.min(...ys)) / 2, label).toBeLessThan(headR * 0.1);
          expect((Math.max(...ys) + Math.min(...ys)) / 2, label).toBeGreaterThan(-headR * 0.4);
        }
      }
    }
  });

  it("sizes the ears by face.ears and points pointed ones, so each value differs", () => {
    const height = (ears: string) => {
      const zs = vertices(withEars(ears).p, "ear").map((v) => v.z);
      return Math.max(...zs) - Math.min(...zs);
    };
    const top = (ears: string) => Math.max(...vertices(withEars(ears).p, "ear").map((v) => v.z));
    const { headR } = withEars("average");
    expect(height("small")).toBeLessThan(height("average") - headR * 0.08);
    expect(height("large")).toBeGreaterThan(height("average") + headR * 0.08);
    expect(top("pointed")).toBeGreaterThan(top("average") + headR * 0.2);
    // Average is what a record without face.ears gets.
    expect(vertices(withEars(undefined).p, "ear")).toEqual(vertices(withEars("average").p, "ear"));
  });

  it("leaves the ears out under a hood or hat, under hair worn down past the jaw, and under a coily cap standing out past them", () => {
    for (const style of ["loose", "bun"]) expect(vertices(withEars("large", { length_cm: style === "bun" ? 50 : 18, texture: "coily", style, hex: "#653700" }).p, "ear"), `coily ${style}`).toEqual([]);
    const hood = { garments: [{ areas: ["head"], layer: 2, colour: { hex: "#ff81c0" } }] };
    expect(vertices(withEars("large", undefined, hood).p, "ear")).toEqual([]);
    for (const style of ["loose", "brushed", "voluminous"]) expect(vertices(withEars("large", { length_cm: 30, texture: "straight", style, hex: "#653700" }).p, "ear"), style).toEqual([]);
    for (const style of ["ponytail", "bun", "mohawk", "spiky"]) expect(vertices(withEars("large", { length_cm: 30, texture: "straight", style, hex: "#653700" }).p, "ear").length, style).toBeGreaterThan(0);
  });
});

describe("hair length, hairline and ears in 3D", () => {
  const HAIR_PARTS = ["cap", "hairline", "hair", "fringe", "crest"];
  /** The box round every hair part. */
  const hairBox = (p: ReturnType<typeof figureParams>) => {
    const box = new THREE.Box3();
    for (const part of figureParts(p).filter((x) => HAIR_PARTS.includes(x.name ?? ""))) box.union(new THREE.Box3().setFromBufferAttribute(part.geometry.getAttribute("position") as THREE.BufferAttribute));
    return box;
  };

  it("draws each hair length band distinctly from its neighbours, for every texture", () => {
    const lengths = [1, 3, 10, 18, 30, 50, 75];
    for (const texture of ["straight", "wavy", "curly", "coily"]) {
      const figures = lengths.map((length_cm) => standing({ skin: { hex: "#d7bd96" }, hair: { length_cm, texture, hex: "#653700" } }));
      for (let i = 1; i < lengths.length; i++) {
        const [a, b] = [figures[i - 1], figures[i]];
        const label = `${texture} ${lengths[i - 1]} vs ${lengths[i]} cm`;
        const capColour = (f: typeof a) => figureParts(f.p).find((x) => x.name === "cap")?.colour;
        if (capColour(a) !== capColour(b)) continue;
        // Some side of the hair's outline moves by at least 0.06 head radii (about 5 px on a 150 px head).
        const [ba, bb] = [hairBox(a.p), hairBox(b.p)];
        const moved = Math.max(...[...ba.min.clone().sub(bb.min).toArray(), ...ba.max.clone().sub(bb.max).toArray()].map(Math.abs));
        expect(moved, label).toBeGreaterThan(a.headR * 0.06);
      }
    }
  });

  it("gives short curly and coily hair the bulk of its length, standing low at the sides so the ears show", () => {
    for (const texture of ["curly", "coily"]) {
      const crown = (length_cm: number) => {
        const { p, headR, headZ } = standing({ skin: { hex: "#292420" }, face: { ears: "large" }, hair: { length_cm, texture, hex: "#1b1612" } });
        return (Math.max(...vertices(p, "cap").map((v) => v.z)) - headZ) / headR;
      };
      // The crown rises with the length: cropped, short, then hair to the jaw.
      expect(crown(10) - crown(3), texture).toBeGreaterThan(0.08);
      expect(crown(18), texture).toBeGreaterThan(crown(10));
      for (const length_cm of [3, 10]) {
        const { p, headR, headZ } = standing({ skin: { hex: "#292420" }, face: { ears: "large" }, hair: { length_cm, texture, hex: "#1b1612" } });
        const label = `${texture} ${length_cm} cm`;
        const ear = vertices(p, "ear");
        expect(ear.length, label).toBeGreaterThan(0);
        // Each ear stands out past the hair at its own height, seen from the front.
        const around = vertices(p, "cap").filter((v) => Math.abs(v.z - headZ) < headR * 0.15);
        for (const side of [-1, 1]) {
          const out = Math.max(...ear.filter((v) => Math.sign(v.x) === side).map((v) => Math.abs(v.x)));
          expect(out - Math.max(headR * 0.84, ...around.filter((v) => Math.sign(v.x) === side).map((v) => Math.abs(v.x))), `${label} ${side}`).toBeGreaterThan(headR * 0.06);
        }
      }
    }
  });

  it("shapes long straight hair to the head and shoulders, with strands, not a flat slab", () => {
    for (const length_cm of [30, 50]) {
      const { p, headR, headZ } = standing({ skin: { hex: "#f6ede4" }, hair: { length_cm, texture: "straight", hex: "#eeeeea" } });
      const label = `${length_cm} cm`;
      const fall = figureParts(p).find((x) => x.name === "hair");
      expect(fall, label).toBeDefined();
      const hair = vertices(p, "hair");
      // How far out from the middle line the hair is at a height, at the back and sides.
      const reach = (z: number) => Math.max(...hair.filter((v) => Math.abs(v.z - z) < headR * 0.2).map((v) => Math.hypot(v.x, v.y)));
      const low = Math.min(...hair.map((v) => v.z));
      // Round the back of the head, in at the nape, then out over the shoulders.
      const nape = headZ - headR * 1.05;
      expect(reach(nape), label).toBeLessThan(reach(headZ - headR * 0.1) * 0.97);
      expect(reach(low + headR * 0.1), label).toBeGreaterThan(reach(nape) * 1.15);
      // Strands: columns shaded toward the hair's sheen.
      expect(fall?.tone, label).toBe(p.colours.hairSheen);
      const shade = [...(fall?.shade ?? [])];
      expect(Math.max(...shade) - Math.min(...shade), label).toBeGreaterThan(0.3);
    }
  });

  it("shades each ear's front edge toward a tone of the skin that stands 3:1 off it, on every palette skin", () => {
    for (const skin of ["#f6ede4", "#f3e7db", "#f7ead0", "#eadaba", "#d7bd96", "#a07e56", "#825c43", "#604134", "#3a312a", "#292420"]) {
      for (const ears of ["small", "average", "large", "pointed"]) {
        const { p } = standing({ skin: { hex: skin }, face: { ears }, hair: { length_cm: 3, texture: "straight", hex: "#1b1612" } });
        const label = `${ears} on ${skin}`;
        const parts = figureParts(p).filter((x) => x.name === "ear");
        expect(parts.length, label).toBeGreaterThan(0);
        expect(contrast(p.colours.earEdge, skin), label).toBeGreaterThanOrEqual(MIN_CONTRAST);
        for (const part of parts.filter((x) => x.shade)) expect(part.tone, label).toBe(p.colours.earEdge);
        // The ears' forward-facing surface reaches well toward that tone.
        const front = parts.flatMap((part) => {
          const normals = part.geometry.getAttribute("normal");
          return [...(part.shade ?? [])].filter((_, i) => normals.getY(i) > 0.5);
        });
        expect(Math.max(0, ...front), label).toBeGreaterThan(0.6);
      }
    }
  });
});

describe("hair styles in 3D", () => {
  const styled = (style: string, length_cm = 5) => standing({ skin: { hex: "#eadaba" }, eyes: { hex: "#5b3a1e" }, hair: { length_cm, texture: "straight", style, hex: "#653700" } });

  it("gives brushed hair a side-swept fringe: the hair's front edge lower on one side of the forehead than the other", () => {
    /** The lowest hair over the forehead on each side: the cap and any fringe, in front, between the brows' ends. */
    const frontEdge = (style: string, length: number, side: number) => {
      const { p, headR } = styled(style, length);
      const front = [...vertices(p, "cap"), ...vertices(p, "fringe")].filter((v) => v.y > headR * 0.55 && side * v.x > headR * 0.12 && side * v.x < headR * 0.45);
      return Math.min(...front.map((v) => v.z));
    };
    const { headR } = styled("loose");
    expect(Math.abs(frontEdge("loose", 5, 1) - frontEdge("loose", 5, -1))).toBeLessThan(headR * 0.01);
    for (const length of [5, 13]) expect(Math.abs(frontEdge("brushed", length, 1) - frontEdge("brushed", length, -1)), String(length)).toBeGreaterThan(headR * 0.08);
  });

  it("stands a mohawk's crest up in a ridge from the forehead to the nape, along the middle of the head", () => {
    for (const length of [2.5, 5, 13]) {
      const { p, headR, headZ } = styled("mohawk", length);
      const crest = vertices(p, "crest");
      expect(crest.length, String(length)).toBeGreaterThan(0);
      // Narrow, down the middle.
      for (const v of crest) expect(Math.abs(v.x), String(length)).toBeLessThan(headR * 0.18);
      // Along the whole top of the head, front to back, the crest stands at least 0.35 head radii off the head: its
      // outline seen from the side (the points furthest out, front to back), read where it passes over each y.
      const outline = crest
        .filter((v) => v.x > 0)
        .map((v) => ({ y: v.y / headR, rise: onHead(v, headR, headZ) - 1, angle: Math.atan2(v.y, v.z - headZ) }))
        .sort((a, b) => b.angle - a.angle);
      const top = outline.filter((v, i) => outline.every((w, j) => j === i || Math.abs(w.angle - v.angle) > 1e-6 || w.rise <= v.rise));
      for (let y = 0.5; y >= -0.7; y -= 0.1) {
        const rises: number[] = [];
        for (let i = 0; i < top.length - 1; i++) {
          const [a, b] = [top[i], top[i + 1]];
          if ((a.y - y) * (b.y - y) <= 0 && a.y !== b.y) rises.push(a.rise + ((b.rise - a.rise) * (y - a.y)) / (b.y - a.y));
        }
        expect(rises.length, `${length} at y ${y.toFixed(1)}`).toBeGreaterThan(0);
        expect(Math.max(...rises), `${length} at y ${y.toFixed(1)}`).toBeGreaterThan(0.35);
      }
    }
  });

  it("hangs a ponytail from the middle of the back of the head", () => {
    for (const texture of ["straight", "coily"]) {
      const { p } = standing({ skin: { hex: "#eadaba" }, hair: { length_cm: 30, texture, style: "ponytail", hex: "#653700" } });
      const xs = vertices(p, "ponytail").map((v) => v.x);
      expect(Math.abs(Math.max(...xs) + Math.min(...xs)), texture).toBeLessThan(1e-6);
    }
  });

  it("keeps the heaviest figure under the 5,000-triangle budget: muscular, deep or very pale skin (with eyelids), 75 cm coily hair in every style, a 100 cm beard, every feature and every trait, with each kind of ear", () => {
    const styles = ["loose", "voluminous", "ponytail", "braided", "bun", "topknot", "dreadlocks", "spiky", "mohawk", "swept_back", "brushed"];
    for (const [style, skin] of styles.flatMap((s) => ["#292420", "#f6ede4"].map((k) => [s, k]))) {
      for (const ears of ["average", "large", "pointed"]) {
        for (const traits of [[], ["tail", "wings", "antlers", "horns"]]) {
          const p = figureParams(
            {
              build: "muscular",
              skin: { hex: skin },
              face: { ears },
              hair: { length_cm: 75, texture: "coily", style, hex: "#1b1612" },
              facial_hair: { kind: "beard", length_cm: 100, hex: "#1b1612" },
              features: ["freckles", "dimples", "beauty_mark", "glasses", "earrings", "eyepatch", "sunglasses"],
              traits,
            },
            { height: 1.75 },
          );
          const g = figureGeometry(p);
          expect((g.getIndex()?.count ?? 0) / 3, `${style} ${ears} ${traits.length ? "every trait" : "no traits"}`).toBeLessThan(5000);        }
      }
    }
  });
});

/**
 * A flat (orthographic) picture of the figure's parts from the front (+y), the back (-y) or the right side (+x): for
 * each cell `step` metres square inside [u0, v0, u1, v1] (across, up), the part nearest the camera there, or none.
 */
function picture(
  parts: ReturnType<typeof figureParts>,
  /**
   * Or a camera `az` radians round from face-on (toward +x) and `el` above level, looking at `centre`: across and up
   * are then measured in the picture from `centre`, as the room's Dollhouse and Your eyes see a head.
   */
  view: "front" | "back" | "side" | { az: number; el: number; centre: THREE.Vector3 },
  [u0, v0, u1, v1]: [number, number, number, number],
  step: number,
  /** Leave out faces turned away from the camera, as the 3D view's one-sided material does. */
  cull = false,
): Array<Array<(typeof parts)[number] | undefined>> {
  const toCamera =
    typeof view === "string"
      ? new THREE.Vector3(...({ front: [0, 1, 0], back: [0, -1, 0], side: [1, 0, 0] } as const)[view])
      : new THREE.Vector3(Math.sin(view.az) * Math.cos(view.el), Math.cos(view.az) * Math.cos(view.el), Math.sin(view.el));
  // For a camera at an angle: the picture's across (level, to the camera's right) and up.
  const across = new THREE.Vector3(toCamera.y, -toCamera.x, 0).normalize();
  const upward = new THREE.Vector3().crossVectors(across, toCamera);
  const centre = typeof view === "string" ? new THREE.Vector3() : view.centre;
  const q = new THREE.Vector3();
  const [pa, pb, pc] = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const cols = Math.ceil((u1 - u0) / step);
  const rows = Math.ceil((v1 - v0) / step);
  const depth = Array.from({ length: rows }, () => new Array<number>(cols).fill(Number.NEGATIVE_INFINITY));
  const out = Array.from({ length: rows }, () => new Array<(typeof parts)[number] | undefined>(cols).fill(undefined));
  const project = (x: number, y: number, z: number): [number, number, number] => {
    if (view === "front") return [x, z, y];
    if (view === "back") return [-x, z, -y];
    if (view === "side") return [y, z, x];
    q.set(x, y, z).sub(centre);
    return [q.dot(across), q.dot(upward), q.dot(toCamera)];
  };
  for (const part of parts) {
    const pos = part.geometry.getAttribute("position");
    const index = part.geometry.getIndex();
    const count = index ? index.count : pos.count;
    const at = (k: number) => {
      const i = index ? index.getX(k) : k;
      return project(pos.getX(i), pos.getY(i), pos.getZ(i));
    };
    for (let t = 0; t < count; t += 3) {
      if (cull) {
        const vi = (k: number) => (index ? index.getX(k) : k);
        pa.fromBufferAttribute(pos, vi(t));
        pb.fromBufferAttribute(pos, vi(t + 1)).sub(pa);
        pc.fromBufferAttribute(pos, vi(t + 2)).sub(pa);
        if (pb.cross(pc).dot(toCamera) <= 0) continue;
      }
      const [a, b, c] = [at(t), at(t + 1), at(t + 2)];
      const area = (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]);
      if (Math.abs(area) < 1e-14) continue;
      const i0 = Math.max(0, Math.floor((Math.min(a[0], b[0], c[0]) - u0) / step));
      const i1 = Math.min(cols - 1, Math.floor((Math.max(a[0], b[0], c[0]) - u0) / step));
      const j0 = Math.max(0, Math.floor((Math.min(a[1], b[1], c[1]) - v0) / step));
      const j1 = Math.min(rows - 1, Math.floor((Math.max(a[1], b[1], c[1]) - v0) / step));
      for (let j = j0; j <= j1; j++) {
        for (let i = i0; i <= i1; i++) {
          const [u, v] = [u0 + (i + 0.5) * step, v0 + (j + 0.5) * step];
          const wa = ((b[0] - u) * (c[1] - v) - (c[0] - u) * (b[1] - v)) / area;
          const wb = ((c[0] - u) * (a[1] - v) - (a[0] - u) * (c[1] - v)) / area;
          const wc = 1 - wa - wb;
          if (wa < 0 || wb < 0 || wc < 0) continue;
          const d = wa * a[2] + wb * b[2] + wc * c[2];
          if (d > depth[j][i]) {
            depth[j][i] = d;
            out[j][i] = part;
          }
        }
      }
    }
  }
  return out;
}

describe("round five: eyes, hair length, texture, hairline and the back of long hair in 3D", () => {
  const HAIR_PARTS = ["cap", "hairline", "hair", "fringe", "crest"];
  const SKINS = ["#292420", "#3a312a", "#a07e56", "#d7bd96", "#f6ede4"];

  it("shows each eye's white and its iris or pupil from the front, face-on, on every skin, with or without an eye colour", () => {
    for (const skin of SKINS) {
      for (const eyes of [{ hex: "#5b3a1e" }, undefined]) {
        const { p, headR, headZ } = standing({ skin: { hex: skin }, ...(eyes ? { eyes } : {}), hair: { length_cm: 3, texture: "straight", hex: "#1b1612" } });
        const parts = figureParts(p);
        const label = `${eyes ? "brown eyes" : "no eye colour"} on ${skin}`;
        for (const side of [-1, 1]) {
          const [x, z] = [side * headR * 0.32, headZ + headR * 0.12];
          const step = headR / 100;
          const cells = picture(parts, "front", [x - headR * 0.15, z - headR * 0.15, x + headR * 0.15, z + headR * 0.15], step).flat();
          const disc = Math.PI * (headR * 0.1) ** 2;
          const shown = cells.filter((part) => part?.name === "eye");
          const white = (shown.filter((part) => part?.colour === EYE_WHITE).length * step * step) / disc;
          const middle = (shown.filter((part) => part?.colour !== EYE_WHITE).length * step * step) / disc;
          // At least a third of the eye's own size shows its white, and over a seventh its iris or pupil, which stands
          // 3:1 off the white.
          const tally = new Map<string, number>();
          for (const part of cells) tally.set(`${part?.name}:${part?.colour}`, (tally.get(`${part?.name}:${part?.colour}`) ?? 0) + 1);
          expect(white, `white ${side} ${label} ${JSON.stringify([...tally])}`).toBeGreaterThan(0.33);
          expect(middle, `iris ${side} ${label}`).toBeGreaterThan(0.15);
          for (const part of shown.filter((x) => x?.colour !== EYE_WHITE)) expect(contrast(part?.colour as string, EYE_WHITE), label).toBeGreaterThanOrEqual(MIN_CONTRAST);
        }
      }
    }
  });

  it("draws short straight hair plainly fuller than cropped from the front and the side, on deep and tan skin", () => {
    for (const [skin, hex] of [["#292420", "#1b1612"], ["#d7bd96", "#653700"]]) {
      const hairCells = (length_cm: number, view: "front" | "side") => {
        const { p, headR, headZ } = standing({ skin: { hex: skin }, hair: { length_cm, texture: "straight", hex } });
        const step = headR / 60;
        const grid = picture(figureParts(p), view, [-headR * 1.5, headZ - headR * 1.2, headR * 1.5, headZ + headR * 1.6], step);
        const set = new Set<string>();
        for (const [j, row] of grid.entries()) {
          for (const [i, part] of row.entries()) if (part && HAIR_PARTS.includes(part.name ?? "")) set.add(`${i},${j}`);
        }
        return { set, cell: (step / headR) ** 2 };
      };
      for (const view of ["front", "side"] as const) {
        const [a, b] = [hairCells(3, view), hairCells(10, view)];
        const differ = [...new Set([...a.set, ...b.set])].filter((k) => a.set.has(k) !== b.set.has(k)).length * a.cell;
        // At least 0.4 head radius squared (about 2,250 px on a 150 px head) more or less hair: the crown alone rising
        // 0.08 head radii gave 0.2, which a live check saw as the same haircut from the front.
        expect(differ, `${view} on ${skin}`).toBeGreaterThan(0.4);
      }
    }
  });

  it("gives coily and curly hair at chin length coils and curls down its fall and a rounded mass, unlike wavy hair", () => {
    /** The fall's vertices, and for each column (one direction round the head) how many times the texture's shade peaks down it. */
    const peaksDown = (texture: string) => {
      const { p } = standing({ skin: { hex: "#292420" }, hair: { length_cm: 18, texture, hex: "#1b1612" } });
      const fall = figureParts(p).find((x) => x.name === "hair");
      expect(fall, texture).toBeDefined();
      const pos = fall?.geometry.getAttribute("position") as THREE.BufferAttribute;
      const columns = new Map<number, Array<[number, number]>>();
      // The outer side only: the fall is two-sided, its inner side a copy of the same vertices.
      for (let i = 0; i < pos.count / 2; i++) {
        const key = Math.round(Math.atan2(pos.getY(i), pos.getX(i)) * 20);
        columns.set(key, [...(columns.get(key) ?? []), [pos.getZ(i), fall?.shade?.[i] ?? 0]]);
      }
      const peaks: number[] = [];
      for (const column of columns.values()) {
        const shades = column.sort((a, b) => a[0] - b[0]).map(([, s]) => s);
        let n = 0;
        for (let k = 1; k < shades.length - 1; k++) if (shades[k] > shades[k - 1] + 0.05 && shades[k] >= shades[k + 1]) n++;
        peaks.push(n);
      }
      const width = (zFrom: number, zTo: number) => {
        let w = 0;
        for (let i = 0; i < pos.count; i++) if (pos.getZ(i) >= zFrom && pos.getZ(i) <= zTo) w = Math.max(w, Math.abs(pos.getX(i)));
        return w;
      };
      let [low, high] = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
      for (let i = 0; i < pos.count; i++) [low, high] = [Math.min(low, pos.getZ(i)), Math.max(high, pos.getZ(i))];
      const span = high - low;
      return { peaks: peaks.reduce((a, b) => a + b, 0) / peaks.length, ends: width(low, low + span * 0.15), widest: width(low, high) };
    };
    const coily = peaksDown("coily");
    const curly = peaksDown("curly");
    const wavy = peaksDown("wavy");
    // Coils turn at least twice down a chin-length fall, curls more than once, both more than waves do (master: coils
    // 0.43, under one turn).
    expect(coily.peaks, "coily").toBeGreaterThanOrEqual(2);
    expect(curly.peaks, "curly").toBeGreaterThanOrEqual(1.2);
    expect(coily.peaks, "coily vs wavy").toBeGreaterThan(wavy.peaks + 0.5);
    expect(curly.peaks, "curly vs wavy").toBeGreaterThan(wavy.peaks + 0.3);
    // A rounded mass: the ends come back in from the widest point; wavy hair flicks out at its ends.
    expect(coily.ends, "coily").toBeLessThan(coily.widest * 0.95);
    expect(curly.ends, "curly").toBeLessThan(curly.widest * 0.97);
    expect(wavy.ends, "wavy").toBeGreaterThanOrEqual(wavy.widest * 0.99);
  });

  it("marks where hair ends on the cap itself, with strands shaded toward a tone 3:1 off the skin fading up from the rim, never a separate line of tips or a band", () => {
    for (const [skin, hex] of [["#292420", "#1b1612"], ["#3a312a", "#1b1612"], ["#f6ede4", "#eeeeea"]]) {
      for (const texture of ["straight", "coily"]) {
        const { p, headR, headZ } = standing({ skin: { hex: skin }, hair: { length_cm: 3, texture, hex } });
        const label = `${texture} on ${skin}`;
        expect(p.outlined, label).toContain("hairline");
        const parts = figureParts(p);
        expect(parts.filter((x) => x.name === "hairline"), label).toEqual([]);
        const cap = parts.find((x) => x.name === "cap");
        expect(contrast(cap?.tone as string, skin), label).toBeGreaterThanOrEqual(MIN_CONTRAST);
        const pos = cap?.geometry.getAttribute("position") as THREE.BufferAttribute;
        const shade = cap?.shade as Float32Array;
        // The cap's front, over the forehead: the lowest points there are its rim.
        const front = [...Array(pos.count).keys()].filter((i) => pos.getY(i) > headR * 0.55 && Math.abs(pos.getX(i)) < headR * 0.5);
        const rim = Math.min(...front.map((i) => pos.getZ(i)));
        const near = front.filter((i) => pos.getZ(i) < rim + headR * 0.12);
        // Along the rim some vertices go well toward the tone; on straight hair, strands, so others stay near the hair's
        // colour (on coily hair the coils' own shading lies between them).
        expect(Math.max(...near.map((i) => shade[i])), label).toBeGreaterThan(0.6);
        if (texture === "straight") {
          expect(Math.min(...near.map((i) => shade[i])), label).toBeLessThan(0.45);
          // It fades up from the rim: high on the forehead the cap keeps the hair's colour, so there is no band's upper edge.
          const above = front.filter((i) => pos.getZ(i) > rim + headR * 0.35 && pos.getZ(i) < headZ + headR * 0.95);
          expect(above.length, label).toBeGreaterThan(0);
          expect(Math.max(...above.map((i) => shade[i])), label).toBeLessThan(0.15);
        }
      }
    }
  });

  it("covers the cap's lower edge at the back with hair worn down, so no seam shows where they meet, for every texture", () => {
    for (const [length_cm, texture] of [[30, "straight"], [30, "wavy"], [30, "curly"], [30, "coily"], [18, "wavy"], [50, "straight"]] as const) {
      const { p, headR, headZ } = standing({ skin: { hex: "#d7bd96" }, hair: { length_cm, texture, hex: "#653700" } });
      const label = `${texture} ${length_cm} cm`;
      const step = headR / 60;
      const grid = picture(figureParts(p), "back", [-headR * 0.75, headZ - headR * 1.0, headR * 0.75, headZ + headR * 0.05], step);
      // From behind, below the fall's top (0.1 head radii over the head's middle), only the falling hair shows.
      const cap = grid.flat().filter((part) => part?.name === "cap").length;
      expect(cap, label).toBe(0);
    }
  });
});

describe("round six: coily and curly masses, temples, eyes on pale skin, waves, hairline and long falls in 3D", () => {
  const HAIR_PARTS = ["cap", "hair", "fringe", "crest"];
  const isHair = (part: ReturnType<typeof figureParts>[number] | undefined) => HAIR_PARTS.includes(part?.name ?? "");
  /** In each row, the cells between the first and the last hair cell that `hole` picks out. */
  const holesInHair = (grid: Array<Array<ReturnType<typeof figureParts>[number] | undefined>>, hole: (part: ReturnType<typeof figureParts>[number] | undefined) => boolean) => {
    const at: string[] = [];
    for (const [j, row] of grid.entries()) {
      const first = row.findIndex(isHair);
      if (first < 0) continue;
      const last = row.length - 1 - [...row].reverse().findIndex(isHair);
      for (let i = first; i <= last; i++) if (hole(row[i])) at.push(`${i},${j}`);
    }
    // The count, and where the first few are (column, row), for the message.
    return { length: at.length, at: at.slice(0, 6).join(" ") };
  };

  it("shows nothing through the hair at the temples from the front: no wall between the hair and the head, for curly and coily hair at every length", () => {
    for (const [skin, hex] of [["#292420", "#1b1612"], ["#f6ede4", "#653700"]]) {
      for (const texture of ["coily", "curly", "wavy", "straight"]) {
        for (const length_cm of [18, 30, 50, 75]) {
          const { p, headR, headZ } = standing({ skin: { hex: skin }, hair: { length_cm, texture, hex } });
          const step = headR / 80;
          // From eye level up past the temples (above them the coils' bumps make the outline itself uneven), seen as the
          // 3D view draws it (faces turned away are not drawn).
          const grid = picture(figureParts(p), "front", [-headR * 1.8, headZ, headR * 1.8, headZ + headR * 0.9], step, true);
          const holes = holesInHair(grid, (part) => part === undefined);
          expect(holes.length, `${texture} ${length_cm} cm on ${skin} at ${holes.at}`).toBe(0);
        }
      }
    }
  });

  it("shows no skin through the hair from behind, at the cap's sides or where hair worn down meets it", () => {
    for (const [skin, hex] of [["#eadaba", "#653700"], ["#292420", "#1b1612"]]) {
      for (const texture of ["straight", "wavy"]) {
        for (const length_cm of [3, 8, 18, 30, 50, 75]) {
          const { p, headR, headZ } = standing({ skin: { hex: skin }, hair: { length_cm, texture, hex } });
          const step = headR / 80;
          const grid = picture(figureParts(p), "back", [-headR * 1.8, headZ - headR * 0.3, headR * 1.8, headZ + headR * 1.6], step, true);
          const holes = holesInHair(grid, (part) => part !== undefined && !isHair(part));
          expect(holes.length, `${texture} ${length_cm} cm on ${skin} at ${holes.at}`).toBe(0);
        }
      }
    }
  });

  it("lets no point of the cap through hair worn down near its top, out to the sides of the head, from behind", () => {
    for (const [skin, hex] of [["#eadaba", "#653700"], ["#292420", "#1b1612"]]) {
      for (const texture of ["straight", "wavy", "curly", "coily"]) {
        for (const length_cm of [30, 50, 75]) {
          const { p, headR, headZ } = standing({ skin: { hex: skin }, hair: { length_cm, texture, hex } });
          const step = headR / 120;
          // Up to the fall's top (0.1 head radii over the head's middle), the full width of the head.
          const grid = picture(figureParts(p), "back", [-headR * 1.6, headZ - headR * 0.6, headR * 1.6, headZ + headR * 0.1], step, true);
          let through = 0;
          for (const row of grid) {
            const fall = row.map((part, i) => (part?.name === "hair" ? i : -1)).filter((i) => i >= 0);
            if (fall.length === 0) continue;
            for (let i = fall[0]; i <= fall[fall.length - 1]; i++) if (row[i]?.name === "cap") through++;
          }
          expect(through, `${texture} ${length_cm} cm on ${skin}`).toBe(0);
        }
      }
    }
  });

  it("draws coily and curly hair at chin length as one rounded mass, widest at the head and closing in below, with no band standing out under the crown", () => {
    for (const [skin, hex] of [["#292420", "#1b1612"], ["#f6ede4", "#653700"]]) {
      for (const texture of ["coily", "curly"]) {
        const { p, headR, headZ } = standing({ skin: { hex: skin }, hair: { length_cm: 18, texture, hex } });
        const step = headR / 60;
        const v0 = headZ - headR * 1.4;
        const grid = picture(figureParts(p), "back", [-headR * 2, v0, headR * 2, headZ + headR * 1.6], step, true);
        const widths = grid.map((row) => row.filter(isHair).length * step);
        const label = `${texture} on ${skin}`;
        const widest = widths.indexOf(Math.max(...widths));
        // The widest row is up at the head (above 0.3 head radii under its middle; master's band was widest 0.44 under
        // it), not in a band below it ...
        expect(v0 + (widest + 0.5) * step, label).toBeGreaterThan(headZ - headR * 0.3);
        // ... and below it the mass only closes in, but for a single coil standing out on its outline (0.12 head radii;
        // master's band stood 0.5 head radii wider than the head).
        for (let j = widest - 1; j >= 0; j--) {
          if (widths[j] === 0) break;
          expect(widths[j], `${label} row ${j}`).toBeLessThanOrEqual(Math.max(...widths.slice(j + 1, widest + 1).filter((w) => w > 0).slice(0, 4)) + headR * 0.12);
        }
      }
    }
  });

  it("rings each eye's white on skin as pale as it with a tone that stands 3:1 off the white", () => {
    // The palette's very pale, pale, fair and light skins: the white is within 1.3:1 of each.
    for (const skin of ["#f6ede4", "#f3e7db", "#f7ead0", "#eadaba"]) {
      expect(contrast(skin, EYE_WHITE)).toBeLessThan(LIDDED_BELOW);
      for (const eyes of [{ hex: "#4f7a3a" }, undefined]) {
        const { p, headR, headZ } = standing({ skin: { hex: skin }, ...(eyes ? { eyes } : {}), hair: { length_cm: 3, texture: "straight", hex: "#653700" } });
        const label = `${eyes ? "green" : "no colour"} on ${skin}`;
        for (const side of [-1, 1]) {
          const [x, z] = [side * headR * 0.32, headZ + headR * 0.12];
          const step = headR / 100;
          const half = 20;
          const grid = picture(figureParts(p), "front", [x - half * step, z - half * step, x + half * step, z + half * step], step, true);
          // Out from the eye's middle in 16 directions, from the white's edge to 1.4 eye radii (the eye radius is 10
          // cells): a cell standing 3:1 off the white comes before the face's skin runs on for more than a quarter of the
          // eye's radius.
          let ringed = 0;
          for (let k = 0; k < 16; k++) {
            const a = (k / 16) * 2 * Math.PI;
            let [skinRun, closed] = [0, false];
            for (let r = 5; r <= 14 && !closed; r += 0.5) {
              const part = grid[Math.round(half - 0.5 + r * Math.sin(a))]?.[Math.round(half - 0.5 + r * Math.cos(a))];
              if (part?.name === "eye") continue;
              if (part && contrast(part.colour, EYE_WHITE) >= MIN_CONTRAST) closed = true;
              else {
                skinRun += 0.5;
                if (skinRun > 2.5) break;
              }
            }
            if (closed) ringed++;
          }
          // On master the white was bordered by the skin all round (0 of 16). The lid is six-sided, so in a direction or
          // two its inner edge steps out a little from the white's.
          expect(ringed, `${label} side ${side}`).toBeGreaterThanOrEqual(14);
        }
      }
    }
  });

  it("waves wavy hair down its fall, and breaks the waves on the crown by strands rather than drawing them as level stripes", () => {
    for (const length_cm of [30, 50]) {
      const { p, headR, headZ } = standing({ skin: { hex: "#eadaba" }, hair: { length_cm, texture: "wavy", hex: "#653700" } });
      const parts = figureParts(p);
      const label = `wavy ${length_cm} cm`;
      // Down the fall's back (the outer side, the middle column), its shade rises and falls in waves, at least 3 times.
      const fall = parts.find((x) => x.name === "hair");
      const pos = fall?.geometry.getAttribute("position") as THREE.BufferAttribute;
      const column: Array<[number, number]> = [];
      for (let i = 0; i < pos.count / 2; i++) if (Math.abs(pos.getX(i)) < headR * 0.12 && pos.getY(i) < 0) column.push([pos.getZ(i), fall?.shade?.[i] ?? 0]);
      const shades = column.sort((a, b) => b[0] - a[0]).map(([, s]) => s);
      let peaks = 0;
      for (let k = 1; k < shades.length - 1; k++) if (shades[k] > shades[k - 1] + 0.05 && shades[k] >= shades[k + 1]) peaks++;
      expect(peaks, label).toBeGreaterThanOrEqual(3);
      // On the crown, at one height, the shade differs round the head: waves set level all round read as stripes.
      const cap = parts.find((x) => x.name === "cap");
      const cpos = cap?.geometry.getAttribute("position") as THREE.BufferAttribute;
      const bands = new Map<number, number[]>();
      for (let i = 0; i < cpos.count; i++) {
        if (cpos.getZ(i) < headZ + headR * 0.3) continue;
        const key = Math.round((cpos.getZ(i) - headZ) / (headR * 0.05));
        bands.set(key, [...(bands.get(key) ?? []), cap?.shade?.[i] ?? 0]);
      }
      const spreads = [...bands.values()].filter((s) => s.length >= 6).map((s) => Math.max(...s) - Math.min(...s));
      expect(spreads.reduce((a, b) => a + b, 0) / spreads.length, label).toBeGreaterThan(0.3);
    }
  });

  it("draws the hairline on dark hair over dark skin as strands of different lengths, not a band of even depth", () => {
    for (const [skin, hex] of [["#292420", "#1b1612"], ["#3a312a", "#1b1612"]]) {
      for (const length_cm of [3, 8]) {
        const { p, headR, headZ } = standing({ skin: { hex: skin }, hair: { length_cm, texture: "straight", hex } });
        const cap = figureParts(p).find((x) => x.name === "cap");
        const pos = cap?.geometry.getAttribute("position") as THREE.BufferAttribute;
        const shade = cap?.shade as Float32Array;
        // The cap's columns (its lines from crown to rim: one azimuth round its own axis, which leans back by CAP_LEAN)
        // over the forehead, each from the rim up (its polar angle round that axis, largest first).
        const unturn = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2 + CAP_LEAN, 0, 0)).invert();
        const columns = new Map<number, Array<[number, number]>>();
        for (let i = 0; i < pos.count; i++) {
          if (pos.getY(i) < headR * 0.3 || Math.abs(pos.getX(i)) > headR * 0.7) continue;
          const local = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i) - headZ).applyQuaternion(unturn);
          const key = Math.round(Math.atan2(local.x, local.z) * 100);
          columns.set(key, [...(columns.get(key) ?? []), [Math.acos(local.y / local.length()), shade[i]]]);
        }
        // Each strand (a column whose rim is shaded well toward the edge tone): its shade one vertex up from the rim,
        // which is how far up it reaches. Strands of one length gave one shade there.
        const reach = [...columns.values()]
          .map((c) => c.sort((a, b) => b[0] - a[0]).map(([, s]) => s))
          .filter((s) => s.length > 1 && s[0] > 0.6)
          .map((s) => s[1]);
        const levels: number[] = [];
        for (const r of reach) if (levels.every((l) => Math.abs(l - r) > 0.15)) levels.push(r);
        const label = `${length_cm} cm on ${skin}: ${reach.map((r) => r.toFixed(2)).join(" ")}`;
        expect(reach.length, label).toBeGreaterThanOrEqual(4);
        expect(levels.length, label).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("hangs long curly and coily hair in ringlets: locks side by side with open grooves the fall's whole length, each twisting down it, with uneven ends; never closed cells", () => {
    for (const texture of ["coily", "curly"]) {
      for (const length_cm of [30, 50, 75]) {
        const { p, headR } = standing({ skin: { hex: "#292420" }, hair: { length_cm, texture, hex: "#1b1612" } });
        const fall = figureParts(p).find((x) => x.name === "hair");
        const pos = fall?.geometry.getAttribute("position") as THREE.BufferAttribute;
        const shade = fall?.shade as Float32Array;
        const label = `${texture} ${length_cm} cm`;
        // The outer side (the first half of the two-sided fall), row by row: a row runs round from one front edge (x
        // below 0) to the other (x above 0), so the next row starts where x turns back below 0.
        const half = pos.count / 2;
        let top = Number.NEGATIVE_INFINITY;
        for (let i = 0; i < half; i++) top = Math.max(top, pos.getZ(i));
        let width = 1;
        while (!(pos.getX(width - 1) > 0 && pos.getX(width) < 0)) width++;
        expect(half % width, label).toBe(0);
        const rows = half / width;
        const at = (row: number, k: number) => row * width + k;
        // Rows past the top's fade (0.25 head radii down) and above the ends, read at the back (the middle column): the
        // two front edges' tops lie 0.25 head radii lower, so read there, the fall's top row counted as past the fade.
        const body = Array.from({ length: rows }, (_, r) => r).filter((r) => pos.getZ(at(r, Math.floor(width / 2))) < top - headR * 0.25 && r < rows - 1);
        expect(body.length, label).toBeGreaterThanOrEqual(5);
        // Grooves: the places in a row where the shade dips. In ringlets they are the same columns all the way down
        // (open grooves between locks); lumps one vertex in three made them move from row to row (closed cells).
        const dips = new Array<number>(width).fill(0);
        for (const r of body) {
          for (let k = 1; k < width - 1; k++) if (shade[at(r, k)] < shade[at(r, k - 1)] && shade[at(r, k)] <= shade[at(r, k + 1)]) dips[k]++;
        }
        const grooves = dips.map((n, k) => [n, k]).filter(([n]) => n >= body.length * 0.9).map(([, k]) => k);
        expect(grooves.length, `${label}: dips ${dips.join(" ")}`).toBeGreaterThanOrEqual(4);
        // Each lock between two neighbouring grooves twists: its middle's shade rises and falls down it, and it swings
        // from side to side between the grooves.
        let twisting = 0;
        for (let g = 0; g + 1 < grooves.length; g++) {
          const [g0, g1] = [grooves[g], grooves[g + 1]];
          if (g1 - g0 !== 2) continue;
          const m = g0 + 1;
          const lit = body.map((r) => shade[at(r, m)]);
          const swing = body.map((r) => {
            const [a, b, c] = [at(r, g0), at(r, g1), at(r, m)];
            const [bx, by] = [pos.getX(b) - pos.getX(a), pos.getY(b) - pos.getY(a)];
            return ((pos.getX(c) - pos.getX(a)) * bx + (pos.getY(c) - pos.getY(a)) * by) / (bx * bx + by * by);
          });
          const peaks = lit.filter((x, k) => k > 0 && k < lit.length - 1 && x > lit[k - 1] && x >= lit[k + 1]).length;
          if (peaks >= 2 && Math.max(...swing) - Math.min(...swing) > 0.2) twisting++;
        }
        expect(twisting, label).toBeGreaterThanOrEqual(3);
        // Uneven ends: the lowest points of the locks differ by at least a centimetre.
        const ends = Array.from({ length: width }, (_, k) => pos.getZ(at(rows - 1, k)));
        expect(Math.max(...ends) - Math.min(...ends), label).toBeGreaterThan(0.01);
      }
    }
  });

  it("makes short hair on light skin plainly fuller than cropped from the front and the side", () => {
    for (const [skin, hex] of [["#eadaba", "#653700"], ["#f6ede4", "#653700"]]) {
      const hairCells = (length_cm: number, view: "front" | "side") => {
        const { p, headR, headZ } = standing({ skin: { hex: skin }, hair: { length_cm, texture: "straight", hex } });
        const step = headR / 60;
        const grid = picture(figureParts(p), view, [-headR * 1.5, headZ - headR * 1.2, headR * 1.5, headZ + headR * 1.6], step);
        const set = new Set<string>();
        for (const [j, row] of grid.entries()) for (const [i, part] of row.entries()) if (isHair(part)) set.add(`${i},${j}`);
        return { set, cell: (step / headR) ** 2 };
      };
      for (const view of ["front", "side"] as const) {
        const [a, b] = [hairCells(3, view), hairCells(8, view)];
        const differ = [...new Set([...a.set, ...b.set])].filter((k) => a.set.has(k) !== b.set.has(k)).length * a.cell;
        expect(differ, `${view} on ${skin}`).toBeGreaterThan(0.6);
      }
    }
  });
});

describe("round seven: hair from the room's own angles, locks, lids and the fall beside the face in 3D", () => {
  const HAIR_PARTS = ["cap", "hair", "fringe", "crest"];
  const isHair = (part: ReturnType<typeof figureParts>[number] | undefined) => HAIR_PARTS.includes(part?.name ?? "");
  type Grid = Array<Array<ReturnType<typeof figureParts>[number] | undefined>>;
  /** In each row, the empty cells (the room behind) between the first and the last hair cell: where the wall shows. */
  const wallBetween = (grid: Grid) => {
    const at: string[] = [];
    for (const [j, row] of grid.entries()) {
      const first = row.findIndex(isHair);
      if (first < 0) continue;
      const last = row.length - 1 - [...row].reverse().findIndex(isHair);
      for (let i = first; i <= last; i++) if (row[i] === undefined) at.push(`${i},${j}`);
    }
    return { length: at.length, at: at.slice(0, 6).join(" ") };
  };

  it("meets the head with hair at the temples from every angle within 40 degrees of face-on and up to 30 above: no wall between hair and head", () => {
    const cases: Array<[string, number]> = [
      ...["coily", "curly"].flatMap((texture) => [18, 30, 50, 75].map((cm) => [texture, cm] as [string, number])),
      ["wavy", 30],
      ["straight", 30],
    ];
    for (const [skin, hex] of [["#292420", "#1b1612"], ["#f6ede4", "#653700"]]) {
      for (const [texture, length_cm] of cases) {
        const { p, headR, headZ } = standing({ skin: { hex: skin }, hair: { length_cm, texture, hex } });
        const parts = figureParts(p);
        for (const az of [-40, -25, -10, 0, 10, 25, 40]) {
          for (const el of [0, 15, 30]) {
            const view = { az: (az * Math.PI) / 180, el: (el * Math.PI) / 180, centre: new THREE.Vector3(0, 0, headZ) };
            // From just under the eyes up past the temples, seen as the 3D view draws it (faces turned away left out).
            const grid = picture(parts, view, [-headR * 1.8, -headR * 0.1, headR * 1.8, headR * 0.9], headR / 80, true);
            const wall = wallBetween(grid);
            expect(wall.length, `${texture} ${length_cm} cm on ${skin}, az ${az} el ${el}, at ${wall.at}`).toBe(0);
          }
        }
      }
    }
  });

  it("lets nothing show through hair worn down from behind, from level to 30 degrees above and 40 to either side: no dots of head, cap rim or wall", () => {
    for (const [texture, length_cm] of [["straight", 30], ["straight", 50], ["wavy", 30], ["curly", 18], ["curly", 30], ["coily", 50]] as const) {
      const { p, headR, headZ } = standing({ skin: { hex: "#eadaba" }, hair: { length_cm, texture, hex: "#653700" } });
      const parts = figureParts(p);
      for (const az of [140, 160, 180, 200, 220]) {
        for (const el of [0, 15, 30]) {
          const view = { az: (az * Math.PI) / 180, el: (el * Math.PI) / 180, centre: new THREE.Vector3(0, 0, headZ) };
          const grid = picture(parts, view, [-headR * 1.6, -headR * 1.4, headR * 1.6, headR * 1.4], headR / 150, true);
          const at: string[] = [];
          for (const [j, row] of grid.entries()) {
            const first = row.findIndex(isHair);
            if (first < 0) continue;
            const last = row.length - 1 - [...row].reverse().findIndex(isHair);
            // A dot: a cell that is not hair with hair on both sides of it in its row and column, or a cell of the cap or
            // its rim with the falling hair on all four sides (the cap poking through it).
            const fall = (part: (typeof row)[number]) => part?.name === "hair";
            for (let i = first + 1; i < last; i++) {
              const around = [row[i - 1], row[i + 1], grid[j - 1]?.[i], grid[j + 1]?.[i]];
              if (!isHair(row[i]) && around.every(isHair)) at.push(`${i},${j}:${row[i]?.name ?? "wall"}`);
              else if (row[i]?.name !== "hair" && around.every(fall)) at.push(`${i},${j}:${row[i]?.name} through the fall`);
            }
          }
          expect(at.length, `${texture} ${length_cm} cm, az ${az} el ${el}: ${at.slice(0, 6).join(" ")}`).toBe(0);
        }
      }
    }
  });

  it("brings long hair's front edge forward beside the cheek and jaw, then back in toward the neck, not straight down from the temple", () => {
    for (const texture of ["straight", "wavy", "curly", "coily"]) {
      for (const length_cm of [30, 50, 75]) {
        const { p, headR, headZ } = standing({ skin: { hex: "#eadaba" }, hair: { length_cm, texture, hex: "#653700" } });
        const fall = figureParts(p).find((x) => x.name === "hair");
        const pos = fall?.geometry.getAttribute("position") as THREE.BufferAttribute;
        // How far forward the fall reaches in a band of heights (head radii from the head's middle).
        const reach = (from: number, to: number) => {
          let y = Number.NEGATIVE_INFINITY;
          for (let i = 0; i < pos.count; i++) {
            const dz = (pos.getZ(i) - headZ) / headR;
            if (dz >= from && dz <= to) y = Math.max(y, pos.getY(i) / headR);
          }
          return y;
        };
        const label = `${texture} ${length_cm} cm`;
        const [temple, cheek, below] = [reach(-0.15, 0), reach(-0.75, -0.35), reach(-1.6, -1.3)];
        // Forward of where it starts by a fifth of a head radius at the cheek, and back from there below the jaw.
        expect(cheek - temple, `${label}: temple ${temple.toFixed(2)} cheek ${cheek.toFixed(2)}`).toBeGreaterThan(0.2);
        expect(cheek - below, `${label}: cheek ${cheek.toFixed(2)} below ${below.toFixed(2)}`).toBeGreaterThan(0.2);
      }
    }
  });

  it("runs a long wavy fall's waves on from strand to strand, not in patches that change from one column to the next", () => {
    for (const length_cm of [30, 50, 75]) {
      const { p } = standing({ skin: { hex: "#eadaba" }, hair: { length_cm, texture: "wavy", hex: "#653700" } });
      const fall = figureParts(p).find((x) => x.name === "hair");
      const shade = fall?.shade as Float32Array;
      // The fall's outer side: 21 columns by 13 rows; each column's shade down the fall, below its first rows.
      const columns = 20;
      const rows = shade.length / 2 / (columns + 1);
      const column = (ix: number) => Array.from({ length: rows - 3 }, (_, k) => shade[(k + 3) * (columns + 1) + ix]);
      const correlation = (a: number[], b: number[]) => {
        const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
        const [ma, mb] = [mean(a), mean(b)];
        let [ab, aa, bb] = [0, 0, 0];
        for (let k = 0; k < a.length; k++) [ab, aa, bb] = [ab + (a[k] - ma) * (b[k] - mb), aa + (a[k] - ma) ** 2, bb + (b[k] - mb) ** 2];
        return ab / Math.sqrt(aa * bb || 1);
      };
      // Round the back, between neighbouring columns: the same waves, a little shifted (master's swung so far between
      // columns that neighbours' waves hardly matched, patches like cobbles).
      const pairs = Array.from({ length: 12 }, (_, k) => correlation(column(k + 4), column(k + 5)));
      const average = pairs.reduce((s, x) => s + x, 0) / pairs.length;
      expect(average, `wavy ${length_cm} cm`).toBeGreaterThan(0.6);
    }
  });

  it("runs the crown's waves, curls or coils on into hair worn down round the back: the fall starts lock by lock at different heights, shaded as the cap is there, never along one level edge", () => {
    for (const [texture, length_cm] of [["wavy", 18], ["wavy", 30], ["wavy", 50], ["curly", 30], ["curly", 50], ["coily", 30], ["coily", 50], ["coily", 75]] as const) {
      for (const [skin, hex] of [["#292420", "#1b1612"], ["#eadaba", "#653700"]]) {
        const { p, headR } = standing({ skin: { hex: skin }, hair: { length_cm, texture, hex } });
        const fall = figureParts(p).find((x) => x.name === "hair");
        const pos = fall?.geometry.getAttribute("position") as THREE.BufferAttribute;
        const shade = fall?.shade as Float32Array;
        // Each column's top (its highest vertex on the outer side) within 0.6 radians of straight behind.
        const tops = new Map<number, number>();
        for (let i = 0; i < pos.count / 2; i++) {
          const round = Math.atan2(pos.getX(i), -pos.getY(i));
          if (Math.abs(round) > 0.6) continue;
          const key = Math.round(round * 100);
          const best = tops.get(key);
          if (best === undefined || pos.getZ(i) > pos.getZ(best)) tops.set(key, i);
        }
        const label = `${texture} ${length_cm} cm on ${skin}`;
        expect(tops.size, label).toBeGreaterThanOrEqual(4);
        const heights = [...tops.values()].map((i) => pos.getZ(i));
        const shades = [...tops.values()].map((i) => shade[i]);
        // Master's fall started at one height all round, its top shaded one even tone (the texture's average).
        expect((Math.max(...heights) - Math.min(...heights)) / headR, `${label}: heights`).toBeGreaterThan(0.05);
        expect(Math.max(...shades) - Math.min(...shades), `${label}: shades ${shades.map((s) => s.toFixed(2)).join(" ")}`).toBeGreaterThan(0.1);
      }
    }
  });

  it("draws each eye's white and its lid round, with at least twelve sides, not six like a nut", () => {
    for (const skin of ["#f6ede4", "#eadaba"]) {
      const { p, headR } = standing({ skin: { hex: skin }, hair: { length_cm: 3, texture: "straight", hex: "#653700" } });
      const parts = figureParts(p);
      for (const [name, colour] of [["eye", EYE_WHITE], ["eyelid", undefined]] as const) {
        for (const side of [-1, 1]) {
          // The part's vertices on this side of the face, seen along the way the face looks at the eye.
          const outward = new THREE.Vector3(side * 0.47, 1, 0.12).normalize();
          const points = parts
            .filter((x) => x.name === name && (colour === undefined || x.colour === colour))
            .flatMap((x) => {
              const pos = x.geometry.getAttribute("position");
              return Array.from({ length: pos.count }, (_, i) => new THREE.Vector3().fromBufferAttribute(pos, i));
            })
            .filter((v) => side * v.x > 0);
          expect(points.length, `${name} ${side} on ${skin}`).toBeGreaterThan(0);
          const middle = points.reduce((a, v) => a.add(v), new THREE.Vector3()).divideScalar(points.length);
          const u = new THREE.Vector3(0, 0, 1).cross(outward).normalize();
          const w = outward.clone().cross(u);
          // Its outline: the outermost point in each of 72 directions round its middle, and how many different
          // directions those outermost points lie in (a six-sided part's outline is its six corners).
          const corners = new Set<number>();
          for (let k = 0; k < 72; k++) {
            const a = (k / 72) * 2 * Math.PI;
            const dir = u.clone().multiplyScalar(Math.cos(a)).addScaledVector(w, Math.sin(a));
            let best = points[0];
            for (const v of points) if (v.clone().sub(middle).dot(dir) > best.clone().sub(middle).dot(dir)) best = v;
            const d = best.clone().sub(middle);
            corners.add(Math.round((Math.atan2(d.dot(w), d.dot(u)) * 180) / Math.PI / 5));
          }
          expect(corners.size, `${name} ${side} on ${skin} (head radius ${headR.toFixed(3)})`).toBeGreaterThanOrEqual(12);
        }
      }
    }
  });
});
