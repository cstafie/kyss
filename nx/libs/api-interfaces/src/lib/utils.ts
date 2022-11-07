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
