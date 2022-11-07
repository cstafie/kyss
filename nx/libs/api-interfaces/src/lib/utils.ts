import { v4 as uuidv4 } from 'uuid';
import { Tile, XWord } from './api-interfaces';

export const charToTile = (char: string) => ({ id: uuidv4(), char });

export const mapGrid = (grid: Array<Array<string>>): Array<Array<Tile>> => {
  return grid.map((row) => row.map((s) => charToTile(s)));
};

export const emptyGrid = (grid: Array<Array<string>>): Array<Array<string>> => {
  return grid.map((row) => row.map((s) => (s === '#' ? s : ' ')));
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

export function shuffleArray<T>(array: Array<T>) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}
