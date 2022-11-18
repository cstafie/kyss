import { useState, useMemo } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { Direction } from '@nx/api-interfaces';
import Clues from './clues';
import Puzzle from './puzzle';
import { Game } from 'apps/client/src/contexts/socket';
import Players from './players';

interface Props {
  game: Game;
  updateGame: (game: Game) => void;
}

const XWord = ({ game, updateGame }: Props) => {
  const { xWord } = game;

  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);

  const currentEntry = useMemo(
    () => xWord.entries[currentEntryIndex],
    [xWord.entries, currentEntryIndex]
  );

  // const [currentCell, setCurrentCell] = useState<[number, number]>([
  //   currentEntry.row,
  //   currentEntry.col,
  // ]);

  useHotkeys('shift+tab', (e) => {
    e.preventDefault();
    setCurrentEntryIndex(
      (prev) => (prev - 1 + xWord.entries.length) % xWord.entries.length
    );
  });
  useHotkeys('tab', (e) => {
    e.preventDefault();
    setCurrentEntryIndex((prev) => (prev + 1) % xWord.entries.length);
  });

  useHotkeys('space', (e) => {
    e.preventDefault();
    setCurrentEntryIndex((prev) => {
      const targetNumber = xWord.entries[prev].number;

      for (let i = 0; i < xWord.entries.length; i++) {
        if (i === prev) {
          continue;
        }

        if (targetNumber === xWord.entries[i].number) {
          return i;
        }
      }

      // should technically never reach here
      return 0;
    });
  });

  const acrossEntries = useMemo(
    () => xWord.entries.filter((entry) => entry.direction === Direction.ACROSS),
    [xWord.entries]
  );

  const downEntries = useMemo(
    () => xWord.entries.filter((entry) => entry.direction === Direction.DOWN),
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
        // currentCell={current}
      />
      <section className="m-2">
        <h2 className="font-bold text-lg">ACROSS</h2>
        <Clues entries={acrossEntries} currentEntry={currentEntry} />
      </section>
      <section className="m-2">
        <h2 className="font-bold text-lg">DOWN</h2>
        <Clues entries={downEntries} currentEntry={currentEntry} />
      </section>
    </section>
  );
};

export default XWord;
