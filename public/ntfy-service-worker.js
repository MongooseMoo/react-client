let eventSource = null;
let topic = "example"; // Default topic

self.addEventListener("install", (event) =>
  event.waitUntil(self.skipWaiting())
);
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim())
);

function log(message, ...args) {
  console.log(`[Service Worker] ${message}`, ...args);
}

async function broadcast(message) {
  const clients = await self.clients.matchAll({ type: "window" });
  clients.forEach((client) => client.postMessage(message));
}

function broadcastState(status, topic, error) {
  broadcast({
    type: 'NTFY_STATE',
    payload: { status, topic, error }
  });
}

function startSSEConnection() {
  if (eventSource) eventSource.close();

  const url = `https://ntfy.sh/${topic}/sse`;
  log(`Connecting to ${url}`);
  broadcastState('connecting', topic);
  eventSource = new EventSource(url);

  eventSource.onopen = () => broadcastState('connected', topic);
  eventSource.onerror = (error) => {
    log("SSE connection error:", error);
    broadcastState('error', topic, error.message);
    eventSource.close();
    setTimeout(startSSEConnection, 5000);
  };
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handleMessage(data);
    } catch (error) {
      log("Error parsing SSE message:", error);
    }
  };
}

async function handleMessage(data) {
  const clients = await self.clients.matchAll({ type: "window" });
  log("Received message:", data);
  if (clients.length > 0) {
    log("Broadcasting message to clients");
    broadcast({ type: "NTFY_MESSAGE", payload: data });
  } else {
    log("Showing notification");
    showNotification(data);
  }
}

async function showNotification(data) {
  try {
    if (Notification.permission === "granted") {
      await self.registration.showNotification(data.title, {
        body: data.message,
        icon: data.icon || "/path/to/default/icon.png",
        data: { url: data.click || "" },
      });
    } else {
      log("Notification permission not granted");
    }
  } catch (error) {
    log("Error showing notification:", error);
  }
}

self.addEventListener("message", (event) => {
  const { type, payload } = event.data || {};
  log("Received message:", type, payload);

  switch (type) {
    case "START_SSE":
      if (payload?.topic) topic = payload.topic;
      startSSEConnection();
      break;
    case "STOP_SSE":
      if (eventSource) {
        eventSource.close();
        broadcastState('disconnected', topic);
      }
      break;
    case "SET_TOPIC":
      if (payload?.topic) {
        topic = payload.topic;
        log(`Topic set to: ${topic}`);
        broadcastState('connecting', topic);
        startSSEConnection(); // Restart the SSE connection with the new topic
      }
      break;
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data.url;
  if (url) {
    event.waitUntil(clients.openWindow(url));
  }
});

log("Service worker loaded and ready");
