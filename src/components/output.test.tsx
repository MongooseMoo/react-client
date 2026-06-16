import { describe, expect, it, vi } from "vitest";
import type React from "react";

import type MudClient from "../client";
import Output, { type OutputLine, OutputType } from "./output";

const { mockAnnounce } = vi.hoisted(() => ({
  mockAnnounce: vi.fn(),
}));

vi.mock("@react-aria/live-announcer", () => ({
  announce: mockAnnounce,
}));

const makeKeyboardEvent = (
  init: Pick<React.KeyboardEvent<HTMLDivElement>, "altKey" | "code" | "key"> &
    Partial<Pick<React.KeyboardEvent<HTMLDivElement>, "ctrlKey" | "metaKey" | "shiftKey">>
): React.KeyboardEvent<HTMLDivElement> => ({
  altKey: init.altKey,
  code: init.code,
  ctrlKey: init.ctrlKey ?? false,
  key: init.key,
  metaKey: init.metaKey ?? false,
  preventDefault: vi.fn(),
  shiftKey: init.shiftKey ?? false,
} as unknown as React.KeyboardEvent<HTMLDivElement>);

describe("Output keyboard handling", () => {
  it("reviews recent output lines from the end", () => {
    const output = new Output({ client: {} as MudClient });
    const lines: OutputLine[] = [
      {
        content: <div>first line</div>,
        id: 1,
        sourceContent: "first line",
        sourceType: "test",
        type: OutputType.ServerMessage,
      },
      {
        content: <div>second line</div>,
        id: 2,
        sourceContent: "second line",
        sourceType: "test",
        type: OutputType.ServerMessage,
      },
    ];
    Object.defineProperty(output, "allLines", { value: lines });

    output.reviewRecentOutputLine(1);
    output.reviewRecentOutputLine(2);
    output.reviewRecentOutputLine(3);

    expect(mockAnnounce).toHaveBeenNthCalledWith(1, "second line", "polite");
    expect(mockAnnounce).toHaveBeenNthCalledWith(2, "first line", "polite");
    expect(mockAnnounce).toHaveBeenNthCalledWith(3, "No line", "polite");
  });

  it("only suppresses plain Alt navigation keys", () => {
    const output = new Output({ client: {} as MudClient });
    const plainAltArrow = makeKeyboardEvent({
      altKey: true,
      code: "ArrowLeft",
      key: "ArrowLeft",
    });
    const metaAltArrow = makeKeyboardEvent({
      altKey: true,
      code: "ArrowLeft",
      key: "ArrowLeft",
      metaKey: true,
    });

    output.handleOutputKeyDown(plainAltArrow);
    output.handleOutputKeyDown(metaAltArrow);

    expect(plainAltArrow.preventDefault).toHaveBeenCalled();
    expect(metaAltArrow.preventDefault).not.toHaveBeenCalled();
  });
});
