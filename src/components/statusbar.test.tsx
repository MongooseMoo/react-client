import { act, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Statusbar from "./statusbar";
import { useCharacterStatusStore } from "../stores/characterStatusStore";

describe("Statusbar status", () => {
  afterEach(() => {
    useCharacterStatusStore.getState().reset();
    vi.useRealTimers();
  });

  it("shows nothing for status before the server sends any", () => {
    render(<Statusbar />);
    expect(screen.queryByRole("group", { name: "Status" })).toBeNull();
  });

  it("shows each meter's percent and words as text, the target, and the effects", () => {
    const at = performance.now();
    useCharacterStatusStore.getState().setMeters([
      { id: "health", kind: "health", label: "Health", value: 30, max: 40, words: "bruised", rate: 0 },
      { id: "#149602", kind: "body", label: "Qi", value: 10, max: 50, rate: 0 },
    ], at);
    useCharacterStatusStore.getState().setTarget({ name: "a rat", value: 0.2, words: "nearly dead" });
    useCharacterStatusStore.getState().setEffects([
      { section: "Spells", name: "Shield", source: "you", seconds: 30, dismissible: true },
    ]);
    render(<Statusbar />);

    const status = screen.getByRole("group", { name: "Status" });
    expect(within(status).getByText("Health 75%, bruised")).toBeTruthy();
    expect(within(status).getByText("Qi 20%")).toBeTruthy();
    expect(within(status).getByText("Target: a rat 20%, nearly dead")).toBeTruthy();
    expect(within(screen.getByRole("list", { name: "Effects" })).getByText("Shield")).toBeTruthy();
    // The bar repeats the text for sight and is hidden from screen readers.
    const bars = status.querySelectorAll(".status-meter-bar");
    expect(bars).toHaveLength(3);
    expect(Array.from(bars, (bar) => bar.getAttribute("aria-hidden"))).toEqual(["true", "true", "true"]);
    expect((bars[0].firstElementChild as HTMLElement).style.width).toBe("75%");
  });

  it("moves a recovering meter by its rate", () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "performance"] });
    useCharacterStatusStore.getState().setMeters([
      { id: "health", kind: "health", label: "Health", value: 50, max: 100, rate: 1 },
    ], performance.now());
    render(<Statusbar />);
    expect(screen.getByText("Health 50%")).toBeTruthy();
    act(() => { vi.advanceTimersByTime(10_000); });
    expect(screen.getByText("Health 60%")).toBeTruthy();
  });
});
