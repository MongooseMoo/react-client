import React from 'react';

interface HostPanelProps {
    roomId: string | null;
    guestCount: number;
}

const HostPanel: React.FC<HostPanelProps> = ({ roomId, guestCount }) => {
    if (!roomId) return null;

    const copyRoomId = () => {
        const url = `${window.location.origin}/?mode=join&room=${roomId}`;
        navigator.clipboard.writeText(url);
    };

    const resetUrl = (() => {
        const url = new URL(window.location.href);
        url.searchParams.set('reset', '1');
        return url.toString();
    })();

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            backgroundColor: '#1a1a2e',
            borderBottom: '1px solid #333',
            fontSize: '13px',
            color: '#ccc'
        }}>
            <span>Room:</span>
            <code style={{ color: '#4fc3f7', userSelect: 'all' }}>{roomId}</code>
            <button
                onClick={copyRoomId}
                style={{
                    background: 'none',
                    border: '1px solid #555',
                    color: '#ccc',
                    padding: '2px 8px',
                    cursor: 'pointer',
                    borderRadius: '3px',
                    fontSize: '12px'
                }}
            >
                Copy
            </button>
            <a
                href={resetUrl}
                style={{ color: '#888', fontSize: '12px', marginLeft: '8px' }}
                title="Reset database to original state"
            >
                Reset DB
            </a>
            <span style={{ marginLeft: 'auto', color: '#888' }}>
                {guestCount} guest{guestCount !== 1 ? 's' : ''} connected
            </span>
        </div>
    );
};

export default HostPanel;
