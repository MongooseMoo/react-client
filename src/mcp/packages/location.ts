import { identityCodec, messageEnvelope } from "../../protocol/messages";
import { MCPPackage } from "../package";
import type { McpOutboundData } from "../types";

export type WorldMongooseLocation = {
  lat: number;
  lon: number;
};

const location = messageEnvelope(
  "world.mongoose.location",
  identityCodec<WorldMongooseLocation>(),
);

const McpWorldMongooseLocationBase = MCPPackage.with({
  packageName: "world.mongoose.location",
  messages: [] as const,
});

export class McpWorldMongooseLocation extends McpWorldMongooseLocationBase {
  sendLocation(payload: WorldMongooseLocation): void {
    this.send(location.wireName, location.codec.encode(payload) as McpOutboundData);
  }
}
