import "./userlist.css";
import { UserlistPlayer } from "../mcp";
import { UserContextMenu } from "./UserContextMenu";
import MudClient from "../client";

export interface UserlistProps {
  users: UserlistPlayer[];
  client: MudClient;
}

const Userlist: React.FC<UserlistProps> = ({ users, client }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header" role="heading" aria-level={2}>
        Connected Players
      </div>
      <div className="sidebar-content">
        <ul role="listbox">
          {users.map((player, index) => {
            let classes = "";
            if (player.away) classes += " away";
            if (player.idle) classes += " idle";
            return (
              <UserContextMenu key={player.Object} user={player} client={client}>
                <li 
                  className={classes}
                  role="option"
                  tabIndex={0}
                  data-index={index}
                  aria-label={`${player.Name}${player.away ? ' (away)' : ''}${player.idle ? ' (idle)' : ''}`}
                  onContextMenu={(e) => e.preventDefault()}
                  onKeyDown={(e) => {
                    // Prevent default for all arrow keys to stop scrolling
                    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                      e.preventDefault();
                      
                      if (e.key === 'ArrowDown') {
                        const nextIndex = index === users.length - 1 ? 0 : index + 1;
                        const nextElement = document.querySelector(`[data-index="${nextIndex}"]`) as HTMLElement;
                        nextElement?.focus();
                      }
                      if (e.key === 'ArrowUp') {
                        const prevIndex = index === 0 ? users.length - 1 : index - 1;
                        const prevElement = document.querySelector(`[data-index="${prevIndex}"]`) as HTMLElement;
                        prevElement?.focus();
                      }
                    }
                  }}
                >
                  {player.Name}
                </li>
              </UserContextMenu>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Userlist;
