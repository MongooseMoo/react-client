import React, { useState, useRef } from "react";
import "./input.css";

type SendFunction = (text: string) => void;

type Props = {
  onSend: SendFunction;
};

const CommandInput = ({ onSend }: Props) => {
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend(input);
      setInput("");
      setCommandHistory([...commandHistory, input]);
      setHistoryIndex(commandHistory.length + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex > 0) {
        setHistoryIndex((prevHistoryIndex) => {
          setInput(commandHistory[prevHistoryIndex - 1]);
          return prevHistoryIndex - 1;
        });
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex < commandHistory.length) {
        setHistoryIndex((prevHistoryIndex) => {
          setInput(commandHistory[prevHistoryIndex]);
          return prevHistoryIndex + 1;
        });
      }
    }
  };

  return (
    <textarea
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={handleKeyDown}
      ref={inputRef}
      autoFocus
    />
  );
};

export default CommandInput;
