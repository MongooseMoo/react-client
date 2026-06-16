import { afterEach, describe, expect, it, vi } from "vitest";

import type MudClient from "./client";
import { createConfiguredClient } from "./createConfiguredClient";
import { useInputStore } from "./stores/inputStore";
import { useItemsStore } from "./stores/itemsStore";
import { useServerLinksStore } from "./stores/serverLinksStore";
import { useSkillsStore } from "./stores/skillsStore";
import { useWorldMapStore } from "./stores/worldMapStore";

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
    useInputStore.getState().clear();
    useInputStore.getState().resetCommands();
    useItemsStore.getState().reset();
    useServerLinksStore.getState().reset();
    useSkillsStore.getState().reset();
    useWorldMapStore.getState().reset();
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

  it("wires AWNS MCP packages to semantic stores", () => {
    client = createConfiguredClient();

    client.mcpSession.packageHandlers["dns-com-awns-displayurl"].handle({
      name: "dns-com-awns-displayurl",
      keyvals: { url: "https://example.test/help" },
    });
    client.mcpSession.packageHandlers["dns-com-awns-serverinfo"].handle({
      name: "dns-com-awns-serverinfo",
      keyvals: {
        home_url: "https://example.test/",
        help_url: "https://example.test/help",
      },
    });
    client.mcpSession.packageHandlers["dns-com-awns-rehash"].handle({
      name: "dns-com-awns-rehash-commands",
      keyvals: { list: "open r*ead" },
    });
    client.mcpSession.packageHandlers["dns-com-awns-visual"].handle({
      name: "dns-com-awns-visual-location",
      keyvals: { id: "#100" },
    });
    client.mcpSession.packageHandlers["dns-com-awns-visual"].handle({
      name: "dns-com-awns-visual-self",
      keyvals: { id: "#42" },
    });

    expect(useServerLinksStore.getState().recentUrls.map((entry) => entry.url)).toEqual([
      "https://example.test/help",
    ]);
    expect(useServerLinksStore.getState().homeUrl).toBe("https://example.test/");
    expect(useServerLinksStore.getState().helpUrl).toBe("https://example.test/help");
    expect(useInputStore.getState().visibleCommands).toEqual(["open", "r", "re", "rea", "read"]);
    expect(useWorldMapStore.getState().locationId).toBe("#100");
    expect(useWorldMapStore.getState().selfId).toBe("#42");
  });

  it("wires Char.Skills GMCP messages to the skills store", () => {
    client = createConfiguredClient();

    const skills = client.gmcp.require("Char.Skills");
    skills.receiveRegisteredMessage("Groups", [{ name: "Combat", rank: "Novice" }]);
    skills.receiveRegisteredMessage("List", {
      group: "Combat",
      list: ["Punch"],
      descs: ["Hit the target."],
    });

    expect(useSkillsStore.getState().groups).toEqual([{ name: "Combat", rank: "Novice" }]);
    expect(useSkillsStore.getState().skillsByGroup.Combat).toEqual({
      group: "Combat",
      list: ["Punch"],
      descs: ["Hit the target."],
      isLoading: false,
    });
  });

  it("wires Char.Items GMCP messages to the items store", () => {
    client = createConfiguredClient();

    const items = client.gmcp.require("Char.Items");
    items.receiveRegisteredMessage("List", {
      location: "inv",
      items: [{ id: "coin", name: "a coin" }],
    });
    items.receiveRegisteredMessage("Add", {
      location: "inv",
      item: { id: "key", name: "a brass key" },
    });
    items.receiveRegisteredMessage("Update", {
      location: "inv",
      item: { id: "key", name: "a polished brass key" },
    });
    items.receiveRegisteredMessage("Remove", {
      location: "inv",
      item: { id: "coin", name: "a coin" },
    });

    expect(useItemsStore.getState().itemsByLocation.inv).toEqual([
      { id: "key", name: "a polished brass key", location: "inv" },
    ]);
    expect(useItemsStore.getState().hasReceivedList).toBe(true);
  });

  it("requests AWNS MCP data after MCP negotiation ends", () => {
    client = createConfiguredClient();
    const sent: string[] = [];
    vi.spyOn(client, "send").mockImplementation((line: string) => {
      sent.push(line);
    });

    client.mcpSession.receiveLine("#$#MCP version: 2.1 to: 2.1");
    const authKey = sent[0]?.match(/authentication-key: (\S+)/)?.[1];
    expect(authKey).toBeTruthy();
    sent.length = 0;

    client.mcpSession.receiveLine(`#$#mcp-negotiate-end ${authKey}`);

    expect(sent.some((line) => line.includes("#$#dns-com-awns-timezone"))).toBe(true);
    expect(sent.some((line) => line.includes(`#$#dns-com-awns-serverinfo-get ${authKey}`))).toBe(
      true,
    );
    expect(sent.some((line) => line.includes(`#$#dns-com-awns-rehash-getcommands ${authKey}`))).toBe(
      true,
    );
    expect(sent.some((line) => line.includes(`#$#dns-com-awns-visual-getself ${authKey}`))).toBe(
      true,
    );
    expect(sent.some((line) => line.includes(`#$#dns-com-awns-visual-getlocation ${authKey}`))).toBe(
      true,
    );
    expect(sent.some((line) => line.includes(`#$#dns-com-awns-visual-getusers ${authKey}`))).toBe(
      true,
    );
  });
});
