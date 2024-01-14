import "./imagewindow.css";

import { UserlistPlayer } from "../mcp";

export interface UserlistProps {
  users: UserlistPlayer[];
}

const Userlist: React.FC<UserlistProps> = ({ users }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header" role="heading" aria-level={2}>
        ROOM NAME
      </div>
      <div className="sidebar-content">
        <ul>
          {users.map((player) => {
            let classes = "";
            if (player.away) classes += " away";
            if (player.idle) classes += " idle";
            return (
              <li className={classes} key={player.Object}>
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
