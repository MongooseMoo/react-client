import React, { useCallback, useEffect, useRef, useState } from "react";
import { useBeforeunload } from "react-beforeunload";
import "./App.css";
import MudClient from "./client";
import CommandInput from "./components/input";
import OutputWindow from "./components/output";
import PreferencesDialog, {
  PreferencesDialogRef,
} from "./components/PreferencesDialog";
import Sidebar from "./components/sidebar";
import Statusbar from "./components/statusbar";
import Toolbar from "./components/toolbar";
import {
  GMCPAutoLogin,
  GMCPCharItems,
  GMCPCharStatus,
  GMCPClientFileTransfer,
  GMCPClientHtml,
  GMCPClientKeystrokes,
  GMCPClientMedia,
  GMCPClientSpeech,
  GMCPCommChannel,
  GMCPCommLiveKit,
  GMCPCore,
  GMCPCoreSupports,
  GMCPChar, // Added
  GMCPCharOffer, // Added
  GMCPCharPrompt, // Added
  GMCPCharStatusAffectedBy, // Added
  GMCPCharStatusConditions, // Added
  GMCPCharStatusTimers, // Added
  GMCPCharAfflictions, // Added
  GMCPCharDefences, // Added
  GMCPCharSkills, // Added
  GMCPGroup, // Added
  GMCPLogging, // Added
  GMCPRedirect, // Added
  GMCPRoom, // Added
} from "./gmcp";
import { FileTransferOffer, useClientEvent } from "./hooks/useClientEvent";
import {
  McpAwnsPing,
  McpAwnsStatus,
  McpSimpleEdit,
  McpVmooUserlist,
} from "./mcp";

function App() {
  const [client, setClient] = useState<MudClient | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [showFileTransfer, setShowFileTransfer] = useState<boolean>(false);
  const [fileTransferExpanded, setFileTransferExpanded] =
    useState<boolean>(false);
  const players = useClientEvent<"userlist">(client, "userlist", []) || [];
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

  const copyLog = () => {
    if (outRef.current) {
      outRef.current.copyLog();
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
    newClient.registerGMCPPackage(GMCPCharItems);
    newClient.registerGMCPPackage(GMCPCharStatus); // Removed duplicate below
    // Added missing GMCP packages
    newClient.registerGMCPPackage(GMCPChar);
    newClient.registerGMCPPackage(GMCPCharOffer);
    newClient.registerGMCPPackage(GMCPCharPrompt);
    newClient.registerGMCPPackage(GMCPCharStatusAffectedBy);
    newClient.registerGMCPPackage(GMCPCharStatusConditions);
    newClient.registerGMCPPackage(GMCPCharStatusTimers);
    newClient.registerGMCPPackage(GMCPCharAfflictions);
    newClient.registerGMCPPackage(GMCPCharDefences);
    newClient.registerGMCPPackage(GMCPCharSkills);
    newClient.registerGMCPPackage(GMCPGroup);
    newClient.registerGMCPPackage(GMCPLogging);
    newClient.registerGMCPPackage(GMCPRedirect);
    newClient.registerGMCPPackage(GMCPRoom);
    // MCP Packages
    newClient.registerMcpPackage(McpAwnsStatus);
    newClient.registerMcpPackage(McpSimpleEdit);
    newClient.registerMcpPackage(McpVmooUserlist);
    newClient.registerMcpPackage(McpAwnsPing);
    newClient.connect();
    newClient.requestNotificationPermission();
    setClient(newClient);
    setShowSidebar(!isMobile);
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

  // Function to focus the input element
  const focusInput = useCallback(() => {
    inRef.current?.focus();
  }, []); // No dependencies, so the function reference is stable

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
  });

  useEffect(() => {
    inRef.current?.focus();
  }, []);

  if (!client) return null; // or some loading component

  return (
    <div className="App">
      <header role="banner" style={{ gridArea: "header" }}>
        <Toolbar
          client={client}
         onSaveLog={saveLog}
         onClearLog={clearLog}
         onCopyLog={copyLog} // <-- Pass copyLog function
         onToggleSidebar={() => setShowSidebar(!showSidebar)}
         onOpenPrefs={() => prefsDialogRef.current?.open()}
         showSidebar={showSidebar}
       />
      </header>
      <main role="main" style={{ gridArea: "main" }}>
        {/* Pass the focusInput function down to OutputWindow */}
        <OutputWindow client={client} ref={outRef} focusInput={focusInput} />
      </main>
      <aside
        role="complementary"
        aria-roledescription="Sidebar"
        style={{ gridArea: "sidebar" }}
        className={showSidebar ? "sidebar-visible" : "sidebar-hidden"}
      >
        <Sidebar
          users={players}
          client={client}
          fileTransferExpanded={fileTransferExpanded}
        />{" "}
      </aside>

      <div
        role="region"
        aria-label="Command input"
        style={{ gridArea: "input" }}
      >
        <CommandInput onSend={handleCommand} inputRef={inRef} />
      </div>
      <footer role="contentinfo" style={{ gridArea: "status" }}>
        <Statusbar client={client} />
      </footer>
      <PreferencesDialog ref={prefsDialogRef} />
    </div>
  );
}

export default App;
