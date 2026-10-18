import WebAudioTinySynth from '@xrnavigation/webaudio-tinysynth';
import {
  validateScore,
  type CanonicalScore,
  type ScoreNote,
  type ScorePart,
  type ScoreTempo,
  type ScoreMeter,
  type ScoreMetadata,
} from '../midi/score';

type TrackEvent = WebAudioTinySynth.MIDITrackEvent;
function trackName(data: readonly number[]): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(data));
  } catch {
    return data.map((byte) => String.fromCharCode(byte)).join('');
  }
}
export interface SmfImport {
  score: CanonicalScore;
  warnings: string[];
  sourceFormat: 0 | 1;
}
const key = (tick: number, type: number, data: readonly number[]) =>
  `${tick}:${type}:${data.join(',')}`;
/** One bounded parser, shared with the synth dependency, without constructing its player/context. */
export function importSmf(bytes: ArrayBuffer): SmfImport {
  if (bytes.byteLength > 1048576) throw new RangeError('MIDI file exceeds 1 MiB');
  const song = WebAudioTinySynth.parseMIDI(bytes);
  const scale = 960 / (song.timebase / 4);
  const tick = (value: number) => Math.round(value * scale);
  const tempos: ScoreTempo[] = [{ tick: 0, bpm: 120 }];
  const meters: ScoreMeter[] = [{ tick: 0, numerator: 4, denominator: 4 }];
  const parts: ScorePart[] = [];
  const topMetadata: ScoreMetadata[] = [];
  // A MIDI channel spans tracks. Chase its effective automation into each
  // independent score part, retaining each physical track's own metadata.
  const channelEvents = new Map<number, TrackEvent[]>();
  const ordered = song.tracks
    .flatMap((track, trackIndex) => track.events.map((event) => ({ event, trackIndex })))
    .sort((a, b) => a.event.t - b.event.t);
  const trackNotes = new Map<string, ScoreNote[]>();
  const pending = new Map<
    string,
    Array<{ trackIndex: number; channel: number; pitch: number; tick: number; velocity: number }>
  >();
  let closedHeldNotes = false;
  const addNote = (
    onset: { trackIndex: number; channel: number; pitch: number; tick: number; velocity: number },
    end: number,
  ) => {
    if (end > tick(song.tracks[onset.trackIndex].endTick))
      throw new TypeError(
        'A cross-track note release extends beyond its original track end; this file cannot retain both its notes and track boundaries.',
      );
    const key = `${onset.trackIndex}:${onset.channel}`,
      notes = trackNotes.get(key) ?? [];
    notes.push([onset.tick, Math.max(1, end - onset.tick), onset.pitch, onset.velocity]);
    trackNotes.set(key, notes);
  };
  for (const { event, trackIndex } of ordered)
    if (event.kind === 'midi') {
      const channel = event.message[0] & 15;
      const events = channelEvents.get(channel) ?? [];
      events.push(event);
      channelEvents.set(channel, events);
      const [status, pitch, velocity] = event.message,
        type = status & 0xf0;
      const key = `${channel}:${pitch}`;
      if (type === 0x90 && velocity > 0) {
        const queue = pending.get(key) ?? [];
        queue.push({ trackIndex, channel, pitch, tick: tick(event.t), velocity });
        pending.set(key, queue);
      } else if (type === 0x80 || type === 0x90) {
        const onset = pending.get(key)?.shift();
        if (onset) addNote(onset, tick(event.t));
      }
    }
  for (const queue of pending.values())
    for (const onset of queue) {
      const end = tick(song.tracks[onset.trackIndex].endTick);
      if (end > onset.tick) {
        addNote(onset, end);
        closedHeldNotes = true;
      }
    }
  for (const [trackIndex, track] of song.tracks.entries()) {
    const channels = [
      ...new Set(
        track.events.flatMap((event) => (event.kind === 'midi' ? [event.message[0] & 15] : [])),
      ),
    ];
    if (!channels.length) channels.push(0);
    for (const channel of channels) {
      const notes: ScoreNote[] = trackNotes.get(`${trackIndex}:${channel}`) ?? [],
        controls: { tick: number; controller: number; value: number }[] = [],
        programs: { tick: number; program: number }[] = [],
        bends: { tick: number; value: number }[] = [];
      const metadata: ScoreMetadata[] = [];
      for (const event of track.events) {
        const position = tick(event.t);
        if (event.kind === 'meta') {
          if (event.type !== 0x2f)
            metadata.push({ tick: position, type: event.type, data: event.data });
          if (channel === channels[0] && event.type === 0x51 && event.data.length === 3) {
            const microseconds = event.data[0] * 65536 + event.data[1] * 256 + event.data[2];
            if (microseconds) tempos.push({ tick: position, bpm: 60000000 / microseconds });
          }
          if (channel === channels[0] && event.type === 0x58 && event.data.length >= 2)
            meters.push({
              tick: position,
              numerator: event.data[0],
              denominator: 2 ** event.data[1],
            });
          if (channel === channels[0] && event.type === 0x59)
            topMetadata.push({ tick: position, type: event.type, data: event.data });
          continue;
        }
        if (event.kind !== 'midi' || (event.message[0] & 15) !== channel) continue;
        const [status] = event.message;
        const type = status & 0xf0;
        if ([0x80, 0x90, 0xb0, 0xc0, 0xe0].includes(type)) continue;
        else
          throw new TypeError(
            'MIDI pressure messages cannot be represented faithfully by this score format',
          );
      }
      if (
        track.events.some((event) => event.kind === 'midi' && (event.message[0] & 15) === channel)
      ) {
        const effective = new Map<string, Extract<TrackEvent, { kind: 'midi' }>>();
        for (const event of channelEvents.get(channel) ?? [])
          if (event.kind === 'midi' && event.t <= track.endTick) {
            const type = event.message[0] & 0xf0;
            if ([0xb0, 0xc0, 0xe0].includes(type))
              effective.set(
                `${tick(event.t)}:${type}:${type === 0xb0 ? event.message[1] : ''}`,
                event,
              );
          }
        for (const event of effective.values()) {
          const [status, first, second] = event.message,
            position = tick(event.t),
            type = status & 0xf0;
          if (type === 0xb0) controls.push({ tick: position, controller: first, value: second });
          else if (type === 0xc0) programs.push({ tick: position, program: first });
          else bends.push({ tick: position, value: first + second * 128 });
        }
      }
      const name = metadata.filter((event) => event.type === 3).at(-1);
      parts.push({
        id: `smf:${trackIndex}:${channel}`,
        name: name
          ? trackName(name.data)
          : `Track ${trackIndex + 1}${channels.length > 1 ? ` channel ${channel + 1}` : ''}`,
        kind: channel === 9 ? 'percussion' : 'melodic',
        program: programs.find((event) => event.tick === 0)?.program ?? 0,
        channelHint: channel,
        endTick: tick(track.endTick),
        notes: notes.sort((a, b) => a[0] - b[0]),
        controls,
        programs,
        bends,
        metadata,
      });
    }
  }
  const checked = validateScore({
    version: 1,
    contentId: crypto.randomUUID(),
    ppq: 960,
    durationTicks: tick(song.maxTick),
    tempos,
    meters,
    parts,
    metadata: topMetadata,
  });
  if (!checked.ok) throw new TypeError(checked.error);
  const warnings = [...checked.unsupported];
  if (song.hasSysEx) warnings.push('SysEx was omitted; it is never played or exported.');
  if (closedHeldNotes) warnings.push('Notes without a release were closed at their track end.');
  return { score: checked.score, warnings, sourceFormat: song.format };
}

