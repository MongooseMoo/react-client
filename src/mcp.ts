import MudClient from "./client";

interface McpMessage {
  name: string;
  authKey?: string;
  keyvals: { [key: string]: string };
}

export function parseMcpMessage(message: string): McpMessage | null {
  const parts = message.match(/^#\$#(\S+)(?:\s+(\S{6})\s+)?(.*)$/);
  if (!parts) {
    console.log(
      "Invalid message format: message must match the format '#$#name [authKey] keyval*'\nGot `" +
        message +
        "`"
    );
    return null;
  }

  const name = parts[1];
  const authKey = parts[2];
  const keyvals: { [key: string]: string } = {};

  const keyvalRegex = /(\S+)\s*:\s*"([^"]*)"|(\S+)\s*:\s*(\S+)/g;
  let match;
  while ((match = keyvalRegex.exec(parts[3]))) {
    const key = match[1] || match[3];
    const value = match[2] || match[4];
    if (key in keyvals) {
      console.log(`Invalid message format: duplicate key ${key} detected`);
    } else {
      keyvals[key] = value;
    }
  }

  return { name, authKey, keyvals };
}

export function parseMcpMultiline(message: string): McpMessage | null {
  const parts = message.match(
    /^#\$#\*\s(\S+)\s(\S+)\s*:\s*(.+)$|^#\$#:\s(\S+)$/
  );
  if (!parts) {
    console.log(
      "Invalid message format: message must match the format '#$#* datatag keyval'\nGot `" +
        message +
        "`"
    );
    return null;
  }

  const name = parts[1] || parts[4];
  const authKey = undefined;
  const key = parts[2];
  const val = parts[3];
  const keyvals: { [key: string]: string } = {};
  keyvals[key] = val;
  return { name, authKey, keyvals };
}

export function generateTag(): string {
  return (Math.random() + 1).toString(36).substring(3, 9);
}

export class MCPPackage {
  public readonly packageName!: string;
  public readonly minVersion?: number = 1.0;
  public readonly maxVersion?: number = 1.0;
  public readonly packageVersion?: number = 0.0;
  protected readonly client: MudClient;

  constructor(client: MudClient) {
    this.client = client;
  }

  handle(message: McpMessage): void {
    throw new Error("Method not implemented.");
  }
  handleMultiline(message: McpMessage): void {
    throw new Error("Method not implemented.");
  }
  closeMultiline(closure: McpMessage) {
    throw new Error("Method not implemented.");
  }
}

export class McpNegotiate extends MCPPackage {
  handle(message: McpMessage): void {
    switch (message.name) {
      case "mcp-negotiate-can":
        break;

      default:
        break;
    }
  }
  public packageName = "mcp-negotiate";
  public minVersion = 2.0;
  public maxVersion = 2.0;

  sendNegotiate(): void {
    for (const p of Object.values(this.client.mcpHandlers)) {
      let minVersion = p.minVersion?.toFixed(1);
      let maxVersion = p.maxVersion?.toFixed(1);
      this.client.sendMcp("mcp-negotiate-can", {
        package: p.packageName,
        "min-version": minVersion,
        "max-version": maxVersion,
      });
    }
    this.client.sendCommand("#$#$mcp-negotiate-end");
  }
}

export class McpAwnsStatus extends MCPPackage {
  public packageName = "dns-com-awns-status";

  handle(message: McpMessage): void {
    // this package only defines one message, so don't bother checking the messagename
    console.log(message);
    this.client.statusText = message.keyvals["text"];
  }
}

export interface EditorSession {
  name: string;
  reference: string;
  type: string; // One of string, string-list, or moo-code. Only the latter gets syntax highlighting
  contents: string[];
}

export class McpSimpleEdit extends MCPPackage {
  public packageName = "dns-org-mud-moo-simpleedit";

  public sessions: { [key: string]: EditorSession } = {};

  handle(message: McpMessage): void {
    if (message.name === "dns-org-mud-moo-simpleedit-content") {
      let name = message.keyvals["name"];
      let reference = message.keyvals["reference"];
      let type = message.keyvals["type"];
      let contents: string[] = [];
      this.sessions[message.keyvals["_data-tag"]] = {
        name,
        reference,
        type,
        contents,
      };
    }
  }

  handleMultiline(message: McpMessage): void {
    if ("content" in message.keyvals)
      this.sessions[message.name].contents.push(message.keyvals["content"]);
    else console.log(`Unexpected simpleedit ML ${message}`);
  }
  closeMultiline(closure: McpMessage): void {
    this.client.openEditorWindow(this.sessions[closure.name]);
  }
}
