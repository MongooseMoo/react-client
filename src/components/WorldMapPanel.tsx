import type React from 'react';
import type MudClient from '../client';
import { McpAwnsVisual } from '../mcp';
import { useWorldMapStore } from '../stores/worldMapStore';
import './WorldMapPanel.css';

interface WorldMapPanelProps {
  client: MudClient;
}

const WorldMapPanel: React.FC<WorldMapPanelProps> = ({ client }) => {
  const locationId = useWorldMapStore((state) => state.locationId);
  const selfId = useWorldMapStore((state) => state.selfId);
  const users = useWorldMapStore((state) => state.users);
  const rooms = useWorldMapStore((state) => state.rooms);
  const visualPackage = client.mcpSession.packageHandlers['dns-com-awns-visual'];
  const canRefresh = visualPackage instanceof McpAwnsVisual;

  const refresh = () => {
    if (!(visualPackage instanceof McpAwnsVisual)) {
      return;
    }
    visualPackage.requestSelf();
    visualPackage.requestLocation();
    visualPackage.requestUsers();
    if (locationId) {
      visualPackage.requestTopology(locationId, 2);
    }
  };

  return (
    <section className="world-map-panel" aria-labelledby="world-map-heading">
      <div className="world-map-heading-row">
        <h4 id="world-map-heading">World</h4>
        <button type="button" onClick={refresh} disabled={!canRefresh}>
          Refresh
        </button>
      </div>

      <dl className="world-map-summary">
        <div>
          <dt>You</dt>
          <dd>{selfId || 'Unknown'}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{locationId || 'Unknown'}</dd>
        </div>
      </dl>

      <section className="world-map-section" aria-labelledby="world-users-heading">
        <h5 id="world-users-heading">Online Users</h5>
        {users.length === 0 ? (
          <p>No AWNS visual user data yet.</p>
        ) : (
          <ul>
            {users.map((user) => (
              <li key={user.id}>
                <span>{user.name || user.id}</span>
                <span>{user.locationId || 'unknown'}</span>
                {user.idleSeconds !== null && <span>{user.idleSeconds}s idle</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="world-map-section" aria-labelledby="world-rooms-heading">
        <h5 id="world-rooms-heading">Nearby Rooms</h5>
        {rooms.length === 0 ? (
          <p>No topology data yet.</p>
        ) : (
          <ul>
            {rooms.map((room) => (
              <li key={room.id}>
                <span>{room.name || room.id}</span>
                <span>{room.exits || 'No exits listed'}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
};

export default WorldMapPanel;
