import React, { useState, useRef } from "react";
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
    <div
      className="sidebar"
      ref={containerRef}
      tabIndex={0}
      role="listbox"
      aria-label="Connected Players"
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
    >
      <div className="sidebar-header" role="heading" aria-level={2}>
        Connected Players
      </div>
      <div className="sidebar-content">
        <ul>
          {users.map((player, index) => {
            let classes = "";
            if (player.away) classes += " away";
            if (player.idle) classes += " idle";
            if (index === selectedIndex) classes += " selected";
            return (
              <li
                className={classes}
                key={player.Object}
                role="option"
                aria-selected={index === selectedIndex}
              >
                {player.Name}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Userlist;
