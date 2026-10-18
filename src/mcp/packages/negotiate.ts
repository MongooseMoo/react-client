import { duplex, identityCodec, messageEnvelope } from '../../protocol/messages';
import { MCPPackage } from '../package';
import type { McpMessage } from '../types';

const negotiateEnd = messageEnvelope('end', identityCodec<undefined>());

const McpNegotiateBase = MCPPackage.with({
  packageName: 'mcp-negotiate',
  messages: [duplex(negotiateEnd).asEvent('end')] as const,
});

export class McpNegotiate extends McpNegotiateBase {
  public minVersion = 2.0;
  public maxVersion = 2.0;

  handle(message: McpMessage): void {
    switch (message.name) {
      case 'mcp-negotiate-can':
        break;
      case 'mcp-negotiate-end':
        this.emitRegisteredMessage(negotiateEnd.wireName, undefined);
        break;
      default:
        break;
    }
  }

  sendNegotiate(): void {
    this.sendEnd(undefined);
  }
}
