import React from "react";
import MudClient from "../client";

export interface StatusbarProps {
  client: MudClient;
}

interface State {
  statusText: string;
}

class Statusbar extends React.Component<StatusbarProps, State> {
  constructor(props: StatusbarProps) {
    super(props);
    this.state = {
      statusText: "Not connected"
    };

    props.client.on("statustext", (text: string) => this.setState({statusText: text}));
    props.client.on("connect", () => this.setState({statusText: "Connected"}));
    props.client.on("disconnect", () => this.setState({statusText: "Disconnected"}));
  }

  render() {
    return (
      <div className="statusbar">
        {this.state.statusText}
      </div>
    );
  }
}

export default Statusbar;
