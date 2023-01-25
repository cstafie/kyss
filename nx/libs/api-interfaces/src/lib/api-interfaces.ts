export interface XWord {
  grid: Array<Array<Tile>>;
  width: number;
  height: number;
  entries: Array<XWordEntry>;
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

export enum Direction {
  ACROSS = 'across',
  DOWN = 'down',
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

export interface User {
  id: string;
  name: string;
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
  waitingToStart: 'waiting-to-start',
  inProgress: 'in-progress',
  complete: 'complete',
} as const;
export type GameState = typeof GameState[keyof typeof GameState];

export const BotDifficulty = {
  easy: 0,
  medium: 1,
  hard: 2,
} as const;
export type BotDifficulty = typeof BotDifficulty[keyof typeof BotDifficulty];
