// Wire decoders for inbound `Client.Media` messages.
//
// Every payload is checked here, at the GMCP boundary, before MediaService
// creates any audio node (sounds-todo/contracts.md § Basic messages). A
// malformed frame throws MediaPayloadError; the GMCP session catches and logs
// it, so a bad packet never reaches Cacophony.

import { SPATIAL_MODELS, type SpatialModel, type SpatialProfile } from './distanceModel';
import type { EffectSpec } from './effects/types';
import type {
  ClientMediaAutomatePayload,
  ClientMediaChainPayload,
  ClientMediaChainStopPayload,
  ClientMediaLoadPayload,
  ClientMediaPlayPayload,
  ClientMediaStopPayload,
  ClientMediaUpdatePayload,
  MediaType,
} from './MediaService';

export class MediaPayloadError extends TypeError {
  override name = 'MediaPayloadError';
}

export interface ClientMediaDefaultPayload {
  readonly url: string;
}

type Fields = Record<string, unknown>;

interface NumberRange {
  readonly min?: number;
  readonly max?: number;
  readonly integer?: boolean;
}

const MEDIA_TYPES: readonly MediaType[] = ['sound', 'music', 'video'];
const CURVES = ['linear', 'exponential'] as const;

function fail(message: string): never {
  throw new MediaPayloadError(message);
}

function fields(raw: unknown, what: string): Fields {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    fail(`${what} requires an object payload`);
  }
  return raw as Fields;
}

function optString(r: Fields, key: string, what: string): string | undefined {
  const value = r[key];
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== 'string') {
    fail(`${what}.${key} must be a string`);
  }
  return value;
}

function requireString(r: Fields, key: string, what: string): string {
  const value = optString(r, key, what);
  if (value === undefined) {
    fail(`${what}.${key} is required`);
  }
  return value;
}

function checkNumber(value: unknown, label: string, range: NumberRange): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    fail(`${label} must be a finite number`);
  }
  if (range.integer && !Number.isInteger(value)) {
    fail(`${label} must be an integer`);
  }
  if ((range.min !== undefined && value < range.min) || (range.max !== undefined && value > range.max)) {
    fail(`${label} must be within ${range.min ?? '-inf'}..${range.max ?? 'inf'}`);
  }
  return value;
}

function optNumber(r: Fields, key: string, what: string, range: NumberRange = {}): number | undefined {
  const value = r[key];
  return value === undefined ? undefined : checkNumber(value, `${what}.${key}`, range);
}

function optBoolean(r: Fields, key: string, what: string): boolean | undefined {
  const value = r[key];
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== 'boolean') {
    fail(`${what}.${key} must be a boolean`);
  }
  return value;
}

function optVector(r: Fields, key: string, what: string): number[] | undefined {
  const value = r[key];
  if (value === undefined) {
    return undefined;
  }
  if (!Array.isArray(value) || value.length !== 3) {
    fail(`${what}.${key} must be a 3-vector`);
  }
  return value.map((component, i) => checkNumber(component, `${what}.${key}[${i}]`, {}));
}

function optMediaType(r: Fields, what: string): MediaType | undefined {
  const value = optString(r, 'type', what);
  if (value === undefined) {
    return undefined;
  }
  const type = MEDIA_TYPES.find((candidate) => candidate === value.toLowerCase());
  if (!type) {
    fail(`${what}.type must be one of ${MEDIA_TYPES.join(', ')}`);
  }
  return type;
}

function params(value: unknown, label: string): Record<string, number | string> {
  const r = fields(value, label);
  const out: Record<string, number | string> = {};
  for (const [name, param] of Object.entries(r)) {
    out[name] = typeof param === 'string' ? param : checkNumber(param, `${label}.${name}`, {});
  }
  return out;
}

function effectSpec(value: unknown, label: string): EffectSpec {
  const r = fields(value, label);
  const spec: EffectSpec = { type: requireString(r, 'type', label) };
  const id = optString(r, 'id', label);
  const algorithm = optString(r, 'algorithm', label);
  const preset = optString(r, 'preset', label);
  const bypass = optBoolean(r, 'bypass', label);
  if (id !== undefined) spec.id = id;
  if (algorithm !== undefined) spec.algorithm = algorithm;
  if (preset !== undefined) spec.preset = preset;
  if (r.params !== undefined) spec.params = params(r.params, `${label}.params`);
  if (bypass !== undefined) spec.bypass = bypass;
  return spec;
}

