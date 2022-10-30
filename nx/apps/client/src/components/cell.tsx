import { Droppable } from 'react-beautiful-dnd';
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
          className="bg-white flex justify-center items-center font-bold"
          {...provided.droppableProps}
        >
          {tile.char !== ' ' && <Tile tile={tile} />}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default Cell;
