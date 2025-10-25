import { BotDifficulty } from "../api-interfaces";

export interface InGameClientToServerEvents {
  startGame: () => void;
  playTile: (params: { tileId: string; pos: [number, number] }) => void;
  updateTileBar: (tileIds: Array<string>) => void;
  setReady: (ready: boolean) => void;
  addBot: () => void;
  removeBot: (botId: string) => void;
  setBotDifficulty: (params: {
    botId: string;
    difficulty: BotDifficulty;
  }) => void;
}

export type ClientToServerEvents = {
  leaveGame: () => void;
  joinGame: (gameId: string) => void;
  newGame: (name: string) => void;
  joinServer: (userInfo: { id?: string; name: string }) => void;
} & InGameClientToServerEvents;
