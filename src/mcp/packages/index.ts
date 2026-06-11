import type { MCPPackage, McpPackageContext } from "../package";
import { McpAwnsGetSet } from "./getSet";
import { McpNegotiate } from "./negotiate";
import { McpAwnsPing } from "./ping";
import { McpSimpleEdit } from "./simpleEdit";
import { McpAwnsStatus } from "./status";
import { McpVmooUserlist } from "./userlist";

export type McpPackageConstructor = new (_: McpPackageContext) => MCPPackage;

export const DEFAULT_MCP_PACKAGES = [
  McpNegotiate,
  McpAwnsGetSet,
  McpAwnsStatus,
  McpSimpleEdit,
  McpVmooUserlist,
  McpAwnsPing,
] satisfies McpPackageConstructor[];

