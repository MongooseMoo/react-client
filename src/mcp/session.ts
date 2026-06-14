import {
  encodeMcpMessage,
  encodeMcpMultilineClose,
  encodeMcpMultilineLine,
  parseMcpLine,
} from "./codec";
import type { MCPPackage } from "./package";
import type { MCPKeyvals, McpMessage, McpOutboundData, McpOutboundKeyvals } from "./types";

export interface McpSessionHost {
  sendLine(line: string): void;
}

export class McpSession {
  private authKey: string | null = null;
  private readonly handlers: Record<string, MCPPackage> = {};
  private readonly multilines: Record<string, MCPPackage> = {};

  constructor(
    private readonly host: McpSessionHost,
    private readonly tagGenerator: () => string = generateTag,
  ) {}

  get packageHandlers(): Record<string, MCPPackage> {
    return this.handlers;
  }

  get multilineHandlers(): Record<string, MCPPackage> {
    return this.multilines;
  }

  registerPackage<P extends MCPPackage>(PackageConstructor: new () => P): P {
    const mcpPackage = new PackageConstructor();
    mcpPackage.attachProtocolTransport(
      (command, data) => this.sendMessage(command, data),
      (command, keyvals, lineKey, lines) =>
        this.sendMultiline(command, keyvals, lineKey, lines),
    );
    this.handlers[mcpPackage.packageName] = mcpPackage;
    return mcpPackage;
  }

  receiveLine(line: string): void {
    const parsed = parseMcpLine(line);

    switch (parsed.type) {
      case "invalid":
        console.warn(parsed.error);
        return;
      case "multiline-continuation":
        this.receiveMultilineContinuation(
          parsed.continuation.tag,
          parsed.continuation.keyvals,
        );
        return;
      case "multiline-close":
        this.receiveMultilineClose(parsed.closure.tag);
        return;
      case "message":
        this.receiveMessage(parsed.message);
        return;
    }
  }

  sendMessage(command: string, data?: McpOutboundData): void {
    this.host.sendLine(encodeMcpMessage(command, this.authKey, data));
  }

  sendMessageWithoutAuth(command: string, data?: McpOutboundData): void {
    this.host.sendLine(encodeMcpMessage(command, null, data));
  }

  sendMultilineLine(tag: string, key: string, value: string): void {
    this.host.sendLine(encodeMcpMultilineLine(tag, key, value));
  }

  closeMultiline(tag: string): void {
    this.host.sendLine(encodeMcpMultilineClose(tag));
  }

  sendMultiline(
    messageName: string,
    keyvals: McpOutboundKeyvals,
    lineKey: string,
    lines: string[],
  ): void {
    const multilineTag = this.tagGenerator();
    this.sendMessage(messageName, {
      ...keyvals,
      "_data-tag": multilineTag,
    });
    for (const line of lines) {
      this.sendMultilineLine(multilineTag, lineKey, line);
    }
    this.closeMultiline(multilineTag);
  }

  reset(): void {
    this.authKey = null;
    for (const tag of Object.keys(this.multilines)) {
      delete this.multilines[tag];
    }
  }

  shutdown(): void {
    for (const handler of Object.values(this.handlers)) {
      handler.shutdown();
    }
  }

  private receiveMessage(message: McpMessage): void {
    if (
      message.name.toLowerCase() === "mcp" &&
      message.authKey == null &&
      this.authKey == null
    ) {
      this.authKey = this.tagGenerator();
      this.sendMessageWithoutAuth("mcp", {
        "authentication-key": this.authKey,
        version: "2.1",
        to: "2.1",
      });
      for (const supportedPackage of this.supportedPackages()) {
        this.sendMessage("mcp-negotiate-can", supportedPackage);
      }
      this.sendMessage("mcp-negotiate-end");
      return;
    }

    if (message.authKey !== this.authKey) {
      console.log(
        `Unexpected authkey "${message.authKey}", probably a spoofed message.`,
      );
      return;
    }

    const handler = this.findHandler(message.name);
    if (!handler) {
      console.log(`No handler for ${message.name}`);
      return;
    }

    handler.handle(message);
    const multilineTag = message.keyvals["_data-tag"];
    if (multilineTag) {
      this.multilines[multilineTag] = handler;
    }
  }

  private receiveMultilineContinuation(tag: string, keyvals: MCPKeyvals): void {
    const handler = this.multilines[tag];
    if (!handler) {
      console.warn("Received continuation for unknown multiline", {
        tag,
        keyvals,
      });
      return;
    }
    handler.handleMultiline({ name: tag, keyvals });
  }

  private receiveMultilineClose(tag: string): void {
    const handler = this.multilines[tag];
    if (!handler) {
      console.warn("Received close for unknown multiline", { tag });
      return;
    }

    handler.closeMultiline({ name: tag, keyvals: {} });
    delete this.multilines[tag];
  }

  private findHandler(messageName: string): MCPPackage | undefined {
    let name = messageName;
    while (name) {
      const handler = this.handlers[name];
      if (handler) {
        return handler;
      }
      name = name.substring(0, name.lastIndexOf("-"));
    }
    return undefined;
  }

  private supportedPackages(): Array<
    Record<"package" | "min-version" | "max-version", string>
  > {
    return Object.values(this.handlers).map((handler) => ({
      package: handler.packageName,
      "min-version": (handler.minVersion ?? 1.0).toFixed(1),
      "max-version": (handler.maxVersion ?? 1.0).toFixed(1),
    }));
  }
}

export function generateTag(): string {
  return (Math.random() + 1).toString(36).substring(3, 9);
}
