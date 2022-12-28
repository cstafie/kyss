import { useMemo } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import produce from 'immer';

import { Direction } from '@nx/api-interfaces';
import Clues from './clues';
import Puzzle from './puzzle';
import { Game, useSocketContext } from 'apps/client/src/contexts/socket';
import Players from './players';
import { filterEntriesByDirection } from 'apps/client/src/utils';
import useCurrentEntry from './useCurrenEntry';
import Clue from './clue';

interface Props {
  game: Game;
}

const ALPHABET = Array(26)
  .fill(0)
  .map((_, i) => String.fromCharCode('a'.charCodeAt(0) + i))
  .join(',');

const XWord = ({ game }: Props) => {
  const { xWord } = game;
  const { playTile } = useSocketContext();

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

      playTile(game.tileBar[letterIndex], [row, col]);

      // // TODO: this code is duplicated from drag and drop (want DRY)
      // const newTileBar = [...game.tileBar];

      // // remove value from tile-bar
      // newTileBar.splice(letterIndex, 1);

      // const newXword = produce(xWord, (draft) => {
      //   draft.grid[row][col] = game.tileBar[letterIndex];
      // });

      // updateGame({
      //   ...game,
      //   xWord: newXword,
      //   tileBar: newTileBar,
      // });
    },
    [game, currentCell]
  );

  const cluesClass = 'm-2 hidden sm:block';

  return (
    <section className="flex flex-col sm:flex-row justify-start sm:justify-center items-center sm:items-start sm:mt-12 h-full gap-4">
      <section className="m-2">
        <h2 className="font-bold text-lg">PLAYERS</h2>
        <Players players={Array.from(game.players.values())} />
      </section>

      {/* small screen clue */}
      <section className="block sm:hidden">
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
  );
};

export default XWord;
