// Input Component for MUD client
// Supports command history with arrows

import React, { useState, useEffect, useRef } from 'react';


type SendFunction = (text: string) => void;

type Props = {
    onSend: SendFunction;
};

const CommandInput = (props: Props) => {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const inputRef = useRef(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            props.onSend(input);
            setInput('');
            setHistory([...history, input]);
            setHistoryIndex(history.length);
        } else if (e.key === 'ArrowUp') {
            if (historyIndex > 0) {
                setHistoryIndex(historyIndex - 1);
                setInput(history[historyIndex - 1]);
            }
        } else if (e.key === 'ArrowDown') {
            if (historyIndex < history.length) {
                setHistoryIndex(historyIndex + 1);
                setInput(history[historyIndex + 1]);
            }
        }
    };

    return (
        <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e)}
            ref={inputRef}
            autoFocus
        />
    );
};

export default CommandInput;