function optEffects(r: Fields, what: string): EffectSpec[] | undefined {
  const value = r.effects;
  if (value === undefined) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    fail(`${what}.effects must be a list`);
  }
  return value.map((effect, i) => effectSpec(effect, `${what}.effects[${i}]`));
}

function spatialProfile(value: unknown, what: string): SpatialProfile {
  const label = `${what}.spatial`;
  const r = fields(value, label);
  const model = requireString(r, 'model', label);
  const knownModel = SPATIAL_MODELS.find((candidate): candidate is SpatialModel => candidate === model);
  if (!knownModel) {
    fail(`${label}.model must be one of ${SPATIAL_MODELS.join(', ')}`);
  }
  const refDistance = checkNumber(r.refDistance, `${label}.refDistance`, {});
  const maxDistance = checkNumber(r.maxDistance, `${label}.maxDistance`, {});
  const rolloff = checkNumber(r.rolloff, `${label}.rolloff`, { min: 0 });
  const coneInnerAngle = optNumber(r, 'coneInnerAngle', label, { min: 0, max: 360 }) ?? 360;
  const coneOuterAngle = optNumber(r, 'coneOuterAngle', label, { min: 0, max: 360 }) ?? 360;
  const coneOuterGain = optNumber(r, 'coneOuterGain', label, { min: 0, max: 1 }) ?? 1;
  if (refDistance <= 0 || maxDistance <= refDistance) {
    fail(`${label} requires 0 < refDistance < maxDistance`);
  }
  if (coneInnerAngle > coneOuterAngle) {
    fail(`${label}.coneInnerAngle must not exceed coneOuterAngle`);
  }
  return {
    model: knownModel,
    refDistance,
    maxDistance,
    rolloff,
    coneInnerAngle,
    coneOuterAngle,
    coneOuterGain,
  };
}

function optOrientation(r: Fields, what: string): number[] | undefined {
  const vector = optVector(r, 'orientation', what);
  if (!vector) {
    return undefined;
  }
  const length = Math.hypot(vector[0], vector[1], vector[2]);
  if (length === 0) {
    fail(`${what}.orientation must be a non-zero vector`);
  }
  return vector.map((component) => component / length);
}

function optArtwork(r: Fields, what: string): MediaImage[] | undefined {
  const value = r.artwork;
  if (value === undefined) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    fail(`${what}.artwork must be a list`);
  }
  return value.map((item, i) => {
    const label = `${what}.artwork[${i}]`;
    const image = fields(item, label);
    const out: MediaImage = { src: requireString(image, 'src', label) };
    const sizes = optString(image, 'sizes', label);
    const type = optString(image, 'type', label);
    if (sizes !== undefined) out.sizes = sizes;
    if (type !== undefined) out.type = type;
    return out;
  });
}

/** Keep only defined entries, so a field the MOO omitted stays absent ("keep current"). */
function defined<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as T;
}

/**
 * `loopStart` opens the repeat window [loopStart, finish); `start` is the join
 * cursor inside it. The MOO sends all three absolute, in source ms.
 */
function checkLoopWindow(
  window: { start?: number; loopStart?: number; finish?: number },
  what: string,
): void {
  const { start, loopStart, finish } = window;
  if (loopStart === undefined) {
    return;
  }
  if (start !== undefined && loopStart > start) {
    fail(`${what}.loopStart ${loopStart} is after start ${start}`);
  }
  if (finish !== undefined && loopStart >= finish) {
    fail(`${what}.loopStart ${loopStart} is not before finish ${finish}`);
  }
}

/** The fields Play and Update share; Update sends only the groups that changed. */
function mediaFields(r: Fields, what: string) {
  const fieldsOut = {
    name: optString(r, 'name', what),
    url: optString(r, 'url', what),
    type: optMediaType(r, what),
    tag: optString(r, 'tag', what),
    key: optString(r, 'key', what),
    volume: optNumber(r, 'volume', what, { min: 0 }),
    pan: optNumber(r, 'pan', what, { min: -100, max: 100 }),
    fadein: optNumber(r, 'fadein', what, { min: 0 }),
    fadeout: optNumber(r, 'fadeout', what, { min: 0 }),
    start: optNumber(r, 'start', what, { min: 0 }),
    loopStart: optNumber(r, 'loopStart', what, { min: 0 }),
    finish: optNumber(r, 'finish', what, { min: 0 }),
    end: optNumber(r, 'end', what, { min: 0 }),
    loops: optNumber(r, 'loops', what, { min: -1, integer: true }),
    priority: optNumber(r, 'priority', what, { min: 0 }),
    continue: optBoolean(r, 'continue', what),
    is3d: optBoolean(r, 'is3d', what),
    position: optVector(r, 'position', what),
    upmix: optString(r, 'upmix', what),
    channels: optNumber(r, 'channels', what, { min: 1, integer: true }),
    chain: optString(r, 'chain', what),
    send: optNumber(r, 'send', what, { min: 0, max: 1 }),
    effects: optEffects(r, what),
    gainDb: optNumber(r, 'gainDb', what, { min: -60, max: 12 }),
    pitchSemitones: optNumber(r, 'pitchSemitones', what, { min: -24, max: 24 }),
    spatial: r.spatial === undefined ? undefined : spatialProfile(r.spatial, what),
    orientation: optOrientation(r, what),
  };
  checkLoopWindow(fieldsOut, what);
  return fieldsOut;
}

