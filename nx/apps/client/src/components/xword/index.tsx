import { useCallback, useState, useMemo } from 'react';
import produce from 'immer';
import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd';

import { charToTile } from '../../utils';
import { xword7x7 } from '../../mocks/xword_mock_data';

import { Direction, Tile as TyleType } from '../../types';
import Clues from './clues';
import Grid from './grid';
import TileBar from './tile_bar';
import { TILE_BAR_ID } from './constants';

// TODO: look into solving this using tailwind only

const XWord = () => {
  const [xword, setXword] = useState(xword7x7);
  const [tileBar, setTileBar] = useState<Array<TyleType>>(
    []
    // ['A', 'B', 'C', 'D', 'E'].map(charToTile)
  );

  // using useCallback is optional
  const onBeforeCapture = useCallback(() => {
    /*...*/
  }, []);
  const onBeforeDragStart = useCallback(() => {
    /*...*/
  }, []);
  const onDragStart = useCallback(() => {
    /*...*/
  }, []);
  const onDragUpdate = useCallback(() => {
    /*...*/
  }, []);
  const onDragEnd: OnDragEndResponder = useCallback(
    (dropResult) => {
      const { destination, source, draggableId } = dropResult;

      // user dropped outside of a droppable
      if (!destination) {
        return;
      }

      const di = destination.index;
      const si = source.index;

      // user dropped the item into the same place where it started
      if (destination.droppableId === source.droppableId && di === si) {
        return;
      }

      // tile bar to tile bar
      if (
        destination.droppableId === source.droppableId &&
        destination.droppableId === TILE_BAR_ID
      ) {
        const newTileBar = [...tileBar];

        newTileBar.splice(si, 1);
        newTileBar.splice(di, 0, tileBar[si]);

        setTileBar(newTileBar);
        return;
      }

      // tile bar to cell
      if (
        source.droppableId === TILE_BAR_ID &&
        destination.droppableId !== TILE_BAR_ID
      ) {
        const newTileBar = [...tileBar];

        // remove value from tile-bar
        newTileBar.splice(si, 1);
        setTileBar(newTileBar);

        const [_, row, col] = destination.droppableId.split('-').map(Number);

        setXword(
          produce(xword, (draft) => {
            draft.grid[row][col] = tileBar[si];
          })
        );
        return;
      }

      // cell to cell
      if (
        source.droppableId !== TILE_BAR_ID &&
        destination.droppableId !== TILE_BAR_ID
      ) {
        const [_d, dRow, dCol] = destination.droppableId.split('-').map(Number);
        const [_s, sRow, sCol] = source.droppableId.split('-').map(Number);

        setXword(
          produce(xword, (draft) => {
            [draft.grid[dRow][dCol], draft.grid[sRow][sCol]] = [
              draft.grid[sRow][sCol],
              draft.grid[dRow][dCol],
            ];
          })
        );

        return;
      }

      // cell to tile bar
      if (
        source.droppableId !== TILE_BAR_ID &&
        destination.droppableId === TILE_BAR_ID
      ) {
        const [_, row, col] = source.droppableId.split('-').map(Number);

        const newTileBar = [...tileBar];
        newTileBar.splice(di, 0, xword.grid[row][col]);
        setTileBar(newTileBar);

        setXword(
          produce(xword, (draft) => {
            draft.grid[row][col] = charToTile(' ');
          })
        );

        return;
      }
    },
    [tileBar, xword]
  );

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
      <section className="flex items-center flex-col m-12">
        <DragDropContext
          onBeforeCapture={onBeforeCapture}
          onBeforeDragStart={onBeforeDragStart}
          onDragStart={onDragStart}
          onDragUpdate={onDragUpdate}
          onDragEnd={onDragEnd}
        >
          <Grid xword={xword} />
          <TileBar tiles={tileBar} />
        </DragDropContext>
      </section>

      <section>
        <h2 className="font-bold text-lg">ACROSS</h2>
        <Clues entries={acrossEntries} />
      </section>

      <section>
        <h2 className="font-bold text-lg">DOWN</h2>
        <Clues entries={downEntries} />
      </section>
    </section>
  );
};

export default XWord;
