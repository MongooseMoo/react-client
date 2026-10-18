import {
  messageEnvelope,
  type ProtocolCodec,
  type ProtocolMessageEnvelope,
} from '../protocol/messages';

export function gmcpJsonMessage<
  Name extends string,
  InboundPayload,
  OutboundPayload = InboundPayload,
>(
  wireName: Name,
  codec: ProtocolCodec<InboundPayload, OutboundPayload> = {
    encode(payload: OutboundPayload): unknown {
      return payload;
    },
    decode(payload: unknown): InboundPayload {
      return payload as InboundPayload;
    },
  },
): ProtocolMessageEnvelope<Name, InboundPayload, OutboundPayload> {
  return messageEnvelope(wireName, codec);
}
