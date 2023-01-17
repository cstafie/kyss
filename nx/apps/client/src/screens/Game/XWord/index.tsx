import { useMemo } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { Direction, GameState } from '@nx/api-interfaces';
import Clues from './clues';
import Puzzle from './puzzle';
import { GameInfo, useSocketContext } from 'apps/client/src/contexts/socket';
import Players from './players';
import { filterEntriesByDirection } from 'apps/client/src/utils';
import useCurrentEntry from './hooks/use_current_entry';
import Clue from './clue';

interface Props {
  game: GameInfo;
}

const ALPHABET = Array(26)
  .fill(0)
  .map((_, i) => String.fromCharCode('a'.charCodeAt(0) + i))
  .join(',');

const XWord = ({ game }: Props) => {
  const { xWord } = game;
  const { playTile, createGame } = useSocketContext();

  const { currentCell, currentEntry, handleSelectEntry, handleSelectCell } =
    useCurrentEntry(xWord);

  const acrossEntries = useMemo(
    () => filterEntriesByDirection(xWord.entries, Direction.ACROSS),
    [xWord.entries]
  );

  const downEntries = useMemo(
    () => filterEntriesByDirection(xWord.entries, Direction.DOWN),
    [xWord.entries]
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

      const { row, col } = currentCell;

      if (game.xWord.grid[row][col].char !== ' ') {
        return;
      }

      playTile(game.tileBar[letterIndex].id, [row, col]);
    },
    [game, currentCell]
  );

  const isGameOver = game.gameState === GameState.complete;

  const cluesClass = 'm-2 hidden sm:block';

  return (
    <>
      {isGameOver && (
        <section className="flex justify-center">
          <button onClick={createGame} className="btn btn-blue">
            START A NEW GAME!
          </button>
        </section>
      )}
      <section className="flex flex-col sm:flex-row justify-start sm:justify-center items-center sm:items-start sm:mt-12 gap-4">
        <section className="m-2">
          <h2 className="font-bold text-lg">PLAYERS</h2>
          <Players
            players={Array.from(game.players.values())}
            isGameOver={isGameOver}
          />
        </section>

        {/* small screen clue */}
        <section className="block sm:hidden w-full">
          <Clue
            isHighlighted={false}
            entry={currentEntry}
            handleSelect={() => null}
          />
        </section>

        <Puzzle
          game={game}
          currentEntry={currentEntry}
          currentCell={currentCell}
          handleSelectCell={handleSelectCell}
        />

        {/* large screen clues */}
        <section className={cluesClass}>
          <h2 className="font-bold text-lg">ACROSS</h2>
          <Clues
            entries={acrossEntries}
            currentEntry={currentEntry}
            handleSelect={handleSelectEntry}
          />
        </section>
        <section className={cluesClass}>
          <h2 className="font-bold text-lg">DOWN</h2>
          <Clues
            entries={downEntries}
            currentEntry={currentEntry}
            handleSelect={handleSelectEntry}
          />
        </section>
      </section>
    </>
  );
};

export default XWord;
