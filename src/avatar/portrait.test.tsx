import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { suppliedHexes, TEST_CHARACTERS } from "./characters.fixture";
import { contrast, INK_DARK, INK_LIGHT, MIN_CONTRAST } from "./colour";
import { figureParams, HORN_TONE, NEUTRAL_CLOTHING, NEUTRAL_SKIN } from "./figure";
import AvatarPortrait, { HEAD_VIEWBOX, PORTRAIT_BACKDROP } from "./portrait";

const draw = (appearance: unknown) => render(<AvatarPortrait appearance={appearance} />).container;

type Point = [number, number];

/** A path's outline as points (absolute M, L, H, V, Q, C and Z only, as the portrait writes them), curves sampled. */
function pathPoints(d: string): Point[] {
  const tokens = d.match(/[MLHVQCZ]|-?[\d.]+(?:e-?\d+)?/gi) ?? [];
  const out: Point[] = [];
  let at: Point = [0, 0];
  let command = "";
  let i = 0;
  const num = () => Number(tokens[i++]);
  while (i < tokens.length) {
    if (/[A-Z]/i.test(tokens[i])) command = tokens[i++].toUpperCase();
    if (command === "Z") continue;
    if (command === "M" || command === "L") at = [num(), num()];
    else if (command === "H") at = [num(), at[1]];
    else if (command === "V") at = [at[0], num()];
    else if (command === "Q" || command === "C") {
      const controls: Point[] = [];
      for (let k = 0; k < (command === "Q" ? 2 : 3); k++) controls.push([num(), num()]);
      const ps = [at, ...controls];
      for (let s = 1; s <= 12; s++) {
        const t = s / 12;
        let level = ps;
        while (level.length > 1) level = level.slice(1).map((p, k) => [level[k][0] + (p[0] - level[k][0]) * t, level[k][1] + (p[1] - level[k][1]) * t] as Point);
        out.push(level[0]);
      }
      at = controls[controls.length - 1];
      continue;
    }
    out.push(at);
  }
  return out;
}

/** A point as drawn: the `translate` and `scale` transforms on the element and its ancestors applied, innermost first. */
function transformed(el: Element, [x0, y0]: Point): Point {
  let [x, y] = [x0, y0];
  for (let e: Element | null = el; e; e = e.parentElement) {
    const ops = [...(e.getAttribute("transform") ?? "").matchAll(/(translate|scale)\(([-\d.]+)(?:[ ,]+([-\d.]+))?\)/g)];
    for (const [, op, a, b] of ops.reverse()) {
      if (op === "translate") [x, y] = [x + Number(a), y + Number(b ?? 0)];
      else [x, y] = [x * Number(a), y * Number(b ?? a)];
    }
  }
  return [x, y];
}

/** A shape's outline as points, as drawn (ellipse, circle, rect or path; its transforms, such as the full face's scale about x 32, applied). */
function polygonOf(el: Element): Point[] {
  const a = (name: string) => Number(el.getAttribute(name) ?? 0);
  let points: Point[];
  if (el.tagName === "ellipse" || el.tagName === "circle") {
    const [rx, ry] = el.tagName === "circle" ? [a("r"), a("r")] : [a("rx"), a("ry")];
    points = Array.from({ length: 72 }, (_, k) => [a("cx") + rx * Math.cos((k * Math.PI) / 36), a("cy") + ry * Math.sin((k * Math.PI) / 36)] as Point);
  } else if (el.tagName === "rect") {
    const [x, y, w, h, r] = [a("x"), a("y"), a("width"), a("height"), a("rx")];
    const corner = (cx: number, cy: number, from: number): Point[] => Array.from({ length: 10 }, (_, k) => [cx + r * Math.cos(from + (k * Math.PI) / 18), cy + r * Math.sin(from + (k * Math.PI) / 18)] as Point);
    points = [...corner(x + w - r, y + h - r, 0), ...corner(x + r, y + h - r, Math.PI / 2), ...corner(x + r, y + r, Math.PI), ...corner(x + w - r, y + r, (3 * Math.PI) / 2)];
  } else {
    points = pathPoints(el.getAttribute("d") ?? "");
  }
  return points.map((p) => transformed(el, p));
}

