import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { suppliedHexes, TEST_CHARACTERS } from "./characters.fixture";
import { contrast, INK_DARK, INK_LIGHT, MIN_CONTRAST } from "./colour";
import { figureParams, HORN_TONE, NEUTRAL_CLOTHING, NEUTRAL_SKIN } from "./figure";
import AvatarPortrait, { HEAD_VIEWBOX, PORTRAIT_BACKDROP } from "./portrait";

const draw = (appearance: unknown) => render(<AvatarPortrait appearance={appearance} />).container;

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
      const { ink, faceInk, brow, facialHairEdge, hairSheen } = figureParams(ch.appearance, { height: ch.height, base: "#888888" }).colours;
      // Tones made from supplied colours count too: brows and facial hair edges toned off the skin, the hair's sheen.
      const tones = [brow, facialHairEdge, hairSheen].filter((x): x is string => x !== undefined);
      const allowed = new Set([...suppliedHexes(ch.appearance), ink, faceInk, ...tones, PORTRAIT_BACKDROP, NEUTRAL_SKIN, NEUTRAL_CLOTHING, HORN_TONE]);
      const svg = draw(ch.appearance).querySelector("svg") as SVGSVGElement;
      for (const el of svg.querySelectorAll("[fill], [stroke]")) {
        for (const attr of ["fill", "stroke"]) {
          const value = el.getAttribute(attr);
          if (value && value !== "none") expect(allowed.has(value.toLowerCase()), `${ch.name} ${attr} ${value}`).toBe(true);
        }
      }
      // Skin, hair and garment regions carry an ink outline, so neighbours stay apart at any contrast.
      for (const el of svg.querySelectorAll(".avatar-skin, path.avatar-hair, .avatar-garment, .avatar-neck")) {
        expect(el.getAttribute("stroke"), ch.name).toBe(ink);
      }
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
      const after = [...svg.querySelectorAll("path.avatar-hair")].filter((el) => shoulders && shoulders.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
      const locks = after.filter((el) => /^M(15\.4|48\.6),27 /.test(el.getAttribute("d") ?? ""));
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
      // The outer corners (x 17 and 47 at the bottom) are never reached by a straight line.
      expect(d, String(length_cm)).not.toMatch(/L47,(42|54)|L17,(42|54)/);
      expect(d).toMatch(/^M17,26 C/);
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

  it("differs between characters", () => {
    const pictures = TEST_CHARACTERS.map((ch) => draw(ch.appearance).innerHTML);
    expect(new Set(pictures).size).toBe(pictures.length);
  });
});
