import { SessionLog, SessionEvent } from './SessionRecorder';

export interface ReplayOptions {
  speedMultiplier?: number;
  skipTypes?: SessionEvent['type'][];
  onlyTypes?: SessionEvent['type'][];
  pauseOnError?: boolean;
  startFromTimestamp?: number;
  endAtTimestamp?: number;
}

export interface MockWebSocket {
  url: string;
  protocol: string;
  readyState: number;
  onopen?: ((event: Event) => void) | null;
  onmessage?: ((event: MessageEvent) => void) | null;
  onclose?: ((event: CloseEvent) => void) | null;
  onerror?: ((event: Event) => void) | null;
  send(data: string | ArrayBuffer | Blob): void;
  close(code?: number, reason?: string): void;
}

export class SessionReplayer {
  private isReplaying: boolean = false;
  private currentEventIndex: number = 0;
  private replayStartTime: number = 0;
  private timeouts: number[] = [];
  
  constructor(
    private mockWebSocket?: MockWebSocket,
    private onEvent?: (event: SessionEvent) => void
  ) {}

  async replaySession(
    sessionLog: SessionLog | string,
    options: ReplayOptions = {}
  ): Promise<void> {
    const session = typeof sessionLog === 'string' ? 
      JSON.parse(sessionLog) as SessionLog : sessionLog;
    
    const {
      speedMultiplier = 1,
      skipTypes = [],
      onlyTypes,
      pauseOnError = true,
      startFromTimestamp = 0,
      endAtTimestamp
    } = options;

    this.clearTimeouts();
    this.isReplaying = true;
    this.currentEventIndex = 0;
    this.replayStartTime = Date.now();

    const filteredEvents = session.events.filter(event => {
      if (event.timestamp < startFromTimestamp) return false;
      if (endAtTimestamp && event.timestamp > endAtTimestamp) return false;
      if (skipTypes.includes(event.type)) return false;
      if (onlyTypes && !onlyTypes.includes(event.type)) return false;
      return true;
    });

    console.log(`[SessionReplayer] Starting replay of ${filteredEvents.length} events`);
    console.log(`[SessionReplayer] Session: ${session.metadata.sessionId}`);
    console.log(`[SessionReplayer] Original duration: ${session.events[session.events.length - 1]?.timestamp || 0}ms`);

    for (const [index, event] of filteredEvents.entries()) {
      if (!this.isReplaying) break;

      const delay = event.timestamp / speedMultiplier;
      
      const timeoutId = window.setTimeout(() => {
        this.replayEvent(event, index, filteredEvents.length, pauseOnError);
      }, delay);
      
      this.timeouts.push(timeoutId);
    }

    // Wait for all events to complete
    const totalDuration = (filteredEvents[filteredEvents.length - 1]?.timestamp || 0) / speedMultiplier;
    await this.sleep(totalDuration);
    
    console.log('[SessionReplayer] Replay completed');
    this.isReplaying = false;
  }

  private replayEvent(event: SessionEvent, index: number, total: number, pauseOnError: boolean): void {
    console.log(`[SessionReplayer] Event ${index + 1}/${total} (${event.timestamp}ms): ${event.type}`);
    
    try {
      switch (event.type) {
        case 'websocket-send':
          this.replayWebSocketSend(event);
          break;
        case 'websocket-receive':
          this.replayWebSocketReceive(event);
          break;
        case 'connection':
          this.replayConnection(event);
          break;
        case 'user-input':
          this.replayUserInput(event);
          break;
        case 'gmcp':
          this.replayGMCP(event);
          break;
        case 'mcp':
          this.replayMCP(event);
          break;
        case 'file-transfer':
          this.replayFileTransfer(event);
          break;
        case 'error':
          this.replayError(event);
          break;
      }

      if (this.onEvent) {
        this.onEvent(event);
      }

    } catch (error) {
      console.error(`[SessionReplayer] Error replaying event:`, error);
      if (pauseOnError) {
        this.stopReplay();
      }
    }

    this.currentEventIndex = index;
  }

  private replayWebSocketSend(event: SessionEvent): void {
    if (!this.mockWebSocket) return;
    
    console.log('[SessionReplayer] Simulating WebSocket send:', event.data.data);
    // We don't actually send through the mock WebSocket
    // This is just for logging/verification purposes
  }

