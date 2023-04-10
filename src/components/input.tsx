import React, { useState, useRef } from "react";
import "./input.css";

type SendFunction = (text: string) => void;

type Props = {
  onSend: SendFunction;
};

const CommandInput = (props: Props) => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [initialInput, setInitialInput] = useState("");
  const inputRef = useRef(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      props.onSend(input);
      setInput("");
      setHistory([...history, input]);
      setHistoryIndex(history.length);
      setInitialInput("");
    } else if (e.key === "ArrowUp") {
      if (historyIndex > 0) {
        if (historyIndex === history.length) {
          setInitialInput(input);
          setHistory([...history, input]);
        }
        setHistoryIndex((prevHistoryIndex) => {
          setInput(history[prevHistoryIndex - 1]);
          return prevHistoryIndex - 1;
        });
      }
    } else if (e.key === "ArrowDown") {
      if (historyIndex < history.length) {
        setHistoryIndex((prevHistoryIndex) => {
          setInput(
            prevHistoryIndex + 1 === history.length
              ? initialInput
              : history[prevHistoryIndex + 1]
          );
          if (prevHistoryIndex + 1 === history.length) {
            setHistory(history.slice(0, history.length - 1));
          }
          return prevHistoryIndex + 1;
        });
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
