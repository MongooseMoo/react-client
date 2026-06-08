import type { EditorSession, McpMessage, McpOutboundData } from './types';

export interface McpPackageContext {
  emit(event: string, ...args: unknown[]): boolean;
  openEditorSession(session: EditorSession): void;
  sendMcp(command: string, data?: McpOutboundData): void;
}

export class MCPPackage {
  public readonly packageName!: string;
  public readonly minVersion?: number = 1.0;
  public readonly maxVersion?: number = 1.0;
  public readonly packageVersion?: number = 0.0;
  protected readonly context: McpPackageContext;

  constructor(context: McpPackageContext) {
    this.context = context;
  }

  handle(_message: McpMessage): void {
    throw new Error('Method not implemented.');
  }

  handleMultiline(_message: McpMessage): void {
    throw new Error('Method not implemented.');
  }

  closeMultiline(_closure: McpMessage): void {
    throw new Error('Method not implemented.');
  }

  shutdown(): void {
    // Do nothing
  }

  send(command: string, data?: McpOutboundData): void {
    const messageName = command.startsWith(this.packageName)
      ? command
      : `${this.packageName}-${command}`;
    this.context.sendMcp(messageName, data);
  }
}
