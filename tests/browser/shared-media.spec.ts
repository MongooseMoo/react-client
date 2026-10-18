import { expect, test } from '@playwright/test';
import { build } from 'esbuild';
import { resolve } from 'node:path';
import { createServer } from 'node:http';
import type { BrowserContext, Page, Route } from '@playwright/test';
const origin = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
function wave(seconds = 8, clip = false): Buffer {
  const rate = 24000,
    length = rate * seconds,
    bytes = Buffer.alloc(44 + length * 2);
  bytes.write('RIFF');
  bytes.writeUInt32LE(bytes.length - 8, 4);
  bytes.write('WAVEfmt ', 8);
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20);
  bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(rate, 24);
  bytes.writeUInt32LE(rate * 2, 28);
  bytes.writeUInt16LE(2, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write('data', 36);
  bytes.writeUInt32LE(length * 2, 40);
  for (let i = 0; i < length; i++)
    bytes.writeInt16LE(
      Math.round(
        Math.sin((i / rate) * (clip && i / rate >= 1.5 ? 1760 : 440) * Math.PI * 2) * 8000,
      ),
      44 + i * 2,
    );
  return bytes;
}
async function fixture(
  page: Page,
  context: BrowserContext,
  deliver: (route: Route) => Promise<void>,
) {
  const module = await build({
    bundle: true,
    write: false,
    format: 'esm',
    target: 'es2022',
    platform: 'browser',
    stdin: {
      contents:
        'export {MediaService} from "./src/audio/MediaService.ts"; export {SharedClock} from "./src/timing/SharedClock.ts"; export {useSharedMediaStore} from "./src/stores/sharedMediaStore.ts";',
      resolveDir: resolve('.'),
      loader: 'ts',
    },
  });
  await context.route('**/shared-media-fixture', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><button id="unlock">Unlock</button>',
    }),
  );
  await context.route('**/shared-media-fixture.js', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: module.outputFiles[0].text }),
  );
  await context.route('https://mongoose.world:9080/**', deliver);
  await context.route('**/shared-tone.wav', deliver);
  await page.goto(`${origin}/shared-media-fixture`);
  await page.evaluate(async () => {
    const { MediaService, SharedClock, useSharedMediaStore } = await import(
      '/shared-media-fixture.js'
    );
    const media = new MediaService(undefined, { manageFocus: false });
    const clock = new SharedClock(() => {});
    clock.setLocalMapping({
      clockId: 'browser',
      serverNowMs: performance.now(),
      performanceNowMs: performance.now(),
    });
    globalThis.media = media;
    globalThis.clock = clock;
    globalThis.snapshot = undefined;
    globalThis.mediaStore = useSharedMediaStore;
    globalThis.syncCount = 0;
    media.configureSharedMedia(clock, (request) => {
      globalThis.syncCount++;
      queueMicrotask(() => media.receiveMediaSync({ ...request, transport: globalThis.snapshot }));
    });
    document.querySelector('#unlock').addEventListener('click', () => media.cacophony.resume());
  });
  await page.click('#unlock');
}
test('native finite HTML joins silently at the current cursor; cancelled future buffer remains silent', async ({
  page,
  context,
}) => {
  test.setTimeout(45000);
  const bytes = wave();
  let delayed = false;
  await fixture(page, context, async (route) => {
    if (route.request().url().includes('late') && !delayed) {
      delayed = true;
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }
    if (route.request().url().includes('renewed'))
      await new Promise((resolve) => setTimeout(resolve, 800));
    const range = route.request().headers().range;
    const start = range ? Number(/bytes=(\d+)/.exec(range)?.[1] ?? 0) : 0;
    await route.fulfill({
      status: range ? 206 : 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Access-Control-Allow-Origin': '*',
        'Accept-Ranges': 'bytes',
        ...(range ? { 'Content-Range': `bytes ${start}-${bytes.length - 1}/${bytes.length}` } : {}),
      },
      body: bytes.subarray(start),
    });
  });
  const paused = await page.evaluate(async () => {
    const transport = {
      version: 1,
      kind: 'media',
      clockId: 'browser',
      sourceId: 'paused',
      revision: 1,
      discontinuity: 0,
      state: 'paused',
      anchorServerMs: performance.now(),
      positionMs: 2000,
      durationMs: 8000,
      rate: 1,
      mode: 'finite',
    };
    globalThis.snapshot = transport;
    await globalThis.media.play({
      key: 'tv',
      name: 'shared-tone.wav',
      url: location.origin + '/',
      type: 'music',
      transport,
      cueWindows: [
        {
          seq: 0,
          fromMs: 0,
          toMs: 8000,
          cues: [{ id: 'current', startMs: 2000, endMs: 3000, text: 'Current caption' }],
        },
      ],
    });
    const playback = globalThis.media.sounds.tv.playbacks[0];
    return {
      cursor: playback.currentTime,
      playing: playback.isPlaying,
      captions: globalThis.mediaStore.getState().sources.tv.cues.map((cue) => cue.text),
    };
  });
  expect(paused.playing).toBe(false);
  expect(paused.cursor).toBeCloseTo(2, 2);
  expect(paused.captions).toEqual(['Current caption']);
  const joined = await page.evaluate(async () => {
    const transport = {
      ...globalThis.snapshot,
      revision: 2,
      state: 'playing',
      anchorServerMs: performance.now(),
      positionMs: 3000,
    };
    globalThis.snapshot = transport;
    globalThis.media.update({ key: 'tv', transport });
    await new Promise((resolve) => setTimeout(resolve, 350));
    const playback = globalThis.media.sounds.tv.playbacks[0];
    return {
      playing: playback.isPlaying,
      errorMs: Math.abs(
        playback.currentTime * 1000 - (3000 + performance.now() - transport.anchorServerMs),
      ),
      captions: globalThis.mediaStore.getState().sources.tv.cues,
    };
  });
  expect(joined.playing).toBe(true);
  expect(joined.errorMs).toBeLessThan(250);
  expect(joined.captions).toEqual([]);
  const late = await page.evaluate(async () => {
    globalThis.media.stop({ key: 'tv' });
    const transport = {
      ...globalThis.snapshot,
      sourceId: 'late',
      revision: 1,
      state: 'playing',
      anchorServerMs: performance.now(),
      positionMs: 1000,
    };
    globalThis.snapshot = transport;
    await globalThis.media.play({
      key: 'late',
      name: 'shared-tone.wav?late=1',
      url: location.origin + '/',
      type: 'music',
      transport,
    });
    const playback = globalThis.media.sounds.late.playbacks[0];
    return {
      cursor: playback.currentTime,
      errorMs: Math.abs(
        playback.currentTime * 1000 - (1000 + performance.now() - transport.anchorServerMs),
      ),
    };
  });
  expect(late.cursor).toBeGreaterThan(2);
  expect(late.errorMs).toBeLessThan(250);
  const renewed = await page.evaluate(async () => {
    const before = globalThis.media.sounds.late;
    const context = globalThis.media.cacophony.context;
    const frames: { at: number; rms: number }[] = [];
    const monitor = context.createScriptProcessor(256, 1, 1);
    monitor.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0);
      frames.push({
        at: event.playbackTime,
        rms: Math.sqrt(input.reduce((sum, value) => sum + value * value, 0) / input.length),
      });
    };
    const output = globalThis.media.cacophony.getBus('master').output;
    output.connect(monitor);
    monitor.connect(context.destination);
    await new Promise((resolve) => setTimeout(resolve, 100));
    frames.length = 0;
    await globalThis.media.play({
      key: 'late',
      name: 'shared-tone.wav?renewed=1',
      url: location.origin + '/',
      type: 'music',
      transport: globalThis.snapshot,
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    output.disconnect(monitor);
    monitor.disconnect();
    monitor.onaudioprocess = null;
    let silence = 0,
      maxSilence = 0;
    for (const frame of frames) {
      silence = frame.rms < 0.005 ? silence + 256 / context.sampleRate : 0;
      maxSilence = Math.max(maxSilence, silence);
    }
    const sound = globalThis.media.sounds.late;
    return {
      replaced: sound !== before,
      errorMs: Math.abs(
        sound.playbacks[0].currentTime * 1000 -
          (1000 + performance.now() - globalThis.snapshot.anchorServerMs),
      ),
      maxSilence,
      frames: frames.length,
    };
  });
  expect(renewed.replaced).toBe(true);
  expect(renewed.errorMs).toBeLessThan(250);
  expect(renewed.frames).toBeGreaterThan(100);
  expect(renewed.maxSilence).toBeLessThan(0.04);
  await page.evaluate(async () => {
    await globalThis.media.cacophony.context.suspend();
    await new Promise((resolve) => setTimeout(resolve, 200));
    await globalThis.media.cacophony.context.resume();
  });
  await expect
    .poll(() =>
      page.evaluate(() => {
        const playback = globalThis.media.sounds.late.playbacks[0];
        return playback.isPlaying
          ? Math.abs(
              playback.currentTime * 1000 -
                (1000 + performance.now() - globalThis.snapshot.anchorServerMs),
            )
          : Infinity;
      }),
    )
    .toBeLessThan(250);
  const cancelled = await page.evaluate(async () => {
    globalThis.media.stop({ key: 'late' });
    const transport = {
      ...globalThis.snapshot,
      sourceId: 'future',
      revision: 1,
      anchorServerMs: performance.now() + 1000,
      positionMs: 0,
    };
    globalThis.snapshot = transport;
    const pending = globalThis.media.play({
      key: 'future',
      name: 'shared-tone.wav',
      url: location.origin + '/',
      type: 'sound',
      transport,
    });
    const scheduledBy = performance.now() + 800;
    while (
      !globalThis.media.sounds.future?.playbacks[0]?.isPlaying &&
      performance.now() < scheduledBy
    )
      await new Promise((resolve) => setTimeout(resolve, 5));
    if (!globalThis.media.sounds.future?.playbacks[0]?.isPlaying)
      throw new Error('Future buffer was not scheduled before cancellation');
    const playback = globalThis.media.sounds.future.playbacks[0],
      context = globalThis.media.cacophony.context;
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    playback.outputNode.connect(analyser);
    const samples = new Float32Array(512);
    analyser.getFloatTimeDomainData(samples);
    const before = Math.max(...samples.map(Math.abs));
    globalThis.media.stop({ key: 'future' });
    await pending;
    await new Promise((resolve) => setTimeout(resolve, 1100));
    analyser.getFloatTimeDomainData(samples);
    const after = Math.max(...samples.map(Math.abs));
    analyser.disconnect();
    const active = Object.keys(globalThis.media.sounds).length;
    globalThis.media.shutdown();
    globalThis.clock.shutdown();
    return { before, after, active };
  });
  expect(cancelled).toEqual({ before: 0, after: 0, active: 0 });
});

