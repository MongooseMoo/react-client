import {
  identityCodec,
  inbound,
  messageEnvelope,
} from '../../protocol/messages';
import { mooListToArray, type MooListValue } from '../mooList';
import { MCPPackage } from '../package';
import type { McpMessage } from '../types';

export interface UserlistPlayer {
  Object: string;
  Name: string;
  Icon: number;
  away: boolean;
  idle: boolean;
}

const userlist = messageEnvelope('userlist', identityCodec<UserlistPlayer[]>());

const McpVmooUserlistBase = MCPPackage.with({
  packageName: 'dns-com-vmoo-userlist',
  messages: [inbound(userlist)] as const,
});

export class McpVmooUserlist extends McpVmooUserlistBase {
  public maxVersion = 1.1;
  public player: string | undefined;
  public fields: string[] = ['Object', 'Name', 'Icon'];
  public icons: string[] = [
    'Idle',
    'Away',
    'Idle+Away',
    'Friend',
    'Newbie',
    'Inhabitant',
    'Inhabitant+',
    'Schooled',
    'Wizard',
    'Key',
    'Star',
  ];
  public players: UserlistPlayer[] = [];

  handle(message: McpMessage): void {
    switch (message.name) {
      case 'dns-com-vmoo-userlist-you':
        this.player = message.keyvals.nr;
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
      this.applyUserlistDelta(message.keyvals.d);
      this.update();
    }
  }

  private applyUserlistDelta(delta: string): void {
    const mode = delta[0];
    switch (mode) {
      case '=': {
        const list = mooListToArray(delta.slice(1));
        this.players = list.map((player) => this.playerFromArray(asMooListArray(player)));
        break;
      }
      case '+':
        this.players.push(this.playerFromArray(mooListToArray(delta.slice(1))));
        break;
      case '-': {
        const idSet = new Set(mooListToArray(delta.slice(1)).map(String));
        this.players = this.players.filter((player) => !idSet.has(player.Object));
        break;
      }
      case '*':
        this.updatePlayer(this.playerFromArray(mooListToArray(delta.slice(1))));
        break;
      case '<':
        this.markPlayersIdle(mooListToArray(delta.slice(1)), true);
        break;
      case '>':
        this.markPlayersIdle(mooListToArray(delta.slice(1)), false);
        break;
      case '[':
        this.markPlayersAway(mooListToArray(delta.slice(1)), true);
        break;
      case ']':
        this.markPlayersAway(mooListToArray(delta.slice(1)), false);
        break;
      default:
        console.log(`Unknown userlist mode ${mode} in ${delta}`);
        break;
    }
  }

  private markPlayersIdle(ids: MooListValue[], idle: boolean): void {
    const idSet = new Set(ids.map(String));
    this.players = this.players.map((player) =>
      idSet.has(player.Object) ? { ...player, idle } : player,
    );
  }

  private markPlayersAway(ids: MooListValue[], away: boolean): void {
    const idSet = new Set(ids.map(String));
    this.players = this.players.map((player) =>
      idSet.has(player.Object) ? { ...player, away } : player,
    );
  }

  private updatePlayer(user: UserlistPlayer): void {
    const userIndex = this.players.findIndex((player) => player.Object === user.Object);
    if (userIndex !== -1) {
      this.players[userIndex] = user;
    } else {
      this.players.push(user);
    }
  }

  private update(): void {
    this.players.sort((left, right) => sortScore(right) - sortScore(left));
    this.emitRegisteredMessage(userlist.wireName, this.players);

    function sortScore(player: UserlistPlayer): number {
      return player.Icon - (player.idle ? 10 : 0) - (player.away ? 20 : 0);
    }
  }

  private playerFromArray(values: MooListValue[]): UserlistPlayer {
    const player: Partial<UserlistPlayer> = {};
    values.forEach((value, index) => {
      const key = this.fields[index] as keyof UserlistPlayer | undefined;
      if (key) {
        (player as Record<string, unknown>)[key] = value;
      }
    });
    return {
      Object: String(player.Object ?? ''),
      Name: String(player.Name ?? ''),
      Icon: Number(player.Icon ?? 0),
      away: false,
      idle: false,
    };
  }
}

function asMooListArray(value: MooListValue): MooListValue[] {
  return Array.isArray(value) ? value : [value];
}
