export interface SupportRequest {
  readonly version: 1;
  readonly requestId: string;
  readonly reason?: 'missing' | 'stale';
}

// biome-ignore lint/suspicious/noConfusingVoidType: Generated protocol methods accept no argument for void payloads.
export type PlaybackSupportEcho = { readonly requestId: string } | void;

const requestIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function validateSupportRequestId(value: unknown): asserts value is string {
  if (typeof value !== 'string' || !requestIdPattern.test(value))
    throw new TypeError('Invalid playback support request ID');
}

/** Apply to the original JSON payload, before parsing can discard whitespace/escapes. */
export function validSupportRequestPayload(payload: string | undefined): boolean {
  return typeof payload === 'string' && payload.length <= 256 && !/[\u0080-\uffff]/.test(payload);
}

export function decodeSupportRequest(raw: unknown): SupportRequest {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw))
    throw new TypeError('SupportRequest requires an object');
  const value = raw as Record<string, unknown>;
  if (Object.keys(value).some((key) => !['version', 'requestId', 'reason'].includes(key)) || value.version !== 1)
    throw new TypeError('Invalid SupportRequest fields');
  validateSupportRequestId(value.requestId);
  if ('reason' in value) {
    const reason = value.reason;
    if (reason !== 'missing' && reason !== 'stale') throw new TypeError('Invalid SupportRequest reason');
    return { version: 1, requestId: value.requestId, reason };
  }
  return { version: 1, requestId: value.requestId };
}

export function validateAdvertisedModules(modules: unknown): string[] {
  if (!Array.isArray(modules) || modules.length > 64)
    throw new TypeError('Playback support requires at most 64 advertised modules');
  const names = new Set<string>();
  for (const entry of modules) {
    const match = typeof entry === 'string' && /^([A-Za-z][A-Za-z0-9_.-]{0,63}) ([1-9][0-9]{0,4})$/.exec(entry);
    if (!match || Number(match[2]) > 65535 || names.has(match[1].toLowerCase()))
      throw new TypeError('Invalid or duplicate advertised module');
    names.add(match[1].toLowerCase());
  }
  return [...modules] as string[];
}
