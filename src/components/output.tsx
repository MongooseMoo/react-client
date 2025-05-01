import { announce } from "@react-aria/live-announcer";
import "./output.css";
import React from "react";
import { parseToElements } from "../ansiParser";
import MudClient from "../client";
import ReactDOMServer from "react-dom/server";
import DOMPurify from 'dompurify';
import { setInputText } from '../InputStore';
import TurndownService from 'turndown'; // <-- Import TurndownService

interface Props {
  client: MudClient;
  focusInput?: () => void; // Add optional prop to focus the input
}

interface State {
  output: JSX.Element[];
  sidebarVisible: boolean;
  newLinesCount: number; // Added to track the count of new lines
}

// Add a small threshold for scroll calculations to handle browser differences
const SCROLL_THRESHOLD = 2; 

class Output extends React.Component<Props, State> {
  outputRef: React.RefObject<HTMLDivElement> = React.createRef();
  static MAX_OUTPUT_LENGTH = 7500; // Maximum number of messages to display in the output
  static LOCAL_STORAGE_KEY = "outputLog"; // Key for saving output in LocalStorage
  messageKey: number = 0;
  // Add a TurndownService instance (can be reused)
  turndownService = new TurndownService({headingStyle: 'atx', emDelimiter: '*'});

  constructor(props: Props) {
    super(props);
    this.state = {
      output: this.loadOutput(),
      sidebarVisible: false,
      newLinesCount: 0,
    };
  }

  saveOutput = () => {
    const outputHtml = this.state.output.map((element) => {
      // Ensure it's a valid element with props and children before rendering children
      if (React.isValidElement(element) && element.props && element.props.children) {
        // Render only the children to static markup
        return ReactDOMServer.renderToStaticMarkup(element.props.children);
      }
      // Fallback for unexpected element types (though unlikely)
      return "";
    }).filter(html => html !== ""); // Filter out any empty strings from fallbacks
    localStorage.setItem(Output.LOCAL_STORAGE_KEY, JSON.stringify(outputHtml));
  };

  loadOutput = () => {
    const savedOutput = localStorage.getItem(Output.LOCAL_STORAGE_KEY);
    if (savedOutput) {
      try { // Add try-catch for robust JSON parsing
        const outputContentHtml = JSON.parse(savedOutput) as string[];
        return outputContentHtml.map((htmlString: string, index: number) => // Add index for key
          // Recreate the wrapper div with a key and set innerHTML to the saved content
          React.createElement("div", {
            key: `loaded-${index}`, // Add a unique key using the index
            dangerouslySetInnerHTML: { __html: htmlString },
          })
        );
      } catch (error) {
        console.error("Failed to parse saved output log:", error);
        localStorage.removeItem(Output.LOCAL_STORAGE_KEY); // Clear corrupted data
        return []; // Return empty array on error
      }
    }
    return [];
  };

  addCommand = (command: string) => {
    this.addToOutput([
      <span className="command" aria-live="off">
        {command}
      </span>,
    ], false);
  };

  addError = (error: Error) =>
    this.addToOutput([<h2> Error: {error.message}</h2>]);

  handleConnected = () => this.addToOutput([<h2> Connected</h2>]);

  handleDisconnected = () => {
    this.addToOutput([<h2> Disconnected</h2>]);
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
    // Check if the output length has increased
    if (this.state.output.length > prevState.output.length) {
      // If the user hasn't scrolled to the bottom, increase the newLinesCount
      if (!this.isScrolledToBottom()) {
        this.setState({
          newLinesCount:
            this.state.newLinesCount +
            (this.state.output.length - prevState.output.length),
        });
      } else {
        // Reset newLinesCount if already at the bottom
        this.setState({ newLinesCount: 0 });
      }
    }

    this.saveOutput(); // Save output to LocalStorage whenever it updates
    this.addCopyButtons(); // Add copy buttons to new blockquotes
  }

  // Method to add copy buttons to blockquotes that don't have them yet
  addCopyButtons = () => {
    const outputDiv = this.outputRef.current;
    if (!outputDiv) return;

    const blockquotes = outputDiv.querySelectorAll('blockquote:not(:has(.blockquote-copy-button))');

    blockquotes.forEach(blockquote => {
      const button = document.createElement('button');
      button.classList.add('blockquote-copy-button');
      button.textContent = 'Copy';
      // Removed aria-label as button text is sufficient
      button.setAttribute('type', 'button'); // Good practice for buttons not submitting forms

      // Ensure the blockquote itself can contain the absolutely positioned button
      // This might already be handled by CSS, but setting it here ensures it
      if (window.getComputedStyle(blockquote).position === 'static') {
         blockquote.style.position = 'relative';
      }

      blockquote.appendChild(button);
    });
  }


