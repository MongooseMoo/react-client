import React, { useEffect, useRef, useState } from 'react';
import MudClient from '../client';
import { createConfiguredClient } from '../createConfiguredClient';
import { WorkerStream } from '../WorkerStream';
import { saveCheckpoint, loadCheckpoint, deleteCheckpoint, hashDbBytes } from '../dbStorage';
import DbUploadDialog from './DbUploadDialog';
import type { MultiUserManager } from '../MultiUserManager';
import type { PeerService } from '../PeerService';

export interface WasmHostState {
    roomId: string | null;
    guestCount: number;
}

interface WasmHostProps {
    dbUrl: string | null;
    isHostMode: boolean;
    onClientReady: (client: MudClient) => void;
    onHostStateChange?: (state: WasmHostState) => void;
    /** True once App has received the client. Controls render mode. */
    clientReady?: boolean;
}

const WasmHost: React.FC<WasmHostProps> = ({ dbUrl, isHostMode, onClientReady, onHostStateChange, clientReady }) => {
    const [waitingForDb, setWaitingForDb] = useState(isHostMode && !dbUrl);
    const bootedRef = useRef(false);
    const disposedRef = useRef(false);
    const workerRef = useRef<Worker | null>(null);
    const streamRef = useRef<WorkerStream | null>(null);
    const clientRef = useRef<MudClient | null>(null);
    const peerServiceRef = useRef<PeerService | null>(null);
    const multiUserManagerRef = useRef<MultiUserManager | null>(null);
    const autoSaveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const workerMessageHandlerRef = useRef<((e: MessageEvent) => void) | null>(null);

    const cleanupWasmResources = React.useCallback(() => {
        disposedRef.current = true;

        if (autoSaveIntervalRef.current !== null) {
            clearInterval(autoSaveIntervalRef.current);
            const globalWindow = window as typeof window & {
                __wasmAutoSaveInterval?: ReturnType<typeof setInterval>;
            };
            if (globalWindow.__wasmAutoSaveInterval === autoSaveIntervalRef.current) {
                delete globalWindow.__wasmAutoSaveInterval;
            }
            autoSaveIntervalRef.current = null;
        }

        multiUserManagerRef.current?.destroy();
        multiUserManagerRef.current = null;

        peerServiceRef.current?.destroy();
        peerServiceRef.current = null;

        clientRef.current?.fileTransferManager?.cleanup();
        clientRef.current?.webRTCService?.cleanup();
        clientRef.current?.removeAllListeners();
        clientRef.current = null;

        streamRef.current?.dispose();
        streamRef.current = null;

        if (workerRef.current && workerMessageHandlerRef.current) {
            workerRef.current.removeEventListener('message', workerMessageHandlerRef.current);
        }
        workerMessageHandlerRef.current = null;

        workerRef.current?.terminate();
        const globalWindow = window as typeof window & {
            wasmWorker?: Worker;
            wasmDbKey?: string;
        };
        if (!workerRef.current || globalWindow.wasmWorker === workerRef.current) {
            delete globalWindow.wasmWorker;
        }
        delete globalWindow.wasmDbKey;
        workerRef.current = null;
    }, []);

    // Boot the WASM server with the given database bytes
    const bootWithDb = React.useCallback((dbBuffer: ArrayBuffer) => {
        if (bootedRef.current || disposedRef.current) return;
        bootedRef.current = true;
        setWaitingForDb(false);

        const worker = new Worker('/wasm-worker.js');
        const stream = new WorkerStream(worker);
        workerRef.current = worker;
        streamRef.current = stream;
        // Expose worker reference for beforeunload save
        (window as any).wasmWorker = worker;

        // Create client with all GMCP/MCP packages and connect
        const newClient = createConfiguredClient();
        clientRef.current = newClient;
        newClient.connectLocal(stream);

        // Listen for worker status messages
        const handleWorkerMessage = async (e: MessageEvent) => {
            const msg = e.data;
            if (msg.type === 'log') {
                console.log('[WASM server]', msg.data);
            } else if (msg.type === 'error') {
                console.error('[WASM error]', msg.message);
            } else if (msg.type === 'ready') {
                if (disposedRef.current) return;
                console.log('[WASM] Server is listening');
                // Start periodic auto-save (every 5 minutes)
                const autoSaveInterval = setInterval(() => {
                    worker.postMessage({ type: 'save' });
                }, 5 * 60 * 1000);
                autoSaveIntervalRef.current = autoSaveInterval;
                (window as any).__wasmAutoSaveInterval = autoSaveInterval;

                if (isHostMode) {
                    // Lazily load WebRTC modules and start hosting
                    try {
                        const [{ PeerService }, { MultiUserManager }] = await Promise.all([
                            import('../PeerService'),
                            import('../MultiUserManager')
                        ]);
                        if (disposedRef.current) return;
                        const peerSvc = new PeerService();
                        const mum = new MultiUserManager(worker);
                        peerServiceRef.current = peerSvc;
                        multiUserManagerRef.current = mum;
                        await mum.connectHost();
                        if (disposedRef.current) return;
                        const hostRoomId = await peerSvc.hostSession();
                        if (disposedRef.current) return;
                        console.log('[WebRTC] Hosting session, room:', hostRoomId);
                        onHostStateChange?.({ roomId: hostRoomId, guestCount: 0 });
                        peerSvc.onGuestConnected(async (conn) => {
                            if (disposedRef.current) return;
                            await mum.addGuest(conn);
                            const count = mum.getGuestCount();
                            onHostStateChange?.({ roomId: hostRoomId, guestCount: count });
                            conn.on('close', () => {
                                onHostStateChange?.({ roomId: hostRoomId, guestCount: mum.getGuestCount() });
                            });
                        });
                    } catch (err) {
                        if (!disposedRef.current) {
                            console.error('[WebRTC] Failed to start host session:', err);
                        }
                    }
                } else {
                    // Local mode: create a connection for the solo player
                    worker.postMessage({ type: 'remote-connect' });
                }
            } else if (msg.type === 'saved') {
                const dbKey = (window as any).wasmDbKey;
                if (dbKey && msg.data) {
                    saveCheckpoint(dbKey, new Uint8Array(msg.data))
                        .then(() => console.log('[WASM] Checkpoint saved to IndexedDB, size:', msg.data.byteLength))
                        .catch(err => console.error('[WASM] Failed to save checkpoint:', err));
                }
            }
        };
        workerMessageHandlerRef.current = handleWorkerMessage;
        worker.addEventListener('message', handleWorkerMessage);

        // Handle DB persistence: hash, check IndexedDB, and start worker
        const urlParams = new URLSearchParams(window.location.search);
        const resetParam = urlParams.get('reset');

        (async () => {
            try {
                const dbKey = await hashDbBytes(dbBuffer);
                let dbData: Uint8Array;

                if (resetParam === '1') {
                    await deleteCheckpoint(dbKey);
                    dbData = new Uint8Array(dbBuffer);
                    console.log('[WASM] Reset: using original DB, cleared saved state');
                } else {
                    const saved = await loadCheckpoint(dbKey);
                    if (saved) {
                        dbData = saved;
                        console.log('[WASM] Loaded saved checkpoint from IndexedDB');
                    } else {
                        dbData = new Uint8Array(dbBuffer);
                        console.log('[WASM] No saved state, using original DB');
                    }
                }

                (window as any).wasmDbKey = dbKey;
                console.log('[WASM] Database ready, size:', dbData.byteLength, 'key:', dbKey.slice(0, 12) + '...');
                if (!disposedRef.current) {
                    worker.postMessage({ type: 'start', dbData });
                }
            } catch (err) {
                if (!disposedRef.current) {
                    console.error('[WASM] Failed to load database:', err);
                }
            }
        })();

        // Report client ready to parent
        onClientReady(newClient);
    }, [isHostMode, onClientReady, onHostStateChange]);

    // Auto-boot when we have a dbUrl (or local mode with no dbUrl uses Minimal.db)
    useEffect(() => {
        if (bootedRef.current) return;
        if (waitingForDb) return; // Host mode with no db — wait for upload

        const fetchUrl = dbUrl || '/wasm/Minimal.db';
        console.log(`[WASM] Starting ${isHostMode ? 'host' : 'local'} mode, db:`, fetchUrl);

        fetch(fetchUrl)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch ' + fetchUrl + ': ' + res.status);
                return res.arrayBuffer();
            })
            .then((buffer) => {
                bootWithDb(buffer);
            })
            .catch((err) => {
                console.error('[WASM] Failed to fetch database:', err);
            });
    }, [dbUrl, isHostMode, waitingForDb, bootWithDb]);

    // Cleanup on unmount
    useEffect(() => {
        return cleanupWasmResources;
    }, [cleanupWasmResources]);

    // Before client is ready: show upload dialog if waiting for DB
    if (!clientReady && waitingForDb) {
        return <DbUploadDialog onDbSelected={(data) => bootWithDb(data)} />;
    }

    // WasmHost renders nothing in the grid — App.tsx renders HostPanel directly
    return null;
};

export default WasmHost;
