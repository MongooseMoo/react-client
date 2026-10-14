import { create } from "zustand";

/**
 * Identity and location of the current session: who we are (playerId/playerName)
 * and which room we're in (roomId). The last residents of the old client.worldData
 * bag. Char.Name sets the player; Room.Info and Client.Spatial set the room id.
 * Read via getState() or selector hooks in React.
 */
interface SessionState {
  playerId: string;
  playerName: string;
  playerUuid: string;
  roomId: string;
  setPlayer: (playerId: string, playerName: string, playerUuid?: string) => void;
  setRoomId: (roomId: string) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  playerId: "",
  playerName: "",
  playerUuid: "",
  roomId: "",
  setPlayer: (playerId, playerName, playerUuid = "") => set({ playerId, playerName, playerUuid }),
  setRoomId: (roomId) => set({ roomId }),
  reset: () => set({ playerId: "", playerName: "", playerUuid: "", roomId: "" }),
}));

