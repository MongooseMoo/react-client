import React, { useEffect, useState, useRef } from "react";
import { useBeforeunload } from "react-beforeunload";
import "./App.css";
import OutputWindow from "./components/output";
import MudClient from "./client";
import CommandInput from "./components/input";
import {
  GMCPCore,
  GMCPCoreSupports,
  GMCPClientKeystrokes,
  GMCPClientMedia,
  GMCPClientSpeech,
  GMCPCommLiveKit,
  GMCPCommChannel,
  GMCPAutoLogin,
  GMCPClientHtml,
} from "./gmcp";
import {
  McpAwnsPing,
  McpAwnsStatus,
  McpSimpleEdit,
  McpVmooUserlist,
  UserlistPlayer,
} from "./mcp";
import PreferencesDialog, {
  PreferencesDialogRef,
} from "./components/PreferencesDialog";
import Toolbar from "./components/toolbar";
import Statusbar from "./components/statusbar";
import Userlist from "./components/userlist";
import AudioChat from "./components/audioChat";

function App() {
  const [client, setClient] = useState<MudClient | null>(null);
  const [showUsers, setShowUsers] = useState<boolean>(false);
  const [players, setPlayers] = useState<UserlistPlayer[]>([]);
  const outRef = React.useRef<OutputWindow | null>(null);
  const inRef = React.useRef<HTMLTextAreaElement | null>(null);
  const prefsDialogRef = React.useRef<PreferencesDialogRef | null>(null);

  const clientInitialized = useRef(false);

  const saveLog = () => {
    if (outRef.current) {
      outRef.current.saveLog();
    }
  };

  const clearLog = () => {
    if (outRef.current) {
      outRef.current.clearLog();
    }
  };

  // are we on mobile?
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  useEffect(() => {
    if (clientInitialized.current) return; // <-- new line

    const newClient = new MudClient("mongoose.moo.mud.org", 8765);
    newClient.registerGMCPPackage(GMCPCore);
    newClient.registerGMCPPackage(GMCPClientMedia);
    newClient.registerGMCPPackage(GMCPClientSpeech);
    newClient.registerGMCPPackage(GMCPClientKeystrokes);
    newClient.registerGMCPPackage(GMCPCoreSupports);
    newClient.registerGMCPPackage(GMCPCommChannel);
    newClient.registerGMCPPackage(GMCPCommLiveKit);
    newClient.registerGMCPPackage(GMCPAutoLogin);
    newClient.registerGMCPPackage(GMCPClientHtml);
    newClient.registerMcpPackage(McpAwnsStatus);
    newClient.registerMcpPackage(McpSimpleEdit);
    newClient.registerMcpPackage(McpVmooUserlist);
    newClient.registerMcpPackage(McpAwnsPing);
    newClient.connect();
    newClient.requestNotificationPermission();
    setClient(newClient);
    setShowUsers(!isMobile);
    window.mudClient = newClient;
    registerServiceWorker(newClient);
    clientInitialized.current = true; // <-- new line

    // Listen to 'keydown' event
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!newClient) return;

      if (event.key === "Control") {
        newClient.cancelSpeech(); // Cancel the speech when control key is pressed
      }
      if (event.key === "Escape") {
        newClient.stopAllSounds();
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
  }, [isMobile]);
  useEffect(() => {
    if (client) {
      const handleUserlist = (players: UserlistPlayer[]) => {
        setPlayers(players);
      };

      const handleDisconnect = () => {
        setPlayers([]);
      };

      client.on("userlist", handleUserlist);
      client.on("disconnect", handleDisconnect);

      return () => {
        client.off("userlist", handleUserlist);
        client.off("disconnect", handleDisconnect);
      };
    }
  }, [client]);

  useBeforeunload((event) => {
    if (client) {
      client.shutdown();
    }
  });

  if (!client) return null; // or some loading component

  return (
    <div className="App">
      <header className="App-header"></header>
      <Toolbar
        client={client}
        onSaveLog={saveLog}
        onClearLog={clearLog}
        onToggleUsers={() => setShowUsers(!showUsers)}
        onOpenPrefs={() => prefsDialogRef.current?.open()}
      />
      <div>
        <OutputWindow client={client} ref={outRef} />
        {showUsers && <Userlist users={players} />}
        <AudioChat client={client} />
      </div>
      <CommandInput onSend={client.sendCommand} inputRef={inRef} />
      <Statusbar client={client} />
      <PreferencesDialog ref={prefsDialogRef} />
    </div>
  );
}

function registerServiceWorker(client: MudClient) {
  console.log("Attempting to register service worker...");
  if ("serviceWorker" in navigator) {
    console.log("Service Worker is supported in this browser");
    window.addEventListener("load", () => {
      console.log("Window loaded, registering service worker...");
      navigator.serviceWorker
        .register("/ntfy-service-worker.js")
        .then((registration) => {
          client.serviceWorkerRegistration = registration;
          console.log("ServiceWorker registered successfully:", registration);
          console.log("ServiceWorker scope:", registration.scope);

          if (registration && registration.active) {
            console.log(
              "ServiceWorker is already active, starting SSE connection..."
            );
          } else {
            console.log(
              "ServiceWorker is not yet active, waiting for activation..."
            );
            registration?.addEventListener("activate", () => {
              if (registration && registration.active) {
                console.log(
                  "ServiceWorker activated, starting SSE connection..."
                );
              }
            });
          }

          // Set up message listener
          navigator.serviceWorker.addEventListener("message", (event) => {
            const { type, payload } = event.data;
            switch (type) {
              case 'NTFY_STATE':
                console.log(`Ntfy state: ${payload.status}, Topic: ${payload.topic}`);
                // Update UI or app state based on the new status
                break;
              case 'NTFY_MESSAGE':
                console.log("Received NTFY message:", payload);
                client.handleNtfyMessage(payload);
                break;
              default:
                console.log("Received unknown message", event.data);
            }
          });
        })
        .catch((error) => {
          console.error("ServiceWorker registration failed:", error);
          console.error("Error details:", error.message);
          console.error("Error stack:", error.stack);
        });
    });
  } else {
    console.warn("Service Worker is not supported in this browser");
  }
}

export default App;
