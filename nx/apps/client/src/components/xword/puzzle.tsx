import { useCallback } from 'react';
import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd';
import produce from 'immer';
import { Tile as TileType, XWord, XWordEntry } from '../../types';
import { TILE_BAR_ID } from './constants';
import { charToTile } from '../../utils';
import Grid from './grid';
import TileBar from './tile_bar';

interface Props {
  xword: XWord;
  setXword: (xword: XWord) => void;
  tileBar: Array<TileType>;
  setTileBar: (tileBar: Array<TileType>) => void;
  // currentCell: [number, number];
  currentEntry: XWordEntry;
}

const Puzzle = ({
  xword,
  setXword,
  tileBar,
  setTileBar,
  currentEntry,
}: // currentCell,
Props) => {
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
    // TODO: this should be a reducer
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
    [tileBar, xword, setTileBar, setXword]
  );

  return (
    <section className="flex items-center flex-col m-12">
      <DragDropContext
        onBeforeCapture={onBeforeCapture}
        onBeforeDragStart={onBeforeDragStart}
        onDragStart={onDragStart}
        onDragUpdate={onDragUpdate}
        onDragEnd={onDragEnd}
      >
        {/* TODO: these should be composed so no prop drilling*/}
        <Grid xword={xword} currentEntry={currentEntry} />
        <TileBar tiles={tileBar} />
      </DragDropContext>
    </section>
  );
};

export default Puzzle;
