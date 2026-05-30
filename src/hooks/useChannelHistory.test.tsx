import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type MudClient from "../client";
import {
  formatAnnouncementMessage,
  MAX_ALL_BUFFER_MESSAGES,
  MAX_CHANNEL_BUFFER_MESSAGES,
  MAX_PERSISTED_ALL_MESSAGES,
  MAX_PERSISTED_CHANNEL_MESSAGES,
  useChannelHistory,
} from "./useChannelHistory";

type Listener = (payload: unknown) => void;

class FakeClient {
  private listeners = new Map<string, Set<Listener>>();

  on(eventName: string, listener: Listener): this {
    const listeners = this.listeners.get(eventName) || new Set<Listener>();
    listeners.add(listener);
    this.listeners.set(eventName, listeners);
    return this;
  }

  removeListener(eventName: string, listener: Listener): this {
    this.listeners.get(eventName)?.delete(listener);
    return this;
  }

  emit(eventName: string, payload: unknown): void {
    this.listeners.get(eventName)?.forEach(listener => listener(payload));
  }

  listenerCount(eventName: string): number {
    return this.listeners.get(eventName)?.size || 0;
  }
}

const asMudClient = (client: FakeClient): MudClient => client as unknown as MudClient;

const makeMessages = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: index,
    message: `message ${index}`,
    timestamp: index,
  }));

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
});

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
  it("keeps the channelText listener stable while messages update hook state, and registers no message listener", () => {
    const client = new FakeClient();
    const { rerender, unmount } = renderHook(
      ({ currentClient }) => useChannelHistory(asMudClient(currentClient)),
      { initialProps: { currentClient: client } }
    );

    // The all buffer is the aggregate of channels, so the hook subscribes only
    // to channelText. Generic "message" traffic is not consumed here.
    expect(client.listenerCount("message")).toBe(0);
    expect(client.listenerCount("channelText")).toBe(1);

    act(() => {
      client.emit("channelText", {
        channel: "gossip",
        talker: "Reader",
        text: "channel message",
      });
    });

    rerender({ currentClient: client });

    expect(client.listenerCount("channelText")).toBe(1);

    unmount();

    expect(client.listenerCount("channelText")).toBe(0);
  });

  it("caps the all buffer and per-channel buffers in memory", () => {
    const client = new FakeClient();
    const { result } = renderHook(() => useChannelHistory(asMudClient(client)));

    act(() => {
      // Drive enough channel traffic to overflow the (larger) all-buffer cap;
      // the gossip channel buffer overflows its own (smaller) cap along the way.
      for (let index = 0; index < MAX_ALL_BUFFER_MESSAGES + 5; index += 1) {
        client.emit("channelText", {
          channel: "gossip",
          talker: "Reader",
          text: `gossip ${index}`,
        });
      }
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
    const client = new FakeClient();
    renderHook(() => useChannelHistory(asMudClient(client)));

    act(() => {
      // One channel stream fills both its own buffer and the all aggregate.
      for (let index = 0; index < MAX_ALL_BUFFER_MESSAGES; index += 1) {
        client.emit("channelText", {
          channel: "gossip",
          talker: "Reader",
          text: `gossip ${index}`,
        });
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

    const { result } = renderHook(() => useChannelHistory(null));

    expect(result.current.buffers.get("all")?.messages).toHaveLength(MAX_ALL_BUFFER_MESSAGES);
    expect(result.current.buffers.get("all")?.messages[0]?.message).toBe("message 10");
    expect(result.current.buffers.get("gossip")?.messages).toHaveLength(MAX_CHANNEL_BUFFER_MESSAGES);
    expect(result.current.buffers.get("gossip")?.messages[0]?.message).toBe("message 10");
  });
});

describe("the all buffer holds the contents of all channels", () => {
  it("aggregates every channel's messages into the all buffer in arrival order", () => {
    const client = new FakeClient();
    const { result } = renderHook(() => useChannelHistory(asMudClient(client)));

    act(() => {
      client.emit("channelText", { channel: "chat", talker: "Q", text: "hello" });
      client.emit("channelText", { channel: "newbie", talker: "claude", text: "hi" });
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

  it("preserves channel and talker metadata on the aggregated copies", () => {
    const client = new FakeClient();
    const { result } = renderHook(() => useChannelHistory(asMudClient(client)));

    act(() => {
      client.emit("channelText", { channel: "chat", talker: "Q", text: "yo" });
    });

    const msg = result.current.buffers.get("all")?.messages[0];
    expect(msg?.channel).toBe("chat");
    expect(msg?.talker).toBe("Q");
  });

  it("does not put generic non-channel messages into the all buffer", () => {
    const client = new FakeClient();
    const { result } = renderHook(() => useChannelHistory(asMudClient(client)));

    act(() => {
      client.emit("message", "The sky is blue.");
    });

    expect(result.current.buffers.get("all")?.messages ?? []).toEqual([]);
  });
});
