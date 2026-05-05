import React, { useState } from "react";
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

function renderControls(onSendFile = vi.fn()) {
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
        recipients={recipients}
      />
    );
  }

  render(<Harness />);
  return { onSendFile };
}

describe("FileTransfer Controls", () => {
  it("keeps Send disabled for arbitrary typed recipients", () => {
    renderControls();

    fireEvent.change(screen.getByLabelText("Recipient"), {
      target: { value: "Not Connected" },
    });

    expect(screen.getByRole("button", { name: "Send File" })).toBeDisabled();
  });

  it("enables Send after selecting a connected player", () => {
    renderControls();

    fireEvent.focus(screen.getByLabelText("Recipient"));
    fireEvent.mouseDown(screen.getByRole("option", { name: "Quinn" }));

    expect(screen.getByRole("button", { name: "Send File" })).toBeEnabled();
  });
});
