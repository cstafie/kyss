import { Droppable } from '@hello-pangea/dnd';
import { Tile as TileType } from '../types';
import Tile from './tile';

interface Props {
  id: string;
  tile: TileType;
}

const Cell = ({ id, tile }: Props) => {
  return (
    <Droppable droppableId={`cell-${id}`}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          className="bg-white flex justify-center items-center font-bold"
          {...provided.droppableProps}
        >
          {tile.char !== ' ' && <Tile tile={tile} index={0} />}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default Cell;
