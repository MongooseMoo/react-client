import { announce } from "@react-aria/live-announcer";
import "./output.css";
import React from "react";
import { parseToElements } from "../ansiParser";
import stripAnsi from "strip-ansi";
import type MudClient from "../client";
import ReactDOMServer from "react-dom/server";
import { useInputStore } from '../stores/inputStore';
import { usePreferences } from '../stores/preferencesStore'; // Import preferences store
import { useUserlistStore } from '../stores/userlistStore';
import { useConnectionStore } from '../stores/connectionStore';
import { useOutputStore, type OutputEntry } from '../stores/outputStore';
import { renderServerHtml } from './serverHtml';
import { copyBlockquoteContent } from './BlockquoteCopyButton';
import { autoLogService } from '../logging/AutoLogService';
import type { AutoLogLineType, AutoLogSourceType } from '../logging/AutoLogTypes';
import {
  loadStoredValue,
  removeStoredValue,
  saveStoredValue,
  type LocalStorageSchema,
} from "../persistence";

export enum OutputType {
  Command = 'command',
  ServerMessage = 'serverMessage',
  SystemInfo = 'systemInfo',
  ErrorMessage = 'errorMessage',
}

export interface OutputLine {
  id: number; // Unique key for React list
  type: OutputType;
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

const OUTPUT_LOG_VERSION = 2;
const outputLogSchema: LocalStorageSchema<SavedOutputLine[]> = {
  key: "outputLog",
  version: OUTPUT_LOG_VERSION,
  migrate: (data, storedVersion) => {
    if (storedVersion > OUTPUT_LOG_VERSION) {
      return undefined;
    }

    if (Array.isArray(data)) {
      return data as SavedOutputLine[];
    }

    // The pre-shared-persistence shape carried its domain version beside lines.
    if (
      storedVersion === 0 &&
      typeof data === "object" &&
      data !== null &&
      (data as { version?: unknown }).version === OUTPUT_LOG_VERSION &&
      Array.isArray((data as { lines?: unknown }).lines)
    ) {
      return (data as { lines: SavedOutputLine[] }).lines;
    }

    return undefined;
  },
};

/** Elements for a line, built fresh from its source. */
function lineElements(line: SavedOutputLine, onExitClick: (exit: string) => void): React.ReactElement[] {
  switch (line.sourceType) {
    case 'ansi':
      return parseToElements(line.sourceContent, onExitClick);

    case 'html':
      return renderServerHtml(line.sourceContent);

    case 'command':
      return [
        <span className="command" aria-live="off">
          {line.sourceContent}
        </span>
      ];

    case 'error':
      return [<span>Error: {line.sourceContent}</span>];

    case 'system':
      return [<span>{line.sourceContent}</span>];

    case 'plain':
      return [<span>{line.sourceContent}</span>];

    default:
      console.warn(`Unknown sourceType: ${line.sourceType}, falling back to text display`);
      return [<span>{line.sourceContent}</span>];
  }
}

function plainText(line: SavedOutputLine): string {
  const source = String(line.sourceContent);
  switch (line.sourceType) {
    case 'ansi':
      return stripAnsi(source);
    case 'html':
      return new DOMParser().parseFromString(source, "text/html").body.textContent || "";
    default:
      return source;
  }
}

interface OutputLineContentProps {
  line: SavedOutputLine;
  onExitClick: (exit: string) => void;
}

/**
 * Builds a line's elements from its source when it mounts. History keeps
 * source data only, never elements: a Preact element, once mounted, keeps its
 * parent from that render, so an element stored in history pins the entire
 * app tree of the render that mounted it for as long as the line lives.
 * Memoized so new lines don't re-parse the whole live window.
 */
const OutputLineContent = React.memo(({ line, onExitClick }: OutputLineContentProps) => {
  let elements: React.ReactElement[];
  try {
    elements = lineElements(line, onExitClick);
  } catch (error) {
    // One unrenderable line must not take down the rest of the output.
    console.error("Failed to render output line; showing it as plain text:", line, error);
    elements = [<span>{plainText(line)}</span>];
  }
  return (
    <div className={`output-line output-line-${line.type}`}>
      {elements.length === 1 ? elements[0] : elements}
    </div>
  );
});

interface Props {
  client: MudClient;
  focusInput?: () => void; // Add optional prop to focus the input
}

interface State {
  liveOutput: OutputLine[]; // Only the last LIVE_WINDOW_SIZE lines (React-managed)
  sidebarVisible: boolean;
  newLinesCount: number; // Added to track the count of new lines
  localEchoActive: boolean; // To store the current local echo preference
  focusedLineId: number | null; // Stable entry ID for keyboard review
  historyRevealed: boolean; // Expose beyond-cap history to the accessibility tree
  actionFeedback: string;
}

// Add a small threshold for scroll calculations to handle browser differences
const SCROLL_THRESHOLD = 2;

class Output extends React.Component<Props, State> {
  outputRef: React.RefObject<HTMLDivElement> = React.createRef();
  private frozenRef: React.RefObject<HTMLDivElement> = React.createRef();
  static MAX_OUTPUT_LENGTH = 3000; // Maximum number of messages to keep
  static LIVE_WINDOW_SIZE = 200; // Number of lines React manages (rest are frozen HTML)
  // Frozen lines beyond this stay visible but are removed from the
  // accessibility tree (aria-hidden). Screen readers pay a per-announcement
  // cost that scales with the document's accessibility-tree size: with a full
  // 3000-line buffer exposed, NVDA took multiple seconds to speak each new
  // message; capping exposure at ~1000 total lines (~50KB) restored instant
  // announcements (measured live with NVDA + Chrome, 2026-08).
  // Review commands (reviewRecentOutputLine etc.) read allLines directly and
  // are unaffected. See investigations/output-large-burst-perf.md.
  static A11Y_EXPOSED_FROZEN_LINES = 800;
  static LOCAL_STORAGE_KEY = "outputLog"; // Key for saving output in LocalStorage
  static SAVE_DEBOUNCE_MS = 500; // Coalesce bursts of server lines into one write
  messageKey: number = 0;
  private saveTimer: number | undefined;
  private unsubscribePrefs: (() => void) | undefined;
  private unsubscribeUserlist: (() => void) | undefined;
  private unsubscribeConnection: (() => void) | undefined;
  private unsubscribeOutputStore: (() => void) | undefined;
  private previousConnected = useConnectionStore.getState().connected;
  private previousSessionReady = useConnectionStore.getState().sessionReady;
  private lastOutputEntryId = 0;
  private lastFocusedOutputElement: HTMLElement | null = null;

