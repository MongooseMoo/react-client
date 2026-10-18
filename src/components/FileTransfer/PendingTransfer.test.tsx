import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PendingTransfer from "./PendingTransfer";

function renderOffer(size: number, handlers = { onAccept: vi.fn(), onReject: vi.fn() }) {
  render(<PendingTransfer filename="notes.txt" size={size} senderLabel="Quinn" {...handlers} />);
  return handlers;
}

describe("PendingTransfer", () => {
  it.each([
    [0, "0 B"],
    [1, "1 B"],
    [1023, "1023 B"],
    [1024, "1.0 KB"],
    [16384, "16.0 KB"],
    [1024 * 1024 - 1, "1024.0 KB"],
    [1024 * 1024, "1.0 MB"],
    [100 * 1024 * 1024, "100.0 MB"],
  ])("shows what the user is asked to accept: a file of %i bytes as %s", (size, shown) => {
    renderOffer(size);

    expect(screen.getByText(`Incoming file: notes.txt (${shown}) from Quinn`)).not.toBeNull();
  });

  it("is a group named by the whole offer, so its buttons are heard with the size", () => {
    renderOffer(2048);

    expect(
      screen.getByRole("group", { name: "Incoming file: notes.txt (2.0 KB) from Quinn" }),
    ).not.toBeNull();
  });

  it("names its buttons by file and sender, without the size", () => {
    const { onAccept, onReject } = renderOffer(2048);

    fireEvent.click(screen.getByRole("button", { name: "Accept notes.txt from Quinn" }));
    fireEvent.click(screen.getByRole("button", { name: "Reject notes.txt from Quinn" }));

    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(onReject).toHaveBeenCalledTimes(1);
  });
});
