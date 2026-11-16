import { describe, expect, it } from "vitest";
import { suppliedHexes, TEST_CHARACTERS } from "./characters.fixture";
import { colourHex, contrast, hexOrUndefined, INK_DARK, INK_LIGHT, inkFor, MIN_CONTRAST } from "./colour";
import {
  appearanceLabel,
  BUILDS,
  figureFills,
  figureParams,
  hairShape,
  NEUTRAL_CLOTHING,
  NEUTRAL_SKIN,
  outermostByArea,
  tokenColours,
  UNCOLOURED_GARMENT,
} from "./figure";

const BASE = "#4ade80";
const params = (appearance: unknown, height = 1.75) => figureParams(appearance, { height, base: BASE });

describe("colour", () => {
  it("accepts only #rrggbb", () => {
    expect(hexOrUndefined("#A0b1C2")).toBe("#a0b1c2");
    for (const bad of ["a0b1c2", "#abc", "#gg0000", 7, null, undefined, {}, "#a0b1c2 "]) expect(hexOrUndefined(bad)).toBeUndefined();
    expect(colourHex({ name: "red", hex: "#ff0000" })).toBe("#ff0000");
    expect(colourHex("#ff0000")).toBeUndefined();
    expect(colourHex({ hex: 12 })).toBeUndefined();
  });

  it("computes WCAG contrast and picks the ink that stands out", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21);
    expect(contrast("#777777", "#777777")).toBe(1);
    expect(inkFor("#101010", "#202020")).toBe(INK_LIGHT);
    expect(inkFor("#f0f0f0", "#e0e0e0")).toBe(INK_DARK);
  });
});

describe("figureParams with missing or malformed appearance", () => {
  it("draws a person with no appearance map in the base colour, standing, average", () => {
    for (const nothing of [undefined, null, 42, "tall", []]) {
      const p = params(nothing);
      expect(p.posture).toBe("standing");
      expect(p.build).toBe("average");
      expect(p.hair).toBe("none");
      expect(p.facialHair).toBe("none");
      expect(p.extras).toEqual([]);
      expect([...figureFills(p)]).toEqual([BASE]);
      expect(p.outlined).toEqual([]);
    }
  });

  it("treats wrong types as unremarkable", () => {
    const p = params({
      build: 7,
      age_years: "old",
      skin: { hex: "brown" },
      hair: { length_cm: "long", hex: "123456" },
      facial_hair: { kind: "beard" },
      eyes: "#00ff00",
      posture: "flying",
      traits: "tail",
      garments: [null, { areas: "torso" }, { areas: ["elbow"], colour: { hex: "#ff0000" } }, "shirt"],
      marks: 5,
      face_hidden: "yes",
    });
    expect(p.build).toBe("average");
    expect(p.colours.skin).toBe(NEUTRAL_SKIN);
    expect(p.hair).toBe("none");
    expect(p.facialHair).toBe("none");
    expect(p.colours.eyes).toBeUndefined();
    expect(p.posture).toBe("standing");
    expect(p.extras).toEqual([]);
    expect(p.faceHidden).toBe(false);
    expect([...figureFills(p)].sort()).toEqual([NEUTRAL_SKIN, NEUTRAL_CLOTHING].sort());
  });

  it("draws a described person without skin or garments in the neutral skin and clothing, whatever the base", () => {
    // Most live records today: hair, eyes and build only.
    for (const base of [BASE, "#5ba0ff", undefined]) {
      const p = figureParams({ hair: { length_cm: 75, hex: "#a33a1f" }, eyes: { hex: "#4f7a3a" }, build: "dumpy" }, { height: 1.78, base });
      expect(p.colours.skin).toBe(NEUTRAL_SKIN);
      for (const area of ["torso", "arms", "hips", "legs", "feet"] as const) expect(p.colours[area], area).toBe(NEUTRAL_CLOTHING);
      expect(p.colours.hands).toBe(NEUTRAL_SKIN);
      expect(p.colours.hair).toBe("#a33a1f");
    }
    // Supplied garments are kept as they are; only a record with none gets the neutral clothing.
    const shirt = params({ garments: [{ areas: ["torso"], layer: 1, colour: { hex: "#01153e" } }] });
    expect(shirt.colours.torso).toBe("#01153e");
    expect(shirt.colours.legs).toBe(NEUTRAL_SKIN);
    // Black hair stands out from the neutral skin; the neutral clothing from the skin too.
    expect(contrast(NEUTRAL_SKIN, "#1b1612")).toBeGreaterThan(MIN_CONTRAST);
    expect(contrast(NEUTRAL_SKIN, NEUTRAL_CLOTHING)).toBeGreaterThan(MIN_CONTRAST);
  });

  it("keeps the height within reason", () => {
    expect(params({}, Number.NaN).height).toBe(1.75);
    expect(params({}, 0).height).toBe(0.5);
    expect(params({}, 99).height).toBe(4);
  });

  it("gives no label unless it is a non-empty string", () => {
    expect(appearanceLabel({ label: "  the tall woman " })).toBe("the tall woman");
    for (const bad of [undefined, {}, { label: "" }, { label: 3 }, "label"]) expect(appearanceLabel(bad)).toBeUndefined();
  });
});

