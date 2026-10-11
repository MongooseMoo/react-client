import React, { useLayoutEffect, useRef, useState } from 'react';
import { useFocusRecovery } from '../hooks/useFocusRecovery';
import './tabs.css';

export interface TabProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: JSX.Element;
  condition?: boolean;
  mountOnSelect?: boolean;
  shortcut?: string;
}

export interface TabsProps {
  tabs: TabProps[];
  trailingElement?: React.ReactNode;
  ariaLabel?: string;
}

export interface TabsRef {
  /** Select a known destination and optionally focus its tab, including reselection. */
  selectTab: (id: string, focus?: boolean) => boolean;
}

const Tabs = React.forwardRef<TabsRef, TabsProps>(({ tabs, trailingElement, ariaLabel }, ref) => {
  const [selectedId, setSelectedId] = useState<string | null>(() => tabs[0]?.id ?? null);
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(() => new Set());
  const [focusRequest, setFocusRequest] = useState<{ id: string } | null>(null);
  const previousIndex = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const retainedIndex = tabs.findIndex((tab) => tab.id === selectedId);
  const selectedIndex = retainedIndex >= 0 ? retainedIndex : Math.min(previousIndex.current, tabs.length - 1);
  const resolvedId = tabs[selectedIndex]?.id ?? null;
  useFocusRecovery(rootRef, resolvedId ?? undefined);

  useLayoutEffect(() => {
    if (selectedId !== resolvedId) setSelectedId(resolvedId);
    if (selectedIndex >= 0) previousIndex.current = selectedIndex;
    if (resolvedId) setVisitedTabs((previous) => previous.has(resolvedId) ? previous : new Set([...previous, resolvedId]));
  }, [selectedId, resolvedId, selectedIndex]);

  const selectTab = (id: string, focus = true) => {
    if (!tabs.some((tab) => tab.id === id)) return false;
    setSelectedId(id);
    if (focus) setFocusRequest({ id });
    return true;
  };
  React.useImperativeHandle(ref, () => ({ selectTab }), [tabs]);
  useLayoutEffect(() => {
    if (focusRequest?.id === resolvedId) buttons.current.get(resolvedId)?.focus();
  }, [focusRequest, resolvedId]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    let index: number;
    switch (event.key) {
      case 'ArrowLeft': index = (selectedIndex - 1 + tabs.length) % tabs.length; break;
      case 'ArrowRight': index = (selectedIndex + 1) % tabs.length; break;
      case 'Home': index = 0; break;
      case 'End': index = tabs.length - 1; break;
      default: return;
    }
    event.preventDefault();
    const tab = tabs[index];
    if (tab) selectTab(tab.id);
  };

  return (
    <div className="tabs-container" ref={rootRef}>
      <div className="tab-bar-row">
        <div role="tablist" aria-label={ariaLabel}>
          {tabs.map((tab) => (
            <button key={tab.id} type="button" role="tab" id={tab.id}
              ref={(element) => { if (element) buttons.current.set(tab.id, element); else buttons.current.delete(tab.id); }}
              aria-selected={resolvedId === tab.id} aria-controls={`${tab.id}-panel`}
              aria-keyshortcuts={tab.shortcut}
              onClick={() => selectTab(tab.id)} onKeyDown={handleKeyDown}
              tabIndex={resolvedId === tab.id ? 0 : -1} title={tab.shortcut ? `${tab.label} (${tab.shortcut.replace('Control', 'Ctrl')})` : tab.icon ? tab.label : undefined}>
              {tab.icon && <span className="tab-icon" aria-hidden="true">{tab.icon}</span>}
              <span className={tab.icon ? 'tab-label' : undefined}>{tab.label}</span>
            </button>
          ))}
        </div>
        {trailingElement}
      </div>
      {tabs.map((tab) => (
        <TabPanel key={tab.id} tab={tab} selected={resolvedId === tab.id}>
          {(!tab.mountOnSelect || resolvedId === tab.id || visitedTabs.has(tab.id)) && tab.content}
        </TabPanel>
      ))}
    </div>
  );
});

function TabPanel({ tab, selected, children }: { tab: TabProps; selected: boolean; children: React.ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [hasControls, setHasControls] = useState(true);
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const update = () => {
      const candidates = panel.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])');
      setHasControls(Array.from(candidates).some((element) => {
        for (let ancestor: HTMLElement | null = element; ancestor && ancestor !== panel; ancestor = ancestor.parentElement) {
          if (ancestor.hidden || ancestor.hasAttribute('inert')) return false;
        }
        return true;
      }));
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(panel, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'tabindex', 'hidden', 'inert', 'href'] });
    return () => observer.disconnect();
  }, []);
  return <div ref={panelRef} role="tabpanel" id={`${tab.id}-panel`} aria-labelledby={tab.id}
    hidden={!selected} tabIndex={hasControls ? undefined : 0}>
    <div className="sidebar-tab-content">{children}</div>
  </div>;
}

export default Tabs;
