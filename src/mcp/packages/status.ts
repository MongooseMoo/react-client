import {
  identityCodec,
  inbound,
  messageEnvelope,
} from '../../protocol/messages';
import { MCPPackage } from '../package';
import type { McpMessage } from '../types';

const statusText = messageEnvelope('statusText', identityCodec<string>());

const McpAwnsStatusBase = MCPPackage.with({
  packageName: 'dns-com-awns-status',
  messages: [inbound(statusText).asEvent('statustext')] as const,
});

export class McpAwnsStatus extends McpAwnsStatusBase {
  handle(message: McpMessage): void {
    this.emitRegisteredMessage(statusText.wireName, message.keyvals.text);
  }
}
