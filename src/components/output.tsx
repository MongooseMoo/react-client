import { announce } from "@react-aria/live-announcer";
import "./output.css";
import React from "react";
import { parseToElements } from "../ansiParser";
import MudClient from "../client";
import ReactDOMServer from "react-dom/server";
import DOMPurify from 'dompurify';
import { setInputText } from '../InputStore';
import TurndownService from 'turndown'; // <-- Import TurndownService
import { preferencesStore } from '../PreferencesStore'; // Import preferences store
import BlockquoteWithCopy from './BlockquoteWithCopy';

export enum OutputType {
  Command = 'command',
  ServerMessage = 'serverMessage',
  SystemInfo = 'systemInfo',
  ErrorMessage = 'errorMessage',
}

export interface OutputLine {
  id: number; // Unique key for React list
  type: OutputType;
  content: JSX.Element; // The actual JSX to render for this line
  sourceType: string; // Track what created this message
  sourceContent: string; // Store original input data
  metadata?: Record<string, any>; // Optional additional data
}

// For storing in localStorage
interface SavedOutputLine {
  type: OutputType;
  sourceType: string; // 'ansi' | 'html' | 'command' | 'system' | 'error'
  sourceContent: string; // Original input data
  metadata?: Record<string, any>; // Optional additional data
}

interface StoredOutputLog {
  version: number;
  lines: SavedOutputLine[];
}

const OUTPUT_LOG_VERSION = 2;

interface Props {
  client: MudClient;
  focusInput?: () => void; // Add optional prop to focus the input
}

interface State {
  liveOutput: OutputLine[]; // Only the last LIVE_WINDOW_SIZE lines (React-managed)
  sidebarVisible: boolean;
  newLinesCount: number; // Added to track the count of new lines
  localEchoActive: boolean; // To store the current local echo preference
  focusedLineIndex: number | null; // Index of currently focused line for keyboard navigation
}

// Add a small threshold for scroll calculations to handle browser differences
const SCROLL_THRESHOLD = 2;

class Output extends React.Component<Props, State> {
  outputRef: React.RefObject<HTMLDivElement> = React.createRef();
  private frozenRef: React.RefObject<HTMLDivElement> = React.createRef();
  static MAX_OUTPUT_LENGTH = 3000; // Maximum number of messages to keep
  static LIVE_WINDOW_SIZE = 200; // Number of lines React manages (rest are frozen HTML)
  static LOCAL_STORAGE_KEY = "outputLog"; // Key for saving output in LocalStorage
  messageKey: number = 0;
  private unsubscribePrefs: (() => void) | undefined;
  // Add a TurndownService instance (can be reused)
  turndownService = new TurndownService({headingStyle: 'atx', emDelimiter: '*'});

  // Full output history (NOT in React state — avoids O(N) reconciliation)
  private allLines: OutputLine[] = [];
  // How many lines have been rendered into the frozen container
  private frozenCount: number = 0;
  // Total lines ever added (monotonically increasing, survives trimming)
  private totalLinesAdded: number = 0;
  private prevTotalLinesAdded: number = 0;

  constructor(props: Props) {
    super(props);
    this.allLines = this.loadOutput();
    this.totalLinesAdded = this.allLines.length;
    this.prevTotalLinesAdded = this.allLines.length;
    this.state = {
      liveOutput: this.allLines.slice(-Output.LIVE_WINDOW_SIZE),
      sidebarVisible: false,
      newLinesCount: 0,
      localEchoActive: preferencesStore.getState().general.localEcho,
      focusedLineIndex: null,
    };
  }

  handlePreferencesChange = () => {
    this.setState({
      localEchoActive: preferencesStore.getState().general.localEcho,
    });
  };

  saveOutput = () => {
    const linesToSave: SavedOutputLine[] = this.allLines.map((line: OutputLine) => {
      return {
        type: line.type,
        sourceType: line.sourceType,
        sourceContent: line.sourceContent,
        metadata: line.metadata,
      };
    }).filter(savedLine => savedLine.sourceContent !== ""); // Filter out lines that ended up empty

    const storedLog: StoredOutputLog = {
      version: OUTPUT_LOG_VERSION,
      lines: linesToSave,
    };
    localStorage.setItem(Output.LOCAL_STORAGE_KEY, JSON.stringify(storedLog));
  };

