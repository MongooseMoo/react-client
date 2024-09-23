import MudClient from "./client";
import { EditorSession } from "./mcp";

export class EditorManager {
  private openEditors: Map<string, Window>;
  private channel: BroadcastChannel;

  constructor(private client: MudClient) {
    this.openEditors = new Map();
    this.channel = new BroadcastChannel("editor");
    this.setupChannelListeners();
  }

  openEditorWindow(editorSession: EditorSession) {
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
        this.openEditors.set(id, editorWindow);
        editorWindow.focus();
      }
    }
  }

  private focusEditor(id: string) {
    const editorWindow = this.openEditors.get(id);
    if (editorWindow && !editorWindow.closed) {
      editorWindow.focus();
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
      if (ev.data.type === "ready") {
        console.log("sending editor window session", ev.data.id);
        const session = this.getEditorSession(ev.data.id);
        if (session) {
          this.channel.postMessage({
            type: "load",
            session: session,
          });
        } else {
          console.error(`No session found for id: ${ev.data.id}`);
        }
      } else if (ev.data.type === "save") {
        console.log("saving editor window with session", ev.data.session);
        this.saveEditorWindow(ev.data.session);
      } else if (ev.data.type === "close") {
        console.log("closing editor window");
        this.openEditors.delete(ev.data.id);
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
    this.openEditors.forEach((window) => window.close());
    this.channel.close();
  }
}
