import React, { useCallback, useEffect, useRef, useState } from "react";
import { useBeforeunload } from "react-beforeunload";
import "./App.css";
import MudClient from "./client";
import { createConfiguredClient } from "./createConfiguredClient";
import { hapticsService } from "./HapticsService";
import { GamepadBackend } from "./haptics/GamepadBackend";
import { ButtplugWasmBackend, createRealWasmDeps } from "./haptics/ButtplugWasmBackend";
import { virtualMidiService } from "./VirtualMidiService";
import { usePreferences } from "./hooks/usePreferences";
import CommandInput from "./components/input";
import OutputWindow from "./components/output";
import PreferencesDialog, {
  PreferencesDialogRef,
} from "./components/PreferencesDialog";
import Sidebar, { SidebarRef } from "./components/sidebar";
import Statusbar from "./components/statusbar";
import Toolbar from "./components/toolbar";
import WasmHost from "./components/WasmHost";
import type { WasmHostState } from "./components/WasmHost";
import WasmGuest from "./components/WasmGuest";
import HostPanel from "./components/HostPanel";
import { useChannelHistory } from "./hooks/useChannelHistory";
import { FileTransferOffer, useClientEvent } from "./hooks/useClientEvent";
import type { GMCPMessageRoomInfo } from "./gmcp/Room";

const WINDOW_TITLE = "Mongoose Client";

function setWindowSubtitle(subtitle?: string) {
  document.title = subtitle ? `${WINDOW_TITLE} - ${subtitle}` : WINDOW_TITLE;
}

