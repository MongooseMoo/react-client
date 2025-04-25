import React from "react";
import "./userlist.css";
import AccessibleList from "./AccessibleList"; // Import the new component
import { UserlistPlayer } from "../mcp";

export interface UserlistProps {
    users: UserlistPlayer[];
}

// Map UserlistPlayer to the structure expected by AccessibleList
// Ensure UserlistPlayer has a unique 'id' property or adapt AccessibleList/mapping
// For now, assuming 'Object' can serve as a unique ID. If not, this needs adjustment.
const mapUserToListItem = (user: UserlistPlayer) => ({
    ...user,
    id: user.Object, // Use 'Object' as the unique ID
});

const Userlist: React.FC<UserlistProps> = ({ users }) => {

    const listItems = users.map(mapUserToListItem);

    const renderUserItem = (player: UserlistPlayer, index: number, isSelected: boolean) => {
        let status = "Online";
        if (player.away) { status = "Away"; }
        if (player.idle) { if (status === "Online") { status = "Idle"; } else { status += " + Idle"; } }

        return (
            <>
                {player.Name}
                <span className="sr-only">&nbsp;{`(${status})`}</span>
            </>
        );
    };

    const getUserItemClassName = (player: UserlistPlayer, index: number, isSelected: boolean): string => {
        let classes = "userlist-item"; // Base class for styling
        if (player.away) { classes += " away"; }
        if (player.idle) { classes += " idle"; }
        // 'selected' class is handled by AccessibleList now
        // if (isSelected) classes += " selected";
        return classes;
    };

    const getUserTextValue = (player: UserlistPlayer): string => {
        return player.Name ? player.Name.toLowerCase() : '';
    };

    return (
        <>
            <div className="sidebar-header" id="userlist-header" aria-hidden="true">
                Connected Players
            </div>
            <div className="sidebar"> {/* Keep sidebar for overall layout */}
                <div className="sidebar-content"> {/* Keep sidebar-content for padding/scrolling */}
                    <AccessibleList
                        items={listItems}
                        renderItem={renderUserItem}
                        listId="userlist" // Unique ID for this list instance
                        labelledBy="userlist-header"
                        className="userlist-accessible-container" // Optional: for specific styling
                        itemClassName={getUserItemClassName}
                        getItemTextValue={getUserTextValue}
                    />
                </div>
            </div>
        </>
  );
};

export default Userlist;
