import { BOTS } from "./constants";

export interface XWord {
  grid: Array<Array<Tile>>;
  width: number;
  height: number;
  entries: Array<XWordEntry>;
}

export interface FeedbackInfo {
  email: string;
  content: string;
  userName: string;
}

// export const TileState = {
//   attempted: 'attempted',
//   correct: 'correct',
//   wrong: 'wrong',
// } as const;
// export type TileState = typeof TileState[keyof typeof TileState];

export interface Tile {
  id: string;
  char: string;
  // state: TileState;
}

export interface Cell {
  row: number;
  col: number;
}

export interface XWordEntry {
  cell: Cell;
  direction: Direction;
  length: number;
  number: number;
  clue: string;
  isComplete: boolean;
}

export interface PlayerInfo {
  id: string;
  tileBar: Array<Tile>;
  score: number;
  ready: boolean;
  name: string;
}

export interface BotInfo {
  id: string;
  name: string;
  difficulty: BotDifficulty;
}

export interface PlayerGameUpdate {
  xWord: XWord;
  ready: boolean;
  tileBar: Array<Tile>;
}

export interface ServerGameUpdate {
  id: string;
  xWord: XWord;
  gameState: GameState;
  serializedPlayersMap: string;
  serializedBotsMap: string;
  ready: boolean;
  tileBar: Array<Tile>;
  score: number;
  gameCreatorId: string;
}

export interface GameMetaData {
  createdAt: Date;
  name: string;
  id: string;
  gameState: GameState;
  numberOfPlayers: number;
  creatorName: string;
  creatorId: string;
}

export const GameState = {
  waitingToStart: "waiting-to-start",
  inProgress: "in-progress",
  completed: "completed",
} as const;
export type GameState = (typeof GameState)[keyof typeof GameState];

export type BotDifficulty =
  (typeof BOTS.DIFFICULTIES)[keyof typeof BOTS.DIFFICULTIES];

export const Direction = {
  across: "across",
  down: "down",
};
export type Direction = (typeof Direction)[keyof typeof Direction];
