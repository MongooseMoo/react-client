import { beforeEach, describe, expect, it } from "vitest";
import { useInputStore } from "./inputStore";

describe("inputStore", () => {
  beforeEach(() => {
    useInputStore.getState().clear();
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
});
