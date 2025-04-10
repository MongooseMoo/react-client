import React, { useRef, useEffect, useCallback } from "react";
import { CommandHistory } from "../CommandHistory";
import "./input.css";
import { useInputStore } from "../hooks/useInputStore";
import { InputActionType, setInputText, clearInputText } from "../InputStore";

type SendFunction = (text: string) => void;

type Props = {
  onSend: SendFunction;
  inputRef: React.RefObject<HTMLTextAreaElement>;
};

const STORAGE_KEY = 'command_history';
const MAX_HISTORY = 1000;

const CommandInput = ({ onSend, inputRef }: Props) => {
  const commandHistoryRef = useRef(new CommandHistory());
  const [inputState, dispatch] = useInputStore();

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
    try {
      // Get direct access to the history array
      const history = commandHistoryRef.current.getHistory();
      // Save only up to MAX_HISTORY commands
      const trimmedHistory = history.slice(-MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
    } catch (e) {
      console.warn('Failed to save command history:', e);
    }
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const commandHistory = commandHistoryRef.current;
    const currentInput = inputState.text;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevCommand = commandHistory.navigateUp(currentInput);
      setInputText(prevCommand);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextCommand = commandHistory.navigateDown(currentInput);
      setInputText(nextCommand);
    }
  }, [inputState.text]);

  const handleSend = useCallback(() => {
    const currentInput = inputState.text;
    if (currentInput.trim()) {
      onSend(currentInput);
      commandHistoryRef.current.addCommand(currentInput);
      saveHistory();
      clearInputText();
      inputRef.current?.focus();
    }
  }, [inputState.text, onSend, inputRef]);

  return (
    <div className="command-input-container">
      <textarea
        value={inputState.text}
        onChange={(e) => setInputText(e.target.value)}
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
