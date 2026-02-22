import React, { useState } from 'react';

interface JoinDialogProps {
    onJoin: (roomId: string) => void;
}

const JoinDialog: React.FC<JoinDialogProps> = ({ onJoin }) => {
    const [roomInput, setRoomInput] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = roomInput.trim();
        if (!trimmed) {
            setError('Please enter a room ID');
            return;
        }
        setError('');
        onJoin(trimmed);
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            backgroundColor: '#0a0a1a'
        }}>
            <form onSubmit={handleSubmit} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '32px',
                backgroundColor: '#1a1a2e',
                borderRadius: '8px',
                border: '1px solid #333'
            }}>
                <h2 style={{ color: '#ccc', margin: 0, fontSize: '18px' }}>Join Session</h2>
                <input
                    type="text"
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value)}
                    placeholder="Enter room ID"
                    autoFocus
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#0a0a1a',
                        border: '1px solid #555',
                        borderRadius: '4px',
                        color: '#ccc',
                        fontSize: '16px',
                        width: '300px'
                    }}
                />
                {error && <span style={{ color: '#ff6b6b', fontSize: '13px' }}>{error}</span>}
                <button type="submit" style={{
                    padding: '8px 16px',
                    backgroundColor: '#4fc3f7',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#000',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                }}>
                    Connect
                </button>
            </form>
        </div>
    );
};

export default JoinDialog;
