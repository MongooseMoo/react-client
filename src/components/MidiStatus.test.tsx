import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type MudClient from '../client';
import MidiStatus from './MidiStatus';
import { midiService } from '../MidiService';

const testState = vi.hoisted(() => ({
  connectionStatus: {
    inputConnected: false,
    outputConnected: false,
    inputDeviceId: undefined as string | undefined,
    outputDeviceId: undefined as string | undefined,
    inputDeviceName: undefined as string | undefined,
    outputDeviceName: undefined as string | undefined,
  },
  documentHidden: false,
  virtualSynthInitialized: true,
}));

vi.mock('../stores/preferencesStore', () => {
  const preferences = {
    midi: {
      enabled: true,
      lastInputDeviceId: undefined,
      lastOutputDeviceId: undefined,
    },
  };
  const usePreferences = Object.assign(
    (selector: (state: typeof preferences) => unknown) => selector(preferences),
    { getState: () => preferences },
  );
  return { usePreferences };
});

vi.mock('../MidiService', () => ({
  midiService: {
    getSoundfontMessage: () => '',
    subscribeSoundfont: () => () => {},
    get connectionStatus() {
      return { ...testState.connectionStatus };
    },
    get intentionalDisconnectStatus() {
      return { input: false, output: false };
    },
    get isInitialized() {
      return true;
    },
    getInputDevices: vi.fn(() => []),
    getOutputDevices: vi.fn(() => []),
    canReconnectToDevice: vi.fn(() => false),
    onDeviceChange: vi.fn(() => vi.fn()),
    disconnectWithIntent: vi.fn((kind: string) => {
      if (kind === 'input') testState.connectionStatus.inputConnected = false;
      else testState.connectionStatus.outputConnected = false;
    }),
  },
}));

vi.mock('../VirtualMidiService', () => ({
  virtualMidiService: {
    get initialized() {
      return testState.virtualSynthInitialized;
    },
    initialize: vi.fn(async () => undefined),
  },
}));

const client = {
  gmcp: { handlers: {} },
} as unknown as MudClient;

describe('MidiStatus lifecycle refreshes', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    testState.connectionStatus = {
      inputConnected: false,
      outputConnected: false,
      inputDeviceId: undefined,
      outputDeviceId: undefined,
      inputDeviceName: undefined,
      outputDeviceName: undefined,
    };
    testState.documentHidden = false;
    testState.virtualSynthInitialized = true;
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => testState.documentHidden,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not poll for the virtual synth', async () => {
    testState.virtualSynthInitialized = false;

    render(<MidiStatus client={client} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(vi.getTimerCount()).toBe(0);
  });

  it('names input and output controls and keeps the requested action focused', async () => {
    vi.mocked(midiService.getInputDevices).mockReturnValue([{ id: 'in', name: 'Keyboard', type: 'input' } as never]);
    vi.mocked(midiService.getOutputDevices).mockReturnValue([{ id: 'out', name: 'Synth', type: 'output' } as never]);
    const connectInputDevice = vi.fn(async () => {
      testState.connectionStatus.inputConnected = true;
      testState.connectionStatus.inputDeviceName = 'Keyboard';
      return true;
    });
    render(<MidiStatus client={{ gmcp: { handlers: { 'Client.Midi': { connectInputDevice, setDebugCallback: vi.fn() } } } } as unknown as MudClient} />);
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    fireEvent.change(screen.getByRole('combobox', { name: 'Input device' }), { target: { value: 'in' } });
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(screen.getByRole('combobox', { name: 'Output device' })).toBeTruthy();
    const action = screen.getByRole('button', { name: 'Connect input device' });
    action.focus();
    await act(async () => { fireEvent.click(action); await vi.advanceTimersByTimeAsync(0); });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Disconnect input device' }));
    expect(screen.getByRole('status').textContent).toContain('Input device connected');
    await act(async () => { fireEvent.click(document.activeElement!); await vi.advanceTimersByTimeAsync(0); });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Connect input device' }));
  });

  it('keeps the selected device and action available after a failed connection', async () => {
    vi.mocked(midiService.getInputDevices).mockReturnValue([{ id: 'in', name: 'Keyboard', type: 'input' } as never]);
    const connectInputDevice = vi.fn(async () => { throw new Error('Permission denied'); });
    render(<MidiStatus client={{ gmcp: { handlers: { 'Client.Midi': { connectInputDevice, setDebugCallback: vi.fn() } } } } as unknown as MudClient} />);
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    fireEvent.change(screen.getByRole('combobox', { name: 'Input device' }), { target: { value: 'in' } });
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    const action = screen.getByRole('button', { name: 'Connect input device' });
    action.focus();
    await act(async () => { fireEvent.click(action); await vi.advanceTimersByTimeAsync(0); });
    expect(screen.getByRole('status').textContent).toContain('Input device could not connect');
    expect(document.activeElement).toBe(action);
    expect((screen.getByRole('combobox', { name: 'Input device' }) as HTMLSelectElement).value).toBe('in');
  });

  it('reports loss and restoration only for a device that was in use', async () => {
    testState.connectionStatus.inputConnected = true;
    testState.connectionStatus.inputDeviceId = 'used';
    testState.connectionStatus.inputDeviceName = 'Keyboard';
    render(<MidiStatus client={client} />);
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    const change = vi.mocked(midiService.onDeviceChange).mock.calls.at(-1)![0];
    await act(async () => {
      change({ inputs: { added: [], removed: [{ id: 'unused', name: 'Unused' }] }, outputs: { added: [], removed: [] } });
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByRole('status').textContent).toBe('');
    testState.connectionStatus.inputConnected = false;
    testState.connectionStatus.inputDeviceId = undefined;
    await act(async () => {
      change({ inputs: { added: [], removed: [{ id: 'used', name: 'Keyboard' }] }, outputs: { added: [], removed: [] } });
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByRole('status').textContent).toBe('Input device disconnected.');
    testState.connectionStatus.inputConnected = true;
    testState.connectionStatus.inputDeviceId = 'used';
    await act(async () => {
      change({ inputs: { added: [{ id: 'used', name: 'Keyboard' }], removed: [] }, outputs: { added: [], removed: [] } });
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByRole('status').textContent).toBe('Input device reconnected.');
  });
});
