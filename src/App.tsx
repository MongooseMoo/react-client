import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useBeforeunload } from "react-beforeunload";
import "./App.css";
import type MudClient from "./client";
import AutoLogDialog, {
  type AutoLogDialogRef,
} from "./components/AutoLogDialog";
import { useFileTransferNotifications } from "./components/FileTransfer/useFileTransferNotifications";
import HostPanel from "./components/HostPanel";
import CommandInput from "./components/input";
import OutputWindow from "./components/output";
import PreferencesDialog, {
  type PreferencesDialogRef,
} from "./components/PreferencesDialog";
import LinkPickerDialog from "./components/LinkPickerDialog";
import Sidebar, { clampSidebarWidth, type SidebarRef } from "./components/sidebar";
import Statusbar from "./components/statusbar";
import Toolbar from "./components/toolbar";
import UpdateNotice from "./components/UpdateNotice";
import WasmGuest from "./components/WasmGuest";
import type { WasmHostState } from "./components/WasmHost";
import WasmHost from "./components/WasmHost";
import { createConfiguredClient } from "./createConfiguredClient";
import type { GMCPMessageRoomInfo } from "./gmcp/Room";
import type { HapticsRuntime } from "./haptics/runtime";
import { useChannelHistory } from "./hooks/useChannelHistory";
import { useHeadTracking } from "./hooks/useHeadTracking";
import {
  autoLogService,
  createAutoLogSessionDraft,
} from "./logging/AutoLogService";
import {
  loadStoredValue,
  saveStoredValue,
  type LocalStorageSchema,
} from "./persistence";
import { usePreferences } from "./stores/preferencesStore";
import { useRoomStore } from "./stores/roomStore";
import { useConnectionStore } from "./stores/connectionStore";
import { useOutputStore } from "./stores/outputStore";
import { usePersonalDataStore } from './stores/personalDataStore';
import { stripMudAnsiTags } from "./stripMudAnsiTags";
import { enrollBrowserNotifications, useBrowserNotifications } from './browserNotifications';
import BrowserSessions from './components/BrowserSessions';
import { canUseGameConnection, useBrowserPolicy } from './browserPolicy';
import { watchAppBadge } from './launch/appBadge';
import LaunchDatabaseDialog from './launch/LaunchDatabaseDialog';
import { startLaunchHandling } from './launch/launchHandling';
import { useLaunchStore } from './launch/launchStore';
import { noteCommandSent } from './launch/placeLaunchText';

const WINDOW_TITLE = "Mongoose Client";
const DOUBLE_PRESS_WINDOW_MS = 500;

// User-chosen sidebar width in px; absent until the user first resizes.
const sidebarWidthSchema: LocalStorageSchema<number> = {
  key: "sidebarWidth",
  version: 1,
  migrate: (data) =>
    typeof data === "number" && Number.isFinite(data) ? data : undefined,
};

function loadSidebarWidth(): number | null {
  const stored = loadStoredValue<number | null>(sidebarWidthSchema, null);
  return stored === null ? null : clampSidebarWidth(stored);
}

function setWindowSubtitle(subtitle?: string) {
  document.title = subtitle ? `${WINDOW_TITLE} - ${subtitle}` : WINDOW_TITLE;
}

function getRoomSubtitle(roomInfo: GMCPMessageRoomInfo): string | undefined {
  // Strip before composing: a field that is nothing but markup has to read as
  // empty here, or it drags an orphaned separator into the title.
  const area = roomInfo.area ? stripMudAnsiTags(roomInfo.area) : "";
  const name = roomInfo.name ? stripMudAnsiTags(roomInfo.name) : "";

  if (area && name) {
    return `${area}: ${name}`;
  }

  return name || area || undefined;
}

function getShortcutDigit(event: KeyboardEvent): number | null {
  // Shift changes KeyboardEvent.key to punctuation on many layouts.
  const value = /^Digit([0-9])$/.exec(event.code)?.[1] ?? (/^[0-9]$/.test(event.key) ? event.key : null);
  return value === null ? null : Number(value);
}

function getOutputReviewLineNumber(event: KeyboardEvent): number | null {
  if (!event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) {
    return null;
  }

  const digit = getShortcutDigit(event);
  if (digit === null) {
    return null;
  }

  return digit === 0 ? 10 : digit;
}

