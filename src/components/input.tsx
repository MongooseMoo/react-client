import type React from "react";
import { useRef, useEffect, useCallback } from "react";
import { CommandHistory } from "../CommandHistory";
import "./input.css";
import { useInputStore } from "../stores/inputStore";
import { useRoomStore } from "../stores/roomStore";
import { registerCommandInput } from "../inputFocus";
import type MudClient from "../client"; // Import MudClient
import type { RoomPlayer } from "../gmcp/Room"; // Import RoomPlayer type

type SendFunction = (text: string) => void;

type Props = {
  onSend: SendFunction;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  client?: MudClient;
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
    const namePart = word.substring(1);
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

const CommandInput = ({ onSend, inputRef }: Props) => {
  const commandHistoryRef = useRef(new CommandHistory());
  const text = useInputStore((s) => s.text);

  // Refs for tab completion state
  const completionCandidatesRef = useRef<string[]>([]);
  const completionIndexRef = useRef<number>(0);
  // Stores the full word (e.g., "-Da", "David") that initiated the current completion sequence
  const completionActiveOriginalWordRef = useRef<string | null>(null); 

  // Load saved history on component mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const savedHistory = JSON.parse(saved);
      if (!Array.isArray(savedHistory)) {
        throw new Error('command history is not an array');
      }
      // Replay the commands into CommandHistory (skip non-string entries defensively)
      savedHistory.forEach((cmd: unknown) => {
        if (typeof cmd === 'string') {
          commandHistoryRef.current.addCommand(cmd);
        }
      });
    } catch (e) {
      console.warn('Failed to load command history:', e);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Register input ref with InputStore for focus functionality
  useEffect(() => {
    registerCommandInput(inputRef);
  }, [inputRef]);

  // Save history when commands are added
  const saveHistory = useCallback(() => {
    try {
      // Get direct access to the history array
      const history = commandHistoryRef.current.getHistory();
      // Save only up to MAX_HISTORY commands
      const trimmedHistory = history.slice(-MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
    } catch (e) {
      console.warn('Failed to save command history:', e);
    }
  }, []);

  const resetCompletionState = useCallback(() => {
    completionCandidatesRef.current = [];
    completionIndexRef.current = 0;
    completionActiveOriginalWordRef.current = null; // Reset active original word
  }, []);

  const handleSend = useCallback(() => {
    const currentInput = text;
    onSend(currentInput);
    if (currentInput.trim()) {
      commandHistoryRef.current.addCommand(currentInput);
      saveHistory();
    }
    useInputStore.getState().clear();
    inputRef.current?.focus();
    resetCompletionState();
  }, [text, onSend, inputRef, resetCompletionState, saveHistory]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const commandHistory = commandHistoryRef.current;
    const currentInputText = text;
    const textArea = inputRef.current;
    const isPlainAlt = e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey;

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
        const activeCompletion = completionCandidatesRef.current[completionIndexRef.current];
        isCycling = currentWord === activeCompletion;
      }

      if (isCycling) { // We are cycling
        completionIndexRef.current = (completionIndexRef.current + 1) % completionCandidatesRef.current.length;
        const completedName = completionCandidatesRef.current[completionIndexRef.current];

        const newText = currentInputText.substring(0, wordStartIndex) + completedName + currentInputText.substring(cursorPos);
        useInputStore.getState().setText(newText);
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
        
        const visibleCommandCandidates =
          wordStartIndex === 0 && initialLeadingPunctuation === "" && !currentWord.startsWith('"')
            ? useInputStore
                .getState()
                .visibleCommands.filter((command) =>
                  command.toLowerCase().startsWith(initialNamePart.toLowerCase()),
                )
            : [];

        const roomPlayersData: RoomPlayer[] = useRoomStore.getState().roomPlayers;
        const playerCandidates = roomPlayersData
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
          })
          .map((player) => initialLeadingPunctuation + quoteNameIfNeeded(player.name));
        const completionCandidates = [
          ...new Set([...visibleCommandCandidates, ...playerCandidates]),
        ];

        if (completionCandidates.length > 0) {
          completionActiveOriginalWordRef.current = currentWord; // Store the word that initiated this sequence
          completionCandidatesRef.current = completionCandidates;
          completionIndexRef.current = 0;
          const completedName = completionCandidates[0];
          
          const newText = currentInputText.substring(0, wordStartIndex) + completedName + currentInputText.substring(cursorPos);
          useInputStore.getState().setText(newText);
          const newCursorPos = wordStartIndex + completedName.length;
          requestAnimationFrame(() => textArea.setSelectionRange(newCursorPos, newCursorPos));
        } else {
          // No candidates found, ensure state is reset (already done at the start of this block)
        }
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (isPlainAlt && (
      e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight" ||
      "ijklwasdchtnoe,".includes(e.key.toLowerCase()) ||
      "IJKLWASDCHTNOE".split("").some(c => e.code === `Key${c}`) || e.code === "Comma"
    )) {
      e.preventDefault();
    } else if (isPlainAlt && e.code === "Space") {
      e.preventDefault();
    } else if (e.key === "ArrowUp" && !e.altKey) {
      e.preventDefault();
      const prevCommand = commandHistory.navigateUp(currentInputText);
      useInputStore.getState().setText(prevCommand);
      resetCompletionState();
    } else if (e.key === "ArrowDown" && !e.altKey) {
      e.preventDefault();
      const nextCommand = commandHistory.navigateDown(currentInputText);
      useInputStore.getState().setText(nextCommand);
      resetCompletionState();
    } else {
      // For other keys that might change the text (like Backspace, Delete, or character input)
      // we reset the completion state. The onChange handler will also catch this.
      // Non-text-altering keys (Shift, Ctrl, Alt) won't reset here.
      if (e.key.length === 1 || e.key === "Backspace" || e.key === "Delete") {
        resetCompletionState();
      }
    }
  }, [text, inputRef, resetCompletionState, handleSend]); // Added handleSend and resetCompletionState

  return (
    <div className="command-input-container">
      <textarea
        value={text}
        onChange={(e) => {
          useInputStore.getState().setText(e.target.value);
          // If user types, reset tab completion state.
          // This ensures that typing new characters clears any ongoing completion.
          resetCompletionState();
        }}
        onKeyDown={handleKeyDown}
        id="command-input"
        ref={inputRef}
        autoFocus
      />
      <button type="button" onClick={handleSend} className="send-button">
        Send
      </button>
    </div>
  );
};

export default CommandInput;
