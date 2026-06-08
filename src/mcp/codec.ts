import type {
  MCPKeyvals,
  McpMessage,
  McpMultilineClose,
  McpMultilineContinuation,
  McpOutboundData,
  McpOutboundValue,
  ParsedMcpLine,
} from './types';

const MCP_PREFIX = '#$#';
const MCP_MULTILINE_PREFIX = '#$#*';
const MCP_MULTILINE_CLOSE_PREFIX = '#$#:';

type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

export function parseMcpLine(rawLine: string): ParsedMcpLine {
  const line = rawLine.trimEnd();

  if (line.startsWith(MCP_MULTILINE_PREFIX)) {
    const continuation = parseMcpMultilineContinuation(line);
    return continuation.ok
      ? { type: 'multiline-continuation', continuation: continuation.value }
      : { type: 'invalid', raw: rawLine, error: continuation.error };
  }

  if (line.startsWith(MCP_MULTILINE_CLOSE_PREFIX)) {
    const closure = parseMcpMultilineClose(line);
    return closure.ok
      ? { type: 'multiline-close', closure: closure.value }
      : { type: 'invalid', raw: rawLine, error: closure.error };
  }

  const message = parseMcpMessageResult(line);
  return message.ok
    ? { type: 'message', message: message.value }
    : { type: 'invalid', raw: rawLine, error: message.error };
}

export function parseMcpMessage(message: string): McpMessage | null {
  const parsed = parseMcpMessageResult(message.trimEnd());
  if (!parsed.ok) {
    console.log(parsed.error);
    return null;
  }
  return parsed.value;
}

export function parseMcpMultiline(message: string): McpMessage | null {
  const line = message.trimEnd();

  if (line.startsWith(MCP_MULTILINE_CLOSE_PREFIX)) {
    const parsed = parseMcpMultilineClose(line);
    if (!parsed.ok) {
      console.log(parsed.error);
      return null;
    }
    return { name: parsed.value.tag, keyvals: {} };
  }

  const parsed = parseMcpMultilineContinuation(line);
  if (!parsed.ok) {
    console.log(parsed.error);
    return null;
  }
  return { name: parsed.value.tag, keyvals: parsed.value.keyvals };
}

export function encodeMcpMessage(
  command: string,
  authKey: string | null,
  data?: McpOutboundData,
): string {
  const encodedData = encodeMcpData(data);
  const authPart = authKey ? ` ${authKey}` : '';
  const dataPart = encodedData ? ` ${encodedData}` : '';

  return `${MCP_PREFIX}${command}${authPart}${dataPart}`;
}

export function encodeMcpMultilineLine(tag: string, key: string, value: string): string {
  return `${MCP_MULTILINE_PREFIX} ${tag} ${key}: ${value}`;
}

export function encodeMcpMultilineClose(tag: string): string {
  return `${MCP_MULTILINE_CLOSE_PREFIX} ${tag}`;
}

function parseMcpMessageResult(message: string): ParseResult<McpMessage> {
  if (!message.startsWith(MCP_PREFIX) || message.startsWith(MCP_MULTILINE_PREFIX)) {
    return {
      ok: false,
      error: `Invalid MCP message: expected '${MCP_PREFIX}' prefix. Got '${message}'`,
    };
  }

  let cursor = MCP_PREFIX.length;
  const name = readToken(message, cursor);
  if (!name) {
    return { ok: false, error: `Invalid MCP message: missing message name. Got '${message}'` };
  }
  cursor = name.end;
  cursor = skipWhitespace(message, cursor);

  let authKey: string | undefined;
  const nextToken = readToken(message, cursor);
  if (nextToken && !nextToken.value.endsWith(':')) {
    authKey = nextToken.value;
    cursor = skipWhitespace(message, nextToken.end);
  }

  const keyvals = parseKeyvals(message.slice(cursor));
  if (!keyvals.ok) {
    return { ok: false, error: `Invalid MCP message '${name.value}': ${keyvals.error}` };
  }

  return {
    ok: true,
    value: {
      name: name.value,
      authKey,
      keyvals: keyvals.value,
    },
  };
}

