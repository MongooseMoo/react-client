import { beforeEach, describe, expect, it } from "vitest";
import { useInputStore } from "./inputStore";

describe("inputStore", () => {
  beforeEach(() => {
    useInputStore.getState().clear();
    useInputStore.getState().resetCommands();
  });

  it("starts empty", () => {
    expect(useInputStore.getState().text).toBe("");
  });

  it("sets text", () => {
    useInputStore.getState().setText("look north");
    expect(useInputStore.getState().text).toBe("look north");
  });

  it("clears text", () => {
    useInputStore.getState().setText("say hello");
    useInputStore.getState().clear();
    expect(useInputStore.getState().text).toBe("");
  });

  it("notifies subscribers on change", () => {
    let notified = 0;
    const unsub = useInputStore.subscribe(() => {
      notified += 1;
    });
    useInputStore.getState().setText("x");
    unsub();
    expect(notified).toBe(1);
  });

  it("stores visible commands as a sorted unique list", () => {
    useInputStore.getState().setVisibleCommands(["look", "open", "look"]);
    useInputStore.getState().addVisibleCommands(["close", "open"]);

    expect(useInputStore.getState().visibleCommands).toEqual(["close", "look", "open"]);
  });

  it("removes visible commands", () => {
    useInputStore.getState().setVisibleCommands(["close", "look", "open"]);
    useInputStore.getState().removeVisibleCommands(["look"]);

    expect(useInputStore.getState().visibleCommands).toEqual(["close", "open"]);
  });
});
