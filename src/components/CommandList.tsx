import type React from 'react';
import type MudClient from '../client';
import { McpAwnsRehash } from '../mcp';
import { useInputStore } from '../stores/inputStore';
import './CommandList.css';

interface CommandListProps {
  client: MudClient;
}

const CommandList: React.FC<CommandListProps> = ({ client }) => {
  const visibleCommands = useInputStore((state) => state.visibleCommands);
  const rehashPackage = client.mcpSession.packageHandlers['dns-com-awns-rehash'];
  const canRefresh = rehashPackage instanceof McpAwnsRehash;

  return (
    <section className="command-list-panel" aria-labelledby="command-list-heading">
      <div className="command-list-heading-row">
        <h4 id="command-list-heading">Commands</h4>
        <button
          type="button"
          onClick={() => {
            if (rehashPackage instanceof McpAwnsRehash) {
              rehashPackage.requestCommands();
            }
          }}
          disabled={!canRefresh}
        >
          Refresh
        </button>
      </div>
      {visibleCommands.length === 0 ? (
        <p>No command list from the server yet.</p>
      ) : (
        <ul aria-label="Visible commands">
          {visibleCommands.map((command) => (
            <li key={command}>{command}</li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default CommandList;