test('native shared buffer clip loops exclude the suffix and end at the declared final boundary', async ({
  page,
  context,
}) => {
  const bytes = wave(8, true);
  await fixture(page, context, (route) => route.fulfill({ contentType: 'audio/wav', body: bytes }));
  const result = await page.evaluate(async () => {
    const audio = globalThis.media.cacophony.context;
    const frames: { at: number; rms: number; crossings: number }[] = [];
    const monitor = audio.createScriptProcessor(256, 1, 1);
    monitor.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0);
      let crossings = 0;
      for (let i = 1; i < input.length; i++) if (input[i - 1] < 0 && input[i] >= 0) crossings++;
      frames.push({
        at: event.playbackTime,
        rms: Math.sqrt(input.reduce((sum, value) => sum + value * value, 0) / input.length),
        crossings,
      });
    };
    const output = globalThis.media.cacophony.getBus('master').output;
    output.connect(monitor);
    monitor.connect(audio.destination);
    const anchor = performance.now() + 500;
    const transport = {
      version: 1,
      kind: 'media',
      clockId: 'browser',
      sourceId: 'clip',
      revision: 1,
      discontinuity: 0,
      state: 'playing',
      anchorServerMs: anchor,
      positionMs: 1000,
      durationMs: 8000,
      rate: 1,
      mode: 'finite',
      loop: { startMs: 1000, endMs: 1500, plays: 3 },
    };
    globalThis.snapshot = transport;
    const before = audio.currentTime;
    const playing = globalThis.media.play({
      key: 'clip',
      name: 'shared-tone.wav',
      url: location.origin + '/',
      type: 'sound',
      transport,
    });
    await playing;
    await new Promise((resolve) => setTimeout(resolve, 1900));
    output.disconnect(monitor);
    monitor.disconnect();
    monitor.onaudioprocess = null;
    const audible = frames.filter((frame) => frame.rms > 0.01);
    const silentTail = frames.filter((frame) => frame.at > before + 2.2);
    const result = {
      audibleFrames: audible.length,
      maxFrequency: Math.max(...audible.map((frame) => (frame.crossings * audio.sampleRate) / 256)),
      tailPeak: Math.max(...silentTail.map((frame) => frame.rms)),
      lastAudible: audible.at(-1)?.at,
      expectedEnd: before + 2,
    };
    globalThis.media.shutdown();
    globalThis.clock.shutdown();
    return result;
  });
  expect(result.audibleFrames).toBeGreaterThan(150);
  expect(result.maxFrequency).toBeLessThan(900);
  expect(result.tailPeak).toBeLessThan(0.001);
  expect(Math.abs(result.lastAudible - result.expectedEnd)).toBeLessThan(0.1);
});

