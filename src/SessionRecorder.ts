import {
  openIndexedDatabase,
  requestToPromise,
  transactionDone,
  type IndexedDatabaseSchema,
} from "./persistence";

export interface SessionEvent {
  timestamp: number;
  type: 'websocket-send' | 'websocket-receive' | 'user-input' | 'connection' | 'gmcp' | 'mcp' | 'file-transfer' | 'error';
  data: any;
  metadata?: {
    url?: string;
    readyState?: number;
    protocol?: string;
    [key: string]: any;
  };
}

export interface SessionMetadata {
  sessionId: string;
  startTime: number;
  endTime?: number;
  url: string;
  userAgent: string;
  description?: string;
  tags?: string[];
}

export interface SessionLog {
  metadata: SessionMetadata;
  events: SessionEvent[];
}

const sessionDatabaseSchema: IndexedDatabaseSchema = {
  name: "SessionLogs",
  version: 1,
  upgrade: (database) => {
    if (!database.objectStoreNames.contains("sessions")) {
      const store = database.createObjectStore("sessions", {
        keyPath: "metadata.sessionId",
      });
      store.createIndex("startTime", "metadata.startTime");
      store.createIndex("url", "metadata.url");
    }
  },
};

export class SessionRecorder {
  private events: SessionEvent[] = [];
  private sessionId: string;
  private startTime: number;
  private isRecording: boolean = false;
  private originalWebSocket: WebSocket | null = null;
  
  constructor(
    private url: string,
    private description?: string,
    private tags?: string[]
  ) {
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.startTime = Date.now();
  }

  startRecording(): void {
    if (this.isRecording) return;
    
    this.isRecording = true;
    this.events = [];
    this.startTime = Date.now();
    
    this.recordEvent('connection', {
      action: 'recording-started',
      url: this.url
    });
  }

  stopRecording(): void {
    if (!this.isRecording) return;
    
    this.recordEvent('connection', {
      action: 'recording-stopped'
    });
    
    this.isRecording = false;
  }

  recordEvent(
    type: SessionEvent['type'], 
    data: any, 
    metadata?: SessionEvent['metadata']
  ): void {
    if (!this.isRecording) return;

    const event: SessionEvent = {
      timestamp: Date.now() - this.startTime,
      type,
      data,
      metadata
    };

    this.events.push(event);
  }

  recordWebSocketSend(data: string | ArrayBuffer | Blob): void {
    this.recordEvent('websocket-send', {
      data: typeof data === 'string' ? data : `[Binary data: ${data.constructor.name}]`,
      dataType: typeof data === 'string' ? 'string' : data.constructor.name
    });
  }

  recordWebSocketReceive(data: string | ArrayBuffer | Blob): void {
    this.recordEvent('websocket-receive', {
      data: typeof data === 'string' ? data : `[Binary data: ${data.constructor.name}]`,
      dataType: typeof data === 'string' ? 'string' : data.constructor.name
    });
  }

  recordUserInput(input: string, inputType: 'command' | 'chat' | 'editor' = 'command'): void {
    this.recordEvent('user-input', {
      input,
      inputType
    });
  }

  recordConnection(action: 'open' | 'close' | 'error', details?: any): void {
    this.recordEvent('connection', {
      action,
      ...details
    }, {
      readyState: this.originalWebSocket?.readyState,
      protocol: this.originalWebSocket?.protocol,
      url: this.originalWebSocket?.url
    });
  }

  recordGMCPMessage(packageName: string, message: any): void {
    this.recordEvent('gmcp', {
      package: packageName,
      message
    });
  }

  recordMCPMessage(message: any): void {
    this.recordEvent('mcp', {
      message
    });
  }

  recordFileTransfer(action: string, details: any): void {
    this.recordEvent('file-transfer', {
      action,
      ...details
    });
  }

  recordError(error: Error, context?: string): void {
    this.recordEvent('error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context
    });
  }

  getSessionLog(): SessionLog {
    const metadata: SessionMetadata = {
      sessionId: this.sessionId,
      startTime: this.startTime,
      endTime: this.isRecording ? undefined : Date.now(),
      url: this.url,
      userAgent: navigator.userAgent,
      description: this.description,
      tags: this.tags
    };

    return {
      metadata,
      events: [...this.events]
    };
  }

  exportSession(): string {
    const sessionLog = this.getSessionLog();
    return JSON.stringify(sessionLog, null, 2);
  }

  async saveSessionToFile(filename?: string): Promise<void> {
    const sessionData = this.exportSession();
    const blob = new Blob([sessionData], { type: 'application/json' });
    
    const defaultFilename = `${this.sessionId}.json`;
    const finalFilename = filename || defaultFilename;
    
    // Use download method for browser compatibility
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = finalFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async saveSessionToIndexedDB(): Promise<void> {
    const sessionLog = this.getSessionLog();

    const database = await openIndexedDatabase(sessionDatabaseSchema);
    try {
      const transaction = database.transaction("sessions", "readwrite");
      const done = transactionDone(transaction);
      transaction.objectStore("sessions").put(sessionLog);
      await done;
    } finally {
      database.close();
    }
  }

  static async loadSessionFromIndexedDB(sessionId: string): Promise<SessionLog | null> {
    const database = await openIndexedDatabase(sessionDatabaseSchema);
    try {
      const transaction = database.transaction("sessions", "readonly");
      const done = transactionDone(transaction);
      const session = await requestToPromise<SessionLog | undefined>(
        transaction.objectStore("sessions").get(sessionId),
      );
      await done;
      return session ?? null;
    } finally {
      database.close();
    }
  }

  static async listSessions(): Promise<SessionMetadata[]> {
    const database = await openIndexedDatabase(sessionDatabaseSchema);
    try {
      const transaction = database.transaction("sessions", "readonly");
      const done = transactionDone(transaction);
      const sessions = await requestToPromise<SessionLog[]>(
        transaction.objectStore("sessions").getAll(),
      );
      await done;
      return sessions.map((log) => log.metadata);
    } finally {
      database.close();
    }
  }
}
