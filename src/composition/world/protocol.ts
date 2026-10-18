import { asciiJson, CONTENT_ID, decodeCanonicalScore } from './canonicalAscii';

export const EDITOR_OPERATIONS = [
  'EditorOpen',
  'EditorList',
  'EditorLoad',
  'EditorCreate',
  'EditorSave',
  'EditorCopy',
  'EditorDelete',
  'EditorPublish',
  'EditorTransport',
  'EditorAssetGrant',
  'EditorUploadBegin',
  'EditorUploadChunk',
  'EditorUploadCommit',
  'EditorUploadCancel',
] as const;
export type EditorOperation = (typeof EDITOR_OPERATIONS)[number];
export type EditorReply = Record<string, unknown> & { requestId: string; status: string };
export interface ScoreAssetDescriptor {
  readonly contentId: string;
  readonly sha256: string;
  readonly byteLength: number;
  readonly url: string;
  readonly bearer?: string;
}
export const TRANSPORT_OPERATIONS = ['play', 'apply', 'pause', 'resume', 'seek', 'stop'] as const;
const fail = (): never => {
  throw new TypeError('Invalid world music protocol data');
};
export const object = (input: unknown): Record<string, unknown> => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return fail();
  return input as Record<string, unknown>;
};
const ascii = (value: unknown, maximum = 128): value is string =>
  typeof value === 'string' &&
  value.length > 0 &&
  value.length <= maximum &&
  /^[\x20-\x7e]+$/.test(value) &&
  !value.includes('\\~');
const integer = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const hex = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{1,128}$/.test(value);
const uuid = (value: unknown): value is string =>
  typeof value === 'string' && CONTENT_ID.test(value);
const hash = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{64}$/.test(value);
export function assetUrl(url: string, contentId: string): string {
  if (
    !uuid(contentId) ||
    ![
      `/api/midi/content/${contentId}`,
      `/api/midi/published/${contentId}`,
      `https://mongoose.world/api/midi/content/${contentId}`,
      `https://mongoose.world/api/midi/published/${contentId}`,
    ].includes(url)
  )
    fail();
  return new URL(url, 'https://mongoose.world').href;
}
export function decodeAsset(
  input: unknown,
  expectedContentId?: string,
  allowBearer = true,
): ScoreAssetDescriptor {
  const raw = object(input);
  if (
    Object.keys(raw).some(
      (key) => !['contentId', 'sha256', 'byteLength', 'url', 'bearer'].includes(key),
    ) ||
    !uuid(raw.contentId) ||
    (expectedContentId !== undefined && raw.contentId !== expectedContentId) ||
    !hash(raw.sha256) ||
    !integer(raw.byteLength) ||
    raw.byteLength < 3 ||
    raw.byteLength > 1048578 ||
    typeof raw.url !== 'string'
  )
    fail();
  const url = assetUrl(raw.url as string, raw.contentId as string);
  if (
    raw.bearer !== undefined &&
    (!allowBearer || typeof raw.bearer !== 'string' || !/^[A-Za-z0-9_-]{16,256}$/.test(raw.bearer))
  )
    fail();
  if (url.includes('/published/') && raw.bearer !== undefined) fail();
  return {
    contentId: raw.contentId as string,
    sha256: raw.sha256 as string,
    byteLength: raw.byteLength as number,
    url,
    ...(raw.bearer === undefined ? {} : { bearer: raw.bearer as string }),
  };
}

