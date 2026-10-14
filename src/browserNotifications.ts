import { create } from 'zustand';
import type MudClient from './client';
import { resolveApiUrl } from './apiOrigin';
import { isRecipient, registerAwayRecipient, sameRecipient, disableAwayRecipient,
  recipientMetadata,
  type BrowserAwayGrant, type BrowserRecipient } from './awayV2';
import { isBrowserProfile, readEnrollmentState, saveEnrollmentState, type BrowserProfile } from './browserInstallation';
import { usePersonalDataStore } from './stores/personalDataStore';
import type { SessionGrant } from './tabSession';
import type { EnrollmentToken } from './gmcp/Client/WebPush';
import { useBrowserPolicy } from './browserPolicy';
import { urlBase64ToUint8Array } from './webpush';

export const MONGOOSE_SERVER_KEY = 'https://mongoose.world';
export interface BrowserNotificationContext {
  recipient: BrowserRecipient;
  grant: BrowserAwayGrant;
  sessionId: string;
  profile: BrowserProfile;
}
interface BrowserNotificationsState {
  context?: BrowserNotificationContext;
  busy: boolean;
  error: string;
}
export const useBrowserNotifications = create<BrowserNotificationsState>(() => ({ busy: false, error: '' }));

function isAwayGrant(value: unknown): value is BrowserAwayGrant {
  return isRecipient(value) && 'version' in value && value.version === 2 &&
    'sessionId' in value && typeof value.sessionId === 'string' && !!value.sessionId &&
    'token' in value && typeof value.token === 'string' && !!value.token &&
    'expires_at' in value && typeof value.expires_at === 'number' && value.expires_at * 1000 > Date.now();
}

