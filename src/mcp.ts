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

  send(command: string, data?: any) {
    if (!command.startsWith(this.packageName))
      command = this.packageName + '-' + command;
    this.client.sendMcp(command, data);
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
  Icon: number;

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
          var ids = mooListToArray(message.keyvals["d"].slice(1));
          this.players = this.players.filter((p) => !ids.includes(p.Object));
          break;
        case "*":
          // Update a user
          const user = this.playerFromArray(
            mooListToArray(message.keyvals["d"].slice(1))
          );
          this.updatePlayer(user);
          break;

        case "<":
          // Mark players as idle
          ids = mooListToArray(message.keyvals["d"].slice(1));
          this.players.forEach((p, i) => {
            if (ids.includes(p.Object)) {
              p.idle = true;
              this.players[i] = p;
            }
          });
          break;

        case ">":
          // Mark player as active
          ids = mooListToArray(message.keyvals["d"].slice(1));
          this.players.forEach((p, i) => {
            if (ids.includes(p.Object)) {
              p.idle = false;
              this.players[i] = p;
            }
          });
          break;

        case "[":
          // Mark player as away
          ids = mooListToArray(message.keyvals["d"].slice(1));
          this.players.forEach((p, i) => {
            if (ids.includes(p.Object)) {
              p.away = true;
              this.players[i] = p;
            }
          });
          break;
        case "]":
          // Mark player as back
          ids = mooListToArray(message.keyvals["d"].slice(1));
          this.players.forEach((p, i) => {
            if (ids.includes(p.Object)) {
              p.away = false;
              this.players[i] = p;
            }
          });

          break;
        default:
          console.log(
            `Unknown userlist mode ${mode} in ${message.keyvals["d"]}`
          );
          break;
      }
      this.update();
    }
  }

  private updatePlayer(user: UserlistPlayer) {
    const userIndex = this.players.findIndex(
      (p) => p.Object === user.Object
    );
    if (userIndex !== -1) {
      this.players[userIndex] = user;
    } else {
      this.players.push(user);
    }
  }

  private update() {

    this.players.sort((a, b) => sortScore(b) - sortScore(a));
    this.client.emit("userlist", this.players);

    function sortScore(b: UserlistPlayer) {
      return b.Icon - (b.idle ? 10 : 0) - (b.away ? 20 : 0);
    }
  }

  private playerFromArray(p: string[]): UserlistPlayer {
    const player: any = {};
    p.forEach((v: string, i: number) => {
      player[this.fields[i]] = v;
    });
    player['away'] = false;
    player['idle'] = false;
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
      commit();
      current = "";
      continue;
    }
    current += c;
  }
  if (current.length > 0) {
    commit();
  }
  return result;

  function commit() {
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
  }
}

export class McpAwnsPing extends MCPPackage{
  public packageName = "dns-com-awns-ping";
  private id: number = 1;
  handle(message: McpMessage): void {
      switch (message.name) {
        case "dns-com-awns-ping":
          this.send('reply', message.keyvals)

          break;
        case "dns-com-awns-ping-reply":
          // Client-to-server not implemented yet.
          break;
        default:
          break;
      }
  }
  ping() {
    this.send("dns-com-awns-ping", {id: this.id++})
  }
}
