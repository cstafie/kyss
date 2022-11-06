import { v4 as uuidv4 } from 'uuid';
import { Tile } from './api-interfaces';

export const charToTile = (char: string) => ({ id: uuidv4(), char });

export const mapGrid = (grid: Array<Array<string>>): Array<Array<Tile>> => {
  return grid.map((row) => row.map((s) => charToTile(s)));
};

export const emptyGrid = (grid: Array<Array<string>>): Array<Array<string>> => {
  return grid.map((row) => row.map((s) => (s === '#' ? s : ' ')));
};
