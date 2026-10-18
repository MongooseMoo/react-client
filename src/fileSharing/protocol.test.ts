import { describe, expect, it } from 'vitest';
import { strictJson, validatePeer, validateFiles, validName } from './protocol';
import { decodeFrame, encodeFrame } from './frames';

describe('Phase 1 protocol boundaries', () => {
  it('C: rejects fractional, exponent and negative-zero spellings of integer fields', () => {
    for (const seq of ['1.0e0', '1.0', '1e0', '-0'])
      expect(() => strictJson(`{"seq":${seq},"leaseMs":30000}`)).toThrow();
  });
  it('accepts spec feature subsets, including newer peer capabilities', () => {
    const peer = { player: '#2', endpoint: 'a'.repeat(32), epoch: 'b'.repeat(32) };
    for (const features of [
      ['base', 'leaves'],
      ['base', 'future'],
    ]) {
      expect(() =>
        validatePeer('Capabilities', {
          req: 'c'.repeat(32),
          to: '#2',
          online: true,
          target: peer,
          peer: 1,
          files: 1,
          data: 1,
          features,
          maxReceiveSize: 10737418240,
          legacyV1: false,
        }),
      ).not.toThrow();
      expect(() =>
        validatePeer('Reserved', {
          event: 'c'.repeat(32),
          peer,
          session: 'd'.repeat(32),
          initiator: peer,
          authorization: { kind: 'offer', offer: 'e'.repeat(32) },
          capabilities: { data: 1, features, maxReceiveSize: 10737418240 },
          negotiationMs: 30000,
        }),
      ).not.toThrow();
    }
  });
  it('rejects duplicate keys, escaped duplicates, null, surrogates and trailing data', () => {
    for (const raw of [
      '{"req":1,"req":2}',
      '{"req":1,"\\u0072eq":2}',
      '{"a":null}',
      '{"a":"\\ud800"}',
      '{}{}',
      '{"a":1,}',
      '{"a":1e400}',
    ]) {
      expect(() => strictJson(raw)).toThrow();
    }
    expect(strictJson('{"__proto__":"plain data"}')).toEqual({
      __proto__: undefined,
      ...JSON.parse('{"__proto__":"plain data"}'),
    });
  });
  it('bounds bytes, nesting and values before creating an unbounded tree', () => {
    expect(() => strictJson(' '.repeat(65537))).toThrow();
    expect(() => strictJson('[[[[[[[[[0]]]]]]]]]')).toThrow();
    expect(() => strictJson(JSON.stringify(Array(2049).fill(1)))).toThrow();
  });
  it('requires exact schemas and canonical names', () => {
    expect(validName('two words.txt')).toBe(true);
    for (const name of [
      '..',
      'a/b',
      'e\u0301',
      'a\u202Eb',
      'C:file',
      '\ud800',
      'a\u0000',
      'a\u009f',
      'a\u{1343f}',
    ])
      expect(validName(name)).toBe(false);
    expect(() => validatePeer('Ready', {})).toThrow();
    expect(() => validateFiles('Policy', {})).toThrow();
  });
  it('encodes the v2 wire, rejecting later-phase and malformed frames', () => {
    expect([
      ...new Uint8Array(
        encodeFrame({
          type: 'ready',
          have: [
            [0, 2],
            [5, 6],
          ],
        }),
      ),
    ]).toEqual([2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 5, 0, 0, 0, 6]);
    expect(decodeFrame(new Uint8Array([3, 1]).buffer, 10)).toEqual({
      type: 'complete',
      outcome: 1,
    });
    for (const frame of [[3, 0], [2, 1, 0, 0], [6], [7], [8], [9], [10], [11, 5], [5, 0]]) {
      expect(() => decodeFrame(new Uint8Array(frame).buffer, 10)).toThrow();
    }
    expect(() =>
      decodeFrame(
        encodeFrame({
          type: 'ready',
          have: [
            [0, 2],
            [2, 3],
          ],
        }),
        10,
      ),
    ).toThrow();
  });
});
