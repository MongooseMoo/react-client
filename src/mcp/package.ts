import {
  createProtocolIO,
  type AnyDirectedProtocolMessage,
  type ProtocolIO,
} from '../protocol/messages';
import type {
  McpMessage,
  McpOutboundData,
  McpOutboundKeyvals,
} from './types';

export interface McpPackageContext {
  emit(event: string, ...args: unknown[]): boolean;
}

export interface McpMultilineOutboundPayload {
  kind: 'mcp-multiline';
  keyvals: McpOutboundKeyvals;
  lineKey: string;
  lines: string[];
}

interface McpPackageConfig<Messages extends readonly AnyDirectedProtocolMessage[]> {
  packageName: string;
  messages: Messages;
}

export class MCPPackage {
  public readonly packageName!: string;
  public readonly minVersion?: number = 1.0;
  public readonly maxVersion?: number = 1.0;
  public readonly packageVersion?: number = 0.0;
  protected readonly context: McpPackageContext;
  private sendMessage?: (command: string, data?: McpOutboundData) => void;
  private sendMultilineMessage?: (
    command: string,
    keyvals: McpOutboundKeyvals,
    lineKey: string,
    lines: string[],
  ) => void;

  constructor(context: McpPackageContext) {
    this.context = context;
  }

  static with<const Messages extends readonly AnyDirectedProtocolMessage[]>(
    config: McpPackageConfig<Messages>,
  ): new (context: McpPackageContext) => MCPPackage & ProtocolIO<Messages> {
    const RegisteredMCPPackage = class extends MCPPackage {
      public readonly packageName = config.packageName;

      constructor(context: McpPackageContext) {
        super(context);
        createProtocolIO(
          config.messages,
          (wireName, payload) => this.sendRegisteredMessage(wireName, payload),
          this,
        );
      }
    };

    return RegisteredMCPPackage as unknown as new (
      context: McpPackageContext,
    ) => MCPPackage & ProtocolIO<Messages>;
  }

  attachProtocolTransport(
    sendMessage: (command: string, data?: McpOutboundData) => void,
    sendMultilineMessage: (
      command: string,
      keyvals: McpOutboundKeyvals,
      lineKey: string,
      lines: string[],
    ) => void,
  ): void {
    this.sendMessage = sendMessage;
    this.sendMultilineMessage = sendMultilineMessage;
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
    if (!this.sendMessage) {
      throw new Error(`MCP package ${this.packageName} is not registered`);
    }

    const messageName = command.startsWith(this.packageName)
      ? command
      : `${this.packageName}-${command}`;
    this.sendMessage(messageName, data);
  }

  protected emitRegisteredMessage(wireName: string, payload: unknown): boolean {
    const receiver = (this as { receive?: (name: string, data: unknown) => boolean })
      .receive;
    return receiver?.call(this, wireName, payload) ?? false;
  }

  private sendRegisteredMessage(wireName: string, payload: unknown): void {
    if (isMcpMultilineOutboundPayload(payload)) {
      this.sendMultiline(wireName, payload);
      return;
    }

    this.send(wireName, payload as McpOutboundData);
  }

  private sendMultiline(
    command: string,
    payload: McpMultilineOutboundPayload,
  ): void {
    if (!this.sendMultilineMessage) {
      throw new Error(`MCP package ${this.packageName} is not registered`);
    }

    const messageName = command.startsWith(this.packageName)
      ? command
      : `${this.packageName}-${command}`;
    this.sendMultilineMessage(
      messageName,
      payload.keyvals,
      payload.lineKey,
      payload.lines,
    );
  }
}

function isMcpMultilineOutboundPayload(
  payload: unknown,
): payload is McpMultilineOutboundPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'kind' in payload &&
    payload.kind === 'mcp-multiline'
  );
}
