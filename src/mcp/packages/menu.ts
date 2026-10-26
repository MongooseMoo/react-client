import { useMenuStore } from '../../stores/menuStore';
import { MCPPackage } from '../package';
import type { McpMessage } from '../types';

/** One line of a server menu. An empty response marks text, not a choice. */
export interface WorldMongooseMenuItem {
  label: string;
  response: string;
}

export interface WorldMongooseMenu {
  prompt: string;
  items: WorldMongooseMenuItem[];
}

interface PendingMenu {
  prompt: string;
  options: string[];
  responses: string[];
}

const McpWorldMongooseMenuBase = MCPPackage.with({
  packageName: 'world.mongoose.menu',
  messages: [] as const,
});

/**
 * world.mongoose.menu: the MOO's $command_utils:menu offered as a list.
 * `options*` and `responses*` are parallel multiline values; the player's
 * choice goes back as an ordinary input line, the same thing they would type.
 */
export class McpWorldMongooseMenu extends McpWorldMongooseMenuBase {
  private pendingByTag = new Map<string, PendingMenu>();

  handle(message: McpMessage): void {
    const dataTag = message.keyvals['_data-tag'];
    if (message.name !== 'world.mongoose.menu' || !dataTag) {
      console.log(`Unexpected menu message ${message.name}`);
      return;
    }
    this.pendingByTag.set(dataTag, {
      prompt: message.keyvals.prompt ?? '',
      options: [],
      responses: [],
    });
  }

  handleMultiline(message: McpMessage): void {
    const pending = this.pendingByTag.get(message.name);
    if (!pending) {
      console.log(`Unexpected menu ML ${message.name}`);
      return;
    }
    if ('options' in message.keyvals) pending.options.push(message.keyvals.options);
    if ('responses' in message.keyvals) pending.responses.push(message.keyvals.responses);
  }

  closeMultiline(closure: McpMessage): void {
    const pending = this.pendingByTag.get(closure.name);
    if (!pending) return;
    this.pendingByTag.delete(closure.name);
    useMenuStore.getState().show({
      prompt: pending.prompt,
      items: pending.options.map((label, index) => ({
        label,
        response: pending.responses[index] ?? '',
      })),
    });
  }

  override reset(): void {
    this.pendingByTag.clear();
    useMenuStore.getState().clear();
  }
}
