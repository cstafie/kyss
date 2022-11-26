import { Droppable } from '@hello-pangea/dnd';
import { Tile as TileType } from '@nx/api-interfaces';
import Tile from './tile';

interface Props {
  id: string;
  tile: TileType;
  number: number;
  isHighlighted: boolean;
}

const Cell = ({ id, tile, number, isHighlighted }: Props) => {
  const isEmpty = tile.char === ' ';

  return (
    <Droppable droppableId={id} isDropDisabled={!isEmpty}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          className={`${isHighlighted ? 'bg-blue-300' : 'bg-white'}`}
          {...provided.droppableProps}
        >
          <div className="absolute text-xs pl-1 text-black">{number}</div>
          {/* only one tile per cell allowed so it will always be index 0 */}
          {!isEmpty && (
            <Tile
              tile={tile}
              index={0}
              isDragDisabled={true}
              isHighlighted={isHighlighted}
            />
          )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default Cell;
