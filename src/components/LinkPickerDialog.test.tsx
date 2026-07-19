import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import LinkPickerDialog from "./LinkPickerDialog";

const twoLinks = [
  { label: "http://a.com", href: "http://a.com" },
  { label: "http://b.com", href: "http://b.com" },
];

describe("LinkPickerDialog", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stays closed when there are no links", () => {
    render(<LinkPickerDialog links={null} onClose={() => {}} />);
    expect(screen.getByRole("dialog", { hidden: true })).not.toHaveAttribute("open");
  });

  it("opens as a listbox with an option per link", () => {
    render(<LinkPickerDialog links={twoLinks} onClose={() => {}} />);

    expect(screen.getByRole("dialog")).toHaveAttribute("open");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "http://a.com" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "http://b.com" })).toBeInTheDocument();
  });

  it("opens the chosen link and closes when an option is clicked", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const onClose = vi.fn();

    render(<LinkPickerDialog links={twoLinks} onClose={onClose} />);

    fireEvent.click(screen.getByRole("option", { name: "http://b.com" }));

    expect(openSpy).toHaveBeenCalledWith(
      "http://b.com",
      "_blank",
      "noopener,noreferrer"
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("opens the active option when Enter is pressed in the listbox", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const onClose = vi.fn();

    render(<LinkPickerDialog links={twoLinks} onClose={onClose} />);

    const listbox = screen.getByRole("listbox");
    // Focus selects the first option; Enter activates it.
    fireEvent.focus(listbox);
    fireEvent.keyDown(listbox, { key: "Enter" });

    expect(openSpy).toHaveBeenCalledWith(
      "http://a.com",
      "_blank",
      "noopener,noreferrer"
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("moves the active option with ArrowDown before activating", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const onClose = vi.fn();

    render(<LinkPickerDialog links={twoLinks} onClose={onClose} />);

    const listbox = screen.getByRole("listbox");
    fireEvent.focus(listbox);
    fireEvent.keyDown(listbox, { key: "ArrowDown" });
    fireEvent.keyDown(listbox, { key: "Enter" });

    expect(openSpy).toHaveBeenCalledWith(
      "http://b.com",
      "_blank",
      "noopener,noreferrer"
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when the Cancel button is pressed", () => {
    const onClose = vi.fn();

    render(<LinkPickerDialog links={twoLinks} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalled();
  });
});
