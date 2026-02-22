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
  GMCPClientFileTransfer,
  GMCPClientHaptics,
  GMCPClientHtml,
  GMCPClientKeystrokes,
  GMCPClientMedia,
  GMCPClientMidi,
  GMCPClientSpeech,
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
  McpAwnsPing,
  McpAwnsStatus,
  McpSimpleEdit,
  McpVmooUserlist,
} from "./mcp";

/**
 * Create a MudClient with all GMCP and MCP packages registered.
 * Shared across all modes (telnet, WASM local, WASM host, guest).
 */
export function createConfiguredClient(): MudClient {
  const client = new MudClient("mongoose.moo.mud.org", 8765);
  // GMCP packages
  client.registerGMCPPackage(GMCPCore);
  client.registerGMCPPackage(GMCPClientMedia);
  client.registerGMCPPackage(GMCPClientMidi);
  client.registerGMCPPackage(GMCPClientSpeech);
  client.registerGMCPPackage(GMCPClientKeystrokes);
  client.registerGMCPPackage(GMCPCoreSupports);
  client.registerGMCPPackage(GMCPCommChannel);
  client.registerGMCPPackage(GMCPCommLiveKit);
  client.registerGMCPPackage(GMCPAutoLogin);
  client.registerGMCPPackage(GMCPClientHtml);
  client.registerGMCPPackage(GMCPClientFile);
  client.registerGMCPPackage(GMCPClientFileTransfer);
  client.registerGMCPPackage(GMCPCharItems);
  client.registerGMCPPackage(GMCPCharStatus);
  client.registerGMCPPackage(GMCPChar);
  client.registerGMCPPackage(GMCPCharOffer);
  client.registerGMCPPackage(GMCPCharPrompt);
  client.registerGMCPPackage(GMCPCharStatusAffectedBy);
  client.registerGMCPPackage(GMCPCharStatusConditions);
  client.registerGMCPPackage(GMCPCharStatusTimers);
  client.registerGMCPPackage(GMCPCharAfflictions);
  client.registerGMCPPackage(GMCPCharDefences);
  client.registerGMCPPackage(GMCPCharSkills);
  client.registerGMCPPackage(GMCPGroup);
  client.registerGMCPPackage(GMCPLogging);
  client.registerGMCPPackage(GMCPRedirect);
  client.registerGMCPPackage(GMCPRoom);
  client.registerGMCPPackage(GMCPClientHaptics);
  // MCP packages
  client.registerMcpPackage(McpAwnsStatus);
  client.registerMcpPackage(McpSimpleEdit);
  client.registerMcpPackage(McpVmooUserlist);
  client.registerMcpPackage(McpAwnsPing);
  return client;
}
