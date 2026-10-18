import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type MudClient from '../client';
import type { MidiMessage, TimestampedMidiInputCallback } from '../MidiService';
import { usePreferences } from '../stores/preferencesStore';
import { usePersonalDataStore } from '../stores/personalDataStore';
import MusicComposer from './MusicComposer';
import { GMCPAutoLogin } from '../gmcp/Auth';
import { GMCPChar } from '../gmcp/Char';
import type { CanonicalScore } from '../midi/score';

const mocks = vi.hoisted(() => ({
  input: undefined as TimestampedMidiInputCallback | undefined,
  start: vi.fn(),
  stop: vi.fn(),
  release: vi.fn(),
  suspend: vi.fn(),
  monitorNote: vi.fn(async () => {}),
  export: vi.fn(async (_score: CanonicalScore) => new ArrayBuffer(0)),
  worldLoad: undefined as ((score: CanonicalScore, name: string) => void) | undefined,
  outputChanged: undefined as (() => void) | undefined,
  playbackChanged: undefined as (() => void) | undefined,
}));
vi.mock('../MidiService', () => ({
  midiService: {
    hasInputDevice: true,
    getSequenceOutput: vi.fn(),
    subscribeInput: (callback: TimestampedMidiInputCallback) => {
      mocks.input = callback;
      return () => {
        mocks.input = undefined;
      };
    },
    subscribeOutput: (listener: () => void) => {
      mocks.outputChanged = listener;
      return () => {
        mocks.outputChanged = undefined;
      };
    },
    subscribeInputConnection: () => () => {},
    onDeviceChange: () => () => {},
  },
}));
vi.mock('../composition/audition', () => ({
  CompositionAudition: class {
    start = mocks.start;
    stop = mocks.stop;
  },
}));
vi.mock('../composition/SmfWorkerClient', () => ({
  SmfWorkerClient: class {
    dispose() {}
    export = mocks.export;
  },
}));
vi.mock('../midi/LiveOriginRenderer', () => ({
  LiveOriginRenderer: class {
    reset() {}
    program() {}
    control() {}
    note = mocks.monitorNote;
  },
}));
vi.mock('./WorldLibraryPanel', () => ({
  default: ({
    onLoad,
    draft,
  }: {
    onLoad: (score: CanonicalScore, name: string) => void;
    draft: { name: string };
  }) => {
    mocks.worldLoad = onLoad;
    return <p>World draft: {draft.name}</p>;
  },
}));

