import { describe, expect, it, vi } from 'vitest';
import {
  MCPPackage,
  McpSession,
  McpSimpleEdit,
  encodeMcpMessage,
  parseMcpLine,
  parseMcpMessage,
  parseMcpMultiline,
} from './mcp';
import type { EditorSession, McpMessage } from './mcp';

function expectMessage(value: McpMessage | null): McpMessage {
  expect(value).not.toBeNull();
  return value as McpMessage;
}

describe('MCP codec', () => {
  it('parses a handshake message without an auth key', () => {
    const parsed = expectMessage(parseMcpMessage('#$#MCP version: 2.1 to: 2.1'));

    expect(parsed.name).toBe('MCP');
    expect(parsed.authKey).toBeUndefined();
    expect(parsed.keyvals).toEqual({ version: '2.1', to: '2.1' });
  });

  it('parses auth keys and quoted values with escapes', () => {
    const parsed = expectMessage(
      parseMcpMessage('#$#say 123456 what: "Hi \\"there\\"!" path: "C:\\\\tmp" to: Betty'),
    );

    expect(parsed.name).toBe('say');
    expect(parsed.authKey).toBe('123456');
    expect(parsed.keyvals).toEqual({
      what: 'Hi "there"!',
      path: 'C:\\tmp',
      to: 'Betty',
    });
  });

  it('rejects duplicate keys and trailing garbage', () => {
    expect(parseMcpMessage('#$#say 123456 what: hi what: bye')).toBeNull();
    expect(parseMcpMessage('#$#say 123456 what: hi garbage')).toBeNull();
  });

  it('parses multiline continuations and closures', () => {
    const continuation = expectMessage(
      parseMcpMultiline("#$#* 9b76 text: Note that you don't need to quote strings"),
    );
    const parsedContinuation = parseMcpLine('#$#* 9b76 text: Line with spaces');
    const parsedClosure = parseMcpLine('#$#: 9b76');

    expect(continuation.name).toBe('9b76');
    expect(continuation.keyvals).toEqual({
      text: "Note that you don't need to quote strings",
    });
    expect(parsedContinuation).toEqual({
      type: 'multiline-continuation',
      continuation: {
        tag: '9b76',
        key: 'text',
        value: 'Line with spaces',
        keyvals: { text: 'Line with spaces' },
      },
    });
    expect(parsedClosure).toEqual({
      type: 'multiline-close',
      closure: { tag: '9b76', keyvals: {} },
    });
  });

  it('encodes outbound values without dropping falsy data', () => {
    expect(
      encodeMcpMessage('package-message', 'auth01', {
        empty: '',
        falseValue: false,
        zero: 0,
        spaced: 'hello world',
        quoted: 'say "hi"',
      }),
    ).toBe(
      '#$#package-message auth01 empty: "" falseValue: false zero: 0 spaced: "hello world" quoted: "say \\"hi\\""',
    );
  });
});

class RecordingPackage extends MCPPackage {
  public packageName = 'dns-org-mud-moo-simpleedit';
  public handle = vi.fn();
  public handleMultiline = vi.fn();
  public closeMultiline = vi.fn();
}

describe('McpSession', () => {
  it('performs authentication and advertises registered packages', () => {
    const sent: string[] = [];
    const session = new McpSession(
      {
        emit: vi.fn(),
        openEditorSession: vi.fn(),
        sendLine: (line) => sent.push(line),
      },
      () => 'auth01',
    );
    session.registerPackage(RecordingPackage);

    session.receiveLine('#$#MCP version: 2.1 to: 2.1');

    expect(sent).toEqual([
      '#$#mcp authentication-key: auth01 version: 2.1 to: 2.1',
      '#$#mcp-negotiate-can auth01 package: dns-org-mud-moo-simpleedit min-version: 1.0 max-version: 1.0',
      '#$#mcp-negotiate-end auth01',
    ]);
  });

  it('routes authenticated messages by longest package prefix and tracks multiline tags', () => {
    const session = new McpSession(
      {
        emit: vi.fn(),
        openEditorSession: vi.fn(),
        sendLine: vi.fn(),
      },
      () => 'auth01',
    );
    const handler = session.registerPackage(RecordingPackage);

    session.receiveLine('#$#MCP version: 2.1 to: 2.1');
    session.receiveLine(
      '#$#dns-org-mud-moo-simpleedit-content auth01 _data-tag: ml1 name: editor reference: ref type: moo-code',
    );
    session.receiveLine('#$#* ml1 content: line one');
    session.receiveLine('#$#: ml1');

    expect(handler.handle).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'dns-org-mud-moo-simpleedit-content',
      }),
    );
    expect(handler.handleMultiline).toHaveBeenCalledWith({
      name: 'ml1',
      keyvals: { content: 'line one' },
    });
    expect(handler.closeMultiline).toHaveBeenCalledWith({ name: 'ml1', keyvals: {} });
    expect(session.multilineHandlers).toEqual({});
  });

  it('keeps interleaved simpleedit multiline sessions separate', () => {
    const opened: EditorSession[] = [];
    const session = new McpSession(
      {
        emit: vi.fn(),
        openEditorSession: (editorSession) => opened.push(editorSession),
        sendLine: vi.fn(),
      },
      () => 'auth01',
    );
    session.registerPackage(McpSimpleEdit);

    session.receiveLine('#$#MCP version: 2.1 to: 2.1');
    session.receiveLine(
      '#$#dns-org-mud-moo-simpleedit-content auth01 _data-tag: one name: first reference: ref1 type: moo-code',
    );
    session.receiveLine(
      '#$#dns-org-mud-moo-simpleedit-content auth01 _data-tag: two name: second reference: ref2 type: string',
    );
    session.receiveLine('#$#* two content: second line');
    session.receiveLine('#$#* one content: first line');
    session.receiveLine('#$#: one');
    session.receiveLine('#$#: two');

    expect(opened).toEqual([
      {
        name: 'first',
        reference: 'ref1',
        type: 'moo-code',
        contents: ['first line'],
      },
      {
        name: 'second',
        reference: 'ref2',
        type: 'string',
        contents: ['second line'],
      },
    ]);
  });

  it('sends multiline payloads without mutating caller keyvals', () => {
    const sent: string[] = [];
    const tags = ['auth01', 'mltag1'];
    const session = new McpSession(
      {
        emit: vi.fn(),
        openEditorSession: vi.fn(),
        sendLine: (line) => sent.push(line),
      },
      () => tags.shift() ?? 'fallback',
    );
    const keyvals = {
      reference: 'obj 1',
      type: 'moo-code',
      'content*': '',
    };

    session.receiveLine('#$#MCP version: 2.1 to: 2.1');
    sent.length = 0;
    session.sendMultiline('dns-org-mud-moo-simpleedit-set', keyvals, ['line one', 'line two']);

    expect(keyvals).toEqual({
      reference: 'obj 1',
      type: 'moo-code',
      'content*': '',
    });
    expect(sent).toEqual([
      '#$#dns-org-mud-moo-simpleedit-set auth01 reference: "obj 1" type: moo-code content*: "" _data-tag: mltag1',
      '#$#* mltag1 content: line one',
      '#$#* mltag1 content: line two',
      '#$#: mltag1',
    ]);
  });
});