const requestFields: Record<EditorOperation, readonly string[]> = {
  EditorOpen: ['deviceId'],
  EditorList: ['scope', 'cursor'],
  EditorLoad: ['libraryId', 'contentId'],
  EditorCreate: ['name', 'scoreJson', 'stagedContentId', 'deviceHandle', 'expectedDeviceRevision'],
  EditorSave: [
    'libraryId',
    'expectedLibraryRevision',
    'name',
    'scoreJson',
    'stagedContentId',
    'deviceHandle',
    'expectedDeviceRevision',
  ],
  EditorCopy: ['libraryId', 'name'],
  EditorDelete: ['libraryId', 'expectedLibraryRevision'],
  EditorPublish: ['libraryId', 'expectedLibraryRevision', 'published'],
  EditorTransport: [
    'deviceHandle',
    'expectedDeviceRevision',
    'operation',
    'expectedSourceRevision',
    'libraryId',
    'expectedLibraryRevision',
    'tick',
  ],
  EditorAssetGrant: ['operation', 'contentId', 'sourceId', 'mediaKey', 'deviceHandle'],
  EditorUploadBegin: ['contentId', 'byteLength', 'sha256'],
  EditorUploadChunk: ['uploadId', 'index', 'data'],
  EditorUploadCommit: ['uploadId'],
  EditorUploadCancel: ['uploadId'],
};
export function encodeEditorRequest(
  operation: EditorOperation,
  input: Record<string, unknown>,
): string {
  if (typeof input.requestId !== 'string' || !/^[a-z0-9-]{1,64}$/.test(input.requestId)) fail();
  if (
    Object.keys(input).some((key) => key !== 'requestId' && !requestFields[operation].includes(key))
  )
    fail();
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) fail();
    if (
      ['libraryId', 'deviceId', 'sourceId', 'mediaKey', 'cursor', 'name'].includes(key) &&
      !ascii(value)
    )
      fail();
    if (['contentId', 'stagedContentId'].includes(key) && !uuid(value)) fail();
    if (['deviceHandle', 'uploadId'].includes(key) && !hex(value)) fail();
    if (
      [
        'expectedLibraryRevision',
        'expectedDeviceRevision',
        'expectedSourceRevision',
        'tick',
        'index',
        'byteLength',
      ].includes(key) &&
      !integer(value)
    )
      fail();
  }
  const require = (...fields: string[]) => {
    if (fields.some((key) => input[key] === undefined)) fail();
  };
  switch (operation) {
    case 'EditorOpen':
      require('deviceId');
      break;
    case 'EditorList':
      if (input.scope !== undefined && input.scope !== 'mine' && input.scope !== 'public') fail();
      break;
    case 'EditorLoad':
      if (Number(input.libraryId !== undefined) + Number(input.contentId !== undefined) !== 1)
        fail();
      break;
    case 'EditorCreate':
    case 'EditorSave':
      require('name');
      if (
        Number(input.scoreJson !== undefined) + Number(input.stagedContentId !== undefined) !== 1 ||
        (input.deviceHandle !== undefined) !== (input.expectedDeviceRevision !== undefined) ||
        (input.scoreJson !== undefined && typeof input.scoreJson !== 'string')
      )
        fail();
      if (operation === 'EditorSave') require('libraryId', 'expectedLibraryRevision');
      if (typeof input.scoreJson === 'string') {
        if (input.scoreJson.length > 16384)
          throw new RangeError('World music request exceeds 16 KiB');
        decodeCanonicalScore(input.scoreJson);
      }
      break;
    case 'EditorCopy':
      require('libraryId', 'name');
      break;
    case 'EditorDelete':
      require('libraryId', 'expectedLibraryRevision');
      break;
    case 'EditorPublish':
      require('libraryId', 'expectedLibraryRevision', 'published');
      if (typeof input.published !== 'boolean') fail();
      break;
    case 'EditorTransport': {
      require('deviceHandle', 'expectedDeviceRevision', 'operation');
      const op = input.operation;
      if (!(TRANSPORT_OPERATIONS as readonly unknown[]).includes(op)) fail();
      if (op !== 'play') require('expectedSourceRevision');
      else if (input.expectedSourceRevision !== undefined) fail();
      if (op === 'play' || op === 'apply') require('libraryId', 'expectedLibraryRevision');
      else if (input.libraryId !== undefined || input.expectedLibraryRevision !== undefined) fail();
      if (op === 'seek') require('tick');
      else if (input.tick !== undefined) fail();
      break;
    }
    case 'EditorAssetGrant':
      require('operation', 'contentId');
      if (
        input.operation !== 'read' ||
        (input.sourceId !== undefined) !== (input.mediaKey !== undefined) ||
        (input.deviceHandle !== undefined && input.sourceId !== undefined)
      )
        fail();
      break;
    case 'EditorUploadBegin':
      require('contentId', 'byteLength', 'sha256');
      if (
        !hash(input.sha256) ||
        (input.byteLength as number) < 1 ||
        (input.byteLength as number) > 1048576
      )
        fail();
      break;
    case 'EditorUploadChunk':
      require('uploadId', 'index', 'data');
      if (
        (input.index as number) >= 512 ||
        typeof input.data !== 'string' ||
        input.data.length < 1 ||
        input.data.length > 2048 ||
        !/^[\x20-\x7e]+$/.test(input.data)
      )
        fail();
      break;
    case 'EditorUploadCommit':
    case 'EditorUploadCancel':
      require('uploadId');
      break;
  }
  const encoded = asciiJson(input);
  if (encoded.length > 16384) throw new RangeError('World music request exceeds 16 KiB');
  return encoded;
}

