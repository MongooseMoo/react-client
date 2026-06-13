import { LRUCache } from 'lru-cache';
import {
  identityCodec,
  inbound,
  messageEnvelope,
  outbound,
} from '../../protocol/messages';
import { MCPPackage } from '../package';
import type { McpMessage } from '../types';

interface GetSetAck {
  key: string;
  value: string;
}

interface GetSetGetRequest {
  id: string;
  property: string;
}

interface GetSetSetRequest extends GetSetGetRequest {
  value: string;
}

const getSetAck = messageEnvelope('ack', identityCodec<GetSetAck>());
const getSetGet = messageEnvelope('get', identityCodec<GetSetGetRequest>());
const getSetSet = messageEnvelope('set', identityCodec<GetSetSetRequest>());
const getSetDrop = messageEnvelope('drop', identityCodec<GetSetGetRequest>());

const McpAwnsGetSetBase = MCPPackage.with({
  packageName: 'dns-com-awns-getset',
  messages: [
    inbound(getSetAck).asEvent('getset'),
    outbound(getSetGet),
    outbound(getSetSet),
    outbound(getSetDrop),
  ] as const,
});

export class McpAwnsGetSet extends McpAwnsGetSetBase {
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
        this.emitRegisteredMessage(getSetAck.wireName, { key, value });
        break;
      }

      default:
        break;
    }
  }

  requestGet(property: string): void {
    const id = (this.id++).toString();
    this.cache.set(id, property);
    this.sendGet({
      id,
      property,
    });
  }

  setProperty(property: string, value: string): void {
    this.sendSet({
      id: (this.id++).toString(),
      property,
      value,
    });
  }

  dropProperty(property: string): void {
    this.sendDrop({
      id: (this.id++).toString(),
      property,
    });
  }
}
