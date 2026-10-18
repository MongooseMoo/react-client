import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type MudClient from '../client';
import type { MidiMessage, TimestampedMidiInputCallback } from '../MidiService';
import { usePreferences } from '../stores/preferencesStore';
import { usePersonalDataStore } from '../stores/personalDataStore';
import MusicComposer from './MusicComposer';

const mocks = vi.hoisted(() => ({
  input: undefined as TimestampedMidiInputCallback | undefined,
  start: vi.fn(),
  stop: vi.fn(),
  release: vi.fn(),
  suspend: vi.fn(),
  monitorNote: vi.fn(async () => {}),
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
    subscribeOutput: () => () => {},
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

describe('music composer keyboard controls and capture', () => {
  let now = 0;
  let cleanup = () => {};
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
    now = 0;
    usePreferences.getState().setMidi({ ...usePreferences.getState().midi, enabled: true });
    usePersonalDataStore.setState({ owner: undefined, policyReady: true, visitor: false });
    const client = {
      media: { cacophony: {}, paused: false, subscribePlayback: () => () => {} },
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