  // Helper method to re-create content from source data
  recreateContentFromSource = (savedLine: SavedOutputLine): React.ReactElement[] => {
    switch (savedLine.sourceType) {
      case 'ansi':
        return parseToElements(savedLine.sourceContent, this.handleExitClick);

      case 'html':
        // Re-process through handleHtml logic
        const clean = DOMPurify.sanitize(savedLine.sourceContent);
        const parser = new DOMParser();
        const doc = parser.parseFromString(clean, 'text/html');
        const blockquotes = doc.querySelectorAll('blockquote');

        if (blockquotes.length > 0) {
          const elements: React.ReactElement[] = [];
          const bodyElement = doc.body;
          let currentContent = '';

          Array.from(bodyElement.childNodes).forEach((node, index) => {
            if (node.nodeName === 'BLOCKQUOTE') {
              if (currentContent.trim()) {
                elements.push(
                  <div
                    key={`content-${index}`}
                    style={{ whiteSpace: "normal" }}
                    dangerouslySetInnerHTML={{ __html: currentContent }}
                  />
                );
                currentContent = '';
              }

              const blockquoteElement = node as HTMLElement;
              const contentType = blockquoteElement.getAttribute('data-content-type') || undefined;

              elements.push(
                <BlockquoteWithCopy
                  key={`blockquote-${index}`}
                  contentType={contentType}
                >
                  {blockquoteElement.innerHTML}
                </BlockquoteWithCopy>
              );
            } else {
              if (node.nodeType === Node.ELEMENT_NODE) {
                currentContent += (node as HTMLElement).outerHTML;
              } else if (node.nodeType === Node.TEXT_NODE) {
                currentContent += node.textContent || '';
              }
            }
          });

          if (currentContent.trim()) {
            elements.push(
              <div
                key="remaining-content"
                style={{ whiteSpace: "normal" }}
                dangerouslySetInnerHTML={{ __html: currentContent }}
              />
            );
          }

          return elements;
        } else {
          return [<div style={{ whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: clean }}></div>];
        }

      case 'command':
        return [
          <span className="command" aria-live="off">
            {savedLine.sourceContent}
          </span>
        ];

      case 'error':
        return [<h2> Error: {savedLine.sourceContent}</h2>];

      case 'system':
        return [<h2> {savedLine.sourceContent}</h2>];

      default:
        console.warn(`Unknown sourceType: ${savedLine.sourceType}, falling back to text display`);
        return [<span>{savedLine.sourceContent}</span>];
    }
  };

  loadOutput = (): OutputLine[] => {
    const savedOutputString = localStorage.getItem(Output.LOCAL_STORAGE_KEY);
    if (savedOutputString) {
      try {
        const parsedData = JSON.parse(savedOutputString);

        // Check for new versioned format
        if (parsedData && typeof parsedData === 'object' && 'version' in parsedData && 'lines' in parsedData) {
          const storedLog = parsedData as StoredOutputLog;
          if (storedLog.version === OUTPUT_LOG_VERSION) {
            // Re-process source data through handlers to recreate proper React components
            return storedLog.lines.map((savedLine: SavedOutputLine): OutputLine => {
              const currentKey = this.messageKey++;
              const recreatedElements = this.recreateContentFromSource(savedLine);

              // Create the wrapper div with the recreated content
              const wrappedContent = recreatedElements.length === 1 ?
                recreatedElements[0] :
                <>{recreatedElements}</>;

              return {
                id: currentKey,
                type: savedLine.type,
                content: <div key={currentKey} className={`output-line output-line-${savedLine.type}`}>{wrappedContent}</div>,
                sourceType: savedLine.sourceType,
                sourceContent: savedLine.sourceContent,
                metadata: savedLine.metadata
              };
            });
          } else {
            // Clear old incompatible data
            console.warn(`Unsupported log version: ${storedLog.version}. Clearing old data.`);
            localStorage.removeItem(Output.LOCAL_STORAGE_KEY);
            return [];
          }
        } else {
          // Clear old format data
          console.log("Clearing old format output log.");
          localStorage.removeItem(Output.LOCAL_STORAGE_KEY);
          return [];
        }
      } catch (error) {
        console.error("Failed to parse saved output log:", error);
        localStorage.removeItem(Output.LOCAL_STORAGE_KEY); // Clear corrupted data
        return []; // Return empty array on error
      }
    }
    return [];
  };

