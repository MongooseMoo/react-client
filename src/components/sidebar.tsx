import React, { useEffect, useState } from "react"; // Import useState, useEffect
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import FileTransferUI from "./FileTransfer";
import AudioChat from "./audioChat";
import Tabs, { TabProps } from "./tabs";
import Userlist from "./userlist";
// import AfflictionsList from "./AfflictionsList"; // Removed
// import DefencesList from "./DefencesList"; // Removed
// import TargetInfoDisplay from "./TargetInfo"; // Removed
import Inventory from "./inventory"; // Changed from InventoryList to Inventory
// import SkillsDisplay from "./SkillsDisplay"; // Removed
import MudClient from "../client";
import { useClientEvent } from "../hooks/useClientEvent"; // Import useClientEvent
import { UserlistPlayer } from "../mcp";
import RoomInfoDisplay from "./RoomInfoDisplay"; // Import new component
import MidiStatus from "./MidiStatus"; // Import MIDI component
import { usePreferences } from "../hooks/usePreferences";
import { GMCPClientMidi } from "../gmcp/Client/Midi";

// Define the type for the imperative handle
export type SidebarRef = {
  switchToTab: (index: number) => void;
};

interface SidebarProps {
  client: MudClient;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

// Wrap component with forwardRef
const Sidebar = React.forwardRef<SidebarRef, SidebarProps>(({ client, collapsed, onToggleCollapse }, ref) => {
  const users = useClientEvent(client, "userlist", [] as UserlistPlayer[]);
  const [preferences] = usePreferences(); // Add preferences hook
  const [fileTransferExpanded, setFileTransferExpanded] = useState(true); // Example state

  // State to track if data has been received for optional tabs
  // const [hasTargetData, setHasTargetData] = useState(false); // Removed
  // const [hasAfflictionsData, setHasAfflictionsData] = useState(false); // Removed
  // const [hasDefencesData, setHasDefencesData] = useState(false); // Removed
  const [hasInventoryData, setHasInventoryData] = useState(false); // Keep state for inventory as example
  // const [hasSkillsData, setHasSkillsData] = useState(false); // Removed
  // Initial check for room data directly from client
  const [hasRoomData, setHasRoomData] = useState(!!client.currentRoomInfo);

  // Handle MIDI support advertisement based on preferences
  useEffect(() => {
    const midiPackage = client.gmcpHandlers["Client.Midi"] as GMCPClientMidi;
    if (!midiPackage) return;

    // Only handle runtime preference changes - initial advertisement handled by Core.Supports
    if (client.connected) {
      if (preferences.midi.enabled) {
        midiPackage.advertiseMidiSupport();
      } else {
        midiPackage.unadvertiseMidiSupport();
      }
    }
  }, [preferences.midi.enabled, client]);

  // Effect to check for inventory data
  useEffect(() => {
    // Listen for the custom event emitted by InventoryList when data arrives
    const handleInventoryData = () => setHasInventoryData(true);
    client.on("itemsList", handleInventoryData);
    return () => {
      client.off("itemsList", handleInventoryData);
    };
  }, [client]);

  // Effect to update room data state if it arrives *after* initial render
  useEffect(() => {
    const handleRoomData = () => {
      if (!hasRoomData) {
        // Only update state if it wasn't already true
        setHasRoomData(true);
      }
    };
    client.on("roomInfo", handleRoomData);
    return () => {
      client.off("roomInfo", handleRoomData);
    };
  }, [client, hasRoomData]); // Add hasRoomData dependency

  // Define all possible tabs
  const allTabs: TabProps[] = [
    {
      id: "room-tab",
      label: "Room",
      content: <RoomInfoDisplay client={client} />,
      condition: hasRoomData, // Condition to show tab
    },
    {
      id: "inventory-tab",
      label: "Inventory",
      content: <Inventory client={client} />, // Changed to use Inventory component
      condition: hasInventoryData,
    },
    {
      id: "users-tab", // Add unique IDs
      label: "Users",
      content: <Userlist users={users} />,
      condition: true,
    },
    {
      id: "midi-tab",
      label: "MIDI",
      content: <MidiStatus client={client} />,
      condition: preferences.midi.enabled,
    },

    // { // Removed Skills Tab
    //   id: "skills-tab",
    //   label: "Skills",
    //   content: <SkillsDisplay client={client} />,
    //   condition: hasSkillsData,
    // },
    // { // Removed Target Tab
    //   id: "target-tab",
    //   label: "Target",
    //   content: <TargetInfoDisplay client={client} />,
    //   condition: hasTargetData,
    // },
    // { // Removed Afflictions Tab
    //   id: "afflictions-tab",
    //   label: "Afflictions",
    //   content: <AfflictionsList client={client} />,
    //   condition: hasAfflictionsData,
    // },
    // { // Removed Defences Tab
    //   id: "defences-tab",
    //   label: "Defences",
    //   content: <DefencesList client={client} />,
    //   condition: hasDefencesData,
    // },
    {
      id: "files-tab",
      label: "Files",
      content: (
        <FileTransferUI client={client} expanded={fileTransferExpanded} />
      ),
      condition: true, // Always show Files tab
    },
    {
      id: "audio-tab",
      label: "Audio",
      content: <AudioChat client={client} />,
      condition: true, // Always show Audio tab (or add condition if needed)
    },
  ];

  // Memoize visibleTabs to prevent unnecessary effect re-runs if conditions don't change
  // Note: If tab conditions become more dynamic, add them to the dependency array.
  const visibleTabs = React.useMemo(() => {
    return allTabs.filter((tab) => tab.condition ?? true); // Default condition to true
  }, [hasRoomData, hasInventoryData, preferences.midi.enabled]); // Add dependencies based on actual conditions used

  // Expose switchToTab function via useImperativeHandle
  React.useImperativeHandle(ref, () => ({
    switchToTab: (targetIndex: number) => {
      if (targetIndex >= 0 && targetIndex < visibleTabs.length) {
        const targetTabId = visibleTabs[targetIndex]?.id;
        if (targetTabId) {
          console.log(`switchToTab: Trying index ${targetIndex}, ID: ${targetTabId}`);
          const buttonElement = document.getElementById(targetTabId);
          if (buttonElement) {
            console.log(`switchToTab: Found button element, attempting click...`);
            buttonElement.click(); // Simulate click
            console.log(`switchToTab: Click simulation finished.`);
          } else {
            console.error(`switchToTab: Could not find button element with ID: ${targetTabId}`);
          }
        } else {
          console.warn(`switchToTab: Could not determine targetTabId for index ${targetIndex}. Visible tabs:`, visibleTabs);
        }
      } else {
         console.warn(`switchToTab: Invalid targetIndex ${targetIndex}. Visible tabs count: ${visibleTabs.length}`);
      }
    }
  }), [visibleTabs]); // Dependency: visibleTabs


  // Example effect to toggle file transfer based on activity
  useEffect(() => {
    const handleActivity = () => setFileTransferExpanded(true);
    client.on("fileTransferOffer", handleActivity);
    // Add listeners for other relevant events like progress, complete, error
    return () => {
      client.off("fileTransferOffer", handleActivity);
      // Remove other listeners
    };
  }, [client]);

  // If no tabs are visible (e.g., only Users tab exists but no users yet),
  // you might want to render nothing or a placeholder.
  // For now, we assume at least one tab will always be potentially visible.

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}> {/* Add collapsed class conditionally */}
      <button
        className="sidebar-collapse-btn"
        onClick={onToggleCollapse}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <FaChevronLeft /> : <FaChevronRight />}
        <span>{collapsed ? "Expand" : "Collapse"}</span>
      </button>
      {!collapsed && (
        <div className="sidebar-content">
          {/* Removed the redundant sidebar-tabs div */}
          <Tabs tabs={visibleTabs} /> {/* Pass the filtered tabs */}
        </div>
      )}
    </div>
  );
}); // Close the forwardRef

export default Sidebar;
