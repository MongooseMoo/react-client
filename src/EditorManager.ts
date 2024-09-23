import MudClient from "./client";
import { EditorSession } from "./mcp";

interface WindowedSession extends EditorSession {
  window: Window;
}

export class EditorManager {
  private openEditors: Map<string, WindowedSession>;
  private channel: BroadcastChannel;

  constructor(private client: MudClient) {
    this.openEditors = new Map();
    this.channel = new BroadcastChannel("editor");
    this.setupChannelListeners();
  }

  openEditorWindow(editorSession: EditorSession) {
    console.log(editorSession);
    const id = editorSession.reference;
    if (this.openEditors.has(id)) {
      this.focusEditor(id);
    } else {
      const encodedId = encodeURIComponent(id);
      const editorWindow = window.open(
        `/editor?reference=${encodedId}`,
        "_blank"
      );
      if (editorWindow) {
        const windowedSession: WindowedSession = {
          ...editorSession,
          window: editorWindow
        };
        this.openEditors.set(id, windowedSession);
        editorWindow.focus();
        
        // Notify the channel that a new editor window is ready
        this.channel.postMessage({
          type: "ready",
          id: id
        });
      }
    }
  }

  private focusEditor(id: string) {
    const windowedSession = this.openEditors.get(id);
    if (windowedSession && !windowedSession.window.closed) {
      windowedSession.window.focus();
    } else {
      this.openEditors.delete(id);
    }
  }

  saveEditorWindow(editorSession: EditorSession) {
    const keyvals = {
      reference: editorSession.reference,
      type: editorSession.type,
      "content*": "",
    };
    this.client.sendMCPMultiline(
      "dns-org-mud-moo-simpleedit-set",
      keyvals,
      editorSession.contents
    );
  }

  private setupChannelListeners() {
    this.channel.onmessage = (ev) => {
      console.log("editor window message", ev);
      const { type, id, session } = ev.data;

      if (type === "ready") {
        console.log("sending editor window session", id);
        const editorSession = this.getEditorSession(id);
        if (editorSession) {
          this.channel.postMessage({
            type: "load",
            session: editorSession,
          });
        } else {
          console.error(`No session found for id: ${id}`);
        }
      } else if (type === "save") {
        console.log("saving editor window with session", session);
        this.saveEditorWindow(session);
      } else if (type === "close") {
        console.log("closing editor window");
        this.openEditors.delete(id);
      }
    };
  }

  private getEditorSession(id: string): EditorSession | undefined {
    const session = this.openEditors.get(id);
    if (session) {
      return session;
    }
  }

  shutdown() {
    console.log("Shutting down EditorManager");
    this.openEditors.forEach((session, id) => {
      try {
        console.log(`Closing editor window for ${id}`);
        session.window.close();
        this.channel.postMessage({ type: "shutdown", id });
      } catch (error) {
        console.error(`Error closing editor window ${id}:`, error);
      }
    });
    this.openEditors.clear();
    console.log("Closing broadcast channel");
    this.channel.close();
    console.log("EditorManager shutdown complete");
  }
}
