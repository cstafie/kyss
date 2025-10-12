import { BotDifficulty } from "../api-interfaces";

export interface ClientToServerEvents {
  newGame: (name: string) => void;
  joinServer: (userInfo: { id: string; name: string }) => void;
  joinGame: (gameId: string) => void;
  leaveGame: () => void;
  startGame: () => void;
  playTile: (tileInfo: { id: string; pos: [number, number] }) => void;
  updateTileBar: (tileIds: Array<string>) => void;
  setReady: (ready: boolean) => void;
  addBot: () => void;
  removeBot: (botId: string) => void;
  setBotDifficulty: (botInfo: {
    id: string;
    difficulty: BotDifficulty;
  }) => void;
}
