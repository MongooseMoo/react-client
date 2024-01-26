import "./output.css";
import React from 'react';
import { parseToElements } from "../ansiParser";
import MudClient from "../client";
import ReactDOMServer from "react-dom/server";

interface Props {
  client: MudClient;
}

interface State {
  output: JSX.Element[];
  sidebarVisible: boolean;
  newLinesCount: number;  // Added to track the count of new lines
}

class Output extends React.Component<Props, State> {
  outputRef: React.RefObject<HTMLDivElement> = React.createRef();
  static MAX_OUTPUT_LENGTH = 5000; // Maximum number of messages to display in the output
  static LOCAL_STORAGE_KEY = 'outputLog'; // Key for saving output in LocalStorage

  state = {
    output: [],
    sidebarVisible: false,
    newLinesCount: 0,  // Initialize newLinesCount in the state

  };

  constructor(props: Props) {
    super(props);
    this.loadOutput(); // Load saved output from LocalStorage
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

  saveOutput = () => {
    const outputHtml = this.state.output.map(element => ReactDOMServer.renderToStaticMarkup(element));
    localStorage.setItem(Output.LOCAL_STORAGE_KEY, JSON.stringify(outputHtml));
  };

  loadOutput = () => {
    const savedOutput = localStorage.getItem(Output.LOCAL_STORAGE_KEY);
    if (savedOutput) {
      const outputElements = JSON.parse(savedOutput).map((htmlString: string) => React.createElement('div', { dangerouslySetInnerHTML: { __html: htmlString } }));
      this.setState({ output: outputElements });
    }
  };

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

  getSnapshotBeforeUpdate(prevProps: Props, prevState: State) {
    // Check if the user is scrolled to the bottom before the update
    if (this.outputRef.current) {
      const output = this.outputRef.current;
      return output.scrollHeight - output.scrollTop <= output.clientHeight;
    }
    return null;
  }

  componentDidUpdate(prevProps: Props, prevState: State, wasScrolledToBottom: boolean | null) {
    // If the snapshot indicates the user was at the bottom, scroll to the bottom
    if (wasScrolledToBottom) {
      this.scrollToBottom();
    }
    // Check if the output length has increased
    if (this.state.output.length > prevState.output.length) {
      // If the user hasn't scrolled to the bottom, increase the newLinesCount
      if (!this.isScrolledToBottom()) {
        this.setState({
          newLinesCount: this.state.newLinesCount + (this.state.output.length - prevState.output.length),
        });
      } else {
        // Reset newLinesCount if already at the bottom
        this.setState({ newLinesCount: 0 });
      }
    }

    this.saveOutput();  // Save output to LocalStorage whenever it updates
  }


  handleScroll = () => {
    if (this.isScrolledToBottom()) {
      this.setState({ newLinesCount: 0 });
    }
  };


  isScrolledToBottom = () => {
    const output = this.outputRef.current;
    if (!output) return false;

    // Check if the scroll is at the bottom
    return output.scrollHeight - output.scrollTop <= output.clientHeight + 1; // +1 for potential rounding issues
  }


  handleScrollToBottom = () => {
    this.scrollToBottom();
    this.setState({ newLinesCount: 0 }); // Reset the counter after scrolling
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
      // Enforce the maximum output length
      const combinedOutput = [...state.output, ...newOutput];
      const trimmedOutput = combinedOutput.slice(-Output.MAX_OUTPUT_LENGTH);
      return { output: trimmedOutput };
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

    const newLinesText = `${this.state.newLinesCount} new ${this.state.newLinesCount === 1 ? 'message' : 'messages'}`;

    return (
      <div
        ref={this.outputRef}
        className={classname}
        onScroll={this.handleScroll}
        aria-live="polite"
        role="log"
      >
        {this.state.output}
        {this.state.newLinesCount > 0 && (
          <div className="new-lines-notification" onClick={this.handleScrollToBottom} role="button" aria-live="off">
            {newLinesText}
          </div>
        )}
      </div>
    );
  }
}

export default Output;
