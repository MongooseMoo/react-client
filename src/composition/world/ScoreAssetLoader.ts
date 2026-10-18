import type { CanonicalScore } from '../../midi/score';
import { decodeCanonicalScore } from './canonicalAscii';
import { decodeAsset, type ScoreAssetDescriptor } from './protocol';

export async function sha256(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new Uint8Array(bytes).buffer);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
const abortError = () => new DOMException('Score asset load cancelled', 'AbortError');
interface Cached {
  score: CanonicalScore;
  bytes: number;
  sha256: string;
}

/** Stores verified scores only. Authorizing a new playback remains the caller's responsibility. */
export class ScoreAssetLoader {
  private readonly cache = new Map<string, Cached>();
  private readonly controllers = new Set<AbortController>();
  private readonly waiting: Array<() => void> = [];
  private active = 0;
  private bytes = 0;
  constructor(private readonly fetcher: typeof fetch = (...args) => fetch(...args)) {}

  clear(): void {
    for (const controller of this.controllers) controller.abort();
    this.cache.clear();
    this.bytes = 0;
  }
  async load(input: ScoreAssetDescriptor, signal?: AbortSignal): Promise<CanonicalScore> {
    const descriptor = decodeAsset(input);
    if (signal?.aborted) throw abortError();
    const cached = this.cache.get(descriptor.contentId);
    if (cached && (cached.sha256 !== descriptor.sha256 || cached.bytes !== descriptor.byteLength))
      throw new Error('Immutable score asset descriptor changed');
    if (cached && cached.sha256 === descriptor.sha256 && cached.bytes === descriptor.byteLength) {
      this.cache.delete(descriptor.contentId);
      this.cache.set(descriptor.contentId, cached);
      return cached.score;
    }
    if (this.controllers.size >= 10) throw new Error('Score asset load queue is full');
    const controller = new AbortController();
    this.controllers.add(controller);
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    const timeout = setTimeout(abort, 10000);
    let admitted = false;
    let queued: (() => void) | undefined;
    try {
      if (this.active >= 2)
        await new Promise<void>((resolve, reject) => {
          const cancelled = () => {
            const index = this.waiting.indexOf(resume);
            if (index >= 0) this.waiting.splice(index, 1);
            reject(abortError());
          };
          const resume = () => {
            controller.signal.removeEventListener('abort', cancelled);
            this.active++;
            admitted = true;
            resolve();
          };
          queued = resume;
          controller.signal.addEventListener('abort', cancelled, { once: true });
          this.waiting.push(resume);
          if (controller.signal.aborted) cancelled();
        });
      if (controller.signal.aborted) throw abortError();
      if (!admitted) {
        this.active++;
        admitted = true;
      }
      const headers: Record<string, string> = {};
      if (descriptor.bearer) headers.Authorization = `Bearer ${descriptor.bearer}`;
      const response = await this.fetcher(descriptor.url, {
        method: 'GET',
        headers,
        signal: controller.signal,
        redirect: 'error',
        credentials: 'omit',
        cache: 'no-store',
      });
      if (!response.ok || response.redirected || (response.url && response.url !== descriptor.url))
        throw new Error('Score asset request failed');
      const declared = response.headers.get('Content-Length');
      if (
        declared !== null &&
        (!/^[0-9]+$/.test(declared) || Number(declared) !== descriptor.byteLength)
      )
        throw new Error('Score asset declared length mismatch');
      if (!response.body) throw new Error('Score asset response has no body');
      const reader = response.body.getReader();
      const bytes = new Uint8Array(descriptor.byteLength);
      let offset = 0;
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (controller.signal.aborted) throw abortError();
          if (done) break;
          if (offset + value.byteLength > bytes.length)
            throw new Error('Score asset exceeds declared length');
          bytes.set(value, offset);
          offset += value.byteLength;
        }
      } finally {
        await reader.cancel();
        reader.releaseLock();
      }
      if (offset !== bytes.length || bytes.at(-2) !== 13 || bytes.at(-1) !== 10)
        throw new Error('Score asset length or framing mismatch');
      if ((await sha256(bytes)) !== descriptor.sha256)
        throw new Error('Score asset integrity mismatch');
      if (controller.signal.aborted) throw abortError();
      const score = decodeCanonicalScore(
        new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(0, -2)),
      );
      if (score.contentId !== descriptor.contentId)
        throw new Error('Score asset identity mismatch');
      const previous = this.cache.get(descriptor.contentId);
      if (previous) this.bytes -= previous.bytes;
      this.cache.delete(descriptor.contentId);
      this.cache.set(descriptor.contentId, {
        score,
        bytes: bytes.length,
        sha256: descriptor.sha256,
      });
      this.bytes += bytes.length;
      while (this.cache.size > 8 || this.bytes > 8388608) {
        const oldest = this.cache.entries().next().value;
        if (!oldest) break;
        this.cache.delete(oldest[0]);
        this.bytes -= oldest[1].bytes;
      }
      return score;
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', abort);
      this.controllers.delete(controller);
      if (queued) {
        const index = this.waiting.indexOf(queued);
        if (index >= 0) this.waiting.splice(index, 1);
      }
      if (admitted) {
        this.active--;
        this.waiting.shift()?.();
      }
    }
  }
}
