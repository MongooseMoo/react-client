
let NTFY_SSE_URL = '';
let eventSource = null;
let topic = 'example'; // Default topic

console.log('Service worker script loaded');

self.addEventListener('install', (event) => {
  console.log('Service worker installing...');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activating...');
  event.waitUntil(self.clients.claim());
});

function startSSEConnection() {
  console.log('Starting SSE connection...');
  if (eventSource) {
    eventSource.close();
  }

  NTFY_SSE_URL = `https://ntfy.sh/${topic}/sse`;
  console.log(`Connecting to ${NTFY_SSE_URL}`);
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
    console.log('SSE message received:', event.data);
    try {
      const data = JSON.parse(event.data);
      notifyClients({ type: 'NTFY_MESSAGE', payload: data });
    } catch (error) {
      console.error('Error parsing SSE message:', error);
    }
  };
}

async function notifyClients(message) {
  console.log('Notifying clients:', message);
  const clients = await self.clients.matchAll({ type: 'window' });
  for (const client of clients) {
    client.postMessage(message);
  }
}

self.addEventListener('message', (event) => {
  console.log('Service worker received message:', event.data);
  if (event.data && event.data.type === 'START_SSE') {
    if (event.data.topic) {
      topic = event.data.topic;
    }
    startSSEConnection();
  } else if (event.data && event.data.type === 'STOP_SSE') {
    if (eventSource) {
      eventSource.close();
      notifyClients({ type: 'SSE_STATUS', status: 'disconnected' });
    }
  } else if (event.data && event.data.type === 'SET_TOPIC') {
    if (event.data.topic) {
      topic = event.data.topic;
      console.log(`Topic set to: ${topic}`);
      notifyClients({ type: 'TOPIC_UPDATED', topic: topic });
    }
  }
});

console.log('Service worker script fully loaded');
