import {
  XWord,
  Direction,
  XWordEntry,
  isEntryComplete,
} from '@nx/api-interfaces';
import { EntryType } from 'perf_hooks';

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
  return computeEntryIndex(
    xWord.entries,
    currentEntryIndex,
    (index) => (index - 1 + xWord.entries.length) % xWord.entries.length,
    0
  );
};
