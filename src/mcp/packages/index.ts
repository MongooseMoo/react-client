import type { MCPPackage } from '../package';
import { McpAwnsGetSet } from './getSet';
import { McpWorldMongooseLocation } from './location';
import { McpWorldMongooseMenu } from './menu';
import { McpNegotiate } from './negotiate';
import { McpAwnsPing } from './ping';
import { McpAwnsRehash } from './rehash';
import { McpSimpleEdit } from './simpleEdit';
import { McpAwnsStatus } from './status';
import { McpAwnsTimezone } from './timezone';
import { McpVmooUserlist } from './userlist';

export type McpPackageConstructor = new () => MCPPackage;

export const DEFAULT_MCP_PACKAGES = [
  McpNegotiate,
  McpAwnsGetSet,
  McpAwnsRehash,
  McpAwnsTimezone,
  McpWorldMongooseLocation,
  McpWorldMongooseMenu,
  McpAwnsStatus,
  McpSimpleEdit,
  McpVmooUserlist,
  McpAwnsPing,
] satisfies McpPackageConstructor[];
