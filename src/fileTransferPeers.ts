import type { UserlistPlayer } from "./mcp";

export interface TransferPeer {
  id: string;
  label: string;
  transferAddress: string;
  away: boolean;
  idle: boolean;
}

export function userlistPlayersToTransferPeers(
  players: UserlistPlayer[]
): TransferPeer[] {
  return players
    .filter((player) => player.Name && player.Object)
    .map((player) => ({
      id: String(player.Object),
      label: player.Name,
      transferAddress: player.Name,
      away: player.away,
      idle: player.idle,
    }));
}

export function findTransferPeerByAddress(
  peers: TransferPeer[],
  address: string
): TransferPeer | null {
  const normalizedAddress = address.trim().toLowerCase();
  if (!normalizedAddress) {
    return null;
  }

  return (
    peers.find(
      (peer) =>
        peer.transferAddress.toLowerCase() === normalizedAddress ||
        peer.id.toLowerCase() === normalizedAddress ||
        peer.label.toLowerCase() === normalizedAddress
    ) ?? null
  );
}
