import { identityCodec, messageEnvelope, outbound } from '../../protocol/messages';
import { MCPPackage } from '../package';

export interface AwnsJtextPickRequest {
  type: string;
  args: string;
}

const jtextPick = messageEnvelope('pick', identityCodec<AwnsJtextPickRequest>());

const McpAwnsJtextBase = MCPPackage.with({
  packageName: 'dns-com-awns-jtext',
  messages: [outbound(jtextPick)] as const,
});

export class McpAwnsJtext extends McpAwnsJtextBase {
  pick(type: string, args: string): void {
    this.sendPick({ type, args });
  }
}
