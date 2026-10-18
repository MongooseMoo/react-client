import type { CanonicalScore } from '../../midi/score';
import { decodeCanonicalScore, encodeCanonicalScore } from './canonicalAscii';
import { ScoreAssetLoader, sha256 } from './ScoreAssetLoader';
import {
  decodeAsset,
  decodeEditorReply,
  encodeEditorRequest,
  object,
  type EditorOperation,
  type EditorReply,
  type ScoreAssetDescriptor,
} from './protocol';

export interface MediaScoreRequest {
  key: string;
  sourceId: string;
  contentId: string;
  descriptor: Omit<ScoreAssetDescriptor, 'contentId' | 'bearer'>;
  signal: AbortSignal;
}
interface Pending {
  operation: EditorOperation;
  resolve(reply: EditorReply): void;
  reject(error: unknown): void;
  cleanup(): void;
}
const cancelled = () => new DOMException('World music request cancelled', 'AbortError');
const mutations = new Set<EditorOperation>([
  'EditorCreate',
  'EditorSave',
  'EditorCopy',
  'EditorDelete',
  'EditorPublish',
  'EditorTransport',
  'EditorUploadBegin',
  'EditorUploadCommit',
  'EditorUploadCancel',
  'EditorUploadChunk',
]);

/** Connection-owned editor protocol. No login tokens or asset bearers enter persistent state. */
export class WorldMusicClient {
  readonly assets: ScoreAssetLoader;
  private readonly pending = new Map<string, Pending>();
  private readonly resetListeners = new Set<() => void>();
  private session = new AbortController();
  private normalAt = 0;
  private chunkAt = 0;
  private saving = false;
  private _generation = 0;
  get generation(): number {
    return this._generation;
  }
  constructor(
    private readonly send: (name: string, payload: string) => void,
    private readonly available: () => boolean = () => true,
    assets = new ScoreAssetLoader(),
  ) {
    this.assets = assets;
  }
  subscribeReset(listener: () => void): () => void {
    this.resetListeners.add(listener);
    return () => this.resetListeners.delete(listener);
  }
  reset(): void {
    this._generation++;
    this.session.abort();
    this.session = new AbortController();
    for (const pending of this.pending.values()) {
      pending.cleanup();
      pending.reject(cancelled());
    }
    this.pending.clear();
    this.normalAt = this.chunkAt = 0;
    this.assets.clear();
    for (const listener of this.resetListeners) listener();
  }
  receive(input: unknown): void {
    const raw = object(input);
    if (typeof raw.requestId !== 'string') return;
    const pending = this.pending.get(raw.requestId);
    if (!pending) return;
    this.pending.delete(raw.requestId);
    pending.cleanup();
    try {
      const reply = decodeEditorReply(input, pending.operation);
      if (reply.status !== 'ok')
        throw new Error(
          typeof reply.message === 'string' ? reply.message : `World music: ${reply.status}`,
        );
      pending.resolve(reply);
    } catch (error) {
      pending.reject(error);
    }
  }
  request(
    operation: EditorOperation,
    fields: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<EditorReply> {
    if (!this.available())
      return Promise.reject(new Error('Connect to a character before using the world library'));
    if (signal?.aborted) return Promise.reject(cancelled());
    if (this.pending.size >= 8)
      return Promise.reject(new Error('World music request limit reached'));
    const requestId = crypto.randomUUID();
    let payload: string;
    try {
      payload = encodeEditorRequest(operation, { ...fields, requestId });
    } catch (error) {
      return Promise.reject(error);
    }
    const sessionSignal = this.session.signal;
    return new Promise((resolve, reject) => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      let cadence: ReturnType<typeof setTimeout> | undefined;
      let attempts = 0;
      const cleanup = () => {
        clearTimeout(timer);
        clearTimeout(cadence);
        signal?.removeEventListener('abort', abort);
        sessionSignal.removeEventListener('abort', abort);
      };
      const fail = (error: unknown) => {
        this.pending.delete(requestId);
        cleanup();
        reject(error);
      };
      const abort = () => fail(cancelled());
      const dispatch = () => {
        if (sessionSignal.aborted || signal?.aborted) {
          abort();
          return;
        }
        const now = Date.now(),
          chunk = operation === 'EditorUploadChunk';
        const target = Math.max(now, chunk ? this.chunkAt : this.normalAt);
        if (chunk) this.chunkAt = target + 65;
        else this.normalAt = target + 260;
        cadence = setTimeout(() => {
          if (sessionSignal.aborted || signal?.aborted) {
            abort();
            return;
          }
          try {
            this.send(`Client.Midi.${operation}`, payload);
          } catch (error) {
            fail(error);
            return;
          }
          attempts++;
          // A synchronous test transport may already have delivered the reply.
          if (!this.pending.has(requestId)) return;
          timer = setTimeout(
            () => {
              if (attempts < 2 && mutations.has(operation)) dispatch();
              else
                fail(new Error('World music request timed out; refresh before changing it again'));
            },
            operation === 'EditorUploadCommit' ? 30000 : 5000,
          );
        }, target - now);
      };
      this.pending.set(requestId, { operation, resolve, reject, cleanup });
      signal?.addEventListener('abort', abort, { once: true });
      sessionSignal.addEventListener('abort', abort, { once: true });
      dispatch();
    });
  }
  list(
    scope: 'mine' | 'public' = 'mine',
    cursor?: string,
    signal?: AbortSignal,
  ): Promise<EditorReply> {
    return this.request('EditorList', { scope, ...(cursor ? { cursor } : {}) }, signal);
  }
  async load(
    selector: { libraryId: string } | { contentId: string },
    signal?: AbortSignal,
  ): Promise<{ score: CanonicalScore; entry: EditorReply }> {
    const generation = this.generation;
    const entry = await this.request('EditorLoad', selector, signal);
    let score: CanonicalScore;
    if (typeof entry.scoreJson === 'string') score = decodeCanonicalScore(entry.scoreJson);
    else {
      let asset = decodeAsset(entry.asset, entry.contentId as string);
      if (!asset.bearer && asset.url.includes('/content/'))
        asset = await this.grant({ contentId: asset.contentId }, asset, signal);
      score = await this.assets.load(asset, signal);
    }
    if (generation !== this.generation || signal?.aborted) throw cancelled();
    if (score.contentId !== entry.contentId) throw new Error('World score identity mismatch');
    return { score, entry };
  }
  async save(
    input: {
      name: string;
      score: CanonicalScore;
      libraryId?: string;
      expectedLibraryRevision?: number;
    },
    signal?: AbortSignal,
  ): Promise<EditorReply> {
    if (this.saving) throw new Error('A composition is already being saved');
    this.saving = true;
    const sessionSignal = this.session.signal;
    const generation = this.generation;
    let uploadId: string | undefined;
    try {
      const scoreJson = encodeCanonicalScore(input.score);
      const operation = input.libraryId === undefined ? 'EditorCreate' : 'EditorSave';
      const fields = {
        name: input.name,
        ...(input.libraryId === undefined
          ? {}
          : { libraryId: input.libraryId, expectedLibraryRevision: input.expectedLibraryRevision }),
      };
      let inline = true;
      try {
        encodeEditorRequest(operation, { ...fields, scoreJson, requestId: 'preview' });
      } catch (error) {
        if (error instanceof RangeError) inline = false;
        else throw error;
      }
      if (inline) {
        const reply = await this.request(operation, { ...fields, scoreJson }, signal);
        if (reply.contentId !== input.score.contentId)
          throw new Error('Saved score identity mismatch');
        return reply;
      }
      const bytes = new TextEncoder().encode(scoreJson);
      const digest = await sha256(bytes);
      if (generation !== this.generation || signal?.aborted) throw cancelled();
      const begin = await this.request(
        'EditorUploadBegin',
        { contentId: input.score.contentId, byteLength: bytes.length, sha256: digest },
        signal,
      );
      uploadId = begin.uploadId as string;
      for (let offset = 0, index = 0; offset < scoreJson.length; offset += 2048, index++) {
        const reply = await this.request(
          'EditorUploadChunk',
          { uploadId, index, data: scoreJson.slice(offset, offset + 2048) },
          signal,
        );
        if (
          reply.uploadId !== uploadId ||
          reply.acceptedIndex !== index ||
          reply.nextIndex !== index + 1
        )
          throw new Error('World music upload acknowledgement mismatch');
      }
      const staged = await this.request('EditorUploadCommit', { uploadId }, signal);
      if (
        staged.contentId !== input.score.contentId ||
        staged.stagedContentId !== input.score.contentId ||
        staged.byteLength !== bytes.length ||
        staged.sha256 !== digest
      )
        throw new Error('World music upload integrity acknowledgement mismatch');
      const reply = await this.request(
        operation,
        { ...fields, stagedContentId: staged.stagedContentId },
        signal,
      );
      if (reply.contentId !== input.score.contentId)
        throw new Error('Saved score identity mismatch');
      uploadId = undefined;
      return reply;
    } finally {
      if (uploadId && !sessionSignal.aborted && generation === this.generation) {
        await this.request('EditorUploadCancel', { uploadId }).catch(() => undefined);
      }
      this.saving = false;
    }
  }
  private async grant(
    fields: Record<string, unknown>,
    expected: ScoreAssetDescriptor,
    signal?: AbortSignal,
  ): Promise<ScoreAssetDescriptor> {
    const reply = await this.request('EditorAssetGrant', { operation: 'read', ...fields }, signal);
    const granted = decodeAsset(reply.asset, expected.contentId);
    if (
      granted.sha256 !== expected.sha256 ||
      granted.byteLength !== expected.byteLength ||
      granted.url !== expected.url ||
      !granted.bearer
    )
      throw new Error('World score read grant mismatch');
    return granted;
  }
  async loadMediaScore(request: MediaScoreRequest): Promise<CanonicalScore> {
    const generation = this.generation;
    let asset = decodeAsset(
      { ...request.descriptor, contentId: request.contentId },
      request.contentId,
      false,
    );
    // A fresh current-source grant is required even when verified bytes are already cached.
    if (asset.url.includes('/content/'))
      asset = await this.grant(
        { contentId: request.contentId, mediaKey: request.key, sourceId: request.sourceId },
        asset,
        request.signal,
      );
    if (generation !== this.generation || request.signal.aborted) throw cancelled();
    const score = await this.assets.load(asset, request.signal);
    if (generation !== this.generation || request.signal.aborted) throw cancelled();
    return score;
  }
}
