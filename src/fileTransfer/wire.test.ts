import { describe, expect, it } from 'vitest';

import { FileTransferError } from './types';
import {
  decodeFrame,
  encodeFrame,
  type Frame,
  indicesInRanges,
  isPieceFrame,
  PIECE_SIZE,
  type PieceRange,
  SEND_WINDOW,
  STORED_REPORT_INTERVAL,
  toRanges,
} from './wire';

function bytesOf(...values: number[]): ArrayBuffer {
  return new Uint8Array(values).buffer;
}

function typedFrame(type: number, body: string): ArrayBuffer {
  const encoded = new TextEncoder().encode(body);
  const out = new Uint8Array(1 + encoded.byteLength);
  out[0] = type;
  out.set(encoded, 1);
  return out.buffer;
}

function expectProtocolError(action: () => unknown): void {
  let thrown: unknown;
  try {
    action();
  } catch (error) {
    thrown = error;
  }
  expect(thrown).toBeInstanceOf(FileTransferError);
  expect((thrown as FileTransferError).code).toBe('protocol');
}

// The framing of the previous wire format: [u32 LE header length][header JSON][chunk bytes].
function oldFormatFrame(filename: string, chunk: Uint8Array): ArrayBuffer {
  const header = new TextEncoder().encode(
    JSON.stringify({
      hash: 'a'.repeat(64),
      filename,
      chunkIndex: 0,
      totalChunks: 1,
      chunkSize: chunk.byteLength,
      totalSize: chunk.byteLength,
    }),
  );
  const out = new Uint8Array(4 + header.byteLength + chunk.byteLength);
  new DataView(out.buffer).setUint32(0, header.byteLength, true);
  out.set(header, 4);
  out.set(chunk, 4 + header.byteLength);
  return out.buffer;
}

function oldFormatHeaderLength(frame: ArrayBuffer): number {
  return new DataView(frame).getUint32(0, true);
}

describe('PIECE_SIZE', () => {
  it('is 16 KiB', () => {
    expect(PIECE_SIZE).toBe(16384);
  });
});

describe('encodeFrame', () => {
  it('lays a piece out as type 1, big-endian index, payload', () => {
    const encoded = encodeFrame({ type: 'piece', index: 0x01020304, bytes: bytesOf(9, 8, 7) });

    expect(Array.from(new Uint8Array(encoded))).toEqual([1, 1, 2, 3, 4, 9, 8, 7]);
  });

  it('lays ready out as type 2 followed by the have-list as JSON', () => {
    const encoded = new Uint8Array(encodeFrame({ type: 'ready', have: [[0, 3], [5, 7]] }));

    expect(encoded[0]).toBe(2);
    expect(new TextDecoder().decode(encoded.subarray(1))).toBe('{"have":[[0,3],[5,7]]}');
  });

  it('lays complete out as the single byte 3', () => {
    expect(Array.from(new Uint8Array(encodeFrame({ type: 'complete' })))).toEqual([3]);
  });

  it('lays abort out as type 4 followed by the reason as JSON', () => {
    const encoded = new Uint8Array(encodeFrame({ type: 'abort', reason: 'no' }));

    expect(encoded[0]).toBe(4);
    expect(new TextDecoder().decode(encoded.subarray(1))).toBe('{"reason":"no"}');
  });

  it('lays stored out as type 5 followed by the count as a big-endian 32-bit integer', () => {
    const encoded = encodeFrame({ type: 'stored', count: 0x01020304 });

    expect(Array.from(new Uint8Array(encoded))).toEqual([5, 1, 2, 3, 4]);
  });

  it.each([-1, 1.5, 2 ** 32, Number.NaN])('refuses piece index %s', (index) => {
    expectProtocolError(() => encodeFrame({ type: 'piece', index, bytes: bytesOf(1) }));
  });

  it.each([-1, 1.5, 2 ** 32, Number.NaN])('refuses stored count %s', (count) => {
    expectProtocolError(() => encodeFrame({ type: 'stored', count }));
  });
});

describe('the flow-control constants', () => {
  it('report several times within one window', () => {
    expect(SEND_WINDOW).toBe(64);
    expect(STORED_REPORT_INTERVAL).toBe(16);
  });
});

describe('isPieceFrame', () => {
  it('tells a piece from every other frame without decoding it', () => {
    expect(isPieceFrame(encodeFrame({ type: 'piece', index: 0, bytes: bytesOf(1) }))).toBe(true);
    expect(isPieceFrame(bytesOf(1))).toBe(true);
    expect(isPieceFrame(encodeFrame({ type: 'complete' }))).toBe(false);
    expect(isPieceFrame(encodeFrame({ type: 'stored', count: 1 }))).toBe(false);
    expect(isPieceFrame(new ArrayBuffer(0))).toBe(false);
  });
});