describe('music composer keyboard controls and capture', () => {
  let now = 0;
  let cleanup = () => {};
  let media: {
    cacophony: object;
    paused: boolean;
    subscribePlayback(listener: () => void): () => void;
  };
  let client: MudClient;
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    mocks.start.mockReset().mockResolvedValue({
      startPerformanceMs: 1000,
      endPerformanceMs: 3000,
      countInStartPerformanceMs: 0,
    });
    mocks.stop.mockClear();
    mocks.release.mockClear();
    mocks.suspend.mockReset().mockReturnValue(mocks.release);
    mocks.monitorNote.mockClear();
    mocks.export.mockClear();
    now = 0;
    usePreferences.getState().setMidi({ ...usePreferences.getState().midi, enabled: true });
    usePersonalDataStore.setState({ owner: undefined, policyReady: true, visitor: false });
    media = {
      cacophony: {},
      paused: false,
      subscribePlayback: (listener) => {
        mocks.playbackChanged = listener;
        return () => {
          mocks.playbackChanged = undefined;
        };
      },
    };
    client = {
      media,
      gmcp: {
        handlers: {
          'Client.Midi': {
            subscribeLiveStatus: () => () => {},
            getLiveStatus: () => '',
            subscribePanic: () => () => {},
            suspendInputRelay: mocks.suspend,
          },
        },
      },
    } as unknown as MudClient;
    const view = render(<MusicComposer client={client} />);
    cleanup = view.unmount;
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  function input(on: boolean, pitch: number, timestamp: number) {
    now = timestamp;
    const message: MidiMessage = {
      rawData: { data: new Uint8Array([on ? 0x90 : 0x80, pitch, on ? 100 : 0]), hex: '', type: '' },
      note: { note: pitch, velocity: on ? 100 : 0, on, channel: 0 },
    };
    act(() => mocks.input?.(message, timestamp));
  }
  async function record() {
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Record selected pattern' }));
    });
  }
  function stop() {
    fireEvent.click(screen.getByRole('button', { name: 'Stop private playback or recording' }));
  }
  function submitNote() {
    const form = screen.getByRole('button', { name: 'Add note' }).closest('form');
    if (!form) throw new Error('The note editor must be a native form');
    fireEvent.submit(form);
  }

  const alice = { runtime: 'runtime', playerUuid: 'alice', playerRef: '#1' },
    bob = { runtime: 'runtime', playerUuid: 'bob', playerRef: '#2' };
  const confirm = (owner = alice) => act(() => usePersonalDataStore.getState().confirm(owner));

  it('preserves an unsaved draft and active capture through real owner clear and same-character confirmation', async () => {
    confirm();
    submitNote();
    const name = screen.getByRole('textbox', { name: 'Composition name' });
    fireEvent.input(name, { target: { value: 'Unsaved private arrangement' } });
    fireEvent.blur(name);
    await record();
    input(true, 64, 1200);
    act(() => usePersonalDataStore.getState().clear('reconnect'));
    expect(screen.getByRole('button', { name: 'Save locally' })).toBeDisabled();
    expect(name).toHaveValue('Unsaved private arrangement');
    expect(
      screen.getByRole('button', { name: 'Stop private playback or recording' }),
    ).toBeEnabled();
    expect(mocks.release).not.toHaveBeenCalled();
    confirm();
    input(false, 64, 1500);
    stop();
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toHaveTextContent('C4 (60)');
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toHaveTextContent('E4 (64)');
    expect(name).toHaveValue('Unsaved private arrangement');
    expect(screen.getByRole('button', { name: 'Save locally' })).toBeEnabled();
  });

  it.each([
    'pause',
    'output',
  ] as const)('finishes capture into an owner-private pending take after %s and restores it only to that owner', async (interruption) => {
    confirm();
    await record();
    input(true, 67, 1200);
    now = 1500;
    act(() => {
      if (interruption === 'pause') {
        media.paused = true;
        mocks.playbackChanged?.();
      } else mocks.outputChanged?.();
    });
    expect(screen.getByRole('button', { name: 'Retry captured take' })).toBeInTheDocument();
    expect(screen.getByText(/1 recorded notes are retained in memory/)).toBeInTheDocument();
    act(() => usePersonalDataStore.getState().clear('reconnect'));
    confirm();
    expect(screen.getByRole('button', { name: 'Retry captured take' })).toBeInTheDocument();
    act(() => usePersonalDataStore.getState().clear('reconnect'));
    confirm(bob);
    expect(screen.queryByRole('button', { name: 'Retry captured take' })).not.toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toBeEmptyDOMElement();
    act(() => usePersonalDataStore.getState().clear('reconnect'));
    confirm();
    fireEvent.click(screen.getByRole('button', { name: 'Retry captured take' }));
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toHaveTextContent('G4 (67)');
  });

  it('quarantines a running capture before exposing a different confirmed or visitor identity', async () => {
    confirm();
    submitNote();
    await record();
    input(true, 64, 1200);
    now = 1600;
    act(() => {
      usePersonalDataStore.getState().setVisitor(true);
      usePersonalDataStore.getState().confirm(bob);
    });
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toBeEmptyDOMElement();
    expect(screen.queryByRole('button', { name: 'Retry captured take' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save locally' })).toBeDisabled();
    act(() => {
      usePersonalDataStore.getState().setVisitor(false);
      usePersonalDataStore.getState().confirm(alice);
    });
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toHaveTextContent('C4 (60)');
    expect(screen.getByRole('button', { name: 'Retry captured take' })).toBeInTheDocument();
  });
  it.each([
    'visitor',
    'policy-failed',
  ] as const)('hides the current owner on %s alone and restores only under eligible owner policy', async (transition) => {
    confirm();
    submitNote();
    const name = screen.getByRole('textbox', { name: 'Composition name' });
    fireEvent.input(name, { target: { value: 'Alice private' } });
    fireEvent.blur(name);
    await record();
    input(true, 64, 1200);
    now = 1500;
    act(() => {
      if (transition === 'visitor') usePersonalDataStore.getState().setVisitor(true);
      else usePersonalDataStore.setState({ policyReady: false, visitor: true });
    });
    expect(usePersonalDataStore.getState().owner).toEqual(alice);
    expect(screen.getByRole('textbox', { name: 'Composition name' })).toHaveValue(
      'Untitled composition',
    );
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toBeEmptyDOMElement();
    expect(screen.queryByRole('button', { name: 'Retry captured take' })).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Stop private playback or recording' }),
    ).toBeDisabled();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Export MIDI' }));
    });
    expect(
      mocks.export.mock.calls
        .at(-1)?.[0]
        .parts.every((part: { notes: unknown[] }) => part.notes.length === 0),
    ).toBe(true);
    act(() => usePersonalDataStore.setState({ visitor: false, policyReady: false }));
    expect(screen.getByRole('textbox', { name: 'Composition name' })).toHaveValue(
      'Untitled composition',
    );
    act(() => usePersonalDataStore.setState({ policyReady: true }));
    expect(screen.getByRole('textbox', { name: 'Composition name' })).toHaveValue('Alice private');
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toHaveTextContent('C4 (60)');
    expect(screen.getByRole('button', { name: 'Retry captured take' })).toBeInTheDocument();
  });
  it('forgets private drafts and pending takes through actual Auth.signOut before a no-UUID guest login', async () => {
    confirm();
    submitNote();
    await record();
    input(true, 67, 1200);
    now = 1500;
    act(() => mocks.outputChanged?.());
    expect(screen.getByRole('button', { name: 'Retry captured take' })).toBeInTheDocument();
    Object.assign(client, {
      liveServer: true,
      connected: true,
      close: vi.fn(),
      runtimeNamespace: 'runtime',
    });
    Object.assign(client.gmcp, { confirmIdentity: vi.fn(), require: () => ({ sendPlaybackSupport: vi.fn() }) });
    const auth = new GMCPAutoLogin(client);
    act(() => auth.signOut());
    auth.shutdown();
    expect(usePersonalDataStore.getState().identityState).toBe('forgotten');
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toBeEmptyDOMElement();
    expect(screen.queryByRole('button', { name: 'Retry captured take' })).not.toBeInTheDocument();
    const char = new GMCPChar(client);
    act(() => char.handleName({ name: '#guest', fullname: 'Guest' }));
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toBeEmptyDOMElement();
    confirm();
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toBeEmptyDOMElement();
    expect(screen.queryByRole('button', { name: 'Retry captured take' })).not.toBeInTheDocument();
  });
  it('restores only the owner take when leaving a visitor recording', async () => {
    confirm();
    await record();
    input(true, 64, 1200);
    now = 1500;
    act(() => usePersonalDataStore.getState().setVisitor(true));
    await record();
    input(true, 72, 1700);
    now = 1900;
    act(() => usePersonalDataStore.getState().setVisitor(false));
    expect(
      screen.getByRole('button', { name: 'Stop private playback or recording' }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Retry captured take' }));
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toHaveTextContent('E4 (64)');
    expect(screen.getByRole('list', { name: 'Pattern notes' })).not.toHaveTextContent('C5 (72)');
  });
  it('starts a fresh private draft for the first confirmed owner instead of adopting guest material', () => {
    submitNote();
    confirm();
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toBeEmptyDOMElement();
  });
  it('forgets retained private state when a reconnect resolves to a live character without UUID', () => {
    confirm();
    submitNote();
    act(() => usePersonalDataStore.getState().clear('reconnect'));
    Object.assign(client, { liveServer: true, runtimeNamespace: 'runtime' });
    Object.assign(client.gmcp, { confirmIdentity: vi.fn(), require: () => ({ sendPlaybackSupport: vi.fn() }) });
    const char = new GMCPChar(client);
    act(() => char.handleName({ name: '#guest', fullname: 'Guest' }));
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toBeEmptyDOMElement();
    expect(usePersonalDataStore.getState().identityState).toBe('forgotten');
  });
  it('applies explicit sign-out forgetting before restoring an editor that was unmounted', () => {
    confirm();
    submitNote();
    cleanup();
    Object.assign(client, { liveServer: true, connected: true, close: vi.fn() });
    const auth = new GMCPAutoLogin(client);
    act(() => auth.signOut());
    auth.shutdown();
    confirm();
    const view = render(<MusicComposer client={client} />);
    cleanup = view.unmount;
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toBeEmptyDOMElement();
    expect(screen.queryByRole('button', { name: 'Retry captured take' })).not.toBeInTheDocument();
  });
  it('loads the lazy world library into a private editable draft, retains ordinary hidden state, and rejects a stale owner callback', async () => {
    vi.useRealTimers();
    confirm();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'World library' }));
    });
    const panel = await screen.findByText('World draft: Untitled composition');
    fireEvent.click(screen.getByRole('button', { name: 'World library' }));
    expect(panel).not.toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'World library' }));
    expect(screen.getByText('World draft: Untitled composition')).toBe(panel);
    const loaded: CanonicalScore = {
      version: 1,
      contentId: crypto.randomUUID(),
      ppq: 960,
      durationTicks: 3840,
      tempos: [{ tick: 0, bpm: 120 }],
      meters: [{ tick: 0, numerator: 4, denominator: 4 }],
      parts: [
        {
          id: 'world-part',
          name: 'World piano',
          kind: 'melodic',
          program: 0,
          notes: [[0, 480, 72, 100]],
          controls: [],
          programs: [],
        },
      ],
    };
    const stale = mocks.worldLoad;
    act(() => mocks.worldLoad?.(loaded, 'World copy'));
    expect(screen.getByRole('textbox', { name: 'Composition name' })).toHaveValue('World copy');
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toHaveTextContent('C5 (72)');
    expect(mocks.start).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByRole('textbox', { name: 'Composition name' })).toHaveValue(
      'Untitled composition',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }));
    expect(screen.getByRole('textbox', { name: 'Composition name' })).toHaveValue('World copy');
    const pendingLoad = mocks.worldLoad;
    fireEvent.input(screen.getByRole('textbox', { name: 'Composition name' }), {
      target: { value: 'Newer edit' },
    });
    fireEvent.blur(screen.getByRole('textbox', { name: 'Composition name' }));
    expect(() => act(() => pendingLoad?.(loaded, 'Old response'))).toThrow(
      'draft or editor operation changed',
    );
    expect(screen.getByRole('textbox', { name: 'Composition name' })).toHaveValue('Newer edit');
    act(() => usePersonalDataStore.getState().setVisitor(true));
    expect(screen.queryByText('World draft: World copy')).not.toBeInTheDocument();
    act(() => stale?.(loaded, 'Stale owner copy'));
    expect(screen.getByRole('textbox', { name: 'Composition name' })).toHaveValue(
      'Untitled composition',
    );
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toBeEmptyDOMElement();
  });
  it('retains an interrupted take when the editor unmounts and remounts for the same client', async () => {
    confirm();
    await record();
    input(true, 69, 1200);
    now = 1500;
    cleanup();
    const view = render(<MusicComposer client={client} />);
    cleanup = view.unmount;
    expect(screen.getByRole('button', { name: 'Retry captured take' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry captured take' }));
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toHaveTextContent('A4 (69)');
  });

  it('offers named native form controls for editing, pattern copy/delete and undo', async () => {
    const start = screen.getByRole('spinbutton', { name: 'Start beat' });
    start.focus();
    expect(start).toHaveFocus();
    await act(async () => {
      fireEvent.input(start, { target: { value: '0.5' } });
    });
    submitNote();
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toHaveTextContent(
      'Beat 0.5, length 1, C4 (60), velocity 100',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Copy pattern' }));
    expect(screen.getByRole('textbox', { name: 'Pattern name' })).toHaveValue('Pattern 1 copy');
    fireEvent.click(screen.getByRole('button', { name: 'Delete note 1' }));
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toBeEmptyDOMElement();
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toHaveTextContent('C4 (60)');
    fireEvent.click(screen.getByRole('button', { name: 'Delete pattern and its sections' }));
    expect(screen.getByRole('textbox', { name: 'Pattern name' })).toHaveValue('Pattern 1');
    expect(screen.getByRole('button', { name: 'Save locally' })).toBeDisabled();
  });

  it('commits a long text edit once on blur or Enter and keeps earlier musical undo steps', () => {
    submitNote();
    const name = screen.getByRole('textbox', { name: 'Part name' });
    for (let i = 1; i <= 30; i++) fireEvent.input(name, { target: { value: 'A'.repeat(i) } });
    expect(screen.getByRole('combobox', { name: 'Part' })).toHaveTextContent('Piano');
    fireEvent.blur(name);
    expect(screen.getByRole('combobox', { name: 'Part' })).toHaveTextContent('A'.repeat(30));
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(name).toHaveValue('Piano');
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toHaveTextContent('C4');
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toBeEmptyDOMElement();
    fireEvent.input(name, { target: { value: 'One field commit' } });
    fireEvent.keyDown(name, { key: 'Enter' });
    fireEvent.blur(name);
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(name).toHaveValue('Piano');
  });

  it('keeps incomplete numeric text local and reports invalid committed lengths without throwing', () => {
    const length = screen.getByRole('spinbutton', { name: 'Pattern length (quarter-note beats)' });
    fireEvent.input(length, { target: { value: '-' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fireEvent.blur(length);
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a number');
    fireEvent.input(length, { target: { value: '8' } });
    fireEvent.keyDown(length, { key: 'Enter' });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(length).toHaveValue(4);
  });
  it('restores the model value in a committed field when the draft rejects a shorter pattern', () => {
    fireEvent.input(screen.getByRole('spinbutton', { name: 'Start beat' }), {
      target: { value: '3' },
    });
    submitNote();
    const length = screen.getByRole('spinbutton', { name: 'Pattern length (quarter-note beats)' });
    fireEvent.input(length, { target: { value: '1' } });
    fireEvent.blur(length);
    expect(length).toHaveValue(4);
    expect(
      screen
        .getAllByRole('alert')
        .some((alert) => alert.textContent?.includes('Previous value restored')),
    ).toBe(true);
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toHaveTextContent('Beat 3');
  });

  it('replace recording mutes only the selected part in private playback', async () => {
    submitNote();
    fireEvent.click(screen.getByRole('button', { name: 'Add part' }));
    submitNote();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Overdub existing notes' }));
    await record();
    const playback = mocks.start.mock.calls.at(-1)?.[0];
    expect(playback.parts.map((part: { notes: unknown[] }) => part.notes.length)).toEqual([1, 0]);
    now = 1500;
    stop();
  });

  it('retains a take rejected by the score budget and retries it after earlier event material is cleared', async () => {
    const controls = () =>
      act(() => {
        for (let i = 0; i < 10000; i++)
          mocks.input?.(
            {
              rawData: { data: new Uint8Array([0xb0, 1, i % 128]), hex: '', type: '' },
              controlChange: { channel: 0, controller: 1, value: i % 128 },
            },
            1200,
          );
      });
    await record();
    controls();
    input(true, 60, 1250);
    input(false, 60, 1500);
    stop();
    expect(screen.getByText('1 original recording takes retained.')).toBeInTheDocument();
    await record();
    controls();
    input(true, 64, 1250);
    input(false, 64, 1500);
    stop();
    expect(screen.getByRole('button', { name: 'Retry captured take' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Record selected pattern' })).toBeDisabled();
    fireEvent.input(screen.getByRole('textbox', { name: 'Controller events' }), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply event edits' }));
    fireEvent.click(screen.getByRole('button', { name: 'Retry captured take' }));
    expect(screen.queryByRole('button', { name: 'Retry captured take' })).not.toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toHaveTextContent('E4 (64)');
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toHaveTextContent('C4 (60)');
  });

  it('captures during a private relay lease, ignores count-in and overdubs without enabling monitoring', async () => {
    expect(screen.getByRole('checkbox', { name: 'Monitor keyboard locally' })).not.toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: 'Send keyboard to room while recording' }),
    ).not.toBeChecked();
    await record();
    expect(mocks.suspend).toHaveBeenCalledOnce();
    input(true, 48, 500);
    input(false, 48, 700);
    input(true, 60, 1100.25);
    input(false, 60, 1400.75);
    stop();
    const notes = screen.getByRole('list', { name: 'Pattern notes' });
    expect(within(notes).getAllByRole('listitem')).toHaveLength(1);
    expect(notes).toHaveTextContent('C4 (60)');
    expect(notes).not.toHaveTextContent('C3 (48)');
    expect(screen.getByText('1 original recording takes retained.')).toBeInTheDocument();
    expect(mocks.release).toHaveBeenCalledOnce();
    expect(mocks.monitorNote).not.toHaveBeenCalled();
    now = 2000;
    mocks.start.mockResolvedValue({
      startPerformanceMs: 2500,
      endPerformanceMs: 4500,
      countInStartPerformanceMs: 2000,
    });
    await record();
    input(true, 64, 2600);
    input(false, 64, 2800);
    stop();
    expect(within(notes).getAllByRole('listitem')).toHaveLength(2);
    expect(notes).toHaveTextContent('E4 (64)');
    expect(screen.getByText('2 original recording takes retained.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Quantize selected part' }));
    expect(screen.getByText('2 original recording takes retained.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(within(notes).getAllByRole('listitem')).toHaveLength(2);
    expect(mocks.release).toHaveBeenCalledTimes(2);
  });

  it('replace recording and explicit sharing have independent behavior; unmount restores a pending lease', async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Add note' }));
    // Native submit is tested explicitly above; add through the form here as well.
    if (!screen.queryByRole('button', { name: 'Delete note 1' })) submitNote();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Overdub existing notes' }));
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Send keyboard to room while recording' }),
    );
    await record();
    input(true, 67, 1100);
    input(false, 67, 1300);
    stop();
    expect(mocks.suspend).not.toHaveBeenCalled();
    expect(
      within(screen.getByRole('list', { name: 'Pattern notes' })).getAllByRole('listitem'),
    ).toHaveLength(1);
    expect(screen.getByRole('list', { name: 'Pattern notes' })).toHaveTextContent('G4 (67)');
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Send keyboard to room while recording' }),
    );
    mocks.start.mockImplementation(() => new Promise(() => {}));
    await record();
    expect(mocks.suspend).toHaveBeenCalledOnce();
    cleanup();
    cleanup = () => {};
    expect(mocks.release).toHaveBeenCalledOnce();
    expect(mocks.input).toBeUndefined();
  });

  it('cancels count-in without writing an empty take or leaving the relay suspended', async () => {
    await record();
    now = 500;
    stop();
    expect(screen.getByText('0 original recording takes retained.')).toBeInTheDocument();
    expect(mocks.release).toHaveBeenCalledOnce();
    expect(screen.getByRole('status')).toHaveTextContent('Recording cancelled during count-in.');
  });
});
