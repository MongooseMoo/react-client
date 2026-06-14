import { identityCodec, inbound, messageEnvelope, outbound } from '../../protocol/messages';
import { MCPPackage } from '../package';
import type { McpMessage } from '../types';

export type AwnsServerInfo = {
  homeUrl: string;
  helpUrl: string;
};

const serverInfo = messageEnvelope('serverInfo', identityCodec<AwnsServerInfo>());
const serverInfoGet = messageEnvelope('get', identityCodec<Record<string, never>>());

const McpAwnsServerInfoBase = MCPPackage.with({
  packageName: 'dns-com-awns-serverinfo',
  messages: [inbound(serverInfo).asEvent('serverInfo'), outbound(serverInfoGet)] as const,
});

export class McpAwnsServerInfo extends McpAwnsServerInfoBase {
  handle(message: McpMessage): void {
    if (message.name !== 'dns-com-awns-serverinfo') {
      return;
    }

    this.emitRegisteredMessage(serverInfo.wireName, {
      homeUrl: message.keyvals.home_url ?? '',
      helpUrl: message.keyvals.help_url ?? '',
    });
  }

  requestServerInfo(): void {
    this.sendGet({});
  }
}
