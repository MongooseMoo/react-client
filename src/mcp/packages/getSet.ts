import { LRUCache } from 'lru-cache';
import { MCPPackage } from '../package';
import type { McpMessage } from '../types';

export class McpAwnsGetSet extends MCPPackage {
  public packageName = 'dns-com-awns-getset';
  private id = 1;
  private cache = new LRUCache<string, string>({ max: 10 });

  public LocalCache: Record<string, string> = {};

  handle(message: McpMessage): void {
    switch (message.name) {
      case 'dns-com-awns-getset-ack': {
        const key = this.cache.get(message.keyvals.id);
        if (key === undefined) {
          console.log(`Got ack for unknown id ${message.keyvals.id}`);
          break;
        }
        const value = message.keyvals.value;
        console.log(`Got ${key} = ${value}`);
        this.LocalCache[key] = value;
        this.context.emit('getset', key, value);
        break;
      }

      default:
        break;
    }
  }

  sendGet(property: string): void {
    const id = (this.id++).toString();
    this.cache.set(id, property);
    this.send('get', {
      id,
      property,
    });
  }

  sendSet(property: string, value: string): void {
    this.send('set', {
      id: this.id++,
      property,
      value,
    });
  }

  sendDrop(property: string): void {
    this.send('drop', {
      id: this.id++,
      property,
    });
  }
}
