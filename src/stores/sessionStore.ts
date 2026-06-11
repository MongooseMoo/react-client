import { create } from "zustand";

/**
 * Identity and location of the current session: who we are (playerId/playerName)
 * and which room we're in (roomId). The last residents of the old client.worldData
 * bag. Char.Name sets the player; Room.Info and Client.Spatial set the room id.
 * Read via getState() (e.g. FileTransferManager) or selector hooks in React.
 */
interface SessionState {
  playerId: string;
  playerName: string;
  roomId: string;
  setPlayer: (playerId: string, playerName: string) => void;
  setRoomId: (roomId: string) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  playerId: "",
  playerName: "",
  roomId: "",
  setPlayer: (playerId, playerName) => set({ playerId, playerName }),
  setRoomId: (roomId) => set({ roomId }),
  reset: () => set({ playerId: "", playerName: "", roomId: "" }),
}));

