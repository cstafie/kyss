"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countEmpty = exports.sameXWord = exports.emptyGrid = exports.mapGrid = exports.charToTile = void 0;
exports.shuffleArray = shuffleArray;
exports.random = random;
exports.randomInRange = randomInRange;
exports.get1Random = get1Random;
exports.getNRandom = getNRandom;
// TODO: this should be class tile with a constructor
const charToTile = (char) => ({ id: crypto.randomUUID(), char });
exports.charToTile = charToTile;
const mapGrid = (grid) => {
    return grid.map((row) => row.map((s) => (0, exports.charToTile)(s)));
};
exports.mapGrid = mapGrid;
const emptyGrid = (grid) => {
    return grid.map((row) => row.map((s) => (s.char === "#" ? s : (0, exports.charToTile)(" "))));
};
exports.emptyGrid = emptyGrid;
const sameXWord = (filled, partial) => {
    const flatFilled = filled.grid.flat();
    for (const [i, tile] of partial.grid.flat().entries()) {
        if (tile.char === " " || tile.char === "#") {
            continue;
        }
        if (tile.char !== flatFilled[i].char) {
            return false;
        }
    }
    return true;
};
exports.sameXWord = sameXWord;
const countEmpty = (xWord) => {
    return xWord.grid.flat().reduce((acc, tile) => {
        if (tile.char === " ") {
            acc++;
        }
        return acc;
    }, 0);
};
exports.countEmpty = countEmpty;
// export const hasMoreLetters = (old: XWord, updated: XWord): boolean => {
//   const countReducer = (acc, tile) => {
//     if (tile.char !== ' ' && tile.char !== '#') {
//       acc++;
//     }
//     return acc;
//   };
//   const oldCount = old.grid.flat().reduce(countReducer, 0);
//   const updatedCount = updated.grid.flat().reduce(countReducer, 0);
//   return updatedCount > oldCount;
// };
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
function random(n) {
    return Math.floor(Math.random() * n);
}
function randomInRange(a, b) {
    return random(b - a) + a;
}
function get1Random(a) {
    return getNRandom(a, 1)[0];
}
function getNRandom(a, n = a.length) {
    const aCopy = a.slice();
    const nRandom = [];
    for (let i = 0; i < n; i++) {
        const chosenIndex = random(aCopy.length);
        const lastIndex = aCopy.length - 1;
        // swap
        [aCopy[lastIndex], aCopy[chosenIndex]] = [
            aCopy[chosenIndex],
            aCopy[lastIndex],
        ];
        if (aCopy.length === 0) {
            break;
        }
        nRandom.push(aCopy.pop());
    }
    return nRandom;
}
