import { describe, expect, it } from 'vitest';
import {
  encodeGmcpPayload,
  parseGmcpMessageAddress,
  parseGmcpPayload,
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

  it('does not double encode already serialized payloads', () => {
    expect(encodeGmcpPayload('{"ok":true}')).toBe('{"ok":true}');
    expect(encodeGmcpPayload({ ok: true })).toBe('{"ok":true}');
    expect(encodeGmcpPayload()).toBe('{}');
  });
});
