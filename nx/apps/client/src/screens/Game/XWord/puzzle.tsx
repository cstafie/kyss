import { DragDropContext } from '@hello-pangea/dnd';
import { Cell, XWordEntry } from '@nx/api-interfaces';

import Grid from './grid';
import TileBar from './tile_bar';
import { GameInfo } from 'apps/client/src/contexts/socket';
import useDragAndDrop from './hooks/use_drag_and_drop';
import { useCallback } from 'react';
import useTapToPlay from './hooks/use_tap_to_play';

interface Props {
  game: GameInfo;
  currentEntry: XWordEntry;
  currentCell: Cell;
  handleSelectCell: (cell: Cell) => void;
  incorrectPosStrings: Set<string>;
}

const Puzzle = ({
  game,
  currentEntry,
  currentCell,
  handleSelectCell,
  incorrectPosStrings,
}: Props) => {
  const {
    onBeforeCapture,
    onBeforeDragStart,
    onDragStart,
    onDragUpdate,
    onDragEnd,
  } = useDragAndDrop(game);

  const {
    // TODO: find a nicer way to solve this
    handleSelectCell: handleSelectCell2,
    selectedTileId,
    setSelectedTileId,
  } = useTapToPlay();

  const combinedHandleSelectCell = useCallback(
    (cell: Cell) => {
      handleSelectCell(cell);
      handleSelectCell2([cell.row, cell.col]);
    },
    [handleSelectCell, handleSelectCell2]
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
        <Grid
          xWord={game.xWord}
          currentEntry={currentEntry}
          gameState={game.gameState}
          currentCell={currentCell}
          handleSelectCell={combinedHandleSelectCell}
          showHover={selectedTileId !== ''}
          incorrectPosStrings={incorrectPosStrings}
        />
        <TileBar
          tiles={game.tileBar}
          selectedTileId={selectedTileId}
          setSelectedTileId={setSelectedTileId}
        />
      </DragDropContext>
    </section>
  );
};

export default Puzzle;
