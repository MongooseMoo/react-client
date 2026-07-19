import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useChannelHistoryStore } from "../stores/channelHistoryStore";
import {
  formatAnnouncementMessage,
  MAX_ALL_BUFFER_MESSAGES,
  MAX_CHANNEL_BUFFER_MESSAGES,
  MAX_PERSISTED_ALL_MESSAGES,
  MAX_PERSISTED_CHANNEL_MESSAGES,
  useChannelHistory,
} from "./useChannelHistory";

const makeMessages = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: index,
    message: `message ${index}`,
    timestamp: index,
  }));

const dispatchKeyboardEvent = (init: KeyboardEventInit): KeyboardEvent => {
  const event = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    ...init,
  });

  document.dispatchEvent(event);
  return event;
};

const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  configurable: true,
});

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  useChannelHistoryStore.getState().reset();
});

const addChannelText = (channel: string, talker: string, text: string): void => {
  useChannelHistoryStore.getState().addChannelText({ channel, talker, text });
};

describe("formatAnnouncementMessage", () => {
  it("always prefixes talker when talker metadata is present", () => {
    expect(
      formatAnnouncementMessage({
        id: 1,
        message: "Changelog posted. Standing by.",
        timestamp: 0,
        channel: "say",
        talker: "claude",
      })
    ).toBe("claude. Changelog posted. Standing by.");
  });

  it("keeps the original message text intact while still announcing the talker separately", () => {
    expect(
      formatAnnouncementMessage({
        id: 2,
        message: 'Q says to you, "Sup broski."',
        timestamp: 0,
        channel: "say_to_you",
        talker: "Q",
      })
    ).toBe('Q. Q says to you, "Sup broski."');
  });

  it("does the same for page messages without rewriting the message body", () => {
    expect(
      formatAnnouncementMessage({
        id: 3,
        message: 'S/He pages, "gmcp-page-probe"',
        timestamp: 0,
        channel: "page",
        talker: "codex",
      })
    ).toBe('codex. S/He pages, "gmcp-page-probe"');
  });
});

