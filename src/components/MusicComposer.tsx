import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useStore } from 'zustand';
import type MudClient from '../client';
import { midiService } from '../MidiService';
import { usePreferences } from '../stores/preferencesStore';
import { personalStorageKey, usePersonalDataStore } from '../stores/personalDataStore';
import { createComposerStore } from '../stores/composerStore';
import {
  compileComposition,
  draftFromScore,
  quantizeNotes,
  type CompositionDraft,
  type PatternPart,
} from '../composition/model';
import { CompositionCapture } from '../composition/capture';
import { CompositionAudition } from '../composition/audition';
import { SmfWorkerClient } from '../composition/SmfWorkerClient';
import { LiveOriginRenderer } from '../midi/LiveOriginRenderer';
import type { GMCPClientMidi } from '../gmcp/Client/Midi';
import type { ScoreNote } from '../midi/score';
import { programs as MIDI_PROGRAMS } from '../midi/programs';

const beats = (tick: number) => Number((tick / 960).toFixed(6));
function ticks(value: string): number {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || !Number.isSafeInteger(Math.round(number * 960)))
    throw new RangeError('Enter a non-negative number of beats');
  return Math.round(number * 960);
}
const messageOf = (error: unknown) => (error instanceof Error ? error.message : String(error));
const pitchName = (note: number) =>
  `${['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'][note % 12]}${Math.floor(note / 12) - 1}`;
const eventText = (
  events: readonly { tick: number; controller?: number; value?: number; program?: number }[],
) =>
  events
    .map((event) =>
      `${beats(event.tick)} ${event.controller ?? event.program} ${event.value ?? ''}`.trim(),
    )
    .join('\n');

