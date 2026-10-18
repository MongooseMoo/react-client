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
export type ShareRefusal = 'too-many' | 'too-large' | 'inbox-full' | 'failed';

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

async function keepShare(request: SharedRequest): Promise<string | ShareRefusal | undefined> {
  const declared = Number(request.headers?.get('Content-Length') ?? Number.NaN);
  if (declared > MAX_SHARE_BYTES + FORM_OVERHEAD_BYTES) return 'too-large';
  const form = await request.formData();
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
  headers?: Pick<Headers, 'get'>;
  formData(): Promise<SharedForm>;
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
