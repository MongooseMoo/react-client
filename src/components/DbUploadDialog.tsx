import React, { useCallback, useRef, useState } from 'react';

interface DbUploadDialogProps {
    onDbSelected: (data: ArrayBuffer) => void;
}

const DbUploadDialog: React.FC<DbUploadDialogProps> = ({ onDbSelected }) => {
    const [dragOver, setDragOver] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((file: File) => {
        setError('');
        setLoading(true);
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result instanceof ArrayBuffer) {
                onDbSelected(reader.result);
            } else {
                setError('Failed to read file');
                setLoading(false);
            }
        };
        reader.onerror = () => {
            setError('Failed to read file');
            setLoading(false);
        };
        reader.readAsArrayBuffer(file);
    }, [onDbSelected]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleUseDefault = async () => {
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/wasm/Minimal.db');
            if (!res.ok) throw new Error('Failed to fetch default database: ' + res.status);
            const data = await res.arrayBuffer();
            onDbSelected(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load default database');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                backgroundColor: '#0a0a1a',
                color: '#ccc',
                fontSize: '16px'
            }}>
                Loading database...
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            backgroundColor: '#0a0a1a'
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                padding: '32px',
                backgroundColor: '#1a1a2e',
                borderRadius: '8px',
                border: '1px solid #333',
                maxWidth: '420px',
                width: '100%'
            }}>
                <h2 style={{ color: '#ccc', margin: 0, fontSize: '18px' }}>
                    Host a MOO Server
                </h2>
                <p style={{ color: '#888', margin: 0, fontSize: '13px' }}>
                    Upload a .db file to host, or use the default database.
                </p>
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        border: `2px dashed ${dragOver ? '#4fc3f7' : '#555'}`,
                        borderRadius: '6px',
                        padding: '24px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: dragOver ? 'rgba(79, 195, 247, 0.05)' : 'transparent',
                        transition: 'border-color 0.2s, background-color 0.2s'
                    }}
                >
                    <div style={{ color: '#ccc', fontSize: '14px', marginBottom: '4px' }}>
                        Drop a .db file here
                    </div>
                    <div style={{ color: '#666', fontSize: '12px' }}>
                        or click to browse
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".db,.DB"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                </div>
                {error && <span style={{ color: '#ff6b6b', fontSize: '13px' }}>{error}</span>}
                <div style={{ textAlign: 'center' }}>
                    <button
                        onClick={handleUseDefault}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#4fc3f7',
                            cursor: 'pointer',
                            fontSize: '13px',
                            textDecoration: 'underline',
                            padding: '4px'
                        }}
                    >
                        Use default database (Minimal.db)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DbUploadDialog;