class BrowserHttpError extends Error {
  constructor(readonly status: number) { super(`Browser notification request failed (${status})`); }
}
async function request(path: string, token: string, body?: unknown): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(resolveApiUrl(path), { method: body === undefined ? 'GET' : 'POST',
      headers: { Authorization: `Bearer ${token}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: controller.signal });
    if (!response.ok) throw new BrowserHttpError(response.status);
    return await response.json();
  } finally { clearTimeout(timeout); }
}

function current(client: MudClient, owner: SessionGrant, generation: number, resumeOwner = false): boolean {
  const grant = client.gmcp.require('Auth.Autologin').currentGrant;
  const personal = usePersonalDataStore.getState();
  const policy = useBrowserPolicy.getState();
  const ownerResume = resumeOwner && policy.ready && policy.policy.phase === 'owner-paused' &&
    policy.policy.ownerPlayers.includes(owner.playerUuid) && owner.purpose !== 'visitor';
  return client.liveServer && client.connected && client.gmcp.generation === generation &&
    grant?.sessionId === owner.sessionId && grant.playerUuid === owner.playerUuid &&
    grant.installationId === owner.installationId && (!personal.visitor || ownerResume) && personal.owner?.playerUuid === owner.playerUuid;
}

async function serial<T>(installationId: string, work: () => Promise<T>): Promise<T> {
  if (navigator.locks) return navigator.locks.request(`mongoose:browser-notifications:${installationId}`, work);
  return work(); // The server's expected revisions also arbitrate concurrent pages.
}

function parseEnrollment(value: unknown, token: EnrollmentToken): BrowserNotificationContext {
  if (typeof value !== 'object' || value === null || !('recipient' in value) || !('grant' in value) || !('installation' in value) ||
      !isRecipient(value.recipient) || !isAwayGrant(value.grant) || !isBrowserProfile(value.installation)) throw new Error('Invalid browser notification response');
  const recipient = recipientMetadata(value.recipient);
  if (!sameRecipient(recipient, value.grant) || recipient.serverKey !== token.serverKey ||
      recipient.installationId !== token.installationId || recipient.playerUuid !== token.playerUuid ||
      recipient.playerRef !== token.playerRef || value.grant.sessionId !== token.sessionId ||
      value.installation.id !== token.installationId) throw new Error('Browser notification ownership changed');
  return { recipient, grant: value.grant, sessionId: token.sessionId, profile: value.installation };
}

export async function enrollBrowserNotifications(client: MudClient, requestPermission = false, resumeOwner = false): Promise<void> {
  if (!client.liveServer || !client.connected || (usePersonalDataStore.getState().visitor && !resumeOwner) ||
      !('Notification' in window) || !('serviceWorker' in navigator)) return;
  const owner = client.gmcp.require('Auth.Autologin').currentGrant;
  if (!owner || owner.purpose === 'visitor') return;
  const generation = client.gmcp.generation;
  let permission = Notification.permission;
  if (requestPermission && permission === 'default') permission = await Notification.requestPermission();
  const stillCurrent = () => current(client, owner, generation, resumeOwner);
  if (permission !== 'granted' || !stillCurrent()) return;
  useBrowserNotifications.setState({ busy: true, error: '' });
  try {
    await serial(owner.installationId, async () => {
      if (!stillCurrent()) return;
      const token = await client.gmcp.require('Client.WebPush').requestSessionToken(owner);
      if (!token || token.serverKey !== MONGOOSE_SERVER_KEY || !stillCurrent()) return;
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        const result = await request('/api/webpush/browser_key', token.token);
        if (typeof result !== 'object' || result === null || !('public_key_b64url' in result) || typeof result.public_key_b64url !== 'string') throw new Error('Push public key unavailable');
        if (!stillCurrent()) return;
        subscription = await registration.pushManager.subscribe({ userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(result.public_key_b64url) });
      }
      const material = subscription.toJSON();
      const previous = await readEnrollmentState(token.serverKey, token.installationId);
      for (let attempt = 0; attempt < 3; attempt++) {
        if (!stillCurrent()) return;
        const profile = await request('/api/webpush/browser_profile', token.token,
          { subscription: material, previousSubscription: previous?.subscription });
        if (!isBrowserProfile(profile) || profile.id !== token.installationId) throw new Error('Invalid browser profile');
        const binding = profile.bindings.find(candidate => candidate.playerUuid === token.playerUuid && candidate.playerRef === token.playerRef);
        const options = { operationId: crypto.randomUUID(), installationRevision: profile.revision,
          bindingRevision: binding?.revision ?? 0, previousSubscription: previous?.subscription };
        if (!stillCurrent()) return;
        let response: unknown;
        try { response = await request('/api/webpush/bindings', token.token, { subscription: material, options }); }
        catch (error) { if (error instanceof BrowserHttpError && error.status === 409 && attempt < 2) continue; throw error; }
        const context = parseEnrollment(response, token);
        if (!stillCurrent()) return;
        if (!await saveEnrollmentState(token.serverKey, { profile: context.profile, subscription: material })) return;
        for (const candidate of context.profile.bindings) {
          if (candidate.mode === 'forgotten' || candidate.mode === 'suspended' || context.profile.quiet) await disableAwayRecipient(candidate);
        }
        if (!await registerAwayRecipient(context.grant, context.recipient, !context.profile.quiet)) return;
        if (!stillCurrent()) return;
        useBrowserNotifications.setState({ context });
        registration.active?.postMessage({ type: 'browser-owner', recipient: context.recipient,
          sessionId: context.sessionId, connected: client.connected });
        return;
      }
    });
  } catch (error) {
    if (stillCurrent()) useBrowserNotifications.setState({ error: error instanceof Error ? error.message : 'Browser notifications could not be enabled' });
  } finally { if (stillCurrent()) useBrowserNotifications.setState({ busy: false }); }
}

export async function manageBrowserNotifications(context: BrowserNotificationContext, operation: string, kind?: string, workerRegistration?: ServiceWorkerRegistration): Promise<BrowserNotificationContext | undefined> {
  return serial(context.recipient.installationId, async () => {
    const registration = workerRegistration ?? await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    const saved = await readEnrollmentState(context.recipient.serverKey, context.recipient.installationId);
    const material = subscription?.toJSON() ?? saved?.subscription;
    if (!material) throw new Error('Browser push subscription unavailable');
    const result = await request('/api/webpush/browser_control', context.grant.token, {
      subscription: material, action: { operation, kind, installationRevision: context.profile.revision },
    });
    if (typeof result !== 'object' || result === null || !('installation' in result) || !isBrowserProfile(result.installation) ||
        result.installation.id !== context.recipient.installationId) throw new Error('Invalid browser notification response');
    if (!await saveEnrollmentState(context.recipient.serverKey, { profile: result.installation, subscription: material })) {
      throw new Error('Browser settings changed in another tab; reconnect this character to refresh them');
    }
    for (const binding of result.installation.bindings) {
      if (result.installation.quiet || binding.mode === 'forgotten' || binding.mode === 'suspended') await disableAwayRecipient(binding);
    }
    if (operation === 'forget') { await disableAwayRecipient(context.recipient); return; }
    if (!('grant' in result) || !isAwayGrant(result.grant) || result.grant.bindingId !== context.recipient.bindingId ||
        result.grant.playerUuid !== context.recipient.playerUuid || result.grant.playerRef !== context.recipient.playerRef ||
        result.grant.serverKey !== context.recipient.serverKey ||
        result.grant.installationId !== context.recipient.installationId || result.grant.sessionId !== context.sessionId) throw new Error('Browser notification ownership changed');
    const next = { recipient: recipientMetadata(result.grant), grant: result.grant, sessionId: context.sessionId, profile: result.installation };
    if (!await registerAwayRecipient(next.grant, next.recipient, !next.profile.quiet)) {
      throw new Error('Browser settings changed in another tab; reconnect this character to refresh them');
    }
    return next;
  });
}
