import { MCPPackage } from '../package';
import type { McpMessage } from '../types';

export class McpAwnsPing extends MCPPackage {
  public packageName = 'dns-com-awns-ping';
  private id = 1;

  handle(message: McpMessage): void {
    switch (message.name) {
      case 'dns-com-awns-ping':
        this.send('reply', message.keyvals);
        break;
      case 'dns-com-awns-ping-reply':
        break;
      default:
        break;
    }
  }

  ping(): void {
    this.send('dns-com-awns-ping', { id: this.id++ });
  }
}
