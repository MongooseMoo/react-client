import { identityCodec, inbound, messageEnvelope } from '../../protocol/messages';
import { MCPPackage } from '../package';
import type { McpMessage } from '../types';

const displayUrl = messageEnvelope('displayUrl', identityCodec<string>());

const McpAwnsDisplayUrlBase = MCPPackage.with({
  packageName: 'dns-com-awns-displayurl',
  messages: [inbound(displayUrl).asEvent('displayUrl')] as const,
});

export class McpAwnsDisplayUrl extends McpAwnsDisplayUrlBase {
  handle(message: McpMessage): void {
    if (message.name !== 'dns-com-awns-displayurl') {
      return;
    }

    this.emitRegisteredMessage(displayUrl.wireName, message.keyvals.url);
  }
}
