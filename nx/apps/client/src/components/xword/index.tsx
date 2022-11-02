import { useState, useMemo } from 'react';

import { empty7x7 } from '../../mocks/xword_mock_data';

import { Direction, Tile as TyleType } from '../../types';
import Clues from './clues';
import Puzzle from './puzzle';

// TODO: look into solving this using tailwind only

const XWord = () => {
  const [xword, setXword] = useState(empty7x7);
  const [tileBar, setTileBar] = useState<Array<TyleType>>(
    []
    // ['A', 'B', 'C', 'D', 'E'].map(charToTile)
  );
  const [selectedEntry, setSelectedEntry] = useState(xword.entries[0]);
  const [currentCell, setCurrentCell] = useState<[number, number]>([
    selectedEntry.row,
    selectedEntry.col,
  ]);

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
        currentCell={currentCell}
      />
      <section className="m-2">
        <h2 className="font-bold text-lg">ACROSS</h2>
        <Clues entries={acrossEntries} />
      </section>
      <section className="m-2">
        <h2 className="font-bold text-lg">DOWN</h2>
        <Clues entries={downEntries} />
      </section>
    </section>
  );
};

export default XWord;