function parseMcpMultilineContinuation(message: string): ParseResult<McpMultilineContinuation> {
  const match = message.match(/^#\$#\*\s+(\S+)\s+([^:\s]+)\s*:\s*(.*)$/);
  if (!match) {
    return {
      ok: false,
      error: `Invalid MCP multiline continuation. Got '${message}'`,
    };
  }

  const tag = match[1];
  const key = match[2];
  const value = match[3];

  return {
    ok: true,
    value: {
      tag,
      key,
      value,
      keyvals: { [key]: value },
    },
  };
}

function parseMcpMultilineClose(message: string): ParseResult<McpMultilineClose> {
  const match = message.match(/^#\$#:\s+(\S+)\s*$/);
  if (!match) {
    return {
      ok: false,
      error: `Invalid MCP multiline close. Got '${message}'`,
    };
  }

  return {
    ok: true,
    value: {
      tag: match[1],
      keyvals: {},
    },
  };
}

function parseKeyvals(input: string): ParseResult<MCPKeyvals> {
  const keyvals: MCPKeyvals = {};
  let cursor = skipWhitespace(input, 0);

  while (cursor < input.length) {
    const keyStart = cursor;
    while (cursor < input.length && input[cursor] !== ':' && !isWhitespace(input[cursor])) {
      cursor += 1;
    }

    const key = input.slice(keyStart, cursor);
    if (!key) {
      return { ok: false, error: `expected key at '${input.slice(cursor)}'` };
    }

    cursor = skipWhitespace(input, cursor);
    if (input[cursor] !== ':') {
      return { ok: false, error: `expected ':' after key '${key}'` };
    }
    cursor += 1;
    cursor = skipWhitespace(input, cursor);

    const value = readValue(input, cursor);
    if (!value.ok) {
      return value;
    }
    cursor = value.value.end;

    if (Object.hasOwn(keyvals, key)) {
      return { ok: false, error: `duplicate key '${key}'` };
    }
    keyvals[key] = value.value.value;
    cursor = skipWhitespace(input, cursor);
  }

  return { ok: true, value: keyvals };
}

function readValue(input: string, cursor: number): ParseResult<{ value: string; end: number }> {
  if (cursor >= input.length) {
    return { ok: true, value: { value: '', end: cursor } };
  }

  if (input[cursor] !== '"') {
    const start = cursor;
    while (cursor < input.length && !isWhitespace(input[cursor])) {
      cursor += 1;
    }
    return { ok: true, value: { value: input.slice(start, cursor), end: cursor } };
  }

  cursor += 1;
  let value = '';
  while (cursor < input.length) {
    const char = input[cursor];
    if (char === '"') {
      return { ok: true, value: { value, end: cursor + 1 } };
    }
    if (char === '\\') {
      if (cursor + 1 >= input.length) {
        return { ok: false, error: 'unterminated escape in quoted value' };
      }
      value += input[cursor + 1];
      cursor += 2;
      continue;
    }
    value += char;
    cursor += 1;
  }

  return { ok: false, error: 'unterminated quoted value' };
}

function encodeMcpData(data?: McpOutboundData): string {
  if (data === undefined) {
    return '';
  }

  if (typeof data === 'string') {
    return data.trim();
  }

  return Object.entries(data)
    .map(([key, value]) => `${key}: ${encodeMcpValue(value)}`)
    .join(' ');
}

function encodeMcpValue(value: McpOutboundValue): string {
  if (value === null || value === undefined || value === '') {
    return '""';
  }

  const text = String(value);
  if (!/[\s"\\]/.test(text)) {
    return text;
  }

  return `"${text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function readToken(input: string, cursor: number): { value: string; end: number } | null {
  const start = cursor;
  while (cursor < input.length && !isWhitespace(input[cursor])) {
    cursor += 1;
  }

  if (cursor === start) {
    return null;
  }

  return { value: input.slice(start, cursor), end: cursor };
}

function skipWhitespace(input: string, cursor: number): number {
  while (cursor < input.length && isWhitespace(input[cursor])) {
    cursor += 1;
  }
  return cursor;
}

function isWhitespace(char: string | undefined): boolean {
  return char === ' ' || char === '\t' || char === '\r' || char === '\n';
}
