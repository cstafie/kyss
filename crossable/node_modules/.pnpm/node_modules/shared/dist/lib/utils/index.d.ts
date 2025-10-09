import { Tile, XWord } from "../api-interfaces";
export declare const charToTile: (char: string) => {
    id: `${string}-${string}-${string}-${string}-${string}`;
    char: string;
};
export declare const mapGrid: (grid: Array<Array<string>>) => Array<Array<Tile>>;
export declare const emptyGrid: (grid: Array<Array<Tile>>) => Array<Array<Tile>>;
export declare const sameXWord: (filled: XWord, partial: XWord) => boolean;
export declare const countEmpty: (xWord: XWord) => number;
export declare function shuffleArray<T>(array: Array<T>): void;
export declare function random(n: number): number;
export declare function randomInRange(a: number, b: number): number;
export declare function get1Random<T>(a: T[]): T;
export declare function getNRandom<T>(a: T[], n?: number): Array<T>;