describe("figureParams branches", () => {
  it("knows every game build, spelled as the game sends it, and only those", () => {
    for (const build of Object.keys(BUILDS)) expect(params({ build }).build).toBe(build);
    expect(params({ build: "Muscular" }).build).toBe("average");
    expect(params({ build: "gelatinous" }).build).toBe("average");
    expect(params({ build: "muscular" }).shoulderHalf).toBeGreaterThan(params({ build: "thin" }).shoulderHalf);
  });

  it("sorts hair by length and bulks it by texture", () => {
    // The game's bands, named as the game names them: under each band's highest; bald only at 0.
    expect([undefined, 0, -1, 0.5, 1.5, 3, 12.9, 13, 24, 40, 64, 65, 300].map(hairShape)).toEqual([
      "none",
      "none",
      "none",
      "shaved",
      "cropped",
      "cropped",
      "short",
      "chin-length",
      "shoulder-length",
      "long",
      "long",
      "waist-length",
      "waist-length",
    ]);
    const hair = (texture: string) => params({ hair: { length_cm: 10, texture, hex: "#222222" } }).hairVolume;
    expect(hair("straight")).toBe(1);
    expect(hair("coily")).toBeGreaterThan(hair("curly"));
    expect(hair("curly")).toBeGreaterThan(hair("wavy"));
    expect(hair("frizzy")).toBe(1);
    // Hair without a colour, or with a length that is not a number, is not drawn.
    expect(params({ hair: { length_cm: 30 } }).hair).toBe("none");
    expect(params({ hair: { length_cm: "long", hex: "#123456" } }).hair).toBe("none");
  });

  it("covers hair with a head garment", () => {
    const p = params({
      skin: { hex: "#a07e56" },
      hair: { length_cm: 30, hex: "#222222" },
      garments: [{ name: "hood", areas: ["head"], layer: 1, colour: { hex: "#650021" } }],
    });
    expect(p.headCovered).toBe(true);
    expect(p.hair).toBe("none");
    expect(p.colours.head).toBe("#650021");
  });

  it("takes the outermost garment per area: highest layer, then latest", () => {
    const byArea = outermostByArea({
      garments: [
        { areas: ["torso", "arms"], layer: 1, colour: { hex: "#111111" } },
        { areas: ["torso"], layer: 3, colour: { hex: "#222222" } },
        { areas: ["legs"], layer: 1, colour: { hex: "#333333" } },
        { areas: ["legs"], layer: 1, colour: { hex: "#444444" } },
        { areas: ["feet"], layer: 1 },
      ],
    });
    expect(byArea).toEqual({ torso: "#222222", arms: "#111111", legs: "#444444", feet: UNCOLOURED_GARMENT });
  });

  it("picks facial hair kinds, coloured by facial hair or else hair, never on a hidden face", () => {
    expect(params({ facial_hair: { kind: "beard", hex: "#333333" } }).facialHair).toBe("beard");
    expect(params({ hair: { hex: "#444444", length_cm: 2 }, facial_hair: { kind: "goatee" } }).colours.facialHair).toBe("#444444");
    expect(params({ facial_hair: { kind: "mutton chops", hex: "#333333" } }).facialHair).toBe("none");
    expect(params({ face_hidden: true, facial_hair: { kind: "beard", hex: "#333333" } }).facialHair).toBe("none");
    expect(params({ face_hidden: true, eyes: { hex: "#00ff00" } }).colours.eyes).toBeUndefined();
  });

  it("keeps a beard's length within the game's range, and only for a beard", () => {
    const beard = (length_cm: unknown, kind = "beard") => params({ facial_hair: { kind, length_cm, hex: "#333333" } });
    expect(beard(25).beardLength).toBe(25);
    expect(beard(25).beardReach).toBeCloseTo(25 / 40);
    expect(beard(500).beardLength).toBe(100);
    expect(beard(500).beardReach).toBe(1);
    expect(beard(-3).beardLength).toBe(0);
    for (const missing of [beard(undefined), beard("long"), beard(25, "goatee"), params({ facial_hair: { kind: "beard", length_cm: 25 } })]) {
      expect(missing.beardLength).toBeUndefined();
      expect(missing.beardReach).toBeUndefined();
    }
  });

  it("adds parts for known traits only, once each", () => {
    expect(params({ traits: ["Tail", "wings", "wing", "antlers", "horns", "pointed ears", "scales", 4] }).extras).toEqual([
      "tail",
      "wings",
      "antlers",
      "horns",
      "pointed_ears",
    ]);
  });

  it("keeps known features once each, in order, ignoring unknown keys, wrong types and a hidden face", () => {
    expect(params({ features: ["Glasses", "monocle", "freckles", 3, null, "glasses", "eyepatch", "glasses"] }).features).toEqual([
      "freckles",
      "glasses",
      "eyepatch",
    ]);
    for (const features of [undefined, "glasses", { glasses: true }, 7]) expect(params({ features }).features).toEqual([]);
    expect(params({ face_hidden: true, features: ["glasses"] }).features).toEqual([]);
  });

  it("lowers the crown for sitting and reclining", () => {
    const standing = params({}, 1.8);
    const sitting = params({ posture: "sitting" }, 1.8);
    const reclining = params({ posture: "reclining" }, 1.8);
    expect(standing.top).toBe(1.8);
    expect(sitting.top).toBeLessThan(standing.top);
    expect(sitting.top).toBeGreaterThan(1);
    expect(reclining.top).toBeLessThan(0.5);
  });

  it("gives children a larger head for their height", () => {
    expect(params({ age_years: 9 }).headHeight).toBeGreaterThan(params({ age_years: 15 }).headHeight);
    expect(params({ age_years: 15 }).headHeight).toBeGreaterThan(params({ age_years: 30 }).headHeight);
  });

  it("colours the plan token exactly as the figure: torso and head", () => {
    expect(tokenColours(undefined)).toBeUndefined();
    expect(tokenColours({})).toEqual({ body: NEUTRAL_CLOTHING, head: NEUTRAL_SKIN });
    expect(tokenColours({ garments: [{ areas: ["torso"], layer: 1, colour: { hex: "#01153e" } }] })).toEqual({ body: "#01153e", head: NEUTRAL_SKIN });
    expect(tokenColours({ skin: { hex: "#a07e56" }, hair: { length_cm: 5, hex: "#141414" } })).toEqual({ body: NEUTRAL_CLOTHING, head: "#141414" });
    for (const ch of TEST_CHARACTERS) {
      const { colours } = params(ch.appearance, ch.height);
      expect(tokenColours(ch.appearance), ch.name).toEqual({ body: colours.torso, head: colours.head });
    }
  });
});

