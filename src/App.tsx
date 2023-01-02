import React from 'react';
import logo from './logo.svg';
import './App.css';
import OutputWindow from './components/output';
import MudClient from './client';
import CommandInput from './components/input';

const client = new MudClient('mongoose.moo.mud.org', 7654);
client.connect()

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

      </header>
      <OutputWindow client={client} />
      <CommandInput onSend={(text: string) => client.sendCommand(text)} />
    </div>
  );
}

export default App;
