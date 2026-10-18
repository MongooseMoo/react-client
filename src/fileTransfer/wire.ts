/**
 * Frames on a transfer's data channel. Each transfer has its own channel, so a frame
 * carries no transfer id.
 *
 * Byte 0 is the frame type. The values are deliberately small: the previous wire format
 * began with a little-endian JSON header length, whose first byte is normally far above
 * them, so a frame from an old client is refused instead of being misread. When that
 * byte does land on a type, the frame is still refused as ready, complete or abort
 * because what follows is not their body, and as stored because it is longer than five
 * bytes. The exception is an old header whose length is 1 modulo 256: it decodes as a
 * piece, with an index of at least 2^24 for any header shorter than 64 KiB, which the
 * receiver must refuse as out of range.
 */
import { FileTransferError } from './types';

export const PIECE_SIZE = 16 * 1024;

/**
 * Flow control. A sender never has more than this many pieces on a link beyond the
 * last count the receiver reported, so what a receiver holds unprocessed is bounded
 * however slow its storage is.
 */
export const SEND_WINDOW = 64;
/** A receiver reports its count each time it has dealt with this many more pieces. */
export const STORED_REPORT_INTERVAL = 16;

/** Half-open range of piece indices: [start, end). */
export type PieceRange = [start: number, end: number];

export type Frame =
  | { type: 'piece'; index: number; bytes: ArrayBuffer }
  /** Receiver to sender: start sending, I already hold these pieces. */
  | { type: 'ready'; have: PieceRange[] }
  /** Receiver to sender: the file is verified and delivered. */
  | { type: 'complete' }
  /** Either direction. */
  | { type: 'abort'; reason: string }
  /**
   * Receiver to sender: of the pieces you sent on this link, I have dealt with `count`,
   * by storing them or by ignoring ones I already held.
   */
  | { type: 'stored'; count: number };

const TYPE_PIECE = 1;
const TYPE_READY = 2;
const TYPE_COMPLETE = 3;
const TYPE_ABORT = 4;
const TYPE_STORED = 5;

/** Type byte, then the piece index as an unsigned 32-bit big-endian integer. */
const PIECE_HEADER_SIZE = 5;
/** Type byte, then the count as an unsigned 32-bit big-endian integer. */
const STORED_FRAME_SIZE = 5;
const MAX_UINT32 = 0xffffffff;

function protocolError(message: string): FileTransferError {
  return new FileTransferError('protocol', message);
}

function isIndex(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}

function isUint32(value: unknown): value is number {
  return isIndex(value) && value <= MAX_UINT32;
}

/** A type byte followed by one unsigned 32-bit big-endian integer and `tailSize` free bytes. */
function numberedFrame(type: number, value: number, tailSize = 0): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(STORED_FRAME_SIZE + tailSize);
  out[0] = type;
  new DataView(out.buffer).setUint32(1, value, false);
  return out;
}

function isPieceRange(value: unknown): value is PieceRange {
  return Array.isArray(value) && value.length === 2 && isIndex(value[0]) && isIndex(value[1]);
}

function encodeControlFrame(type: number, body: unknown): ArrayBuffer {
  const json = new TextEncoder().encode(JSON.stringify(body));
  const out = new Uint8Array(1 + json.byteLength);
  out[0] = type;
  out.set(json, 1);
  return out.buffer;
}

function decodeControlBody(body: Uint8Array, frameName: string): Record<string, unknown> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(body));
  } catch {
    throw protocolError(`The body of the ${frameName} frame is not valid JSON`);
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw protocolError(`The body of the ${frameName} frame is not a JSON object`);
  }
  return parsed as Record<string, unknown>;
}

