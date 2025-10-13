import {
  type XWord,
  Direction,
  type XWordEntry,
  getEntry,
  type Cell,
  flipDirection,
} from "shared";

export const makePosString = (pos: [number, number]): string => {
  return `pos:${pos[0]},${pos[1]}`;
};

export const posStringToRowCol = (posString: string): [number, number] => {
  const [rowString, colString] = posString.split(":")[1].split(",");
  return [Number(rowString), Number(colString)];
};

export const getFirstEmptyCell = (
  xWord: XWord,
  entry: XWordEntry
): Cell | null => {
  const entryString = getEntry(xWord, entry);

  const spaceIndex = entryString.indexOf(" ");

  if (spaceIndex === -1) {
    return {
      row: entry.cell.row,
      col: entry.cell.col,
    };
  }

  if (entry.direction === Direction.down) {
    return {
      row: entry.cell.row + spaceIndex,
      col: entry.cell.col,
    };
  }

  return {
    row: entry.cell.row,
    col: entry.cell.col + spaceIndex,
  };
};

export const getNextCellInEntry = (
  entry: XWordEntry,
  currentCell: Cell
): Cell | null => {
  const index =
    entry.direction === Direction.across
      ? currentCell.col - entry.cell.col + 1
      : currentCell.row - entry.cell.row + 1;

  if (index >= entry.length) {
    return null;
  }

  if (entry.direction === Direction.across) {
    return {
      row: entry.cell.row,
      col: entry.cell.col + index,
    };
  }

  return {
    row: entry.cell.row + index,
    col: entry.cell.col,
  };
};

export const getNextEmptyCellInEntry = (
  xWord: XWord,
  entry: XWordEntry,
  currentCell: Cell
): Cell | null => {
  const entryString = getEntry(xWord, entry);

  const startIndex =
    entry.direction === Direction.across
      ? currentCell.col - entry.cell.col + 1
      : currentCell.row - entry.cell.row + 1;

  const spaceIndex = entryString.indexOf(" ", startIndex);

  if (spaceIndex === -1) {
    return null;
  }

  if (entry.direction === Direction.across) {
    return {
      row: entry.cell.row,
      col: entry.cell.col + spaceIndex,
    };
  }

  return {
    row: entry.cell.row + spaceIndex,
    col: entry.cell.col,
  };
};

export const filterEntriesByDirection = (
  entries: Array<XWordEntry>,
  direction: Direction
) => {
  return entries.filter((entry) => entry.direction === direction);
};

const computeEntryIndex = (
  entries: Array<XWordEntry>,
  currentEntryIndex: number,
  next: (current: number) => number,
  flipPoint: number
) => {
  let nextEntryIndex = next(currentEntryIndex);
  const isEveryEntryComplete = entries.every((entry) => entry.isComplete);

  let desiredDirection = entries[currentEntryIndex].direction;

  for (;;) {
    const entry = entries[nextEntryIndex];

    if (nextEntryIndex === flipPoint) {
      desiredDirection = flipDirection(desiredDirection);
    }

    // TODO: this is gross and hard to read
    if (!isEveryEntryComplete) {
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
