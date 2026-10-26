import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

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
});
