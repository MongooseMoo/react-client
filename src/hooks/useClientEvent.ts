import { useState, useEffect } from 'react'
import MudClient from '../client'
import { UserlistPlayer } from '../mcp'

type ClientEventMap = {
  userlist: UserlistPlayer[];
  disconnect: boolean;
  fileTransferOffer: boolean;
  // Add other events as needed
}

export function useClientEvent<K extends keyof ClientEventMap>(
  client: MudClient | null, 
  event: K,
  initialValue: ClientEventMap[K]
): ClientEventMap[K] {
  const [value, setValue] = useState<ClientEventMap[K]>(initialValue)

  useEffect(() => {
    if (!client) return;
    
    const handler = (newValue: ClientEventMap[K]) => setValue(newValue)
    client.on(event, handler)
    return () => client.off(event, handler)
  }, [client, event])

  return value
}
