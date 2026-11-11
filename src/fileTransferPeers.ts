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
    .filter((player) => player.name && player.id)
    .map((player) => ({
      id: player.id,
      label: player.name,
      // Route by MOO object reference, not display name: names can contain spaces or
      // be formatted differently than the underlying object (e.g. "Tangra Guest" vs.
      // the real object "Tangra_Guest"), which made server-side name matching fail
      // silently and drop offers. The object id is unambiguous.
      transferAddress: player.id,
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
