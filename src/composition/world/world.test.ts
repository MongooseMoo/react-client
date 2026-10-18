import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  asciiJson,
  decodeCanonicalScore,
  encodeCanonicalScore,
  scanCanonicalJson,
} from './canonicalAscii';
import { assetUrl, decodeAsset, decodeEditorReply, encodeEditorRequest } from './protocol';
import { ScoreAssetLoader, sha256 } from './ScoreAssetLoader';
import { WorldMusicClient } from './WorldMusicClient';
import type { CanonicalScore } from '../../midi/score';

const contentId = '7f1a0010-0000-4000-8000-000000000001';
const score: CanonicalScore = {
  version: 1,
  contentId,
  ppq: 960,
  durationTicks: 3840,
  tempos: [{ tick: 0, bpm: 120 }],
  meters: [{ tick: 0, numerator: 4, denominator: 4 }],
  parts: [
    {
      id: 'p',
      name: '~7E café 🎹 \\uD800',
      kind: 'melodic',
      program: 0,
      notes: [[0, 960, 60, 100]],
      controls: [],
      programs: [],
    },
  ],
};
const url = `https://mongoose.world/api/midi/content/${contentId}`;
const entry = {
  libraryId: 'library-1',
  contentId,
  libraryRevision: 1,
  name: 'World ~7E',
  published: false,
  canEdit: true,
};
const flush = async () => {
  for (let i = 0; i < 12; i++) await Promise.resolve();
};
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('canonical ASCII score boundary', () => {
  it('preserves tilde sequences, Unicode, emoji and literal backslash-u exactly', () => {
    const encoded = encodeCanonicalScore(score);
    expect(encoded).not.toMatch(/[~\u007f-\uffff]/);
    expect(encoded).toContain('\\u007e7E');
    expect(encoded).toContain('\\ud83c\\udfb9');
    expect(decodeCanonicalScore(encoded)).toEqual(score);
    expect(JSON.parse(asciiJson({ scoreJson: encoded })).scoreJson).toBe(encoded);
  });
  it.each([
    '\\n',
    '\\r',
    '\\t',
    '\\b',
    '\\f',
    '\\/',
    '\\u0061',
    '\\u0000',
    '\\u007f',
    '\\u0080',
    '\\u2028',
    '\\u2029',
    '\\ud800',
    '\\udc00',
    '\\ud800\\u0061',
    '\\ud800\\\\udc00',
    '\\u00E9',
    '~',
    'é',
  ])('rejects noncanonical or unsafe string spelling %s', (spelling) => {
    const encoded = encodeCanonicalScore(score).replace('"p"', `"${spelling}"`);
    expect(() => decodeCanonicalScore(encoded)).toThrow();
  });
  it('rejects case-folded duplicate keys before parsing and refuses unknown schema fields', () => {
    const parse = vi.spyOn(JSON, 'parse');
    expect(() => scanCanonicalJson('{"id":1,"ID":2}')).toThrow();
    expect(parse).not.toHaveBeenCalled();
    parse.mockRestore();
    expect(() =>
      decodeCanonicalScore(
        encodeCanonicalScore(score).replace('"program":0', '"program":0,"future":1'),
      ),
    ).toThrow();
    expect(() =>
      encodeCanonicalScore({ ...score, parts: [{ ...score.parts[0], name: 'bad\ud800' }] }),
    ).toThrow();
  });
  it('bounds depth, scalar/container nodes and bytes before allocation', () => {
    expect(() => scanCanonicalJson(`${'['.repeat(9)}0${']'.repeat(9)}`)).toThrow();
    expect(() => scanCanonicalJson(`[${'0,'.repeat(100000)}0]`)).toThrow();
    expect(() => scanCanonicalJson(' '.repeat(1048577))).toThrow();
    expect(() => scanCanonicalJson('[0,1]')).not.toThrow();
  });
});

