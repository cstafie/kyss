import { XWord, Tile, Direction } from '../types';
import { charToTile } from '../utils';

const mapGrid = (grid: Array<Array<string>>): Array<Array<Tile>> => {
  return grid.map((row) => row.map((s) => charToTile(s)));
};

const emptyGrid = (grid: Array<Array<string>>): Array<Array<string>> => {
  return grid.map((row) => row.map((s) => (s === '#' ? s : ' ')));
};

export const xword7x7: XWord = {
  grid: mapGrid([
    ['G', 'O', 'W', '#', 'A', 'A', 'U'],
    ['D', 'R', 'I', '#', 'T', 'R', 'H'],
    ['N', 'Y', 'M', 'P', 'H', 'O', 'S'],
    ['#', '#', 'P', 'E', 'R', '#', '#'],
    ['M', 'I', 'O', 'C', 'E', 'N', 'E'],
    ['S', 'T', 'L', '#', 'A', 'E', 'A'],
    ['U', 'I', 'E', '#', 'T', 'Z', 'U'],
  ]),
  width: 7,
  height: 7,
  entries: [
    {
      row: 0,
      col: 0,
      direction: Direction.ACROSS,
      length: 3,
      number: 1,
      clue: 'Playwright James or Ronald',
    },
    {
      row: 0,
      col: 0,
      direction: Direction.DOWN,
      length: 3,
      number: 1,
      clue: 'Eden, e.g.: Abbr.',
    },
    {
      row: 0,
      col: 1,
      direction: Direction.DOWN,
      length: 3,
      number: 2,
      clue: 'Suffix with audit or transit',
    },
    {
      row: 0,
      col: 2,
      direction: Direction.DOWN,
      length: 7,
      number: 3,
      clue: 'Street of the Barretts',
    },
    {
      row: 0,
      col: 4,
      direction: Direction.ACROSS,
      length: 3,
      number: 4,
      clue: "Track's governing org.",
    },
    {
      row: 0,
      col: 4,
      direction: Direction.DOWN,
      length: 7,
      number: 4,
      clue: 'Pose ___ (endanger)',
    },
    {
      row: 0,
      col: 5,
      direction: Direction.DOWN,
      length: 3,
      number: 5,
      clue: 'Orinoco feeder',
    },
    {
      row: 0,
      col: 6,
      direction: Direction.DOWN,
      length: 3,
      number: 6,
      clue: 'Relatives of ers',
    },
    {
      row: 1,
      col: 0,
      direction: Direction.ACROSS,
      length: 3,
      number: 7,
      clue: 'Bacheller hero',
    },
    {
      row: 1,
      col: 4,
      direction: Direction.ACROSS,
      length: 3,
      number: 8,
      clue: 'Abbr. for royal personages',
    },
    {
      row: 2,
      col: 0,
      direction: Direction.ACROSS,
      length: 7,
      number: 9,
      clue: 'Lolitas',
    },
    {
      row: 2,
      col: 3,
      direction: Direction.DOWN,
      length: 3,
      number: 10,
      clue: "Muscle-builder's pride",
    },
    {
      row: 3,
      col: 2,
      direction: Direction.ACROSS,
      length: 3,
      number: 11,
      clue: '___ usual',
    },
    {
      row: 4,
      col: 0,
      direction: Direction.DOWN,
      length: 3,
      number: 12,
      clue: 'U.S.C. defeater in the 1988 Rose Bowl',
    },
    {
      row: 4,
      col: 0,
      direction: Direction.ACROSS,
      length: 7,
      number: 12,
      clue: 'A Tertiary epoch',
    },
    {
      row: 4,
      col: 1,
      direction: Direction.DOWN,
      length: 3,
      number: 13,
      clue: '"What was ___ was saying?"',
    },
    {
      row: 4,
      col: 5,
      direction: Direction.DOWN,
      length: 3,
      number: 14,
      clue: "Cyrano's nose",
    },
    {
      row: 4,
      col: 6,
      direction: Direction.DOWN,
      length: 3,
      number: 15,
      clue: 'Semisweet liqueur',
    },
    {
      row: 5,
      col: 0,
      direction: Direction.ACROSS,
      length: 3,
      number: 16,
      clue: 'Cap initials at Busch Stadium',
    },
    {
      row: 5,
      col: 4,
      direction: Direction.ACROSS,
      length: 3,
      number: 17,
      clue: "Actors' org.",
    },
    {
      row: 6,
      col: 0,
      direction: Direction.ACROSS,
      length: 3,
      number: 18,
      clue: 'Turnabout, for short',
    },
    {
      row: 6,
      col: 4,
      direction: Direction.ACROSS,
      length: 3,
      number: 19,
      clue: "China's Lao-___",
    },
  ],
};

export const empty7x7: XWord = {
  ...xword7x7,
  grid: mapGrid(
    emptyGrid([
      ['G', 'O', 'W', '#', 'A', 'A', 'U'],
      ['D', 'R', 'I', '#', 'T', 'R', 'H'],
      ['N', 'Y', 'M', 'P', 'H', 'O', 'S'],
      ['#', '#', 'P', 'E', 'R', '#', '#'],
      ['M', 'I', 'O', 'C', 'E', 'N', 'E'],
      ['S', 'T', 'L', '#', 'A', 'E', 'A'],
      ['U', 'I', 'E', '#', 'T', 'Z', 'U'],
    ])
  ),
};