  handleScroll = () => {
    if (this.isScrolledToBottom()) {
      this.setState({ newLinesCount: 0 });
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
  }

  componentWillUnmount() {
    const { client } = this.props;
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

  addToOutput(elements: React.ReactNode[], shouldAnnounce: boolean = true) {
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

    this.setState((state) => {
      // Increment messageKey *inside* the map to ensure uniqueness for each element
      const newOutput = elements.map((element) => (
        <div key={this.messageKey++}>{element}</div>
      ));
      // this.messageKey is already incremented in the map
      const combinedOutput = [...state.output, ...newOutput];
      const trimmedOutput = combinedOutput.slice(-Output.MAX_OUTPUT_LENGTH);
      return { output: trimmedOutput };
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
    this.addToOutput(elements);
  };

  handleHtml = (html: string) => {
    const clean = DOMPurify.sanitize(html);
    const e = <div style={{ whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: clean }}></div>;
    this.addToOutput([e]);
  }

  handleExitClick = (exit: string) => {
    this.props.client.sendCommand(exit);
  };

  // --- Modified Method to handle both data-text links and copy buttons ---
  handleDataTextClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const targetElement = event.target as HTMLElement;

    // --- Handle Blockquote Copy Button Clicks ---
    const copyButton = targetElement.closest('.blockquote-copy-button');
    if (copyButton instanceof HTMLButtonElement) {
      event.preventDefault(); // Prevent any default button behavior
      event.stopPropagation(); // Stop the event from bubbling further

      const blockquote = copyButton.closest('blockquote');
      if (blockquote) {
        // Clone the blockquote to avoid modifying the live DOM
        const clonedBlockquote = blockquote.cloneNode(true) as HTMLElement;
        // Find and remove the button *from the clone*
        const buttonInClone = clonedBlockquote.querySelector('.blockquote-copy-button');
        if (buttonInClone) {
          buttonInClone.remove();
        }

        let textToCopy: string;
        const contentType = blockquote.dataset.contentType; // Check for data-content-type

        // Check if the content type is markdown
        if (contentType === 'text/markdown') {
          // Get the inner HTML of the clone (without the button)
          const htmlContent = clonedBlockquote.innerHTML;
          // Convert HTML to Markdown using Turndown
          textToCopy = this.turndownService.turndown(htmlContent);
        } else {
          // Default behavior: Get text content from the clone
          textToCopy = clonedBlockquote.textContent || '';
        }

        navigator.clipboard.writeText(textToCopy.trim())
          .then(() => {
            // Visual feedback: Change text, add class, then revert (targets the original button)
            copyButton.textContent = 'Copied!';
            copyButton.classList.add('copied');
            setTimeout(() => {
              copyButton.textContent = 'Copy';
              copyButton.classList.remove('copied');
            }, 1500); // Revert after 1.5 seconds
          })
          .catch(err => {
            console.error('Failed to copy text: ', err);
            // Optional: Provide error feedback to the user
            copyButton.textContent = 'Error';
             setTimeout(() => {
              copyButton.textContent = 'Copy';
            }, 1500);
          });
      }
      return; // Stop processing here if it was a copy button click
    }

    // --- Handle data-text link clicks (existing logic) ---
    const linkElement = targetElement.closest('a.command[data-text]');
    if (linkElement instanceof HTMLAnchorElement) {
      event.preventDefault();

      // Get the text from the data-text attribute
      const commandText = linkElement.dataset.text; // Use dataset for data-* attributes

      if (commandText !== undefined && commandText !== null) {
        // Dispatch the action to update the input store
        setInputText(commandText);
        // Attempt to focus the input field via the passed-in function
        this.props.focusInput?.();
      }
    }
    // NOTE: This handler *only* deals with data-text links.
    // Other click handling (like exits or the scroll-to-bottom button)
    // remains separate as per the request to avoid unrelated changes.
  };
  // --- End New Method ---

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
    this.setState({ output: [] });
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

  render() {
    var classname = "output";
    if (this.state.sidebarVisible) {
      classname += " sidebar-visible";
    }

    const newLinesText = `${this.state.newLinesCount} new ${this.state.newLinesCount === 1 ? "message" : "messages"
      }`;

    return (
      <div
        ref={this.outputRef}
        className={classname}
        onScroll={this.handleScroll}
        onClick={this.handleDataTextClick} // Add the click handler here
      >
        {this.state.output}
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
