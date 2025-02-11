import React, { useEffect, useRef, useState } from "react";

export interface TabProps {
  label: string;
  content: JSX.Element;
}

export interface TabsProps {
  tabs: TabProps[];
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
      <div role="tablist" aria-label="Tabs">
        {tabs.map((tab, index) => (
          <button
            key={index}
            ref={(el) => (tabsRef.current[index] = el)}
            role="tab"
            aria-selected={selectedTab === index}
            id={`${tab.label}-tab`}
            aria-controls={`${tab.label}-panel`}
            onClick={() => {
              userInteractedRef.current = true;
              setSelectedTab(index);
            }}
            tabIndex={selectedTab === index ? undefined : -1}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={index}
          role="tabpanel"
          id={`${tab.label}-panel`}
          aria-labelledby={`${tab.label}-tab`}
          hidden={selectedTab !== index}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
};

export default Tabs;
