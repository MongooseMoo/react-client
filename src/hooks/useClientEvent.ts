import { useState, useEffect } from 'react'
import MudClient from '../client'

export function useClientEvent<T>(
  client: MudClient, 
  event: string,
  initialValue: T
): T {
  const [value, setValue] = useState<T>(initialValue)

  useEffect(() => {
    const handler = (newValue: T) => setValue(newValue)
    client.on(event, handler)
    return () => client.off(event, handler)
  }, [client, event])

  return value
}