describe("useChannelHistory", () => {
  it("consumes channel text from the store without a client listener", async () => {
    const { result, rerender } = renderHook(() => useChannelHistory());

    act(() => {
      addChannelText("gossip", "Reader", "channel message");
    });

    await waitFor(() => {
      expect(result.current.buffers.get("all")?.messages).toHaveLength(1);
    });

    rerender();

    expect(result.current.buffers.get("gossip")?.messages[0]?.message).toBe(
      "channel message"
    );
  });

  it("caps the all buffer and per-channel buffers in memory", async () => {
    const { result } = renderHook(() => useChannelHistory());

    act(() => {
      // Drive enough channel traffic to overflow the (larger) all-buffer cap;
      // the gossip channel buffer overflows its own (smaller) cap along the way.
      for (let index = 0; index < MAX_ALL_BUFFER_MESSAGES + 5; index += 1) {
        addChannelText("gossip", "Reader", `gossip ${index}`);
      }
    });

    await waitFor(() => {
      expect(result.current.buffers.get("all")?.messages).toHaveLength(
        MAX_ALL_BUFFER_MESSAGES
      );
    });

    const allBuffer = result.current.buffers.get("all");
    const gossipBuffer = result.current.buffers.get("gossip");

    expect(allBuffer?.messages).toHaveLength(MAX_ALL_BUFFER_MESSAGES);
    expect(allBuffer?.messages[0]?.message).toBe("gossip 5");
    expect(gossipBuffer?.messages).toHaveLength(MAX_CHANNEL_BUFFER_MESSAGES);
    expect(gossipBuffer?.messages[0]?.message).toBe(
      `gossip ${MAX_ALL_BUFFER_MESSAGES + 5 - MAX_CHANNEL_BUFFER_MESSAGES}`
    );
  });

  it("writes bounded channel history payloads to localStorage", async () => {
    renderHook(() => useChannelHistory());

    act(() => {
      // One channel stream fills both its own buffer and the all aggregate.
      for (let index = 0; index < MAX_ALL_BUFFER_MESSAGES; index += 1) {
        addChannelText("gossip", "Reader", `gossip ${index}`);
      }
    });

    await waitFor(() => {
      const saved = localStorage.getItem("channelHistory");
      expect(saved).not.toBeNull();

      const parsed = JSON.parse(saved || "{}");
      expect(parsed.buffers.all.messages).toHaveLength(MAX_PERSISTED_ALL_MESSAGES);
      expect(parsed.buffers.gossip.messages).toHaveLength(MAX_PERSISTED_CHANNEL_MESSAGES);
    });
  });

  it("caps older localStorage history when loading it", () => {
    localStorage.setItem("channelHistory", JSON.stringify({
      buffers: {
        all: {
          name: "all",
          messages: makeMessages(MAX_ALL_BUFFER_MESSAGES + 10),
          currentIndex: 0,
        },
        gossip: {
          name: "gossip",
          messages: makeMessages(MAX_CHANNEL_BUFFER_MESSAGES + 10),
          currentIndex: 0,
        },
      },
      bufferOrder: ["all", "gossip"],
      currentBufferIndex: 1,
      timestampsEnabled: true,
    }));

    const { result } = renderHook(() => useChannelHistory());

    expect(result.current.buffers.get("all")?.messages).toHaveLength(MAX_ALL_BUFFER_MESSAGES);
    expect(result.current.buffers.get("all")?.messages[0]?.message).toBe("message 10");
    expect(result.current.buffers.get("gossip")?.messages).toHaveLength(MAX_CHANNEL_BUFFER_MESSAGES);
    expect(result.current.buffers.get("gossip")?.messages[0]?.message).toBe("message 10");
  });

  it("handles plain Alt+Arrow buffer navigation", async () => {
    const { result } = renderHook(() => useChannelHistory());

    act(() => {
      addChannelText("gossip", "Reader", "one");
    });

    await waitFor(() => {
      expect(result.current.bufferOrder).toEqual(["all", "gossip"]);
    });

    expect(result.current.bufferOrder).toEqual(["all", "gossip"]);
    expect(result.current.currentBufferIndex).toBe(0);

    let event = dispatchKeyboardEvent({});
    act(() => {
      event = dispatchKeyboardEvent({ altKey: true, key: "ArrowRight" });
    });

    expect(event.defaultPrevented).toBe(true);
    expect(result.current.currentBufferIndex).toBe(1);
  });

  it("does not handle Alt+Arrow when another modifier is also pressed", async () => {
    const { result } = renderHook(() => useChannelHistory());

    act(() => {
      addChannelText("gossip", "Reader", "one");
    });

    await waitFor(() => {
      expect(result.current.bufferOrder).toEqual(["all", "gossip"]);
    });

    let event = dispatchKeyboardEvent({});
    act(() => {
      event = dispatchKeyboardEvent({ altKey: true, key: "ArrowRight", metaKey: true });
    });

    expect(event.defaultPrevented).toBe(false);
    expect(result.current.currentBufferIndex).toBe(0);
  });

  it("handles plain Alt+Arrow message navigation", async () => {
    const { result } = renderHook(() => useChannelHistory());

    act(() => {
      addChannelText("gossip", "Reader", "one");
      addChannelText("gossip", "Reader", "two");
    });

    await waitFor(() => {
      expect(result.current.buffers.get("all")?.messages).toHaveLength(2);
    });

    let event = dispatchKeyboardEvent({});
    act(() => {
      event = dispatchKeyboardEvent({ altKey: true, key: "ArrowUp" });
    });

    expect(event.defaultPrevented).toBe(true);
    expect(result.current.buffers.get("all")?.currentIndex).toBe(2);
  });
});