export default function MusicComposer({ client }: { client: MudClient }) {
  const resources = useMemo(
    () => ({
      client,
      store: createComposerStore(),
      worker: new SmfWorkerClient(),
      monitorId: `local:monitor:${crypto.randomUUID()}`,
    }),
    [client],
  );
  const { store, worker, monitorId } = resources;
  const state = useStore(store);
  const draft = state.history.present;
  const pattern =
    draft.patterns.find((item) => item.id === state.selectedPatternId) ?? draft.patterns[0];
  const part = draft.parts.find((item) => item.id === state.selectedPartId) ?? draft.parts[0];
  const material = pattern?.parts.find((item) => item.partId === part?.id);
  const preferences = usePreferences((state) => state.midi);
  const personal = usePersonalDataStore();
  const owner = personalStorageKey('compositions', personal.owner);
  const midi = client.gmcp.handlers['Client.Midi'] as GMCPClientMidi | undefined;
  const liveStatus = useSyncExternalStore(
    midi?.subscribeLiveStatus ?? (() => () => {}),
    midi?.getLiveStatus ?? (() => ''),
    () => '',
  );
  const [operation, setOperation] = useState<'idle' | 'preparing' | 'auditioning' | 'recording'>(
    'idle',
  );
  const [monitor, setMonitor] = useState(false);
  const [sendToRoom, setSendToRoom] = useState(false);
  const [overdub, setOverdub] = useState(true);
  const [countIn, setCountIn] = useState(4);
  const [inputChannel, setInputChannel] = useState(0);
  const [grid, setGrid] = useState(240);
  const [swing, setSwing] = useState(0);
  const [notePage, setNotePage] = useState(0);
  const [selectedNote, setSelectedNote] = useState<number | undefined>();
  const [noteFields, setNoteFields] = useState({
    beat: '0',
    duration: '1',
    note: '60',
    velocity: '100',
  });
  const [tempoText, setTempoText] = useState('0 120');
  const [meterText, setMeterText] = useState('0 4/4');
  const [controlText, setControlText] = useState('');
  const [programText, setProgramText] = useState('');
  const [now, setNow] = useState(0);
  const [deviceVersion, setDeviceVersion] = useState(0);
  const capture = useRef<CompositionCapture>();
  const captureTimer = useRef<ReturnType<typeof setTimeout>>();
  const releaseRelay = useRef<() => void>();
  const captureStart = useRef(0);
  const epoch = useRef(0);
  const finishRecording = useRef<() => void>(() => {});
  const audition = useMemo(
    () =>
      new CompositionAudition({
        engine: client.media.cacophony,
        getOutput: () => midiService.getSequenceOutput(),
        isPaused: () => client.media.paused,
        correctionMs: () => usePreferences.getState().midi.outputTimingCorrectionMs ?? 0,
        error: (error) => store.getState().report('', error),
        finished: () => setOperation('idle'),
      }),
    [client, store],
  );
  const monitorKeys = useRef(new Map<string, number>());
  const monitorCounter = useRef(0);
  const monitorRenderer = useMemo(
    () =>
      new LiveOriginRenderer({
        getOutput: () =>
          preferences.enabled && !client.media.paused
            ? midiService.getSequenceOutput()
            : Promise.resolve(null),
        getDestination: (context) => {
          if (context !== client.media.cacophony.context)
            throw new Error('Monitor output belongs to another audio context');
          const master = client.media.cacophony.getBus('master');
          if (!master) throw new Error('Audio output unavailable');
          return master.input as unknown as AudioNode;
        },
        error: (error) => store.getState().report('', error),
      }),
    [client, preferences.enabled, store],
  );
  const active = operation !== 'idle';
  const stop = useCallback(() => {
    epoch.current++;
    capture.current = undefined;
    if (captureTimer.current !== undefined) clearTimeout(captureTimer.current);
    captureTimer.current = undefined;
    releaseRelay.current?.();
    releaseRelay.current = undefined;
    audition.stop();
    worker.dispose();
    setOperation('idle');
  }, [audition, worker]);
  const edit = (change: (draft: CompositionDraft) => CompositionDraft) => {
    audition.stop();
    store.getState().edit(change);
  };
  const editMaterial = (change: (value: PatternPart) => PatternPart) => {
    if (!pattern || !part) return;
    edit((value) => ({
      ...value,
      patterns: value.patterns.map((item) =>
        item.id !== pattern.id
          ? item
          : {
              ...item,
              parts: [
                ...item.parts.filter((item) => item.partId !== part.id),
                change(
                  item.parts.find((item) => item.partId === part.id) ?? {
                    partId: part.id,
                    notes: [],
                    controls: [],
                    programs: [],
                  },
                ),
              ],
            },
      ),
    }));
  };
  useEffect(() => {
    stop();
    worker.dispose();
    monitorRenderer.reset();
    monitorKeys.current.clear();
    store.getState().setOwner(owner);
  }, [owner, stop, worker, monitorRenderer, store]);
  useEffect(
    () => () => {
      stop();
      worker.dispose();
      monitorRenderer.reset();
    },
    [stop, worker, monitorRenderer],
  );
  useEffect(() => midi?.subscribePanic(stop), [midi, stop]);
  useEffect(
    () =>
      client.media.subscribePlayback(() => {
        if (client.media.paused) {
          stop();
          monitorRenderer.reset();
          monitorKeys.current.clear();
        }
      }),
    [client, stop, monitorRenderer],
  );
  useEffect(
    () =>
      midiService.subscribeOutput(() => {
        stop();
        monitorRenderer.reset();
        monitorKeys.current.clear();
        setDeviceVersion((value) => value + 1);
      }),
    [stop, monitorRenderer],
  );
  useEffect(
    () =>
      midiService.onDeviceChange(() => {
        if (!midiService.hasInputDevice && capture.current) finishRecording.current();
        setDeviceVersion((value) => value + 1);
      }),
    [],
  );
  useEffect(
    () =>
      midiService.subscribeInputConnection(() => {
        if (!midiService.hasInputDevice && capture.current) finishRecording.current();
        setDeviceVersion((value) => value + 1);
      }),
    [],
  );
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      setNow(performance.now());
      if (capture.current && !midiService.hasInputDevice) finishRecording.current();
    }, 250);
    return () => clearInterval(timer);
  }, [active]);
  useEffect(() => {
    setTempoText(draft.tempos.map((event) => `${beats(event.tick)} ${event.bpm}`).join('\n'));
  }, [draft.tempos]);
  useEffect(() => {
    setMeterText(
      draft.meters
        .map((event) => `${beats(event.tick)} ${event.numerator}/${event.denominator}`)
        .join('\n'),
    );
  }, [draft.meters]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: A different selection must reset the note editor even when both event arrays are absent.
  useEffect(() => {
    setControlText(eventText(material?.controls ?? []));
    setProgramText(eventText(material?.programs ?? []));
    setNotePage(0);
    setSelectedNote(undefined);
  }, [pattern?.id, part?.id, material?.controls, material?.programs]);
  useEffect(() => {
    monitorRenderer.reset();
    monitorKeys.current.clear();
    if (monitor && part)
      for (let channel = 0; channel < 16; channel++)
        monitorRenderer.program({ originId: monitorId, channel, program: part.program });
    return () => monitorRenderer.reset();
  }, [monitor, part, monitorId, monitorRenderer]);
  useEffect(
    () =>
      midiService.subscribeInput((message, timestamp) => {
        try {
          capture.current?.input(message, timestamp);
        } catch (error) {
          store.getState().report('', messageOf(error));
          finishRecording.current();
        }
        if (!monitor || !preferences.enabled || client.media.paused) return;
        if (message.note && part) {
          const channel = part.kind === 'percussion' ? 9 : (message.note.channel ?? 0);
          const key = `${channel}:${message.note.note}`;
          let eventId = monitorKeys.current.get(key);
          if (message.note.on) {
            eventId = ++monitorCounter.current;
            monitorKeys.current.set(key, eventId);
          }
          if (eventId === undefined) return;
          if (!message.note.on) monitorKeys.current.delete(key);
          void monitorRenderer
            .note({ ...message.note, channel, originId: monitorId, eventId })
            .catch((error) => store.getState().report('', messageOf(error)));
        } else if (
          message.controlChange &&
          [7, 10, 11, 64].includes(message.controlChange.controller)
        )
          monitorRenderer.control({
            ...message.controlChange,
            channel: part?.kind === 'percussion' ? 9 : message.controlChange.channel,
            controller: message.controlChange.controller as 7 | 10 | 11 | 64,
            originId: monitorId,
          });
        else if (message.programChange)
          monitorRenderer.program({
            ...message.programChange,
            channel: part?.kind === 'percussion' ? 9 : message.programChange.channel,
            originId: monitorId,
          });
      }),
    [monitor, part, monitorId, monitorRenderer, preferences.enabled, client, store],
  );
  finishRecording.current = () => {
    const recording = capture.current;
    if (!recording) {
      stop();
      return;
    }
    if (performance.now() < captureStart.current) {
      stop();
      state.report('Recording cancelled during count-in.');
      return;
    }
    const result = recording.finish(performance.now());
    const target = result.take;
    stop();
    edit((value) => ({
      ...value,
      takes: [...value.takes, target].slice(-64),
      patterns: value.patterns.map((pattern) =>
        pattern.id !== target.patternId
          ? pattern
          : {
              ...pattern,
              parts: [
                ...pattern.parts.filter((item) => item.partId !== target.partId),
                (() => {
                  const previous = pattern.parts.find((item) => item.partId === target.partId) ?? {
                    partId: target.partId,
                    notes: [],
                    controls: [],
                    programs: [],
                  };
                  return {
                    ...previous,
                    endTick: pattern.durationTicks,
                    notes: [...(overdub ? previous.notes : []), ...result.notes].sort(
                      (a, b) => a[0] - b[0],
                    ),
                    controls: [...(overdub ? previous.controls : []), ...result.controls].sort(
                      (a, b) => a.tick - b.tick,
                    ),
                    programs: [...(overdub ? previous.programs : []), ...result.programs].sort(
                      (a, b) => a.tick - b.tick,
                    ),
                    bends: [...(overdub ? (previous.bends ?? []) : []), ...result.bends].sort(
                      (a, b) => a.tick - b.tick,
                    ),
                  };
                })(),
              ],
            },
      ),
    }));
    if (!store.getState().error)
      store
        .getState()
        .report(`Recorded ${result.notes.length} notes. Original timestamps retained.`);
  };
  const start = async (record: boolean, wholeArrangement = false) => {
    stop();
    const operationEpoch = epoch.current;
    if (!preferences.enabled) {
      state.report('', 'Enable MIDI and connect a browser output on the MIDI tab.');
      return;
    }
    if (record && !midiService.hasInputDevice) {
      state.report('', 'Connect an input device on the MIDI tab before recording.');
      return;
    }
    state.report(record ? 'Preparing recording…' : 'Preparing private audition…');
    setOperation('preparing');
    try {
      const score = compileComposition(
        store.getState().history.present,
        wholeArrangement ? undefined : pattern?.id,
      );
      const playbackScore =
        record && !overdub
          ? { ...score, parts: score.parts.map((item) => ({ ...item, notes: [] })) }
          : score;
      if (record && !sendToRoom) releaseRelay.current = midi?.suspendInputRelay();
      const anchor = await audition.start(playbackScore, record ? countIn : 0);
      if (operationEpoch !== epoch.current) return;
      if (record && pattern && part) {
        capture.current = new CompositionCapture({
          score,
          partId: part.id,
          patternId: pattern.id,
          startPerformanceMs: anchor.startPerformanceMs,
          channel: inputChannel,
        });
        captureStart.current = anchor.startPerformanceMs;
        captureTimer.current = setTimeout(
          () => finishRecording.current(),
          Math.max(0, capture.current.endPerformanceMs - performance.now()),
        );
        setOperation('recording');
        setNow(performance.now());
        state.report('Recording armed.');
      } else {
        setOperation('auditioning');
        state.report('Private audition playing.');
      }
    } catch (error) {
      if (operationEpoch === epoch.current) {
        stop();
        if (!(error instanceof DOMException && error.name === 'AbortError'))
          state.report('', messageOf(error));
      }
    }
  };
  const importFile = async (file: File) => {
    stop();
    const operationEpoch = epoch.current;
    if (file.size > 1048576) {
      state.report('', 'MIDI file exceeds 1 MiB.');
      return;
    }
    setOperation('preparing');
    state.report('Importing MIDI…');
    try {
      const bytes = await file.arrayBuffer();
      if (operationEpoch !== epoch.current) return;
      const result = await worker.import(bytes);
      if (operationEpoch !== epoch.current) return;
      store
        .getState()
        .replaceDraft(
          draftFromScore(result.score, file.name.replace(/\.midi?$/i, ''), result.sourceFormat),
        );
      state.report(
        result.warnings.length ? `Imported. ${result.warnings.join(' ')}` : 'MIDI imported.',
      );
      setOperation('idle');
    } catch (error) {
      if (operationEpoch === epoch.current) {
        setOperation('idle');
        state.report('', messageOf(error));
      }
    }
  };
  const exportFile = async () => {
    stop();
    const operationEpoch = epoch.current;
    setOperation('preparing');
    try {
      const value = store.getState().history.present;
      const bytes = await worker.export(
        compileComposition(value, undefined, false),
        value.sourceFormat,
      );
      if (operationEpoch !== epoch.current) return;
      const url = URL.createObjectURL(new Blob([bytes], { type: 'audio/midi' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${value.name || 'composition'}.mid`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      state.report('MIDI exported.');
      setOperation('idle');
    } catch (error) {
      if (operationEpoch === epoch.current) {
        setOperation('idle');
        state.report('', messageOf(error));
      }
    }
  };
  const addPattern = (copy: boolean) => {
    if (!pattern || draft.patterns.length >= 64) return;
    const id = crypto.randomUUID();
    edit((value) => ({
      ...value,
      patterns: [
        ...value.patterns,
        copy
          ? { ...pattern, id, name: `${pattern.name} copy` }
          : {
              id,
              name: `Pattern ${value.patterns.length + 1}`,
              durationTicks: pattern.durationTicks,
              parts: value.parts.map((part) => ({
                partId: part.id,
                notes: [],
                controls: [],
                programs: [],
              })),
            },
      ],
    }));
    store.getState().selectPattern(id);
  };
  const notes = material?.notes ?? [];
  useEffect(() => {
    setNotePage((value) => Math.min(value, Math.max(0, Math.ceil(notes.length / 50) - 1)));
  }, [notes.length]);
  const page = notes.slice(notePage * 50, (notePage + 1) * 50);
  void deviceVersion;
  return (
    <section aria-label="Music composer">
      <h3>Music composer</h3>
      <p>Drafts and auditions stay private. Save on this browser, or export a MIDI file.</p>
      {state.error && <p role="alert">{state.error}</p>}
      <p role="status">{state.status}</p>
      {liveStatus && <p>{liveStatus}</p>}
      <label>
        <input
          type="checkbox"
          checked={preferences.enabled}
          onChange={(event) =>
            usePreferences
              .getState()
              .setMidi({ ...preferences, enabled: event.currentTarget.checked })
          }
        />
        Enable MIDI
      </label>
      <label>
        Output timing correction (milliseconds; positive plays later)
        <input
          type="number"
          min={-500}
          max={500}
          value={preferences.outputTimingCorrectionMs ?? 0}
          onChange={(event) => {
            const value = Number(event.currentTarget.value);
            if (Number.isFinite(value))
              usePreferences.getState().setMidi({
                ...preferences,
                outputTimingCorrectionMs: Math.max(-500, Math.min(500, value)),
              });
          }}
        />
      </label>
      <fieldset disabled={active || state.busy}>
        <legend>Local drafts</legend>
        <label>
          Composition name
          <input
            maxLength={256}
            value={draft.name}
            onChange={(event) => edit((value) => ({ ...value, name: event.currentTarget.value }))}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            stop();
            state.newDraft();
          }}
        >
          New composition
        </button>
        <button
          type="button"
          disabled={!owner}
          onClick={() => {
            void state.save();
          }}
        >
          Save locally
        </button>
        <button
          type="button"
          disabled={!state.history.past.length}
          onClick={() => {
            stop();
            state.undo();
          }}
        >
          Undo
        </button>
        <button
          type="button"
          disabled={!state.history.future.length}
          onClick={() => {
            stop();
            state.redo();
          }}
        >
          Redo
        </button>
        {!owner && (
          <p>Sign in with a personal browser session to save drafts for your character.</p>
        )}
        <ul aria-label="Saved compositions">
          {state.saved.map((saved) => (
            <li key={saved.id}>
              {saved.name}
              <button
                type="button"
                onClick={() => {
                  stop();
                  void state.load(saved.id);
                }}
              >
                Load {saved.name}
              </button>
              <button
                type="button"
                onClick={() => {
                  void state.removeSaved(saved.id);
                }}
              >
                Delete saved copy of {saved.name}
              </button>
            </li>
          ))}
        </ul>
        <label>
          Import MIDI file
          <input
            type="file"
            accept=".mid,.midi,audio/midi"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) void importFile(file);
              event.currentTarget.value = '';
            }}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            void exportFile();
          }}
        >
          Export MIDI
        </button>
      </fieldset>
      <fieldset disabled={active || state.busy}>
        <legend>Parts and patterns</legend>
        <label>
          Part
          <select
            value={part?.id ?? ''}
            onChange={(event) => state.selectPart(event.currentTarget.value)}
          >
            {draft.parts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={draft.parts.length >= 16}
          onClick={() => {
            const id = crypto.randomUUID();
            edit((value) => ({
              ...value,
              parts: [
                ...value.parts,
                {
                  id,
                  name: `Part ${value.parts.length + 1}`,
                  kind: 'melodic',
                  program: 0,
                  gain: 100,
                  pan: 64,
                  mute: false,
                  solo: false,
                },
              ],
              patterns: value.patterns.map((pattern) => ({
                ...pattern,
                parts: [...pattern.parts, { partId: id, notes: [], controls: [], programs: [] }],
              })),
            }));
            state.selectPart(id);
          }}
        >
          Add part
        </button>
        <button
          type="button"
          disabled={draft.parts.length <= 1}
          onClick={() => {
            edit((value) => ({
              ...value,
              parts: value.parts.filter((item) => item.id !== part.id),
              patterns: value.patterns.map((pattern) => ({
                ...pattern,
                parts: pattern.parts.filter((item) => item.partId !== part.id),
              })),
              takes: value.takes.filter((take) => take.partId !== part.id),
            }));
            state.selectPart(store.getState().history.present.parts[0].id);
          }}
        >
          Delete part and its notes
        </button>
        {part && (
          <>
            <label>
              Part name
              <input
                maxLength={256}
                value={part.name}
                onChange={(event) =>
                  edit((value) => ({
                    ...value,
                    parts: value.parts.map((item) =>
                      item.id === part.id ? { ...item, name: event.currentTarget.value } : item,
                    ),
                  }))
                }
              />
            </label>
            <label>
              Instrument type
              <select
                value={part.kind}
                onChange={(event) => {
                  const kind = event.currentTarget.value as 'melodic' | 'percussion';
                  edit((value) => ({
                    ...value,
                    parts: value.parts.map((item) =>
                      item.id === part.id ? { ...item, kind } : item,
                    ),
                  }));
                }}
              >
                <option value="melodic">Melodic</option>
                <option value="percussion">General MIDI drums (notes 35–81)</option>
              </select>
            </label>
            <label>
              Program
              <select
                value={part.program}
                onChange={(event) =>
                  edit((value) => ({
                    ...value,
                    parts: value.parts.map((item) =>
                      item.id === part.id
                        ? { ...item, program: Number(event.currentTarget.value) }
                        : item,
                    ),
                  }))
                }
              >
                {MIDI_PROGRAMS.map((name, index) => (
                  <option key={name} value={index}>
                    {index}: {name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Initial volume (0–127)
              <input
                type="number"
                min={0}
                max={127}
                value={part.gain}
                onChange={(event) =>
                  edit((value) => ({
                    ...value,
                    parts: value.parts.map((item) =>
                      item.id === part.id
                        ? { ...item, gain: Number(event.currentTarget.value) }
                        : item,
                    ),
                  }))
                }
              />
            </label>
            <label>
              Initial pan (0 left, 64 centre, 127 right)
              <input
                type="number"
                min={0}
                max={127}
                value={part.pan}
                onChange={(event) =>
                  edit((value) => ({
                    ...value,
                    parts: value.parts.map((item) =>
                      item.id === part.id
                        ? { ...item, pan: Number(event.currentTarget.value) }
                        : item,
                    ),
                  }))
                }
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={part.mute}
                onChange={(event) =>
                  edit((value) => ({
                    ...value,
                    parts: value.parts.map((item) =>
                      item.id === part.id ? { ...item, mute: event.currentTarget.checked } : item,
                    ),
                  }))
                }
              />
              Mute part in private audition
            </label>
            <label>
              <input
                type="checkbox"
                checked={part.solo}
                onChange={(event) =>
                  edit((value) => ({
                    ...value,
                    parts: value.parts.map((item) =>
                      item.id === part.id ? { ...item, solo: event.currentTarget.checked } : item,
                    ),
                  }))
                }
              />
              Solo part in private audition
            </label>
          </>
        )}
        <label>
          Pattern
          <select
            value={pattern?.id ?? ''}
            onChange={(event) => state.selectPattern(event.currentTarget.value)}
          >
            {draft.patterns.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={draft.patterns.length >= 64}
          onClick={() => addPattern(false)}
        >
          New pattern
        </button>
        <button
          type="button"
          disabled={draft.patterns.length >= 64}
          onClick={() => addPattern(true)}
        >
          Copy pattern
        </button>
        <button
          type="button"
          disabled={draft.patterns.length <= 1}
          onClick={() => {
            edit((value) => ({
              ...value,
              patterns: value.patterns.filter((item) => item.id !== pattern.id),
              sections: value.sections.filter((item) => item.patternId !== pattern.id),
              takes: value.takes.filter((take) => take.patternId !== pattern.id),
            }));
            state.selectPattern(store.getState().history.present.patterns[0].id);
          }}
        >
          Delete pattern and its sections
        </button>
        {pattern && (
          <>
            <label>
              Pattern name
              <input
                maxLength={256}
                value={pattern.name}
                onChange={(event) =>
                  edit((value) => ({
                    ...value,
                    patterns: value.patterns.map((item) =>
                      item.id === pattern.id ? { ...item, name: event.currentTarget.value } : item,
                    ),
                  }))
                }
              />
            </label>
            <label>
              Pattern length (quarter-note beats)
              <input
                type="number"
                min={1 / 960}
                step="any"
                value={beats(pattern.durationTicks)}
                onChange={(event) => {
                  const durationTicks = ticks(event.currentTarget.value);
                  edit((value) => ({
                    ...value,
                    patterns: value.patterns.map((item) =>
                      item.id === pattern.id ? { ...item, durationTicks } : item,
                    ),
                  }));
                }}
              />
            </label>
          </>
        )}
      </fieldset>
      <fieldset disabled={active || state.busy}>
        <legend>Notes in selected pattern and part</legend>
        <p>Positions and lengths use quarter-note beats. Triplets are supported.</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            try {
              const row: ScoreNote = [
                ticks(noteFields.beat),
                ticks(noteFields.duration),
                Number(noteFields.note),
                Number(noteFields.velocity),
              ];
              editMaterial((value) => ({
                ...value,
                endTick: pattern.durationTicks,
                notes: [...value.notes.filter((_, index) => index !== selectedNote), row].sort(
                  (a, b) => a[0] - b[0],
                ),
              }));
              setSelectedNote(undefined);
            } catch (error) {
              state.report('', messageOf(error));
            }
          }}
        >
          <label>
            Start beat
            <input
              type="number"
              min={0}
              step="any"
              value={noteFields.beat}
              onChange={(event) =>
                setNoteFields({ ...noteFields, beat: event.currentTarget.value })
              }
            />
          </label>
          <label>
            Length in beats
            <input
              type="number"
              min={1 / 960}
              step="any"
              value={noteFields.duration}
              onChange={(event) =>
                setNoteFields({ ...noteFields, duration: event.currentTarget.value })
              }
            />
          </label>
          <label>
            MIDI note
            <input
              type="number"
              min={part?.kind === 'percussion' ? 35 : 0}
              max={part?.kind === 'percussion' ? 81 : 127}
              value={noteFields.note}
              onChange={(event) =>
                setNoteFields({ ...noteFields, note: event.currentTarget.value })
              }
            />
          </label>
          <label>
            Velocity
            <input
              type="number"
              min={1}
              max={127}
              value={noteFields.velocity}
              onChange={(event) =>
                setNoteFields({ ...noteFields, velocity: event.currentTarget.value })
              }
            />
          </label>
          <button type="submit">
            {selectedNote === undefined ? 'Add note' : 'Apply note edit'}
          </button>
          {selectedNote !== undefined && (
            <button type="button" onClick={() => setSelectedNote(undefined)}>
              Cancel note edit
            </button>
          )}
        </form>
        <p>
          {notes.length} notes. Page {notePage + 1} of {Math.max(1, Math.ceil(notes.length / 50))}.
        </p>
        <ol start={notePage * 50 + 1} aria-label="Pattern notes">
          {page.map((row, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Canonical note identity is its row index within this selected part and pattern; rows contain no independent component state.
            <li key={notePage * 50 + index}>
              Beat {beats(row[0])}, length {beats(row[1])}, {pitchName(row[2])} ({row[2]}), velocity{' '}
              {row[3]}{' '}
              <button
                type="button"
                onClick={() => {
                  setSelectedNote(notePage * 50 + index);
                  setNoteFields({
                    beat: String(beats(row[0])),
                    duration: String(beats(row[1])),
                    note: String(row[2]),
                    velocity: String(row[3]),
                  });
                }}
              >
                Edit note {notePage * 50 + index + 1}
              </button>
              <button
                type="button"
                onClick={() =>
                  editMaterial((value) => ({
                    ...value,
                    notes: value.notes.filter((_, position) => position !== notePage * 50 + index),
                  }))
                }
              >
                Delete note {notePage * 50 + index + 1}
              </button>
            </li>
          ))}
        </ol>
        <button
          type="button"
          disabled={notePage === 0}
          onClick={() => setNotePage((value) => value - 1)}
        >
          Previous notes
        </button>
        <button
          type="button"
          disabled={(notePage + 1) * 50 >= notes.length}
          onClick={() => setNotePage((value) => value + 1)}
        >
          Next notes
        </button>
        <label>
          Quantize grid
          <select value={grid} onChange={(event) => setGrid(Number(event.currentTarget.value))}>
            <option value={960}>Quarter notes</option>
            <option value={480}>Eighth notes</option>
            <option value={320}>Eighth-note triplets</option>
            <option value={240}>Sixteenth notes</option>
            <option value={160}>Sixteenth-note triplets</option>
          </select>
        </label>
        <label>
          Swing percent
          <input
            type="number"
            min={0}
            max={75}
            value={swing}
            onChange={(event) => setSwing(Number(event.currentTarget.value))}
          />
        </label>
        <button
          type="button"
          onClick={() =>
            editMaterial((value) => ({
              ...value,
              notes: quantizeNotes(value.notes, grid, swing / 100, pattern.durationTicks),
            }))
          }
        >
          Quantize selected part
        </button>
        <details>
          <summary>Controller and program events</summary>
          <p>
            One event per line: beat controller value, or beat program. Imported metadata and pitch
            bends are retained for MIDI export.
          </p>
          <label>
            Controller events
            <textarea
              maxLength={65536}
              value={controlText}
              onChange={(event) => setControlText(event.currentTarget.value)}
            />
          </label>
          <label>
            Program events
            <textarea
              maxLength={65536}
              value={programText}
              onChange={(event) => setProgramText(event.currentTarget.value)}
            />
          </label>
          <button
            type="button"
            onClick={() => {
              try {
                const controls = controlText.trim()
                  ? controlText
                      .trim()
                      .split(/\n/)
                      .map((line) => {
                        const [beat, cc, value] = line.trim().split(/\s+/);
                        return { tick: ticks(beat), controller: Number(cc), value: Number(value) };
                      })
                  : [];
                const programs = programText.trim()
                  ? programText
                      .trim()
                      .split(/\n/)
                      .map((line) => {
                        const [beat, program] = line.trim().split(/\s+/);
                        return { tick: ticks(beat), program: Number(program) };
                      })
                  : [];
                editMaterial((value) => ({
                  ...value,
                  endTick: pattern.durationTicks,
                  controls,
                  programs,
                }));
              } catch (error) {
                state.report('', messageOf(error));
              }
            }}
          >
            Apply event edits
          </button>
        </details>
      </fieldset>
      <fieldset disabled={active || state.busy}>
        <legend>Tempo, meter and key signature</legend>
        <label>
          Tempo map (beat BPM)
          <textarea
            maxLength={65536}
            value={tempoText}
            onChange={(event) => setTempoText(event.currentTarget.value)}
          />
        </label>
        <label>
          Meter map (beat numerator/denominator)
          <textarea
            maxLength={65536}
            value={meterText}
            onChange={(event) => setMeterText(event.currentTarget.value)}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            try {
              const tempos = tempoText
                .trim()
                .split(/\n/)
                .map((line) => {
                  const [beat, bpm] = line.trim().split(/\s+/);
                  return { tick: ticks(beat), bpm: Number(bpm) };
                });
              const meters = meterText
                .trim()
                .split(/\n/)
                .map((line) => {
                  const [beat, meter] = line.trim().split(/\s+/);
                  const [numerator, denominator] = (meter ?? '').split('/').map(Number);
                  return { tick: ticks(beat), numerator, denominator };
                });
              edit((value) => ({ ...value, tempos, meters }));
            } catch (error) {
              state.report('', messageOf(error));
            }
          }}
        >
          Apply tempo and meter
        </button>
        <label>
          Key signature
          <select
            value={draft.key}
            onChange={(event) =>
              edit((value) => ({ ...value, key: Number(event.currentTarget.value) }))
            }
          >
            {Array.from({ length: 15 }, (_, index) => index - 7).map((value) => (
              <option key={value} value={value}>
                {value === 0
                  ? 'No sharps or flats'
                  : `${Math.abs(value)} ${value < 0 ? 'flats' : 'sharps'}`}
              </option>
            ))}
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={draft.minor}
            onChange={(event) =>
              edit((value) => ({ ...value, minor: event.currentTarget.checked }))
            }
          />
          Minor key
        </label>
      </fieldset>
      <fieldset disabled={active || state.busy}>
        <legend>Arrangement</legend>
        <ol aria-label="Arrangement sections">
          {draft.sections.map((section, index) => (
            <li key={section.id}>
              <label>
                Section {index + 1} pattern
                <select
                  value={section.patternId}
                  onChange={(event) =>
                    edit((value) => ({
                      ...value,
                      sections: value.sections.map((item) =>
                        item.id === section.id
                          ? { ...item, patternId: event.currentTarget.value }
                          : item,
                      ),
                    }))
                  }
                >
                  {draft.patterns.map((pattern) => (
                    <option key={pattern.id} value={pattern.id}>
                      {pattern.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Section {index + 1} length in beats
                <input
                  type="number"
                  min={1 / 960}
                  step="any"
                  value={beats(section.lengthTicks)}
                  onChange={(event) => {
                    const lengthTicks = ticks(event.currentTarget.value);
                    edit((value) => ({
                      ...value,
                      sections: value.sections.map((item) =>
                        item.id === section.id ? { ...item, lengthTicks } : item,
                      ),
                    }));
                  }}
                />
              </label>
              <label>
                Section {index + 1} repeats
                <input
                  type="number"
                  min={1}
                  max={64}
                  value={section.repeat}
                  onChange={(event) =>
                    edit((value) => ({
                      ...value,
                      sections: value.sections.map((item) =>
                        item.id === section.id
                          ? { ...item, repeat: Number(event.currentTarget.value) }
                          : item,
                      ),
                    }))
                  }
                />
              </label>
              <label>
                Section {index + 1} fit
                <select
                  value={section.mode}
                  onChange={(event) =>
                    edit((value) => ({
                      ...value,
                      sections: value.sections.map((item) =>
                        item.id === section.id
                          ? { ...item, mode: event.currentTarget.value as 'fill' | 'truncate' }
                          : item,
                      ),
                    }))
                  }
                >
                  <option value="truncate">Play once; truncate or leave silence</option>
                  <option value="fill">Repeat to fill; truncate final pass</option>
                </select>
              </label>
              <button
                type="button"
                disabled={index === 0}
                onClick={() =>
                  edit((value) => {
                    const sections = [...value.sections];
                    [sections[index - 1], sections[index]] = [sections[index], sections[index - 1]];
                    return { ...value, sections };
                  })
                }
              >
                Move section {index + 1} up
              </button>
              <button
                type="button"
                disabled={index === draft.sections.length - 1}
                onClick={() =>
                  edit((value) => {
                    const sections = [...value.sections];
                    [sections[index + 1], sections[index]] = [sections[index], sections[index + 1]];
                    return { ...value, sections };
                  })
                }
              >
                Move section {index + 1} down
              </button>
              <button
                type="button"
                onClick={() =>
                  edit((value) => ({
                    ...value,
                    sections: value.sections.filter((item) => item.id !== section.id),
                  }))
                }
              >
                Remove section {index + 1}
              </button>
            </li>
          ))}
        </ol>
        <button
          type="button"
          disabled={draft.sections.length >= 256}
          onClick={() =>
            edit((value) => ({
              ...value,
              sections: [
                ...value.sections,
                {
                  id: crypto.randomUUID(),
                  patternId: pattern.id,
                  lengthTicks: pattern.durationTicks,
                  repeat: 1,
                  mode: 'truncate',
                },
              ],
            }))
          }
        >
          Add selected pattern to arrangement
        </button>
      </fieldset>
      <fieldset>
        <legend>Private playback and recording</legend>
        <button
          type="button"
          disabled={active || !preferences.enabled}
          onClick={() => {
            void start(false);
          }}
        >
          Audition pattern
        </button>
        <button
          type="button"
          disabled={active || !preferences.enabled}
          onClick={() => {
            void start(false, true);
          }}
        >
          Audition arrangement
        </button>
        <button
          type="button"
          disabled={!active}
          onClick={() => {
            if (capture.current) finishRecording.current();
            else {
              stop();
              state.report('Private playback stopped.');
            }
          }}
        >
          Stop private playback or recording
        </button>
        <label>
          <input
            type="checkbox"
            checked={monitor}
            onChange={(event) => setMonitor(event.currentTarget.checked)}
          />
          Monitor keyboard locally
        </label>
        <label>
          <input
            type="checkbox"
            disabled={active}
            checked={sendToRoom}
            onChange={(event) => setSendToRoom(event.currentTarget.checked)}
          />
          Send keyboard to room while recording
        </label>
        <label>
          <input
            type="checkbox"
            disabled={active}
            checked={overdub}
            onChange={(event) => setOverdub(event.currentTarget.checked)}
          />
          Overdub existing notes
        </label>
        <label>
          Input channel
          <select
            disabled={active}
            value={inputChannel}
            onChange={(event) => setInputChannel(Number(event.currentTarget.value))}
          >
            {Array.from({ length: 16 }, (_, index) => index).map((channel) => (
              <option key={channel} value={channel}>
                {channel + 1}
              </option>
            ))}
          </select>
        </label>
        <label>
          Count-in beats
          <select
            disabled={active}
            value={countIn}
            onChange={(event) => setCountIn(Number(event.currentTarget.value))}
          >
            {[0, 1, 2, 3, 4, 8, 16].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={active || !preferences.enabled || !midiService.hasInputDevice}
          onClick={() => {
            void start(true);
          }}
        >
          Record selected pattern
        </button>
        {!midiService.hasInputDevice && (
          <p>Connect an input device on the MIDI tab before recording.</p>
        )}
        {operation === 'recording' && (
          <p aria-live="off">
            {now < captureStart.current
              ? `Count-in: ${Math.ceil((captureStart.current - now) / 1000)} seconds`
              : `Recording: ${Math.max(0, Math.ceil(((capture.current?.endPerformanceMs ?? now) - now) / 1000))} seconds remaining`}
          </p>
        )}
        <p>{draft.takes.length} original recording takes retained.</p>
      </fieldset>
    </section>
  );
}
