import { inbound, outbound } from '../../protocol/messages';
import type { TimeReply, TimeRequest } from '../../timing/SharedClock';
import { gmcpJsonMessage } from '../messages';
import { GMCPPackage } from '../package';

const request = gmcpJsonMessage<'Request', never, TimeRequest>('Request');
const reply = gmcpJsonMessage<'Reply', TimeReply>('Reply', {
  encode(payload: TimeReply): unknown {
    return payload;
  },
  decode(payload: unknown): TimeReply {
    if (payload === null || typeof payload !== 'object' || Array.isArray(payload))
      throw new Error('Invalid clock reply');
    const value = payload as Record<string, unknown>;
    if (
      typeof value.id !== 'string' ||
      !value.id.length ||
      value.id.length > 64 ||
      typeof value.clockId !== 'string' ||
      !value.clockId.length ||
      value.clockId.length > 128 ||
      ![value.c1Ms, value.s2Ms, value.s3Ms].every(
        (time) => typeof time === 'number' && Number.isFinite(time) && time >= 0,
      )
    )
      throw new Error('Invalid clock reply');
    return {
      id: value.id,
      clockId: value.clockId,
      c1Ms: value.c1Ms as number,
      s2Ms: value.s2Ms as number,
      s3Ms: value.s3Ms as number,
    };
  },
});
const CoreTimeBase = GMCPPackage.with({
  packageName: 'Core.Time',
  messages: [outbound(request), inbound(reply)] as const,
});

export class GMCPCoreTime extends CoreTimeBase {
  constructor(client: ConstructorParameters<typeof CoreTimeBase>[0]) {
    super(client);
    this.on('reply', (value) => this.client.sharedClock.receive(value));
  }
}
