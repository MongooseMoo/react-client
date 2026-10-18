import { describe, expect, it, vi } from 'vitest';

import {
  createProtocolIO,
  defaultEventName,
  duplex,
  identityCodec,
  inbound,
  messageEnvelope,
  outbound,
  sendMethodName,
} from './messages';

interface OfferPayload {
  sender: string;
  filename: string;
}

interface RequestResendPayload {
  sender: string;
  hash: string;
}

describe('protocol message registry', () => {
  it('derives canonical event and send method names from wire names', () => {
    expect(defaultEventName('Offer')).toBe('offer');
    expect(defaultEventName('RequestResend')).toBe('requestResend');
    expect(defaultEventName('room_token')).toBe('roomToken');
    expect(sendMethodName('Offer')).toBe('sendOffer');
    expect(sendMethodName('request_resend')).toBe('sendRequestResend');
  });

  it('emits inbound messages through package-local typed events', () => {
    const Offer = messageEnvelope('Offer', identityCodec<OfferPayload>());
    const io = createProtocolIO([inbound(Offer)] as const, vi.fn());
    const listener = vi.fn();

    io.on('offer', listener);
    expect(io.receive('Offer', { sender: 'Q', filename: 'notes.txt' })).toBe(
      true,
    );

    expect(listener).toHaveBeenCalledWith({
      sender: 'Q',
      filename: 'notes.txt',
    });
  });

  it('uses explicit event aliases without changing payload typing', () => {
    const Content = messageEnvelope(
      'content',
      identityCodec<{ tag: string; contents: string[] }>(),
    );
    const io = createProtocolIO(
      [inbound(Content).asEvent('openSession')] as const,
      vi.fn(),
    );
    const listener = vi.fn();

    io.on('openSession', listener);
    io.receive('content', { tag: '17', contents: ['line one'] });

    expect(listener).toHaveBeenCalledWith({
      tag: '17',
      contents: ['line one'],
    });
  });

  it('generates outbound methods from outbound and duplex messages', () => {
    const Offer = messageEnvelope('Offer', identityCodec<OfferPayload>());
    const RequestResend = messageEnvelope(
      'RequestResend',
      identityCodec<RequestResendPayload>(),
    );
    const send = vi.fn();
    const io = createProtocolIO(
      [duplex(Offer), outbound(RequestResend)] as const,
      send,
    );

    io.sendOffer({ sender: 'Q', filename: 'notes.txt' });
    io.sendRequestResend({ sender: 'Q', hash: 'abc123' });

    expect(send).toHaveBeenCalledWith('Offer', {
      sender: 'Q',
      filename: 'notes.txt',
    });
    expect(send).toHaveBeenCalledWith('RequestResend', {
      sender: 'Q',
      hash: 'abc123',
    });
  });

  it('returns an unsubscribe function from package-local events', () => {
    const Offer = messageEnvelope('Offer', identityCodec<OfferPayload>());
    const io = createProtocolIO([inbound(Offer)] as const, vi.fn());
    const listener = vi.fn();
    const unsubscribe = io.on('offer', listener);

    unsubscribe();
    io.receive('Offer', { sender: 'Q', filename: 'notes.txt' });

    expect(listener).not.toHaveBeenCalled();
  });

  it('rejects duplicate wire names, event names, and send methods', () => {
    const Offer = messageEnvelope('Offer', identityCodec<OfferPayload>());
    const DuplicateOffer = messageEnvelope(
      'Offer',
      identityCodec<OfferPayload>(),
    );
    const Open = messageEnvelope('Open', identityCodec<OfferPayload>());
    const open = messageEnvelope('open', identityCodec<OfferPayload>());
    const request_resend = messageEnvelope(
      'request_resend',
      identityCodec<RequestResendPayload>(),
    );
    const RequestResend = messageEnvelope(
      'RequestResend',
      identityCodec<RequestResendPayload>(),
    );

    expect(() =>
      createProtocolIO([inbound(Offer), inbound(DuplicateOffer)] as const, vi.fn()),
    ).toThrow(/Duplicate protocol wire name: Offer/);
    expect(() =>
      createProtocolIO([inbound(Open), inbound(open)] as const, vi.fn()),
    ).toThrow(/Duplicate protocol event name: open/);
    expect(() =>
      createProtocolIO(
        [outbound(request_resend), outbound(RequestResend)] as const,
        vi.fn(),
      ),
    ).toThrow(/Duplicate protocol send method: sendRequestResend/);
  });

  it('does not overwrite concrete methods with generated send methods', () => {
    const Offer = messageEnvelope('Offer', identityCodec<OfferPayload>());
    const target = {
      sendOffer() {
        throw new Error('concrete method');
      },
    };

    expect(() =>
      createProtocolIO([outbound(Offer)] as const, vi.fn(), target),
    ).toThrow(/Generated protocol method would overwrite: sendOffer/);
  });
});
