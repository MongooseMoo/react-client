import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { suppliedHexes, TEST_CHARACTERS } from "./characters.fixture";
import { figureParams } from "./figure";
import AvatarPortrait from "./portrait";

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
      const ink = figureParams(ch.appearance, { height: ch.height, base: "#888888" }).colours.ink;
      const allowed = new Set([...suppliedHexes(ch.appearance), ink]);
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

  it("differs between characters", () => {
    const pictures = TEST_CHARACTERS.map((ch) => draw(ch.appearance).innerHTML);
    expect(new Set(pictures).size).toBe(pictures.length);
  });
});