function getSidebarShortcutIndex(event: KeyboardEvent): number | null {
  if (!event.ctrlKey || !event.shiftKey || event.altKey || event.metaKey) {
    return null;
  }

  const digit = getShortcutDigit(event);
  if (digit === null) {
    return null;
  }

  return (digit === 0 ? 10 : digit) - 1;
}

function App() {
  const browserPolicy = useBrowserPolicy();
  usePersonalDataStore();
  const browserPaused = !canUseGameConnection();
  const [client, setClient] = useState<MudClient | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [sidebarFocusRequest, setSidebarFocusRequest] = useState<{ index: number } | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState<number | null>(loadSidebarWidth);

  // Persist the user-chosen sidebar width, debounced so drags don't
  // write localStorage on every pointer move
  useEffect(() => {
    if (sidebarWidth === null) return;
    const timer = window.setTimeout(
      () => saveStoredValue(sidebarWidthSchema, sidebarWidth),
      250,
    );
    return () => window.clearTimeout(timer);
  }, [sidebarWidth]);
  const [hostState, setHostState] = useState<WasmHostState>({
    roomId: null,
    guestCount: 0,
  });
  const { clearAllBuffers, linkPickerLinks, closeLinkPicker } = useChannelHistory();
  const outRef = React.useRef<OutputWindow | null>(null);
  const inRef = React.useRef<HTMLTextAreaElement | null>(null);
  const prefsDialogRef = React.useRef<PreferencesDialogRef | null>(null);
  const autoLogDialogRef = React.useRef<AutoLogDialogRef | null>(null);
  useEffect(() => {
    if (!browserPaused) return;
    prefsDialogRef.current?.close();
    autoLogDialogRef.current?.close();
    const frame = requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('.browser-sessions > summary')?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [browserPaused]);
  const sidebarRef = React.useRef<SidebarRef | null>(null);
  const autoLoginAttempted = useRef(false);
  const lastOutputReviewShortcut = useRef<{
    lineNumber: number;
    time: number;
  } | null>(null);

  const clientInitialized = useRef(false);
  const hapticsRuntimeRef = useRef<HapticsRuntime | null>(null);
  const midiEnabled = usePreferences((state) => state.midi.enabled);
  const hapticsEnabled = usePreferences((state) => state.haptics.enabled);
  const connected = useConnectionStore((state) => state.connected);
  useFileTransferNotifications(client);
  useHeadTracking(client?.media);

  const saveLog = () => {
    if (outRef.current) {
      outRef.current.saveLog();
    }
  };

  const clearLog = () => {
    if (outRef.current) {
      outRef.current.clearLog();
    }
    clearAllBuffers();
  };

  const copyLog = () => {
    if (outRef.current) {
      outRef.current.copyLog();
    }
  };

  const handleAppKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!client) {
        return;
      }

      if (event.key === "Control") {
        client.cancelSpeech();
      }

      if (event.key === "Escape") {
        void client.pauseAllSounds().catch(() => {
          useOutputStore.getState().addError(new Error('Could not pause sounds. Try again.'));
        });
        hapticsRuntimeRef.current?.emergencyStop();
      }

      if (browserPaused) return;

      const outputReviewLineNumber = getOutputReviewLineNumber(event);
      if (outputReviewLineNumber !== null) {
        event.preventDefault();
        const now = Date.now();
        const isDoublePress =
          lastOutputReviewShortcut.current?.lineNumber === outputReviewLineNumber &&
          now - lastOutputReviewShortcut.current.time < DOUBLE_PRESS_WINDOW_MS;
        lastOutputReviewShortcut.current = {
          lineNumber: outputReviewLineNumber,
          time: now,
        };
        outRef.current?.reviewRecentOutputLine(outputReviewLineNumber);
        if (isDoublePress) {
          void outRef.current?.copyRecentOutputLine(outputReviewLineNumber);
        }
        return;
      }

      const targetIndex = getSidebarShortcutIndex(event);
      if (targetIndex !== null && sidebarRef.current?.hasTab(targetIndex)) {
        if (!(event.target instanceof Element && event.target.closest('dialog[open], [role="dialog"][aria-modal="true"]'))) {
          event.preventDefault();
          setShowSidebar(true);
          setSidebarCollapsed(false);
          setSidebarFocusRequest({ index: targetIndex });
        }
      }
    },
    [client, browserPaused],
  );

  // Links, shares and opened files that launched or reached this window.
  useEffect(() => {
    startLaunchHandling();
    return watchAppBadge();
  }, []);

  // Shared files wait in the Files tab; bring it up for them.
  const filesRequest = useLaunchStore((state) => state.filesRequest);
  useEffect(() => {
    if (!filesRequest || !client) return;
    const index = sidebarRef.current?.indexOfTab('files-tab') ?? -1;
    if (index < 0) return;
    setShowSidebar(true);
    setSidebarCollapsed(false);
    setSidebarFocusRequest({ index });
  }, [filesRequest, client]);

  useLayoutEffect(() => {
    if (sidebarFocusRequest && showSidebar && !sidebarCollapsed) {
      sidebarRef.current?.switchToTab(sidebarFocusRequest.index);
      setSidebarFocusRequest(null);
    }
  }, [sidebarFocusRequest, showSidebar, sidebarCollapsed]);

  // are we on mobile?
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Determine mode from URL params (available to both effect and JSX)
  const urlModeParams = React.useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    const dbUrl = params.get("db");
    const roomParam = params.get("room");
    const isHostMode = mode === "host";
    const isJoinMode = mode === "join";
    const isLocalMode =
      mode === "local" || (dbUrl !== null && !isHostMode && !isJoinMode);
    return { mode, dbUrl, roomParam, isHostMode, isJoinMode, isLocalMode };
  }, []);

  const isWasmMode = urlModeParams.isLocalMode || urlModeParams.isHostMode;
  const isGuestMode = urlModeParams.isJoinMode;
  const isDefaultMode = !isWasmMode && !isGuestMode;

  // Callback for WASM components to deliver their client
  const handleClientReady = useCallback(
    (newClient: MudClient) => {
      setClient(newClient);
      setShowSidebar(!isMobile);
      window.mudClient = newClient;
    },
    [isMobile],
  );

  // Default telnet mode: create client and connect via WebSocket
  useEffect(() => {
    if (!isDefaultMode) return;
    if (clientInitialized.current) return;
    clientInitialized.current = true;

    const newClient = createConfiguredClient();
    newClient.connect();

    setClient(newClient);
    setShowSidebar(!isMobile);
    window.mudClient = newClient;
  }, [isDefaultMode, isMobile]);

  // Mark clientInitialized when WASM/guest components deliver a client
  useEffect(() => {
    if (client && !clientInitialized.current) {
      clientInitialized.current = true;
    }
  }, [client]);

  useEffect(() => {
    if (!client) {
      autoLogService.configureSession(null);
      return;
    }

    const configureAutologSession = () => {
      const { owner, visitor, policyReady } = usePersonalDataStore.getState();
      autoLogService.configureSession(owner && policyReady && !visitor
        ? { ...createAutoLogSessionDraft(document.title || WINDOW_TITLE), owner: { ...owner } }
        : null);
    };
    const startAutologSession = () => {
      configureAutologSession();
      autoLogService.startSession().catch((error) => {
        console.error("Failed to start autolog session:", error);
      });
    };
    const endAutologSession = () => {
      autoLogService.endSession().catch((error) => {
        console.error("Failed to end autolog session:", error);
      });
    };

    configureAutologSession();
    const unsubscribeOwner = usePersonalDataStore.subscribe(() => { startAutologSession(); });
    if (connected) {
      startAutologSession();
    } else {
      endAutologSession();
    }

    return () => {
      unsubscribeOwner();
      autoLogService.endSession().catch((error) => {
        console.error("Failed to end autolog session during cleanup:", error);
      });
      autoLogService.configureSession(null);
    };
  }, [client, connected]);

  useEffect(() => {
    if (!client?.liveServer) return;
    const auth = client.gmcp.require('Auth.Autologin');
    const enroll = () => { void enrollBrowserNotifications(client); };
    const unsubscribeToken = auth.on('sessionToken', enroll);
    const unsubscribeContext = useBrowserNotifications.subscribe((state) => client.setBrowserNotificationContext(state.context));
    const unsubscribeOwner = usePersonalDataStore.subscribe((state) => {
      const current = useBrowserNotifications.getState().context;
      if (state.visitor || !state.owner || state.owner.playerUuid !== current?.recipient.playerUuid) {
        useBrowserNotifications.setState({ context: undefined, busy: false, error: '' });
      }
    });
    const unsubscribePolicy = useBrowserPolicy.subscribe((state, previous) => {
      if (state.ready && state.policy.phase === 'owner' && previous.policy.phase !== 'owner') enroll();
    });
    enroll();
    return () => { unsubscribeToken(); unsubscribeContext(); unsubscribeOwner(); unsubscribePolicy(); client.setBrowserNotificationContext(undefined); };
  }, [client]);

  useEffect(() => {
    if (!client || !connected || autoLoginAttempted.current) return;

    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get("username");
    const password = urlParams.get("password");
    if (!username || !password) return;

    autoLoginAttempted.current = true;
    console.log("Auto-logging in with URL params...");
    setTimeout(() => {
      client.sendCommand(username);
      setTimeout(() => {
        client.sendCommand(password);
      }, 500);
    }, 1000);
  }, [client, connected]);

  // Common client setup: notifications, auto-login, MIDI, haptics, focus handlers
  useEffect(() => {
    if (!client) return;

    // on focus, focus the input
    const handleFocus = () => {
      inRef.current?.focus();
    };
    document.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("focus", handleFocus);
    };
  }, [client]);

  useEffect(() => {
    document.addEventListener("keydown", handleAppKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleAppKeyDown, true);
    };
  }, [handleAppKeyDown]);

  useEffect(() => {
    if (!midiEnabled) return;

    let cancelled = false;
    let releasePlayback: (() => void) | undefined;
    import("./VirtualMidiService")
      .then(async ({ virtualMidiService }) => {
        if (cancelled) return false;
        releasePlayback = virtualMidiService.setPlaybackSource(client?.media ?? null);
        if (client) {
          // Render into the client's master gain so the synth shares its
          // clock, volume, mute, and autoplay unlock.
          await virtualMidiService.setAudioOutput(client.media.getMidiAudioOutput());
        }
        if (cancelled) return false;
        return virtualMidiService.initialize();
      })
      .then((success) => {
        if (cancelled) return;
        if (success) {
          console.log("Virtual MIDI synthesizer initialized");
        } else {
          console.log("Failed to initialize virtual MIDI synthesizer");
        }
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Error initializing virtual MIDI synthesizer:", error);
      });

    return () => {
      cancelled = true;
      releasePlayback?.();
    };
  }, [midiEnabled, client]);

  // Window subtitle tracks the current room from the room store. On disconnect
  // the client resets the store, which clears roomInfo and so clears the subtitle.
  const roomInfo = useRoomStore((state) => state.roomInfo);
  useEffect(() => {
    if (browserPaused) { document.title = 'Mongoose Client – paused'; return; }
    if (!client) {
      setWindowSubtitle();
      return;
    }
    setWindowSubtitle(roomInfo ? getRoomSubtitle(roomInfo) : undefined);
    return () => {
      setWindowSubtitle();
    };
  }, [client, roomInfo, browserPaused]);

  useEffect(() => {
    if (!client || !hapticsEnabled) return;
    let cancelled = false;
    let runtime: HapticsRuntime | undefined;
    import('./haptics/runtime').then(({ createHapticsRuntime }) => {
      if (cancelled) return;
      runtime = createHapticsRuntime();
      hapticsRuntimeRef.current = runtime;
      runtime.setEnabled(true);
    }).catch((error) => {
      console.error('Failed to initialize haptics runtime:', error);
    });
    return () => {
      cancelled = true;
      if (!runtime) return;
      if (hapticsRuntimeRef.current === runtime) hapticsRuntimeRef.current = null;
      runtime.emergencyStop();
      void runtime.dispose().catch((error) => {
        console.error('Failed to dispose haptics runtime:', error);
      });
    };
  }, [client, hapticsEnabled]);

  const handleCommand = useCallback(
    (text: string) => {
      noteCommandSent();
      if (client) {
        client.sendCommand(text);
      }
    },
    [client],
  );

  const focusInput = useCallback(() => {
    inRef.current?.focus();
  }, []);

  useBeforeunload((event) => {
    if (client) {
      client.shutdown();
    }
    autoLogService.flush().catch((error) => {
      console.error("Failed to flush autolog entries before unload:", error);
    });
    // Best-effort checkpoint on tab close
    const wasmWorker = (window as any).wasmWorker;
    if (wasmWorker) {
      wasmWorker.postMessage({ type: "save" });
    }
  });

  useEffect(() => {
    inRef.current?.focus();
  }, [client]);

  // --- Render ---
  // The WASM/guest components are always in the tree (when active) to avoid
  // remounting. They show their own UI (upload/join dialog) when client is not
  // yet ready, and render HostPanel (or null) once booted.

  return (
    <>
      {client && <BrowserSessions client={client} />}
      {browserPaused && <p role="status">{browserPolicy.policy.phase === 'visitor'
        ? 'This game window is paused while someone else uses this browser.'
        : 'Saved game data is paused. Use Browser sessions to resume after signing in.'}</p>}
      {/* Mode components — always mounted in stable tree position */}
      {isWasmMode && (
        <WasmHost
          key="wasm-host"
          dbUrl={urlModeParams.dbUrl}
          isHostMode={urlModeParams.isHostMode}
          onClientReady={handleClientReady}
          onHostStateChange={setHostState}
          clientReady={!!client}
        />
      )}
      {isGuestMode && !client && (
        <WasmGuest
          roomId={urlModeParams.roomParam}
          onClientReady={handleClientReady}
        />
      )}
      {/* UI shell — only renders when client is ready */}
      {client && (
        <div
          hidden={browserPaused}
          className={`App ${showSidebar ? (sidebarCollapsed ? "sidebar-collapsed" : "sidebar-shown") : ""}`}
          style={
            sidebarWidth !== null
              ? ({ "--sidebar-width": `${sidebarWidth}px` } as React.CSSProperties)
              : undefined
          }
        >
          <header style={{ gridArea: "header" }}>
            <Toolbar
              client={client}
              onSaveLog={saveLog}
              onClearLog={clearLog}
              onCopyLog={copyLog}
              onToggleSidebar={() => setShowSidebar(!showSidebar)}
              onOpenPrefs={() => prefsDialogRef.current?.open()}
              onOpenLogs={() => autoLogDialogRef.current?.open()}
              showSidebar={showSidebar}
            />
            <UpdateNotice />
          </header>
          {urlModeParams.isHostMode && (
            <HostPanel
              roomId={hostState.roomId}
              guestCount={hostState.guestCount}
            />
          )}
          <main style={{ gridArea: "main" }}>
            <OutputWindow
              client={client}
              ref={outRef}
              focusInput={focusInput}
            />
          </main>
          <section aria-label="Command input" style={{ gridArea: "input" }}>
            <CommandInput
              onSend={handleCommand}
              inputRef={inRef}
              client={client}
            />
          </section>
          <aside
            aria-roledescription="Sidebar"
            hidden={!showSidebar}
            style={{ gridArea: "sidebar" }}
          >
            <Sidebar
              ref={sidebarRef}
              client={client}
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              width={sidebarWidth}
              onWidthChange={setSidebarWidth}
            />
          </aside>
          <footer style={{ gridArea: "status" }}>
            <Statusbar />
          </footer>
          <PreferencesDialog ref={prefsDialogRef} />
          <AutoLogDialog ref={autoLogDialogRef} />
        </div>
      )}
      {/* Link picker for Alt+Enter over an Alt+Arrow-reviewed message with 2+ links */}
      <LinkPickerDialog
        links={browserPaused ? null : linkPickerLinks ?? null}
        onClose={closeLinkPicker ?? (() => {})}
      />
      {/* A database the OS opened with the client, before anything boots it */}
      <LaunchDatabaseDialog />
      {/* Default mode with no client yet — blank */}
      {isDefaultMode && !client && null}
    </>
  );
}

export default App;
