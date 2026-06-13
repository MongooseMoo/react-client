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
  client.gmcp.register(GMCPCharItems);
  client.gmcp.register(GMCPCharStatus);
  client.gmcp.register(GMCPChar);
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
