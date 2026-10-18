import { importSmf, exportSmf } from './smf';
import type { CanonicalScore } from '../midi/score';
export type SmfWorkerRequest =
  | { kind: 'import'; bytes: ArrayBuffer }
  | { kind: 'export'; score: CanonicalScore; sourceFormat?: 0 | 1 };
const scope = globalThis as unknown as {
  onmessage: (event: MessageEvent<SmfWorkerRequest>) => void;
  postMessage(value: unknown, transfer?: Transferable[]): void;
};
scope.onmessage = (event) => {
  try {
    if (event.data.kind === 'import')
      scope.postMessage({ ok: true, result: importSmf(event.data.bytes) });
    else {
      const bytes = exportSmf(event.data.score, event.data.sourceFormat);
      scope.postMessage({ ok: true, result: bytes }, [bytes]);
    }
  } catch (error) {
    scope.postMessage({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
};
