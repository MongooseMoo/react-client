import { check, randomId, type PeerPort, type Capabilities } from './protocol';
/** Fresh discovery for every new operation; never invoked as a retry/downgrade after an offer. */
export async function chooseTransport(
  peer: PeerPort,
  to: string,
  signal?: AbortSignal,
): Promise<Capabilities & { transport: 'v1' | 'v2' }> {
  check(!signal?.aborted, 'File transfer was cancelled');
  const req = randomId();
  return new Promise((resolve, reject) => {
    const done = () => {
      clearTimeout(timer);
      off();
      errorOff();
      signal?.removeEventListener('abort', abort);
    };
    const abort = () => {
      done();
      reject(new Error('File transfer was cancelled'));
    };
    const off = peer.on('Capabilities', (c) => {
      if (c.req !== req) return;
      done();
      if (c.to !== to || !c.online) {
        reject(new Error('Player is unavailable for file transfers'));
        return;
      }
      if (c.target && c.data === 1 && c.files === 1 && c.peer === 1 && c.features[0] === 'base')
        resolve({ ...c, transport: 'v2' });
      else if (c.legacyV1) resolve({ ...c, transport: 'v1' });
      else reject(new Error('This player does not support file transfers'));
    });
    const errorOff = peer.on('Error', (e) => {
      if (e.req === req) {
        done();
        reject(new Error(`File capabilities: ${e.code}`));
      }
    });
    const timer = setTimeout(() => {
      done();
      reject(new Error('File capabilities unavailable; try again later'));
    }, 10000);
    signal?.addEventListener('abort', abort, { once: true });
    peer.send('Capabilities', { req, to });
  });
}
