import { findBrowserAwayGrant, isAwayEnvelope, isRecipient, readAwayTab, sameRecipient,
  rememberAwayTab, forgetAwayTab, type BrowserRecipient } from './awayV2';
import { recipientMetadata } from './awayV2';
import { disableAwayRecipient, isAwayRecipientEnabled } from './awayV2';
import { readEnrollmentState } from './browserInstallation';
import { BrowserAwayHttpError, browserNotificationTag, fetchBrowserAway, receiveBrowserAway, refreshBrowserAwayGrant } from './browserAway';
import { manageBrowserNotifications, MONGOOSE_SERVER_KEY } from './browserNotifications';

type NotificationOptionsWithActions = NotificationOptions & { actions?: Array<{ action: string; title: string }>; renotify?: boolean };

function sameOwner(a: BrowserRecipient, b: BrowserRecipient): boolean {
  return a.serverKey === b.serverKey && a.installationId === b.installationId &&
    a.playerUuid === b.playerUuid && a.playerRef === b.playerRef && a.bindingId === b.bindingId;
}

async function genericNotification(scope: ServiceWorkerGlobalScope, expired = false): Promise<void> {
  await scope.registration.showNotification('Mongoose', {
    body: expired ? 'This notification has expired.' : 'Open Mongoose to review a notification.',
    tag: 'mongoose-unaddressed', silent: true, data: { unaddressed: true },
  });
}

export async function handleBrowserPush(scope: ServiceWorkerGlobalScope, value: unknown): Promise<void> {
  const payload = typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
  if (!isRecipient(payload.data) || !('version' in payload.data) || payload.data.version !== 2 || payload.data.serverKey !== MONGOOSE_SERVER_KEY) {
    await genericNotification(scope);
    return;
  }
  const recipient = recipientMetadata(payload.data);
  const envelope = isAwayEnvelope(payload.data) ? payload.data : undefined;
  const state = await readEnrollmentState(recipient.serverKey, recipient.installationId);
  const binding = state?.profile.bindings.find(candidate => sameRecipient(candidate, recipient));
  const windows = await scope.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  let activeOwner = false;
  for (const client of windows) {
    const owner = await readAwayTab(client.id);
    if (owner?.connected && sameRecipient(owner.recipient, recipient)) activeOwner = true;
  }
  if (!binding || state?.profile.quiet || binding.mode === 'forgotten' || binding.mode === 'suspended' ||
      !(binding.primary || binding.mode === 'retained' || activeOwner)) {
    await genericNotification(scope, true);
    return;
  }
  const kind = typeof payload.kind === 'string' && payload.kind.length <= 64 ? payload.kind : 'room';
  if (binding.stoppedKinds.includes(kind)) { await genericNotification(scope, true); return; }
  const grant = await findBrowserAwayGrant(recipient) ?? await refreshBrowserAwayGrant(recipient);
  if (!grant || !await isAwayRecipientEnabled(recipient)) { await genericNotification(scope, true); return; }
  const options: NotificationOptionsWithActions = {
    body: typeof payload.body === 'string' ? payload.body.slice(0, 4000) : '',
    tag: browserNotificationTag(recipient, kind),
    silent: !!payload.silent,
    renotify: !payload.silent,
    data: { recipient, kind, ...(envelope ? { streamId: envelope.streamId } : {}) },
    ...(grant ? { actions: [{ action: 'stop-kind', title: 'Stop these' }] } : {}),
  };
  try {
    let received = true;
    if (envelope) received = await receiveBrowserAway(envelope);
    else await fetchBrowserAway(recipient, grant);
    if (!received || !await isAwayRecipientEnabled(recipient)) { await genericNotification(scope, true); return; }
  } catch (error) {
    if (error instanceof BrowserAwayHttpError && error.status === 401) {
      await disableAwayRecipient(recipient);
      await genericNotification(scope, true);
      return;
    }
    // Lines already committed remain available even if catch-up/acknowledgment
    // is temporarily unavailable. Credentials and HTTP bodies stay out of logs.
    console.error('Browser away synchronization failed');
  }
  await scope.registration.showNotification(typeof payload.title === 'string' ? payload.title.slice(0, 200) : 'Mongoose', options);
  for (const client of windows) {
    const owner = await readAwayTab(client.id);
    if (owner && sameRecipient(owner.recipient, recipient)) client.postMessage({ type: 'browser-away', recipient });
  }
}

export async function handleBrowserOwnerMessage(event: ExtendableMessageEvent): Promise<void> {
  const client = event.source;
  if (!client || !('id' in client)) return;
  const data: unknown = event.data;
  if (typeof data !== 'object' || data === null || !('type' in data)) return;
  if (data.type === 'browser-owner-clear') { await forgetAwayTab(client.id); return; }
  if (data.type === 'browser-owner' && 'recipient' in data && isRecipient(data.recipient) &&
      'sessionId' in data && typeof data.sessionId === 'string' && 'connected' in data && typeof data.connected === 'boolean') {
    await rememberAwayTab(client.id, data.recipient, data.sessionId, data.connected);
  }
}

async function currentOwner(client: WindowClient): Promise<BrowserRecipient | undefined> {
  const channel = new MessageChannel();
  return new Promise(resolve => {
    const finish = (owner?: BrowserRecipient) => {
      clearTimeout(timeout); channel.port1.close(); channel.port2.close(); resolve(owner);
    };
    const timeout = setTimeout(() => finish(), 500);
    channel.port1.onmessage = event => {
      const value: unknown = event.data;
      finish(typeof value === 'object' && value !== null && 'recipient' in value && isRecipient(value.recipient) ? value.recipient : undefined);
    };
    client.postMessage({ type: 'browser-owner-query' }, [channel.port2]);
  });
}

export async function handleBrowserNotificationClick(scope: ServiceWorkerGlobalScope, event: NotificationEvent): Promise<void> {
  event.notification.close();
  const data: unknown = event.notification.data;
  const recipient = typeof data === 'object' && data !== null && 'recipient' in data && isRecipient(data.recipient) ? data.recipient : undefined;
  if (recipient?.serverKey === MONGOOSE_SERVER_KEY && event.action === 'stop-kind') {
    const state = await readEnrollmentState(recipient.serverKey, recipient.installationId);
    const grant = await findBrowserAwayGrant(recipient);
    const kind = typeof data === 'object' && data !== null && 'kind' in data && typeof data.kind === 'string' ? data.kind : '';
    if (state && grant && kind) {
      await manageBrowserNotifications({ recipient, grant, sessionId: grant.sessionId, profile: state.profile }, 'stop-kind', kind, scope.registration);
      return;
    }
  }
  const windows = await scope.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  if (recipient?.serverKey === MONGOOSE_SERVER_KEY) {
    const owners = await Promise.all(windows.map(client => currentOwner(client)));
    for (let i = 0; i < windows.length; i++) {
      const client = windows[i];
      const owner = owners[i];
      if (owner && sameOwner(owner, recipient)) { await client.focus(); return; }
    }
    const url = new URL('/', scope.location.origin);
    url.searchParams.set('notificationPlayer', recipient.playerUuid);
    url.searchParams.set('notificationRef', recipient.playerRef);
    await scope.clients.openWindow(url.href);
  } else {
    await scope.clients.openWindow(new URL('/', scope.location.origin).href);
  }
}
