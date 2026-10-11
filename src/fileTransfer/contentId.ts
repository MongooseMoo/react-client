/**
 * The identity of a file's content.
 *
 * WebCrypto has no incremental SHA-256, so hashing a file directly means holding all of
 * it in memory. The id is therefore defined over fixed-size pieces:
 *
 *   content id = hex(SHA-256(SHA-256(piece 0) || SHA-256(piece 1) || ...))
 *
 * where the pieces are consecutive `PIECE_SIZE` slices of the file and the last one may
 * be shorter. An empty file has no pieces, so its id is the SHA-256 of the empty input.
 */
import type { TransferId } from './types';
import { PIECE_SIZE } from './wire';

function assertFileSize(size: number): void {
  if (!Number.isSafeInteger(size) || size < 0) {
    throw new RangeError(`${size} is not a file size`);
  }
}

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function concatenate(buffers: readonly ArrayBuffer[]): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(buffers.reduce((total, buffer) => total + buffer.byteLength, 0));
  let offset = 0;
  for (const buffer of buffers) {
    out.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }
  return out;
}

/** Number of pieces in a file of `size` bytes: 0 for an empty file. */
export function pieceCount(size: number): number {
  assertFileSize(size);
  return Math.ceil(size / PIECE_SIZE);
}

/** The exact byte length piece `index` of a file of `size` bytes must have. */
export function pieceLength(size: number, index: number): number {
  const count = pieceCount(size);
  if (!Number.isInteger(index) || index < 0 || index >= count) {
    throw new RangeError(`Piece ${index} is outside the file's ${count} pieces`);
  }
  return index === count - 1 ? size - index * PIECE_SIZE : PIECE_SIZE;
}

export function digestPiece(bytes: ArrayBuffer): Promise<ArrayBuffer> {
  return crypto.subtle.digest('SHA-256', bytes);
}

export async function contentIdFromDigests(digests: readonly ArrayBuffer[]): Promise<TransferId> {
  return toHex(await crypto.subtle.digest('SHA-256', concatenate(digests)));
}

/** Reads the file one piece at a time, so memory use does not grow with the file. */
export async function computeContentId(file: Blob): Promise<TransferId> {
  const digests: ArrayBuffer[] = [];
  for (let start = 0; start < file.size; start += PIECE_SIZE) {
    const end = Math.min(start + PIECE_SIZE, file.size);
    digests.push(await digestPiece(await file.slice(start, end).arrayBuffer()));
  }
  return contentIdFromDigests(digests);
}
