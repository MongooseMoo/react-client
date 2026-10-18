import type { MCPPackage } from '../package';
import { McpAwnsDisplayUrl } from './displayUrl';
import { McpAwnsGetSet } from './getSet';
import { McpAwnsJtext } from './jtext';
import { McpWorldMongooseLocation } from './location';
import { McpNegotiate } from './negotiate';
import { McpAwnsPing } from './ping';
import { McpAwnsRehash } from './rehash';
import { McpAwnsServerInfo } from './serverInfo';
import { McpSimpleEdit } from './simpleEdit';
import { McpAwnsStatus } from './status';
import { McpAwnsTimezone } from './timezone';
import { McpVmooUserlist } from './userlist';
import { McpAwnsVisual } from './visual';

export type McpPackageConstructor = new () => MCPPackage;

export const DEFAULT_MCP_PACKAGES = [
  McpNegotiate,
  McpAwnsGetSet,
  McpAwnsDisplayUrl,
  McpAwnsServerInfo,
  McpAwnsJtext,
  McpAwnsVisual,
  McpAwnsRehash,
  McpAwnsTimezone,
  McpWorldMongooseLocation,
  McpAwnsStatus,
  McpSimpleEdit,
  McpVmooUserlist,
  McpAwnsPing,
] satisfies McpPackageConstructor[];
