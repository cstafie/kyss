import { XWordEntry, Direction, XWord, Tile, Cell } from '../api-interfaces';

export const flipDirection = (direction: Direction) => {
  if (direction === Direction.across) {
    return Direction.down;
  }

  return Direction.across;
};

export const entryContainsCell = (entry: XWordEntry, cell: Cell): boolean => {
  const { row, col } = cell;

  if (row === entry.cell.row && entry.direction === Direction.across) {
    return entry.cell.col <= col && col < entry.cell.col + entry.length;
  }

  if (col === entry.cell.col && entry.direction === Direction.down) {
    return entry.cell.row <= row && row < entry.cell.row + entry.length;
  }

  return false;
};

export const getCrossingEntryIndex = (
  currentEntry: XWordEntry,
  currentCell: Cell,
  entries: Array<XWordEntry>
): number => {
  const desiredDirection = flipDirection(currentEntry.direction);

  return entries.findIndex(
    (entry) =>
      entry.direction === desiredDirection &&
      entryContainsCell(entry, currentCell)
  );
};

export const isEntryComplete = (xWord: XWord, entry: XWordEntry) => {
  const entryString = getEntry(xWord, entry);
  return !entryString.includes(' ');
};

const getAcrossEntry = (xWord: XWord, acrossEntry: XWordEntry) => {
  const row = acrossEntry.cell.row;
  const chars: Array<string> = [];

  for (
    let col = acrossEntry.cell.col;
    col < acrossEntry.cell.col + acrossEntry.length;
    col++
  ) {
    chars.push(xWord.grid[row][col].char);
  }

  return chars.join('');
};

const getDownEntry = (xWord: XWord, downEntry: XWordEntry) => {
  const col = downEntry.cell.col;
  const chars: Array<string> = [];

  for (
    let row = downEntry.cell.row;
    row < downEntry.cell.row + downEntry.length;
    row++
  ) {
    chars.push(xWord.grid[row][col].char);
  }

  return chars.join('');
};

export const getEntry = (xWord: XWord, entry: XWordEntry) => {
  if (entry.direction === Direction.down) {
    return getDownEntry(xWord, entry);
  }

  return getAcrossEntry(xWord, entry);
};

export const getRow = (xWord: XWord, row: number): Array<Tile> => {
  return xWord.grid[row].slice();
};

export const getCol = (xWord: XWord, col: number): Array<Tile> => {
  const result = [];

  for (let row = 0; row < xWord.height; row++) {
    result.push(xWord.grid[row][col]);
  }

  return result;
};
