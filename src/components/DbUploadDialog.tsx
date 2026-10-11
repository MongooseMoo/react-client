import { useRef, useState } from 'react';
import './DbUploadDialog.css';

interface DbUploadDialogProps {
    onDbSelected: (data: ArrayBuffer) => void | Promise<void>;
}

export default function DbUploadDialog({ onDbSelected }: DbUploadDialogProps) {
    const [dragOver, setDragOver] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const pending = useRef(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadDatabase = async (read: () => Promise<ArrayBuffer>) => {
        if (pending.current) return;
        pending.current = true;
        setError('');
        setLoading(true);
        try {
            await onDbSelected(await read());
        } catch (failure) {
            const detail = failure instanceof Error ? failure.message : 'Could not load the database.';
            setError(detail + ' Choose a database or try again.');
        } finally {
            pending.current = false;
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const readFile = (file: File) => loadDatabase(() => new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => reader.result instanceof ArrayBuffer
            ? resolve(reader.result) : reject(new Error('Could not read the file.'));
        reader.onerror = () => reject(new Error('Could not read the file.'));
        reader.readAsArrayBuffer(file);
    }));

    return (
        <section className="database-startup" aria-labelledby="database-title">
            <div className="database-card">
                <h2 id="database-title">Host a MOO Server</h2>
                <p>Choose a .db file to host, or use the default database.</p>
                <div className={'database-drop-zone' + (dragOver ? ' drag-over' : '')}
                    onDragOver={event => { event.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={event => {
                        event.preventDefault();
                        setDragOver(false);
                        const file = event.dataTransfer.files[0];
                        if (file) void readFile(file);
                    }}>
                    <p>Drop a .db file here</p>
                    <button type="button" aria-disabled={loading}
                        onClick={() => { if (!pending.current) fileInputRef.current?.click(); }}>
                        Choose database
                    </button>
                    <input ref={fileInputRef} type="file" accept=".db,.DB" hidden
                        onChange={event => { const file = event.currentTarget.files?.[0]; if (file) void readFile(file); }} />
                </div>
                <button type="button" aria-disabled={loading} onClick={() => void loadDatabase(async () => {
                    const response = await fetch('/wasm/Minimal.db');
                    if (!response.ok) throw new Error('Could not load the default database.');
                    return response.arrayBuffer();
                })}>Use default database (Minimal.db)</button>
                <p role="status">{loading ? 'Loading database…' : ''}</p>
                {error && <p role="alert" className="database-error">{error}</p>}
            </div>
        </section>
    );
}
