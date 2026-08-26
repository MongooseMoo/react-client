import React, { Suspense, useEffect, useRef, useState } from 'react'; // Import useState, useEffect
import {
  FaBoxOpen,
  FaChevronLeft,
  FaChevronRight,
  FaFolderOpen,
  FaGamepad,
  FaHeadphones,
  FaMapMarkerAlt,
  FaMusic,
  FaServer,
  FaUsers,
} from 'react-icons/fa';
import FileTransferUI from './FileTransfer';
const AudioChat = React.lazy(() => import('./audioChat'));
const MidiStatus = React.lazy(() => import('./MidiStatus'));
import Tabs, { type TabProps } from './tabs';
import './sidebar.css';
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

export const MIN_SIDEBAR_WIDTH = 180;
const KEYBOARD_RESIZE_STEP = 24;

function maxSidebarWidth(): number {
  return Math.max(MIN_SIDEBAR_WIDTH, Math.round(window.innerWidth * 0.6));
}

export function clampSidebarWidth(width: number): number {
  return Math.min(Math.max(Math.round(width), MIN_SIDEBAR_WIDTH), maxSidebarWidth());
}

interface SidebarProps {
  client: MudClient;
  collapsed: boolean;
  onToggleCollapse: () => void;
  /** Custom width in px (null = default CSS width). */
  width?: number | null;
  /** Called with the new width as the user drags or arrow-keys the resize handle. */
  onWidthChange?: (width: number) => void;
}

// Wrap component with forwardRef
const Sidebar = React.forwardRef<SidebarRef, SidebarProps>(
  ({ client, collapsed, onToggleCollapse, width = null, onWidthChange }, ref) => {
    const users = useUserlistStore((state) => state.players);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isResizing, setIsResizing] = useState(false);
    const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
    const midiPreferences = usePreferences((state) => state.midi);
    const hapticsPreferences = usePreferences((state) => state.haptics);
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
        if (midiPreferences.enabled) {
          midiPackage.advertiseMidiSupport();
        } else {
          midiPackage.unadvertiseMidiSupport();
        }
      }
    }, [midiPreferences.enabled, client]);

    // Handle Haptics support advertisement based on preferences
    useEffect(() => {
      const hapticsPackage = client.gmcp.handlers['Client.Haptics'];
      if (!hapticsPackage) return;
      if (client.connected) {
        if (hapticsPreferences.enabled) {
          hapticsPackage.advertiseHapticsSupport();
        } else {
          hapticsPackage.unadvertiseHapticsSupport();
        }
      }
    }, [hapticsPreferences.enabled, client]);

    // Wire haptics preferences to the service
    useEffect(() => {
      hapticsService.intensityCap = hapticsPreferences.intensityCap;
      hapticsService.autoStopTimeoutSecs = hapticsPreferences.autoStopTimeout;
    }, [hapticsPreferences.intensityCap, hapticsPreferences.autoStopTimeout]);

    // Resize handle behavior: pointer drag plus arrow keys (ARIA window
    // splitter). The sidebar sits on the right, so ArrowLeft grows it.
    const currentWidth = width ?? measuredWidth;

    useEffect(() => {
      if (collapsed) return;
      setMeasuredWidth(containerRef.current?.offsetWidth ?? null);
    }, [collapsed, width]);

    const handleResizePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!onWidthChange) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsResizing(true);
    };

    const handleResizePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isResizing || !onWidthChange) return;
      const right = containerRef.current?.getBoundingClientRect().right;
      if (right === undefined) return;
      onWidthChange(clampSidebarWidth(right - event.clientX));
    };

    const handleResizePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      setIsResizing(false);
    };

    const handleResizeKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!onWidthChange || currentWidth === null) return;
      let next: number | null = null;
      switch (event.key) {
        case 'ArrowLeft':
          next = currentWidth + KEYBOARD_RESIZE_STEP;
          break;
        case 'ArrowRight':
          next = currentWidth - KEYBOARD_RESIZE_STEP;
          break;
        case 'Home':
          next = MIN_SIDEBAR_WIDTH;
          break;
        case 'End':
          next = maxSidebarWidth();
          break;
        default:
          return;
      }
      event.preventDefault();
      onWidthChange(clampSidebarWidth(next));
    };

    // Define all possible tabs
    const allTabs: TabProps[] = [
      {
        id: 'room-tab',
        label: 'Room',
        icon: <FaMapMarkerAlt />,
        content: <RoomInfoDisplay client={client} />,
        condition: hasRoomData, // Condition to show tab
      },
      {
        id: 'inventory-tab',
        label: 'Inventory',
        icon: <FaBoxOpen />,
        content: <Inventory client={client} />, // Changed to use Inventory component
        condition: hasInventoryData,
      },
      {
        id: 'users-tab', // Add unique IDs
        label: 'Users',
        icon: <FaUsers />,
        content: <Userlist users={users} />,
        condition: true,
      },
      {
        id: 'server-tab',
        label: 'Server',
        icon: <FaServer />,
        content: <ServerFeaturesPanel client={client} />,
        condition: true,
      },
      {
        id: 'midi-tab',
        label: 'MIDI',
        icon: <FaMusic />,
        content: (
          <Suspense fallback={null}>
            <MidiStatus client={client} />
          </Suspense>
        ),
        condition: midiPreferences.enabled,
      },
      {
        id: 'haptics-tab',
        label: 'Haptics',
        icon: <FaGamepad />,
        content: <HapticsStatus client={client} />,
        condition: hapticsPreferences.enabled,
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
        icon: <FaFolderOpen />,
        content: <FileTransferUI client={client} expanded={fileTransferExpanded} users={users} />,
        condition: true, // Always show Files tab
      },
      {
        id: 'audio-tab',
        label: 'Audio',
        icon: <FaHeadphones />,
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
      <div
        ref={containerRef}
        className={`sidebar ${collapsed ? 'collapsed' : ''}`}
        data-resizing={isResizing || undefined}
      >
        {!collapsed && onWidthChange && (
          <div
            className="sidebar-resize-handle"
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize sidebar"
            aria-valuemin={MIN_SIDEBAR_WIDTH}
            aria-valuemax={maxSidebarWidth()}
            aria-valuenow={currentWidth ?? undefined}
            tabIndex={0}
            onPointerDown={handleResizePointerDown}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerEnd}
            onPointerCancel={handleResizePointerEnd}
            onKeyDown={handleResizeKeyDown}
          />
        )}
        {collapsed && collapseButton}
        <div className="sidebar-content" hidden={collapsed}>
          <Tabs tabs={visibleTabs} trailingElement={!collapsed ? collapseButton : undefined} />
        </div>
      </div>
    );
  },
); // Close the forwardRef

export default Sidebar;
