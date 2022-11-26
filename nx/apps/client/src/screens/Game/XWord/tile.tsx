import { Draggable } from '@hello-pangea/dnd';
import { Tile as TileType } from '@nx/api-interfaces';

interface Props {
  tile: TileType;
  index: number;
  isDragDisabled: boolean;
  isHighlighted: boolean;
}

const Tile = ({ tile, index, isDragDisabled, isHighlighted }: Props) => {
  return (
    <Draggable
      draggableId={tile.id}
      index={index}
      isDragDisabled={isDragDisabled}
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          // className="bg-orange-200 hover:bg-orange-300 active:shadow-lg active:bg-orange-300 w-12 h-12 flex justify-center items-center pt-2 font-bold text-lg"
          className={`${
            isHighlighted
              ? 'bg-blue-400 hover:bg-blue-500  active:bg-blue-500'
              : 'bg-purple-400 hover:bg-purple-500  active:bg-purple-500'
          } active:shadow-lg w-12 h-12 flex justify-center items-center pt-2 font-bold text-lg`}
        >
          {tile.char}
        </div>
      )}
    </Draggable>
  );
};

export default Tile;
