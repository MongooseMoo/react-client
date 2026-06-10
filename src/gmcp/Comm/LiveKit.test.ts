import { beforeEach, describe, expect, it, vi } from "vitest";

import type MudClient from "../../client";
import { useLiveKitStore } from "../../stores/liveKitStore";
import { GMCPCommLiveKit } from "./LiveKit";

function createMockClient() {
  return {
    emit: vi.fn(),
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

  it("stores and emits livekitToken when room_token arrives", () => {
    handler.handleroom_token({ token: "token-a" });

    expect(useLiveKitStore.getState().tokens).toEqual(["token-a"]);
    expect(client.emit).toHaveBeenCalledWith("livekitToken", "token-a");
  });

  it("removes and emits livekitLeave when room_leave arrives", () => {
    useLiveKitStore.getState().addToken("token-a");

    handler.handleroom_leave({ token: "token-a" });

    expect(useLiveKitStore.getState().tokens).toEqual([]);
    expect(client.emit).toHaveBeenCalledWith("livekitLeave", "token-a");
  });
});
