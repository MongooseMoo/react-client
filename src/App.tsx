import React from "react";
import { useBeforeunload } from "react-beforeunload";
import "./App.css";
import OutputWindow from "./components/output";
import MudClient from "./client";
import CommandInput from "./components/input";
import { GMCPCore, GMCPCoreSupports, GMCPClientMedia } from "./gmcp";
import { McpAwnsStatus, McpSimpleEdit } from "./mcp";
import Toolbar from "./components/toolbar";

const client = new MudClient("mongoose.moo.mud.org", 8765);
client.registerGMCPPackage(GMCPCore);
client.registerGMCPPackage(GMCPClientMedia);
client.registerGMCPPackage(GMCPCoreSupports);
client.registerMcpPackage(McpAwnsStatus);
client.registerMcpPackage(McpSimpleEdit);
client.connect();

function App() {
  const outRef = React.useRef<OutputWindow | null>(null);
  const saveLog = () => {
    if (outRef.current) {
      outRef.current.saveLog();
    }
  };

  useBeforeunload((event) => {
    client.shutdown();
  });
  return (
    <div className="App">
      <header className="App-header"></header>
      <Toolbar onSaveLog={saveLog} />
      <OutputWindow client={client} ref={outRef} />
      <CommandInput onSend={(text: string) => client.sendCommand(text)} />
    </div>
  );
}

export default App;
