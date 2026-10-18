import { beforeEach, describe, expect, it, vi } from "vitest";

const { announce } = vi.hoisted(() => ({ announce: vi.fn() }));
vi.mock("@react-aria/live-announcer", () => ({ announce }));

import { useHelpStore } from "../stores/helpStore";
import { GMCPCoreSupports } from "./Core";
import { describeHelpTopic, GMCPHelp, type GMCPMessageHelpTopic, helpTitle } from "./Help";

const topic = (overrides: Partial<GMCPMessageHelpTopic> = {}): GMCPMessageHelpTopic => ({
  topic: "money",
  query: "money",
  db: "game",
  audience: "player",
  status: "ok",
  lines: ["Money", "", "You carry credits."],
  choices: [],
  ...overrides,
});

function createMockClient() {
  const handlers: Record<string, unknown> = {};
  return { gmcp: { send: vi.fn(), handlers } };
}

describe("GMCPHelp", () => {
  let client: ReturnType<typeof createMockClient>;
  let help: GMCPHelp;

  beforeEach(() => {
    vi.clearAllMocks();
    useHelpStore.getState().reset();
    client = createMockClient();
    help = new GMCPHelp(client as never);
    client.gmcp.handlers.Help = help;
  });

  it("is advertised in Core.Supports as Help 1", () => {
    const supports = new GMCPCoreSupports(client as never);
    expect(supports.advertisedModules()).toEqual(["Help 1"]);
  });

  it("sends Help.Get with the topic", () => {
    help.sendGet({ topic: "search money" });
    expect(client.gmcp.send).toHaveBeenCalledWith("Help.Get", JSON.stringify({ topic: "search money" }));
  });

  it("stores a received Help.Topic", () => {
    expect(help.receive("Topic", topic())).toBe(true);
    expect(useHelpStore.getState().current).toEqual(topic());
  });

  it("announces the topic title when a result arrives", () => {
    help.receive("Topic", topic());
    expect(announce).toHaveBeenCalledWith("money", "polite");
  });

  it("announces what a status other than ok means", () => {
    help.receive("Topic", topic({ topic: "", query: "xyzzy", status: "none", lines: ['Sorry, there is no help on "xyzzy".'] }));
    expect(announce).toHaveBeenLastCalledWith("xyzzy: no help found", "polite");
  });
});

describe("helpTitle", () => {
  it("calls the front page Help", () => {
    expect(helpTitle(topic({ topic: "", query: "" }))).toBe("Help");
    expect(helpTitle(topic({ topic: "help", query: "  " }))).toBe("Help");
  });

  it("uses the topic, or the query when the server names no topic", () => {
    expect(helpTitle(topic())).toBe("money");
    expect(helpTitle(topic({ topic: "", query: "xyzzy" }))).toBe("xyzzy");
  });
});

describe("describeHelpTopic", () => {
  it("is the title alone for an ok result", () => {
    expect(describeHelpTopic(topic())).toBe("money");
  });

  it("says how many topics an ambiguous result offers", () => {
    expect(describeHelpTopic(topic({ topic: "", query: "lo", status: "ambiguous", choices: ["look", "lock"] }))).toBe("lo: 2 topics match");
  });

  it("adds the meaning of none, shown and broken", () => {
    expect(describeHelpTopic(topic({ status: "none" }))).toBe("money: no help found");
    expect(describeHelpTopic(topic({ status: "shown", lines: [] }))).toBe("money: printed in the game output");
    expect(describeHelpTopic(topic({ status: "broken" }))).toBe("money: this help topic is broken");
  });
});
