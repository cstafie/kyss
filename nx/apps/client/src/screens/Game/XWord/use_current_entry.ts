import { Cell, XWord, XWordEntry } from '@nx/api-interfaces';
import {
  computeNextEntryIndex,
  computePreviousEntryIndex,
  entryContainsCell,
  getCrossingEntryIndex,
  getFirstEmptyCell,
} from 'apps/client/src/utils';
import { useCallback, useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

interface Result {
  currentEntry: XWordEntry;
  currentCell: Cell;
  handleSelectEntry: (entry: XWordEntry) => void;
  handleSelectCell: (cell: Cell) => void;
}

const useCurrentEntry = (xWord: XWord): Result => {
  const [currentEntryIndex, setCurrentEntryIndex] = useState(
    xWord.entries[0].isComplete ? computeNextEntryIndex(0, xWord) : 0
  );

  const currentEntry = useMemo(
    () => xWord.entries[currentEntryIndex],
    [xWord.entries, currentEntryIndex]
  );

  const [currentCell, setCurrentCell] = useState<Cell>(
    getFirstEmptyCell(xWord, currentEntry)
  );

  const updateCurrentEntryIndex = useCallback(
    (newEntryIndex: number) => {
      setCurrentEntryIndex(newEntryIndex);
      setCurrentCell(getFirstEmptyCell(xWord, xWord.entries[newEntryIndex]));
    },
    [xWord]
  );

  const switchDirection = useCallback(() => {
    const crossingEntryIndex = getCrossingEntryIndex(
      currentEntry,
      currentCell,
      xWord.entries
    );

    crossingEntryIndex === -1
      ? setCurrentEntryIndex(0)
      : setCurrentEntryIndex(crossingEntryIndex);
  }, [currentEntry, currentCell, xWord.entries]);

  const updateCurrentCell = useCallback(
    (newCurrentCell: Cell) => {
      if (
        currentCell.row === newCurrentCell.row &&
        currentCell.col === newCurrentCell.col
      ) {
        switchDirection();
        return;
      }

      setCurrentCell(newCurrentCell);

      if (!entryContainsCell(currentEntry, newCurrentCell)) {
        for (let i = 0; i < xWord.entries.length; i++) {
          const entry = xWord.entries[i];

          if (
            entry.direction === currentEntry.direction &&
            entryContainsCell(entry, newCurrentCell)
          ) {
            setCurrentEntryIndex(i);
          }
        }
      }
    },
    [currentEntry, xWord, switchDirection, currentCell]
  );

  const handleSelectEntry = useCallback(
    (entry: XWordEntry) => {
      const newIndex = xWord.entries.indexOf(entry);
      setCurrentEntryIndex(newIndex);
      setCurrentCell(getFirstEmptyCell(xWord, xWord.entries[newIndex]));
    },
    [xWord]
  );

  useHotkeys(
    'shift+tab',
    (e) => {
      e.preventDefault();
      updateCurrentEntryIndex(
        computePreviousEntryIndex(currentEntryIndex, xWord)
      );
    },
    [currentEntryIndex, xWord]
  );
  useHotkeys(
    'tab',
    (e) => {
      e.preventDefault();
      updateCurrentEntryIndex(computeNextEntryIndex(currentEntryIndex, xWord));
    },
    [currentEntryIndex, xWord]
  );

  useHotkeys(
    'space',
    (e) => {
      e.preventDefault();
      switchDirection();
    },
    [switchDirection]
  );

  useHotkeys(
    'Up',
    (e: KeyboardEvent) => {
      e.preventDefault();
      updateCurrentCell(getNextCellUp(xWord, currentCell));
    },
    [updateCurrentCell, currentCell, xWord]
  );
  useHotkeys(
    'Down',
    (e: KeyboardEvent) => {
      e.preventDefault();
      updateCurrentCell(getNextCellDown(xWord, currentCell));
    },
    [updateCurrentCell, currentCell, xWord]
  );
  useHotkeys(
    'Left',
    (e: KeyboardEvent) => {
      e.preventDefault();
      updateCurrentCell(getNextCellLeft(xWord, currentCell));
    },
    [updateCurrentCell, currentCell, xWord]
  );
  useHotkeys(
    'Right',
    (e: KeyboardEvent) => {
      e.preventDefault();
      updateCurrentCell(getNextCellRight(xWord, currentCell));
    },
    [updateCurrentCell, currentCell, xWord]
  );

  return {
    currentEntry,
    currentCell,
    handleSelectEntry,
    handleSelectCell: updateCurrentCell,
  };
};

export default useCurrentEntry;

const getNextCellUp = (xWord: XWord, currentCell: Cell): Cell => {
  for (let row = currentCell.row - 1; row >= 0; row--) {
    if (xWord.grid[row][currentCell.col].char !== '#') {
      return {
        row,
        col: currentCell.col,
      };
    }
  }

  return currentCell;
};

const getNextCellDown = (xWord: XWord, currentCell: Cell): Cell => {
  for (let row = currentCell.row + 1; row < xWord.height; row++) {
    if (xWord.grid[row][currentCell.col].char !== '#') {
      return {
        row,
        col: currentCell.col,
      };
    }
  }

  return currentCell;
};

const getNextCellLeft = (xWord: XWord, currentCell: Cell): Cell => {
  for (let col = currentCell.col - 1; col >= 0; col--) {
    if (xWord.grid[currentCell.row][col].char !== '#') {
      return {
        row: currentCell.row,
        col,
      };
    }
  }

  return currentCell;
};

const getNextCellRight = (xWord: XWord, currentCell: Cell): Cell => {
  for (let col = currentCell.col + 1; col < xWord.width; col++) {
    if (xWord.grid[currentCell.row][col].char !== '#') {
      return {
        row: currentCell.row,
        col,
      };
    }
  }

  return currentCell;
};

// useEffect(() => {
//   // if (!entryContainsCell(currentEntry, currentCell)) {
//   setCurrentCell(getFirstEmptyCell(xWord, currentEntry));
//   // }
// }, [xWord, currentEntry]);

// useEffect(() => {
//   if (game.gameState !== GameState.complete && currentEntry.isComplete) {
//     setCurrentEntryIndex(computeNextEntryIndex(currentEntryIndex, xWord));
//   }
//   // else if (!entryContainsCell(currentEntry, currentCell)) {
//   //   setCurrentCell(getFirstEmptyCell(xWord, currentEntry));
//   // }
// }, [xWord, currentEntry, currentEntryIndex, game.gameState]);
