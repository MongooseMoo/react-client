export type ProtocolDirection = 'inbound' | 'outbound' | 'duplex';

export interface ProtocolCodec<Payload> {
  encode(payload: Payload): unknown;
  decode(payload: unknown): Payload;
}

export interface ProtocolMessageEnvelope<Name extends string, Payload> {
  readonly wireName: Name;
  readonly codec: ProtocolCodec<Payload>;
}

export interface DirectedProtocolMessage<
  Name extends string,
  Payload,
  Direction extends ProtocolDirection,
  EventName extends string | undefined = undefined,
> extends ProtocolMessageEnvelope<Name, Payload> {
  readonly direction: Direction;
  readonly eventName?: EventName;
  asEvent<Alias extends string>(
    eventName: Alias,
  ): DirectedProtocolMessage<Name, Payload, Direction, Alias>;
}

export type AnyDirectedProtocolMessage = DirectedProtocolMessage<
  string,
  unknown,
  ProtocolDirection,
  string | undefined
>;

type MessagePayload<Message> =
  Message extends ProtocolMessageEnvelope<string, infer Payload> ? Payload : never;

type CamelFromSnake<Name extends string> =
  Name extends `${infer Head}_${infer Tail}`
    ? `${Lowercase<Head>}${Capitalize<CamelFromSnake<Tail>>}`
    : Lowercase<Name>;

type DefaultEventName<Name extends string> =
  Name extends `${string}_${string}` ? CamelFromSnake<Name> : Uncapitalize<Name>;

type SendMethodName<Name extends string> =
  `send${Capitalize<DefaultEventName<Name>>}`;

type ExplicitEventName<Message> =
  Message extends { readonly eventName?: infer EventName }
    ? EventName extends string
      ? EventName
      : never
    : never;

type EventNameForMessage<Message> =
  ExplicitEventName<Message> extends never
    ? Message extends { readonly wireName: infer Name extends string }
      ? DefaultEventName<Name>
      : never
    : ExplicitEventName<Message>;

type InboundMessage<Message> =
  Message extends DirectedProtocolMessage<
    string,
    unknown,
    infer Direction,
    string | undefined
  >
    ? Direction extends 'inbound' | 'duplex'
      ? Message
      : never
    : never;

type OutboundMessage<Message> =
  Message extends DirectedProtocolMessage<
    string,
    unknown,
    infer Direction,
    string | undefined
  >
    ? Direction extends 'outbound' | 'duplex'
      ? Message
      : never
    : never;

type EventPayloads<Messages extends readonly AnyDirectedProtocolMessage[]> = {
  [Message in InboundMessage<Messages[number]> as EventNameForMessage<Message>]: MessagePayload<Message>;
};

type SendMethods<Messages extends readonly AnyDirectedProtocolMessage[]> = {
  [Message in OutboundMessage<Messages[number]> as Message extends {
    readonly wireName: infer Name extends string;
  }
    ? SendMethodName<Name>
    : never]: (payload: MessagePayload<Message>) => void;
};

export type ProtocolIO<Messages extends readonly AnyDirectedProtocolMessage[]> =
  SendMethods<Messages> & {
    on<EventName extends keyof EventPayloads<Messages> & string>(
      eventName: EventName,
      listener: (payload: EventPayloads<Messages>[EventName]) => void,
    ): () => void;
    receive(wireName: string, payload: unknown): boolean;
  };

type ProtocolListener = (payload: unknown) => void;
type ProtocolTarget = Record<string, unknown>;

export function identityCodec<Payload>(): ProtocolCodec<Payload> {
  return {
    encode(payload) {
      return payload;
    },
    decode(payload) {
      return payload as Payload;
    },
  };
}

export function messageEnvelope<Name extends string, Payload>(
  wireName: Name,
  codec: ProtocolCodec<Payload>,
): ProtocolMessageEnvelope<Name, Payload> {
  return { wireName, codec };
}

export function inbound<Name extends string, Payload>(
  envelope: ProtocolMessageEnvelope<Name, Payload>,
): DirectedProtocolMessage<Name, Payload, 'inbound'> {
  return directedMessage(envelope, 'inbound');
}

export function outbound<Name extends string, Payload>(
  envelope: ProtocolMessageEnvelope<Name, Payload>,
): DirectedProtocolMessage<Name, Payload, 'outbound'> {
  return directedMessage(envelope, 'outbound');
}

