import { describe, expect, it, vi } from 'vitest';
import type MudClient from '../../client';
import { GMCPCoreTime } from './Time';

describe('Core.Time package', () => {
  it('routes tagged requests and validated replies through the existing wire', () => {
    const send = vi.fn();
    const receive = vi.fn();
    const handler = new GMCPCoreTime({
      gmcp: { send },
      sharedClock: { receive },
    } as unknown as MudClient);
    handler.sendRequest({ id: '1:1', c1Ms: 1000 });
    expect(send).toHaveBeenCalledWith('Core.Time.Request', '{"id":"1:1","c1Ms":1000}');
    const reply = { id: '1:1', c1Ms: 1000, clockId: 'runtime', s2Ms: 5000, s3Ms: 5001 };
    expect(handler.receiveRegisteredMessage('Reply', reply)).toBe(true);
    expect(receive).toHaveBeenCalledWith(reply);
    expect(handler.receiveRegisteredMessage('Unknown', reply)).toBe(false);
    expect(() =>
      handler.receiveRegisteredMessage('Reply', { ...reply, s2Ms: Number.NaN }),
    ).toThrow();
    expect(receive).toHaveBeenCalledOnce();
  });
});