describe("the test characters", () => {
  const all = TEST_CHARACTERS.map((ch) => ({ ch, p: params(ch.appearance, ch.height) }));

  it("are thirteen, with invented names", () => {
    expect(all.length).toBeGreaterThanOrEqual(13);
    expect(new Set(all.map(({ ch }) => ch.name)).size).toBe(all.length);
  });

  it("(a) adjacent regions reach 3:1 or are outlined, and are outlined only then", () => {
    for (const { ch, p } of all) {
      const c = p.colours;
      const pairs: Array<[string, string, string]> = [
        ["hairline", c.head, c.skin],
        ...(p.facialHair === "beard" || p.facialHair === "goatee" ? [["jawline", c.facialHair as string, c.skin] as [string, string, string]] : []),
        ["neck", c.neck, c.torso],
        ["waist", c.torso, c.hips],
        ["hips", c.hips, c.legs],
        ["wrists", c.arms, c.hands],
        ["ankles", c.legs, c.feet],
      ];
      for (const [seam, a, b] of pairs) {
        const needed = a !== b && contrast(a, b) < MIN_CONTRAST;
        expect(p.outlined.includes(seam as never), `${ch.name} ${seam} ${a}/${b}`).toBe(needed);
      }
      // An outline stands out from the colours it separates better than the other ink would.
      for (const seam of p.outlined) expect([INK_DARK, INK_LIGHT], ch.name + seam).toContain(c.ink);
    }
  });

  it("(a1) outlines a red and a green of equal lightness, which differ by hue alone", () => {
    // Told apart by hue alone, so alike to someone with red-green colour blindness: 1.045:1.
    const red = "#b83232";
    const green = "#45722f";
    expect(contrast(red, green)).toBeLessThan(1.1);
    const p = params({
      skin: { hex: "#d7bd96" },
      garments: [
        { areas: ["torso", "arms"], layer: 1, colour: { hex: red } },
        { areas: ["waist", "legs"], layer: 1, colour: { hex: green } },
      ],
    });
    expect(p.outlined).toContain("waist");
    for (const side of [red, green]) expect(contrast(p.colours.ink, side), side).toBeGreaterThanOrEqual(MIN_CONTRAST);
    // A yellow sleeve on light skin is under 3:1 too, so it keeps its outline.
    expect(params({ skin: { hex: "#eadaba" }, garments: [{ areas: ["torso", "arms"], layer: 1, colour: { hex: "#ffd400" } }] }).outlined).toContain("wrists");
  });

  it("(a2) separates black hair and a black beard from dark skin: outlines that reach 3:1 against both sides", () => {
    // 1.45:1 each without an outline.
    const p = params({ skin: { hex: "#3a312a" }, hair: { length_cm: 2, texture: "coily", hex: "#141414" }, facial_hair: { kind: "beard", hex: "#141414" } });
    expect(contrast("#3a312a", "#141414")).toBeLessThan(MIN_CONTRAST);
    expect(p.outlined).toEqual(expect.arrayContaining(["hairline", "jawline"]));
    for (const side of ["#3a312a", "#141414"]) expect(contrast(p.colours.ink, side), side).toBeGreaterThanOrEqual(MIN_CONTRAST);
    // Black hair on brown skin already reaches 3:1, so it needs no outline.
    expect(params({ skin: { hex: "#825c43" }, hair: { length_cm: 30, hex: "#141414" } }).outlined).not.toContain("hairline");
  });

  it("(b) characters differing in height, build or hair differ in figure parameters", () => {
    const key = (p: ReturnType<typeof params>) =>
      JSON.stringify([p.height, p.shoulderHalf, p.waistHalf, p.hipHalf, p.limbRadius, p.hair, p.hairVolume, p.colours.hair]);
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const a = all[i];
        const b = all[j];
        const differ =
          a.ch.height !== b.ch.height ||
          a.ch.appearance.build !== b.ch.appearance.build ||
          JSON.stringify(a.ch.appearance.hair) !== JSON.stringify(b.ch.appearance.hair);
        if (differ) expect(key(a.p), `${a.ch.name} vs ${b.ch.name}`).not.toBe(key(b.p));
      }
    }
  });

  it("(c) every fill drawn is a colour the appearance supplied, or the neutral skin and clothing it left out", () => {
    for (const { ch, p } of all) {
      const allowed = suppliedHexes(ch.appearance);
      if (!ch.appearance.skin) allowed.add(NEUTRAL_SKIN);
      if (!ch.appearance.garments?.length) allowed.add(NEUTRAL_CLOTHING);
      for (const fill of figureFills(p)) expect(allowed.has(fill), `${ch.name} ${fill}`).toBe(true);
    }
  });
});
