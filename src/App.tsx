import React from "react";

import "./App.css";
import OutputWindow from "./components/output";
import MudClient from "./client";
import CommandInput from "./components/input";
import {
    GMCPCore,
    GMCPCoreSupports,
    GMCPClientMedia,
    GMCPClientWebRTC,
} from "./gmcp";
import { McpAwnsStatus } from "./mcp";

const client = new MudClient("mongoose.moo.mud.org", 8765);
client.registerGMCPPackage(GMCPCore);
client.registerGMCPPackage(GMCPClientMedia);
client.registerGMCPPackage(GMCPCoreSupports);
client.registerGMCPPackage(GMCPClientWebRTC);
client.registerMcpPackage(McpAwnsStatus);
client.connect();

function App() {
    return (
        <div className="App">
            <header className="App-header"></header>
            <OutputWindow client={client} />
            <CommandInput onSend={(text: string) => client.sendCommand(text)} />
        </div>
    );
}

export default App;
