import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { TransferPeer } from "../../fileTransferPeers";
import Controls from "./Controls";

const recipients: TransferPeer[] = [
  {
    id: "#100",
    label: "Quinn",
    transferAddress: "Quinn",
    away: false,
    idle: false,
  },
  {
    id: "#200",
    label: "Riley",
    transferAddress: "Riley",
    away: true,
    idle: false,
  },
];

const selectedFile = new File(["hello"], "hello.txt", {
  type: "text/plain",
});

function renderControls(onSendFile = vi.fn(), players = recipients) {
  function Harness() {
    const [selectedRecipient, setSelectedRecipient] =
      useState<TransferPeer | null>(null);

    return (
      <Controls
        onFileChange={vi.fn()}
        onRecipientChange={setSelectedRecipient}
        onSendFile={onSendFile}
        selectedFile={selectedFile}
        selectedRecipient={selectedRecipient}
        recipients={players}
      />
    );
  }

  render(<Harness />);
  return { onSendFile };
}

const recipient = () => screen.getByLabelText("Recipient") as HTMLInputElement;

describe("FileTransfer Controls", () => {
  it("keeps Send disabled for arbitrary typed recipients", () => {
    renderControls();

    fireEvent.change(recipient(), {
      target: { value: "Not Connected" },
    });

    expect(
      (screen.getByRole("button", { name: "Send File" }) as HTMLButtonElement)
        .disabled
    ).toBe(true);
  });

  it("enables Send after selecting a connected player", () => {
    renderControls();

    fireEvent.focus(recipient());
    fireEvent.mouseDown(screen.getByRole("option", { name: "Quinn" }));

    expect(
      (screen.getByRole("button", { name: "Send File" }) as HTMLButtonElement)
        .disabled
    ).toBe(false);
  });

  it("labels the file input", () => {
    renderControls();

    expect((screen.getByLabelText("File to send") as HTMLInputElement).type).toBe("file");
  });

  it("always has the list its combobox controls, hidden until there is something to choose", () => {
    renderControls();
    const list = document.getElementById(recipient().getAttribute("aria-controls") ?? "");

    expect(list?.getAttribute("role")).toBe("listbox");
    expect(list?.hidden).toBe(true);
    expect(recipient().getAttribute("aria-expanded")).toBe("false");

    fireEvent.focus(recipient());

    expect(list?.hidden).toBe(false);
    expect(recipient().getAttribute("aria-expanded")).toBe("true");
  });

  it("marks the highlighted option as selected and points the combobox at it", () => {
    renderControls();
    fireEvent.focus(recipient());
    const selected = () =>
      screen.getAllByRole("option").map((option) => option.getAttribute("aria-selected"));
    const active = () =>
      document.getElementById(recipient().getAttribute("aria-activedescendant") ?? "");

    expect(selected()).toEqual(["true", "false"]);
    expect(active()?.textContent).toBe("Quinn");

    fireEvent.keyDown(recipient(), { key: "ArrowDown" });

    expect(selected()).toEqual(["false", "true"]);
    expect(active()?.textContent).toBe("Riley");
    // Focus never leaves the input: the options are not focusable.
    expect(screen.getAllByRole("option").every((option) => !option.hasAttribute("tabindex"))).toBe(true);
  });

  it("says when nobody matches, through a status that was there beforehand", () => {
    renderControls();
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("");

    fireEvent.focus(recipient());
    // The client runs on Preact, where typing reaches `onChange` as an input event.
    fireEvent.input(recipient(), { target: { value: "zzz" } });

    expect(screen.getByRole("status")).toBe(status);
    expect(status.textContent).toBe("No matching players");
    expect(screen.queryAllByRole("option")).toEqual([]);
    expect(recipient().getAttribute("aria-expanded")).toBe("false");
    expect(recipient().hasAttribute("aria-activedescendant")).toBe(false);
  });

  it("says when there is nobody to send to at all", () => {
    renderControls(vi.fn(), []);

    fireEvent.focus(recipient());

    expect(screen.getByRole("status").textContent).toBe("No connected players");
  });
});
