export interface XWord {
    grid: Array<Array<Tile>>;
    width: number;
    height: number;
    entries: Array<XWordEntry>;
}
export interface FeedbackInfo {
    email: string;
    content: string;
    user: User;
}
export interface Tile {
    id: string;
    char: string;
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
export declare const GameState: {
    readonly waitingToStart: "waiting-to-start";
    readonly inProgress: "in-progress";
    readonly complete: "complete";
};
export type GameState = typeof GameState[keyof typeof GameState];
export declare const BotDifficulty: {
    readonly easy: 0;
    readonly medium: 1;
    readonly hard: 2;
};
export type BotDifficulty = typeof BotDifficulty[keyof typeof BotDifficulty];
export declare const Direction: {
    across: string;
    down: string;
};
export type Direction = typeof Direction[keyof typeof Direction];
