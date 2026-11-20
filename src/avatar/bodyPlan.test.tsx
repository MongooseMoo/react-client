import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BODY_PLANS, COVERING_TONE, HUMAN_PLAN, resolvePlan } from "./bodyPlan";
import { PLAN_CHARACTERS } from "./bodyPlans.fixture";
import { TEST_CHARACTERS } from "./characters.fixture";
import { figureFills, figureParams, NEUTRAL_CLOTHING, NEUTRAL_SKIN, tokenColours } from "./figure";
import AvatarPortrait, { portraitElements } from "./portrait";

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
      expect(p.build, plan).toBe("average");
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

  it("puts a form's sent skin and eyes over the plan's, and a sent covering's tone when no skin is sent", () => {
    const own = figureParams(form("werewolf", { skin: { hex: "#E8E4DC" }, eyes: { hex: "#3d6fb6" } }), { height: 2 });
    expect(own.colours.skin).toBe("#e8e4dc");
    expect(own.colours.eyes).toBe("#3d6fb6");
    expect(resolvePlan(form("zombie", { covering: "scales" }))).toMatchObject({ covering: "scales", skin: COVERING_TONE.scales });
    // The plan's own covering, a bad colour or an unknown covering change nothing.
    expect(resolvePlan(form("werewolf", { covering: "fur", skin: { hex: "red" } }))).toMatchObject({ skin: BODY_PLANS.werewolf.skin });
    expect(resolvePlan(form("werewolf", { covering: 7 }))).toMatchObject({ covering: "fur", skin: BODY_PLANS.werewolf.skin });
  });

  it("keeps garments sent on a humanoid plan, and invents none", () => {
    const dressed = figureParams(PLAN_CHARACTERS.find((ch) => ch.name === "zombie, dressed")?.appearance, { height: 1.75 });
    expect(dressed.colours.torso).toBe("#653700");
    expect(dressed.colours.legs).toBe("#6b6b6b");
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
