import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Item } from "./gmcp/Char/Items";
import { itemActions, performItemAction } from "./itemActions";
import { useInputStore } from "./stores/inputStore";

// The verbs the MOO sent for its generic container (#2201) on 2026-10-05.
const chest: Item = {
  id: "#2201",
  name: "chest",
  verbs: [
    ["re*move/ta*ke/g*et", "<anything>", "from", "#2201"],
    ["open", "#2201"],
    ["@opacity", "#2201", "is", "<anything>"],
    ["p*ut/in*sert", "<anything>", "in", "#2201"],
    ["gi*ve/ha*nd", "#2201", "to", "<anything>"],
    ["d*rop", "#2201"],
    ["t*ake/g*et", "#2201"],
  ],
};

describe("itemActions", () => {
  beforeEach(() => {
    useInputStore.getState().setText("");
  });

  it("makes a complete command from a verb that takes only the item", () => {
    expect(itemActions(chest)).toContainEqual({
      label: "Take",
      description: "Take chest",
      command: "take #2201",
      caret: undefined,
    });
  });

  it("leaves a slot empty where the player supplies the text, and says where it is", () => {
    const actions = itemActions(chest);
    expect(actions).toContainEqual({
      label: "Put … in",
      description: "Put … in chest",
      command: "put  in #2201",
      caret: 4,
    });
    expect(actions).toContainEqual({
      label: "Give to …",
      description: "Give chest to …",
      command: "give #2201 to ",
      caret: 14,
    });
  });

  it("keeps the server's order and one action per verb", () => {
    expect(itemActions(chest).map((action) => action.label)).toEqual([
      "Remove … from",
      "Open",
      "@opacity is …",
      "Put … in",
      "Give to …",
      "Drop",
      "Take",
    ]);
  });

  it("has no actions for an item the server listed no verbs for", () => {
    expect(itemActions({ id: "#5", name: "rock" })).toEqual([]);
    expect(itemActions({ id: "#5", name: "rock", verbs: [] })).toEqual([]);
  });

  it("sends a complete command and puts an incomplete one in the input", () => {
    const client = { sendCommand: vi.fn() };
    const [remove, open] = itemActions(chest);

    performItemAction(client, open);
    expect(client.sendCommand).toHaveBeenCalledWith("open #2201");
    expect(useInputStore.getState().text).toBe("");

    performItemAction(client, remove);
    expect(client.sendCommand).toHaveBeenCalledTimes(1);
    expect(useInputStore.getState().text).toBe("remove  from #2201");
  });
});
