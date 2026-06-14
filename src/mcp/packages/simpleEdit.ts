import {
  identityCodec,
  inbound,
  messageEnvelope,
  outbound,
} from '../../protocol/messages';
import {
  MCPPackage,
  type McpMultilineOutboundPayload,
} from '../package';
import type { EditorSession, McpMessage } from '../types';

const simpleEditContent = messageEnvelope(
  'content',
  identityCodec<EditorSession>(),
);

const simpleEditSet = messageEnvelope('set', {
  encode(session: EditorSession): McpMultilineOutboundPayload {
    return {
      kind: 'mcp-multiline',
      keyvals: {
        reference: session.reference,
        type: session.type,
        'content*': '',
      },
      lineKey: 'content',
      lines: session.contents,
    };
  },
  decode(payload: unknown): EditorSession {
    return payload as EditorSession;
  },
});

const McpSimpleEditBase = MCPPackage.with({
  packageName: 'dns-org-mud-moo-simpleedit',
  messages: [
    inbound(simpleEditContent).asEvent('openSession'),
    outbound(simpleEditSet),
  ] as const,
});

export class McpSimpleEdit extends McpSimpleEditBase {
  private sessionsByTag = new Map<string, EditorSession>();

  handle(message: McpMessage): void {
    if (message.name !== 'dns-org-mud-moo-simpleedit-content') {
      console.log(`Unexpected simpleedit message ${message.name}`);
      return;
    }

    const dataTag = message.keyvals['_data-tag'];
    if (!dataTag) {
      console.log('Ignoring simpleedit content without _data-tag');
      return;
    }

    this.sessionsByTag.set(dataTag, {
      name: message.keyvals.name,
      reference: message.keyvals.reference,
      type: message.keyvals.type,
      contents: [],
    });
  }

  handleMultiline(message: McpMessage): void {
    const session = this.sessionsByTag.get(message.name);
    if (session && 'content' in message.keyvals) {
      session.contents.push(message.keyvals.content);
      return;
    }

    console.log(`Unexpected simpleedit ML ${message.name}`);
  }

  closeMultiline(closure: McpMessage): void {
    const session = this.sessionsByTag.get(closure.name);
    if (!session) {
      return;
    }

    this.emitRegisteredMessage(simpleEditContent.wireName, session);
    this.sessionsByTag.delete(closure.name);
  }
}
