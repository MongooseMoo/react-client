import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type React from "react";

import type MudClient from "../client";
import { useOutputStore } from "../stores/outputStore";
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

describe("Output store delivery", () => {
  beforeEach(() => {
    useOutputStore.getState().reset();
  });

  afterEach(() => {
    useOutputStore.getState().reset();
  });

  it("processes an oversized same-tick burst before the retained snapshot is capped", async () => {
    const output = new Output({ client: {} as MudClient });
    const handleOutputEntry = vi
      .spyOn(output, "handleOutputEntry")
      .mockImplementation(() => undefined);
    const unsubscribe = useOutputStore.subscribe(output.handleOutputStoreEntries);

    for (let index = 0; index < 501; index += 1) {
      useOutputStore.getState().addMessage(`line ${index}`);
    }
    await Promise.resolve();

    unsubscribe();
    expect(handleOutputEntry).toHaveBeenCalledTimes(501);
    expect(useOutputStore.getState().entries).toHaveLength(500);
    expect(useOutputStore.getState().entries[0]).toMatchObject({
      id: 2,
      message: "line 1",
    });
  });
});

describe("Output initial scroll position", () => {
  beforeEach(() => {
    localStorage.clear();
    useOutputStore.getState().reset();
  });

  afterEach(() => {
    localStorage.clear();
    useOutputStore.getState().reset();
    vi.unstubAllGlobals();
  });

  it("starts at the bottom when mounting persisted output history", () => {
    localStorage.setItem(Output.LOCAL_STORAGE_KEY, JSON.stringify({
      version: 2,
      data: [{
        type: OutputType.ServerMessage,
        sourceType: "ansi",
        sourceContent: "previous session line",
      }],
    }));
    const output = new Output({ client: {} as MudClient });
    vi.spyOn(output, "setState").mockImplementation(() => undefined);
    const outputElement = document.createElement("div");
    Object.defineProperties(outputElement, {
      clientHeight: { configurable: true, value: 200 },
      scrollHeight: { configurable: true, value: 1_000 },
      scrollTop: { configurable: true, value: 350, writable: true },
    });
    Object.defineProperty(output.outputRef, "current", { value: outputElement });
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });

    output.componentDidMount();

    expect(outputElement.scrollTop).toBe(outputElement.scrollHeight);
    output.componentWillUnmount();
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
    JSON.parse(raw as string) as { version: number; data: unknown[] };

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
    expect(parsePayload(setItemSpy.mock.calls[0][1]).data).toHaveLength(10);
    expect(parsePayload(setItemSpy.mock.calls[1][1]).data).toHaveLength(5);

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
    expect(parsePayload(setItemSpy.mock.calls[0][1]).data).toHaveLength(3);
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
    expect(parsePayload(setItemSpy.mock.calls[0][1]).data).toHaveLength(2);
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

describe("Output accessibility-tree exposure cap", () => {
  const makeLines = (count: number): OutputLine[] =>
    Array.from({ length: count }, (_, i) => ({
      content: <div>{`line ${i}`}</div>,
      id: i,
      sourceContent: `line ${i}`,
      sourceType: "test",
      type: OutputType.ServerMessage,
    }));

  // Instantiate an Output with history and a real frozen container so
  // freezeOverflow/trimFrozen operate on actual DOM.
  const makeOutput = (lines: OutputLine[]): Output => {
    const output = new Output({ client: {} as MudClient });
    Object.defineProperty(output, "allLines", { value: lines, writable: true });
    const frozenDiv = document.createElement("div");
    Object.defineProperty(output, "frozenRef", { value: { current: frozenDiv } });
    return output;
  };

  const frozen = (output: Output): HTMLDivElement =>
    (output as unknown as { frozenRef: { current: HTMLDivElement } }).frozenRef.current;

  const freeze = (output: Output) =>
    (output as unknown as { freezeOverflow: () => void }).freezeOverflow();

  const hiddenCount = (output: Output): number =>
    frozen(output).querySelectorAll('[aria-hidden="true"]').length;

  it("hides frozen lines beyond the exposure cap, oldest first", () => {
    const total = Output.LIVE_WINDOW_SIZE + Output.A11Y_EXPOSED_FROZEN_LINES + 50;
    const output = makeOutput(makeLines(total));

    freeze(output);

    const frozenDiv = frozen(output);
    expect(frozenDiv.children.length).toBe(total - Output.LIVE_WINDOW_SIZE);
    expect(hiddenCount(output)).toBe(50);
    // The oldest lines are hidden; the most recent frozen lines are exposed.
    expect(frozenDiv.children[0].getAttribute("aria-hidden")).toBe("true");
    expect(frozenDiv.children[49].getAttribute("aria-hidden")).toBe("true");
    expect(frozenDiv.children[50].hasAttribute("aria-hidden")).toBe(false);
    expect(
      frozenDiv.children[frozenDiv.children.length - 1].hasAttribute("aria-hidden")
    ).toBe(false);
  });

  it("exposes everything while under the cap", () => {
    const output = makeOutput(
      makeLines(Output.LIVE_WINDOW_SIZE + Output.A11Y_EXPOSED_FROZEN_LINES)
    );

    freeze(output);

    expect(frozen(output).children.length).toBe(Output.A11Y_EXPOSED_FROZEN_LINES);
    expect(hiddenCount(output)).toBe(0);
  });

  it("hides incrementally as more lines freeze", () => {
    const start = Output.LIVE_WINDOW_SIZE + Output.A11Y_EXPOSED_FROZEN_LINES;
    const output = makeOutput(makeLines(start));
    freeze(output);
    expect(hiddenCount(output)).toBe(0);

    (output as unknown as { allLines: OutputLine[] }).allLines = makeLines(start + 10);
    freeze(output);

    expect(hiddenCount(output)).toBe(10);
  });

  it("keeps the hidden count consistent across trims from the front", () => {
    const total = Output.LIVE_WINDOW_SIZE + Output.A11Y_EXPOSED_FROZEN_LINES + 30;
    const output = makeOutput(makeLines(total));
    freeze(output);
    expect(hiddenCount(output)).toBe(30);

    (output as unknown as { trimFrozen: (n: number) => void }).trimFrozen(30);

    // The 30 hidden (oldest) lines were removed; nothing exposed got hidden.
    expect(hiddenCount(output)).toBe(0);
    expect(frozen(output).children.length).toBe(Output.A11Y_EXPOSED_FROZEN_LINES);

    // Freezing more lines re-hides from the new front, incrementally.
    (output as unknown as { allLines: OutputLine[] }).allLines = makeLines(total - 30 + 5);
    freeze(output);
    expect(hiddenCount(output)).toBe(5);
  });
});

describe("Output history exposure toggle", () => {
  const makeLines = (count: number): OutputLine[] =>
    Array.from({ length: count }, (_, i) => ({
      content: <div>{`line ${i}`}</div>,
      id: i,
      sourceContent: `line ${i}`,
      sourceType: "test",
      type: OutputType.ServerMessage,
    }));

  const makeOutput = (lines: OutputLine[]): Output => {
    const output = new Output({ client: {} as MudClient });
    Object.defineProperty(output, "allLines", { value: lines, writable: true });
    const frozenDiv = document.createElement("div");
    Object.defineProperty(output, "frozenRef", { value: { current: frozenDiv } });
    return output;
  };

  const frozen = (output: Output): HTMLDivElement =>
    (output as unknown as { frozenRef: { current: HTMLDivElement } }).frozenRef.current;

  const freeze = (output: Output) =>
    (output as unknown as { freezeOverflow: () => void }).freezeOverflow();

  const hiddenCount = (output: Output): number =>
    frozen(output).querySelectorAll('[aria-hidden="true"]').length;

  const setRevealed = (output: Output, historyRevealed: boolean) => {
    Object.assign(output.state, { historyRevealed });
  };

  it("exposes all frozen lines while revealed, including new arrivals", () => {
    const total = Output.LIVE_WINDOW_SIZE + Output.A11Y_EXPOSED_FROZEN_LINES + 40;
    const output = makeOutput(makeLines(total));
    freeze(output);
    expect(hiddenCount(output)).toBe(40);

    setRevealed(output, true);
    freeze(output);
    expect(hiddenCount(output)).toBe(0);

    // New lines freezing while revealed stay exposed too.
    (output as unknown as { allLines: OutputLine[] }).allLines = makeLines(total + 10);
    freeze(output);
    expect(hiddenCount(output)).toBe(0);
  });

  it("re-hides everything beyond the cap when revealed is switched off", () => {
    const total = Output.LIVE_WINDOW_SIZE + Output.A11Y_EXPOSED_FROZEN_LINES + 40;
    const output = makeOutput(makeLines(total));
    setRevealed(output, true);
    freeze(output);
    expect(hiddenCount(output)).toBe(0);

    setRevealed(output, false);
    freeze(output);

    const frozenDiv = frozen(output);
    expect(hiddenCount(output)).toBe(40);
    expect(frozenDiv.children[0].getAttribute("aria-hidden")).toBe("true");
    expect(frozenDiv.children[40].hasAttribute("aria-hidden")).toBe(false);
  });
});
