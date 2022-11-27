import { useCallback } from 'react';
import {
  DragDropContext,
  OnDragEndResponder,
  OnDragUpdateResponder,
} from '@hello-pangea/dnd';
import produce from 'immer';
import { XWordEntry } from '@nx/api-interfaces';
import { TILE_BAR_ID } from './constants';

import Grid from './grid';
import TileBar from './tile_bar';
import { Game } from 'apps/client/src/contexts/socket';

interface Props {
  game: Game;
  // currentCell: [number, number];
  currentEntry: XWordEntry;
  updatePuzzle: (game: Game) => void;
}

const Puzzle = ({
  game,
  currentEntry,
  updatePuzzle,
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
  const onDragUpdate: OnDragUpdateResponder = useCallback((update) => {
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

      const { tileBar, xWord } = game;

      // tile bar to tile bar
      if (
        destination.droppableId === source.droppableId &&
        destination.droppableId === TILE_BAR_ID
      ) {
        const newTileBar = [...tileBar];

        newTileBar.splice(si, 1);
        newTileBar.splice(di, 0, tileBar[si]);

        updatePuzzle({
          ...game,
          xWord,
          tileBar: newTileBar,
        });
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

        const [_, row, col] = destination.droppableId.split('-').map(Number);
        const newXword = produce(xWord, (draft) => {
          draft.grid[row][col] = tileBar[si];
        });

        updatePuzzle({
          ...game,
          xWord: newXword,
          tileBar: newTileBar,
        });

        return;
      }

      // TODO: this code will be useful in a different game mode

      // cell to cell
      // if (
      //   source.droppableId !== TILE_BAR_ID &&
      //   destination.droppableId !== TILE_BAR_ID
      // ) {
      //   const [_d, dRow, dCol] = destination.droppableId.split('-').map(Number);
      //   const [_s, sRow, sCol] = source.droppableId.split('-').map(Number);

      //   setXWord(
      //     produce(xWord, (draft) => {
      //       [draft.grid[dRow][dCol], draft.grid[sRow][sCol]] = [
      //         draft.grid[sRow][sCol],
      //         draft.grid[dRow][dCol],
      //       ];
      //     })
      //   );

      //   return;
      // }

      // // cell to tile bar
      // if (
      //   source.droppableId !== TILE_BAR_ID &&
      //   destination.droppableId === TILE_BAR_ID
      // ) {
      //   const [_, row, col] = source.droppableId.split('-').map(Number);

      //   const newTileBar = [...tileBar];
      //   newTileBar.splice(di, 0, xWord.grid[row][col]);
      //   setTileBar(newTileBar);

      //   setXWord(
      //     produce(xWord, (draft) => {
      //       draft.grid[row][col] = charToTile(' ');
      //     })
      //   );

      //   return;
      // }
    },
    [game, updatePuzzle]
  );

  return (
    <section className="flex items-center flex-col mx-12 select-none">
      <DragDropContext
        onBeforeCapture={onBeforeCapture}
        onBeforeDragStart={onBeforeDragStart}
        onDragStart={onDragStart}
        onDragUpdate={onDragUpdate}
        onDragEnd={onDragEnd}
      >
        {/* TODO: these should be composed so no prop drilling*/}
        <Grid xWord={game.xWord} currentEntry={currentEntry} />
        <TileBar tiles={game.tileBar} />
      </DragDropContext>
    </section>
  );
};

export default Puzzle;
