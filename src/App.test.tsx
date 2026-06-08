import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockClient,
  mockCreateConfiguredClient,
  mockEnsurePushSubscription,
  mockHapticsRuntimes,
  mockPreferences,
  mockSwitchToTab,
} = vi.hoisted(() => {
  const mockClient = {
    cancelSpeech: vi.fn(),
    connect: vi.fn(),
    connected: false,
    fileTransferManager: {
      off: vi.fn(),
      on: vi.fn(),
    },
    gmcpHandlers: {},
    off: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    requestNotificationPermission: vi.fn(),
    sendCommand: vi.fn(),
    sendNotification: vi.fn(),
    sessionReady: false,
    shutdown: vi.fn(),
    stopAllSounds: vi.fn(),
  };

  return {
    mockClient,
    mockCreateConfiguredClient: vi.fn(() => mockClient),
    mockEnsurePushSubscription: vi.fn(async () => {}),
    mockHapticsRuntimes: [] as Array<{
      dispose: ReturnType<typeof vi.fn>;
      emergencyStop: ReturnType<typeof vi.fn>;
      setEnabled: ReturnType<typeof vi.fn>;
    }>,
    mockPreferences: {
      haptics: { enabled: false },
      midi: { enabled: false },
    },
    mockSwitchToTab: vi.fn(),
  };
});

vi.mock('react-beforeunload', () => ({
  useBeforeunload: vi.fn(),
}));

vi.mock('./createConfiguredClient', () => ({
  createConfiguredClient: mockCreateConfiguredClient,
}));

vi.mock('./haptics/runtime', () => ({
  createHapticsRuntime: vi.fn(() => {
    const runtime = {
      dispose: vi.fn(async () => {}),
      emergencyStop: vi.fn(),
      setEnabled: vi.fn(),
    };
    mockHapticsRuntimes.push(runtime);
    return runtime;
  }),
}));

vi.mock('./stores/preferencesStore', () => {
  const usePreferences = () => mockPreferences;
  usePreferences.getState = () => mockPreferences;
  return { usePreferences };
});

vi.mock('./hooks/useChannelHistory', () => ({
  useChannelHistory: () => ({ clearAllBuffers: vi.fn() }),
}));

vi.mock('./hooks/useClientEvent', () => ({
  useClientEvent: vi.fn((_client: unknown, _event: string, initialValue: unknown) => initialValue),
}));

vi.mock('./webpush', () => ({
  ensurePushSubscription: mockEnsurePushSubscription,
}));

vi.mock('./components/input', () => ({
  default: () => <div data-testid="input" />,
}));

vi.mock('./components/output', async () => {
  const ReactModule = await vi.importActual<typeof import('react')>('react');
  return {
    default: ReactModule.forwardRef(() => <div data-testid="output" />),
  };
});

vi.mock('./components/PreferencesDialog', async () => {
  const ReactModule = await vi.importActual<typeof import('react')>('react');
  return {
    default: ReactModule.forwardRef((_props, ref) => {
      ReactModule.useImperativeHandle(ref, () => ({ open: vi.fn() }));
      return null;
    }),
  };
});

vi.mock('./components/AutoLogDialog', async () => {
  const ReactModule = await vi.importActual<typeof import('react')>('react');
  return {
    default: ReactModule.forwardRef((_props, ref) => {
      ReactModule.useImperativeHandle(ref, () => ({ open: vi.fn() }));
      return null;
    }),
  };
});

vi.mock('./components/sidebar', async () => {
  const ReactModule = await vi.importActual<typeof import('react')>('react');
  return {
    default: ReactModule.forwardRef((_props, ref) => {
      ReactModule.useImperativeHandle(ref, () => ({ switchToTab: mockSwitchToTab }));
      return null;
    }),
  };
});

vi.mock('./components/statusbar', () => ({
  default: () => <div data-testid="statusbar" />,
}));

vi.mock('./components/toolbar', () => ({
  default: () => <div data-testid="toolbar" />,
}));

vi.mock('./components/WasmHost', () => ({
  default: () => null,
}));

vi.mock('./components/WasmGuest', () => ({
  default: () => null,
}));

vi.mock('./components/HostPanel', () => ({
  default: () => null,
}));

vi.mock('./logging/AutoLogService', () => ({
  autoLogService: {
    configureSession: vi.fn(),
    endSession: vi.fn(async () => {}),
    flush: vi.fn(async () => {}),
    startSession: vi.fn(async () => {}),
  },
  createAutoLogSessionDraft: vi.fn(() => ({})),
}));

import App from './App';

describe('App haptics backend lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHapticsRuntimes.length = 0;
    mockPreferences.haptics.enabled = false;
    mockPreferences.midi.enabled = false;
    mockClient.sessionReady = false;
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => {
    cleanup();
  });

  it('disposes the haptics runtime created during client setup on cleanup', async () => {
    const view = render(<App />);

    await waitFor(() => {
      expect(mockHapticsRuntimes).toHaveLength(1);
    });

    const runtime = mockHapticsRuntimes[0];
    expect(runtime.setEnabled).toHaveBeenCalledWith(false);

    view.unmount();

    expect(runtime.dispose).toHaveBeenCalledOnce();
  });

  it('waits for sessionReady before ensuring a push subscription', async () => {
    let sessionReadyHandler: (() => void) | undefined;
    mockClient.once.mockImplementation((event: string, handler: () => void) => {
      if (event === 'sessionReady') {
        sessionReadyHandler = handler;
      }
      return mockClient;
    });

    const view = render(<App />);

    await waitFor(() => {
      expect(mockClient.once).toHaveBeenCalledWith('sessionReady', expect.any(Function));
    });
    expect(mockEnsurePushSubscription).not.toHaveBeenCalled();

    sessionReadyHandler?.();

    expect(mockEnsurePushSubscription).toHaveBeenCalledWith(mockClient);

    view.unmount();
    expect(mockClient.off).toHaveBeenCalledWith('sessionReady', sessionReadyHandler);
  });

  it('handles app keyboard shortcuts from one keydown path', async () => {
    render(<App />);

    await waitFor(() => {
      expect(mockHapticsRuntimes).toHaveLength(1);
    });

    fireEvent.keyDown(document, { key: 'Control' });
    expect(mockClient.cancelSpeech).toHaveBeenCalledOnce();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockClient.stopAllSounds).toHaveBeenCalledOnce();
    expect(mockHapticsRuntimes[0].emergencyStop).toHaveBeenCalledOnce();

    fireEvent.keyDown(document, { ctrlKey: true, key: '1' });
    expect(mockSwitchToTab).toHaveBeenCalledWith(0);
  });
});
