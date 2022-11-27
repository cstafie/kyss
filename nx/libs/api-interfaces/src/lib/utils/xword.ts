import { XWordEntry, Direction, XWord } from '../api-interfaces';

export const isEntryComplete = (xWord: XWord, entry: XWordEntry) => {
  const entryString = getEntry(xWord, entry);
  return !entryString.includes(' ');
};

const getAcrossEntry = (xWord: XWord, acrossEntry: XWordEntry) => {
  const row = acrossEntry.row;
  const chars: Array<string> = [];

  for (
    let col = acrossEntry.col;
    col < acrossEntry.col + acrossEntry.length;
    col++
  ) {
    chars.push(xWord.grid[row][col].char);
  }

  return chars.join('');
};

const getDownEntry = (xWord: XWord, downEntry: XWordEntry) => {
  const col = downEntry.col;
  const chars: Array<string> = [];

  for (let row = downEntry.row; row < downEntry.row + downEntry.length; row++) {
    chars.push(xWord.grid[row][col].char);
  }

  return chars.join('');
};

const getEntry = (xWord: XWord, entry: XWordEntry) => {
  if (entry.direction === Direction.DOWN) {
    return getDownEntry(xWord, entry);
  }

  return getAcrossEntry(xWord, entry);
};
