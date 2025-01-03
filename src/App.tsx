import React, { useEffect, useState, useRef, useCallback } from "react";
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
  GMCPClientFileTransfer,
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
import FileTransferUI from "./components/FileTransfer";

function App() {
  const [client, setClient] = useState<MudClient | null>(null);
  const [showUsers, setShowUsers] = useState<boolean>(false);
  const [showFileTransfer, setShowFileTransfer] = useState<boolean>(false);
  const [fileTransferExpanded, setFileTransferExpanded] = useState<boolean>(false);
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
    newClient.registerGMCPPackage(GMCPClientFileTransfer);
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

      const handleFileTransferOffer = () => {
        setFileTransferExpanded(true);
        setShowFileTransfer(true);
      };

      client.on("userlist", handleUserlist);
      client.on("disconnect", handleDisconnect);
      client.on('fileTransferOffer', handleFileTransferOffer);

      return () => {
        client.off("userlist", handleUserlist);
        client.off("disconnect", handleDisconnect);
        client.off('fileTransferOffer', handleFileTransferOffer);
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
      <div>
        <button
          onClick={() => setShowFileTransfer(!showFileTransfer)}
          aria-expanded={showFileTransfer}
          aria-controls="file-transfer-ui"
        >
          {showFileTransfer ? 'Hide' : 'Show'} File Transfer
        </button>
        <div style={{ display: showFileTransfer ? 'block' : 'none' }}>
          <FileTransferUI client={client} expanded={fileTransferExpanded} />
        </div>
      </div>
      <Statusbar client={client} />
      <PreferencesDialog ref={prefsDialogRef} />
    </div>
  );
}

export default App;
