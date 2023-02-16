interface McpMessage {
  name: string;
  authKey?: string;
  keyvals: { [key: string]: string };
}

export function parseMcpMessage(message: string): McpMessage | null {
  const parts = message.match(/^#\$#(\S+)(?:\s+(\S{6})\s+)?(.*)$/);
  if (!parts) {
    console.log(
      "Invalid message format: message must match the format '#$#name [authKey] keyval*'"
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

export class MCPPackage {
  constructor(public name: string) {}
}
