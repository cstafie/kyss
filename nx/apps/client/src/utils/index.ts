import { XWord, Direction, XWordEntry } from '@nx/api-interfaces';

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

export const computeNextEntryIndex = (
  currentEntryIndex: number,
  xWord: XWord
) => {
  const currentEntry = xWord.entries[currentEntryIndex];
  const entriesLen = xWord.entries.length;
  let desiredDirection = currentEntry.direction;

  let nextEntryIndex = currentEntryIndex;

  // gross, would prefer while(true)
  for (;;) {
    nextEntryIndex = (nextEntryIndex + 1) % entriesLen;

    // did a full loop (xword should be solved rn)
    if (nextEntryIndex === currentEntryIndex) {
      break;
    }

    // if we go past the end we should check the other direction
    if (nextEntryIndex === 0) {
      desiredDirection = flipDirection(desiredDirection);
    }

    const entry = xWord.entries[nextEntryIndex];

    // if the entry matches direction and is not complete we found it!
    if (entry.direction === desiredDirection && !entry.isComplete) {
      break;
    }
  }

  return nextEntryIndex;
};

export const computerPreviousEntryIndex = (
  currentEntryIndex: number,
  xWord: XWord
) => {
  const currentEntry = xWord.entries[currentEntryIndex];
  const entriesLen = xWord.entries.length;
  let desiredDirection = currentEntry.direction;

  let nextEntryIndex = currentEntryIndex;

  // gross, would prefer while(true)
  for (;;) {
    nextEntryIndex = (nextEntryIndex - 1 + entriesLen) % entriesLen;

    // did a full loop (xword should be solved rn)
    if (nextEntryIndex === currentEntryIndex) {
      break;
    }

    // if we go past the end we should check the other direction
    if (nextEntryIndex === entriesLen - 1) {
      desiredDirection = flipDirection(desiredDirection);
    }

    const entry = xWord.entries[nextEntryIndex];

    // if the entry matches direction and is not complete we found it!
    if (entry.direction === desiredDirection && !entry.isComplete) {
      break;
    }
  }

  return nextEntryIndex;
};
