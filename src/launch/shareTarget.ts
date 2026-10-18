import {
  LaunchInboxError,
  MAX_SHARE_BYTES,
  MAX_SHARED_FILE_BYTES,
  MAX_SHARED_FILES,
  putLaunchItem,
} from './launchInbox';
import { MAX_LAUNCH_TEXT, sanitizeLaunchText } from './launchText';
import { SHARE_PARAM } from './launchUrls';

/** Why a share was not kept, given to the page in place of a launch item id. */
export type ShareRefusal = 'too-many' | 'too-large' | 'inbox-full' | 'busy' | 'failed';

/** Room in a request body for multipart boundaries, headers and the text fields. */
const FORM_OVERHEAD_BYTES = 1024 * 1024;

/** Title, text and URL as one draft, in that order, each once. */
export function sharedDraft(title: string, text: string, url: string): string {
  const parts: string[] = [];
  for (const part of [title, text, url].map(sanitizeLaunchText)) {
    if (part && !parts.some((existing) => existing.includes(part))) parts.push(part);
  }
  return sanitizeLaunchText(parts.join(' '));
}

type SharedForm = Pick<FormData, 'get' | 'getAll'>;

function field(form: SharedForm, name: string): string {
  const value = form.get(name);
  // Bounded before any other work; a draft keeps far less than this.
  return typeof value === 'string' ? value.slice(0, MAX_LAUNCH_TEXT * 4) : '';
}

/** The most of a request body read; past it the stream is cancelled unread. */
export const MAX_SHARE_BODY_BYTES = MAX_SHARE_BYTES + FORM_OVERHEAD_BYTES;

/**
 * The body's bytes, or undefined once more than `limit` arrive. Counted as
 * they come, so neither a missing Content-Length nor a false one lets an
 * unbounded body be parsed.
 */
export async function readBoundedBody(
  body: ReadableStream<Uint8Array> | null,
  limit: number,
): Promise<Uint8Array<ArrayBuffer> | undefined> {
  if (!body) return new Uint8Array(0);
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel().catch(() => {});
      return undefined;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

/** One body is read at a time, so concurrent posts cannot hold many bounded bodies at once. */
let reading = false;

async function keepShare(request: SharedRequest): Promise<string | ShareRefusal | undefined> {
  const declared = Number(request.headers.get('Content-Length') ?? Number.NaN);
  if (declared > MAX_SHARE_BODY_BYTES) return 'too-large';
  if (reading) {
    await request.body?.cancel().catch(() => {});
    return 'busy';
  }
  reading = true;
  try {
    const bytes = await readBoundedBody(request.body, MAX_SHARE_BODY_BYTES);
    if (!bytes) return 'too-large';
    const form = await new Response(bytes, { headers: { 'Content-Type': request.headers.get('Content-Type') ?? '' } }).formData();
    return await keepParsedShare(form);
  } finally {
    reading = false;
  }
}

/** The share's limits on files and text, once its body is known to be bounded. */
export async function keepParsedShare(form: SharedForm): Promise<string | ShareRefusal | undefined> {
  const files = form.getAll('files').filter((value): value is File => typeof value !== 'string' && value.size > 0);
  if (files.length > MAX_SHARED_FILES) return 'too-many';
  const total = files.reduce((sum, file) => sum + file.size, 0);
  if (files.some((file) => file.size > MAX_SHARED_FILE_BYTES) || total > MAX_SHARE_BYTES) return 'too-large';
  const text = sharedDraft(field(form, 'title'), field(form, 'text'), field(form, 'url'));
  if (!text && files.length === 0) return undefined;
  try {
    return await putLaunchItem({ kind: 'share', text, files });
  } catch (error) {
    if (error instanceof LaunchInboxError) return error.reason;
    throw error;
  }
}

interface SharedRequest {
  headers: Pick<Headers, 'get'>;
  body: ReadableStream<Uint8Array> | null;
}

/**
 * Keeps what another app shared and sends the window to the client page that
 * shows it. Any site can post a form here, with no gesture from the player,
 * so the share is bounded (see launchInbox) and the page only drafts the text
 * and offers the files; nothing is sent from a share.
 */
export async function handleShareTarget(request: SharedRequest, origin: string): Promise<Response> {
  const page = new URL('/', origin);
  let outcome: string | undefined;
  try {
    outcome = await keepShare(request);
  } catch {
    outcome = 'failed' satisfies ShareRefusal;
  }
  if (outcome) page.searchParams.set(SHARE_PARAM, outcome);
  return Response.redirect(page.href, 303);
}
