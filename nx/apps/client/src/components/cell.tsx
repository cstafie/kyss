import { Droppable } from '@hello-pangea/dnd';
import { Tile as TileType } from '../types';
import Tile from './tile';

interface Props {
  id: string;
  tile: TileType;
}

const Cell = ({ id, tile }: Props) => {
  return (
    <Droppable droppableId={id} isDropDisabled={tile.char !== ' '}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          className="bg-white "
          {...provided.droppableProps}
        >
          {/* only one tile per cell allowed so it will always be index 0 */}
          {tile.char !== ' ' && <Tile tile={tile} index={0} />}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default Cell;