function App() {
  const [client, setClient] = useState<MudClient | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [showFileTransfer, setShowFileTransfer] = useState<boolean>(false);
  const [fileTransferExpanded, setFileTransferExpanded] =
    useState<boolean>(false);
  const [hostState, setHostState] = useState<WasmHostState>({ roomId: null, guestCount: 0 });
  const { clearAllBuffers } = useChannelHistory(client);
  const players = useClientEvent<"userlist">(client, "userlist", []) || [];
  const outRef = React.useRef<OutputWindow | null>(null);
  const inRef = React.useRef<HTMLTextAreaElement | null>(null);
  const prefsDialogRef = React.useRef<PreferencesDialogRef | null>(null);
  const sidebarRef = React.useRef<SidebarRef | null>(null);

  const clientInitialized = useRef(false);
  const wasmBackendLoaded = useRef(false);
  const [preferences] = usePreferences();

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

  // are we on mobile?
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Determine mode from URL params (available to both effect and JSX)
  const urlModeParams = React.useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const dbUrl = params.get('db');
    const roomParam = params.get('room');
    const isHostMode = mode === 'host';
    const isJoinMode = mode === 'join';
    const isLocalMode = mode === 'local' || (dbUrl !== null && !isHostMode && !isJoinMode);
    return { mode, dbUrl, roomParam, isHostMode, isJoinMode, isLocalMode };
  }, []);

  const isWasmMode = urlModeParams.isLocalMode || urlModeParams.isHostMode;
  const isGuestMode = urlModeParams.isJoinMode;
  const isDefaultMode = !isWasmMode && !isGuestMode;

  // Callback for WASM components to deliver their client
  const handleClientReady = useCallback((newClient: MudClient) => {
    setClient(newClient);
    setShowSidebar(!isMobile);
    window.mudClient = newClient;
  }, [isMobile]);

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

  // Common client setup: notifications, auto-login, MIDI, haptics, keyboard handlers
  useEffect(() => {
    if (!client) return;

    client.requestNotificationPermission();

    // Auto-login from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    const password = urlParams.get('password');
    if (username && password) {
      client.once('connect', () => {
        console.log('Auto-logging in with URL params...');
        setTimeout(() => {
          client.sendCommand(username);
          setTimeout(() => {
            client.sendCommand(password);
          }, 500);
        }, 1000);
      });
    }

    // Initialize virtual MIDI synthesizer
    virtualMidiService.initialize().then((success) => {
      if (success) {
        console.log("Virtual MIDI synthesizer initialized");
      } else {
        console.log("Failed to initialize virtual MIDI synthesizer");
      }
    }).catch((error) => {
      console.error("Error initializing virtual MIDI synthesizer:", error);
    });

    // Register gamepad backend (always available, zero config)
    const gamepadBackend = new GamepadBackend();
    hapticsService.registerBackend(gamepadBackend);
    gamepadBackend.connect();

    // Listen to 'keydown' event
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Control") {
        client.cancelSpeech();
      }
      if (event.key === "Escape") {
        client.stopAllSounds();
        const midiPackage = client.gmcpHandlers["Client.Midi"];
        if (midiPackage) {
          (midiPackage as any).sendAllNotesOff();
        }
        hapticsService.emergencyStop();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // on focus, focus the input
    const handleFocus = () => {
      inRef.current?.focus();
    };
    document.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focus", handleFocus);
    };
  }, [client]);

  useEffect(() => {
    if (!client) {
      setWindowSubtitle();
      return;
    }

    const handleRoomInfo = (roomInfo: GMCPMessageRoomInfo) => {
      setWindowSubtitle(roomInfo.name);
    };
    const handleDisconnect = () => {
      setWindowSubtitle();
    };

    if (client.currentRoomInfo) {
      handleRoomInfo(client.currentRoomInfo);
    } else {
      setWindowSubtitle();
    }

    client.on("roomInfo", handleRoomInfo);
    client.on("disconnect", handleDisconnect);

    return () => {
      client.off("roomInfo", handleRoomInfo);
      client.off("disconnect", handleDisconnect);
      setWindowSubtitle();
    };
  }, [client]);

  // Load WASM buttplug backend when haptics is enabled (lazy — avoids 5MB download when disabled)
  useEffect(() => {
    if (!preferences.haptics.enabled) return;
    if (wasmBackendLoaded.current) return;
    wasmBackendLoaded.current = true;

    let cancelled = false;
    createRealWasmDeps()
      .then((deps) => {
        if (cancelled) return;
        const buttplugBackend = new ButtplugWasmBackend(deps);
        hapticsService.registerBackend(buttplugBackend);
        console.log("ButtplugWasmBackend registered (WASM loaded)");
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("Failed to load buttplug WASM backend:", err);
        wasmBackendLoaded.current = false;
      });

    return () => {
      cancelled = true;
      wasmBackendLoaded.current = false;
    };
  }, [preferences.haptics.enabled]);

  // Effect for CTRL + Number shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showSidebar || !event.ctrlKey) {
        return;
      }
      const digit = parseInt(event.key, 10);
      if (!isNaN(digit) && digit >= 1 && digit <= 9) {
        const targetIndex = digit - 1;
        event.preventDefault();
        console.log(
          `App: Detected CTRL+${digit}, calling switchToTab(${targetIndex})`
        );
        sidebarRef.current?.switchToTab(targetIndex);
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [showSidebar]);

  const fileTransferOffer = useClientEvent<"fileTransferOffer">(
    client,
    "fileTransferOffer",
    null as unknown as FileTransferOffer
  );

  const handleCommand = useCallback(
    (text: string) => {
      if (client) {
        client.sendCommand(text);
      }
    },
    [client]
  );

  const focusInput = useCallback(() => {
    inRef.current?.focus();
  }, []);

  useEffect(() => {
    if (fileTransferOffer !== null) {
      setFileTransferExpanded(true);
      setShowFileTransfer(true);
      client?.sendNotification(
        "File Transfer Offer",
        `${fileTransferOffer.sender} wants to send you ${
          fileTransferOffer.filename
        } (${Math.round(fileTransferOffer.filesize / 1024)} KB)`
      );
    }
  }, [fileTransferOffer, client]);

  useBeforeunload((event) => {
    if (client) {
      client.shutdown();
    }
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
        <div className={`App ${showSidebar ? (sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-shown') : ''}`}>
          <header role="banner" style={{ gridArea: "header" }}>
            <Toolbar
              client={client}
              onSaveLog={saveLog}
              onClearLog={clearLog}
              onCopyLog={copyLog}
              onToggleSidebar={() => setShowSidebar(!showSidebar)}
              onOpenPrefs={() => prefsDialogRef.current?.open()}
              showSidebar={showSidebar}
            />
          </header>
          {urlModeParams.isHostMode && <HostPanel roomId={hostState.roomId} guestCount={hostState.guestCount} />}
          <main role="main" style={{ gridArea: "main" }}>
            <OutputWindow client={client} ref={outRef} focusInput={focusInput} />
          </main>
          <div
            role="region"
            aria-label="Command input"
            style={{ gridArea: "input" }}
          >
            <CommandInput onSend={handleCommand} inputRef={inRef} client={client} />
          </div>
          {showSidebar && (
            <aside
              role="complementary"
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
          <footer role="contentinfo" style={{ gridArea: "status" }}>
            <Statusbar client={client} />
          </footer>
          <PreferencesDialog ref={prefsDialogRef} />
        </div>
      )}
      {/* Default mode with no client yet — blank */}
      {isDefaultMode && !client && null}
    </>
  );
}

export default App;