describe('decodeFrame', () => {
  const frames: Frame[] = [
    { type: 'piece', index: 0, bytes: bytesOf(1, 2, 3) },
    { type: 'piece', index: 2 ** 32 - 1, bytes: bytesOf(255) },
    { type: 'piece', index: 7, bytes: new ArrayBuffer(0) },
    { type: 'ready', have: [] },
    { type: 'ready', have: [[0, 3], [5, 7]] },
    { type: 'complete' },
    { type: 'abort', reason: '' },
    { type: 'abort', reason: 'annulé — 取消' },
    { type: 'stored', count: 0 },
    { type: 'stored', count: 2 ** 32 - 1 },
  ];

  it.each(frames)('round-trips $type frame %#', (frame) => {
    const decoded = decodeFrame(encodeFrame(frame));

    if (frame.type === 'piece') {
      expect(decoded.type).toBe('piece');
      const piece = decoded as Extract<Frame, { type: 'piece' }>;
      expect(piece.index).toBe(frame.index);
      expect(Array.from(new Uint8Array(piece.bytes))).toEqual(
        Array.from(new Uint8Array(frame.bytes)),
      );
    } else {
      expect(decoded).toEqual(frame);
    }
  });

  it('round-trips a full-size piece', () => {
    const payload = new Uint8Array(PIECE_SIZE).map((_, i) => i % 251);

    const decoded = decodeFrame(encodeFrame({ type: 'piece', index: 3, bytes: payload.buffer }));

    expect(decoded.type).toBe('piece');
    const piece = decoded as Extract<Frame, { type: 'piece' }>;
    expect(piece.bytes.byteLength).toBe(PIECE_SIZE);
    expect(new Uint8Array(piece.bytes).every((byte, i) => byte === payload[i])).toBe(true);
  });

  it('returns the payload as a copy that does not alias the frame', () => {
    const encoded = encodeFrame({ type: 'piece', index: 0, bytes: bytesOf(1, 2, 3) });

    const decoded = decodeFrame(encoded) as Extract<Frame, { type: 'piece' }>;
    new Uint8Array(encoded).fill(0);

    expect(decoded.bytes.byteLength).toBe(3);
    expect(Array.from(new Uint8Array(decoded.bytes))).toEqual([1, 2, 3]);
  });

  it('rejects empty input', () => {
    expectProtocolError(() => decodeFrame(new ArrayBuffer(0)));
  });

  it.each([0, 6, 123, 255])('rejects unknown type byte %i', (type) => {
    expectProtocolError(() => decodeFrame(bytesOf(type, 0, 0, 0, 0)));
  });

  it.each([1, 4, 6, 9])('rejects a stored frame of %i bytes', (length) => {
    expectProtocolError(() => decodeFrame(new Uint8Array(length).fill(5, 0, 1).buffer));
  });

  it.each([1, 2, 3, 4])('rejects a piece whose header is cut to %i bytes', (length) => {
    expectProtocolError(() => decodeFrame(bytesOf(1, 0, 0, 0).slice(0, length)));
  });

  it('rejects complete with a body', () => {
    expectProtocolError(() => decodeFrame(bytesOf(3, 0)));
  });

  it.each([
    ['no body', ''],
    ['invalid JSON', '{"have":'],
    ['a JSON array', '[]'],
    ['JSON null', 'null'],
    ['a missing have', '{}'],
    ['have that is not an array', '{"have":"all"}'],
    ['a range that is not an array', '{"have":[3]}'],
    ['a range with one number', '{"have":[[1]]}'],
    ['a range with three numbers', '{"have":[[1,2,3]]}'],
    ['a fractional range number', '{"have":[[0,1.5]]}'],
    ['a negative range number', '{"have":[[-1,2]]}'],
    ['a string range number', '{"have":[["0",2]]}'],
    ['a null range number', '{"have":[[0,null]]}'],
    ['a range number beyond exact integers', '{"have":[[0,1e300]]}'],
  ])('rejects ready with %s', (_name, body) => {
    expectProtocolError(() => decodeFrame(typedFrame(2, body)));
  });

  it.each([
    ['no body', ''],
    ['invalid JSON', '{reason}'],
    ['a JSON string', '"stop"'],
    ['JSON null', 'null'],
    ['a missing reason', '{}'],
    ['a reason that is not a string', '{"reason":5}'],
  ])('rejects abort with %s', (_name, body) => {
    expectProtocolError(() => decodeFrame(typedFrame(4, body)));
  });

  it('rejects a control frame whose body is not valid UTF-8', () => {
    expectProtocolError(() => decodeFrame(bytesOf(4, 0xff, 0xfe, 0xfd)));
  });

  it('rejects a frame in the previous wire format', () => {
    const frame = oldFormatFrame('notes.txt', new Uint8Array([1, 2, 3, 4]));

    // Guard the premise: the first byte is the low byte of the header length.
    expect(new Uint8Array(frame)[0]).toBeGreaterThan(5);
    expectProtocolError(() => decodeFrame(frame));
  });

  // The low byte of an old header length can land on a type byte. 2, 3 and 4 still fail
  // on their bodies, and 5 on its length: a stored frame is five bytes, and an old frame
  // with a header that long is at least nine. 1 cannot fail here, so what protects the
  // receiver is that the "index" is then made of the rest of the length and the header's
  // opening brace, which puts it far beyond any real piece.
  describe('given a previous-format frame whose header length ends in a type byte', () => {
    const baseLength = oldFormatHeaderLength(oldFormatFrame('', new Uint8Array(0)));
    const frameWithHeaderLength = (length: number): ArrayBuffer => {
      const frame = oldFormatFrame('x'.repeat(length - baseLength), new Uint8Array([1, 2, 3, 4]));
      expect(oldFormatHeaderLength(frame)).toBe(length);
      return frame;
    };

    it.each([258, 259, 260, 261])('rejects header length %i', (length) => {
      expectProtocolError(() => decodeFrame(frameWithHeaderLength(length)));
    });

    it('decodes header length 257 as a piece with an index of at least 2^24', () => {
      const decoded = decodeFrame(frameWithHeaderLength(257));

      expect(decoded.type).toBe('piece');
      expect((decoded as Extract<Frame, { type: 'piece' }>).index).toBe(0x0100007b);
    });
  });
});

