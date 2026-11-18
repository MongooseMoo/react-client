import { render } from "@testing-library/react";
import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { figureGeometry, figureParts } from "../map/figureMesh";
import { figureParams } from "./figure";
import AvatarPortrait from "./portrait";
import { GAME_BEARD_LENGTHS, GAME_HAIR_LENGTHS, GAME_HAIR_STYLE_MIN_CM, GAME_PALETTE, GAME_VOCABULARY, type VocabularyField, VOCABULARY_BASE, withValue } from "./vocabulary.fixture";

/**
 * Every value the game can send is drawn: refresh vocabulary.fixture.ts from the MOO
 * and a value the client has no drawing for turns this red.
 */

/** Fields the client draws. The first value of each is the plain middle, drawn as the default. */
const DRAWN: readonly VocabularyField[] = [
  "build",
  "hair.texture",
  "hair.style",
  "facial_hair.kind",
  "face.shape",
  "face.brows",
  "face.nose",
  "face.lips",
  "face.ears",
  "features",
];
/** Fields the client does not draw, and why. */
const NOT_DRAWN: Readonly<Partial<Record<VocabularyField, string>>> = {
  "face.teeth": "the game never puts teeth on the wire ($appearance:look)",
};

const portrait = (appearance: unknown) => render(<AvatarPortrait appearance={appearance} size={128} />).container.innerHTML;
const params = (appearance: unknown) => figureParams(appearance, { height: 1.75 });
/** A described appearance without `field`. */
function without(field: VocabularyField): Record<string, unknown> {
  const out: Record<string, unknown> = structuredClone(VOCABULARY_BASE);
  const [head, tail] = field.split(".");
  if (tail && typeof out[head] === "object") delete (out[head] as Record<string, unknown>)[tail];
  else delete out[head];
  if (field === "hair.texture") out.hair = { ...VOCABULARY_BASE.hair, length_cm: 30, texture: undefined };
  if (field === "hair.style") out.hair = { ...VOCABULARY_BASE.hair, length_cm: 30 };
  return out;
}

