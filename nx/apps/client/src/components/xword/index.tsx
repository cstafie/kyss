import { useState, useMemo } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import {
  Direction,
  Tile as TyleType,
  XWord,
  charToTile,
} from '@nx/api-interfaces';
import Clues from './clues';
import Puzzle from './puzzle';

const XWord = () => {
  const [xword, setXword] = useState<XWord>(empty7x7);
  const [tileBar, setTileBar] = useState<Array<TyleType>>(
    ['A', 'B', 'C', 'D', 'E'].map(charToTile)
  );
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);

  const currentEntry = useMemo(
    () => xword.entries[currentEntryIndex],
    [xword.entries, currentEntryIndex]
  );

  // const [currentCell, setCurrentCell] = useState<[number, number]>([
  //   currentEntry.row,
  //   currentEntry.col,
  // ]);

  useHotkeys('shift+tab', (e) => {
    e.preventDefault();
    setCurrentEntryIndex(
      (prev) => (prev - 1 + xword.entries.length) % xword.entries.length
    );
  });
  useHotkeys('tab', (e) => {
    e.preventDefault();
    setCurrentEntryIndex((prev) => (prev + 1) % xword.entries.length);
  });

  useHotkeys('space', (e) => {
    e.preventDefault();
    setCurrentEntryIndex((prev) => {
      const targetNumber = xword.entries[prev].number;

      for (let i = 0; i < xword.entries.length; i++) {
        if (i === prev) {
          continue;
        }

        if (targetNumber === xword.entries[i].number) {
          return i;
        }
      }

      // should technically never reach here
      return 0;
    });
  });

  const acrossEntries = useMemo(
    () => xword.entries.filter((entry) => entry.direction === Direction.ACROSS),
    [xword.entries]
  );

  const downEntries = useMemo(
    () => xword.entries.filter((entry) => entry.direction === Direction.DOWN),
    [xword.entries]
  );

  return (
    <section className="flex flex-row justify-center items-center">
      <Puzzle
        xword={xword}
        setXword={setXword}
        tileBar={tileBar}
        setTileBar={setTileBar}
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
