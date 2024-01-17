import "./output.css";
import React from 'react';
import { parseToElements } from "../ansiParser";
import MudClient from "../client";

interface Props {
  client: MudClient;
}

interface State {
  output: JSX.Element[];
  sidebarVisible: boolean;
}

class Output extends React.Component<Props, State> {
  outputRef: React.RefObject<HTMLDivElement> = React.createRef();

  state = {
    output: [],
    sidebarVisible: false,
  };

  constructor(props: Props) {
    super(props);
    this.props.client.on("message", this.handleMessage);
    // connect
    this.props.client.on("connect", this.handleConnected);
    // disconnect
    this.props.client.on("disconnect", this.handleDisconnected);
    // error
    this.props.client.on("error", this.addError);
    this.props.client.on("command", this.addCommand);
    this.props.client.on("userlist", this.handleUserList);
  }

  addCommand = (command: string) => {
    this.addToOutput([
      <span className="command" aria-live="off">
        {command}
      </span>,
    ]);
  }

  addError = (error: Error) =>
    this.addToOutput([<h2> Error: {error.message}</h2>])

  handleConnected = () =>
    this.addToOutput([<h2> Connected</h2>])

  handleDisconnected = () => {
    this.addToOutput([<h2> Disconnected</h2>]);
    this.setState({ sidebarVisible: false });
  }

  handleUserList = (players: any) =>
    this.setState({ sidebarVisible: !!players })


  componentDidUpdate() {
    this.scrollToBottom();
  }

  componentWillUnmount() {
    this.props.client.removeListener("message", this.handleMessage);
  }

  addToOutput(elements: React.ReactNode[]) {
    this.setState((state) => {
      // console.log("Current output length: " + state.output.length)
      const key = state.output.length;
      const newOutput = elements.map((element, index) => (
        <div key={key + index}>{element}</div>
      ));
      return { output: [...state.output, ...newOutput] };
    });
  }

  scrollToBottom = () => {
    const output = this.outputRef.current;
    if (output) {
      output.scrollTop = output.scrollHeight;
    }
  };

  handleMessage = (message: string) => {
    if (!message) {
      return;
    }
    const elements = parseToElements(message, this.handleExitClick);
    this.addToOutput(elements);
  };

  handleExitClick = (exit: string) => {
    this.props.client.sendCommand(exit);
  };

  saveLog() {
    const output = this.outputRef.current;
    if (output) {
      // we want to save as HTML to preserve ansi and links
      const html = output.innerHTML;
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      // include the date and time
      const date = new Date();
      const dateString = date.toLocaleDateString();
      // 24 hour time
      const timeString = date.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      // Set MUD name to window title and replace any spaces with dashes
      const mudName = document.title.replace(/\s+/g, "-");
      // Include the MUD name in the filename
      const filename = `${mudName}-log-${dateString}-${timeString}.html`;
      link.download = filename;
      link.href = url;
      link.click();
      // cleanup
      URL.revokeObjectURL(url);
      link.remove();
    }
  }

  clearLog() {
    this.setState({ output: [] });
  }

  render() {
    var classname = "output";
    if (this.state.sidebarVisible) {
      classname += " sidebar-visible";
    }
    return (
      <div
        ref={this.outputRef}
        className={classname}
        aria-live="polite"
        role="log"
      >
        {this.state.output}
      </div>
    );
  }
}

export default Output;
