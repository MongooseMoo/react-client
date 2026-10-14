import { resolveApiUrl } from './apiOrigin';
import { acceptAwayEnvelope, closeAwayStream, findBrowserAwayGrant, isAwayEnvelope,
  readAwayStream, sameRecipient, type AwayEnvelope, type BrowserAwayGrant, type BrowserRecipient } from './awayV2';
import { findRefreshableBrowserAwayGrant, isRecipient, registerAwayRecipient } from './awayV2';
import { isBrowserProfile, readEnrollmentState, saveEnrollmentState } from './browserInstallation';

export class BrowserAwayHttpError extends Error {
  constructor(readonly status: number) { super(status === 401
    ? 'Sign in to this character to renew its browser session' : `Away request failed (${status})`); }
}

async function request(path: string, grant: BrowserAwayGrant, body?: unknown): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(resolveApiUrl(path), { method: body === undefined ? 'GET' : 'POST',
      headers: { Authorization: `Bearer ${grant.token}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: controller.signal });
    if (!response.ok) throw new BrowserAwayHttpError(response.status);
    return await response.json();
  } finally { clearTimeout(timeout); }
}

function readEnvelope(value: unknown, recipient: BrowserRecipient): AwayEnvelope | 0 {
  if (typeof value !== 'object' || value === null || !('envelope' in value)) throw new Error('Invalid away response');
  if (value.envelope === 0) return 0;
  if (!isAwayEnvelope(value.envelope) || !sameRecipient(value.envelope, recipient)) throw new Error('Away response ownership changed');
  return value.envelope;
}

export function browserNotificationTag(recipient: BrowserRecipient, kind = 'room'): string {
  return `mongoose:v2:${JSON.stringify([recipient.serverKey, recipient.installationId, recipient.playerUuid, recipient.bindingId, kind])}`;
}

export async function refreshBrowserAwayGrant(recipient: BrowserRecipient): Promise<BrowserAwayGrant | undefined> {
  const previous = await findRefreshableBrowserAwayGrant(recipient);
  const state = await readEnrollmentState(recipient.serverKey, recipient.installationId);
  if (!previous || !state) return;
  const value = await request('/api/away/browser_refresh', previous, {});
  if (typeof value !== 'object' || value === null || !('grant' in value) || !isRecipient(value.grant) ||
      !('installation' in value) || !isBrowserProfile(value.installation) || value.installation.id !== recipient.installationId) throw new Error('Invalid browser credential replacement');
  const grant = value.grant;
  if (grant.serverKey !== previous.serverKey || grant.installationId !== previous.installationId ||
      grant.playerUuid !== previous.playerUuid || grant.playerRef !== previous.playerRef || grant.bindingId !== previous.bindingId ||
      !('sessionId' in grant) || grant.sessionId !== previous.sessionId || !('token' in grant) || typeof grant.token !== 'string' || !grant.token ||
      !('expires_at' in grant) || typeof grant.expires_at !== 'number' || grant.expires_at > previous.expires_at || grant.expires_at * 1000 <= Date.now()) throw new Error('Browser credential replacement ownership changed');
  const fresh: BrowserAwayGrant = { ...recipient, ...grant, version: 2, token: grant.token,
    sessionId: previous.sessionId, expires_at: grant.expires_at };
  if (!await saveEnrollmentState(recipient.serverKey, { profile: value.installation, subscription: state.subscription })) return;
  const binding = value.installation.bindings.find(candidate => sameRecipient(candidate, fresh));
  if (!binding || binding.mode === 'forgotten') return;
  const enabled = !value.installation.quiet && binding.mode !== 'suspended';
  if (!await registerAwayRecipient(fresh, fresh, enabled)) return;
  return fresh;
}

/** Persist a contiguous receipt before acknowledging it. Provider acceptance
 * and another tab's render cursor never serve as acknowledgment. */
export async function receiveBrowserAway(envelope: AwayEnvelope): Promise<boolean> {
  let result = await acceptAwayEnvelope(envelope);
  if (!result.accepted) return false;
  const grant = await findBrowserAwayGrant(envelope);
  if (!grant) return true;
  let current = envelope;
  for (let attempt = 0; result.gap && attempt < 3; attempt++) {
    const query = new URLSearchParams({ after: String(result.highest), streamId: current.streamId });
    const response = readEnvelope(await request(`/api/away/browser_lines?${query}`, grant), envelope);
    if (response === 0) { await closeAwayStream(envelope, current.streamId); return true; }
    const previous = result.highest;
    result = await acceptAwayEnvelope(response);
    if (!result.accepted) return false;
    current = response;
    if (current.streamId === envelope.streamId && result.highest === previous && result.gap) break;
  }
  await request('/api/away/browser_ack', grant, { streamId: current.streamId, seq: result.highest });
  return true;
}

export async function fetchBrowserAway(recipient: BrowserRecipient, grant: BrowserAwayGrant): Promise<void> {
  if (!sameRecipient(recipient, grant) || grant.expires_at * 1000 <= Date.now()) throw new Error('Away session expired');
  const cursor = await readAwayStream(recipient);
  const query = new URLSearchParams({ after: String(cursor?.highest ?? 0), streamId: cursor?.id ?? '' });
  const response = readEnvelope(await request(`/api/away/browser_lines?${query}`, grant), recipient);
  if (response === 0) {
    if (cursor) await closeAwayStream(recipient, cursor.id);
    return;
  }
  await receiveBrowserAway(response);
}

export async function sendBrowserAwayCommand(recipient: BrowserRecipient, grant: BrowserAwayGrant, line: string): Promise<void> {
  if (!sameRecipient(recipient, grant) || grant.expires_at * 1000 <= Date.now()) throw new Error('Away session expired');
  const response = readEnvelope(await request('/api/away/browser_command', grant, { line }), recipient);
  if (response !== 0) await receiveBrowserAway(response);
}
