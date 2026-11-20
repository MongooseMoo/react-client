import { type TestCharacter, TEST_CHARACTERS } from "./characters.fixture";

/**
 * One invented person in each body plan the game sends today, shaped as the game sends a whole-body form
 * (reports/player-avatars-forms-wire-2026-11-19.md): `body_plan`, the form's `traits`, its `label`, no skin, hair,
 * eyes, face or build. Plus a human for comparison, a form with its own colours sent, a humanoid form wearing
 * garments, and a plan the client does not know. Names are made up. Tests and the picture harness only.
 */
export const PLAN_CHARACTERS: TestCharacter[] = [
  { name: "human (Aster)", height: TEST_CHARACTERS[0].height, appearance: { ...TEST_CHARACTERS[0].appearance, body_plan: "human body" } },
  { name: "werewolf", height: 2.1, appearance: { label: "a werewolf", body_plan: "werewolf", traits: ["fur", "claws", "tail"], posture: "standing" } },
  { name: "zombie", height: 1.75, appearance: { label: "a zombie", body_plan: "zombie", traits: ["undead"], posture: "standing" } },
  { name: "rakghoul", height: 1.7, appearance: { label: "a rakghoul", body_plan: "rakghoul", posture: "standing" } },
  { name: "devolved primate", height: 1.5, appearance: { label: "a devolved primate", body_plan: "devolved primate", traits: ["fur"], posture: "standing" } },
  { name: "quartz", height: 1.8, appearance: { label: "a quartz figure", body_plan: "quartz-crystallized body", posture: "standing" } },
  { name: "shark head", height: 1.8, appearance: { label: "a shark-headed man", body_plan: "human with a transfigured shark head", posture: "standing" } },
  { name: "mallard duck", height: 0.42, box: [0.3, 0.6], appearance: { label: "the mallard duck", body_plan: "mallard duck", posture: "standing" } },
  { name: "snake", height: 0.14, box: [0.3, 1.3], appearance: { label: "the snake", body_plan: "snake", posture: "standing" } },
  { name: "song bird", height: 0.14, box: [0.08, 0.17], appearance: { label: "the song bird", body_plan: "song bird", posture: "standing" } },
  { name: "unknown plan", height: 1.2, box: [0.6, 0.6], appearance: { label: "a clockwork automaton", body_plan: "clockwork automaton" } },
  {
    name: "werewolf, sent look",
    height: 2.1,
    appearance: {
      label: "a werewolf",
      body_plan: "werewolf",
      covering: { kind: "fur", colours: [{ name: "grey", hex: "#9a9893" }, { name: "dark brown", hex: "#3b2417" }] },
      eyes: { name: "amber", hex: "#c08a1e" },
    },
  },
  {
    name: "duck, sent look",
    height: 0.42,
    box: [0.3, 0.6],
    appearance: {
      label: "the mallard duck",
      body_plan: "mallard duck",
      covering: { kind: "feathers", colours: [{ name: "brown", hex: "#6f4a2e" }, { name: "green", hex: "#2e6b3a" }, { name: "grey", hex: "#8c8c8c" }] },
      eyes: { name: "dark brown", hex: "#3b2412" },
    },
  },
  {
    name: "quartz, sent look",
    height: 1.8,
    appearance: {
      label: "a quartz figure",
      body_plan: "quartz-crystallized body",
      covering: { kind: "crystal", colours: [{ name: "white", hex: "#f2f0ea" }, { name: "grey", hex: "#8c8c8c" }] },
    },
  },
  {
    // The game keeps the person's own skin, build and age for the shark head's human body.
    name: "shark head, own body",
    height: 1.85,
    appearance: {
      label: "a shark-headed man",
      body_plan: "human with a transfigured shark head",
      skin: { name: "dark brown", hex: "#3a312a" },
      build: "muscular",
      age_years: 41,
      covering: { kind: "skin", colours: [{ name: "grey", hex: "#7f8a8f" }] },
      eyes: { name: "dark brown", hex: "#3b2412" },
      garments: [{ name: "a mustard shirt", areas: ["torso", "arms"], layer: 1, colour: { name: "mustard", hex: "#ceb301" } }],
    },
  },
  {
    name: "zombie, dressed",
    height: 1.75,
    appearance: {
      label: "a zombie in a brown coat",
      body_plan: "zombie",
      garments: [
        { name: "a torn brown coat", areas: ["torso", "arms"], layer: 2, colour: { name: "brown", hex: "#653700" } },
        { name: "grey trousers", areas: ["waist", "legs"], layer: 1, colour: { name: "grey", hex: "#6b6b6b" } },
      ],
      marks: [{ kind: "scar", area: "cheek" }],
    },
  },
];
