import { describe, expect, it, vi } from 'vitest';

import { GmcPIRESound } from './Sound';

function createMockClient() {
  return {
    emit: vi.fn(),
    media: {
      load: vi.fn(async () => {}),
      play: vi.fn(async () => {}),
      stop: vi.fn(),
    },
    sendGmcp: vi.fn(),
  };
}

describe('GmcPIRESound', () => {
  it('routes IRE sound playback directly through the shared media service', () => {
    const client = createMockClient();
    const handler = new GmcPIRESound(client as never);

    handler.handlePlay({
      fadein_csec: 5,
      fadeout_csec: 7,
      loop: true,
      name: 'attack.ogg',
      volume: 65,
    });

    expect(client.media.play).toHaveBeenCalledWith({
      fadein: 50,
      fadeout: 70,
      loops: -1,
      name: 'attack.ogg',
      type: 'sound',
      volume: 65,
    });
    expect(client.emit).toHaveBeenCalledWith(
      'ireSoundPlay',
      expect.objectContaining({
        name: 'attack.ogg',
      }),
    );
  });

  it('routes IRE stop and preload through the shared media service', () => {
    const client = createMockClient();
    const handler = new GmcPIRESound(client as never);

    handler.handleStop({ name: 'attack.ogg' });
    handler.handleStopall({});
    handler.handlePreload({ name: 'attack.ogg' });

    expect(client.media.stop).toHaveBeenNthCalledWith(1, { name: 'attack.ogg' });
    expect(client.media.stop).toHaveBeenNthCalledWith(2, {});
    expect(client.media.load).toHaveBeenCalledWith({ name: 'attack.ogg' });
  });
});