describe('strict authoring protocol', () => {
  it('keeps library CAS, device CAS and boolean publication explicit', () => {
    expect(() =>
      encodeEditorRequest('EditorPublish', {
        requestId: 'r',
        libraryId: 'lib',
        expectedLibraryRevision: 1,
        published: 1,
      }),
    ).toThrow();
    expect(() =>
      encodeEditorRequest('EditorCreate', {
        requestId: 'r',
        name: 'n',
        scoreJson: '{}',
        deviceHandle: 'aa',
      }),
    ).toThrow();
    expect(() =>
      encodeEditorRequest('EditorTransport', {
        requestId: 'r',
        deviceHandle: 'aa',
        expectedDeviceRevision: 1,
        operation: 'seek',
        expectedSourceRevision: 2,
        tick: 5,
      }),
    ).not.toThrow();
    expect(() =>
      encodeEditorRequest('EditorLoad', { requestId: 'r', contentId, libraryId: 'lib' }),
    ).toThrow();
    expect(() =>
      encodeEditorRequest('EditorCopy', {
        requestId: 'r',
        libraryId: 'lib',
        name: 'n',
        actor: '#2',
      }),
    ).toThrow();
    expect(() =>
      decodeEditorReply(
        { requestId: 'r', status: 'ok', entries: [{ ...entry, published: 1 }] },
        'EditorList',
      ),
    ).toThrow();
    expect(() =>
      decodeEditorReply(
        { requestId: 'r', status: 'ok', uploadId: 'aa', acceptedIndex: 0, nextIndex: 2 },
        'EditorUploadChunk',
      ),
    ).toThrow();
  });
  it.each([
    '//mongoose.world/api/midi/content/',
    'https://evil.invalid/api/midi/content/',
    'https://mongoose.world:443/api/midi/content/',
    '/api/midi/content/../content/',
    '/api/midi/123/',
  ])('rejects URL aliases before secrets can be attached %s', (prefix) => {
    expect(() => assetUrl(prefix + contentId, contentId)).toThrow();
  });
  it('rejects query, fragments, wrong identity and media bearer fields', () => {
    for (const suffix of ['?x=1', '#x', '/'])
      expect(() => assetUrl(url + suffix, contentId)).toThrow();
    expect(() =>
      decodeAsset({ contentId, sha256: 'a'.repeat(64), url, byteLength: 1048579 }),
    ).toThrow();
    expect(() =>
      decodeAsset(
        { contentId, sha256: 'a'.repeat(64), url, byteLength: 100, bearer: 'a'.repeat(43) },
        contentId,
        false,
      ),
    ).toThrow();
  });
});

describe('verified bounded score delivery', () => {
  async function fixture() {
    const bytes = new TextEncoder().encode(`${encodeCanonicalScore(score)}\r\n`);
    return {
      bytes,
      descriptor: {
        contentId,
        url,
        sha256: await sha256(bytes),
        byteLength: bytes.length,
        bearer: 'x'.repeat(43),
      },
    };
  }
  it('hashes exact served bytes and caches decoded content without bearer or extra requests', async () => {
    const { bytes, descriptor } = await fixture();
    const fetcher = vi.fn(async () => new Response(bytes));
    const loader = new ScoreAssetLoader(fetcher);
    expect(await loader.load(descriptor)).toEqual(score);
    expect(await loader.load({ ...descriptor, bearer: 'y'.repeat(43) })).toEqual(score);
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher.mock.calls[0][1]).toMatchObject({
      redirect: 'error',
      credentials: 'omit',
      cache: 'no-store',
      headers: { Authorization: `Bearer ${descriptor.bearer}` },
    });
    loader.clear();
    await loader.load(descriptor);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('rejects length/hash/framing corruption and never caches it', async () => {
    const { bytes, descriptor } = await fixture();
    for (const body of [
      bytes.subarray(0, -1),
      new Uint8Array([...bytes, 0]),
      new Uint8Array(bytes.map((byte, index) => (index === 10 ? 65 : byte))),
    ]) {
      const loader = new ScoreAssetLoader(vi.fn(async () => new Response(body)));
      await expect(loader.load(descriptor)).rejects.toThrow();
    }
  });
  it('admits only two fetches, cancels queued callers and releases slots after failure', async () => {
    const { descriptor } = await fixture();
    const started: Array<AbortSignal> = [];
    const fetcher = vi.fn(
      (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          const signal = init?.signal as AbortSignal;
          started.push(signal);
          signal.addEventListener('abort', () => reject(new DOMException('abort', 'AbortError')));
        }),
    );
    const loader = new ScoreAssetLoader(fetcher);
    const abort = new AbortController();
    const first = loader.load(descriptor).catch(() => undefined),
      second = loader.load(descriptor).catch(() => undefined);
    const third = loader.load(descriptor, abort.signal);
    const rejected = expect(third).rejects.toMatchObject({ name: 'AbortError' });
    await flush();
    expect(fetcher).toHaveBeenCalledTimes(2);
    abort.abort();
    await rejected;
    loader.clear();
    await Promise.all([first, second]);
    expect(started.every((signal) => signal.aborted)).toBe(true);
  });
  it('requests a fresh source-bound grant even when asset bytes are cached', async () => {
    vi.useFakeTimers();
    const { bytes, descriptor } = await fixture();
    const fetcher = vi.fn(async () => new Response(bytes));
    const sent: Array<Record<string, unknown>> = [];
    const client = new WorldMusicClient(
      (_name, payload) => {
        const packet = JSON.parse(payload);
        sent.push(packet);
        client.receive({ requestId: packet.requestId, status: 'ok', asset: descriptor });
      },
      undefined,
      new ScoreAssetLoader(fetcher),
    );
    for (let i = 0; i < 2; i++) {
      const loading = client.loadMediaScore({
        key: 'music',
        sourceId: 'source',
        contentId,
        descriptor: { url, sha256: descriptor.sha256, byteLength: descriptor.byteLength },
        signal: new AbortController().signal,
      });
      await vi.advanceTimersByTimeAsync(260);
      await expect(loading).resolves.toEqual(score);
    }
    expect(sent).toHaveLength(2);
    expect(sent[0]).toMatchObject({
      operation: 'read',
      contentId,
      sourceId: 'source',
      mediaKey: 'music',
    });
    expect(fetcher).toHaveBeenCalledOnce();
    client.reset();
  });
});