const replyFields: Record<EditorOperation, readonly string[]> = {
  EditorOpen: ['deviceHandle', 'deviceRevision', 'allowedOperations'],
  EditorList: ['entries', 'cursor'],
  EditorLoad: [
    'contentId',
    'scoreJson',
    'asset',
    'libraryId',
    'libraryRevision',
    'name',
    'published',
    'canEdit',
  ],
  EditorCreate: [
    'libraryId',
    'contentId',
    'libraryRevision',
    'name',
    'published',
    'canEdit',
    'deviceRevision',
  ],
  EditorSave: [
    'libraryId',
    'contentId',
    'libraryRevision',
    'name',
    'published',
    'canEdit',
    'deviceRevision',
  ],
  EditorCopy: ['libraryId', 'contentId', 'libraryRevision', 'name', 'published', 'canEdit'],
  EditorPublish: ['libraryId', 'contentId', 'libraryRevision', 'name', 'published', 'canEdit'],
  EditorDelete: ['libraryId', 'libraryRevision'],
  EditorTransport: [
    'deviceRevision',
    'sourceId',
    'sourceRevision',
    'effectiveServerMs',
    'replaceFromTick',
  ],
  EditorAssetGrant: ['asset'],
  EditorUploadBegin: ['uploadId', 'nextIndex'],
  EditorUploadChunk: ['uploadId', 'acceptedIndex', 'nextIndex'],
  EditorUploadCommit: ['contentId', 'stagedContentId', 'byteLength', 'sha256'],
  EditorUploadCancel: ['uploadId'],
};
const entry = (input: unknown): void => {
  const raw = object(input);
  if (
    Object.keys(raw).some(
      (key) =>
        !['libraryId', 'contentId', 'libraryRevision', 'name', 'published', 'canEdit'].includes(
          key,
        ),
    ) ||
    !ascii(raw.libraryId) ||
    !uuid(raw.contentId) ||
    !integer(raw.libraryRevision) ||
    !ascii(raw.name) ||
    typeof raw.published !== 'boolean' ||
    typeof raw.canEdit !== 'boolean'
  )
    fail();
};
export function decodeEditorReply(input: unknown, operation?: EditorOperation): EditorReply {
  const raw = object(input);
  if (
    typeof raw.requestId !== 'string' ||
    !/^[a-z0-9-]{1,64}$/.test(raw.requestId) ||
    !['ok', 'denied', 'stale', 'invalid', 'unavailable', 'tooLarge', 'unsupported'].includes(
      raw.status as string,
    )
  )
    fail();
  if (
    raw.message !== undefined &&
    (typeof raw.message !== 'string' ||
      new TextEncoder().encode(raw.message).length > 256 ||
      Array.from(raw.message).some((char) => {
        const code = char.charCodeAt(0);
        return code < 32 || (code >= 127 && code <= 159);
      }))
  )
    fail();
  if (asciiJson(raw).length > 16384) fail();
  if (!operation) return raw as EditorReply;
  const allowed = raw.status === 'ok' ? replyFields[operation] : [];
  if (Object.keys(raw).some((key) => !['requestId', 'status', 'message', ...allowed].includes(key)))
    fail();
  if (raw.status !== 'ok') return raw as EditorReply;
  const require = (...keys: string[]) => {
    if (keys.some((key) => raw[key] === undefined)) fail();
  };
  for (const [key, value] of Object.entries(raw)) {
    if (
      [
        'deviceRevision',
        'libraryRevision',
        'sourceRevision',
        'nextIndex',
        'acceptedIndex',
        'replaceFromTick',
        'byteLength',
      ].includes(key) &&
      !integer(value)
    )
      fail();
    if (
      key === 'effectiveServerMs' &&
      (typeof value !== 'number' || !Number.isFinite(value) || value < 0)
    )
      fail();
    if (['libraryId', 'sourceId', 'name', 'cursor'].includes(key) && !ascii(value)) fail();
    if (['contentId', 'stagedContentId'].includes(key) && !uuid(value)) fail();
    if (['deviceHandle', 'uploadId'].includes(key) && !hex(value)) fail();
    if (['published', 'canEdit'].includes(key) && typeof value !== 'boolean') fail();
  }
  switch (operation) {
    case 'EditorOpen':
      require('deviceHandle', 'deviceRevision', 'allowedOperations');
      if (
        !Array.isArray(raw.allowedOperations) ||
        raw.allowedOperations.length > 6 ||
        raw.allowedOperations.some(
          (op) => !(TRANSPORT_OPERATIONS as readonly unknown[]).includes(op),
        ) ||
        new Set(raw.allowedOperations).size !== raw.allowedOperations.length
      )
        fail();
      break;
    case 'EditorList':
      require('entries');
      if (!Array.isArray(raw.entries) || raw.entries.length > 32) fail();
      for (const row of raw.entries as unknown[]) entry(row);
      break;
    case 'EditorLoad':
      require('contentId');
      if (
        Number(raw.scoreJson !== undefined) + Number(raw.asset !== undefined) !== 1 ||
        (raw.scoreJson !== undefined && typeof raw.scoreJson !== 'string')
      )
        fail();
      if (raw.asset !== undefined) decodeAsset(raw.asset, raw.contentId as string);
      break;
    case 'EditorCreate':
    case 'EditorSave':
    case 'EditorCopy':
    case 'EditorPublish':
      entry(
        Object.fromEntries(
          ['libraryId', 'contentId', 'libraryRevision', 'name', 'published', 'canEdit'].map(
            (key) => [key, raw[key]],
          ),
        ),
      );
      break;
    case 'EditorDelete':
      require('libraryId', 'libraryRevision');
      break;
    case 'EditorTransport':
      require('deviceRevision', 'sourceId', 'sourceRevision');
      break;
    case 'EditorAssetGrant':
      require('asset');
      decodeAsset(raw.asset);
      break;
    case 'EditorUploadBegin':
      require('uploadId', 'nextIndex');
      if (raw.nextIndex !== 0) fail();
      break;
    case 'EditorUploadChunk':
      require('uploadId', 'acceptedIndex', 'nextIndex');
      if (raw.nextIndex !== (raw.acceptedIndex as number) + 1) fail();
      break;
    case 'EditorUploadCommit':
      require('contentId', 'stagedContentId', 'byteLength', 'sha256');
      if (
        !hash(raw.sha256) ||
        raw.stagedContentId !== raw.contentId ||
        (raw.byteLength as number) > 1048576
      )
        fail();
      break;
    case 'EditorUploadCancel':
      require('uploadId');
      break;
  }
  return raw as EditorReply;
}
