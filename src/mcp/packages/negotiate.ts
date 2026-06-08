import { MCPPackage } from '../package';
import type { McpMessage } from '../types';

export class McpNegotiate extends MCPPackage {
  public packageName = 'mcp-negotiate';
  public minVersion = 2.0;
  public maxVersion = 2.0;

  handle(message: McpMessage): void {
    switch (message.name) {
      case 'mcp-negotiate-can':
      case 'mcp-negotiate-end':
        break;
      default:
        break;
    }
  }

  sendNegotiate(): void {
    this.send('end');
  }
}
