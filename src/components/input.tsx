import React, { useState, useRef } from "react";
import { CommandHistory } from "../CommandHistory";
import "./input.css";

type SendFunction = (text: string) => void;

type Props = {
  onSend: SendFunction;
  inputRef: React.RefObject<HTMLTextAreaElement>;
};

const CommandInput = ({ onSend, inputRef }: Props) => {
  const [input, setInput] = useState("");
  const commandHistoryRef = useRef(new CommandHistory());

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
