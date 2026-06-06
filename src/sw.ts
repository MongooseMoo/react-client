/// <reference lib="webworker" />

import { clientsClaim } from "workbox-core";
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

declare let self: ServiceWorkerGlobalScope;

type PushPayload = {
  body?: string;
  tag?: string;
  title?: string;
  url?: string;
};

clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }) => url.pathname.startsWith("/wasm/"),
  new CacheFirst({
    cacheName: "wasm-assets",
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

self.addEventListener("push", (event) => {
  const payload = parsePushPayload(event);
  const title = payload.title ?? "Mongoose";
  const body = payload.body ?? "";
  const url = payload.url ?? "/";
  const tag = payload.tag ?? "mongoose-push";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      data: {
        url,
      },
      tag,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const relativeUrl =
    typeof event.notification.data?.url === "string"
      ? event.notification.data.url
      : "/";
  const targetUrl = new URL(relativeUrl, self.location.origin).toString();

  event.waitUntil(
    self.clients.matchAll({ includeUncontrolled: true, type: "window" }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client && client.url === targetUrl) {
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
