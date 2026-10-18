import { SharingPackage } from '../../fileSharing/gmcpPackage';
import { validatePeer, type PeerInbound, type PeerOutbound } from '../../fileSharing/protocol';
export class GMCPClientPeer extends SharingPackage<PeerInbound,PeerOutbound> {
  override readonly packageName = 'Client.Peer';
  validate<K extends keyof PeerInbound>(kind: K, data: unknown): PeerInbound[K] { return validatePeer(kind,data); }
}
