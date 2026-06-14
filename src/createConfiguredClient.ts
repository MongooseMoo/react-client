import MudClient from "./client";
import { marked } from "marked";
import {
  GMCPAutoLogin,
  GMCPChar,
  GMCPCharAfflictions,
  GMCPCharDefences,
  GMCPCharItems,
  GMCPCharOffer,
  GMCPCharPrompt,
  GMCPCharSkills,
  GMCPCharStatus,
  GMCPCharStatusAffectedBy,
  GMCPCharStatusConditions,
  GMCPCharStatusTimers,
  GMCPClientFile,
  GMCPClientFileTransfer,
  GMCPClientHaptics,
  GMCPClientHtml,
  GMCPClientKeystrokes,
  GMCPClientMedia,
  GMCPClientMidi,
  GMCPClientSpatial,
  GMCPClientSpeech,
  GMCPClientWebPush,
  GMCPCommChannel,
  GMCPCommLiveKit,
  GMCPCore,
  GMCPCoreSupports,
  GMCPGroup,
  GMCPLogging,
  GMCPRedirect,
  GMCPRoom,
} from "./gmcp";
import {
  DEFAULT_MCP_PACKAGES,
  McpAwnsDisplayUrl,
  McpAwnsGetSet,
  McpAwnsRehash,
  McpAwnsServerInfo,
  McpAwnsStatus,
  McpAwnsTimezone,
  McpAwnsVisual,
  McpNegotiate,
  McpSimpleEdit,
  McpVmooUserlist,
} from "./mcp/index";
import { useInputStore } from "./stores/inputStore";
import { useServerLinksStore } from "./stores/serverLinksStore";
import { useSpatialStore } from "./stores/spatialStore";
import { useWorldMapStore } from "./stores/worldMapStore";

marked.setOptions({
  breaks: true,
  gfm: true,
});

function getLocalTimezoneAbbreviation(): string {
  const timeZoneName =
    new Intl.DateTimeFormat("en-US", { timeZoneName: "short" })
      .formatToParts(new Date())
      .find((part) => part.type === "timeZoneName")?.value ?? "";
  return timeZoneName || "UTC";
}

/**
 * Create a MudClient with all GMCP and MCP packages registered.
 * Shared across all modes (telnet, WASM local, WASM host, guest).
 */
