import { XWordEntry, Direction, XWord, Tile, Cell } from '../api-interfaces';
export declare const flipDirection: (direction: Direction) => string;
export declare const entryContainsCell: (entry: XWordEntry, cell: Cell) => boolean;
export declare const getCrossingEntryIndex: (currentEntry: XWordEntry, currentCell: Cell, entries: Array<XWordEntry>) => number;
export declare const isEntryComplete: (xWord: XWord, entry: XWordEntry) => boolean;
export declare const getEntry: (xWord: XWord, entry: XWordEntry) => string;
export declare const getRow: (xWord: XWord, row: number) => Array<Tile>;
export declare const getCol: (xWord: XWord, col: number) => Array<Tile>;
