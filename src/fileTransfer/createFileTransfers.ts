/**
 * The file transfer engine as the browser client runs it: signalled over GMCP, linked by
 * WebRTC, pieces kept in IndexedDB, and each received file saved as a download.
 *
 * The client loads this module on demand, so nothing behind it is in the main bundle.
 */
import type { GMCPClientFileTransfer } from '../gmcp/Client/FileTransfer';
import { FileTransferEngine } from './FileTransferEngine';
import { createGmcpTransferSignaling } from './gmcpSignaling';
import { createRtcTransferLinkFactory } from './rtcLink';
import { createIndexedDbTransferStorage } from './storage';
import type { FileTransfers, ReceivedFile } from './types';

export const ICE_CONFIGURATION: RTCConfiguration = {
  iceServers: [
    {
      urls: ['turn:mongoose.world:3478', 'stun:mongoose.world:3478'],
      username: 'p2p',
      credential: 'p2p',
    },
    {
      urls: 'stun:stun.l.google.com:19302',
    },
  ],
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
};

export function createFileTransfers(gmcp: GMCPClientFileTransfer): FileTransfers {
  return new FileTransferEngine({
    signaling: createGmcpTransferSignaling(gmcp),
    storage: createIndexedDbTransferStorage(),
    createLink: createRtcTransferLinkFactory(ICE_CONFIGURATION),
    deliver: saveAsDownload,
  });
}

/** A page cannot write to disk; following a link to the file makes the browser save it. */
function saveAsDownload({ name, blob }: ReceivedFile): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
