export interface XWord {
  grid: Array<Array<Tile>>;
  width: number;
  height: number;
  entries: Array<XWordEntry>;
}

export interface Tile {
  id: string;
  char: string;
}

export enum Direction {
  ACROSS = 'across',
  DOWN = 'down',
}

export interface XWordEntry {
  row: number;
  col: number;
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
  xWord: XWord;
  gameState: GameState;
  serializedPlayersMap: string;
  ready: boolean;
  tileBar: Array<Tile>;
  score: number;
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

// TODO: look into this syntax
export const GameState = {
  waitingToStart: 'waiting-to-start',
  inProgress: 'in-progress',
  complete: 'complete',
} as const;

export type GameState = typeof GameState[keyof typeof GameState];
