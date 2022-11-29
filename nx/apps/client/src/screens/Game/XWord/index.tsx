import { useState, useMemo, useCallback, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { Direction, GameState, Tile, XWordEntry } from '@nx/api-interfaces';
import Clues from './clues';
import Puzzle from './puzzle';
import { Game } from 'apps/client/src/contexts/socket';
import Players from './players';
import {
  computeNextEntryIndex,
  computePreviousEntryIndex,
  entryContainsCell,
  filterEntriesByDirection,
  getCrossingEntryIndex,
  getFirstEmptyCell,
} from 'apps/client/src/utils';
import produce from 'immer';
import Grid from './grid';

interface Props {
  game: Game;
  updateGame: (game: Game) => void;
  updateTileBar: (tileBar: Array<Tile>) => void;
}

const ALPHABET = Array(26)
  .fill(0)
  .map((_, i) => String.fromCharCode('a'.charCodeAt(0) + i))
  .join(',');

const XWord = ({ game, updateGame, updateTileBar }: Props) => {
  const { xWord } = game;

  const [currentEntryIndex, setCurrentEntryIndex] = useState(
    xWord.entries[0].isComplete ? computeNextEntryIndex(0, xWord) : 0
  );

  const currentEntry = useMemo(
    () => xWord.entries[currentEntryIndex],
    [xWord.entries, currentEntryIndex]
  );

  const [currentCell, setCurrentCell] = useState<[number, number]>(
    getFirstEmptyCell(xWord, currentEntry)
  );

  const updateCurrentEntryIndex = useCallback(
    (newEntryIndex: number) => {
      setCurrentEntryIndex(newEntryIndex);
      setCurrentCell(getFirstEmptyCell(xWord, xWord.entries[newEntryIndex]));
    },
    [xWord]
  );

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

  const acrossEntries = useMemo(
    () => filterEntriesByDirection(xWord.entries, Direction.ACROSS),
    [xWord.entries]
  );

  const downEntries = useMemo(
    () => filterEntriesByDirection(xWord.entries, Direction.DOWN),
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
    ALPHABET,
    (e: KeyboardEvent) => {
      e.preventDefault();
      const letter = e.key;
      const letterIndex = game.tileBar.findIndex(
        (tile) => tile.char.toUpperCase() === letter.toUpperCase()
      );

      if (letterIndex === -1) {
        return;
      }

      // TODO: this code is duplicated from drag and drop (want DRY)
      const newTileBar = [...game.tileBar];

      // remove value from tile-bar
      newTileBar.splice(letterIndex, 1);

      const [row, col] = currentCell;

      const newXword = produce(xWord, (draft) => {
        draft.grid[row][col] = game.tileBar[letterIndex];
      });

      updateGame({
        ...game,
        xWord: newXword,
        tileBar: newTileBar,
      });
    },
    [game, currentCell]
  );

  const updateCurrentCell = useCallback(
    (newCurrentCell: [number, number]) => {
      console.log('todo');

      setCurrentCell(newCurrentCell);
    },
    [currentCell, currentEntryIndex]
  );

  useHotkeys(
    'Up',
    (e: KeyboardEvent) => {
      e.preventDefault();

      const [row, col] = currentCell;
      const newRow = Math.max(0, row - 1);

      updateCurrentCell([newRow, col]);
    },
    [currentCell]
  );
  useHotkeys(
    'Down',
    (e: KeyboardEvent) => {
      e.preventDefault();

      const [row, col] = currentCell;
      const newRow = Math.min(xWord.height - 1, row + 1);

      updateCurrentCell([newRow, col]);
    },
    [currentCell]
  );
  useHotkeys(
    'Left',
    (e: KeyboardEvent) => {
      e.preventDefault();

      const [row, col] = currentCell;
      const newCol = Math.max(0, col - 1);

      updateCurrentCell([row, newCol]);
    },
    [currentCell]
  );
  useHotkeys(
    'Right',
    (e: KeyboardEvent) => {
      e.preventDefault();

      const [row, col] = currentCell;
      const newCol = Math.min(xWord.width - 1, col + 1);

      updateCurrentCell([row, newCol]);
    },
    [currentCell]
  );

  const setCurrentEntryIndexFromEntry = useCallback(
    (entry: XWordEntry) => {
      setCurrentEntryIndex(xWord.entries.indexOf(entry));
    },
    [xWord.entries]
  );

  return (
    <section className="flex flex-row justify-center mt-12">
      <section className="m-2">
        <h2 className="font-bold text-lg">PLAYERS</h2>
        <Players players={Array.from(game.players.values())} />
      </section>

      <Puzzle
        game={game}
        updatePuzzle={updateGame}
        currentEntry={currentEntry}
        updateTileBar={updateTileBar}
        currentCell={currentCell}
      />
      <section className="m-2">
        <h2 className="font-bold text-lg">ACROSS</h2>
        <Clues
          entries={acrossEntries}
          currentEntry={currentEntry}
          handleSelect={setCurrentEntryIndexFromEntry}
        />
      </section>
      <section className="m-2">
        <h2 className="font-bold text-lg">DOWN</h2>
        <Clues
          entries={downEntries}
          currentEntry={currentEntry}
          handleSelect={setCurrentEntryIndexFromEntry}
        />
      </section>
    </section>
  );
};

export default XWord;
