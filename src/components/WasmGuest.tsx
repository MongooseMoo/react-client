import React, { useCallback, useRef, useState } from 'react';
import MudClient from '../client';
import { createConfiguredClient } from '../createConfiguredClient';
import JoinDialog from './JoinDialog';

interface WasmGuestProps {
    roomId: string | null;
    onClientReady: (client: MudClient) => void;
}

const WasmGuest: React.FC<WasmGuestProps> = ({ roomId, onClientReady }) => {
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [connectionError, setConnectionError] = useState('');
    const connectedRef = useRef(false);

    const connectToRoom = useCallback(async (targetRoomId: string) => {
        if (connectedRef.current) return;
        connectedRef.current = true;
        setConnecting(true);
        setConnectionError('');

        try {
            console.log('[WebRTC] Joining room:', targetRoomId);
            const [{ PeerService }, { GuestStream }] = await Promise.all([
                import('../PeerService'),
                import('../GuestStream')
            ]);
            const peerSvc = new PeerService();
            try {
                const conn = await peerSvc.joinSession(targetRoomId);
                const guestStream = new GuestStream(conn);

                const newClient = createConfiguredClient();
                newClient.registerCleanup(() => peerSvc.destroy());
                newClient.connectLocal(guestStream);
                console.log('[WebRTC] Connected to host');
                onClientReady(newClient);
                setConnected(true);
            } catch (err) {
                peerSvc.destroy();
                throw err;
            }
        } catch (err) {
            console.error('[WebRTC] Failed to join session:', err);
            connectedRef.current = false;
            setConnectionError('Could not join this session. Check the room ID or try again.');
        } finally {
            setConnecting(false);
        }
    }, [onClientReady]);

    // Auto-connect if roomId was provided via URL
    React.useEffect(() => {
        if (roomId && !connectedRef.current) {
            connectToRoom(roomId);
        }
    }, [roomId, connectToRoom]);

    if (!connected) {
        return <JoinDialog onJoin={connectToRoom} initialRoomId={roomId || ''}
            connecting={connecting} connectionError={connectionError} />;
    }

    return null;
};

export default WasmGuest;
