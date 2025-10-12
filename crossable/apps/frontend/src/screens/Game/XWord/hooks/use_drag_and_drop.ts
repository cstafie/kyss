import { useCallback } from "react";

import { GameInfo, useSocketContext } from "@/contexts/socket";
import { OnDragUpdateResponder } from "@hello-pangea/dnd";
import { TILE_BAR_ID } from "../constants";
import { posStringToRowCol } from "@/utils";

function useDragAndDrop(game: GameInfo) {
  const { playTile, updateTileBar } = useSocketContext();

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
  const onDragEnd: OnDragUpdateResponder = useCallback(
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

      const { tileBar } = game;

      // tile bar to tile bar
      if (
        destination.droppableId === source.droppableId &&
        destination.droppableId === TILE_BAR_ID
      ) {
        const newTileBar = [...tileBar];

        newTileBar.splice(si, 1);
        newTileBar.splice(di, 0, tileBar[si]);

        updateTileBar(newTileBar);
        return;
      }

      // tile bar to cell
      if (
        source.droppableId === TILE_BAR_ID &&
        destination.droppableId !== TILE_BAR_ID
      ) {
        // const newTileBar = [...tileBar];

        // // remove value from tile-bar
        // newTileBar.splice(si, 1);

        const [row, col] = posStringToRowCol(destination.droppableId);

        playTile(tileBar[si].id, [row, col]);

        // const newXword = produce(xWord, (draft) => {
        //   draft.grid[row][col] = tileBar[si];
        // });

        // updatePuzzle({
        //   ...game,
        //   xWord: newXword,
        //   tileBar: newTileBar,
        // });

        return;
      }

      // TODO: this code will be useful in a different game mode

      // cell to cell
      // if (
      //   source.droppableId !== TILE_BAR_ID &&
      //   destination.droppableId !== TILE_BAR_ID
      // ) {
      //   const [dRow, dCol] = posStringToRowCol(destination.droppableId);
      //   const [sRow, sCol] = posStringToRowCol(source.droppableId);

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
      //   const [row, col] =  posStringToRowCol(source.droppableId);

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
    [game, playTile, updateTileBar]
  );

  return {
    onBeforeCapture,
    onBeforeDragStart,
    onDragStart,
    onDragUpdate,
    onDragEnd,
  };
}

export default useDragAndDrop;
