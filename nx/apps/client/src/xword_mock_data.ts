import { XWord } from './types';
import { charToTile } from './utils';

export const xword: XWord = {
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

export const emptyXword: XWord = {
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

// console.log(
//   xword.grid.map((row) => row.map((char) => (char === '#' ? '#' : ' ')))
// );