  addCommand = (command: string) => {
    this.addToOutput(
      [
        <span className="command" aria-live="off">
          {command}
        </span>,
      ],
      OutputType.Command, // Specify type
      false,
      'command',
      command
    );
  };

  addError = (error: Error) =>
    this.addToOutput([<h2> Error: {error.message}</h2>], OutputType.ErrorMessage, true, 'error', error.message);

  handleConnected = () => this.addToOutput([<h2> Connected</h2>], OutputType.SystemInfo, true, 'system', 'Connected');

  handleDisconnected = () => {
    this.addToOutput([<h2> Disconnected</h2>], OutputType.SystemInfo, true, 'system', 'Disconnected');
    this.setState({ sidebarVisible: false });
  };

  handleUserList = (players: any) =>
    this.setState({ sidebarVisible: !!players });

getSnapshotBeforeUpdate(prevProps: Props, prevState: State) {
    // Check if the user is scrolled to the bottom before the update

if (this.outputRef.current) { const output = this.outputRef.current; return this.isScrolledToBottom();
// Use the same check method consistently
 } return null; }

componentDidUpdate(
    prevProps: Props,
    prevState: State,
    wasScrolledToBottom: boolean | null
  ) {
    // If the snapshot indicates the user was at the bottom, scroll to the bottom
    if (wasScrolledToBottom) {
      this.scrollToBottom();
    }

    // Freeze overflow lines into the static HTML container
    this.freezeOverflow();

    // Track new lines for the "N new messages" notification
    const newLineCount = this.totalLinesAdded - this.prevTotalLinesAdded;
    this.prevTotalLinesAdded = this.totalLinesAdded;

    if (newLineCount > 0) {
      const newLines = this.allLines.slice(-newLineCount);
      const visibleNewLinesCount = newLines.filter(
        line => this.state.localEchoActive || line.type !== OutputType.Command
      ).length;

      if (visibleNewLinesCount > 0) {
        if (!this.isScrolledToBottom()) {
          this.setState(state => ({
            newLinesCount: state.newLinesCount + visibleNewLinesCount,
          }));
        } else if (this.state.newLinesCount !== 0) {
          // Only reset if it's not already 0 (avoids double-render)
          this.setState({ newLinesCount: 0 });
        }
      }
    }

    this.saveOutput(); // Save output to LocalStorage whenever it updates
  }

  /**
   * Render overflow lines from allLines into the frozen HTML container.
   * Lines in the frozen container are static HTML — React doesn't touch them.
   */
  private freezeOverflow() {
    const frozenDiv = this.frozenRef.current;
    if (!frozenDiv) return;

    // How many lines should be frozen (everything not in the live window)
    const shouldBeFrozen = Math.max(0, this.allLines.length - Output.LIVE_WINDOW_SIZE);

    // Freeze new lines
    while (this.frozenCount < shouldBeFrozen) {
      const line = this.allLines[this.frozenCount];
      const wrapper = document.createElement('div');
      wrapper.className = `output-line output-line-${line.type}`;
      wrapper.innerHTML = ReactDOMServer.renderToStaticMarkup(line.content);
      frozenDiv.appendChild(wrapper);
      this.frozenCount++;
    }
  }

  /**
   * Remove old lines from the front of the frozen container.
   */
  private trimFrozen(count: number) {
    const frozenDiv = this.frozenRef.current;
    if (!frozenDiv) return;
    const toRemove = Math.min(count, frozenDiv.childNodes.length);
    for (let i = 0; i < toRemove; i++) {
      if (frozenDiv.firstChild) {
        frozenDiv.removeChild(frozenDiv.firstChild);
      }
    }
    this.frozenCount = Math.max(0, this.frozenCount - count);
  }


  handleScroll = () => {
    if (this.isScrolledToBottom()) {
      if (this.state.newLinesCount !== 0) {
        this.setState({ newLinesCount: 0 });
      }
    }
  };

  isScrolledToBottom = () => { const output = this.outputRef.current; if (!output) return false;
  // Use Math.ceil to handle fractional pixels
  // Add a small threshold to account for browser differences
  const scrollBottom = Math.ceil(output.scrollHeight - output.scrollTop); const viewportHeight = Math.ceil(output.clientHeight); return scrollBottom <= viewportHeight + SCROLL_THRESHOLD; };

