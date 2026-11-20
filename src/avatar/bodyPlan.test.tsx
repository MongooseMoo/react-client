import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BODY_PLANS, HUMAN_PLAN, resolvePlan } from "./bodyPlan";
import { GAME_LOOKS, PLAN_CHARACTERS } from "./bodyPlans.fixture";
import { TEST_CHARACTERS } from "./characters.fixture";
import { figureFills, figureParams, NEUTRAL_CLOTHING, NEUTRAL_SKIN, tokenColours } from "./figure";
import AvatarPortrait, { HEAD_VIEWBOX, portraitElements } from "./portrait";

/** The plans the game sends today (reports/player-avatars-forms-wire-2026-11-19.md). */
const GAME_PLANS = ["werewolf", "zombie", "rakghoul", "devolved primate", "quartz-crystallized body", "human with a transfigured shark head", "mallard duck", "snake", "song bird"];
const form = (body_plan: string, more: Record<string, unknown> = {}) => ({ label: `a ${body_plan}`, body_plan, ...more });

describe("body plans: figure parameters", () => {
  it("has a look for every plan the game sends", () => {
    for (const plan of GAME_PLANS) expect(Object.hasOwn(BODY_PLANS, plan), plan).toBe(true);
  });

  it("draws a missing body plan and 'human body' exactly as before: the same parameters apart from the plan", () => {
    for (const ch of TEST_CHARACTERS) {
      const { body_plan: _, ...without } = ch.appearance;
      const a = figureParams(without, { height: ch.height });
      const b = figureParams({ ...without, body_plan: HUMAN_PLAN }, { height: ch.height });
      expect(a.plan).toEqual({ kind: "human" });
      expect(b).toEqual(a);
    }
  });

  it("reads none of a human record for a body plan: no hair, beard, face features or neutral skin and clothing", () => {
    const human = TEST_CHARACTERS[1].appearance;
    for (const plan of GAME_PLANS) {
      const p = figureParams({ ...human, garments: undefined, body_plan: plan, skin: undefined, eyes: undefined }, { height: 1.75 });
      expect(p.hair, plan).toBe("none");
      expect(p.facialHair, plan).toBe("none");
      expect(p.features, plan).toEqual([]);
      // Only the shark head, whose body is the person's own, keeps the record's build.
      expect(p.build, plan).toBe(plan === "human with a transfigured shark head" ? "muscular" : "average");
      const fills = figureFills(p);
      expect(fills.has(NEUTRAL_SKIN) && plan !== "human with a transfigured shark head", plan).toBe(false);
      expect(fills.has(NEUTRAL_CLOTHING), plan).toBe(false);
      // The human record's hair and beard colour is nowhere in the figure.
      expect(fills.has("#141414"), plan).toBe(false);
    }
  });

  it("gives each plan its own colours when the form sends none", () => {
    expect(figureParams(form("werewolf"), { height: 2 }).colours.skin).toBe(BODY_PLANS.werewolf.skin);
    expect(figureParams(form("zombie"), { height: 2 }).colours.skin).toBe(BODY_PLANS.zombie.skin);
    expect(figureParams(form("human with a transfigured shark head"), { height: 2 }).colours.head).toBe("#7d8b96");
    expect(figureParams(form("mallard duck"), { height: 0.4 }).colours.head).toBe("#1f5e3a");
  });

  it("draws the body in the covering's main colour and the eyes in the sent eyes", () => {
    const own = figureParams(form("werewolf", { covering: { kind: "fur", colours: [{ hex: "#9A9893" }, { hex: "#3b2417" }] }, eyes: { hex: "#c08a1e" } }), { height: 2 });
    expect(own.colours.skin).toBe("#9a9893");
    expect(own.colours.torso).toBe("#9a9893");
    expect(own.colours.eyes).toBe("#c08a1e");
    // The second colour goes to the werewolf's muzzle and jaw.
    expect(own.plan).toMatchObject({ accent: "#3b2417" });
  });

  it("puts a mallard's second and third colours on its head and wings", () => {
    const duck = resolvePlan(form("mallard duck", { covering: { kind: "feathers", colours: [{ hex: "#6f4a2e" }, { hex: "#2e6b3a" }, { hex: "#8c8c8c" }] } }));
    expect(duck).toMatchObject({ skin: "#6f4a2e", head: "#2e6b3a", wing: "#8c8c8c", accent: BODY_PLANS["mallard duck"].accent });
    expect(tokenColours(form("mallard duck", { covering: { colours: [{ hex: "#6f4a2e" }, { hex: "#2e6b3a" }] } }))).toEqual({ body: "#6f4a2e", head: "#2e6b3a" });
  });

  it("tones the accent from the main colour when only one colour is sent, where the plan says so", () => {
    const snake = resolvePlan(form("snake", { covering: { kind: "scales", colours: [{ hex: "#8a5a32" }] } }));
    expect(snake).toMatchObject({ skin: "#8a5a32" });
    expect(snake.kind === "animal" && snake.accent).not.toBe(BODY_PLANS.snake.accent);
    // A song bird keeps its orange breast.
    expect(resolvePlan(form("song bird", { covering: { colours: [{ hex: "#8a5a32" }] } }))).toMatchObject({ accent: BODY_PLANS["song bird"].accent });
  });

  it("keeps the plan's defaults for anything missing or wrong in the sent look, by position", () => {
    expect(resolvePlan(form("werewolf", { covering: "fur" }))).toMatchObject({ covering: "fur", skin: BODY_PLANS.werewolf.skin, accent: BODY_PLANS.werewolf.accent });
    expect(resolvePlan(form("werewolf", { covering: { kind: "velvet", colours: [{ hex: "red" }, { hex: "#3b2417" }] } }))).toMatchObject({
      covering: "fur",
      skin: BODY_PLANS.werewolf.skin,
      accent: "#3b2417",
    });
    expect(resolvePlan(form("mallard duck", { covering: { colours: [null, null, { hex: "#8c8c8c" }] } }))).toMatchObject({ skin: BODY_PLANS["mallard duck"].skin, wing: "#8c8c8c" });
    // A form's record `skin` is not its covering.
    expect(resolvePlan(form("zombie", { skin: { hex: "#e8e4dc" } }))).toMatchObject({ skin: BODY_PLANS.zombie.skin });
  });

  it("takes the covering's kind: crystal facets any humanoid plan", () => {
    expect(resolvePlan(form("zombie", { covering: { kind: "crystal" } }))).toMatchObject({ covering: "crystal" });
    expect(resolvePlan(form("zombie", { covering: { kind: "hide" } }))).toMatchObject({ covering: "hide" });
  });

  it("takes a covering sent as a plain word as its kind, and anything else malformed as not sent", () => {
    expect(resolvePlan(form("zombie", { covering: " Crystal " }))).toMatchObject({ covering: "crystal", skin: BODY_PLANS.zombie.skin });
    for (const covering of [7, null, ["fur"], { kind: 3, colours: "grey" }, { colours: [{ hex: 5 }] }]) {
      expect(resolvePlan(form("zombie", { covering })), JSON.stringify(covering)).toMatchObject({ covering: "skin", skin: BODY_PLANS.zombie.skin, accent: BODY_PLANS.zombie.accent });
    }
  });

  it("draws every look the game stores today (section 1d) in its own colours, in each plan's places", () => {
    const hex = (plan: string, i: number) => GAME_LOOKS[plan].covering.colours[i].hex;
    for (const [plan, look] of Object.entries(GAME_LOOKS)) {
      const p = figureParams(form(plan, look), { height: 1.75 });
      if (plan === "human with a transfigured shark head") expect(p.colours.head, plan).toBe(hex(plan, 0));
      else expect(p.colours.skin, plan).toBe(hex(plan, 0));
      expect(p.colours.eyes, plan).toBe(look.eyes?.hex ?? (BODY_PLANS[plan] as { eyes: string }).eyes);
      expect(p.plan, plan).toMatchObject({ covering: look.covering.kind });
    }
    // The second and third colours where each plan has a place for them.
    expect(resolvePlan(form("werewolf", GAME_LOOKS.werewolf))).toMatchObject({ skin: "#9a9893", accent: "#3b2417" });
    expect(resolvePlan(form("rakghoul", GAME_LOOKS.rakghoul))).toMatchObject({ skin: "#9a9893", accent: "#36454f", covering: "hide" });
    expect(resolvePlan(form("quartz-crystallized body", GAME_LOOKS["quartz-crystallized body"]))).toMatchObject({ skin: "#f2f2f0", accent: "#808080", covering: "crystal" });
    expect(resolvePlan(form("mallard duck", GAME_LOOKS["mallard duck"]))).toMatchObject({ skin: "#6b4423", head: "#2e7d32", wing: "#808080" });
  });

  it("draws the shark head's human body from the person's own skin, build and garments, and only its head from the form", () => {
    const p = figureParams(PLAN_CHARACTERS.find((ch) => ch.name === "shark head, game look")?.appearance, { height: 1.85 });
    expect(p.colours.skin).toBe("#3a312a");
    expect(p.colours.neck).toBe("#3a312a");
    expect(p.colours.torso).toBe("#e8c547");
    expect(p.colours.head).toBe("#9a9893");
    expect(p.colours.eyes).toBe("#3a2412");
    expect(p.build).toBe("muscular");
    expect(p.shoulderHalf).toBeCloseTo(0.2 * (1.85 / 1.75) * 1.25, 5);
    expect(p.hair).toBe("none");
    // Other plans ignore a record build.
    expect(figureParams(form("zombie", { build: "muscular" }), { height: 1.75 }).build).toBe("average");
  });

  it("keeps garments sent on a humanoid plan, and invents none", () => {
    const dressed = figureParams(PLAN_CHARACTERS.find((ch) => ch.name === "zombie, dressed")?.appearance, { height: 1.75 });
    expect(dressed.colours.torso).toBe("#6b4423");
    expect(dressed.colours.legs).toBe("#808080");
    const bare = figureParams(form("zombie"), { height: 1.75 });
    expect(bare.colours.torso).toBe(BODY_PLANS.zombie.skin);
  });

  it("adds the plan's parts and the traits' parts, each once", () => {
    expect(figureParams(form("werewolf", { traits: ["tail", "horns"] }), { height: 2 }).extras).toEqual(["tail", "horns"]);
    expect(figureParams(form("mallard duck", { traits: ["wings", "tail"] }), { height: 0.4 }).extras).toEqual([]);
  });

  it("draws an unknown plan as a placeholder in the plain person colour, with no eyes and no plan token colours", () => {
    const p = figureParams(form("clockwork automaton"), { height: 1.2, base: "#3a7bd5", footprint: { width: 0.6, depth: 0.6 } });
    expect(p.plan).toEqual({ kind: "unknown", name: "clockwork automaton" });
    expect(p.colours.skin).toBe("#3a7bd5");
    expect(p.colours.eyes).toBeUndefined();
    expect(p.footprint).toEqual({ width: 0.6, depth: 0.6 });
    expect(tokenColours(form("clockwork automaton"))).toBeUndefined();
  });

  it("gives plan tokens the plan's body and head colours", () => {
    expect(tokenColours(form("mallard duck"))).toEqual({ body: BODY_PLANS["mallard duck"].skin, head: "#1f5e3a" });
    expect(tokenColours(form("werewolf"))).toEqual({ body: BODY_PLANS.werewolf.skin, head: BODY_PLANS.werewolf.skin });
  });

  it("keeps a humanoid plan's posture and stands an animal whatever posture is sent", () => {
    expect(figureParams(form("zombie", { posture: "sitting" }), { height: 1.75 }).posture).toBe("sitting");
    expect(figureParams(form("snake", { posture: "reclining" }), { height: 0.14 }).posture).toBe("standing");
  });
});