test('a real HTML buffering stall is observed and rejoins after the withheld data arrives', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['local-network-access']);
  test.setTimeout(45000);
  const bytes = wave(30),
    split = 44 + 24000 * 2 * 5;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const releaseAt = Date.now() + 15000;
  const server = createServer((request, response) => {
    const range = request.headers.range,
      start = range ? Number(/bytes=(\d+)/.exec(range)?.[1] ?? 0) : 0;
    response.writeHead(range ? 206 : 200, {
      'Content-Type': 'audio/wav',
      'Content-Length': bytes.length - start,
      'Access-Control-Allow-Origin': '*',
      'Accept-Ranges': 'bytes',
      ...(range ? { 'Content-Range': `bytes ${start}-${bytes.length - 1}/${bytes.length}` } : {}),
    });
    response.write(bytes.subarray(start, Math.max(start, split)));
    const timer = setTimeout(
      () => {
        timers.delete(timer);
        response.end(bytes.subarray(Math.max(start, split)));
      },
      Math.max(0, releaseAt - Date.now()),
    );
    timers.add(timer);
    response.on('close', () => {
      clearTimeout(timer);
      timers.delete(timer);
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    if (!address || typeof address === 'string')
      throw new Error('Streaming fixture failed to bind');
    await fixture(page, context, (route) =>
      route.fulfill({
        status: 302,
        headers: {
          'Access-Control-Allow-Origin': '*',
          Location: `http://127.0.0.1:${address.port}/stall.wav`,
        },
      }),
    );
    const stalled = await page.evaluate(async () => {
      const transport = {
        version: 1,
        kind: 'media',
        clockId: 'browser',
        sourceId: 'stall',
        revision: 1,
        discontinuity: 0,
        state: 'playing',
        anchorServerMs: performance.now(),
        positionMs: 0,
        durationMs: 30000,
        rate: 1,
        mode: 'finite',
      };
      globalThis.snapshot = transport;
      await globalThis.media.play({
        key: 'stall',
        name: 'shared-tone.wav',
        url: location.origin + '/',
        type: 'music',
        transport,
      });
      const playback = globalThis.media.sounds.stall.playbacks[0];
      const element = playback.source.mediaElement,
        audio = globalThis.media.cacophony.context;
      await new Promise<void>((resolve) =>
        element.addEventListener('waiting', () => resolve(), { once: true }),
      );
      const frozen = element.currentTime,
        before = audio.currentTime;
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        frozen,
        actual: element.currentTime,
        observed: playback.currentTime,
        clockAdvance: audio.currentTime - before,
      };
    });
    expect(stalled.clockAdvance).toBeGreaterThan(0.2);
    expect(stalled.actual).toBeCloseTo(stalled.frozen, 2);
    expect(stalled.observed).toBeCloseTo(stalled.actual, 2);
    await expect
      .poll(() => page.evaluate(() => globalThis.mediaStore.getState().sources.stall.state), {
        timeout: 10000,
      })
      .toBe('preparing');
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const playback = globalThis.media.sounds.stall.playbacks[0];
            return globalThis.mediaStore.getState().sources.stall.state === 'playing'
              ? Math.abs(
                  playback.currentTime * 1000 -
                    (performance.now() - globalThis.snapshot.anchorServerMs),
                )
              : Infinity;
          }),
        { timeout: 18000 },
      )
      .toBeLessThan(250);
    expect(await page.evaluate(() => globalThis.syncCount)).toBeGreaterThanOrEqual(2);
    await page.evaluate(() => {
      globalThis.media.shutdown();
      globalThis.clock.shutdown();
    });
  } finally {
    for (const timer of timers) clearTimeout(timer);
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test('changing and removing clip bounds rebuilds only the buffer voice before seeking', async ({
  page,
  context,
}) => {
  await fixture(page, context, (route) =>
    route.fulfill({ contentType: 'audio/wav', body: wave() }),
  );
  const result = await page.evaluate(async () => {
    const transport = {
      version: 1,
      kind: 'media',
      clockId: 'browser',
      sourceId: 'topology',
      revision: 1,
      discontinuity: 0,
      state: 'playing',
      anchorServerMs: performance.now(),
      positionMs: 1000,
      durationMs: 8000,
      rate: 1,
      mode: 'finite',
      loop: { startMs: 1000, endMs: 1500, plays: -1 },
    };
    globalThis.snapshot = transport;
    await globalThis.media.play({
      key: 'topology',
      name: 'shared-tone.wav',
      url: location.origin + '/',
      type: 'sound',
      transport,
    });
    const sound = globalThis.media.sounds.topology,
      first = sound.playbacks[0];
    const seek = {
      ...transport,
      revision: 2,
      discontinuity: 1,
      anchorServerMs: performance.now(),
      positionMs: 3000,
      loop: undefined,
    };
    globalThis.snapshot = seek;
    globalThis.media.update({ key: 'topology', transport: seek });
    await new Promise((resolve) => setTimeout(resolve, 450));
    const second = sound.playbacks[0],
      removedError = Math.abs(
        second.currentTime * 1000 - (3000 + performance.now() - seek.anchorServerMs),
      );
    const changed = {
      ...seek,
      revision: 3,
      discontinuity: 2,
      anchorServerMs: performance.now(),
      positionMs: 4000,
      loop: { startMs: 4000, endMs: 5000, plays: -1 },
    };
    globalThis.snapshot = changed;
    globalThis.media.update({ key: 'topology', transport: changed });
    await new Promise((resolve) => setTimeout(resolve, 450));
    const third = sound.playbacks[0];
    const result = {
      sameAsset: sound === globalThis.media.sounds.topology,
      removedError,
      changedError: Math.abs(
        third.currentTime * 1000 - (4000 + performance.now() - changed.anchorServerMs),
      ),
      differentVoices: first !== second && second !== third,
      activeVoices: sound.playbacks.length,
      state: globalThis.mediaStore.getState().sources.topology.state,
    };
    globalThis.media.shutdown();
    globalThis.clock.shutdown();
    return result;
  });
  expect(result.sameAsset).toBe(true);
  expect(result.differentVoices).toBe(true);
  expect(result.activeVoices).toBe(1);
  expect(result.state).toBe('playing');
  expect(result.removedError).toBeLessThan(250);
  expect(result.changedError).toBeLessThan(250);
});
