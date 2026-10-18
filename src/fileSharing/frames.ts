import { check, MAX_FRAME, PIECE } from './protocol';
export type Range = readonly [number, number];
export type Frame =
  | { type: 'piece'; index: number; bytes: ArrayBuffer }
  | { type: 'ready'; have: Range[] }
  | { type: 'stored'; count: number }
  | { type: 'complete'; outcome: 1 | 2 | 3 | 4 }
  | { type: 'abort'; reason: number }
  | { type: 'terminalAck'; terminalType: 3 | 4 };
export function pieceLength(size: number, index: number): number {
  check(Number.isInteger(index) && index >= 0 && index < Math.ceil(size / PIECE));
  return Math.min(PIECE, size - index * PIECE);
}
export function validateRanges(ranges: readonly Range[], n: number): void {
  check(ranges.length <= 512);
  let end = -1;
  for (const [a, b] of ranges) {
    check(Number.isInteger(a) && Number.isInteger(b) && a > end && a >= 0 && a < b && b <= n);
    end = b;
  }
}
export function heldRanges(indices: readonly number[]): Range[] {
  const ranges: [number, number][] = [];
  for (const i of indices) {
    const last = ranges[ranges.length - 1];
    if (last && last[1] === i) last[1]++;
    else if (ranges.length < 512) ranges.push([i, i + 1]);
  }
  return ranges;
}
export function encodeFrame(f: Frame): ArrayBuffer {
  const out = new ArrayBuffer(
    f.type === 'piece'
      ? 5 + f.bytes.byteLength
      : f.type === 'ready'
        ? 4 + 8 * f.have.length
        : f.type === 'stored'
          ? 5
          : 2,
  );
  const v = new DataView(out);
  const b = new Uint8Array(out);
  switch (f.type) {
    case 'piece':
      v.setUint8(0, 1);
      v.setUint32(1, f.index);
      b.set(new Uint8Array(f.bytes), 5);
      break;
    case 'ready':
      v.setUint8(0, 2);
      v.setUint16(2, f.have.length);
      f.have.forEach(([a, z], i) => {
        v.setUint32(4 + 8 * i, a);
        v.setUint32(8 + 8 * i, z);
      });
      break;
    case 'complete':
      b.set([3, f.outcome]);
      break;
    case 'abort':
      b.set([4, f.reason]);
      break;
    case 'stored':
      v.setUint8(0, 5);
      v.setUint32(1, f.count);
      break;
    case 'terminalAck':
      b.set([11, f.terminalType]);
      break;
  }
  return out;
}
export function decodeFrame(data: ArrayBuffer, n: number, max = MAX_FRAME): Frame {
  check(data.byteLength >= 2 && data.byteLength <= max);
  const v = new DataView(data);
  const type = v.getUint8(0);
  switch (type) {
    case 1:
      check(data.byteLength >= 6 && data.byteLength <= PIECE + 5);
      return { type: 'piece', index: v.getUint32(1), bytes: data.slice(5) };
    case 2: {
      check(data.byteLength >= 4 && v.getUint8(1) === 0);
      const count = v.getUint16(2);
      check(count <= 512 && data.byteLength === 4 + 8 * count);
      const have: Range[] = [];
      for (let i = 0; i < count; i++) have.push([v.getUint32(4 + 8 * i), v.getUint32(8 + 8 * i)]);
      validateRanges(have, n);
      return { type: 'ready', have };
    }
    case 3:
      check(data.byteLength === 2 && v.getUint8(1) >= 1 && v.getUint8(1) <= 4);
      return { type: 'complete', outcome: v.getUint8(1) as 1 | 2 | 3 | 4 };
    case 4:
      check(data.byteLength === 2 && v.getUint8(1) >= 1 && v.getUint8(1) <= 9);
      return { type: 'abort', reason: v.getUint8(1) };
    case 5:
      check(data.byteLength === 5);
      return { type: 'stored', count: v.getUint32(1) };
    case 11:
      check(data.byteLength === 2 && [3, 4].includes(v.getUint8(1)));
      return { type: 'terminalAck', terminalType: v.getUint8(1) as 3 | 4 };
    default:
      throw new Error('Frame is not enabled in Phase 1');
  }
}
