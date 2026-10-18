import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockClient,
  mockCreateConfiguredClient,
  mockEnsurePushSubscription,
  mockHapticsRuntimes,
  mockPreferences,
  mockCopyRecentOutputLine,
  mockReviewRecentOutputLine,
  mockSwitchToTab,
} = vi.hoisted(() => {
  const mockClient = {
    liveServer: true,
    setBrowserNotificationContext: vi.fn(),
    cancelSpeech: vi.fn(),
    connect: vi.fn(),
    connected: false,
    gmcp: {
      require: vi.fn(() => ({ on: vi.fn(() => () => {}) })),
      handlers: {},
      sessionReady: false,
    },
    onFileTransferOffer: vi.fn(() => () => {}),
    requestNotificationPermission: vi.fn(),
    sendCommand: vi.fn(),
    sendNotification: vi.fn(),
    shutdown: vi.fn(),
    pauseAllSounds: vi.fn(async () => {}),
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
    mockCopyRecentOutputLine: vi.fn(),
    mockReviewRecentOutputLine: vi.fn(),
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
  usePreferences.subscribe = () => () => {};
  return { usePreferences };
});

vi.mock('./hooks/useChannelHistory', () => ({
  useChannelHistory: () => ({ clearAllBuffers: vi.fn() }),
}));

vi.mock('./browserNotifications', async () => ({
  ...await vi.importActual<typeof import('./browserNotifications')>('./browserNotifications'),
  enrollBrowserNotifications: mockEnsurePushSubscription,
}));

vi.mock('./components/input', () => ({
  default: ({ inputRef }: { inputRef: React.Ref<HTMLTextAreaElement> }) => <textarea ref={inputRef} aria-label="Command" />,
}));

vi.mock('./components/output', async () => {
  const ReactModule = await vi.importActual<typeof import('react')>('react');
  return {
    default: ReactModule.forwardRef((_props, ref) => {
      ReactModule.useImperativeHandle(ref, () => ({
        copyRecentOutputLine: mockCopyRecentOutputLine,
        reviewRecentOutputLine: mockReviewRecentOutputLine,
      }));
      return <div data-testid="output" />;
    }),
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
    default: ReactModule.forwardRef((props: { collapsed: boolean; onToggleCollapse: () => void }, ref) => {
      ReactModule.useImperativeHandle(ref, () => ({ switchToTab: mockSwitchToTab, hasTab: () => true }));
      return <button type="button" onClick={props.onToggleCollapse}>{props.collapsed ? 'Expand' : 'Collapse'}</button>;
    }),
  };
});

vi.mock('./components/statusbar', () => ({
  default: () => <div data-testid="statusbar" />,
}));

vi.mock('./components/toolbar', () => ({
  default: ({ onToggleSidebar }: { onToggleSidebar: () => void }) => <button type="button" onClick={onToggleSidebar}>Toggle sidebar</button>,
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
import { useConnectionStore } from './stores/connectionStore';

describe('App haptics backend lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHapticsRuntimes.length = 0;
    mockPreferences.haptics.enabled = false;
    mockPreferences.midi.enabled = false;
    mockClient.gmcp.sessionReady = false;
    useConnectionStore.getState().reset();
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('loads haptics only after enabling and disposes its runtime on cleanup', async () => {
    const view = render(<App />);

    expect(mockHapticsRuntimes).toHaveLength(0);
    mockPreferences.haptics.enabled = true;
    view.rerender(<App />);

    await waitFor(() => {
      expect(mockHapticsRuntimes).toHaveLength(1);
    });

    const runtime = mockHapticsRuntimes[0];
    expect(runtime.setEnabled).toHaveBeenCalledWith(true);

    view.unmount();

    expect(runtime.dispose).toHaveBeenCalledOnce();
  });

  it('reenrolls on scoped token confirmation rather than a shared readiness flag', async () => {
    let confirm = () => {};
    mockClient.gmcp.require.mockReturnValue({ on: vi.fn((_type: string, listener: () => void) => { confirm = listener; return () => {}; }) });
    const view = render(<App />);

    await waitFor(() => {
      expect(mockHapticsRuntimes).toHaveLength(1);
    });
    expect(mockEnsurePushSubscription).toHaveBeenCalledTimes(1);

    act(() => {
      useConnectionStore.getState().setSessionReady(true);
    });

    expect(mockEnsurePushSubscription).toHaveBeenCalledTimes(1);
    act(() => confirm());
    expect(mockEnsurePushSubscription).toHaveBeenCalledTimes(2);
    act(() => confirm());
    expect(mockEnsurePushSubscription).toHaveBeenCalledTimes(3);
    expect(mockClient.requestNotificationPermission).not.toHaveBeenCalled();

    view.unmount();
  });

  it('handles app keyboard shortcuts from one keydown path', async () => {
    render(<App />);

    await waitFor(() => {
      expect(mockHapticsRuntimes).toHaveLength(1);
    });

    fireEvent.keyDown(document, { key: 'Control' });
    expect(mockClient.cancelSpeech).toHaveBeenCalledOnce();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockClient.pauseAllSounds).toHaveBeenCalledOnce();
    expect(mockClient.stopAllSounds).not.toHaveBeenCalled();
    expect(mockHapticsRuntimes[0].emergencyStop).toHaveBeenCalledOnce();

    fireEvent.keyDown(document, { ctrlKey: true, key: '1' });
    expect(mockReviewRecentOutputLine).toHaveBeenCalledWith(1);
    expect(mockSwitchToTab).not.toHaveBeenCalled();

    fireEvent.keyDown(document, { ctrlKey: true, key: '0' });
    expect(mockReviewRecentOutputLine).toHaveBeenCalledWith(10);

    fireEvent.keyDown(document, { ctrlKey: true, key: '1' });
    expect(mockCopyRecentOutputLine).not.toHaveBeenCalled();

    fireEvent.keyDown(document, { ctrlKey: true, key: '1' });
    expect(mockCopyRecentOutputLine).toHaveBeenCalledWith(1);

    fireEvent.keyDown(document, { ctrlKey: true, key: '1', shiftKey: true });
    expect(mockSwitchToTab).toHaveBeenCalledWith(0);
  });

  it('does not copy output when the repeated Ctrl+number press is too late', async () => {
    render(<App />);

    await waitFor(() => {
      expect(mockHapticsRuntimes).toHaveLength(1);
    });

    vi.useFakeTimers();
    vi.setSystemTime(new Date(0));
    fireEvent.keyDown(document, { ctrlKey: true, key: '1' });

    vi.advanceTimersByTime(501);
    fireEvent.keyDown(document, { ctrlKey: true, key: '1' });

    expect(mockCopyRecentOutputLine).not.toHaveBeenCalled();
  });

  it('focuses Command when the client becomes ready and reveals hidden/collapsed shortcut destinations', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Command' })).toHaveFocus());
    fireEvent.click(screen.getByRole('button', { name: 'Collapse' }));
    fireEvent.keyDown(document, { ctrlKey: true, shiftKey: true, key: '#', code: 'Digit3' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Collapse' })).toBeVisible());
    expect(mockSwitchToTab).toHaveBeenCalledWith(2);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle sidebar' }));
    expect(document.querySelector('aside')).toHaveAttribute('hidden');
    fireEvent.keyDown(document, { ctrlKey: true, shiftKey: true, key: '#', code: 'Digit3' });
    await waitFor(() => expect(document.querySelector('aside')).not.toHaveAttribute('hidden'));
    expect(mockSwitchToTab).toHaveBeenLastCalledWith(2);
  });
});
