/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { handleBrowserPush, handleBrowserOwnerMessage, handleBrowserNotificationClick } from './browserPushWorker';
import { handleShareTarget } from './launch/shareTarget';
import { SHARE_TARGET_PATH } from './launch/launchUrls';

declare let self: ServiceWorkerGlobalScope;

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ request, url }) => request.destination === 'script' && url.origin === self.location.origin && url.pathname.startsWith('/assets/'),
  new CacheFirst({ cacheName: 'script-chunks', plugins: [new ExpirationPlugin({ maxAgeSeconds: 30 * 24 * 60 * 60, maxEntries: 100 })] }),
);
registerRoute(
  ({ url }) => url.pathname.startsWith('/wasm/'),
  new CacheFirst({ cacheName: 'wasm-assets', plugins: [new ExpirationPlugin({ maxAgeSeconds: 30 * 24 * 60 * 60, maxEntries: 10 })] }),
);
// The manifest's share target. The static host has no server to take the POST.
registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname === SHARE_TARGET_PATH,
  ({ request }) => handleShareTarget(request, self.location.origin),
  'POST',
);

function parsePayload(event: PushEvent): unknown {
  try { return event.data?.json(); }
  catch { return undefined; }
}

self.addEventListener('push', event => {
  event.waitUntil(handleBrowserPush(self, parsePayload(event)).catch(() =>
    self.registration.showNotification('Mongoose', { body: 'Open Mongoose to review a notification.',
      tag: 'mongoose-unaddressed', silent: true, data: { unaddressed: true } })));
});
self.addEventListener('message', event => {
  event.waitUntil(handleBrowserOwnerMessage(event).catch(() => { console.error('Browser notification ownership could not be saved'); }));
});
self.addEventListener('notificationclick', event => {
  event.waitUntil(handleBrowserNotificationClick(self, event).catch(() =>
    self.registration.showNotification('Mongoose', { body: 'Sign in to review notification settings.',
      tag: 'mongoose-notification-settings', silent: true, data: { unaddressed: true } })));
});
