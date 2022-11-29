import { XWord, Direction, XWordEntry, getEntry } from '@nx/api-interfaces';

export const entryContainsCell = (
  entry: XWordEntry,
  cell: [number, number]
): boolean => {
  const [row, col] = cell;

  if (row === entry.row && entry.direction === Direction.ACROSS) {
    return entry.col <= col && col < entry.col + entry.length;
  }

  if (col === entry.col && entry.direction === Direction.DOWN) {
    return entry.row <= row && row < entry.row + entry.length;
  }

  return false;
};

export const getCrossingEntryIndex = (
  currentEntry: XWordEntry,
  currentCell: [number, number],
  entries: Array<XWordEntry>
): number => {
  const desiredDirection = flipDirection(currentEntry.direction);

  return entries.findIndex(
    (entry) =>
      entry.direction === desiredDirection &&
      entryContainsCell(entry, currentCell)
  );
};

export const getFirstEmptyCell = (
  xWord: XWord,
  entry: XWordEntry
): [number, number] => {
  const entryString = getEntry(xWord, entry);

  const spaceIndex = entryString.indexOf(' ');

  if (spaceIndex === -1) {
    return [entry.row, entry.col];
  }

  if (entry.direction === Direction.DOWN) {
    return [entry.row + spaceIndex, entry.col];
  }

  return [entry.row, entry.col + spaceIndex];
};

export const filterEntriesByDirection = (
  entries: Array<XWordEntry>,
  direction: Direction
) => {
  return entries.filter((entry) => entry.direction === direction);
};

const flipDirection = (direction: Direction) => {
  if (direction === Direction.ACROSS) {
    return Direction.DOWN;
  }

  return Direction.ACROSS;
};

const computeEntryIndex = (
  entries: Array<XWordEntry>,
  currentEntryIndex: number,
  next: (current: number) => number,
  flipPoint: number
) => {
  let nextEntryIndex = next(currentEntryIndex);
  let requireIncomplete = true;

  if (entries.every((entry) => entry.isComplete)) {
    requireIncomplete = false;
  }

  let desiredDirection = entries[currentEntryIndex].direction;

  for (;;) {
    const entry = entries[nextEntryIndex];

    if (nextEntryIndex === flipPoint) {
      desiredDirection = flipDirection(desiredDirection);
    }

    // TODO: this is gross and hard to read
    if (requireIncomplete) {
      if (entry.direction === desiredDirection && !entry.isComplete) {
        return nextEntryIndex;
      }
    } else if (entry.direction === desiredDirection) {
      return nextEntryIndex;
    }

    nextEntryIndex = next(nextEntryIndex);
  }
};

export const computeNextEntryIndex = (
  currentEntryIndex: number,
  xWord: XWord
) => {
  return computeEntryIndex(
    xWord.entries,
    currentEntryIndex,
    (index) => (index + 1) % xWord.entries.length,
    0
  );
};

export const computePreviousEntryIndex = (
  currentEntryIndex: number,
  xWord: XWord
) => {
  const entriesLen = xWord.entries.length;

  return computeEntryIndex(
    xWord.entries,
    currentEntryIndex,
    (index) => (index - 1 + entriesLen) % entriesLen,
    entriesLen - 1
  );
};
