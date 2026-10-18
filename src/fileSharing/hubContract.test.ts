import { describe, expect, it } from 'vitest';
import { Phase1Hub } from './testHarness';
import { randomId } from './protocol';
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
describe('reference hub replay contract', () => {
  it('replays Hello without supersession and never reactivates a retired epoch', async () => {
    const hub = new Phase1Hub();
    const p = hub.peer('#1');
    const errors: string[] = [];
    p.peer.on('Error', (e) => errors.push(e.code));
    const hello = {
      req: randomId(),
      endpoint: randomId(),
      peer: 1 as const,
      files: 1 as const,
      data: 1 as const,
      features: ['base'] as ['base'],
      maxReceiveSize: 104857600,
    };
    p.peer.send('Hello', hello);
    await flush();
    const first = p.ready;
    p.peer.send('Hello', hello);
    await flush();
    expect(p.ready).toEqual(first);
    const next = { ...hello, req: randomId(), endpoint: randomId() };
    p.peer.send('Hello', next);
    await flush();
    const current = p.ready;
    p.peer.send('Hello', hello);
    await flush();
    expect(p.ready).toEqual(current);
    expect(errors).toContain('stale-endpoint');
  });
  it('does not forward replayed consent twice or create a session from a closed Reserve replay', async () => {
    const hub = new Phase1Hub();
    const a = hub.peer('#1');
    const b = hub.peer('#2');
    for (const p of [a, b])
      p.peer.send('Hello', {
        req: randomId(),
        endpoint: randomId(),
        peer: 1,
        files: 1,
        data: 1,
        features: ['base'],
        maxReceiveSize: 104857600,
      });
    await flush();
    if (!a.ready || !b.ready) throw new Error('No registration');
    const offer = randomId();
    let accepted = 0;
    let reserved = 0;
    const errors: string[] = [];
    a.files.on('OfferState', (s) => {
      if (s.state === 'accepted') accepted++;
    });
    b.peer.on('Reserved', () => reserved++);
    a.peer.on('Error', (e) => errors.push(e.code));
    a.files.send('Offer', {
      req: randomId(),
      to: '#2',
      target: b.ready.self,
      offer,
      id: '0'.repeat(64),
      size: 0,
      name: 'empty',
    });
    await flush();
    const respond = { req: randomId(), to: '#1', target: a.ready.self, offer, accept: true };
    b.files.send('Respond', respond);
    await flush();
    b.files.send('Respond', respond);
    await flush();
    expect(accepted).toBe(1);
    const reserve = {
      req: randomId(),
      to: '#2',
      target: b.ready.self,
      purpose: 'files' as const,
      auth: { kind: 'offer' as const, offer },
    };
    a.peer.send('Reserve', reserve);
    await flush();
    a.peer.send('Reserve', reserve);
    await flush();
    expect(reserved).toBe(1);
    const s = [...hub.sessions.values()][0];
    a.peer.send('Close', {
      req: randomId(),
      to: '#2',
      target: b.ready.self,
      session: s.id,
      reason: 'done',
    });
    await flush();
    a.peer.send('Reserve', reserve);
    await flush();
    expect(hub.sessions.size).toBe(0);
    expect(errors).toContain('closed');
  });
});
