import React, { useEffect, useRef, useState } from "react";
import './tabs.css'; // Ensure CSS is imported

// Add id and optional condition to TabProps
export interface TabProps {
  id: string; // Unique ID for the tab and panel
  label: string;
  content: JSX.Element;
  condition?: boolean; // Condition is now handled in parent, but keep for potential future use
}

export interface TabsProps {
  tabs: TabProps[]; // Expecting already filtered tabs
}

const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const userInteractedRef = useRef(false);

  useEffect(() => {
    tabsRef.current = tabsRef.current.slice(0, tabs.length);
  }, [tabs]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
          userInteractedRef.current = true;
          setSelectedTab((prevTab) =>
            prevTab > 0 ? prevTab - 1 : tabs.length - 1
          );
          break;
        case "ArrowRight":
          userInteractedRef.current = true;
          setSelectedTab((prevTab) =>
            prevTab < tabs.length - 1 ? prevTab + 1 : 0
          );
          break;
        default:
          break;
      }
    };

    const currentTabRef = tabsRef.current[selectedTab];
    currentTabRef?.addEventListener("keydown", handleKeyDown);

    return () => {
      currentTabRef?.removeEventListener("keydown", handleKeyDown);
    };
  }, [tabs.length, selectedTab]);

  useEffect(() => {
    if (userInteractedRef.current) {
      tabsRef.current[selectedTab]?.focus();
    }
  }, [selectedTab]);

  return (
    <div>
      <div role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={index}
            ref={(el) => (tabsRef.current[index] = el)}
            role="tab"
            aria-selected={selectedTab === index}
            // Use the provided id for the tab button
            id={tab.id}
            // Use the provided id to link to the panel
            aria-controls={`${tab.id}-panel`}
            onClick={() => {
              userInteractedRef.current = true; // Keep track of user interaction for focus management
              setSelectedTab(index);
            }}
            tabIndex={selectedTab === index ? undefined : -1}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        // Use a container div for the panel content for better structure
        <div
          key={tab.id} // Use tab.id as key
          role="tabpanel"
          // Use the provided id for the panel
          id={`${tab.id}-panel`}
          // Link back to the tab button
          aria-labelledby={tab.id}
          hidden={selectedTab !== index}
          // Add class for styling panel content if needed
          className="sidebar-tab-content"
        >
          {/* Render content only when selected for performance, or always if needed */}
          {selectedTab === index && tab.content}
        </div>
      ))}
    </div>
  );
};

export default Tabs;
