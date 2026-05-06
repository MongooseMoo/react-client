import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import OutgoingTransfer from "./OutgoingTransfer";

describe("OutgoingTransfer", () => {
  it("renders the recipient label and filename", () => {
    render(<OutgoingTransfer filename="hello.txt" recipientLabel="Quinn" />);

    expect(screen.getByText("Quinn")).not.toBeNull();
    expect(screen.getByText("hello.txt")).not.toBeNull();
    expect(screen.getByText(/Waiting for/)).not.toBeNull();
  });

  it("uses a polite live region so screen readers announce the wait", () => {
    render(<OutgoingTransfer filename="file.bin" recipientLabel="Riley" />);

    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-live")).toBe("polite");
  });
});