export function createConfiguredClient(): MudClient {
  const client = new MudClient("mongoose.moo.mud.org", 8765);
  // GMCP packages
  const clientFileTransfer = client.gmcp.register(GMCPClientFileTransfer);
  client.configureFileTransfer(clientFileTransfer);
  const core = client.gmcp.register(GMCPCore);
  client.gmcp.register(GMCPClientMedia);
  const clientSpatial = client.gmcp.register(GMCPClientSpatial);
  client.gmcp.register(GMCPClientMidi);
  client.gmcp.register(GMCPClientSpeech);
  const clientWebPush = client.gmcp.register(GMCPClientWebPush);
  client.gmcp.register(GMCPClientKeystrokes);
  client.gmcp.register(GMCPCoreSupports);
  const commChannel = client.gmcp.register(GMCPCommChannel);
  const commLiveKit = client.gmcp.register(GMCPCommLiveKit);
  client.gmcp.register(GMCPAutoLogin);
  const clientHtml = client.gmcp.register(GMCPClientHtml);
  client.gmcp.register(GMCPClientFile);
  const charItems = client.gmcp.register(GMCPCharItems);
  const charStatus = client.gmcp.register(GMCPCharStatus);
  const char = client.gmcp.register(GMCPChar);
  const charOffer = client.gmcp.register(GMCPCharOffer);
  const charPrompt = client.gmcp.register(GMCPCharPrompt);
  const charStatusAffectedBy = client.gmcp.register(GMCPCharStatusAffectedBy);
  const charStatusConditions = client.gmcp.register(GMCPCharStatusConditions);
  const charStatusTimers = client.gmcp.register(GMCPCharStatusTimers);
  const charAfflictions = client.gmcp.register(GMCPCharAfflictions);
  const charDefences = client.gmcp.register(GMCPCharDefences);
  const charSkills = client.gmcp.register(GMCPCharSkills);
  const group = client.gmcp.register(GMCPGroup);
  const logging = client.gmcp.register(GMCPLogging);
  const redirect = client.gmcp.register(GMCPRedirect);
  const room = client.gmcp.register(GMCPRoom);
  const clientHaptics = client.gmcp.register(GMCPClientHaptics);

  char.on("name", (data) => {
    client.emit("statustext", `Logged in as ${data.fullname}`);
    if (client.gmcp.markSessionReady()) {
      client.emit("sessionReady");
    }
  });
  char.on("vitals", (data) => client.emit("vitals", data));
  char.on("statusVars", (data) => client.emit("statusVars", data));
  char.on("status", (data) => client.emit("statusUpdate", data));
  charStatus.on("status", (data) => client.emit("status", data));
  charOffer.on("offer", (data) => client.emit("offer", data));
  charPrompt.on("prompt", (data) => client.emit("prompt", data));
  charStatusAffectedBy.on("affectedBy", (data) => client.emit("statusAffectedBy", data));
  charStatusConditions.on("conditions", (data) => client.emit("statusConditions", data));
  charStatusTimers.on("timers", (data) => client.emit("statusTimers", data));
  charAfflictions.on("list", (data) => client.emit("afflictionsList", data));
  charAfflictions.on("add", (data) => client.emit("afflictionAdd", data));
  charAfflictions.on("remove", (data) => client.emit("afflictionRemove", data));
  charDefences.on("list", (data) => client.emit("defencesList", data));
  charDefences.on("add", (data) => client.emit("defenceAdd", data));
  charDefences.on("remove", (data) => client.emit("defenceRemove", data));
  charSkills.on("groups", (data) => client.emit("skillGroups", data));
  charSkills.on("list", (data) => client.emit("skillList", data));
  charSkills.on("info", (data) => client.emit("skillInfo", data));
  charItems.on("list", (data) => {
    const items = data.items.map((item) => ({ ...item, location: data.location }));
    client.emit("itemsList", { ...data, items });
  });
  charItems.on("add", (data) => {
    client.emit("itemAdd", { ...data, item: { ...data.item, location: data.location } });
  });
  charItems.on("remove", (data) => {
    client.emit("itemRemove", { ...data, item: { ...data.item, location: data.location } });
  });
  charItems.on("update", (data) => {
    client.emit("itemUpdate", { ...data, item: { ...data.item, location: data.location } });
  });
  core.on("ping", () => client.emit("corePing"));
  core.on("goodbye", (reason) => client.emit("coreGoodbye", reason));
  commChannel.on("text", (data) => {
    client.emit("channelText", data);
    if (data.channel === "say_to_you" && !document.hasFocus()) {
      client.sendNotification(`Message from ${data.talker}`, data.text);
    }
  });
  commChannel.on("players", (data) => client.emit("channelPlayers", data));
  commChannel.on("start", (channelName) =>
    client.emit("channelStart", channelName),
  );
  commChannel.on("end", (channelName) => client.emit("channelEnd", channelName));
  commLiveKit.on("roomToken", (data) => client.emit("livekitToken", data.token));
  commLiveKit.on("roomLeave", (data) => client.emit("livekitLeave", data.token));
  group.on("info", (data) => client.emit("groupInfo", data));
  logging.on("error", (data) => client.emit("gmcpError", data));
  redirect.on("window", (targetWindow) =>
    client.emit("redirectWindow", targetWindow || "main"),
  );
  room.on("wrongDir", (direction) => client.emit("roomWrongDir", direction));
  clientHtml.on("addHtml", (data) => client.emit("html", data.data.join("\n")));
  clientHtml.on("addMarkdown", (data) => {
    const html = marked(data.data.join("\n"));
    client.emit("html", typeof html === "string" ? html.trimEnd() : html);
  });
  clientWebPush.on("token", (data) =>
    client.emit("webpushToken", {
      expiresAt: typeof data.expires_at === "number" ? data.expires_at : null,
      token: data.token || null,
    }),
  );
  clientHaptics.on("actuate", (data) => client.emit("hapticsActuate", data));
  clientHaptics.on("stop", (data) => client.emit("hapticsStop", data));
  clientHaptics.on("status", (data) => client.emit("hapticsStatus", data));
  clientHaptics.on("sensorSubscribe", (data) =>
    client.emit("hapticsSensorSubscribe", data),
  );
  clientHaptics.on("sensorUnsubscribe", (data) =>
    client.emit("hapticsSensorUnsubscribe", data),
  );
  clientSpatial.on("scene", (data) => client.emit("spatialScene", data));
  clientSpatial.on("entityEnter", (data) =>
    client.emit("spatialEntityEnter", data.entity),
  );
  clientSpatial.on("entityLeave", (data) =>
    client.emit("spatialEntityLeave", data.entityId),
  );
  clientSpatial.on("entityMove", (data) =>
    client.emit(
      "spatialEntityMove",
      useSpatialStore.getState().spatialEntities[data.entityId],
    ),
  );
  clientSpatial.on("listenerPosition", (data) =>
    client.emit("spatialListenerPosition", data),
  );
  clientSpatial.on("listenerOrientation", (data) =>
    client.emit("spatialListenerOrientation", data),
  );
  clientSpatial.on("emitterStart", (data) =>
    client.emit("spatialEmitterStart", data.emitter),
  );
  clientSpatial.on("emitterStop", (data) =>
    client.emit("spatialEmitterStop", data.emitterId),
  );

  // MCP packages
  let negotiatePackage: McpNegotiate | undefined;
  let serverInfoPackage: McpAwnsServerInfo | undefined;
  let visualPackage: McpAwnsVisual | undefined;
  let rehashPackage: McpAwnsRehash | undefined;
  let timezonePackage: McpAwnsTimezone | undefined;

  for (const PackageConstructor of DEFAULT_MCP_PACKAGES) {
    const mcpPackage = client.registerMcpPackage(PackageConstructor);
    if (mcpPackage instanceof McpNegotiate) {
      negotiatePackage = mcpPackage;
    }
    if (mcpPackage instanceof McpSimpleEdit) {
      client.configureEditors(mcpPackage);
    }
    if (mcpPackage instanceof McpAwnsDisplayUrl) {
      mcpPackage.on("displayUrl", (url) => {
        useServerLinksStore.getState().addRecentUrl(url);
        client.emit("displayUrl", url);
        client.emit("statustext", `Server sent URL: ${url}`);
      });
    }
    if (mcpPackage instanceof McpAwnsServerInfo) {
      serverInfoPackage = mcpPackage;
      mcpPackage.on("serverInfo", (info) => {
        useServerLinksStore.getState().setServerInfo(info);
        client.emit("serverInfo", info);
      });
    }
    if (mcpPackage instanceof McpAwnsVisual) {
      visualPackage = mcpPackage;
      mcpPackage.on("location", ({ id }) => {
        useWorldMapStore.getState().setLocation(id);
        client.emit("worldLocation", id);
      });
      mcpPackage.on("self", ({ id }) => {
        useWorldMapStore.getState().setSelf(id);
        client.emit("worldSelf", id);
      });
      mcpPackage.on("users", (users) => {
        useWorldMapStore.getState().setUsers(
          users.map((user) => ({
            id: user.id,
            name: user.name,
            locationId: user.location,
            idleSeconds: Number.isFinite(Number(user.idle)) ? Number(user.idle) : null,
          })),
        );
        client.emit("worldUsers", users);
      });
      mcpPackage.on("topology", (rooms) => {
        useWorldMapStore.getState().setRooms(
          rooms.map((room) => ({
            id: room.id,
            name: room.name,
            exits: room.exit,
          })),
        );
        client.emit("worldTopology", rooms);
      });
    }
    if (mcpPackage instanceof McpAwnsRehash) {
      rehashPackage = mcpPackage;
      mcpPackage.on("commands", ({ commands }) => {
        useInputStore.getState().setVisibleCommands(commands);
        client.emit("visibleCommands", commands);
      });
      mcpPackage.on("add", ({ commands }) => {
        useInputStore.getState().addVisibleCommands(commands);
        client.emit("visibleCommands", useInputStore.getState().visibleCommands);
      });
      mcpPackage.on("remove", ({ commands }) => {
        useInputStore.getState().removeVisibleCommands(commands);
        client.emit("visibleCommands", useInputStore.getState().visibleCommands);
      });
    }
    if (mcpPackage instanceof McpAwnsTimezone) {
      timezonePackage = mcpPackage;
    }
    if (mcpPackage instanceof McpAwnsStatus) {
      mcpPackage.on("statustext", (text) => client.emit("statustext", text));
    }
    if (mcpPackage instanceof McpAwnsGetSet) {
      mcpPackage.on("getset", ({ key, value }) =>
        client.emit("getset", key, value),
      );
    }
    if (mcpPackage instanceof McpVmooUserlist) {
      mcpPackage.on("userlist", (players) => client.emit("userlist", players));
    }
  }

  negotiatePackage?.on("end", () => {
    timezonePackage?.sendTimezone({ timezone: getLocalTimezoneAbbreviation() });
    serverInfoPackage?.requestServerInfo();
    rehashPackage?.requestCommands();
    visualPackage?.requestSelf();
    visualPackage?.requestLocation();
    visualPackage?.requestUsers();
  });

  return client;
}
