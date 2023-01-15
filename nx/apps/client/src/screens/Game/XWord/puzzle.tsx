import { DragDropContext } from '@hello-pangea/dnd';
import { Cell, XWordEntry } from '@nx/api-interfaces';

import Grid from './grid';
import TileBar from './tile_bar';
import { GameInfo } from 'apps/client/src/contexts/socket';
import useDragAndDrop from './hooks/use_drag_and_drop';

interface Props {
  game: GameInfo;
  currentEntry: XWordEntry;
  currentCell: Cell;
  handleSelectCell: (cell: Cell) => void;
}

const Puzzle = ({
  game,
  currentEntry,
  currentCell,
  handleSelectCell,
}: Props) => {
  const {
    onBeforeCapture,
    onBeforeDragStart,
    onDragStart,
    onDragUpdate,
    onDragEnd,
  } = useDragAndDrop(game);

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
          handleSelectCell={handleSelectCell}
        />
        <TileBar tiles={game.tileBar} />
      </DragDropContext>
    </section>
  );
};

export default Puzzle;
