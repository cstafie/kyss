import { Droppable } from '@hello-pangea/dnd';
import { Tile as TileType } from '@nx/api-interfaces';
import Tile from './tile';

interface Props {
  id: string;
  tile: TileType;
  number: number;
  isHighlighted: boolean;
  isCurrentCell: boolean;
  showHover: boolean;
  onClick: (e: any) => void;
}

const Cell = ({
  id,
  tile,
  number,
  isHighlighted,
  isCurrentCell,
  showHover,
  onClick,
}: Props) => {
  const isEmpty = tile.char === ' ';

  return (
    <Droppable droppableId={id} isDropDisabled={!isEmpty}>
      {(provided, { isDraggingOver }) => (
        <div
          ref={provided.innerRef}
          className={`${isHighlighted ? 'bg-blue-300' : 'bg-white'} ${
            isCurrentCell ? 'bg-yellow-300' : ''
          } ${showHover ? 'hover:bg-purple-300' : ''} ${
            isDraggingOver ? 'bg-purple-300' : ''
          } relative`}
          {...provided.droppableProps}
          onClick={onClick}
        >
          <div className="absolute text-xs pl-1 text-black">{number}</div>
          {/* only one tile per cell allowed so it will always be index 0 */}
          {!isEmpty && (
            <Tile
              tile={tile}
              index={0}
              isDragDisabled={true}
              isHighlighted={isHighlighted}
              isCurrentCell={isCurrentCell}
              // className={'relative top-0 left-0'}
            />
          )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default Cell;