export function duplex<Name extends string, Payload>(
  envelope: ProtocolMessageEnvelope<Name, Payload>,
): DirectedProtocolMessage<Name, Payload, 'duplex'> {
  return directedMessage(envelope, 'duplex');
}

export function defaultEventName(wireName: string): string {
  if (wireName.includes('_')) {
    const [head = '', ...tail] = wireName.toLowerCase().split('_');
    return `${head}${tail.map(capitalize).join('')}`;
  }

  return `${wireName.charAt(0).toLowerCase()}${wireName.slice(1)}`;
}

export function sendMethodName(wireName: string): string {
  return `send${capitalize(defaultEventName(wireName))}`;
}

export function createProtocolIO<
  const Messages extends readonly AnyDirectedProtocolMessage[],
>(
  messages: Messages,
  send: (wireName: string, payload: unknown) => void,
  target: object = {},
): ProtocolIO<Messages> {
  const protocolTarget = target as ProtocolTarget;
  const inboundMessages = new Map<string, AnyDirectedProtocolMessage>();
  const listeners = new Map<string, Set<ProtocolListener>>();
  const wireNames = new Set<string>();
  const eventNames = new Set<string>();
  const sendMethods = new Set<string>();

  for (const message of messages) {
    if (wireNames.has(message.wireName)) {
      throw new Error(`Duplicate protocol wire name: ${message.wireName}`);
    }
    wireNames.add(message.wireName);

    if (receivesMessage(message)) {
      const eventName = eventNameFor(message);
      if (eventNames.has(eventName)) {
        throw new Error(`Duplicate protocol event name: ${eventName}`);
      }
      eventNames.add(eventName);
      inboundMessages.set(message.wireName, message);
    }

    if (sendsMessage(message)) {
      const methodName = sendMethodName(message.wireName);
      if (sendMethods.has(methodName)) {
        throw new Error(`Duplicate protocol send method: ${methodName}`);
      }
      sendMethods.add(methodName);

      if (methodName in protocolTarget) {
        throw new Error(`Generated protocol method would overwrite: ${methodName}`);
      }

      Object.defineProperty(protocolTarget, methodName, {
        configurable: true,
        enumerable: false,
        value: (payload: unknown) => {
          send(message.wireName, message.codec.encode(payload));
        },
      });
    }
  }

  Object.defineProperty(protocolTarget, 'on', {
    configurable: true,
    enumerable: false,
    value: (eventName: string, listener: ProtocolListener): (() => void) => {
      const eventListeners = listeners.get(eventName) ?? new Set();
      eventListeners.add(listener);
      listeners.set(eventName, eventListeners);

      return () => {
        eventListeners.delete(listener);
      };
    },
  });

  Object.defineProperty(protocolTarget, 'receive', {
    configurable: true,
    enumerable: false,
    value: (wireName: string, payload: unknown): boolean => {
      const message = inboundMessages.get(wireName);
      if (!message) {
        return false;
      }

      const eventListeners = listeners.get(eventNameFor(message));
      if (!eventListeners) {
        return true;
      }

      const decodedPayload = message.codec.decode(payload);
      for (const listener of [...eventListeners]) {
        listener(decodedPayload);
      }
      return true;
    },
  });

  return protocolTarget as ProtocolIO<Messages>;
}

function directedMessage<
  Name extends string,
  Payload,
  Direction extends ProtocolDirection,
>(
  envelope: ProtocolMessageEnvelope<Name, Payload>,
  direction: Direction,
): DirectedProtocolMessage<Name, Payload, Direction> {
  return {
    ...envelope,
    direction,
    asEvent<Alias extends string>(eventName: Alias) {
      return {
        ...envelope,
        direction,
        eventName,
        asEvent: this.asEvent,
      };
    },
  };
}

function eventNameFor(message: AnyDirectedProtocolMessage): string {
  return message.eventName ?? defaultEventName(message.wireName);
}

function receivesMessage(message: AnyDirectedProtocolMessage): boolean {
  return message.direction === 'inbound' || message.direction === 'duplex';
}

function sendsMessage(message: AnyDirectedProtocolMessage): boolean {
  return message.direction === 'outbound' || message.direction === 'duplex';
}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
