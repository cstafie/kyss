"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCol = exports.getRow = exports.getEntry = exports.isEntryComplete = exports.getCrossingEntryIndex = exports.entryContainsCell = exports.flipDirection = void 0;
const api_interfaces_1 = require("../api-interfaces");
const flipDirection = (direction) => {
    if (direction === api_interfaces_1.Direction.across) {
        return api_interfaces_1.Direction.down;
    }
    return api_interfaces_1.Direction.across;
};
exports.flipDirection = flipDirection;
const entryContainsCell = (entry, cell) => {
    const { row, col } = cell;
    if (row === entry.cell.row && entry.direction === api_interfaces_1.Direction.across) {
        return entry.cell.col <= col && col < entry.cell.col + entry.length;
    }
    if (col === entry.cell.col && entry.direction === api_interfaces_1.Direction.down) {
        return entry.cell.row <= row && row < entry.cell.row + entry.length;
    }
    return false;
};
exports.entryContainsCell = entryContainsCell;
const getCrossingEntryIndex = (currentEntry, currentCell, entries) => {
    const desiredDirection = (0, exports.flipDirection)(currentEntry.direction);
    return entries.findIndex((entry) => entry.direction === desiredDirection &&
        (0, exports.entryContainsCell)(entry, currentCell));
};
exports.getCrossingEntryIndex = getCrossingEntryIndex;
const isEntryComplete = (xWord, entry) => {
    const entryString = (0, exports.getEntry)(xWord, entry);
    return !entryString.includes(' ');
};
exports.isEntryComplete = isEntryComplete;
const getAcrossEntry = (xWord, acrossEntry) => {
    const row = acrossEntry.cell.row;
    const chars = [];
    for (let col = acrossEntry.cell.col; col < acrossEntry.cell.col + acrossEntry.length; col++) {
        chars.push(xWord.grid[row][col].char);
    }
    return chars.join('');
};
const getDownEntry = (xWord, downEntry) => {
    const col = downEntry.cell.col;
    const chars = [];
    for (let row = downEntry.cell.row; row < downEntry.cell.row + downEntry.length; row++) {
        chars.push(xWord.grid[row][col].char);
    }
    return chars.join('');
};
const getEntry = (xWord, entry) => {
    if (entry.direction === api_interfaces_1.Direction.down) {
        return getDownEntry(xWord, entry);
    }
    return getAcrossEntry(xWord, entry);
};
exports.getEntry = getEntry;
const getRow = (xWord, row) => {
    return xWord.grid[row].slice();
};
exports.getRow = getRow;
const getCol = (xWord, col) => {
    const result = [];
    for (let row = 0; row < xWord.height; row++) {
        result.push(xWord.grid[row][col]);
    }
    return result;
};
exports.getCol = getCol;
