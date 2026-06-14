import { identityCodec, inbound, messageEnvelope, outbound } from '../../protocol/messages';
import { MCPPackage } from '../package';
import type { McpMessage } from '../types';

export interface AwnsRehashCommandUpdate {
  list: string;
  commands: string[];
}

const rehashGetcommands = messageEnvelope('getcommands', identityCodec<undefined>());
const rehashCommands = messageEnvelope('commands', identityCodec<AwnsRehashCommandUpdate>());
const rehashAdd = messageEnvelope('add', identityCodec<AwnsRehashCommandUpdate>());
const rehashRemove = messageEnvelope('remove', identityCodec<AwnsRehashCommandUpdate>());

const McpAwnsRehashBase = MCPPackage.with({
  packageName: 'dns-com-awns-rehash',
  messages: [
    outbound(rehashGetcommands),
    inbound(rehashCommands),
    inbound(rehashAdd),
    inbound(rehashRemove),
  ] as const,
});

export class McpAwnsRehash extends McpAwnsRehashBase {
  public commands: string[] = [];

  handle(message: McpMessage): void {
    switch (message.name) {
      case 'dns-com-awns-rehash-commands': {
        const update = commandUpdateFrom(message.keyvals.list ?? '');
        this.commands = [...update.commands];
        this.emitRegisteredMessage(rehashCommands.wireName, update);
        break;
      }

      case 'dns-com-awns-rehash-add': {
        const update = commandUpdateFrom(message.keyvals.list ?? '');
        const known = new Set(this.commands);
        for (const command of update.commands) {
          if (!known.has(command)) {
            this.commands.push(command);
            known.add(command);
          }
        }
        this.emitRegisteredMessage(rehashAdd.wireName, update);
        break;
      }

      case 'dns-com-awns-rehash-remove': {
        const update = commandUpdateFrom(message.keyvals.list ?? '');
        const removed = new Set(update.commands);
        this.commands = this.commands.filter((command) => !removed.has(command));
        this.emitRegisteredMessage(rehashRemove.wireName, update);
        break;
      }

      default:
        break;
    }
  }

  requestCommands(): void {
    this.sendGetcommands(undefined);
  }
}

function commandUpdateFrom(list: string): AwnsRehashCommandUpdate {
  return {
    list,
    commands: list.trim().split(/\s+/).filter(Boolean).flatMap(expandCommand),
  };
}

function expandCommand(command: string): string[] {
  const marker = command.indexOf('*');
  if (marker === -1) {
    return [command];
  }

  const expanded = command.slice(0, marker) + command.slice(marker + 1);
  const commands: string[] = [];
  for (let length = marker; length <= expanded.length; length += 1) {
    commands.push(expanded.slice(0, length));
  }
  return commands;
}