describe('toRanges', () => {
  it.each<[number[], PieceRange[]]>([
    [[], []],
    [[4], [[4, 5]]],
    [[0, 1, 2], [[0, 3]]],
    [[0, 1, 2, 5, 6, 9], [[0, 3], [5, 7], [9, 10]]],
    [[1, 3, 5], [[1, 2], [3, 4], [5, 6]]],
  ])('turns %j into %j', (indices, ranges) => {
    expect(toRanges(indices)).toEqual(ranges);
  });
});

describe('indicesInRanges', () => {
  it('returns no indices for no ranges', () => {
    expect(indicesInRanges([], 10).size).toBe(0);
  });

  it('expands half-open ranges', () => {
    expect(Array.from(indicesInRanges([[0, 3], [5, 7]], 10))).toEqual([0, 1, 2, 5, 6]);
  });

  it('accepts a range that covers every piece', () => {
    expect(indicesInRanges([[0, 10]], 10).size).toBe(10);
  });

  it('accepts ranges that touch without overlapping', () => {
    expect(Array.from(indicesInRanges([[0, 2], [2, 4]], 4))).toEqual([0, 1, 2, 3]);
  });

  it('is the inverse of toRanges', () => {
    const indices = [0, 1, 2, 5, 6, 9];

    expect(Array.from(indicesInRanges(toRanges(indices), 10))).toEqual(indices);
  });

  it.each<[string, PieceRange[], number]>([
    ['a fractional start', [[0.5, 2]], 10],
    ['a fractional end', [[0, 1.5]], 10],
    ['a NaN bound', [[0, Number.NaN]], 10],
    ['an empty range', [[3, 3]], 10],
    ['a reversed range', [[4, 2]], 10],
    ['a negative start', [[-1, 2]], 10],
    ['an end past the piece count', [[8, 11]], 10],
    ['any range when there are no pieces', [[0, 1]], 0],
    ['overlapping ranges', [[0, 3], [2, 5]], 10],
    ['descending ranges', [[5, 7], [0, 3]], 10],
    ['a repeated range', [[0, 3], [0, 3]], 10],
  ])('rejects %s', (_name, ranges, pieceCount) => {
    expectProtocolError(() => indicesInRanges(ranges, pieceCount));
  });

  it('rejects a range that is not a pair', () => {
    expectProtocolError(() => indicesInRanges([[0, 1, 2] as unknown as PieceRange], 10));
  });
});
