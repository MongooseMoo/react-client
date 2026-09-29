import { describe, expect, it } from 'vitest';

import {
  decodeMediaAutomate,
  decodeMediaChain,
  decodeMediaChainStop,
  decodeMediaDefault,
  decodeMediaLoad,
  decodeMediaPlay,
  decodeMediaStop,
  decodeMediaUpdate,
  MediaPayloadError,
} from './mediaPayloads';

// Frames captured from the live MOO (notes/sound-moo-audit-2026-09-29.md §3.1).
const catalogPlay = {
  filename: 'ambience/amusement-arcade-electronic-games-fruit-machines-musical-jingles.m4a',
  finish: 40560.2040816327,
  key: 's4894736',
  loops: 1,
  name: 'ambience/amusement-arcade-electronic-games-fruit-machines-musical-jingles.m4a',
  pan: 0,
  spatial: {
    coneInnerAngle: 360.0,
    coneOuterAngle: 360.0,
    coneOuterGain: 1.0,
    maxDistance: 50.0,
    model: 'inverse',
    refDistance: 1.0,
    rolloff: 1.0,
  },
  start: 40327.3129251701,
  tag: 'tag-#13166',
  type: 'sound',
  url: 'https://mongoose.world/sounds/',
  volume: 50,
};

const chainPlay = {
  chain: 'workshop',
  effects: [{ id: 'muffle', params: { frequency: 400.0 }, type: 'lowpass' }],
  filename: 'fixture/tone.m4a',
  key: 's4894767',
  loops: 1,
  name: 'fixture/tone.m4a',
  pan: 0,
  send: 0.25,
  start: 0.0,
  tag: 'tag-#62592',
  type: 'sound',
  url: 'https://mongoose.world/sounds/',
  volume: 50,
};

const videoPlay = {
  filename: 'fixture/synthetic-600s.mp4',
  is3d: true,
  key: 's4894758',
  loops: 1,
  name: 'fixture/synthetic-600s.mp4',
  pan: 0,
  position: [2.0, 2.0, 1.0],
  start: 240000.002145767,
  tag: 'tag-#13166',
  type: 'video',
  url: 'https://mongoose.world/sounds/fixture/',
  volume: 50,
};

describe('decodeMediaDefault', () => {
  it('accepts the MOO {url} map (contract case "default")', () => {
    expect(decodeMediaDefault({ url: 'https://mongoose.world/sounds/' })).toEqual({
      url: 'https://mongoose.world/sounds/',
    });
  });

  it('accepts an empty url as a reset', () => {
    expect(decodeMediaDefault({ url: '' })).toEqual({ url: '' });
  });

  it('keeps accepting a bare string', () => {
    expect(decodeMediaDefault('https://media.example/')).toEqual({ url: 'https://media.example/' });
  });

  it.each([[{ url: {} }], [{}], [42], [null], [['https://x/']]])('rejects %j', (raw) => {
    expect(() => decodeMediaDefault(raw)).toThrow(MediaPayloadError);
  });
});

describe('decodeMediaPlay', () => {
  it('accepts the captured catalog, chain and video frames', () => {
    expect(decodeMediaPlay(catalogPlay)).toMatchObject({
      key: 's4894736',
      start: 40327.3129251701,
      finish: 40560.2040816327,
      spatial: { model: 'inverse', refDistance: 1, maxDistance: 50, rolloff: 1 },
    });
    expect(decodeMediaPlay(chainPlay)).toMatchObject({
      chain: 'workshop',
      send: 0.25,
      effects: [{ id: 'muffle', type: 'lowpass', params: { frequency: 400 } }],
    });
    expect(decodeMediaPlay(videoPlay)).toMatchObject({ type: 'video', is3d: true, position: [2, 2, 1] });
  });

  it('accepts a door-projected copy: float volume plus an appended lowpass', () => {
    const decoded = decodeMediaPlay({
      ...chainPlay,
      volume: 12.5,
      effects: [
        ...chainPlay.effects,
        { id: 'door-lowpass:#62:north', type: 'lowpass', params: { frequency: 6000.0 } },
      ],
    });
    expect(decoded.volume).toBe(12.5);
    expect(decoded.effects?.[1]).toEqual({
      id: 'door-lowpass:#62:north',
      type: 'lowpass',
      params: { frequency: 6000 },
    });
  });

  it('keeps send 0 (a real value, contract case "chain")', () => {
    expect(decodeMediaPlay({ ...chainPlay, send: 0 }).send).toBe(0);
  });

  it('accepts gainDb, pitchSemitones and orientation', () => {
    expect(
      decodeMediaPlay({ ...catalogPlay, gainDb: 6, pitchSemitones: 12, orientation: [0, 1, 0] }),
    ).toMatchObject({ gainDb: 6, pitchSemitones: 12, orientation: [0, 1, 0] });
  });

  it.each([
    ['a missing name', { ...chainPlay, name: undefined }],
    ['a non-object payload', 'fixture/tone.m4a'],
    ['fractional loops', { ...chainPlay, loops: 1.5 }],
    ['loops below -1', { ...chainPlay, loops: -2 }],
    ['non-finite volume', { ...chainPlay, volume: Number.NaN }],
    ['a string volume', { ...chainPlay, volume: '50' }],
    ['send above 1', { ...chainPlay, send: 1.5 }],
    ['a list chain', { ...chainPlay, chain: ['world', 'sphere'] }],
    ['effects that are not a list', { ...chainPlay, effects: { type: 'lowpass' } }],
    ['an effect without a type', { ...chainPlay, effects: [{ params: { frequency: 400 } }] }],
    ['flat effect params', { ...chainPlay, effects: [{ type: 'lowpass', params: 400 }] }],
    ['a short position', { ...videoPlay, position: [1, 2] }],
    ['gainDb out of range', { ...catalogPlay, gainDb: 20 }],
    ['pitchSemitones out of range', { ...catalogPlay, pitchSemitones: -30 }],
    ['an unknown spatial model', { ...catalogPlay, spatial: { ...catalogPlay.spatial, model: 'custom' } }],
    ['maxDistance not above refDistance', { ...catalogPlay, spatial: { ...catalogPlay.spatial, maxDistance: 1 } }],
    ['an inverted cone', { ...catalogPlay, spatial: { ...catalogPlay.spatial, coneInnerAngle: 300, coneOuterAngle: 90 } }],
    ['a zero orientation', { ...catalogPlay, orientation: [0, 0, 0] }],
  ])('rejects %s', (_label, raw) => {
    expect(() => decodeMediaPlay(raw)).toThrow(MediaPayloadError);
  });
});

