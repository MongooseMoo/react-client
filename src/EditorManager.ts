import type { EditorSession, McpSimpleEdit } from './mcp';
import { usePersonalDataStore } from './stores/personalDataStore';
import { canUseBrowserWindow, currentBrowserPurpose, useBrowserPolicy } from './browserPolicy';

interface WindowedSession {
  session: EditorSession;
  window: Window | null;
  channel: BroadcastChannel;
  state: 'pending' | 'open' | 'closed';
  purpose: 'owner' | 'visitor';
  parentSession: string;
}

export class EditorManager {
  private readonly editors = new Map<string, WindowedSession>();
  private stopped = false;

  constructor(private readonly simpleEdit: McpSimpleEdit) {}

  openEditorWindow(session: EditorSession): void {
    if (this.stopped) return;
    const policy = usePersonalDataStore.getState();
    if (policy.visitor && !policy.visitorWindow) return;
    const id = session.reference;
    const previous = this.editors.get(id);
    if (previous?.state === 'open' && previous.window && !previous.window.closed) {
      previous.window.focus();
      return;
    }
    previous?.channel.close();
    // Each opening owns a channel, fencing other game sessions and late messages
    // from an earlier window editing the same reference.
    const owner = crypto.randomUUID();
    const channel = new BroadcastChannel(`editor:${owner}`);
    const purpose = currentBrowserPurpose(policy.gameSessionId);
    const entry: WindowedSession = { session, channel, window: null, state: 'pending', purpose, parentSession: policy.gameSessionId };
    this.editors.set(id, entry);
    channel.onmessage = (event: MessageEvent) => {
      if (this.stopped || this.editors.get(id) !== entry) return;
      const message = event.data;
      if (!message || message.id !== id) return;
      switch (message.type) {
        case 'ready':
          if (!entry.window || entry.window.closed) return;
          entry.state = 'open';
          channel.postMessage({ type: 'load', id, session: entry.session });
          break;
        case 'save':
          if (entry.state === 'open' && message.session?.reference === id) {
            this.saveEditorWindow(message.session);
          }
          break;
        case 'close':
          entry.state = 'closed';
          break;
      }
    };
    entry.window = window.open(
      `/editor?reference=${encodeURIComponent(id)}&owner=${owner}&parentSession=${encodeURIComponent(entry.parentSession)}&purpose=${entry.purpose}`, '_blank',
    );
    if (entry.window) entry.window.focus();
    else {
      channel.close();
      this.editors.delete(id);
    }
  }

  saveEditorWindow(session: EditorSession): void {
    const entry = this.editors.get(session?.reference);
    if (this.stopped || !entry || entry.state !== 'open' || !entry.window || entry.window.closed) return;
    if (!canUseBrowserWindow(useBrowserPolicy.getState().policy, entry.parentSession, entry.purpose)) return;
    if (!Array.isArray(session.contents) || !session.contents.every((line) => typeof line === 'string')) return;
    this.simpleEdit.sendSet({ ...entry.session, contents: session.contents });
  }

  reset(): void {
    for (const [id, entry] of this.editors) {
      entry.channel.postMessage({ type: 'shutdown', id });
      entry.channel.close();
    }
    this.editors.clear();
  }

  shutdown(): void {
    this.reset();
    this.stopped = true;
  }
}
