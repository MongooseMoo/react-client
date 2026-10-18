import type { CanonicalScore } from '../midi/score';
import type { SmfImport } from './smf';
import type { SmfWorkerRequest } from './smf.worker';
/** Each operation owns a worker and a two-second wall deadline, including export. */
export class SmfWorkerClient {
  private cancel?: () => void;
  constructor(
    private readonly createWorker = () =>
      new Worker(new URL('./smf.worker.ts', import.meta.url), { type: 'module' }),
  ) {}
  private request<T>(request: SmfWorkerRequest, signal?: AbortSignal): Promise<T> {
    this.cancel?.();
    if (signal?.aborted)
      return Promise.reject(new DOMException('MIDI operation aborted', 'AbortError'));
    return new Promise((resolve, reject) => {
      const worker = this.createWorker();
      let settled = false;
      const finish = (error?: Error, result?: T) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        signal?.removeEventListener('abort', abort);
        worker.terminate();
        worker.onmessage = null;
        worker.onerror = null;
        if (this.cancel === abort) this.cancel = undefined;
        if (error) reject(error);
        else resolve(result as T);
      };
      const abort = () => finish(new DOMException('MIDI operation aborted', 'AbortError'));
      const timer = setTimeout(
        () => finish(new DOMException('MIDI operation exceeded two seconds', 'TimeoutError')),
        2000,
      );
      this.cancel = abort;
      signal?.addEventListener('abort', abort, { once: true });
      worker.onmessage = (event) => {
        if (event.data?.ok === true) finish(undefined, event.data.result);
        else
          finish(
            new Error(
              typeof event.data?.error === 'string'
                ? event.data.error
                : 'Invalid MIDI worker response',
            ),
          );
      };
      worker.onerror = (event) => finish(new Error(event.message || 'MIDI worker failed'));
      try {
        worker.postMessage(request, request.kind === 'import' ? [request.bytes] : []);
      } catch (error) {
        finish(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }
  import(bytes: ArrayBuffer, signal?: AbortSignal): Promise<SmfImport> {
    if (bytes.byteLength > 1048576)
      return Promise.reject(new RangeError('MIDI file exceeds 1 MiB'));
    return this.request({ kind: 'import', bytes }, signal);
  }
  export(score: CanonicalScore, sourceFormat?: 0 | 1, signal?: AbortSignal): Promise<ArrayBuffer> {
    return this.request({ kind: 'export', score, sourceFormat }, signal);
  }
  dispose(): void {
    this.cancel?.();
  }
}
