import MudClient from "./client";
import { LRUCache } from "lru-cache";

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

  shutdown() {
    // Do nothing
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
    this.client.emit("statustext", message.keyvals["text"]);
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
  clientId: string;

  constructor(client: MudClient) {
    super(client);
    this.clientId = generateTag();
  }

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

  shutdown() {
    const channel = new BroadcastChannel("editor");
    channel.postMessage({ type: "shutdown" });
  }
}

/**
 * Gets and Sets per-player properties
 * Emits a "getset" event when a property is received
 */
export class McpAwnsGetSet extends MCPPackage {
  public packageName = "dns-com-awns-getset";
  private id: number = 1;
  private cache = new LRUCache<string, string>({ max: 10 });

  public LocalCache: { [key: string]: string } = {};

  handle(message: McpMessage): void {
    switch (message.name) {
      case "dns-com-awns-getset-ack":
        const key = this.cache.get(message.keyvals["id"]);
        if (key === undefined) {
          console.log(`Got ack for unknown id ${message.keyvals["id"]}`);
          break;
        }
        const value = message.keyvals["value"];
        console.log(`Got ${key} = ${value}`);
        this.LocalCache[key] = value;
        this.client.emit("getset", key, value);
        break;

      default:
        break;
    }
  }

  sendGet(property: string) {
    const id = (this.id++).toString();
    this.cache.set(id, property);
    this.client.sendMcp("dns-com-awns-getset-get", {
      id: id,
      property: property,
    });
  }
  sendSet(property: string, value: string) {
    this.client.sendMcp("dns-com-awns-getset-set", {
      id: this.id++,
      property: property,
      value: value,
    });
  }
  sendDrop(property: string) {
    this.client.sendMcp("dns-com-awns-getset-drop", {
      id: this.id++,
      property: property,
    });
  }
}

export interface UserlistPlayer {
  Object: string;
  Name: string;
  Icon: string;

  away: boolean;
  idle: boolean;
}

export class McpVmooUserlist extends MCPPackage {
  public packageName = "dns-com-vmoo-userlist";
  public maxVersion = 1.1;
  public player: string | undefined;
  public fields: any[] = ["Object", "Name", "Icon"];
  public icons: any[] = [
    "Idle",
    "Away",
    "Idle+Away",
    "Friend",
    "Newbie",
    "Inhabitant",
    "Inhabitant+",
    "Schooled",
    "Wizard",
    "Key",
    "Star",
  ];
  public players: UserlistPlayer[] = [];

  handle(message: McpMessage): void {
    switch (message.name) {
      case "dns-com-vmoo-userlist-you":
        this.player = message.keyvals["nr"];
        break;

      default:
        break;
    }
  }

  handleMultiline(message: McpMessage): void {
    if ("fields" in message.keyvals) {
      this.fields = mooListToArray(message.keyvals["fields"].trim());
    }
    if ("icons" in message.keyvals) {
      this.icons = mooListToArray(message.keyvals["icons"].trim());
    }
    if ("d" in message.keyvals) {
      const mode = message.keyvals["d"][0];
      switch (mode) {
        case "=":
          // Full list
          var list = mooListToArray(message.keyvals["d"].slice(1));
          this.players = list.map((p) => {
            // generate an object using this.fields as keys
            return this.playerFromArray(p);
          });
          break;
        case "+":
          // Add player to list
          this.players.push(
            this.playerFromArray(mooListToArray(message.keyvals["d"].slice(1)))
          );
          break;
        case "-":
          // Remove players from list
          const ids = mooListToArray(message.keyvals["d"].slice(1));
          this.players = this.players.filter((p) => !ids.includes(p.Object));
          break;
        case "*":
          // Update a user
          const user = this.playerFromArray(
            mooListToArray(message.keyvals["d"].slice(1))
          );
          const userIndex = this.players.findIndex(
            (p) => p.Object === user.Object
          );
          if (userIndex !== -1) {
            this.players[userIndex] = user;
          } else {
            this.players.push(user);
          }
          break;

        case "<":
          // Mark player as idle
          const idleIndex = this.players.findIndex(
            (p) => p.Object === message.keyvals["d"].slice(1)
          );
          if (idleIndex !== -1) {
            this.players[idleIndex].idle = true;
          }
          break;

        case ">":
          // Mark player as active
          const activeIndex = this.players.findIndex(
            (p) => p.Object === message.keyvals["d"].slice(1)
          );
          if (activeIndex !== -1) {
            this.players[activeIndex].idle = false;
          }
          break;

        case "[":
          // Mark player as away
          const awayIndex = this.players.findIndex(
            (p) => p.Object === message.keyvals["d"].slice(1)
          );
          if (awayIndex !== -1) {
            this.players[awayIndex].away = true;
          }
          break;
        case "]":
          // Mark player as back
          const backIndex = this.players.findIndex(
            (p) => p.Object === message.keyvals["d"].slice(1)
          );
          if (backIndex !== -1) {
            this.players[backIndex].away = false;
          }
          break;
        default:
          console.log(
            `Unknown userlist mode ${mode} in ${message.keyvals["d"]}`
          );
          break;
      }
      this.client.emit("userlist", this.players);
    }
  }

  private playerFromArray(p: string[]): UserlistPlayer {
    const player: any = {};
    p.forEach((v: string, i: number) => {
      player[this.fields[i]] = v;
    });
    return player;
  }
}

function mooListToArray(mooList: string): any[] {
  mooList = mooList.slice(1, -1);

  let result: any[] = [];
  let current: string = "";
  let depth = 0;
  for (let i = 0; i < mooList.length; i++) {
    const c = mooList[i];
    if (c === "{") {
      depth++;
    } else if (c === "}") {
      depth--;
    } else if (c === "," && depth === 0) {
      current = current.trim();
      if (current.startsWith("{") && current.endsWith("}")) {
        result.push(mooListToArray(current));
      } else if (!Number.isNaN(Number(current))) {
        result.push(Number(current));
      } else if (current.startsWith('"') && current.endsWith('"')) {
        result.push(current.slice(1, -1));
      } else {
        result.push(current);
      }
      current = "";
      continue;
    }
    current += c;
  }
  return result;
}
