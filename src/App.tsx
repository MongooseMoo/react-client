import React from "react";
import { useBeforeunload } from "react-beforeunload";
import "./App.css";
import OutputWindow from "./components/output";
import MudClient from "./client";
import CommandInput from "./components/input";
import { GMCPCore, GMCPCoreSupports, GMCPClientMedia, GMCPCommLiveKit, GMCPCommChannel } from "./gmcp";
import { McpAwnsPing, McpAwnsStatus, McpSimpleEdit, McpVmooUserlist } from "./mcp";
import Toolbar from "./components/toolbar";
import Statusbar from "./components/statusbar";
import Userlist from "./components/userlist";
import AudioChat from "./components/audioChat";

const client = new MudClient("mongoose.moo.mud.org", 8765);
client.registerGMCPPackage(GMCPCore);
client.registerGMCPPackage(GMCPClientMedia);
client.registerGMCPPackage(GMCPCoreSupports);
client.registerGMCPPackage(GMCPCommChannel);
client.registerGMCPPackage(GMCPCommLiveKit);
client.registerMcpPackage(McpAwnsStatus);
client.registerMcpPackage(McpSimpleEdit);
client.registerMcpPackage(McpVmooUserlist);
client.registerMcpPackage(McpAwnsPing);
client.connect();
client.requestNotificationPermission();

function App() {
  const outRef = React.useRef<OutputWindow | null>(null);
  const saveLog = () => {
    if (outRef.current) {
      outRef.current.saveLog();
    }
  };

  const clearLog = () => {
    if (outRef.current) {
      outRef.current.clearLog();
    }
  };

  const userlistRef = React.useRef<Userlist | null>(null);
  const toggleUsers = () => {
    userlistRef.current?.toggle();
  };

  useBeforeunload((event) => {
    client.shutdown();
  });

  return (
    <div className="App">
      <header className="App-header"></header>
      <Toolbar onSaveLog={saveLog} onClearLog={clearLog} onToggleUsers={toggleUsers} />
      <div>
        <OutputWindow client={client} ref={outRef} />
        <Userlist client={client} />
        <AudioChat client={client} />
      </div>
      <CommandInput onSend={(text: string) => client.sendCommand(text)} />
      <Statusbar client={client} />
    </div>
  );
}

export default App;
