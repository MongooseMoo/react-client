import { afterEach, describe, expect, it, vi } from "vitest";

import type MudClient from "./client";
import { createConfiguredClient } from "./createConfiguredClient";
import { useInputStore } from "./stores/inputStore";
import { useItemsStore } from "./stores/itemsStore";
import { usePreferences } from "./stores/preferencesStore";
import { useServerLinksStore } from "./stores/serverLinksStore";
import { useSkillsStore } from "./stores/skillsStore";
import { useUserlistStore } from "./stores/userlistStore";
import { useWorldMapStore } from "./stores/worldMapStore";
import { useConnectionStore } from "./stores/connectionStore";
import { useCharacterStatusStore } from "./stores/characterStatusStore";
import { useChannelHistoryStore } from "./stores/channelHistoryStore";

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
    useCharacterStatusStore.getState().reset();
    useChannelHistoryStore.getState().reset();
    useConnectionStore.getState().reset();
    usePreferences.getState().setGeneral({ localEcho: false, syncTimezoneToServer: true });
    useInputStore.getState().clear();
    useInputStore.getState().resetCommands();
    useItemsStore.getState().reset();
    useServerLinksStore.getState().reset();
    useSkillsStore.getState().reset();
    useUserlistStore.getState().reset();
    useWorldMapStore.getState().reset();
  });

  it("wires Char.Name to connection session state", () => {
    client = createConfiguredClient();

    const char = client.gmcp.require("Char");
    char.receiveRegisteredMessage("Name", { fullname: "Q", name: "q" });
    char.receiveRegisteredMessage("Name", { fullname: "Q", name: "q" });

    expect(client.gmcp.sessionReady).toBe(true);
    expect(useConnectionStore.getState().sessionReady).toBe(true);
    expect(useConnectionStore.getState().statusText).toBe("Logged in as Q");
  });

  it("wires Char.Vitals to the character status store", () => {
    client = createConfiguredClient();

    const char = client.gmcp.require("Char");
    char.receiveRegisteredMessage("Vitals", { hp: "10", maxhp: "20" });

    expect(useCharacterStatusStore.getState().vitals).toEqual({ hp: "10", maxhp: "20" });
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

  it("wires Comm.Channel.Text GMCP messages to the channel history store", () => {
    client = createConfiguredClient();

    const channel = client.gmcp.require("Comm.Channel");
    channel.receiveRegisteredMessage("Text", {
      channel: "chat",
      talker: "Alice",
      text: "Hello",
    });

    expect(useChannelHistoryStore.getState().entries).toEqual([
      { id: 1, channel: "chat", talker: "Alice", text: "Hello" },
    ]);
  });

  it("wires VMOO userlist MCP messages to the userlist store", () => {
    client = createConfiguredClient();
    const sent: string[] = [];
    vi.spyOn(client, "send").mockImplementation((line: string) => {
      sent.push(line);
    });

    client.mcpSession.receiveLine("#$#MCP version: 2.1 to: 2.1");
    const authKey = sent[0]?.match(/authentication-key: (\S+)/)?.[1];
    expect(authKey).toBeTruthy();

    client.mcpSession.receiveLine(`#$#dns-com-vmoo-userlist-content ${authKey} _data-tag: users`);
    client.mcpSession.receiveLine('#$#* users fields: {"Object","Name","Icon"}');
    client.mcpSession.receiveLine('#$#* users d: ={{1234,"Alice",4}}');

    expect(useUserlistStore.getState().players).toEqual([
      {
        Object: "1234",
        Name: "Alice",
        Icon: 4,
        away: false,
        idle: false,
      },
    ]);
    expect(useUserlistStore.getState().hasReceivedList).toBe(true);
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

    expect(
      sent.some((line) =>
        line.includes(
          `#$#dns-com-awns-timezone ${authKey} timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"}`,
        ),
      ),
    ).toBe(true);
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

  it("does not send timezone when syncTimezoneToServer is disabled", () => {
    usePreferences.getState().setGeneral({ localEcho: false, syncTimezoneToServer: false });
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

    expect(sent.some((line) => line.includes("#$#dns-com-awns-timezone"))).toBe(false);
    expect(sent.some((line) => line.includes(`#$#dns-com-awns-serverinfo-get ${authKey}`))).toBe(
      true,
    );
  });
});