export function exportSmf(score: CanonicalScore, sourceFormat?: 0 | 1): ArrayBuffer {
  const checked = validateScore(score);
  if (!checked.ok) throw new TypeError(checked.error);
  const tracks = new Map<string, WebAudioTinySynth.MIDITrack>();
  const trackIdentity = (part: ScorePart) => {
    const original = /^smf:(\d+):\d+$/.exec(part.id);
    return sourceFormat === 0 ? 'merged' : original ? `track:${original[1]}` : `part:${part.id}`;
  };
  const renamedTracks = new Map<string, string>();
  for (const part of score.parts) {
    const originalName = part.metadata?.filter((event) => event.type === 3).at(-1);
    if (!originalName || part.name === trackName(originalName.data)) continue;
    const key = trackIdentity(part),
      previous = renamedTracks.get(key);
    if (previous !== undefined && previous !== part.name)
      throw new TypeError('Parts sharing one MIDI track need the same exported track name.');
    renamedTracks.set(key, part.name);
  }
  const usedChannels = new Set<number>(
    score.parts.flatMap((part) =>
      part.kind === 'percussion' ? [9] : part.channelHint === undefined ? [] : [part.channelHint],
    ),
  );
  for (const part of score.parts) {
    const trackId = trackIdentity(part);
    let track = tracks.get(trackId);
    if (!track) {
      track = { endTick: 0, events: [] };
      tracks.set(trackId, track);
    }
    let channel = part.channelHint;
    if (part.kind === 'percussion') channel = 9;
    if (channel === undefined) {
      channel = Array.from({ length: 16 }, (_, index) => index).find(
        (candidate) => candidate !== 9 && !usedChannels.has(candidate),
      );
      if (channel === undefined)
        throw new RangeError('No independent MIDI channel remains for this part');
    }
    usedChannels.add(channel);
    track.endTick = Math.max(track.endTick, part.endTick ?? score.durationTicks);
    if (!part.programs.some((event) => event.tick === 0))
      track.events.push({ t: 0, kind: 'midi', message: [0xc0 | channel, part.program] });
    for (const event of part.programs)
      track.events.push({ t: event.tick, kind: 'midi', message: [0xc0 | channel, event.program] });
    for (const [tick, duration, note, velocity] of part.notes) {
      track.events.push({ t: tick, kind: 'midi', message: [0x90 | channel, note, velocity] });
      track.events.push({ t: tick + duration, kind: 'midi', message: [0x80 | channel, note, 0] });
    }
    for (const event of part.controls)
      track.events.push({
        t: event.tick,
        kind: 'midi',
        message: [0xb0 | channel, event.controller, event.value],
      });
    for (const event of part.bends ?? [])
      track.events.push({
        t: event.tick,
        kind: 'midi',
        message: [0xe0 | channel, event.value & 127, event.value >> 7],
      });
    const existing = new Set(
      track.events.flatMap((event) =>
        event.kind === 'meta' ? [key(event.t, event.type, event.data)] : [],
      ),
    );
    const lastName = part.metadata?.filter((event) => event.type === 3).at(-1);
    for (const event of part.metadata ?? []) {
      if (event.type === 0x2f) continue;
      const replacement = renamedTracks.get(trackId);
      const data =
        event === lastName && replacement !== undefined
          ? [...new TextEncoder().encode(replacement)]
          : [...event.data];
      const identity = key(event.tick, event.type, data);
      if (!existing.has(identity)) {
        track.events.push({ t: event.tick, kind: 'meta', type: event.type, data });
        existing.add(identity);
      }
    }
    if (!(part.metadata ?? []).some((event) => event.type === 3))
      track.events.push({
        t: 0,
        kind: 'meta',
        type: 3,
        data: [...new TextEncoder().encode(part.name)],
      });
  }
  let first = tracks.values().next().value as WebAudioTinySynth.MIDITrack | undefined;
  if (!first) {
    first = { endTick: score.durationTicks, events: [] };
    tracks.set('conductor', first);
  }
  const defaultTrack = first;
  const insertMap = (type: number, tick: number, data: number[]) => {
    let target: WebAudioTinySynth.MIDITrack | undefined;
    let previous: Extract<TrackEvent, { kind: 'meta' }> | undefined;
    for (const track of tracks.values()) {
      const found = track.events.find(
        (event): event is Extract<TrackEvent, { kind: 'meta' }> =>
          event.kind === 'meta' && event.type === type && event.t === tick,
      );
      if (found) {
        target = track;
        previous = found;
      }
    }
    const bytes =
      type === 0x58 && previous?.data.length === 4
        ? [data[0], data[1], previous.data[2], previous.data[3]]
        : data;
    for (const track of tracks.values())
      track.events = track.events.filter(
        (event) => event.kind !== 'meta' || event.type !== type || event.t !== tick,
      );
    const destination = target ?? defaultTrack;
    destination.endTick = Math.max(destination.endTick, tick);
    destination.events.push({ t: tick, kind: 'meta', type, data: bytes });
  };
  const tempoTicks = new Set(score.tempos.map((event) => event.tick)),
    meterTicks = new Set(score.meters.map((event) => event.tick));
  for (const track of tracks.values())
    track.events = track.events.filter(
      (event) =>
        event.kind !== 'meta' ||
        ((event.type !== 0x51 || tempoTicks.has(event.t)) &&
          (event.type !== 0x58 || meterTicks.has(event.t))),
    );
  for (const event of score.tempos) {
    const value = Math.round(60000000 / event.bpm);
    insertMap(0x51, event.tick, [(value >> 16) & 255, (value >> 8) & 255, value & 255]);
  }
  for (const event of score.meters)
    insertMap(0x58, event.tick, [event.numerator, Math.log2(event.denominator), 24, 8]);
  for (const event of score.metadata ?? []) insertMap(event.type, event.tick, [...event.data]);
  const ordered = [...tracks.values()];
  for (const track of ordered)
    track.events.sort(
      (a, b) =>
        a.t - b.t ||
        (a.kind === 'midi' && (a.message[0] & 0xf0) === 0x80
          ? -1
          : b.kind === 'midi' && (b.message[0] & 0xf0) === 0x80
            ? 1
            : 0),
    );
  return WebAudioTinySynth.writeMIDI({
    copyright: '',
    text: '',
    tempo: score.tempos[0].bpm,
    timebase: 3840,
    maxTick: score.durationTicks,
    ev: [],
    format: sourceFormat === 0 || ordered.length === 1 ? 0 : 1,
    tracks: ordered,
  });
}
