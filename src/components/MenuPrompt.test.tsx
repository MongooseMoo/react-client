import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useKeystrokesStore } from "../stores/keystrokesStore";
import MenuPrompt, { MENU_ABORT } from "./MenuPrompt";

const menu = {
  prompt: "your selection:",
  items: [
    { label: "Pick a level", response: "" },
    { label: "Low", response: "1" },
    { label: "Medium", response: "2" },
    { label: "Other", response: "o" },
  ],
};

describe("MenuPrompt", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the prompt, its text lines and a focused listbox of choices", () => {
    render(<MenuPrompt menu={menu} onAnswer={() => {}} />);

    const listbox = screen.getByRole("listbox", { name: "Your selection" });
    expect(listbox).toHaveFocus();
    expect(screen.getByText("Pick a level")).toBeInTheDocument();
    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
      "1Low",
      "2Medium",
      "oOther",
    ]);
  });

  it("answers with the chosen option's response on Enter", () => {
    const onAnswer = vi.fn();
    render(<MenuPrompt menu={menu} onAnswer={onAnswer} />);

    const listbox = screen.getByRole("listbox");
    fireEvent.keyDown(listbox, { key: "ArrowDown" });
    fireEvent.keyDown(listbox, { key: "ArrowDown" });
    fireEvent.keyDown(listbox, { key: "Enter" });

    expect(onAnswer).toHaveBeenCalledWith("o");
  });

  it("answers at once when a typed number matches only one choice", () => {
    const onAnswer = vi.fn();
    render(<MenuPrompt menu={menu} onAnswer={onAnswer} />);

    fireEvent.keyDown(screen.getByRole("listbox"), { key: "2" });

    expect(onAnswer).toHaveBeenCalledWith("2");
  });

  it("waits for a second digit when the first starts a longer number", () => {
    vi.useFakeTimers();
    const onAnswer = vi.fn();
    const items = Array.from({ length: 12 }, (_, index) => ({
      label: `Choice ${index + 1}`,
      response: String(index + 1),
    }));
    render(<MenuPrompt menu={{ prompt: "a number", items }} onAnswer={onAnswer} />);
    const listbox = screen.getByRole("listbox");

    fireEvent.keyDown(listbox, { key: "1" });
    expect(onAnswer).not.toHaveBeenCalled();
    fireEvent.keyDown(listbox, { key: "2" });
    expect(onAnswer).toHaveBeenCalledWith("12");

    onAnswer.mockClear();
    fireEvent.keyDown(listbox, { key: "1" });
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(onAnswer).toHaveBeenCalledWith("1");
  });

  it("aborts the command on Escape and on Cancel", () => {
    const onAnswer = vi.fn();
    render(<MenuPrompt menu={menu} onAnswer={onAnswer} />);

    fireEvent.keyDown(screen.getByRole("listbox"), { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onAnswer.mock.calls).toEqual([[MENU_ABORT], [MENU_ABORT]]);
  });

  describe("in keys mode", () => {
    const interactMenu = {
      prompt: "your selection:",
      items: [
        { label: "give lamp to <anything>", response: "1" },
        { label: "rub lamp", response: "2" },
      ],
    };

    afterEach(() => {
      useKeystrokesStore.getState().clearLayers();
    });

    it("pauses keys mode for a choice that still needs text, until it is sent", () => {
      useKeystrokesStore.getState().setKeysMode(true);
      const onAnswer = vi.fn();
      render(<MenuPrompt menu={interactMenu} onAnswer={onAnswer} />);

      fireEvent.keyDown(screen.getByRole("listbox"), { key: "1" });

      expect(onAnswer).toHaveBeenCalledWith("1");
      expect(useKeystrokesStore.getState().keysMode).toBe(false);
      expect(useKeystrokesStore.getState().resumeOnSend).toBe(true);
    });

    it("leaves keys mode on for a complete choice", () => {
      useKeystrokesStore.getState().setKeysMode(true);
      render(<MenuPrompt menu={interactMenu} onAnswer={() => {}} />);

      fireEvent.keyDown(screen.getByRole("listbox"), { key: "2" });

      expect(useKeystrokesStore.getState().keysMode).toBe(true);
    });

    it("does not turn keys mode on when it was off", () => {
      render(<MenuPrompt menu={interactMenu} onAnswer={() => {}} />);

      fireEvent.keyDown(screen.getByRole("listbox"), { key: "1" });

      expect(useKeystrokesStore.getState().keysMode).toBe(false);
      expect(useKeystrokesStore.getState().resumeOnSend).toBe(false);
    });
  });
});