export function encodeFrame(frame: Frame): ArrayBuffer {
  switch (frame.type) {
    case 'piece': {
      if (!isUint32(frame.index)) {
        throw protocolError(`Piece index ${frame.index} does not fit in a frame`);
      }
      const out = numberedFrame(TYPE_PIECE, frame.index, frame.bytes.byteLength);
      out.set(new Uint8Array(frame.bytes), PIECE_HEADER_SIZE);
      return out.buffer;
    }
    case 'ready':
      return encodeControlFrame(TYPE_READY, { have: frame.have });
    case 'complete':
      return new Uint8Array([TYPE_COMPLETE]).buffer;
    case 'abort':
      return encodeControlFrame(TYPE_ABORT, { reason: frame.reason });
    case 'stored':
      if (!isUint32(frame.count)) {
        throw protocolError(`Count ${frame.count} does not fit in a frame`);
      }
      return numberedFrame(TYPE_STORED, frame.count).buffer;
  }
}

/** Whether `data` is a piece frame, told from its type byte alone. */
export function isPieceFrame(data: ArrayBuffer): boolean {
  return data.byteLength > 0 && new DataView(data).getUint8(0) === TYPE_PIECE;
}

export function decodeFrame(data: ArrayBuffer): Frame {
  if (data.byteLength === 0) {
    throw protocolError('Received an empty frame');
  }
  const type = new DataView(data).getUint8(0);
  const body = new Uint8Array(data, 1);

  switch (type) {
    case TYPE_PIECE:
      if (data.byteLength < PIECE_HEADER_SIZE) {
        throw protocolError('Received a piece frame too short to hold its index');
      }
      return {
        type: 'piece',
        index: new DataView(data).getUint32(1, false),
        bytes: data.slice(PIECE_HEADER_SIZE),
      };
    case TYPE_READY: {
      const { have } = decodeControlBody(body, 'ready');
      if (!Array.isArray(have) || !have.every(isPieceRange)) {
        throw protocolError('The ready frame does not list ranges of piece indices');
      }
      return { type: 'ready', have: have.map(([start, end]): PieceRange => [start, end]) };
    }
    case TYPE_COMPLETE:
      if (body.byteLength > 0) {
        throw protocolError('The complete frame has a body');
      }
      return { type: 'complete' };
    case TYPE_ABORT: {
      const { reason } = decodeControlBody(body, 'abort');
      if (typeof reason !== 'string') {
        throw protocolError('The abort frame does not give a reason');
      }
      return { type: 'abort', reason };
    }
    case TYPE_STORED:
      if (data.byteLength !== STORED_FRAME_SIZE) {
        throw protocolError('The stored frame is not a type byte and one 32-bit count');
      }
      return { type: 'stored', count: new DataView(data).getUint32(1, false) };
    default:
      throw protocolError(`Received a frame of unknown type ${type}`);
  }
}

/** `sortedIndices` must be strictly ascending, as `TransferStorage.heldPieces` returns them. */
export function toRanges(sortedIndices: readonly number[]): PieceRange[] {
  const ranges: PieceRange[] = [];
  for (const index of sortedIndices) {
    const last = ranges[ranges.length - 1];
    if (last && last[1] === index) {
      last[1] = index + 1;
    } else {
      ranges.push([index, index + 1]);
    }
  }
  return ranges;
}

/**
 * Expands ranges a peer sent into the piece indices they cover. Throws a 'protocol'
 * error unless every range is a non-empty span of integers within [0, pieceCount] and
 * the ranges are ascending and do not overlap.
 */
export function indicesInRanges(ranges: readonly PieceRange[], pieceCount: number): Set<number> {
  const indices = new Set<number>();
  let floor = 0;
  for (const range of ranges) {
    if (!isPieceRange(range)) {
      throw protocolError('A piece range is not a pair of piece indices');
    }
    const [start, end] = range;
    if (start >= end) {
      throw protocolError(`Piece range [${start}, ${end}) is empty or reversed`);
    }
    if (end > pieceCount) {
      throw protocolError(
        `Piece range [${start}, ${end}) is outside the file's ${pieceCount} pieces`,
      );
    }
    if (start < floor) {
      throw protocolError(`Piece range [${start}, ${end}) overlaps or precedes the one before it`);
    }
    for (let index = start; index < end; index++) {
      indices.add(index);
    }
    floor = end;
  }
  return indices;
}
