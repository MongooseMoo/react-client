import React, { useRef, useEffect, useCallback } from "react";
import { CommandHistory } from "../CommandHistory";
import "./input.css";
import { useInputStore } from "../hooks/useInputStore";
import { InputActionType, setInputText, clearInputText, inputStore } from "../InputStore";
import MudClient from "../client"; // Import MudClient
import { RoomPlayer } from "../gmcp/Room"; // Import RoomPlayer type

type SendFunction = (text: string) => void;

type Props = {
  onSend: SendFunction;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  client: MudClient; // Added client prop
};

const STORAGE_KEY = 'command_history';
const MAX_HISTORY = 1000;

// Helper function to quote name if needed
const quoteNameIfNeeded = (name: string): string => {
  return name.includes(" ") ? `"${name}"` : name;
};

// Helper function to parse a word for tab completion parts
const parseWordForCompletion = (word: string): { leadingPunctuation: string, namePart: string } => {
  if (word.startsWith('"')) {
    // For user input like "Dav, namePart should be Dav.
    // If the input is fully quoted like "David Miller", namePart is "David Miller".
    // The quoteNameIfNeeded will handle re-quoting the completed name.
    // Leading punctuation is considered empty as quotes handle the structure.
    let namePart = word.substring(1);
    // Don't strip trailing quote from user's partial input like "David M
    // if (namePart.endsWith('"')) { 
    //   namePart = namePart.substring(0, namePart.length - 1);
    // }
    return { leadingPunctuation: "", namePart };
  } else {
    // Matches leading non-alphanumeric, non-whitespace, non-quote characters
    const punctuationMatch = word.match(/^([^\w\s"]+)(.*)$/); 
    if (punctuationMatch) {
      return { leadingPunctuation: punctuationMatch[1], namePart: punctuationMatch[2] };
    }
    return { leadingPunctuation: "", namePart: word };
  }
};

const CommandInput = ({ onSend, inputRef, client }: Props) => {
  const commandHistoryRef = useRef(new CommandHistory());
  const [inputState, dispatch] = useInputStore();

  // Refs for tab completion state
  const completionCandidatesRef = useRef<RoomPlayer[]>([]); // Store RoomPlayer objects
  const completionIndexRef = useRef<number>(0);
  // Stores the full word (e.g., "-Da", "David") that initiated the current completion sequence
  const completionActiveOriginalWordRef = useRef<string | null>(null); 

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

  // Register input ref with InputStore for focus functionality
  useEffect(() => {
    inputStore.registerInputRef(inputRef);
  }, [inputRef]);

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

  const resetCompletionState = useCallback(() => {
    completionCandidatesRef.current = [];
    completionIndexRef.current = 0;
    completionActiveOriginalWordRef.current = null; // Reset active original word
  }, []);

  const handleSend = useCallback(() => {
    const currentInput = inputState.text;
    onSend(currentInput);
    if (currentInput.trim()) {
      commandHistoryRef.current.addCommand(currentInput);
      saveHistory();
    }
    clearInputText();
    inputRef.current?.focus();
    resetCompletionState();
  }, [inputState.text, onSend, inputRef, resetCompletionState]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const commandHistory = commandHistoryRef.current;
    const currentInputText = inputState.text;
    const textArea = inputRef.current;

    if (e.key === "Tab") {
      // e.preventDefault(); // Remove from here

      if (!textArea) return;

      // If the entire input field is empty, reset completion state and do nothing further.
      // This handles the case where Tab is pressed in a completely empty input.
      if (currentInputText === "") {
        resetCompletionState();
        return; // Allow default tab behavior if input is empty
      }
      
      // Add e.preventDefault() here, as we are now proceeding with custom tab handling
      e.preventDefault(); 

      const cursorPos = textArea.selectionStart;
      const textBeforeCursor = currentInputText.substring(0, cursorPos);
      const wordMatch = textBeforeCursor.match(/(?:[^"\s]\S*|"[^"]*"?)$/);
      const currentWord = wordMatch ? wordMatch[0] : "";
      const wordStartIndex = wordMatch ? textBeforeCursor.lastIndexOf(currentWord) : -1;

      // If tabbing on empty space with no active completion, reset and do nothing further.
      if (currentWord === "" && completionActiveOriginalWordRef.current === null) {
        resetCompletionState();
        return;
      }

      let isCycling = false;
      if (completionActiveOriginalWordRef.current !== null && completionCandidatesRef.current.length > 0) {
        const activeCyclePlayer = completionCandidatesRef.current[completionIndexRef.current];
        // Parse the original word that started this completion sequence to get its leading punctuation
        const { leadingPunctuation: activeOriginalLeadingPunctuation } = parseWordForCompletion(completionActiveOriginalWordRef.current);
        const expectedCompletedWord = activeOriginalLeadingPunctuation + quoteNameIfNeeded(activeCyclePlayer.name);
        isCycling = currentWord === expectedCompletedWord;
      }

      if (isCycling) { // We are cycling
        completionIndexRef.current = (completionIndexRef.current + 1) % completionCandidatesRef.current.length;
        const nextCandidatePlayer = completionCandidatesRef.current[completionIndexRef.current];
        
        // Re-parse the original word to get its leading punctuation for consistency
        const { leadingPunctuation: activeOriginalLeadingPunctuation } = parseWordForCompletion(completionActiveOriginalWordRef.current!);
        const baseCompletedName = quoteNameIfNeeded(nextCandidatePlayer.name);
        const completedName = activeOriginalLeadingPunctuation + baseCompletedName;

        const newText = currentInputText.substring(0, wordStartIndex) + completedName + currentInputText.substring(cursorPos);
        setInputText(newText);
        const newCursorPos = wordStartIndex + completedName.length;
        requestAnimationFrame(() => textArea.setSelectionRange(newCursorPos, newCursorPos));
      } else { // This is for initial completion or if currentWord changed (breaking the cycle)
        resetCompletionState(); // Reset before starting a new completion sequence

        const { leadingPunctuation: initialLeadingPunctuation, namePart: initialNamePart } = parseWordForCompletion(currentWord);
        
        // If, after parsing, the namePart is empty (e.g., currentWord was just "-" or ""), do not attempt to complete.
        if (initialNamePart === "") {
          // No resetCompletionState() here as it was called above, and we don't want to clear a just-started valid prefix
          return;
        }
        
        const roomPlayersData: RoomPlayer[] = client.worldData.roomPlayers || [];
        const candidatePlayers = roomPlayersData
          .filter(p => {
            const nameMatch = typeof p.name === 'string' && p.name.toLowerCase().startsWith(initialNamePart.toLowerCase());
            const fullnameWords = typeof p.fullname === 'string' ? p.fullname.toLowerCase().split(' ') : [];
            const fullnameMatch = fullnameWords.some(word => word.startsWith(initialNamePart.toLowerCase()));
            return nameMatch || fullnameMatch;
          })
          .sort((a, b) => { // Sort by name first, then fullname for tie-breaking
            const nameCompare = a.name.localeCompare(b.name);
            if (nameCompare !== 0) return nameCompare;
            return a.fullname.localeCompare(b.fullname);
          });

        if (candidatePlayers.length > 0) {
          completionActiveOriginalWordRef.current = currentWord; // Store the word that initiated this sequence
          completionCandidatesRef.current = candidatePlayers;
          completionIndexRef.current = 0;
          
          const firstCandidatePlayer = candidatePlayers[0];
          const baseCompletedName = quoteNameIfNeeded(firstCandidatePlayer.name);
          const completedName = initialLeadingPunctuation + baseCompletedName;
          
          const newText = currentInputText.substring(0, wordStartIndex) + completedName + currentInputText.substring(cursorPos);
          setInputText(newText);
          const newCursorPos = wordStartIndex + completedName.length;
          requestAnimationFrame(() => textArea.setSelectionRange(newCursorPos, newCursorPos));
        } else {
          // No candidates found, ensure state is reset (already done at the start of this block)
        }
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevCommand = commandHistory.navigateUp(currentInputText);
      setInputText(prevCommand);
      resetCompletionState();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextCommand = commandHistory.navigateDown(currentInputText);
      setInputText(nextCommand);
      resetCompletionState();
    } else {
      // For other keys that might change the text (like Backspace, Delete, or character input)
      // we reset the completion state. The onChange handler will also catch this.
      // Non-text-altering keys (Shift, Ctrl, Alt) won't reset here.
      if (e.key.length === 1 || e.key === "Backspace" || e.key === "Delete") {
        resetCompletionState();
      }
    }
  }, [inputState.text, client, inputRef, onSend, resetCompletionState, handleSend]); // Added handleSend and resetCompletionState

  return (
    <div className="command-input-container">
      <textarea
        value={inputState.text}
        onChange={(e) => {
          setInputText(e.target.value);
          // If user types, reset tab completion state.
          // This ensures that typing new characters clears any ongoing completion.
          resetCompletionState();
        }}
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
