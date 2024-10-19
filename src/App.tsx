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
import FileTransferUI from "./components/FileTransferUI";

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
    if (clientInitialized.current) return;
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
    clientInitialized.current = true;

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

    // Set up file transfer event listeners
    newClient.on('fileChunkReceived', (chunk: ArrayBuffer) => {
      console.log('File chunk received:', chunk.byteLength);
      // Handle the received file chunk (e.g., update progress bar)
    });

    newClient.on('dataChannelOpen', () => {
      console.log('WebRTC data channel opened');
      // Enable file transfer UI or update status
    });

    newClient.on('signalingConnected', () => {
      console.log('Connected to signaling server');
      // Update UI to show connected status
    });

    newClient.on('signalingError', (error: Error) => {
      console.error('Signaling error:', error);
      // Show error message to user
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focus", handleFocus);
      newClient.removeAllListeners();
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
        <FileTransferUI client={client} />
      </div>
      <CommandInput onSend={client.sendCommand} inputRef={inRef} />
      <Statusbar client={client} />
      <PreferencesDialog ref={prefsDialogRef} />
    </div>
  );
}

export default App;
