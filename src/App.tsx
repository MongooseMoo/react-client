import React from "react";
import { useBeforeunload } from "react-beforeunload";
import "./App.css";
import OutputWindow from "./components/output";
import MudClient from "./client";
import CommandInput from "./components/input";
import { GMCPCore, GMCPCoreSupports, GMCPClientMedia } from "./gmcp";
import { McpAwnsStatus, McpSimpleEdit } from "./mcp";

const client = new MudClient("mongoose.moo.mud.org", 8765);
client.registerGMCPPackage(GMCPCore);
client.registerGMCPPackage(GMCPClientMedia);
client.registerGMCPPackage(GMCPCoreSupports);
client.registerMcpPackage(McpAwnsStatus);
client.registerMcpPackage(McpSimpleEdit);
client.connect();

function App() {
  useBeforeunload((event) => {
    client.shutdown();
  });
  return (
    <div className="App">
      <header className="App-header"></header>
      <OutputWindow client={client} />
      <CommandInput onSend={(text: string) => client.sendCommand(text)} />
    </div>
  );
}

export default App;
