import { Cell, getCol, XWord, XWordEntry } from '@nx/api-interfaces';
import {
  computeNextEntryIndex,
  computePreviousEntryIndex,
  getCrossingEntryIndex,
  getFirstEmptyCell,
} from 'apps/client/src/utils';
import { useCallback, useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

interface Result {
  currentEntry: XWordEntry;
  currentCell: Cell;
  handleSelectEntry: (entry: XWordEntry) => void;
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

  const updateCurrentCell = useCallback((newCurrentCell: Cell) => {
    console.log('todo');

    setCurrentCell(newCurrentCell);
  }, []);

  const handleSelectEntry = useCallback(
    (entry: XWordEntry) => {
      setCurrentEntryIndex(xWord.entries.indexOf(entry));
    },
    [xWord.entries]
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

      const crossingEntryIndex = getCrossingEntryIndex(
        currentEntry,
        currentCell,
        xWord.entries
      );

      crossingEntryIndex === -1
        ? setCurrentEntryIndex(0)
        : setCurrentEntryIndex(crossingEntryIndex);
    },
    [currentEntry, currentCell, xWord.entries]
  );

  useHotkeys(
    'Up',
    (e: KeyboardEvent) => {
      e.preventDefault();

      const { row, col } = currentCell;
      const newRow = Math.max(0, row - 1);

      updateCurrentCell({
        row: newRow,
        col,
      });
    },
    [currentCell]
  );
  useHotkeys(
    'Down',
    (e: KeyboardEvent) => {
      e.preventDefault();

      const { row, col } = currentCell;
      const newRow = Math.min(xWord.height - 1, row + 1);

      updateCurrentCell({
        row: newRow,
        col,
      });
    },
    [currentCell]
  );
  useHotkeys(
    'Left',
    (e: KeyboardEvent) => {
      e.preventDefault();

      const { row, col } = currentCell;
      const newCol = Math.max(0, col - 1);

      updateCurrentCell({
        row,
        col: newCol,
      });
    },
    [currentCell]
  );
  useHotkeys(
    'Right',
    (e: KeyboardEvent) => {
      e.preventDefault();

      const { row, col } = currentCell;
      const newCol = Math.min(xWord.width - 1, col + 1);

      updateCurrentCell({
        row,
        col: newCol,
      });
    },
    [currentCell]
  );

  return {
    currentEntry,
    currentCell,
    handleSelectEntry,
    // handleSelectCell,
  };
};

export default useCurrentEntry;

const getNextCellUp = (xWord: XWord, currentCell: [number, number]) => {
  const column = getCol(xWord, currentCell[1]);
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
