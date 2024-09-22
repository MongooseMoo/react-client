
const NTFY_SSE_URL = 'https://ntfy.sh/example/sse';

let eventSource = null;

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

function startSSEConnection() {
  if (eventSource) {
    eventSource.close();
  }

  eventSource = new EventSource(NTFY_SSE_URL);

  eventSource.onopen = () => {
    console.log('SSE connection opened');
    notifyClients({ type: 'SSE_STATUS', status: 'connected' });
  };

  eventSource.onerror = (error) => {
    console.error('SSE connection error:', error);
    notifyClients({ type: 'SSE_STATUS', status: 'error', error: error.message });
    eventSource.close();
    // Attempt to reconnect after a delay
    setTimeout(startSSEConnection, 5000);
  };

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      notifyClients({ type: 'NTFY_MESSAGE', payload: data });
    } catch (error) {
      console.error('Error parsing SSE message:', error);
    }
  };
}

async function notifyClients(message) {
  const clients = await self.clients.matchAll({ type: 'window' });
  for (const client of clients) {
    client.postMessage(message);
  }
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'START_SSE') {
    startSSEConnection();
  } else if (event.data && event.data.type === 'STOP_SSE') {
    if (eventSource) {
      eventSource.close();
      notifyClients({ type: 'SSE_STATUS', status: 'disconnected' });
    }
  }
});