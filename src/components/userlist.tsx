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
        <ul 
          role="listbox"
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault();
              e.stopPropagation();
              
              const currentElement = document.activeElement as HTMLElement;
              const currentIndex = currentElement?.getAttribute('data-index');
              
              if (currentIndex !== null) {
                const idx = parseInt(currentIndex);
                let nextIndex: number;
                
                if (e.key === 'ArrowDown') {
                  nextIndex = idx === users.length - 1 ? 0 : idx + 1;
                } else {
                  nextIndex = idx === 0 ? users.length - 1 : idx - 1;
                }
                
                const nextElement = document.querySelector(`[data-index="${nextIndex}"]`) as HTMLElement;
                if (nextElement) {
                  nextElement.focus();
                }
              }
            }
          }}
        >
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
