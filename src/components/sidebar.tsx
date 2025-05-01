import React, { useEffect, useState } from "react"; // Import useState, useEffect
import FileTransferUI from "./FileTransfer";
import AudioChat from "./audioChat";
import Tabs, { TabProps } from "./tabs";
import Userlist from "./userlist";
// import AfflictionsList from "./AfflictionsList"; // Removed
// import DefencesList from "./DefencesList"; // Removed
// import TargetInfoDisplay from "./TargetInfo"; // Removed
import InventoryList from "./InventoryList";
// import SkillsDisplay from "./SkillsDisplay"; // Removed
import MudClient from "../client";
import { useClientEvent } from "../hooks/useClientEvent"; // Import useClientEvent
import { UserlistPlayer } from "../mcp";
import RoomInfoDisplay from "./RoomInfoDisplay"; // Import new component

interface SidebarProps {
  client: MudClient;
  // fileTransferExpanded is likely managed internally now or via context
}

const Sidebar: React.FC<SidebarProps> = ({ client }) => {
  const users = useClientEvent(client, "userlist", [] as UserlistPlayer[]);
  const [fileTransferExpanded, setFileTransferExpanded] = useState(true); // Example state

  // State to track if data has been received for optional tabs
  // const [hasTargetData, setHasTargetData] = useState(false); // Removed
  // const [hasAfflictionsData, setHasAfflictionsData] = useState(false); // Removed
  // const [hasDefencesData, setHasDefencesData] = useState(false); // Removed
  const [hasInventoryData, setHasInventoryData] = useState(false); // Keep state for inventory as example
  // const [hasSkillsData, setHasSkillsData] = useState(false); // Removed
  // Initial check for room data directly from client
  const [hasRoomData, setHasRoomData] = useState(!!client.currentRoomInfo);

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
      content: <InventoryList client={client} />,
      condition: hasInventoryData,
    },
    {
      id: "users-tab", // Add unique IDs
      label: "Users",
      content: <Userlist users={users} />,
      condition: true,
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

  // Filter tabs based on their condition
  const visibleTabs = allTabs.filter((tab) => tab.condition);

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
    <div className="sidebar"> {/* Add the main sidebar container */}
      <div className="sidebar-content">
        {/* Removed the redundant sidebar-tabs div */}
        <Tabs tabs={visibleTabs} /> {/* Pass the filtered tabs */}
      </div>
    </div>
  );
};

export default Sidebar;
