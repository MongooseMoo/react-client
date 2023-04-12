import "./userlist.css"

import React from "react";
import MudClient from "../client";
import { UserlistPlayer } from "../mcp";

export interface Props {
  client: MudClient;
}

interface State {
  players: UserlistPlayer[];
  visible: boolean;
}

class Userlist extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      players: [],
      visible: false,
    };

    props.client.on("userlist", (players: UserlistPlayer[]) => {
      return this.setState({ players: players, visible: !!players });
    });
    props.client.on("disconnect", () => this.setState({players: []}));
  }

  render() {
    if (!this.state.visible) {
      return null;
    }
    return (
      <div className="sidebar">
        <div className="sidebar-header">Connected Players</div>
        <div className="sidebar-content">
          <ul>
            {this.state.players.map((player) => <li key={player.Object}>{player.Name}</li>)}
          </ul>
        </div>
      </div>
    );
  }
}

export default Userlist;
