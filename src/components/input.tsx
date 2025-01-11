import React, { useState, useRef, useEffect } from "react";
import { CommandHistory } from "../CommandHistory";
import "./input.css";

type SendFunction = (text: string) => void;

type Props = {
  onSend: SendFunction;
  inputRef: React.RefObject<HTMLTextAreaElement>;
};

const STORAGE_KEY = 'command_history';
const MAX_HISTORY = 1000;

const CommandInput = ({ onSend, inputRef }: Props) => {
  const [input, setInput] = useState("");
  const commandHistoryRef = useRef(new CommandHistory());

  // Load saved history on component mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const savedHistory = JSON.parse(saved);
      // Replay the commands into CommandHistory
      savedHistory.forEach((cmd: string) => {
        commandHistoryRef.current.addCommand(cmd);
      });
    }
  }, []);

  // Save history when commands are added
  const saveHistory = () => {
    const history: string[] = [];
    let current = commandHistoryRef.current.getCurrentInput();
    while (current) {
      history.unshift(current);
      commandHistoryRef.current.navigateUp(current);
      current = commandHistoryRef.current.getCurrentInput();
    }
    // Reset the navigation
    commandHistoryRef.current.navigateDown("");
    
    // Save only up to MAX_HISTORY commands
    const trimmedHistory = history.slice(-MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const commandHistory = commandHistoryRef.current;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevCommand = commandHistory.navigateUp(input);
      setInput(prevCommand);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextCommand = commandHistory.navigateDown(input);
      setInput(nextCommand);
    }
  };

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      commandHistoryRef.current.addCommand(input);
      saveHistory();
      setInput("");
    }
  };

  return (
    <div className="command-input-container">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        id="command-input"
        ref={inputRef}
        autoFocus
      />
      <button onClick={handleSend} className="send-button">
        Send
      </button>
    </div>
  );
};

export default CommandInput;