describe("the game's vocabulary", () => {
  it("is all accounted for: every field is drawn or listed with the reason it is not", () => {
    for (const field of Object.keys(GAME_VOCABULARY) as VocabularyField[]) {
      expect(DRAWN.includes(field) !== (field in NOT_DRAWN), field).toBe(true);
    }
  });

  for (const field of DRAWN) {
    it(`draws every ${field} value distinctly in the portrait, the plain one as the default`, () => {
      const values = GAME_VOCABULARY[field];
      const drawings = values.map((value) => portrait(withValue(field, value)));
      if (field === "features") {
        const none = portrait({ ...VOCABULARY_BASE, features: [] });
        for (const [i, value] of values.entries()) expect(drawings[i], value).not.toBe(none);
      } else {
        // The first value is the plain middle: the same as sending nothing.
        expect(drawings[0], `${values[0]} is the default`).toBe(portrait(without(field)));
      }
      for (let i = 0; i < values.length; i++) {
        for (let j = i + 1; j < values.length; j++) expect(drawings[i], `${values[i]} vs ${values[j]}`).not.toBe(drawings[j]);
      }
    });
  }

  it("gives the 3D figure every build, texture and facial hair kind, and the features big enough to see", () => {
    const shape = (build: string) => {
      const p = params(withValue("build", build));
      return JSON.stringify([p.shoulderHalf, p.waistHalf, p.hipHalf, p.limbRadius]);
    };
    expect(new Set(GAME_VOCABULARY.build.map(shape)).size).toBe(GAME_VOCABULARY.build.length);
    for (const texture of GAME_VOCABULARY["hair.texture"]) expect(params(withValue("hair.texture", texture)).hairTexture).toBe(texture);
    for (const kind of GAME_VOCABULARY["facial_hair.kind"]) expect(params(withValue("facial_hair.kind", kind)).facialHair).toBe(kind);
    // Every hair style builds a different figure: compare the parts' names, sizes and colours.
    const figure = (style: string) =>
      figureParts(params(withValue("hair.style", style)))
        .map((part) => {
          const box = new THREE.Box3().setFromBufferAttribute(part.geometry.getAttribute("position") as THREE.BufferAttribute);
          return `${part.name}:${part.colour}:${part.geometry.getAttribute("position").count}:${box.min.z.toFixed(3)}:${box.max.z.toFixed(3)}:${box.min.y.toFixed(3)}`;
        })
        .join("|");
    const styles = GAME_VOCABULARY["hair.style"].map(figure);
    expect(new Set(styles).size).toBe(styles.length);
    expect(styles[0]).toBe(figure("no such style"));
    // Every ear builds a different figure, average the same as sending none.
    const earsOf = (appearance: Record<string, unknown>) =>
      figureParts(params(appearance))
        .filter((part) => part.name === "ear")
        .map((part) => {
          const box = new THREE.Box3().setFromBufferAttribute(part.geometry.getAttribute("position") as THREE.BufferAttribute);
          return `${part.geometry.getAttribute("position").count}:${box.min.toArray().map((x) => x.toFixed(3))}:${box.max.toArray().map((x) => x.toFixed(3))}`;
        })
        .join("|");
    const ears = GAME_VOCABULARY["face.ears"].map((value) => earsOf(withValue("face.ears", value)));
    for (const drawn of ears) expect(drawn).not.toBe("");
    expect(new Set(ears).size).toBe(ears.length);
    expect(ears[0]).toBe(earsOf(without("face.ears")));
    const partCount = (features: string[]) => figureParts(params({ ...VOCABULARY_BASE, features })).length;
    for (const feature of ["glasses", "sunglasses", "eyepatch", "earrings"]) expect(partCount([feature]), feature).toBeGreaterThan(partCount([]));
  });

  it("draws every palette colour as the hex the game sends", () => {
    for (const [, hex] of Object.values(GAME_PALETTE.skin)) {
      expect(portrait({ ...VOCABULARY_BASE, skin: { hex } })).toContain(`fill="${hex}"`);
    }
    for (const [, hex] of Object.values(GAME_PALETTE.hair)) expect(params({ ...VOCABULARY_BASE, hair: { ...VOCABULARY_BASE.hair, hex } }).colours.hair).toBe(hex);
    for (const [, hex] of Object.values(GAME_PALETTE.eyes)) expect(params({ ...VOCABULARY_BASE, eyes: { hex } }).colours.eyes).toBe(hex);
    for (const [, hex] of Object.values(GAME_PALETTE.fabric)) {
      expect(params({ ...VOCABULARY_BASE, garments: [{ areas: ["torso"], layer: 1, colour: { hex } }] }).colours.torso).toBe(hex);
    }
  });
});

describe("hair style and length", () => {
  const styled = (style: string, length_cm: number) => ({ ...VOCABULARY_BASE, hair: { ...VOCABULARY_BASE.hair, length_cm, style } });

  it("draws each of the game's hair length bands distinctly, and bald only at 0", () => {
    const withLength = (length_cm: number) => ({ ...VOCABULARY_BASE, hair: { ...VOCABULARY_BASE.hair, length_cm } });
    const bald = { ...VOCABULARY_BASE, hair: undefined };
    expect(portrait(withLength(0))).toBe(portrait(bald));
    const figureKey = (appearance: unknown) =>
      figureParts(params(appearance))
        .map((part) => {
          const box = new THREE.Box3().setFromBufferAttribute(part.geometry.getAttribute("position") as THREE.BufferAttribute);
          return `${part.name}:${part.colour}:${box.min.z.toFixed(3)}:${box.max.x.toFixed(3)}`;
        })
        .join("|");
    // Each band from its lowest to just under its highest, as $appearance:look names lengths
    // (`length_cm < highest`; a length equal to a band's highest is named as the next band, as in the game).
    for (const [band, low, high] of GAME_HAIR_LENGTHS) {
      for (const cm of high === 0 ? [low, low * 3] : [low, high - 0.01]) expect(params(withLength(cm)).hair, `${cm} cm`).toBe(band);
    }
    const lows = GAME_HAIR_LENGTHS.map(([, low]) => low);
    const portraits = [portrait(bald), ...lows.map((cm) => portrait(withLength(cm)))];
    const figures = [figureKey(bald), ...lows.map((cm) => figureKey(withLength(cm)))];
    for (const pictures of [portraits, figures]) expect(new Set(pictures).size).toBe(pictures.length);
  });

  it("draws each style from the shortest hair the game offers it for, and hair too short for it loose", () => {
    for (const style of GAME_VOCABULARY["hair.style"]) {
      const min = GAME_HAIR_STYLE_MIN_CM[style];
      expect(min, style).toBeDefined();
      if (min === 0) continue;
      expect(portrait(styled(style, min)), `${style} at ${min} cm`).not.toBe(portrait(styled("loose", min)));
      expect(params(styled(style, min)).hairStyle).toBe(style);
      // A form can put any style on any length: too short, it is the plain drawing for that length.
      const short = min - 0.5;
      expect(portrait(styled(style, short)), `${style} at ${short} cm`).toBe(portrait(styled("loose", short)));
      expect(params(styled(style, short)).hairStyle).toBe("loose");
    }
  });
});

