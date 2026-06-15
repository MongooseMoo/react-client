import { describe, expect, it, vi } from "vitest";
import type React from "react";

import type MudClient from "../client";
import Output from "./output";

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