  private replayWebSocketReceive(event: SessionEvent): void {
    if (!this.mockWebSocket?.onmessage) return;
    
    console.log('[SessionReplayer] Replaying WebSocket message:', event.data.data);
    
    const messageEvent = new MessageEvent('message', {
      data: event.data.data,
      origin: new URL(this.mockWebSocket.url).origin,
    });
    
    this.mockWebSocket.onmessage(messageEvent);
  }

  private replayConnection(event: SessionEvent): void {
    if (!this.mockWebSocket) return;
    
    console.log('[SessionReplayer] Replaying connection event:', event.data.action);
    
    switch (event.data.action) {
      case 'open':
        if (this.mockWebSocket.onopen) {
          this.mockWebSocket.onopen(new Event('open'));
        }
        break;
      case 'close':
        if (this.mockWebSocket.onclose) {
          const closeEvent = new CloseEvent('close', {
            code: event.data.code || 1000,
            reason: event.data.reason || '',
            wasClean: event.data.wasClean !== false
          });
          this.mockWebSocket.onclose(closeEvent);
        }
        break;
      case 'error':
        if (this.mockWebSocket.onerror) {
          this.mockWebSocket.onerror(new Event('error'));
        }
        break;
    }
  }

  private replayUserInput(event: SessionEvent): void {
    console.log('[SessionReplayer] User input event:', event.data.input);
    
    // Trigger custom event that can be listened to by tests
    window.dispatchEvent(new CustomEvent('session-replay-user-input', {
      detail: {
        input: event.data.input,
        inputType: event.data.inputType
      }
    }));
  }

  private replayGMCP(event: SessionEvent): void {
    console.log('[SessionReplayer] GMCP event:', event.data.package);
    
    window.dispatchEvent(new CustomEvent('session-replay-gmcp', {
      detail: event.data
    }));
  }

  private replayMCP(event: SessionEvent): void {
    console.log('[SessionReplayer] MCP event:', event.data.message);
    
    window.dispatchEvent(new CustomEvent('session-replay-mcp', {
      detail: event.data
    }));
  }

  private replayFileTransfer(event: SessionEvent): void {
    console.log('[SessionReplayer] File transfer event:', event.data.action);
    
    window.dispatchEvent(new CustomEvent('session-replay-file-transfer', {
      detail: event.data
    }));
  }

  private replayError(event: SessionEvent): void {
    console.error('[SessionReplayer] Replaying error:', event.data.message);
    
    window.dispatchEvent(new CustomEvent('session-replay-error', {
      detail: event.data
    }));
  }

  stopReplay(): void {
    console.log('[SessionReplayer] Stopping replay');
    this.isReplaying = false;
    this.clearTimeouts();
  }

  pauseReplay(): void {
    console.log('[SessionReplayer] Pausing replay');
    this.clearTimeouts();
  }

  getCurrentProgress(): { eventIndex: number; timestamp: number } {
    return {
      eventIndex: this.currentEventIndex,
      timestamp: Date.now() - this.replayStartTime
    };
  }

  isCurrentlyReplaying(): boolean {
    return this.isReplaying;
  }

  private clearTimeouts(): void {
    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts = [];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async loadAndReplaySession(
    sessionFilePath: string,
    mockWebSocket?: MockWebSocket,
    options?: ReplayOptions
  ): Promise<SessionReplayer> {
    // For testing, we'll load the session data from a test file
    // In a real implementation, this would load from the filesystem
    const response = await fetch(sessionFilePath);
    const sessionData = await response.text();
    
    const replayer = new SessionReplayer(mockWebSocket);
    await replayer.replaySession(sessionData, options);
    
    return replayer;
  }
}

export class MockWebSocketImpl implements MockWebSocket {
  public url: string;
  public protocol: string = '';
  public readyState: number = WebSocket.CONNECTING;
  public onopen: ((event: Event) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;

  constructor(url: string, protocols?: string | string[]) {
    this.url = url;
    this.protocol = Array.isArray(protocols) ? protocols[0] || '' : protocols || '';
    
    // Simulate connection opening after a brief delay
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 10);
  }

  send(data: string | ArrayBuffer | Blob): void {
    console.log('[MockWebSocket] Send called with:', data);
    
    // Dispatch event for testing purposes
    window.dispatchEvent(new CustomEvent('mock-websocket-send', {
      detail: { data }
    }));
  }

  close(code?: number, reason?: string): void {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      const closeEvent = new CloseEvent('close', {
        code: code || 1000,
        reason: reason || '',
        wasClean: true
      });
      this.onclose(closeEvent);
    }
  }
}
