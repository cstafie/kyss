import { Droppable } from '@hello-pangea/dnd';
import { Tile as TileType } from '../../types';
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
          <div className="fixed">{number}</div>
          {/* only one tile per cell allowed so it will always be index 0 */}
          {!isEmpty && <Tile tile={tile} index={0} />}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default Cell;
