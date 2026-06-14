import { identityCodec, inbound, messageEnvelope, outbound } from '../../protocol/messages';
import { MCPPackage } from '../package';
import type { McpMessage } from '../types';

export interface AwnsVisualLocation {
  id: string;
}

export interface AwnsVisualTopologyRequest {
  location: string;
  distance: string | number;
}

export interface AwnsVisualUser {
  id: string;
  name: string;
  location: string;
  idle: string;
}

export interface AwnsVisualTopologyRoom {
  id: string;
  name: string;
  exit: string;
  idle?: string;
}

type PendingVisualMessage =
  | {
      kind: 'users';
      id: string[];
      name: string[];
      location: string[];
      idle: string[];
    }
  | {
      kind: 'topology';
      id: string[];
      name: string[];
      exit: string[];
      idle: string[];
    };

const visualGetusers = messageEnvelope('getusers', identityCodec<undefined>());
const visualGetlocation = messageEnvelope('getlocation', identityCodec<undefined>());
const visualGettopology = messageEnvelope(
  'gettopology',
  identityCodec<AwnsVisualTopologyRequest>(),
);
const visualGetself = messageEnvelope('getself', identityCodec<undefined>());
const visualLocation = messageEnvelope('location', identityCodec<AwnsVisualLocation>());
const visualUsers = messageEnvelope('users', identityCodec<AwnsVisualUser[]>());
const visualTopology = messageEnvelope('topology', identityCodec<AwnsVisualTopologyRoom[]>());
const visualSelf = messageEnvelope('self', identityCodec<AwnsVisualLocation>());

const McpAwnsVisualBase = MCPPackage.with({
  packageName: 'dns-com-awns-visual',
  messages: [
    outbound(visualGetusers),
    outbound(visualGetlocation),
    outbound(visualGettopology),
    outbound(visualGetself),
    inbound(visualLocation),
    inbound(visualUsers),
    inbound(visualTopology),
    inbound(visualSelf),
  ] as const,
});

export class McpAwnsVisual extends McpAwnsVisualBase {
  public location: string | undefined;
  public self: string | undefined;
  public users: AwnsVisualUser[] = [];
  public topology: AwnsVisualTopologyRoom[] = [];
  private pendingMessages = new Map<string, PendingVisualMessage>();

  handle(message: McpMessage): void {
    switch (message.name) {
      case 'dns-com-awns-visual-location': {
        const payload = { id: message.keyvals.id ?? '' };
        this.location = payload.id;
        this.emitRegisteredMessage(visualLocation.wireName, payload);
        break;
      }

      case 'dns-com-awns-visual-self': {
        const payload = { id: message.keyvals.id ?? '' };
        this.self = payload.id;
        this.emitRegisteredMessage(visualSelf.wireName, payload);
        break;
      }

      case 'dns-com-awns-visual-users':
        this.beginUsers(message);
        break;

      case 'dns-com-awns-visual-topology':
        this.beginTopology(message);
        break;

      default:
        break;
    }
  }

  handleMultiline(message: McpMessage): void {
    const pending = this.pendingMessages.get(message.name);
    if (!pending) {
      console.log(`Unexpected visual ML ${message.name}`);
      return;
    }

    if ('id' in message.keyvals) {
      pending.id.push(message.keyvals.id);
    }
    if ('name' in message.keyvals) {
      pending.name.push(message.keyvals.name);
    }

    if (pending.kind === 'users') {
      if ('location' in message.keyvals) {
        pending.location.push(message.keyvals.location);
      }
      if ('idle' in message.keyvals) {
        pending.idle.push(message.keyvals.idle);
      }
      return;
    }

    if ('exit' in message.keyvals) {
      pending.exit.push(message.keyvals.exit);
    }
    if ('idle' in message.keyvals) {
      pending.idle.push(message.keyvals.idle);
    }
  }

  closeMultiline(closure: McpMessage): void {
    const pending = this.pendingMessages.get(closure.name);
    if (!pending) {
      return;
    }

    if (pending.kind === 'users') {
      const count = Math.max(
        pending.id.length,
        pending.name.length,
        pending.location.length,
        pending.idle.length,
      );
      this.users = [];
      for (let index = 0; index < count; index += 1) {
        this.users.push({
          id: pending.id[index] ?? '',
          name: pending.name[index] ?? '',
          location: pending.location[index] ?? '',
          idle: pending.idle[index] ?? '',
        });
      }
      this.emitRegisteredMessage(visualUsers.wireName, this.users);
      this.pendingMessages.delete(closure.name);
      return;
    }

    const count = Math.max(
      pending.id.length,
      pending.name.length,
      pending.exit.length,
      pending.idle.length,
    );
    this.topology = [];
    for (let index = 0; index < count; index += 1) {
      const room: AwnsVisualTopologyRoom = {
        id: pending.id[index] ?? '',
        name: pending.name[index] ?? '',
        exit: pending.exit[index] ?? '',
      };
      if (pending.idle[index] !== undefined) {
        room.idle = pending.idle[index];
      }
      this.topology.push(room);
    }
    this.emitRegisteredMessage(visualTopology.wireName, this.topology);
    this.pendingMessages.delete(closure.name);
  }

  requestUsers(): void {
    this.sendGetusers(undefined);
  }

  requestLocation(): void {
    this.sendGetlocation(undefined);
  }

  requestTopology(location: string, distance: string | number): void {
    this.sendGettopology({ location, distance });
  }

  requestSelf(): void {
    this.sendGetself(undefined);
  }

  private beginUsers(message: McpMessage): void {
    const tag = message.keyvals['_data-tag'];
    if (!tag) {
      console.log('Ignoring visual users without _data-tag');
      return;
    }

    this.pendingMessages.set(tag, {
      kind: 'users',
      id: [],
      name: [],
      location: [],
      idle: [],
    });
  }

  private beginTopology(message: McpMessage): void {
    const tag = message.keyvals['_data-tag'];
    if (!tag) {
      console.log('Ignoring visual topology without _data-tag');
      return;
    }

    this.pendingMessages.set(tag, {
      kind: 'topology',
      id: [],
      name: [],
      exit: [],
      idle: [],
    });
  }
}
