import { useEffect, useState } from 'react';
import type MudClient from '../client';
import type { UserlistPlayer } from '../mcp';

// Define all client event types
export type ClientEventMap = {
  userlist: UserlistPlayer[];
  disconnect: boolean;
  connectionChange: boolean;
  autosayChanged: boolean;
  statustext: string;
  // Add other events as needed
};

export function useClientEvent<K extends keyof ClientEventMap>(
  client: MudClient | null,
  event: K,
  initialValue: ClientEventMap[K],
): ClientEventMap[K];

export function useClientEvent<K extends keyof ClientEventMap>(
  client: MudClient | null,
  event: K,
  initialValue: null,
): ClientEventMap[K] | null;

export function useClientEvent<K extends keyof ClientEventMap>(
  client: MudClient | null,
  event: K,
  initialValue: ClientEventMap[K] | null,
): ClientEventMap[K] | null {
  const [value, setValue] = useState<ClientEventMap[K] | null>(initialValue);

  useEffect(() => {
    if (!client) return () => {};

    const handler = (newValue: ClientEventMap[K]) => {
      setValue(newValue);
    };
    client.on(event, handler);
    return () => {
      client.off(event, handler);
    };
  }, [client, event]);

  return value;
}
