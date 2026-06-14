import { beforeEach, describe, expect, it, vi } from "vitest";

import type MudClient from "../../client";
import { useLiveKitStore } from "../../stores/liveKitStore";
import { GMCPCommLiveKit } from "./LiveKit";

function createMockClient() {
  return {
    gmcp: {
      send: vi.fn(),
    },
  };
}

describe("GMCPCommLiveKit", () => {
  let client: ReturnType<typeof createMockClient>;
  let handler: GMCPCommLiveKit;

  beforeEach(() => {
    vi.clearAllMocks();
    useLiveKitStore.getState().reset();
    client = createMockClient();
    handler = new GMCPCommLiveKit(client as unknown as MudClient);
  });

  it("stores and emits roomToken when room_token arrives", () => {
    const listener = vi.fn();
    handler.on("roomToken", listener);

    handler.receiveRegisteredMessage("room_token", { token: "token-a" });

    expect(useLiveKitStore.getState().tokens).toEqual(["token-a"]);
    expect(listener).toHaveBeenCalledWith({ token: "token-a" });
  });

  it("removes and emits roomLeave when room_leave arrives", () => {
    const listener = vi.fn();
    handler.on("roomLeave", listener);
    useLiveKitStore.getState().addToken("token-a");

    handler.receiveRegisteredMessage("room_leave", { token: "token-a" });

    expect(useLiveKitStore.getState().tokens).toEqual([]);
    expect(listener).toHaveBeenCalledWith({ token: "token-a" });
  });
});
