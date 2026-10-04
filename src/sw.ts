/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { resolveApiUrl } from './apiOrigin';
import { type AwayPushData, recordAwayPush } from './away';

declare let self: ServiceWorkerGlobalScope;

type PushAction = {
  action: string;
  title: string;
  url?: string;
};

type PushPayload = {
  actions?: PushAction[];
  body?: string;
  data?: AwayPushData;
  silent?: unknown;
  tag?: string;
  title?: string;
  url?: string;
};

type NotificationAction = {
  action: string;
  title: string;
};

// TypeScript's lib.webworker NotificationOptions omits `actions` and `renotify`.
type NotificationOptionsWithActions = NotificationOptions & {
  actions?: NotificationAction[];
  renotify?: boolean;
};

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Precached application scripts keep precedence. Optional feature chunks are
// fetched on first use, then remain available offline under their hashed URLs.
registerRoute(
  ({ request, url }) =>
    request.destination === 'script' &&
    url.origin === self.location.origin &&
    url.pathname.startsWith('/assets/'),
  new CacheFirst({
    cacheName: 'script-chunks',
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60,
        maxEntries: 100,
      }),
    ],
  }),
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/wasm/'),
  new CacheFirst({
    cacheName: 'wasm-assets',
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60,
        maxEntries: 10,
      }),
    ],
  }),
);

function parsePushPayload(event: PushEvent): PushPayload {
  if (!event.data) {
    return {};
  }

  try {
    return event.data.json() as PushPayload;
  } catch {
    return {
      body: event.data.text(),
    };
  }
}

// Keeps well-formed actions; the per-action URLs travel in notification data
// because showNotification only accepts action and title.
function parsePushActions(actions: unknown): {
  actions: NotificationAction[];
  actionUrls: Record<string, string>;
} {
  const parsed: NotificationAction[] = [];
  const actionUrls: Record<string, string> = {};
  if (!Array.isArray(actions)) {
    return { actionUrls, actions: parsed };
  }

  for (const entry of actions) {
    if (typeof entry !== 'object' || entry === null) {
      continue;
    }
    const { action, title, url } = entry as Record<string, unknown>;
    if (typeof action !== 'string' || typeof title !== 'string') {
      continue;
    }
    parsed.push({ action, title });
    if (typeof url === 'string') {
      actionUrls[action] = url;
    }
  }
  return { actionUrls, actions: parsed };
}

// Stores the lines a push carried and hands the new ones to every open page.
// A failure here must not stop the notification from being shown.
async function deliverAwayLines(data: AwayPushData): Promise<void> {
  try {
    const lines = await recordAwayPush(data);
    if (lines.length === 0) return;
    const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    for (const client of clients) {
      client.postMessage({ lines, type: 'away-lines' });
    }
  } catch (error) {
    console.error('[away] could not store or deliver pushed lines', error);
  }
}

self.addEventListener('push', (event) => {
  const payload = parsePushPayload(event);
  const title = payload.title ?? 'Mongoose';
  const body = payload.body ?? '';
  const url = payload.url ?? '/';
  const tag = payload.tag ?? 'mongoose-push';
  const { actions, actionUrls } = parsePushActions(payload.actions);

  const options: NotificationOptionsWithActions = {
    actions,
    body,
    data: {
      actionUrls,
      url,
    },
    tag,
  };
  const awayData = payload.data;
  if (!awayData || !Array.isArray(awayData.lines)) {
    event.waitUntil(self.registration.showNotification(title, options));
    return;
  }

  // A tagged notification replaces the previous one without alerting unless
  // renotify is set. iOS revokes a subscription whose pushes show nothing, so
  // the notification is shown whatever happens to the lines.
  if (payload.silent) {
    options.silent = true;
  } else {
    options.renotify = true;
  }
  event.waitUntil(
    Promise.all([self.registration.showNotification(title, options), deliverAwayLines(awayData)]),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const actionUrl = event.action ? event.notification.data?.actionUrls?.[event.action] : undefined;
  if (typeof actionUrl === 'string') {
    event.waitUntil(self.clients.openWindow(resolveApiUrl(actionUrl)));
    return;
  }

  const relativeUrl =
    typeof event.notification.data?.url === 'string' ? event.notification.data.url : '/';
  const targetUrl = new URL(relativeUrl, self.location.origin).toString();

  event.waitUntil(
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client && client.url === targetUrl) {
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }

      return undefined;
    }),
  );
});
