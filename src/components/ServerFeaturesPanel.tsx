import type React from 'react';
import type MudClient from '../client';
import CommandList from './CommandList';
import ServerLinksPanel from './ServerLinksPanel';
import WorldMapPanel from './WorldMapPanel';
import './ServerFeaturesPanel.css';

interface ServerFeaturesPanelProps {
  client: MudClient;
}

const ServerFeaturesPanel: React.FC<ServerFeaturesPanelProps> = ({ client }) => (
  <div className="server-features-panel">
    <ServerLinksPanel client={client} />
    <CommandList client={client} />
    <WorldMapPanel client={client} />
  </div>
);

export default ServerFeaturesPanel;
