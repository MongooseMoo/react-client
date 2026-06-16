import React, { useCallback, useEffect, useRef, useState } from "react";
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
import Sidebar, { type SidebarRef } from "./components/sidebar";
import Statusbar from "./components/statusbar";
import Toolbar from "./components/toolbar";
import WasmGuest from "./components/WasmGuest";
import type { WasmHostState } from "./components/WasmHost";
import WasmHost from "./components/WasmHost";
import { createConfiguredClient } from "./createConfiguredClient";
import type { GMCPMessageRoomInfo } from "./gmcp/Room";
import { createHapticsRuntime, type HapticsRuntime } from "./haptics/runtime";
import { useChannelHistory } from "./hooks/useChannelHistory";
import {
  autoLogService,
  createAutoLogSessionDraft,
} from "./logging/AutoLogService";
import { usePreferences } from "./stores/preferencesStore";
import { useRoomStore } from "./stores/roomStore";
import { useConnectionStore } from "./stores/connectionStore";
import { ensurePushSubscription } from "./webpush";

const WINDOW_TITLE = "Mongoose Client";

function setWindowSubtitle(subtitle?: string) {
  document.title = subtitle ? `${WINDOW_TITLE} - ${subtitle}` : WINDOW_TITLE;
}

function getRoomSubtitle(roomInfo: GMCPMessageRoomInfo): string | undefined {
  if (roomInfo.area && roomInfo.name) {
    return `${roomInfo.area}: ${roomInfo.name}`;
  }

  return roomInfo.name || roomInfo.area || undefined;
}

function getShortcutDigit(event: KeyboardEvent): number | null {
  const digit = Number.parseInt(event.key, 10);
  if (Number.isNaN(digit) || digit < 0 || digit > 9) {
    return null;
  }

  return digit;
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
  const [client, setClient] = useState<MudClient | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [hostState, setHostState] = useState<WasmHostState>({
    roomId: null,
    guestCount: 0,
  });
  const { clearAllBuffers } = useChannelHistory(client);
  const outRef = React.useRef<OutputWindow | null>(null);
  const inRef = React.useRef<HTMLTextAreaElement | null>(null);
  const prefsDialogRef = React.useRef<PreferencesDialogRef | null>(null);
  const autoLogDialogRef = React.useRef<AutoLogDialogRef | null>(null);
  const sidebarRef = React.useRef<SidebarRef | null>(null);
  const autoLoginAttempted = useRef(false);

  const clientInitialized = useRef(false);
  const hapticsRuntimeRef = useRef<HapticsRuntime | null>(null);
  const preferences = usePreferences();
  const connected = useConnectionStore((state) => state.connected);
  const sessionReady = useConnectionStore((state) => state.sessionReady);
  useFileTransferNotifications(client);

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
        client.stopAllSounds();
        const midiPackage = client.gmcp.handlers["Client.Midi"];
        if (midiPackage) {
          midiPackage.sendAllNotesOff();
        }
        hapticsRuntimeRef.current?.emergencyStop();
      }

      const outputReviewLineNumber = getOutputReviewLineNumber(event);
      if (outputReviewLineNumber !== null) {
        event.preventDefault();
        outRef.current?.reviewRecentOutputLine(outputReviewLineNumber);
        return;
      }

      if (showSidebar) {
        const targetIndex = getSidebarShortcutIndex(event);
        if (targetIndex !== null) {
          event.preventDefault();
          console.log(
            `App: Detected CTRL+SHIFT+${targetIndex + 1}, calling switchToTab(${targetIndex})`,
          );
          sidebarRef.current?.switchToTab(targetIndex);
        }
      }
    },
    [client, showSidebar],
  );

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
      autoLogService.configureSession(
        createAutoLogSessionDraft(document.title || WINDOW_TITLE),
      );
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
    if (connected) {
      startAutologSession();
    } else {
      endAutologSession();
    }

    return () => {
      autoLogService.endSession().catch((error) => {
        console.error("Failed to end autolog session during cleanup:", error);
      });
      autoLogService.configureSession(null);
    };
  }, [client, connected]);

  useEffect(() => {
    if (!client || !sessionReady) return;
    ensurePushSubscription(client).catch((error) => {
      console.error("Failed to ensure push subscription:", error);
    });
  }, [client, sessionReady]);

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

    client.requestNotificationPermission();

    const hapticsRuntime = createHapticsRuntime();
    hapticsRuntimeRef.current = hapticsRuntime;
    hapticsRuntime.setEnabled(usePreferences.getState().haptics.enabled);

    // on focus, focus the input
    const handleFocus = () => {
      inRef.current?.focus();
    };
    document.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("focus", handleFocus);
      if (hapticsRuntimeRef.current === hapticsRuntime) {
        hapticsRuntimeRef.current = null;
      }
      hapticsRuntime.dispose().catch((error) => {
        console.error("Failed to dispose haptics runtime:", error);
      });
    };
  }, [client]);

  useEffect(() => {
    document.addEventListener("keydown", handleAppKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleAppKeyDown, true);
    };
  }, [handleAppKeyDown]);

  useEffect(() => {
    if (!preferences.midi.enabled) return;

    let cancelled = false;
    import("./VirtualMidiService")
      .then(({ virtualMidiService }) => virtualMidiService.initialize())
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
    };
  }, [preferences.midi.enabled]);

  // Window subtitle tracks the current room from the room store. On disconnect
  // the client resets the store, which clears roomInfo and so clears the subtitle.
  const roomInfo = useRoomStore((state) => state.roomInfo);
  useEffect(() => {
    if (!client) {
      setWindowSubtitle();
      return;
    }
    setWindowSubtitle(roomInfo ? getRoomSubtitle(roomInfo) : undefined);
    return () => {
      setWindowSubtitle();
    };
  }, [client, roomInfo]);

  useEffect(() => {
    hapticsRuntimeRef.current?.setEnabled(preferences.haptics.enabled);
  }, [preferences.haptics.enabled]);

  const handleCommand = useCallback(
    (text: string) => {
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
  }, []);

  // --- Render ---
  // The WASM/guest components are always in the tree (when active) to avoid
  // remounting. They show their own UI (upload/join dialog) when client is not
  // yet ready, and render HostPanel (or null) once booted.

  return (
    <>
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
          className={`App ${showSidebar ? (sidebarCollapsed ? "sidebar-collapsed" : "sidebar-shown") : ""}`}
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
          {showSidebar && (
            <aside
              aria-roledescription="Sidebar"
              style={{ gridArea: "sidebar" }}
            >
              <Sidebar
                ref={sidebarRef}
                client={client}
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
            </aside>
          )}
          <footer style={{ gridArea: "status" }}>
            <Statusbar />
          </footer>
          <PreferencesDialog ref={prefsDialogRef} />
          <AutoLogDialog ref={autoLogDialogRef} />
        </div>
      )}
      {/* Default mode with no client yet — blank */}
      {isDefaultMode && !client && null}
    </>
  );
}

export default App;
