import { createFileTransfers } from '../fileTransfer/createFileTransfers';
import type { GMCPClientFileTransfer } from '../gmcp/Client/FileTransfer';
/** A complete legacy transport, including its receiver and isolated legacy database. */
export function createLegacyService(gmcp: GMCPClientFileTransfer) { return createFileTransfers(gmcp); }