describe('connection-owned editor requests', () => {
  it('retries a lost mutation acknowledgement with identical ID and bytes, once', async () => {
    vi.useFakeTimers();
    const send = vi.fn();
    const client = new WorldMusicClient(send);
    const pending = client.request('EditorPublish', {
      libraryId: entry.libraryId,
      expectedLibraryRevision: 1,
      published: true,
    });
    await vi.advanceTimersByTimeAsync(5001);
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0]).toEqual(send.mock.calls[1]);
    const packet = JSON.parse(send.mock.calls[1][1]);
    client.receive({
      ...entry,
      published: true,
      libraryRevision: 2,
      requestId: packet.requestId,
      status: 'ok',
    });
    await expect(pending).resolves.toMatchObject({ libraryRevision: 2 });
    client.reset();
  });
  it('never retries AssetGrant, and reset rejects pending work and ignores its late reply', async () => {
    vi.useFakeTimers();
    const send = vi.fn();
    const client = new WorldMusicClient(send);
    const pending = client.request('EditorAssetGrant', { operation: 'read', contentId });
    const rejected = expect(pending).rejects.toThrow('timed out');
    await vi.advanceTimersByTimeAsync(5100);
    await rejected;
    expect(send).toHaveBeenCalledOnce();
    const loading = client.request('EditorList', {});
    const cancelled = expect(loading).rejects.toMatchObject({ name: 'AbortError' });
    await vi.advanceTimersByTimeAsync(260);
    const old = JSON.parse(send.mock.calls[1][1]);
    client.reset();
    await cancelled;
    client.receive({ requestId: old.requestId, status: 'ok', entries: [] });
    expect(client.generation).toBe(1);
  });
  it('uploads exact canonical bytes sequentially, verifies acks and saves only staged content', async () => {
    vi.useFakeTimers();
    const large: CanonicalScore = {
      ...score,
      parts: [
        { ...score.parts[0], notes: Array.from({ length: 2000 }, () => [0, 1, 60, 100] as const) },
      ],
    };
    const text = encodeCanonicalScore(large),
      digest = await sha256(new TextEncoder().encode(text));
    const packets: Array<{ name: string; packet: Record<string, unknown> }> = [];
    const client = new WorldMusicClient((name, payload) => {
      const packet = JSON.parse(payload);
      packets.push({ name, packet });
      let fields: Record<string, unknown>;
      if (name.endsWith('EditorUploadBegin')) fields = { uploadId: 'aabb', nextIndex: 0 };
      else if (name.endsWith('EditorUploadChunk'))
        fields = { uploadId: 'aabb', acceptedIndex: packet.index, nextIndex: packet.index + 1 };
      else if (name.endsWith('EditorUploadCommit'))
        fields = { contentId, stagedContentId: contentId, sha256: digest, byteLength: text.length };
      else fields = entry;
      client.receive({ requestId: packet.requestId, status: 'ok', ...fields });
    });
    const saving = client.save({ name: 'World ~7E', score: large });
    await vi.waitFor(() => expect(packets.length).toBeGreaterThan(0));
    await vi.advanceTimersByTimeAsync(15000);
    await expect(saving).resolves.toMatchObject(entry);
    const chunks = packets.filter(({ name }) => name.endsWith('EditorUploadChunk'));
    expect(chunks.map(({ packet }) => packet.data).join('')).toBe(text);
    expect(
      chunks.every(
        ({ packet }, index) => packet.index === index && (packet.data as string).length <= 2048,
      ),
    ).toBe(true);
    expect(packets.at(-1)).toMatchObject({
      name: 'Client.Midi.EditorCreate',
      packet: { stagedContentId: contentId },
    });
    expect(packets.at(-1)?.packet.scoreJson).toBeUndefined();
    client.reset();
  });
  it('cancels owned staging after a mismatched sequential acknowledgement', async () => {
    vi.useFakeTimers();
    const large: CanonicalScore = {
      ...score,
      parts: [
        { ...score.parts[0], notes: Array.from({ length: 2000 }, () => [0, 1, 60, 100] as const) },
      ],
    };
    const names: string[] = [];
    const client = new WorldMusicClient((name, payload) => {
      names.push(name);
      const packet = JSON.parse(payload);
      const fields = name.endsWith('EditorUploadBegin')
        ? { uploadId: 'aabb', nextIndex: 0 }
        : name.endsWith('EditorUploadChunk')
          ? { uploadId: 'aabb', acceptedIndex: packet.index + 1, nextIndex: packet.index + 2 }
          : { uploadId: 'aabb' };
      client.receive({ requestId: packet.requestId, status: 'ok', ...fields });
    });
    const saving = client.save({ name: 'n', score: large });
    const failure = expect(saving).rejects.toThrow('acknowledgement mismatch');
    await vi.waitFor(() => expect(names.length).toBeGreaterThan(0));
    await vi.advanceTimersByTimeAsync(1000);
    await failure;
    expect(names.at(-1)).toBe('Client.Midi.EditorUploadCancel');
    expect(names).not.toContain('Client.Midi.EditorCreate');
    client.reset();
  });
});
