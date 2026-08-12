import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type MudClient from '../client';
import MidiStatus from './MidiStatus';

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

  it('stops the bounded poll after its timeout while the document is hidden', async () => {
    testState.documentHidden = true;
    testState.virtualSynthInitialized = false;

    render(<MidiStatus client={client} />);
    expect(vi.getTimerCount()).toBe(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });

    expect(vi.getTimerCount()).toBe(0);
  });
});
