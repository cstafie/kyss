import { Draggable } from 'react-beautiful-dnd';
import { Tile as TileType } from '../types';

interface Props {
  tile: TileType;
}

const Tile = ({ tile }: Props) => {
  return (
    <Draggable draggableId={tile.id} index={0}>
      {(provided) => <div {...provided.draggableProps}>{tile.char}</div>}
    </Draggable>
  );
};

export default Tile;