describe("beard length", () => {
  const bands = GAME_BEARD_LENGTHS.map(([band, low]) => ({ band, length: low }));
  const beard = (length?: number) => (length === undefined ? withValue("facial_hair.kind", "beard") : withValue("facial_hair.length_cm", length));
  /** The lowest point of the portrait's beard path: its control points' y, a quarter of the way from the ends' y 30. */
  const portraitBottom = (length?: number) => {
    const d = new DOMParser().parseFromString(portrait(beard(length)), "text/html").querySelector(".avatar-facial-hair path")?.getAttribute("d") ?? "";
    const [, cy] = /^M19\.5,30 C[\d.]+,([\d.]+)/.exec(d) ?? [];
    return 0.25 * 30 + 0.75 * Number(cy);
  };

  it("keeps today's beard when no length is sent", () => {
    const d = new DOMParser().parseFromString(portrait(beard()), "text/html").querySelector(".avatar-facial-hair path")?.getAttribute("d");
    expect(d).toBe("M19.5,30 C19,47 45,47 44.5,30 C43,38 38,41 32,41 C26,41 21,38 19.5,30 Z");
  });

  it("draws a longer beard lower in the portrait, band by band", () => {
    const bottoms = bands.map(({ length }) => portraitBottom(length));
    for (let i = 1; i < bottoms.length; i++) expect(bottoms[i], bands[i].band).toBeGreaterThan(bottoms[i - 1] + 2);
    // A short beard stays on the jaw; a very long one reaches the bottom of the picture.
    expect(bottoms[0]).toBeLessThan(45);
    expect(bottoms.at(-1)).toBeGreaterThan(60);
  });

  it("hangs a longer beard lower on the 3D figure, band by band", () => {
    const lowest = (length?: number) => {
      let low = Number.POSITIVE_INFINITY;
      for (const part of figureParts(params(beard(length))).filter((x) => x.name === "beard")) {
        const box = new THREE.Box3().setFromBufferAttribute(part.geometry.getAttribute("position") as THREE.BufferAttribute);
        low = Math.min(low, box.min.z);
      }
      return low;
    };
    const lows = bands.map(({ length }) => lowest(length));
    for (let i = 1; i < lows.length; i++) expect(lows[i], bands[i].band).toBeLessThan(lows[i - 1] - 0.005);
    // A very long beard (40 cm) hangs about 30 cm below the jaw beard.
    expect(lowest(undefined) - lows[lows.length - 1]).toBeGreaterThan(0.25);
  });

  it("lays a long beard over the chest, not through it", () => {
    for (const build of ["thin", "average", "muscular"]) {
      const p = params({ ...beard(40), build });
      const neckBase = p.height - p.headHeight - 0.045 * p.height;
      // The torso is widest at its top, reaching 0.92 x 0.55 of the shoulder half width forward.
      const chest = p.shoulderHalf * 0.92 * 0.55;
      for (const part of figureParts(p).filter((x) => x.name === "beard")) {
        const positions = part.geometry.getAttribute("position");
        for (let i = 0; i < positions.count; i++) {
          if (positions.getZ(i) < neckBase) expect(positions.getY(i), build).toBeGreaterThan(chest);
        }
      }
    }
  });

  it("keeps the heaviest figure the vocabulary allows, in every hair style, under the 5,000-triangle budget", () => {
    for (const style of GAME_VOCABULARY["hair.style"]) {
      const heaviest = {
        ...withValue("facial_hair.length_cm", 100),
        build: "muscular",
        hair: { length_cm: 75, texture: "coily", style, hex: "#1b1612" },
        features: [...GAME_VOCABULARY.features],
      };
      const g = figureGeometry(params(heaviest));
      const triangles = (g.getIndex()?.count ?? g.getAttribute("position").count) / 3;
      expect(triangles, style).toBeLessThan(5000);
    }
  });
});
