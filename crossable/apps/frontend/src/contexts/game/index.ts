import { createContext } from "react";

import {
  type GameMetaData,
  type PlayerInfo,
  type XWord,
  type GameState,
  type Tile,
  type BotDifficulty,
  type BotInfo,
} from "shared";
import { createSafeUseContext } from "../util";

export interface GameInfo {
  xWord: XWord;
  gameState: GameState;
  players: Map<string, PlayerInfo>;
  bots: Map<string, BotInfo>;
  ready: boolean;
  tileBar: Array<Tile>;
  gameCreatorId: string;
}

interface SocketContextI {
  createGame: () => void;
  playTile: (tileId: string, pos: [number, number]) => void;
  updateTileBar: (tileBar: Array<Tile>) => void;
  joinGame: (gameId: string) => void;
  startGame: () => void;
  leaveGame: () => void;
  setReady: (ready: boolean) => void;
  games: Array<GameMetaData>;
  game: GameInfo | null;
  incorrectPosStrings: Set<string>;
  addBot: () => void;
  removeBot: (botId: string) => void;
  setBotDifficulty: (botId: string, difficulty: BotDifficulty) => void;
}

export const GameContext = createContext<SocketContextI | null>(null);
export const useGame = createSafeUseContext(GameContext, "useGame");
