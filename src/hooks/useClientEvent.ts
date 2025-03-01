import { useEffect, useState } from 'react';
import MudClient from '../client';
import { UserlistPlayer } from '../mcp';

// Define the file transfer offer interface
export interface FileTransferOffer {
  sender: string;
  hash: string;
  filename: string;
  filesize: number;
  offerSdp: string;
}

// Define all client event types
export type ClientEventMap = {
  userlist: UserlistPlayer[];
  disconnect: boolean;
  fileTransferOffer: FileTransferOffer;
  connectionChange: boolean;
  autosayChanged: boolean;
  statustext: string;
  // Add other events as needed
}

export function useClientEvent<K extends keyof ClientEventMap>(
  client: MudClient | null,
  event: K,
  initialValue: ClientEventMap[K] | null
): ClientEventMap[K] | null {
  const [value, setValue] = useState<ClientEventMap[K] | null>(initialValue);

  useEffect(() => {
    if (!client) {
      setValue(initialValue);
      return () => {};
    }

    const handler = (newValue: ClientEventMap[K]) => {
      setValue(newValue);
    };
    client.on(event, handler);
    return () => {
      client.off(event, handler);
    };
  }, [client, event, initialValue]);

  return value;
}
