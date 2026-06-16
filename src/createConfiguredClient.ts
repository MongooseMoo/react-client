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
  McpAwnsRehash,
  McpAwnsServerInfo,
  McpAwnsStatus,
  McpAwnsTimezone,
  McpAwnsVisual,
  McpWorldMongooseLocation,
  McpNegotiate,
  McpSimpleEdit,
} from "./mcp/index";
import { usePreferences } from "./stores/preferencesStore";
import { useInputStore } from "./stores/inputStore";
import { useServerLinksStore } from "./stores/serverLinksStore";
import { useWorldMapStore } from "./stores/worldMapStore";
import { useConnectionStore } from "./stores/connectionStore";
import { useCharacterStatusStore } from "./stores/characterStatusStore";
import { useOutputStore } from "./stores/outputStore";

marked.setOptions({
  breaks: true,
  gfm: true,
});

function getLocalTimezoneIdentifier(): string {
  return new Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function syncTimezoneToServer(timezonePackage?: McpAwnsTimezone): void {
  if (!timezonePackage) {
    return;
  }
  if (!usePreferences.getState().general.syncTimezoneToServer) {
    return;
  }
  timezonePackage.sendTimezone({ timezone: getLocalTimezoneIdentifier() });
}

function syncLocationToServer(locationPackage?: McpWorldMongooseLocation): void {
  if (!locationPackage) {
    return;
  }
  if (!usePreferences.getState().general.syncLocationToServer) {
    return;
  }
  const geolocation = globalThis.navigator?.geolocation;
  if (!geolocation?.getCurrentPosition) {
    return;
  }
  geolocation.getCurrentPosition(
    (position) => {
      locationPackage.sendLocation({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      });
    },
    (error) => {
      console.warn("Unable to read browser geolocation for MCP sync", error);
    },
    {
      enableHighAccuracy: false,
      maximumAge: 300000,
      timeout: 10000,
    },
  );
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
  client.gmcp.register(GMCPCore);
  client.gmcp.register(GMCPClientMedia);
  client.gmcp.register(GMCPClientSpatial);
  client.gmcp.register(GMCPClientMidi);
  client.gmcp.register(GMCPClientSpeech);
  client.gmcp.register(GMCPClientWebPush);
  client.gmcp.register(GMCPClientKeystrokes);
  client.gmcp.register(GMCPCoreSupports);
  client.gmcp.register(GMCPCommChannel);
  client.gmcp.register(GMCPCommLiveKit);
  client.gmcp.register(GMCPAutoLogin);
  const clientHtml = client.gmcp.register(GMCPClientHtml);
  client.gmcp.register(GMCPClientFile);
  client.gmcp.register(GMCPCharItems);
  client.gmcp.register(GMCPCharStatus);
  const char = client.gmcp.register(GMCPChar);
  client.gmcp.register(GMCPCharOffer);
  client.gmcp.register(GMCPCharPrompt);
  client.gmcp.register(GMCPCharStatusAffectedBy);
  client.gmcp.register(GMCPCharStatusConditions);
  client.gmcp.register(GMCPCharStatusTimers);
  client.gmcp.register(GMCPCharAfflictions);
  client.gmcp.register(GMCPCharDefences);
  client.gmcp.register(GMCPCharSkills);
  client.gmcp.register(GMCPGroup);
  client.gmcp.register(GMCPLogging);
  client.gmcp.register(GMCPRedirect);
  client.gmcp.register(GMCPRoom);
  client.gmcp.register(GMCPClientHaptics);

  char.on("name", (data) => {
    useConnectionStore.getState().setStatusText(`Logged in as ${data.fullname}`);
    if (client.gmcp.markSessionReady()) {
      useConnectionStore.getState().setSessionReady(true);
    }
  });
  char.on("vitals", (data) => useCharacterStatusStore.getState().setVitals(data));
  clientHtml.on("addHtml", (data) => useOutputStore.getState().addHtml(data.data.join("\n")));
  clientHtml.on("addMarkdown", (data) => {
    const html = marked(data.data.join("\n"));
    if (typeof html === "string") {
      useOutputStore.getState().addHtml(html.trimEnd());
      return;
    }
    html.then((renderedHtml) => {
      useOutputStore.getState().addHtml(renderedHtml.trimEnd());
    });
  });
  // MCP packages
  let negotiatePackage: McpNegotiate | undefined;
  let serverInfoPackage: McpAwnsServerInfo | undefined;
  let visualPackage: McpAwnsVisual | undefined;
  let rehashPackage: McpAwnsRehash | undefined;
  let timezonePackage: McpAwnsTimezone | undefined;
  let locationPackage: McpWorldMongooseLocation | undefined;

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
        useConnectionStore.getState().setStatusText(`Server sent URL: ${url}`);
      });
    }
    if (mcpPackage instanceof McpAwnsServerInfo) {
      serverInfoPackage = mcpPackage;
      mcpPackage.on("serverInfo", (info) => {
        useServerLinksStore.getState().setServerInfo(info);
      });
    }
    if (mcpPackage instanceof McpAwnsVisual) {
      visualPackage = mcpPackage;
      mcpPackage.on("location", ({ id }) => {
        useWorldMapStore.getState().setLocation(id);
      });
      mcpPackage.on("self", ({ id }) => {
        useWorldMapStore.getState().setSelf(id);
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
      });
      mcpPackage.on("topology", (rooms) => {
        useWorldMapStore.getState().setRooms(
          rooms.map((room) => ({
            id: room.id,
            name: room.name,
            exits: room.exit,
          })),
        );
      });
    }
    if (mcpPackage instanceof McpAwnsRehash) {
      rehashPackage = mcpPackage;
      mcpPackage.on("commands", ({ commands }) => {
        useInputStore.getState().setVisibleCommands(commands);
      });
      mcpPackage.on("add", ({ commands }) => {
        useInputStore.getState().addVisibleCommands(commands);
      });
      mcpPackage.on("remove", ({ commands }) => {
        useInputStore.getState().removeVisibleCommands(commands);
      });
    }
    if (mcpPackage instanceof McpAwnsTimezone) {
      timezonePackage = mcpPackage;
    }
    if (mcpPackage instanceof McpWorldMongooseLocation) {
      locationPackage = mcpPackage;
    }
    if (mcpPackage instanceof McpAwnsStatus) {
      mcpPackage.on("statustext", (text) =>
        useConnectionStore.getState().setStatusText(text),
      );
    }
  }

  let lastGeneralPreferences = usePreferences.getState().general;
  const unsubscribeGeneralPreferences = usePreferences.subscribe((state) => {
    const nextGeneralPreferences = state.general;
    if (
      nextGeneralPreferences.syncTimezoneToServer !==
        lastGeneralPreferences.syncTimezoneToServer &&
      nextGeneralPreferences.syncTimezoneToServer &&
      client.connected
    ) {
      syncTimezoneToServer(timezonePackage);
    }
    if (
      nextGeneralPreferences.syncLocationToServer !==
        lastGeneralPreferences.syncLocationToServer &&
      nextGeneralPreferences.syncLocationToServer &&
      client.connected
    ) {
      syncLocationToServer(locationPackage);
    }
    lastGeneralPreferences = nextGeneralPreferences;
  });
  client.registerCleanup(unsubscribeGeneralPreferences);

  negotiatePackage?.on("end", () => {
    syncTimezoneToServer(timezonePackage);
    syncLocationToServer(locationPackage);
    serverInfoPackage?.requestServerInfo();
    rehashPackage?.requestCommands();
    visualPackage?.requestSelf();
    visualPackage?.requestLocation();
    visualPackage?.requestUsers();
  });

  return client;
}
