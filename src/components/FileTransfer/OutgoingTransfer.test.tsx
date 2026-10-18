import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OutgoingTransfer from "./OutgoingTransfer";

describe("OutgoingTransfer", () => {
  it("renders the recipient label and filename", () => {
    render(
      <OutgoingTransfer filename="hello.txt" recipientLabel="Quinn" onCancel={vi.fn()} />
    );

    expect(screen.getByText("Quinn")).not.toBeNull();
    expect(screen.getByText("hello.txt")).not.toBeNull();
    expect(screen.getByText(/Waiting for/)).not.toBeNull();
  });

  it("is not a live region: it is mounted with its text, which would go unannounced", () => {
    const { container } = render(
      <OutgoingTransfer filename="file.bin" recipientLabel="Riley" onCancel={vi.fn()} />
    );

    expect(screen.queryByRole("status")).toBeNull();
    expect(container.querySelector("[aria-live]")).toBeNull();
  });

  it("is a group named by the wait, holding a cancel button that says what it cancels", () => {
    const onCancel = vi.fn();
    render(
      <OutgoingTransfer filename="file.bin" recipientLabel="Riley" onCancel={onCancel} />
    );

    // The test library's name computation puts a space after the emphasised file name.
    const group = screen.getByRole("group", { name: /^Waiting for Riley to accept file\.bin ?…$/ });
    fireEvent.click(
      within(group).getByRole("button", { name: "Cancel offer of file.bin to Riley" })
    );

    expect(onCancel).toHaveBeenCalledOnce();
  });
});
