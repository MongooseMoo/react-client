export type MCPKeyvals = Record<string, string>;

export type McpOutboundValue = string | number | boolean | null | undefined;

export type McpOutboundKeyvals = Record<string, McpOutboundValue>;

export type McpOutboundData = string | McpOutboundKeyvals;

export interface McpMessage {
  name: string;
  authKey?: string;
  keyvals: MCPKeyvals;
}

export interface McpMultilineContinuation {
  tag: string;
  key: string;
  value: string;
  keyvals: MCPKeyvals;
}

export interface McpMultilineClose {
  tag: string;
  keyvals: MCPKeyvals;
}

export type ParsedMcpLine =
  | { type: 'message'; message: McpMessage }
  | { type: 'multiline-continuation'; continuation: McpMultilineContinuation }
  | { type: 'multiline-close'; closure: McpMultilineClose }
  | { type: 'invalid'; raw: string; error: string };

export interface EditorSession {
  name: string;
  reference: string;
  type: string;
  contents: string[];
}
