import { v4 as uuidv4 } from 'uuid';
import { Tile, XWord } from '../api-interfaces';

export const charToTile = (char: string) => ({ id: uuidv4(), char });

export const mapGrid = (grid: Array<Array<string>>): Array<Array<Tile>> => {
  return grid.map((row) => row.map((s) => charToTile(s)));
};

export const emptyGrid = (grid: Array<Array<Tile>>): Array<Array<Tile>> => {
  return grid.map((row) =>
    row.map((s) => (s.char === '#' ? s : charToTile(' ')))
  );
};

export const sameXWord = (filled: XWord, partial: XWord): boolean => {
  const flatFilled = filled.grid.flat();

  for (const [i, tile] of partial.grid.flat().entries()) {
    if (tile.char === ' ' || tile.char === '#') {
      continue;
    }

    if (tile.char !== flatFilled[i].char) {
      return false;
    }
  }

  return true;
};

export const countEmpty = (xWord: XWord) => {
  return xWord.grid.flat().reduce((acc, tile) => {
    if (tile.char === ' ') {
      acc++;
    }

    return acc;
  }, 0);
};

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

export function shuffleArray<T>(array: Array<T>) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

export function random(n: number) {
  return Math.floor(Math.random() * n);
}

export function getNRandom<T>(a: T[], n: number = a.length): Array<T> {
  const aCopy = a.slice();
  const nRandom: Array<T> = [];

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

    nRandom.push(aCopy.pop() as T);
  }

  return nRandom;
}
