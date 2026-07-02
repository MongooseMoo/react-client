import type React from 'react';
import { useState } from 'react';
import type MudClient from '../client';
import { McpAwnsJtext, McpAwnsServerInfo } from '../mcp';
import { useServerLinksStore } from '../stores/serverLinksStore';
import { isSafeUrl } from '../isSafeUrl';
import './ServerLinksPanel.css';

interface ServerLinksPanelProps {
  client: MudClient;
}

function openUrl(url: string): void {
  // Server-controlled URL: refuse non-http(s)/mailto schemes (javascript:, data:, ...).
  if (!isSafeUrl(url)) {
    console.warn('[ServerLinksPanel] Blocked unsafe URL:', url);
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

const ServerLinksPanel: React.FC<ServerLinksPanelProps> = ({ client }) => {
  const homeUrl = useServerLinksStore((state) => state.homeUrl);
  const helpUrl = useServerLinksStore((state) => state.helpUrl);
  const recentUrls = useServerLinksStore((state) => state.recentUrls);
  const clearRecentUrls = useServerLinksStore((state) => state.clearRecentUrls);
  const serverInfoPackage = client.mcpSession.packageHandlers['dns-com-awns-serverinfo'];
  const jtextPackage = client.mcpSession.packageHandlers['dns-com-awns-jtext'];
  const canRefresh = serverInfoPackage instanceof McpAwnsServerInfo;
  const canPickJtext = jtextPackage instanceof McpAwnsJtext;
  const [jtextType, setJtextType] = useState('');
  const [jtextArgs, setJtextArgs] = useState('');

  return (
    <section className="server-links-panel" aria-labelledby="server-links-heading">
      <div className="panel-heading-row">
        <h4 id="server-links-heading">Server Links</h4>
        <button
          type="button"
          onClick={() => {
            if (serverInfoPackage instanceof McpAwnsServerInfo) {
              serverInfoPackage.requestServerInfo();
            }
          }}
          disabled={!canRefresh}
        >
          Refresh
        </button>
      </div>

      <div className="server-link-actions">
        <button type="button" onClick={() => openUrl(homeUrl)} disabled={!homeUrl}>
          Home
        </button>
        <button type="button" onClick={() => openUrl(helpUrl)} disabled={!helpUrl}>
          Help
        </button>
      </div>

      <div className="server-links-section">
        <h5>JText</h5>
        <form
          className="jtext-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (jtextPackage instanceof McpAwnsJtext && jtextType && jtextArgs) {
              jtextPackage.pick(jtextType, jtextArgs);
            }
          }}
        >
          <label>
            <span>Type</span>
            <input
              type="text"
              value={jtextType}
              onChange={(event) => setJtextType(event.target.value)}
              disabled={!canPickJtext}
            />
          </label>
          <label>
            <span>Args</span>
            <input
              type="text"
              value={jtextArgs}
              onChange={(event) => setJtextArgs(event.target.value)}
              disabled={!canPickJtext}
            />
          </label>
          <button type="submit" disabled={!canPickJtext || !jtextType || !jtextArgs}>
            Open
          </button>
        </form>
      </div>

      <div className="server-links-section">
        <div className="panel-heading-row">
          <h5>Recent URLs</h5>
          <button type="button" onClick={clearRecentUrls} disabled={recentUrls.length === 0}>
            Clear
          </button>
        </div>
        {recentUrls.length === 0 ? (
          <p>No server-sent URLs yet.</p>
        ) : (
          <ul>
            {recentUrls.map((entry) => (
              <li key={entry.id}>
                <button type="button" onClick={() => openUrl(entry.url)}>
                  {entry.url}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default ServerLinksPanel;