  private recoverOutputFocus = () => {
    const held = this.lastFocusedOutputElement;
    if (!held || (held.isConnected && !held.closest('[inert]'))) return;
    this.lastFocusedOutputElement = null;
    const active = document.activeElement;
    if (active === document.body || active === held) this.outputRef.current?.focus();
  };

  // Full output history (NOT in React state — avoids O(N) reconciliation)
  private allLines: OutputLine[] = [];
  // How many lines have been rendered into the frozen container
  private frozenCount: number = 0;
  // How many frozen lines (from the front) carry aria-hidden
  private frozenHiddenCount: number = 0;
  // The container frozenCount/frozenHiddenCount describe
  private frozenContainer: HTMLDivElement | null = null;
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
      localEchoActive: usePreferences.getState().general.localEcho,
      focusedLineId: null,
      historyRevealed: false,
      actionFeedback: '',
    };
  }

  handlePreferencesChange = (localEchoActive: boolean) => {
    this.setState({ localEchoActive });
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

    // Saving is best-effort — a failed write (e.g. QuotaExceededError) must never
    // propagate out of componentDidUpdate and crash the output view.
    const result = saveStoredValue(outputLogSchema, linesToSave);
    if (result === "quota-exceeded") {
      // One recovery attempt: drop the oldest half of the persisted set and retry.
      const trimmed = linesToSave.slice(Math.floor(linesToSave.length / 2));
      saveStoredValue(outputLogSchema, trimmed);
    }
  };

  // Schedule a trailing debounced save so a burst of server lines coalesces into
  // one write instead of re-serializing the whole history on every update.
  private scheduleSave = () => {
    if (this.saveTimer !== undefined) {
      window.clearTimeout(this.saveTimer);
    }
    this.saveTimer = window.setTimeout(() => {
      this.saveTimer = undefined;
      this.saveOutput();
    }, Output.SAVE_DEBOUNCE_MS);
  };

  private cancelScheduledSave = () => {
    if (this.saveTimer !== undefined) {
      window.clearTimeout(this.saveTimer);
      this.saveTimer = undefined;
    }
  };

  /**
   * Static markup for a line, rendered from fresh elements built from its source.
   * Never pass line.content (or anything that is or will be mounted) to
   * renderToStaticMarkup: Preact vnodes are mutable, rendering one to a string
   * writes render state onto it, and a mounted line corrupted that way crashes
   * Preact when it later unmounts, losing output.
   */
  private renderLineMarkup(line: SavedOutputLine): string {
    return ReactDOMServer.renderToStaticMarkup(
      <div className={`output-line output-line-${line.type}`}>{lineElements(line, this.handleExitClick)}</div>
    );
  }

  loadOutput = (): OutputLine[] =>
    loadStoredValue(outputLogSchema, []).map((savedLine: SavedOutputLine): OutputLine => ({
      id: this.messageKey++,
      type: savedLine.type,
      sourceType: savedLine.sourceType,
      sourceContent: savedLine.sourceContent,
      metadata: savedLine.metadata,
    }));

  addCommand = (command: string) => {
    this.addToOutput(OutputType.Command, false, 'command', command);
  };

  addError = (error: Error) =>
    this.addToOutput(OutputType.ErrorMessage, true, 'error', error.message);

  handleConnected = () => this.addToOutput(OutputType.SystemInfo, true, 'system', 'Connected');

  /**
   * Away lines shown while the socket was down are provisional: once the
   * player is logged in again the server replays the authoritative copy, so
   * ours are dropped. A socket that opens without a login gets no replay, so
   * they stay until then.
   */
  private removeProvisionalLines() {
    const kept = this.allLines.filter((line) => !line.metadata?.provisional);
    if (kept.length === this.allLines.length) return;
    this.allLines = kept;
    // The removed lines can sit anywhere in the frozen container; empty it
    // and let freezeOverflow rebuild it from allLines.
    this.frozenRef.current?.replaceChildren();
    this.frozenCount = 0;
    this.frozenHiddenCount = 0;
    this.setState({
      liveOutput: this.allLines.slice(-Output.LIVE_WINDOW_SIZE),
      focusedLineId: null,
    });
  }

  handleDisconnected = () => {
    this.addToOutput(OutputType.SystemInfo, true, 'system', 'Disconnected');
    this.setState({ sidebarVisible: false });
  };

  handleUserlistVisibility = () =>
    this.setState({ sidebarVisible: useUserlistStore.getState().hasReceivedList });

  handleConnectionStateChange = () => {
    const { connected, sessionReady } = useConnectionStore.getState();
    if (sessionReady && !this.previousSessionReady) {
      this.removeProvisionalLines();
    }
    this.previousSessionReady = sessionReady;
    if (connected === this.previousConnected) return;
    this.previousConnected = connected;
    if (connected) {
      this.handleConnected();
    } else {
      this.handleDisconnected();
    }
  };

  handleOutputStoreEntries = () => {
    const entries = useOutputStore
      .getState()
      .entries.filter((entry) => entry.id > this.lastOutputEntryId);

    for (const entry of entries) {
      // Advance past the entry BEFORE handling it. If handling throws and the id
      // were not advanced, every later flush would retry the same bad entry,
      // throw again, and silently drop all output queued behind it forever.
      this.lastOutputEntryId = entry.id;
      try {
        this.handleOutputEntry(entry);
      } catch (error) {
        console.error("Failed to render output entry; showing it as plain text:", entry, error);
        this.addPlainTextFallback(entry);
      }
    }
  };

  private addPlainTextFallback(entry: OutputEntry) {
    const text =
      entry.type === "message" ? stripAnsi(entry.message)
      : entry.type === "html" ? this.sanitizeHtml(entry.html)
      : entry.type === "error" ? `Error: ${entry.error.message}`
      : entry.command;
    try {
      this.addToOutput(OutputType.ServerMessage, true, 'plain', text);
    } catch (error) {
      console.error("Plain-text fallback also failed:", entry, error);
    }
  }

  handleOutputEntry = (entry: OutputEntry) => {
    switch (entry.type) {
      case "message":
        // A provisional line that arrives after the player is logged in is stale.
        if (entry.provisional && useConnectionStore.getState().sessionReady) break;
        this.handleMessage(entry.message, entry.provisional, entry.browserSpeechOwned);
        break;
      case "html":
        this.handleHtml(entry.html);
        break;
      case "error":
        this.addError(entry.error);
        break;
      case "command":
        this.addCommand(entry.command);
        break;
    }
  };

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

    // Freeze overflow lines into the static HTML container. A failure here must
    // not skip the bookkeeping and save below: when it did, every later update
    // threw before scheduleSave() and nothing was persisted again.
    try {
      this.freezeOverflow();
    } catch (error) {
      console.error("Failed to freeze output overflow:", error);
    }
    this.recoverOutputFocus();
    const frozen = this.frozenRef.current;
    frozen?.querySelectorAll('.focused-line').forEach(line => { line.classList.remove('focused-line'); });
    if (this.state.focusedLineId !== null) {
      frozen?.querySelector(`[data-line-id="${this.state.focusedLineId}"]`)?.classList.add('focused-line');
    }

    // Track new lines for the "N new messages" notification
    const newLineCount = this.totalLinesAdded - this.prevTotalLinesAdded;
    this.prevTotalLinesAdded = this.totalLinesAdded;

    if (newLineCount > 0) {
      const newLines = this.allLines.slice(-newLineCount);
      const visibleNewLinesCount = newLines.filter(
        line => this.state.localEchoActive || line.type !== OutputType.Command
      ).length;

      if (visibleNewLinesCount > 0) {
        // Use the pre-update snapshot: scrollToBottom() above runs in a rAF, so
        // measuring now would count lines the view is about to reveal as unread.
        if (!wasScrolledToBottom) {
          this.setState(state => ({
            newLinesCount: state.newLinesCount + visibleNewLinesCount,
          }));
        } else if (this.state.newLinesCount !== 0) {
          // Only reset if it's not already 0 (avoids double-render)
          this.setState({ newLinesCount: 0 });
        }
      }
    }

    this.scheduleSave(); // Debounced save so a burst of lines coalesces into one write
  }

  /**
   * Render overflow lines from allLines into the frozen HTML container.
   * Lines in the frozen container are static HTML — React doesn't touch them.
   */
  private freezeOverflow() {
    const frozenDiv = this.frozenRef.current;
    if (!frozenDiv) return;

    // The counters below are only valid for the container they were built in.
    // If the container was replaced or its children changed behind our back,
    // rebuild it from allLines instead of indexing past its end.
    if (frozenDiv !== this.frozenContainer || frozenDiv.children.length !== this.frozenCount) {
      if (this.frozenCount !== 0 || frozenDiv.children.length !== 0) {
        console.warn("Frozen output container out of sync; rebuilding", {
          sameContainer: frozenDiv === this.frozenContainer,
          children: frozenDiv.children.length,
          frozenCount: this.frozenCount,
          frozenHiddenCount: this.frozenHiddenCount,
          allLines: this.allLines.length,
        });
      }
      frozenDiv.replaceChildren();
      this.frozenContainer = frozenDiv;
      this.frozenCount = 0;
      this.frozenHiddenCount = 0;
    }

    // How many lines should be frozen (everything not in the live window)
    const shouldBeFrozen = Math.max(0, this.allLines.length - Output.LIVE_WINDOW_SIZE);

    // Freeze new lines
    while (this.frozenCount < shouldBeFrozen) {
      const line = this.allLines[this.frozenCount];
      const wrapper = document.createElement('div');
      wrapper.className = `output-line output-line-${line.type}`;
      wrapper.dataset.lineId = String(line.id);
      wrapper.innerHTML = this.renderLineMarkup(line);
      frozenDiv.appendChild(wrapper);
      this.frozenCount++;
    }

    // Hide frozen lines that crossed the exposure boundary from the
    // accessibility tree (or expose everything while historyRevealed).
    // Incremental: only lines whose state changes are touched.
    const shouldBeHidden = this.state.historyRevealed
      ? 0
      : Math.max(0, frozenDiv.children.length - Output.A11Y_EXPOSED_FROZEN_LINES);
    while (this.frozenHiddenCount < shouldBeHidden) {
      frozenDiv.children[this.frozenHiddenCount].setAttribute('aria-hidden', 'true');
      frozenDiv.children[this.frozenHiddenCount].setAttribute('inert', '');
      this.frozenHiddenCount++;
    }
    while (this.frozenHiddenCount > shouldBeHidden) {
      this.frozenHiddenCount--;
      frozenDiv.children[this.frozenHiddenCount].removeAttribute('aria-hidden');
      frozenDiv.children[this.frozenHiddenCount].removeAttribute('inert');
    }
    this.recoverOutputFocus();
  }

  /** Lines currently (or potentially) excluded from the accessibility tree. */
  private beyondCapLineCount(): number {
    return Math.max(
      0,
      this.allLines.length - Output.LIVE_WINDOW_SIZE - Output.A11Y_EXPOSED_FROZEN_LINES
    );
  }

  toggleHistoryExposure = () => {
    const revealing = !this.state.historyRevealed;
    const count = this.beyondCapLineCount();
    // freezeOverflow applies the new exposure in componentDidUpdate.
    this.setState({ historyRevealed: revealing }, () => {
      announce(
        revealing
          ? `${count} earlier messages shown to screen reader`
          : 'Earlier messages hidden from screen reader',
        'polite'
      );
    });
  };

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
    // Trimmed lines come off the front, which is where the hidden ones are.
    this.frozenHiddenCount = Math.max(0, this.frozenHiddenCount - count);
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
    const latest = this.allLines.filter(line => this.state.localEchoActive || line.type !== OutputType.Command).at(-1);
    this.scrollToBottom();
    this.outputRef.current?.focus();
    this.setState({ newLinesCount: 0, focusedLineId: latest?.id ?? null });
  };

  componentDidMount() {
    this.unsubscribePrefs = usePreferences.subscribe(
      (state) => state.general.localEcho,
      this.handlePreferencesChange,
    );
    this.unsubscribeUserlist = useUserlistStore.subscribe(this.handleUserlistVisibility);
    this.unsubscribeConnection = useConnectionStore.subscribe(this.handleConnectionStateChange);
    this.unsubscribeOutputStore = useOutputStore.subscribe(this.handleOutputStoreEntries);
    this.handleUserlistVisibility();
    this.handleConnectionStateChange();
    this.handleOutputStoreEntries();

    // Freeze any loaded output that exceeds the live window
    this.freezeOverflow();
    this.scrollToBottom();
  }

  componentWillUnmount() {
    if (this.unsubscribePrefs) {
      this.unsubscribePrefs();
    }
    if (this.unsubscribeUserlist) {
      this.unsubscribeUserlist();
    }
    if (this.unsubscribeConnection) {
      this.unsubscribeConnection();
    }
    if (this.unsubscribeOutputStore) {
      this.unsubscribeOutputStore();
    }
    // Flush any pending debounced save so the latest output isn't lost on unmount.
    this.cancelScheduledSave();
    this.saveOutput();
  }

  sanitizeHtml(html: string): string {
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll('.blockquote-copy-button, .copy-feedback').forEach(node => { node.remove(); });
    return doc.body.textContent || "";
  }

  addToOutput(
    type: OutputType,
    shouldAnnounce: boolean = true,
    sourceType: string = 'unknown',
    sourceContent: string = '',
    metadata?: Record<string, any>
  ) {
    if (shouldAnnounce) {
      // Announcing is secondary to displaying: a failure here must not drop the line.
      try {
        announce(this.sanitizeHtml(this.renderLineMarkup({ type, sourceType, sourceContent, metadata })));
      } catch (error) {
        console.error("Failed to announce output line:", error);
      }
    }

    // One line per message, matching what loadOutput rebuilds from the saved
    // source. (Splitting a multi-element message into lines that each carried
    // the whole source duplicated it on restart and when rendering from source.)
    const newOutputLines: OutputLine[] = [{
      id: this.messageKey++,
      type: type,
      sourceType: sourceType,
      sourceContent: sourceContent,
      metadata: metadata
    }];

    // Append to full history
    this.allLines.push(...newOutputLines);
    this.totalLinesAdded += newOutputLines.length;

    if (sourceContent !== "") {
      // The line is already in allLines; an auto-log failure must not abort the
      // render below (the fallback path would then add it a second time).
      try {
        autoLogService.recordLine({
          type: type as unknown as AutoLogLineType,
          sourceType: sourceType as AutoLogSourceType,
          sourceContent,
          metadata,
        });
      } catch (error) {
        console.error("Auto-log failed to record line:", error);
      }
    }

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
  handleMessage = (message: string, provisional: boolean = false, browserSpeechOwned: boolean = false) => {
    if (!message) {
      return;
    }
    this.addToOutput(
      OutputType.ServerMessage,
      !browserSpeechOwned,
      'ansi',
      message,
      provisional ? { provisional: true } : undefined,
    );
  };

  handleHtml = (html: string) => {
    this.addToOutput(OutputType.ServerMessage, true, 'html', html);
  }

  handleExitClick = (exit: string) => {
    this.props.client.sendCommand(exit);
  };

  // --- Combined click handler for delegated events ---
  handleOutputClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const targetElement = event.target as HTMLElement;
    const copyButton = targetElement.closest<HTMLButtonElement>('.blockquote-copy-button');
    if (copyButton) {
      const wrapper = copyButton.closest('.blockquote-with-copy');
      const quote = wrapper?.querySelector('blockquote');
      if (!quote) return;
      event.preventDefault();
      void copyBlockquoteContent(quote, quote.dataset.contentType).then(() => {
        announce('Copied', 'polite');
        copyButton.textContent = 'Copied!';
        const feedback = wrapper?.querySelector('.copy-feedback');
        if (feedback) feedback.textContent = '';
        window.setTimeout(() => { if (copyButton.isConnected) copyButton.textContent = 'Copy'; }, 1500);
      }, () => {
        announce('Could not copy', 'polite');
        const feedback = wrapper?.querySelector('.copy-feedback');
        if (feedback) feedback.textContent = 'Could not copy. Select the text to copy it.';
      });
      return;
    }

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
        useInputStore.getState().setText(commandText);
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
    // Cancel any pending debounced save so it can't fire after the clear and re-persist stale data.
    this.cancelScheduledSave();
    this.allLines = [];
    this.frozenCount = 0;
    this.frozenHiddenCount = 0;
    this.totalLinesAdded = 0;
    this.prevTotalLinesAdded = 0;
    const frozenDiv = this.frozenRef.current;
    if (frozenDiv) frozenDiv.innerHTML = '';
    this.setState({ liveOutput: [] });
    removeStoredValue(Output.LOCAL_STORAGE_KEY);
  }

  async copyLog() {
    this.setState({ actionFeedback: '' });
    try {
      const text = this.allLines
        .filter(line => this.state.localEchoActive || line.type !== OutputType.Command)
        .map(line => {
          if (line.sourceType === 'ansi') {
            return stripAnsi(line.sourceContent).replace(/@\[exit:[a-zA-Z]+\]([a-zA-Z]+)@\[\/\]/g, '$1');
          }
          const doc = new DOMParser().parseFromString(this.renderLineMarkup(line), 'text/html');
          doc.querySelectorAll('.blockquote-copy-button, .copy-feedback').forEach(node => { node.remove(); });
          const read = (node: Node): string => {
            if (node.nodeName === 'BR') return '\n';
            if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
            const content = Array.from(node.childNodes).map(read).join('');
            return /^(P|DIV|LI|PRE|BLOCKQUOTE|H[1-6]|TR)$/.test(node.nodeName) && content && !content.endsWith('\n')
              ? `${content}\n` : content;
          };
          return read(doc.body).replace(/\n$/, '');
        })
        .join('\n');
      await navigator.clipboard.writeText(text);
      announce('Log copied', 'polite');
      this.setState({ actionFeedback: 'Log copied.' });
    } catch {
      announce('Could not copy log', 'polite');
      this.setState({ actionFeedback: 'Could not copy log. Select the text to copy it.' });
    }
  }

  /**
   * Scroll focused line into view
   */
  scrollFocusedLineIntoView = () => {
    if (this.state.focusedLineId === null) return;

    // Use setTimeout to ensure DOM has updated
    setTimeout(() => {
      const outputDiv = this.outputRef.current;
      if (!outputDiv) return;

      const focusedElement = outputDiv.querySelector(`[data-line-id="${this.state.focusedLineId}"]`);
      if (focusedElement) {
        focusedElement.scrollIntoView({
          behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'nearest',
        });
      }
    }, 0);
  };

  /**
   * Handle keyboard navigation through output lines
   */
  handleOutputKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const isPlainAlt = e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey;

    // Suppress Alt+Arrow and Alt+letter so browser defaults
    // don't interfere with app-level keybindings
    if (isPlainAlt && (
      e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
      'ijklwasdchtnoe,'.includes(e.key.toLowerCase()) ||
      'IJKLWASDCHTNOE'.split('').some(c => e.code === `Key${c}`) || e.code === 'Comma'
    )) {
      e.preventDefault();
      return;
    }
    if (isPlainAlt && e.code === 'Space') {
      e.preventDefault();
      return;
    }

    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const visibleOutput = this.allLines.filter(
      line => this.state.localEchoActive || line.type !== OutputType.Command
    );

    if (visibleOutput.length === 0) return;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const currentIndex = visibleOutput.findIndex(line => line.id === this.state.focusedLineId);
        const nextIndex = Math.min(currentIndex + 1, visibleOutput.length - 1);
        this.setState({ focusedLineId: visibleOutput[nextIndex].id }, () => {
          this.announceOutputLine(visibleOutput[nextIndex]);
          this.scrollFocusedLineIntoView();
        });
        break;
      }

      case 'ArrowUp': {
        e.preventDefault();
        const found = visibleOutput.findIndex(line => line.id === this.state.focusedLineId);
        const currentIndex = found < 0 ? visibleOutput.length : found;
        const prevIndex = Math.max(currentIndex - 1, 0);
        this.setState({ focusedLineId: visibleOutput[prevIndex].id }, () => {
          this.announceOutputLine(visibleOutput[prevIndex]);
          this.scrollFocusedLineIntoView();
        });
        break;
      }

      case 'Home':
        e.preventDefault();
        this.setState({ focusedLineId: visibleOutput[0].id }, () => {
          this.announceOutputLine(visibleOutput[0]);
          this.scrollFocusedLineIntoView();
        });
        break;

      case 'End': {
        e.preventDefault();
        const lastIndex = visibleOutput.length - 1;
        this.setState({ focusedLineId: visibleOutput[lastIndex].id }, () => {
          this.announceOutputLine(visibleOutput[lastIndex]);
          this.scrollFocusedLineIntoView();
        });
        break;
      }
    }
  };

  /**
   * Announce output line to screen readers
   */
  announceOutputLine = (line: OutputLine) => {
    if (!line) return;

    // Extract text content from the JSX element
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.renderLineMarkup(line);
    const textContent = this.sanitizeHtml(tempDiv.innerHTML);

    // Announce to screen reader
    announce(textContent, 'polite');
  };

  reviewRecentOutputLine = (lineNumber: number) => {
    const visibleOutput = this.allLines.filter(
      line => this.state.localEchoActive || line.type !== OutputType.Command
    );

    if (visibleOutput.length === 0) {
      announce("No output", "polite");
      return;
    }

    const line = visibleOutput[visibleOutput.length - lineNumber];
    if (!line) {
      announce("No line", "polite");
      return;
    }

    this.announceOutputLine(line);
  };

  copyRecentOutputLine = (lineNumber: number) => {
    const visibleOutput = this.allLines.filter(
      line => this.state.localEchoActive || line.type !== OutputType.Command
    );
    const line = visibleOutput[visibleOutput.length - lineNumber];

    if (!line) {
      announce(visibleOutput.length === 0 ? "No output" : "No line", "polite");
      return;
    }

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = this.renderLineMarkup(line);
    const textContent = this.sanitizeHtml(tempDiv.innerHTML);

    return navigator.clipboard.writeText(textContent).then(
      () => announce("Copied", "polite"),
      (error: unknown) => {
        console.error("Failed to copy output line:", error);
        announce("Could not copy", "polite");
      },
    );
  };

  /**
   * Handle focus on output area
   */
  handleOutputFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    this.lastFocusedOutputElement = event.target as HTMLElement;
    // If no line is focused, start at the last line
    if (this.state.focusedLineId === null) {
      const visibleOutput = this.state.liveOutput.filter(
        line => this.state.localEchoActive || line.type !== OutputType.Command
      );
      if (visibleOutput.length > 0) {
        const lastIndex = visibleOutput.length - 1;
        this.setState({ focusedLineId: visibleOutput[lastIndex].id });
      }
    }
  };

  /**
   * Handle blur on output area
   */
  handleOutputBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const left = event.target as HTMLElement;
    queueMicrotask(() => {
      if (this.lastFocusedOutputElement === left && left.isConnected && !left.closest('[inert]')) {
        this.lastFocusedOutputElement = null;
      }
    });
    // Optionally clear focus indicator when tabbing away
    // this.setState({ focusedLineId: null });
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
        {this.state.actionFeedback && <p className="output-action-feedback">{this.state.actionFeedback}</p>}
        {this.beyondCapLineCount() > 0 && (
          <button
            type="button"
            className="history-exposure-toggle"
            onClick={this.toggleHistoryExposure}
          >
            {this.state.historyRevealed
              ? "Hide earlier history from screen reader"
              : `Show ${this.beyondCapLineCount()} earlier messages to screen reader`}
          </button>
        )}
        <div ref={this.frozenRef} />
        {visibleLiveOutput.map((line, index) => (
          <div
            key={line.id}
            className={`output-line ${this.state.focusedLineId === line.id ? 'focused-line' : ''}`}
            data-line-id={line.id}
          >
            <OutputLineContent line={line} onExitClick={this.handleExitClick} />
          </div>
        ))}
        {this.state.newLinesCount > 0 && (
          <button
            type="button"
            className="new-lines-notification"
            onClick={this.handleScrollToBottom}
            aria-live="off"
          >
            Show {newLinesText}
          </button>
        )}
      </div>
    );
  }
}

export default Output;
