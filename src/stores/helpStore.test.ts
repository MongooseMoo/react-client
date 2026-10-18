import { beforeEach, describe, expect, it } from "vitest";

import type { GMCPMessageHelpTopic } from "../gmcp/Help";
import { useHelpStore } from "./helpStore";

const topic = (name: string, overrides: Partial<GMCPMessageHelpTopic> = {}): GMCPMessageHelpTopic => ({
  topic: name,
  query: name,
  db: "game",
  audience: "player",
  status: "ok",
  lines: [name],
  choices: [],
  ...overrides,
});

describe("helpStore", () => {
  beforeEach(() => {
    useHelpStore.getState().reset();
  });

  it("starts with nothing loaded and no history", () => {
    expect(useHelpStore.getState().current).toBeNull();
    expect(useHelpStore.getState().history).toEqual([]);
  });

  it("shows a received topic and keeps the one before it for Back", () => {
    useHelpStore.getState().show(topic("money"));
    useHelpStore.getState().show(topic("look"));

    expect(useHelpStore.getState().current?.topic).toBe("look");
    expect(useHelpStore.getState().history.map((entry) => entry.topic)).toEqual(["money"]);
  });

  it("back returns to the previous topic and drops it from the history", () => {
    useHelpStore.getState().show(topic("money"));
    useHelpStore.getState().show(topic("look"));

    expect(useHelpStore.getState().back()?.topic).toBe("money");
    expect(useHelpStore.getState().current?.topic).toBe("money");
    expect(useHelpStore.getState().history).toEqual([]);
  });

  it("back with no history changes nothing", () => {
    useHelpStore.getState().show(topic("money"));

    expect(useHelpStore.getState().back()).toBeUndefined();
    expect(useHelpStore.getState().current?.topic).toBe("money");
  });
});
