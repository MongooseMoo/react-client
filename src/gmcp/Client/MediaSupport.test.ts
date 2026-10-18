import { describe, expect, it, vi } from 'vitest';
import { SharedClock } from '../../timing/SharedClock';
import { GMCPClientMedia } from './Media';

vi.mock('../../MidiService', () => ({
  midiService: {
    sequenceOutputAvailable: true,
    subscribeOutput: () => () => {},
    getSequenceOutput: async () => null,
  },
}));

describe('shared playback capability lifecycle', () => {
  it('withdraws all shared capability claims when the connection clock is removed', async () => {
    const clock = new SharedClock(() => {});
    const send = vi.fn();
    const media = {
      configureSequences: vi.fn(),
      configureSharedMedia: vi.fn(),
      reset: vi.fn(),
    };
    const client = { sharedClock: clock, media, gmcp: { ready: true, send } };
    const pkg = new GMCPClientMedia(
      client as unknown as ConstructorParameters<typeof GMCPClientMedia>[0],
    );
    await Promise.resolve();
    clock.setLocalMapping({ clockId: 'runtime', performanceNowMs: 0, serverNowMs: 0 });
    expect(JSON.parse(send.mock.calls.at(-1)?.[1])).toMatchObject({
      sharedTransport: true,
      mediaLoops: { version: 1, buffer: true, html: false },
      presentationCues: { version: 1 },
    });
    clock.setNetworkReady(false);
    expect(JSON.parse(send.mock.calls.at(-1)?.[1])).toMatchObject({
      sharedTransport: false,
      mediaLoops: false,
      presentationCues: false,
      midiSequences: false,
    });
    pkg.shutdown();
    clock.shutdown();
  });
  it('does not configure or subscribe after synchronous package shutdown', async () => {
    const clock = new SharedClock(() => {});
    const media = { configureSequences: vi.fn(), configureSharedMedia: vi.fn(), reset: vi.fn() };
    const send = vi.fn();
    const pkg = new GMCPClientMedia({
      sharedClock: clock,
      media,
      gmcp: { ready: true, send },
    } as unknown as ConstructorParameters<typeof GMCPClientMedia>[0]);
    pkg.shutdown();
    await Promise.resolve();
    clock.setLocalMapping({ clockId: 'runtime', performanceNowMs: 0, serverNowMs: 0 });
    expect(media.configureSharedMedia).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    clock.shutdown();
  });
});
