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
          {users.map((player) => {
            let classes = "";
            if (player.away) classes += " away";
            if (player.idle) classes += " idle";
            return (
              <UserContextMenu key={player.Object} user={player} client={client}>
                <li 
                  className={classes}
                  role="option"
                  tabIndex={0}
                  aria-label={`${player.Name}${player.away ? ' (away)' : ''}${player.idle ? ' (idle)' : ''}`}
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
