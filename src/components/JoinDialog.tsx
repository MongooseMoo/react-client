import { useEffect, useRef, useState } from 'react';
import './JoinDialog.css';

interface JoinDialogProps {
    onJoin: (roomId: string) => void;
    initialRoomId?: string;
    connecting?: boolean;
    connectionError?: string;
}

export default function JoinDialog({ onJoin, initialRoomId = '', connecting = false, connectionError = '' }: JoinDialogProps) {
    const [roomInput, setRoomInput] = useState(initialRoomId);
    const [validationError, setValidationError] = useState('');
    const [editedSinceFailure, setEditedSinceFailure] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const error = validationError || (!editedSinceFailure ? connectionError : '');

    useEffect(() => {
        if (connectionError) {
            setEditedSinceFailure(false);
            inputRef.current?.focus();
        }
    }, [connectionError]);

    return (
        <section className="join-startup" aria-labelledby="join-title">
            <form className="join-card" onSubmit={event => {
                event.preventDefault();
                if (connecting) return;
                const trimmed = roomInput.trim();
                if (!trimmed) {
                    setValidationError('Enter a room ID.');
                    inputRef.current?.focus();
                    return;
                }
                setValidationError('');
                onJoin(trimmed);
            }}>
                <h2 id="join-title">Join Session</h2>
                <label htmlFor="join-room-id">Room ID</label>
                <input id="join-room-id" ref={inputRef} type="text" value={roomInput}
                    readOnly={connecting} autoFocus aria-invalid={!!error}
                    aria-describedby={error ? 'join-error' : undefined}
                    onChange={event => {
                        setRoomInput(event.currentTarget.value);
                        setValidationError('');
                        setEditedSinceFailure(true);
                    }} />
                {error && <p id="join-error" className="join-error">{error}</p>}
                <button type="submit" aria-disabled={connecting}>Connect</button>
                <p role="status">{connecting ? 'Connecting…' : ''}</p>
            </form>
        </section>
    );
}