describe("body plans: portraits", () => {
  it("draws every plan's portrait, decorative, with no human hair or face parts", () => {
    for (const ch of PLAN_CHARACTERS.slice(1)) {
      const { container, unmount } = render(<AvatarPortrait appearance={ch.appearance} size={128} />);
      const svg = container.querySelector("svg");
      expect(svg, ch.name).not.toBeNull();
      expect(svg?.getAttribute("aria-hidden"), ch.name).toBe("true");
      expect(container.querySelectorAll(".avatar-hair, .avatar-facial-hair, .avatar-feature").length, ch.name).toBe(0);
      expect(container.querySelectorAll("path, circle, ellipse, rect").length, ch.name).toBeGreaterThan(1);
      unmount();
    }
  });

  it("draws animals with their own parts and an unknown plan as a plain silhouette", () => {
    const classes = (appearance: unknown) => {
      const { container, unmount } = render(<svg>{portraitElements(appearance)}</svg>);
      const found = [...container.querySelectorAll("[class]")].map((e) => e.getAttribute("class"));
      unmount();
      return found;
    };
    expect(classes(form("mallard duck"))).toEqual(expect.arrayContaining(["avatar-bill", "avatar-ring"]));
    expect(classes(form("song bird"))).toEqual(expect.arrayContaining(["avatar-beak", "avatar-breast"]));
    expect(classes(form("snake"))).toEqual(expect.arrayContaining(["avatar-coil", "avatar-tongue"]));
    expect(classes(form("human with a transfigured shark head"))).toEqual(expect.arrayContaining(["avatar-fin", "avatar-underside"]));
    expect(classes(form("werewolf"))).toEqual(expect.arrayContaining(["avatar-muzzle", "avatar-ear"]));
    expect(classes(form("clockwork automaton"))).toEqual(["avatar-backdrop", "avatar-placeholder"]);
  });

  it("draws the shark-headed person's shoulders and neck by their own build", () => {
    const shoulders = (build: string) => {
      const { container, unmount } = render(<svg>{portraitElements(form("human with a transfigured shark head", { build }))}</svg>);
      const d = container.querySelector(".avatar-garment")?.getAttribute("d");
      const neck = container.querySelector(".avatar-neck")?.getAttribute("width");
      unmount();
      return { d, neck };
    };
    expect(shoulders("muscular").d).not.toBe(shoulders("thin").d);
    expect(Number(shoulders("muscular").neck)).toBeGreaterThan(Number(shoulders("thin").neck));
    expect(shoulders("average").d).toContain("M6,64");
  });

  it("shows an animal whole at the People list's sizes and keeps a person's head crop", () => {
    const viewBox = (appearance: unknown, size: number) => {
      const { container, unmount } = render(<AvatarPortrait appearance={appearance} size={size} />);
      const box = container.querySelector("svg")?.getAttribute("viewBox");
      unmount();
      return box;
    };
    for (const plan of ["mallard duck", "snake", "song bird"]) expect(viewBox(form(plan), 32), plan).toBe("0 0 64 64");
    expect(viewBox(form("werewolf"), 32)).toBe(HEAD_VIEWBOX);
    expect(viewBox(TEST_CHARACTERS[0].appearance, 32)).toBe(HEAD_VIEWBOX);
  });

  it("draws a human's portrait the same with no body plan and with 'human body'", () => {
    for (const ch of TEST_CHARACTERS) {
      const { body_plan: _, ...without } = ch.appearance;
      const a = render(<AvatarPortrait appearance={without} size={128} />);
      const b = render(<AvatarPortrait appearance={{ ...without, body_plan: HUMAN_PLAN }} size={128} />);
      expect(b.container.innerHTML).toBe(a.container.innerHTML);
      a.unmount();
      b.unmount();
    }
  });
});