  handleScrollToBottom = () => {
    this.scrollToBottom();
    this.setState({ newLinesCount: 0 }); // Reset the counter after scrolling
  };

  componentDidMount() {
    const { client } = this.props;
    client.on("message", this.handleMessage);
    client.on("html", this.handleHtml);
    client.on("connect", this.handleConnected);
    client.on("disconnect", this.handleDisconnected);
    client.on("error", this.addError);
    client.on("command", this.addCommand);
    client.on("userlist", this.handleUserList);
    this.unsubscribePrefs = preferencesStore.subscribe(this.handlePreferencesChange);

    // Freeze any loaded output that exceeds the live window
    this.freezeOverflow();
  }

  componentWillUnmount() {
    const { client } = this.props;
    if (this.unsubscribePrefs) {
      this.unsubscribePrefs();
    }
    client.removeListener("message", this.handleMessage);
    client.removeListener("html", this.handleHtml);
    client.removeListener("connect", this.handleConnected);
    client.removeListener("disconnect", this.handleDisconnected);
    client.removeListener("error", this.addError);
    client.removeListener("command", this.addCommand);
    client.removeListener("userlist", this.handleUserList);
  }

  sanitizeHtml(html: string): string {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  }

  addToOutput(
    elements: React.ReactNode[],
    type: OutputType,
    shouldAnnounce: boolean = true,
    sourceType: string = 'unknown',
    sourceContent: string = '',
    metadata?: Record<string, any>
  ) {
    if (shouldAnnounce) {
      elements.forEach((element) => {
        if (React.isValidElement(element)) {
          const htmlString = ReactDOMServer.renderToString(element);
          const plainText = this.sanitizeHtml(htmlString);
          announce(plainText);
        } else if (typeof element === "string") {
          announce(element);
        }
      });
    }

    const newOutputLines: OutputLine[] = elements.map((element) => {
      const currentKey = this.messageKey++;
      return {
        id: currentKey,
        type: type,
        content: <div key={currentKey} className={`output-line output-line-${type}`}>{element}</div>,
        sourceType: sourceType,
        sourceContent: sourceContent,
        metadata: metadata
      };
    });

    // Append to full history
    this.allLines.push(...newOutputLines);
    this.totalLinesAdded += newOutputLines.length;

    // Trim if over max
    if (this.allLines.length > Output.MAX_OUTPUT_LENGTH) {
      const excess = this.allLines.length - Output.MAX_OUTPUT_LENGTH;
      this.allLines.splice(0, excess);
      this.trimFrozen(excess);
    }

    // Only put the tail into React state — React reconciles O(LIVE_WINDOW_SIZE) not O(N)
    this.setState({
      liveOutput: this.allLines.slice(-Output.LIVE_WINDOW_SIZE),
    });
  }

scrollToBottom = () => { const output = this.outputRef.current; if (output) {
// Use requestAnimationFrame to ensure DOM updates are complete
 requestAnimationFrame(() => { output.scrollTop = output.scrollHeight; }); } };
  handleMessage = (message: string) => {
    if (!message) {
      return;
    }
    const elements = parseToElements(message, this.handleExitClick);
    this.addToOutput(elements, OutputType.ServerMessage, true, 'ansi', message);
  };

