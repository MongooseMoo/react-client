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

function startSSEConnection() {
  if (eventSource) eventSource.close();

  const url = `https://ntfy.sh/${topic}/sse`;
  log(`Connecting to ${url}`);
  eventSource = new EventSource(url);

  eventSource.onopen = () =>
    broadcast({ type: "SSE_STATUS", status: "connected" });
  eventSource.onerror = (error) => {
    log("SSE connection error:", error);
    broadcast({ type: "SSE_STATUS", status: "error", error: error.message });
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
  const { type, topic: newTopic } = event.data || {};
  log("Received message:", type, newTopic);

  switch (type) {
    case "START_SSE":
      if (newTopic) topic = newTopic;
      startSSEConnection();
      break;
    case "STOP_SSE":
      if (eventSource) {
        eventSource.close();
        broadcast({ type: "SSE_STATUS", status: "disconnected" });
      }
      break;
    case "SET_TOPIC":
      if (newTopic) {
        topic = newTopic;
        log(`Topic set to: ${topic}`);
        broadcast({ type: "TOPIC_UPDATED", topic });
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
