import { MAX_SHARED_FILES, putLaunchItem } from './launchInbox';
import { sanitizeLaunchText } from './launchText';
import { SHARE_PARAM } from './launchUrls';

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
  return typeof value === 'string' ? value : '';
}

/**
 * Keeps what another app shared and sends the window to the client page that
 * shows it. Any site can post a form here, so the page only drafts the text and
 * offers the files; nothing is sent from a share.
 */
export async function handleShareTarget(request: { formData(): Promise<SharedForm> }, origin: string): Promise<Response> {
  const page = new URL('/', origin);
  try {
    const form = await request.formData();
    const files = form.getAll('files').filter((value): value is File => typeof value !== 'string' && value.size > 0);
    const text = sharedDraft(field(form, 'title'), field(form, 'text'), field(form, 'url'));
    if (files.length > MAX_SHARED_FILES) {
      page.searchParams.set(SHARE_PARAM, 'too-many');
    } else if (text || files.length > 0) {
      page.searchParams.set(SHARE_PARAM, await putLaunchItem({ kind: 'share', text, files }));
    }
  } catch {
    page.searchParams.set(SHARE_PARAM, 'failed');
  }
  return Response.redirect(page.href, 303);
}