/** Whether the point is inside the polygon (even-odd). */
function inside([x, y]: Point, poly: Point[]): boolean {
  let hit = false;
  for (let k = 0, j = poly.length - 1; k < poly.length; j = k++) {
    const [xi, yi] = poly[k];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/**
 * Where hair shows in the picture, as drawn: on a grid one unit apart over the 64-unit square, the points whose
 * topmost filled shape (the last drawn that holds the point) is hair, a hair sheen or a shaved shadow.
 */
function hairMask(svg: SVGSVGElement): Map<string, string> {
  const shapes = [...svg.querySelectorAll("path, circle, ellipse, rect")]
    .filter((el) => (el.getAttribute("fill") ?? "none") !== "none")
    .map((el) => {
      const poly = polygonOf(el);
      const xs = poly.map(([x]) => x);
      const ys = poly.map(([, y]) => y);
      // A shaved shadow is its own kind: it shows as a shade on the skin, not as hair.
      const kind = el.classList.contains("avatar-hair-shadow") ? "shadow" : el.closest(".avatar-hair") || el.classList.contains("avatar-hair-sheen") ? "hair" : "";
      return { poly, kind, box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] };
    });
  const out = new Map<string, string>();
  for (let y = 0.5; y < 64; y++) {
    for (let x = 0.5; x < 64; x++) {
      for (let k = shapes.length - 1; k >= 0; k--) {
        const { poly, kind, box } = shapes[k];
        if (x < box[0] || x > box[2] || y < box[1] || y > box[3] || !inside([x, y], poly)) continue;
        if (kind) out.set(`${x},${y}`, kind);
        break;
      }
    }
  }
  return out;
}

/** How many grid points (square units) show a different kind of hair (or none) in the two masks, within the box [x0, y0, x1, y1]. */
function maskDifference(a: Map<string, string>, b: Map<string, string>, [x0, y0, x1, y1] = [0, 0, 64, 64]): number {
  let n = 0;
  for (const key of new Set([...a.keys(), ...b.keys()])) {
    const [x, y] = key.split(",").map(Number);
    if (x >= x0 && x <= x1 && y >= y0 && y <= y1 && a.get(key) !== b.get(key)) n++;
  }
  return n;
}

/** The head's outline, sampled densely along its edges. */
function headOutline(svg: SVGSVGElement): Point[] {
  const poly = polygonOf(svg.querySelector(".avatar-skin") as Element);
  const out: Point[] = [];
  poly.forEach((p, k) => {
    const q = poly[(k + 1) % poly.length];
    for (let s = 0; s < 4; s++) out.push([p[0] + ((q[0] - p[0]) * s) / 4, p[1] + ((q[1] - p[1]) * s) / 4]);
  });
  return out;
}

/** Hair-coloured filled shapes drawn over the head (after it): the hair on top of the head. */
function hairOverHead(svg: SVGSVGElement, hex: string): Element[] {
  const head = svg.querySelector(".avatar-skin") as Element;
  return [...svg.querySelectorAll("path, circle, ellipse, rect")].filter(
    (el) => el.getAttribute("fill") === hex && head.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING && (el.closest(".avatar-hair") || el.classList.contains("avatar-hair")),
  );
}

/** How far inside the polygon a point is (its distance to the nearest edge), negative outside. */
function depthInside([x, y]: Point, poly: Point[]): number {
  let inside = false;
  let nearest = Number.POSITIVE_INFINITY;
  for (let k = 0, j = poly.length - 1; k < poly.length; j = k++) {
    const [xi, yi] = poly[k];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    const [dx, dy] = [xj - xi, yj - yi];
    const t = Math.max(0, Math.min(1, ((x - xi) * dx + (y - yi) * dy) / (dx * dx + dy * dy || 1)));
    nearest = Math.min(nearest, Math.hypot(x - (xi + t * dx), y - (yi + t * dy)));
  }
  return inside ? nearest : -nearest;
}

const spanOf = (poly: Point[]) => Math.max(...poly.map(([x]) => x)) - Math.min(...poly.map(([x]) => x));

/** How many times the outline's distance from the head's middle (32, 27) rises and then falls by over 0.3, in order along it. */
function bumps(poly: Point[]): number {
  let [peaks, low, high, rising] = [0, Number.POSITIVE_INFINITY, 0, false];
  for (const [x, y] of poly) {
    const r = Math.hypot(x - 32, y - 27);
    if (rising) {
      if (r > high) high = r;
      else if (high - r > 0.3) [peaks, rising, low] = [peaks + 1, false, r];
    } else if (r < low) low = r;
    else if (r - low > 0.3) [rising, high] = [true, r];
  }
  return peaks;
}

describe("AvatarPortrait", () => {
  it("draws nothing without an appearance map", () => {
    for (const nothing of [undefined, null, "a face", 3]) expect(draw(nothing).querySelector("svg")).toBeNull();
  });

  it("is decorative: hidden from the accessibility tree and never focusable", () => {
    const svg = draw(TEST_CHARACTERS[0].appearance).querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.getAttribute("focusable")).toBe("false");
    expect(svg?.querySelector("title")).toBeNull();
  });

  it("survives malformed fields", () => {
    const svg = draw({ face: "round", hair: [1, 2], marks: [null, { kind: 3 }], garments: {}, facial_hair: "beard" }).querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.querySelector(".avatar-hair")).toBeNull();
    expect(svg?.querySelector(".avatar-facial-hair")).toBeNull();
  });

  it("draws only supplied colours, outlines in the ink, for every test character", () => {
    for (const ch of TEST_CHARACTERS) {
      const { ink, faceInk, brow, facialHairEdge, hairSheen, hairEdge } = figureParams(ch.appearance, { height: ch.height, base: "#888888" }).colours;
      // Tones made from supplied colours count too: brows, hair and facial hair edges toned off the skin, the hair's sheen.
      const tones = [brow, facialHairEdge, hairSheen, hairEdge].filter((x): x is string => x !== undefined);
      const allowed = new Set([...suppliedHexes(ch.appearance), ink, faceInk, ...tones, PORTRAIT_BACKDROP, NEUTRAL_SKIN, NEUTRAL_CLOTHING, HORN_TONE]);
      const svg = draw(ch.appearance).querySelector("svg") as SVGSVGElement;
      for (const el of svg.querySelectorAll("[fill], [stroke]")) {
        for (const attr of ["fill", "stroke"]) {
          const value = el.getAttribute(attr);
          if (value && value !== "none") expect(allowed.has(value.toLowerCase()), `${ch.name} ${attr} ${value}`).toBe(true);
        }
      }
      // Skin and garment regions carry an ink outline, so neighbours stay apart at any contrast. Hair regions are
      // outlined in the hair's own tone off the skin: in the ink, black hair on deep skin showed only as white rings.
      for (const el of svg.querySelectorAll(".avatar-skin, .avatar-garment, .avatar-neck")) {
        expect(el.getAttribute("stroke"), ch.name).toBe(ink);
      }
      // A cap's body is filled only; its outer edge is a separate line (`.avatar-hair-edge`) in the same tone.
      for (const el of svg.querySelectorAll("path.avatar-hair")) {
        expect([hairEdge, "none"], ch.name).toContain(el.getAttribute("stroke"));
      }
      for (const el of svg.querySelectorAll(".avatar-hair-edge")) expect(el.getAttribute("stroke"), ch.name).toBe(hairEdge);
    }
  });

  it("leaves the face out when a form hides it", () => {
    const hidden = TEST_CHARACTERS.find((ch) => ch.appearance.face_hidden);
    const svg = draw(hidden?.appearance).querySelector("svg");
    expect(svg?.querySelector(".avatar-eye")).toBeNull();
    expect(svg?.querySelector(".avatar-brow")).toBeNull();
    expect(svg?.querySelector(".avatar-garment")).not.toBeNull();
  });

  it("draws eyes, brows, facial hair and marks when they are there", () => {
    const bearded = draw(TEST_CHARACTERS.find((ch) => ch.appearance.facial_hair?.kind === "beard")?.appearance);
    expect(bearded.querySelector(".avatar-facial-hair path")).not.toBeNull();
    expect(bearded.querySelectorAll(".avatar-eye")).toHaveLength(2);
    const scarred = draw(TEST_CHARACTERS.find((ch) => ch.appearance.marks?.some((m) => m.kind === "scar"))?.appearance);
    expect(scarred.querySelector(".avatar-mark")).not.toBeNull();
  });

  it("draws each supported feature and ignores unknown keys", () => {
    const drawn = (features: unknown) =>
      [...draw({ skin: { hex: "#a07e56" }, eyes: { hex: "#3a7d44" }, features }).querySelectorAll(".avatar-feature")].map((g) =>
        g.getAttribute("data-feature"),
      );
    const supported = ["freckles", "glasses", "sunglasses", "eyepatch", "earrings", "beauty_mark", "dimples"];
    for (const feature of supported) {
      expect(drawn([feature])).toEqual([feature]);
      const g = draw({ skin: { hex: "#a07e56" }, features: [feature] }).querySelector(".avatar-feature");
      expect(g?.children.length, feature).toBeGreaterThan(0);
    }
    expect(drawn(["monocle", "glasses", "GLASSES"])).toEqual(["glasses"]);
    expect(drawn("glasses")).toEqual([]);
    expect(draw({ face_hidden: true, features: ["glasses"] }).querySelector(".avatar-feature")).toBeNull();
  });

  it("draws pupils, nose, mouth, marks and features in an ink that stands out on the skin", () => {
    // Aster's dark clothes make her outline ink light; on her fair skin that ink vanished.
    const aster = TEST_CHARACTERS[0];
    expect(figureParams(aster.appearance, { height: aster.height, base: "#888888" }).colours.ink).toBe(INK_LIGHT);
    for (const ch of TEST_CHARACTERS) {
      const { skin, faceInk } = figureParams(ch.appearance, { height: ch.height, base: "#888888" }).colours;
      expect(contrast(faceInk, skin), ch.name).toBeGreaterThanOrEqual(MIN_CONTRAST);
      const svg = draw(ch.appearance).querySelector("svg") as SVGSVGElement;
      const onFace = [...svg.querySelectorAll(".avatar-nose, .avatar-mouth, .avatar-pupil, .avatar-mark, .avatar-feature *")];
      if (!ch.appearance.face_hidden) expect(onFace.length, ch.name).toBeGreaterThan(3);
      for (const el of onFace) {
        const stroke = el.getAttribute("stroke");
        expect(stroke && stroke !== "none" ? stroke : el.getAttribute("fill"), ch.name).toBe(faceInk);
      }
      for (const eye of svg.querySelectorAll(".avatar-eye")) expect(eye.getAttribute("stroke"), ch.name).toBe(faceInk);
    }
  });

  it("draws brows and a beard's edge that read on the darkest and palest skins, never ringing a beard in white or black ink", () => {
    for (const skin of ["#292420", "#3a312a", "#f6ede4"]) {
      for (const hair of ["#1b1612", "#653700", "#e3c27a", "#eeeeea"]) {
        const svg = draw({ skin: { hex: skin }, hair: { length_cm: 3, hex: hair }, facial_hair: { kind: "beard", length_cm: 8, hex: hair } }).querySelector("svg") as SVGSVGElement;
        for (const b of svg.querySelectorAll(".avatar-brow")) expect(contrast(b.getAttribute("stroke") ?? "", skin), `${skin} ${hair} brow`).toBeGreaterThanOrEqual(MIN_CONTRAST);
        const edge = svg.querySelector(".avatar-facial-hair path")?.getAttribute("stroke") ?? "";
        expect([INK_DARK, INK_LIGHT], `${skin} ${hair} beard edge`).not.toContain(edge);
        // The beard's edge stands 3:1 off the skin, so a beard of the skin's darkness still has a visible edge.
        expect(contrast(edge, skin), `${skin} ${hair} beard edge`).toBeGreaterThanOrEqual(MIN_CONTRAST);
      }
    }
  });

  it("draws hair of the skin's own darkness or paleness as a mass of hair: edged in a tone of the hair, its body shaded toward the sheen, never ringed in ink", () => {
    for (const [skin, hairHex] of [["#292420", "#1b1612"], ["#3a312a", "#1b1612"], ["#f6ede4", "#eeeeea"]]) {
      for (const hair of [
        { length_cm: 10, texture: "straight" },
        { length_cm: 3, texture: "coily" },
        { length_cm: 30, texture: "curly" },
        { length_cm: 50, texture: "coily", style: "bun" },
        { length_cm: 50, texture: "straight", style: "ponytail" },
        { length_cm: 50, texture: "wavy", style: "braided" },
        { length_cm: 30, texture: "straight", style: "topknot" },
        { length_cm: 30, texture: "straight", style: "dreadlocks" },
        { length_cm: 5, texture: "straight", style: "brushed" },
        { length_cm: 13, texture: "straight", style: "swept_back" },
      ]) {
        const label = `${skin} ${hairHex} ${hair.texture} ${hair.style ?? "loose"}`;
        const appearance = { skin: { hex: skin }, hair: { ...hair, hex: hairHex } };
        const { hairEdge, hairSheen } = figureParams(appearance, { height: 1.75 }).colours;
        const svg = draw(appearance).querySelector("svg") as SVGSVGElement;
        const hairParts = [...svg.querySelectorAll(".avatar-hair, .avatar-hair *, .avatar-hair-texture")];
        expect(hairParts.length, label).toBeGreaterThan(0);
        for (const el of hairParts) {
          for (const attr of ["fill", "stroke"]) expect([INK_DARK, INK_LIGHT], `${label} ${attr}`).not.toContain(el.getAttribute(attr));
        }
        // Its edge stands 3:1 off the skin.
        expect(contrast(hairEdge, skin), label).toBeGreaterThanOrEqual(MIN_CONTRAST);
        // Its body: shapes of the sheen inside it, which stands off the skin, so the hair is a mass and not an outline.
        const sheen = [...svg.querySelectorAll(".avatar-hair-sheen")];
        expect(sheen.length, label).toBeGreaterThan(0);
        // Filled shapes of the sheen, or (on straight hair) strands drawn in it.
        for (const el of sheen) expect(el.getAttribute("fill") === "none" ? el.getAttribute("stroke") : el.getAttribute("fill"), label).toBe(hairSheen);
        expect(contrast(hairSheen as string, skin), label).toBeGreaterThanOrEqual(2);
      }
    }
    // Hair that already stands off the skin is drawn as before: no sheen mass.
    expect(draw({ skin: { hex: "#f6ede4" }, hair: { length_cm: 10, hex: "#1b1612" } }).querySelector(".avatar-hair-sheen")).toBeNull();
  });

  it("draws a beard of the skin's own darkness or paleness as a mass of strands in its tone off the skin, not an outline", () => {
    for (const [skin, hex] of [["#292420", "#1b1612"], ["#f6ede4", "#eeeeea"]]) {
      for (const length_cm of [3, 10, 40]) {
        const label = `${skin} ${hex} ${length_cm}`;
        const appearance = { skin: { hex: skin }, facial_hair: { kind: "beard", length_cm, hex } };
        const { facialHairEdge } = figureParams(appearance, { height: 1.75 }).colours;
        const svg = draw(appearance).querySelector("svg") as SVGSVGElement;
        const strands = [...svg.querySelectorAll(".avatar-facial-hair .avatar-beard-strand")];
        expect(strands.length, label).toBeGreaterThan(15);
        for (const s of strands) expect(s.getAttribute("stroke"), label).toBe(facialHairEdge);
        // Strands over the cheeks and the chin, all under the mouth's corners or beside them, never over the mouth.
        const ys = strands.flatMap((s) => [...(s.getAttribute("d") ?? "").matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]));
        for (const [x, y] of ys) if (Math.abs(x - 32) < 5) expect(y, label).toBeGreaterThan(40.5);
        expect(Math.max(...ys.map(([, y]) => y)), label).toBeGreaterThan(42);
      }
    }
    // A beard that stands off the skin needs none.
    expect(draw({ skin: { hex: "#f6ede4" }, facial_hair: { kind: "beard", length_cm: 10, hex: "#1b1612" } }).querySelector(".avatar-beard-strand")).toBeNull();
  });

  it("gives brushed and swept-back hair silhouettes of their own: a parting notch, and hair lifted high off a high forehead", () => {
    /** Every point a path names. */
    const points = (d: string) => [...d.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
    const caps = (style: string, length_cm: number) => {
      const svg = draw({ skin: { hex: "#d7bd96" }, hair: { length_cm, texture: "straight", style, hex: "#653700" } }).querySelector("svg") as SVGSVGElement;
      // The cap: hair paths over the head (drawn after the head).
      const head = svg.querySelector(".avatar-skin") as Element;
      return [...svg.querySelectorAll("path.avatar-hair")].filter((el) => head.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING).map((el) => points(el.getAttribute("d") ?? ""));
    };
    const top = (paths: number[][][]) => Math.min(...paths.flat().map(([, y]) => y));
    // Swept back: the hair stands at least 6 units higher than loose hair of the same length (5 px at 32 px).
    for (const length of [8, 13]) expect(top(caps("loose", length)) - top(caps("swept_back", length)), String(length)).toBeGreaterThanOrEqual(6);
    // Brushed: the cap is two masses parted by a notch at least 2 units wide at the crown.
    for (const length of [2.5, 5, 13]) {
      const parts = caps("brushed", length);
      expect(parts.length, String(length)).toBe(2);
      const [left, right] = [...parts].sort((a, b) => Math.min(...a.map(([x]) => x)) - Math.min(...b.map(([x]) => x)));
      const crown = (path: number[][]) => path.filter(([, y]) => y < 14);
      const gap = Math.min(...crown(right).map(([x]) => x)) - Math.max(...crown(left).map(([x]) => x));
      expect(gap, String(length)).toBeGreaterThanOrEqual(2);
    }
  });

  it("draws a short beard over the cheeks and chin, following the jaw, and stubble as a shadow with visible hairs on any skin", () => {
    /** The y of every point a path names (ends and controls). */
    const ys = (d: string) => [...d.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map((m) => Number(m[2]));
    for (const skin of ["#292420", "#d7bd96", "#f6ede4"]) {
      for (const length_cm of [2, 3]) {
        for (const shape of ["oval", "angular", "square"]) {
          const d = draw({ skin: { hex: skin }, face: { shape }, facial_hair: { kind: "beard", length_cm, hex: "#1b1612" } }).querySelector(".avatar-facial-hair path")?.getAttribute("d") ?? "";
          // It reaches up the cheeks to the sideburns (y 27), where the jaw-line band stopped at y 30.
          expect(Math.min(...ys(d)), `${skin} ${length_cm} ${shape}`).toBeLessThanOrEqual(27);
          // And down over the chin, at most 1 below it.
          expect(Math.max(...ys(d)), `${skin} ${length_cm} ${shape}`).toBeGreaterThan(44);
        }
        // An angular face keeps its pointed chin under a short beard: a corner at the chin, not a curve rounding it.
        const angular = draw({ skin: { hex: skin }, face: { shape: "angular" }, facial_hair: { kind: "beard", length_cm, hex: "#1b1612" } });
        expect(angular.querySelector(".avatar-facial-hair path")?.getAttribute("d")).toMatch(/L32,44\.8 /);
      }
      const stubble = draw({ skin: { hex: skin }, facial_hair: { kind: "stubble", hex: "#1b1612" } });
      const dots = stubble.querySelectorAll(".avatar-stubble-dot");
      expect(dots.length, skin).toBeGreaterThan(14);
      for (const dot of dots) expect(contrast(dot.getAttribute("fill") ?? "", skin), skin).toBeGreaterThanOrEqual(MIN_CONTRAST);
    }
  });

  it("keeps the hair's texture on tied styles: curls, coils or waves on the cap of a ponytail, braids, bun or topknot", () => {
    const tied = (style: string, texture: string) =>
      draw({ skin: { hex: "#d7bd96" }, hair: { length_cm: 50, texture, style, hex: "#1b1612" } }).querySelector("svg") as SVGSVGElement;
    for (const style of ["ponytail", "braided", "bun", "topknot"]) {
      expect(tied(style, "straight").querySelector(".avatar-hair-texture"), style).toBeNull();
      const drawings = ["straight", "wavy", "curly", "coily"].map((texture) => tied(style, texture).innerHTML);
      expect(new Set(drawings).size, style).toBe(4);
      for (const texture of ["wavy", "curly", "coily"]) expect(tied(style, texture).querySelector(".avatar-hair-texture"), `${style} ${texture}`).not.toBeNull();
    }
  });

  it("shows where chin- and shoulder-length hair ends beside a very long dark beard: locks beside the face, clear of the beard", () => {
    const tip = (length_cm: number) => {
      const svg = draw({ skin: { hex: "#d7bd96" }, hair: { length_cm, texture: "straight", hex: "#1b1612" }, facial_hair: { kind: "beard", length_cm: 40, hex: "#1b1612" } }).querySelector("svg") as SVGSVGElement;
      // The hanging locks: hair drawn after the shoulders, before the head.
      const shoulders = svg.querySelector('.avatar-garment');
      const locks = [...svg.querySelectorAll("path.avatar-hair-lock")].filter((el) => shoulders && shoulders.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
      expect(locks, String(length_cm)).toHaveLength(2);
      const numbers = (d: string) => [...d.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
      for (const lock of locks) {
        // Beside the face, never over the beard (x 19.5 to 44.5).
        for (const [x] of numbers(lock.getAttribute("d") ?? "")) expect(x < 19.5 || x > 44.5, String(length_cm)).toBe(true);
      }
      return Math.max(...locks.flatMap((lock) => numbers(lock.getAttribute("d") ?? "").map(([, y]) => y)));
    };
    // Chin-length ends at the jaw, above the shoulders; shoulder-length 6 lower, on them.
    expect(tip(30) - tip(18)).toBeGreaterThanOrEqual(5);
    expect(tip(18)).toBeLessThan(45);
  });

  it("hangs earrings on the earlobe and keeps a cheek scar clear of glasses", () => {
    const earrings = draw({ skin: { hex: "#d7bd96" }, features: ["earrings"] }).querySelectorAll(".avatar-feature circle");
    // The ear is an ellipse at cy 30 with ry 4: each ring's centre is on it.
    for (const ring of earrings) expect(Math.abs(Number(ring.getAttribute("cy")) - 30)).toBeLessThan(4);
    const scar = draw({ skin: { hex: "#f6ede4" }, features: ["glasses"], marks: [{ kind: "scar", area: "cheek" }] }).querySelector(".avatar-mark");
    // Glasses lenses reach down to y 31.4; the scar starts below them.
    const [, startY] = /M[\d.]+,([\d.]+)/.exec(scar?.getAttribute("d") ?? "") ?? [];
    expect(Number(startY)).toBeGreaterThan(31.4);
  });

  it("sets the picture on a backdrop that black and white hair both stand out from", () => {
    // On the client's dark page, black hair behind the head showed only as its outline.
    for (const hair of ["#141414", "#e8e8e8"]) expect(contrast(PORTRAIT_BACKDROP, hair), hair).toBeGreaterThanOrEqual(MIN_CONTRAST);
    const svg = draw(TEST_CHARACTERS[0].appearance).querySelector("svg") as SVGSVGElement;
    expect(svg.firstElementChild?.getAttribute("class")).toBe("avatar-backdrop");
  });

  it("ends hair that falls behind the head in rounded corners, not a box", () => {
    for (const length_cm of [18, 40]) {
      const back = draw({ skin: { hex: "#a07e56" }, hair: { length_cm, hex: "#341c02" } }).querySelector("path.avatar-hair");
      const d = back?.getAttribute("d") ?? "";
      // It starts at the side of the head with a curve; its outer corners at the bottom are never reached by a straight line.
      const [, left] = /^M([\d.]+),26 C/.exec(d) ?? [];
      expect(left, String(length_cm)).toBeDefined();
      const w = 32 - Number(left);
      expect(d, String(length_cm)).not.toMatch(new RegExp(`L(${32 - w}|${32 + w}),`));
    }
  });

  it("draws a record without skin or garments in the neutral skin and clothing", () => {
    const svg = draw({ hair: { length_cm: 75, hex: "#a33a1f" }, eyes: { hex: "#4f7a3a" } }).querySelector("svg") as SVGSVGElement;
    expect(svg.querySelector(".avatar-skin")?.getAttribute("fill")).toBe(NEUTRAL_SKIN);
    expect(svg.querySelector('path.avatar-garment[d^="M"]')?.getAttribute("fill")).toBe(NEUTRAL_CLOTHING);
  });

  it("draws horns and antlers in the bone tone, not the hair colour", () => {
    for (const trait of ["horns", "antlers"]) {
      const horns = draw({ skin: { hex: "#292420" }, hair: { length_cm: 60, hex: "#c5c9c7" }, traits: [trait] }).querySelectorAll(".avatar-horn");
      expect(horns.length, trait).toBe(2);
      for (const h of horns) expect(h.getAttribute("fill"), trait).toBe(HORN_TONE);
    }
  });

  it("hides the ears under a hood or hat, and shows them otherwise", () => {
    const hood = { areas: ["head"], layer: 2, colour: { hex: "#ff81c0" } };
    for (const traits of [[], ["pointed ears"]]) {
      expect(draw({ skin: { hex: "#d7bd96" }, traits, garments: [hood] }).querySelectorAll(".avatar-ear")).toHaveLength(0);
      expect(draw({ skin: { hex: "#d7bd96" }, traits }).querySelectorAll(".avatar-ear")).toHaveLength(2);
    }
  });

  it("shows the head alone at list size, so the face has room, and the whole picture from 48 px", () => {
    const at = (size: number) => render(<AvatarPortrait appearance={TEST_CHARACTERS[0].appearance} size={size} />).container.querySelector("svg");
    expect(at(32)?.getAttribute("viewBox")).toBe(HEAD_VIEWBOX);
    expect(at(32)?.classList.contains("avatar-portrait-head")).toBe(true);
    expect(at(48)?.getAttribute("viewBox")).toBe("0 0 64 64");
    // The crop holds the whole head: eyes at y 28 and the mouth at y 38 to 40, within 5 to 45.
    const [, y0, , h] = HEAD_VIEWBOX.split(" ").map(Number);
    expect(y0).toBeLessThan(20);
    expect(y0 + h).toBeGreaterThan(42);
  });

  it("covers the crown with short loose hair on every face shape: no skin and no head outline above the hair", () => {
    for (const shape of ["oval", "round", "square", "heart", "long", "angular"]) {
      for (const build of ["average", "pudgy"]) {
        for (const texture of ["straight", "wavy", "curly", "coily"]) {
          for (const length_cm of [3, 5, 10, 13]) {
            for (const [skin, hex] of [["#292420", "#1b1612"], ["#d7bd96", "#653700"]]) {
              const label = `${shape} ${build} ${texture} ${length_cm} cm on ${skin}`;
              const svg = draw({ build, skin: { hex: skin }, face: { shape }, hair: { length_cm, texture, hex } }).querySelector("svg") as SVGSVGElement;
              const caps = hairOverHead(svg, hex).map(polygonOf);
              expect(caps.length, label).toBeGreaterThan(0);
              // Every point of the head's outline above the brows' level (y 20) lies inside the hair, clear of its edge.
              const crown = headOutline(svg).filter(([, y]) => y < 20);
              expect(crown.length, label).toBeGreaterThan(10);
              for (const p of crown) expect(Math.max(...caps.map((poly) => depthInside(p, poly))), `${label} at ${p.map((v) => v.toFixed(1))}`).toBeGreaterThan(0.2);
            }
          }
        }
      }
    }
  });

  it("draws curly and coily hair as one mass with a curly edge, never a ring of separate curls", () => {
    for (const [skin, hex] of [["#292420", "#1b1612"], ["#f6ede4", "#653700"]]) {
      for (const texture of ["curly", "coily"]) {
        for (const hair of [{ length_cm: 3 }, { length_cm: 10 }, { length_cm: 30 }, { length_cm: 50 }, { length_cm: 30, style: "voluminous" }, { length_cm: 50, style: "bun" }, { length_cm: 30, style: "ponytail" }]) {
          const label = `${texture} ${hair.length_cm} ${hair.style ?? "loose"} on ${skin}`;
          const svg = draw({ skin: { hex: skin }, hair: { ...hair, texture, hex } }).querySelector("svg") as SVGSVGElement;
          // No small filled round of the hair's colour over the head: those were the beads.
          for (const el of hairOverHead(svg, hex)) {
            const xs = polygonOf(el).map(([x]) => x);
            expect(Math.max(...xs) - Math.min(...xs), `${label} ${el.tagName}`).toBeGreaterThan(8);
          }
          // The mass's outline is curly: its distance from the head's middle rises and falls round the top many times.
          const body = hairOverHead(svg, hex).map(polygonOf).sort((a, b) => spanOf(b) - spanOf(a))[0];
          // Its outer edge: from the left end over the top to the rightmost point, before the hairline comes back.
          const right = body.reduce((best, p, k) => (p[0] > body[best][0] ? k : best), 0);
          expect(bumps(body.slice(0, right + 1)), label).toBeGreaterThanOrEqual(texture === "curly" ? 9 : 14);
        }
      }
    }
  });

  it("draws nothing in a bun that could read as a mouth: no line inside it", () => {
    for (const [skin, hex] of [["#292420", "#1b1612"], ["#eadaba", "#653700"], ["#f6ede4", "#1b1612"]]) {
      for (const texture of ["straight", "wavy", "curly", "coily"]) {
        const label = `${texture} bun on ${skin}`;
        const svg = draw({ skin: { hex: skin }, hair: { length_cm: 50, texture, style: "bun", hex } }).querySelector("svg") as SVGSVGElement;
        // The bun: the hair-coloured shape standing highest above the head.
        const bun = hairOverHead(svg, hex).map(polygonOf).sort((a, b) => Math.min(...a.map(([, y]) => y)) - Math.min(...b.map(([, y]) => y)))[0];
        const [x0, x1] = [Math.min(...bun.map(([x]) => x)), Math.max(...bun.map(([x]) => x))];
        const [y0, y1] = [Math.min(...bun.map(([, y]) => y)), Math.max(...bun.map(([, y]) => y))];
        const lines = [...svg.querySelectorAll("path")].filter((el) => el.getAttribute("fill") === "none" && el.getAttribute("stroke"));
        for (const line of lines) {
          const inside = polygonOf(line).every(([x, y]) => x > x0 && x < x1 && y > y0 && y < y1);
          expect(inside, `${label}: ${line.getAttribute("d")}`).toBe(false);
        }
      }
    }
  });

  it("draws each hair length band distinctly from its neighbours, for every texture, on light and dark skin", () => {
    // Each band at a length inside it: shaved, cropped, short, chin-length, shoulder-length, long, waist-length.
    const lengths = [1, 3, 10, 18, 30, 50, 75];
    // The head as the list shows it at 32 px: bands that end above the shoulders must differ there too.
    const head = [12, 5, 52, 45];
    for (const [skin, hex] of [["#d7bd96", "#653700"], ["#292420", "#1b1612"]]) {
      for (const texture of ["straight", "wavy", "curly", "coily"]) {
        const masks = lengths.map((length_cm) => hairMask(draw({ skin: { hex: skin }, face: { shape: "oval" }, hair: { length_cm, texture, hex } }).querySelector("svg") as SVGSVGElement));
        for (let i = 1; i < lengths.length; i++) {
          const label = `${texture} ${lengths[i - 1]} vs ${lengths[i]} cm on ${skin}`;
          // At least 80 square units of hair differ: about 50 px at 32 px, 320 at 128 px. Before this, cropped and
          // short hair differed by 46 to 74 and looked the same.
          expect(maskDifference(masks[i - 1], masks[i], lengths[i] <= 18 ? head : undefined), label).toBeGreaterThanOrEqual(80);
        }
      }
    }
  });

  it("draws no line in the hair's edge tone across the forehead, so hair of the skin's darkness reads as hair, not a cap", () => {
    for (const [skin, hex] of [["#292420", "#1b1612"], ["#3a312a", "#1b1612"], ["#f6ede4", "#eeeeea"]]) {
      for (const texture of ["straight", "wavy", "curly", "coily"]) {
        for (const hair of [{ length_cm: 3 }, { length_cm: 10 }, { length_cm: 18 }, { length_cm: 50, style: "bun" }, { length_cm: 30, style: "ponytail" }]) {
          const label = `${texture} ${hair.length_cm} ${hair.style ?? "loose"} on ${skin}`;
          const appearance = { skin: { hex: skin }, face: { shape: "oval" }, hair: { ...hair, texture, hex } };
          const { hairEdge } = figureParams(appearance, { height: 1.75 }).colours;
          const svg = draw(appearance).querySelector("svg") as SVGSVGElement;
          // Every stroke in the edge tone, where it passes over the forehead (between the brows' outer ends), stays up
          // on the crown or round a bun, above y 17: no arc along the hairline (which is at y 19 to 21).
          // The hair's outlines: edge lines and stroked hair shapes (strands drawn in the sheen are marks, not outlines).
          for (const el of svg.querySelectorAll(`.avatar-hair-edge, .avatar-hair path.avatar-hair[stroke="${hairEdge}"], .avatar-hair > path[stroke="${hairEdge}"]:not(.avatar-hair-sheen):not(.avatar-hair-strand):not(.avatar-hair-texture)`)) {
            for (const [x, y] of polygonOf(el)) if (x > 25 && x < 39) expect(y, `${label} ${el.getAttribute("d")?.slice(0, 40)}`).toBeLessThan(17);
          }
        }
      }
    }
  });

  it("covers a shaved scalp and a mohawk's sides with the hair's shadow over the crown, edged in the hair's tone, with no grey copy in the crest or brushed hair", () => {
    for (const [skin, hex] of [["#292420", "#1b1612"], ["#f6ede4", "#eeeeea"], ["#d7bd96", "#653700"]]) {
      for (const shape of ["oval", "square", "round"]) {
        for (const hair of [{ length_cm: 1 }, { length_cm: 5, style: "mohawk" }]) {
          const label = `${hair.style ?? "shaved"} ${shape} on ${skin}`;
          const appearance = { skin: { hex: skin }, face: { shape }, hair: { ...hair, texture: "straight", hex } };
          const { hairEdge } = figureParams(appearance, { height: 1.75 }).colours;
          const svg = draw(appearance).querySelector("svg") as SVGSVGElement;
          const shadow = svg.querySelector(".avatar-hair-shadow") as Element;
          expect(shadow, label).not.toBeNull();
          // Drawn over the head, it holds the head's outline above the brows: the head's ink outline is hidden there.
          const poly = polygonOf(shadow);
          for (const p of headOutline(svg).filter(([, y]) => y < 20)) expect(depthInside(p, poly), `${label} at ${p.map((v) => v.toFixed(1))}`).toBeGreaterThan(0.2);
          // Its outer edge, where it meets the backdrop, in the hair's tone off the skin, as other hair's is.
          expect(shadow.parentElement?.querySelector(".avatar-hair-edge")?.getAttribute("stroke"), label).toBe(hairEdge);
        }
      }
      for (const style of ["mohawk", "brushed"]) {
        const svg = draw({ skin: { hex: skin }, hair: { length_cm: 5, texture: "straight", style, hex } }).querySelector("svg") as SVGSVGElement;
        // No shrunken copy of a hair shape in the sheen (a transformed sheen shape): the light is drawn as strands.
        for (const el of svg.querySelectorAll(".avatar-hair-sheen")) expect(el.getAttribute("transform"), `${style} on ${skin}`).toBeNull();
      }
    }
  });

  it("differs between characters", () => {
    const pictures = TEST_CHARACTERS.map((ch) => draw(ch.appearance).innerHTML);
    expect(new Set(pictures).size).toBe(pictures.length);
  });
});

describe("AvatarPortrait hair, round five", () => {
  const svgOf = (appearance: unknown) => draw(appearance).querySelector("svg") as SVGSVGElement;
  /** Filled shapes drawn after the head inside the hair: what covers the head's outline over the crown. */
  const hairAfterHead = (svg: SVGSVGElement) => {
    const head = svg.querySelector(".avatar-skin") as Element;
    return [...svg.querySelectorAll("path, circle, ellipse, rect")].filter(
      (el) => (el.getAttribute("fill") ?? "none") !== "none" && head.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING && el.closest(".avatar-hair"),
    );
  };

  it("draws each band of hair worn down distinctly from its neighbours inside the People list's circle", () => {
    // The list shows HEAD_VIEWBOX (12 5 40 40) cut by a circle: centre (32, 25), radius 20.
    const [vx, vy, vw] = HEAD_VIEWBOX.split(" ").map(Number);
    const [cx, cy, r] = [vx + vw / 2, vy + vw / 2, vw / 2];
    const inCircle = (key: string) => {
      const [x, y] = key.split(",").map(Number);
      return Math.hypot(x - cx, y - cy) <= r;
    };
    const lengths = [10, 18, 30, 50, 75];
    for (const [skin, hex] of [["#d7bd96", "#653700"], ["#292420", "#1b1612"]]) {
      for (const texture of ["straight", "wavy", "curly", "coily"]) {
        const masks = lengths.map((length_cm) => {
          const mask = hairMask(svgOf({ skin: { hex: skin }, face: { shape: "oval" }, hair: { length_cm, texture, hex } }));
          return new Map([...mask].filter(([key]) => inCircle(key)));
        });
        for (let i = 1; i < lengths.length; i++) {
          // At least 80 square units differ inside the circle: about 50 px at the list's 32 px.
          expect.soft(maskDifference(masks[i - 1], masks[i]), `${texture} ${lengths[i - 1]} vs ${lengths[i]} cm on ${skin}`).toBeGreaterThanOrEqual(80);
        }
      }
    }
  });

  it("covers the head's outline in brushed hair's parting, so no line of it shows over the crown", () => {
    for (const [skin, hex] of [["#292420", "#1b1612"], ["#f6ede4", "#eeeeea"], ["#d7bd96", "#653700"]]) {
      for (const shape of ["oval", "square", "round", "long", "heart"]) {
        const svg = svgOf({ skin: { hex: skin }, face: { shape }, hair: { length_cm: 5, texture: "straight", style: "brushed", hex } });
        const covers = hairAfterHead(svg).map((el) => polygonOf(el));
        for (const p of headOutline(svg).filter(([, y]) => y < 19)) {
          expect(Math.max(...covers.map((poly) => depthInside(p, poly))), `${shape} on ${skin} at ${p.map((v) => v.toFixed(1))}`).toBeGreaterThan(0.2);
        }
      }
    }
  });

  it("draws curly and coily locks beside the face as curls in the hair's own colour, never flat panels with a grey copy inside", () => {
    for (const [skin, hex] of [["#292420", "#1b1612"], ["#f6ede4", "#653700"]]) {
      for (const texture of ["curly", "coily"]) {
        for (const length_cm of [18, 30, 50]) {
          const label = `${texture} ${length_cm} cm on ${skin}`;
          const svg = svgOf({ skin: { hex: skin }, face: { shape: "oval" }, hair: { length_cm, texture, hex } });
          // The locks: shapes in the hair's colour beside the face, reaching below the cheekbones.
          const locks = [...svg.querySelectorAll(`path[fill="${hex}"]`)].filter((el) => {
            const poly = polygonOf(el);
            const xs = poly.map(([x]) => x);
            const ys = poly.map(([, y]) => y);
            const middle = (Math.min(...xs) + Math.max(...xs)) / 2;
            // Hanging from beside the face (the hair behind the head and the cap rise over the crown).
            return Math.min(...ys) >= 22 && Math.max(...ys) > 34 && (middle < 26 || middle > 38);
          });
          expect(locks.length, label).toBeGreaterThanOrEqual(2);
          for (const lock of locks) {
            // No shrunken copy of it in the sheen (a grey panel inside it): its light is drawn as the curls' marks.
            for (const el of svg.querySelectorAll(".avatar-hair-sheen")) expect(el.getAttribute("d") === lock.getAttribute("d") && el.getAttribute("transform"), label).toBeFalsy();
            // Its outline rises and falls in curls down its length.
            expect(bumps(polygonOf(lock)), `${label} ${lock.getAttribute("d")?.slice(0, 30)}`).toBeGreaterThanOrEqual(6);
          }
        }
      }
    }
  });

  it("draws a shaved scalp as stubble, points standing 3:1 off the skin, and cropped hair as strands without points, on deep skin", () => {
    for (const [skin, hex] of [["#292420", "#1b1612"], ["#3a312a", "#1b1612"], ["#d7bd96", "#653700"]]) {
      const shaved = svgOf({ skin: { hex: skin }, face: { shape: "oval" }, hair: { length_cm: 1, texture: "straight", hex } });
      const dots = [...shaved.querySelectorAll(".avatar-hair circle")];
      expect(dots.length, `shaved on ${skin}`).toBeGreaterThanOrEqual(20);
      for (const dot of dots) expect(contrast(dot.getAttribute("fill") as string, skin), `shaved on ${skin}`).toBeGreaterThanOrEqual(MIN_CONTRAST);
      const cropped = svgOf({ skin: { hex: skin }, face: { shape: "oval" }, hair: { length_cm: 3, texture: "straight", hex } });
      expect(cropped.querySelectorAll(".avatar-hair circle").length, `cropped on ${skin}`).toBe(0);
      expect(cropped.querySelector(".avatar-hair-strand"), `cropped on ${skin}`).not.toBeNull();
    }
  });

  it("ends cropped curly and coily hair in curls along the forehead, not a smooth edge like a cap's brim", () => {
    for (const [skin, hex] of [["#292420", "#1b1612"], ["#d7bd96", "#653700"]]) {
      for (const texture of ["curly", "coily"]) {
        const svg = svgOf({ skin: { hex: skin }, face: { shape: "oval" }, hair: { length_cm: 3, texture, hex } });
        const body = svg.querySelector(`g.avatar-hair path.avatar-hair[fill="${hex}"]`) as Element;
        // The lower edge over the forehead: the outline's points between the brows' outer ends, below the crown.
        const lower = polygonOf(body).filter(([x, y]) => x > 23 && x < 41 && y > 14);
        expect(bumps(lower), `${texture} on ${skin}`).toBeGreaterThanOrEqual(3);
      }
    }
  });
});

describe("AvatarPortrait hair, round six", () => {
  const svgOf = (appearance: unknown) => draw(appearance).querySelector("svg") as SVGSVGElement;
  /** The cap's body: the hair-coloured shape over the head reaching the crown, not a lock beside the face. */
  const capBody = (svg: SVGSVGElement, hex: string) =>
    hairOverHead(svg, hex).find((el) => !el.classList.contains("avatar-hair-lock") && Math.min(...polygonOf(el).map(([, y]) => y)) < 12) as Element;

  it("brings curly and coily hair of chin length and longer down the temples in curls, never a straight brim across the forehead sticking out past the face", () => {
    for (const [skin, hex] of [["#292420", "#1b1612"], ["#f6ede4", "#653700"]]) {
      for (const texture of ["curly", "coily"]) {
        for (const length_cm of [18, 30, 50, 75]) {
          const label = `${texture} ${length_cm} cm on ${skin}`;
          const body = polygonOf(capBody(svgOf({ skin: { hex: skin }, face: { shape: "oval" }, hair: { length_cm, texture, hex } }), hex));
          // Curls along the lower edge over the forehead, between the brows' outer ends.
          expect(bumps(body.filter(([x, y]) => x > 23 && x < 41 && y > 14 && y < 24)), label).toBeGreaterThanOrEqual(3);
          // Beside each temple, just outside the face (x 45 to 47 from the middle line 32), the hair comes down below
          // y 28.5, the level a brim's corners stuck out at (y 27).
          for (const side of [-1, 1]) {
            const temple = body.filter(([x]) => side * (x - 32) > 12.5 && side * (x - 32) < 15);
            expect(Math.max(...temple.map(([, y]) => y)), `${label} side ${side}`).toBeGreaterThan(28.5);
          }
        }
      }
    }
  });

  it("keeps the outline of waist-length and long curly or coily hair behind the head inside the locks in front of it, so no line of it shows at the sides", () => {
    for (const [skin, hex] of [["#292420", "#1b1612"], ["#f6ede4", "#653700"], ["#d7bd96", "#653700"]]) {
      for (const texture of ["curly", "coily"]) {
        for (const length_cm of [50, 75]) {
          const label = `${texture} ${length_cm} cm on ${skin}`;
          const svg = svgOf({ skin: { hex: skin }, face: { shape: "oval" }, hair: { length_cm, texture, hex } });
          const locks = [...svg.querySelectorAll(".avatar-hair-lock")].map((el) => polygonOf(el));
          expect(locks.length, label).toBe(2);
          const back = svg.querySelector('path.avatar-hair[stroke-width="1.2"]') as Element;
          const outline = polygonOf(back);
          const covers = [...locks, polygonOf(capBody(svg, hex))];
          // The back's outline down the sides (beside the head above the locks, beside the face, down to its rounded
          // end inside the picture): inside the cap or a lock by more than half its stroke.
          for (const p of outline.filter(([x, y]) => Math.abs(x - 32) > 10 && y > 14 && y < 64)) {
            expect(Math.max(...covers.map((poly) => depthInside(p, poly))), `${label} at ${p.map((v) => v.toFixed(1))}`).toBeGreaterThan(0.7);
          }
        }
      }
    }
  });

  it("makes short hair on light skin plainly fuller than cropped: higher over the crown and wider", () => {
    for (const [skin, hex] of [["#eadaba", "#653700"], ["#f6ede4", "#653700"], ["#292420", "#1b1612"]]) {
      const box = (length_cm: number) => {
        const poly = polygonOf(capBody(svgOf({ skin: { hex: skin }, face: { shape: "oval" }, hair: { length_cm, texture: "straight", hex } }), hex));
        return { top: Math.min(...poly.map(([, y]) => y)), width: spanOf(poly) };
      };
      const [cropped, short] = [box(3), box(8)];
      // At least 3 units higher (2.4 px at 48 px) and 2 wider: 1.6 and 1.6 were a modest difference live.
      expect(cropped.top - short.top, `top on ${skin}`).toBeGreaterThanOrEqual(3);
      expect(short.width - cropped.width, `width on ${skin}`).toBeGreaterThanOrEqual(2);
    }
  });
});
