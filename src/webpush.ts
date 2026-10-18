import { resolveApiUrl } from "./apiOrigin";
import { ensureAwayToken } from "./away";
import type MudClient from "./client";
import { useOutputStore } from "./stores/outputStore";

const DEFAULT_PUBLIC_KEY_ENDPOINT = resolveApiUrl("/api/webpush/public_key");
const DEFAULT_SUBSCRIPTION_ENDPOINT = resolveApiUrl("/api/webpush/subscriptions");

type PushSubscriptionJSONLike = {
  endpoint?: string;
  expirationTime?: number | null;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

type PushSubscriptionUploadPayload = {
  subscription: PushSubscriptionJSONLike;
  userAgent: string;
  clientUrl: string;
};

function buildBearerHeaders(token: string, extraHeaders?: HeadersInit): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  };
}

export function urlBase64ToUint8Array(base64Url: string): Uint8Array<ArrayBuffer> {
  const normalized = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  const base64 = normalized + padding;
  const raw = atob(base64);
  const output: Uint8Array<ArrayBuffer> = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

async function fetchJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}`);
  }
  return response.json() as Promise<T>;
}

async function fetchVapidPublicKey(token: string): Promise<string> {
  const payload = await fetchJson<{
    public_key_b64url?: string;
    publicKey?: string;
  }>(DEFAULT_PUBLIC_KEY_ENDPOINT, {
    headers: buildBearerHeaders(token),
    method: "GET",
  });

  const publicKey = payload.public_key_b64url ?? payload.publicKey;
  if (!publicKey) {
    throw new Error("VAPID public key missing from server response");
  }
  return publicKey;
}

async function uploadSubscription(
  token: string,
  subscription: PushSubscription,
): Promise<void> {
  const payload: PushSubscriptionUploadPayload = {
    clientUrl: window.location.origin,
    subscription: subscription.toJSON(),
    userAgent: navigator.userAgent,
  };

  await fetchJson(DEFAULT_SUBSCRIPTION_ENDPOINT, {
    body: JSON.stringify(payload),
    headers: buildBearerHeaders(token, {
      "Content-Type": "application/json",
    }),
    method: "POST",
  });
}

async function deleteSubscription(token: string, endpoint: string): Promise<void> {
  await fetchJson(DEFAULT_SUBSCRIPTION_ENDPOINT, {
    body: JSON.stringify({
      endpoint,
    }),
    headers: buildBearerHeaders(token, {
      "Content-Type": "application/json",
    }),
    method: "DELETE",
  });
}

async function requestWebPushToken(client: MudClient): Promise<string | null> {
  const webPush = client.gmcp.require("Client.WebPush");
  return webPush.requestToken();
}

export async function ensurePushSubscription(client: MudClient): Promise<void> {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    return;
  }

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  if (permission !== "granted") {
    return;
  }

  const token = await requestWebPushToken(client);
  if (!token) {
    return;
  }

  await registerSubscription(token);
  await enableAwayChannel(token);
}

async function registerSubscription(token: string): Promise<void> {
  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    await uploadSubscription(token, existing);
    return;
  }

  const publicKey = await fetchVapidPublicKey(token);
  const applicationServerKey = urlBase64ToUint8Array(publicKey);
  let created: PushSubscription;
  try {
    created = await registration.pushManager.subscribe({
      applicationServerKey,
      userVisibleOnly: true,
    });
  } catch (error) {
    console.error("[webpush] pushManager.subscribe failed", {
      error,
      isSecureContext: window.isSecureContext,
      locationOrigin: window.location.origin,
      notificationPermission: Notification.permission,
      serviceWorkerScope: registration.scope,
    });
    throw error;
  }
  await uploadSubscription(token, created);
}

// Push already works at this point, so a failure here is reported, not thrown.
async function enableAwayChannel(token: string): Promise<void> {
  try {
    await ensureAwayToken(token);
  } catch (error) {
    console.error("[webpush] away token request failed", error);
    const message = error instanceof Error ? error.message : String(error);
    useOutputStore
      .getState()
      .addError(new Error(`Away messages couldn't be enabled: ${message}`));
  }
}

export async function unregisterPushSubscription(client: MudClient): Promise<void> {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const token = await requestWebPushToken(client);
  if (!token) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  if (!existing) {
    return;
  }

  await deleteSubscription(token, existing.endpoint);
  await existing.unsubscribe();
}
