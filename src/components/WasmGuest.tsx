import React, { useCallback, useRef, useState } from 'react';
import MudClient from '../client';
import { createConfiguredClient } from '../createConfiguredClient';
import JoinDialog from './JoinDialog';

interface WasmGuestProps {
    roomId: string | null;
    onClientReady: (client: MudClient) => void;
}

const WasmGuest: React.FC<WasmGuestProps> = ({ roomId, onClientReady }) => {
    const [showJoinDialog, setShowJoinDialog] = useState(!roomId);
    const connectedRef = useRef(false);

    const connectToRoom = useCallback(async (targetRoomId: string) => {
        if (connectedRef.current) return;
        connectedRef.current = true;
        setShowJoinDialog(false);

        try {
            console.log('[WebRTC] Joining room:', targetRoomId);
            const [{ PeerService }, { GuestStream }] = await Promise.all([
                import('../PeerService'),
                import('../GuestStream')
            ]);
            const peerSvc = new PeerService();
            const conn = await peerSvc.joinSession(targetRoomId);
            const guestStream = new GuestStream(conn);

            const newClient = createConfiguredClient();
            newClient.connectLocal(guestStream);
            console.log('[WebRTC] Connected to host');
            onClientReady(newClient);
        } catch (err) {
            console.error('[WebRTC] Failed to join session:', err);
            connectedRef.current = false;
            setShowJoinDialog(true);
        }
    }, [onClientReady]);

    // Auto-connect if roomId was provided via URL
    React.useEffect(() => {
        if (roomId && !connectedRef.current) {
            connectToRoom(roomId);
        }
    }, [roomId, connectToRoom]);

    if (showJoinDialog) {
        return <JoinDialog onJoin={connectToRoom} />;
    }

    return null;
};

export default WasmGuest;