  handleHtml = (html: string) => {
    const clean = DOMPurify.sanitize(html);

    // Parse the cleaned HTML to detect blockquotes
    const parser = new DOMParser();
    const doc = parser.parseFromString(clean, 'text/html');
    const blockquotes = doc.querySelectorAll('blockquote');

    if (blockquotes.length > 0) {
      // If we have blockquotes, we need to process them individually
      const elements: React.ReactElement[] = [];

      // Split content around blockquotes
      const bodyElement = doc.body;
      let currentContent = '';

      Array.from(bodyElement.childNodes).forEach((node, index) => {
        if (node.nodeName === 'BLOCKQUOTE') {
          // Add any accumulated content before this blockquote
          if (currentContent.trim()) {
            elements.push(
              <div
                key={`content-${index}`}
                style={{ whiteSpace: "normal" }}
                dangerouslySetInnerHTML={{ __html: currentContent }}
              />
            );
            currentContent = '';
          }

          // Add the blockquote with copy functionality
          const blockquoteElement = node as HTMLElement;
          const contentType = blockquoteElement.getAttribute('data-content-type') || undefined;

          elements.push(
            <BlockquoteWithCopy
              key={`blockquote-${index}`}
              contentType={contentType}
            >
              {blockquoteElement.innerHTML}
            </BlockquoteWithCopy>
          );
        } else {
          // Accumulate non-blockquote content
          if (node.nodeType === Node.ELEMENT_NODE) {
            currentContent += (node as HTMLElement).outerHTML;
          } else if (node.nodeType === Node.TEXT_NODE) {
            currentContent += node.textContent || '';
          }
        }
      });

      // Add any remaining content
      if (currentContent.trim()) {
        elements.push(
          <div
            key="remaining-content"
            style={{ whiteSpace: "normal" }}
            dangerouslySetInnerHTML={{ __html: currentContent }}
          />
        );
      }

      this.addToOutput(elements, OutputType.ServerMessage, true, 'html', html);
    } else {
      // No blockquotes, use original logic
      const e = <div style={{ whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: clean }}></div>;
      this.addToOutput([e], OutputType.ServerMessage, true, 'html', html);
    }
  }

  handleExitClick = (exit: string) => {
    this.props.client.sendCommand(exit);
  };

  // --- Combined click handler for delegated events ---
  handleOutputClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const targetElement = event.target as HTMLElement;

    // --- Handle exit link clicks (data-exit delegation) ---
    const exitLink = targetElement.closest('a.exit[data-exit]');
    if (exitLink instanceof HTMLAnchorElement) {
      event.preventDefault();
      const exitDirection = exitLink.dataset.exit;
      if (exitDirection) {
        this.props.client.sendCommand(exitDirection);
      }
      return;
    }