describe("Alt+Enter link activation", () => {
  it("opens the sole link immediately without showing the picker", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const { result } = renderHook(() => useChannelHistory());

    act(() => {
      addChannelText("gossip", "Reader", "see http://example.com/one");
    });

    await waitFor(() => {
      expect(result.current.buffers.get("all")?.messages).toHaveLength(1);
    });

    // Review the message so currentIndex points at it, then activate.
    act(() => {
      dispatchKeyboardEvent({ altKey: true, key: "ArrowUp" });
    });
    let event: KeyboardEvent = dispatchKeyboardEvent({});
    act(() => {
      event = dispatchKeyboardEvent({ altKey: true, key: "Enter" });
    });

    expect(event.defaultPrevented).toBe(true);
    expect(openSpy).toHaveBeenCalledWith(
      "http://example.com/one",
      "_blank",
      "noopener,noreferrer"
    );
    expect(result.current.linkPickerLinks).toBeNull();
    openSpy.mockRestore();
  });

  it("opens the picker when the reviewed message has multiple links", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const { result } = renderHook(() => useChannelHistory());

    act(() => {
      addChannelText("gossip", "Reader", "http://a.com and http://b.com");
    });

    await waitFor(() => {
      expect(result.current.buffers.get("all")?.messages).toHaveLength(1);
    });

    act(() => {
      dispatchKeyboardEvent({ altKey: true, key: "ArrowUp" });
    });
    act(() => {
      dispatchKeyboardEvent({ altKey: true, key: "Enter" });
    });

    expect(openSpy).not.toHaveBeenCalled();
    expect(result.current.linkPickerLinks).toEqual([
      { label: "http://a.com", href: "http://a.com" },
      { label: "http://b.com", href: "http://b.com" },
    ]);

    act(() => {
      result.current.closeLinkPicker();
    });
    expect(result.current.linkPickerLinks).toBeNull();
    openSpy.mockRestore();
  });

  it("does nothing but announce when the reviewed message has no links", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const { result } = renderHook(() => useChannelHistory());

    act(() => {
      addChannelText("gossip", "Reader", "plain text with no links");
    });

    await waitFor(() => {
      expect(result.current.buffers.get("all")?.messages).toHaveLength(1);
    });

    act(() => {
      dispatchKeyboardEvent({ altKey: true, key: "ArrowUp" });
    });
    act(() => {
      dispatchKeyboardEvent({ altKey: true, key: "Enter" });
    });

    expect(openSpy).not.toHaveBeenCalled();
    expect(result.current.linkPickerLinks).toBeNull();
    openSpy.mockRestore();
  });
});

describe("the all buffer holds the contents of all channels", () => {
  it("aggregates every channel's messages into the all buffer in arrival order", async () => {
    const { result } = renderHook(() => useChannelHistory());

    act(() => {
      addChannelText("chat", "Q", "hello");
      addChannelText("newbie", "claude", "hi");
    });

    await waitFor(() => {
      expect(
        result.current.buffers.get("all")?.messages.map(m => m.message)
      ).toEqual(["hello", "hi"]);
    });

    expect(
      result.current.buffers.get("all")?.messages.map(m => m.message)
    ).toEqual(["hello", "hi"]);

    // Each channel buffer still holds only its own messages.
    expect(
      result.current.buffers.get("chat")?.messages.map(m => m.message)
    ).toEqual(["hello"]);
    expect(
      result.current.buffers.get("newbie")?.messages.map(m => m.message)
    ).toEqual(["hi"]);
  });

  it("preserves channel and talker metadata on the aggregated copies", async () => {
    const { result } = renderHook(() => useChannelHistory());

    act(() => {
      addChannelText("chat", "Q", "yo");
    });

    await waitFor(() => {
      expect(result.current.buffers.get("all")?.messages).toHaveLength(1);
    });

    const msg = result.current.buffers.get("all")?.messages[0];
    expect(msg?.channel).toBe("chat");
    expect(msg?.talker).toBe("Q");
  });

  it("does not put generic non-channel messages into the all buffer", () => {
    const { result } = renderHook(() => useChannelHistory());

    expect(result.current.buffers.get("all")?.messages ?? []).toEqual([]);
  });
});
