import { XWord } from '../types';
import { charToTile } from '../utils';

export const xword11x11: XWord = {
  grid: [
    ['H', 'O', 'A', 'R', 'D', 'S', '#', 'C', 'O', 'D', 'A'].map(charToTile),
    ['E', 'N', 'S', 'U', 'R', 'E', '#', 'A', 'P', 'E', 'D'].map(charToTile),
    ['R', 'E', 'S', 'T', 'O', 'R', 'A', 'T', 'I', 'V', 'E'].map(charToTile),
    ['O', 'R', 'E', '#', 'V', 'E', 'X', '#', 'N', 'I', 'P'].map(charToTile),
    ['#', '#', 'V', 'E', 'E', '#', 'E', 'D', 'I', 'C', 'T'].map(charToTile),
    ['A', 'R', 'E', 'A', '#', '#', '#', 'N', 'O', 'E', 'S'].map(charToTile),
    ['D', 'A', 'R', 'T', 'S', '#', 'W', 'A', 'N', '#', '#'].map(charToTile),
    ['V', 'I', 'A', '#', 'U', 'S', 'E', '#', 'A', 'C', 'E'].map(charToTile),
    ['I', 'N', 'T', 'I', 'M', 'I', 'D', 'A', 'T', 'E', 'D'].map(charToTile),
    ['S', 'E', 'E', 'K', '#', 'N', 'E', 'R', 'E', 'I', 'D'].map(charToTile),
    ['E', 'R', 'S', 'E', '#', 'G', 'L', 'A', 'D', 'L', 'Y'].map(charToTile),
  ],
  width: 11,
  height: 11,
};

export const xword9x9: XWord = {
  grid: [
    ['H', 'A', 'U', 'L', 'S', '#', 'M', 'I', 'B'].map(charToTile),
    ['A', 'S', 'S', 'E', 'T', '#', 'U', 'N', 'O'].map(charToTile),
    ['S', 'P', 'E', 'A', 'R', '#', 'T', 'U', 'N'].map(charToTile),
    ['#', '#', '#', 'R', 'E', 'V', 'E', 'R', 'E'].map(charToTile),
    ['S', 'C', 'H', 'N', 'E', 'I', 'D', 'E', 'R'].map(charToTile),
    ['C', 'R', 'E', 'S', 'T', 'S', '#', '#', '#'].map(charToTile),
    ['R', 'U', 'E', '#', 'C', 'A', 'D', 'E', 'T'].map(charToTile),
    ['A', 'D', 'D', '#', 'A', 'G', 'O', 'R', 'A'].map(charToTile),
    ['Y', 'E', 'S', '#', 'R', 'E', 'C', 'A', 'P'].map(charToTile),
  ],
  width: 9,
  height: 9,
};

export const emptyXword9x9: XWord = {
  grid: [
    [' ', ' ', ' ', ' ', ' ', '#', ' ', ' ', ' '].map(charToTile),
    [' ', ' ', ' ', ' ', ' ', '#', ' ', ' ', ' '].map(charToTile),
    [' ', ' ', ' ', ' ', ' ', '#', ' ', ' ', ' '].map(charToTile),
    ['#', '#', '#', ' ', ' ', ' ', ' ', ' ', ' '].map(charToTile),
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '].map(charToTile),
    [' ', ' ', ' ', ' ', ' ', ' ', '#', '#', '#'].map(charToTile),
    [' ', ' ', ' ', '#', ' ', ' ', ' ', ' ', ' '].map(charToTile),
    [' ', ' ', ' ', '#', ' ', ' ', ' ', ' ', ' '].map(charToTile),
    [' ', ' ', ' ', '#', ' ', ' ', ' ', ' ', ' '].map(charToTile),
  ],
  width: 9,
  height: 9,
};