    // --- Handle data-text link clicks ---
    const linkElement = targetElement.closest('a.command[data-text]');
    if (linkElement instanceof HTMLAnchorElement) {
      event.preventDefault();
      const commandText = linkElement.dataset.text;
      if (commandText !== undefined && commandText !== null) {
        setInputText(commandText);
        this.props.focusInput?.();
      }
    }
  };

  saveLog() {
    const output = this.outputRef.current;
    if (output) {
      // we want to save as HTML to preserve ansi and links
      const html = output.innerHTML;
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      // include the date and time
      const date = new Date();
      const dateString = date.toLocaleDateString();
      // 24 hour time
      const timeString = date.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      // Set MUD name to window title and replace any spaces with dashes
      const mudName = document.title.replace(/\s+/g, "-");
      // Include the MUD name in the filename
      const filename = `${mudName}-log-${dateString}-${timeString}.html`;
      link.download = filename;
      link.href = url;
      link.click();
      // cleanup
      URL.revokeObjectURL(url);
      link.remove();
    }
  }

  clearLog() {
    this.allLines = [];
    this.frozenCount = 0;
    this.totalLinesAdded = 0;
    this.prevTotalLinesAdded = 0;
    const frozenDiv = this.frozenRef.current;
    if (frozenDiv) frozenDiv.innerHTML = '';
    this.setState({ liveOutput: [] });
    localStorage.removeItem(Output.LOCAL_STORAGE_KEY); // Also clear from local storage
  }

  copyLog() {
    const output = this.outputRef.current;
    if (output) {
      const textToCopy = output.innerText; // Get plain text content
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          console.log("Log copied to clipboard.");
          // Optional: Add visual feedback here if needed
        })
        .catch(err => {
          console.error('Failed to copy log: ', err);
          alert("Failed to copy log to clipboard. See console for details.");
        });
    }
  }

  /**
   * Scroll focused line into view
   */
  scrollFocusedLineIntoView = () => {
    if (this.state.focusedLineIndex === null) return;

    // Use setTimeout to ensure DOM has updated
    setTimeout(() => {
      const outputDiv = this.outputRef.current;
      if (!outputDiv) return;

      const focusedElement = outputDiv.querySelector(`[data-line-index="${this.state.focusedLineIndex}"]`);
      if (focusedElement) {
        focusedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }, 0);
  };

  /**
   * Handle keyboard navigation through output lines
   */
  handleOutputKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Suppress Alt+Arrow and Alt+letter so browser defaults
    // don't interfere with app-level keybindings
    if (e.altKey && (
      e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
      'ijklwasdchtnoe,'.includes(e.key.toLowerCase()) ||
      'IJKLWASDCHTNOE'.split('').some(c => e.code === `Key${c}`) || e.code === 'Comma'
    )) {
      e.preventDefault();
      return;
    }
    if (e.altKey && e.code === 'Space') {
      e.preventDefault();
      return;
    }

    const visibleOutput = this.state.liveOutput.filter(
      line => this.state.localEchoActive || line.type !== OutputType.Command
    );

    if (visibleOutput.length === 0) return;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const currentIndex = this.state.focusedLineIndex ?? -1;
        const nextIndex = Math.min(currentIndex + 1, visibleOutput.length - 1);
        this.setState({ focusedLineIndex: nextIndex }, () => {
          this.announceOutputLine(visibleOutput[nextIndex]);
          this.scrollFocusedLineIntoView();
        });
        break;
      }

      case 'ArrowUp': {
        e.preventDefault();
        const currentIndex = this.state.focusedLineIndex ?? visibleOutput.length;
        const prevIndex = Math.max(currentIndex - 1, 0);
        this.setState({ focusedLineIndex: prevIndex }, () => {
          this.announceOutputLine(visibleOutput[prevIndex]);
          this.scrollFocusedLineIntoView();
        });
        break;
      }

      case 'Home':
        e.preventDefault();
        this.setState({ focusedLineIndex: 0 }, () => {
          this.announceOutputLine(visibleOutput[0]);
          this.scrollFocusedLineIntoView();
        });
        break;

      case 'End':
        e.preventDefault();
        const lastIndex = visibleOutput.length - 1;
        this.setState({ focusedLineIndex: lastIndex }, () => {
          this.announceOutputLine(visibleOutput[lastIndex]);
          this.scrollFocusedLineIntoView();
        });
        break;
    }
  };

  /**
   * Announce output line to screen readers
   */
  announceOutputLine = (line: OutputLine) => {
    if (!line) return;

    // Extract text content from the JSX element
    const tempDiv = document.createElement('div');
    const html = ReactDOMServer.renderToStaticMarkup(line.content);
    tempDiv.innerHTML = html;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    // Announce to screen reader
    announce(textContent, 'polite');
  };

  /**
   * Handle focus on output area
   */
  handleOutputFocus = () => {
    // If no line is focused, start at the last line
    if (this.state.focusedLineIndex === null) {
      const visibleOutput = this.state.liveOutput.filter(
        line => this.state.localEchoActive || line.type !== OutputType.Command
      );
      if (visibleOutput.length > 0) {
        const lastIndex = visibleOutput.length - 1;
        this.setState({ focusedLineIndex: lastIndex });
      }
    }
  };

  /**
   * Handle blur on output area
   */
  handleOutputBlur = () => {
    // Optionally clear focus indicator when tabbing away
    // this.setState({ focusedLineIndex: null });
  };

  render() {
    var classname = "output";
    if (this.state.sidebarVisible) {
      classname += " sidebar-visible";
    }
    if (!this.state.localEchoActive) {
      classname += " hide-commands";
    }

    const newLinesText = `${this.state.newLinesCount} new ${this.state.newLinesCount === 1 ? "message" : "messages"
      }`;

    // Only filter + render the live window — frozen lines are static HTML
    const visibleLiveOutput = this.state.liveOutput.filter(
      line => this.state.localEchoActive || line.type !== OutputType.Command
    );

    return (
      <div
        ref={this.outputRef}
        className={classname}
        onScroll={this.handleScroll}
        onClick={this.handleOutputClick}
        onKeyDown={this.handleOutputKeyDown}
        onFocus={this.handleOutputFocus}
        onBlur={this.handleOutputBlur}
        tabIndex={0}
        aria-label="Game output log - use arrow keys to navigate"
      >
        <div ref={this.frozenRef} />
        {visibleLiveOutput.map((line, index) => (
          <div
            key={line.id}
            className={`output-line ${this.state.focusedLineIndex === index ? 'focused-line' : ''}`}
            data-line-index={index}
          >
            {line.content}
          </div>
        ))}
        {this.state.newLinesCount > 0 && (
          <div
            className="new-lines-notification"
            onClick={this.handleScrollToBottom}
            role="button"
            aria-live="off"
          >
            {newLinesText}
          </div>
        )}
      </div>
    );
  }
}

export default Output;
