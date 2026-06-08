import { describe, expect, it, vi } from 'vitest';
import {
  encodeGmcpPayload,
  parseGmcpMessageAddress,
  parseGmcpPayload,
  resolveGmcpMessageHandler,
} from './codec';

describe('GMCP codec', () => {
  it('splits package and message names at the last dot', () => {
    expect(parseGmcpMessageAddress('Client.Media.ListenerPosition')).toEqual({
      packageName: 'Client.Media',
      messageType: 'ListenerPosition',
    });
  });

  it('rejects malformed message addresses', () => {
    expect(parseGmcpMessageAddress('Client')).toBeNull();
    expect(parseGmcpMessageAddress('.Message')).toBeNull();
    expect(parseGmcpMessageAddress('Client.')).toBeNull();
  });

  it('parses empty payloads as objects and JSON payloads as values', () => {
    expect(parseGmcpPayload(undefined)).toEqual({});
    expect(parseGmcpPayload('')).toEqual({});
    expect(parseGmcpPayload('{"name":"rain"}')).toEqual({ name: 'rain' });
  });

  it('resolves handlers without exposing dynamic any at the call site', () => {
    const handlePlay = vi.fn();

    expect(resolveGmcpMessageHandler({ handlePlay }, 'Play')).toBe(handlePlay);
    expect(resolveGmcpMessageHandler({ handlePlay: 'nope' }, 'Play')).toBeUndefined();
  });

  it('does not double encode already serialized payloads', () => {
    expect(encodeGmcpPayload('{"ok":true}')).toBe('{"ok":true}');
    expect(encodeGmcpPayload({ ok: true })).toBe('{"ok":true}');
    expect(encodeGmcpPayload()).toBe('{}');
  });
});
