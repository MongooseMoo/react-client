import MudClient from "./client";
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
  McpAwnsGetSet,
  McpAwnsStatus,
  McpSimpleEdit,
  McpVmooUserlist,
} from "./mcp/index";

/**
 * Create a MudClient with all GMCP and MCP packages registered.
 * Shared across all modes (telnet, WASM local, WASM host, guest).
 */
export function createConfiguredClient(): MudClient {
  const client = new MudClient("mongoose.moo.mud.org", 8765);
  // GMCP packages
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
  client.gmcp.register(GMCPClientHtml);
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
  client.gmcp.register(GMCPGroup);
  client.gmcp.register(GMCPLogging);
  client.gmcp.register(GMCPRedirect);
  client.gmcp.register(GMCPRoom);
  client.gmcp.register(GMCPClientHaptics);

  char.on("name", (data) => client.emit("statustext", `Logged in as ${data.fullname}`));
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

  // MCP packages
  for (const PackageConstructor of DEFAULT_MCP_PACKAGES) {
    const mcpPackage = client.registerMcpPackage(PackageConstructor);
    if (mcpPackage instanceof McpSimpleEdit) {
      client.configureEditors(mcpPackage);
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
  return client;
}
