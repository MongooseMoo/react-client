import {
  identityCodec,
  inbound,
  messageEnvelope,
} from '../../protocol/messages';
import { type UserlistMenuItem, useUserlistStore } from '../../stores/userlistStore';
import { mooListToArray, type MooListValue } from '../mooList';
import { MCPPackage } from '../package';
import type { McpMessage } from '../types';

/** One connected player, as the server's who list describes them. */
export interface UserlistPlayer {
  /** Object number, e.g. "#249". */
  id: string;
  name: string;
  /** The server's label for the player's icon, e.g. "Wizard"; empty when it sent none. */
  role: string;
  /** The server's icon number; higher ranks first among equals. */
  rank: number;
  idle: boolean;
  away: boolean;
  /** When the player last typed a command, in this browser's clock (ms); null when unknown. */
  lastActive: number | null;
  /** When the player connected, in ms since the epoch; null when unknown. */
  connectedAt: number | null;
}

const DEFAULT_FIELDS = ['Object', 'Name', 'Icon'];

const userlist = messageEnvelope('userlist', identityCodec<UserlistPlayer[]>());

const McpVmooUserlistBase = MCPPackage.with({
  packageName: 'dns-com-vmoo-userlist',
  messages: [inbound(userlist)] as const,
});

/**
 * dns-com-vmoo-userlist: the server sends the whole list once (`=`), then one
 * change per line: `+` connected, `-` left, `*` changed, `<`/`>` idle and back,
 * `[`/`]` away and back, `(`/`)` cloaked and visible.
 */
export class McpVmooUserlist extends McpVmooUserlistBase {
  public maxVersion = 1.1;
  private fields: string[] = [...DEFAULT_FIELDS];
  private icons: string[] = [];
  private players = new Map<string, UserlistPlayer>();

  handle(message: McpMessage): void {
    switch (message.name) {
      case 'dns-com-vmoo-userlist-you':
        useUserlistStore.getState().setYou(message.keyvals.nr ?? null);
        break;
      case 'dns-com-vmoo-userlist-menu':
        useUserlistStore.getState().setMenu(parseMenu(message.keyvals.menu ?? '{}'));
        break;
      default:
        break;
    }
  }

  handleMultiline(message: McpMessage): void {
    if ('fields' in message.keyvals) {
      this.fields = mooListToArray(message.keyvals.fields.trim()).map(String);
    }
    if ('icons' in message.keyvals) {
      this.icons = mooListToArray(message.keyvals.icons.trim()).map(String);
    }
    if ('d' in message.keyvals) {
      this.applyDelta(message.keyvals.d.trim());
      this.publish();
    }
  }

  private applyDelta(delta: string): void {
    const mode = delta[0];
    const values = mooListToArray(delta.slice(1));
    const ids = () => new Set(values.map(String));
    switch (mode) {
      case '=':
        this.players = new Map();
        for (const entry of values) {
          const player = this.playerFrom(asList(entry));
          this.players.set(player.id, player);
        }
        break;
      case '+': {
        const player = this.playerFrom(values);
        this.players.set(player.id, player);
        break;
      }
      case '*': {
        const player = this.playerFrom(values);
        const known = this.players.get(player.id);
        this.players.set(player.id, known ? { ...player, idle: known.idle, away: known.away } : player);
        break;
      }
      case '-':
      case '(':
        for (const id of ids()) this.players.delete(id);
        break;
      case ')':
        // The server sends the player with + before this.
        break;
      case '<':
        this.mark(ids(), (player) => ({ ...player, idle: true }));
        break;
      case '>':
        this.mark(ids(), (player) => ({ ...player, idle: false, lastActive: Date.now() }));
        break;
      case '[':
        this.mark(ids(), (player) => ({ ...player, away: true }));
        break;
      case ']':
        this.mark(ids(), (player) => ({ ...player, away: false }));
        break;
      default:
        console.warn(`Unknown userlist change ${mode} in ${delta}`);
        break;
    }
  }

  private mark(ids: Set<string>, change: (player: UserlistPlayer) => UserlistPlayer): void {
    for (const id of ids) {
      const player = this.players.get(id);
      if (player) this.players.set(id, change(player));
    }
  }

  private publish(): void {
    const players = [...this.players.values()];
    useUserlistStore.getState().setPlayers(players);
    this.emitRegisteredMessage(userlist.wireName, players);
  }

  override reset(): void {
    this.fields = [...DEFAULT_FIELDS];
    this.icons = [];
    this.players = new Map();
    useUserlistStore.getState().reset();
  }

  private playerFrom(values: MooListValue[]): UserlistPlayer {
    const field = (name: string) => values[this.fields.indexOf(name)];
    const rank = Number(field('Icon') ?? 0);
    const idleSeconds = field('Idle');
    return {
      id: String(field('Object') ?? ''),
      name: String(field('Name') ?? ''),
      role: this.icons[rank - 1] ?? '',
      rank,
      idle: false,
      away: false,
      lastActive: typeof idleSeconds === 'number' ? Date.now() - idleSeconds * 1000 : null,
      connectedAt: epochMs(field('LastConnectTime')),
    };
  }
}

/** Seconds since the epoch to ms; null for missing values and placeholders in the future. */
function epochMs(value: MooListValue | undefined): number | null {
  if (typeof value !== 'number' || value <= 0) return null;
  const ms = value * 1000;
  return ms > Date.now() + 60_000 ? null : ms;
}

function asList(value: MooListValue): MooListValue[] {
  return Array.isArray(value) ? value : [value];
}

/** The server's menu: {label, command} pairs with 0 as a separator; & marks a shortcut letter. */
function parseMenu(text: string): UserlistMenuItem[] {
  const items: UserlistMenuItem[] = [];
  for (const entry of mooListToArray(text)) {
    if (Array.isArray(entry) && entry.length >= 2) {
      items.push({ label: String(entry[0]).replace(/&(.)/g, '$1'), command: String(entry[1]) });
    }
  }
  return items;
}
