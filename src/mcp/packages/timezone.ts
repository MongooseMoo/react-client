import { identityCodec, messageEnvelope } from '../../protocol/messages';
import { MCPPackage } from '../package';
import type { McpOutboundData } from '../types';

export type AwnsTimezone = {
  timezone: string;
};

const timezone = messageEnvelope('dns-com-awns-timezone', identityCodec<AwnsTimezone>());

const McpAwnsTimezoneBase = MCPPackage.with({
  packageName: 'dns-com-awns-timezone',
  messages: [] as const,
});

export class McpAwnsTimezone extends McpAwnsTimezoneBase {
  sendTimezone(payload: AwnsTimezone): void {
    this.send(timezone.wireName, timezone.codec.encode(payload) as McpOutboundData);
  }
}
