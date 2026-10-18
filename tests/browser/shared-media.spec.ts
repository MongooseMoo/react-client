import { expect, test } from '@playwright/test';
import { build } from 'esbuild';
import { resolve } from 'node:path';
import { createServer } from 'node:http';
import type { BrowserContext, Page, Route } from '@playwright/test';
const origin = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

test('accepted locator renewal keeps updates received during loading and preparation', async ({
  page,
  context,
}) => {
  await fixture(page, context, async (route) => {
    if (route.request().url().includes('renewed'))
      await new Promise((resolve) => setTimeout(resolve, 800));
    const bytes = wave(),
      range = route.request().headers().range;
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
  const result = await page.evaluate(async () => {
    const media = globalThis.media;
    const transport = {
      version: 1,
      kind: 'media',
      clockId: 'browser',
      sourceId: 'mix-source',
      revision: 1,
      state: 'playing',
      anchorServerMs: performance.now(),
      positionMs: 0,
      rate: 1,
      mode: 'finite',
      durationMs: 8000,
    };
    globalThis.snapshot = transport;
    await media.play({
      key: 'mix',
      name: 'shared-tone.wav',
      url: location.origin + '/',
      type: 'music',
      is3d: true,
      position: [0, 0, 0],
      transport,
    });
    await media.setChain({ id: 'renew-route', effects: [] });
    const audible = media.sounds.mix;
    if (!audible || !audible.sharedTransportPrepared || !audible.playbacks[0].isPlaying)
      throw new Error(
        'Initial shared voice is not playing: ' +
          JSON.stringify(globalThis.mediaStore.getState().sources),
      );
    const replacing = media.play({
      key: 'mix',
      name: 'shared-tone.wav?renewed=1',
      url: location.origin + '/',
      type: 'music',
      is3d: true,
      position: [0, 0, 0],
      transport,
    });
    media.update({ key: 'mix', volume: 60, occlusion: 0.2 });
    const deadline = performance.now() + 4000;
    while (!media.stagedSharedSounds.get('mix')) {
      if (performance.now() > deadline) throw new Error('No staged renewal');
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    const candidate = media.stagedSharedSounds.get('mix');
    const inherited = candidate.mediaVolume === audible.mediaVolume && candidate.occlusion === 0.2;
    const applications = new Map();
    const apply = media.applySoundState.bind(media);
    media.applySoundState = (sound, payload) => {
      if (payload.volume === 35) applications.set(sound, (applications.get(sound) ?? 0) + 1);
      return apply(sound, payload);
    };
    media.update({
      key: 'mix',
      volume: 35,
      occlusion: 0.7,
      position: [2, 0, 0],
      chain: 'renew-route',
      send: 0.25,
    });
    while (media.sounds.mix === audible) {
      if (performance.now() > deadline) throw new Error('Renewal did not activate');
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    const oldStillAudible = audible.playbacks[0].isPlaying;
    media.update({ key: 'mix', volume: 45, occlusion: 0.5, position: [3, 0, 0] });
    await replacing;
    media.applySoundState = apply;
    const active = media.sounds.mix;
    const result = {
      inherited,
      oldStillAudible,
      replaced: active !== audible,
      playing: active.playbacks[0].isPlaying,
      mixKept:
        active.mediaVolume === audible.mediaVolume &&
        active.occlusion === 0.5 &&
        audible.occlusion === 0.5 &&
        active.namedChain === 'renew-route' &&
        active.namedSend === 0.25 &&
        active.playPayload.position[0] === 3,
      appliedOnce: applications.get(audible) === 1 && applications.get(active) === 1,
    };
    media.shutdown();
    globalThis.clock.shutdown();
    return result;
  });
  expect(result).toEqual({
    inherited: true,
    oldStillAudible: true,
    replaced: true,
    playing: true,
    mixKept: true,
    appliedOnce: true,
  });
});
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

for (const outcome of ['starts', 'fails']) {
  test(`overlapping renewal refreshes its predecessor after load when the second voice ${outcome}`, async ({
    page,
    context,
  }) => {
    await fixture(page, context, (route) => deliverWave(route));
    const result = await page.evaluate(async (outcome) => {
      const media = globalThis.media;
      const transport = {
        version: 1,
        kind: 'media',
        clockId: 'browser',
        sourceId: 'overlap',
        revision: 1,
        state: 'playing',
        anchorServerMs: performance.now(),
        positionMs: 0,
        rate: 1,
        mode: 'finite',
        durationMs: 30000,
      };
      globalThis.snapshot = transport;
      await media.play({
        key: 'radio',
        name: 'shared-tone.wav',
        url: location.origin + '/',
        type: 'sound',
      });
      await media.play({
        key: 'overlap',
        name: 'shared-tone.wav',
        url: location.origin + '/',
        type: 'music',
        is3d: true,
        position: [0, 0, 0],
        transport,
      });
      const original = media.sounds.overlap;
      globalThis.holdSync = true;
      const first = media.play({
        key: 'overlap',
        name: 'shared-tone.wav?overlapA=1',
        url: location.origin + '/',
        type: 'music',
        is3d: true,
        position: [0, 0, 0],
        transport,
      });
      const until = performance.now() + 6000;
      const waitFor = async (predicate) => {
        while (!predicate()) {
          if (performance.now() > until)
            throw new Error('Overlapping renewal did not reach its controlled boundary');
          await new Promise((resolve) => setTimeout(resolve, 5));
        }
      };
      await waitFor(
        () => globalThis.heldSync && media.stagedSharedSounds.get('overlap')?.playbacks[0],
      );
      const a = media.stagedSharedSounds.get('overlap'),
        voiceA = a.playbacks[0];
      let releaseLoad, finishStart;
      const create = media.cacophony.createSound.bind(media.cacophony);
      media.cacophony.createSound = async (...args) => {
        if (!args[0].includes('overlapB')) return create(...args);
        await new Promise((resolve) => {
          releaseLoad = resolve;
        });
        const sound = await create(...args),
          preplay = sound.preplay.bind(sound);
        sound.preplay = () => {
          const voices = preplay(),
            voice = voices[0],
            play = voice.play.bind(voice);
          voice.play = (options) => {
            finishStart = () =>
              outcome === 'starts'
                ? play(options)
                : voice.eventEmitter.emit('error', {
                    error: new Error('Controlled replacement start failure'),
                    timestamp: performance.now(),
                  });
          };
          return voices;
        };
        return sound;
      };
      const second = media.play({
        key: 'overlap',
        name: 'shared-tone.wav?overlapB=1',
        url: location.origin + '/',
        type: 'music',
        is3d: true,
        position: [0, 0, 0],
        transport,
      });
      await waitFor(() => releaseLoad);
      globalThis.holdSync = false;
      media.receiveMediaSync({ ...globalThis.heldSync, transport });
      await first;
      await waitFor(() => media.sounds.overlap === a && original.playbacks.length === 0);
      releaseLoad();
      await waitFor(() => media.sounds.overlap !== a && finishStart);
      const b = media.sounds.overlap,
        voiceB = b.playbacks[0];
      media.update({ key: 'overlap', volume: 34, occlusion: 0.72, position: [2, 0, 0] });
      media.setListenerPosition([17, 0, 0]);
      const tracked = media.retiringSharedSounds.get('overlap');
      const livePredecessor = tracked?.has(a) && !tracked.has(original) && voiceA.isPlaying;
      const mixed =
        a.mediaVolume === 0.34 &&
        b.mediaVolume === 0.34 &&
        voiceA.occlusion === 0.72 &&
        voiceB.occlusion === 0.72 &&
        a.volume === b.volume &&
        a.playPayload.position[0] === 2;
      finishStart();
      await second;
      const active = media.sounds.overlap;
      const settled =
        active === (outcome === 'starts' ? b : a) &&
        active.playbacks[0].isPlaying &&
        active.mediaVolume === 0.34 &&
        active.occlusion === 0.72;
      media.stop({ key: 'overlap' });
      const disposed =
        voiceA.source === undefined &&
        voiceB.source === undefined &&
        !media.stagedSharedSounds.has('overlap') &&
        !media.retiringSharedSounds.has('overlap');
      const radioKept = media.sounds.radio.playbacks[0].isPlaying;
      media.cacophony.createSound = create;
      media.shutdown();
      globalThis.clock.shutdown();
      return { livePredecessor, mixed, settled, disposed, radioKept };
    }, outcome);
    expect(result).toEqual({
      livePredecessor: true,
      mixed: true,
      settled: true,
      disposed: true,
      radioKept: true,
    });
  });
}
async function deliverWave(route: Route, seconds = 30): Promise<void> {
  const bytes = wave(seconds),
    range = route.request().headers().range;
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
}

for (const type of ['music', 'sound']) {
  test(`accepted ${type} renewal owns silent voices through pause, hiding and clock loss`, async ({
    page,
    context,
  }) => {
    await fixture(page, context, (route) => deliverWave(route));
    const results = await page.evaluate(async (type) => {
      const media = globalThis.media;
      const wait = (promise, stage) =>
        new Promise((resolve, reject) => {
          const timer = setTimeout(
            () =>
              reject(
                new Error(stage + ': ' + JSON.stringify(globalThis.mediaStore.getState().sources)),
              ),
            6000,
          );
          promise.then(
            (value) => {
              clearTimeout(timer);
              resolve(value);
            },
            (error) => {
              clearTimeout(timer);
              reject(error);
            },
          );
        });
      await wait(
        media.play({
          key: 'radio',
          name: 'shared-tone.wav',
          url: location.origin + '/',
          type: 'sound',
        }),
        'radio',
      );
      const results = [];
      for (const reason of ['paused', 'hidden', 'clock']) {
        const key = 'deferred-' + reason;
        const transport = {
          version: 1,
          kind: 'media',
          clockId: 'browser',
          sourceId: key,
          revision: 1,
          state: 'playing',
          anchorServerMs: performance.now(),
          positionMs: 0,
          rate: 1,
          mode: 'finite',
          durationMs: 30000,
        };
        globalThis.snapshot = transport;
        await wait(
          media.play({
            key,
            name: 'shared-tone.wav',
            url: location.origin + '/',
            type,
            transport,
          }),
          reason + ' initial',
        );
        const old = media.sounds[key];
        if (reason === 'paused') media.pauseSharedMedia(key);
        else if (reason === 'hidden') media.setSequencePageHidden(true);
        else globalThis.clock.invalidate();
        await wait(
          media.play({
            key,
            name: 'shared-tone.wav?renewed=' + reason,
            url: location.origin + '/',
            type,
            transport,
          }),
          reason + ' renewal',
        );
        const candidate = media.stagedSharedSounds.get(key),
          voice = candidate?.playbacks[0];
        if (!candidate || !voice)
          throw new Error('Accepted deferred renewal has no owned silent voice');
        const silent =
          !voice.isPlaying && candidate.sharedTransportPrepared && !media.pendingLoads.has(key);
        media.update({ key, volume: 36, occlusion: 0.6 });
        const mixKept = candidate.mediaVolume === old.mediaVolume && voice.occlusion === 0.6;
        if (reason === 'hidden') media.setSequencePageHidden(false);
        else if (reason === 'clock')
          globalThis.clock.setLocalMapping({
            clockId: 'browser',
            serverNowMs: performance.now(),
            performanceNowMs: performance.now(),
          });
        let resumed = reason === 'paused';
        if (reason !== 'paused') {
          const until = performance.now() + 5000;
          while (globalThis.mediaStore.getState().sources[key]?.state !== 'playing') {
            if (performance.now() > until) throw new Error('Deferred renewal did not resume');
            await new Promise((resolve) => setTimeout(resolve, 10));
          }
          resumed =
            media.sounds[key] === candidate && voice.isPlaying && candidate.occlusion === 0.6;
        }
        media.stop({ key });
        results.push({
          silent,
          mixKept,
          resumed,
          disposed: voice.source === undefined && candidate.playbacks.length === 0,
          unowned: !media.stagedSharedSounds.has(key) && !media.retiringSharedSounds.has(key),
          radioKept: media.sounds.radio.playbacks[0].isPlaying,
        });
      }
      media.shutdown();
      globalThis.clock.shutdown();
      return results;
    }, type);
    expect(results).toEqual(
      Array.from({ length: 3 }, () => ({
        silent: true,
        mixKept: true,
        resumed: true,
        disposed: true,
        unowned: true,
        radioKept: true,
      })),
    );
  });
}

test('buffer renewal keeps ownership and listener mix through snapshot retry after Play settles', async ({
  page,
  context,
}) => {
  test.setTimeout(30000);
  await fixture(page, context, (route) => deliverWave(route));
  const result = await page.evaluate(async () => {
    const media = globalThis.media;
    const transport = {
      version: 1,
      kind: 'media',
      clockId: 'browser',
      sourceId: 'retry',
      revision: 1,
      state: 'playing',
      anchorServerMs: performance.now(),
      positionMs: 0,
      rate: 1,
      mode: 'finite',
      durationMs: 30000,
    };
    globalThis.snapshot = transport;
    await media.play({
      key: 'retry',
      name: 'shared-tone.wav',
      url: location.origin + '/',
      type: 'sound',
      is3d: true,
      position: [0, 0, 0],
      transport,
    });
    const old = media.sounds.retry;
    globalThis.holdSync = true;
    await media.play({
      key: 'retry',
      name: 'shared-tone.wav?renewed=retry',
      url: location.origin + '/',
      type: 'sound',
      is3d: true,
      position: [0, 0, 0],
      transport,
    });
    const candidate = media.stagedSharedSounds.get('retry'),
      voice = candidate?.playbacks[0];
    if (!candidate || !voice || media.pendingLoads.has('retry'))
      throw new Error('Retry did not outlive the original Play claim');
    media.update({ key: 'retry', volume: 31, occlusion: 0.8 });
    media.setListenerPosition([15, 0, 0]);
    const stagedMix =
      candidate.mediaVolume === old.mediaVolume &&
      voice.occlusion === 0.8 &&
      candidate.volume === old.volume;
    globalThis.holdSync = false;
    const until = performance.now() + 7000;
    while (
      media.sounds.retry !== candidate ||
      globalThis.mediaStore.getState().sources.retry?.state !== 'playing'
    ) {
      if (performance.now() > until) throw new Error('Snapshot retry did not activate');
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    const retained =
      voice.isPlaying &&
      voice.occlusion === 0.8 &&
      candidate.mediaVolume === old.mediaVolume &&
      voice.currentTime > 10;
    media.stop({ key: 'retry' });
    const disposed =
      voice.source === undefined &&
      !media.stagedSharedSounds.has('retry') &&
      !media.retiringSharedSounds.has('retry');
    media.shutdown();
    globalThis.clock.shutdown();
    return { stagedMix, retained, disposed };
  });
  expect(result).toEqual({ stagedMix: true, retained: true, disposed: true });
});

test('higher revision cancellation retains staged HTML ownership after its Play finishes', async ({
  page,
  context,
}) => {
  await fixture(page, context, (route) => deliverWave(route));
  const result = await page.evaluate(async () => {
    const media = globalThis.media;
    const transport = {
      version: 1,
      kind: 'media',
      clockId: 'browser',
      sourceId: 'cancelled',
      revision: 1,
      state: 'playing',
      anchorServerMs: performance.now(),
      positionMs: 0,
      rate: 1,
      mode: 'finite',
      durationMs: 30000,
    };
    globalThis.snapshot = transport;
    await media.play({
      key: 'cancelled',
      name: 'shared-tone.wav',
      url: location.origin + '/',
      type: 'music',
      transport,
    });
    globalThis.holdSync = true;
    const replacement = media.play({
      key: 'cancelled',
      name: 'shared-tone.wav?renewed=cancelled',
      url: location.origin + '/',
      type: 'music',
      transport,
    });
    const until = performance.now() + 5000;
    while (!globalThis.heldSync || !media.stagedSharedSounds.get('cancelled')?.playbacks[0]) {
      if (performance.now() > until)
        throw new Error('Replacement did not reach snapshot preparation');
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    const candidate = media.stagedSharedSounds.get('cancelled'),
      voice = candidate.playbacks[0];
    const prepare = voice.prepareSeek.bind(voice);
    let release,
      gated = false;
    voice.prepareSeek = async (...args) => {
      if (!gated) {
        gated = true;
        await new Promise((resolve) => {
          release = resolve;
        });
      }
      return prepare(...args);
    };
    const paused = { ...transport, revision: 2, state: 'paused', positionMs: 2000 };
    globalThis.snapshot = paused;
    media.update({ key: 'cancelled', transport: paused });
    await replacement;
    if (media.pendingLoads.has('cancelled') || !release)
      throw new Error('Cancelled Play has not yielded ownership to reconciliation');
    media.update({ key: 'cancelled', volume: 27, occlusion: 0.65 });
    const stagedMix = candidate.mediaVolume === 0.27 && voice.occlusion === 0.65;
    release();
    while (media.sounds.cancelled !== candidate) {
      if (performance.now() > until) throw new Error('Paused candidate did not activate silently');
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    globalThis.holdSync = false;
    globalThis.snapshot = {
      ...paused,
      revision: 3,
      state: 'playing',
      anchorServerMs: performance.now(),
    };
    media.update({ key: 'cancelled', transport: globalThis.snapshot });
    while (globalThis.mediaStore.getState().sources.cancelled?.state !== 'playing') {
      if (performance.now() > until) throw new Error('Updated candidate did not play');
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    const retained = voice.isPlaying && voice.occlusion === 0.65 && candidate.mediaVolume === 0.27;
    media.stop({ key: 'cancelled' });
    const disposed = voice.source === undefined;
    media.shutdown();
    globalThis.clock.shutdown();
    return { stagedMix, retained, disposed };
  });
  expect(result).toEqual({ stagedMix: true, retained: true, disposed: true });
});
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
  await context.route('**/shared-tone.wav*', deliver);
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
      if (globalThis.holdSync) {
        globalThis.heldSync = request;
        return;
      }
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
  const stale = await page.evaluate(async () => {
    const sound = globalThis.media.sounds.late;
    const old = globalThis.snapshot;
    globalThis.snapshot = { ...old, revision: old.revision + 1 };
    globalThis.media.update({ key: 'late', transport: globalThis.snapshot });
    await new Promise((resolve) => setTimeout(resolve, 350));
    const volume = sound.volume;
    await globalThis.media.play({
      key: 'late',
      name: 'shared-tone.wav?stale=1',
      url: location.origin + '/',
      type: 'music',
      transport: old,
      volume: 0,
      chain: 'stale-route',
    });
    const rejected =
      globalThis.media.sounds.late === sound &&
      sound.volume === volume &&
      sound.namedChain !== 'stale-route';
    globalThis.media.update({ key: 'late', volume: 25 });
    const mixVolume = sound.volume;
    const racing = globalThis.media.play({
      key: 'late',
      name: 'shared-tone.wav?renewed-race=1',
      url: location.origin + '/',
      type: 'music',
      transport: globalThis.snapshot,
      volume: 0,
      chain: 'stale-route',
    });
    globalThis.snapshot = { ...globalThis.snapshot, revision: globalThis.snapshot.revision + 1 };
    globalThis.media.update({ key: 'late', transport: globalThis.snapshot });
    await racing;
    return {
      rejected,
      activeMixChanged: sound.volume !== volume,
      audible: sound.playbacks[0].isPlaying,
      racedRejected:
        globalThis.media.sounds.late === sound &&
        sound.volume === mixVolume &&
        sound.namedChain !== 'stale-route',
    };
  });
  expect(stale).toEqual({
    rejected: true,
    activeMixChanged: true,
    audible: true,
    racedRejected: true,
  });
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
