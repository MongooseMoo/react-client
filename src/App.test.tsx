import React from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockClient,
  mockCreateConfiguredClient,
  mockEnsurePushSubscription,
  mockGamepadBackends,
  mockHapticsService,
  mockPreferences,
} = vi.hoisted(() => {
  const mockClient = {
    cancelSpeech: vi.fn(),
    connect: vi.fn(),
    connected: false,
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
    mockGamepadBackends: [] as Array<{ connect: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }>,
    mockHapticsService: {
      emergencyStop: vi.fn(),
      registerBackend: vi.fn(),
      unregisterBackend: vi.fn(async () => {}),
    },
    mockPreferences: {
      haptics: { enabled: false },
      midi: { enabled: false },
    },
  };
});

vi.mock("react-beforeunload", () => ({
  useBeforeunload: vi.fn(),
}));

vi.mock("./createConfiguredClient", () => ({
  createConfiguredClient: mockCreateConfiguredClient,
}));

vi.mock("./HapticsService", () => ({
  hapticsService: mockHapticsService,
}));

vi.mock("./haptics/GamepadBackend", () => ({
  GamepadBackend: class {
    connect = vi.fn();
    disconnect = vi.fn();

    constructor() {
      mockGamepadBackends.push(this);
    }
  },
}));

vi.mock("./haptics/ButtplugWasmBackend", () => ({
  ButtplugWasmBackend: class {},
  createRealWasmDeps: vi.fn(),
}));

vi.mock("./hooks/usePreferences", () => ({
  usePreferences: () => [mockPreferences],
}));

vi.mock("./hooks/useChannelHistory", () => ({
  useChannelHistory: () => ({ clearAllBuffers: vi.fn() }),
}));

vi.mock("./hooks/useClientEvent", () => ({
  useClientEvent: vi.fn((_client: unknown, _event: string, initialValue: unknown) => initialValue),
}));

vi.mock("./webpush", () => ({
  ensurePushSubscription: mockEnsurePushSubscription,
}));

vi.mock("./components/input", () => ({
  default: () => <div data-testid="input" />,
}));

vi.mock("./components/output", async () => {
  const ReactModule = await vi.importActual<typeof import("react")>("react");
  return {
    default: ReactModule.forwardRef(() => <div data-testid="output" />),
  };
});

vi.mock("./components/PreferencesDialog", async () => {
  const ReactModule = await vi.importActual<typeof import("react")>("react");
  return {
    default: ReactModule.forwardRef((_props, ref) => {
      ReactModule.useImperativeHandle(ref, () => ({ open: vi.fn() }));
      return null;
    }),
  };
});

vi.mock("./components/AutoLogDialog", async () => {
  const ReactModule = await vi.importActual<typeof import("react")>("react");
  return {
    default: ReactModule.forwardRef((_props, ref) => {
      ReactModule.useImperativeHandle(ref, () => ({ open: vi.fn() }));
      return null;
    }),
  };
});

vi.mock("./components/sidebar", async () => {
  const ReactModule = await vi.importActual<typeof import("react")>("react");
  return {
    default: ReactModule.forwardRef((_props, ref) => {
      ReactModule.useImperativeHandle(ref, () => ({ switchToTab: vi.fn() }));
      return null;
    }),
  };
});

vi.mock("./components/statusbar", () => ({
  default: () => <div data-testid="statusbar" />,
}));

vi.mock("./components/toolbar", () => ({
  default: () => <div data-testid="toolbar" />,
}));

vi.mock("./components/WasmHost", () => ({
  default: () => null,
}));

vi.mock("./components/WasmGuest", () => ({
  default: () => null,
}));

vi.mock("./components/HostPanel", () => ({
  default: () => null,
}));

vi.mock("./logging/AutoLogService", () => ({
  autoLogService: {
    configureSession: vi.fn(),
    endSession: vi.fn(async () => {}),
    flush: vi.fn(async () => {}),
    startSession: vi.fn(async () => {}),
  },
  createAutoLogSessionDraft: vi.fn(() => ({})),
}));

import App from "./App";

describe("App haptics backend lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGamepadBackends.length = 0;
    mockPreferences.haptics.enabled = false;
    mockPreferences.midi.enabled = false;
    mockClient.sessionReady = false;
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    cleanup();
  });

  it("unregisters the gamepad backend created during client setup on cleanup", async () => {
    const view = render(<App />);

    await waitFor(() => {
      expect(mockHapticsService.registerBackend).toHaveBeenCalledOnce();
    });

    const backend = mockGamepadBackends[0];
    expect(mockHapticsService.registerBackend).toHaveBeenCalledWith(backend);

    view.unmount();

    expect(mockHapticsService.unregisterBackend).toHaveBeenCalledWith(backend);
  });

  it("waits for sessionReady before ensuring a push subscription", async () => {
    let sessionReadyHandler: (() => void) | undefined;
    mockClient.once.mockImplementation((event: string, handler: () => void) => {
      if (event === "sessionReady") {
        sessionReadyHandler = handler;
      }
      return mockClient;
    });

    const view = render(<App />);

    await waitFor(() => {
      expect(mockClient.once).toHaveBeenCalledWith("sessionReady", expect.any(Function));
    });
    expect(mockEnsurePushSubscription).not.toHaveBeenCalled();

    sessionReadyHandler?.();

    expect(mockEnsurePushSubscription).toHaveBeenCalledWith(mockClient);

    view.unmount();
    expect(mockClient.off).toHaveBeenCalledWith("sessionReady", sessionReadyHandler);
  });
});
