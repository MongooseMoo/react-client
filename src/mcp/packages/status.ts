import { MCPPackage } from '../package';
import type { McpMessage } from '../types';

export class McpAwnsStatus extends MCPPackage {
  public packageName = 'dns-com-awns-status';

  handle(message: McpMessage): void {
    this.context.emit('statustext', message.keyvals.text);
  }
}
