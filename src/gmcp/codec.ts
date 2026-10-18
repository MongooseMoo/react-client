export interface GmcpMessageAddress {
  packageName: string;
  messageType: string;
}

export type GmcpPayload = unknown;

export function parseGmcpMessageAddress(gmcpPackage: string): GmcpMessageAddress | null {
  const lastDot = gmcpPackage.lastIndexOf('.');
  if (lastDot <= 0 || lastDot === gmcpPackage.length - 1) {
    return null;
  }

  return {
    packageName: gmcpPackage.substring(0, lastDot),
    messageType: gmcpPackage.substring(lastDot + 1),
  };
}

export function parseGmcpPayload(gmcpMessage: string | undefined): GmcpPayload {
  if (gmcpMessage === undefined || gmcpMessage.trim() === '') {
    return {};
  }

  return JSON.parse(gmcpMessage) as GmcpPayload;
}

export function encodeGmcpPayload(data?: unknown): string {
  return typeof data === 'string' ? data : JSON.stringify(data ?? {});
}
