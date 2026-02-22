import React from 'react';

interface HostPanelProps {
    roomId: string | null;
    guestCount: number;
}

const HostPanel: React.FC<HostPanelProps> = ({ roomId, guestCount }) => {
    if (!roomId) return null;

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
    };

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
            <span style={{ marginLeft: 'auto', color: '#888' }}>
                {guestCount} guest{guestCount !== 1 ? 's' : ''} connected
            </span>
        </div>
    );
};

export default HostPanel;