describe('decodeMediaUpdate', () => {
  it('passes through only the fields the MOO sent', () => {
    const decoded = decodeMediaUpdate({ key: 's1', volume: 25 });
    expect(decoded).toEqual({ key: 's1', volume: 25 });
    expect('start' in decoded).toBe(false);
  });

  it('accepts chain "" and effects [] as clears', () => {
    expect(decodeMediaUpdate({ key: 's1', chain: '', effects: [] })).toEqual({
      key: 's1',
      chain: '',
      effects: [],
    });
  });

  it('rejects an update with neither key nor name', () => {
    expect(() => decodeMediaUpdate({ volume: 25 })).toThrow(MediaPayloadError);
  });
});

describe('other Client.Media decoders', () => {
  it('decodes Load {name,url}', () => {
    expect(decodeMediaLoad({ name: 'a.ogg', url: 'https://x/' })).toEqual({
      name: 'a.ogg',
      url: 'https://x/',
    });
    expect(() => decodeMediaLoad({ url: 'https://x/' })).toThrow(MediaPayloadError);
  });

  it('decodes Stop {key} and the empty stop-all', () => {
    expect(decodeMediaStop({ key: 'preview:#5' })).toEqual({ key: 'preview:#5' });
    expect(decodeMediaStop({})).toEqual({});
    expect(() => decodeMediaStop({ key: 5 })).toThrow(MediaPayloadError);
  });

  it('decodes the captured Chain frame', () => {
    expect(
      decodeMediaChain({
        effects: [{ id: 'muffle', params: { frequency: 400.0 }, type: 'lowpass' }],
        fadein: 0,
        gain: 1.0,
        id: 'workshop',
      }),
    ).toEqual({
      id: 'workshop',
      effects: [{ id: 'muffle', type: 'lowpass', params: { frequency: 400 } }],
      gain: 1,
      fadein: 0,
    });
    expect(() => decodeMediaChain({ id: '', effects: [] })).toThrow(MediaPayloadError);
  });

  it('decodes ChainStop {id}', () => {
    expect(decodeMediaChainStop({ id: 'workshop' })).toEqual({ id: 'workshop' });
    expect(() => decodeMediaChainStop({})).toThrow(MediaPayloadError);
  });

  it('decodes Automate {chain,target,params,ramp,curve,bypass}', () => {
    expect(
      decodeMediaAutomate({
        chain: 'workshop',
        target: 'muffle',
        params: { frequency: 1200 },
        ramp: 500,
        curve: 'exponential',
        bypass: false,
      }),
    ).toEqual({
      chain: 'workshop',
      target: 'muffle',
      params: { frequency: 1200 },
      ramp: 500,
      curve: 'exponential',
      bypass: false,
    });
    expect(() => decodeMediaAutomate({ chain: 'workshop', params: {} })).toThrow(MediaPayloadError);
    expect(() =>
      decodeMediaAutomate({ chain: 'workshop', target: 'muffle', curve: 'cubic' }),
    ).toThrow(MediaPayloadError);
  });
});
