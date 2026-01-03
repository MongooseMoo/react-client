import React, { useCallback, useEffect, useRef, useState } from "react";
import { useBeforeunload } from "react-beforeunload";
import "./App.css";
import MudClient from "./client";
import { virtualMidiService } from "./VirtualMidiService";
import CommandInput from "./components/input";
import OutputWindow from "./components/output";
import PreferencesDialog, {
  PreferencesDialogRef,
} from "./components/PreferencesDialog";
// Import SidebarRef type along with the component
import Sidebar, { SidebarRef } from "./components/sidebar";
import Statusbar from "./components/statusbar";
import Toolbar from "./components/toolbar";
import {
  GMCPAutoLogin,
  GMCPChar, // Added
  GMCPCharAfflictions, // Added
  GMCPCharDefences,
  GMCPCharItems, // Added
  GMCPCharOffer, // Added
  GMCPCharPrompt, // Added
  GMCPCharSkills,
  GMCPCharStatus, // Added
  GMCPCharStatusAffectedBy, // Added
  GMCPCharStatusConditions, // Added
  GMCPCharStatusTimers,
  GMCPClientFile,
  GMCPClientFileTransfer,
  GMCPClientHtml,
  GMCPClientKeystrokes,
  GMCPClientMedia,
  GMCPClientMidi,
  GMCPClientSpeech,
  GMCPCommChannel,
  GMCPCommLiveKit,
  GMCPCore,
  GMCPCoreSupports, // Added
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [showFileTransfer, setShowFileTransfer] = useState<boolean>(false);
  const [fileTransferExpanded, setFileTransferExpanded] =
    useState<boolean>(false);
  const players = useClientEvent<"userlist">(client, "userlist", []) || [];
  const outRef = React.useRef<OutputWindow | null>(null);
  const inRef = React.useRef<HTMLTextAreaElement | null>(null);
  const prefsDialogRef = React.useRef<PreferencesDialogRef | null>(null);
  const sidebarRef = React.useRef<SidebarRef | null>(null); // Add ref for Sidebar

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
    newClient.registerGMCPPackage(GMCPClientMidi);
    newClient.registerGMCPPackage(GMCPClientSpeech);
    newClient.registerGMCPPackage(GMCPClientKeystrokes);
    newClient.registerGMCPPackage(GMCPCoreSupports);
    newClient.registerGMCPPackage(GMCPCommChannel);
    newClient.registerGMCPPackage(GMCPCommLiveKit);
    newClient.registerGMCPPackage(GMCPAutoLogin);
    newClient.registerGMCPPackage(GMCPClientHtml);
    newClient.registerGMCPPackage(GMCPClientFile);
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
    
    // Check for URL parameters for auto-login (useful for testing/e2e)
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    const password = urlParams.get('password');
    
    if (username && password) {
      // Auto-login when connected
      newClient.once('connect', () => {
        console.log('Auto-logging in with URL params...');
        setTimeout(() => {
          newClient.sendCommand(username);
          setTimeout(() => {
            newClient.sendCommand(password);
          }, 500);
        }, 1000);
      });
    }
    setClient(newClient);
    setShowSidebar(!isMobile);
    window.mudClient = newClient;
    clientInitialized.current = true;
    
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

    // Listen to 'keydown' event
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!newClient) return;

      if (event.key === "Control") {
        newClient.cancelSpeech(); // Cancel the speech when control key is pressed
      }
      if (event.key === "Escape") {
        newClient.stopAllSounds();
        // Also send MIDI all notes off if MIDI is enabled
        const midiPackage = newClient.gmcpHandlers["Client.Midi"];
        if (midiPackage) {
          (midiPackage as any).sendAllNotesOff();
        }
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
  }, [isMobile]); // Keep client initialization separate

  // Effect for CTRL + Number shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only act if sidebar is shown and CTRL is pressed
      if (!showSidebar || !event.ctrlKey) {
        return;
      }

      // Check if key is a digit 1-9
      const digit = parseInt(event.key, 10);
      if (!isNaN(digit) && digit >= 1 && digit <= 9) {
        const targetIndex = digit - 1; // 0-based index

        // Prevent browser default action (like switching browser tabs)
        event.preventDefault();

        // Call the function exposed by Sidebar via ref
        console.log(
          `App: Detected CTRL+${digit}, calling switchToTab(${targetIndex})`
        );
        sidebarRef.current?.switchToTab(targetIndex);
      }
    };

    // Add the event listener in the capture phase
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      // Remove the event listener also specifying the capture phase
      document.removeEventListener("keydown", handleKeyDown, true);
    };
    // Re-run if sidebar visibility changes
  }, [showSidebar]); // Dependency: showSidebar

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
    // Add conditional 'sidebar-shown' or 'sidebar-collapsed' class based on state
    <div className={`App ${showSidebar ? (sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-shown') : ''}`}>
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
      <div
        role="region"
        aria-label="Command input"
        style={{ gridArea: "input" }}
      >
        {/* Pass the client prop to CommandInput */}
        <CommandInput onSend={handleCommand} inputRef={inRef} client={client} />
      </div>
      {/* Conditionally render the aside element */}
      {showSidebar && (
        <aside
          role="complementary"
          aria-roledescription="Sidebar"
          style={{ gridArea: "sidebar" }}
          // className is no longer needed here for visibility
        >
          {/* Pass the ref, client prop, collapsed state, and toggle handler */}
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
  );
}

export default App;
