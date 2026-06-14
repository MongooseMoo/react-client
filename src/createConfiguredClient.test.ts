import { afterEach, describe, expect, it, vi } from "vitest";

import type MudClient from "./client";
import { createConfiguredClient } from "./createConfiguredClient";

vi.mock("cacophony", () => ({
  Cacophony: class {
    muted = false;
    setGlobalVolume = vi.fn();
  },
}));

describe("createConfiguredClient", () => {
  let client: MudClient | undefined;

  afterEach(() => {
    client?.shutdown();
    client = undefined;
  });

  it("wires Char.Name to sessionReady once", () => {
    client = createConfiguredClient();
    const handleSessionReady = vi.fn();
    const handleStatusText = vi.fn();
    client.on("sessionReady", handleSessionReady);
    client.on("statustext", handleStatusText);

    const char = client.gmcp.require("Char");
    char.receiveRegisteredMessage("Name", { fullname: "Q", name: "q" });
    char.receiveRegisteredMessage("Name", { fullname: "Q", name: "q" });

    expect(client.gmcp.sessionReady).toBe(true);
    expect(handleSessionReady).toHaveBeenCalledOnce();
    expect(handleStatusText).toHaveBeenCalledTimes(2);
  });
});
