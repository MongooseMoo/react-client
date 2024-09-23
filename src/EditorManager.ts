import MudClient from "./client";
import { EditorSession } from "./mcp";

enum EditorState {
  Pending,
  Open,
  Closed
}

interface WindowedSession extends EditorSession {
  window: Window | null;
  state: EditorState;
}

export class EditorManager {
  private editors: Map<string, WindowedSession>;
  private channel: BroadcastChannel;

  constructor(private client: MudClient) {
    this.editors = new Map();
    this.channel = new BroadcastChannel("editor");
    this.setupChannelListeners();
  }

  openEditorWindow(editorSession: EditorSession) {
    console.log("Opening editor window for session:", editorSession);
    const id = editorSession.reference;
    const existingSession = this.editors.get(id);

    if (existingSession && existingSession.state === EditorState.Open && existingSession.window && !existingSession.window.closed) {
      existingSession.window.focus();
    } else {
      const encodedId = encodeURIComponent(id);
      const editorWindow = window.open(
        `/editor?reference=${encodedId}`,
        "_blank"
      );
      const windowedSession: WindowedSession = {
        ...editorSession,
        window: editorWindow,
        state: EditorState.Pending
      };
      this.editors.set(id, windowedSession);
      if (editorWindow) {
        editorWindow.focus();
      }
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
      console.log("Editor window message:", ev);
      const { type, id, session } = ev.data;

      switch (type) {
        case "ready":
          console.log("Editor window ready, id:", id);
          const editorSession = this.editors.get(id);
          if (editorSession) {
            editorSession.state = EditorState.Open;
            this.channel.postMessage({
              type: "load",
              session: editorSession,
            });
          } else {
            console.error(`No session found for id: ${id}`);
          }
          break;
        case "save":
          console.log("Saving editor window with session:", session);
          this.saveEditorWindow(session);
          break;
        case "close":
          console.log("Closing editor window, id:", id);
          const closingSession = this.editors.get(id);
          if (closingSession) {
            closingSession.state = EditorState.Closed;
          }
          break;
      }
    };
  }

  shutdown() {
    console.log("Shutting down EditorManager");
    this.editors.forEach((session, id) => {
      try {
        if (session.state === EditorState.Open && session.window) {
          console.log(`Closing editor window for ${id}`);
          session.window.close();
          this.channel.postMessage({ type: "shutdown", id });
        }
      } catch (error) {
        console.error(`Error closing editor window ${id}:`, error);
      }
    });
    this.editors.clear();
    console.log("Closing broadcast channel");
    this.channel.close();
    console.log("EditorManager shutdown complete");
  }
}
