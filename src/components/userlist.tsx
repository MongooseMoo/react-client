import React, { useState, useRef, useEffect } from "react";
import "./userlist.css";

import { UserlistPlayer } from "../mcp";

export interface UserlistProps {
  users: UserlistPlayer[];
}

const Userlist: React.FC<UserlistProps> = ({ users }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFocus = () => {
    if (selectedIndex === -1 && users.length > 0) {
      setSelectedIndex(0);
    }
  };
  
  useEffect(() => {
    if (selectedIndex !== -1) {
      const selectedEl = document.getElementById(`userlist-option-${selectedIndex}`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (users.length === 0) return;
    if (e.key === "ArrowDown") {
      setSelectedIndex((prev) => (prev + 1) % users.length);
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((prev) => (prev - 1 + users.length) % users.length);
      e.preventDefault();
    } else if (e.key.length === 1) {
      const letter = e.key.toLowerCase();
      let startIndex = selectedIndex === -1 ? 0 : (selectedIndex + 1) % users.length;
      let foundIndex = -1;
      for (let i = 0; i < users.length; i++) {
        const idx = (startIndex + i) % users.length;
        if (users[idx].Name && users[idx].Name[0].toLowerCase() === letter) {
          foundIndex = idx;
          break;
        }
      }
      if (foundIndex !== -1) {
        setSelectedIndex(foundIndex);
        e.preventDefault();
      }
    }
  };

  return (
    <>
      <div className="sidebar-header" id="userlist-header" aria-hidden="true">
        Connected Players
      </div>
      <div
        className="sidebar"
        ref={containerRef}
        tabIndex={0}
        role="listbox"
        aria-labelledby="userlist-header"
        aria-activedescendant={selectedIndex !== -1 ? `userlist-option-${selectedIndex}` : undefined}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
      >
      <div className="sidebar-content">
        <ul role="none">
          {users.map((player, index) => {
            let classes = "";
            let status = "Online";
            if (player.away) { classes += " away"; status = "Away"; }
            if (player.idle) { classes += " idle"; if (status === "Online") { status = "Idle"; } }
            if (index === selectedIndex) classes += " selected";
            return (
              <li
                id={`userlist-option-${index}`}
                className={classes}
                key={player.Object}
                role="option"
                aria-selected={index === selectedIndex}
              >
                {player.Name}
                <span className="sr-only">&nbsp;{`(${status})`}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
    </>
  );
};

export default Userlist;
