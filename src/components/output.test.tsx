import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type React from "react";

import type MudClient from "../client";
import Output, { type OutputLine, OutputType } from "./output";

const { mockAnnounce, mockClipboardWriteText } = vi.hoisted(() => ({
  mockAnnounce: vi.fn(),
  mockClipboardWriteText: vi.fn(),
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
  beforeEach(() => {
    vi.clearAllMocks();
    mockClipboardWriteText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: mockClipboardWriteText },
    });
  });

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

  it("copies the rendered text of a recent output line", async () => {
    const output = new Output({ client: {} as MudClient });
    const lines: OutputLine[] = [
      {
        content: <div>copy this text</div>,
        id: 1,
        sourceContent: "<p>copy this text</p>",
        sourceType: "html",
        type: OutputType.ServerMessage,
      },
    ];
    Object.defineProperty(output, "allLines", { value: lines });

    await output.copyRecentOutputLine(1);

    expect(mockClipboardWriteText).toHaveBeenCalledWith("copy this text");
    expect(mockAnnounce).toHaveBeenCalledWith("Copied", "polite");
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

describe("Output persistence", () => {
  const makeLines = (count: number): OutputLine[] =>
    Array.from({ length: count }, (_, i) => ({
      content: <div>{`line ${i}`}</div>,
      id: i,
      sourceContent: `line ${i}`,
      sourceType: "test",
      type: OutputType.ServerMessage,
    }));

  // Instantiate an Output with a known set of history lines, bypassing the
  // constructor's localStorage load so tests control exactly what is persisted.
  const makeOutput = (lines: OutputLine[]): Output => {
    const output = new Output({ client: {} as MudClient });
    Object.defineProperty(output, "allLines", { value: lines, writable: true });
    return output;
  };

  const parsePayload = (raw: unknown) =>
    JSON.parse(raw as string) as { version: number; lines: unknown[] };

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not throw when setItem hits a quota error; trims and retries once", () => {
    const output = makeOutput(makeLines(10));
    const setItemSpy = vi
      .spyOn(window.localStorage, "setItem")
      .mockImplementationOnce(() => {
        throw new DOMException("quota", "QuotaExceededError");
      });

    expect(() => output.saveOutput()).not.toThrow();

    // First (failed) attempt writes all 10 lines; the retry writes the recent half.
    expect(setItemSpy).toHaveBeenCalledTimes(2);
    expect(parsePayload(setItemSpy.mock.calls[0][1]).lines).toHaveLength(10);
    expect(parsePayload(setItemSpy.mock.calls[1][1]).lines).toHaveLength(5);

    // Component still functions: a subsequent save succeeds without throwing.
    expect(() => output.saveOutput()).not.toThrow();
  });

  it("warns without throwing when the trimmed retry also fails", () => {
    const output = makeOutput(makeLines(10));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new DOMException("quota", "QuotaExceededError");
    });

    expect(() => output.saveOutput()).not.toThrow();
    expect(warnSpy).toHaveBeenCalled();
  });

  it("debounces rapid updates into a single write reflecting the latest lines", () => {
    vi.useFakeTimers();
    const output = makeOutput(makeLines(1));
    const setItemSpy = vi.spyOn(window.localStorage, "setItem");

    // Three rapid updates while totals stay equal (no setState side effects).
    output.componentDidUpdate(output.props, output.state, false);
    output.componentDidUpdate(output.props, output.state, false);
    Object.defineProperty(output, "allLines", { value: makeLines(3), writable: true });
    output.componentDidUpdate(output.props, output.state, false);

    expect(setItemSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);

    expect(setItemSpy).toHaveBeenCalledTimes(1);
    expect(parsePayload(setItemSpy.mock.calls[0][1]).lines).toHaveLength(3);
  });

  it("flushes the pending save synchronously on unmount", () => {
    vi.useFakeTimers();
    const output = makeOutput(makeLines(2));
    const setItemSpy = vi.spyOn(window.localStorage, "setItem");

    output.componentDidUpdate(output.props, output.state, false);
    expect(setItemSpy).not.toHaveBeenCalled();

    output.componentWillUnmount();

    // Written synchronously, before any timer advances.
    expect(setItemSpy).toHaveBeenCalledTimes(1);
    expect(parsePayload(setItemSpy.mock.calls[0][1]).lines).toHaveLength(2);
  });

  it("cancels a pending save on clearLog so stale data is not re-persisted", () => {
    vi.useFakeTimers();
    const output = makeOutput(makeLines(5));
    vi.spyOn(output, "setState").mockImplementation(() => {});
    const setItemSpy = vi.spyOn(window.localStorage, "setItem");
    const removeItemSpy = vi.spyOn(window.localStorage, "removeItem");

    output.componentDidUpdate(output.props, output.state, false);
    output.clearLog();

    vi.advanceTimersByTime(500);

    expect(removeItemSpy).toHaveBeenCalled();
    expect(setItemSpy).not.toHaveBeenCalled();
  });
});
