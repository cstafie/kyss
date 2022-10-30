import { Draggable } from '@hello-pangea/dnd';
import { Tile as TileType } from '../types';

interface Props {
  tile: TileType;
  index: number;
}

const Tile = ({ tile, index }: Props) => {
  return (
    <Draggable draggableId={tile.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-orange-300 hover:bg-orange-200 ac w-12 h-12 flex justify-center items-center font-bold"
        >
          {tile.char}
        </div>
      )}
    </Draggable>
  );
};

export default Tile;
