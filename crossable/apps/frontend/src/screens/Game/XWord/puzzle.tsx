import { DragDropContext } from "@hello-pangea/dnd";
import type { Cell, XWordEntry } from "shared";

import Grid from "./grid";
import TileBar from "./tile_bar";
import type { GameInfo } from "@/contexts/game";
import useDragAndDrop from "./hooks/use_drag_and_drop";
import useTapToPlay from "./hooks/use_tap_to_play";

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

  const handleTapTile = useTapToPlay(currentCell);

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
          showHover={false}
          incorrectPosStrings={incorrectPosStrings}
        />
        <TileBar tiles={game.tileBar} handleTapTile={handleTapTile} />
      </DragDropContext>
    </section>
  );
};

export default Puzzle;
