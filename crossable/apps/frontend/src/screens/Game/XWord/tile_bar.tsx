import { Droppable } from "@hello-pangea/dnd";
import { TILE_BAR, type Tile as TileType } from "shared";
import { TILE_BAR_ID } from "./constants";
import Tile from "./tile";

interface Props {
  tiles: Array<TileType>;
  handleTapTile: (tileId: string) => void;
}

const WIDTH = TILE_BAR.NUMBER_OF_TILES * 48; // 48px per tile

const TileBar = ({ tiles, handleTapTile }: Props) => {
  return (
    <Droppable droppableId={TILE_BAR_ID} direction="horizontal">
      {(provided) => (
        <section
          ref={provided.innerRef}
          className={`m-6 flex border-2 border-black w-[${WIDTH}px] h-[52px]`}
          {...provided.droppableProps}
        >
          {tiles.map((tile, i) => (
            <Tile
              key={tile.id}
              tile={tile}
              index={i}
              isDragDisabled={false}
              isHighlighted={false}
              isCurrentCell={false}
              onClick={() => handleTapTile(tile.id)}
            />
          ))}
          {provided.placeholder}
        </section>
      )}
    </Droppable>
  );
};

export default TileBar;
