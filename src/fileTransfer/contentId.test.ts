import { describe, expect, it, vi } from 'vitest';

import {
  computeContentId,
  contentIdFromDigests,
  digestPiece,
  pieceCount,
  pieceLength,
} from './contentId';
import { PIECE_SIZE } from './wire';

// jsdom's Blob does not implement arrayBuffer(); computeContentId needs it.
if (typeof Blob.prototype.arrayBuffer !== 'function') {
  Blob.prototype.arrayBuffer = function arrayBuffer(this: Blob) {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(this);
    });
  };
}

const SHA256_OF_NOTHING = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

function patternBytes(length: number): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = (i * 31 + (i >>> 8)) & 0xff;
  }
  return bytes;
}

function hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

// The definition, written out independently of the module under test.
async function referenceContentId(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
  const digests: number[] = [];
  for (let start = 0; start < bytes.byteLength; start += 16384) {
    const piece = bytes.slice(start, Math.min(start + 16384, bytes.byteLength));
    digests.push(...new Uint8Array(await crypto.subtle.digest('SHA-256', piece)));
  }
  return hex(await crypto.subtle.digest('SHA-256', new Uint8Array(digests)));
}

describe('pieceCount', () => {
  it.each([
    [0, 0],
    [1, 1],
    [PIECE_SIZE - 1, 1],
    [PIECE_SIZE, 1],
    [PIECE_SIZE + 1, 2],
    [3 * PIECE_SIZE, 3],
    [3 * PIECE_SIZE + 5, 4],
  ])('is %i bytes -> %i pieces', (size, count) => {
    expect(pieceCount(size)).toBe(count);
  });

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])('rejects size %s', (size) => {
    expect(() => pieceCount(size)).toThrow(RangeError);
  });
});

describe('pieceLength', () => {
  it('is PIECE_SIZE for every piece but a short last one', () => {
    const size = 2 * PIECE_SIZE + 5;

    expect(pieceLength(size, 0)).toBe(PIECE_SIZE);
    expect(pieceLength(size, 1)).toBe(PIECE_SIZE);
    expect(pieceLength(size, 2)).toBe(5);
  });

  it('is PIECE_SIZE for the last piece of an exact multiple', () => {
    expect(pieceLength(2 * PIECE_SIZE, 1)).toBe(PIECE_SIZE);
  });

  it('is the file size for a file smaller than one piece', () => {
    expect(pieceLength(7, 0)).toBe(7);
  });

  it.each([
    [0, 0],
    [7, 1],
    [7, -1],
    [7, 0.5],
    [7, Number.NaN],
    [2 * PIECE_SIZE, 2],
  ])('throws RangeError for size %i, index %s', (size, index) => {
    expect(() => pieceLength(size, index)).toThrow(RangeError);
  });
});

describe('digestPiece', () => {
  it('is SHA-256', async () => {
    expect(hex(await digestPiece(new ArrayBuffer(0)))).toBe(SHA256_OF_NOTHING);
    expect(hex(await digestPiece(new TextEncoder().encode('abc').buffer))).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });
});

describe('contentIdFromDigests', () => {
  it('is the SHA-256 of nothing when there are no pieces', async () => {
    expect(await contentIdFromDigests([])).toBe(SHA256_OF_NOTHING);
  });

  it('is lower-case hex, 64 characters', async () => {
    const id = await contentIdFromDigests([await digestPiece(patternBytes(10).buffer)]);

    expect(id).toMatch(/^[0-9a-f]{64}$/);
  });

  it('depends on the order of the pieces', async () => {
    const first = await digestPiece(patternBytes(10).buffer);
    const second = await digestPiece(patternBytes(11).buffer);

    expect(await contentIdFromDigests([first, second])).not.toBe(
      await contentIdFromDigests([second, first]),
    );
  });
});

describe('computeContentId', () => {
  it('gives an empty file the SHA-256 of nothing', async () => {
    expect(await computeContentId(new Blob([]))).toBe(SHA256_OF_NOTHING);
  });

  // SHA-256(SHA-256("abc")), worked out outside this code base.
  it('matches a fixed vector for a file of one short piece', async () => {
    expect(await computeContentId(new Blob(['abc']))).toBe(
      '4f8b42c22dd3729b519ba6f68d2da7cc5b2d606d05daed5ad5128cc03e6c6358',
    );
  });

  it.each([
    ['less than one piece', 1000],
    ['exactly one piece', PIECE_SIZE],
    ['one byte more than a piece', PIECE_SIZE + 1],
    ['an exact multiple of the piece size', 3 * PIECE_SIZE],
    ['a multiple plus a remainder', 3 * PIECE_SIZE + 1234],
  ])('matches the definition for %s', async (_name, size) => {
    const bytes = patternBytes(size);

    expect(await computeContentId(new Blob([bytes]))).toBe(await referenceContentId(bytes));
  });

  it('differs when one byte of one piece differs', async () => {
    const bytes = patternBytes(3 * PIECE_SIZE);
    const changed = bytes.slice();
    changed[2 * PIECE_SIZE + 9] ^= 1;

    expect(await computeContentId(new Blob([changed]))).not.toBe(
      await computeContentId(new Blob([bytes])),
    );
  });

  it('is not the plain SHA-256 of the file', async () => {
    const bytes = patternBytes(100);

    expect(await computeContentId(new Blob([bytes]))).not.toBe(
      hex(await crypto.subtle.digest('SHA-256', bytes)),
    );
  });

  it('equals contentIdFromDigests over the digest of each piece', async () => {
    const size = 2 * PIECE_SIZE + 77;
    const bytes = patternBytes(size);
    const digests: ArrayBuffer[] = [];
    for (let index = 0; index < pieceCount(size); index++) {
      const start = index * PIECE_SIZE;
      const piece = bytes.slice(start, start + pieceLength(size, index));
      digests.push(await digestPiece(piece.buffer));
    }

    expect(await contentIdFromDigests(digests)).toBe(await computeContentId(new Blob([bytes])));
  });

  it('reads the file one piece at a time and never as a whole', async () => {
    const size = 3 * PIECE_SIZE + 10;
    const bytes = patternBytes(size);
    const file = new Blob([bytes]);
    const slice = vi.spyOn(file, 'slice');
    const readWhole = vi.fn(() => Promise.reject(new Error('the whole file was read')));
    file.arrayBuffer = readWhole;
    file.text = readWhole as unknown as Blob['text'];

    const id = await computeContentId(file);

    expect(id).toBe(await referenceContentId(bytes));
    expect(readWhole).not.toHaveBeenCalled();
    expect(slice.mock.calls).toEqual([
      [0, PIECE_SIZE],
      [PIECE_SIZE, 2 * PIECE_SIZE],
      [2 * PIECE_SIZE, 3 * PIECE_SIZE],
      [3 * PIECE_SIZE, size],
    ]);
    for (const result of slice.mock.results) {
      expect((result.value as Blob).size).toBeLessThanOrEqual(PIECE_SIZE);
    }
  });
});
