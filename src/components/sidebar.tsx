import React, { Suspense, useEffect, useState } from 'react'; // Import useState, useEffect
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import FileTransferUI from './FileTransfer';
const AudioChat = React.lazy(() => import('./audioChat'));
const MidiStatus = React.lazy(() => import('./MidiStatus'));
import Tabs, { type TabProps } from './tabs';
import Userlist from './userlist';
// import AfflictionsList from "./AfflictionsList"; // Removed
// import DefencesList from "./DefencesList"; // Removed
import Inventory from './inventory'; // Changed from InventoryList to Inventory
// import SkillsDisplay from "./SkillsDisplay"; // Removed
import type MudClient from '../client';
import RoomInfoDisplay from './RoomInfoDisplay'; // Import new component
import HapticsStatus from './HapticsStatus'; // Import Haptics component
import { usePreferences } from '../stores/preferencesStore';
import { useRoomStore } from '../stores/roomStore';
import { useItemsStore } from '../stores/itemsStore';
import { useUserlistStore } from '../stores/userlistStore';
import { hapticsService } from '../HapticsService';
import ServerFeaturesPanel from './ServerFeaturesPanel';

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
const Sidebar = React.forwardRef<SidebarRef, SidebarProps>(
  ({ client, collapsed, onToggleCollapse }, ref) => {
    const users = useUserlistStore((state) => state.players);
    const preferences = usePreferences(); // Add preferences hook
    const [fileTransferExpanded, setFileTransferExpanded] = useState(true); // Example state

    // State to track if data has been received for optional tabs
    // const [hasAfflictionsData, setHasAfflictionsData] = useState(false); // Removed
    // const [hasDefencesData, setHasDefencesData] = useState(false); // Removed
    const hasInventoryData = useItemsStore((state) => state.hasReceivedList);
    // const [hasSkillsData, setHasSkillsData] = useState(false); // Removed
    // Show the Room tab once room info has arrived (from the room store).
    const hasRoomData = useRoomStore((state) => state.roomInfo !== null);

    // Handle MIDI support advertisement based on preferences
    useEffect(() => {
      const midiPackage = client.gmcp.handlers['Client.Midi'];
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

    // Handle Haptics support advertisement based on preferences
    useEffect(() => {
      const hapticsPackage = client.gmcp.handlers['Client.Haptics'];
      if (!hapticsPackage) return;
      if (client.connected) {
        if (preferences.haptics.enabled) {
          hapticsPackage.advertiseHapticsSupport();
        } else {
          hapticsPackage.unadvertiseHapticsSupport();
        }
      }
    }, [preferences.haptics.enabled, client]);

    // Wire haptics preferences to the service
    useEffect(() => {
      hapticsService.intensityCap = preferences.haptics.intensityCap;
      hapticsService.autoStopTimeoutSecs = preferences.haptics.autoStopTimeout;
    }, [preferences.haptics.intensityCap, preferences.haptics.autoStopTimeout]);

    // Define all possible tabs
    const allTabs: TabProps[] = [
      {
        id: 'room-tab',
        label: 'Room',
        content: <RoomInfoDisplay client={client} />,
        condition: hasRoomData, // Condition to show tab
      },
      {
        id: 'inventory-tab',
        label: 'Inventory',
        content: <Inventory client={client} />, // Changed to use Inventory component
        condition: hasInventoryData,
      },
      {
        id: 'users-tab', // Add unique IDs
        label: 'Users',
        content: <Userlist users={users} />,
        condition: true,
      },
      {
        id: 'server-tab',
        label: 'Server',
        content: <ServerFeaturesPanel client={client} />,
        condition: true,
      },
      {
        id: 'midi-tab',
        label: 'MIDI',
        content: (
          <Suspense fallback={null}>
            <MidiStatus client={client} />
          </Suspense>
        ),
        condition: preferences.midi.enabled,
      },
      {
        id: 'haptics-tab',
        label: 'Haptics',
        content: <HapticsStatus client={client} />,
        condition: preferences.haptics.enabled,
      },

      // { // Removed Skills Tab
      //   id: "skills-tab",
      //   label: "Skills",
      //   content: <SkillsDisplay client={client} />,
      //   condition: hasSkillsData,
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
        id: 'files-tab',
        label: 'Files',
        content: <FileTransferUI client={client} expanded={fileTransferExpanded} users={users} />,
        condition: true, // Always show Files tab
      },
      {
        id: 'audio-tab',
        label: 'Audio',
        content: (
          <Suspense fallback={null}>
            <AudioChat client={client} />
          </Suspense>
        ),
        condition: true, // Always show Audio tab (or add condition if needed)
      },
    ];

    const visibleTabs = allTabs.filter((tab) => tab.condition ?? true);

    // Expose switchToTab function via useImperativeHandle
    React.useImperativeHandle(
      ref,
      () => ({
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
              console.warn(
                `switchToTab: Could not determine targetTabId for index ${targetIndex}. Visible tabs:`,
                visibleTabs,
              );
            }
          } else {
            console.warn(
              `switchToTab: Invalid targetIndex ${targetIndex}. Visible tabs count: ${visibleTabs.length}`,
            );
          }
        },
      }),
      [visibleTabs],
    ); // Dependency: visibleTabs

    // Example effect to toggle file transfer based on activity
    useEffect(() => {
      const handleActivity = () => setFileTransferExpanded(true);
      client.fileTransferManager.on('fileTransferOffer', handleActivity);
      // Add listeners for other relevant events like progress, complete, error
      return () => {
        client.fileTransferManager.off('fileTransferOffer', handleActivity);
        // Remove other listeners
      };
    }, [client]);

    // If no tabs are visible (e.g., only Users tab exists but no users yet),
    // you might want to render nothing or a placeholder.
    // For now, we assume at least one tab will always be potentially visible.

    const collapseButton = (
      <button
        type="button"
        className="sidebar-collapse-btn"
        onClick={onToggleCollapse}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <FaChevronLeft /> : <FaChevronRight />}
        {collapsed && <span>Expand</span>}
      </button>
    );

    return (
      <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        {collapsed && collapseButton}
        <div className="sidebar-content" hidden={collapsed}>
          <Tabs tabs={visibleTabs} trailingElement={!collapsed ? collapseButton : undefined} />
        </div>
      </div>
    );
  },
); // Close the forwardRef

export default Sidebar;