export function decodeMediaDefault(raw: unknown): ClientMediaDefaultPayload {
  if (typeof raw === 'string') {
    return { url: raw };
  }
  const r = fields(raw, 'Client.Media.Default');
  return { url: requireString(r, 'url', 'Client.Media.Default') };
}

export function decodeMediaLoad(raw: unknown): ClientMediaLoadPayload {
  const what = 'Client.Media.Load';
  const r = fields(raw, what);
  return defined({
    name: requireString(r, 'name', what),
    url: optString(r, 'url', what),
    type: optMediaType(r, what),
  });
}

export function decodeMediaPlay(raw: unknown): ClientMediaPlayPayload {
  const what = 'Client.Media.Play';
  const r = fields(raw, what);
  return defined({
    ...mediaFields(r, what),
    name: requireString(r, 'name', what),
    title: optString(r, 'title', what),
    artist: optString(r, 'artist', what),
    album: optString(r, 'album', what),
    artwork: optArtwork(r, what),
  });
}

export function decodeMediaUpdate(raw: unknown): ClientMediaUpdatePayload {
  const what = 'Client.Media.Update';
  const decoded = defined(mediaFields(fields(raw, what), what));
  if (decoded.key === undefined && decoded.name === undefined) {
    fail(`${what} requires a key or name`);
  }
  return decoded;
}

export function decodeMediaStop(raw: unknown): ClientMediaStopPayload {
  const what = 'Client.Media.Stop';
  const r = fields(raw, what);
  return defined({
    name: optString(r, 'name', what),
    type: optMediaType(r, what),
    tag: optString(r, 'tag', what),
    key: optString(r, 'key', what),
    priority: optNumber(r, 'priority', what, { min: 0 }),
  });
}

function requireId(r: Fields, what: string): string {
  const id = requireString(r, 'id', what);
  if (!id) {
    fail(`${what}.id must be non-empty`);
  }
  return id;
}

export function decodeMediaChain(raw: unknown): ClientMediaChainPayload {
  const what = 'Client.Media.Chain';
  const r = fields(raw, what);
  return defined({
    id: requireId(r, what),
    effects: optEffects(r, what),
    preset: optString(r, 'preset', what),
    gain: optNumber(r, 'gain', what, { min: 0 }),
    fadein: optNumber(r, 'fadein', what, { min: 0 }),
  });
}

export function decodeMediaChainStop(raw: unknown): ClientMediaChainStopPayload {
  const what = 'Client.Media.ChainStop';
  return { id: requireId(fields(raw, what), what) };
}

export function decodeMediaAutomate(raw: unknown): ClientMediaAutomatePayload {
  const what = 'Client.Media.Automate';
  const r = fields(raw, what);
  const target = r.target;
  if (typeof target !== 'string' && typeof target !== 'number') {
    fail(`${what}.target must be an effect id or index`);
  }
  if (typeof target === 'number') {
    checkNumber(target, `${what}.target`, { min: 0, integer: true });
  }
  const chain = optString(r, 'chain', what);
  const key = optString(r, 'key', what);
  if (chain === undefined && key === undefined) {
    fail(`${what} requires a chain or key`);
  }
  const curve = optString(r, 'curve', what);
  const knownCurve = CURVES.find((candidate) => candidate === curve);
  if (curve !== undefined && !knownCurve) {
    fail(`${what}.curve must be linear or exponential`);
  }
  return defined({
    chain,
    key,
    target,
    params: r.params === undefined ? undefined : params(r.params, `${what}.params`),
    ramp: optNumber(r, 'ramp', what, { min: 0 }),
    curve: knownCurve,
    bypass: optBoolean(r, 'bypass', what),
  });
}
